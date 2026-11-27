"""Inspect explicitly named routes on one candidate origin without following links."""
import argparse
import http.client
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from xml.etree import ElementTree

MAX_BYTES = 2 * 1024 * 1024
SITEMAP = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
SCHEMA = {"https://schema.org", "http://schema.org"}


def origin(value):
    if not isinstance(value, str):
        raise ValueError("Expected an absolute origin")
    parts = urlsplit(value)
    if (not parts.hostname or parts.username is not None or parts.password is not None
            or parts.path not in ("", "/") or parts.query or parts.fragment
            or any(ch.isspace() or ch == "\\" for ch in value)):
        raise ValueError("Origin must contain only scheme, hostname and optional port")
    if parts.scheme != "https" and not (
        parts.scheme == "http" and parts.hostname in {"127.0.0.1", "::1", "localhost"}
    ):
        raise ValueError("Use HTTPS or a loopback HTTP fixture")
    return parts.scheme + "://" + parts.netloc


def route(value):
    if (not isinstance(value, str) or not value.startswith("/") or value.startswith("//")
            or "\\" in value or "#" in value or any(ord(c) <= 32 for c in value)
            or any(part in {".", ".."} for part in urlsplit(value).path.split("/"))):
        raise ValueError("Expected an absolute route path on the configured origin")
    return value


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(base, path):
    request = Request(base + route(path), headers={"User-Agent": "Starlight-Route-Review/1"})
    try:
        reply = build_opener(NoRedirect).open(request, timeout=12)
    except HTTPError as error:
        # Redirect and access-control status are inspection evidence.
        reply = error
    with reply:
        body = reply.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES:
            raise ValueError("Response exceeds the 2 MiB inspection limit")
        return reply.status, reply.headers, body


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.head = False
        self.in_title = False
        self.script = None
        self.blocks = []
        self.canonicals = []
        self.robots = []
        self.descriptions = []
        self.title = ""

    def handle_starttag(self, tag, attrs):
        fields = {key.lower(): value or "" for key, value in attrs}
        if tag == "head":
            self.head = True
        if self.head and tag == "title":
            self.in_title = True
        if self.head and tag == "link" and "canonical" in fields.get("rel", "").lower().split():
            self.canonicals.append(fields.get("href", ""))
        if self.head and tag == "meta":
            name = fields.get("name", "").lower()
            if name == "description":
                self.descriptions.append(fields.get("content", ""))
            if name in {"robots", "googlebot", "bingbot"}:
                self.robots.append((name, fields.get("content", "")))
        if tag == "script" and fields.get("type", "").split(";")[0].strip().lower() == "application/ld+json":
            self.script = []

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.script is not None:
            self.script.append(data)

    def handle_endtag(self, tag):
        if tag == "head":
            self.head = False
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.script is not None:
            self.blocks.append("".join(self.script))
            self.script = None


def robots_directives(headers, page):
    rules = list(page.robots)
    for line in headers.get_all("X-Robots-Tag", []):
        bot = "robots"
        for token in line.split(","):
            token = token.strip()
            matched = re.fullmatch(r"([\w-]+):\s*(.*)", token)
            if matched:
                bot, token = matched.groups()
            rules.append((bot.lower(), token))
    return {bot for bot, tokens in rules
            if {"noindex", "none"}.intersection(re.split(r"[,\s]+", tokens.lower()))}


def schema_nodes(value, context=False):
    if isinstance(value, list):
        for item in value:
            yield from schema_nodes(item, context)
    if not isinstance(value, dict):
        return
    if "@context" in value:
        raw = value["@context"]
        vocab = raw.get("@vocab") if isinstance(raw, dict) else raw
        context = isinstance(vocab, str) and vocab.rstrip("/") in SCHEMA
    if context and "@type" in value:
        yield value
    if "@graph" in value:
        yield from schema_nodes(value["@graph"], context)


def check_page(status, headers, body, entry, public, mode):
    errors = []
    private = entry["visibility"] == "private"
    if private and status in {401, 403}:
        return [], "access-controlled"
    if status != 200 or headers.get_content_type() not in {"text/html", "application/xhtml+xml"}:
        return ["Expected an HTML 200 response"], "unverified"
    page = Page()
    page.feed(body.decode(headers.get_content_charset() or "utf-8"))
    page.close()
    excluded = robots_directives(headers, page)
    if mode == "preview" or private:
        if "robots" not in excluded:
            errors.append("Expected a universal noindex directive or an access-controlled private route")
    elif excluded:
        errors.append("Public route has a noindex directive for " + ", ".join(sorted(excluded)))
    if private:
        return errors, "private-noindex"

    expected = public + entry["canonical"]
    if page.canonicals != [expected]:
        errors.append("Expected one absolute canonical in head matching " + expected)
    if not page.title.strip() or len(page.descriptions) != 1 or not page.descriptions[0].strip():
        errors.append("Expected a title and one nonempty meta description")
    nodes = []
    for block in page.blocks:
        try:
            value = json.loads(block)
            if not isinstance(value, (list, dict)):
                raise ValueError("Expected JSON-LD object or array")
            nodes.extend(schema_nodes(value))
        except ValueError:
            errors.append("Malformed JSON-LD script")
    for kind, fields in entry["structured_data"].items():
        matches = []
        for node in nodes:
            types = node["@type"]
            if kind in (types if isinstance(types, list) else [types]):
                matches.append(node)
        if not any(all(node.get(field) not in (None, "", [], {}) for field in fields) for node in matches):
            errors.append(f"Missing schema.org {kind} with fields {', '.join(fields)}")
    return errors, "preview-noindex" if mode == "preview" else "public-indexing-signals", {
        "canonical_matches": page.canonicals == [expected], "title_present": bool(page.title.strip()),
        "description_count": len(page.descriptions), "jsonld_blocks": len(page.blocks),
        "required_schema_types": sorted(entry["structured_data"]), "noindex_agents": sorted(excluded)
    }


def inspect_map(body):
    if b"<!DOCTYPE" in body.upper() or b"<!ENTITY" in body.upper() or b"\x00" in body:
        raise ValueError("Sitemap must use plain XML without a DTD")
    root = ElementTree.fromstring(body)
    if root.tag not in {SITEMAP + "urlset", SITEMAP + "sitemapindex"}:
        raise ValueError("Expected a sitemap urlset or sitemapindex")
    idx = root.tag == SITEMAP + "sitemapindex"
    entries = root.findall(SITEMAP + ("sitemap" if idx else "url"))
    locations = []
    for entry in entries:
        loc = entry.findall(SITEMAP + "loc")
        if len(loc) != 1 or not loc[0].text:
            raise ValueError("Each sitemap entry requires one loc")
        locations.append(loc[0].text.strip())
    return idx, locations


def config(data, mode):
    public = origin(data["public_origin"])
    entries = data["routes"]
    maps = data["sitemaps"]
    redirects = data.get("redirects", [])
    if not isinstance(maps, list) or not isinstance(entries, list) or not entries or not isinstance(redirects, list):
        raise ValueError("Expected route, sitemap and redirect lists and at least one route")
    paths = []
    for entry in entries:
        paths.append(route(entry["path"]))
        if entry["visibility"] not in {"public", "private"}:
            raise ValueError("Select public or private visibility for each route")
        if entry["visibility"] == "public":
            route(entry["canonical"])
            types = entry["structured_data"]
            if not isinstance(types, dict) or any(not isinstance(k, str) or not k or not isinstance(v, list)
                    or not all(isinstance(f, str) and f for f in v) for k, v in types.items()):
                raise ValueError("Expected a map from schema.org type to required field names")
    if not maps and mode == "public" and any(e["visibility"] == "public" for e in entries):
        raise ValueError("Public indexability checks require a sitemap")
    for path in maps:
        paths.append(route(path))
    for redir in redirects:
        paths.append(route(redir["from"]))
        route(redir["to"])
        if redir["status"] not in {301, 302, 303, 307, 308}:
            raise ValueError("Select an explicit redirect status")
    if len(paths) > 200 or len(set(paths)) != len(paths):
        raise ValueError("Use up to 200 unique explicitly named request paths")
    return public, entries, maps, redirects


def audit(data, candidate, mode):
    candidate = origin(candidate)
    public, entries, maps, redirects = config(data, mode)
    rows = []

    def record(kind, path, inspect):
        try:
            status, headers, body = fetch(candidate, path)
            errors, observed, *details = inspect(status, headers, body)
            row = dict(kind=kind, path=path, http=status, observation=observed, errors=errors)
            if details:
                row["evidence"] = details[0]
            rows.append(row)
        except (ValueError, OSError, LookupError, http.client.HTTPException, ElementTree.ParseError) as exc:
            rows.append(dict(kind=kind, path=path, errors=[str(exc)]))

    maps_seen = {}
    for path in maps:
        def observe_map(status, headers, body):
            if status != 200:
                return ["Expected HTTP 200 for the declared sitemap"], "unavailable"
            idx, locs = inspect_map(body)
            maps_seen[path] = (idx, locs)
            return [], "sitemapindex" if idx else "urlset", {"locations": len(locs)}
        record("sitemap", path, observe_map)

    # The first declared sitemap is the entry point. Follow only the explicitly
    # fetched local projections of its public-origin children.
    reached, locations = set(), set()
    def visit(path):
        if path in reached or path not in maps_seen:
            return
        reached.add(path)
        idx, locs = maps_seen[path]
        if idx:
            for child in maps:
                if public + child in locs:
                    visit(child)
        else:
            locations.update(locs)
    if maps:
        visit(maps[0])
        for p in sorted(set(maps_seen) - reached):
            rows.append(dict(kind="sitemap", path=p, errors=["Declared shard is unreachable from the sitemap entry point"]))

    for entry in entries:
        def observe_page(status, headers, body):
            errors, observed, *details = check_page(status, headers, body, entry, public, mode)
            if maps:
                if entry["visibility"] == "public" and public + entry["canonical"] not in locations:
                    errors.append("Canonical is absent from the declared sitemap tree")
                if entry["visibility"] == "private" and public + entry["path"] in locations:
                    errors.append("Private route is listed in the public sitemap")
            return errors, observed, *details
        record("route", entry["path"], observe_page)
    for redir in redirects:
        def observe_redirect(status, headers, body):
            target = urljoin(candidate + redir["from"], headers.get("Location", ""))
            valid = {candidate + redir["to"], public + redir["to"]}
            if status != redir["status"] or len(headers.get_all("Location", [])) != 1 or target not in valid:
                return ["Redirect status or Location differs from the declared target"], "redirect"
            return [], "redirect"
        record("redirect", redir["from"], observe_redirect)
    return {"mode": mode, "candidate_origin": candidate, "public_origin": public,
            "failed": sum(bool(row["errors"]) for row in rows), "checks": rows}


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--manifest", required=True, type=Path)
    cli.add_argument("--origin", required=True)
    cli.add_argument("--mode", required=True, choices=["public", "preview"])
    args = cli.parse_args()
    try:
        report = audit(json.loads(args.manifest.read_bytes()), args.origin, args.mode)
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f"Invalid route audit inputs: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(report, indent=2))
    return 1 if report["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())

import copy
import importlib.util
import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

module = importlib.util.spec_from_file_location("route_seo", Path(__file__).parents[1] / "scripts/audit-route-seo.py")
seo = importlib.util.module_from_spec(module)
module.loader.exec_module(seo)
PUBLIC = "https://studio.example"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
HTML = f'''<!doctype html><html><head><title>Film edition</title>
<meta name="description" content="Inspect the source and sequence for this edition.">
<link rel="canonical" href="{PUBLIC}/edition">
<script type="application/ld+json">{{"@context":"https://schema.org","@graph":[{{"@type":"Article","headline":"Film edition"}}]}}</script>
</head><body>Film edition</body></html>'''
MANIFEST = {"public_origin": PUBLIC, "sitemaps": ["/sitemap.xml", "/pages.xml"],
            "routes": [{"path": "/edition", "visibility": "public", "canonical": "/edition",
                        "structured_data": {"Article": ["headline"]}}, {"path": "/desk", "visibility": "private"}],
            "redirects": [{"from": "/old", "to": "/edition", "status": 308}]}


class RouteAuditTest(unittest.TestCase):
    def setUp(self):
        self.pages = {
            "/sitemap.xml": (200, {}, f'<sitemapindex xmlns="{NS}"><sitemap><loc>{PUBLIC}/pages.xml</loc></sitemap></sitemapindex>'),
            "/pages.xml": (200, {}, f'<urlset xmlns="{NS}"><url><loc>{PUBLIC}/edition</loc></url></urlset>'),
            "/edition": (200, {"Content-Type": "text/html"}, HTML),
            "/desk": (403, {}, ""),
            "/old": (308, {"Location": "/edition"}, ""),
        }
        self.hits = []
        test = self
        class Fixture(BaseHTTPRequestHandler):
            def do_GET(self):
                test.hits.append(self.path)
                status, headers, body = test.pages.get(self.path, (404, {}, ""))
                self.send_response(status)
                for k, v in headers.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(body.encode())
            def log_message(self, *args):
                pass
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Fixture)
        thread = threading.Thread(target=lambda: self.server.serve_forever(poll_interval=.02), daemon=True)
        thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.origin = "http://127.0.0.1:" + str(self.server.server_port)

    def audit(self, mode="public", manifest=None):
        return seo.audit(manifest or MANIFEST, self.origin, mode)

    def test_indexable_candidate_with_sitemap_graph_canonical_and_redirect(self):
        self.assertEqual(self.audit()["failed"], 0)
        self.assertCountEqual(self.hits, list(self.pages))

    def test_unlisted_or_disconnected_index_shard(self):
        self.pages["/sitemap.xml"] = (200, {}, f'<sitemapindex xmlns="{NS}"><sitemap><loc>{PUBLIC}/unlisted.xml</loc></sitemap></sitemapindex>')
        report = self.audit()
        self.assertEqual(report["failed"], 2)
        self.assertNotIn("/unlisted.xml", self.hits)

    def test_bad_canonical_invalid_structured_data_and_unexpected_noindex(self):
        body = HTML.replace(PUBLIC + "/edition", PUBLIC + "/wrong").replace('"@graph":', '"@graph",')
        self.pages["/edition"] = (200, {"Content-Type":"text/html", "X-Robots-Tag":"googlebot: noindex"}, body)
        row = next(x for x in self.audit()["checks"] if x["path"] == "/edition")
        self.assertEqual(len(row["errors"]), 4)

    def test_skips_no_external_requests_when_redirect_disagrees(self):
        self.pages["/old"] = (301, {"Location": "https://third-party.invalid/collect"}, "")
        self.assertEqual(self.audit()["failed"], 1)
        self.assertCountEqual(self.hits, list(self.pages))

    def test_private_discovery_and_indexable_private_content_fail(self):
        self.pages["/desk"] = (200, {"Content-Type":"text/html"}, HTML)
        self.pages["/pages.xml"] = (200, {}, self.pages["/pages.xml"][2].replace("</urlset>",f"<url><loc>{PUBLIC}/desk</loc></url></urlset>"))
        row = next(x for x in self.audit()["checks"] if x["path"] == "/desk")
        self.assertEqual(len(row["errors"]), 2)

    def test_preview_requires_universal_noindex_and_can_omit_its_sitemap(self):
        manifest = copy.deepcopy(MANIFEST)
        manifest["sitemaps"] = []
        self.assertEqual(self.audit("preview", manifest)["failed"], 1)
        self.pages["/edition"] = (200, {"Content-Type":"text/html","X-Robots-Tag":"googlebot: noindex"}, HTML)
        self.assertEqual(self.audit("preview", manifest)["failed"], 1)
        self.pages["/edition"] = (200, {"Content-Type":"text/html","X-Robots-Tag":"noindex"}, HTML)
        self.assertEqual(self.audit("preview", manifest)["failed"], 0)
        with self.assertRaises(ValueError):
            self.audit("public", manifest)

    def test_jsonld_requires_the_declared_fields_and_a_schema_context(self):
        for text in [HTML.replace('"headline":"Film edition"', '"headline":""'), HTML.replace("https://schema.org","https://invalid.example")]:
            self.pages["/edition"] = (200, {"Content-Type":"text/html"}, text)
            self.assertEqual(self.audit()["failed"], 1)

    def test_no_request_for_external_or_unscoped_paths(self):
        for path in ["//other.invalid/route","/nested/../other","/sub#fragment"]:
            manifest = copy.deepcopy(MANIFEST)
            manifest["routes"][0]["path"] = path
            with self.assertRaises(ValueError):
                self.audit(manifest=manifest)
        self.assertFalse(self.hits)

    def test_sitemap_doctype_fails_closed(self):
        self.pages["/pages.xml"] = (200, {}, '<!DOCTYPE urlset SYSTEM "https://external.invalid/file"><urlset/>')
        self.assertGreater(self.audit()["failed"], 0)
        self.assertCountEqual(self.hits, list(self.pages))


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env node
/**
 * InfoGenius casting resolver (stub).
 *
 * Decides whether a character helps a visual, nominates a cast from the PROPOSED
 * routing defaults, and resolves identity evidence through the VIS character
 * resolver (`visual.character.resolve`, `bin/vis-character.mjs --name <name>`).
 *
 * CONTRACT SOURCE: the field names below are taken from draft PR 92 in
 * frankxai/visual-intelligence as relayed to this repo's maintainers. PR 92 was not
 * readable from this session. Re-check every name against the merged resolver.
 *
 * It never generates, invents, or fuzzy-matches a character. It never sets rights or
 * approval: both stay `unknown` (vendor guests: rights `pending`). With no transport
 * it reports `unavailable`. Tests use a local synthetic fixture (no private bytes).
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROUTING = JSON.parse(readFileSync(join(HERE, "routing-defaults.json"), "utf8"));
export const MCP_TOOL = "visual.character.resolve";
export const CLI_ENTRY = "bin/vis-character.mjs";
export const ENV_MANIFEST = "VIS_CHARACTER_MANIFEST";
export const ENV_CACHE = "VIS_CHARACTER_CACHE";
export const NOT_RESOLVED_EXIT_CODE = 3;
export const RESOLVED = "resolved";
export const CONFLICT_CODES = Object.freeze(["confusable_alias_not_merged", "status_conflicts_with_rejected_lineage"]);
export const UNDERSTANDING_GAINS = Object.freeze([
  "explains-role", "shows-relationship", "reduces-abstraction", "continuity-with-series"
]);

const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Exact-id classification. No aliasing: biro !== brio. */
export function classifyId(rawId) {
  const id = norm(rawId);
  if (ROUTING.rejected_references.some((r) => r.id === id)) return { id, kind: "rejected" };
  const guest = ROUTING.vendor_guests.find((g) => g.id === id);
  if (guest) return { id, kind: "vendor-guest", vendor: guest.vendor };
  return { id, kind: "standard" };
}

/** Propose a cast from topics. Proposal only; never approval. */
export function routeEditorial(topics = []) {
  const wanted = topics.map(norm);
  const hits = ROUTING.routes.filter((r) => r.topics.some((t) => wanted.includes(t)));
  return {
    status: "proposal",
    routes: hits.map((r) => r.route_id),
    nominated: [...new Set(hits.flatMap((r) => r.nominated))]
  };
}

/** One resolve call per name: the MCP arguments are `{ name }`. */
export function buildResolveRequest(name) {
  return { tool: MCP_TOOL, arguments: { name: norm(name) } };
}

/**
 * Validate one resolver result. Anything not `resolved` is allowed (it is simply not usable);
 * a `resolved` result must carry identity_id and matched_alias. Rights and approval may never
 * be asserted: only `unknown` (or `pending` for vendor guests' rights) is accepted.
 */
export function validateResult(res) {
  const errors = [];
  if (!res || typeof res !== "object") return ["result must be an object"];
  if (typeof res.status !== "string" || !res.status) errors.push("result.status is required");
  if (res.status === RESOLVED) {
    if (!res.identity_id) errors.push("resolved result needs identity_id");
    if (!res.matched_alias) errors.push("resolved result needs matched_alias");
  }
  const guest = res.class === "vendor-guest";
  if (guest) {
    if (res.unofficial !== true) errors.push("vendor-guest result must carry unofficial: true");
    if (res.rights !== "pending") errors.push("vendor-guest rights must be pending");
  } else if ((res.rights ?? "unknown") !== "unknown") errors.push(`rights must be unknown, got ${res.rights}`);
  if ((res.approval ?? "unknown") !== "unknown") errors.push(`approval must be unknown, got ${res.approval}`);
  for (const ref of res.positive_references ?? []) {
    if (!ref.edition) errors.push("positive reference needs edition");
    if (!/^[a-f0-9]{64}$/.test(ref.sha256 ?? "")) errors.push(`positive reference ${ref.edition ?? "?"} has no valid sha256`);
  }
  return errors;
}

/** Layout of the content-addressed cache: <cacheDir>/<aa>/<sha256>. */
export function cachePathFor(cacheDir, sha) { return join(cacheDir, sha.slice(0, 2), sha); }

/** Hash the real bytes at locators.local_cache_path. A hash is never trusted without bytes. */
export function verifyReferenceHashes(result, { cacheDir = process.env[ENV_CACHE] } = {}) {
  const refs = result.positive_references ?? [];
  const results = refs.map((ref) => {
    let p = ref.locators?.local_cache_path;
    if (p && !isAbsolute(p) && cacheDir) p = join(cacheDir, p);
    if (!p && cacheDir && ref.sha256) p = cachePathFor(cacheDir, ref.sha256);
    if (!p || !existsSync(p)) return { edition: ref.edition, verified: false, reason: "bytes-unavailable" };
    const ok = sha256(readFileSync(p)) === ref.sha256;
    return { edition: ref.edition, verified: ok, ...(ok ? {} : { reason: "hash-mismatch" }) };
  });
  return { all_verified: results.length > 0 && results.every((r) => r.verified), results };
}

function findEntry(fx, name) {
  const n = norm(name);
  return fx.entries.find((e) => norm(e.identity_id) === n || (e.aliases ?? []).map(norm).includes(n));
}

/**
 * Transport = (name) => result. Fixture transport serves a synthetic file and materialises
 * its ASCII bytes into a temp cache laid out as <aa>/<sha256>. It does not read manifests.
 */
export function createFixtureTransport(fixturePath, { cacheDir = null } = {}) {
  const dir = cacheDir ?? mkdtempSync(join(tmpdir(), "ig-vis-cache-"));
  return (name) => {
    const fx = JSON.parse(readFileSync(fixturePath, "utf8"));
    const e = findEntry(fx, name);
    if (!e) return { status: "not_found", rights: "unknown", approval: "unknown", positive_references: [], proposals: [], rejected_lineages: [], missing_references: [], conflicts: [], fixture: true };
    const { aliases, ...rest } = e;
    const positive_references = (e.positive_references ?? []).map((ref) => {
      const { fixture_bytes_base64, ...r } = ref;
      let local = null;
      if (fixture_bytes_base64) {
        local = cachePathFor(dir, ref.sha256);
        mkdirSync(dirname(local), { recursive: true });
        writeFileSync(local, Buffer.from(fixture_bytes_base64, "base64"));
      }
      return { ...r, locators: { ...r.locators, ...(local && { local_cache_path: local }) } };
    });
    return { ...rest, matched_alias: norm(name) === norm(e.identity_id) ? e.identity_id : norm(name), positive_references, fixture: true, fixture_revision: fx.fixture_revision };
  };
}

/**
 * Command transport for the real CLI: `node bin/vis-character.mjs --name <name>`.
 * Exit 0 = resolved; exit 3 = any non-resolved status (stdout is still the JSON result).
 * Any other exit code is an error, never a result.
 */
export function createCommandTransport({ entry = CLI_ENTRY, manifest = process.env[ENV_MANIFEST], cache = process.env[ENV_CACHE], node = process.execPath } = {}) {
  return (name) => {
    const env = { ...process.env, ...(manifest && { [ENV_MANIFEST]: manifest }), ...(cache && { [ENV_CACHE]: cache }) };
    const r = spawnSync(node, [entry, "--name", name], { encoding: "utf8", timeout: 30000, env });
    if (r.error) throw r.error;
    if (r.status !== 0 && r.status !== NOT_RESOLVED_EXIT_CODE) throw new Error(`vis-character exited ${r.status}: ${r.stderr}`);
    const out = JSON.parse(r.stdout);
    if (r.status === NOT_RESOLVED_EXIT_CODE && out.status === RESOLVED) throw new Error("exit code 3 with status resolved; contract violation");
    return out;
  };
}

const LABEL = ROUTING.vendor_guest_policy.label;

/**
 * resolveCasting({ brief, transport })
 * brief: { brand, topics[], visual_kind: "technical"|"editorial"|"story", requested_ids[], understanding_gain?, brand_scope? }
 */
export function resolveCasting({ brief, transport = null }) {
  const kind = brief.visual_kind ?? "technical";
  const topicTechnical = ROUTING.technical_topics.some((t) => (brief.topics ?? []).map(norm).includes(t));
  const technical = kind === "technical" || (kind !== "story" && topicTechnical);
  const gain = brief.understanding_gain ?? null;
  const base = { schema: "starlight.infogenius.casting-decision.v1", brief_kind: kind, proposals_only: true, blocked: [], cast: [], notes: [] };

  const requested = (brief.requested_ids?.length ? brief.requested_ids : routeEditorial(brief.topics).nominated).map(norm);
  const proposal = routeEditorial(brief.topics);

  // Rule: characters only when they improve understanding; never forced into technical diagrams.
  if (!gain || !UNDERSTANDING_GAINS.includes(gain)) {
    return { ...base, use_character: false, reason: "no stated understanding gain; characters are never decoration", routing: proposal };
  }
  if (technical && !brief.explicit_character_optin) {
    return { ...base, use_character: false, reason: "technical diagram default is no character; explicit opt-in with a named gain required", routing: proposal };
  }

  const eligible = [];
  for (const raw of requested) {
    const c = classifyId(raw);
    if (c.kind === "rejected") { base.blocked.push({ id: c.id, reason: "rejected reference; never used as a positive reference" }); continue; }
    if (c.kind === "vendor-guest") {
      base.notes.push(`${c.id}: ${LABEL}; vendor-owned; rights ${ROUTING.vendor_guest_policy.rights_state}; no logo, no partner claim`);
      if (ROUTING.vendor_guest_policy.cobrand_requires_permission.includes(c.vendor) && brief.cobrand) {
        base.blocked.push({ id: c.id, reason: `${c.vendor} co-branding requires permission and approval` }); continue;
      }
    }
    eligible.push(c);
  }
  if (!eligible.length) return { ...base, use_character: false, reason: "no eligible characters after policy checks", routing: proposal };
  if (!transport) return { ...base, use_character: false, status: "unavailable", reason: "no retrieval transport; identity not resolved; nothing generated", routing: proposal };

  let revision = null;
  for (const e of eligible) {
    const res = transport(buildResolveRequest(e.id).arguments.name);
    const errs = validateResult(res);
    if (errs.length) { base.blocked.push({ id: e.id, reason: `invalid resolver result: ${errs.join("; ")}` }); continue; }
    if (res.status !== RESOLVED) { base.blocked.push({ id: e.id, reason: `status ${res.status}; not resolved, no substitute generated`, status: res.status }); continue; }
    const codes = (res.conflicts ?? []).map((c) => (typeof c === "string" ? c : c.code));
    if (codes.length) { base.blocked.push({ id: e.id, reason: `conflicts: ${codes.join(", ")}; resolve with the identity owner`, conflicts: codes }); continue; }
    const isGuest = e.kind === "vendor-guest" || res.class === "vendor-guest";
    if (res.class === "vendor-guest" && e.kind !== "vendor-guest" && brief.cobrand) { base.blocked.push({ id: e.id, reason: "vendor guest co-branding requires permission and approval" }); continue; }
    const asserted = brief.lineage_required?.[e.id];
    if (asserted && (asserted !== res.identity_id || (res.rejected_lineages ?? []).some((l) => (l.id ?? l) === asserted))) { base.blocked.push({ id: e.id, reason: `identity mismatch (${res.identity_id} != ${asserted}) or lineage rejected; lineages are never substituted` }); continue; }
    const hashes = verifyReferenceHashes(res, { cacheDir: brief.cache_dir });
    const positives = res.positive_references ?? [];
    revision = revision ?? res.fixture_revision ?? null;
    base.cast.push({
      id: e.id, identity_id: res.identity_id, matched_alias: res.matched_alias,
      positive_reference_editions: positives.map((p) => p.edition),
      proposals: res.proposals ?? [], rejected_lineages: res.rejected_lineages ?? [], missing_references: res.missing_references ?? [],
      rights: isGuest ? "pending" : "unknown", approval: "unknown",
      label: isGuest ? LABEL : null,
      output_class: positives.length ? "resolved-approval-unknown" : "candidate-study",
      asset_hashes_verified: hashes.all_verified, fixture: Boolean(res.fixture)
    });
  }
  return {
    ...base, use_character: base.cast.length > 0, understanding_gain: gain, routing: proposal,
    receipt: { contract_source: "frankxai/visual-intelligence draft PR 92 (unverified; re-check on merge)", tool: MCP_TOOL, identity_ids: base.cast.map((c) => c.identity_id), asset_hashes_verified: base.cast.length > 0 && base.cast.every((c) => c.asset_hashes_verified), rights: "unknown", approval: "unknown", integration_status: "not_asserted", fixture: base.cast.some((c) => c.fixture), reference_revision: revision }
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [briefPath, fixturePath] = process.argv.slice(2);
  if (!briefPath) { console.error("Usage: casting-resolver.mjs <brief.json> [fixture.json]"); process.exit(2); }
  const brief = JSON.parse(readFileSync(briefPath, "utf8"));
  console.log(JSON.stringify(resolveCasting({ brief, transport: fixturePath ? createFixtureTransport(fixturePath) : null }), null, 2));
}

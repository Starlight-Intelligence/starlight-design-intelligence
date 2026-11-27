#!/usr/bin/env node
/**
 * InfoGenius casting resolver (stub).
 *
 * Decides whether a character helps a visual, nominates a cast from the PROPOSED
 * routing defaults, and resolves identity evidence through the VIS character
 * retrieval interface via a JSON contract (see ../schemas/character-retrieval.schema.json).
 *
 * It never generates, invents, or fuzzy-matches a character. With no transport it
 * reports `unavailable`. Tests use a local synthetic fixture (no private bytes).
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROUTING = JSON.parse(readFileSync(join(HERE, "routing-defaults.json"), "utf8"));
export const REQUEST_SCHEMA = "starlight.infogenius.character-retrieval-request.v1";
export const RESPONSE_SCHEMA = "starlight.infogenius.character-retrieval-response.v1";
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

export function buildRetrievalRequest({ requestId, characterIds, brand, purpose, verify = true }) {
  return { schema: REQUEST_SCHEMA, request_id: requestId, character_ids: characterIds.map(norm), verify, ...(brand && { brand }), ...(purpose && { purpose }) };
}

export function validateResponse(res, request) {
  const errors = [];
  if (!res || res.schema !== RESPONSE_SCHEMA) errors.push(`response.schema must be ${RESPONSE_SCHEMA}`);
  if (res && request && res.request_id !== request.request_id) errors.push("response.request_id does not match request");
  if (!res || !res.reference_revision) errors.push("response.reference_revision is required");
  if (!res || !Array.isArray(res.characters)) errors.push("response.characters must be an array");
  else for (const c of res.characters) {
    if (!c.id || !c.status || !c.lineage) errors.push(`character ${c.id ?? "?"} needs id, status, lineage`);
    for (const a of c.assets ?? []) if (!/^[a-f0-9]{64}$/.test(a.sha256 ?? "")) errors.push(`asset ${a.asset_id} has no valid sha256`);
  }
  return errors;
}

/** Compare actual bytes to the declared hash. Only bytes_base64 or a readable path count. */
export function verifyAssetHashes(character) {
  const results = (character.assets ?? []).map((a) => {
    let bytes = null;
    if (a.bytes_base64) bytes = Buffer.from(a.bytes_base64, "base64");
    else if (a.path && existsSync(a.path)) bytes = readFileSync(a.path);
    if (!bytes) return { asset_id: a.asset_id, verified: false, reason: "bytes-unavailable" };
    const ok = sha256(bytes) === a.sha256;
    return { asset_id: a.asset_id, verified: ok, ...(ok ? {} : { reason: "hash-mismatch" }) };
  });
  return { all_verified: results.length > 0 && results.every((r) => r.verified), results };
}

/** Transport: fixture file, JSON-over-stdio command, or none. */
export function createFixtureTransport(fixturePath) {
  return (request) => {
    const fx = JSON.parse(readFileSync(fixturePath, "utf8"));
    return { ...fx, request_id: request.request_id, characters: fx.characters.filter((c) => request.character_ids.includes(c.id)) };
  };
}
export function createCommandTransport(command, args = []) {
  return (request) => JSON.parse(execFileSync(command, args, { input: JSON.stringify(request), encoding: "utf8", timeout: 30000 }));
}

const LABEL = ROUTING.vendor_guest_policy.label;

/**
 * resolveCasting({ brief, transport, requestId })
 * brief: { brand, topics[], visual_kind: "technical"|"editorial"|"story", requested_ids[], understanding_gain?, brand_scope? }
 */
export function resolveCasting({ brief, transport = null, requestId = "req-0" }) {
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

  const request = buildRetrievalRequest({ requestId, characterIds: eligible.map((e) => e.id), brand: brief.brand, purpose: gain });
  const response = transport(request);
  const errs = validateResponse(response, request);
  if (errs.length) return { ...base, use_character: false, status: "invalid-response", errors: errs, routing: proposal };

  for (const e of eligible) {
    const rec = response.characters.find((c) => c.id === e.id);
    if (!rec || rec.status === "unavailable") { base.blocked.push({ id: e.id, reason: "not returned by retrieval; no substitute generated" }); continue; }
    if (rec.status === "rejected") { base.blocked.push({ id: e.id, reason: "retrieval reports rejected" }); continue; }
    const hashes = verifyAssetHashes(rec);
    const asserted = brief.lineage_required?.[e.id];
    if (asserted && asserted !== rec.lineage) { base.blocked.push({ id: e.id, reason: `lineage mismatch (${rec.lineage} != ${asserted}); lineages are never substituted` }); continue; }
    base.cast.push({
      id: e.id, status: rec.status, lineage: rec.lineage, rights_state: rec.rights_state ?? "unknown",
      label: e.kind === "vendor-guest" ? LABEL : null,
      output_class: rec.status === "approved-canon" ? "approved-canon-continuity" : "candidate-study",
      asset_hashes_verified: hashes.all_verified, fixture: Boolean(response.fixture)
    });
  }
  return {
    ...base, use_character: base.cast.length > 0, understanding_gain: gain, routing: proposal,
    receipt: { reference_revision: response.reference_revision, character_ids: base.cast.map((c) => c.id), asset_hashes_verified: base.cast.length > 0 && base.cast.every((c) => c.asset_hashes_verified), integration_status: "not_asserted", fixture: Boolean(response.fixture) }
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [briefPath, fixturePath] = process.argv.slice(2);
  if (!briefPath) { console.error("Usage: casting-resolver.mjs <brief.json> [fixture.json]"); process.exit(2); }
  const brief = JSON.parse(readFileSync(briefPath, "utf8"));
  console.log(JSON.stringify(resolveCasting({ brief, transport: fixturePath ? createFixtureTransport(fixturePath) : null }), null, 2));
}

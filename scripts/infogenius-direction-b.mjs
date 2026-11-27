#!/usr/bin/env node
/**
 * InfoGenius Direction B slot specs: validate, preview, and gate.
 *
 * A slot spec describes a character-led composition as layout regions plus character slots.
 * Each slot holds a resolver query in the VIS resolver contract (draft PR 92, unverified):
 * tool visual.character.resolve, CLI `bin/vis-character.mjs --name <name>`, statuses
 * resolved | ambiguous | not_found | unresolved, exit code 3 for any non-resolved status,
 * rights and approval always unknown. Nothing here draws, generates or invents a character.
 *
 *   node scripts/infogenius-direction-b.mjs                      write previews/ and decisions.json
 *   node scripts/infogenius-direction-b.mjs --check              validate; fail on drift or orphans
 *   node scripts/infogenius-direction-b.mjs --results <file>     print decisions for resolver results
 *                                                                ({ "<brief>": { "<slot id>": <resolver result> } }); writes nothing
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RESOLVED, MCP_TOOL, classifyId, resolveCasting, routeEditorial, validateResult } from "../skills/infogenius/casting/casting-resolver.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DIR_B = join(ROOT, "benchmarks", "infogenius", "direction-b");
export const SCHEMA = "starlight.infogenius.direction-b-slots.v1";
export const STATUSES = Object.freeze(["resolved", "ambiguous", "not_found", "unresolved"]);
export const SLOT_LABEL = "slot: needs resolver";
const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
const inside = (b, r) => b.x >= r.x && b.y >= r.y && b.x + b.w <= r.x + r.w && b.y + b.h <= r.y + r.h;
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const isBox = (b) => b && ["x", "y", "w", "h"].every((k) => Number.isFinite(b[k])) && b.w > 0 && b.h > 0;

/** Structural validation. Returns a list of error strings; empty means valid. */
export function validateSlotSpec(spec) {
  const e = [];
  if (!spec || typeof spec !== "object") return ["slot spec must be an object"];
  if (spec.schema !== SCHEMA) e.push(`schema must be ${SCHEMA}`);
  if (!Number.isInteger(spec.brief)) e.push("brief must be an integer");
  if (!spec.brand) e.push("brand is required");
  const cv = spec.canvas;
  if (!cv || !(cv.width > 0) || !(cv.height > 0)) e.push("canvas.width and canvas.height are required");
  const regions = new Map();
  for (const r of spec.regions ?? []) {
    if (!r.id || !r.role) e.push("every region needs id and role");
    else if (regions.has(r.id)) e.push(`duplicate region id ${r.id}`);
    else regions.set(r.id, r);
    if (!isBox(r)) e.push(`region ${r.id}: x, y, w, h must be finite and positive`);
    else if (cv && (r.x < 0 || r.y < 0 || r.x + r.w > cv.width || r.y + r.h > cv.height)) e.push(`region ${r.id} lies outside the canvas`);
  }
  if (!regions.size) e.push("at least one region is required");
  if (!Array.isArray(spec.slots) || !spec.slots.length) e.push("at least one slot is required");
  const seen = new Set();
  const placed = [];
  for (const s of spec.slots ?? []) {
    const tag = `slot ${s.id ?? "?"}`;
    if (!s.id) e.push("every slot needs an id");
    else if (seen.has(s.id)) e.push(`duplicate slot id ${s.id}`);
    seen.add(s.id);
    const region = regions.get(s.region);
    if (!region) e.push(`${tag}: unknown region ${s.region}`);
    if (!isBox(s.box)) e.push(`${tag}: box x, y, w, h must be finite and positive`);
    else {
      if (region && isBox(region) && !inside(s.box, region)) e.push(`${tag}: box is not inside region ${s.region}`);
      for (const o of placed) if (overlap(s.box, o.box)) e.push(`${tag}: overlaps ${o.id}`);
      placed.push(s);
    }
    for (const k of ["logo", "partner_claim", "image", "art", "svg", "src"]) if (k in s) e.push(`${tag}: key "${k}" is not allowed; slots hold queries, never art or logos`);
    const q = s.query;
    if (!q || typeof q !== "object") { e.push(`${tag}: query is required`); continue; }
    if (q.minimum_status !== RESOLVED) e.push(`${tag}: query.minimum_status must be "${RESOLVED}"`);
    if (!("preferred_edition" in q)) e.push(`${tag}: query.preferred_edition is required (a string, or null for no preference)`);
    if (typeof q.pose_expression_note !== "string" || !q.pose_expression_note) e.push(`${tag}: query.pose_expression_note is required`);
    if (s.nomination === "owner-required") {
      if (q.name !== null) e.push(`${tag}: an owner-required slot must have query.name null; no character is invented`);
    } else if (typeof q.name !== "string" || !q.name.trim()) e.push(`${tag}: query.name (a name or alias) is required`);
    else {
      const c = classifyId(q.name);
      if (c.kind === "rejected") e.push(`${tag}: ${c.id} is a rejected reference`);
      if (c.kind === "vendor-guest" && s.unofficial !== true) e.push(`${tag}: vendor guest ${c.id} must set unofficial: true (no logo, no partner claim)`);
    }
  }
  const c = spec.casting;
  if (!c || !c.visual_kind || !Array.isArray(c.topics)) e.push("casting.visual_kind and casting.topics are required");
  if (!spec.direction_a || !("spec" in spec.direction_a)) e.push("direction_a.spec is required (a path, or null when Direction A is not rendered)");
  return e;
}

const missingResult = { status: "unresolved", rights: "unknown", approval: "unknown", positive_references: [], conflicts: [], proposals: [], rejected_lineages: [], missing_references: [] };

/**
 * Direction B gate. B is allowed only when every slot resolved with at least one positive recovered
 * reference. Ambiguous, not_found, unresolved, a missing result, a resolved result without a positive
 * reference, a conflict, or a failed casting gate each block B and fall back to Direction A with a
 * recorded reason. `results` maps slot id to a resolver result (the JSON the CLI prints).
 */
export function decideDirection(spec, results = {}) {
  const fallback = (reasons) => ({
    brief: spec?.brief ?? null, direction: "A",
    fallback: { direction: "A", spec: spec?.direction_a?.spec ?? null, reason: reasons.map((r) => r.reason).join("; ") },
    reasons, slots: [], resolver: { tool: MCP_TOOL, rights: "unknown", approval: "unknown" }
  });
  const errors = validateSlotSpec(spec);
  if (errors.length) return fallback([{ code: "invalid_slot_spec", reason: `slot spec invalid: ${errors.join("; ")}` }]);

  const reasons = [];
  const slots = [];
  const byName = {};
  for (const s of spec.slots) {
    if (s.query.name === null) { reasons.push({ slot: s.id, code: "no_character_nominated", reason: `${s.id}: no character nominated; the owner must nominate one, none is invented` }); slots.push({ slot: s.id, status: "unresolved", positive_references: 0 }); continue; }
    const res = results[s.id] ?? missingResult;
    const supplied = s.id in results;
    byName[norm(s.query.name)] = res;
    const errs = validateResult(res);
    const positives = res.positive_references ?? [];
    slots.push({ slot: s.id, status: res.status, positive_references: positives.length, result_supplied: supplied });
    if (errs.length) { reasons.push({ slot: s.id, code: "invalid_result", reason: `${s.id}: invalid resolver result (${errs.join("; ")})` }); continue; }
    if (!STATUSES.includes(res.status)) { reasons.push({ slot: s.id, code: "unresolved", reason: `${s.id}: unknown resolver status ${res.status}; treated as unresolved` }); continue; }
    if (res.status !== RESOLVED) { reasons.push({ slot: s.id, code: res.status, reason: `${s.id}: resolver status ${res.status}${supplied ? "" : " (no resolver result supplied)"}; no substitute generated` }); continue; }
    if ((res.conflicts ?? []).length) { reasons.push({ slot: s.id, code: "conflict", reason: `${s.id}: resolver conflicts ${(res.conflicts).map((c) => (typeof c === "string" ? c : c.code)).join(", ")}` }); continue; }
    if (!positives.length) { reasons.push({ slot: s.id, code: "no_positive_reference", reason: `${s.id}: resolved but no positive recovered reference` }); continue; }
  }

  // Casting gate (understanding gain, technical opt-in, policy). Resolver results were already judged per slot above.
  const named = spec.slots.filter((s) => s.query.name !== null);
  if (named.length) {
    const d = resolveCasting({
      brief: { brand: spec.brand, topics: spec.casting.topics, visual_kind: spec.casting.visual_kind, understanding_gain: spec.casting.understanding_gain ?? null, explicit_character_optin: spec.casting.explicit_character_optin === true, cobrand: spec.casting.cobrand === true, requested_ids: named.map((s) => s.query.name) },
      transport: (name) => byName[norm(name)] ?? missingResult
    });
    if (!d.use_character && !d.cast.length && !d.blocked.length) reasons.push({ code: "casting_gate", reason: d.reason });
    for (const b of d.blocked) if (!reasons.some((r) => r.reason.startsWith(`${spec.slots.find((s) => norm(s.query.name) === b.id)?.id}:`))) reasons.push({ slot: spec.slots.find((s) => norm(s.query.name) === b.id)?.id, code: "casting_blocked", reason: `${b.id}: ${b.reason}` });
  }
  if (reasons.length) return { ...fallback(reasons), slots };
  return { brief: spec.brief, direction: "B", fallback: null, reasons: [], slots, resolver: { tool: MCP_TOOL, rights: "unknown", approval: "unknown" }, note: "slots resolved with positive references; rights and approval remain unknown, nothing is approved" };
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Placeholder preview: neutral outline boxes only. No character art, no logos. Deterministic. */
export function renderSlotPreview(spec) {
  const { width: W, height: H } = spec.canvas;
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d" data-direction="B" data-brief="${spec.brief}">`);
  o.push(`<title id="t">Direction B slot preview, brief ${spec.brief}: placeholder only</title>`);
  o.push(`<desc id="d">Layout regions and character slots as outlines. Every slot reads "${SLOT_LABEL}". No character art; characters come only from the resolver.</desc>`);
  o.push(`<rect width="${W}" height="${H}" fill="#f4f4f2"/>`);
  o.push(`<text x="32" y="38" font-family="sans-serif" font-size="20" font-weight="700" fill="#2b2b2b">DIRECTION B · SLOT PREVIEW · PLACEHOLDER ONLY · NO CHARACTER ART</text>`);
  o.push(`<text x="32" y="64" font-family="sans-serif" font-size="15" fill="#4a4a4a">Brief ${spec.brief} · ${esc(spec.brand)} · layout regions and resolver slots; nothing here is a character, a logo or an approved asset.</text>`);
  for (const r of spec.regions) {
    o.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#8a8a86" stroke-width="2" stroke-dasharray="10 6"/>`);
    o.push(`<text x="${r.x + 12}" y="${r.y + 24}" font-family="sans-serif" font-size="14" fill="#4a4a4a">${esc(r.id)} · ${esc(r.role)}</text>`);
  }
  for (const s of spec.slots) {
    const b = s.box;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    o.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#ffffff" stroke="#3d3d3a" stroke-width="3"/>`);
    o.push(`<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#2b2b2b">${SLOT_LABEL}</text>`);
    o.push(`<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#4a4a4a">${esc(s.id)} · query: ${esc(s.query.name ?? "owner must nominate")}</text>`);
  }
  o.push(`</svg>`);
  return o.join("\n") + "\n";
}

export function loadSlotSpecs(dir = DIR_B) {
  return readdirSync(dir).filter((f) => f.endsWith(".slots.json")).sort().map((f) => ({ file: f, spec: JSON.parse(readFileSync(join(dir, f), "utf8")) }));
}

/** Everything this script writes, as { relative path: content }. */
export function buildOutputs(dir = DIR_B) {
  const out = {};
  const decisions = [];
  for (const { file, spec } of loadSlotSpecs(dir)) {
    const errs = validateSlotSpec(spec);
    if (errs.length) throw new Error(`${file}: ${errs.join("; ")}`);
    out[`previews/${file.replace(/\.slots\.json$/, ".preview.svg")}`] = renderSlotPreview(spec);
    decisions.push({ file, ...decideDirection(spec, {}) });
  }
  out["decisions.json"] = JSON.stringify({ schema: "starlight.infogenius.direction-b-decisions.v1", resolver_results: "none supplied; no resolver transport was run for this file", decisions }, null, 2) + "\n";
  return out;
}

export function checkOutputs(dir = DIR_B) {
  const problems = [];
  const outs = buildOutputs(dir);
  for (const [rel, content] of Object.entries(outs)) {
    const p = join(dir, rel);
    if (!existsSync(p)) problems.push(`missing: ${relative(ROOT, p)}`);
    else if (readFileSync(p, "utf8") !== content) problems.push(`differs from fresh output: ${relative(ROOT, p)}`);
  }
  const pdir = join(dir, "previews");
  if (existsSync(pdir)) for (const f of readdirSync(pdir).sort()) if (!(`previews/${f}` in outs)) problems.push(`orphan or stale preview no slot spec produces: ${relative(ROOT, join(pdir, f))}`);
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--check")) {
      const problems = checkOutputs();
      if (problems.length) { for (const p of problems) console.error(p); process.exit(1); }
      console.log(`Verified ${loadSlotSpecs().length} slot specs: previews and decisions.json match a fresh build; no orphans`);
    } else if (args.includes("--results")) {
      const results = JSON.parse(readFileSync(resolve(args[args.indexOf("--results") + 1]), "utf8"));
      console.log(JSON.stringify(loadSlotSpecs().map(({ file, spec }) => ({ file, ...decideDirection(spec, results[spec.brief] ?? {}) })), null, 2));
    } else {
      mkdirSync(join(DIR_B, "previews"), { recursive: true });
      for (const [rel, content] of Object.entries(buildOutputs())) writeFileSync(join(DIR_B, rel), content, "utf8");
      console.log(`Wrote ${loadSlotSpecs().length} previews and decisions.json under ${relative(ROOT, DIR_B)}`);
    }
  } catch (err) { console.error(err.message); process.exit(1); }
}

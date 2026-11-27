import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compileDiagramSvg } from "../scripts/compile-brand-diagrams.mjs";
import { renderBenchmark } from "../scripts/render-infogenius-benchmark.mjs";
import {
  classifyId, createFixtureTransport, resolveCasting, routeEditorial, validateResponse, verifyAssetHashes
} from "../skills/infogenius/casting/casting-resolver.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "tests", "fixtures", "infogenius", "synthetic-vis-response.json");
const T = createFixtureTransport(FIX);
const read = (p) => readFileSync(join(ROOT, p), "utf8");

test("skill has frontmatter, all eleven stages and every capability module", () => {
  const s = read("skills/infogenius/SKILL.md");
  assert.match(s, /^---\nname: infogenius\n/);
  for (const stage of ["Brief", "Research", "Visual thesis", "Two directions", "Source retrieval", "Composition", "Render", "Independent critique", "Refine", "Export", "Receipt"]) assert.ok(s.includes(stage), stage);
  for (const m of ["Research and fact check", "Narrative compression", "Creative direction and casting", "Reference retrieval and continuity", "Diagram and data visualization", "Editorial typography", "Image generation and edit", "Deterministic HTML/SVG composition", "Figma and deck production", "Independent critique", "Provenance receipt"]) assert.ok(s.includes(m), m);
  assert.match(s, /never generate, regenerate or invent/i);
});

test("technical brief gets no character without a named gain and opt-in", () => {
  const brief = { brand: "sis", topics: ["orchestration"], visual_kind: "technical", requested_ids: ["synthetic.canon-a"] };
  assert.equal(resolveCasting({ brief, transport: T }).use_character, false);
  assert.equal(resolveCasting({ brief: { ...brief, understanding_gain: "explains-role" }, transport: T }).use_character, false);
  const ok = resolveCasting({ brief: { ...brief, understanding_gain: "explains-role", explicit_character_optin: true }, transport: T });
  assert.equal(ok.use_character, true);
  assert.equal(ok.receipt.asset_hashes_verified, true);
  assert.equal(ok.receipt.fixture, true);
  assert.equal(ok.receipt.integration_status, "not_asserted");
});

test("story brief casts a synthetic canon and labels candidates separately", () => {
  const r = resolveCasting({ brief: { brand: "frankx", topics: ["founder"], visual_kind: "story", understanding_gain: "shows-relationship", requested_ids: ["synthetic.canon-a", "synthetic.candidate-b"] }, transport: T });
  assert.deepEqual(r.cast.map((c) => c.output_class), ["approved-canon-continuity", "candidate-study"]);
});

test("tampered bytes never report verified", () => {
  const r = resolveCasting({ brief: { brand: "frankx", topics: ["founder"], visual_kind: "story", understanding_gain: "explains-role", requested_ids: ["synthetic.tampered-c"] }, transport: T });
  assert.equal(r.cast[0].asset_hashes_verified, false);
  assert.equal(r.receipt.asset_hashes_verified, false);
  const fx = JSON.parse(readFileSync(FIX, "utf8"));
  assert.equal(verifyAssetHashes(fx.characters[0]).all_verified, true);
  assert.equal(verifyAssetHashes({ assets: [{ asset_id: "x", sha256: "0".repeat(64) }] }).all_verified, false);
});

test("no transport means unavailable and nothing is invented", () => {
  const r = resolveCasting({ brief: { topics: ["founder"], visual_kind: "story", understanding_gain: "explains-role", requested_ids: ["nilo"] } });
  assert.equal(r.use_character, false);
  assert.equal(r.status, "unavailable");
  assert.deepEqual(r.cast, []);
});

test("rejected references are never positive references", () => {
  for (const id of ["arcanea-fire", "unity-v1", "unity-v2"]) {
    assert.equal(classifyId(id).kind, "rejected");
    const r = resolveCasting({ brief: { visual_kind: "story", topics: ["mythic-education"], understanding_gain: "explains-role", requested_ids: [id] }, transport: T });
    assert.equal(r.use_character, false);
    assert.equal(r.blocked[0].id, id);
  }
});

test("Biro is never silently merged into Brio", () => {
  assert.notEqual(classifyId("biro").id, classifyId("brio").id);
  const r = resolveCasting({ brief: { visual_kind: "story", topics: ["founder"], understanding_gain: "explains-role", requested_ids: ["brio"] }, transport: T });
  assert.ok(!JSON.stringify(r).includes("biro"), "brio request must not surface biro");
  assert.equal(r.use_character, false);
});

test("vendor guests are labelled unofficial; Anthropic/OpenAI co-branding is blocked", () => {
  const brief = { visual_kind: "story", topics: ["research"], understanding_gain: "explains-role", requested_ids: ["clawd"] };
  const r = resolveCasting({ brief, transport: T });
  assert.equal(r.cast[0].label, "Unofficial vendor guest");
  assert.equal(r.cast[0].rights_state, "pending");
  assert.ok(r.notes.join(" ").includes("no partner claim"));
  const cb = resolveCasting({ brief: { ...brief, cobrand: true }, transport: T });
  assert.equal(cb.use_character, false);
  assert.match(cb.blocked[0].reason, /permission and approval/);
  for (const id of ["claude-pet", "codex-pet", "github-mona"]) assert.equal(classifyId(id).kind, "vendor-guest");
});

test("lineages are never substituted", () => {
  const r = resolveCasting({ brief: { visual_kind: "story", topics: ["founder"], understanding_gain: "explains-role", requested_ids: ["synthetic.canon-a"], lineage_required: { "synthetic.canon-a": "synthetic-lineage-b" } }, transport: T });
  assert.equal(r.use_character, false);
  assert.match(r.blocked[0].reason, /lineage mismatch/);
});

test("routing defaults are proposals and match the declared map", () => {
  assert.equal(routeEditorial(["founder"]).status, "proposal");
  assert.deepEqual(routeEditorial(["founder"]).nominated, ["mini-frank", "nilo", "brio", "riff"]);
  assert.deepEqual(routeEditorial(["orchestration"]).nominated, ["starlight-queen"]);
  assert.deepEqual(routeEditorial(["memory"]).nominated, ["living-glasshouse"]);
  assert.deepEqual(routeEditorial(["mythic-education"]).nominated, ["arcanea"]);
});

test("response validation rejects wrong schema and bad hashes", () => {
  assert.ok(validateResponse({ schema: "x" }, { request_id: "r" }).length > 0);
  assert.ok(validateResponse({ schema: "starlight.infogenius.character-retrieval-response.v1", request_id: "r", reference_revision: "v", characters: [{ id: "a", status: "candidate", lineage: "l", assets: [{ asset_id: "z", sha256: "bad" }] }] }, { request_id: "r" }).length > 0);
});

test("fixture contains no image bytes and is flagged synthetic", () => {
  const fx = JSON.parse(readFileSync(FIX, "utf8"));
  assert.equal(fx.fixture, true);
  for (const c of fx.characters) for (const a of c.assets) assert.ok(Buffer.from(a.bytes_base64, "base64").toString("utf8").startsWith("SYNTHETIC") || c.id.includes("tampered"));
});

test("benchmark suite defines ten briefs with the required hard gates in the rubric", () => {
  const { briefs } = JSON.parse(read("benchmarks/infogenius/briefs.json"));
  assert.equal(briefs.length, 10);
  assert.deepEqual(briefs.filter((b) => b.deterministic_render).map((b) => b.n), [1, 2, 3, 5, 9]);
  const rubric = read("benchmarks/infogenius/RUBRIC.md");
  for (const g of ["26 of 30", "Factual correctness", "Source identity", "Accessibility", "Rights", "maker cannot be the sole reviewer"]) assert.ok(rubric.toLowerCase().includes(g.toLowerCase()), g);
  for (const b of briefs.filter((x) => x.deterministic_render)) assert.ok(existsSync(join(ROOT, b.spec)), b.spec);
});

test("benchmark renders are deterministic, AA-contrast, overflow-free in both themes", () => {
  const rows = renderBenchmark({ write: false });
  assert.equal(rows.length, 10);
  const again = renderBenchmark({ write: false });
  rows.forEach((r, i) => {
    assert.equal(r.sha256, again[i].sha256);
    assert.ok(r.min_contrast >= 4.5, `${r.id} ${r.theme}`);
    assert.equal(r.overflow, 0);
    assert.equal(r.provider, "none");
    assert.equal(r.cost_usd, 0);
    assert.ok(r.time_ms >= 0);
    assert.equal(r.review, "pending");
    const committed = join(ROOT, "benchmarks/infogenius/renders", r.file);
    assert.ok(existsSync(committed));
    assert.equal(readFileSync(committed, "utf8"), compileDiagramSvg(JSON.parse(read(`benchmarks/infogenius/specs/${r.id.replace(/^ig-/, "")}.diagram.json`)), { theme: r.theme, rootDir: ROOT }).svg);
  });
});

test("discovery pointers exist in AGENTS.md and CLAUDE.md and the skill is registered", () => {
  assert.ok(read("AGENTS.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("CLAUDE.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("SKILLS.md").includes("`infogenius`"));
});

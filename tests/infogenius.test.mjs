import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compileDiagramSvg } from "../scripts/compile-brand-diagrams.mjs";
import { renderBenchmark } from "../scripts/render-infogenius-benchmark.mjs";
import {
  CLI_ENTRY, CONFLICT_CODES, ENV_CACHE, ENV_MANIFEST, MCP_TOOL, NOT_RESOLVED_EXIT_CODE,
  buildResolveRequest, classifyId, createCommandTransport, createFixtureTransport, resolveCasting, routeEditorial, validateResult, verifyReferenceHashes
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

const story = (ids, extra = {}) => ({ brand: "frankx", topics: ["founder"], visual_kind: "story", understanding_gain: "explains-role", requested_ids: ids, ...extra });

test("technical brief gets no character without a named gain and opt-in", () => {
  const brief = { brand: "sis", topics: ["orchestration"], visual_kind: "technical", requested_ids: ["synthetic.canon-a"] };
  assert.equal(resolveCasting({ brief, transport: T }).use_character, false);
  assert.equal(resolveCasting({ brief: { ...brief, understanding_gain: "explains-role" }, transport: T }).use_character, false);
  const ok = resolveCasting({ brief: { ...brief, understanding_gain: "explains-role", explicit_character_optin: true }, transport: T });
  assert.equal(ok.use_character, true);
  assert.equal(ok.receipt.asset_hashes_verified, true);
  assert.equal(ok.receipt.fixture, true);
  assert.equal(ok.receipt.integration_status, "not_asserted");
  assert.equal(ok.receipt.tool, "visual.character.resolve");
  assert.match(ok.receipt.contract_source, /PR 92/);
});

test("contract names match the relayed PR 92 facts", () => {
  assert.equal(MCP_TOOL, "visual.character.resolve");
  assert.equal(CLI_ENTRY, "bin/vis-character.mjs");
  assert.equal(ENV_MANIFEST, "VIS_CHARACTER_MANIFEST");
  assert.equal(ENV_CACHE, "VIS_CHARACTER_CACHE");
  assert.equal(NOT_RESOLVED_EXIT_CODE, 3);
  assert.deepEqual(buildResolveRequest("Synthetic.Canon-A"), { tool: "visual.character.resolve", arguments: { name: "synthetic.canon-a" } });
  assert.deepEqual([...CONFLICT_CODES], ["confusable_alias_not_merged", "status_conflicts_with_rejected_lineage"]);
  const schema = JSON.parse(read("skills/infogenius/schemas/character-retrieval.schema.json"));
  for (const k of ["status", "identity_id", "matched_alias", "positive_references", "proposals", "rejected_lineages", "missing_references", "conflicts", "rights", "approval"]) assert.ok(schema.$defs.result.properties[k], k);
  assert.ok(schema.$defs.reference.properties.locators.properties.local_cache_path);
  for (const k of ["figma_node", "drive_file_id", "r2_key"]) assert.ok(schema.$defs.reference.properties.locators.properties[k], k);
});

test("a resolved result carries positive references, unknown rights and unknown approval", () => {
  const r = resolveCasting({ brief: story(["synthetic.canon-a", "synthetic.candidate-b"]), transport: T });
  assert.deepEqual(r.cast.map((c) => c.output_class), ["resolved-approval-unknown", "candidate-study"]);
  for (const c of r.cast) { assert.equal(c.rights, "unknown"); assert.equal(c.approval, "unknown"); }
  assert.equal(r.cast[1].asset_hashes_verified, false, "proposals are not verified positive references");
  assert.equal(r.receipt.rights, "unknown");
  assert.equal(r.receipt.approval, "unknown");
});

test("result that asserts rights or approval is rejected", () => {
  assert.ok(validateResult({ status: "resolved", identity_id: "x", matched_alias: "x", rights: "cleared" }).length > 0);
  assert.ok(validateResult({ status: "resolved", identity_id: "x", matched_alias: "x", approval: "approved" }).length > 0);
  assert.deepEqual(validateResult({ status: "resolved", identity_id: "x", matched_alias: "x", rights: "unknown", approval: "unknown" }), []);
  const r = resolveCasting({ brief: story(["x"]), transport: () => ({ status: "resolved", identity_id: "x", matched_alias: "x", approval: "approved" }) });
  assert.equal(r.use_character, false);
  assert.match(r.blocked[0].reason, /invalid resolver result/);
});

test("tampered bytes never report verified", () => {
  const r = resolveCasting({ brief: story(["synthetic.tampered-c"]), transport: T });
  assert.equal(r.cast[0].asset_hashes_verified, false);
  assert.equal(r.receipt.asset_hashes_verified, false);
  const res = T("synthetic.canon-a");
  assert.equal(verifyReferenceHashes(res).all_verified, true);
  assert.equal(verifyReferenceHashes({ positive_references: [{ edition: "x", sha256: "0".repeat(64) }] }, { cacheDir: mkdtempSync(join(tmpdir(), "ig-empty-")) }).all_verified, false);
  assert.match(res.positive_references[0].locators.local_cache_path, /[\\/]a[0-9a-f][\\/][a-f0-9]{64}$/);
});

test("missing references are reported, not hidden", () => {
  const r = resolveCasting({ brief: story(["synthetic.missing-d"]), transport: T });
  assert.equal(r.cast[0].missing_references[0].reason, "not_accessible");
});

test("no transport means unavailable and nothing is invented", () => {
  const r = resolveCasting({ brief: { topics: ["founder"], visual_kind: "story", understanding_gain: "explains-role", requested_ids: ["nilo"] } });
  assert.equal(r.use_character, false);
  assert.equal(r.status, "unavailable");
  assert.deepEqual(r.cast, []);
});

test("not-resolved statuses block; nothing is substituted", () => {
  for (const id of ["synthetic.ambiguous-e", "synthetic.unknown-name"]) {
    const r = resolveCasting({ brief: story([id]), transport: T });
    assert.equal(r.use_character, false);
    assert.match(r.blocked[0].reason, /not resolved/);
  }
  assert.equal(T("synthetic.unknown-name").status, "not_found");
});

test("conflict codes block: confusable alias is not merged; status conflicts with rejected lineage", () => {
  for (const [id, code] of [["synthetic.alfa", "confusable_alias_not_merged"], ["synthetic.lineage-f", "status_conflicts_with_rejected_lineage"]]) {
    const r = resolveCasting({ brief: story([id]), transport: T });
    assert.equal(r.use_character, false);
    assert.deepEqual(r.blocked[0].conflicts, [code]);
  }
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
  const r = resolveCasting({ brief: story(["brio"]), transport: T });
  assert.ok(!JSON.stringify(r).includes("biro"), "brio request must not surface biro");
  assert.equal(r.use_character, false);
});

test("vendor guests are labelled unofficial, rights pending; Anthropic/OpenAI co-branding is blocked", () => {
  const brief = story(["synthetic.vendor-guest"], { topics: ["research"] });
  const r = resolveCasting({ brief, transport: T });
  assert.equal(r.cast[0].label, "Unofficial vendor guest");
  assert.equal(r.cast[0].rights, "pending");
  assert.equal(r.cast[0].approval, "unknown");
  assert.equal(T("synthetic.vendor-guest").class, "vendor-guest");
  assert.equal(T("synthetic.vendor-guest").unofficial, true);
  const cb = resolveCasting({ brief: { ...brief, cobrand: true }, transport: T });
  assert.equal(cb.use_character, false);
  assert.match(cb.blocked[0].reason, /permission and approval/);
  for (const id of ["claude-pet", "codex-pet", "github-mona", "clawd"]) assert.equal(classifyId(id).kind, "vendor-guest");
  const named = resolveCasting({ brief: story(["clawd"], { topics: ["research"], cobrand: true }), transport: T });
  assert.match(named.blocked[0].reason, /permission and approval/);
  assert.ok(resolveCasting({ brief: story(["clawd"], { topics: ["research"] }), transport: T }).notes.join(" ").includes("no partner claim"));
});

test("lineages are never substituted", () => {
  const r = resolveCasting({ brief: story(["synthetic.canon-a"], { lineage_required: { "synthetic.canon-a": "synthetic.candidate-b" } }), transport: T });
  assert.equal(r.use_character, false);
  assert.match(r.blocked[0].reason, /identity mismatch/);
});

test("command transport maps exit 3 to a non-resolved result and rejects other failures", () => {
  const dir = mkdtempSync(join(tmpdir(), "ig-cli-"));
  const fake = (code, body) => { const f = join(dir, `fake-${code}.mjs`); writeFileSync(f, `console.log(${JSON.stringify(JSON.stringify(body))}); process.exit(${code});`); return f; };
  const nr = createCommandTransport({ entry: fake(3, { status: "not_found" }) })("synthetic.x");
  assert.equal(nr.status, "not_found");
  assert.throws(() => createCommandTransport({ entry: fake(1, {}) })("synthetic.x"), /exited 1/);
  assert.throws(() => createCommandTransport({ entry: fake(3, { status: "resolved" }) })("synthetic.x"), /contract violation/);
  const envProbe = join(dir, "env.mjs");
  writeFileSync(envProbe, `console.log(JSON.stringify({ status: "resolved", identity_id: "i", matched_alias: "i", m: process.env.VIS_CHARACTER_MANIFEST, c: process.env.VIS_CHARACTER_CACHE, a: process.argv.slice(2) }));`);
  const ok = createCommandTransport({ entry: envProbe, manifest: "/m.json", cache: "/cache" })("synthetic.x");
  assert.deepEqual([ok.m, ok.c, ok.a], ["/m.json", "/cache", ["--name", "synthetic.x"]]);
});

test("routing defaults are proposals and match the declared map", () => {
  assert.equal(routeEditorial(["founder"]).status, "proposal");
  assert.deepEqual(routeEditorial(["founder"]).nominated, ["mini-frank", "nilo", "brio", "riff"]);
  assert.deepEqual(routeEditorial(["orchestration"]).nominated, ["starlight-queen"]);
  assert.deepEqual(routeEditorial(["memory"]).nominated, ["living-glasshouse"]);
  assert.deepEqual(routeEditorial(["mythic-education"]).nominated, ["arcanea"]);
});

test("fixture contains no image bytes and is flagged synthetic", () => {
  const fx = JSON.parse(readFileSync(FIX, "utf8"));
  assert.equal(fx.fixture, true);
  for (const e of fx.entries) {
    assert.ok(e.identity_id.startsWith("synthetic."), e.identity_id);
    for (const r of e.positive_references ?? []) assert.ok(Buffer.from(r.fixture_bytes_base64, "base64").toString("utf8").startsWith("SYNTHETIC") || e.identity_id.includes("tampered"));
  }
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

test("render --check fails and names the file when a committed render differs by one byte", () => {
  const script = join(ROOT, "scripts", "render-infogenius-benchmark.mjs");
  const src = join(ROOT, "benchmarks/infogenius/renders");
  const dir = mkdtempSync(join(tmpdir(), "ig-check-"));
  for (const f of readdirSync(src)) copyFileSync(join(src, f), join(dir, f));
  const clean = spawnSync(process.execPath, [script, "--check", "--out", dir], { encoding: "utf8" });
  assert.equal(clean.status, 0, clean.stderr);
  const victim = "ig-01-starlight-agent-orchestration.dark.svg";
  writeFileSync(join(dir, victim), readFileSync(join(dir, victim), "utf8") + " ");
  const bad = spawnSync(process.execPath, [script, "--check", "--out", dir], { encoding: "utf8" });
  assert.notEqual(bad.status, 0);
  assert.ok(bad.stderr.includes(victim), bad.stderr);
});

test("discovery pointers exist in AGENTS.md and CLAUDE.md and the skill is registered", () => {
  assert.ok(read("AGENTS.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("CLAUDE.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("SKILLS.md").includes("`infogenius`"));
});

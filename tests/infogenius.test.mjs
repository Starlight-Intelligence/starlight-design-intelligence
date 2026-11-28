import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compileDiagramSvg } from "../scripts/compile-brand-diagrams.mjs";
import { checkRenders, loadBriefs, renderBenchmark, resultsMarkdown } from "../scripts/render-infogenius-benchmark.mjs";
import { SCHEMA as SLOT_SCHEMA, buildOutputs, checkOutputs, decideDirection, renderSlotPreview, validateSlotSpec } from "../scripts/infogenius-direction-b.mjs";
import {
  ALL_BRANDS, CLI_ENTRY, CONFLICT_CODES, ENV_CACHE, ENV_MANIFEST, MCP_TOOL, NOT_RESOLVED_EXIT_CODE,
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
  assert.equal(routeEditorial(["founder"], "frankx").status, "proposal");
  assert.deepEqual(routeEditorial(["founder"], "frankx").nominated, ["mini-frank", "nilo", "brio", "riff"]);
  assert.deepEqual(routeEditorial(["orchestration"], "sis").nominated, ["starlight-queen"]);
  assert.deepEqual(routeEditorial(["memory"], "sis").nominated, ["living-glasshouse"]);
  assert.deepEqual(routeEditorial(["mythic-education"], "arcanea").nominated, ["arcanea"]);
  assert.deepEqual(routeEditorial(["founder"]).nominated, [], "no brand means no brand-scoped route applies");
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
  assert.deepEqual(briefs.filter((b) => b.deterministic_render).map((b) => b.n), [1, 2, 3, 5, 6, 7, 9, 10]);
  const rubric = read("benchmarks/infogenius/RUBRIC.md");
  for (const g of ["26 of 30", "Factual correctness", "Source identity", "Accessibility", "Rights", "maker cannot be the sole reviewer"]) assert.ok(rubric.toLowerCase().includes(g.toLowerCase()), g);
  for (const b of briefs.filter((x) => x.deterministic_render)) assert.ok(existsSync(join(ROOT, b.spec)), b.spec);
});

test("benchmark renders are deterministic, AA-contrast, overflow-free in both themes", () => {
  const rows = renderBenchmark({ write: false });
  assert.equal(rows.length, loadBriefs().rendered.length * 2);
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

test("compiler layout options are opt-in: shared examples stay byte-identical, benchmark specs use them", () => {
  const dir = join(ROOT, "brand-image-system", "specs", "diagrams");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".diagram.json"))) {
    const spec = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const theme of ["dark", "light"]) {
      const committed = readFileSync(join(ROOT, "brand-image-system", "examples", "diagrams", `${spec.id}.${theme}.svg`), "utf8");
      assert.equal(compileDiagramSvg(spec, { theme, rootDir: ROOT }).svg, committed, `${spec.id} ${theme}`);
    }
  }
  const spec9 = JSON.parse(read("benchmarks/infogenius/specs/09-agentic-income-commercial-system.diagram.json"));
  const withOpts = compileDiagramSvg(spec9, { theme: "dark", rootDir: ROOT }).svg;
  const { layout, labels, ...plain } = spec9;
  const without = compileDiagramSvg(plain, { theme: "dark", rootDir: ROOT }).svg;
  assert.ok(!withOpts.includes("ZERO RASTER TEXT") && without.includes("ZERO RASTER TEXT"));
  assert.ok(without.includes("SKILLS &amp; GATES") && !withOpts.includes("SKILLS &amp; GATES"));
  assert.notEqual(withOpts, without);
});

test("benchmark brief 5 cites only FrankX files present in this repo", () => {
  const spec = JSON.parse(read("benchmarks/infogenius/specs/05-frankx-advanced-ai-architecture.diagram.json"));
  const cited = spec.sourceNote.match(/brand-packs\/frankx\/[A-Z_]+\.md/g) ?? [];
  assert.ok(cited.length >= 1);
  for (const c of cited) assert.ok(existsSync(join(ROOT, c)), c);
  assert.equal(spec.tiers.length, 4);
  assert.ok(!/arcanea|guardian|gate of/i.test(JSON.stringify(spec)));
});

test("discovery pointers exist in AGENTS.md and CLAUDE.md and the skill is registered", () => {
  assert.ok(read("AGENTS.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("CLAUDE.md").includes("skills/infogenius/SKILL.md"));
  assert.ok(read("SKILLS.md").includes("`infogenius`"));
});

test("every casting decision, including early exits, carries a receipt", () => {
  const early = resolveCasting({ brief: { brand: "sis", topics: ["orchestration"], visual_kind: "technical" }, transport: T });
  assert.equal(early.use_character, false);
  assert.ok(early.receipt && early.receipt.integration_status === "not_asserted" && early.receipt.asset_hashes_verified === false);
  const optin = resolveCasting({ brief: { brand: "sis", topics: ["orchestration"], visual_kind: "technical", understanding_gain: "explains-role" }, transport: T });
  assert.ok(optin.receipt);
});

test("routing enforces brand_scope when a brand is given", () => {
  assert.deepEqual(routeEditorial(["founder"], "frankx").nominated, ["mini-frank", "nilo", "brio", "riff"]);
  assert.deepEqual(routeEditorial(["founder"], "sis").nominated, []);
  assert.deepEqual(routeEditorial(["mythic-education"], "frankx").nominated, []);
  assert.deepEqual(routeEditorial(["mythic-education"], "arcanea").nominated, ["arcanea"]);
});

// ---- Round 3: decision shape, brand_scope, orphan checks, Direction B ----

const SYN = {
  technical_topics: ["pipeline"],
  routes: [
    { route_id: "a-only", topics: ["topic-x"], brand_scope: ["brand-a"], nominated: ["synthetic.a-char"] },
    { route_id: "b-only", topics: ["topic-x"], brand_scope: ["brand-b"], nominated: ["synthetic.b-char"] },
    { route_id: "everyone", topics: ["topic-y"], brand_scope: [ALL_BRANDS], nominated: ["synthetic.shared"] },
    { route_id: "unscoped", topics: ["topic-z"], nominated: ["synthetic.unscoped"] }
  ]
};
const okResult = (id) => ({ status: "resolved", identity_id: id, matched_alias: id, rights: "unknown", approval: "unknown", positive_references: [{ edition: "e1", sha256: "a".repeat(64) }] });

test("a route scoped to brand A is never nominated for a brief of brand B", () => {
  assert.deepEqual(routeEditorial(["topic-x"], "brand-a", SYN).nominated, ["synthetic.a-char"]);
  assert.deepEqual(routeEditorial(["topic-x"], "brand-b", SYN).nominated, ["synthetic.b-char"]);
  assert.deepEqual(routeEditorial(["topic-x"], "brand-c", SYN).nominated, []);
  assert.deepEqual(routeEditorial(["topic-x"], undefined, SYN).nominated, [], "a missing brand never matches a scoped route");
  const asked = [];
  const d = resolveCasting({ brief: { brand: "brand-b", topics: ["topic-x"], visual_kind: "story", understanding_gain: "explains-role" }, routing: SYN, transport: (n) => { asked.push(n); return okResult(n); } });
  assert.deepEqual(asked, ["synthetic.b-char"], "only brand B's route is resolved; brand A's character is never asked for");
  assert.ok(!JSON.stringify(d).includes("synthetic.a-char"));
});

test("an explicit all-brands scope applies to any brand; a missing scope applies to none", () => {
  for (const b of ["brand-a", "brand-b", "brand-c", undefined]) assert.deepEqual(routeEditorial(["topic-y"], b, SYN).nominated, ["synthetic.shared"], String(b));
  for (const b of ["brand-a", undefined]) assert.deepEqual(routeEditorial(["topic-z"], b, SYN).nominated, []);
});

test("every return path of resolveCasting has the same shape and a receipt with the reason and inputs", () => {
  const story = { brand: "brand-a", topics: ["topic-x"], visual_kind: "story", understanding_gain: "explains-role" };
  const cases = {
    "no gain": { brief: { ...story, understanding_gain: undefined }, transport: () => okResult("x") },
    "technical without opt-in": { brief: { brand: "brand-a", topics: ["pipeline"], visual_kind: "technical", understanding_gain: "explains-role" }, transport: () => okResult("x") },
    "nothing routed for this brand": { brief: { ...story, brand: "brand-c" }, transport: () => okResult("x") },
    "only a rejected reference": { brief: { ...story, requested_ids: ["unity-v1"] }, transport: () => okResult("x") },
    "no transport": { brief: story, transport: null },
    "every candidate blocked": { brief: story, transport: () => ({ status: "ambiguous", rights: "unknown", approval: "unknown" }) },
    "cast": { brief: story, transport: (n) => okResult(n) }
  };
  const keys = Object.keys(resolveCasting({ brief: story, routing: SYN, transport: null })).sort();
  const rkeys = Object.keys(resolveCasting({ brief: story, routing: SYN, transport: null }).receipt).sort();
  for (const [name, c] of Object.entries(cases)) {
    const d = resolveCasting({ ...c, routing: SYN });
    assert.deepEqual(Object.keys(d).sort(), keys, `${name}: top-level shape`);
    assert.deepEqual(Object.keys(d.receipt).sort(), rkeys, `${name}: receipt shape`);
    assert.equal(typeof d.use_character, "boolean", name);
    assert.ok(typeof d.status === "string" && d.status, `${name}: status`);
    assert.ok(typeof d.reason === "string" && d.reason.length > 5, `${name}: reason`);
    assert.equal(d.receipt.reason, d.reason, `${name}: receipt carries the reason`);
    assert.equal(d.receipt.decision, d.status, name);
    assert.equal(d.receipt.inputs.brand, c.brief.brand, `${name}: receipt carries the inputs`);
    assert.ok(Array.isArray(d.receipt.inputs.topics) && Array.isArray(d.receipt.inputs.requested_ids), name);
    assert.equal(d.receipt.rights, "unknown"); assert.equal(d.receipt.approval, "unknown");
    assert.equal(d.receipt.integration_status, "not_asserted");
  }
  assert.equal(resolveCasting({ ...cases["no gain"], routing: SYN }).status, "no_character");
  assert.equal(resolveCasting({ ...cases["no transport"], routing: SYN }).status, "unavailable");
  assert.equal(resolveCasting({ ...cases["cast"], routing: SYN }).status, "cast");
  assert.deepEqual(resolveCasting({ ...cases["cast"], routing: SYN }).receipt.identity_ids, ["synthetic.a-char"]);
});

test("render --check names orphan or stale files in renders and previews, and the message counts come from briefs.json", () => {
  const rows = renderBenchmark({ write: false });
  const { rendered } = loadBriefs();
  assert.equal(new Set(rows.map((r) => r.brief)).size, rendered.length);
  const rd = mkdtempSync(join(tmpdir(), "ig-orph-r-"));
  const pd = mkdtempSync(join(tmpdir(), "ig-orph-p-"));
  for (const r of rows) { writeFileSync(join(rd, r.file), r.svg); writeFileSync(join(pd, r.file.replace(/\.svg$/, ".png")), "x"); }
  assert.deepEqual(checkRenders(rows, rd, pd), []);
  writeFileSync(join(rd, "ig-99-removed-brief.dark.svg"), "<svg/>");
  writeFileSync(join(rd, "notes.txt"), "x");
  writeFileSync(join(pd, "ig-99-removed-brief.dark.png"), "x");
  const problems = checkRenders(rows, rd, pd);
  assert.equal(problems.length, 3, problems.join("\n"));
  for (const n of ["ig-99-removed-brief.dark.svg", "notes.txt", "ig-99-removed-brief.dark.png"]) assert.ok(problems.some((p) => p.includes(n)), n);
  const script = join(ROOT, "scripts", "render-infogenius-benchmark.mjs");
  const ok = spawnSync(process.execPath, [script, "--check"], { encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stderr);
  assert.ok(ok.stdout.includes(`${rendered.length} briefs`), ok.stdout);
  assert.ok(ok.stdout.includes(`briefs ${rendered.map((b) => b.n).join(", ")}`), ok.stdout);
  const md = resultsMarkdown(rows, { date: "d", node: "n" });
  assert.ok(md.includes(`Briefs rendered (${rendered.length} of 10): ${rendered.map((b) => b.n).join(", ")}`));
  assert.throws(() => resultsMarkdown(rows.slice(2), { date: "d", node: "n" }), /deterministic_render/);
});

const slotSpec = (over = {}) => ({
  schema: SLOT_SCHEMA, brief: 1, brand: "brand-a", canvas: { width: 1000, height: 600 },
  regions: [{ id: "stage", role: "stage", x: 0, y: 0, w: 500, h: 600 }, { id: "body", role: "body", x: 500, y: 0, w: 500, h: 600 }],
  casting: { topics: ["topic-x"], visual_kind: "story", understanding_gain: "explains-role" },
  slots: [{ id: "s1", region: "stage", box: { x: 20, y: 20, w: 200, h: 300 }, query: { name: "synthetic.a-char", preferred_edition: null, pose_expression_note: "synthetic note", minimum_status: "resolved" } }],
  direction_a: { spec: null },
  ...over
});

test("slot spec validation rejects art, logos, bad geometry, vendor guests without the unofficial flag and rejected references", () => {
  assert.deepEqual(validateSlotSpec(slotSpec()), []);
  const bad = (mut) => validateSlotSpec(slotSpec({ slots: [mut(structuredClone(slotSpec().slots[0]))] }));
  assert.ok(bad((s) => ({ ...s, image: "x.png" })).some((e) => /not allowed/.test(e)));
  assert.ok(bad((s) => ({ ...s, logo: "x" })).some((e) => /not allowed/.test(e)));
  assert.ok(bad((s) => ({ ...s, box: { x: 400, y: 0, w: 300, h: 100 } })).some((e) => /not inside region/.test(e)));
  assert.ok(bad((s) => ({ ...s, query: { ...s.query, minimum_status: "ambiguous" } })).some((e) => /minimum_status/.test(e)));
  assert.ok(bad((s) => ({ ...s, query: { ...s.query, name: "clawd" } })).some((e) => /unofficial/.test(e)));
  assert.deepEqual(bad((s) => ({ ...s, unofficial: true, query: { ...s.query, name: "clawd" } })), []);
  assert.ok(bad((s) => ({ ...s, query: { ...s.query, name: "unity-v1" } })).some((e) => /rejected/.test(e)));
  assert.ok(bad((s) => ({ ...s, query: { ...s.query, name: null } })).some((e) => /query.name/.test(e)));
  const two = validateSlotSpec(slotSpec({ slots: [slotSpec().slots[0], { ...slotSpec().slots[0], id: "s2", box: { x: 100, y: 100, w: 200, h: 200 } }] }));
  assert.ok(two.some((e) => /overlaps/.test(e)));
});

test("Direction B is blocked, with a recorded reason and fallback to A, for ambiguous, not_found, unresolved and no positive reference", () => {
  const spec = slotSpec({ direction_a: { spec: "benchmarks/infogenius/specs/01-starlight-agent-orchestration.diagram.json" } });
  const run = (res) => decideDirection(spec, res === undefined ? {} : { s1: res });
  const allowed = run(okResult("synthetic.a-char"));
  assert.equal(allowed.direction, "B");
  assert.equal(allowed.fallback, null);
  const base = { rights: "unknown", approval: "unknown", positive_references: [] };
  const blocked = {
    ambiguous: run({ ...base, status: "ambiguous" }),
    not_found: run({ ...base, status: "not_found" }),
    unresolved: run({ ...base, status: "unresolved" }),
    "no result at all": run(undefined),
    no_positive_reference: run({ ...okResult("synthetic.a-char"), positive_references: [] }),
    conflict: run({ ...okResult("synthetic.a-char"), conflicts: ["confusable_alias_not_merged"] })
  };
  for (const [name, d] of Object.entries(blocked)) {
    assert.equal(d.direction, "A", name);
    assert.equal(d.fallback.direction, "A", name);
    assert.equal(d.fallback.spec, spec.direction_a.spec, name);
    assert.ok(d.fallback.reason.length > 10 && d.reasons.length >= 1, name);
    assert.equal(d.resolver.rights, "unknown"); assert.equal(d.resolver.approval, "unknown");
  }
  assert.equal(blocked.ambiguous.reasons[0].code, "ambiguous");
  assert.equal(blocked.not_found.reasons[0].code, "not_found");
  assert.equal(blocked.unresolved.reasons[0].code, "unresolved");
  assert.equal(blocked.no_positive_reference.reasons[0].code, "no_positive_reference");
  assert.match(blocked["no result at all"].fallback.reason, /no resolver result supplied/);
  // one blocked slot blocks the whole composition
  const two = slotSpec({ slots: [spec.slots[0], { ...spec.slots[0], id: "s2", box: { x: 250, y: 20, w: 200, h: 300 }, query: { ...spec.slots[0].query, name: "synthetic.b-char" } }] });
  assert.equal(decideDirection(two, { s1: okResult("synthetic.a-char"), s2: { ...base, status: "ambiguous" } }).direction, "A");
  // a technical brief without owner opt-in is gated even when the resolver succeeds
  const tech = slotSpec({ casting: { topics: ["topic-x"], visual_kind: "technical", understanding_gain: "explains-role", explicit_character_optin: false } });
  const gated = decideDirection(tech, { s1: okResult("synthetic.a-char") });
  assert.equal(gated.direction, "A");
  assert.ok(gated.reasons.some((r) => r.code === "casting_gate"));
  // an invalid spec fails closed
  assert.equal(decideDirection(slotSpec({ slots: [] }), {}).direction, "A");
});

test("committed direction-b specs cover briefs 1, 4, 5, 9, hold no art, and today fall back to A", () => {
  const dir = join(ROOT, "benchmarks/infogenius/direction-b");
  const files = readdirSync(dir).filter((f) => f.endsWith(".slots.json")).sort();
  assert.deepEqual(files.map((f) => f.slice(0, 2)), ["01", "04", "05", "09"]);
  const outs = buildOutputs(dir);
  for (const f of files) {
    const spec = JSON.parse(readFileSync(join(dir, f), "utf8"));
    assert.deepEqual(validateSlotSpec(spec), [], f);
    const svg = renderSlotPreview(spec);
    assert.ok(svg.includes("slot: needs resolver") && svg.includes("NO CHARACTER ART"), f);
    assert.ok(!/<image|<path|<circle|<ellipse|href=/.test(svg), `${f}: preview is outline boxes and text only`);
    assert.equal(decideDirection(spec, {}).direction, "A", f);
  }
  const decisions = JSON.parse(outs["decisions.json"]).decisions;
  assert.ok(decisions.every((d) => d.direction === "A" && d.fallback.reason));
  assert.deepEqual(checkOutputs(dir), []);
  const brief9 = JSON.parse(readFileSync(join(dir, "09-agentic-income-commercial-system.slots.json"), "utf8"));
  assert.deepEqual(routeEditorial(brief9.casting.topics, brief9.brand).nominated, [], "no route nominates a character for agentic-income");
  const brief4 = JSON.parse(readFileSync(join(dir, "04-mini-frank-human-ai-collaboration.slots.json"), "utf8"));
  assert.ok(brief4.slots.every((sl) => !/biro/i.test(sl.query.name)), "Biro is never queried or aliased into a slot");
});

test("direction-b --check fails on an orphan preview and drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "ig-db-"));
  for (const f of readdirSync(join(ROOT, "benchmarks/infogenius/direction-b")).filter((f) => f.endsWith(".slots.json"))) copyFileSync(join(ROOT, "benchmarks/infogenius/direction-b", f), join(dir, f));
  assert.ok(checkOutputs(dir).length > 0, "nothing written yet: missing outputs are reported");
  for (const [rel, content] of Object.entries(buildOutputs(dir))) { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), content); }
  assert.deepEqual(checkOutputs(dir), []);
  writeFileSync(join(dir, "previews", "04-removed.preview.svg"), "<svg/>");
  assert.ok(checkOutputs(dir).some((p) => p.includes("04-removed.preview.svg") && /orphan/.test(p)));
});

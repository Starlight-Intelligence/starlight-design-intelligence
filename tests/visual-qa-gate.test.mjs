import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ROOT, launchChromium, VIEWPORTS, contrastRatio, loadBrandPack, runVisualQaGate, tokenContrastMatrix
} from "../scripts/visual-qa-gate.mjs";

const fixtures = fileURLToPath(new URL("./fixtures/visual-qa/", import.meta.url));
const fixture = (name) => readFileSync(join(fixtures, name), "utf8");
const gencreator = JSON.parse(readFileSync(join(ROOT, "brand-image-system/runtime/brands/gencreator/brand-pack.json"), "utf8"));
const page = (body, css = "", brandCss = "background:#fbf9f5;color:#221f1b;font:16px/1.5 \"Instrument Sans\",system-ui") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>body{margin:0;${brandCss}}main{padding:16px}${css}</style></head><body><main>${body}</main></body></html>`;
const codes = (report) => new Set(report.samples.flatMap((s) => s.failures.map((f) => f.code)));
const widthsWith = (report, code) => [...new Set(report.samples.filter((s) => s.failures.some((f) => f.code === code)).map((s) => s.viewport.width))];

// Rendered checks need Chromium. `npm test` may run before a browser is installed, so the rendered
// tests skip with a stated reason unless VISUAL_QA_REQUIRE_BROWSER=1, which CI sets after installing.
let browser;
let browserSkip = false;
before(async () => {
  try { browser = await launchChromium(); } catch (error) {
    if (process.env.VISUAL_QA_REQUIRE_BROWSER === "1") throw error;
    browserSkip = `Chromium unavailable (${error.message.split("\n")[0]}); set PLAYWRIGHT_CHROMIUM_EXECUTABLE or install it`;
  }
});
after(async () => { await browser?.close(); });
const rendered = (name, fn) => test(name, async (t) => { if (browserSkip) return t.skip(browserSkip); return fn(t); });

test("contrast math matches WCAG reference values", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#777777", "#777777"), 1);
  assert.equal(contrastRatio("#fff", "#ffffff"), 1);
  // #767676 on white is the canonical AA-normal boundary (4.54:1).
  assert.ok(Math.abs(contrastRatio("#767676", "#ffffff") - 4.54) < 0.01);
  const [best] = tokenContrastMatrix(gencreator.visual.colors);
  assert.deepEqual([best.a, best.b, best.aa_normal], ["ink", "paper", true]);
});

test("every repository brand pack validates and carries an AA-capable text pair", () => {
  const brands = readdirSync(join(ROOT, "brand-image-system/runtime/brands"));
  assert.ok(brands.length >= 11);
  for (const brand of brands) {
    const declared = loadBrandPack({ brand });
    assert.deepEqual(declared.findings, [], brand);
    assert.ok(Object.keys(declared.contract.palette).length >= 2, brand);
  }
  const sis = loadBrandPack({ brand: "sis" });
  assert.equal(sis.contract.limits.maxVisibleBackdropSurfaces, 2, "SIS foundations limits flow into the contract");
  assert.equal(loadBrandPack({ brand: "gencreator" }).contract.canvasRole, "paper");
});

test("invalid declarations are refused before any page opens", () => {
  assert.throws(() => loadBrandPack({ brand: "../etc" }), /invalid brand id/u);
  assert.throws(() => loadBrandPack({ brand: "no-such-brand" }), /unknown brand pack/u);
  const missing = structuredClone(gencreator); delete missing.voice;
  assert.throws(() => loadBrandPack({ brandPack: missing }), /brand-pack\.schema\.json/u);
  const translucent = structuredClone(gencreator); translucent.visual.colors.paper = "#fbf9f580";
  assert.throws(() => loadBrandPack({ brandPack: translucent }), /opaque hex/u);
  const tokens = JSON.parse(readFileSync(join(ROOT, "brand-packs/sis/foundations/tokens.json"), "utf8"));
  tokens.limits.maxVisibleBackdropSurfaces = 9;
  assert.throws(() => loadBrandPack({ brand: "sis", foundations: tokens }), /starlight-foundations\.schema\.json/u);
});

test("declared text and canvas roles must themselves reach AA", () => {
  const weak = structuredClone(gencreator);
  weak.visual.colors.ink = "#a8a39b";
  const declared = loadBrandPack({ brandPack: weak });
  assert.deepEqual(declared.findings.map((f) => f.code), ["brand-token-contrast"]);
  const dangling = structuredClone(gencreator);
  dangling.visual.colorRoles.text = "charcoal";
  assert.deepEqual(loadBrandPack({ brandPack: dangling }).findings.map((f) => f.code), ["brand-role-undefined"]);
});

rendered("a conforming surface passes at 375, 768 and 1440 with and without reduced motion", async () => {
  const report = await runVisualQaGate({ browser, html: fixture("gencreator-pass.html"), brand: "gencreator", readySelector: "h1" });
  assert.equal(report.verdict, "PASS", JSON.stringify(report.samples.flatMap((s) => s.failures)));
  assert.equal(report.samples.length, 6);
  assert.deepEqual([...new Set(report.samples.map((s) => s.viewport.width))], VIEWPORTS.map((v) => v.width));
  assert.deepEqual([...new Set(report.samples.map((s) => s.reduced_motion))], ["no-preference", "reduce"]);
  for (const sample of report.samples) {
    assert.ok(sample.measured_text_elements >= 8);
    assert.equal(sample.brand.canvas.token, "paper");
    assert.equal(sample.brand.body_text.token, "ink");
    assert.match(sample.dom_sha256, /^[0-9a-f]{64}$/u);
  }
});

rendered("horizontal overflow fails only at the widths it occurs and names the offender", async () => {
  const report = await runVisualQaGate({ browser, html: fixture("overflow.html"), brand: "gencreator", readySelector: "h1" });
  assert.equal(report.verdict, "REVISE");
  assert.deepEqual(widthsWith(report, "horizontal-overflow"), [375, 768]);
  const finding = report.samples[0].failures.find((f) => f.code === "horizontal-overflow");
  assert.equal(finding.offenders[0].selector, "#rail");
  assert.ok(finding.scroll_width > 375);
});

rendered("low-contrast brand-adjacent text fails WCAG AA with measured values", async () => {
  const report = await runVisualQaGate({ browser, html: fixture("low-contrast.html"), brand: "gencreator", readySelector: "h1" });
  assert.equal(report.verdict, "REVISE");
  const finding = report.samples[0].failures.find((f) => f.code === "text-contrast");
  assert.equal(finding.selector, "#muted");
  assert.equal(finding.required, 4.5);
  assert.ok(finding.ratio < 4.5);
  assert.equal(finding.background_token, "paper");
  assert.equal(finding.foreground_token, null);
  assert.deepEqual(widthsWith(report, "text-contrast"), [375, 768, 1440]);
});

rendered("large text uses the 3:1 threshold and translucent text is composited", async () => {
  // #8b857d on paper is about 3.6:1: valid for 28px display text, invalid for 15px reading text.
  const large = await runVisualQaGate({ browser, html: page('<h1 style="color:#8b857d;font-size:28px">Edition</h1>'), brand: "gencreator", readySelector: "h1" });
  assert.equal(large.verdict, "PASS", JSON.stringify(large.samples[0].failures));
  const small = await runVisualQaGate({ browser, html: page('<h1>Edition</h1><p style="color:#8b857d;font-size:15px">Note</p>'), brand: "gencreator", readySelector: "h1" });
  assert.ok(codes(small).has("text-contrast"));
  const faded = await runVisualQaGate({ browser, html: page('<h1>Edition</h1><p style="color:rgb(34 31 27 / 0.35)">Faded</p>'), brand: "gencreator", readySelector: "h1" });
  assert.ok(codes(faded).has("text-contrast"), "alpha must be composited over the canvas, not treated as opaque ink");
});

rendered("text over imagery is reported unresolved, never silently passed or failed", async () => {
  const report = await runVisualQaGate({
    browser, brand: "gencreator", readySelector: "h1",
    html: page('<h1>Edition</h1><div class="hero" id="hero"><p>Over the image</p></div>', ".hero{background:linear-gradient(#221f1b,#fbf9f5);color:#fbf9f5}")
  });
  assert.equal(report.verdict, "PASS");
  assert.ok(report.samples.every((s) => s.unresolved.some((u) => /background-image/u.test(u.reason))));
});

rendered("brand conformance: off-palette canvas, swapped roles and missing reading family", async () => {
  const offPalette = await runVisualQaGate({ browser, html: page("<h1>Edition</h1>", "", "background:#0b1f3a;color:#ffffff;font-family:'Instrument Sans'"), brand: "gencreator", readySelector: "h1" });
  assert.ok(codes(offPalette).has("brand-off-palette"));
  const swapped = await runVisualQaGate({ browser, html: page("<h1>Edition</h1>", "", "background:#221f1b;color:#fbf9f5;font-family:'Instrument Sans'"), brand: "gencreator", readySelector: "h1" });
  assert.ok(codes(swapped).has("brand-role-mismatch"));
  assert.ok(!codes(swapped).has("text-contrast"), "inverted ink/paper is readable; the failure is brand-role, not contrast");
  const family = await runVisualQaGate({ browser, html: page("<h1>Edition</h1>", "", "background:#fbf9f5;color:#221f1b;font-family:Arial"), brand: "gencreator", readySelector: "h1" });
  assert.ok(codes(family).has("brand-reading-family"));
});

rendered("foundations limits from the schema-validated SIS pack bound backdrop layout", async () => {
  const report = await runVisualQaGate({ browser, html: fixture("sis-backdrop.html"), brand: "sis", readySelector: "h1" });
  assert.equal(report.verdict, "REVISE");
  assert.ok(codes(report).has("brand-backdrop-limit"));
  const nested = report.samples[0].failures.find((f) => f.code === "brand-nested-backdrop");
  assert.equal(nested.selector, "#inner");
  assert.equal(report.samples[0].brand.backdrop_surfaces, 3);
  assert.ok(!codes(report).has("text-contrast"));
});

rendered("the CLI writes a receipt, exits 1 on findings and 2 on configuration errors", async () => {
  const dir = mkdtempSync(join(tmpdir(), "visual-qa-"));
  const sha = "a".repeat(40);
  const run = (args) => execFileSync(process.execPath, [join(ROOT, "scripts/visual-qa-gate.mjs"), ...args], { cwd: dir, timeout: 120000, stdio: "pipe" });
  try {
    const output = join(dir, "pass.json");
    run(["--html", join(fixtures, "gencreator-pass.html"), "--brand", "gencreator", "--ready-selector", "h1", "--commit", sha, "--output", output]);
    const receipt = JSON.parse(readFileSync(output, "utf8"));
    assert.equal(receipt.schema_version, "starlight.visual_qa_gate.v1");
    assert.equal(receipt.verdict, "PASS");
    assert.equal(receipt.source_commit_sha, sha);
    assert.match(receipt.input.html_sha256, /^[0-9a-f]{64}$/u);
    assert.throws(() => run(["--html", join(fixtures, "gencreator-pass.html"), "--brand", "gencreator", "--ready-selector", "h1", "--commit", sha, "--output", output]), (e) => e.status === 2, "never overwrites a receipt");
    const packPath = join(dir, "pack.json");
    writeFileSync(packPath, JSON.stringify(gencreator));
    const rejected = join(dir, "rejected.json");
    assert.throws(() => run(["--html", join(fixtures, "low-contrast.html"), "--brand-pack", packPath, "--ready-selector", "h1", "--commit", sha, "--output", rejected]), (e) => e.status === 1);
    assert.equal(JSON.parse(readFileSync(rejected, "utf8")).verdict, "REVISE");
    assert.throws(() => run(["--html", join(fixtures, "gencreator-pass.html"), "--brand", "nope", "--ready-selector", "h1", "--commit", sha]), (e) => e.status === 2);
    assert.throws(() => run(["--html", join(fixtures, "gencreator-pass.html"), "--brand", "gencreator", "--ready-selector", "h1", "--commit", "HEAD"]), (e) => e.status === 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

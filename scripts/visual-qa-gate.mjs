#!/usr/bin/env node
// Reusable visual QA gate: horizontal overflow, WCAG AA text contrast and brand-pack conformance at
// 375 / 768 / 1440 CSS px, each with and without reduced motion.
//
// The brand pack is validated against brand-image-system/runtime/schemas/brand-pack.schema.json and,
// when present, its material foundations against schemas/starlight-foundations.schema.json before any
// page is opened; an invalid declaration is a configuration error (exit 2), not a visual verdict.
//
// Usage (from any repository, with this repository checked out beside it or vendored):
//   node <sdi>/scripts/visual-qa-gate.mjs --url http://127.0.0.1:3000/ --brand gencreator \
//     --ready-selector main --commit "$(git rev-parse HEAD)" [--output receipt.json] [--interface-foundations]
//   node <sdi>/scripts/visual-qa-gate.mjs --html dist/index.html --brand-pack ./brand-pack.json ...
// Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to reuse a preinstalled Chromium.
// Exit codes: 0 PASS, 1 REVISE (findings), 2 configuration or navigation error, 3 visual inspection required.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { inspectVisualQa } from "./inspect-visual-qa.mjs";
import { inspectInterfaceFoundations } from "./inspect-interface-foundations.mjs";
import { hashRenderedDom } from "./validate-interface-foundations.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const VIEWPORTS = Object.freeze([
  Object.freeze({ width: 375, height: 812 }),
  Object.freeze({ width: 768, height: 1024 }),
  Object.freeze({ width: 1440, height: 900 })
]);
export const REDUCED_MOTION = Object.freeze(["no-preference", "reduce"]);
const BRAND_SCHEMA = "brand-image-system/runtime/schemas/brand-pack.schema.json";
const FOUNDATIONS_SCHEMA = "schemas/starlight-foundations.schema.json";
const BRAND_ID = /^[a-z0-9][a-z0-9-]*$/u;
const HEX6 = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu;

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const channel = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};
const luminance = (hex) => { const [r, g, b] = rgb(hex).map(channel); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** WCAG 2.x contrast ratio between two opaque hex colours. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every ordered-insensitive token pair with its ratio and AA eligibility. */
export function tokenContrastMatrix(colors) {
  const names = Object.keys(colors);
  const pairs = [];
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const value = contrastRatio(colors[names[i]], colors[names[j]]);
      pairs.push({ a: names[i], b: names[j], ratio: Number(value.toFixed(2)), aa_normal: value >= 4.5, aa_large: value >= 3 });
    }
  }
  return pairs.sort((x, y) => y.ratio - x.ratio);
}

let ajv;
function validator(root, path) {
  ajv ??= addFormats(new Ajv2020({ allErrors: true, strict: false }));
  const schema = readJson(join(root, path));
  return ajv.getSchema(schema.$id ?? path) ?? ajv.compile(schema);
}

/**
 * Resolve and validate a declared brand pack. Accepts a brand id in this repository, a path, or an
 * already-parsed object. Returns the browser-side brand contract plus static token findings.
 */
export function loadBrandPack({ brand, brandPack, foundations, root = ROOT } = {}) {
  let pack = brandPack;
  let source;
  if (typeof pack === "string") { source = resolve(pack); pack = readJson(source); }
  if (!pack) {
    if (!BRAND_ID.test(String(brand ?? ""))) throw new Error(`invalid brand id: ${brand}`);
    source = join(root, "brand-image-system/runtime/brands", brand, "brand-pack.json");
    if (!existsSync(source)) throw new Error(`unknown brand pack: ${brand}`);
    pack = readJson(source);
  }
  const validate = validator(root, BRAND_SCHEMA);
  if (!validate(pack)) {
    throw new Error(`brand pack fails ${BRAND_SCHEMA}: ${validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ")}`);
  }
  const colors = pack.visual?.colors ?? {};
  for (const [name, value] of Object.entries(colors)) {
    if (!HEX6.test(value)) throw new Error(`brand pack colour ${name} must be an opaque hex value, got ${value}`);
  }
  if (!Object.keys(colors).length) throw new Error(`brand pack ${pack.brandId} declares no visual.colors`);

  let tokens = foundations;
  const foundationsPath = join(root, "brand-packs", pack.brandId, "foundations/tokens.json");
  if (tokens === undefined && existsSync(foundationsPath)) tokens = readJson(foundationsPath);
  if (typeof tokens === "string") tokens = readJson(resolve(tokens));
  if (tokens) {
    const validateTokens = validator(root, FOUNDATIONS_SCHEMA);
    if (!validateTokens(tokens)) {
      throw new Error(`foundations fail ${FOUNDATIONS_SCHEMA}: ${validateTokens.errors.map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ")}`);
    }
  }

  const roles = pack.visual.colorRoles ?? {};
  const canvasRole = roles.background ?? roles.canvas;
  const textRole = roles.text ?? roles.foreground;
  const matrix = tokenContrastMatrix(colors);
  const findings = [];
  for (const [role, name] of [["canvas", canvasRole], ["text", textRole]]) {
    if (name && !colors[name]) findings.push({ code: "brand-role-undefined", message: `colorRoles ${role} names "${name}", which is not in visual.colors.` });
  }
  if (canvasRole && textRole && colors[canvasRole] && colors[textRole]) {
    const value = contrastRatio(colors[canvasRole], colors[textRole]);
    if (value < 4.5) findings.push({ code: "brand-token-contrast", message: `Declared text "${textRole}" on canvas "${canvasRole}" is ${value.toFixed(2)}:1, below WCAG AA 4.5:1.` });
  } else if (!matrix.some((pair) => pair.aa_normal)) {
    findings.push({ code: "brand-token-contrast", message: "No pair of brand colour tokens reaches WCAG AA 4.5:1 for body text." });
  }
  return {
    pack, source: source ?? "inline",
    contract: {
      brandId: pack.brandId, palette: colors, canvasRole, textRole,
      readingFamily: pack.visual.typography?.readingFamily, limits: tokens?.limits
    },
    tokenContrast: matrix, findings
  };
}

/**
 * Launch headless Chromium. PLAYWRIGHT_CHROMIUM_EXECUTABLE points at a preinstalled browser when the
 * pinned Playwright build's own download is absent (sandboxes, consumer repos with another pin).
 */
export async function launchChromium() {
  const { chromium } = await import("playwright");
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
  return chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
}

/** Run the gate against a URL or an HTML string with an already-launched Playwright browser. */
export async function runVisualQaGate({
  browser, url, html, readySelector = "body", brand, brandPack, foundations, root = ROOT,
  viewports = VIEWPORTS, reducedMotion = REDUCED_MOTION, interfaceFoundations = false
}) {
  if (Boolean(url) === Boolean(html)) throw new Error("Provide exactly one of url or html.");
  const declared = loadBrandPack({ brand, brandPack, foundations, root });
  const samples = [];
  for (const viewport of viewports) {
    for (const motion of reducedMotion) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: motion });
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.setDefaultNavigationTimeout(20000);
        if (url) {
          const response = await page.goto(url, { waitUntil: "domcontentloaded" });
          if (!response?.ok()) throw new Error(`Navigation failed with HTTP ${response?.status() ?? "unknown"}`);
        } else {
          await page.setContent(html, { waitUntil: "domcontentloaded" });
        }
        await page.locator(readySelector).first().waitFor({ state: "visible" });
        await page.waitForFunction(() => document.fonts.status === "loaded");
        const result = await page.evaluate(inspectVisualQa, declared.contract);
        if (interfaceFoundations) {
          const extra = await page.evaluate(inspectInterfaceFoundations);
          result.failures.push(...extra.failures.filter((f) => f.code !== "horizontal-overflow"));
          result.complete &&= extra.complete;
        }
        samples.push({ viewport, reduced_motion: motion, resolved_url: page.url(), ...await hashRenderedDom(page), ...result });
      } finally {
        await context.close();
      }
    }
  }
  const expected = viewports.length * reducedMotion.length;
  const passed = !declared.findings.length && samples.length === expected &&
    samples.every((sample) => sample.complete && !sample.failures.length);
  const requiresReview = samples.some((sample) => sample.unresolved.length > 0);
  let verdict = "REVISE";
  if (passed) verdict = requiresReview ? "REVIEW" : "PASS";
  return {
    verdict,
    brand: {
      brand_id: declared.contract.brandId, source: declared.source,
      canvas_role: declared.contract.canvasRole ?? null, text_role: declared.contract.textRole ?? null,
      reading_family: declared.contract.readingFamily ?? null, limits: declared.contract.limits ?? null,
      token_findings: declared.findings, token_contrast: declared.tokenContrast
    },
    samples
  };
}

/** Collapse samples into one line per failure code for terminal output. */
export function summarize(report) {
  const counts = new Map();
  for (const finding of report.brand.token_findings) counts.set(finding.code, (counts.get(finding.code) ?? 0) + 1);
  for (const sample of report.samples) {
    for (const finding of sample.failures) {
      const key = `${finding.code} @${sample.viewport.width}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const unresolved = report.samples.reduce((n, s) => n + s.unresolved.length, 0);
  return [`Visual QA ${report.verdict} for ${report.brand.brand_id} (${report.samples.length} samples, ${unresolved} unresolved contrast measurements)`,
    ...[...counts].map(([key, n]) => `  ${key}: ${n}`)].join("\n");
}

async function main() {
  const { values } = parseArgs({ options: {
    url: { type: "string" }, html: { type: "string" },
    brand: { type: "string" }, "brand-pack": { type: "string" }, foundations: { type: "string" },
    "ready-selector": { type: "string" }, commit: { type: "string" }, output: { type: "string" },
    "interface-foundations": { type: "boolean" }, help: { type: "boolean" }
  } });
  if (values.help) {
    console.log("Usage: node scripts/visual-qa-gate.mjs (--url URL | --html FILE) (--brand ID | --brand-pack FILE) --ready-selector CSS --commit FULL_SHA [--foundations FILE] [--output FILE] [--interface-foundations]");
    return;
  }
  if (Boolean(values.url) === Boolean(values.html)) throw new Error("Provide exactly one of --url or --html.");
  if (Boolean(values.brand) === Boolean(values["brand-pack"])) throw new Error("Provide exactly one of --brand or --brand-pack.");
  if (!values["ready-selector"] || !/^[0-9a-f]{40}$/u.test(values.commit ?? "")) {
    throw new Error("Provide a visible --ready-selector and a full lowercase --commit SHA.");
  }
  if (values.url) {
    const parsed = new URL(values.url);
    if (!/^https?:$/u.test(parsed.protocol) || parsed.username || parsed.password) throw new Error("Only HTTP(S) URLs without embedded credentials are supported.");
  }
  if (values.output && existsSync(resolve(values.output))) throw new Error("Output already exists; choose a new receipt path.");
  const html = values.html ? readFileSync(resolve(values.html), "utf8") : undefined;
  const browser = await launchChromium();
  try {
    const result = await runVisualQaGate({
      browser, url: values.url, html, readySelector: values["ready-selector"],
      brand: values.brand, brandPack: values["brand-pack"], foundations: values.foundations,
      interfaceFoundations: values["interface-foundations"]
    });
    const report = {
      schema_version: "starlight.visual_qa_gate.v1",
      source_commit_sha: values.commit,
      source_binding: "caller-supplied; deployment identity must be verified separately",
      inspected_at: new Date().toISOString(),
      input: values.url ? { url: values.url } : { html_sha256: createHash("sha256").update(html).digest("hex") },
      ready_selector: values["ready-selector"],
      viewports: VIEWPORTS, reduced_motion: REDUCED_MOTION,
      ...result
    };
    const serialized = `${JSON.stringify(report, null, 2)}\n`;
    if (values.output) writeFileSync(resolve(values.output), serialized, { flag: "wx" });
    else process.stdout.write(serialized);
    console.error(summarize(report));
    process.exitCode = { PASS: 0, REVISE: 1, REVIEW: 3 }[report.verdict];
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Visual QA gate failed: ${error.message}`);
    process.exitCode = 2;
  });
}

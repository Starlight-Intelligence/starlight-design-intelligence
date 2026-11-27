#!/usr/bin/env node
/**
 * Render the deterministic InfoGenius benchmark specs with the existing compiler.
 * Provider: none. Cost: 0. Time: measured with performance.now() around each compile.
 *   node scripts/render-infogenius-benchmark.mjs [--out <dir>] [--check]
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { compileDiagramSvg, SUPPORTED_THEMES } from "./compile-brand-diagrams.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BENCH = join(ROOT, "benchmarks", "infogenius");

/** All briefs from briefs.json, split by deterministic_render. Single source for counts and lists. */
export function loadBriefs() {
  const { briefs } = JSON.parse(readFileSync(join(BENCH, "briefs.json"), "utf8"));
  return { all: briefs, rendered: briefs.filter((b) => b.deterministic_render === true), notRendered: briefs.filter((b) => b.deterministic_render !== true) };
}

export function renderBenchmark({ outDir = join(BENCH, "renders"), write = true } = {}) {
  const rows = [];
  for (const brief of loadBriefs().rendered) {
    const spec = JSON.parse(readFileSync(join(ROOT, brief.spec), "utf8"));
    for (const theme of SUPPORTED_THEMES) {
      const t0 = performance.now();
      const out = compileDiagramSvg(spec, { theme, rootDir: ROOT, strict: true });
      const ms = performance.now() - t0;
      const file = `${spec.id}.${theme}.svg`;
      if (write) {
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, file), out.svg, "utf8");
      }
      rows.push({
        brief: brief.n, id: spec.id, brand: spec.brand, archetype: spec.archetype, theme, file,
        provider: "none", cost_usd: 0, time_ms: Number(ms.toFixed(2)),
        min_contrast: out.minContrastRatio, overflow: out.overflowChecks.filter((o) => !o.passed).length,
        sha256: out.sha256, review: "pending", svg: out.svg
      });
    }
  }
  return rows;
}

/**
 * Compare each freshly compiled SVG byte for byte with the committed file; return one message per problem.
 * Also names every file in the renders dir (and the previews dir when given) that no current spec produces:
 * an orphan from a removed spec or a stale name from a renamed one. Previews are expected as <render>.png.
 */
export function checkRenders(rows, outDir, previewsDir = null) {
  const problems = [];
  for (const r of rows) {
    const path = join(outDir, r.file);
    if (!existsSync(path)) { problems.push(`missing render: ${r.file}`); continue; }
    if (!readFileSync(path).equals(Buffer.from(r.svg, "utf8"))) problems.push(`render differs from fresh compile: ${r.file}`);
  }
  const orphans = (dir, expected, kind) => {
    if (!dir || !existsSync(dir)) return;
    for (const f of readdirSync(dir).filter((f) => !f.startsWith(".")).sort()) if (!expected.has(f)) problems.push(`orphan or stale ${kind} no current spec produces: ${join(relative(ROOT, dir), f)}`);
  };
  orphans(outDir, new Set(rows.map((r) => r.file)), "render");
  orphans(previewsDir, new Set(rows.map((r) => r.file.replace(/\.svg$/, ".png"))), "preview");
  return problems;
}

export function previewsMarkdown(dir = join(BENCH, "previews")) {
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".png")).sort() : [];
  if (!files.length) return "## Previews\n\nNo previews rendered. Run `node scripts/render-infogenius-previews.mjs` (resvg via npx).\n";
  const lines = files.map((f) => `- \`previews/${f}\` (${statSync(join(dir, f)).size} bytes)`);
  return `## Previews\n\nPNG, 1600 px wide, rendered from the committed SVGs by \`node scripts/render-infogenius-previews.mjs\` (\`npx --yes @resvg/resvg-js-cli --fit-width 1600 <svg> <png>\`). Each is under 400 KB. Review aids only; PNG bytes depend on installed fonts, the SVG is the deterministic artifact. Nothing here is approved.\n\n${lines.join("\n")}\n`;
}

export function resultsMarkdown(rows, meta) {
  const { all, rendered, notRendered } = loadBriefs();
  const fromRows = [...new Set(rows.map((r) => r.brief))].sort((a, b) => a - b);
  if (fromRows.join() !== rendered.map((b) => b.n).sort((a, b) => a - b).join()) throw new Error(`rows cover briefs ${fromRows} but briefs.json marks ${rendered.map((b) => b.n)} deterministic_render`);
  const head = "| Brief | Brand | Archetype | Theme | Provider | Cost USD | Time ms | Min contrast | Overflow | SHA-256 (12) | Review |\n|---|---|---|---|---|---|---|---|---|---|---|";
  const body = rows.map((r) => `| ${r.brief} | ${r.brand} | ${r.archetype} | ${r.theme} | ${r.provider} | ${r.cost_usd} | ${r.time_ms} | ${r.min_contrast}:1 | ${r.overflow} | ${r.sha256.slice(0, 12)} | ${r.review} |`).join("\n");
  const why = notRendered.map((b) => `- Brief ${b.n} (${b.title}): ${b.not_rendered_reason ?? b.note}`).join("\n");
  return `# InfoGenius benchmark results\n\nGenerated by \`node scripts/render-infogenius-benchmark.mjs\` on ${meta.date} (node ${meta.node}). Provider none, cost zero. Time is wall-clock for one in-process compile on this machine and varies run to run; hashes do not.\n\nBriefs rendered (${rendered.length} of ${all.length}): ${fromRows.join(", ")}. Defined, not rendered (${notRendered.length}): ${notRendered.map((b) => b.n).join(", ")}.\n\n${head}\n${body}\n\n\`Review: pending\` means no independent reviewer has scored the render; a maker's own check is not approval (see RUBRIC.md). Round 3 changes are unreviewed; no render is approved.\n\n## Not rendered, and why\n\n${why}\n\n${previewsMarkdown()}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const oi = args.indexOf("--out");
  const outDir = oi >= 0 ? resolve(args[oi + 1]) : join(BENCH, "renders");
  const pi = args.indexOf("--previews");
  const previewsDir = pi >= 0 ? resolve(args[pi + 1]) : oi >= 0 ? null : join(BENCH, "previews");
  const rows = renderBenchmark({ outDir, write: !check });
  if (check) {
    const problems = checkRenders(rows, outDir, previewsDir);
    if (problems.length) { for (const p of problems) console.error(p); process.exit(1); }
    const briefCount = new Set(rows.map((r) => r.brief)).size;
    console.log(`Verified ${rows.length} renders byte-identical to a fresh in-memory compile (${briefCount} briefs x ${SUPPORTED_THEMES.length} themes; briefs ${[...new Set(rows.map((r) => r.brief))].join(", ")})${previewsDir ? "; no orphan renders or previews" : "; no orphan renders"}`);
  } else {
    const date = new Date().toISOString().slice(0, 10);
    writeFileSync(join(BENCH, "RESULTS.md"), resultsMarkdown(rows, { date, node: process.version }), "utf8");
    writeFileSync(join(BENCH, "results.json"), JSON.stringify({ date, node: process.version, rows: rows.map(({ svg, ...r }) => r) }, null, 2) + "\n", "utf8");
    console.log(resultsMarkdown(rows, { date, node: process.version }));
  }
}

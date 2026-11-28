#!/usr/bin/env node
/**
 * Rasterise the committed benchmark SVGs to 1600 px wide PNG previews with resvg.
 *   node scripts/render-infogenius-previews.mjs [--out <dir>]
 * Command run per file:  npx --yes @resvg/resvg-js-cli --fit-width 1600 <svg> <png>
 * Previews are review aids only: PNG bytes depend on the installed fonts and resvg version,
 * so they are not compared byte for byte. The SVG is the deterministic artifact.
 * On any failure this prints the exact failed command and exits non-zero; it never writes a placeholder.
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "benchmarks", "infogenius", "renders");
export const MAX_PREVIEW_BYTES = 400 * 1024;
const oi = process.argv.indexOf("--out");
const OUT = oi >= 0 ? resolve(process.argv[oi + 1]) : join(ROOT, "benchmarks", "infogenius", "previews");
mkdirSync(OUT, { recursive: true });

let failed = 0;
for (const f of readdirSync(SRC).filter((x) => x.endsWith(".svg")).sort()) {
  const png = join(OUT, f.replace(/\.svg$/, ".png"));
  const args = ["--yes", "@resvg/resvg-js-cli", "--fit-width", "1600", join(SRC, f), png];
  const r = spawnSync("npx", args, { encoding: "utf8", timeout: 120000 });
  const cmd = `npx ${args.join(" ")}`;
  if (r.status !== 0) { console.error(`FAILED (exit ${r.status}): ${cmd}\n${r.stderr}`); failed++; continue; }
  const size = statSync(png).size;
  if (size > MAX_PREVIEW_BYTES) { console.error(`TOO LARGE (${size} bytes > ${MAX_PREVIEW_BYTES}): ${png}`); failed++; continue; }
  console.log(`${f.replace(/\.svg$/, ".png")} ${size} bytes`);
}
process.exit(failed ? 1 : 0);

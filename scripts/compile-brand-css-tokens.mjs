#!/usr/bin/env node
// Compile brand-pack JSON into deterministic CSS custom properties for owning web repositories.
//
// Sources (read-only):
//   brand-image-system/runtime/brands/<id>/brand-pack.json  -> colours, colour roles, type families
//   brand-packs/<id>/foundations/tokens.json (optional)     -> material tokens and limits (glass, depth, motion)
//
// Output is one CSS file per brand, scoped to `[data-brand="<id>"]` with a Tailwind v4 `@theme inline`
// bridge. Material utilities are emitted only for brands with a foundations file, so a paper/ink
// editorial territory never inherits glass by accident. Output carries input hashes and no timestamps,
// so a re-run on the same sources is byte-identical and `--check` can fail CI on drift.
//
// Usage:
//   node scripts/compile-brand-css-tokens.mjs --brand gencreator --stdout
//   node scripts/compile-brand-css-tokens.mjs --all --out dist/brand-css
//   node scripts/compile-brand-css-tokens.mjs --all --out dist/brand-css --check
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BRANDS_DIR = "brand-image-system/runtime/brands";

const BRAND_ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// Values are copied into CSS; refuse anything that could close a declaration or block.
const SAFE_VALUE = /^[^;{}<>\\]*$/;

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
const sha256 = (text) => createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex");
const sorted = (obj) => Object.keys(obj ?? {}).sort().map((k) => [k, obj[k]]);
const quoteFamily = (f) => `"${String(f).replace(/"/g, "")}"`;

function assertBrandId(id) {
  const s = String(id ?? "");
  if (!BRAND_ID_RE.test(s)) throw new Error(`invalid brand id: ${id}`);
  return s;
}

function assertCommentSafe(brand, name, value) {
  const s = String(value ?? "");
  if (/\/\*|\*\/|[\r\n]/.test(s)) throw new Error(`${brand}: unsafe CSS comment text for ${name}`);
  return s;
}

export function listBrands(root = ROOT) {
  const dir = join(root, BRANDS_DIR);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && BRAND_ID_RE.test(d.name) && existsSync(join(dir, d.name, "brand-pack.json")))
    .map((d) => d.name)
    .sort();
}

export function loadBrand(id, root = ROOT) {
  const safeId = assertBrandId(id);
  const packPath = `${BRANDS_DIR}/${safeId}/brand-pack.json`;
  const packText = readFileSync(join(root, packPath), "utf8");
  const foundationsPath = `brand-packs/${safeId}/foundations/tokens.json`;
  const foundationsText = existsSync(join(root, foundationsPath)) ? readFileSync(join(root, foundationsPath), "utf8") : null;
  return {
    id: safeId,
    pack: JSON.parse(packText),
    foundations: foundationsText ? JSON.parse(foundationsText) : null,
    sources: [
      { path: packPath, sha256: sha256(packText) },
      ...(foundationsText ? [{ path: foundationsPath, sha256: sha256(foundationsText) }] : []),
    ],
  };
}

function assertValue(brand, name, value) {
  if (!SAFE_VALUE.test(String(value))) throw new Error(`${brand}: unsafe CSS value for ${name}`);
  return String(value);
}

export function compileBrand({ id, pack, foundations, sources }) {
  assertBrandId(id);
  if (pack.brandId !== id) throw new Error(`${id}: brand-pack brandId is ${pack.brandId}`);
  const colors = pack.visual?.colors ?? {};
  const roles = pack.visual?.colorRoles ?? {};
  const type = pack.visual?.typography ?? {};
  if (!Object.keys(colors).length) throw new Error(`${id}: brand-pack has no visual.colors`);

  const decls = [];
  for (const [name, hex] of sorted(colors)) {
    if (!HEX.test(hex)) throw new Error(`${id}: colour ${name} is not a hex value (${hex})`);
    decls.push([`--brand-color-${kebab(name)}`, hex.toLowerCase()]);
  }
  for (const [role, colorName] of sorted(roles)) {
    if (!(colorName in colors)) throw new Error(`${id}: colour role ${role} points at unknown colour ${colorName}`);
    decls.push([`--brand-role-${kebab(role)}`, `var(--brand-color-${kebab(colorName)})`]);
  }
  if (type.displayFamily) decls.push(["--brand-font-display", `${quoteFamily(assertValue(id, "displayFamily", type.displayFamily))}, ui-serif, Georgia, serif`]);
  if (type.readingFamily) decls.push(["--brand-font-reading", `${quoteFamily(assertValue(id, "readingFamily", type.readingFamily))}, ui-sans-serif, system-ui, sans-serif`]);

  const material = [];
  const limits = foundations?.limits ?? {};
  if (foundations?.css) {
    for (const [name, value] of sorted(foundations.css)) {
      if (!/^--sl-[a-z0-9-]+$/.test(name)) throw new Error(`${id}: foundations css key ${name} is outside the --sl- namespace`);
      material.push([name, assertValue(id, name, value)]);
    }
  }

  const theme = [
    ...sorted(colors).map(([name]) => [`--color-brand-${kebab(name)}`, `var(--brand-color-${kebab(name)})`]),
    ...sorted(roles).map(([role]) => [`--color-brand-${kebab(role)}`, `var(--brand-role-${kebab(role)})`]),
    ...(type.displayFamily ? [["--font-brand-display", "var(--brand-font-display)"]] : []),
    ...(type.readingFamily ? [["--font-brand-reading", "var(--brand-font-reading)"]] : []),
  ];

  const block = (selector, rows, indent = "") =>
    `${indent}${selector} {\n${rows.map(([k, v]) => `${indent}  ${k}: ${v};`).join("\n")}\n${indent}}`;

  const out = [
    `/* GENERATED by starlight-design-intelligence/scripts/compile-brand-css-tokens.mjs — do not edit. */`,
    `/* brand: ${id} (${assertCommentSafe(id, "displayName", pack.displayName ?? id)}) */`,
    ...sources.map((s) => `/* source: ${assertCommentSafe(id, "source", s.path)} sha256:${s.sha256} */`),
    `/* Adoption needs an owning-repository pin change and application QA. */`,
    "",
    block(`:root[data-brand="${id}"], [data-brand="${id}"]`, [...decls, ...material]),
    "",
    block("@theme inline", theme),
  ];

  if (material.length) {
    const maxSurfaces = Number(limits.maxVisibleBackdropSurfaces ?? 2);
    out.push(
      "",
      `/* Material utilities. Limit: ${maxSurfaces} visible backdrop surfaces per view; nested backdrops ${limits.allowNestedBackdrop ? "allowed" : "not allowed"}. */`,
      `[data-brand="${id}"] .sl-surface {`,
      `  border-radius: var(--sl-radius-panel, 24px);`,
      `  border: var(--sl-rim-width, 1px) solid color-mix(in srgb, currentColor 14%, transparent);`,
      `  box-shadow: var(--sl-depth-raised, none);`,
      `}`,
      `@supports (backdrop-filter: blur(1px)) {`,
      `  [data-brand="${id}"] .sl-surface--glass {`,
      `    background: color-mix(in srgb, Canvas 8%, transparent);`,
      `    backdrop-filter: blur(var(--sl-glass-blur, 18px)) saturate(var(--sl-glass-saturation, 115%));`,
      `  }`,
      ...(limits.allowNestedBackdrop ? [] : [`  [data-brand="${id}"] .sl-surface--glass .sl-surface--glass { backdrop-filter: none; }`]),
      `}`,
      `@media (prefers-reduced-motion: reduce) {`,
      `  [data-brand="${id}"] .sl-surface, [data-brand="${id}"] .sl-surface * { transition: none !important; animation: none !important; }`,
      `}`,
      `@media (forced-colors: active) {`,
      `  [data-brand="${id}"] .sl-surface { background: Canvas; color: CanvasText; border-color: CanvasText; backdrop-filter: none; box-shadow: none; }`,
      `}`,
    );
  }
  return out.join("\n") + "\n";
}

export function main(argv, { root = ROOT, log = console.log, error = console.error } = {}) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const checkMode = argv.includes("--check");
  const stdoutMode = argv.includes("--stdout");
  const outDir = arg("--out");
  if (checkMode && (!outDir || stdoutMode)) {
    error("usage: --check requires --out <dir> and cannot be combined with --stdout");
    return 2;
  }
  const brands = argv.includes("--all") ? listBrands(root) : arg("--brand") ? [arg("--brand")] : [];
  if (!brands.length) { error("usage: --brand <id> | --all  [--out <dir>] [--stdout] [--check]"); return 2; }
  let drift = 0;
  for (const rawId of brands) {
    const id = assertBrandId(rawId);
    const css = compileBrand(loadBrand(id, root));
    if (stdoutMode || !outDir) { log(css); continue; }
    const resolvedOut = resolve(outDir);
    const file = resolve(resolvedOut, `brand-tokens.${id}.css`);
    const rel = relative(resolvedOut, file);
    if (!rel || rel.startsWith("..") || isAbsolute(rel) || dirname(file) !== resolvedOut) {
      throw new Error(`output path escapes --out: ${file}`);
    }
    if (checkMode) {
      const current = existsSync(file) ? readFileSync(file, "utf8").replace(/\r\n/g, "\n") : null;
      if (current !== css) { error(`drift: ${file}`); drift += 1; }
    } else {
      mkdirSync(dirname(file), { recursive: true });
      // The lexical check above cannot see a symlink already sitting at the output file; writeFileSync would follow it.
      if (lstatSync(file, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new Error(`refusing to write through a symlink: ${file}`);
      }
      writeFileSync(file, css);
      log(`wrote ${file}`);
    }
  }
  return drift ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}

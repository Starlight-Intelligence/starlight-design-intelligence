#!/usr/bin/env node
// Audit a brand repository for TRUTH.md void claims, anti-slop voice drift, banned brand phrases,
// and next-gen landing product-sense basics (h1, CTA, proof signal, /llms.txt agent discovery).
//
// Usage:
//   node scripts/check-portfolio-truth-and-sense.mjs --dir <path> --brand <id> [--mode landing|content] [--strict] [--json]
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lintFrankxVoice } from "./check-frankx-voice.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const WEB_ROOT_DIRS = ["app", "src", "pages", "components", "content", "public"];
const SKIP_DIRS = new Set([
  ".git", ".next", ".turbo", ".vercel", ".worktrees", "node_modules", "dist", "build", "coverage",
]);
// Skip internal tooling, agent prompts, docs, tests, quarantined drafts and fixtures; focus on customer-facing surfaces.
const SKIP_PATH_RE = /(^|\/)(docs|ops|scripts|supabase|migrations|handovers|packages|brand|archive|fixtures?|tests?|__tests__|brand-packs|_quarantine)\/|\.(test|spec)\.[a-z0-9]+$/i;
const ROOT_INTERNAL_MD = /^(CLAUDE|AGENTS|README|CONTRIBUTING|SECURITY|TRUTH|BUILD-LOG|BLOCKERS|CHANGELOG|progress|design[-a-z]*|SPEC|PRD)\.md$/i;
const NEGATION_RE = /\b(no|not|never|without|neither|nor|void)\b/i;

const VOID_RULES = [
  {
    id: "void-claim:nonexistent-bv",
    severity: "error",
    re: /\b(Starlight Holding B\.?V\.?|Arcanea(?:\s*\(IP\))?\s+B\.?V\.?|FrankX Operations B\.?V\.?|FrankX B\.?V\.?)\b/gi,
    why: "No BV exists (TRUTH.md §1): legal entity is an eenmanszaak (Starlight Intelligence).",
  },
  {
    id: "void-claim:consulting-or-1on1",
    severity: "error",
    re: /\b(book a 1[:/\s]1|quarterly 1[:/\s]1|1[:/\s]1 (?:advisory|with|call|session|coaching)|hourly consulting|consulting retainer|book a discovery call|retainer availability|inner circle advisory)\b/gi,
    why: "Consulting and 1:1 retainers are VOID per TRUTH.md §1 & §4 (scalable digital products & fixed-scope systems only).",
  },
];

function walkFiles(dir, rootDir = dir, out = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const restrictTop = rootDir === dir && entries.some((e) => e.isDirectory() && WEB_ROOT_DIRS.includes(e.name));
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    if (restrictTop && entry.isDirectory() && !WEB_ROOT_DIRS.includes(entry.name)) continue;
    if (restrictTop && entry.isFile() && !/^index\.html?$/i.test(entry.name)) continue;
    const full = join(dir, entry.name);
    const rel = relative(rootDir, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      walkFiles(full, rootDir, out);
    } else if (/\.(tsx|ts|jsx|js|mdx|md|html)$/i.test(entry.name) && !SKIP_PATH_RE.test(rel)) {
      out.push({ full, rel });
    }
  }
  return out;
}

function visibleCopyFromHtml(source) {
  return source
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

// Extract human-visible text from TSX/JSX while dropping imports, URLs, and type syntax cleanly.
function visibleCopyFromCode(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  return lines.map((line) => {
    const trimmed = line.trim();
    if (/^(import|export type|type |interface )/.test(trimmed)) return "";
    if (/^(\/\/|\/\*|\*)/.test(trimmed)) return "";
    const parts = [];
    for (const m of line.matchAll(/>\s*([^<{][^<{]*?)\s*</g)) parts.push(m[1]);
    for (const m of line.matchAll(/(?:title|description|subtitle|body|summary|label|headline|cta|alt|placeholder|aria-label)\s*[:=]\s*["'`]([^"'`]{4,})["'`]/gi)) {
      parts.push(m[1]);
    }
    return parts.join(" ");
  }).join("\n");
}

function loadBrandConfig(brand, sdiRoot = ROOT) {
  const packFile = join(sdiRoot, "brand-image-system", "runtime", "brands", brand, "brand-pack.json");
  if (!existsSync(packFile)) return { bannedPhrases: [] };
  const pack = JSON.parse(readFileSync(packFile, "utf8"));
  return { bannedPhrases: Array.isArray(pack.voice?.bannedPhrases) ? pack.voice.bannedPhrases : [] };
}

function resolveHomepageBundle(targetDir) {
  const candidates = [
    "app/page.tsx", "src/app/page.tsx", "app/(marketing)/page.tsx", "src/pages/index.tsx", "index.html",
  ];
  const entry = candidates.map((p) => join(targetDir, p)).find((p) => existsSync(p));
  if (!entry) return { entry: null, sources: [] };
  const sources = [{ path: relative(targetDir, entry).replace(/\\/g, "/"), text: readFileSync(entry, "utf8") }];
  const dir = dirname(entry);
  for (const m of sources[0].text.matchAll(/from\s+["']([^"']+)["']/g)) {
    const spec = m[1];
    const base = spec.startsWith("@/")
      ? join(existsSync(join(targetDir, "src")) ? join(targetDir, "src") : targetDir, spec.slice(2))
      : spec.startsWith(".") ? resolve(dir, spec) : null;
    if (!base) continue;
    for (const ext of ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"]) {
      const candidate = base + ext;
      if (existsSync(candidate) && /\.(tsx|ts|jsx|js)$/i.test(candidate)) {
        sources.push({ path: relative(targetDir, candidate).replace(/\\/g, "/"), text: readFileSync(candidate, "utf8") });
        break;
      }
    }
  }
  return { entry: relative(targetDir, entry).replace(/\\/g, "/"), sources };
}

export function auditRepository({ dir, brand = "sis", mode = "landing", strict = false, sdiRoot = ROOT }) {
  const targetDir = resolve(dir);
  const { bannedPhrases } = loadBrandConfig(brand, sdiRoot);
  const findings = [];
  const files = walkFiles(targetDir);

  for (const { full, rel } of files) {
    const raw = readFileSync(full, "utf8").replace(/\r\n/g, "\n");
    const ext = extname(full).toLowerCase();
    const isCodeFile = /\.(tsx|ts|jsx|js)$/i.test(ext);
    const isHtmlFile = /\.html?$/i.test(ext);
    const text = isCodeFile ? visibleCopyFromCode(raw) : isHtmlFile ? visibleCopyFromHtml(raw) : raw;
    const lines = text.split("\n");

    lines.forEach((line, idx) => {
      if (!line.trim()) return;
      for (const vr of VOID_RULES) {
        vr.re.lastIndex = 0;
        let match;
        while ((match = vr.re.exec(line)) !== null) {
          const before = line.slice(Math.max(0, match.index - 64), match.index).split(/[.;:!?]/).pop();
          if (NEGATION_RE.test(before)) continue;
          findings.push({
            rule: vr.id, severity: vr.severity, path: rel, line: idx + 1, excerpt: match[0], why: vr.why,
          });
        }
      }
      for (const phrase of bannedPhrases) {
        if (phrase && line.toLowerCase().includes(phrase.toLowerCase())) {
          findings.push({
            rule: "brand:banned-phrase", severity: "error", path: rel, line: idx + 1,
            excerpt: phrase, why: `Banned phrase in ${brand} brand-pack.json`,
          });
        }
      }
    });

    for (const vf of lintFrankxVoice(text)) {
      if ((vf.rule === "arcanea-diction" || vf.rule === "arcanea-name-check") && brand !== "frankx") continue;
      if (vf.rule === "em-dash" && brand !== "frankx") continue;
      if (isCodeFile && (vf.rule === "unfilled-slot" || vf.rule === "numbered-opener")) continue;
      if (isHtmlFile && vf.rule === "unfilled-slot") continue;
      const sev = vf.rule === "contrast-formula" || vf.rule === "hype-verb" || vf.rule === "stock-phrase" ? "warn" : vf.severity;
      findings.push({
        rule: `voice:${vf.rule}`, severity: strict && sev === "warn" ? "error" : sev,
        path: rel, line: vf.line, excerpt: vf.excerpt, why: vf.why,
      });
    }
  }

  let landing = null;
  if (mode === "landing") {
    const { entry, sources } = resolveHomepageBundle(targetDir);
    const combined = sources.map((s) => s.text).join("\n");
    const hasLlms = [
      "public/llms.txt", "app/llms.txt/route.ts", "app/llms.txt/route.js",
      "src/app/llms.txt/route.ts", "src/app/llms.txt/route.js",
    ].some((p) => existsSync(join(targetDir, p)));
    const layoutText = ["app/layout.tsx", "src/app/layout.tsx"]
      .map((p) => join(targetDir, p)).filter(existsSync).map((p) => readFileSync(p, "utf8")).join("\n");

    const hasH1 = /<h1[\s>]|role=["']heading["'][^>]*aria-level=["']?1["']?/i.test(combined);
    const hasCta = /<(Link|a|button)\b/i.test(combined);
    const hasJsonLd = /application\/ld\+json|<JsonLd\b/i.test(combined + layoutText);
    const hasBrandAttr = new RegExp(`data-brand=["']${brand}["']`, "i").test(combined + layoutText);
    landing = { entry, hasH1, hasCta, hasLlms, hasJsonLd, hasBrandAttr };

    if (!entry) findings.push({ rule: "sense:missing-homepage", severity: "error", path: ".", line: 1, excerpt: "no homepage entry", why: "Landing mode requires app/page.tsx, src/app/page.tsx, or index.html." });
    if (entry && !hasH1) findings.push({ rule: "sense:missing-h1", severity: "error", path: entry, line: 1, excerpt: "<h1>", why: "Homepage bundle must expose a single primary <h1> heading." });
    if (entry && !hasCta) findings.push({ rule: "sense:missing-primary-cta", severity: "error", path: entry, line: 1, excerpt: "CTA", why: "Homepage bundle must provide a primary self-serve link or button action." });
    if (!hasLlms) findings.push({ rule: "sense:missing-llms-txt", severity: "error", path: "public/llms.txt", line: 1, excerpt: "/llms.txt", why: "Flagship sites must expose /llms.txt for AI agent & crawler discovery." });
    if (!hasJsonLd) findings.push({ rule: "sense:missing-structured-data", severity: strict ? "error" : "warn", path: entry ?? ".", line: 1, excerpt: "application/ld+json", why: "Expose schema.org JSON-LD metadata on flagship surfaces." });
  }

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  return { ok: errors.length === 0, brand, mode, scannedFiles: files.length, landing, errors, warnings };
}

export function main(argv, { log = console.log, error = console.error } = {}) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const dir = arg("--dir");
  if (!dir) { error("usage: check-portfolio-truth-and-sense.mjs --dir <path> --brand <id> [--mode landing|content] [--strict] [--json]"); return 2; }
  const brand = arg("--brand") ?? "sis";
  const mode = arg("--mode") ?? "landing";
  const strict = argv.includes("--strict");
  const result = auditRepository({ dir, brand, mode, strict });
  if (argv.includes("--json")) {
    log(JSON.stringify(result, null, 2));
  } else {
    log(`truth-and-sense(${result.brand}, ${result.mode}): files=${result.scannedFiles} errors=${result.errors.length} warnings=${result.warnings.length}`);
    for (const f of [...result.errors, ...result.warnings].slice(0, 25)) {
      log(`  [${f.severity}] ${f.rule} ${f.path}:${f.line} — ${f.excerpt}`);
    }
  }
  return result.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}

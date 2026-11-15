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
const ROOT_INTERNAL_MD = /^(CLAUDE|AGENTS|README|CONTRIBUTING|SECURITY|TRUTH|BUILD-LOG|BLOCKERS|CHANGELOG|HANDOVER[-a-z0-9_]*|progress|design[-a-z]*|SPEC|PRD|TODO|ROADMAP)\.md$/i;
const SUBDIR_INTERNAL_MD = /^(CLAUDE|AGENTS|README|CONTRIBUTING|SECURITY|CHANGELOG)\.md$/i;
const NEGATION_RE = /\b(no|not|never|neither|nor|doesn't|don't|isn't|aren't|won't|can't|cannot)\b/i;
const DIRECT_NEGATION_BRIDGE_RE = /^(?:(?:is|are|was|were|be|exist|exists|there\s+(?:is|are)|offer|offers|offering|offered|provide|provides|providing|provided|sell|sells|selling|sold|accept|accepts|accepting|accepted|run|runs|running|operated\s+by|owned\s+by|managed\s+by|called|named|a|an|the|any|such|further|paid|direct)\s+)*$/i;

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
      if (!rel.includes("/") && ROOT_INTERNAL_MD.test(entry.name)) continue;
      if (SUBDIR_INTERNAL_MD.test(entry.name) && !/^content\//i.test(rel)) continue;
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

function maskNonVisibleCodeLines(source) {
  let masked = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return masked.split("\n").map((line) => {
    const trimmed = line.trim();
    if (/^(import\b|export\s+type\b|type\s+|interface\s+|\/\/)/.test(trimmed)) {
      return "";
    }
    return line;
  }).join("\n");
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function isDirectVoidNegation(line, matchIndex) {
  const clause = line.slice(Math.max(0, matchIndex - 96), matchIndex).split(/[.;:!?\u2014\u2013()]/).pop() ?? "";
  let pos = 0;
  let lastNegEnd = -1;
  const negGlobal = new RegExp(NEGATION_RE.source, "gi");
  let m;
  while ((m = negGlobal.exec(clause)) !== null) {
    lastNegEnd = m.index + m[0].length;
    pos = lastNegEnd;
  }
  if (lastNegEnd < 0) return false;
  let between = clause.slice(lastNegEnd).trim();
  // Strip already-stated void items followed by list separators ("no A or B", "neither A nor B").
  const listItemRe = new RegExp(
    `^(?:${VOID_RULES.map((r) => r.re.source).join("|")})\\s*(?:,|or|nor|\\/)\\s*`,
    "i",
  );
  while (listItemRe.test(between)) {
    between = between.replace(listItemRe, "").trim();
  }
  between = between.replace(/^(?:do|does|did|will|can|would|should)\s+/i, "").trim();
  // Normalize space so regex anchored with trailing spaces matches cleanly.
  const padded = between ? `${between} ` : "";
  if (DIRECT_NEGATION_BRIDGE_RE.test(padded)) return true;
  // Also allow explicit trailing negation directly on the claim ("X does not exist", "X is void").
  return false;
}

function hasTrailingVoidNegation(line, matchEnd) {
  const after = line.slice(matchEnd, Math.min(line.length, matchEnd + 48));
  return /^\s*(?:does\s+not\s+exist|do\s+not\s+exist|(?:is|are)\s+(?:not\b|void\b|nonexistent\b|retired\b))/i.test(after);
}

// Extract human-visible copy from TSX/JSX across single and multi-line tags/props while tracking 1-based line numbers.
function extractVisibleCodeSegments(source) {
  const cleaned = maskNonVisibleCodeLines(source);
  const lines = cleaned.split("\n");
  const segments = [];
  const lineBuckets = lines.map(() => []);

  const pushChunk = (rawChunk, startOffset) => {
    const baseLine = lineNumberAt(cleaned, startOffset);
    const subLines = rawChunk.split("\n");
    const nonEmptyParts = [];
    subLines.forEach((sub, idx) => {
      const normalized = sub.replace(/\s+/g, " ").trim();
      if (normalized) {
        lineBuckets[baseLine - 1 + idx]?.push(normalized);
        nonEmptyParts.push({ text: normalized, line: baseLine + idx });
      }
    });
    if (nonEmptyParts.length > 1) {
      segments.push({
        text: nonEmptyParts.map((p) => p.text).join(" "),
        line: nonEmptyParts[0].line,
        multiline: true,
      });
    }
  };

  // Scan JSX tag closings `>` outside arrow syntax `=>` and capture child text up to the next `<` or `{`.
  let i = 0;
  const n = cleaned.length;
  while (i < n) {
    const ch = cleaned[i];
    if (ch === "<") {
      // Distinguish JSX tags `<tag`, `<>`, `</tag` from TS generics (`foo<T>`) and `<` comparisons.
      const next = cleaned[i + 1] ?? "";
      const prev = i > 0 ? cleaned[i - 1] : "";
      const beforeCtx = cleaned.slice(Math.max(0, i - 16), i);
      const isTsGenericPrefix = /[A-Za-z0-9_$\])]/.test(prev) && !/\b(?:return|else|yield|await|case)\s*$/.test(beforeCtx);
      if (!/[A-Za-z_/>]/.test(next) || isTsGenericPrefix) {
        i += 1;
        continue;
      }
      // Advance past the tag's closing `>`, respecting quoted attrs and `{...}` expressions.
      let j = i + 1;
      let braceDepth = 0;
      let quote = null;
      while (j < n) {
        const c = cleaned[j];
        if (quote) {
          if (c === "\\" && j + 1 < n) { j += 2; continue; }
          if (c === quote) { quote = null; j += 1; continue; }
          j += 1;
          continue;
        }
        if (c === '"' || c === "'" || c === "`") { quote = c; j += 1; continue; }
        if (c === "{") { braceDepth += 1; j += 1; continue; }
        if (c === "}" && braceDepth > 0) { braceDepth -= 1; j += 1; continue; }
        if (c === ">" && braceDepth === 0) {
          const isArrow = cleaned[j - 1] === "=";
          const isSelfClosing = cleaned[j - 1] === "/";
          const tagInner = cleaned.slice(i + 1, j);
          const looksLikeTsTypeArgs = isArrow || (next !== "/" && next !== ">" && /\bextends\b|,\s*[A-Z]/.test(tagInner) && !/=/.test(tagInner));
          j += 1;
          if (!isSelfClosing && next !== "/" && !looksLikeTsTypeArgs) {
            // Read JSX child text until next `<` (and recurse past inline `{...}` spans so text after `{expr}` is kept).
            while (j < n) {
              if (cleaned[j] === "<") break;
              if (cleaned[j] === "{") {
                let d = 1;
                let k = j + 1;
                let q2 = null;
                while (k < n && d > 0) {
                  const kc = cleaned[k];
                  if (q2) {
                    if (kc === "\\" && k + 1 < n) { k += 2; continue; }
                    if (kc === q2) q2 = null;
                    k += 1;
                    continue;
                  }
                  if (kc === '"' || kc === "'" || kc === "`") { q2 = kc; k += 1; continue; }
                  if (kc === "{") d += 1;
                  else if (kc === "}") d -= 1;
                  k += 1;
                }
                // Extract literal string/template props or JSX strings inside `{ "text" }`.
                const exprBody = cleaned.slice(j + 1, k - 1).trim();
                const litMatch = /^["'`]([\s\S]{3,})["'`]$/.exec(exprBody);
                if (litMatch) pushChunk(litMatch[1], j + 2);
                j = k;
                continue;
              }
              const chunkStart = j;
              while (j < n && cleaned[j] !== "<" && cleaned[j] !== "{") j += 1;
              pushChunk(cleaned.slice(chunkStart, j), chunkStart);
            }
          }
          break;
        }
        j += 1;
      }
      i = j;
      continue;
    }
    i += 1;
  }

  // Also capture explicit copy-bearing prop/object fields across single and multi-line quotes.
  const copyPropRe = /(?:title|description|subtitle|body|summary|label|headline|cta|alt|placeholder|aria-label)\s*[:=]\s*(["'`])([\s\S]*?)\1/gi;
  let propMatch;
  while ((propMatch = copyPropRe.exec(cleaned)) !== null) {
    const val = propMatch[2];
    if (val.trim().length >= 4 && !/^\$\{/.test(val.trim())) {
      const valueOffset = propMatch.index + propMatch[0].indexOf(propMatch[1]) + 1;
      pushChunk(val, valueOffset);
    }
  }

  return {
    lineText: lineBuckets.map((parts) => parts.join(" ")).join("\n"),
    multilineSegments: segments,
  };
}

function visibleCopyFromCode(source) {
  return extractVisibleCodeSegments(source).lineText;
}

function loadBrandConfig(brand, sdiRoot = ROOT) {
  const packFile = join(sdiRoot, "brand-image-system", "runtime", "brands", brand, "brand-pack.json");
  if (!existsSync(packFile)) return { bannedPhrases: [] };
  const pack = JSON.parse(readFileSync(packFile, "utf8"));
  return { bannedPhrases: Array.isArray(pack.voice?.bannedPhrases) ? pack.voice.bannedPhrases : [] };
}

function resolveLocalModule(targetDir, fromFile, spec) {
  const roots = [];
  if (spec.startsWith("@/")) {
    const srcDir = join(targetDir, "src");
    if (existsSync(srcDir)) roots.push(join(srcDir, spec.slice(2)));
    roots.push(join(targetDir, spec.slice(2)));
  } else if (spec.startsWith(".")) {
    roots.push(resolve(dirname(fromFile), spec));
  }
  for (const base of roots) {
    for (const ext of ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts", "/index.jsx", "/index.js"]) {
      const candidate = resolve(base + ext);
      if (existsSync(candidate) && /\.(tsx|ts|jsx|js)$/i.test(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function resolveHomepageBundle(targetDir) {
  const candidates = [
    "app/page.tsx", "src/app/page.tsx", "app/(marketing)/page.tsx", "src/pages/index.tsx", "index.html",
  ];
  const entry = candidates.map((p) => join(targetDir, p)).find((p) => existsSync(p));
  if (!entry) return { entry: null, sources: [] };
  const resolvedEntry = resolve(entry);
  const visited = new Set([resolvedEntry]);
  const queue = [resolvedEntry];
  const sources = [];
  const MAX_BUNDLE_FILES = 50;

  while (queue.length > 0 && sources.length < MAX_BUNDLE_FILES) {
    const current = queue.shift();
    const text = readFileSync(current, "utf8");
    sources.push({ path: relative(targetDir, current).replace(/\\/g, "/"), text });
    for (const m of text.matchAll(/(?:from|import\s*\()\s*["']([^"']+)["']/g)) {
      const resolvedMod = resolveLocalModule(targetDir, current, m[1]);
      if (resolvedMod && !visited.has(resolvedMod)) {
        visited.add(resolvedMod);
        queue.push(resolvedMod);
      }
    }
  }
  return { entry: relative(targetDir, resolvedEntry).replace(/\\/g, "/"), sources };
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
    const extracted = isCodeFile ? extractVisibleCodeSegments(raw) : null;
    const text = extracted ? extracted.lineText : isHtmlFile ? visibleCopyFromHtml(raw) : raw;
    const lines = text.split("\n");
    const emittedKeys = new Set();

    const pushUnique = (f) => {
      const key = `${f.rule}::${f.path}::${f.excerpt.toLowerCase()}::${f.line}`;
      if (emittedKeys.has(key)) return;
      emittedKeys.add(key);
      findings.push(f);
    };

    const perLineRulesSeen = new Set();
    lines.forEach((line, idx) => {
      if (!line.trim()) return;
      for (const vr of VOID_RULES) {
        vr.re.lastIndex = 0;
        let match;
        while ((match = vr.re.exec(line)) !== null) {
          if (
            isDirectVoidNegation(line, match.index) ||
            hasTrailingVoidNegation(line, match.index + match[0].length)
          ) {
            continue;
          }
          perLineRulesSeen.add(`${vr.id}::${match[0].toLowerCase()}`);
          pushUnique({
            rule: vr.id, severity: vr.severity, path: rel, line: idx + 1, excerpt: match[0], why: vr.why,
          });
        }
      }
      for (const phrase of bannedPhrases) {
        if (phrase && line.toLowerCase().includes(phrase.toLowerCase())) {
          perLineRulesSeen.add(`brand:banned-phrase::${phrase.toLowerCase()}`);
          pushUnique({
            rule: "brand:banned-phrase", severity: "error", path: rel, line: idx + 1,
            excerpt: phrase, why: `Banned phrase in ${brand} brand-pack.json`,
          });
        }
      }
    });

    if (extracted) {
      for (const seg of extracted.multilineSegments) {
        for (const vr of VOID_RULES) {
          vr.re.lastIndex = 0;
          let match;
          while ((match = vr.re.exec(seg.text)) !== null) {
            if (
              isDirectVoidNegation(seg.text, match.index) ||
              hasTrailingVoidNegation(seg.text, match.index + match[0].length)
            ) {
              continue;
            }
            const seenKey = `${vr.id}::${match[0].toLowerCase()}`;
            if (!perLineRulesSeen.has(seenKey)) {
              perLineRulesSeen.add(seenKey);
              pushUnique({
                rule: vr.id, severity: vr.severity, path: rel, line: seg.line, excerpt: match[0], why: vr.why,
              });
            }
          }
        }
        for (const phrase of bannedPhrases) {
          const seenKey = `brand:banned-phrase::${phrase.toLowerCase()}`;
          if (phrase && !perLineRulesSeen.has(seenKey) && seg.text.toLowerCase().includes(phrase.toLowerCase())) {
            perLineRulesSeen.add(seenKey);
            pushUnique({
              rule: "brand:banned-phrase", severity: "error", path: rel, line: seg.line,
              excerpt: phrase, why: `Banned phrase in ${brand} brand-pack.json`,
            });
          }
        }
      }
    }

    const filterAndPushVoice = (sample, lineOverride = null, skipRulesSeen = null) => {
      for (const vf of lintFrankxVoice(sample)) {
        if ((vf.rule === "arcanea-diction" || vf.rule === "arcanea-name-check") && brand !== "frankx") continue;
        if (vf.rule === "em-dash" && brand !== "frankx") continue;
        if (isCodeFile && (vf.rule === "unfilled-slot" || vf.rule === "numbered-opener")) continue;
        if (isHtmlFile && vf.rule === "unfilled-slot") continue;
        const ruleName = `voice:${vf.rule}`;
        const voiceKey = `${ruleName}::${vf.excerpt.toLowerCase()}`;
        if (skipRulesSeen && skipRulesSeen.has(voiceKey)) continue;
        if (!skipRulesSeen) perLineVoiceSeen.add(voiceKey);
        const sev = vf.rule === "contrast-formula" || vf.rule === "hype-verb" || vf.rule === "stock-phrase" ? "warn" : vf.severity;
        pushUnique({
          rule: ruleName, severity: strict && sev === "warn" ? "error" : sev,
          path: rel, line: lineOverride ?? vf.line, excerpt: vf.excerpt, why: vf.why,
        });
      }
    };

    const perLineVoiceSeen = new Set();
    filterAndPushVoice(text);
    if (extracted) {
      for (const seg of extracted.multilineSegments) {
        filterAndPushVoice(seg.text, seg.line, perLineVoiceSeen);
      }
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

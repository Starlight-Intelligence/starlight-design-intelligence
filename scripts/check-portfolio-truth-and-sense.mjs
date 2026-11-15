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
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const restrictTop = rootDir === dir && entries.some((e) => e.isDirectory() && WEB_ROOT_DIRS.includes(e.name));
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    if (restrictTop && entry.isDirectory() && !WEB_ROOT_DIRS.includes(entry.name)) continue;
    if (restrictTop && entry.isFile() && !/\.html?$/i.test(entry.name)) continue;
    const full = join(dir, entry.name);
    const rel = relative(rootDir, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      walkFiles(full, rootDir, out);
    } else if (/\.(tsx|ts|jsx|js|mdx|md|html?)$/i.test(entry.name) && !SKIP_PATH_RE.test(rel)) {
      if (!rel.includes("/") && ROOT_INTERNAL_MD.test(entry.name)) continue;
      if (SUBDIR_INTERNAL_MD.test(entry.name) && !/^content\//i.test(rel)) continue;
      out.push({ full, rel });
    }
  }
  if (rootDir === dir) out.sort((a, b) => a.rel.localeCompare(b.rel));
  return out;
}

const INLINE_COPY_TAGS = new Set([
  "a", "abbr", "b", "cite", "code", "em", "i", "kbd", "link", "mark", "q", "s", "small", "span", "strong", "sub", "sup", "time", "u",
]);
const VOID_HTML_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

function buildLineStarts(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function createSegmentBuilder(source, lineStarts) {
  let out = "";
  let charLines = [];
  let pendingSpace = false;

  const lineOf = (offset) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  return {
    addSlice(start, end) {
      for (let i = start; i < end; i += 1) {
        const ch = source[i];
        if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
          if (out.length > 0) pendingSpace = true;
        } else {
          if (pendingSpace) {
            out += " ";
            charLines.push(lineOf(i));
            pendingSpace = false;
          }
          out += ch;
          charLines.push(lineOf(i));
        }
      }
    },
    addGap() {
      if (out.length > 0) pendingSpace = true;
    },
    hasContent() {
      return out.length > 0;
    },
    flush(segments, meta = {}) {
      if (out.length > 0) {
        const text = out;
        const lines = charLines;
        segments.push({
          ...meta,
          text,
          line: lines[0],
          lineAt(offset) {
            if (offset <= 0) return lines[0];
            if (offset >= lines.length) return lines[lines.length - 1];
            return lines[offset];
          },
        });
      }
      out = "";
      charLines = [];
      pendingSpace = false;
    },
  };
}

function maskPreserveNewlines(source, re) {
  return source.replace(re, (m) => m.replace(/[^\n]/g, " "));
}

function extractHtmlLogicalSegments(source) {
  const cleaned = maskPreserveNewlines(
    maskPreserveNewlines(
      maskPreserveNewlines(source, /<!--[\s\S]*?-->/g),
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
    ),
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  );
  const lineStarts = buildLineStarts(source);
  const segments = [];
  const seg = createSegmentBuilder(cleaned, lineStarts);
  let i = 0;
  const n = cleaned.length;
  while (i < n) {
    const tagStart = cleaned.indexOf("<", i);
    if (tagStart < 0) {
      seg.addSlice(i, n);
      break;
    }
    if (tagStart > i) seg.addSlice(i, tagStart);
    const tagEnd = cleaned.indexOf(">", tagStart + 1);
    if (tagEnd < 0) {
      seg.addSlice(tagStart, n);
      break;
    }
    const rawTag = cleaned.slice(tagStart + 1, tagEnd).trim();
    const nameMatch = /^\/?\s*([A-Za-z0-9]+)/.exec(rawTag);
    const tagName = nameMatch ? nameMatch[1].toLowerCase() : "";
    if (tagName && INLINE_COPY_TAGS.has(tagName)) {
      seg.addGap();
    } else {
      seg.flush(segments);
    }
    i = tagEnd + 1;
  }
  seg.flush(segments);
  return segments;
}

function extractMarkdownLogicalSegments(source) {
  const masked = maskPreserveNewlines(source, /<!--[\s\S]*?-->/g);
  const lineStarts = buildLineStarts(source);
  const segments = [];
  const seg = createSegmentBuilder(masked, lineStarts);
  const rawLines = masked.split("\n");
  let offset = 0;
  let inFence = null;
  let inFrontmatter = rawLines[0]?.trim() === "---";

  for (let idx = 0; idx < rawLines.length; idx += 1) {
    const line = rawLines[idx];
    const lineStart = offset;
    const lineEnd = offset + line.length;
    offset = lineEnd + 1;
    const trimmed = line.trim();

    if (inFrontmatter) {
      seg.flush(segments);
      if (idx > 0 && (trimmed === "---" || trimmed === "...")) {
        inFrontmatter = false;
        continue;
      }
      if (idx === 0) continue;
      seg.addSlice(lineStart, lineEnd);
      seg.flush(segments);
      continue;
    }

    const fenceMatch = /^(`{3,}|~{3,})/.exec(trimmed);
    if (fenceMatch) {
      seg.flush(segments);
      if (!inFence) {
        inFence = { ch: fenceMatch[1][0], len: fenceMatch[1].length };
      } else if (
        fenceMatch[1][0] === inFence.ch &&
        fenceMatch[1].length >= inFence.len &&
        trimmed.slice(fenceMatch[1].length).trim() === ""
      ) {
        inFence = null;
      }
      continue;
    }
    if (inFence) {
      seg.flush(segments);
      seg.addSlice(lineStart, lineEnd);
      seg.flush(segments, { inFence: true });
      continue;
    }

    if (!trimmed) {
      seg.flush(segments);
      continue;
    }

    const isHeading = /^#{1,6}\s/.test(trimmed);
    const isListStart = /^(?:[-*+]|\d+[.)])\s+/.test(trimmed);
    const isBlockquote = trimmed.startsWith(">");
    const isRule = /^(?:[-*_])\s*(?:[-*_])\s*(?:[-*_])+\s*$/.test(trimmed);
    const isHtmlLine = /^<\/?[A-Za-z][^>]*>/.test(trimmed);

    if (isHeading || isListStart || isBlockquote || isRule || isHtmlLine) {
      seg.flush(segments);
    }
    if (seg.hasContent()) seg.addGap();
    seg.addSlice(lineStart, lineEnd);
    if (isHeading || isRule || isHtmlLine) {
      seg.flush(segments);
    }
  }
  seg.flush(segments);
  return segments;
}

function isDirectVoidNegation(line, matchIndex) {
  const clause = line.slice(Math.max(0, matchIndex - 96), matchIndex).split(/(?:[.;!?\u2014\u2013()]|(?<!\d):|:(?!\d))/).pop() ?? "";
  let lastNegEnd = -1;
  const negGlobal = new RegExp(NEGATION_RE.source, "gi");
  let m;
  while ((m = negGlobal.exec(clause)) !== null) {
    lastNegEnd = m.index + m[0].length;
  }
  if (lastNegEnd < 0) return false;
  let between = clause.slice(lastNegEnd).trim();
  const listSepItemRe = new RegExp(
    `^(?:${VOID_RULES.map((r) => r.re.source).join("|")})(?:\\s*,\\s*(?:or|nor)?|\\s+(?:or|nor|and|\\/)\\s*)\\s*`,
    "i",
  );
  const leadingBridgeWordRe = /^(?:is|are|was|were|be|exist|exists|do|does|did|will|can|would|should|there\s+(?:is|are)|offer|offers|offering|offered|provide|provides|providing|provided|sell|sells|selling|sold|accept|accepts|accepting|accepted|run|runs|running|operated\s+by|owned\s+by|managed\s+by|called|named|a|an|the|any|such|further|paid|direct)\s+/i;
  let prevLen = -1;
  while (between.length !== prevLen) {
    prevLen = between.length;
    between = between.replace(leadingBridgeWordRe, "").trim();
    between = between.replace(listSepItemRe, "").trim();
  }
  const padded = between ? `${between} ` : "";
  if (DIRECT_NEGATION_BRIDGE_RE.test(padded)) return true;
  return false;
}

function hasTrailingVoidNegation(line, matchEnd) {
  const after = line.slice(matchEnd, Math.min(line.length, matchEnd + 64));
  return /^\s*(?:(?:does|do)\s+not\s+exist|(?:is|are)\s+(?:void|nonexistent|retired|unavailable|discontinued|not\s+(?:real|valid|active|offered|available|operating|registered|incorporated|accepted|possible|an?\s+(?:(?:real|actual|existing|active|valid|legal|operating)\s+)?(?:option|offering|entity|company|service|tier|plan)))\b)/i.test(after);
}

function checkJsxOpeningTag(source, i) {
  const n = source.length;
  if (source[i] !== "<") return null;
  const next = source[i + 1] ?? "";
  if (next === ">") return { tagName: "", isSelfClosing: false };
  const prev = i > 0 ? source[i - 1] : "";
  const beforeCtx = source.slice(Math.max(0, i - 16), i);
  const isTsGenericPrefix = /[A-Za-z0-9_$\])]/.test(prev) && !/\b(?:return|else|yield|await|case)\s*$/.test(beforeCtx);
  if (!/[A-Za-z_]/.test(next) || isTsGenericPrefix) return null;

  let m = i + 1;
  while (m < n && /[A-Za-z0-9_.-]/.test(source[m])) m += 1;
  const tagName = source.slice(i + 1, m);
  if (!/[\s/>]/.test(source[m] ?? "")) return null;

  let j = m;
  let braceDepth = 0;
  let quote = null;
  while (j < n) {
    const c = source[j];
    if (quote) {
      if (c === "\\" && j + 1 < n) { j += 2; continue; }
      if (c === quote) quote = null;
      j += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; j += 1; continue; }
    if (c === "{") { braceDepth += 1; j += 1; continue; }
    if (c === "}" && braceDepth > 0) { braceDepth -= 1; j += 1; continue; }
    if (braceDepth === 0) {
      if (c === "/" && source[j + 1] === "*") {
        const endC = source.indexOf("*/", j + 2);
        j = endC < 0 ? n : endC + 2;
        continue;
      }
      if (c === "/" && source[j + 1] === "/" && (j === 0 || source[j - 1] !== ":")) {
        const nl = source.indexOf("\n", j + 2);
        j = nl < 0 ? n : nl + 1;
        continue;
      }
      if (c === ">") {
        if (source[j - 1] === "=") return null;
        const isSelfClosing = source[j - 1] === "/";
        const inner = source.slice(i + 1, isSelfClosing ? j - 1 : j);
        if (/\bextends\b/.test(inner) && !/=/.test(inner)) return null;
        return { tagName, isSelfClosing };
      }
      if (/[;,&|<()+*?!]/.test(c)) return null;
    }
    j += 1;
  }
  return null;
}

function scanCodeFile(source) {
  const n = source.length;
  const lineStarts = buildLineStarts(source);
  const maskedChars = source.split("");
  const segments = [];

  const blankRange = (start, end) => {
    for (let k = start; k < end; k += 1) {
      if (maskedChars[k] !== "\n") maskedChars[k] = " ";
    }
  };

  const scanJs = (startPos, stopOnClosingBrace) => {
    let i = startPos;
    let braceDepth = stopOnClosingBrace ? 1 : 0;
    let hasCode = false;
    let hasJsx = false;
    let tokenCount = 0;
    let singleLiteral = null;
    let prevSigChar = stopOnClosingBrace ? "{" : "\n";

    const consumeQuote = (qPos) => {
      const q = source[qPos];
      let k = qPos + 1;
      let hasInterp = false;
      let closed = false;
      while (k < n) {
        const ch = source[k];
        if (ch === "\\" && k + 1 < n) { k += 2; continue; }
        if (q === "`" && ch === "$" && source[k + 1] === "{") hasInterp = true;
        if (ch === q) { closed = true; k += 1; break; }
        k += 1;
      }
      hasCode = true;
      tokenCount += 1;
      const bodyEnd = closed ? k - 1 : k;
      if (tokenCount === 1 && !hasInterp && bodyEnd - (qPos + 1) >= 3) {
        singleLiteral = { start: qPos + 1, end: bodyEnd };
      } else {
        singleLiteral = null;
      }
      prevSigChar = q;
      return k;
    };

    while (i < n) {
      const ch = source[i];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        i += 1;
        continue;
      }
      if (ch === "/" && source[i + 1] === "*") {
        const endC = source.indexOf("*/", i + 2);
        const stop = endC < 0 ? n : endC + 2;
        blankRange(i, stop);
        i = stop;
        continue;
      }
      if (ch === "/" && source[i + 1] === "/" && (i === 0 || source[i - 1] !== ":")) {
        const nl = source.indexOf("\n", i + 2);
        const stop = nl < 0 ? n : nl;
        blankRange(i, stop);
        i = stop;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        i = consumeQuote(i);
        continue;
      }
      if (ch === "/" && "=([,!?:;&|{}\n".includes(prevSigChar)) {
        let k = i + 1;
        let inClass = false;
        while (k < n && source[k] !== "\n") {
          const rc = source[k];
          if (rc === "\\" && k + 1 < n) { k += 2; continue; }
          if (rc === "[") inClass = true;
          else if (rc === "]") inClass = false;
          else if (rc === "/" && !inClass) { k += 1; break; }
          k += 1;
        }
        hasCode = true;
        tokenCount += 1;
        singleLiteral = null;
        prevSigChar = "/";
        i = k;
        continue;
      }
      if (stopOnClosingBrace && ch === "}") {
        braceDepth -= 1;
        if (braceDepth === 0) {
          return {
            end: i + 1,
            hasCode,
            hasJsx,
            literalRange: tokenCount === 1 ? singleLiteral : null,
          };
        }
        hasCode = true;
        tokenCount += 1;
        singleLiteral = null;
        prevSigChar = "}";
        i += 1;
        continue;
      }
      if (ch === "{") {
        if (stopOnClosingBrace) braceDepth += 1;
        hasCode = true;
        tokenCount += 1;
        singleLiteral = null;
        prevSigChar = "{";
        i += 1;
        continue;
      }
      if (ch === "<") {
        const open = checkJsxOpeningTag(source, i);
        if (open) {
          hasCode = true;
          hasJsx = true;
          tokenCount += 1;
          singleLiteral = null;
          i = parseJsxElement(i, null, new Set());
          prevSigChar = ">";
          continue;
        }
      }
      hasCode = true;
      tokenCount += 1;
      singleLiteral = null;
      prevSigChar = ch;
      i += 1;
    }
    return {
      end: n,
      hasCode,
      hasJsx,
      literalRange: tokenCount === 1 ? singleLiteral : null,
    };
  };

  function parseJsxElement(tagStart, inheritedSeg, ancestors) {
    const isFrag = source[tagStart + 1] === ">";
    let tagName = "";
    let i = tagStart + 1;
    if (isFrag) {
      i = tagStart + 2;
    } else {
      while (i < n && /[A-Za-z0-9_.-]/.test(source[i])) i += 1;
      tagName = source.slice(tagStart + 1, i);
    }
    const lowerTag = tagName.toLowerCase();
    const isInline = lowerTag !== "" && INLINE_COPY_TAGS.has(lowerTag);
    let isSelfClosing = VOID_HTML_TAGS.has(lowerTag);

    if (!isFrag) {
      while (i < n) {
        const ch = source[i];
        if (ch === '"' || ch === "'" || ch === "`") {
          const q = ch;
          i += 1;
          while (i < n) {
            if (source[i] === "\\" && i + 1 < n) { i += 2; continue; }
            if (source[i] === q) { i += 1; break; }
            i += 1;
          }
          continue;
        }
        if (ch === "{") {
          const exprRes = scanJs(i + 1, true);
          i = exprRes.end;
          continue;
        }
        if (ch === "/" && source[i + 1] === "*") {
          const endC = source.indexOf("*/", i + 2);
          const stop = endC < 0 ? n : endC + 2;
          blankRange(i, stop);
          i = stop;
          continue;
        }
        if (ch === "/" && source[i + 1] === "/" && (i === 0 || source[i - 1] !== ":")) {
          const nl = source.indexOf("\n", i + 2);
          const stop = nl < 0 ? n : nl;
          blankRange(i, stop);
          i = stop;
          continue;
        }
        if (ch === "/" && source[i + 1] === ">") {
          isSelfClosing = true;
          i += 2;
          break;
        }
        if (ch === ">") {
          i += 1;
          break;
        }
        i += 1;
      }
    }

    if (isSelfClosing) {
      if (isInline && inheritedSeg) inheritedSeg.addGap();
      else if (!isInline && inheritedSeg) inheritedSeg.flush(segments);
      return i;
    }

    const useInherited = isInline && inheritedSeg !== null;
    if (!useInherited && inheritedSeg) inheritedSeg.flush(segments);
    const seg = useInherited ? inheritedSeg : createSegmentBuilder(source, lineStarts);
    if (useInherited) seg.addGap();

    const childAncestors = new Set(ancestors);
    if (lowerTag || isFrag) childAncestors.add(lowerTag);

    while (i < n) {
      if (source[i] === "<") {
        if (source[i + 1] === "/") {
          let k = i + 2;
          while (k < n && /[A-Za-z0-9_.-]/.test(source[k])) k += 1;
          const closeName = source.slice(i + 2, k).toLowerCase();
          const gt = source.indexOf(">", k);
          const afterClose = gt < 0 ? n : gt + 1;
          if (closeName === lowerTag) {
            if (!useInherited) seg.flush(segments);
            else seg.addGap();
            return afterClose;
          }
          if (ancestors.has(closeName)) {
            if (!useInherited) seg.flush(segments);
            return i;
          }
          i = afterClose;
          continue;
        }
        const nested = checkJsxOpeningTag(source, i);
        if (nested) {
          i = parseJsxElement(i, seg, childAncestors);
          continue;
        }
        seg.addSlice(i, i + 1);
        i += 1;
        continue;
      }
      if (source[i] === "{") {
        const exprRes = scanJs(i + 1, true);
        i = exprRes.end;
        if (exprRes.literalRange) {
          seg.addSlice(exprRes.literalRange.start, exprRes.literalRange.end);
        } else if (exprRes.hasJsx) {
          seg.flush(segments);
        } else if (exprRes.hasCode) {
          seg.addGap();
        }
        continue;
      }
      const chunkStart = i;
      while (i < n && source[i] !== "<" && source[i] !== "{") i += 1;
      seg.addSlice(chunkStart, i);
    }

    if (!useInherited) seg.flush(segments);
    return i;
  }

  scanJs(0, false);

  const commentMasked = maskedChars.join("");
  const copyPropRe = /(?:title|description|subtitle|body|summary|label|headline|cta|alt|placeholder|aria-label)\s*[:=]\s*(["'`])([\s\S]*?)\1/gi;
  let propMatch;
  while ((propMatch = copyPropRe.exec(commentMasked)) !== null) {
    const val = propMatch[2];
    if (val.trim().length >= 4 && !/^\$\{/.test(val.trim())) {
      const valueOffset = propMatch.index + propMatch[0].indexOf(propMatch[1]) + 1;
      const propSeg = createSegmentBuilder(commentMasked, lineStarts);
      propSeg.addSlice(valueOffset, valueOffset + val.length);
      propSeg.flush(segments);
    }
  }

  segments.sort((a, b) => a.line - b.line);
  return { segments, commentMasked };
}

function stripCodeForLanding(source, isHtml) {
  if (isHtml) {
    return maskPreserveNewlines(source, /<!--[\s\S]*?-->/g);
  }
  const { commentMasked } = scanCodeFile(source);
  return commentMasked
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^(?:import\b|export\s+type\b|type\s+[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*=|interface\s+[A-Za-z_$][\w$]*)/.test(trimmed)) {
        return " ".repeat(line.length);
      }
      return line;
    })
    .join("\n");
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
    "app/page.tsx", "app/page.jsx", "src/app/page.tsx", "src/app/page.jsx",
    "app/(marketing)/page.tsx", "src/app/(marketing)/page.tsx",
    "pages/index.tsx", "pages/index.jsx", "pages/index.js",
    "src/pages/index.tsx", "src/pages/index.jsx", "src/pages/index.js",
    "index.html", "index.htm",
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
    const text = readFileSync(current, "utf8").replace(/\r\n/g, "\n");
    const isHtml = /\.html?$/i.test(current);
    const importScanText = isHtml ? "" : scanCodeFile(text).commentMasked;
    const stripped = stripCodeForLanding(text, isHtml);
    sources.push({ path: relative(targetDir, current).replace(/\\/g, "/"), text, stripped });
    for (const m of importScanText.matchAll(/(?:from|import\s*\()\s*["']([^"']+)["']/g)) {
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
  if (mode !== "landing" && mode !== "content") {
    throw new Error(`Invalid mode "${mode}": expected "landing" or "content"`);
  }
  const targetDir = resolve(dir);
  const { bannedPhrases } = loadBrandConfig(brand, sdiRoot);
  const findings = [];
  const files = walkFiles(targetDir);

  for (const { full, rel } of files) {
    const raw = readFileSync(full, "utf8").replace(/\r\n/g, "\n");
    const ext = extname(full).toLowerCase();
    const isCodeFile = /\.(tsx|ts|jsx|js)$/i.test(ext);
    const isHtmlFile = /\.html?$/i.test(ext);
    const segments = isCodeFile
      ? scanCodeFile(raw).segments
      : isHtmlFile
        ? extractHtmlLogicalSegments(raw)
        : extractMarkdownLogicalSegments(raw);
    const emittedKeys = new Set();

    const pushUnique = (f) => {
      const key = `${f.rule}::${f.path}::${f.excerpt.toLowerCase()}::${f.line}`;
      if (emittedKeys.has(key)) return;
      emittedKeys.add(key);
      findings.push(f);
    };

    for (const seg of segments) {
      if (!seg.text.trim()) continue;
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
          pushUnique({
            rule: vr.id,
            severity: vr.severity,
            path: rel,
            line: seg.lineAt(match.index),
            excerpt: match[0],
            why: vr.why,
          });
        }
      }
      const lowerSeg = seg.text.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (!phrase) continue;
        const lowerPhrase = phrase.toLowerCase();
        let fromIndex = 0;
        while (true) {
          const hit = lowerSeg.indexOf(lowerPhrase, fromIndex);
          if (hit < 0) break;
          pushUnique({
            rule: "brand:banned-phrase",
            severity: "error",
            path: rel,
            line: seg.lineAt(hit),
            excerpt: phrase,
            why: `Banned phrase in ${brand} brand-pack.json`,
          });
          fromIndex = hit + lowerPhrase.length;
        }
      }
    }

    if (segments.length > 0) {
      const joinedDoc = segments.map((s) => (s.inFence ? "" : s.text)).join("\n");
      for (const vf of lintFrankxVoice(joinedDoc)) {
        if ((vf.rule === "arcanea-diction" || vf.rule === "arcanea-name-check") && brand !== "frankx") continue;
        if (vf.rule === "em-dash" && brand !== "frankx") continue;
        if (isCodeFile && (vf.rule === "unfilled-slot" || vf.rule === "numbered-opener")) continue;
        if (isHtmlFile && vf.rule === "unfilled-slot") continue;
        const seg = segments[vf.line - 1];
        let resolvedLine = seg ? seg.line : vf.line;
        if (seg && vf.excerpt) {
          const needle = vf.excerpt.replace(/\.{3}$/, "").replace(/\s*\(\u00d7\d+\)$/, "").replace(/^"|"$/g, "").trim();
          const idx = needle ? seg.text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
          if (idx >= 0) resolvedLine = seg.lineAt(idx);
        }
        const sev = vf.rule === "contrast-formula" || vf.rule === "hype-verb" || vf.rule === "stock-phrase" ? "warn" : vf.severity;
        pushUnique({
          rule: `voice:${vf.rule}`,
          severity: strict && sev === "warn" ? "error" : sev,
          path: rel,
          line: resolvedLine,
          excerpt: vf.excerpt,
          why: vf.why,
        });
      }
    }
  }

  let landing = null;
  if (mode === "landing") {
    const { entry, sources } = resolveHomepageBundle(targetDir);
    const combined = sources.map((s) => s.stripped).join("\n");
    const hasLlms = [
      "public/llms.txt", "llms.txt", "app/llms.txt/route.ts", "app/llms.txt/route.js",
      "src/app/llms.txt/route.ts", "src/app/llms.txt/route.js",
    ].some((p) => existsSync(join(targetDir, p)));
    const layoutText = [
      "app/layout.tsx", "src/app/layout.tsx", "app/layout.jsx", "src/app/layout.jsx",
      "pages/_app.tsx", "src/pages/_app.tsx",
    ]
      .map((p) => join(targetDir, p))
      .filter(existsSync)
      .map((p) => stripCodeForLanding(readFileSync(p, "utf8").replace(/\r\n/g, "\n"), false))
      .join("\n");

    const hasH1 = /<h1[\s>]|role=["']heading["'][^>]*aria-level=["']?1["']?/i.test(combined);
    const hasCta = /<(Link|a|button)\b/i.test(combined);
    const hasJsonLd = /application\/ld\+json|<JsonLd\b/i.test(combined + layoutText);
    const hasBrandAttr = new RegExp(`data-brand=["']${brand}["']`, "i").test(combined + layoutText);
    landing = { entry, hasH1, hasCta, hasLlms, hasJsonLd, hasBrandAttr };

    if (!entry) findings.push({ rule: "sense:missing-homepage", severity: "error", path: ".", line: 1, excerpt: "no homepage entry", why: "Landing mode requires app/page.tsx, src/app/page.tsx, pages/index.tsx, or index.html." });
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
  if (mode !== "landing" && mode !== "content") {
    error(`invalid --mode "${mode}": expected "landing" or "content"`);
    return 2;
  }
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

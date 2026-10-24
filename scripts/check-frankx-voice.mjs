#!/usr/bin/env node
// Mechanical pre-check for FrankX copy. It catches only what a script can decide with
// certainty; the editorial articulation gate (evals/editorial-articulation-gate.md) still
// judges everything that needs taste. Rules trace to brand-packs/frankx/POINT_OF_VIEW.md
// and COPY.md, so a rule change starts there. When a match cannot establish the violation
// (a common word, an ambiguous name), the rule warns instead of failing.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const EM_DASH = String.fromCharCode(0x2014);
const FRONTIER = /\b(AGI|superintelligen\w*|singularity|ASI)\b/i;
const FUTURE = /\b(will|won't|is coming|coming in|arriv\w*|by (the end of )?(the decade|20[2-9]\d)|within (a|the next|\d+|one|two|three|four|five)|in (the next )?(one|two|three|four|five|\d+) years?|next year|forecast|predicted|expected)\b/i;
const ATTRIBUTION_VERB = /\b(wrote|writes|said|says|forecasts?|estimated|estimates|predicted|predicts|expects|argued|argues|according to)\b/i;
const MONTHS = new Set(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
// Capitalised words that are not a named source: sentence starters and generic crowds.
const NOT_A_SOURCE = new Set(["The", "This", "That", "These", "In", "By", "It", "We", "I", "A", "An", "Our", "My", "If", "When", "And", "But", "So",
  "Experts", "Researchers", "Analysts", "Scientists", "People", "Many", "Some", "Most", "Insiders", "Observers", "Leaders", "Everyone"]);
// "n't" is matched without a leading word boundary so it is found inside "isn't".
const NEGATION_BEFORE = /(\b(not|never|nothing|no longer|none)\b|n't\b)(\W+\w+){0,4}\W+$/i;

// The date a statement was made: a month or year no later than now. A future year in
// the same line, with or without a month before it, is the forecast horizon.
function statementDate(line) {
  const current = new Date().getUTCFullYear();
  const monthYear = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b(?:\s+(20\d\d))?/g;
  for (const [, , year] of line.matchAll(monthYear)) {
    if (!year || Number(year) <= current) return true;
  }
  return (line.match(/(?<!(January|February|March|April|May|June|July|August|September|October|November|December)\s)\b20\d\d\b/g) ?? []).some((year) => Number(year) <= current);
}

// A forecast counts as attributed when it carries an attribution verb, a proper name
// (a person, lab or venue) and a statement date.
function hasNamedSource(line) {
  if (!ATTRIBUTION_VERB.test(line) || !statementDate(line)) return false;
  const names = line.match(/\b[A-Z][A-Za-z]+\b/g) ?? [];
  return names.some((name) => !MONTHS.has(name) && !NOT_A_SOURCE.has(name) && !FRONTIER.test(name));
}

function futureYear(line) {
  const current = new Date().getUTCFullYear();
  return (line.match(/\b20[2-9]\d\b(?!-\d)/g) ?? []).some((year) => Number(year) > current);
}

// Markdown constructs that use brackets legitimately: inline links, full and shortcut
// reference links, reference definitions and task checkboxes. What remains is a slot.
function bracketSlots(line, definitions = new Set()) {
  const definition = line.match(/^\s*\[[^\]]+\]:\s*\S+(.*)$/);
  if (definition) return definition[1].match(/\[[^\]\n]{2,80}\]/g) ?? [];
  const stripped = line
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\[[^\]]*\]/g, "")
    .replace(/\[[ xX]\]/g, "");
  return (stripped.match(/\[[^\]\n]{2,80}\]/g) ?? []).filter((slot) => !definitions.has(slot.slice(1, -1).toLowerCase()));
}

export const RULES = [
  {
    id: "em-dash",
    severity: "error",
    why: "No em dashes in FrankX copy (estate writing standard).",
    test: (line) => line.includes(EM_DASH)
  },
  {
    id: "unattributed-forecast",
    severity: "error",
    why: "AGI and superintelligence forecasts need a named forecaster and a date (POINT_OF_VIEW claim rule 1).",
    test: (line, options) =>
      FRONTIER.test(line) && (FUTURE.test(line) || futureYear(line)) && !hasNamedSource(line) && !bracketSlots(line, options.definitions).length
  },
  {
    id: "income-claim",
    severity: "error",
    why: "FrankX makes no income claims or earnings promises (POINT_OF_VIEW stance 1 and 5). Prices are fine.",
    test: (line) =>
      /\bpassive income\b|\bsix[- ]figures?\b|\b[5-9]-figure (income|business|month|year)\b|\bquit your (day )?job\b|\b(make|makes|made|earn|earns|earned|making|earning|bring in|brings in|clear|clears)\s+(over |about |up to |around )?\$\d/i.test(line)
  },
  {
    id: "inevitability",
    severity: "error",
    why: "No inevitability or fear framing (POINT_OF_VIEW register).",
    test: (line) =>
      /\bno stopping (this|it)\b|\bthere is no stopping\b|\bleft behind\b|\badapt or die\b|\bthose who (don't|do not|won't)\b/i.test(line) ||
      [...line.matchAll(/\binevitable\b/gi)].some((match) => !NEGATION_BEFORE.test(line.slice(0, match.index).split(/[.!?;]/).pop()))
  },
  {
    id: "unpopular-opinion",
    severity: "error",
    why: "'Unpopular opinion:' as a label is a dead 2026 move (pattern grammar).",
    test: (line) => /^\W*unpopular opinion\s*:/i.test(line)
  },
  {
    id: "arcanea-diction",
    severity: "error",
    why: "Arcanea names never cross into FrankX copy (Voice Observatory AGENTS.md).",
    test: (line) => /\b(Arcanea|Arcanean|Luminor|Luminors)\b/.test(line)
  },
  {
    id: "arcanea-name-check",
    severity: "warn",
    why: "Lumina and Nero are Arcanea canon names and also common words. Confirm this is not Arcanea diction.",
    test: (line) => /\b(Lumina|Nero)\b/.test(line)
  },
  {
    id: "unfilled-slot",
    severity: "error",
    why: "A specimen with an empty bracket slot is a template, not copy.",
    test: (line, options) => !options.template && bracketSlots(line, options.definitions).length > 0
  },
  {
    id: "hype-verb",
    severity: "warn",
    why: "Hype verbs need a measurable object (COPY.md). Check the sentence names one.",
    test: (line) => /\b(unlock|reimagine|elevate|revolutioni[sz]e|supercharge|game[- ]?changer|10x your)\b/i.test(line)
  },
  {
    id: "contrast-formula",
    severity: "warn",
    why: "Rhetorical contrast formula (COPY.md avoid list). Keep only if the contrast carries a fact.",
    test: (line) =>
      /\bnot (just |only |merely )?[^.;:!?]{1,40}, but\b|\b(isn't|is not) [^.;:!?]{1,40}[,;] it's\b/i.test(line) ||
      /(^|[.!?]\s+|^\W*)[\w' ]{1,30}, not [\w' ]{1,30}[.!?]?\s*$/i.test(line)
  },
  {
    id: "stock-phrase",
    severity: "warn",
    why: "Stock AI phrasing (humanizer).",
    test: (line) => /\bdelve\b|\btapestry\b|\bin today's fast-paced\b|\bever-evolving landscape\b|\bunlock your potential\b/i.test(line)
  }
];

const DOCUMENT_RULES = [
  {
    id: "numbered-opener",
    severity: "error",
    why: "Numbered-framework openers and 1/n thread headers are dead in 2026 (pattern grammar).",
    test: (lines) => {
      // The opener is the first non-empty line that is not a Markdown heading.
      const index = lines.findIndex((line) => line.trim() && !line.trim().startsWith("#"));
      if (index === -1) return 0;
      const text = lines[index].replace(/^\s*>\s*/, "").trim();
      const numbered = /^\d+\s+(lessons|things|ways|tips|tools|models|secrets|mistakes|rules|reasons|habits)\b/i.test(text);
      const threadHeader = /^\d+\s*\/\s*\d*\s*(\u{1F9F5}|$)/u.test(text);
      return numbered || threadHeader ? index + 1 : 0;
    }
  },
  {
    id: "golden-age-repeat",
    severity: "error",
    why: "'Golden age' at most once in a piece (POINT_OF_VIEW register).",
    test: (lines) => {
      let seen = 0;
      for (const [index, line] of lines.entries()) {
        seen += (line.match(/golden age/gi) ?? []).length;
        if (seen > 1) return index + 1;
      }
      return 0;
    }
  }
];

// Blank out fenced code so every rule sees prose only and line numbers stay true.
// Follows CommonMark: ``` or ~~~ (also inside blockquotes), closed only by the same
// character at least as long, and a backtick fence's info string cannot hold a backtick.
function maskFences(lines) {
  let fence = null;
  let fenceQuoted = false;
  return lines.map((line) => {
    const quoted = /^\s*>/.test(line);
    const body = line.replace(/^(\s*>)+\s?/, "");
    const marker = body.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    // A fence opened inside a blockquote ends when the blockquote ends.
    if (fence && fenceQuoted && !quoted) fence = null;
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      return "";
    }
    if (marker && !(marker[1][0] === "`" && marker[2].includes("`"))) {
      fence = marker[1];
      fenceQuoted = quoted;
      return "";
    }
    return line;
  });
}

export function lintFrankxVoice(text, options = {}) {
  const lines = maskFences(text.replace(/\r\n/g, "\n").split("\n"));
  const definitions = new Set(lines.flatMap((line) => line.match(/^\s*\[([^\]]+)\]:\s/)?.[1]?.toLowerCase() ?? []));
  const lineOptions = { ...options, definitions };
  const findings = [];
  for (const [index, line] of lines.entries()) {
    for (const rule of RULES) {
      if (rule.test(line, lineOptions)) {
        findings.push({ rule: rule.id, severity: rule.severity, line: index + 1, excerpt: line.trim().slice(0, 120), why: rule.why });
      }
    }
  }
  for (const rule of DOCUMENT_RULES) {
    const lineNumber = rule.test(lines);
    if (lineNumber) {
      findings.push({ rule: rule.id, severity: rule.severity, line: lineNumber, excerpt: lines[lineNumber - 1].trim().slice(0, 120), why: rule.why });
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}

const KNOWN_FLAGS = new Set(["--template"]);

export function main(argv, { read = (file) => readFileSync(file, "utf8"), log = console.log, error = console.error } = {}) {
  const unknown = argv.filter((arg) => arg.startsWith("--") && !KNOWN_FLAGS.has(arg));
  const files = argv.filter((arg) => !arg.startsWith("--"));
  if (unknown.length || !files.length) {
    error(`${unknown.length ? `unknown option ${unknown.join(", ")}\n` : ""}usage: check-frankx-voice.mjs [--template] <file> [...]`);
    return 2;
  }
  const template = argv.includes("--template");
  let errors = 0;
  for (const file of files) {
    let text;
    try {
      text = read(file);
    } catch (cause) {
      error(`${file}: cannot read (${cause.code ?? cause.message})`);
      return 2;
    }
    for (const finding of lintFrankxVoice(text, { template })) {
      if (finding.severity === "error") errors += 1;
      log(`${file}:${finding.line} ${finding.severity} ${finding.rule}: ${finding.excerpt}\n  ${finding.why}`);
    }
  }
  log(errors ? `FrankX voice check: ${errors} error(s).` : "FrankX voice check: no errors.");
  return errors ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}

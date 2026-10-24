#!/usr/bin/env node
// Mechanical pre-check for FrankX copy. It catches only what a script can decide with
// certainty; the editorial articulation gate (evals/editorial-articulation-gate.md) still
// judges everything that needs taste. Rules trace to brand-packs/frankx/POINT_OF_VIEW.md
// and COPY.md, so a rule change starts there.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ATTRIBUTION = /\b(wrote|writes|said|says|forecast|forecasts|estimated|estimates|predicted|predicts|expects|according to|argued|argues)\b/i;
const FRONTIER = /\b(AGI|superintelligen\w*|singularity|ASI)\b/i;
// A bare year counts as a horizon; an ISO date such as 2026-10-23 is a record of when something happened.
const HORIZON = /\b(20[2-9]\d)\b(?!-\d)|\bin (the next )?(one|two|three|four|five|\d+) years?\b|\bby the end of the decade\b/i;

export const RULES = [
  {
    id: "em-dash",
    severity: "error",
    why: "No em dashes in FrankX copy (estate writing standard).",
    test: (line) => line.includes("—")
  },
  {
    id: "unattributed-forecast",
    severity: "error",
    why: "AGI and superintelligence forecasts need the forecaster and date (POINT_OF_VIEW claim rule 1).",
    test: (line) => FRONTIER.test(line) && HORIZON.test(line) && !ATTRIBUTION.test(line) && !/\[[^\]]+\]/.test(line)
  },
  {
    id: "income-claim",
    severity: "error",
    why: "FrankX makes no income claims or earnings promises (POINT_OF_VIEW stance 1 and 5).",
    test: (line) =>
      /\bpassive income\b|\bsix[- ]figures?\b|\b[5-9]-figure\b|\bquit your (day )?job\b|\b(make|earn|making|earning)\s+\$\d|\$\d[\d,.]*\s*[kKmM]?\s*\/\s*(mo|month|year|yr|week)\b/i.test(line)
  },
  {
    id: "inevitability",
    severity: "error",
    why: "No inevitability or fear framing (POINT_OF_VIEW register).",
    test: (line) => /\bno stopping (this|it)\b|\bthere is no stopping\b|\bleft behind\b|\badapt or die\b|\bthose who (don't|do not|won't)\b|\binevitable\b/i.test(line)
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
    test: (line) => /\b(Arcanea|Arcanean|Luminor|Lumina|Nero)\b/.test(line)
  },
  {
    id: "unfilled-slot",
    severity: "error",
    why: "A specimen with an empty bracket slot is a template, not copy.",
    test: (line, options) => !options.template && /\[[^\]\n]{2,80}\]/.test(line) && !/\[[^\]]*\]\(/.test(line)
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
    why: "Rhetorical not-X-but-Y contrast (COPY.md avoid list). Keep only if the contrast carries a fact.",
    test: (line) => /\bnot (just |only |merely )?[^.;:!?]{1,40}, but\b|\b(isn't|is not) [^.;:!?]{1,40}[,;] it's\b/i.test(line)
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

export function lintFrankxVoice(text, options = {}) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const findings = [];
  let inFence = false;
  for (const [index, line] of lines.entries()) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    for (const rule of RULES) {
      if (rule.test(line, options)) {
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

function main(argv) {
  const template = argv.includes("--template");
  const files = argv.filter((arg) => !arg.startsWith("--"));
  if (!files.length) {
    console.error("usage: check-frankx-voice.mjs [--template] <file> [...]");
    return 2;
  }
  let errors = 0;
  for (const file of files) {
    const findings = lintFrankxVoice(readFileSync(file, "utf8"), { template });
    for (const finding of findings) {
      if (finding.severity === "error") errors += 1;
      console.log(`${file}:${finding.line} ${finding.severity} ${finding.rule}: ${finding.excerpt}\n  ${finding.why}`);
    }
  }
  console.log(errors ? `FrankX voice check: ${errors} error(s).` : "FrankX voice check: no errors.");
  return errors ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}

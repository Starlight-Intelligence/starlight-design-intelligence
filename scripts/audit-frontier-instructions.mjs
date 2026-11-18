import { execFileSync } from "node:child_process";
import { posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const policy = "portfolio/frontier-experience-constitution.md";
const authority = "starlight-intelligence/starlight-design-intelligence";
const sha = /^[0-9a-f]{40}$/;
const instructionNames = new Set(["AGENTS.md", "CLAUDE.md", "GEMINI.md", "CLAUDE.local.md", "AGENTS.override.md"]);
const rejected = new Set(["missing", "stale", "mutable", "conflict", "unresolved"]);

function kind(path) {
  const name = posix.basename(path);
  if (instructionNames.has(name)) return "instructions";
  if (/^(?:opencode\.jsonc?|\.opencode\/opencode\.jsonc?)$/.test(path)) return "opencode";
  if (/(?:^|\/)\.(?:agent|agents|claude|gemini)\/rules\/.*\.md$/.test(path)) return "agent-rule";
  if (name === "SKILL.md") return "skill";
  if (/(?:^|\/)(?:\.mcp\.json|mcp\.json|mcp_config\.json)$/.test(path)) return "mcp-config";
  if (/^\.github\/(?:workflows|workflow-templates)\/[^/]+\.ya?ml$/.test(path)) return "workflow";
  return undefined;
}

function prose(text) {
  // A pin in a commented-out rule or a code sample is not an active reference.
  let fence = null;
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, "").split(/\r?\n/).filter(line => {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && delimiter) { fence = delimiter[1]; return false; }
    if (fence && delimiter && delimiter[1][0] === fence[0] &&
        delimiter[1].length >= fence.length && !delimiter[2].trim()) {
      fence = null;
      return false;
    }
    return !fence && !/^(?: {4}| {0,3}\t|\s*>)/.test(line);
  }).join("\n");
}

function references(text) {
  const result = new Set();
  for (const match of text.matchAll(/https?:\/\/[^\s<>"'`\])}]+/g)) {
    let url;
    try { url = new URL(match[0].replace(/[.,;]+$/, "")); } catch { continue; }
    const parts = url.pathname.slice(1).split("/");
    if (!url.pathname.endsWith("/" + policy)) continue;
    const github = url.hostname === "github.com" && parts[2] === "blob";
    const raw = url.hostname === "raw.githubusercontent.com";
    if (!(github || raw)) { result.add("other-authority"); continue; }
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
        parts.slice(0, 2).join("/").toLowerCase() !== authority) {
      result.add("other-authority");
      continue;
    }
    const ref = parts.slice(github ? 3 : 2, -2).join("/");
    result.add(sha.test(ref) ? ref : "mutable");
  }
  return result;
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

export function audit({ repo, pin, ref = "HEAD", authorityCheckout = false }) {
  if (!sha.test(pin)) throw Error("Expected a full lowercase 40-character constitution revision");
  const revision = git(repo, ["rev-parse", "--verify", "--end-of-options", ref + "^{commit}"]).trim();
  if (authorityCheckout && revision !== pin) throw Error("An authority self-reference requires the exact scanned revision as its pin");
  const entries = new Map();
  for (const entry of git(repo, ["ls-tree", "-rz", "--full-tree", revision]).split("\0").filter(Boolean)) {
    const tab = entry.indexOf("\t");
    const [mode, type, oid] = entry.slice(0, tab).split(" ");
    entries.set(entry.slice(tab + 1), { type, mode, oid });
  }
  const regular = file => entries.get(file)?.type === "blob" && /^100/.test(entries.get(file).mode);
  const cache = new Map();
  function contents(file) {
    if (!cache.has(file)) cache.set(file, git(repo, ["cat-file", "blob", entries.get(file).oid]));
    return cache.get(file);
  }
  if (authorityCheckout && !regular(policy)) throw Error("The canonical document is missing at the selected revision");

  function inspect(file, seen, pins, gaps, via) {
    if (seen.has(file)) { gaps.add("cyclic import: " + file); return; }
    if (!regular(file)) { gaps.add("missing or non-regular file: " + file); return; }
    const next = new Set([...seen, file]);
    const role = kind(file);
    let text = contents(file);
    let imports = [];
    if (role === "opencode") {
      let config;
      try { config = JSON.parse(text); } catch { gaps.add("manual review: non-JSON configuration"); return; }
      if (!Array.isArray(config?.instructions) || config.instructions.some(item => typeof item !== "string")) {
        gaps.add("no explicit list of instruction files"); return;
      }
      imports = config.instructions.filter(path => !/^https?:\/\//.test(path));
      text = config.instructions.filter(path => /^https?:\/\//.test(path)).join("\n");
    } else {
      text = prose(text);
      if (authorityCheckout && text.includes(policy) && file === "AGENTS.md" &&
          text.split(/\r?\n/).some(line => line.includes("`" + policy + "`") || line.includes("(" + policy + ")"))) {
        pins.add(pin);
      }
      // Native Claude/Gemini import directives are line-oriented. Codex
      // markdown links to arbitrary files do not imply host-level imports.
      if (["GEMINI.md", "CLAUDE.md", "CLAUDE.local.md"].includes(posix.basename(file))) {
        imports = [...text.matchAll(/^\s*@([^\s]+)\s*$/gm)].map(match => match[1]);
      }
    }
    for (const value of references(text)) pins.add(value);
    for (const link of imports) {
      const target = posix.normalize(posix.join(posix.dirname(file), link));
      if (posix.isAbsolute(link) || link.startsWith("~") || /[*?{}\[\]\\]/.test(link) ||
          target === ".." || target.startsWith("../")) {
        gaps.add("unresolved import: " + link);
        continue;
      }
      via.add(target);
      inspect(target, next, pins, gaps, via);
    }
  }

  const rows = [];
  const candidates = new Set(["AGENTS.md", ...[...entries.keys()].filter(path => kind(path))]);
  for (const file of [...candidates].sort()) {
    const role = kind(file);
    const pins = new Set(), gaps = new Set(), via = new Set();
    const required = role === "instructions" || role === "opencode";
    if (required || role === "agent-rule" || role === "skill") inspect(file, new Set(), pins, gaps, via);
    // MCP and CI definitions are inventory. Their presence cannot show that a
    // server, workflow, or external agent loaded the constitution.
    let status = required ? "missing" : "inventory-only";
    if (pins.size > 1 || pins.has("other-authority")) status = "conflict";
    else if (pins.has("mutable")) status = "mutable";
    else if (pins.size && !pins.has(pin)) status = "stale";
    else if (pins.has(pin)) status = "pinned";
    if (gaps.size && (required || pins.size) && (status === "pinned" || status === "missing"))
      status = entries.has(file) ? "unresolved" : "missing";
    rows.push({ path: file, role, status, references: [...pins].sort(), imports: [...via].sort(), gaps: [...gaps].sort() });
  }
  return { schema: "starlight.frontier_instruction_audit.v1", revision, expectedPin: pin,
    evidence: "static tracked files", failed: rows.filter(row => rejected.has(row.status)).length, rows };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { values } = parseArgs({ options: { repo: { type: "string", default: "." },
      ref: { type: "string", default: "HEAD" }, pin: { type: "string" },
      authority: { type: "boolean" }, check: { type: "boolean" } } });
    const report = audit({ ...values, authorityCheckout: values.authority });
    console.log(JSON.stringify(report, null, 2));
    if (values.check && report.failed) process.exitCode = 1;
  } catch (error) {
    console.error(error.message); process.exitCode = 2;
  }
}

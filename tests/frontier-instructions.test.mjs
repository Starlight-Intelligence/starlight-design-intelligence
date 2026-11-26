import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { audit } from "../scripts/audit-frontier-instructions.mjs";

const pin = "a".repeat(40);
const policy = "portfolio/frontier-experience-constitution.md";
const link = "https://github.com/Starlight-Intelligence/starlight-design-intelligence/blob/" + pin + "/" + policy;
function fixture(t, files) {
  const repo = mkdtempSync(join(tmpdir(), "frontier-instruction-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
  git("init", "-q");
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), content);
  }
  function commit() {
    git("add", ".");
    git("-c", "user.name=test", "-c", "user.email=test@example.invalid", "commit", "-qm", "fixture");
    return git("rev-parse", "HEAD");
  }
  return { repo, revision: commit(), commit };
}
function lookup(report) { return Object.fromEntries(report.rows.map(row => [row.path, row])); }

test("tracks exact revision, scoped files, native imports and explicit OpenCode paths", t => {
  const { repo, revision } = fixture(t, {
    "AGENTS.md": link, "CLAUDE.md": "@./AGENTS.md", "nested/GEMINI.md": "@../CLAUDE.md",
    "opencode.json": '{"instructions":["AGENTS.md"]}', "nested/AGENTS.md": link,
    ".mcp.json": "{}", ".github/workflows/build.yml": "name: build", "skills/demo/SKILL.md": "demo"
  });
  writeFileSync(join(repo, "AGENTS.md"), "modified after commit");
  const report = audit({ repo, ref: revision, pin });
  assert.equal(report.failed, 0);
  const rows = lookup(report);
  assert.deepEqual(rows["nested/GEMINI.md"].imports, ["AGENTS.md", "CLAUDE.md"]);
  assert.equal(rows["opencode.json"].status, "pinned");
  assert.equal(rows["skills/demo/SKILL.md"].status, "inventory-only");
  assert.equal(rows[".mcp.json"].status, "inventory-only");
  assert.equal(rows[".github/workflows/build.yml"].status, "inventory-only");
});

test("classifies stale, mutable, conflicting, missing and inactive examples separately", t => {
  const stale = link.replace(pin, "b".repeat(40));
  const { repo } = fixture(t, {
    "AGENTS.md": link, "web/AGENTS.md": stale, "tools/AGENTS.md": link.replace(pin, "main"),
    "api/AGENTS.md": [stale,link].join("\n"), "site/AGENTS.md": link.replace("Starlight-Intelligence/", "someone/"),
    "client/CLAUDE.md": "<!-- "+link+" -->\n~~~md\n"+link+"\n~~~\n> "+link+"\n\n    "+link+"\n",
    ".agent/rules/visual.md": stale
  });
  const report = audit({ repo, pin });
  assert.equal(report.failed, 6);
  const rows = lookup(report);
  for (const [path, status] of [["web/AGENTS.md","stale"],["tools/AGENTS.md","mutable"],
    ["api/AGENTS.md","conflict"],["site/AGENTS.md","conflict"],["client/CLAUDE.md","missing"],
    [".agent/rules/visual.md","stale"]]) assert.equal(rows[path].status,status);
});

test("reports cycles, missing imports, symlinks, escaping paths and unparsed configs", t => {
  const { repo, commit } = fixture(t, {
    "CLAUDE.md": "@./GEMINI.md", "GEMINI.md": "@CLAUDE.md", "nested/CLAUDE.md": "@../../AGENTS.md",
    "src/CLAUDE.md": "@missing.md", "opencode.jsonc": "// comment\n{}"
  });
  symlinkSync("GEMINI.md", join(repo, "AGENTS.md"));
  commit();
  const rows = lookup(audit({ repo, pin }));
  for (const row of Object.values(rows)) assert.equal(row.status, "unresolved");
  assert.match(rows["CLAUDE.md"].gaps.join(), /cyclic/);
});

test("checks owning-local policy at the selected revision separately from product links", t => {
  const { repo, revision } = fixture(t, {
    "AGENTS.md": "Read `"+policy+"` before work.", [policy]: "policy"
  });
  assert.equal(audit({ repo, pin }).failed, 1);
  assert.throws(() => audit({ repo, pin, authorityCheckout:true }), /exact scanned revision/);
  assert.equal(audit({ repo, pin:revision, authorityCheckout:true }).failed, 0);
  assert.throws(() => audit({ repo, pin:"main" }), /40-character/);
});

test("CLI enforces failures only in check mode and distinguishes invalid input", t => {
  const { repo } = fixture(t, { "README.md": "no instructions" });
  const cli = new URL("../scripts/audit-frontier-instructions.mjs", import.meta.url).pathname;
  const run = args => execFileSync(process.execPath, [cli, "--repo", repo, ...args], { stdio:"pipe", encoding:"utf8" });
  assert.equal(JSON.parse(run(["--pin",pin])).rows[0].status, "missing");
  assert.throws(() => run(["--pin",pin,"--check"]), { status:1 });
  assert.throws(() => run(["--pin","main"]), { status:2 });
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditChangedLines, auditRoot, auditText, contractRoots, decodeGitPath, loadPolicy, main, parseAddedLines } from "../skills/frank-brand-editor/scripts/editorial-audit.mjs";

const policy = loadPolicy(join(process.cwd(), "editorial/language-policy.json"));

test("flags the screenshot's rhetorical contrast and pseudo-taxonomy", () => {
  const findings = auditText(
    "A decision atlas, not a logo cloud. Tool intelligence / current evidence. Official-source records.",
    { policy }
  );
  assert.ok(findings.some((finding) => finding.rule === "negative-parallelism-slogan"));
  assert.ok(findings.some((finding) => finding.rule === "pseudo-taxonomy"));
});

test("allows literal negation required for accuracy", () => {
  const findings = auditText("This plan is not available in Germany.", { policy });
  assert.equal(findings.filter((finding) => finding.severity === "hard_fail").length, 0);
});

test("preserves precise technical and Arcanea language", () => {
  const findings = auditText(
    "Optimize the database query after measuring latency. Enter the Ember Realm through the western gate.",
    { policy }
  );
  assert.equal(findings.filter((finding) => finding.severity === "hard_fail").length, 0);
});

test("respects explicit line exceptions", () => {
  const findings = auditText("A record, not a promise. // editorial-allow", { policy });
  assert.equal(findings.length, 0);
});

test("scans public source roots and ignores tests", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-audit-"));
  mkdirSync(join(root, "app"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  writeFileSync(join(root, "app/page.tsx"), "export const copy = 'This is not a dashboard. It is an intelligence layer.'\n");
  writeFileSync(join(root, "tests/fixture.ts"), "export const copy = 'A map, not a list.'\n");
  const result = auditRoot(root, { policy });
  assert.equal(result.filesScanned, 1);
  assert.ok(result.findings.some((finding) => finding.severity === "hard_fail"));
});

test("changed-line mode ignores existing debt and catches new copy", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-diff-"));
  mkdirSync(join(root, "app"), { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "tests@frankx.ai"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Editorial Test"], { cwd: root });
  writeFileSync(join(root, "app/page.tsx"), "export const oldCopy = 'A system, not a tool.'\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: root });
  const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  writeFileSync(
    join(root, "app/page.tsx"),
    "export const oldCopy = 'A system, not a tool.'\nexport const newCopy = 'A decision atlas, not a logo cloud.'\n"
  );
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "change"], { cwd: root });
  const result = auditChangedLines(root, base, { policy });
  assert.equal(result.findings.filter((finding) => finding.severity === "hard_fail").length, 2);
  assert.ok(result.findings.every((finding) => finding.line === 2));
});

test("contract content_roots replace the default scan directories", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-roots-"));
  mkdirSync(join(root, ".starlight"), { recursive: true });
  mkdirSync(join(root, "templates/anime-studio-landing/src"), { recursive: true });
  writeFileSync(join(root, ".starlight/editorial-contract.json"), JSON.stringify({ content_roots: ["templates/anime-studio-landing/src"] }));
  writeFileSync(join(root, "templates/anime-studio-landing/src/page.tsx"), "export const copy = 'A decision atlas, not a logo cloud.'\n");
  assert.deepEqual(contractRoots(root), ["templates/anime-studio-landing/src"]);
  const quiet = console.log;
  console.log = () => {};
  try {
    const result = main(["--root", root, "--policy", join(process.cwd(), "editorial/language-policy.json")]);
    assert.equal(result.filesScanned, 1);
    assert.ok(result.findings.some((finding) => finding.severity === "hard_fail"));
  } finally {
    console.log = quiet;
  }
});

test("content_roots that leave the repository are refused", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-roots-bad-"));
  mkdirSync(join(root, ".starlight"), { recursive: true });
  writeFileSync(join(root, ".starlight/editorial-contract.json"), JSON.stringify({ content_roots: ["../elsewhere"] }));
  assert.throws(() => contractRoots(root), /relative path inside the repository/);
});

test("git C-quoted paths decode to the real filename", () => {
  assert.equal(decodeGitPath(String.raw`"b/content/caf\303\251.md"`), `b/content/caf${String.fromCharCode(0xe9)}.md`);
  assert.equal(decodeGitPath("b/plain.md"), "b/plain.md");
});

test("explicit files cannot escape --root", () => {
  const parent = mkdtempSync(join(tmpdir(), "editorial-escape-"));
  mkdirSync(join(parent, "repo/app"), { recursive: true });
  writeFileSync(join(parent, "outside.md"), "A map, not a list.\n");
  assert.throws(() => auditRoot(join(parent, "repo"), { policy, files: ["../outside.md"] }), /Refusing/);
});

test("an added line that starts with ++ is content, not a file header", () => {
  const diff = [
    "diff --git a/app/page.tsx b/app/page.tsx",
    "--- a/app/page.tsx",
    "+++ b/app/page.tsx",
    "@@ -1,0 +1,2 @@",
    "+++ counter;",
    "+export const copy = 'A decision atlas, not a logo cloud.'"
  ].join("\n");
  const added = parseAddedLines(diff);
  assert.deepEqual([...added.keys()], ["app/page.tsx"]);
  assert.equal(added.get("app/page.tsx").length, 2);
  assert.equal(added.get("app/page.tsx")[1].line, 2);
});

test("quoted paths keep literal emoji intact", () => {
  const rocket = String.fromCodePoint(0x1f680);
  assert.equal(decodeGitPath(`"b/content/${rocket}\t.md"`), `b/content/${rocket}\t.md`);
});

test("a file named ..notes.md inside the root is allowed", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-dotdot-"));
  mkdirSync(join(root, "app"), { recursive: true });
  writeFileSync(join(root, "app/..notes.md"), "Plain copy.\n");
  const result = auditRoot(root, { policy, files: ["app/..notes.md"] });
  assert.equal(result.filesScanned, 1);
});

test("a removed -- line followed by an added ++ line stays content", () => {
  const diff = [
    "diff --git a/app/page.tsx b/app/page.tsx",
    "--- a/app/page.tsx",
    "+++ b/app/page.tsx",
    "@@ -1,1 +1,1 @@",
    "--- old;",
    "+++ new;"
  ].join("\n");
  const added = parseAddedLines(diff);
  assert.deepEqual(added.get("app/page.tsx"), [{ line: 1, text: "++ new;" }]);
});

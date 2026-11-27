import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import pngjs from "pngjs";
import { candidateDigest, validateFrontierArtifacts } from "../scripts/validate-frontier-artifacts.mjs";

const digest = "1".repeat(64);

function temp(t) {
  const root = mkdtempSync(join(tmpdir(), "frontier-fixture-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, ".starlight/frontier-review"), { recursive: true });
  return root;
}

function reviewFixture(root) {
  const write = (file, bytes) => {
    writeFileSync(join(root, ".starlight/frontier-review", file), bytes);
    return { file, sha256: createHash("sha256").update(bytes).digest("hex") };
  };
  const screenshots = {};
  for (const width of [375, 768, 1440]) {
    const png = new pngjs.PNG({ width, height: 10 });
    png.data.fill(255);
    const before = write(`before-${width}.png`, pngjs.PNG.sync.write(png));
    png.data[0] = 0;
    const after = write(`after-${width}.png`, pngjs.PNG.sync.write(png));
    screenshots[width] = { before, after };
  }
  const reports = {};
  for (const kind of ["interaction", "visual_regression", "accessibility", "performance", "provenance", "continuation"]) {
    reports[kind] = write(`${kind}.json`, JSON.stringify({
      kind, candidate_sha256: digest, result: "pass", method: "Fixture tool", observation: "Fixture result"
    }));
  }
  return {
    schema_version: "starlight.frontier_artifacts.v1", candidate_sha256: digest,
    preview_url: "https://example.test/fixture", task: "Fixture task", outcome: "Fixture outcome",
    limitations: "Synthetic evaluator fixture.",
    screenshots, reports
  };
}

test("accepts a complete synthetic artifact receipt", (t) => {
  const root = temp(t);
  const receipt = reviewFixture(root);
  assert.deepEqual(validateFrontierArtifacts(receipt, root, digest), []);
});

test("rejects stale and tampered evidence", (t) => {
  const root = temp(t);
  const receipt = reviewFixture(root);
  receipt.screenshots[768].after = receipt.screenshots[375].after;
  receipt.reports.provenance.file = "../provenance.json";
  writeFileSync(join(root, ".starlight/frontier-review/interaction.json"), "tampered");
  const failures = validateFrontierArtifacts(receipt, root, "2".repeat(64)).join("\n");
  for (const finding of [
    /digest mismatch/u,
    /768px-wide PNG/u, /plain file name/u, /Artifact hash mismatch/u
  ]) assert.match(failures, finding);
});

test("binds source changes and excludes only the designated evidence directory", (t) => {
  const root = temp(t);
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const commit = (message) => {
    git("add", ".");
    git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", message);
    return git("rev-parse", "HEAD");
  };
  git("init", "-q", "--initial-branch=main");
  writeFileSync(join(root, "app.js"), "baseline\n");
  const base = commit("base");
  writeFileSync(join(root, "app.js"), "candidate\n");
  const beforeEvidence = candidateDigest(root, base, commit("candidate"));
  writeFileSync(join(root, ".starlight/frontier-review/review.json"), "{}\n");
  assert.equal(candidateDigest(root, base, commit("attach evidence")), beforeEvidence);
  writeFileSync(join(root, ".starlight/other.json"), "{}\n");
  assert.notEqual(candidateDigest(root, base, commit("change another path")), beforeEvidence);
});

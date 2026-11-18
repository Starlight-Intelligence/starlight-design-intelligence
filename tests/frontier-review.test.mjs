import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import pngjs from "pngjs";
import { candidateDigest, validateFrontierReview, weights } from "../scripts/validate-frontier-review.mjs";

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
    schema_version: "starlight.frontier_review.v1", candidate_sha256: digest,
    preview_url: "https://example.test/fixture", task: "Fixture task", outcome: "Fixture outcome",
    limitations: "Synthetic evaluator fixture.",
    actors: { maker: "maker", design_critic: "critic", technical_verifier: "tester", brand_verifier: "reviewer" },
    scores: Object.fromEntries(Object.entries(weights).map(([key, points]) =>
      [key, { points, rationale: "Synthetic score for validator coverage" }])),
    critical: {
      identity: { status: "pass", reason: "Fixture reference" },
      functionality: { status: "pass", reason: "Fixture interaction" },
      provenance: { status: "pass", reason: "Fixture source" },
      accessibility: { status: "pass", reason: "Fixture check" },
      publication_authorization: { status: "not_applicable", reason: "Private fixture" }
    },
    screenshots, reports
  };
}

test("accepts a complete synthetic receipt and rejects high-scoring critical failure", (t) => {
  const root = temp(t);
  const receipt = reviewFixture(root);
  assert.deepEqual(validateFrontierReview(receipt, root, digest), []);
  receipt.critical.identity.status = "fail";
  assert.match(validateFrontierReview(receipt, root, digest).join("\n"), /Critical check identity/u);
});

test("rejects stale, self-reviewed, below-bar and tampered evidence", (t) => {
  const root = temp(t);
  const receipt = reviewFixture(root);
  receipt.actors.design_critic = " MAKER ";
  receipt.scores.workflow.points = 9;
  receipt.screenshots[768].after = receipt.screenshots[375].after;
  receipt.reports.provenance.file = "../provenance.json";
  writeFileSync(join(root, ".starlight/frontier-review/interaction.json"), "tampered");
  const failures = validateFrontierReview(receipt, root, "2".repeat(64)).join("\n");
  for (const finding of [
    /digest mismatch/u, /independent of the maker/u, /84\/100 is below 85/u,
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

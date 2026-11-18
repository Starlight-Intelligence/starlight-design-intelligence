import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngjs from "pngjs";

export const weights = Object.freeze({
  workflow: 25, art_direction: 20, media_and_space: 15, functionality: 15,
  identity_and_provenance: 10, performance_and_accessibility: 10, continuity: 5
});
const critical = ["identity", "functionality", "provenance", "accessibility", "publication_authorization"];
const reports = ["interaction", "visual_regression", "accessibility", "performance", "provenance", "continuation"];
const widths = [375, 768, 1440];
const directory = ".starlight/frontier-review";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hash = /^[a-f0-9]{64}$/u;
const commit = /^[a-f0-9]{40}$/u;
const text = (value) => typeof value === "string" && value.trim().length > 0;

export function candidateDigest(repo, base, head) {
  if (!commit.test(base) || !commit.test(head)) throw new Error("Use full base and head commit SHAs");
  const patch = execFileSync("git", [
    "diff", "--binary", "--no-ext-diff", "--no-textconv", "--no-renames",
    "--src-prefix=a/", "--dst-prefix=b/", `${base}...${head}`, "--", ".", `:(exclude)${directory}/**`
  ], { cwd: repo, maxBuffer: 64 * 1024 * 1024 });
  if (!patch.length) throw new Error("No candidate changes outside the evidence directory");
  return sha256(patch);
}

function readEvidence(root, name) {
  if (typeof name !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(name)) throw new Error("Use a plain file name");
  for (const part of [join(root, ".starlight"), join(root, directory)]) {
    if (!lstatSync(part).isDirectory()) throw new Error("Evidence directories must be directories");
  }
  const path = join(root, directory, name);
  const info = lstatSync(path);
  if (!info.isFile() || info.size === 0 || info.size > 15 * 1024 * 1024) {
    throw new Error("Evidence must be a regular file of 1 byte to 15 MiB");
  }
  return readFileSync(path);
}

export function validateFrontierReview(receipt, root, digest) {
  const errors = [];
  if (!receipt || receipt.schema_version !== "starlight.frontier_review.v1") return ["Unsupported review receipt"];
  const demand = (ok, message) => { if (!ok) errors.push(message); };
  demand(hash.test(digest) && receipt.candidate_sha256 === digest, "Candidate diff digest mismatch");
  demand(text(receipt.task) && text(receipt.outcome) && text(receipt.limitations), "Task, outcome and limitations are required");
  let preview;
  try { preview = new URL(receipt.preview_url); } catch { /* Report malformed preview below. */ }
  demand(preview?.protocol === "https:" && !preview.username && !preview.password,
    "An HTTPS candidate preview URL without credentials is required");

  const actors = ["maker", "design_critic", "technical_verifier", "brand_verifier"].map((role) =>
    typeof receipt.actors?.[role] === "string" ? receipt.actors[role].trim().toLowerCase() : "");
  demand(actors.every(Boolean) && !actors.slice(1).includes(actors[0]), "Every reviewer must be independent of the maker");

  let score = 0;
  for (const [criterion, maximum] of Object.entries(weights)) {
    const result = receipt.scores?.[criterion];
    const valid = Number.isInteger(result?.points) && result.points >= 0 && result.points <= maximum;
    demand(valid && text(result?.rationale), `Score and rationale required for ${criterion} (0–${maximum})`);
    if (valid) score += result.points;
  }
  demand(score >= 85, `Weighted score ${score}/100 is below 85`);

  for (const key of critical) {
    const check = receipt.critical?.[key];
    const canWaive = key === "identity" || key === "publication_authorization";
    demand(text(check?.reason) && (check.status === "pass" ||
      (canWaive && check.status === "not_applicable")), `Critical check ${key} requires a passing assessment or an applicable scope explanation`);
  }

  const verifyFile = (entry, label, width) => {
    try {
      if (!hash.test(entry?.sha256)) throw new Error("Missing SHA-256");
      const bytes = readEvidence(root, entry.file);
      if (sha256(bytes) !== entry.sha256) throw new Error("Artifact hash mismatch");
      if (width !== undefined) {
        if (bytes.length < 24 || bytes.readUInt32BE(16) !== width || bytes.readUInt32BE(20) > 12000 ||
            pngjs.PNG.sync.read(bytes).width !== width) throw new Error(`Expected a decodable ${width}px-wide PNG`);
        return;
      }
      const report = JSON.parse(bytes);
      if (report.candidate_sha256 !== digest || report.kind !== label ||
          report.result !== "pass" || !text(report.observation) || !text(report.method)) {
        throw new Error("Expected a candidate-bound passing report with method and observation");
      }
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  };

  for (const width of widths) {
    for (const phase of ["before", "after"]) {
      verifyFile(receipt.screenshots?.[width]?.[phase], `${phase} ${width}px`, width);
    }
  }
  for (const report of reports) verifyFile(receipt.reports?.[report], report);
  return errors;
}

function main([repo, base, head, mode]) {
  if (!repo || !base || !head || (mode && mode !== "--digest")) {
    throw new Error("Usage: node scripts/validate-frontier-review.mjs <repo> <base-sha> <head-sha> [--digest]");
  }
  const current = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  if (current !== head) throw new Error("Expected the candidate head to be checked out");
  const digest = candidateDigest(repo, base, head);
  if (mode === "--digest") return console.log(digest);
  const receipt = JSON.parse(readEvidence(repo, "review.json"));
  const errors = validateFrontierReview(receipt, repo, digest);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Frontier candidate evidence passed structural and artifact checks.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

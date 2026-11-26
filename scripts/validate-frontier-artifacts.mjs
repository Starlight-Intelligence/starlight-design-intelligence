import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngjs from "pngjs";

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

export function validateFrontierArtifacts(receipt, root, digest) {
  const errors = [];
  if (!receipt || receipt.schema_version !== "starlight.frontier_artifacts.v1") return ["Unsupported review receipt"];
  const demand = (ok, message) => { if (!ok) errors.push(message); };
  demand(hash.test(digest) && receipt.candidate_sha256 === digest, "Candidate diff digest mismatch");
  demand(text(receipt.task) && text(receipt.outcome) && text(receipt.limitations), "Task, outcome and limitations are required");
  let preview;
  try { preview = new URL(receipt.preview_url); } catch { /* Report malformed preview below. */ }
  demand(preview?.protocol === "https:" && !preview.username && !preview.password,
    "An HTTPS candidate preview URL without credentials is required");

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
    throw new Error("Usage: node scripts/validate-frontier-artifacts.mjs <repo> <base-sha> <head-sha> [--digest]");
  }
  const current = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  if (current !== head) throw new Error("Expected the candidate head to be checked out");
  const digest = candidateDigest(repo, base, head);
  if (mode === "--digest") return console.log(digest);
  const receipt = JSON.parse(readEvidence(repo, "artifacts.json"));
  const errors = validateFrontierArtifacts(receipt, repo, digest);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Frontier candidate evidence passed structural and artifact checks.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

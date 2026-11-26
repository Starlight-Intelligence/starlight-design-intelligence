import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const statuses = new Set(["added", "removed", "modified", "renamed", "copied", "changed", "unchanged"]);
const commit = /^[a-f0-9]{40}$/u;

function validPath(path) {
  return typeof path === "string" && path.length > 0 && !path.startsWith("/")
    && !path.split("/").some(part => part === "" || part === "." || part === "..");
}

function assertCurrent(event, pr, repository) {
  if (!pr || !event || pr.state !== "open" || event.number !== pr.number
      || !Number.isSafeInteger(pr.number) || pr.number < 1
      || !commit.test(pr.head?.sha) || !commit.test(pr.base?.sha)
      || event.head?.sha !== pr.head.sha || event.base?.sha !== pr.base.sha
      || pr.base?.repo?.full_name !== repository || event.base?.repo?.full_name !== repository
      || !pr.base.ref || event.base.ref !== pr.base.ref) {
    throw new Error("PR, repository, destination or revision changed. Re-run on the current candidate.");
  }
}

export function classify(event, before, pages, after, policy) {
  if (!policy || typeof policy.repository !== "string" || !/^[\w.-]+\/[\w.-]+$/u.test(policy.repository)
      || !Array.isArray(policy.paths) || !policy.paths.length
      || !["external", "repository"].includes(policy.evidence)) {
    throw new Error("An owning repository, literal surface paths and evidence location are required.");
  }
  const exact = new Set();
  const prefixes = [];
  for (const value of policy.paths) {
    const directory = typeof value === "string" && value.endsWith("/");
    const path = directory ? value.slice(0, -1) : value;
    if (!validPath(path) || /[\s*?\[\]\\]/u.test(path)) throw new Error("Use literal paths or directory prefixes.");
    if (directory) prefixes.push(value);
    else exact.add(path);
  }
  assertCurrent(event, before, policy.repository);
  assertCurrent(event, after, policy.repository);
  if (typeof after.base.repo.private !== "boolean" || !after.base.repo.default_branch
      || (policy.evidence === "repository" && !after.base.repo.private)) {
    throw new Error("Repository evidence requires verified private visibility; use external evidence for public repos.");
  }
  const count = after.changed_files;
  if (!Number.isInteger(count) || count < 1 || count > 3000 || before.changed_files !== count
      || !Array.isArray(pages) || pages.some(page => !Array.isArray(page) || !page.length || page.length > 100)) {
    throw new Error("Invalid or incomplete pull request file inventory.");
  }
  const files = pages.flat();
  if (files.length !== count || new Set(files.map(file => file?.filename)).size !== count) {
    throw new Error("Paginated files must include every changed destination exactly once.");
  }

  const affected = new Set();
  for (const file of files) {
    if (!file || !statuses.has(file.status) || !validPath(file.filename)
        || ((file.status === "renamed" || file.status === "copied") && !validPath(file.previous_filename))
        || (file.previous_filename !== undefined && !validPath(file.previous_filename))) {
      throw new Error("GitHub returned an unrecognized file entry.");
    }
    if (policy.evidence === "external" && file.status !== "removed"
        && file.filename.startsWith(".starlight/frontier-review/")) {
      throw new Error("Keep Frontier evidence artifacts in their authorized store for external-evidence review.");
    }
    for (const path of [file.filename, file.previous_filename].filter(Boolean)) {
      if (exact.has(path) || prefixes.some(prefix => path.startsWith(prefix))) affected.add(path);
    }
  }
  const optedIn = pr => {
    if (!Array.isArray(pr.labels)) throw new Error("Missing PR label metadata.");
    return pr.labels.some(label => label.name === "frontier-review");
  };
  if (optedIn(before) !== optedIn(after)) throw new Error("Review scope changed during file enumeration.");
  const isPreview = after.base.ref === policy.previewBranch && after.base.ref !== after.base.repo.default_branch;
  return { covered: affected.size > 0 || optedIn(after), publication: !isPreview, matched: affected.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [before, pages, after] = process.argv.slice(2).map(path => JSON.parse(readFileSync(path, "utf8")));
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const result = classify(event.pull_request, before, pages, after, {
    repository: process.env.GITHUB_REPOSITORY,
    paths: process.env.SURFACE_PATHS.split(/\r?\n/u).map(value => value.trim()).filter(Boolean),
    evidence: process.env.EVIDENCE_LOCATION,
    previewBranch: process.env.PREVIEW_BASE
  });
  appendFileSync(process.env.GITHUB_OUTPUT, `covered=${result.covered}\npublication=${result.publication}\n`);
  console.log(`Inspected ${after.changed_files} file entries. Matched ${result.matched} pilot paths.`);
}

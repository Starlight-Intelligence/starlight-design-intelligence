import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const roleScores = {
  design: { workflow: 25, art_direction: 20, media_spatial: 15 },
  technical: { functionality: 15, performance_accessibility: 10, continuity: 5 },
  identity: { identity_provenance: 10 }
};
const trustedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const decisions = new Set(["APPROVED", "CHANGES_REQUESTED", "DISMISSED"]);
const receiptPattern = /^```frontier-review\s*\n([\s\S]*?)^```[ \t]*$/gm;

function hasExactKeys(value, expected) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === expected.length
    && expected.every((key) => Object.hasOwn(value, key));
}

function isEvidenceUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function evaluateFrontierReview(pr, reviews, publicationRequired, reviewers) {
  const failures = [];
  const author = pr?.user?.login?.toLowerCase();
  const head = pr?.head?.sha;
  if (!author || !/^[a-f0-9]{40}$/.test(head ?? "") || pr.state !== "open") {
    return { score: 0, failures: ["An open PR with an author and immutable head is required."] };
  }

  if (!hasExactKeys(reviewers, Object.keys(roleScores))
    || Object.values(reviewers).some((login) => typeof login !== "string" || !/^[a-z0-9-]{1,39}$/i.test(login))) {
    return { score: 0, failures: ["Configure one GitHub login for each review role."] };
  }
  const roster = Object.fromEntries(Object.entries(reviewers).map(([role, login]) => [role, login.toLowerCase()]));
  if (new Set(Object.values(roster)).size !== 3 || Object.values(roster).includes(author)) {
    return { score: 0, failures: ["The configured roles must be distinct and exclude the PR author."] };
  }

  const latest = new Map();
  for (const review of [...reviews].sort((a, b) => {
    return (Date.parse(a.submitted_at) || 0) - (Date.parse(b.submitted_at) || 0) || a.id - b.id;
  })) {
    const login = review.user?.login?.toLowerCase();
    if (login && decisions.has(review.state)) latest.set(login, review);
  }

  const accepted = new Map();
  for (const [login, review] of latest) {
    if (login === author || review.user.type !== "User" || !trustedAssociations.has(review.author_association)
      || review.state !== "APPROVED" || review.commit_id !== head) continue;
    const blocks = [...(review.body ?? "").matchAll(receiptPattern)];
    if (blocks.length === 0) continue;
    if (blocks.length !== 1) {
      failures.push(`${login} must submit one frontier-review block.`);
      continue;
    }

    let receipt;
    try {
      receipt = JSON.parse(blocks[0][1]);
    } catch {
      failures.push(`${login} submitted invalid review JSON.`);
      continue;
    }

    const role = receipt?.role;
    if (!Object.hasOwn(roleScores, role)) {
      failures.push(`${login} submitted an unknown review role.`);
      continue;
    }
    if (roster[role] !== login) {
      failures.push(`${login} is not designated for the ${role} role.`);
      continue;
    }

    const critical = {
      design: {},
      technical: { functionality: "pass", accessibility: "pass" },
      identity: {
        identity: "pass",
        provenance: "pass",
        publication_authorization: publicationRequired ? "pass" : "not-requested"
      }
    }[role];
    const fields = ["role", "candidate", "evidence", "scores"];
    if (role !== "design") fields.push("critical");
    if (!hasExactKeys(receipt, fields) || !isEvidenceUrl(receipt.candidate)
      || !Array.isArray(receipt.evidence) || receipt.evidence.length === 0
      || !receipt.evidence.every(isEvidenceUrl)) {
      failures.push(`${role} requires the prescribed receipt and HTTPS evidence links.`);
      continue;
    }
    if (!hasExactKeys(receipt.scores, Object.keys(roleScores[role]))
      || Object.entries(roleScores[role]).some(([key, max]) => {
        const score = receipt.scores[key];
        return !Number.isInteger(score) || score < 0 || score > max;
      })) {
      failures.push(`${role} scores are missing or out of range.`);
      continue;
    }
    if (role !== "design" && (!hasExactKeys(receipt.critical, Object.keys(critical))
      || Object.entries(critical).some(([key, required]) => receipt.critical[key] !== required))) {
      failures.push(`${role} has a failed, missing or out-of-scope critical check.`);
      continue;
    }
    accepted.set(role, receipt);
  }

  for (const role of Object.keys(roleScores)) {
    if (!accepted.has(role)) failures.push(`Missing current independent approval for ${role}.`);
  }
  if (new Set([...accepted.values()].map((receipt) => receipt.candidate)).size > 1) {
    failures.push("All reviewers must reference the same candidate.");
  }
  const score = [...accepted.values()].flatMap((receipt) => Object.values(receipt.scores))
    .reduce((total, value) => total + value, 0);
  if (score < 85) failures.push("The minimum score is 85/100.");
  return { score, failures };
}

function main([prFile, reviewsFile, publicationScope, eventHead]) {
  const pr = JSON.parse(readFileSync(prFile, "utf8"));
  const reviewPages = JSON.parse(readFileSync(reviewsFile, "utf8"));
  if (!["true", "false"].includes(publicationScope) || pr.head?.sha !== eventHead) {
    throw new Error("Publication scope must be explicit and the workflow head must still be current.");
  }
  const result = evaluateFrontierReview(pr, reviewPages.flat(), publicationScope === "true", JSON.parse(process.env.FRONTIER_REVIEWERS || "{}"));
  process.exitCode = result.failures.length ? 1 : 0;
  console.log(`Frontier Experience Review: ${result.score}/100`);
  for (const failure of result.failures) console.log(`- ${failure}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}

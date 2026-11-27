import assert from "node:assert/strict";
import test from "node:test";
import { evaluateFrontierReview } from "../scripts/validate-frontier-review.mjs";

const head = "a".repeat(40);
const pr = { head: { sha: head }, user: { login: "maker" }, state: "open" };
const candidate = "https://example.com/candidate";
const design = { role: "design", scores: { workflow: 24, art_direction: 18, media_spatial: 13 } };
const technical = {
  role: "technical",
  scores: { functionality: 14, performance_accessibility: 9, continuity: 5 },
  critical: { functionality: "pass", accessibility: "pass" }
};
const identity = {
  role: "identity",
  scores: { identity_provenance: 10 },
  critical: { identity: "pass", provenance: "pass", publication_authorization: "not-requested" }
};

function approval(id, receipt, metadata = {}) {
  const payload = { candidate, evidence: ["https://example.com/evidence"], ...receipt };
  return {
    id,
    user: { login: `reviewer-${id}`, type: "User" },
    author_association: "MEMBER",
    state: "APPROVED",
    commit_id: head,
    body: `Observed the candidate.\n\n\`\`\`frontier-review\n${JSON.stringify(payload)}\n\`\`\``,
    ...metadata
  };
}
const valid = [approval(1, design), approval(2, technical), approval(3, identity)];
const reviewers = { design: "reviewer-1", technical: "reviewer-2", identity: "reviewer-3" };
const check = (reviews, publish = false) => evaluateFrontierReview(pr, reviews, publish, reviewers);

test("accepts three current independent scoped approvals with sufficient evidence points", () => {
  assert.deepEqual(check(valid), { score: 93, failures: [] });
  const authorized = { ...identity, critical: { ...identity.critical, publication_authorization: "pass" } };
  assert.deepEqual(check([valid[0], valid[1], approval(3, authorized)], true), { score: 93, failures: [] });
});

test("rejects weak scores and invalid evidence metrics", () => {
  const weak = approval(1, { ...design, scores: { workflow: 4, art_direction: 8, media_spatial: 3 } });
  assert.match(check([weak, ...valid.slice(1)]).failures.join(), /minimum/);
  const inflated = approval(1, { ...design, scores: { ...design.scores, workflow: 26 } });
  assert.match(check([inflated, ...valid.slice(1)]).failures.join(), /out of range/);
});

test("excludes stale, self, bot, outsider or dismissed approvals", () => {
  const disqualified = [
    { commit_id: "b".repeat(40) },
    { user: { login: "Maker", type: "User" } },
    { user: { login: "automation", type: "Bot" } },
    { author_association: "CONTRIBUTOR" },
    { state: "DISMISSED" }
  ];
  for (const metadata of disqualified) {
    assert.match(check([approval(1, design, metadata), ...valid.slice(1)]).failures.join(), /Missing.*design/);
  }
  assert.match(check([...valid, { ...valid[0], id: 10, state: "CHANGES_REQUESTED" }]).failures.join(), /Missing.*design/);
  assert.match(check([...valid, { ...valid[0], id: 10, state: "DISMISSED" }]).failures.join(), /Missing.*design/);
  assert.equal(check([...valid, { ...valid[0], id: 10, state: "COMMENTED" }]).failures.length, 0);
  assert.match(check([valid[0], { ...valid[1], user: valid[0].user }, valid[2]]).failures.join(), /Missing.*design/);
});

test("rejects critical failures even when the documented scores are high", () => {
  for (const [index, receipt, checkName] of [
    [1, technical, "functionality"],
    [1, technical, "accessibility"],
    [2, identity, "identity"],
    [2, identity, "provenance"]
  ]) {
    const reviews = [...valid];
    reviews[index] = approval(index + 1, { ...receipt, critical: { ...receipt.critical, [checkName]: "fail" } });
    assert.match(check(reviews).failures.join(), /critical check/);
  }
  assert.match(check(valid, true).failures.join(), /critical check/);
});

test("rejects split candidates, ambiguous roles and missing evidence links", () => {
  assert.match(check([approval(1, { ...design, candidate: "https://example.com/different" }), ...valid.slice(1)]).failures.join(), /same candidate/);
  assert.match(check([...valid, approval(4, design)]).failures.join(), /not designated/);
  assert.match(check([approval(1, { ...design, evidence: ["file:///evidence"] }), ...valid.slice(1)]).failures.join(), /HTTPS/);
});


test("decides by submission time and requires a properly separated role roster", () => {
  const prior = { ...valid[0], id: 10, submitted_at: "2026-11-18T20:00:00Z", state: "CHANGES_REQUESTED" };
  const later = { ...valid[0], submitted_at: "2026-11-18T21:00:00Z" };
  assert.equal(check([later, prior, ...valid.slice(1)]).failures.length, 0);
  assert.match(evaluateFrontierReview(pr, valid, false, {}).failures.join(), /Configure/);
  assert.match(evaluateFrontierReview(pr, valid, false, { ...reviewers, design: "MAKER" }).failures.join(), /exclude/);
  assert.match(evaluateFrontierReview(pr, valid, false, { ...reviewers, design: "Reviewer-2" }).failures.join(), /distinct/);
});

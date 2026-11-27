import test from "node:test";
import assert from "node:assert/strict";
import { classify as classifyWithPolicy } from "../scripts/classify-frontier-surface.mjs";

const preview = "review-stack";
const policy = {repository: "example/site", paths: ["app/page.tsx","app/globals.css","app/layout.tsx","public/assets/","components/site/"], evidence: "external", previewBranch: preview};
const classify = (event, before, pages, after) => classifyWithPolicy(event, before, pages, after, policy);
function pr(count, ref = "main") {
  return { number: 2, state: "open", head: { sha: "a".repeat(40) }, base: {
    sha: "b".repeat(40), ref, repo: { full_name: "example/site", private: true, default_branch: "main" }
  }, changed_files: count, labels: [] };
}
const entry = filename => ({ status: "modified", filename });
function scope(files, ref) {
  const data = pr(files.length, ref);
  return classify(data, data, [files], data);
}

test("unlabeled shared shell requires publication receipts on main", () => {
  assert.deepEqual(scope([entry("components/site/SiteHeader.tsx")]), {covered: true, publication: true, matched: 1});
});
test("only the named review stack accepts preview receipts", () => {
  assert.equal(scope([entry("app/page.tsx")], preview).publication, false);
  assert.equal(scope([entry("app/page.tsx")], "release").publication, true);
});
test("unrelated documentation is outside the bounded scope", () => {
  assert.equal(scope([entry("docs/notes.md"), entry("components/homework/a.tsx")]).covered, false);
});
test("removals and both sides of renames count", () => {
  for (const file of [
    {status: "removed", filename: "public/assets/hero.webm"},
    {status: "renamed", previous_filename: "app/globals.css", filename: "docs/styles.css"},
    {status: "renamed", previous_filename: "docs/styles.css", filename: "app/globals.css"}
  ]) assert.equal(scope([file]).covered, true);
});
test("covered path on page two counts", () => {
  const data = pr(101);
  const documents = Array.from({length: 100}, (_, i) => entry(`docs/${i}.md`));
  assert.equal(classify(data, data, [documents, [entry("app/layout.tsx")]], data).covered, true);
});
test("missing, duplicate and capped inventories reject", () => {
  for (const [count, files] of [[2, [entry("docs/a")]], [2, [entry("docs/a"), entry("docs/a")]], [3001, [entry("docs/a")]], [0, []]]) {
    const data = pr(count);
    assert.throws(() => classify(data, data, [files], data));
  }
});
test("malformed entries reject", () => {
  for (const file of [null, {status: "renamed", filename: "docs/new"}, entry("../app/page.tsx"), {status: "unknown", filename: "docs/a"}]) {
    assert.throws(() => scope([file]));
  }
});
test("changed candidate, retargeting and mid-read count changes reject", () => {
  const data = pr(1);
  for (const after of [{...data, head: {sha: "c".repeat(40)}}, pr(1, preview),
    pr(2), {...data, base: {...data.base, sha: "c".repeat(40)}}, {...data, state: "closed"}]) {
    assert.throws(() => classify(data, data, [[entry("docs/a")]], after));
  }
});

test("the existing opt-in can add an unrelated PR to review; it is optional on covered changes", () => {
  const data = {...pr(1, preview), labels: [{name: "frontier-review"}]};
  assert.equal(classify(data, data, [[entry("docs/notes.md")]], data).covered, true);
  assert.throws(() => classify(data, data, [[entry("docs/notes.md")]], {...data, labels: []}));
});

test("public evidence stays external and the default branch always needs publication", () => {
  const p = pr(1);
  p.base.repo.private = false;
  const files = [[entry("app/page.tsx")]];
  assert.equal(classifyWithPolicy(p,p,files,p,{...policy,previewBranch:"main"}).publication,true);
  assert.throws(() => classifyWithPolicy(p,p,files,p,{...policy,evidence:"repository"}));
  assert.throws(() => classify(p,p,[[entry(".starlight/frontier-review/pixels.png")]],p));
  assert.doesNotThrow(() => classify(p,p,[[{status:"removed",filename:".starlight/frontier-review/pixels.png"}]],p));
});
test("a private evidence store must be explicitly selected", () => {
  const p = pr(1);
  const files = [[entry(".starlight/frontier-review/receipt.json")]];
  assert.doesNotThrow(() => classifyWithPolicy(p,p,files,p,{...policy,evidence:"repository"}));
  assert.throws(() => classifyWithPolicy(p,p,files,p,{...policy,evidence:"other"}));
});
test("paths must be literals and the owner must match GitHub", () => {
  const p=pr(1);
  for (const patch of [{paths:[]},{paths:["**"]},{paths:["../app/"]},{repository:"other/site"}]) {
    assert.throws(() => classifyWithPolicy(p,p,[[entry("docs/a")]],p,{...policy,...patch}));
  }
});

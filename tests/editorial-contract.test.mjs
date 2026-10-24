import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("installer preserves host instructions and updates one managed block", () => {
  const repo = mkdtempSync(join(tmpdir(), "editorial-contract-"));
  writeFileSync(join(repo, "AGENTS.md"), "# Host rules\n\nKeep this line.\n");
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: process.cwd(), encoding: "utf8" }).trim();
  const args = [
    "scripts/install-editorial-contract.mjs",
    "--repo-root",
    repo,
    "--brand",
    "frankx",
    "--source-ref",
    sha
  ];
  execFileSync("node", args, { cwd: process.cwd() });
  execFileSync("node", args, { cwd: process.cwd() });
  const agents = readFileSync(join(repo, "AGENTS.md"), "utf8");
  assert.match(agents, /Keep this line\./u);
  assert.equal((agents.match(/STARLIGHT-EDITORIAL:START/gu) ?? []).length, 1);
  const contract = JSON.parse(readFileSync(join(repo, ".starlight/editorial-contract.json"), "utf8"));
  assert.equal(contract.brand_id, "frankx");
  assert.equal(contract.source.ref, sha);
  assert.equal(contract.source.repository, "Starlight-Intelligence/starlight-design-intelligence");
  const workflow = readFileSync(
    join(repo, ".github/workflows/starlight-editorial-contract.yml"),
    "utf8"
  );
  assert.match(
    workflow,
    new RegExp(`uses: Starlight-Intelligence/starlight-design-intelligence/\\.github/workflows/editorial-contract\\.yml@${sha}`, "u")
  );
});

test("registry profiles exist and the reusable workflow checks out the canonical kernel", () => {
  const registry = JSON.parse(readFileSync("editorial/brand-registry.json", "utf8"));
  for (const [id, brand] of Object.entries(registry.brands)) {
    assert.ok(existsSync(brand.profile), `${id} profile missing: ${brand.profile}`);
  }
  for (const target of Object.values(registry.aliases)) assert.ok(registry.brands[target], `alias target ${target}`);
  const reusable = readFileSync(".github/workflows/editorial-contract.yml", "utf8");
  assert.match(reusable, /repository: Starlight-Intelligence\/starlight-design-intelligence\r?\n/u);
  assert.doesNotMatch(reusable, /frankxai\//u);
});

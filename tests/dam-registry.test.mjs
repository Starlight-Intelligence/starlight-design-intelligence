import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { exportBrandHandoff } from "../scripts/export-brand-handoff.mjs";
import { loadBrandHostMap, validateDamRegistry, validateHandoffManifest } from "../scripts/validate-dam-registry.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI_PATH = fileURLToPath(new URL("../scripts/validate-dam-registry.mjs", import.meta.url));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function makeSampleFixture({ brandId = "sis", site = "starlightintelligence.ai" } = {}) {
  const outputSha = sha256("approved-hero-output-bytes");
  const evidenceSha = sha256("independent-release-evidence-bytes");
  const assetId = `asset_${"1".repeat(24)}`;
  const versionId = `ver_${"a".repeat(32)}`;

  const registry = {
    schemaVersion: "starlight.assetRegistry.v1",
    assets: [
      {
        id: `${brandId}/2026-11-27-horizon-hero`,
        jobId: "2026-11-27-horizon-hero",
        brandId,
        workflowId: "website-hero",
        status: "file-verified",
        registeredAt: "2026-11-27T04:00:00Z",
        fingerprint: sha256("fingerprint-1"),
        job: { path: "jobs/2026-11-27-horizon-hero/media-job.json", sha256: sha256("job") },
        binding: { path: "jobs/2026-11-27-horizon-hero/vis-receipt.json", sha256: sha256("binding") },
        evidence: { path: "jobs/2026-11-27-horizon-hero/release-evidence.json", sha256: evidenceSha },
        approvalAssertion: {
          approver: "Frank Riemer",
          reviewedAt: "2026-11-27T03:55:00Z",
          notes: "Approved after desktop and mobile visual inspection.",
        },
        outputs: [
          {
            path: "jobs/2026-11-27-horizon-hero/hero.webp",
            sha256: outputSha,
            bytes: 48200,
            assetId,
            versionId,
            rightsStatus: "generated-owned",
            provenance: {
              path: "jobs/2026-11-27-horizon-hero/hero.webp.vis.provenance.json",
              sha256: sha256("sidecar"),
            },
          },
        ],
        usedIn: [
          {
            site,
            route: "/intelligence",
            component: "HorizonHero",
            date: "2026-11-27",
            context: "Primary hero banner on Starlight homepage",
          },
        ],
      },
    ],
  };

  const visBinding = {
    schemaVersion: "starlight.visAssetEvidenceBinding.v1",
    assets: [
      {
        outputPath: "jobs/2026-11-27-horizon-hero/hero.webp",
        assetId,
        versionId,
        sha256: outputSha,
        rightsStatus: "generated-owned",
        approvalStatus: "approved",
        provenanceEventId: "evt_20261127_001",
        provenanceEventType: "approved",
        lineage: { kind: "source" },
      },
    ],
    releaseEvidence: {
      releaseRecordId: "rel_20261127_sis_hero",
      evidencePath: "jobs/2026-11-27-horizon-hero/release-evidence.json",
      evidenceSha256: evidenceSha,
      recordedAt: "2026-11-27T03:56:00Z",
    },
  };

  return { registry, visBinding };
}

test("committed runtime asset-registry.json validates cleanly", () => {
  const registry = JSON.parse(readFileSync(join(REPO_ROOT, "brand-image-system/runtime/asset-registry.json"), "utf8"));
  const report = validateDamRegistry({ registry, brandHostMap: loadBrandHostMap(REPO_ROOT) });
  assert.equal(report.valid, true, report.errors.join("\n"));
  assert.equal(report.assetCount, 0);
});

test("links export-brand-handoff.mjs manifest to SHA-256 VIS binding and usedIn placements end-to-end", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "sdi-dam-handoff-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const rel of [
    "brand-packs",
    "brand-image-system/runtime/brands",
    "portfolio",
    "evals",
    "playbooks",
    "schemas",
    "templates/app-factory",
  ]) {
    cpSync(join(REPO_ROOT, rel), join(dir, rel), { recursive: true });
  }
  const git = (args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  git(["init", "-q"]);
  git(["config", "user.name", "DAM test"]);
  git(["config", "user.email", "tests@starlightintelligence.org"]);
  git(["remote", "add", "origin", "https://github.com/Starlight-Intelligence/starlight-design-intelligence.git"]);
  git(["add", "."]);
  git(["commit", "-qm", "dam handoff fixture"]);

  const out = join(dir, "handoff-sis");
  const handoffManifest = exportBrandHandoff({ root: dir, brand: "sis", out });
  assert.deepEqual(validateHandoffManifest(handoffManifest), []);

  const { registry, visBinding } = makeSampleFixture({ brandId: "sis", site: "starlightintelligence.ai" });
  const report = validateDamRegistry({
    registry,
    visBindings: [visBinding],
    handoffManifest,
    brandHostMap: loadBrandHostMap(REPO_ROOT),
  });
  assert.equal(report.valid, true, report.errors.join("\n"));
  assert.equal(report.handoffLinked, true);
  assert.equal(report.boundOutputCount, 1);
  assert.equal(report.usageEdgeCount, 1);
});

test("rejects missing VIS binding, SHA-256 mismatch, revoked rights, and evidence mismatch (SDI#12)", () => {
  const { registry, visBinding } = makeSampleFixture();

  const missing = validateDamRegistry({ registry, visBindings: [] });
  assert.equal(missing.valid, false);
  assert.match(missing.errors.join("\n"), /missing VIS asset binding/);

  const hashDrift = structuredClone(visBinding);
  hashDrift.assets[0].sha256 = "0".repeat(64);
  const badHash = validateDamRegistry({ registry, visBindings: [hashDrift] });
  assert.equal(badHash.valid, false);
  assert.match(badHash.errors.join("\n"), /sha256 mismatch/);

  const rightsDrift = structuredClone(visBinding);
  rightsDrift.assets[0].rightsStatus = "revoked";
  const badRights = validateDamRegistry({ registry, visBindings: [rightsDrift] });
  assert.equal(badRights.valid, false);

  const evidenceDrift = structuredClone(visBinding);
  evidenceDrift.releaseEvidence.evidenceSha256 = "f".repeat(64);
  const badEvidence = validateDamRegistry({ registry, visBindings: [evidenceDrift] });
  assert.equal(badEvidence.valid, false);
  assert.match(badEvidence.errors.join("\n"), /evidenceSha256 mismatch/);
});

test("rejects duplicate usedIn edges, cross-brand handoff mismatch, and unowned placement sites", () => {
  const { registry, visBinding } = makeSampleFixture({ brandId: "sis", site: "starlightintelligence.ai" });

  // Duplicate usedIn edge
  const dup = structuredClone(registry);
  dup.assets[0].usedIn.push(structuredClone(dup.assets[0].usedIn[0]));
  const dupRes = validateDamRegistry({ registry: dup, visBindings: [visBinding] });
  assert.equal(dupRes.valid, false);
  assert.match(dupRes.errors.join("\n"), /duplicate usage edge/);

  // Unowned site for brand
  const wrongSite = structuredClone(registry);
  wrongSite.assets[0].usedIn[0].site = "unrelated-domain.example";
  const siteRes = validateDamRegistry({
    registry: wrongSite,
    visBindings: [visBinding],
    brandHostMap: new Map([["sis", new Set(["starlightintelligence.ai", "starlightintelligence.org"])]]),
  });
  assert.equal(siteRes.valid, false);
  assert.match(siteRes.errors.join("\n"), /not registered for brand/);

  // Cross-brand handoff manifest
  const wrongHandoff = {
    schema_version: "starlight.brand_handoff.v1",
    brand_id: "arcanea",
    kernel_commit_sha: "a".repeat(40),
    brand_pack_path: "brand-image-system/runtime/brands/arcanea/brand-pack.json",
    brand_pack_sha256: "b".repeat(64),
    sources: [{ path: "brand-image-system/runtime/brands/arcanea/brand-pack.json", sha256: "b".repeat(64) }],
  };
  const brandRes = validateDamRegistry({
    registry,
    visBindings: [visBinding],
    handoffManifest: wrongHandoff,
  });
  assert.equal(brandRes.valid, false);
  assert.match(brandRes.errors.join("\n"), /disagrees with handoff manifest/);
});

test("CLI validates fixtures cross-platform and exits non-zero on invalid binding", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "sdi-dam-cli-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { registry, visBinding } = makeSampleFixture();
  const regPath = join(dir, "registry.json");
  const bindPath = join(dir, "binding.json");
  writeFileSync(regPath, JSON.stringify(registry, null, 2));
  writeFileSync(bindPath, JSON.stringify(visBinding, null, 2));

  const out = execFileSync(process.execPath, [CLI_PATH, "--registry", regPath, "--bindings", bindPath, "--json"], {
    encoding: "utf8",
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.boundOutputCount, 1);

  assert.throws(
    () => execFileSync(process.execPath, [CLI_PATH, "--registry", regPath, "--json"], { stdio: "pipe" }),
    { status: 1 }
  );
});

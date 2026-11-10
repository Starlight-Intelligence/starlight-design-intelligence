import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateAssetRegistry } from "../scripts/validate-asset-registry.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function releasedAsset() {
  return {
    asset_id: "frankx-command-proof-v1",
    brand_id: "frankx",
    surface_mode: "founder-led-proof",
    role: "website-hero",
    lifecycle: "released",
    decision: "approved",
    maker: { kind: "cli", id: "maker" },
    reviewer: { kind: "cli", id: "reviewer" },
    approver: { kind: "human", id: "operator" },
    integrator: { kind: "cli", id: "integrator" },
    source: {
      kind: "owned-capture",
      provider_or_origin: "FrankX product",
      model: null,
      created_at: "2026-08-06T18:00:00Z",
      prompt_digest: null,
      evidence_uri: "receipt://asset/source"
    },
    rights: {
      status: "owned",
      basis: "First-party product capture",
      terms_version: "2026-08-06",
      restrictions: []
    },
    file: {
      repository_path: "public/assets/frankx-command-proof-v1.png",
      sha256: "a".repeat(64),
      detected_mime: "image/png",
      bytes: 1024,
      width: 1280,
      height: 720,
      color_space: "sRGB",
      source_asset_id: null
    },
    brand_pack: {
      path: "brand-packs/frankx/DESIGN.md",
      commit: "b".repeat(40)
    },
    intended_destination: {
      repository: "frankxai/frankx.ai-vercel-website",
      path: "public/assets/frankx-command-proof-v1.png",
      surface_id: "homepage-hero",
      route: "/"
    },
    accessibility: {
      alt_intent: "Decorative product-system atmosphere.",
      decorative: true,
      text_baked_in: false,
      responsive_behavior: "Art-directed crop preserves semantic HTML copy.",
      reduced_motion_behavior: null
    },
    quality: {
      rubric: "evals/generated-asset-quality-gate.md",
      rubric_version: "2026-08-06",
      score30: 27,
      review_uri: "receipt://asset/review"
    },
    used_in: [{
      repository: "frankxai/frankx.ai-vercel-website",
      commit: "c".repeat(40),
      route_or_channel: "/",
      verified_at: "2026-08-06T19:00:00Z",
      release_evidence_uri: "receipt://asset/release"
    }],
    retention: {
      class: "product-proof",
      stale_after: "2027-02-06",
      archive_reason: null
    },
    duplicate_of: null
  };
}

test("canonical released registry is honest and schema-valid", () => {
  const registry = loadJson("brand-image-system/runtime/asset-registry.json");
  assert.deepEqual(validateAssetRegistry(registry, { root }), []);
  assert.equal(registry.authority, "tracked-approved-released-only");
  assert.equal(registry.assets.length, 0);
});

test("released asset rejects self-approval", () => {
  const asset = releasedAsset();
  asset.approver = asset.maker;
  const registry = {
    schema_version: "starlight.asset_registry.v1",
    updated_at: "2026-08-06T19:00:00Z",
    authority: "tracked-approved-released-only",
    candidate_registry: "C:/Users/frank/.agent-harness/brand-media-registry.json",
    assets: [asset]
  };
  assert.ok(validateAssetRegistry(registry, { root }).some((failure) => failure.includes("independent")));
});

test("released asset rejects MIME-extension mismatch", () => {
  const asset = releasedAsset();
  asset.file.detected_mime = "image/jpeg";
  const registry = {
    schema_version: "starlight.asset_registry.v1",
    updated_at: "2026-08-06T19:00:00Z",
    authority: "tracked-approved-released-only",
    candidate_registry: "C:/Users/frank/.agent-harness/brand-media-registry.json",
    assets: [asset]
  };
  assert.ok(validateAssetRegistry(registry, { root }).some((failure) => failure.includes("MIME")));
});

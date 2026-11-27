#!/usr/bin/env node
/**
 * Release-evidence <-> VIS asset binding & `asset-registry.json` usage-edge validator.
 * Links `export-brand-handoff.mjs` (`starlight.brand_handoff.v1`) manifests to SHA-256
 * VIS records (`starlight.visAssetEvidenceBinding.v1`) and `usedIn` placements per
 * SDI#12 and `brand-image-system/runtime/dam/ASSET_MANAGEMENT_SYSTEM.md`.
 *
 * Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_REGISTRY_PATH = join(REPO_ROOT, "brand-image-system/runtime/asset-registry.json");
const ASSET_REGISTRY_SCHEMA_PATH = join(REPO_ROOT, "brand-image-system/runtime/schemas/asset-registry.schema.json");
const VIS_BINDING_SCHEMA_PATH = join(REPO_ROOT, "brand-image-system/runtime/schemas/vis-asset-evidence-binding.schema.json");
const CORE_SURFACES_PATH = join(REPO_ROOT, "portfolio/core-surfaces.json");

const SHA256_RE = /^[a-f0-9]{64}$/;
const COMMIT_SHA_RE = /^[a-f0-9]{40}$/;
const ALLOWED_RIGHTS = new Set(["owned", "generated-owned", "licensed"]);
const UNSAFE_PLACEMENT_RE = /(?:javascript:|data:|vbscript:|\.\.|\\|\0)/i;

function createValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const registrySchema = JSON.parse(readFileSync(ASSET_REGISTRY_SCHEMA_PATH, "utf8"));
  const visBindingSchema = JSON.parse(readFileSync(VIS_BINDING_SCHEMA_PATH, "utf8"));
  return {
    validateRegistrySchema: ajv.compile(registrySchema),
    validateVisBindingSchema: ajv.compile(visBindingSchema),
  };
}

function formatAjvErrors(prefix, errors = []) {
  return (errors || []).map((err) => `${prefix}${err.instancePath || "/"} ${err.message}`);
}

/**
 * Loads known brand -> allowed hostnames map from `portfolio/core-surfaces.json` (optional).
 */
export function loadBrandHostMap(root = REPO_ROOT) {
  const path = join(root, "portfolio/core-surfaces.json");
  if (!existsSync(path)) return new Map();
  const data = JSON.parse(readFileSync(path, "utf8"));
  const byBrand = new Map();
  for (const repo of data.repositories || []) {
    const brandId = repo.brand_id;
    if (!brandId) continue;
    if (!byBrand.has(brandId)) byBrand.set(brandId, new Set());
    for (const surface of repo.surfaces || []) {
      const host = surface.host || surface.domain;
      if (typeof host === "string" && host.trim()) {
        byBrand.get(brandId).add(host.trim().toLowerCase());
      }
      if (typeof surface.url === "string") {
        try {
          byBrand.get(brandId).add(new URL(surface.url).hostname.toLowerCase());
        } catch {
          // ignore non-URL surface descriptors
        }
      }
    }
  }
  return byBrand;
}

/**
 * Validates `export-brand-handoff.mjs` (`starlight.brand_handoff.v1`) manifest integrity.
 */
export function validateHandoffManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["handoff manifest must be a JSON object"];
  }
  if (manifest.schema_version !== "starlight.brand_handoff.v1") {
    errors.push(`handoff manifest schema_version must be "starlight.brand_handoff.v1" (got ${JSON.stringify(manifest.schema_version)})`);
  }
  if (typeof manifest.brand_id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(manifest.brand_id)) {
    errors.push("handoff manifest requires a valid lowercase brand_id");
  }
  if (typeof manifest.kernel_commit_sha !== "string" || !COMMIT_SHA_RE.test(manifest.kernel_commit_sha)) {
    errors.push("handoff manifest kernel_commit_sha must be a 40-character lowercase SHA");
  }
  if (typeof manifest.brand_pack_sha256 !== "string" || !SHA256_RE.test(manifest.brand_pack_sha256)) {
    errors.push("handoff manifest brand_pack_sha256 must be a 64-character lowercase SHA-256");
  }
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    errors.push("handoff manifest must include at least one hashed source record");
  } else {
    const seenPaths = new Set();
    for (const src of manifest.sources) {
      if (!src || typeof src.path !== "string" || !src.path.trim()) {
        errors.push("handoff source record missing path");
        continue;
      }
      if (seenPaths.has(src.path)) {
        errors.push(`handoff manifest has duplicate source path: ${src.path}`);
      }
      seenPaths.add(src.path);
      if (typeof src.sha256 !== "string" || !SHA256_RE.test(src.sha256)) {
        errors.push(`handoff source ${src.path} has invalid sha256`);
      }
    }
    const brandPackRecord = manifest.sources.find((s) => s.path === manifest.brand_pack_path);
    if (!brandPackRecord || brandPackRecord.sha256 !== manifest.brand_pack_sha256) {
      errors.push("handoff brand_pack_sha256 does not match its entry in sources[]");
    }
  }
  return errors;
}

/**
 * Validates `usedIn` placement edges for a single registry entry.
 */
export function validateUsageEdges(entry, { allowedHostsForBrand } = {}) {
  const errors = [];
  const edges = entry.usedIn ?? [];
  const seen = new Set();

  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const label = `${entry.id}.usedIn[${i}]`;
    const fields = [edge.site, edge.route, edge.profile, edge.postId, edge.component, edge.context].filter(Boolean);
    if (fields.some((f) => UNSAFE_PLACEMENT_RE.test(String(f)))) {
      errors.push(`${label}: contains forbidden URI scheme or path traversal`);
      continue;
    }
    if (!edge.route && !edge.profile && !edge.postId) {
      errors.push(`${label}: placement edge must specify at least one of route, profile, or postId`);
    }
    const normalizedSite = String(edge.site || "").toLowerCase();
    const dedupeKey = `${normalizedSite}|${edge.route || ""}|${edge.profile || ""}|${edge.postId || ""}|${edge.component || ""}`;
    if (seen.has(dedupeKey)) {
      errors.push(`${label}: duplicate usage edge (${dedupeKey})`);
    }
    seen.add(dedupeKey);

    if (allowedHostsForBrand && allowedHostsForBrand.size > 0 && !allowedHostsForBrand.has(normalizedSite)) {
      const baseHost = normalizedSite.replace(/^www\./, "");
      const matched = [...allowedHostsForBrand].some((h) => h === normalizedSite || h.replace(/^www\./, "") === baseHost);
      if (!matched) {
        errors.push(`${label}: site "${normalizedSite}" is not registered for brand "${entry.brandId}"`);
      }
    }
  }

  return { errors, edgeCount: edges.length };
}

/**
 * Validates `asset-registry.json` entries, release-evidence <-> VIS asset bindings,
 * `usedIn` placement edges, and optional `export-brand-handoff.mjs` manifests.
 */
export function validateDamRegistry({
  registry,
  visBindings = [],
  handoffManifest = null,
  brandHostMap = null,
  requireVisBindings = true,
} = {}) {
  const { validateRegistrySchema, validateVisBindingSchema } = createValidators();
  const errors = [];
  const warnings = [];

  if (!validateRegistrySchema(registry)) {
    errors.push(...formatAjvErrors("asset-registry", validateRegistrySchema.errors));
    return {
      schemaVersion: "starlight.damRegistryValidation.v1",
      valid: false,
      assetCount: 0,
      outputCount: 0,
      boundOutputCount: 0,
      usageEdgeCount: 0,
      handoffLinked: false,
      errors,
      warnings,
    };
  }

  // Index VIS binding records by (assetId + versionId) and by releaseEvidence.evidenceSha256
  const bindingByAssetVersion = new Map();
  const bindingByEvidenceSha = new Map();
  const bindingList = Array.isArray(visBindings) ? visBindings : visBindings ? [visBindings] : [];

  for (let i = 0; i < bindingList.length; i += 1) {
    const binding = bindingList[i];
    if (!validateVisBindingSchema(binding)) {
      errors.push(...formatAjvErrors(`visBinding[${i}]`, validateVisBindingSchema.errors));
      continue;
    }
    const evSha = binding.releaseEvidence.evidenceSha256;
    bindingByEvidenceSha.set(evSha, binding);
    for (const asset of binding.assets) {
      const key = `${asset.assetId}::${asset.versionId}`;
      if (bindingByAssetVersion.has(key)) {
        errors.push(`visBinding[${i}]: duplicate VIS binding for ${key}`);
        continue;
      }
      bindingByAssetVersion.set(key, { asset, releaseEvidence: binding.releaseEvidence });
    }
  }

  // Validate derivative lineage references across the indexed bindings
  for (const [key, { asset }] of bindingByAssetVersion.entries()) {
    if (asset.lineage?.kind === "derivative") {
      const parentKey = `${asset.lineage.sourceAssetId}::${asset.lineage.sourceVersionId}`;
      if (parentKey === key) {
        errors.push(`visBinding(${key}): derivative lineage cannot reference itself`);
      }
    }
  }

  let handoffLinked = false;
  if (handoffManifest !== null) {
    const handoffErrors = validateHandoffManifest(handoffManifest);
    errors.push(...handoffErrors);
    handoffLinked = handoffErrors.length === 0;
  }

  const seenIds = new Set();
  let outputCount = 0;
  let boundOutputCount = 0;
  let usageEdgeCount = 0;

  for (const entry of registry.assets) {
    if (seenIds.has(entry.id)) {
      errors.push(`asset-registry: duplicate entry id "${entry.id}"`);
    }
    seenIds.add(entry.id);

    if (handoffManifest && handoffManifest.brand_id && entry.brandId !== handoffManifest.brand_id) {
      errors.push(`${entry.id}: brandId "${entry.brandId}" disagrees with handoff manifest brand_id "${handoffManifest.brand_id}"`);
    }

    const allowedHosts = brandHostMap instanceof Map ? brandHostMap.get(entry.brandId) : undefined;
    const usageCheck = validateUsageEdges(entry, { allowedHostsForBrand: allowedHosts });
    errors.push(...usageCheck.errors);
    usageEdgeCount += usageCheck.edgeCount;

    if (usageCheck.edgeCount === 0) {
      warnings.push(`${entry.id}: no usedIn placement edges recorded yet`);
    }

    for (const output of entry.outputs) {
      outputCount += 1;
      if (!ALLOWED_RIGHTS.has(output.rightsStatus)) {
        errors.push(`${entry.id}/${output.assetId}: disallowed rightsStatus "${output.rightsStatus}"`);
      }

      const key = `${output.assetId}::${output.versionId}`;
      const matched = bindingByAssetVersion.get(key);
      if (!matched) {
        if (requireVisBindings) {
          errors.push(`${entry.id}/${output.assetId}: missing VIS asset binding for ${key}`);
        }
        continue;
      }

      if (matched.asset.approvalStatus !== "approved") {
        errors.push(`${entry.id}/${output.assetId}: VIS binding approvalStatus must be "approved"`);
      }
      if (!ALLOWED_RIGHTS.has(matched.asset.rightsStatus) || matched.asset.rightsStatus !== output.rightsStatus) {
        errors.push(`${entry.id}/${output.assetId}: rightsStatus mismatch (registry=${output.rightsStatus}, vis=${matched.asset.rightsStatus})`);
      }
      if (matched.asset.sha256 !== output.sha256) {
        errors.push(`${entry.id}/${output.assetId}: sha256 mismatch (registry=${output.sha256}, vis=${matched.asset.sha256})`);
      }
      if (matched.releaseEvidence.evidenceSha256 !== entry.evidence.sha256) {
        errors.push(`${entry.id}/${output.assetId}: releaseEvidence.evidenceSha256 mismatch with registry entry.evidence.sha256`);
      }
      boundOutputCount += 1;
    }

    if (requireVisBindings && entry.outputs.length > 0 && !bindingByEvidenceSha.has(entry.evidence.sha256)) {
      errors.push(`${entry.id}: release evidence sha256 ${entry.evidence.sha256} has no matching VIS releaseEvidence binding`);
    }
  }

  return {
    schemaVersion: "starlight.damRegistryValidation.v1",
    valid: errors.length === 0,
    assetCount: registry.assets.length,
    outputCount,
    boundOutputCount,
    usageEdgeCount,
    handoffLinked,
    handoffBrandId: handoffManifest?.brand_id ?? null,
    handoffKernelCommitSha: handoffManifest?.kernel_commit_sha ?? null,
    errors,
    warnings,
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const { values } = parseArgs({
      options: {
        registry: { type: "string", default: DEFAULT_REGISTRY_PATH },
        bindings: { type: "string", multiple: true },
        handoff: { type: "string" },
        json: { type: "boolean", default: false },
      },
    });
    const registry = JSON.parse(readFileSync(resolve(values.registry), "utf8"));
    const visBindings = (values.bindings || []).map((p) => JSON.parse(readFileSync(resolve(p), "utf8")));
    const handoffManifest = values.handoff ? JSON.parse(readFileSync(resolve(values.handoff), "utf8")) : null;
    const brandHostMap = loadBrandHostMap(REPO_ROOT);
    const report = validateDamRegistry({
      registry,
      visBindings,
      handoffManifest,
      brandHostMap,
      requireVisBindings: registry.assets.length > 0 || visBindings.length > 0,
    });
    if (values.json) {
      console.log(JSON.stringify(report, null, 2));
    } else if (report.valid) {
      console.log(
        `DAM registry valid: ${report.assetCount} asset entries, ${report.boundOutputCount}/${report.outputCount} VIS-bound outputs, ${report.usageEdgeCount} usedIn placement edges.`
      );
    } else {
      console.error(`DAM registry validation failed (${report.errors.length} error(s)):`);
      for (const err of report.errors) console.error(`- ${err}`);
    }
    if (!report.valid) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}

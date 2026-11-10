import { readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatAjvError(error) {
  return `${error.instancePath || "/"} ${error.message}`;
}

function actorKey(actor) {
  return `${actor.kind}:${actor.id}`;
}

function mimeMatchesExtension(path, mime) {
  const extension = extname(path).toLowerCase();
  return (
    ([".jpg", ".jpeg"].includes(extension) && mime === "image/jpeg") ||
    (extension === ".png" && mime === "image/png") ||
    (extension === ".webp" && mime === "image/webp") ||
    (extension === ".svg" && mime === "image/svg+xml") ||
    (extension === ".mp4" && mime === "video/mp4")
  );
}

export function validateAssetRegistry(registry, { root = scriptRoot } = {}) {
  const failures = [];
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = loadJson(
    resolve(root, "brand-image-system/runtime/schemas/asset-record.schema.json")
  );
  const validate = ajv.compile(schema);
  if (!validate(registry)) failures.push(...validate.errors.map(formatAjvError));

  for (const [index, asset] of (registry.assets ?? []).entries()) {
    const prefix = `/assets/${index}`;
    const actors = [asset.maker, asset.reviewer, asset.approver]
      .filter(Boolean)
      .map(actorKey);
    if (new Set(actors).size !== actors.length) {
      failures.push(`${prefix} maker, reviewer, and approver must be independent`);
    }
    if (
      asset.file?.repository_path &&
      asset.file?.detected_mime &&
      !mimeMatchesExtension(asset.file.repository_path, asset.file.detected_mime)
    ) {
      failures.push(`${prefix}/file detected MIME does not match repository_path extension`);
    }
  }

  return [...new Set(failures)];
}

function main() {
  const path = process.argv[2] ?? resolve(scriptRoot, "brand-image-system/runtime/asset-registry.json");
  let registry;
  try {
    registry = loadJson(resolve(path));
  } catch (error) {
    console.error(`Cannot read asset registry: ${error.message}`);
    process.exit(2);
  }
  const failures = validateAssetRegistry(registry);
  if (failures.length) {
    console.error(`Asset registry invalid (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Asset registry valid: ${registry.assets.length} released asset(s)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

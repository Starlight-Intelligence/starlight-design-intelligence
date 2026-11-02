import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export function validateFoundations({ root = process.cwd(), document } = {}) {
  const schema = readJson(join(root, "schemas/starlight-foundations.schema.json"));
  const value = document ?? readJson(join(root, "brand-packs/sis/foundations/tokens.json"));
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(value)) return validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`);

  const failures = [];
  const pack = readJson(join(root, "brand-image-system/runtime/brands/sis/brand-pack.json"));
  const identity = pack.visual.identity;
  for (const [field, authority] of [
    ["identityRepository", "canonicalRepository"],
    ["identityPolicyRevision", "sourceRevision"],
    ["identityManifestPath", "manifestPath"],
    ["identityManifestSha256", "manifestSha256"]
  ]) {
    if (value.authority[field] !== identity[authority]) failures.push(`authority.${field} must match the current SIS identity policy pin`);
  }
  for (const [role, source] of Object.entries(value.colorRoles)) {
    if (!Object.hasOwn(pack.visual.siteProfiles.lab.colors, source)) failures.push(`colorRoles.${role} does not resolve to a lab color`);
  }
  for (const [name, material] of Object.entries(value.materials)) {
    const dark = material.substrate === "substrateDark";
    if (material.reading !== (dark ? "readingOnDark" : "readingOnLight")) failures.push(`materials.${name} must pair reading with its substrate`);
    if (material.blur !== (name === "liquid-glass")) failures.push(`materials.${name} must preserve the material's optical role`);
  }
  const css = value.css;
  const numeric = (name) => Number.parseFloat(css[name]);
  if (numeric("--sl-glass-blur") > 18) failures.push("glass blur exceeds the 18px candidate ceiling");
  if (numeric("--sl-glass-saturation") < 100 || numeric("--sl-glass-saturation") > 115) failures.push("glass saturation must remain between 100% and 115%");
  if (numeric("--sl-grain-opacity") > value.limits.maxTextureOpacity) failures.push("grain exceeds the declared texture limit");
  if (value.limits.particlesMobile > value.limits.particlesDesktop) failures.push("mobile particle budget cannot exceed desktop");
  const timing = ["micro", "base", "system", "explain", "resolve"].map((key) => numeric(`--sl-motion-${key}`));
  if (timing.some((time, index) => time <= 0 || (index > 0 && time < timing[index - 1]))) failures.push("motion durations must be positive and ordered from micro to resolve");
  if (timing.at(-1) > value.limits.maxSequenceMs) failures.push("resolve duration exceeds the declared finite sequence limit");
  if (numeric("--sl-rim-width") > 2) failures.push("rim width exceeds the 2px candidate ceiling");
  if (numeric("--sl-radius-panel") > 32 || numeric("--sl-radius-control") > 16) failures.push("radii exceed the candidate panel/control ceilings");
  for (const [role, source] of Object.entries({ substrateDark: "ink", substrateLight: "paper", readingOnLight: "ink", readingOnDark: "ivory" })) {
    if (value.colorRoles[role] !== source) failures.push(`colorRoles.${role} must preserve the ${source} reading substrate relationship`);
  }
  for (const [name, shadow] of Object.entries(css).filter(([name]) => name.startsWith("--sl-depth-") || name.startsWith("--sl-object-shadow-"))) {
    if (name === "--sl-depth-base" && shadow === "none") continue;
    const parts = /^0(?:px)? (\d+)(?:px)? (\d+)(?:px)? rgb\(0 0 0 \/ (0(?:\.\d+)?)\)$/.exec(shadow);
    const maxBlur = name.startsWith("--sl-object-shadow-") ? 32 : 72;
    if (!parts || Number(parts[1]) > 24 || Number(parts[2]) > maxBlur || Number(parts[3]) > 0.36) failures.push(`${name} must remain a bounded neutral shadow`);
  }
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const failures = validateFoundations();
    if (failures.length) {
      process.stderr.write(`${failures.join("\n")}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write("Candidate Starlight foundation contract valid; rendered quality and downstream adoption not evaluated.\n");
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

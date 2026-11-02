import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateFoundations } from "../scripts/validate-foundations.mjs";

const original = JSON.parse(readFileSync(new URL("../brand-packs/sis/foundations/tokens.json", import.meta.url), "utf8"));
const altered = (change) => { const value = structuredClone(original); change(value); return value; };

test("candidate source contract is coherent", () => {
  assert.deepEqual(validateFoundations({ document: original }), []);
});

test("candidate contract cannot certify adoption or silently replace identity", () => {
  for (const change of [
    (x) => { x.status = "deployed"; },
    (x) => { x.adopted = true; },
    (x) => { x.authority.identityManifestSha256 = "0".repeat(64); },
    (x) => { x.identity.geometry = "generated-replacement"; }
  ]) assert.ok(validateFoundations({ document: altered(change) }).length);
});

test("resource ceilings reject excessive and contradictory motion", () => {
  for (const change of [
    (x) => { x.limits.particlesDesktop = 25; },
    (x) => { x.limits.particlesMobile = 13; },
    (x) => { x.limits.particlesDesktop = 4; x.limits.particlesMobile = 5; },
    (x) => { x.css["--sl-motion-resolve"] = "2000ms"; },
    (x) => { x.css["--sl-motion-micro"] = "700ms"; },
    (x) => { x.limits.autoplay = true; },
    (x) => { x.limits.iterations = 0; },
    (x) => { x.limits.reducedMotion = "slow-loop"; }
  ]) assert.ok(validateFoundations({ document: altered(change) }).length);
});

test("material bounds reject excessive optics and unreadable semantic pairing", () => {
  for (const change of [
    (x) => { x.css["--sl-glass-blur"] = "24px"; },
    (x) => { x.css["--sl-glass-blur"] = "url(remote)"; },
    (x) => { x.limits.allowNestedBackdrop = true; },
    (x) => { x.css["--sl-grain-opacity"] = "0.1"; },
    (x) => { x.materials.porcelain.reading = "readingOnDark"; },
    (x) => { x.colorRoles.readingOnLight = "gold"; },
    (x) => { x.colorRoles.substrateDark = "paper"; },
    (x) => { x.css["--sl-object-shadow-floating"] = "0 24px 100px rgb(0 0 0 / 0.36)"; },
    (x) => { x.css["--sl-depth-floating"] = "0 24 72 rgb(0 0 0 / 0.32)"; },
    (x) => { x.css["--sl-object-shadow-raised"] = "0 6px 18 rgb(0 0 0 / 0.24)"; },
    (x) => { x.css["--sl-depth-raised"] = "0 04px 16px rgb(0 0 0 / 0.24)"; },
    (x) => { x.css["--sl-depth-floating"] = "url(remote)"; },
    (x) => { x.css["--sl-radius-control"] = "999px"; },
    (x) => { x.materials.obsidian.blur = true; },
    (x) => { x.limits.readingSubstrateOpacity = 0.6; }
  ]) assert.ok(validateFoundations({ document: altered(change) }).length);
});

test("lower resource budgets remain valid", () => {
  const document = altered((x) => {
    x.limits.particlesDesktop = 12;
    x.limits.particlesMobile = 6;
    x.css["--sl-glass-blur"] = "12px";
    x.css["--sl-grain-opacity"] = "0.01";
    x.css["--sl-motion-resolve"] = "1200ms";
    x.css["--sl-depth-raised"] = "0 0 12px rgb(0 0 0 / 0.2)";
    x.limits.maxSequenceMs = 1200;
  });
  assert.deepEqual(validateFoundations({ document }), []);
});

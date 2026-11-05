import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SDI_ROOT = join(ROOT, "..", "..");

const EXPECTED_24_ICONS = [
  "archive",
  "arrowRight",
  "arrowUpRight",
  "branch",
  "check",
  "close",
  "code",
  "compass",
  "download",
  "eye",
  "grid",
  "layers",
  "link",
  "moon",
  "orbit",
  "pause",
  "play",
  "search",
  "settings",
  "shield",
  "signal",
  "spark",
  "sun",
  "warning",
];

test("24 Signal SVG icons: exported paths and names match exact 24-icon set", async () => {
  const iconsModulePath = join(ROOT, "src", "icons", "icons.tsx");
  assert.ok(existsSync(iconsModulePath), "src/icons/icons.tsx must exist");
  const content = readFileSync(iconsModulePath, "utf8");

  for (const name of EXPECTED_24_ICONS) {
    assert.ok(
      content.includes(`${name}:`),
      `Icon path ${name} must be defined in iconPaths`
    );
  }
});

test("24 Signal SVG icons: standalone SVG files in icons/signal match 24 count", () => {
  const signalDir = join(SDI_ROOT, "icons", "signal");
  assert.ok(existsSync(signalDir), "icons/signal directory must exist");
  const files = readdirSync(signalDir).filter((f) => f.endsWith(".svg"));
  assert.equal(files.length, 24, "Must have exactly 24 SVG files in icons/signal");

  for (const name of EXPECTED_24_ICONS) {
    const filename = `${name}.svg`;
    assert.ok(files.includes(filename), `${filename} must exist in icons/signal`);
    const svg = readFileSync(join(signalDir, filename), "utf8");
    assert.ok(svg.includes("<svg"), `${filename} must contain svg element`);
    assert.ok(svg.includes('viewBox="0 0 24 24"'), `${filename} must have 24x24 viewBox`);
  }
});

test("24 Signal SVG icons: standalone SVG files in packages/materials/src/icons/svg match 24 count", () => {
  const svgDir = join(ROOT, "src", "icons", "svg");
  assert.ok(existsSync(svgDir), "packages/materials/src/icons/svg directory must exist");
  const files = readdirSync(svgDir).filter((f) => f.endsWith(".svg"));
  assert.equal(files.length, 24, "Must have exactly 24 SVG files in packages/materials/src/icons/svg");
});

test("unified tokens.css: zero collisions and all core tokens declared", () => {
  const tokensCssPath = join(ROOT, "src", "tokens", "tokens.css");
  assert.ok(existsSync(tokensCssPath), "tokens.css must exist");
  const css = readFileSync(tokensCssPath, "utf8");

  const requiredTokens = [
    "--sl-bg",
    "--sl-surface-1",
    "--sl-glass-bg",
    "--sl-glass-blur",
    "--sl-fg",
    "--sl-fg-muted",
    "--sl-border",
    "--sl-gold",
    "--sl-gold-bright",
    "--sl-companion",
    "--sl-status-ok",
    "--sl-status-warn",
    "--sl-status-breach",
    "--sl-status-unknown",
    "--sl-font-sans",
    "--sl-font-serif",
    "--sl-font-mono",
    "--sl-radius-sm",
    "--sl-radius-md",
    "--sl-radius-lg",
    "--sl-space-1",
    "--sl-space-4",
    "--sl-motion-base",
  ];

  for (const token of requiredTokens) {
    assert.ok(css.includes(token), `tokens.css must declare token ${token}`);
  }

  // Ensure ink, paper, operator themes are defined
  assert.ok(css.includes('[data-theme="ink"]'), 'Must support data-theme="ink"');
  assert.ok(css.includes('[data-theme="paper"]'), 'Must support data-theme="paper"');
  assert.ok(css.includes('[data-mode="operator"]'), 'Must support data-mode="operator"');
  assert.ok(css.includes("prefers-reduced-motion"), "Must support prefers-reduced-motion");
});

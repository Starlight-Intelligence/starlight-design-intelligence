import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileBrand, listBrands, loadBrand, main } from "../scripts/compile-brand-css-tokens.mjs";

test("compiles deterministic CSS for every brand in the runtime registry", () => {
  const brands = listBrands();
  assert.ok(brands.includes("gencreator"));
  assert.ok(brands.includes("sis"));
  assert.ok(brands.includes("frankx"));
  for (const id of brands) {
    const first = compileBrand(loadBrand(id));
    const second = compileBrand(loadBrand(id));
    assert.equal(first, second, `${id} output must be byte-identical across runs`);
    assert.match(first, new RegExp(`\\[data-brand="${id}"\\]`));
    assert.match(first, /@theme inline/);
    assert.doesNotMatch(first, /undefined|NaN/);
  }
});

test("gencreator CSS stays pure paper/ink editorial with no glass blur", () => {
  const css = compileBrand(loadBrand("gencreator"));
  assert.match(css, /--brand-color-paper: #fbf9f5;/);
  assert.match(css, /--brand-color-ink: #221f1b;/);
  assert.match(css, /--brand-color-signal: #c8322a;/);
  assert.match(css, /--brand-font-display: "Instrument Serif"/);
  assert.doesNotMatch(css, /backdrop-filter/);
});

test("sis CSS emits foundation limits, reduced-motion, and forced-colors guards", () => {
  const css = compileBrand(loadBrand("sis"));
  assert.match(css, /--sl-glass-blur: 18px;/);
  assert.match(css, /backdrop-filter: none;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
});

test("--out followed by --check detects zero drift on clean output", () => {
  const dir = mkdtempSync(join(tmpdir(), "sdi-css-check-"));
  try {
    assert.equal(main(["--brand", "gencreator", "--out", dir], { log: () => {} }), 0);
    const css = readFileSync(join(dir, "brand-tokens.gencreator.css"), "utf8");
    assert.match(css, /brand: gencreator/);
    assert.equal(main(["--brand", "gencreator", "--out", dir, "--check"], { error: () => {} }), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

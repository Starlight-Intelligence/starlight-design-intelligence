import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditRepository, main } from "../scripts/check-portfolio-truth-and-sense.mjs";

function makeFixture(files) {
  const dir = mkdtempSync(join(tmpdir(), "sdi-sense-"));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content, "utf8");
  }
  return dir;
}

test("passes a clean landing fixture with h1, CTA, llms.txt, JSON-LD, and sourced copy", () => {
  const dir = makeFixture({
    "app/layout.tsx": `<html data-brand="gencreator"><body><script type="application/ld+json">{"@type":"WebSite"}</script>{children}</body></html>`,
    "app/page.tsx": `import Hero from "@/components/Hero";\nexport default function Page() { return <Hero />; }`,
    "components/Hero.tsx": `export default function Hero() { return <main><h1>Source-based releases for creators</h1><a href="/editions">Read Edition 01</a></main>; }`,
    "public/llms.txt": `# GenCreator\nAuthored editions with source receipts.\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "gencreator", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
    assert.equal(res.errors.length, 0);
    assert.equal(res.warnings.length, 0);
    assert.equal(res.landing.hasH1, true);
    assert.equal(res.landing.hasCta, true);
    assert.equal(res.landing.hasLlms, true);
    assert.equal(res.landing.hasJsonLd, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("flags nonexistent BVs, 1:1 consulting offers, banned phrases, income claims, and missing /llms.txt", () => {
  const dir = makeFixture({
    "app/page.tsx": `export default function Page() {
      return (
        <main>
          <p>Operated by Starlight Holding BV. Book a 1:1 advisory call for hourly consulting.</p>
          <p>10x your content and build passive income fast.</p>
        </main>
      );
    }`,
  });
  try {
    const res = auditRepository({ dir, brand: "gencreator", mode: "landing" });
    const rules = new Set(res.errors.map((e) => e.rule));
    assert.equal(res.ok, false);
    assert.ok(rules.has("void-claim:nonexistent-bv"));
    assert.ok(rules.has("void-claim:consulting-or-1on1"));
    assert.ok(rules.has("brand:banned-phrase"));
    assert.ok(rules.has("voice:income-claim"));
    assert.ok(rules.has("sense:missing-h1"));
    assert.ok(rules.has("sense:missing-primary-cta"));
    assert.ok(rules.has("sense:missing-llms-txt"));
    assert.equal(main(["--dir", dir, "--brand", "gencreator", "--mode", "landing"], { log: () => {} }), 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("allows explicit negation of nonexistent BVs without false positives", () => {
  const dir = makeFixture({
    "content/legal.md": `# Entity Note\n\nThere is no Starlight Holding BV or FrankX Operations BV in this structure.\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.errors.filter((e) => e.rule === "void-claim:nonexistent-bv").length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

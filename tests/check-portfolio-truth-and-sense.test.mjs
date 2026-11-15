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

test("extracts multiline JSX copy with source line numbers and wrapped-line phrases", () => {
  const dir = makeFixture({
    "app/page.tsx": `import { useState } from "react";
export default function Page() {
  const [items] = useState<Array<string>>([]);
  return (
    <main>
      <p>
        Operated by Starlight Holding BV.
        Book a 1:1 advisory call for
        hourly
        consulting.
      </p>
    </main>
  );
}`,
  });
  try {
    const res = auditRepository({ dir, brand: "gencreator", mode: "content" });
    const bv = res.errors.find((e) => e.rule === "void-claim:nonexistent-bv");
    const oneOnOne = res.errors.find((e) => e.rule === "void-claim:consulting-or-1on1" && /1:1/i.test(e.excerpt));
    const hourly = res.errors.find((e) => e.rule === "void-claim:consulting-or-1on1" && /hourly/i.test(e.excerpt));
    assert.ok(bv, "must catch multiline BV claim");
    assert.equal(bv.line, 7);
    assert.ok(oneOnOne, "must catch 1:1 claim inside multiline <p>");
    assert.ok(hourly, "must catch hourly consulting phrase even at line boundary");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("traverses transitive homepage component imports with cycle guard", () => {
  const dir = makeFixture({
    "app/layout.tsx": `<html data-brand="gencreator"><body><script type="application/ld+json">{"@type":"WebSite"}</script>{children}</body></html>`,
    "app/page.tsx": `import Home from "@/components/Home";\nexport default function Page() { return <Home />; }`,
    "components/Home.tsx": `import Hero from "./Hero";\nexport default function Home() { return <Hero />; }`,
    "components/Hero.tsx": `import Home from "./Home";\nexport default function Hero() { return <main><h1>Release systems for creators</h1><a href="/packs">Browse packs</a></main>; }`,
    "public/llms.txt": `# GenCreator\nPublic catalog.\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "gencreator", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
    assert.equal(res.landing.hasH1, true);
    assert.equal(res.landing.hasCta, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("does not let unrelated negation exempt an affirmative void offer or entity", () => {
  const dir = makeFixture({
    "content/sales.md": `# Studio\n\nNo setup fee for hourly consulting.\nNo intermediaries, operated by Starlight Holding BV.\nWe do not offer hourly consulting.\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    const consulting = res.errors.filter((e) => e.rule === "void-claim:consulting-or-1on1");
    const bv = res.errors.filter((e) => e.rule === "void-claim:nonexistent-bv");
    assert.equal(consulting.length, 1);
    assert.equal(consulting[0].line, 3);
    assert.equal(bv.length, 1);
    assert.equal(bv[0].line, 4);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("excludes root internal markdown docs in static repos without an app root", () => {
  const dir = makeFixture({
    "index.html": `<!doctype html><html><body><main><h1>Static release</h1><a href="/start">Start</a></main></body></html>`,
    "README.md": `# Developer checklist\n\nInternal migration note: remove Starlight Holding BV before launch.\n`,
    "AGENTS.md": `Never pitch hourly consulting.\n`,
    "public/llms.txt": `# Static Site\nPublic copy.\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
    assert.equal(res.scannedFiles, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

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
    assert.equal(res.scannedFiles, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("extracts JSX inside conditional and map child expressions with exact line numbers", () => {
  const dir = makeFixture({
    "app/page.tsx": [
      `export default function Home({ ready, items }: { ready: boolean; items: string[] }) {`,
      `  return (`,
      `    <main>`,
      `      <h1>Ship releases</h1>`,
      `      <a href="/start">Start</a>`,
      `      {ready && <p>Hourly consulting</p>}`,
      `      {items.map((item) => <span key={item}>Starlight Holding BV</span>)}`,
      `    </main>`,
      `  );`,
      `}`,
    ].join("\n"),
    "public/llms.txt": `# Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, false);
    const consulting = res.errors.find((e) => e.rule === "void-claim:consulting-or-1on1");
    const bv = res.errors.find((e) => e.rule === "void-claim:nonexistent-bv");
    assert.ok(consulting, JSON.stringify(res.errors));
    assert.equal(consulting.line, 6);
    assert.ok(bv, JSON.stringify(res.errors));
    assert.equal(bv.line, 7);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("preserves text after inline closing tags for both violation detection and negation context", () => {
  const dir = makeFixture({
    "app/page.tsx": [
      `export default function Home() {`,
      `  return (`,
      `    <main>`,
      `      <h1>Systems library</h1>`,
      `      <a href="/start">Start</a>`,
      `      <p>We do not offer <strong>hourly consulting</strong>.</p>`,
      `      <p><strong>Book a 1:1</strong> advisory tier right now.</p>`,
      `    </main>`,
      `  );`,
      `}`,
    ].join("\n"),
    "public/llms.txt": `# Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 1, JSON.stringify(res.errors));
    assert.equal(res.errors[0].rule, "void-claim:consulting-or-1on1");
    assert.equal(res.errors[0].line, 7);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("allows wrapped negation spanning lines inside a JSX paragraph", () => {
  const dir = makeFixture({
    "app/page.tsx": [
      `export default function Home() {`,
      `  return (`,
      `    <main>`,
      `      <h1>Self-serve library</h1>`,
      `      <a href="/start">Start</a>`,
      `      <p>We do not offer`,
      `        hourly consulting.</p>`,
      `    </main>`,
      `  );`,
      `}`,
    ].join("\n"),
    "public/llms.txt": `# Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("scans secondary static HTML files like about.html alongside index.html and public/llms.txt", () => {
  const dir = makeFixture({
    "index.html": `<!doctype html><html><body><main><h1>Home</h1><a href="/start">Start</a></main></body></html>`,
    "about.html": `<!doctype html><html><body><main><p>Book hourly consulting today.</p></main></body></html>`,
    "public/llms.txt": `# Static Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.scannedFiles, 3);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].path, "about.html");
    assert.equal(res.errors[0].rule, "void-claim:consulting-or-1on1");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("accepts root llms.txt alongside static index.html", () => {
  const dir = makeFixture({
    "index.html": `<!doctype html><html><body><main><h1>Root static</h1><a href="/start">Start</a></main></body></html>`,
    "llms.txt": `# Root Static\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
    assert.equal(res.landing.hasLlms, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("resolves root pages/index.tsx as a Next.js Pages Router homepage", () => {
  const dir = makeFixture({
    "pages/index.tsx": `export default function Index() { return <main><h1>Pages router</h1><a href="/go">Go</a></main>; }`,
    "public/llms.txt": `# Pages Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
    assert.equal(res.landing.entry, "pages/index.tsx");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("does not let non-denial 'is not ...' adjectives exempt affirmative void claims", () => {
  const dir = makeFixture({
    "content/pricing.md": [
      `Hourly consulting is not cheap.`,
      ``,
      `Starlight Holding B.V. is not responsible for delays.`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 2, JSON.stringify(res.errors));
    assert.equal(res.errors[0].line, 1);
    assert.equal(res.errors[1].line, 3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("catches Markdown phrases split across soft line breaks", () => {
  const dir = makeFixture({
    "content/offer.md": [
      `Book hourly`,
      `consulting today.`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].rule, "void-claim:consulting-or-1on1");
    assert.equal(res.errors[0].line, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI main rejects unknown --mode values with exit code 2", () => {
  const dir = makeFixture({
    "content/offer.md": `Clean public copy.\n`,
  });
  try {
    const errors = [];
    const code = main(["--dir", dir, "--brand", "sis", "--mode", "bogus"], {
      log: () => {},
      error: (msg) => errors.push(msg),
    });
    assert.equal(code, 2);
    assert.match(errors.join("\n"), /invalid --mode/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("landing structural checks ignore commented-out headings, CTAs, and type imports", () => {
  const dir = makeFixture({
    "app/page.tsx": [
      `import type { Link } from "next/link";`,
      `// <h1>Commented heading</h1>`,
      `// <Link href="/start">Commented CTA</Link>`,
      `export default function Home() {`,
      `  return (`,
      `    <main>`,
      `      {/* <h1>Also commented</h1> */}`,
      `      {/* <button>Disabled CTA</button> */}`,
      `      <p>Body only.</p>`,
      `    </main>`,
      `  );`,
      `}`,
    ].join("\n"),
    "public/llms.txt": `# Site\n`,
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(res.ok, false);
    assert.equal(res.landing.hasH1, false);
    assert.equal(res.landing.hasCta, false);
    const rules = new Set(res.errors.map((e) => e.rule));
    assert.ok(rules.has("sense:missing-h1"));
    assert.ok(rules.has("sense:missing-primary-cta"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skips voice lint inside Markdown fenced prompt templates while keeping outside prose checked", () => {
  const dir = makeFixture({
    "content/pack.md": [
      `# Starter Prompt`,
      ``,
      "```text",
      `[paste signal]`,
      `[paste relevant rules]`,
      "```",
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "gencreator", mode: "content" });
    assert.equal(res.ok, true, JSON.stringify(res.errors));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("exempts negated comma and Oxford-comma lists of void items while still flagging affirmative items", () => {
  const dir = makeFixture({
    "content/policy.md": [
      `We do not offer 1:1 coaching, hourly consulting, or consulting retainers.`,
      `We have no limits, and we sell hourly consulting.`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 1, JSON.stringify(res.errors));
    assert.equal(res.errors[0].line, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("extracts string literals from brace-wrapped and conditional JSX copy props", () => {
  const dir = makeFixture({
    "app/page.tsx": [
      `export default function Page({ ready }: { ready: boolean }) {`,
      `  return (`,
      `    <Hero`,
      `      title={"Book hourly consulting."}`,
      `      description={"Operated by Starlight Holding BV."}`,
      `      aria-label={ready ? "Book a 1:1" : "Open kit"}`,
      `    />`,
      `  );`,
      `}`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 3, JSON.stringify(res.errors));
    assert.deepEqual(res.errors.map((e) => e.line), [4, 5, 6]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("extracts accessible copy attributes from static HTML tags", () => {
  const dir = makeFixture({
    "index.html": [
      `<!doctype html><html><body>`,
      `  <img src="/hero.png" alt="Operated by Starlight Holding BV.">`,
      `  <button aria-label="Book hourly consulting.">Explore</button>`,
      `</body></html>`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 2, JSON.stringify(res.errors));
    assert.deepEqual(res.errors.map((e) => e.line), [2, 3]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("consumes dotted B.V. abbreviation period before trailing denial checks", () => {
  const dir = makeFixture({
    "content/entities.md": [
      `Starlight Holding B.V. does not exist.`,
      `Operated by Starlight Holding B.V.`,
      `Operated by Starlight Holding BV. Does not exist.`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 2, JSON.stringify(res.errors));
    assert.deepEqual(res.errors.map((e) => e.line), [2, 3]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("audits copy inside public/llms.txt and root llms.txt in both landing and content modes", () => {
  const dir = makeFixture({
    "index.html": `<!doctype html><html><body><h1>Clean Title</h1><a href="/start">Start</a></body></html>\n`,
    "public/llms.txt": [
      `# Agent Guide`,
      `Operated by Starlight Holding BV.`,
      `Book hourly consulting.`,
    ].join("\n"),
    "llms.txt": `Book a 1:1 session today.\n`,
  });
  try {
    const landing = auditRepository({ dir, brand: "sis", mode: "landing" });
    assert.equal(landing.landing.hasLlms, true);
    assert.equal(landing.ok, false);
    assert.equal(landing.errors.length, 3, JSON.stringify(landing.errors));
    const content = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(content.ok, false);
    assert.equal(content.errors.length, 3, JSON.stringify(content.errors));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("exempts explicit exclude clauses with modified void items while rejecting negated exclude and independent clauses", () => {
  const dir = makeFixture({
    "content/policy.md": [
      `Studio applications cover fixed-scope systems; they exclude 1:1 coaching retainers, hourly consulting, and retreats.`,
      `We do not exclude hourly consulting.`,
      `We do not offer 1:1 coaching, and hourly consulting is available.`,
    ].join("\n"),
  });
  try {
    const res = auditRepository({ dir, brand: "sis", mode: "content" });
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 2, JSON.stringify(res.errors));
    assert.deepEqual(res.errors.map((e) => e.line), [2, 3]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

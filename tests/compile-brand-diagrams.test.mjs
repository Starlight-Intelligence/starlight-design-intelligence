import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import {
  DEFAULT_ROOT,
  SUPPORTED_ARCHETYPES,
  SUPPORTED_BRANDS,
  SUPPORTED_THEMES,
  WCAG_AA_MIN_CONTRAST,
  compileDiagramSvg,
  compileSpecDirectory,
  contrastRatio,
  lintDiagramSpec,
  loadBrandPackMetadata,
  loadBrandPalette,
  runCli
} from "../scripts/compile-brand-diagrams.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ARCHETYPE_FIXTURES = [
  {
    id: "fixture-stack-tiers",
    brand: "frankx",
    archetype: "stack-tiers",
    title: "Builder Stack Tiers Fixture",
    subtitle: "Three deterministic execution tiers with capability badges and connectors.",
    tiers: [
      {
        step: "TIER 01",
        icon: "terminal",
        title: "OpenCode CLI Harness",
        summary: "Local repo worktree with explicit file allowlists.",
        role: "MAKER",
        badges: ["GIT WORKTREE", "TYPED SPEC"],
        connectorLabel: "OTLP TRACE"
      },
      {
        step: "TIER 02",
        icon: "gateway",
        title: "Cloudflare AI Gateway",
        summary: "Request caching, rate budgets, and fallback routing.",
        role: "GATEWAY",
        badges: ["CACHE", "FALLBACK"],
        connectorLabel: "DISPATCH"
      },
      {
        step: "TIER 03",
        icon: "shield",
        title: "Workers AI & Release Gate",
        summary: "Schema-checked inference and exact-SHA verification.",
        role: "RELEASE GATE",
        gate: true,
        badges: ["WORKERS AI", "PR GATE"]
      }
    ]
  },
  {
    id: "fixture-curriculum-roadmap",
    brand: "gencreator",
    archetype: "curriculum-roadmap",
    title: "Creator Publishing Roadmap Fixture",
    subtitle: "Stepped learning and release progression across three stages.",
    stages: [
      {
        phase: "STAGE 01",
        icon: "book",
        title: "Source Excavation",
        summary: "Collect primary commits, notes, and working demos.",
        skills: ["Source register", "Claim mapping", "Voice check"],
        outcome: "Pinned sources.json"
      },
      {
        phase: "STAGE 02",
        icon: "layers",
        title: "Visual Edition",
        summary: "Compile deterministic paper-and-ink SVG diagrams.",
        skills: ["WCAG AA >= 4.5:1", "Spot-red state", "Dark + light SVG"],
        outcome: "Compiled SVG pair"
      },
      {
        phase: "STAGE 03",
        icon: "check",
        title: "Provenance Release",
        summary: "Attach sidecar hashes and human sign-off.",
        skills: ["Sidecar lock", "SHA-256 manifest", "Human approval"],
        outcome: "Verified edition receipt"
      }
    ]
  },
  {
    id: "fixture-comparison-matrix",
    brand: "ai-coe",
    archetype: "comparison-matrix",
    title: "Enterprise Model Routing Matrix",
    subtitle: "Structured capability comparison across edge, gateway, and frontier lanes.",
    dimensionHeader: "EVALUATION DIMENSION",
    columns: [
      { title: "Edge Workers AI", subtitle: "LOW LATENCY" },
      { title: "Gateway Cached", subtitle: "GOVERNED ROUTE" },
      { title: "Frontier Verifier", subtitle: "DEEP AUDIT" }
    ],
    rows: [
      {
        dimension: "Schema Classification",
        note: "Deterministic JSON output",
        cells: [
          { fit: "OPTIMAL", summary: "Sub-100ms typed extraction" },
          { fit: "VERIFIED", summary: "Cached policy pass-through" },
          { fit: "STANDARD", summary: "Reserved for escalations" }
        ]
      },
      {
        dimension: "Architecture Review",
        note: "Cross-harness PR audit",
        cells: [
          { fit: "GATE", summary: "Requires escalation" },
          { fit: "STANDARD", summary: "Telemetry + trace capture" },
          { fit: "OPTIMAL", summary: "Independent exact-SHA check" }
        ]
      }
    ]
  },
  {
    id: "fixture-layered-architecture",
    brand: "sis",
    archetype: "layered-architecture",
    title: "Layered Substrate Planes Fixture",
    subtitle: "Left summary rail paired with capability cards per plane.",
    planes: [
      {
        tag: "PLANE 01",
        title: "Operator Surfaces",
        summary: "Calm trace inspection and briefs.",
        nodes: [
          { icon: "eye", badge: "UI", title: "Observatory", detail: "Live trace and confidence inspection." },
          { icon: "terminal", badge: "CLI", title: "Agent Harnesses", detail: "Shared workspace bootstrap contract." }
        ]
      },
      {
        tag: "PLANE 02",
        title: "Governance Gate",
        summary: "Fail-closed release verification.",
        humanGate: true,
        nodes: [
          { icon: "shield", badge: "GATE", title: "Human Approval", detail: "Named sign-off for money and external sends." },
          { icon: "vault", badge: "SIP", title: "Provenance Vault", detail: "Signed receipts and sidecar locks." }
        ]
      }
    ]
  },
  {
    id: "fixture-hub-spoke",
    brand: "arcanea",
    archetype: "hub-spoke",
    title: "Starlight Queen Specialist Topology",
    subtitle: "Central orchestrator hub coordinating four specialist nodes.",
    hub: {
      icon: "queen-star",
      badge: "CENTRAL HUB",
      title: "Queen & MCP Router",
      subtitle: "Assigns isolated lanes and verifies receipts."
    },
    spokes: [
      { icon: "compass", role: "SCOUT", title: "Hermes Retrieval", detail: "Cross-vault provenance lookup." },
      { icon: "code", role: "MAKER", title: "Builder Specialist", detail: "Scoped implementation worktree." },
      { icon: "layers", role: "VISUAL", title: "Diagram Compiler", detail: "Deterministic SVG generation." },
      { icon: "shield", role: "CHECKER", title: "Sentinel Verifier", detail: "Independent exact-SHA gate." }
    ]
  },
  {
    id: "fixture-hud-blueprint",
    brand: "agentic-income",
    archetype: "hud-blueprint",
    title: "Hybrid Living-World Studio + HUD Blueprint",
    subtitle: "Tactile character backplate paired with crisp glassmorphic SVG HUD modules.",
    humanGateLabel: "NAMED HUMAN GATE",
    sceneSlot: {
      badge: "LIVING-WORLD SCENE SLOT",
      title: "Shared-Craft Studio Calibration",
      action: "Two builders inspect an aged copper and matte ceramic fixture while SVG HUD carries all labels.",
      identityId: "frankx-studio-duo-v2",
      edition: "editorial",
      promptFidelity: "EXACT",
      rightsState: "internal-verified"
    },
    modules: [
      {
        code: "HUD-01",
        icon: "layers",
        title: "Material Identity Lock",
        detail: "Matte ceramic, aged copper, woven cloud hoodie, and translucent sapphire glass preserved."
      },
      {
        code: "HUD-02",
        icon: "check",
        title: "Deterministic Typography",
        detail: "100% SVG text nodes verified at >= 4.5:1 contrast with zero raster UI text."
      },
      {
        code: "HUD-03",
        icon: "shield",
        title: "Provenance Sidecar Contract",
        detail: "Sidecar records identity_id, prompt_fidelity, edition, reference_loaded, and rights_state."
      }
    ]
  }
];

test("all 6 brand packs load canonical docs and pass WCAG AA (>= 4.5:1) in dark and light themes", () => {
  assert.deepEqual(SUPPORTED_BRANDS, [
    "frankx",
    "sis",
    "arcanea",
    "gencreator",
    "agentic-income",
    "ai-coe"
  ]);

  const sisMeta = loadBrandPackMetadata("sis", { rootDir: ROOT });
  assert.ok(sisMeta.sourceDocs.includes("brand-packs/sis/REFERENCE-LOCKS.md"));

  const frankxMeta = loadBrandPackMetadata("frankx", { rootDir: ROOT });
  assert.ok(frankxMeta.sourceDocs.includes("brand-packs/frankx/TOKENS.md"));

  for (const brandId of SUPPORTED_BRANDS) {
    for (const theme of SUPPORTED_THEMES) {
      const palette = loadBrandPalette(brandId, theme, { rootDir: ROOT });
      assert.equal(palette.brandId, brandId);
      assert.equal(palette.theme, theme);
      assert.ok(palette.paletteChecks.length >= 18);
      for (const check of palette.paletteChecks) {
        assert.ok(
          check.ratio >= WCAG_AA_MIN_CONTRAST,
          `${brandId}.${theme} ${check.pair} ratio ${check.ratio} < ${WCAG_AA_MIN_CONTRAST}`
        );
      }
    }
  }
});

test("all 6 visual archetypes compile deterministic, WCAG AA compliant SVGs in dark and light themes", () => {
  assert.deepEqual(SUPPORTED_ARCHETYPES, [
    "stack-tiers",
    "curriculum-roadmap",
    "comparison-matrix",
    "layered-architecture",
    "hub-spoke",
    "hud-blueprint"
  ]);

  for (const fixture of ARCHETYPE_FIXTURES) {
    for (const theme of SUPPORTED_THEMES) {
      const first = compileDiagramSvg(fixture, { theme, rootDir: ROOT });
      const second = compileDiagramSvg(fixture, { theme, rootDir: ROOT });

      assert.equal(first.svg, second.svg, `Non-deterministic SVG for ${fixture.archetype} (${theme})`);
      assert.equal(first.sha256, second.sha256);
      assert.ok(first.minContrastRatio >= WCAG_AA_MIN_CONTRAST);
      assert.equal(
        first.overflowChecks.filter((item) => !item.passed).length,
        0,
        `Unexpected overflow in ${fixture.archetype} (${theme})`
      );
      assert.match(first.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
      assert.match(first.svg, new RegExp(`data-brand="${fixture.brand}"`));
      assert.match(first.svg, new RegExp(`data-archetype="${fixture.archetype}"`));
      assert.match(first.svg, new RegExp(`data-theme="${theme}"`));
      assert.match(first.svg, /ZERO RASTER TEXT/);
    }
  }
});

test("contrast linter, glyph-width overflow checker, and brand voice guard reject invalid inputs", () => {
  assert.ok(contrastRatio("#FFFFFF", "#0A0A0B") > 18);
  assert.ok(contrastRatio("#777777", "#888888") < WCAG_AA_MIN_CONTRAST);

  // Low contrast override must fail
  assert.throws(
    () =>
      compileDiagramSvg(ARCHETYPE_FIXTURES[0], {
        theme: "dark",
        rootDir: ROOT,
        paletteOverrides: { textPrimary: "#1A202C" }
      }),
    /WCAG AA palette contrast check failed/
  );

  // Glyph-width overflow must fail when single line exceeds card width
  const overflowingSpec = structuredClone(ARCHETYPE_FIXTURES[0]);
  overflowingSpec.tiers[0].title =
    "ExtremelyVerboseUnbrokenArchitecturalHeadingThatExceedsTheDeterministicCardWidthAllocationByHundredsOfPixels";
  assert.throws(
    () => compileDiagramSvg(overflowingSpec, { theme: "dark", rootDir: ROOT }),
    /Diagram lint failed.*overflow/
  );

  // Banned brand phrase must fail lintDiagramSpec
  const bannedSpec = structuredClone(ARCHETYPE_FIXTURES[0]);
  bannedSpec.subtitle = "Built on a sovereign substrate with presentation claims.";
  const errors = lintDiagramSpec(bannedSpec, { rootDir: ROOT });
  assert.ok(errors.some((err) => err.includes("sovereign substrate")));
});

test("reference specs in brand-image-system/specs/diagrams match compiled examples and pass --check", () => {
  const result = compileSpecDirectory({
    specDir: join(DEFAULT_ROOT, "brand-image-system", "specs", "diagrams"),
    outDir: join(DEFAULT_ROOT, "brand-image-system", "examples", "diagrams"),
    rootDir: ROOT,
    checkOnly: true
  });

  assert.equal(result.count, 3);
  const ids = result.registry.diagrams.map((d) => d.id);
  assert.deepEqual(ids, [
    "frankx-opencode-gateway-stack",
    "gencreator-creator-roadmap",
    "sis-agentic-architecture"
  ]);

  for (const entry of result.registry.diagrams) {
    for (const theme of SUPPORTED_THEMES) {
      const variant = entry.variants[theme];
      assert.ok(variant, `Missing ${theme} variant for ${entry.id}`);
      assert.equal(variant.wcagAA, true);
      assert.ok(variant.minContrastRatio >= WCAG_AA_MIN_CONTRAST);
      assert.equal(variant.overflowCount, 0);
      assert.match(variant.sha256, /^[a-f0-9]{64}$/);
    }
  }

  // Verify temp out-dir compilation + tamper detection via runCli --check
  const tempOut = mkdtempSync(join(tmpdir(), "sdi-diagrams-test-"));
  try {
    runCli([
      "--spec-dir",
      join(ROOT, "brand-image-system", "specs", "diagrams"),
      "--out-dir",
      tempOut
    ]);
    runCli([
      "--spec-dir",
      join(ROOT, "brand-image-system", "specs", "diagrams"),
      "--out-dir",
      tempOut,
      "--check"
    ]);

    const targetSvg = join(tempOut, "sis-agentic-architecture.dark.svg");
    writeFileSync(targetSvg, `${readFileSync(targetSvg, "utf8")}<!-- drift -->`, "utf8");
    assert.throws(
      () =>
        runCli([
          "--spec-dir",
          join(ROOT, "brand-image-system", "specs", "diagrams"),
          "--out-dir",
          tempOut,
          "--check"
        ]),
      /Compiled SVG out of date/
    );
  } finally {
    rmSync(tempOut, { recursive: true, force: true });
  }
});

test("character-hud-infographic workflow.json conforms to workflow-pack schema, provenance sidecar, and anti-slop rules", () => {
  const schemaPath = join(ROOT, "brand-image-system", "runtime", "schemas", "workflow-pack.schema.json");
  const workflowPath = join(
    ROOT,
    "brand-image-system",
    "runtime",
    "workflows",
    "character-hud-infographic",
    "workflow.json"
  );

  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const workflow = JSON.parse(readFileSync(workflowPath, "utf8"));

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(workflow);
  assert.equal(valid, true, JSON.stringify(validate.errors));

  assert.equal(workflow.workflowId, "character-hud-infographic");
  assert.equal(workflow.approvalRequired, true);
  assert.deepEqual(workflow.provenanceSidecarContract.requiredFields, [
    "identity_id",
    "prompt_fidelity",
    "edition",
    "reference_loaded",
    "positive_invariants",
    "specific_negative_lessons",
    "rights_state"
  ]);
  assert.equal(workflow.provenanceSidecarContract.missingReferenceBehavior, "BLOCKED_REFERENCE");

  assert.equal(workflow.antiSlopRules.zeroBakedSmallUiText, true);
  assert.equal(workflow.antiSlopRules.zeroInventedKpis, true);
  assert.equal(workflow.antiSlopRules.deterministicHudRequired, true);
  assert.ok(workflow.antiSlopRules.minHudContrastRatio >= 4.5);
  assert.deepEqual(workflow.antiSlopRules.canonicalMaterialAnchors, [
    "matte ceramic",
    "aged copper",
    "woven cloud hoodie",
    "porcelain whale",
    "indigo lunar moth",
    "translucent sapphire glass"
  ]);
});

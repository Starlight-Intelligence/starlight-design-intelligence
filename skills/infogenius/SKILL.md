---
name: infogenius
description: "Use to produce a sourced infographic, technical diagram, data visual, editorial explainer, lesson visual or deck/Figma visual with exact deterministic text. Orchestrates research, visual thesis, two concept directions (A editorial/technical, B character-led), source retrieval, composition, render, independent critique, export and a provenance receipt. Characters only when they improve understanding."
---

# InfoGenius (vNext orchestrator)

One orchestration skill. It routes to existing owned sources; it does not duplicate them.
Read first, once: `AGENTS.md`, `DESIGN.md`, the owning `brand-packs/<brand>/`, and
`evals/generated-asset-quality-gate.md`. Load more only when a stage needs it
(progressive disclosure; table below).

## Non-negotiables

1. **Exact text, labels, numbers and charts are deterministic HTML/SVG.** Never model-generated, never baked into a raster. Generated imagery may supply a backplate only.
2. **Never generate, regenerate or invent a character.** Characters come from retrieval (`casting/casting-resolver.mjs` → `visual.character.resolve`; contract from visual-intelligence draft PR 92, re-check on merge). Missing reference means report it; do not draw a substitute.
3. **Characters only when they improve understanding** (explain a role, show a relationship, reduce abstraction, keep series continuity). Technical diagrams default to none. Name the gain or cast nobody.
4. **No private bytes in this repo.** Fixtures are synthetic.
5. **Maker is never the sole reviewer.** The critique stage runs in a separate agent/session from composition.
6. **Rights first.** Rejected references (Arcanea Fire, Unity v1/v2) are never positive references. Biro is never merged into Brio. Vendor guests (Clawd, Claude, Codex pets, GitHub Mona) are vendor-owned, labelled unofficial, carry no logos implying endorsement, no partner claim, rights pending; Anthropic and OpenAI co-branding needs permission and approval.
7. **Brand authority.** Starlight = calm operational intelligence; Arcanea = mythic creative intelligence. Do not leak Arcanea language into FrankX or enterprise Starlight surfaces.

## Sequence

Brief → Research → Visual thesis → Two concept directions → Source retrieval → Composition → Render → Independent critique → Refine → Export → Receipt.

| # | Stage | Output | Capability module |
|---|---|---|---|
| 1 | Brief | reader, job, claim, surface, brand, rights limits | creative direction |
| 2 | Research | `sources.json`, claims table with source + date | research and fact check |
| 3 | Visual thesis | one sentence: what the viewer understands after 5 seconds | narrative compression |
| 4 | Two directions | **A** premium editorial or technical (deterministic-first); **B** character-led (only if casting resolver returns `use_character: true`). If B is unjustified, record why and ship A only | creative direction and casting |
| 5 | Source retrieval | retrieval receipt (revision, ids, hashes, status) | reference retrieval and continuity |
| 6 | Composition | spec JSON (compiler) or HTML/SVG; typography per gates | diagram and data visualization; editorial typography; deterministic composition |
| 7 | Render | light + dark SVG/PNG, contrast and overflow measured | deterministic HTML/SVG composition; image generation and edit (backplate only) |
| 8 | Independent critique | scored rubric, hard gates, verdict by a different reviewer | independent critique |
| 9 | Refine | diff of changes against critique findings | all |
| 10 | Export | assets, crops, Figma/deck handoff | Figma and deck production |
| 11 | Receipt | `receipt.json` (see references/receipt.md) | provenance receipt |

## Capability modules and what to load

| Module | Use for | Load |
|---|---|---|
| Research and fact check | claims, dates, numbers, source identity | `references/capabilities.md#research` ; `evals/editorial-articulation-gate.md` |
| Narrative compression | cut to one thesis and ≤7 visual units | `references/capabilities.md#narrative` |
| Creative direction and casting | directions A/B, cast decision | `casting/casting-resolver.mjs`, `references/casting-resolver-spec.md` |
| Reference retrieval and continuity | identity evidence, hashes | `playbooks/character-canon-retrieval.md`, `skills/review-character-continuity/SKILL.md` |
| Diagram and data visualization | archetype choice, chart honesty | `scripts/compile-brand-diagrams.mjs`, `brand-image-system/specs/diagrams/*` |
| Editorial typography | hierarchy, measure, fonts | `evals/typography-quality-gate.md`, `skills/typography-art-direction/SKILL.md` |
| Image generation and edit | non-text backplate only | `evals/generated-asset-quality-gate.md` (26/30), `skills/google-flow-multimodal-studio/SKILL.md` |
| Deterministic HTML/SVG composition | exact text, HUD overlays | `brand-image-system/runtime/workflows/character-hud-infographic/workflow.json` |
| Figma and deck production | handoff | `playbooks/figma-template-pipeline.md` |
| Independent critique | scoring and hard gates | `benchmarks/infogenius/RUBRIC.md` |
| Provenance receipt | what was loaded, made, checked | `references/receipt.md` |

Use the compiler for the six archetypes (`stack-tiers`, `curriculum-roadmap`,
`comparison-matrix`, `layered-architecture`, `hub-spoke`, `hud-blueprint`):
`node scripts/compile-brand-diagrams.mjs --spec <spec.json> --out-dir <dir> --theme both`.
Living-design character contracts live in `plugins/starlight-living-design`
(`assets/atlas.html`); they are proposals, not approved canon.

## Casting (summary)

`node skills/infogenius/casting/casting-resolver.mjs <brief.json> [fixture.json]`.
Routing defaults (Mini Frank/Nilo/Brio/Riff founder and creator stories; Omega FrankX
technical authority; Starlight Queen orchestration; Noble Machines architecture; Living
Glasshouse memory and knowledge; Prismatic Tide research; Arcanea mythic education;
custom pets keep distinct sprite lineages) are **proposals** in
`casting/routing-defaults.json`. Full spec: `references/casting-resolver-spec.md`.

## Gate

Pass = score ≥ 26/30 **and** every hard gate passes: factual correctness, source
identity, accessibility (≥4.5:1, reduced motion where animated), rights. A high
score cannot offset a failed hard gate. Then apply the owning product's release checks.

Also: `references/invocations.md` (Claude Code, Codex, Starlight workflow) and
`references/migration.md` (existing overlapping variants; nothing replaced).

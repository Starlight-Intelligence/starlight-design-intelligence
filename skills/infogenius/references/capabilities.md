# InfoGenius capability modules

Each module is a bounded stage contribution. Load one at a time.

## Research
Claims table: `claim | source | retrieved | exact quote or figure | confidence`. Every number on the visual traces to a row. Unsourced numbers are removed, not rounded. Prefer first-party repository files at a pinned revision. Synthetic or illustrative content is labelled.

## Narrative
One thesis sentence, ≤7 visual units, one reading order. Cut anything that does not change what the reader decides or understands.

## Creative direction and casting
Direction A: premium editorial or technical, deterministic-first, no character. Direction B: character-led, allowed only when the casting resolver returns `use_character: true` with a named understanding gain. Choose with a written reason; keep the rejected direction in the receipt.

## Reference retrieval and continuity
Run retrieval before any character appears. Record revision, ids, assets loaded, hashes. See `playbooks/character-canon-retrieval.md`.

## Diagram and data visualization
Pick the archetype from the reader's question: sequence → `stack-tiers`/`curriculum-roadmap`; comparison → `comparison-matrix`; layers or planes → `layered-architecture`; coordination → `hub-spoke`; scene plus labels → `hud-blueprint`. Charts start at zero unless stated; no invented KPIs.

## Editorial typography
Hierarchy by size and weight before color; measure 45–75 characters for prose; verify fonts are licensed (`skills/font-licensing-gate`). Run `evals/typography-quality-gate.md`.

## Image generation and edit
Backplate only: no text, no UI, no logos. Apply `evals/generated-asset-quality-gate.md`; do not accept first-pass media below 26/30 after export inspection. Never use for characters unless a retrieved reference is attached and verified.

## Deterministic HTML/SVG composition
Compile with `scripts/compile-brand-diagrams.mjs` (dark and light, contrast and overflow linted). For scene overlays follow the `character-hud-infographic` workflow.

## Figma and deck production
Export SVG/PNG crops; keep exact labels as live text/vectors in Figma. See `playbooks/figma-template-pipeline.md`. No Figma write is performed by this skill without the host's tool policy.

## Independent critique
A different agent/session scores against `benchmarks/infogenius/RUBRIC.md`. The critic receives the artifact and sources, not the maker's reasoning.

## Provenance receipt
See `receipt.md`.

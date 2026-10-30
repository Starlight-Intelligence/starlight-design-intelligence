---
name: design-reference-selector
description: "Use Awesome Design's complete pinned SKILL.md and DESIGN.md catalogue to select a visual reference for a surface. Apply one compatible mechanism through the existing brand pack rather than mixing arbitrary styles."
---

# Design reference selector

Read `../../vendor/awesome/index.json`. The upstream index retains its original
`skills/` paths; resolve that prefix to `<plugin-root>/vendor/awesome/`.
For any directory absent from the index, use the actual vendored catalogue;
the index and directory coverage are verified separately by the toolkit tests.

Select at most three candidates from the job and brand constraints, then read
their SKILL.md and DESIGN.md pair. Prefer editorial/paper/minimal candidates
for an editorial brief, enterprise/clean for operational clarity, or immersive/
storytelling for an experiential brief. These are starting points, not brand
assignments; Arcanea and SIS remain distinct even when they share a reference.

Choose one mechanism to adapt: grid, type contrast, spatial hierarchy, color
behavior, component rhythm or interaction. Explain its job in the target
surface. Translate it into the owning palette, fonts, tokens and component
states. Do not copy another company's identity, logos, content, marks or screenshots.

Read generic numbers as defaults requiring contextual validation. Check
contrast, focus, touch targets, wrapping and reduced motion in the final
implementation. Keep provenance in `vendor/source-lock.json`; retain the MIT
license. Do not fetch the upstream gallery PNGs merely to package a style.

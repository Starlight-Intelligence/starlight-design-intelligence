# InfoGenius evaluation rubric

Threshold: **26 of 30** (same threshold as `evals/generated-asset-quality-gate.md`), **and** every hard gate passes. A high score never offsets a failed hard gate.

## Score (30 points)

| Dimension | Points | Question |
|---|---|---|
| Thesis clarity | 5 | Is the point understood in five seconds? |
| Hierarchy and composition | 5 | Reading order, grouping, spacing |
| Typography and legibility | 5 | Size, measure, contrast, glyph overflow |
| Brand fit | 5 | Owning brand pack respected; no cross-brand leakage |
| Explanatory value | 5 | Every element earns its place; character only if it improves understanding |
| Craft and export | 5 | Crisp export, light and dark parity, no artifacts |

## Hard gates (pass/fail)

1. **Factual correctness**: every claim, label and number traces to a cited source at a stated revision; synthetic content is labelled.
2. **Source identity**: sources are the claimed ones (right repo, file, revision); retrieved characters are the requested identity and lineage; Biro is not Brio.
3. **Accessibility**: text contrast ≥ 4.5:1 in both themes, no glyph overflow, reduced-motion respected for animated outputs, text is real text.
4. **Rights**: owned or licensed assets only; rejected references unused; vendor guests labelled unofficial with no endorsement implication; no private bytes.

## Reviewer rule

The maker cannot be the sole reviewer. Record reviewer identity as a separate agent or human. The receipt states who made and who reviewed. If only the maker has reviewed, status is `unreviewed`, never `approved`.

## Deterministic content rule

Exact text, labels, numbers and charts are deterministic HTML/SVG. A model-generated glyph on the artifact fails gate 3 and the run.

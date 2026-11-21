# Visual QA gate (375 / 768 / 1440)

`scripts/visual-qa-gate.mjs` is the smallest rendered gate a product repository runs before a
release candidate. It extends the interface-foundations gate (`scripts/validate-interface-foundations.mjs`,
390/1440) to the three canonical widths and adds measured contrast and brand-pack conformance. It
is a mechanical floor, not a taste verdict: a PASS does not replace `evals/web-release-gate.md`.

## What it measures

Every check runs at 375×812, 768×1024 and 1440×900, each with `prefers-reduced-motion`
`no-preference` and `reduce` — six samples per surface.

| Code | Fails when |
| --- | --- |
| `horizontal-overflow` | the document is wider than the viewport; the five widest offenders are named |
| `text-contrast` | a visible text run, composited (alpha included) over its ancestor backgrounds, is below WCAG 2.x AA: 4.5:1, or 3:1 at ≥24px / ≥18.66px bold |
| `brand-off-palette` | the page canvas or body text colour is not a `visual.colors` token of the declared pack |
| `brand-role-mismatch` | the pack declares `colorRoles.background`/`text` and the surface uses a different token |
| `brand-reading-family` | the body `font-family` does not declare the pack's `typography.readingFamily` |
| `brand-backdrop-limit`, `brand-nested-backdrop` | the pack's schema-validated foundations limits (`maxVisibleBackdropSurfaces`, `allowNestedBackdrop`) are exceeded |
| `brand-token-contrast` | the pack itself cannot produce AA body text (declared text-on-canvas pair, or no pair at all) |

The brand pack is validated against `brand-image-system/runtime/schemas/brand-pack.schema.json` and
its foundations, when present, against `schemas/starlight-foundations.schema.json` before a page
opens. An invalid declaration exits 2; it is never reported as a visual result.

## Known limits

- Text over a `background-image` or gradient cannot be resolved from computed style. It is listed
  under each sample's `unresolved` for human review and neither passes nor fails the gate. Cinematic
  surfaces with text over media must clear those entries by inspection or by a solid scrim.
- Background is resolved through DOM ancestry. Absolutely positioned text over a sibling's
  background is measured against its ancestors, not what is painted beneath it.
- `brand-reading-family` checks the declared stack, not the font actually rasterised; font
  delivery is proven by the typography gate.
- Off-palette secondary colours are recorded in `text_colors` per sample, not failed; only the
  canvas and body text are bound to tokens.

## Invocation from another repository

Check this repository out beside the product (CI: a second `actions/checkout` pinned to a kernel
commit), run `npm ci` in it, serve the product locally, then:

```bash
node ../starlight-design-intelligence/scripts/visual-qa-gate.mjs \
  --url http://127.0.0.1:3000/ --brand gencreator --ready-selector main \
  --commit "$(git rev-parse HEAD)" --output artifacts/visual-qa.json
```

- gencreator.ai cinematic experience (pcv.03): `--brand gencreator`.
- starlight-command-center Observatory (pcv.02): `--brand sis` (foundations limits apply) or
  `--brand starlight-technology` for enterprise surfaces.
- A product carrying its own pack: `--brand-pack path/to/brand-pack.json [--foundations tokens.json]`;
  it must still validate against the kernel schema.
- `--interface-foundations` adds the emoji, uppercase, placeholder and accessible-name checks.
- Programmatic: `import { runVisualQaGate, launchChromium } from ".../scripts/visual-qa-gate.mjs"`.

Exit 0 PASS, 1 REVISE, 2 configuration or navigation error. Receipts are
`starlight.visual_qa_gate.v1`, never overwritten, and bind a caller-supplied commit only.

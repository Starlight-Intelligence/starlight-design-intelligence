# Browser material review pilot

The existing Living Library now lets a designer inspect the actual surface implementation from the overview. The earlier overview used its main visual stage for an ornamental glass orbit. The pilot makes that stage an interactive tool while preserving the existing component, icon and motion examples.

A reviewer can compare Obsidian, Liquid and Recess, change the page theme, switch glass to its opaque fallback, and read the browser's resulting background, foreground, border and filter values. Each observation can be downloaded as JSON with the viewport, theme, material, transparency preferences and pinned source URLs. This is a local observation. Release authority remains with the owning product and its reviewers.

The opacity fallback used to override all surface backgrounds, including recessed ones. It is now scoped to glass. The workbench continues to use its original component primitives and theme tokens. Its existing header geometry matches the owning Starlight product mark at Git blob `9093c0a17aabbffe30fe14dd11d24f6c283f3d5b`. Asset authority and redistribution terms remain in [Provenance](PROVENANCE.md).

## Reproduce

From `examples/sis-living-library` on the reviewed revision:

```sh
npm ci
npx playwright install --with-deps chromium
npm run build
npm test
npm run test:browser
```

The existing browser suite checks the four library views across all three themes at 390px and 1440px, including serious and critical axe findings. The pilot verifies keyboard selection and fit at 375px, 768px and 1440px, the opaque fallback, the actual exported JSON and its exact source links. The `Design kernel` workflow preserves screenshots and the browser report as an artifact. On the baseline revision `592874f89e54338d7122f319f0f5b9e3d51acb78`, run the existing suite to recover the prior overview. Compare its `desktop-midnight-overview.png` and `mobile-midnight-overview.png` against the same files from this branch.

## Release boundary

This pilot is part of the design repository's local reference implementation. The test suite captures changes in behavior and layout and supplies comparable images for visual review. It does not certify production adoption, Figma parity, composited contrast over arbitrary media, or an approved general-purpose material or logo. Product adoption needs its own responsive and keyboard evidence, cross-browser and real asset checks, and independent review.

## Built CSS and responsive comparisons

The Vite production build at `61221ca2ae926f091068dd179acce26f5d91075f` dropped Chromium's unprefixed glass filter while minimizing the component stylesheet. Chromium reported `none` with glass enabled. The corrected component and exported registry entry at `2da708810b4c0459a5962d441b669a5d323b2e4f` put the standard declaration last. In independent captures from the two local builds (Chromium 153, DPR 1, Midnight), glass resolved to `blur(20px) saturate(1.15)` after the correction. Both the explicit opaque preference and OS reduced-transparency preference yielded `none` at every width.

| Viewport | Original built inspector | Corrected built inspector |
| --- | --- | --- |
| 375 × 900 | [Before](material-review/before-375.png) | [After](material-review/after-375.png) |
| 768 × 900 | [Before](material-review/before-768.png) | [After](material-review/after-768.png) |
| 1440 × 900 | [Before](material-review/before-1440.png) | [After](material-review/after-1440.png) |

The browser CI job independently checks out the pinned corrected commit in this repository and builds it with its own lockfile. The candidate and reference builds run on separate loopback ports in the same Chromium process. The nine comparisons cover Midnight glass, Daylight opaque and Ember with the OS reduced-transparency preference at each width. They inspect both the sample's computed filter and the value visible to the designer. Each comparison crops the entire inspector. Playwright rejects dimension changes or more than 0.1% differing pixels at a per-pixel threshold of 0.1. The retained artifact contains reference and candidate images, a JSON report including both revisions, and diff images on mismatches.

From the repository root, after building the candidate and installing its Playwright browser:

```sh
git worktree add --detach ../living-library-reference 2da708810b4c0459a5962d441b669a5d323b2e4f
npm --prefix ../living-library-reference/examples/sis-living-library ci --ignore-scripts
npm --prefix ../living-library-reference/examples/sis-living-library run build
MATERIAL_REFERENCE_DIR="$(realpath ../living-library-reference/examples/sis-living-library)" npm --prefix examples/sis-living-library run test:visual
```

For an intentional redesign, retain the mismatches against the prior pin, review the new rendering and working states, then update the workflow to the reviewed full commit SHA in the same repository. Keep the reference commit reachable when integrating or squashing this stack. The current pin identifies a correction under review. This check covers these inspector states in Chromium. Whole-page placement, other engines, accessibility and brand approval have separate evidence.

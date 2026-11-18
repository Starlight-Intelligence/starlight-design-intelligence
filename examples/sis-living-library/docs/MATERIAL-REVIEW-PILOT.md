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

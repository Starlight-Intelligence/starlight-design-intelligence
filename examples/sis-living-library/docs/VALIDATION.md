# RC 0.2 validation / 13 November 2026

Current candidate extends the historical October workbench. Old browser counts and screenshots below do not validate the new product views.

Executed locally: TypeScript check, three foundation tests, Vite production build, package compilation, Next.js 16 production build against the local npm archive, bundle budgets. A browser preview has been deployed to the existing Vercel Experience Lab. Initial source review found and corrected checkout identity reset, skip-link route reset, chart-hour labeling and legacy harness entry drift.

New checks: public/qa.html runs 24 axe/reflow/journey states. scripts/products-browser.mjs adds eight screenshot comparisons and requires explicit baseline approval. Missing baselines fail. Local Chromium launch is unavailable in this execution environment; the deployed same-origin QA runner supplies rendered evidence separately. Do not interpret implementation of a runner as its passing result. Current run receipts are release artifacts, separate from this source.

Figma: 27 color primitives and nine semantic aliases projected across three modes; values, CSS syntax and scopes verified. Existing assets preserved. No new native component parity or team publication is claimed.

Remaining release gates: accepted screenshot baselines, OS preference/cross-browser/assistive-technology checks, commercial source licensing, storefront fulfillment configuration and customer install acceptance. No production promotion or payment activation.

---

Historical workbench validation:

# Validation — 31 October 2026

Verdict: independently reviewed **local reference candidate**. No production adoption or team-library publication is claimed.

| Check | Observed result |
| --- | --- |
| TypeScript and Vite production build | Pass. The Vite demo bundle does not need React server directives; registry source retains `use client` on hook-bearing modules. |
| Token/icon/registry foundation tests | 3 pass. Covers reading/status/action contrast, SVG closure and generated source identity. |
| Independent Chromium interaction checks | 59/59 pass. 1440×1000 desktop and 390×844 phone; all three themes and four views. |
| axe WCAG-tagged scan | Zero violations in 24 viewport/theme/view combinations. This is an automated scan, not accessibility certification. |
| Browser errors | Zero console or JavaScript errors during the tested journeys. |
| Rendered review | 25 captures produced. Independent review inspected representative dark/light/ember, desktop/mobile, component/icon/motion layouts. No material visual defect remained in inspected captures. |
| Recovery and keyboard | Command search/no results, Escape, focus return including removed trigger, tab arrows/Home/End, invalid/valid form, unknown/blocked state, disclosure, icon empty state and SVG download pass. |
| Preference handling | Glass toggle and reduced-motion computed styles/result pass. Forced-colors and reduced-transparency styles are implemented but not independently runtime-tested. |
| Standalone preview | Opens directly from a local HTML file, navigates and exports a real SVG without network assets; no JavaScript errors. |
| Fresh shadcn installation | Incomplete. CLI 4.23.0 accepted the local registry but proxy connectivity blocked its `ui.shadcn.com/r/colors/neutral.json` request. Do not label downstream installation as passed. |

Defects corrected during review: mobile overflow from transformed decoration, mobile search-button accessible name, native search Escape handling, disconnected focus restoration, field-error announcement, mismatched duration tokens, reduced-motion artificial delay, missing React client boundaries and malformed status fallback.

Run `npm run test:browser` to create fresh evidence in `test-results/`. Its report binds observations to SHA-256 hashes of six UI source files. Set `STARLIGHT_EVIDENCE_DIR` to keep captures elsewhere. Run `npm run build:standalone` and `npm run test:standalone` for the portable preview.

Remaining validation: completed clean CLI installation, product-specific integration with PR #53, cross-browser and assistive-technology testing, 200% zoom, product performance and actual user acceptance. The CSS material study does not establish WebGL capability or optical equivalence with native Figma GLASS.

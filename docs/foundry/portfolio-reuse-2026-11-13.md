# Portfolio reuse and commercial bounds

Observed 2026-11-13. Read-only inspection; no repository, payment or deployment changes by this workstream. A source declaration is not a fresh passing test. Private operational documents are excluded from this report.

## Canonical sources

| Repository | Exact source observed | Evidence |
|---|---|---|
| `frankxai/gencreator.ai` | main `81d740fd3327ab2647ca2989d6c154704cf74711` | GitHub branch API; package/design contract read |
| `frankxai/frankx.ai-vercel-website` | local clean checkout `129dae91e873062f536a0d1d40d08bdfe3267498` | local git; do not assume this equals latest remote main |
| `Arcanea-Labs/arcanea-ai-app` | main `5dab6d11f33e99085af18e0325aff216cd670d08` | GitHub branch API; package/design contract read |
| `Arcanea-Labs/AnimeLegends` | main `3b433f716e57230f864fd29f1fb0cb00202da8e4`; draft #77 head `0d4423fd05783c6ad07390630ff2e65b0d638396` | GitHub branch and PR APIs |

`Arcanea-Labs/Arcanea`, `arcanea-studio`, `arcanea-onchain`, and `arcanea-ecosystem` also remain accessible repositories. Their existence does not establish that they host the canonical public web application. Several `-retired-...` repositories exist: avoid absorbing them as current systems.

## Reuse / repair matrix

| State → action | Source paths | Decision |
|---|---|---|
| EXISTS → REUSE | FrankX `.starlight/design-contract.json`; GenCreator same path | Shared `starlight.design_contract.v1`, pinned kernel `cbc5091ce58d21947ae70bfffcd80c9e53ee1967`, per-brand pack hash and release evidence convention already exist. Extend contract, preserve brand IDs. |
| PARTIAL → COMPLETE | Arcanea `.starlight/design-contract.json` at main above | Existing Arcanea brand/mode `mythic-world`; repository field still `frankxai/arcanea-ai-app`, kernel pin `80830c60040967956580c761772469664c44dd55`. Reconcile ownership/pin through reviewed change, not blind replace. |
| EXISTS → REUSE | FrankX `components/liquid-glass/{LiquidButton,GlassCard,GlassInput,IridescentPill,LoadingBubble,FloatingElement}.tsx`; `index.ts`, `types.ts` | Six existing typed components. Inspect and lift behavior selectively into canonical package; keep current FrankX exports compatible. Their comments contain unverified accessibility assertions: measure rather than inherit claims. |
| EXISTS → REUSE | FrankX `lib/liquid/react.tsx`, `lib/liquid/liquid.css`, `lib/liquid/core/{env,field,scroll}.js` | Original WebGL2 metaball shader, CSS fallback, static/lite/full tiers, reduced motion, save-data, DPR cap, offscreen/hidden behavior and frame governor exist. Governor default: 22ms frame budget over 90 samples, trips above 35% overrun. These are configured bounds, not measured performance. |
| DUPLICATED → CONSOLIDATE | FrankX `lib/design/tokens.ts`, `components/liquid-glass/types.ts`, `lib/liquid/liquid.css` | Typography/surface/state recipes and liquid CSS overlap. Canonical semantic roles should feed brand-local adapters; do not replace FrankX editorial direction with one common aesthetic. |
| PARTIAL → COMPLETE | Arcanea [PR #186](https://github.com/Arcanea-Labs/arcanea-ai-app/pull/186), protected branch `claude/design-skills-management-q19b59`, SHA `d945a9c3be8e7234fc9ff665030f19d4245704db` | Closed, unmerged; 29 files. `packages/design-system/src/primitives/shader-gradient-background.tsx` wraps `@shadergradient/react`, brand-tokenized, reduced-motion aware. Recover/review source before adding a second wrapper. |
| BROKEN → REPAIR | #186 `packages/design-system/src/primitives/liquid-glass/` and `apps/web/public/vendor/liquid-glass-js/` | PR documents permanent window scroll listener and no destroy API in vendored `dashersw/liquid-glass-js`. Do not ship lifecycle leak in sellable React package. Existing CSS glass stays the default. Third-party WebGL source was declared unaudited. |
| EXISTS → REUSE | GenCreator `lib/webmcp.mjs`, `lib/creator-studio/webmcp.mjs`, matching `.d.mts`, `scripts/tests/{webmcp,creator-webmcp}.test.mjs` | Feature detection, abort cleanup, mutation serialization, JSON snapshots, same-origin read-only MCP bridge, 64KiB input, 2MB output and 15s request limit exist. Owning [agentic-ops #236](https://github.com/frankxai/agentic-ops/issues/236). Reuse lifecycle contract; native browser compatibility remains separately unverified. |
| EXISTS → REUSE | GenCreator `lib/factory/manifest.ts`, `scripts/sync-product-manifest.mjs`, `data/products.graph.json` | Existing generated commerce manifest consumes canonical `starlight/graph/products.graph.json`. Pending rows remain `origin: pending-promotion`; fresh product release gate required to expose checkout. Do not hand-edit generated snapshot. |
| EXISTS → REUSE | FrankX `lib/{checkout-products,checkout-gate,delivery}.ts`, `data/products.json`, `app/api/checkout/route.ts`, `app/api/checkout/polar/route.ts`, `app/api/webhooks/stripe/route.ts` | Real source contracts for staged Stripe/Polar checkout and artifact delivery exist. Entries inspected are not-for-sale. Polar route currently points at production provider endpoint; it is not a sandbox integration merely because catalog is closed. Add test-only endpoint enforcement in a scoped integration. No provider configuration/transactions were inspected here. |
| DUPLICATED → CONSOLIDATE | FrankX catalog IDs `aurora-ui-kit`, `command-center-template` | Existing staged UI kit and Command Center offer already exist. Root is proposing Glass Essential €79 / Pro €149 and Agent Command Center €349. Reconcile SKUs before publishing; do not present both old and new prices as available offers. |
| EXISTS → REUSE | AnimeLegends draft [PR #77](https://github.com/Arcanea-Labs/AnimeLegends/pull/77): `packages/cinematic-engine`, `templates/cinematic-starter`, `docs/cinematic-*` | Installable `@animelegends/cinematic` 0.1.0 MIT core with scene schema, bounded CLI/renderer, source/rights gates, native scroll/still/reduced-motion fallbacks, packed consumer and original starter. Do not duplicate cinematic SDK. Source distribution archive is not npm publication or proof of package-scope ownership. |
| PARTIAL → COMPLETE | AnimeLegends `packages/design-system` | Existing 0.1.0 package, React19/Motion12/Tailwind4 peers, CSS/token exports, tsup build. Root package license points to application license: inspect exact rights before commercial redistribution. |
| PARTIAL → COMPLETE | AnimeLegends `docs/cinematic-release-readiness.md`, `docs/quality`, #77 | Existing preview/source receipt and tests are recorded. This inspection did not rerun them. Media/frame-sequence playback/transcoding, checkout/demand validation and integration adapters remain open. |
| MISSING / NOT LOCATED → VERIFY | Paper Shaders | No exact `@paper-design` implementation found in scoped current GenCreator/Arcanea code search or inspected FrankX local source. This is limited search evidence, not proof no branch/registry has it. |

## Existing cinematic preview evidence

Draft #77 records preview [scene desk](https://anime-legends-glg7s9yu5-starlight-intelligence.vercel.app/forge/cinematic) and [SDK archive](https://anime-legends-glg7s9yu5-starlight-intelligence.vercel.app/downloads/animelegends-cinematic-0.1.0.tgz), deployment `dpl_2byE2RXAmc6QCcSdGtCNRPkPYunk`, source-upload code `3f4a8b684775d146aae3f11228d15c0d6c7656a5`. Current PR head differs because release evidence was added later. Do not claim exact-head Git auto-deploy: PR says Vercel GitHub installation lacks Arcanea-Labs. Its reported lab results (96 performance, 100 accessibility) belong to that existing slice and cannot substantiate Glass Core or Command Center.

## Design asset access

Figma authentication succeeds. A separate asset-inspection lane resolved existing Arcanea proposed foundations with variable bindings, and found the product-declared GenCreator file empty. No published portfolio-native component library was established. These observations supersede the narrower file-discovery gap in the original source scan.

Drive discovery and reads succeed. The existing source index and fifteen Figma PNG exports were recovered. A separate multi-brand template is unfilled, not an approved token library. Its distinct FrankX editorial, GenCreator media-studio, Arcanea literary-world and Starlight precision rules align with preserving separate brand themes. Its described synchronization/watchers were not verified running. No private document text or raw asset is copied into this public-safe report.

## Commercial reference observations

Official pages checked 2026-11-13:

| Reference | Observed position | Source |
|---|---|---|
| Untitled UI React | PRO SOLO $349 promotional / $499 listed; single user, unlimited projects, lifetime updates; React Aria + Tailwind | https://www.untitledui.com/pricing |
| Aceternity UI | $169 one-year / $199 lifetime promotional prices; regular $249 / $299. MCP discovery included in free plan and paid plans. | https://ui.aceternity.com/pricing |
| Tailwind Plus | Official product URL redirects to login; historical official March 2025 announcement specifies one-time purchase. Current public purchase price not verified. | https://tailwindcss.com/plus ; https://tailwindcss.com/blog/tailwind-plus |

Inference: agent-readable discovery is already offered by competitors; charge for maintained, coherent task/approval/evidence workflows, release artifacts and integration quality. Component quantity and MCP presence alone are weak differentiation. Currency conversion is deliberately not applied.

## Economics and next-family ranking

All numbers below are planning assumptions, not demand, revenue, measured savings or quotations. €60/hour opportunity cost; 8% of list price reserved for payment/refund/channel friction; support time valued at €60/hour. Prices assumed before any VAT. Contribution = 0.92 × price − support labor; excludes fixed overhead, taxes, marketing acquisition and future maintenance. Break-even units = ceiling(build hours × €60 / contribution).

| Priority / family | Buyer value and differentiation | Build h / cost | Support min/order; upkeep h/mo | Price hypothesis | Contribution/order; build recovery | Channel / validation |
|---|---|---:|---:|---:|---:|---|
| 1 Agentic operations starter | Agent builders avoid reauthoring approvals, evidence, budget telemetry and state handling; verified adapters add premium value | 80 / €4,800 | 45; 6 | €349 | €276.08; 18 orders | Existing Starlight users, GitHub demos, founder workshops; three paid-pilot commitments before adapters |
| 2 Glass Core Professional | Frontend builders get coherent accessible materials, typed contracts, starter and reproducible artifact | 48 / €2,880 | 15; 4 | €149 | €122.08; 24 orders | FrankX/GenCreator demos, own storefront; compare task completion with free primitives |
| 3 AI startup website kit | Founders reach a credible evidence-first launch page faster; brand theming/claims fixtures beat generic neon | 28 / €1,680 | 20; 2 | €129 | €98.68; 18 orders | Existing founder network and direct React distribution; five interviews and paid reservation test |
| 4 Design automation skills | Agent builders get bounded registry lookup, token checks, a11y/perf evidence and release packaging | 24 / €1,440 | 20; 3 | €99 | €71.08; 21 orders | Existing skills marketplace/workshops; benchmark completion on owned fixtures |
| 5 Cinematic web bundle | Story/creative founders gain source-proven scene model and original templates; leverage existing MIT SDK | 40 / €2,400 | 30; 4 | €199 | €153.08; 16 orders | AnimeLegends/Arcanea demo and GitHub; original-IP sample projects only |
| 6 Creator commerce/membership | Creators need license/delivery/refund correctness, not another checkout button | 64 / €3,840 | 45; 6 | €249 | €184.08; 21 orders | GenCreator/FrankX audience; payment provider sandbox and delivery rehearsal first |
| 7 Wallet/onchain membership UI | Existing web3 teams may value coherent wallet states and entitlements; integration/security burden high | 72 / €4,320 | 60; 8 | €299 | €215.08; 21 orders | Direct design partners; no chain or transaction support without validated demand |
| 8 Spatial/wearable interfaces | Emerging teams may need consent/action-history UI; fragmented device/browser verification | 100 / €6,000 | 75; 10 | €349 | €246.08; 25 orders | Device-specific pilots; do not claim wearable native support from responsive web |

Glass Essential €79 planning case, 10 minutes support: €62.68 contribution/order. Shared €2,880 Glass build would require 46 Essential-only orders. Do not double-count the same shared build cost across Essential/Professional. At 30% affiliate commission, replace 8% friction with 38% total before computing contribution; affiliate traffic is not cost-free.

## Distribution boundary

React is the verified implementation/export path. Figma token JSON can map semantic variables; tokens do not create editable components or prove library parity. Framer and Webflow require separate native component/content and licensing work, separate previews and platform-specific validation; no lossless conversion claim. Package registry/CLI should expose metadata and explicit file-copy/install instructions, never execute unreviewed postinstall scripts, arbitrary filesystem writes or deployment/payment actions.

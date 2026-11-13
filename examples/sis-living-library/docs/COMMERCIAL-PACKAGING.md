# Foundry offers / private review candidate

This revision supersedes the earlier €49/€149/€249 experiment. It updates the existing source family; no storefront is opened. `commercial/products.json` records proposed editions mapped to the existing FrankX `aurora-ui-kit` and `command-center-template` catalog IDs. Do not add a second product for the same purchase. GenCreator's generated manifest must continue to consume its existing product graph.

| Product | Target | Source delivery |
|---|---:|---|
| Glass Core Essential | €79 | Compiled React package, 19 components, three candidate themes, 24 utility icons, tokens, typed agent contracts and docs |
| Glass Core Professional | €149 | Essential plus independently buildable Next.js landing/dashboard consumer and Tailwind adapter |
| Agent Command Center | €349 | Professional plus full Vite application, mission simulation, queue, approvals, agent registry, workflow, tool arguments, telemetry and exportable receipts |

Prices are hypotheses. Tax display, commercial terms, support commitment and fulfillment need owner review. No revenue, buyer validation, hosted runtime, live adapter or WCAG certification is claimed. Command actions are deterministic local simulations; refresh resets them.

## Reproduce and inspect

Run `npm ci && npm test && npm run build && npm run check:budgets && npm run build:package`, then `python3 scripts/assemble-products.py`. ZIPs contain per-file SHA-256 manifests, exact revision/dirty state and private npm archive. Use a clean commit for release receipts. Inspect extracted archives and build their consumers independently before admission. Environment files, symlinks, caches and untracked material must not enter deliveries.

The package remains `@starlight/living-design@0.2.0`, private and UNLICENSED. This staged version is not an immutable public release. Repackaging changes integrity; refresh the consumer lock against the final archive. Retain dependency notices and font OFL licenses. Starlight marks are demonstration branding, excluded from proposed buyer brand rights.

## Commerce boundary

FrankX `lib/checkout-products.ts`, `lib/checkout-gate.ts`, `lib/delivery.ts` and existing payment webhooks remain authoritative. Source inspection found closed offers; a closed offer is not a sandbox. Existing Polar source names the production endpoint. Do not reuse it for testing without a reviewed sandbox-only adapter.

Stripe discovery returned only a live context on 13 November. No provider write was made. `commercial/sandbox-checkout.ts` prepares a test-only integration with injected transport; it is not wired to either app or storefront. Provider session, signed webhook, durable idempotent entitlement and private-object delivery rehearsals require an available sandbox. A browser success redirect never grants access.

## Proposed license and service terms

Draft for owner/legal review, not operative terms: one purchaser may modify delivered source in their own and client end products; the client receives the end product, not rights to resell the kit. Pro may cover a named small team; decide seats before sale. Prohibit standalone source/template redistribution and retain upstream notices. Exclude Starlight trademarks and third-party assets without redistribution rights. Update duration, upgrade credit and continuing source rights require final terms.

Proposed support: installation and reproducible defects for 30 days, initial response within two business days; custom builds and third-party hosting are separate. Proposed voluntary refund window: 14 days, subject to applicable consumer rights and owner review. Do not claim downloads automatically remove statutory rights; prepare any required informed consent separately. No terms are accepted or published here.

## Entitlement and delivery design

The storefront must verify provider signature and test/live environment, retrieve the paid order server-side, bind product/edition/amount/currency, and use a unique order plus artifact version in a durable transaction. Duplicate events resolve to one entitlement; refunds follow the owner ledger. A verified entitlement may request a short-lived signed object URL bound to an immutable approved artifact/hash. Never trust client product, success URL, path or storage key. No download bucket or token was created.

Affiliate proposal: carry consented referral identity through order metadata; commission only settled eligible revenue after refunds. No enrollment or remote tracking is activated. Event contracts carry version, anonymous session and coarse state, without prompts, evidence text, credentials or buyer email. Demo events measure engagement; only verified provider receipts count as revenue. Support and refunds belong in contribution calculations.

## Platform distribution

React and the Next/Vite consumers are the implementation path. Figma-compatible DTCG JSON is a token projection, not native component parity. Framer requires separate code-component wrappers and native layout tests. Webflow requires native variables/components/interactions and platform previews. Prepare submissions after native versions exist; do not advertise lossless conversion. See `MARKETPLACE-DRAFTS.md`.

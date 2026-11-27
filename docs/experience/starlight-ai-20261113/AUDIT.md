# Audit · inspected truth and limits

Observation date: 13 November 2026. Revisions are pinned in README.md. Findings from source review are not fresh browser-test results.

## Existing surfaces

| Surface | Verified in this task | Strength to preserve | Gap / consequence |
| --- | --- | --- | --- |
| https://starlightintelligence.ai/ | Current desktop browser screenshot and DOM inspected; ink/gold hero, four-point mark, named crew, recorded run and availability disclosures visible | Recognizable identity and useful distinction between recorded, preview and future capability | Landing-page scale and cinematic imagery should yield to the user's work inside the app. Browser viewport was approximately 1348px, not the required 1440/768/375 matrix. |
| https://starlightintelligence.ai/missions | Current desktop screenshot and labeled brief fields inspected | A concrete Node repository job, recorded example, source/receipt exports and opt-in device save disclosure | No generalized workspace navigation; first fold is introduction before work. Device save is not account sync. |
| https://starlightintelligence.ai/platform | Current desktop screenshot and DOM inspected | Editable memory files, local recovery choice and portable exports | Model select is visible but cloud action is disabled; cloud access setup pending. Multiple product-area buttons and promotional content precede task controls. |
| PR97 console source captures | Exact Git-blob PNGs inspected locally at `e48f07f85056b6561fb0f3133365c7088573b16b`; desktop 1440x1000 and phone 390x844 | Readable mission queue, explicit scope and synthetic-only language | Phone first viewport prioritizes four metric tiles above the approval; navigation can hide next work below fold. Captures are committed baselines, not fresh browser captures. |
| Chrome extension | Source reviewed under apps/extension and packages/ui at web pin | Shared cards, selected-text prefill, page-access boundaries, retry-aware browser state | Installed extension and live end-to-end capture not verified; no mobile native support established. |

Current-browser screenshots were used for inspection only and are not included as release evidence. PDF source-screen images are the existing Git baselines from PR97, explicitly labeled historical candidate captures.

## Tokens and component ownership

- `public/brand/identity.json` owns the web identity; `packages/ui/src/tokens.css` is generated from it. Never edit the generated file as the source of truth.
- `app/globals.css` repeats brand literals, `design/tokens.json` and `design/system/tokens.json` provide additional token documents, and the extension imports @starlight/ui. Inventory drift must be resolved before migration, not by declaring a new universal root file.
- Living Library `src/index.ts` imports its global `tokens.css`; both libraries set `--sl-text` and `.sl-button`, `.sl-button--primary`, `.sl-approval`. Their palette, sizing and shape differ. A direct import can change existing screens without a type error.
- Living Library has **12 base exports + 7 product exports = 19** at PR97. Base: GlassSurface, StarlightButton, StatusBadge, AgentPresence, EvidenceDisclosure, TextField, Toggle, Tabs, CommandPanel, EmptyState, Skeleton, ProgressMeter. Product: ModelSelector, UsageDisplay, ApprovalCard, DataTable, WalletPortfolio, PricingCard, CheckoutSummary. The main branch's smaller count is not proof that PR97 is merged.
- Foundational glass is a scoped candidate: at most two visible, non-nested backdrops, opaque essential reading. Proposed app cap is 18px; candidate library currently defaults to 20px. This requires an explicit adapter, not a silent global palette change.

## Source-level findings to carry into implementation

| Priority | Finding | Source at web pin | Design consequence |
| --- | --- | --- | --- |
| P1 | Requested model selection has no executed-provider/model fields in inspected shared RunNode/RunMessage/AgentEvent | packages/agent-client/src/run-state.ts; packages/platform-contract/src/events.ts | Show Actual model: unreported until trusted metadata exists. Do not label picker choice as the model that ran. |
| P1 | Shared approval projection has pending/approved/rejected, without revision/expiry/changed-scope states | run-state.ts; packages/ui/src/ApprovalCard.tsx | UI cannot secure stale scope; protocol must bind scope, actor, tenant, expiry and idempotency. |
| P1 | Composer clears immediately after void callback, with no async accepted/failed acknowledgment | apps/extension/src/sidepanel/Composer.tsx | Preserve unsent text until acceptance; failed sends must restore/edit the same draft. |
| P1 | Extension ApprovalList omits busy state and clipped tool summaries are not a full authoritative scope | apps/extension/src/sidepanel/ApprovalList.tsx; live-messages.ts | Disable duplicate submission; require full-scope inspection or redirect to console. |
| P1 | RunStatus is only idle/running/completed/failed | packages/agent-client/src/run-state.ts | Do not invent stopped, waiting, disconnected or outcome-unknown equivalence. Connection state and execution state are separate. |
| P2 | ToolResult sources are URLs only; no claim/excerpt/locator/retrieval record | packages/platform-contract/src/client-tools.ts | Evidence inspector needs a shared projection. Missing support remains visible. |
| P2 | ol role=log changes native list semantics | packages/ui/src/ChatStream.tsx | Investigate an outer log region around the native ol; verify with axe and AT. No new violation count asserted. |
| P2 | Main shared styles lack forced-colors and reduced-transparency overrides | packages/ui/src/styles.css | Opaque fallback, system colors and non-color status labels required. |
| P2 | Candidate TextField uses 14px input; candidate pricing is explicitly one-time | PR97 components.css and product-components.tsx | Product input minimum 16px; subscriptions require distinct semantics. |

## Deployment evidence

Vercel team `starlight-intelligence` and web project `prj_ftKChFdlU15okomAnqWj7FufsEQM` were verified via connector. The latest five returned web deployments were BLOCKED, on the older cf-plane branch. Those records do not establish the commit serving the live domain. Production alias-to-commit attribution remains unverified.

Living Design deployment `dpl_9rDGUKYnYCaoj2uxFT83Wa9gJ6hs` was READY, preview target, with exact Git SHA `e48f07f85056b6561fb0f3133365c7088573b16b` in Vercel metadata. Its URL is https://starlight-experience-pyi5w61h3-starlight-intelligence.vercel.app . A connector fetch returned HTTP 200 and HTML asset references. The browser reached Vercel sign-in, so interactive rendered-preview verification is blocked in this browser. A successful HTML fetch is not visual or journey proof.

PR97 reports 296 tests and browser checks; this task did not rerun them, and their passing claims are not inherited as this proposal's results. Historical quality-gate PR #322 records home-page accessibility/LCP issues from 10 November; those are historical findings, not current measurements.

The account's `frankxai/agentic-ops/registry/projections/AGENT_BRIEF.md` fetch returned 404. No new runtime, model, storage or vendor choice is made. The proposed design models require reconciliation with the owning runtime before adoption.

## Verification remaining

Current 375/768/1440 captures, installed extension testing, native prototypes, real model/approval contracts, contrast on composited surfaces, browser performance, keyboard/AT journeys, account-backed persistence and subscription correctness remain open. DevTools responsive controls were blocked by browser policy; no workaround was attempted. This gates runtime redesign and release, not documentation review.

# Living Agent UI / implementation addendum

Owner: Frank Riemer. Canonical implementation: the existing `examples/sis-living-library/agent/` in this repository. This addendum extends the recovered [PR #97](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/97), not its tested foundation exports or commercial SKUs. Existing commercialization gates remain in [the resume record](COMMERCIALIZATION-RESUME-2026-11-13.md) and the [first-product checklist](../../examples/sis-living-library/docs/FIRST-PRODUCT-LAUNCH-CHECKLIST.md). This file is the implementation status record, not a new portfolio roadmap.

## Recovered truth

VERIFIED: PR #97 remains open/draft at `7d90e437a04feb9976c88f1985e1ced574dce516`, branch `agent/codex/living-design-products-20261113`. Recovered source contains 19 actual contract-backed components, four fixture reference applications, three staged editions, 24 original icons, three semantic themes, a Next consumer, source package assembly and existing commercial drafts. None is evidence of a live agent or paid customer. The foundation archive was reproduced locally with exact original SHA-256 `228dbfcca67af5f7ff15be900bb1198fda1016d28843e190f59e966fc72f527e`.

VERIFIED: the existing product preview rendered in a real browser at `https://starlight-experience-7b394n15l-starlight-intelligence.vercel.app/glass.html`. Its checkout is unavailable. Existing mobile console golden was inspected as historical host-context evidence; it is not a new mobile audit. Original root suite rerun: 303 pass / 3 existing skips.

VERIFIED: source token JSON/CSS and existing brand adapters were read before new primitives. Existing Figma work is a documented projection of 27 colors/nine aliases across three modes, not native component parity. No resolvable native file URL was found in the scoped authority paths, so no new Figma artifact, parity or publication is claimed. Fonts are the existing Instrument Sans/Plex Mono roles and retained OFL files. Source and brand reconciliation: [context](LIVING-AGENT-CONTEXT-2026-11-13.md).

## ADR LIVING-AGENT-001 / optional experience adapters

Status: IMPLEMENTED candidate / acceptance PROPOSED. Preserve three layers:

| Layer | Owner and export | Boundary |
| --- | --- | --- |
| A / visual foundation | Existing `@starlight/living-design` 0.2.0 | Existing tokens/materials/typography/components; no replacement identity or new token namespace |
| B / Agent Experience | `@starlight/living-agent-ui` 0.1.0-rc.1 in the existing example | Controlled React components; `./contracts` server validation; optional `./ag-ui`, `./copilotkit`, `./a2ui`; ephemeral presentation only |
| C / templates | Existing reference apps plus add-on acceptance workbench and independent Next consumer | Host injects identity, approved gateway transport, model routing, durable state, billing, entitlement and storage |

The SIS `agent-ui-runtime` type-only scaffold remains the runtime boundary contract; no false React implementation or package migration is assumed. Web `@starlight/platform-contract` retains canonical AgentEvent ordering/provenance and `@starlight/agent-client` retains host live/replay ownership. The new AgentView is a disposable stream projection, not a competing event authority. No alternate gateway, session store or scheduler was added. `/api/v1/platform/curate` is non-streaming JSON and must not be connected as AG-UI.

CopilotKit React core/A2UI renderer 1.87.1 are pinned; the Starlight transport uses AG-UI client/core 1.0.4 with Zod 4.6.7 after dependency-audit remediation. CopilotKit retains its own nested AG-UI 1.0.2; no agent instances or schema objects are shared across that boundary. The frontend tool is presentation-only. The production candidate wrapper accepts only a same-origin host-supplied runtimeUrl; actual authenticated runtime bridging remains BLOCKED on the owning runtime qualification. `selfManagedAgents` is excluded because current published code flags Enterprise Intelligence licensing. Hosted Intelligence, Channels, thread persistence, autonomous computer infrastructure and new paid services are absent. Eleven-repository decisions and source pins: [assessment](COPILOTKIT-ASSESSMENT-2026-11-13.md). No fork and no copied example assets/code.

Native A2UI 1.0 has a deliberately narrow custom-only catalog: createSurface and updateComponents for a root StarlightNote. Version, catalog, component name, props, root identity and payload bounds are checked before the official renderer. Unsupported default components, actions, data bindings and open-ended iframe execution reject. This is partial protocol support, not universal A2UI compatibility.

## Experience thesis and retained direction

Recipient: a React/Next product builder integrating an existing agent backend. Job: inspect and edit a proposed output, make an exact-scope decision and retain its evidence. Primary action: run the sample analysis. Signature proof: transcript, editable weighted comparison and tool argument/result distinction remain in one view.

Three existing directions were evaluated against this job: Data terminal, Black plane and Porcelain folio (see the foundation PRODUCT-DIRECTION). Select the existing Data terminal composition with opaque reading planes, a persistent context column and three semantic themes. Glass remains contextual material; no decorative motion or new typography system. This bounded extension adds no continuous/entrance animation. Narrow screens put context after the task and retain scrollable comparison data. GenCreator's editorial identity retires glass and must remain a separate brand projection; Arcanea retains its distinct creative authority.

## Implemented package and demonstrations

IMPLEMENTED: eight interaction components compose the recovered foundation: AgentTranscript, ToolTimeline, BoundApproval, ComparisonArtifact, ResearchReport, ArtifactRenderer, MissionRoster and BrowserActivity. Exported Zod contracts bound source URLs, citations, actions and sizes. Unknown content never becomes raw HTML or dynamically evaluated React. Approval emissions contain the exact run/proposal/revision/arguments/expiry; duplicate and stale async UI acknowledgements are contained. The host still authorizes and deduplicates effects. TOOL_CALL_END closes arguments, not execution.

| Demonstration | Implemented behavior | Evidence boundary |
| --- | --- | --- |
| A / Conversation | Official HttpAgent consumes fragmented SSE and state snapshot; comparison slider reweights ranking | TESTED SDK transport fixture; no provider or network agent |
| B / Approval | Inspect exact arguments, reject/approve, record local receipt; proposal renewal | TESTED in component harness; fixture host only |
| C / Mission | Three specialized fixture roles contribute; evidence and report visible on completion | IMPLEMENTED deterministic local steps, no orchestration claim |
| D / Browser | Page scope, three-step plan, approval and traceable local result | IMPLEMENTED authored page context; no actual tab access |
| E / Research | Cited findings, inspectable sources, Markdown export | TESTED controlled data and export escaping; no live research claim |
| F / A2UI | Published renderer produces the approved Starlight note | TESTED native protocol/catalog in jsdom; real browser gate separate |

The workbench is the equivalent interactive component preview; Storybook is not a second dependency. An independent Next App Router consumer installs both built TGZs and optional adapter dependencies, with `/` and `/agent`. The foundation's existing product page and four original reference applications remain available, not recreated.

## Product catalog / implementation contracts

The seven products are one proposed family. Eight components or a local fixture do not make seven complete products. The first product is the Living Agent UI Kit candidate; the original Essential offer remains the first commercial gate.

| Product | Reuse / acceptance workflow | Host ports and remaining implementation | Status |
| --- | --- | --- | --- |
| Living Agent UI Kit | Recovered foundation + new eight components + A–F demos + Next source consumer | Real host bridge, browser/performance and provider acceptance, licensing/fulfillment | IMPLEMENTED candidate / TESTED locally / commercial BLOCKED |
| Agent Command Center | Existing Console/command-model and mission/evidence panels | AgentEvent/live hook adapter; mission queries/commands; proposal/receipt host; replay/cost sources; verify restart/recovery and no duplicate effects | VERIFIED existing fixture / PROPOSED integration |
| Glass AI Workspace | Existing Next consumer + transcript/model/workflow controls | Existing `/platform` auth/project/account/usage ports; per-thread session isolation; authenticated model catalogs; offline draft recovery; measured provider usage | PROPOSED; do not launch another canonical app |
| Research Intelligence | Comparison/report/source controls from this package | Existing Research Star input `{question,sourceScope}` to validated cited report; private save/export; provenance and missing-source tests | IMPLEMENTED reusable interaction slice / complete template PROPOSED |
| Creator Agent Workspace | Report/approval/control behavior with GenCreator Territory B | Campaign input → editable drafts/media references → exact destination/schedule approval → host publish receipt → performance query; no direct browser publishing | PROPOSED; brand-specific composition required |
| Browser Agent Companion | Existing StarBrowser demo + BrowserActivity/BoundApproval | Extension/BrowserOS host supplies scoped page snapshot, plan, tool and receipt ports; stale-tab/URL/revision invalidation; no auth cookies passed into UI | IMPLEMENTED fixture slice / production companion PROPOSED |
| Arcanea Creative Intelligence | Shared contracts and controls inside existing Arcanea design system | World/character/lore artifact registry; host canon review/save; immutable source revisions; explicit visual-generation spend; creator-owned exports | PROPOSED; preserve Arcanea canon and identity |

Each remaining template must reuse the package, implement one accepted end-to-end job, cover loading/empty/error/offline, enforce host tenant/admission/approval boundaries, pass independent package/Next/browser/accessibility/performance checks, and enter the existing commerce catalog only after its actual downloadable archive exists. No new SKU or duplicate roadmap is created here.

## Commercial decision

PROPOSED: Community examples; Pro €79; Studio €199; Enterprise quoted scope. These are future collection proposals, not replacements for existing Essential €79 / Professional €149 / Command Center €349 candidate records. Preserve existing SKU `aurora-ui-kit` and no active checkout until explicit catalog reconciliation. Studio stays unavailable while research/creator templates are incomplete. [Current price/license benchmarks and support assumptions](LIVING-AGENT-PRICING-2026-11-13.md) separate evidence from modeled economics. No lifetime human support.

Reuse the [existing concrete commercial license draft](../../examples/sis-living-library/docs/COMMERCIAL-LICENSE-DRAFT.md): perpetual acquired-source use, limited developer/organization scope, own/client end products, original source-kit redistribution restrictions, 12-month fixes/minor updates, bounded installation/defect support and proposed refund terms. Do not claim exclusivity over MIT/Apache dependencies. Original source stays UNLICENSED until operative terms are approved.

BLOCKED purchase evidence: both connected Stripe contexts expose only the same live-mode account. No test API key/webhook secret or approved cloud entitlement/private storage binding is available. Existing FrankX #1236 owns sandbox fulfillment and depends on conflicted #1075. Its fixture tests are not a genuine provider purchase and used an empty ZIP. This candidate creates real versioned source archives but does not mount a second commerce path, activate live payments or claim a successful purchase.

## Validation and release gates

TESTED locally: root 303 pass/3 skips; add-on strict TypeScript and 38 Vitest tests, including actual AG-UI SDK decoder, published A2UI renderer in jsdom, approval duplication/revision/expiry/uncertain acknowledgement, controlled artifacts and hostile URL/export/proposal bounds. Compiled ESM/declarations, Vite production build and initial independent Next build passed. The consumer must be rebuilt against the final packaged bytes before final artifact acceptance.

Independent same-provider verifier inspected source and reran tests/adversarial probes. It found two same-origin bypasses and Markdown export injection; all were fixed and regression-tested. This is not the required different-provider commercial release review.

Playwright journeys and 36 route/theme/device axe/reflow screenshots are implemented in CI. Local browser launch was BLOCKED: managed Chromium could not create its process-singleton socket; the cloud browser cannot reach local loopback. A deployed candidate and CI/browser observations must be recorded separately. No Lighthouse, field CWV, other-engine, screen-reader or slow-device pass is claimed by configuration alone. Post-source evidence belongs in a later receipt/PR, not an invented self-referential commit record.

DEPENDENCY HOLD: the initial pins inherited GHSA-mrhx-c7xc-m3w5. Direct Starlight parsing/transport advances to patched Zod4.6.7 / AG-UI1.0.4. A2UI catalog types require an explicit optional legacy Zod3 compatibility dependency; its upstream parser and CopilotKit nested dependencies are not patched by this change. No force-major overrides conceal that risk. Optional CopilotKit/A2UI production adoption remains BLOCKED; a fixture rendered from bounded authored input is not security qualification. See [audit/fix evidence](LIVING-AGENT-DEPENDENCY-HOLD-2026-11-13.md).

Remaining launch checklist:

- [ ] Qualify a supported upstream CopilotKit/A2UI dependency pairing without vulnerable legacy parsing.

- [ ] Exact-source deployed desktop/mobile/keyboard/reduced-motion/forced-colors/a11y proof and measured Lighthouse budgets.
- [ ] Final-source ZIP/TGZ integrity, fresh extraction/install, Next build and demo acceptance.
- [ ] At least one real authenticated AG-UI host integration with model/effect/provenance/cost receipts; current fixture does not qualify.
- [ ] Resolve existing storefront dependency, pass its full exact-head build and different-provider review.
- [ ] Connect approved Stripe test context, durable cloud entitlement and private artifact storage; purchase → signed provider webhook → entitlement → customer library → exact source download → license record; replay/concurrency/refund/recovery.
- [ ] Approve operative seller/license/price/tax/support/refund terms and reconcile future edition names with current SKUs.
- [ ] Consented buyer installs and completes the advertised workflow.
- [ ] Frank explicitly approves merge, publication, production, live payments and any public launch.

Rollback: close/revert only the additive integration draft and remove the optional package; PR #97 and its original foundation artifacts remain independently reviewable. No production data, payments, secrets or identities changed.

## Browser correction after the initial package receipt

At source fb59c045, CI run43485382209 passed the full analysis→decision→mission→browser→export→A2UI journey, then failed six theme/device matrix cases because the wrapping label included option text in its accessible name. The correction sets an explicit Theme accessible name and adds a component regression. The failed matrix is preserved as historical evidence, not a pass. The dependency follow-up also upgrades development-only Vitest4.0.13 to4.1.12 after its UI-server advisory was observed; this project uses run mode and never enabled that UI server. Final source/archives/checks are recorded separately in the PR receipt.

Actual pixel review of all six surface families after the green e801 matrix identified a finish defect missed by automated checks: the A2UI note text touched its frame, and Browser context/approval lacked separation. The bounded correction adds existing24px semantic spacing to those two places. Corrected-source captures and checks are recorded in the final PR receipt; earlier green measurements remain historical exact-source evidence.

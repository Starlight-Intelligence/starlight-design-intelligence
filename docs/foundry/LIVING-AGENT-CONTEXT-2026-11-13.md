# Existing architecture and commerce reconciliation

Read-only source inspection, 13 November 2026. These findings establish source contracts and current PR state, not deployed behavior. No infrastructure, payment, branch or production changes were made.

## Verified source

| Source | Revision | Observation |
|---|---|---|
| SIS main | `e159af3f94e93190c4a8ae127884d8f0d560dd5a` | `packages/agent-ui-runtime` is an unpublished, type-only scaffold `0.1.0-scaffold` |
| Starlight web main | `f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab` | Next 16.4.2, React 19.3, AI SDK 7; existing client/contracts/UI workspaces, no CopilotKit dependency |
| Arcanea web main | `5dab6d11f33e99085af18e0325aff216cd670d08` | Next 16.4.5, React 19.3, AI SDK 6, own `@arcanea/design-system`; no CopilotKit dependency in app manifest |
| GenCreator main | `46412a05f6cf29d131f5f3e17060cc4a1a8286a7` | Next 16.4.2, React 19.3, AI SDK 7; no CopilotKit dependency |
| FrankX commerce #1236 | `dc0ad46c5e9e6fd82d057a043895c80cdf943490` | Draft, open, unmerged; seven files implementing a closed sandbox service/rehearsal |
| FrankX delivery repair #1075 | `cd15bb475b9bbc47d80470bc7f93c1496e8f10b3` | Draft, open, unmerged; `mergeable:false` at inspection |

## Agent UI boundary

SIS `packages/agent-ui-runtime/src/index.ts` exports only provider types and a `BOUNDARY_ACKNOWLEDGED` string. The README's `<AgentUIRuntime>` example is aspirational; no corresponding React export exists. There is no package build, test script or CopilotKit dependency. Historical `docs/cross-repo-distributions/2026-05-03-arcanea-luminor-sidebar-copilotkit.md` explicitly awaits manual placement; it does not prove a golden reference shipped.

Its `BOUNDARY.md` remains the integration contract: own panels, ephemeral shared UI state, frontend tools, generative rendering and approval presentation; inject canon, memory, identity and calculators. Do not directly import their storage or policy implementations. Runtime authentication, business policy, publishing rights and durable workflow state remain host-owned. Static enforcement is described as future work, currently code review only.

Starlight web already defines the canonical product event contract in `packages/platform-contract/src/events.ts`: thirteen event types, strict Zod schemas, run identity, increasing sequence/timestamp checks, artifact SHA-256, usage receipts and explicit `live|recorded|staged` provenance. `@starlight/agent-client/src/live.ts` implements `useStarlightAgent` live/replay via `agents/react` and `@cloudflare/ai-chat/react`, uses validated event frames, caps retained events and injects ticket fetchers. Reuse/project this contract; a CopilotKit adapter must not become another durable event authority.

The 13 November beta packet in draft Starlight web [#354](https://github.com/Starlight-Intelligence/starlightintelligence.ai/pull/354) selects the existing `/platform` application. Its target ownership is Next authority API → Clerk membership → Supabase financial/project truth → one admitted run owner, either Cloudflare MissionWorkflow or bounded curator. #302 owns transport/tickets/callback qualification. The packet is a proposal, not proof of deployed capabilities.

`/api/v1/platform/curate` is a bounded non-streaming JSON route. It must not be passed into an AG-UI or AI SDK streaming parser. Supply a host-injected qualified AG-UI transport adapter. Preserve existing one-owner-per-run, admission/ledger and provenance semantics.

SIS `src/gateway/protocol.ts` is a memory/session JSON gateway, not an AG-UI stream. SIS `services/starlight-cloud-worker/src/llm/ai-gateway.ts` includes simulated fallbacks and hardcoded token usage; this source cannot establish real model or accurate cost acceptance. Do not silently wire UI to it as provider proof.

## Existing brand integration

- Arcanea `apps/web/package.json` consumes its own design system. Its `docs/architecture/CREATION-ENGINE-2026-10.md` proposes controlled typed AI SDK parts first, rendered with Arcanea tokens, with explicit spend approval. Searches found CopilotKit planning references, not implementation adoption.
- GenCreator `design.md` governs above live CSS. The approved Territory B is light editorial paper, one saturated spot, Instrument Serif/Sans, real artifacts and human approval. It explicitly says liquid glass is retired and does not ship. Root CSS still contains legacy dark migration aliases; that drift is not authority. Share components/contracts through separately branded variants, never force a Starlight glass skin onto GenCreator.
- FrankX `docs/design/LIQUID_GLASS_SYSTEM.md` is an existing material-language input with its own typography/brand constraints. Presence does not prove shared package adoption. No CopilotKit source was returned in focused FrankX search.

## Commerce ownership and remaining proof

Preserve existing SKU `aurora-ui-kit`, `essential` edition, €79 hypothesis. [#1236](https://github.com/frankxai/frankx.ai-vercel-website/pull/1236) stacks on [#1075](https://github.com/frankxai/frankx.ai-vercel-website/pull/1075). `docs/products/glass-sandbox-fulfillment.md` and `lib/commerce/glass-sandbox-fulfillment.ts` are the review entry points. Do not add a second checkout or invent a new SKU for the same product without reconciliation.

Implemented source in #1236 binds server Price, edition/source/archive SHA/bytes and terms hash to the authenticated subject and checkout attempt; uses actual Stripe SDK calls/signature verification through explicit fixture transports; re-reads paid Session and exact line item; atomically records event/grant; applies refund tombstones; requires authenticated owner/current entitlement, private storage and byte hash for delivery. Supabase transaction RPC and private storage adapters are present as proposals/fixture-tested ports; SQL is not applied. SQLite durability is offline rehearsal only, not Vercel business truth.

The loopback harness mounts a real local HTTP chain with a signed local fixture identity and returns an empty ZIP fixture. It is not the commercial product. Existing live routes stay unchanged; test events are ignored by the older webhook before mail, public Blob objects are not made private, and legacy HMAC downloads remain the older production behavior. No public sandbox route is exposed.

PR-reported validation: 35 combined checkout/fulfillment tests, strict TS, no lint errors; independent verifier 14 sandbox cases. These were read from current PR/source documentation, not rerun here. Full Next build for #1236 was killed; do not claim it passed. #1075 stale/conflicted base needs owning reconciliation.

BLOCKED: genuine test-mode Stripe Checkout → signed provider event → cloud transaction → authenticated exact commercial archive download → refund denial; cloud concurrency/restore; real buyer authentication; operative terms approval; exact-head full storefront build; required different-provider review. Both connected Stripe contexts were verified live-only by the parent. A fixture pass cannot close these gates.

## Exact source entry points

- [SIS boundary](https://github.com/Starlight-Intelligence/Starlight-Intelligence-System/blob/e159af3f94e93190c4a8ae127884d8f0d560dd5a/packages/agent-ui-runtime/BOUNDARY.md)
- [SIS provider interfaces](https://github.com/Starlight-Intelligence/Starlight-Intelligence-System/blob/e159af3f94e93190c4a8ae127884d8f0d560dd5a/packages/agent-ui-runtime/src/providers.ts)
- [Starlight AgentEvent](https://github.com/Starlight-Intelligence/starlightintelligence.ai/blob/f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab/packages/platform-contract/src/events.ts)
- [Starlight live/replay hook](https://github.com/Starlight-Intelligence/starlightintelligence.ai/blob/f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab/packages/agent-client/src/live.ts)
- [Beta interface proposal](https://github.com/Starlight-Intelligence/starlightintelligence.ai/blob/agent/codex/founder-beta-command-20261113/docs/product/starlight-app/beta-2026-11-13/INTERFACES.md)
- [GenCreator authority](https://github.com/GenCreator-ai/gencreator.ai/blob/46412a05f6cf29d131f5f3e17060cc4a1a8286a7/design.md)
- [Commerce rehearsal and gates](https://github.com/frankxai/frankx.ai-vercel-website/blob/dc0ad46c5e9e6fd82d057a043895c80cdf943490/docs/products/glass-sandbox-fulfillment.md)

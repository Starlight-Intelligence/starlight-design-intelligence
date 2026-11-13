# CopilotKit ecosystem assessment

Subsequent audit supersedes the initial recommended AG-UI/Zod pins: see LIVING-AGENT-DEPENDENCY-HOLD-2026-11-13.md. Direct Starlight AG-UI advances to1.0.4 and Zod4.6.7; optional upstream3.x parsing remains on production HOLD.

Observed 13 November 2026. VERIFIED means repository/source inspection, not execution qualification. No upstream source was copied into the Starlight product. Recommendations are PROPOSED architecture until merged by the canonical owner.

## Decision

Import small pinned protocol/frontend dependencies through optional Starlight adapters. Keep the canonical Glass Core, Starlight gateway, identity, durable workflow state, billing and memory owners. No upstream repository needs a maintained fork for this milestone. Full application templates introduce competing runtime/persistence owners and several require separately licensed Intelligence despite permissive application source licenses.

## Verified source and disposition

| Repository | Inspected commit | License evidence | Disposition | Reason |
|---|---|---|---|---|
| [CopilotKit](https://github.com/CopilotKit/CopilotKit/tree/98effe646911d913909c3c934148fbb3acb6a325) | `98effe646911d913909c3c934148fbb3acb6a325` | MIT root; Apache headers in A2UI-derived source | Import behind optional stable adapter | Pin React core/A2UI renderer 1.87.1; AG-UI client/core 1.0.2. Use v2 runtimeUrl to host-owned TypeScript bridge, never require Intelligence for core UI. |
| [OpenBot](https://github.com/CopilotKit/OpenBot/tree/f8af37ab73e96784f174a11104505a965e722cab) | `f8af37ab73e96784f174a11104505a965e722cab` | MIT, ©2026 CopilotKit | Adapt presentation patterns only | Reference computer activity, policy-before-action and audit receipts. Full fork adds Bun/Hono/Postgres/Kubernetes/Docker/Intelligence ownership conflicting with Starlight gateway. |
| [openmuse](https://github.com/CopilotKit/openmuse/tree/a4944f4c471d3dc93b8bfc060b5da309b5216ab2) | `a4944f4c471d3dc93b8bfc060b5da309b5216ab2` | MIT, ©2026 OpenMuse contributors | Adapt presentation patterns only | Reference takeover, task queue, drafts and cards. Current React Native/Expo alpha requires Intelligence even in sample; do not import its server or persistence. |
| [OpenDots](https://github.com/CopilotKit/OpenDots/tree/46eaf96c9e3802adc972ceafd8f20f99bda34e70) | `46eaf96c9e3802adc972ceafd8f20f99bda34e70` | MIT, ©Atai Barkai | Adapt presentation patterns only | Reference editable work surfaces and channel handoffs; current app requires Intelligence for chat/thread persistence. No standalone SQLite chat store. |
| [OpenDuet](https://github.com/CopilotKit/OpenDuet/tree/edb912666beb113ebeba65b2884faa4af26da8c6) | `edb912666beb113ebeba65b2884faa4af26da8c6` | MIT, ©2026 CopilotKit | Adapt domain workflow idea only | Community-maintained starter now an OpenBot skin. Requires Intelligence; reject full fork to avoid duplicated backend/connector governance. |
| [OpenIntelligentUI](https://github.com/CopilotKit/OpenIntelligentUI/tree/8391a94c1c3939c679e40ddd7bfc08a9ef690e70) | `8391a94c1c3939c679e40ddd7bfc08a9ef690e70` | MIT, ©Atai Barkai | Adapt controlled-artifact presentation only | Next.js/Python/MCP sandbox reference pins old 1.55.2-next.1. Do not treat code as current SDK guidance or ship open-ended iframe execution in first release. |
| [generative-ui](https://github.com/CopilotKit/generative-ui/tree/12aa81e3deeb9c6c15c7863b67a3f8f63144e383) | `12aa81e3deeb9c6c15c7863b67a3f8f63144e383` | No LICENSE file in complete tree | Read as documentation; reject copied assets/code | README/assets only, not a maintained component library. Independently implement controlled/declared concepts; do not bundle repo assets. |
| [A2UI](https://github.com/CopilotKit/A2UI/tree/1c7761780c63c1088fea1fdfb35c3639d90b3c6c) | `1c7761780c63c1088fea1fdfb35c3639d90b3c6c` | Apache-2.0, Google | Wrap current published renderer; no fork | CopilotKit fork snapshot contains web_core0.8.8/react0.8.1 with0.8/0.9 exports; not same revision as current CopilotKit renderer web_core0.15.0/native1.0. Use explicit compatible wire version/catalog. |
| [open-multi-agent-canvas](https://github.com/CopilotKit/open-multi-agent-canvas/tree/25f20b22e7afe3277b6c350c14ef4d54f7147e49) | `25f20b22e7afe3277b6c350c14ef4d54f7147e49` | README claims MIT but missing LICENSE in complete tree | Reject legacy standalone dependency/fork | Consolidated into CopilotKit monorepo; old frontend CopilotKit1.5.18/Next15.1.6 and Cloud required. Use current MIT monorepo examples as reference only. |
| [channels-sdk](https://github.com/CopilotKit/channels-sdk/tree/986c20c2ccf5728066cc643fb0e1f43247b88b77) | `986c20c2ccf5728066cc643fb0e1f43247b88b77` | MIT, ©2026 CopilotKit | Defer optional adapter | README/docs/examples, SDK lives in CopilotKit monorepo. Managed Slack/Teams connections require Intelligence and long-running Node22+ listener. Not needed for UI kit. |
| [excalidraw-studio](https://github.com/CopilotKit/excalidraw-studio/tree/e115412e5799f548c286c1efb55d582b0db39d81) | `e115412e5799f548c286c1efb55d582b0db39d81` | MIT, ©2026 Anmol Baranwal | Adapt/export pattern later; no fork | Next16.1.6/CopilotKit^1.54 reference with separate MCP server/disk or Redis persistence. Defer large drawing runtime; maintain own artifact contract. |

## Release and dependency reconciliation

- VERIFIED current CopilotKit release `v1.87.1`, published 12 November 2026 20:54:08 UTC. Release fixes A2UI protocol1.0 Direct JSON streaming. Main was35 commits beyond release at observation; source inspection at main is not proof published artifacts contain every later patch.
- VERIFIED OpenBot latest returned release `v1.0.2`, published11 November2026; root package remains1.0.1. Do not equate root version with release.
- No release returned for the other nine requested repositories.
- CopilotKit main1.87.1 React core depends exactly on `@ag-ui/client@1.0.2`, `@ag-ui/core@1.0.2`, `@a2ui/web_core@0.15.0`; React peers18/19, Zod peer>=3.25. Core and A2UI renderer use Zod3.25.75 ranges. Pin Starlight qualification to client/core1.0.2 and Zod3.25.76, rather than silently selecting registry latest1.0.4.
- CopilotKit1.x minor releases may break public APIs. v1 SDK deprecated since1.68.2. Keep the exact qualified version and run adapter/build/browser acceptance before updates. [Versioning policy](https://github.com/CopilotKit/CopilotKit/blob/98effe646911d913909c3c934148fbb3acb6a325/VERSIONING.md).
- OpenBot app/server pin CopilotKit1.85.0 and AG-UI1.0.2. OpenMuse root/mobile pin CopilotKit1.70.1 and AG-UI0.0.59; OpenDots requests CopilotKit^1.75.0 with AG-UI^0.0.59. These examples are not a uniform compatible release train.
- Excalidraw Studio pins Next16.1.6 and CopilotKit^1.54.0. OpenIntelligentUI pins CopilotKit1.55.2-next.1 plus `@copilotkitnext/shared@1.54.1-next.6`; current public API assumptions require migration.

## Supported integration boundary

PROPOSED stable Starlight transport accepts gateway-owned AG-UI events; owned React components render a controlled contract. Optional CopilotKit adapter wraps the documented v2 provider and tools while keeping host execution authoritative.

- `CopilotKitProvider` is directly exported from `@copilotkit/react-core/v2`; accepts `runtimeUrl`, `headers` (record or sync/async builder), `credentials`, `agentId` and `useSingleEndpoint`.
- `CopilotKit` from the same entry is a compatibility wrapper. The direct provider is suitable for a narrow wrapper; UI package must not create a second hosted backend.
- Provider `selfManagedAgents` is marked Enterprise Intelligence tier and warns without a license key. The comment explicitly describes advisory client-side enforcement. Do not market this as a no-subscription production path. `agents__unsafe_dev_only` is a free development escape hatch, not a production contract.
- TypeScript CopilotRuntime supports an OSS setup without Intelligence; Python/Go/Ruby/.NET runtimes require Intelligence. A host-owned TypeScript routing bridge can forward to the existing Starlight agent; do not introduce BuiltInAgent/model execution into the UI package.
- `useAgent({agentId})` returns `{agent,isReady}`. Independent per-thread views require all `{agentId,runtimeAgentId,threadId}`; partial variants are rejected to avoid mutating a shared agent's thread.
- `useFrontendTool` uses Zod schemas and browser handlers. Reserve it for safe local UI edits or host-authorized calls. `useHumanInTheLoop` renders a pending interaction and resolves the response; its response alone is not a durable server authorization.
- Runtime transport multi-route defaults must match the provider; set `useSingleEndpoint={false}` with the v2 multi-route handler. A plain gateway SSE URL is not interchangeable with the CopilotRuntime HTTP API.
- For fully custom headless hooks, `@copilotkit/react-core/v2/headless` omits CSS/chat rendering stack. Main v2 imports can drag a large rendering bundle; measure the optional chunk.
- Telemetry: upstream runtime recognizes `COPILOTKIT_TELEMETRY_DISABLED=true` or `DO_NOT_TRACK=1`; Scarf is also a dependency. Keep optional telemetry/configuration explicit in product documentation.

## Controlled A2UI registry

VERIFIED `@copilotkit/a2ui-renderer@1.87.1` source exports `createCatalog`, `A2UIProvider`, `A2UIRenderer`, `useA2UIActions`, `useA2UIError`, dynamic0.9 and native1.0 schemas.

- `createCatalog(definitions,renderers,{catalogId,protocolVersion:"1.0",includeBasicCatalog:false})`; definitions use Zod objects. Default protocol is0.9, so choose explicitly.
- Static properties can use `z.string()`. Bindable native1.0 fields use `DynamicStringSchemaV1` and wire `{"@path":"/name"}`;0.9 uses `{"path":"/name"}`.
- Provider's `processMessages` takes `Array<Record<string,unknown>>`. Sequence: `createSurface` with exact surface/catalog ID, `updateComponents` with root ID `root`, optional `updateDataModel`. Renderer addresses the surface ID.
- Provider adds the opposite protocol's basic catalog for historic surfaces. Starlight must enforce its own schema/version/catalog/component/action allowlist *before* processing. Do not expose arbitrary HTML, JavaScript, remote components or automatic iframe permissions.
- Use separate optional `./a2ui` import and explicit package dependency/peer; do not rely on React core's transitive dependency being hoisted.
- Surface edits are transient presentation state; host owns saved artifacts and server-authorized actions.
- Source reports support0.9/native1.0. CopilotKit/A2UI fork inspected separately is older and cannot be treated as the matching current native1.0 source.

## License and commercial boundary

VERIFIED root license texts were inspected for CopilotKit, OpenBot, OpenMuse, OpenDots, OpenDuet, OpenIntelligentUI, A2UI, channels-sdk and Excalidraw Studio. Complete recursive trees of generative-ui and open-multi-agent-canvas contain no LICENSE; canvas README's MIT statement refers to a missing file.

CopilotKit root and package manifests say MIT, while `packages/a2ui-renderer/src/index.ts` contains a Google Apache-2.0 header and its React renderer includes vendored upstream A2UI primitives. Preserve package/file-level notices and Apache text, not just root MIT attribution. The permissive application source does not grant CopilotKit Intelligence service rights, branding rights, third-party media rights or exclusivity over dependencies.

PROPOSED Starlight license applies only to original component composition, tokens, product source, documentation and original assets. Retain all upstream rights; do not impose redistribution restrictions on MIT/Apache code itself. Product remains UNLICENSED until owner adopts operative Starlight terms.

## Verification limits and acceptance

VERIFIED: repository metadata, complete relevant trees, exact branch revisions, actual license files, root/nested package manifests, current provider/hooks/catalog implementation and upstream tests inspected. NOT RUN here: upstream installs/builds/tests, provider inference, hosted Intelligence, production license entitlement. Parent implementation must qualify actual registry packages with strict TypeScript, controlled wire rejection tests, HTTP/SSE protocol integration and browser journeys. A deterministic official HttpAgent local fixture proves protocol processing only; label it as fixture, not live model execution.

## Primary references

### Published artifact qualification

TESTED independently: a minimal native1.0 custom-only catalog example compiled with TypeScript5.9.3 strict mode, React JSX, ES2022/ESNext and Bundler resolution against actual installed published `@copilotkit/a2ui-renderer@1.87.1`. No runtime/model execution claimed. Example `/workspace/scratch/2008993338eb/upstream-review/minimal-a2ui.tsx`, SHA-256 `d412c4528c75cc0d2fdf7ea0966aa1cbbc20ca787748f756830de0ded181f70a`; published npm tarball SHA-256 `feb34cbe2840b4433fc9fea497cbffeb0e6881adcbb1308cc7efff935dddd757`. Published declarations expose the inspected `createCatalog`1.0 options, renderer/provider/hooks and dynamic schemas. Published React core distribution also retains the Enterprise `selfManagedAgents` warning.

- [CopilotKit release1.87.1](https://github.com/CopilotKit/CopilotKit/releases/tag/v1.87.1)
- [Provider source](https://github.com/CopilotKit/CopilotKit/blob/98effe646911d913909c3c934148fbb3acb6a325/packages/react-core/src/v2/providers/CopilotKitProvider.tsx)
- [Catalog source](https://github.com/CopilotKit/CopilotKit/blob/98effe646911d913909c3c934148fbb3acb6a325/packages/a2ui-renderer/src/react-renderer/create-catalog.tsx)
- [Catalog prop tests](https://github.com/CopilotKit/CopilotKit/blob/98effe646911d913909c3c934148fbb3acb6a325/packages/a2ui-renderer/src/react-renderer/__tests__/create-catalog-props.test.tsx)
- [Native protocol tests](https://github.com/CopilotKit/CopilotKit/blob/98effe646911d913909c3c934148fbb3acb6a325/packages/a2ui-renderer/src/react-renderer/__tests__/protocol-versions.test.tsx)
- [Runtime configuration](https://docs.copilotkit.ai/backend/copilot-runtime)
- [useAgent contract](https://docs.copilotkit.ai/reference/hooks/useAgent)
- [Frontend tools](https://docs.copilotkit.ai/reference/hooks/useFrontendTool)
- [A2UI configuration](https://docs.copilotkit.ai/generative-ui/a2ui)

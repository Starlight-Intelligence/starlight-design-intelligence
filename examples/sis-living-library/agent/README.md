# Starlight Living Agent UI

Private 0.1.0-rc.1 add-on to the recovered Living Design 0.2.0. Original source remains UNLICENSED; this review candidate grants no commercial redistribution rights. No package has been published.

## Run the delivered source

Node 24 is the tested baseline. The source ZIP includes both local package archives in `release/`.

```sh
npm ci --ignore-scripts
npm test
npm run build:demo
npm run dev
```

For the independently installed Next.js 16.4.2 App Router consumer:

```sh
cd examples/next-app
npm ci --ignore-scripts
npm run build
npm start
```

Open `/` or `/agent`. All demo data is authored. The conversation runs through the official AG-UI HttpAgent and SSE decoder with injected in-memory transport. No model, real browser tab, billing service, publisher or gateway is connected. The approval specimen invokes its local fixture host only after the exact envelope decision. A UI decision never grants server authority.

In a repository checkout, build the foundation first with `npm --prefix .. ci --ignore-scripts` and `npm --prefix .. run build:package`, then copy `../release/starlight-living-design-0.2.0.tgz` into this directory's `release/`. `npm run pack:source` rebuilds the add-on archive and creates a versioned source ZIP after a clean source commit.

## Consume the package

Install the supplied foundation and add-on TGZs in your React 19 application. Import both stylesheet entries once:

```tsx
import '@starlight/living-design/styles.css';
import '@starlight/living-agent-ui/styles.css';
import { BoundApproval, ArtifactRenderer } from '@starlight/living-agent-ui';
```

The default entry exports eight interaction components: AgentTranscript, ToolTimeline, BoundApproval, ComparisonArtifact, ResearchReport, ArtifactRenderer, MissionRoster and BrowserActivity. They compose the existing 19-component foundation and its three semantic themes. `./contracts` exports framework-free Zod validation for server code. `./ag-ui` wraps the pinned official client; its view is ephemeral, not a canonical event ledger.

`./copilotkit` is optional and needs `@copilotkit/react-core@1.87.1`. StarlightCopilotProvider accepts a same-origin host-supplied CopilotKit `runtimeUrl`, authenticated headers and agent ID. StarlightComparisonTool registers a read-only controlled frontend tool. The host must implement/qualify its existing gateway bridge. Do not point it at the current non-streaming `/api/v1/platform/curate` route. No second agent backend is provided. `selfManagedAgents`, hosted Intelligence, persistence and licensed enterprise features are excluded.

`./a2ui` needs `@copilotkit/a2ui-renderer@1.87.1`. It supports exactly native A2UI 1.0 createSurface + updateComponents for one root StarlightNote in the `starlight://living-agent/v1` catalog. Inputs are bounded and validated before rendering; no actions, data bindings, arbitrary HTML, default components or iframe execution. This is deliberately partial A2UI support. Extend the versioned allowlist with tests before expanding it.

`./demo` and `./demo.css` expose the reusable acceptance workbench. Its A2UI tab additionally requires the optional renderer. The Next consumer installs both optional adapters explicitly. The demo's model profile is a fixture selector, not a provider integration. Token/cost measurements remain unknown.

## Host responsibilities

Authenticate and authorize server requests; bind decisions to tenant, user, run, immutable arguments/revision, expiry and idempotency key; persist acknowledgement and effect receipts; enforce spend before execution; revoke entitlements after the appropriate provider events. The UI disables repeated clicks, but the host remains authoritative. On an uncertain acknowledgement, reconcile the run before issuing a new proposal.

Theme roles, type and responsive behavior come from the existing Living Design. Override semantic `--sl-*` variables in a brand-owned scope and recheck contrast. GenCreator retains its approved editorial territory, which explicitly retires liquid glass; Arcanea retains its own creative identity. No portfolio migration is implied.

## Compatibility and limitations

Pinned candidate: React/DOM 19.3.1; Next 16.4.2; CopilotKit React core/A2UI renderer 1.87.1; Starlight AG-UI client/core 1.0.4; Zod 4.6.7. CopilotKit retains its own nested protocol dependencies. Other versions are not qualified. CopilotKit minor versions can introduce breaking changes; do not float this pairing.

The local strict check, unit/integration tests and build are separate from Playwright, browser screenshots, accessibility, Lighthouse, actual gateway and purchase acceptance. See the canonical `docs/foundry/LIVING-AGENT-UI-2026-11-13.md` record for current receipts and blockers. No WCAG conformance, live execution or commercially launch-ready claim follows from this source package.

## Updates and rollback

This candidate adds an optional package; the original foundation archive remains byte-identical. Remove the add-on and its optional adapters to roll back. Candidate changes are recorded in CHANGELOG.md. Existing license/support drafts remain proposals, with acquired-source perpetual use and 12 months of updates proposed; there is no operative paid entitlement yet.

## Dependency release hold

Optional CopilotKit/A2UI production use is BLOCKED on GHSA-mrhx-c7xc-m3w5 in their current legacy Zod3 dependency graph. The A2UI catalog types need the explicitly named optional zod3-compat alias; it is not a patched parser. Direct Starlight contracts use patched Zod4.6.7 and AG-UI1.0.4. Install with --omit=optional when using only the default components/contracts/AG-UI entry; do not import ./a2ui or the A2UI demo in that configuration. No unsafe overrides were applied. The sample consumer includes these adapters for bounded fixture review and remains on production HOLD.

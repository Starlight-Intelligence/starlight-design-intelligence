# Architecture

Version 0.1 · reference implementation · 31 October 2026

The first release boundary is a coherent reference workbench plus portable source. It demonstrates how materials, explicit state and evidence disclosure compose; it does not provide auth, orchestration, memory or an agent service.

## Source and boundaries

| Source | Responsibility |
|---|---|
| `tokens/tokens.json` | Typed exchange tokens, grouped by foundation and candidate theme |
| `src/tokens.css` | Current semantic CSS projection and preference accommodations |
| `src/components.tsx` / `components.css` | Twelve React/native components and presentation |
| `src/icons.tsx` / `assets/icons/` | Typed icon API and standalone original vectors |
| `src/App.tsx` / `studio.css` | Workbench, synthetic specimens and interactions |
| `src/index.ts` | Consumer entry point; imports tokens and exports components/icons |
| `scripts/build-registry.mjs` | Generates the source payload and copies downloadable SVGs |
| `public/r/starlight-living.json` | Installable candidate payload for a consumer UI directory |

Token JSON and CSS are currently maintained as parallel representations. There is no automatic token compiler or Figma synchronization in this implementation. Changes must update both and preserve parity until a validated generator replaces that work. DTCG-style types are used for supported values; no complete external conformance certification is claimed.

The intended canonical placement is the existing design repository's `examples/sis-living-library`; base revision `bc4eb09befcb97a7881f7aea983f005fe17a5570`. Existing product repositories own downstream runtime adoption. Figma variables and component sets are design projections whose parity must be checked against a source revision.

## Reuse and ownership

| Keep from established systems | Own in Starlight |
|---|---|
| React and native browser semantics | Material grammar and semantic theme roles |
| shadcn's source-distribution contract | The registry's original source and documentation |
| Existing product shadcn/Radix primitives for complex overlays, menus and composition | Agent identity, evidence presentation and workflow composition |
| Existing product auth, storage, telemetry and runtime adapters | Original utility icon geometry and interaction specifications |

This kit has no Radix or Motion runtime dependency. Tabs and command behavior are local reference implementations using React and native HTML. Complex production overlays should extend the owning application's established shadcn/Radix stack after checking equivalent behavior, rather than add a second competing dialog/menu system. Simple transitions use CSS; introduce an animation library only for a justified composition that CSS cannot express cleanly.

## State is data

`AgentPresence` separates `roleId` from its display name and defaults to `unknown`. Its supported state union is `unknown | idle | running | blocked | complete`; it does not infer freshness, establish authority or verify those values. The consuming application must derive them from authorized runtime evidence.

Timestamps, source revisions, run IDs and permission details are not dedicated presence props in this version. A consumer can display them through `EvidenceDisclosure` and supply a production adapter later. Treat stale or unavailable input explicitly; never map missing evidence to complete. The workbench's state selector is a labeled synthetic specimen, not a connection test.

`CommandPanel` invokes supplied local callbacks. Native `<dialog>` supplies modal semantics; the component adds filtering, result navigation, Escape handling and focus restoration. There is no command execution backend. `ProgressMeter` accepts `null` for indeterminate work and clamps finite values to a valid range. These primitives represent state; they do not measure it.

## Three candidate directions

| Theme | Visual behavior | Intended composition |
|---|---|---|
| Midnight | Deep mineral ink, aqua actions, controlled glass | Operator workspace and default component workbench |
| Daylight | Pale neutral canvas, white reading planes, deep teal | Knowledge, academy and sustained reading |
| Ember | Carbon brown, copper actions, warmer contrast | Creative studio and reflective work |

The themes share semantics and behavior, not an imposed portfolio identity. Preserve each product's accepted mark, reading palette and typography contract when adopting. The workbench preserves the current Starlight monochrome star geometry and uses the declared lab type roles.

Glass is progressive enhancement: tint and border remain when blur is unavailable; preference modes resolve to stable surfaces. No arbitrary backdrop is guaranteed to pass contrast. Keep body copy and dense evidence on opaque surfaces, and test actual composited backgrounds before adoption.

CSS timing is 120 ms for direct feedback, 240 ms for interface transitions and 400 ms for deliberate orientation. Reduced-motion and explicit no-motion modes suppress optional movement; the underlying text and state remain. No continuous animation should imply ongoing work without a real running state.

## Distribution

The registry builder packages five source files under `@ui/starlight/`, using shadcn target placeholders so the consumer controls its alias. Relative imports remain within that directory. Fonts, example screens and standalone SVG downloads are workbench assets, not files installed by the registry payload; the React icon definitions are included.

The local URL is an evaluation route. Public hosting, a namespaced registry, package publication, upgrade policy and an installable release tag are separate future changes. Before promoting any release, pin the tested CLI and verify a fresh consumer can install, type-check, build, open and remove the same exact source payload.

## Adoption and value

The adoption journey is inspect → choose → read source/dependencies → install → verify → compose. Keep the component browser useful without account creation. Optional update subscriptions and paid composed studios are commercial hypotheses, not active offers or evidence of demand. The strongest proof is a real downstream workflow using the same primitives through input, state, failure, correction and export.

Before runtime adoption, verify keyboard/focus behavior, labels, contrast on actual surfaces, narrow-screen reflow, 200% text zoom, no-blur/reduced-motion/forced-colors, empty/error/blocked states and exact-source rollback. Record build, functional, visual, accessibility, deployment and customer evidence separately. Passing local token tests establishes none of the later states by implication.

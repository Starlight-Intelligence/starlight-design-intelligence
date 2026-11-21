# Glass core: external docs read on 2026-11-21

Read date for every entry: 2026-11-21. Tools: Firecrawl scrape (URL mode), Context7, and
npm registry tarballs (`npm pack`, read as static files, nothing executed). Spend: EUR 0.
Items marked [OPEN] were not confirmed in an official source during this read.

## 0. Versions on npm (registry `latest`, 2026-11-21)

| Package | Version | License field |
| --- | --- | --- |
| next | 16.4.6 | MIT |
| shadcn (CLI) | 4.23.0 | MIT |
| gsap | 3.15.1 | Standard "no charge" license (gsap.com/standard-license) |
| @gsap/react | 2.1.2 | same GSAP standard license |
| @modelcontextprotocol/sdk | 1.32.2 | MIT |
| @copilotkit/react-core | 1.90.0 (`next` tag: 2.0.0-rc.68) | MIT |
| @ag-ui/core, @ag-ui/client | 1.0.5 | MIT |

## 1. Next.js App Router (v16.x)

Read: https://nextjs.org/docs/app/api-reference/functions/generate-viewport (page "Last updated
June 9, 2026"); Context7 `/vercel/next.js` (docs `02-guides/json-ld.mdx`,
`03-file-conventions/01-metadata/app-icons.mdx`, `manifest.mdx`, `01-getting-started/15-route-handlers.mdx`);
type file `next@16.4.6/dist/lib/metadata/types/extra-types.d.ts`.

- `viewport` / `generateViewport` exports are Server Component only; not both in one segment.
- Docs page lists `themeColor` (string or `{ media, color }[]`), `width`, `initialScale`,
  `maximumScale`, `userScalable`, `interactiveWidget`, `colorScheme`.
- `viewportFit` is not shown on the docs page, but the shipped type has it:
  `viewportFit?: 'auto' | 'cover' | 'contain'` (also `minimumScale`, `height`).

```ts
import type { Viewport } from 'next'
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  colorScheme: 'dark',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0b0d12' }],
}
```

- Caveat: MDN says iOS 10+ ignores `maximum-scale`/`user-scalable` by default, and disabling zoom
  fails WCAG 1.4.4. Do not ship `maximumScale: 1` as an iOS zoom fix (see item 9).
- `app/manifest.ts`: `export default function manifest(): MetadataRoute.Manifest` returning
  `{ name, short_name, description, start_url, display, background_color, theme_color,
  icons: [{ src, sizes, type }] }`. Cached by default unless it uses request-time APIs.
- `app/icon.tsx` / `app/apple-icon.tsx`: default export returns `new ImageResponse(jsx, { ...size })`
  from `'next/og'`; optional exports `size = { width, height }` and `contentType = 'image/png'`.
  Statically optimized unless it uses request-time APIs or uncached data.
- Route handlers `app/**/route.ts` export `GET`, `POST`, etc. Not cached by default; add
  `export const dynamic = 'force-static'` to cache `GET` (other methods are never cached).
  `dynamic` is not supported when Cache Components is enabled. Static export supports only
  `GET` with `force-static`.
- `.well-known`: Next's own e2e tests use dotted folder names (`app/api/hello.json/route.ts`),
  and the Proxy docs reference `.well-known` paths. A documented `app/.well-known/.../route.ts`
  example was not found. [OPEN] Safe documented fallback: a static file at
  `public/.well-known/starlight.json`. Verify the app-dir route with `next build` before relying on it.
- JSON-LD: render a native `<script type="application/ld+json">` in `page`/`layout` (not
  `next/script`), escaping `<`:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
```

## 2. shadcn registry and CLI

Read: https://ui.shadcn.com/docs/registry/registry-item-json, https://ui.shadcn.com/docs/cli
(code blocks did not render in scrape), Context7 `/shadcn-ui/ui` (namespace.mdx, skills/cli.md,
`packages/registry/src/registry/resolver.ts` and `fetcher.ts`, changelog 2025-07 local file support),
CLI source `shadcn@4.23.0/dist/index.js`.

- Item types: `registry:base`, `registry:block`, `registry:component`, `registry:font`,
  `registry:lib`, `registry:hook`, `registry:ui`, `registry:page`, `registry:file`,
  `registry:style`, `registry:theme`, `registry:item` (source also has `registry:example`, `registry:internal`).
- Item fields: `$schema` (https://ui.shadcn.com/schema/registry-item.json), `name`, `title`,
  `description`, `type`, `author`, `dependencies` (npm, `pkg@version`), `devDependencies`,
  `registryDependencies`, `files[]` (`path`, `type`, `target`), `cssVars`, `css`, `envVars`,
  `font`, `docs`, `categories`, `meta`. `tailwind` is deprecated (use `cssVars.theme`).
- "The `target` property is required for `registry:page` and `registry:file` types." `~` means
  project root (`~/foo.config.js`). Placeholders `@components/`, `@ui/`, `@lib/`, `@hooks/` map to
  `components.json` aliases (only at the start of `target`); `@utils/` unsupported.
- `registryDependencies` entries: bare shadcn names (`button`), `@namespace/item`,
  GitHub `owner/repo/item#ref`, full URLs, or local paths (`./hello-world.json`).
- `npx shadcn add <items...>` accepts names, namespaced names, GitHub addresses, URLs, and local
  JSON paths (`npx shadcn add ./block.json`). Flags: `-y`, `-o`, `-c <cwd>`, `-a`, `-p <path>`,
  `-s`, `--dry-run`, `--diff [path]`, `--view [path]`.
- `npx shadcn build [registry.json] -o ./public/r -c <cwd>` writes item JSON to `public/r` by default.
- Network: the resolver reads local JSON with `fs.readFile` (`fetchRegistryLocal`), so the item
  itself needs no network. Bare-name `registryDependencies` resolve to
  `styles/{style}/{item}.json` on the shadcn registry, which needs network. The CLI also installs
  npm `dependencies` through the package manager. Whether `add` makes any other network call
  (for example style/base color fetch) with a local item and no shadcn deps: [OPEN], test offline.

## 3. GSAP 3

Read: https://gsap.com/standard-license (redirects to gsap.com/community/standard-license/;
effective April 30, 2025, modified May 30, 2025), https://gsap.com/resources/React/,
https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/; package `gsap@3.15.1`.

- License grants use "on any website, web application, or digital interface"; commercial use is
  free (FAQ: "Commercial usage is covered", including SplitText and MorphSVG). Prohibited: using
  GSAP in no-code visual animation builders that compete with Webflow; reverse engineering for
  competitive products; removing notices. Webflow can amend terms; older versions keep prior terms.
- Selling a template that includes GSAP to others is not addressed explicitly. [OPEN] Lowest-risk
  pattern: declare `gsap` as an npm dependency rather than vendoring files, keep notices intact,
  and do not ship a visual animation builder. Get written confirmation before relying on it.
- `gsap.matchMedia()`: `mm.add(query | {name: query}, (context) => { ...; return cleanup })`;
  everything created inside reverts when the query stops matching; `mm.revert()` reverts all.
  Query strings are native `window.matchMedia` strings, so this works:

```js
const mm = gsap.matchMedia()
mm.add('(prefers-reduced-motion: no-preference)', () => { gsap.from('.panel', { y: 24 }) })
```

- `useGSAP` (`@gsap/react`): `gsap.registerPlugin(useGSAP)`; `useGSAP(fn, { scope, dependencies,
  revertOnUpdate })` or `useGSAP(fn, [deps])`. Animations created during execution revert on
  unmount; callbacks created later need `contextSafe()`. Needs `'use client'` in the App Router.
- ScrollTrigger: `import { ScrollTrigger } from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger)`
  (file `ScrollTrigger.js` ships in the package root).

## 4. Model Context Protocol

Read: https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning,
/specification/2026-07-28/changelog, /specification/2026-07-28/basic/transports/streamable-http,
/specification/2026-07-28/server/discover, /server/tools, /server/resources; also
/specification/2025-11-25/basic/transports and /basic/lifecycle for comparison.

- Current revision: **2026-07-28** ("The current protocol version is 2026-07-28"). It is
  stateless and breaks with 2025-11-25:
  - `initialize` / `notifications/initialized` removed. Each request carries
    `params._meta["io.modelcontextprotocol/protocolVersion"]`, `.../clientCapabilities`, and
    should carry `.../clientInfo`. Results should carry `_meta["io.modelcontextprotocol/serverInfo"]`.
  - New required RPC `server/discover` returns `supportedVersions`, `capabilities`, `_meta.serverInfo`,
    optional `instructions`, plus `ttlMs` and `cacheScope`.
  - `Mcp-Session-Id`, SSE resumability (`Last-Event-ID`), HTTP GET stream, `ping` removed.
  - All results need `resultType: "complete"` (or `"input_required"`). List and read results need
    `ttlMs` and `cacheScope` (`"public" | "private"`).
- Streamable HTTP (2026-07-28): single endpoint; every client message is a POST with
  `Accept: application/json, text/event-stream`; body is one JSON-RPC request or notification.
  For a request the server MUST return either `Content-Type: application/json` (one object) or
  `text/event-stream`; plain JSON is allowed. Notifications get `202` with no body.
- Required headers on POST: `MCP-Protocol-Version` (must match `_meta` value, else `400` +
  `HeaderMismatch` `-32020`), `Mcp-Method`, and `Mcp-Name` for `tools/call`, `resources/read`,
  `prompts/get`. Unsupported version: `400` + `UnsupportedProtocolVersionError` (`-32022`).
  Unknown method: `404` + `-32601`. GET/DELETE from older clients: `405`. Validate `Origin`.
- Shapes (2026-07-28):

```json
{"result":{"resultType":"complete","tools":[{"name":"get_status","description":"...",
 "inputSchema":{"type":"object","properties":{}}}],"ttlMs":300000,"cacheScope":"public"}}
{"result":{"resultType":"complete","content":[{"type":"text","text":"..."}],"isError":false}}
{"result":{"resultType":"complete","resources":[{"uri":"...","name":"...","mimeType":"..."}],
 "ttlMs":300000,"cacheScope":"public"}}
```

- Legacy 2025-11-25 (needed if clients still send `initialize`): `initialize` result is
  `{ protocolVersion, capabilities, serverInfo: { name, version }, instructions? }`; header
  `MCP-Protocol-Version` on later requests; no header means assume `2025-03-26`.
- Stub guidance: a Next.js `POST` route returning `Response.json(...)` is spec-valid for both
  revisions. Handle `server/discover`, `tools/list`, `tools/call`, `resources/list`; optionally
  answer `initialize` for older clients; return `405` for GET. SDK 1.32.2 support for 2026-07-28: [OPEN].

## 5. llms.txt

Read: https://llmstxt.org/ (now "v2" of the proposal).

- File at `/llms.txt` or any subpath (covers URLs under that path). Order: optional BOM; H1 with
  project name (the only required section); blockquote summary; optional non-heading markdown;
  zero or more H2 sections, each a list of `[name](url)` with optional `: notes`.
- `## Optional` holds secondary links an agent may skip. Recommend `.md` twins of pages
  (`page.html.md`) and `Link: <...>; rel="alternate"; type="text/markdown"`, `rel="describedby"`.

## 6. schema.org Product and Offer (Google Search Central)

Read: https://developers.google.com/search/docs/appearance/structured-data/product-snippet and
.../merchant-listing (both "Last updated 2026-09-08 UTC").

- Product snippet: required `name` plus one of `review`, `aggregateRating`, `offers`. Offer requires
  `price` (or `priceSpecification.price`); `price: 0` is allowed for free items. `availability` recommended.
- Merchant listing: Product requires `name`, `image`, `offers` (a single `Offer`, not
  `AggregateOffer`). Offer requires `price` > 0 and `priceCurrency` (ISO 4217); recommended
  `availability`, `itemCondition`, `priceValidUntil`, `hasMerchantReturnPolicy`, shipping details.
  `url` and `description`: [OPEN] (not read as required in this pass).
- Availability values Google accepts: `BackOrder`, `Discontinued`, `InStock`, `InStoreOnly`,
  `LimitedAvailability`, `OnlineOnly`, `OutOfStock`, `PreOrder`, `PreSale`, `SoldOut` (full URL or
  short name, one value only).
- "Only pages where a shopper can purchase a product are eligible for merchant listing experiences."
  For an unpurchasable draft, do not claim `PreOrder` or `PreSale` (those mean ordering is possible).
  Either omit `offers` (then no product rich result) or omit Product markup until a real price and
  checkout exist. Google may verify merchant data against the page.

## 7. AG-UI and CopilotKit v2

Read: https://docs.ag-ui.com/introduction; npm metadata; type file
`@copilotkit/react-core@1.90.0/dist/copilotkit-CfnudBCL.d.mts` (`src/v2/providers/CopilotKitProvider.d.ts`).

- AG-UI: open, event-based protocol connecting agent backends to user-facing apps (sits beside MCP
  for tools and A2A for agent-to-agent). Packages `@ag-ui/core`, `@ag-ui/client` at 1.0.5.
- `@copilotkit/react-core` 1.90.0 exports `./v2` (also `./v2/headless`, `./v2/context`,
  `./v2/styles.css`, `./v2/generative-ui`). `CopilotKitProvider` props include:
  `children`, `runtimeUrl?: string`, `headers?` (record or sync/async builder), `credentials?`,
  `agentId?: string` (default `"default"`, replaces v1 `agent`), `publicApiKey?`, `publicLicenseKey?`,
  `licenseToken?`, `properties?`, `useSingleEndpoint?`, `selfManagedAgents?`, `messageFilter?`,
  `renderToolCalls?`, `frontendTools?`, `humanInTheLoop?`.

```tsx
'use client'
import { CopilotKitProvider } from '@copilotkit/react-core/v2'
<CopilotKitProvider runtimeUrl="/api/copilotkit" agentId="starlight">{children}</CopilotKitProvider>
```

- Caveat: props are from shipped types, not a docs page; a v2.0.0 release candidate exists on the
  `next` tag, so names may shift. CopilotKit docs page for v2 provider: [OPEN].

## 8. WebGL lifecycle and preference queries

Read: MDN `HTMLCanvasElement/webglcontextlost_event` (modified Oct 26, 2026),
MDN `@media/prefers-reduced-transparency` (modified Apr 20, 2026).

- `webglcontextlost` fires on the canvas when the drawing buffer is lost (does not bubble);
  Baseline since July 2015. Simulate with `gl.getExtension('WEBGL_lose_context').loseContext()`.
  Pair with `webglcontextrestored` and `gl.isContextLost()`.
- Calling `event.preventDefault()` in the lost handler to allow restoration comes from the WebGL
  spec, not the MDN page read. [OPEN]
- Pause pattern (built from standard APIs; no single doc page read): an `IntersectionObserver` sets
  `visible`; the `requestAnimationFrame` loop schedules the next frame only while visible and
  `document.visibilityState === 'visible'`; cancel with `cancelAnimationFrame` on hide and on unmount.
- `prefers-reduced-transparency`: experimental, not Baseline. Supported in Chrome/Edge 118+,
  Opera 104, Samsung 25, Android WebView 118. No support in Safari, iOS Safari, or Firefox
  (disabled flag). Treat it as an extra signal, never the only path to an opaque surface.
- `prefers-reduced-motion`: MDN page not re-read today. [OPEN] (widely supported per prior knowledge).

## 9. iOS and mobile viewport

Read: https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/ (Chris Coyier, 2021,
citing Josh W. Comeau's demo); MDN `meta/name/viewport` (modified Sep 23, 2026); MDN
`Values/length`; MDN `Values/env` (modified Nov 10, 2026).

- iOS Safari zooms into a focused `<input>` when its `font-size` is 15px or less; 16px or more does
  not zoom. Fix with `font-size: max(16px, 1rem)` on inputs, not by disabling zoom. No Apple/WebKit
  primary doc found. [OPEN]
- Viewport units: `sv*` = small viewport (browser UI shown, stable), `lv*` = large, `dv*` =
  dynamic (changes as UI expands or retracts, can cause resize while scrolling). Default `vh`
  currently equals `lvh`. Use `min-height: 100svh` for heroes, `100dvh` only where tracking UI matters.
- `env(safe-area-inset-top|right|bottom|left, fallback)`: Baseline since January 2020; value is 0
  on rectangular viewports. MDN viewport page: `viewport-fit=cover` scales the viewport to fill the
  display and "it's highly recommended to use the safe area inset variables".

```css
.dock { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); }
```

## Contradictions with working assumptions

- (a) Holds. `viewportFit` and `maximumScale` are in the `Viewport` type (viewportFit only in types,
  not on the docs page). iOS ignores `maximum-scale`.
- (b) Holds. Local file paths work for `add`; `target` is required for `registry:page` and `registry:file`.
- (c) Partly. Free commercial use is explicit; resale inside a sold template is not addressed. [OPEN]
- (d) Holds, with a caveat. The current revision is 2026-07-28, not 2025-11-25. Plain
  `application/json` responses to POST are still allowed, but the protocol is now stateless: no
  `initialize`, a required `server/discover`, `Mcp-Method`/`Mcp-Name` headers, `resultType`,
  `ttlMs`/`cacheScope`.

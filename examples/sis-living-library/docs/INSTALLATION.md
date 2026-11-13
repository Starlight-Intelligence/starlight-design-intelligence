# Install Starlight Living Design

Node 22.18+ and React 19. The release archive contains the local npm tarball; the package is not published to npm. Original source rights remain unchanged; see SOURCE-RIGHTS.md before redistribution or sale.

```sh
npm install ./starlight-living-design-0.2.0.tgz
```

```tsx
import '@starlight/living-design/styles.css';
import { GlassSurface, StarlightButton } from '@starlight/living-design';

export function App() {
  return <main data-theme="daylight">
    <GlassSurface><StarlightButton>Review the work</StarlightButton></GlassSurface>
  </main>;
}
```

The package contains compiled ESM and TypeScript declarations. React is a peer dependency. It makes no requests and requires no account, environment variable, cloud resource, API key or internal runtime. Fonts are optional: use the declared system fallbacks, or install the Fontsource packages from the workbench with their notices.

## Next.js

Import styles.css in app/layout.tsx. Package interactive exports preserve `'use client'`; pass callbacks from a client component. The included examples/next-app uses the packaged tarball through a relative file dependency and bundles Tailwind 4 through its PostCSS adapter. From the kit root:

```sh
cd examples/next-app
npm ci
npm run build
npm run start
```

## Vite and Tailwind

The source workbench is a Vite app. Run npm ci and npm run build in its root. The deployable result is dist/. To use Tailwind 4:

```css
@import "tailwindcss";
@import "@starlight/living-design/styles.css";
@import "@starlight/living-design/tailwind.css";
```

Use bg-sl-canvas, text-sl-foreground, border-sl-border and rounded-sl-md for matching custom compositions. Theme selection is a data-theme attribute: midnight, daylight or ember. Override semantic --sl-* variables inside a brand scope; test every foreground/background pair after overriding. Never load @starlight/materials and this candidate's token sheets into the same scope.

## Adapters

- ApprovalCard emits a decision only. Authenticate and enforce permissions on the server, bind the exact artifact/scope, and disable repeat submissions during a pending operation.
- ModelSelector accepts a caller catalogue. UsageDisplay accepts authoritative input/output counts and a declared limit; null is unknown.
- WalletPortfolio accepts read-only records. It has no wallet connection, signer or transfer function.
- CheckoutSummary prepares a local order preview only. Integrate an established server-side checkout and independently verified fulfillment before sale.
- DataTable accepts typed columns and rows, a caption and an empty-state message. Keep horizontal overflow within its labeled region.

## Customize and deploy

Replace src/fixtures.ts with your own typed records and external adapters. The fixture flag must remain until all displayed data is authoritative. No automatic provider calls occur. Build with npm run build and deploy dist/ as a static site, or deploy the included Next app to your chosen Node host. No deployment URL is assumed.

Run npm run test:products for the four reference journeys and axe checks, and npm run check:budgets after the build. Set UPDATE_SNAPSHOTS=1 only when intentionally reviewing a new screenshot baseline; subsequent runs compare decoded PNG pixels. Browser executable selection uses STARLIGHT_CHROMIUM when provided.

## Agent-readable discovery

Read `/r/component-contracts.json` from the running demo, or import
`@starlight/living-design/component-contracts.json` from the installed archive.
The versioned manifest describes each component's explicit props, constraints,
source hashes, installation and platform compatibility. TypeScript declarations
remain authoritative for inherited native attributes and callback types.
`npm test` type-checks all 19 included usage examples against the source API.
Discovery grants no filesystem, payment, deployment or execution authority.

`tokens.json` retains the existing DTCG typed token groups byte-for-byte. Figma
requires an importer supporting those token types; Framer and Webflow require
platform-specific adaptations. No lossless conversion is claimed.

The package builder cleans its staging directory, checks an explicit file
allowlist and compares npm's archive inventory. `release/package-receipt.json`
records source revision, dirty state, per-file hashes and archive SHA-256. A dirty
receipt is a local candidate, never exact-commit release proof.

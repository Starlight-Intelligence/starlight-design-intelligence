# Living Design commercial packaging

Release candidate: 0.2.0. Prices below are the owner's target one-time EUR prices,
not evidence of configured checkout, tax treatment, sales or customer acceptance.
The source implementation and this packaging proposal remain separately reviewable.

## Product family

| Product | Target price | Delivery scope |
| --- | --- | --- |
| Living Glass UI Kit | €49 | Portable `@starlight/living-design` UI package, React component source, semantic dark/light tokens, original Signal utility icons, installation and customization documentation. |
| AI Startup Launch Kit | €149 | Living Glass UI Kit plus a standalone Next.js template and the premium AI SaaS launch reference, including pricing and checkout UI states with a configurable checkout adapter. |
| Premium Builder Bundle | €249 | AI Startup Launch Kit plus all four reference experiences, Vite and Next.js source, Figma-compatible SVG/token JSON exports, component documentation and release evidence. |

The four reference experiences are the Starlight Intelligence Console, StarBrowser
assistant workspace, Founder and Investor Intelligence dashboard, and premium AI
SaaS launch template. Their local fixture data demonstrates component behavior.
It does not establish a hosted agent, browser connection, company research feed,
wallet connection, model invocation or payment service.

## Existing catalogue and checkout

The existing commercial catalogue belongs to
`frankxai/frankx.ai-vercel-website`, under `/products`. Its current design ladder
already names `aurora-ui-kit` at `/products/aurora-ui-kit`; see the
[existing product index](../../../playbooks/lead-magnets-and-products-design/INDEX.md).
Treat Living Glass as a proposed evolution of that SKU. Reconcile its name,
delivery version and target price in the owning storefront instead of creating
a second checkout for the same core kit. The two larger packages are proposed
upgrades in that same product family. This document creates no checkout URLs,
payment products, entitlements or storefront records.

Sale remains blocked until the owner selects the source redistribution terms,
the existing storefront has verified checkout and fulfillment configuration,
and customer acceptance of the delivered installation/customization/deployment
journey has been recorded. Checkout components must remain visibly unavailable
when a host has supplied no verified checkout adapter. A local confirmation
must never claim a charge, order or entitlement.

## Portable distribution contract

The intended distribution contains a local package tarball for
`@starlight/living-design` version `0.2.0`; npm publication is not assumed.
Its intended exports are:

| Import | Purpose |
| --- | --- |
| `@starlight/living-design` | React components and public TypeScript API. |
| `@starlight/living-design/styles.css` | Semantic tokens and component styles, imported once by the consuming application. |
| `@starlight/living-design/tokens.json` | Machine-readable token exchange for design tools and custom projections. |
| `@starlight/living-design/tailwind.css` | Tailwind theme adapter; import after Tailwind in a Tailwind application. |

Use the actual archive filename returned by the release build. For example, from
the directory containing `starlight-living-design-0.2.0.tgz`:

```sh
npm install ./starlight-living-design-0.2.0.tgz
```

Install the React peer versions declared in the delivered package manifest.
Keep the application's own dependency lockfile. The package tarball, native
source, dependency notices and accompanying evidence must identify the same
release revision.

In a Vite application's entry module, or the global layout stylesheet import
boundary of a Next.js application:

```tsx
import '@starlight/living-design/styles.css';
import { StarlightButton } from '@starlight/living-design';

export function Example() {
  return (
    <section data-theme="daylight">
      <StarlightButton onClick={() => window.alert('Local example')}>
        Inspect the example
      </StarlightButton>
    </section>
  );
}
```

In Next.js, place an interactive component such as this example behind a
`'use client'` boundary. Keep the global CSS import in the root layout. The
distributed Next.js source must build independently; buyers must not resolve
source imports through this repository or a private workspace path.

For Tailwind, retain the core stylesheet import and add the adapter to the
application's global CSS:

```css
@import 'tailwindcss';
@import '@starlight/living-design/tailwind.css';
```

The Vite and Next.js source deliveries must each include their own `package.json`,
lockfile, build/start commands and local fixtures. Follow those delivered
READMEs for exact commands. No Starlight runtime account, internal API, private
environment file or paid model credential is required to inspect and deploy
the references. Any buyer-supplied integration must be explicit and optional.

## Customization and design handoff

Override semantic roles in an application-owned selector after importing the
core styles. Keep `data-theme="midnight"` or `data-theme="daylight"` at the
application root; use component-local scopes for independent specimens. Follow
[brand adapters](BRAND-ADAPTERS.md) before applying a portfolio identity. Validate
foreground/background, focus and state colors after every palette override.

SVGs and token JSON are Figma-compatible inputs. They are not a published Figma
library or evidence of native Auto Layout, component parity or Code Connect.
Keep editable-design identifiers and private handoff receipts outside this
public repository, following the
[native template pipeline](../../../playbooks/figma-template-pipeline.md).

## Rights and release evidence

Existing source rights remain unchanged. The Living Library's original source,
icons, marks and documentation carry no new permissive or commercial
redistribution grant through this proposal. Preserve
[provenance and distribution terms](PROVENANCE.md), dependency notices and font
licenses. `@starlight/materials` declares its own Apache-2.0 terms; that declaration
does not relicense the Living Library or its branding. A buyer's ability to
customize source requires explicit delivery terms before sale.

The release artifact must retain its source revision, build output, package
contents and dependency versions, clean-consumer install/build results, actual
desktop/mobile screenshots, accessibility findings, visual-regression results
and measured performance budgets. Label each result by its executed scope.
A prepared archive, successful local build or preview does not establish a
completed purchase or customer acceptance.

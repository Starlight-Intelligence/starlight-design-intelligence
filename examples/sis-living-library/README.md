# Starlight Living Design

**Interfaces for intelligence you can inspect.** A source-owned reference library for agent workspaces, knowledge products and creative studios: 12 React components, 24 original SVG icons, three candidate themes, purposeful motion and a shadcn-compatible registry payload.

This is a working design candidate. It is not a hosted agent runtime, a published package or proof of production adoption. The example app uses synthetic state and makes no external model calls.

It extends the existing material-package work rather than superseding it. Read the [PR #53 integration matrix](docs/MATERIALS-INTEGRATION.md) before production adoption; both candidates use `--sl-*` names and their token sheets must not be loaded into one scope.

## Run the workbench

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Explore materials and components, switch Midnight / Daylight / Ember, inspect synthetic agent states, export an SVG, and open the command panel with Ctrl/Cmd K. The form demonstrates local validation; it does not submit or save an email address.

```sh
npm run check
npm test
npm run build
```

The build type-checks the source, regenerates the registry payload and creates the Vite application in `dist/`. Tests cover semantic foreground/background pairs, icon packaging and agreement between source and the generated registry. They do not establish visual quality, third-party asset rights, full accessibility or a fresh-consumer CLI installation.

## Add it to an existing application

With the workbench running at port 5173:

```sh
npx shadcn add http://localhost:5173/r/starlight-living.json
```

The payload targets the consumer's configured `@ui/starlight/` directory and includes `index.ts`, `components.tsx`, `components.css`, `tokens.css` and `icons.tsx`. It expects a React application with CSS imports supported. Read the CLI's proposed file changes before applying them to an application that already contains a `starlight` directory.

This convenience command resolves the available shadcn CLI; the CLI is not a release dependency in this project. Pin a verified CLI version and perform a clean consumer install/build before promoting a registry release. No public registry URL is claimed here.

The supplied `npm run test:consumer` uses pinned CLI 4.23.0 and a local registry file in a disposable consumer. In the current environment the CLI validated the registry, then its neutral-color request failed at the network proxy. A completed CLI installation is therefore unverified. See [validation](docs/VALIDATION.md).

```tsx
// Adjust this path to your application's configured UI alias.
import {
  AgentPresence,
  EvidenceDisclosure,
  GlassSurface,
  StarlightButton,
} from '@/components/ui/starlight';

export function ResearchInspector() {
  return (
    <section data-theme="midnight">
      <GlassSurface material="solid">
        <AgentPresence
          roleId="research.sources"
          name="Research companion"
          role="Source inspection"
          status="unknown"
        />
        <EvidenceDisclosure summary="Inspect source and access">
          <p>No runtime binding has been verified.</p>
        </EvidenceDisclosure>
        <StarlightButton onClick={() => console.info('Local action')}>
          Inspect configuration
        </StarlightButton>
      </GlassSurface>
    </section>
  );
}
```

The registry does not bundle fonts. Consumers may use the declared system fallbacks or install the three Fontsource families listed in [provenance](docs/PROVENANCE.md). The workbench self-hosts those fonts through its pinned dependencies.

## Included

| Element | Contract |
|---|---|
| `GlassSurface` | Solid, glass and inset materials; solid by default |
| `StarlightButton` | Primary, secondary and ghost; two sizes; disabled/loading |
| `StatusBadge` | Unknown, idle, running, blocked and complete, each with text |
| `AgentPresence` | Explicit stable role ID, presentation name, role and state |
| `EvidenceDisclosure` | Native details/summary with inspectable content |
| `TextField` | Label, hint, error and composed description references |
| `Toggle` | Controlled pressed state with a native button |
| `Tabs` | Controlled/uncontrolled selection; arrows, Home and End |
| `CommandPanel` | Native modal dialog, filtering, arrow navigation and focus restoration |
| `EmptyState` | Explanation and optional recovery action |
| `Skeleton` | Labeled loading placeholder |
| `ProgressMeter` | Native determinate/indeterminate progress; bounded values |

The separate `Icon` API exposes 24 symbols on a 24-unit grid. Untitled icons are decorative; label the containing control. Standalone SVGs are available in `assets/icons/` and through the workbench.

## Design intent

**Midnight** is the default operator direction: mineral ink, cool fog and restrained aqua. **Daylight** gives reading and knowledge work a brighter plane. **Ember** adds warmth for studio contexts. These are candidate themes, not replacements for existing portfolio brand palettes.

Glass frames navigation and context. Opaque surfaces carry sustained reading. Motion communicates a change; it never supplies evidence of an agent run. OS reduced-motion, reduced-transparency and forced-color preferences are accommodated, alongside the workbench's glass toggle.

The reusable distinction is the combination of owned source, authored visual language and explicit operational state. Build the Starlight-specific layer; reuse established behavior and infrastructure. See [architecture](docs/ARCHITECTURE.md) and [foundations](docs/FOUNDATIONS.md).

## Ownership and release boundary

The intended source home is `examples/sis-living-library` in `Starlight-Intelligence/starlight-design-intelligence`, with runtime adoption occurring in the existing product repositories. This reference does not create a new portfolio authority.

No permissive license is granted to original Starlight source, icons or brand assets by this candidate. An MIT-licensed core is a proposal pending owner review. Dependency and font licenses retain their own terms; see [provenance](docs/PROVENANCE.md). Production deployment, published registry availability, Figma parity and customer validation require their own evidence.

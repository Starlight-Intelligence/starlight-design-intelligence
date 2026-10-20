# @starlight/materials

Living materials for Next.js 16: liquid glass behind a device gate and a frame budget, paper and ink primitives on shadcn, one state contract. Apache-2.0. Version 0.1.0, not yet on npm.

A material is a surface that answers to light, pointer, scroll and state, and that degrades on purpose. Every material here ships with a still that works with no script, a gate that decides on the reader's device and preferences, a budget, and a record in [DESIGN.md](DESIGN.md). The design and the rules behind this package are in the living-materials blueprint in `starlight-web-studio` (claude-skills-library, `docs/living-materials-system-Claude-Fable-2026-10-20.md`).

## What is in v0.1

| Path | What |
|---|---|
| `src/gate/` | `gpuPlan()`, the 8 ms median frame budget, `readEnv()`, and `useGlassPlan()`, an SSR-safe hook that answers `{ mode: 'css', reason: 'server' }` on the server and during hydration, then re-reads on preference, breakpoint and data-saver changes. Ported from the web-studio glass lab with its seven tests. |
| `src/glass/` | `GlassSurface`: the poster image and a CSS `backdrop-filter` panel with no script; a three.js refraction pass mounts over the same poster only when the gate says `webgl` and a 12-frame `gl.finish()` probe stays under 8 ms median. Pauses off screen with `IntersectionObserver`, resumes on re-entry, and tears down through one path on a preference change, a resize under 900px, a lost context, a failed poster or unmount. `mountGlass()` is the same wrapper without React. |
| `src/primitives/` | `Button`, `Card`, `Sheet` from shadcn 4.22 with a `material` prop (`glass`, `paper`, `ink`) and the state contract in `material.ts`: press depth, a visible gold focus ring on every material, hover only inside `(hover: hover) and (pointer: fine)`. |
| `src/tokens/` | `tokens.css` (CSS custom properties, `--sl-*`) and `theme.css` (Tailwind 4 `@theme`), both generated from `DESIGN.md` by `pnpm tokens`. Edit the tokens in DESIGN.md, never here. |
| `src/styles/materials.css` | shadcn's semantic variables mapped onto the tokens, the glass tiers, and the designed still under `prefers-reduced-transparency` and `prefers-reduced-motion`. |
| `registry.json` | A shadcn registry, built to `public/r/`. |
| `examples/next-app` | One Next.js 16 route per material with a `motion-score.md` beside it. |

## Install from the registry

Any repo with shadcn and Tailwind 4 can pull the components in without installing the package:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/frankxai/starlight-design-intelligence/main/packages/materials/public/r/glass-surface.json
```

Items: `materials-styles`, `material`, `glass-gate`, `glass-surface`, `material-button`, `material-card`, `material-sheet`. Each resolves its own dependencies, including `materials-styles`. Or register the namespace once in `components.json`:

```json
{
  "registries": {
    "@starlight": "https://raw.githubusercontent.com/frankxai/starlight-design-intelligence/main/packages/materials/public/r/{name}.json"
  }
}
```

then `npx shadcn@latest add @starlight/glass-surface`.

The files land under `components/starlight-materials/` with their tree intact, because they import each other by relative path with `.ts` and `.tsx` extensions (so the same sources run under `node --test` with no build). Set `"allowImportingTsExtensions": true` in the consuming `tsconfig.json`; Next.js projects have `noEmit: true`, which is what that option requires. Add to the global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "./components/starlight-materials/styles/materials.css";
```

The registry URL points at `main`; until this package's branch merges, use the branch's raw URL instead.

## Use as a package (workspace link)

```json
{ "dependencies": { "@starlight/materials": "link:../path/to/packages/materials" } }
```

```ts
// next.config.ts
export default { transpilePackages: ['@starlight/materials'] };
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@starlight/materials/styles.css";
@source "../node_modules/@starlight/materials/src";
```

```tsx
import { GlassSurface } from '@starlight/materials/glass';
import { Button, Card } from '@starlight/materials/primitives';

<GlassSurface poster="/poster.png" posterAlt="A studio window at night" posterWidth={1440} posterHeight={900}>
  <h2>Development snapshot</h2>
  <Button material="glass">Open the log</Button>
</GlassSurface>
```

Glass needs `three` in the consuming app; the import is dynamic, so nothing else pays for it. Exports point at TypeScript source; the consuming bundler transpiles it. A built `dist/` is not part of v0.1.

## Checks

```bash
pnpm test                 # node --test: the seven gate tests plus the SSR hook test
pnpm typecheck            # tsc --noEmit
pnpm lint:design          # npx @google/design.md lint DESIGN.md
pnpm tokens               # regenerate tokens.css and theme.css from DESIGN.md
pnpm registry:build       # shadcn build registry.json --output public/r
node <web-studio>/bin/materials-gate.mjs .   # the model-free materials gate, must PASS
```

The gate checks that DESIGN.md is in spec order with tokens, that refraction is gated, that no route reaches two renderer modules, that the renderer references visibility handling and a poster, that a motion library has a score, and that components type no colour literals. It is static: it proves a pattern is absent, never that a page behaves. What it cannot know is checked by eye in the example app and recorded in the PR.

## Measured

The frame cost is measured, not assumed, on every mount: the median of 12 probe frames timed around `render()` plus `gl.finish()`. `GlassSurface` reports it through `onPlan` and writes it to `data-glass-ms` on the scene. The numbers for the devices this has run on are in the pull request that landed each version; re-measure on the slowest target device before shipping glass on a new page.

## Not in v0.1

Light, grain and depth materials; `useBeat` and GSAP motion (routes here use CSS transitions only); a Dialog primitive; a built `dist/`; npm publication (Frank's).

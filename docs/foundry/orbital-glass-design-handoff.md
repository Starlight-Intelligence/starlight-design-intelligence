# Orbital Glass design-system handoff

The Orbital Glass study gives v0 and Claude the same runnable example to check against the Starlight component library. It uses the packaged GlassSurface and StarlightButton, the midnight semantic theme, and the Observatory Glass direction. The lens is a CSS specimen. Its single replay reveals the rim, takes 1.2 seconds, and settles on the same composition shown in reduced motion.

## Source and build

- Review the [Starlight material foundations](../../brand-packs/sis/foundations/README.md) and the [identity source authority](../../brand-packs/sis/SOURCE_AUTHORITY.md). Use the approved artwork when composing a branded mark. The specimen is an optical object.
- Use the [Living Library registry](../../examples/sis-living-library/registry.json) and [consumer app](../../examples/sis-living-library/examples/next-app). Build the local package from the same checkout before installing the consumer.

```sh
cd examples/sis-living-library
npm ci
npm run build:package
cd examples/next-app
npm ci
npm run dev
```

Open `/orbital-glass`. The existing root and `/launch` demos remain available. Fonts are local Latin subsets from the same pinned OFL families used by the Living Library. The consumer lockfile includes the exact local package integrity.

## v0 team import

1. In the Starlight workspace, open [Design Systems 2.0](https://v0.app/docs/design-systems-2) and choose **Import your own**. Supply this repository and the review branch, the registry and consumer paths above, and only the approved frames from **Reusable Brand Masters** and **Atelier II** that the team is authorized to import. Use frame-level links from Figma. Keep the reviewed preview and its access scope with the import.
2. Choose the Next.js consumer as the verification target. The repository must remain available from its root because the consumer references the generated package two levels up. Give the build commands above to v0. For Git Import, scope the Vercel GitHub App to the repository and choose an isolated preview project.
3. Run the prompt below and compare the generated result with `/orbital-glass`. Verify that the dependency and tokens resolve, the card and button come from the package, and the keyboard, narrow viewport, reduced-motion and forced-colors behavior survive. Record the source commit, chat URL, preview URL and result before saving the team skill.

```text
Use the Starlight Living Library and approved Starlight frame references to verify one Orbital Glass material specimen. Reuse the existing /orbital-glass route, GlassSurface, StarlightButton and midnight theme. Keep the ink reading surface opaque, and use a warm inner rim and cool outer edge on a single lens. The light moves only on replay, then settles. Verify a narrow mobile layout, keyboard activation, reduced motion and forced colors. Use local fixtures. Return component import paths, the source commit, preview URL, and checks for review.
```

For headless operation, configure the [v0 MCP server](https://v0.app/docs/api/v1/adapters/mcp-server) with a workspace-scoped secret, or use an authorized [Vercel Connect v0 binding](https://vercel.com/connect/v0). Keep generated runs private through review and store the chat ID and preview URL alongside the initiating source commit. Git import and team design-system approval remain explicit workspace operations.

## Claude Design

Open the same checkout in an authenticated Claude Code session. Run [`/design-sync`](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) and select the Living Library source and its semantic tokens. Add the approved Figma frames through Claude Design only when the workspace has access. Inspect the same two components, typography roles and four rendering states before sharing the resulting artifact. Record its URL and exact Git revision next to the v0 receipt. Use GitHub for subsequent source changes and resync when that revision changes.

## Upstream effects

| Source | Adoption decision |
| --- | --- |
| [Liquid Glass JS](https://github.com/dashersw/liquid-glass-js) | Use for an isolated comparison. The earlier Arcanea import documented a permanent scroll listener and missing destroy API. An opt-in adapter needs explicit mount, disposal and fallback first. |
| [Paper Shaders](https://github.com/paper-design/shaders) | Benchmark one canvas effect against the CSS baseline. Pin an exact version and retain applicable LICENSE and NOTICE. |
| [ShaderGradient](https://github.com/ruucm/shadergradient) | Review the existing Arcanea wrapper in [#186](https://github.com/Arcanea-Labs/arcanea-ai-app/pull/186) before adopting. Choose one renderer for each surface. |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Use for a scene that requires geometry, a camera or spatial light. Load it at the scene boundary with a static first frame and a mobile performance budget. |
| [Paper Liquid Logo](https://github.com/paper-design/liquid-logo) | Evaluate the technique for a reveal using the approved Starlight source artwork and preserve the original vector. |

The [portfolio reuse review](portfolio-reuse-2026-11-13.md) records the existing FrankX liquid runtime and Arcanea experiments. Reuse those paths before adding another engine. The first consumer keeps its CSS fallback and has no new WebGL dependency.


# Starlight Living Design foundations

Version 0.1 · implementation candidate · 31 October 2026

The system is a source-owned extension to the existing Starlight design authority. It shares semantic contracts across product surfaces while preserving each brand's own art direction. It does not establish a new portfolio Registry or approved character canon.

## Material and color

**Midnight** is the default: mineral ink, cool fog, restrained aqua. **Daylight** is the high-readability working mode: warm fog, white panels, deep teal. **Ember** is the warm studio variation: carbon brown and copper.

Set `data-theme="midnight"`, `data-theme="daylight"`, or `data-theme="ember"` on the root or a scoped surface. Import `tokens.css` before component styles. Components consume semantic properties rather than palette literals. Theme selectors do not set global typography, margins, or background styles.

| Semantic role | CSS token |
| --- | --- |
| Canvas / opaque surface | `--sl-bg` / `--sl-panel` |
| Primary / secondary text | `--sl-text` / `--sl-muted` |
| Control boundary | `--sl-line` |
| Primary action / action text | `--sl-accent` / `--sl-accent-ink` |
| Success / failure label | `--sl-success` / `--sl-danger` |
| Glass tint / blur | `--sl-glass` / `--sl-glass-blur` |

Glass is reserved for transient navigation, focus surfaces and bounded accents. Content reading areas remain opaque. The tinted fallback is present without backdrop-filter support. Reduced transparency resolves glass to the opaque panel; forced-colors uses system colors. These are CSS accommodations, not a claim that arbitrary image backdrops meet contrast requirements.

## Tokens and portability

`tokens/tokens.json` contains typed DTCG-format color, dimension, duration, cubic Bézier, and font-family values. Color values use sRGB component objects, dimensions and durations use `{value, unit}` objects. Theme groups are ordinary explicit token groups. There is no invented `$themes` extension. Tool adapters select a theme and resolve it to semantic variables; the CSS file is the current projection. Figma mode synchronization must be verified independently.

The spacing scale is 4, 8, 12, 16, 24, 32, 48 and 64 px. Control radii are 8/14 px; larger material surfaces use 24 px. Touch targets should be at least 44 px in the composed interface. Typography uses Instrument Sans for interface and reading, Instrument Serif for brief editorial accents, and IBM Plex Mono for code and aligned data. The workbench self-hosts Fontsource 5.3.0 assets; the registry source declares these families with system fallbacks but does not include font binaries. See [provenance](PROVENANCE.md) for licenses.

## Motion grammar

- 120 ms: direct control feedback.
- 240 ms: entering a contextual surface.
- 400 ms: a deliberate focus transition.
- Entry easing: `(0.22, 1, 0.36, 1)`; exit: `(0.4, 0, 1, 1)`.

Animate opacity and transforms only where the change communicates a state transition. Runtime motion cannot stand in for measured progress or availability. `prefers-reduced-motion` sets timing tokens to zero; component keyframes must also honor the preference. `data-motion="none"` provides an explicit opt-out for timed transitions.

## Signal icon family

24 original vector glyphs share a 24-unit grid, 1.6-unit rounded stroke and simple silhouettes. They are authored for this implementation; no third-party icon paths were copied. The standalone SVG files live in `assets/icons/`; the typed React API is `Icon`, `IconName`, `IconProps`, `iconNames`, and `iconPaths`.

```tsx
<Icon name="compass" title="Explore" />
<button aria-label="Search"><Icon name="search" size={20} /></button>
```

An icon with a title or external accessible label is exposed as an image. Untitled icons are decorative and hidden from assistive technology. Name the containing control rather than repeating its label on an icon. Runtime instance IDs must never be derived from an icon, character name or display label.

Included glyphs: compass, orbit, signal, layers, check, arrowRight, search, close, warning, sun, moon, code, grid, spark, arrowUpRight, play, pause, shield, link, branch, archive, eye, settings, download.

## Acceptance boundary

Token shape and icon count can be checked deterministically. Readability, correct status meaning, keyboard behavior and reflow require testing the composed UI. These source files do not claim production deployment, a published team library, customer adoption, or live agent execution.

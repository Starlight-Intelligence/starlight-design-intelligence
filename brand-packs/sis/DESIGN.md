---
version: "3.0"
name: Starlight Living Design Language
description: Living design language for Starlight surfaces. Celestial precision x warm human craft.
colors:
  primary: "#070A10"
  secondary: "#EFEDE7"
  tertiary: "#C9A15C"
  neutral: "#EDE6D8"
  surface: "#070A10"
  surface-paper: "#EFEDE7"
  surface-ivory: "#EDE6D8"
  surface-operator: "#0B0D12"
  on-surface: "#EDE6D8"
  on-paper: "#0E131B"
  accent: "#C9A15C"
  accent-bright: "#F0C87E"
  signal: "#82D8E6"
  signal-operator: "#73E6FF"
  glass-tint: "rgba(13, 17, 25, 0.58)"
  glass-tint-webgl: "rgba(7, 10, 16, 0.30)"
  glass-tint-paper: "rgba(247, 245, 240, 0.72)"
  glass-opaque: "#0D1119"
  hairline: "rgba(237, 230, 216, 0.12)"
  hairline-paper: "rgba(7, 10, 16, 0.14)"
  hairline-operator: "rgba(124, 146, 194, 0.18)"
  focus: "#F0C87E"
  status-ok: "#77F0BF"
  status-warn: "#E8C36A"
  status-breach: "#FF7B7B"
  status-unknown: "#B7A2FF"
typography:
  display:
    fontFamily: Instrument Sans
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Instrument Sans
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Instrument Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  accent-italic:
    fontFamily: Instrument Serif
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.2
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Instrument Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Instrument Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  label-sm:
    fontFamily: Instrument Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.01em
  code:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin: 32px
  measure: 68ch
rounded:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 24px
  xl: 40px
  full: 9999px
components:
  glass-surface:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-glass:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px
  button-paper:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-paper}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px
  button-ink:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px
  card-glass:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-paper:
    backgroundColor: "{colors.surface-paper}"
    textColor: "{colors.on-paper}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-ink:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  status-badge:
    textColor: "{colors.status-ok}"
    rounded: "{rounded.full}"
    padding: 6px
  agent-presence:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  evidence-disclosure:
    textColor: "{colors.on-surface}"
    padding: 12px
---

# Starlight Living Design Language (`v3.0`)

> Canonical Design & Material Specification for Starlight Intelligence Systems (SIS).  
> Governed by `starlight-design-intelligence` (SSOT). Machine-readable via `@google/design.md`.

---

## 1. Core Aesthetic Thesis: *Celestial Precision × Warm Human Craft*

Starlight feels like a sovereign, future institution that already deserves to exist. It deliberately repudiates two widespread 2026 failure modes:
1. **Neon Sci-Fi Slop:** Purple-cyan gradient wallpaper, floating 3D heads, ungrounded particle storms, and decorative HUD clutter that obscures human purpose.
2. **Sterile SaaS Monotony:** Cold hospital-white cards, identical gray typography, and zero-depth template clones devoid of soul.

The Starlight Living Design Language resolves both through **Three Governing Laws**:

### Law 1: One Living Physics Across Four Contextual Modes
The design system operates with a single unified physics that adapts across four contextual surface modes and two substrate grounds:
- **Horizon Mode:** Cinematic scale, generous architectural space, luminous celestial atmosphere, and thoughtful human presence (flagship home, manifestos, movement hub).
- **Operator Mode:** Disciplined hairline cockpit density, stable navigation, value-stepped dark surfaces, and inspectable cryptographic receipts (console, verify, auditor, telemetry).
- **Academy Mode:** Warm studio lighting, tactile knowledge maps, artifact progression, and faculty mentor presence (learning studio, constellation lab).
- **Cultural Mode:** Expressive typography, music and character imagery, ritual dignity, and intimate human craft.
- **Ground Substrates:** **Ink Ground (`#070A10`)** for deep night focus and cosmic depth; **Paper Ground (`#EFEDE7`)** for warm, architectural reading and long-form prose.

### Law 2: Clarity-as-Freshness Materiality (`starlight.material_foundations.v1`)
Liquid glass is never decorative wallpaper. On operational surfaces, glass clarity directly encodes live system freshness:
- **Fresh (`<5 min`):** Crystal hairline with subtle specular highlight (`--sl-bevel-highlight`).
- **Stale (`15m – 2h`):** Desaturated matte diffusion.
- **Breach / Disconnected (`>24h`):** Amber hairline with inspectable status badge.
- **Budgets:** Glass blur is strictly capped at `18px`, with a maximum of **2 visible backdrop surfaces per viewport** and **zero nested blur**.

### Law 3: One Gold Per Fold, Earned by Human Agency
Warm Starlight Gold (`#C9A15C` / `#F0C87E`) is reserved strictly for **human sovereignty, approval gates, and primary commitments**. It is never squandered on idle chrome or secondary buttons. Companion Cyan (`#82D8E6` / `#73E6FF`) signals **live agent telemetry and verified protocol links**.

---

## 2. Refero Mode Locks (Architecture & Grammars)

External benchmarks and bounded borrows are cataloged in [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md) and [refero-funnel-atlas.md](../../playbooks/refero-funnel-atlas.md):

| Surface Mode | Primary Refero Lock | Bounded Secondary Borrow | Explicit Anti-Slop Rejects |
|---|---|---|---|
| **Horizon Mode** *(Home, Manifesto, Brand Lab)* | **Drepute** (`aa138c1f`, [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md)) — One authored night scene per fold, serif display line, flat dark surfaces, minimal chrome; stage containers follow [refero-funnel-atlas.md](../../playbooks/refero-funnel-atlas.md). | **Chantlings** (`1c90b38a`, [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md)) — Single warm gold accent per fold marking human arrival or commitment. | Reject generic starfield backgrounds, floating monoliths (`7524da9c`), iridescent particle storms (`9d795615`), and uncontained WebGL behind body prose. |
| **Paper Mode** *(`/constitution`, `/sip`, `/research`, `DESIGN.md`)* | **Warm Architectural Paper** (`#EFEDE7`) — `1px` hairline tables, `8px` specimen cards, `9999px` pill controls, and OpenAI developer onboarding clarity ([REFERENCE-LOCKS.md](REFERENCE-LOCKS.md) flow `4178`). | **IBM Plex Mono** (`400` weight) — Quiet monospace labels for commit SHAs, SIP receipts, and timestamps. | Reject cold `#FFFFFF` hospital white; reject decorative pull-quote clip art. |
| **Operator Mode** *(Console, `/verify`, Command Center)* | **Linear Changelog** (`11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6`, [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md)) — Value-stepped dark surfaces (`#070A10` → `#0D1119` → `#141926`), hairline borders (`rgba(237,230,216,0.12)`), keyboard-first focus rings. | **Warp `/code`** (`3aff8b9c-ac69-4392-9862-c82e9db2dec7`, [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md)) — Structured command output, diff panes, and cryptographic receipt trays. | Reject Lemni payment-first order (flow `4573`), neon cyberpunk dashboards, 5-color rainbow status badges, and animated chart gimmicks. |
| **Academy & Cultural** *(`.academy`, Agent Lab, Constellation)* | **Ableton Push** (`c293f913-7c99-4c41-8d92-2c6d9f0f12e7`) / **Elektron** (`362d9644-ce48-40af-8c2a-35753ec54b5e`, [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md)) — Tactile studio instrumentation, hardware-grade specimen plates for agent codex. | **Starlight Identity Master** ([identity.json](../../tokens/brands/starlight/identity.json)) — Instrument Serif italic editorial grace notes + 4-star cursor geometry. | Reject billing toggles on one-time packs, gamified XP popups, and cartoon mascot takeovers on protocol surfaces. |

---

## 3. Unified Token Specification (`starlight.living_design.v3`)

### 3.1 Palette & Grounds

- **Canvas Ground 0 (`--sl-bg`):**
  - Ink Mode: `#070A10` (Night Ink)
  - Paper Mode: `#EFEDE7` (Warm Architectural Paper)
  - Operator Profile: `#0B0D12` (Cockpit Ground)
- **Surface 1 (`--sl-surface-1`):**
  - Ink Mode: `#0D1119` (Obsidian Panel)
  - Paper Mode: `#F7F5F0` (Porcelain Sheet)
  - Operator Profile: `#11141C`
- **Surface Glass (`--sl-glass-bg`):**
  - Ink Mode: `rgba(13, 17, 25, 0.58)` with `backdrop-filter: blur(18px) saturate(115%)`
  - Paper Mode: `rgba(247, 245, 240, 0.72)` with `backdrop-filter: blur(18px) saturate(110%)`
  - Operator Profile: `rgba(17, 20, 28, 0.78)`
- **Primary Text (`--sl-fg`):**
  - Ink Mode: `#EDE6D8` (Warm Ivory, WCAG AAA 14.9:1)
  - Paper Mode: `#0E131B` (Deep Slate, WCAG AAA 15.2:1)
  - Operator Profile: `#E8EBF2`
- **Muted Text (`--sl-fg-muted`):**
  - Ink Mode: `#8B93A1` (6.4:1 contrast)
  - Paper Mode: `#525B68` (6.1:1 contrast)
  - Operator Profile: `#8B93A7`
- **Hairline Divider (`--sl-border`):**
  - Ink Mode: `rgba(237, 230, 216, 0.12)`
  - Paper Mode: `rgba(7, 10, 16, 0.14)`
  - Operator Profile: `rgba(124, 146, 194, 0.18)`
- **Human Gate Gold (`--sl-gold` / `--sl-gold-bright`):**
  - Ink/Operator: `#C9A15C` / `#F0C87E`
  - Paper Mode: `#8A6522` (tuned for AA contrast against paper)
- **Protocol Cyan (`--sl-companion`):**
  - Ink/Operator: `#82D8E6` / `#73E6FF`
  - Paper Mode: `#16697A` (tuned for AA contrast against paper)

### 3.2 Accessible Status Quartet
Color is never the sole differentiator. Every status token carries dual encoding: color + shape + glyph:

| Status | Color Token | Shape Token | Glyph | Meaning in System |
|---|---|---|---|---|
| **`ok`** | `--sl-status-ok` (`#77F0BF`) | `outline` | `●` | Verified passing receipt, healthy connection |
| **`warn`** | `--sl-status-warn` (`#E8C36A`) | `tinted` | `▲` | Degraded, stale data, attention requested |
| **`breach`** | `--sl-status-breach` (`#FF7B7B`) | `filled` | `■` | Gate failure, contract violation, disconnected |
| **`unknown`** | `--sl-status-unknown` (`#B7A2FF`) | `dashed` | `◆` | No telemetry, unverified candidate |

### 3.3 Typography Triad

- **Interface & Reading:** `Instrument Sans` (OFL-licensed via `next/font/google` or host-bundled WOFF2; OFL license notices in `fonts/`, 400 & 600 weight, sentence case).
- **Editorial & Accent:** `Instrument Serif (italic)` (400 weight; reserved for titles, quotes, chapter marks).
- **Code & Identifiers:** `IBM Plex Mono` (400 & 500 weight; commit SHAs, prompt hashes, JSON keys, telemetry).

---

## 4. Mark Lineage & Geometry Contract

Starlight acknowledges and reconciles two canonical marks:

1. **Primary Ecosystem Mark (`Starlight Star`):**  
   The restored 4-point geometric star with luminous core (`#FBF6EB`) and orbital companion dot (`#82D8E6`) from `identity.json`. Used on `starlightintelligence.ai`, `starlightintelligence.academy`, Starlight Nexus desktop app, and public Open Design Kit exports.
   - Minimum color size: `24px` (monochrome below `24px`).
   - Clearspace: `0.25` of mark width.
2. **Protocol Sigil Variant (`Telescope Orbit-Star`):**  
   The elliptical orbital horizon mark preserved on `starlightintelligence.org` as the **SIP Open Protocol sigil** (analogous to Linux/Ethereum foundation vs. protocol marks). Harmonized onto the exact Living Design v3.0 Ivory, Gold, and Cyan palette.

---

## 5. Material Foundations & Device Gate (`@starlight/materials`)

The material runtime provides:
1. **`GlassSurface`:**
   - **Tier 1 (WebGL2):** Real-time refraction shader via `use-glass-plan.ts` and `mount-glass.ts` (Three.js mesh, pauses off-screen, tears down on resize under 900px or lost context).
   - **Tier 2 (CSS):** Hardware-accelerated `backdrop-filter: blur(18px) saturate(115%)` with inset bevel highlight (`inset 0 1px 0 rgba(251,246,235,0.18)`).
   - **Tier 3 (Static Matte):** High-contrast fallback for reduced transparency, low battery, or server-side render.
2. **Resource Budgets:**
   - Frame budget: 12-frame probe under `8ms` median.
   - Maximum 2 visible backdrop surfaces per viewport; nested blur is strictly prohibited.
   - Particle cap: 24 particles on desktop, 12 on mobile (`<=3px` diameter).
   - Max animation sequence: `1800ms` with single iteration (`iterations: 1, autoplay: false`).

---

## 6. The 24 Signal SVG Icons System

Twenty-four original vector icons designed on a crisp 24-unit grid with 1.6-unit strokes. Zero external icon dependencies.

- **Available Icons:** `archive`, `arrowRight`, `arrowUpRight`, `branch`, `check`, `close`, `code`, `compass`, `download`, `eye`, `grid`, `layers`, `link`, `moon`, `orbit`, `pause`, `play`, `search`, `settings`, `shield`, `signal`, `spark`, `sun`, `warning`.
- **Exports:**
  - Standalone SVG: `icons/signal/*.svg`
  - React Components: `packages/materials/src/icons/` (`<Icon name="..." />` and named exports `<CompassIcon />`, etc.)

---

## 7. Three-Register Agent Visual System

Downstream SIS surfaces (such as `Starlight-Intelligence-System` `site/src/components/living-design/AgentSigil.tsx`) map registered agents across three visual registers rather than generating ungrounded raster avatars:
- **Register 1 (Sovereign Core):** Geometric Vector Sigil + harness accent ring + curated art-directed portraits in `/queen` and `/visuals/brand-lab`.
- **Register 2 (Universal IS & Leadership):** Orbital House Crest SVGs with metric and skill overlays.
- **Register 3 (Domain Specialists):** Parametric `<AgentSigil id="..." />` generator deriving crisp vector geometry from `{tier, domain, voice, activeSkills}` scaling from 16px to 512px.
- **Anti-Slop Overlay Rule:** AI-generated raster/video plates supply atmosphere, lighting, and architectural mood only—never baked-in text or pseudo-diagrams. All text, numbers, and badges are rendered as live HTML/SVG code overlays.

---

## 8. Candidate Material Foundations

[Material foundations](foundations/README.md) define a candidate lab workbench for
obsidian, porcelain, liquid glass, depth, texture, finite particle motion and
Starlight material objects. Its [tokens](foundations/tokens.json) are checked by
the kernel validator. The existing mark, site-specific reading palettes and
surface modes remain authoritative. The candidate's narrow specimen scope is
not a new global palette, an approved character, a published Figma library or
proof of product adoption. Use its [acceptance gate](../../evals/starlight-material-foundations.md)
with actual rendered evidence before promotion.

---

## 9. Release Verification Checklist

Every surface adopting Living Design v3.0 must pass:
- [ ] Zero hardcoded hex colors outside `tokens.css` or `tokens.json`.
- [ ] WCAG AAA contrast (14.9:1) for body text; WCAG AA (8.8:1) for gold/cyan accents.
- [ ] Bounded glass: maximum 2 glass surfaces per viewport, zero nested blur.
- [ ] Accessible status encoding: dual color + glyph + shape on all status indicators.
- [ ] Full responsiveness: Desktop (`1440×900`) and Mobile (`390×844`).
- [ ] Prefers-reduced-motion: zero continuous looping animations or transforms.

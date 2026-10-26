---
version: alpha
name: Starlight materials
description: Living materials for Starlight surfaces. Glass, paper and ink primitives with one state contract, a device gate and a frame budget.
colors:
  primary: "#070A10"
  secondary: "#EFEDE7"
  tertiary: "#C9A15C"
  neutral: "#EDE6D8"
  surface: "#070A10"
  surface-paper: "#EFEDE7"
  surface-ivory: "#EDE6D8"
  on-surface: "#FBF6EB"
  on-paper: "#070A10"
  accent: "#C9A15C"
  accent-bright: "#F0C87E"
  signal: "#82D8E6"
  glass-tint: "rgba(7, 10, 16, 0.62)"
  glass-tint-webgl: "rgba(7, 10, 16, 0.30)"
  glass-opaque: "#111113"
  hairline: "rgba(251, 246, 235, 0.10)"
  highlight: "rgba(251, 246, 235, 0.18)"
  focus: "#F0C87E"
  error: "#E06C5B"
typography:
  display:
    fontFamily: Instrument Sans
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.02em
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
  measure: 46
rounded:
  sm: 8px
  md: 14px
  lg: 24px
  xl: 40px
  full: 9999px
components:
  button-glass:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px
  button-paper:
    backgroundColor: "{colors.surface-paper}"
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
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  sheet-glass:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 24px
  sheet-paper:
    backgroundColor: "{colors.surface-paper}"
    textColor: "{colors.on-paper}"
    rounded: "{rounded.xl}"
    padding: 24px
  sheet-ink:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 24px
  focus-ring:
    backgroundColor: "{colors.focus}"
    size: 2px
---

# Starlight materials

## Overview

This package is the material layer under Starlight surfaces in Operator mode: calm, precise, inspectable. A material is a surface that answers to light, pointer, scroll and state, and that degrades on purpose. Three ship in this version. Glass is a translucent panel over a scene; it blurs by CSS everywhere and refracts by WebGL only where the device, the reader's preferences and a measured frame cost all allow it. Paper is the warm light surface of the Starlight lab, ivory on limestone, for reading and forms. Ink is the deep night surface for shells, command bars and anything that frames a scene.

Buttons, cards and sheets are not materials. They are primitives that wear one, through a single `material` prop, and they share one state contract: a press that sinks, a focus ring that is always visible, and hover that exists only where a fine pointer exists.

The audience is an agent building a Starlight surface and a person reading it on a phone. Every rule here is one an agent can check mechanically; the companion gate (`materials-gate`) reads this file and the source.

## Colors

The palette is the observed starlightintelligence.ai lab palette, carried here as tokens so a component never types a literal.

- **Primary, ink (#070A10):** the night surface and the text colour on paper. Not pure black, so shadows and glass tints still read as depth.
- **Secondary, paper (#EFEDE7):** the reading surface. Warm limestone rather than white, so paper feels like a studio page, not a blank template.
- **Neutral, ivory (#EDE6D8):** paper's second tone, for cards resting on paper and for the designed still that replaces glass under reduced transparency on light scenes.
- **Tertiary, gold (#C9A15C) and gold bright (#F0C87E):** human contribution, arrival, focus. The focus ring is gold bright on every material. Gold is the only accent a primitive may use for its primary action.
- **Signal, companion cyan (#82D8E6):** live state and connection. Used for status, never for decoration.
- **On surface, star core (#FBF6EB):** text on ink and on glass. Hairline and highlight are this colour at 10% and 18%.
- **Glass tint:** ink at 62% behind a CSS blur; ink at 30% when the WebGL pass is doing the frosting and darkening itself. Under reduced transparency the tint becomes the opaque `glass-opaque` (#111113) with a hairline and an inset highlight, which is a designed still, not a missing effect.
- **Error (#E06C5B):** the one warm red, for validation and failed probes.

Contrast: star core on ink is 18.9:1, ink on paper is 16.6:1, gold bright on ink is 11.8:1. Body text never sits on gold.

## Typography

Instrument Sans carries the interface and the reading. Instrument Serif italic appears only as a brief accent inside a headline, never as running text. IBM Plex Mono carries code, measurements and aligned data such as the frame-cost readout.

- **Display and headlines:** Instrument Sans 600 with tightening letter spacing as size grows. Headlines balance (`text-wrap: balance`) and never exceed four lines on a phone.
- **Body:** 16px at 1.6 on paper and ink; 18px on long reads. Measure stays under 46 characters on a phone and 70 on desktop.
- **Labels:** 14px and 12px at 500. Sentence case always. All caps is not used in this package.
- **Code:** IBM Plex Mono 13px; numbers in tables use tabular figures.

Two weights on a screen, 400 and 600, plus 500 for labels. No third family.

## Layout

Phone first. The first viewport holds one message and one action. Spacing follows an 8px scale with a 4px half step; cards pad 24px, sheets 24px with the safe-area inset added on the edge they touch. Page margins are 16px on a phone and 32px from 900px, which is also the breakpoint where glass may refract: below it the material is CSS only, by design, because the GPU pass is never worth its bytes on a phone panel.

Desktop uses a fixed maximum width of 1120px with a 24px gutter. A scene that carries a glass panel is one grid with the copy and the panel as siblings, never a panel floated over copy.

App shells use `100dvh`; heroes use `100svh`; bare `100vh` is not used.

## Elevation & Depth

Depth comes from the material, not from a shadow scale.

- **Ink** is flat. Hierarchy on ink comes from hairlines (star core at 10%) and tonal steps, never from drop shadows.
- **Paper** sits one tonal step above the page: a card on paper is ivory with a hairline; a pressed card drops to paper.
- **Glass** is the only material with a shadow, and it is a scene shadow: `0 20px 60px` of ink at 45%, plus an inset 1px highlight at the top edge that reads as the bevel. The WebGL pass adds refraction at that bevel and a rim light; the CSS tier approximates both with the inset highlight alone.

One GPU surface per page. A route that reaches two renderer modules fails the gate.

## Shapes

Rounded, with a scale that follows the component's size: 8px for inputs and chips, 14px for buttons that are not pills, 24px for cards, 40px for sheets and the glass panel. Buttons are pills (full) by default because the press animation reads better on a pill. Corners are never mixed on one surface: a glass panel at 40px holds buttons at full and cards at 24px, and that is the whole set.

## Components

Every primitive takes `material: 'glass' | 'paper' | 'ink'` and shares the state contract from `src/primitives/material.ts`:

- **Press:** `transform: translateY(1px) scale(0.985)` over 120ms on `:active`; on reduced motion the transform is dropped and only the tint changes.
- **Focus:** a 2px gold bright ring with 3px offset on `:focus-visible`, on every material, never removed.
- **Hover:** inside `@media (hover: hover) and (pointer: fine)` only. On glass the tint lightens one step; on paper the surface drops to ivory; on ink a hairline appears. Touch devices never see a hover state.
- **Disabled:** 50% opacity, pointer events off, no hover.

- **Button:** shadcn button with `material`. 44px tall, pill, label-md. Glass buttons are the only translucent control and are used over scenes only.
- **Card:** shadcn card with `material`. 24px radius, 24px padding, hairline border. A glass card is a `GlassSurface` whose children are the card body.
- **Sheet:** shadcn sheet with `material`. Slides from the edge it names, respects the safe-area inset on that edge, sets `touch-action: pan-y` on its own axis only, and uses `100dvh` for a side sheet.
- **GlassSurface:** the glass material itself. Renders a poster (children over a CSS blur) with no script; upgrades to a WebGL refraction pass only when `useGlassPlan()` returns `webgl` and a 12-frame probe stays under 8ms median; pauses off screen; tears down on a preference change, a resize under 900px, a lost context or a failed image.

## Do's and Don'ts

- Do ship every material with a still that works with no script.
- Do gate refraction on device, preference and a measured frame cost; never on a user-agent string.
- Do keep one GPU surface per page and pause it when it leaves the viewport.
- Do write a `motion-score.md` beside every route that moves, one row per beat with a reduced-motion column.
- Don't type a colour literal in a component; every colour comes from these tokens.
- Don't animate `backdrop-filter`, `filter` or layout properties; animate opacity and transform only.
- Don't use `user-scalable=no`, `maximum-scale=1`, `outline: none` or `transition: all`.
- Don't load three.js on the server, on a phone, or before the gate has said yes.
- Don't use GSAP in this package; motion here is CSS transitions, and a route that needs a timeline brings its own score.
- Don't use raw WebGL without a library or a CDN script tag; both are invisible to the gate.
- Don't use floating glass cards as decoration over copy; glass frames a scene or it is not used.

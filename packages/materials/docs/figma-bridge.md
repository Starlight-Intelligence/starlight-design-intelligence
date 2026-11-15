# Figma bridge: agent run kit

Status: candidate. Recorded 2026-11-15. Nothing here changes a token; it records where the Figma file and this package agree, where they differ, and what a person has to decide.

The agent run kit in `src/agent/` was designed in the Starlight web design system file in Figma (page "18 · Build kit", board G) and built here on this package's own tokens and state contract. Figma is the visual authority for composition; `DESIGN.md` is the token authority for code. Where the two disagree, the code follows `DESIGN.md` and the difference is listed below.

## Component map

| Figma component | Node | Code | Notes |
|---|---|---|---|
| Agent / Run step (5 states) | `145:663` | `RunStep`, `RunTimeline`, `run-state.ts` | Figma shows the state as a coloured dot. Code uses an icon, a tone and the state word, so nothing depends on colour. |
| Agent / Tool call | `145:664` | `ToolCall` | Same structure. |
| Agent / Approval gate | `145:674` | `ApprovalGate` | Figma's primary action is the gold button. Code uses `Button material="paper"` on ink, this package's primary. |
| Agent / Answer | `145:688` | `Answer`, `AnswerMeta`, `AnswerBody`, `AnswerSources`, `CitationMark` | Code adds the anchor between a mark and its source. |
| Agent / Source chip | `145:618` | `SourceChip` | Always a link in code. |
| Agent / Model route | `145:614` | `ModelRoute` | Both keep an empty slot for a partner's official mark. |
| Agent / Memory chip | `145:622` | `MemoryChip` | Same structure. |
| Agent / Composer | `145:720` | `Composer` | A plain form in code; the gold send becomes a paper icon button. |

No Code Connect mapping is published. These rows are the input for one.

## Token drift

The palette anchors match: ink `#070A10`, paper `#EFEDE7`, ivory `#EDE6D8`, gold `#C9A15C`, bright gold `#F0C87E`, signal `#82D8E6`. The rest does not.

| Area | Figma variables | This package (`DESIGN.md`) | Effect on the kit |
|---|---|---|---|
| Dark surfaces | two steps: panel `#0D1119`, raised `#171E29` | one step: `glass-opaque` `#111113` | Code alternates `primary` and `glass-opaque`. The Figma boards show three depths; code shows two. |
| Text on dark | `#EFEDE7` | `on-surface` `#FBF6EB` | Code text is slightly warmer and brighter. |
| Muted text | a colour, `#AEB6C3` | opacity on the text colour | Code uses `opacity-70`. |
| Border | a colour, `#303947` | `hairline`, 10% of the text colour | Close in result. |
| Error | `#F5B7AC` | `#E06C5B` | Code is the stronger red. |
| Success | `#B4DCC6` | none | A done step is the text colour with a check, not green. |
| Radius | 8, 12, 20, 28 | 8, 14, 24, 40 | Code corners are rounder at every step above 8. |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64 | 4, 8, 16, 24, 40, 64 (plus gutter 24, margin 32) | Figma uses 12 and 48; `DESIGN.md` has neither and has 40. |
| Display type | 80 px, regular | 56 px, semibold | The same headline is lighter and larger in Figma. |
| Title type | 44 px, regular | `headline-lg` 36 px, semibold | As above. |
| Code type | 12 px | 13 px | One pixel. |
| Press timing | none before 2026-11-15; a motion collection was added that day with 140 ms as its fast step | 120 ms ease-out, `--ease-material: cubic-bezier(0.2, 0, 0, 1)` | The Figma motion collection is one day old and untuned. The package values are shipped and tested, so the kit uses them. |

## Decisions for a person

1. Which side moves for radius, spacing and display type. These are brand identity and are not changed by an agent.
2. Whether `DESIGN.md` gains a second dark surface step and a success colour, or Figma loses them.
3. Whether the Figma motion collection is replaced by this package's 120 ms press and `--ease-material`.

## Found while building, not changed here

- `cn()` drops a custom font-size class when a colour class shares the element: `text-label-md` with `text-on-paper` keeps only the colour. `Button` is affected, so its label inherits 16 px from the page; `DESIGN.md` specifies `label-md` at 14 px. The agent components keep size and colour on separate elements and a test guards it. `Button`, `CardTitle` and any other primitive that pairs the two should be checked.
- `public/r/glass-surface.json` is stale against `src/glass/mount-glass.ts`: running `pnpm registry:build` on `main` changes it.
- `pnpm install --frozen-lockfile` fails in this package: the lockfile was written with a different `autoInstallPeers` setting than `.npmrc` now holds.

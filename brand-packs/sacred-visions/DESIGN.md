# Sacred Visions Design System

## Visual Idea

Chiaroscuro stillness on dark obsidian museum cloth, warmed by antique parchment and restrained 24k celestial gold hairline rules.

## Palette

```yaml
colors:
  ink: "#0B0B0D"         # Primary obsidian velvet / gallery wall
  parchment: "#E9E0CE"   # Folio surface for reading plates
  ivory: "#F6F1E7"       # Crisp light text on ink
  gold: "#C9A24B"        # Fine 1px rules, colophon seals, astrolabe ticks (never filled blocks)
  crimson: "#7C1F2B"     # Restrained wax-seal / editorial index accent only
```

## Typography

- **Display and chapter headings:** Cormorant Garamond or EB Garamond (verify local/web font files and license before release).
- **Body and provenance captions:** quiet humanist sans or refined grotesque for UI labels and **Text / Tradition / Visualization** notes.
- Keep public labels in sentence case. Preserve museum plate numerals.

## Composition and Motion

- Generous margins, 1px `#C9A24B` hairline rules, and asymmetrical two-column museum plates (art plate on left or full-bleed; provenance ledger on right).
- Never bake fake Latin, pseudo-Hebrew, or garbled parchment text into AI-generated image pixels. Render all scripture citations, dates, and commentary deterministically in SVG/HTML overlays.
- Motion in *Visions in Motion* (`16:9` hero and `9:16` vertical studies) uses slow 4–8 second chiaroscuro camera pans, candle/dust-mote drift, and an automatic static poster frame under `prefers-reduced-motion`.

## Release Bar

Every asset passes the 30-point `visual-qa-gate` (`>=26/30`), carries a `.vis.provenance.json` sidecar linking its historical reference and generation prompt, and completes independent editorial verification before release.

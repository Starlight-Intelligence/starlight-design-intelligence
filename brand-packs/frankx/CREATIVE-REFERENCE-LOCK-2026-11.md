# FrankX — Creative Reference Lock / Editorial & Portfolio
**State:** design exploration, not an approved replacement of current product tokens. **Date:** 2026-11-02.

## Authority and constraints
Read `DESIGN.md` + `SURFACE_MODES.md` before using this document. The live FrankX website's `docs/strategy/HOMEPAGE-PRESERVATION-CONTRACT.md` requires separate direction approval before section-level homepage changes. The editorial palette below is a **surface-mode candidate**, not a universal new brand color system. Keep shipped music, architecture, research, books and products discoverable.

## Art direction thesis
**An independent intelligence and creative studio, photographed and edited with the restraint of a serious journal.** The page feels like a conversation with the author and an invitation to inspect a body of work, not a luxury real-estate template or a luminous SaaS card wall.

### Exactly three materially different directions for review
| Direction | Editorial composition | Visual hero | Type behavior | Use |
| --- | --- | --- | --- | --- |
| **A — The Living Journal** (recommended for personal/editorial) | Gallery wall: asymmetrical portrait or original artifact beside concise thesis and date-coded content | Real owned portrait or authored research artifact, soft natural light | Refined display serif for one statement, readable sans and mono for source labels | Author, journal, people, partnership |
| **B — Studio Film** (cultural secondary) | Full-screen cinematic sequence with still frame, sparse annotation and purposeful transition | Original music/work scene, human and emotional detail | Controlled condensed titles with generous reading width below | Music, making-of, Arcanea links |
| **C — The Technical Atlas** (preserve current system) | Information-dense yet legible technical model and live artifact | Real architecture trace, screenshot, benchmark diagram | Strong sans + mono, hierarchy in data not ornamental glow | Starlight, technical research, product docs |

Do not average A/B/C into a generic halfway style. Each route declares a primary mode; one section may borrow one detail from another mode.

## Reference research (not templates to clone)
1. [Christopher Ireland Creative](https://christopherireland.net/) — oversized display type, parchment, documentary photograph, near-zero UI ornament. **Primary inspiration:** authorship and negative space; not its literal typography or grid.
2. [Symbolic.ai](https://symbolic.ai/) — paper-and-ink precision, subtle tactile layering. **Borrow:** document/artifact materiality for publications; do not borrow all its UI colors or shapes.
3. [Perplexity](https://www.perplexity.ai/) — calm search and information density. **Borrow:** search interaction discipline on research pages; not its product chrome.
4. [Julia Krantz](https://juliakrantz.com/) — photobook contact-sheet rhythm. **Borrow:** precise image sequencing for photo and event archives; not a black site-wide theme.

References discovered from Refero design-style research on 2026-11-02. Verify actual assets/licensing and benchmark rendered sites before visual signoff.

## Editorial mode candidate tokens (do not apply globally)
```yaml
editorial-mode:
  canvas: "#fbf9f5"          # existing Edition Lab direction; page background only
  paper: "#ffffff"           # publication inset
  ink: "#221f1b"             # body/headline
  secondary-ink: "#514d47"   # annotations, metadata
  rule: "#d9d4cc"            # 1px dividing hairlines
  red: "#c8322a"             # scarce: edition number or one active editorial cue
  type:
    display: "licensed expressive serif; choose from specimens"
    body: "clear modern humanist sans; choose from specimens"
    utility: "mono for dates, source ids, measurements"
  geometry:
    editorial-image-radius: "0px"
    rules: "1px"
    section-rhythm: "generous with deliberate small pauses"
    maximal-expressive-families: 2
  motion:
    default: "still reading"
    allowed: "reveal documentary scene, source provenance or navigation causality"
    reduced-motion: "complete functional parity"
```
Use the existing obsidian + emerald/cyan **technical** surface tokens from `DESIGN.md` for tool interfaces. Do not replace them with paper colors. A founder portrait is not a generic smiling-businessman stock image; it must be authorized, accurately labelled and compatible with identity references.

## Image and media roles
- **Author portrait:** verified real Frank image; no synthetic headshot for professional proof, no automatic face identification on unlabelled archives.
- **Evidence artifact:** screenshot/trace/chart with date, source, environment and accurate outcome label.
- **Studio scene:** documentary or openly labelled fictional illustration; no false collaboration or unreleased-feature implication.
- **Mini Frank:** approved model-sheet hashes and character-canon retrieval; never substitute a newly generated lookalike as the canonical original.
- **Community:** subject consent and relationship type; no invented founder endorsements or conference attendance.
- **Media library:** Drive holds private original masters, Vercel Blob/Image preferred for reviewed new delivery; R2 only when the reviewed registry permits an exception.

## Composition & interaction acceptance
1. Hero: one compelling human/artifact, one idea, a human-sized invitation. Keep existing functional pathways.
2. Typography: specimen test names, long headlines, numerals, diacritics, links, and mobile line breaks; check licensed fonts and file weights.
3. Reading: ~65–75 character essay measure as a starting hypothesis; verify in actual viewport.
4. Article body: citations next to consequential claims, visual proof interrupting prose, clear distinction between observation, interpretation and decision.
5. Navigation: direct routes for essays, work, research, people, music and collaboration; no dead-end aspirational copy.
6. Performance: responsive images, meaningful alt text, low layout shift, no autoplay media, visible focus and reduced motion.
7. Before/after comparison: snapshot existing production, candidate at 390px and 1440px, 3 directions, accessibility and interaction evidence; independent design review and Frank's selected direction.

## Reject
Generic face portrait rings, fake glass dashboards, decorative floating 3D AI brains, invented partner logos, three-accent gradients on editorial pages, repeated equal-weight cards, generic light-beam stock imagery, badge walls, machine-sounding sloganeering, and hero copy promising income without documented results.

## Design release packet
For each proposed page: `route`, `surface_mode`, `reference_lock`, `actual_media_ids`, `source_hashes`, `font_license`, `desktop_render`, `mobile_render`, `reduced_motion`, `copy_claims`, `CTA_destination`, `owner_approval`, `rollback`. An unverified field remains open, never silently marked complete.

# starlightintelligence.ai home: Horizon reference lock

Draft for Frank's review, status: unsigned.

Author: Claude Code (Opus 5.5), 2026-11-10, revision 1. Unreviewed by a second provider. Tracking: frankxai/agentic-ops#532, lane 6.
[DESIGN.md](DESIGN.md) and [REFERENCE-LOCKS.md](REFERENCE-LOCKS.md) win any conflict. This page replaces the Lock 2 primary candidate for the `.ai` home only. It approves no palette, mark or layout. Production is unchanged.

## Why a new lock

Lock 2 (2026-11-03) named Drepute as the Horizon primary at preview level and listed "open the full style" as open item 4.
[MEASURED 2026-11-10] `refero_get_style aa138c1f-2b42-4b10-9a3d-bdb09c216c99` returns `INVALID_STYLE_UUIDS`. The Drepute reference no longer resolves, so nothing in Lock 2 can rely on it.

Rules carried over from REFERENCE-LOCKS.md: we store names, URLs, IDs and our own derived decisions; no Refero style text is pasted.

## Research trail

| Query (2026-11-10) | Result kept |
| --- | --- |
| cinematic full-bleed night landscape hero, centred serif, minimal chrome, dark institutional | BitcoinOS `48eb2b91-ccb4-43e9-aa60-7b501a3cfc5e`; Set Space `1dcc6732-093a-4821-8690-21c62b8dfdd4`; Atlas `6a12210f-e910-4d33-9788-ed039660beb0`; Slash `350e0391-9d87-4830-8d2b-826b3e9fc795` |
| research lab institution, editorial serif and clean sans, deep dark surfaces, authored scientific imagery | Ankar `e1590395-c7a2-471d-a6ba-327e785132d5`; Until Labs `3b3b73b8-59ec-4f70-82f7-95548a2e5414`; Channel Studio `18a6de39-5549-40f5-87bd-c247e6ff5426` |

Full style opened: **BitcoinOS** (2026-11-10). All other entries are preview-level reads.

## Lock

**Primary: BitcoinOS** ([bitcoinos.build](https://bitcoinos.build), `48eb2b91-ccb4-43e9-aa60-7b501a3cfc5e`), full style read 2026-11-10.
It fits the SIS Horizon definition on three points the Drepute candidate only claimed: the opening is a lit world rather than a boxed product shot; the interface stays neutral while colour lives in the scene; and gold appears as light inside the scene, which matches the SIS rule that gold marks arrival or a human.

**Preserve (structure, not surface):**
- One full-bleed authored scene per major chapter. Copy sits left over the scene's darker region, and the lit focal object sits right.
- Neutral interface: ink canvas, ivory text and controls. No coloured buttons, no coloured card fills.
- Open ruled collections: hairline dividers instead of filled tiles, and no shadows anywhere.
- Chapter rhythm: promise, then capabilities, then proof, then invitation, then a sculptural ending (a deep curved newsletter stage plus one oversized closing word).
- A wide gap between small labels and large headings; paragraphs in a narrow column.
- Actions joined to a separate arrow cell, 8px corners, 48px tall.

**Borrow only: Set Space** (`1dcc6732-093a-4821-8690-21c62b8dfdd4`, preview-level). Tiny monospaced field-note captions and labels next to atmospheric landscape images. This maps onto the IBM Plex Mono role SI already ships, so it replaces the reference's serif bracket labels.

**Translate, do not import:**
- Typography stays SI's: Instrument Serif italic for the display line and brief accents, Instrument Sans for interface and reading, IBM Plex Mono for labels and data (DESIGN.md, `visual.siteProfiles.lab`). The reference's heavy condensed uppercase display is **rejected**. Moving SI to a condensed grotesk would break the identity Frank restored on 16 Sep, so the size jump and tight leading carry the drama instead.
- Paragraph tracking: keep the reference's idea of airy, slightly tracked reading text, applied to Instrument Sans at a smaller value (0.01em) because a sans needs less than a serif.

**Deliberate alternative, held: Ankar** (`e1590395-c7a2-471d-a6ba-327e785132d5`). A light, scholarly register of pale reading fields, literary serifs and mono labels. It suits the Academy and design-partner pages better than the home page. Held for Lock 3 or the design-partner door; rejected here because the home page is Horizon and DESIGN.md asks for cinematic scale.

**Reject:**
- Starfield or particle backgrounds (SIS names these as failure).
- Reference imagery, characters, names, numbers, claims or quotes. Every scene is original, with a `.vis.provenance.json` sidecar and a ledger row.
- Condensed uppercase display type (see above).
- Cyan or teal inside Horizon scenes unless the scene shows system state. `companion` is for connection or state only.
- A product screenshot in a browser frame as the hero.

## Token commitments (from SI identity, not from the reference)

Source: `Starlight-Intelligence/starlightintelligence.ai` `public/brand/identity.json` (read 2026-11-10). File: [`site-tokens/starlightintelligence-home.tokens.css`](site-tokens/starlightintelligence-home.tokens.css).

| Role | Token | Value | Rule |
| --- | --- | --- | --- |
| Canvas | `--si-canvas` | ink `#070A10` | default page foundation |
| Reading on dark | `--si-text` | ivory `#EDE6D8` | headings, primary text, primary action fill |
| Muted on dark | `--si-text-muted` | ivory at 68% | body copy, labels |
| Hairline | `--si-rule` | ivory at 14% | collection dividers, outlines |
| Paper | `--si-paper` | paper `#EFEDE7` | information-heavy chapters only |
| Arrival | `--si-arrival` | gold `#C9A15C` / goldBright `#F0C87E` | inside scenes and one human-decision control per fold; never decoration |
| Connection | `--si-connection` | companion `#82D8E6` | system state only; absent from Horizon scenes otherwise |
| Star | `--si-star` | starlight `#E8C98C`, core `#FBF6EB` | the mark only |

[MEASURED 2026-11-10, WCAG 2 relative-luminance formula over the hex values above] ivory on ink 15.95:1 · muted ivory (68%) on ink 7.57:1 · ink on paper 16.92:1 · muted ink (64%) on paper 5.75:1 · gold on ink 8.24:1 · companion on ink 12.18:1 · ink on the ivory button 15.95:1. Every text pair clears AA (4.5:1), and all except muted ink on paper clear AAA (7:1). The rendered page still needs the quality-gate axe pass (lane 2).

## Open items

1. The direction needs a different-provider read, prompted as a buyer who declined (AGENTS.md §5b.1).
2. Scene art does not exist yet. Until it does, placeholders keep the aspect ratio and carry a one-line art direction.
3. Set Space and Ankar are preview-level. Open their full styles before any token or rule here depends on them.
4. REFERENCE-LOCKS.md Lock 2 should point here for the `.ai` home once Frank signs either page.

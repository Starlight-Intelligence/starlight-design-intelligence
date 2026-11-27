# Creative briefs, 27 November 2026

This batch holds 100 image-generation briefs for six Starlight portfolio brands. They feed a Workers AI image job that runs in three stages: explore with FLUX 2 Klein, produce with FLUX 2 Dev, and use Leonardo as the alternate model. Every brief is `tier: "explore"`. None of them approves an asset. A candidate becomes usable only after it passes `evals/generated-asset-quality-gate.md` with at least 26 of 30 points on the actual export, and then gets the owning repository's own approval.

Each file is one JSON array per brand and follows this shape exactly:

```
{ id, brand, destination: { repo, route, placement }, audience, purpose,
  aspect: "1:1" | "16:9" | "4:5" | "9:16", style_refs: ["owner/repo:path", ...],
  prompt, negative, candidates: 1..4, tier: "explore" }
```

Each `style_refs` entry is `owner/repo:path`, relative to that repository's root. The validator found every listed reference on disk at the revisions below. Each `negative` string has three parts in this order: an optional exclusion for that one brief, the brand's anti-signature, and a shared list of tells that mark generic AI output. The shared list also bans third-party logos and real-person likeness.

To validate:

```
node scripts/validate-creative-briefs.mjs briefs/2026-11-27 --expect-total 100 --checkouts <dir with sibling checkouts>
```

## Counts

| Brand | File | Briefs | Revenue-page briefs |
|---|---|---|---|
| FrankX | `frankx.json` | 26 | 21 |
| Starlight Intelligence | `starlight.json` | 22 | 19 |
| Arcanea | `arcanea.json` | 16 | 8 |
| GenCreator | `gencreator.json` | 15 | 13 |
| AgenticIncome | `agentic-income.json` | 14 | 13 |
| Reality Architect | `reality-architect.json` | 7 | 1 |
| **Total** | | **100** | **75** |

"Revenue page" covers homepages, product and offer pages, pricing, the AI Architect Academy, agent packs and kits, consulting and engagement pages, and conversion entry points such as `/create`, `/start` and `/build/request-to-quote`. Article templates, lore, editorial, music and world-browsing pages count as supporting pages, as do share images, social frames and decorative homepage sections.

## Sources read, by brand

The source revisions are the checkout HEADs used for this batch.

### FrankX

Repository: `frankxai/frankx.ai-vercel-website` @ `6d25670ad9ab6b0017b1156eb478abd266ff2080`.

Sources read:
- `design.md`, `taste.md`, `BRAND_IDENTITY.md`, `CREATOR.md`, `tailwind.config.js`
- the `app/` tree
- `brand-packs/frankx/`: `DESIGN.md`, `TOKENS.md`, `POINT_OF_VIEW.md`, `BRAND.md`, `SURFACE_MODES.md`, `CREATIVE-REFERENCE-LOCK-2026-11.md`

How the briefs use them:
- **Palette by surface mode.**
  - Technical: void `#0a0a0b`, emerald `#10b981`, cyan `#06b6d4`.
  - Soul: amber `#f59e0b`.
  - Editorial: the candidate palette, `#fbf9f5`, `#221f1b` and `#c8322a`.
  - The legacy Arcanea purples are excluded.
- **Likeness.** Frank is never generated. Scenes show artifacts and empty workspaces only.
- **Homepage.** The homepage briefs are candidates only, under `docs/strategy/HOMEPAGE-PRESERVATION-CONTRACT.md`.

### Starlight Intelligence

Repository: `Starlight-Intelligence/starlightintelligence.ai` @ `815eba63e52b10a16ec87bb30bdb5e6a9e8addc7`.

Sources read:
- `app/globals.css`, `CREATOR.md`, `design/`, `.starlight/voice/context.md`
- the `app/` tree
- `data/playbooks.v1.json`
- `brand-packs/sis/`: `BRAND.md`, `DESIGN.md`, `PRODUCT.md`, `REFERENCE-LOCK-SI-HOME-2026-11.md`, `REFERENCE-LOCKS.md`, `TEAMMATES-POSITIONING.md`, `site-tokens/`, `foundations/`

How the briefs use them:
- **Palette.** Ink `#070A10` and ivory `#EDE6D8` form the base. Gold (`#C9A15C` to `#F0C87E`) appears only as light that marks a person, an arrival or a human decision. Cyan `#82D8E6` appears only on elements that show system state.
- **Composition lock.** Copy sits on the dark left side and the lit subject sits on the right.
- **Hard exclusions.** Generators never produce the star mark. No Arcanea canon appears.

### Arcanea

Repository: `Arcanea-Labs/arcanea-ai-app` @ `e65a6bfacb31d8b074191fcf607b7bb3bb6877d0`.

Sources read:
- `.arcanea/lore/CANON_LOCKED.md`, read in full
- `TASTE.md`, `DESIGN.md`, `.claude/CLAUDE.md`
- the `apps/web/app/` tree
- `brand-packs/arcanea/`: `BRAND.md`, `DESIGN.md`, `SOURCE_AUTHORITY.md`

How the briefs use them:
- **Palette.** Teal `#00bcd4`, Cosmic Blue `#0d47a1`, Gold `#ffd700` on void `#09090b`.
- **Direction.** "AI-lab premium. Never fantasy-game."

### GenCreator

Repository: `frankxai/gencreator.ai` @ `aa2d1b4948f74a066a770ab2e7753be328881f17`.

Sources read:
- `design.md`, `taste.md`, `brand/identity-brief.md`, `docs/brand/GENCREATOR_BRAND_SYSTEM.md`, `CREATOR.md`
- the Territory B tokens in `app/globals.css`
- the Interface bar in `AGENTS.md`
- the `app/` tree
- `brand-packs/gencreator/`: `DESIGN.md`, `FOUNDATIONS.md`

How the briefs use them:
- **Palette.** Paper `#fbf9f5` and ink `#221f1b` fill at least 90% of each frame. Signal red `#c8322a` appears once per object.
- **Show the media.** Reels appear as 9:16 frames, carousels as slides and thumbnails at their real size.
- **No logo.** None is approved, so the briefs ask for no mark.

### AgenticIncome

Repository: `frankxai/agenticincome` @ `ee12f061f4a39f68aaba551365329f06048627f3`.

Sources read:
- `DESIGN.md`, `TASTE.md`
- `design/`, including `asset-manifest.json`
- `docs/design/cinematic/design-lock.md`
- the `@theme` tokens in `app/globals.css`
- the `app/` tree
- `brand-packs/agentic-income/`: `DESIGN.md`, `FOUNDATIONS.md`, `BRAND.md`

How the briefs use them:
- **Palette.** Obsidian `#05060a` with charcoal layers. A single emerald `#10b981` marks proof or the active step. Gold `#f59e0b` appears only at a commercial or claim boundary.
- **Style family.** Flat schematic line work that matches the plates in `public/images/products/plate-*.svg`.
- **Claims.** No income imagery and no numbers.

### Reality Architect

The repository `frankxai/realityarchitect` is **missing**: it is not checked out in this session.

Sources read:
- `brand-packs/reality-architect/BRAND.md` and `DESIGN.md`, synced from source @ `350137a9908592f86160b4335975ee42f7ab049d`
- `brand-image-system/runtime/brands/reality-architect/brand-pack.json`

How the briefs use them:
- **Palette.** Graphite `#06070c` and blueprint `#5b8cff` carry the system. Dawn `#e8d5ad` / `#f7e8c8` carries only the person's scene.
- **Destinations.** Every brief targets `/` (homepage sections and share images) and states that the route is unverified.
- **Style references.** `style_refs` is `[]` because no local assets were available.

This kernel repository was read at its `origin/main` base `5fb0bdd`.

## Destinations

| Brand | Routes |
|---|---|
| FrankX | `/`, `/products`, `/products/vibe-os`, `/products/visual-creation-loop`, `/products/agentic-creator-os`, `/products/generative-creator-os`, `/products/prompt-vault`, `/products/suno-prompt-library`, `/products/creative-ai-toolkit`, `/ai-architect-academy` (hero, mobile, OG), `/ai-architect-academy/patterns`, `/agents/packs/[pillar]`, `/work-with-me`, `/consulting`, `/enterprise`, `/courses/[slug]`, `/founders-circle`, `/newsletter`, `/blog/[slug]`, `/music`, `/shop` |
| Starlight | `/`, `/growth`, `/workshops`, `/kernel` (Multi-agent Ops), `/playbooks`, `/agent-kits`, `/agent-kits/teams`, `/agents`, `/agents/teams`, `/teams`, `/platform/foundry`, `/marketplace`, `/joint-infrastructure`, `/start`, `/founders`, `/workflows`, `/learn/[slug]`, `/notes/build-a-business-on-open-agent-systems` |
| Arcanea | `/`, `/pricing`, `/studio`, `/create`, `/imagine`, `/worlds`, `/worlds/create`, `/library`, `/books`, `/academy`, `/academy/houses`, `/lore/elements`, `/lore/godbeasts`, `/shop` |
| GenCreator | `/`, `/pricing`, `/offers`, `/products`, `/products/creator-os`, `/products/kit`, `/products/skill-packs`, `/products/agent-pack`, `/create` (Creator Mission, plus a 9:16 reel example), `/studio`, `/founding`, `/showcase`, `/research/[slug]` |
| AgenticIncome | `/`, `/offers`, `/offers/[slug]`, `/build`, `/build/request-to-quote`, `/challenge`, `/start`, `/delivery/starter-kit`, `/delivery/blueprint`, `/delivery/private-intel`, `/proof`, `/workbench`, `/blog` (article template) |
| Reality Architect | `/` only (route unverified) |

### Requested destinations that do not exist at these revisions

- **Quote-recovery pilot page.** No file in any checked-out repository or brand pack contains "quote-recovery" or "quote recovery". No brief invents a route for it. The closest live route is AgenticIncome `/build/request-to-quote`, which has one brief labelled as the nearest match, not as the pilot. **The page needs an owner and a route before it can be briefed.**
- **Multi-agent Ops pack.** The only live surface is Starlight `/kernel`, which says it is "in build and not on sale" (`data/playbooks.v1.json`: `access: not-yet-available`, `price: null`). It has two briefs, and both must be captioned as concept. FrankX has no Multi-agent Ops page. Its brief targets `/agents/packs/[pillar]`, the closest pack template.
- **FrankX `/pricing`.** The route does not exist and there is no redirect, so it has no brief.
- **FrankX broken image slots.** The briefs fill two missing images that live pages reference: `/products/vibe-os` references `/images/products/vibe-os-hero.jpg` and `/products/visual-creation-loop` references `/images/products/visual-creation-loop-hero.jpg`. These are the highest-value fills in the batch.
- **Starlight `/constellation`.** The image manifest assigns images to this route, but it has no `page.tsx`, so it was skipped.

## Arcanea canon handling and gaps

The briefs use only what `CANON_LOCKED.md` locks:
- Lumina (First Light, form-giver) and Nero (Primordial Darkness, potential, "NOT evil"), drawn as light and darkness with no figures.
- The five elements in their canon colours.
- The seven Academy Houses, drawn as lit doorways with no heraldry.
- The five ranks, drawn as progression with no creatures.
- The two canon creature types: Laeylinn = Worldtree Deer and Veloura = Phoenix-Serpent.

The briefs avoid committing to undefined traits by asking for silhouette and rim light rather than detailed anatomy.

Gaps that block more Arcanea briefs:
1. No physical appearance is locked for any God or Goddess, Godbeast, Primordial or Malachar: no face, gender presentation, costume or per-God colour. Guardian portrait briefs need canon first.
2. Eight of the ten Godbeasts have no locked creature type: Kaelith, Draconis, Otome, Yumiko, Sol, Vaelith, Kyuro and Source. Draconis is not stated to be a dragon.
3. The Shadowfen is a name only, so the briefs include no Shadowfen scenery and no Malachar.
4. Realms (Veldoria, Aurevalde, Mar Arcano), the Awakened, Vael Crystals, Luminor Metals and Nero Shards are all STAGING, not locked. No brief depicts them. Van Linh also carries a mandatory sensitivity protocol.
5. No guardian or brand image in `apps/web/public/` carries an approval label. `brand/README.md` points to a `.arcanea/visual-assets/MANIFEST.json` that does not exist. Three Arcanea briefs cite brand images that are already in use (`arcanea-dashboard-hero-premium.png`, `arcanea-hero.jpg`, `arcanea-collectible-reliquary-premium.png`) as style references for mood only. The other 13 use `[]`.
6. The sources disagree on two points:
   - The background is `#09090b` in TASTE.md, `#0b0e14` in the `cosmic.void` token and `#05070f` in the older cinematic doc. The briefs use `#09090b`.
   - The Arcanea brand pack prohibits Higgsfield, while the repo's CLAUDE.md prefers it. This batch targets Workers AI, so it uses neither.

## Acceptance criteria by brief type

All types share these requirements:
- The candidate scores at least 26 of 30 on the generated-asset gate, judged on the exported file at its final size.
- It carries no text, letters or glyphs. Overlays stay in HTML.
- It shows no third-party logo and no recognizable real person.
- It ships with a provenance sidecar: model, prompt, negative, seed, date, operator and brief `id`.
- A named human approves it in the owning repository before release.
- A candidate that fails any brand anti-signature in `negative` is rejected.

| Type | Briefs | Accept when |
|---|---|---|
| **Homepage / landing hero (16:9)** | homepage and index heroes | One subject and one idea read in under 2 seconds at 1440 and 375 widths. The dark side for copy keeps WCAG AA contrast under the real headline. The palette matches the brand tokens. The protected FrankX homepage needs baseline captures and Frank's approval of the exact image. |
| **Mobile art-directed crop (4:5)** | `*-hero mobile` | It is recomposed, not centre-cropped. The subject sits inside the safe area at 375 px. The copy zone stays clear. |
| **Product / offer hero (16:9)** | product, offer, academy, pack, consulting pages | The image shows what the product makes or the work it organises. Nothing implies availability, price, results or income beyond what the page states. Not-on-sale items (Multi-agent Ops) carry a concept caption. |
| **Product card / plate (1:1)** | cards, plates, shop tiles | The object still reads at 160 px. It sits in the same family as the referenced plates or cards. The background keeps generous margin. |
| **Open Graph share (16:9 source, 1200x630 render)** | OG briefs | The left 55% stays clean for the HTML/SVG title. It still reads at 600x315. There is no baked-in text. |
| **Social vertical (9:16)** | story and reel frames | The lower or upper third stays clear for captions. GenCreator reel examples are labelled as fictional examples and follow the Interface bar. |
| **Article template default (16:9)** | `/blog/[slug]`, `/learn/[slug]`, `/research/[slug]`, AgenticIncome blog | The image is neutral enough to sit above any article in that template without implying that article's results or data. |
| **Arcanea canon depiction** | `/`, `/academy/houses`, `/lore/*` | Every named subject traces to a locked line in `CANON_LOCKED.md`. No undefined trait (face, gender, costume, extra anatomy) is committed. A canon reviewer signs off before use. |
| **Reality Architect** | all 7 | Dawn colour appears only on the person's scene, never on numbers or claims. There are no generated marks. The route is verified against the `frankxai/realityarchitect` checkout before production. |

## Not done here

This batch did no generation, publishing, PR creation, cron setup or secret use. It wrote nothing to repositories other than this branch. Promoting a candidate from explore to production (FLUX 2 Dev) needs a separate decision for each brief.

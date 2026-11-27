# Brand estate audit: logos, packs and materials (26 November 2026)

Scope: every logo, wordmark, icon and favicon committed across the estate's checked-out repositories, read against the brand packs here and the `logo-system` skill. Evidence: [contact sheet](../docs/evidence/brand-estate-audit-2026-11/logo-contact-sheet.png) (16, 32 and 128px on dark and light, plus a one-colour threshold), produced by [build-contact-sheet.mjs](../docs/evidence/brand-estate-audit-2026-11/build-contact-sheet.mjs). Byte duplicates were found with MD5 hashes.

This is a design audit. It is not trademark clearance, and it approves nothing. The findings are inputs for the owning brand's decision owner.

## Verdict

The doctrine is ahead of the assets. `logo-system`, the generated-asset gate and the brand packs already define a professional practice: vector masters, 16px proof, one-colour proof, lockup families, and 3D as an application only. Most shipped marks fail at least one of those automatic-failure rules. The work now is to execute the existing standard, not to write a new one.

## Findings by brand

| Brand | What ships | Fails | Severity |
|---|---|---|---|
| FrankX | `logo-mark.png` (160 KB) and `logo-full.png` (332 KB). The `-v2` files are byte-identical to the originals. No SVG master exists in the site repo. The mark is an F with a sparkle, set on a baked-in navy tile | Raster-only master (automatic failure). The sparkle is the category's default AI glyph and owns no memory. The tile and glow are needed for recognition. Duplicate "v2" files suggest a version history that does not exist | Critical: the flagship personal brand has no vector identity |
| Starlight (SIS) | The four-point star appears in four different treatments: SIS site (lavender, with an orbit), `.ai` (gold, with a companion dot), Foundry (purple tile), network (green tile). Product Studios uses a skeuomorphic 3D document icon. Communities uses a generic node graph | The `.ai` gold star with the companion dot is the pack's recovered master (`brand-packs/sis/DESIGN.md`). The other three drift from it in colour and geometry. The four-point star also sits in the same visual territory as the most common AI-product glyphs, so the companion dot and its exact geometry carry all of the distinctiveness and must not be dropped | High: one mark, four implementations |
| Arcanea | The app ships a gold gradient A and a separate wordmark that uses a different, purple A with live system text. The OSS repo ships a 588 KB PNG serif-caps wordmark. The pack already notes that the two SVGs disagree and that the product imports a JPG | The gradient A disappears in one-colour. There are three identities across two repos. The wordmark relies on live text | High (the pack already records the conflict, and it is still unresolved) |
| GenCreator | The `brand/logo-system/masters/` folder with README, construction, lockups, do-not and exports docs is the best-run identity in the estate. But the masters favicon is a teal square glyph that does not match the gold G monogram, and `public/brand/gencreator-mark.svg` is a third, blue G-arrow mark | The favicon breaks family coherence. The legacy mark is still public and can be picked up by agents | Medium: the right structure, with leaks |
| Agentic Income | `icon.svg` is an A with an arrow. The brand files are `logo-monogram-3d.jpg` and `logo-lockup-3d.jpg`, both crystal renders | The 3D render is filed as the logo (gate: "rendered or 3D versions are applications") | Medium |
| Agentic Passive Income | A generic checkmark icon, plus a byte-identical copy of Agentic Income's 3D monogram | Brand collision: two brands share one mark. The checkmark owns nothing | High (identity collision) |
| Anime Legends | A full SVG set (horizontal, stacked, icon, mono black and white, wordmark) | The icon's fine concentric geometry turns to noise at 16 and 32px. The horizontal lockup is unreadable below about 200px | Medium: complete family, needs a small-size variant |
| Reality Architect | An arch glyph | Works at every size and in one-colour. Holds up as a model | Pass, pending a lockup family |
| Ocean IS | An 828 KB PNG circular badge | Raster only, illegible small, badge text cannot scale | High for the repo, low priority for the estate |
| FrankX Palace, Blue Life Commons, Claude Skills Library, AI Architect Academy | Placeholder-grade app icons (dot, generic card stack, text-only) | No ownable silhouette | Low until each surface has a launch decision |

## Cross-estate patterns

1. **No single authority for each brand's mark.** Only GenCreator has a `masters/` folder. Elsewhere the "logo" is whatever a site's `public/` or `app/icon.svg` holds, so every new agent session can fork it.
2. **Effects carry recognition.** FrankX (glow tile), Arcanea (gold gradient) and Agentic Income (crystal) collapse in one-colour proof. Glass, chrome and 3D need a flat master underneath.
3. **Sparkles and four-point stars.** FrankX and Starlight both lean on the category's most common AI glyph. Starlight's recovered mark is a founder decision and stays. FrankX's sparkle has no such standing and should not survive a FrankX redraw.
4. **Doctrine contradictions.**
   - `frankx.ai-vercel-website/design.md` makes "premium rounded liquid UI" the default for partner portals. `brand-packs/frankx/DESIGN.md` bans floating glass panels on editorial surfaces. Both can hold only if surface mode decides, so the site's design.md should cite `SURFACE_MODES.md` explicitly.
   - `brand-image-system/runtime/dam/ASSET_MANAGEMENT_SYSTEM.md` recommends R2, MinIO and self-hosted Immich. The estate registry holds R2 ("use Vercel Blob") and records Google Drive as evidence storage. The registry wins. This change corrects the DAM document.
5. **Duplicate and phantom versions.** The FrankX `-v2` files, the shared Agentic monogram and GenCreator's copies of its masters in `public/` all lack a manifest that ties each copy to its master.

## Priority queue

| # | Action | Owner decision needed |
|---|---|---|
| 1 | FrankX: inventory the historical marks (logo-system "Best-of-Brand recovery"), then rebuild a vector master without the sparkle, with three directions | Frank selects the direction |
| 2 | Starlight: make the `.ai` star with companion dot the single master. Re-point SIS site, Foundry and network icons to it. Keep the orbit-star as the named protocol variant (see "Orbital glass" in [brand-asset-operations.md](brand-asset-operations.md)) | None for re-pointing (the pack already decides). Any change to the variant needs review |
| 3 | Agentic Passive Income: stop shipping Agentic Income's monogram. Decide whether it becomes a sub-brand lockup of Agentic Income or gets its own mark | Brand architecture call |
| 4 | Arcanea: resolve the A (one geometry), produce a flat one-colour master, and outline the wordmark. The cinematic crystal A becomes an application | Frank, through `/lock-decision` if canon is touched |
| 5 | GenCreator: bring the favicon into the G family, and retire `public/brand/gencreator-mark.svg` behind a manifest | GenCreator owner |
| 6 | Anime Legends: draw a 16 and 32px simplified icon | None |
| 7 | Every brand: adopt the `identity/logo/` contract and a `brand-manifest.json` ([brand-asset-operations.md](brand-asset-operations.md)) | None |

No asset was changed by this audit. Repointing site icons happens in each owning repository, one branch per brand.

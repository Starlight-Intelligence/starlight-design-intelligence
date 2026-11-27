# Brand asset operations: where things live, how brands get built, how glass is used

This playbook turns the existing doctrine (`logo-system`, `brand-strategy-to-identity`, `generated-asset-quality-gate`, `figma-portfolio-setup`, `brand-production-foundation`) into one operating model across the estate. Where it conflicts with the estate registry (`agentic-ops/registry`), the registry wins.

## 1. One home per job

A professional studio does not ask "Figma or Drive?". It assigns each artifact one authority and treats every other copy as a projection.

| Artifact | Authority (the only editable master) | Projections (derived, never hand-edited) |
|---|---|---|
| Logo vector masters, lockups, favicons | Git: the owning product repo, `identity/logo/source/` | Figma Identity page (imported), Canva Brand Kit, `public/` exports |
| Tokens (colour, type, space, radius, motion) | Git: the owning repo's token source (`tailwind.config`, `tokens.json`) | Figma variables, compiled through `scripts/compile-figma-projection.mjs` |
| Brand rules (voice, design, narrative) | Git: `brand-packs/<brand>/` in this repo | The product repo's `design.md` and `taste.md` cite the pack |
| Exploration, direction boards, component design, flows | Figma, one file per brand (`00 Start here … 99 Archive`) | Screenshots inside PRs |
| Campaign and social templates | Canva, inside each brand folder | Approved exports |
| Raw shoots, generated candidates, source PSDs, review packs, signed approvals, licences | Google Drive (registry: evidence storage) | Hashes and links recorded in the manifest |
| Approved runtime media served to sites (heroes, OG, video) | Vercel Blob, or the site's `public/` below about 1 MB | Vercel Image Optimization |
| Cloudflare R2 | On hold in the registry. Do not add new buckets | n/a |

Rules:

- **Git holds anything an agent must reproduce.** Vectors, tokens and manifests are text, diffable and reviewable. Figma and Drive are excellent workspaces and poor sources of truth for agents.
- **Drive holds anything too heavy or too private for Git.** Raw media, licences and contracts.
- **Blob holds only what a page requests at runtime.** Never a working file.
- **A copy without a manifest entry is an orphan.** Orphans get deleted or registered, never left in place.

### Drive structure (per brand, under one shared drive)

```text
<Brand>/
  00 Read me            (links to the brand pack, Figma file, repo)
  01 Identity masters   (read-only mirror of Git exports + signed approvals)
  02 Sources            (raw shoots, PSD/AI, generated candidates by job ID)
  03 Campaigns/YYYY-MM-<campaign-id>/
  04 Approved exports   (immutable; filename carries the asset ID)
  05 Rights             (font licences, model releases, stock licences)
  99 Archive            (rejected and superseded, with the reason)
```

Naming: `<brand>-<asset>-<variant>-<colour>-<size>.<ext>`, for example `frankx-mark-primary-mono-512.png`. Never `final`, `v2-new` or `copy`. Versions live in the manifest, not in filenames.

### The manifest that connects the three homes

Each brand keeps `identity/brand-manifest.json` in its owning repo:

```json
{
  "brand_id": "frankx",
  "pack": "starlight-design-intelligence/brand-packs/frankx@<commit>",
  "figma": { "file_key": null, "identity_page": null },
  "drive": { "folder": null },
  "assets": [
    {
      "id": "frankx-mark-primary",
      "master": "identity/logo/source/mark-master.svg",
      "sha256": "<hash>",
      "state": "candidate | selected | approved | published | superseded",
      "approved_by": null,
      "exports": ["public/brand/frankx-mark.svg"],
      "used_in": []
    }
  ]
}
```

Unknown values stay `null`. Keep private provider IDs out of public repos. This extends the registry fields in `brand-image-system/runtime/dam/ASSET_MANAGEMENT_SYSTEM.md`; it does not replace them.

## 2. Building a brand from the ground up

This is the order. Skipping a step is where the estate's current drift came from.

1. **Recover before you invent.** Run logo-system's Best-of-Brand recovery: every historical mark, with hashes, side by side at real sizes. The best existing artwork is often already in Drive or Git.
2. **Strategy before shape.** `brand-strategy-to-identity`: the customer, the category codes to avoid, the one memory the brand may own. Write one sentence of what the mark must signal.
3. **References as evidence.** `visual-research-and-direction`: a sourced ledger of what top systems do, plus anti-references. Use Refero or the observatory for real captures, not remembered screenshots.
4. **Three territories, in black and white.** Exactly three materially different directions, with no colour, glow or glass. A named owner chooses one.
5. **Vector master and optical correction.** Draw and correct by hand. Prove at 16 and 32px and in one-colour. Outline the wordmark. Record font rights (`font-licensing-gate`).
6. **Lockup family and rules.** Horizontal, stacked, symbol, wordmark, mono, reverse, favicon, app icon, social avatar, clear space, minimum size, misuse.
7. **Tokens.** Colour and type ramps derived from the mark, written to the repo's token source and projected to Figma.
8. **Material tier.** Only now add glass, 3D, motion and cinematic renders, each as a named application of the flat master (section 3).
9. **Templates.** Figma components and Canva locked templates built from the approved masters.
10. **Release.** Manifest entry, exports, independent review, named-human approval, placement record.

### What top design systems teach (patterns, not imitation)

Each reference below shows a mechanism worth copying. Verify current versions in the source before quoting any of them.

| System | Mechanism to adopt |
|---|---|
| Apple Human Interface Guidelines (Liquid Glass) | Glass is reserved for the controls layer that floats over content. Content itself stays opaque. Materials adapt to what sits behind them and to accessibility settings |
| Google Material 3 | Tokens in three tiers: reference, system, component. Colour is generated from one source colour, so a brand ramp comes from the mark |
| IBM Carbon, GitHub Primer, Shopify Polaris | Public token packages, documented component states, and a usage "do / don't" for every component. Design lives in the repo, not only in Figma |
| Vercel Geist, Linear | Small palettes, one typeface family, and density as identity. Restraint reads as premium |
| Stripe and Linear brand pages | A public brand page with downloadable SVG lockups, clear space and misuse examples. Every partner and press use draws from one source |
| W3C Design Tokens (DTCG) format | One interchange format between Git and Figma, already used by this repo's compiler |

The anti-pattern to avoid is copying a reference's look. Copy its governance.

## 3. Liquid glass and orbital glass

Glass is a material. It is never an identity. A mark must be recognisable with every effect off.

### Where glass belongs, by brand

| Brand | Glass stance | Why |
|---|---|---|
| FrankX | Liquid glass on partner portals and interactive product surfaces, through the one recipe in `frankx.ai-vercel-website/lib/liquid` and `components/liquid-glass`. Editorial surfaces stay solid (`brand-packs/frankx/DESIGN.md`, `SURFACE_MODES.md`) | Glass signals a tool you operate. Reading surfaces need contrast |
| Starlight | Orbital glass, scoped as described below. Operator surfaces stay solid. Glass appears only on Horizon and lab material specimens (`brand-packs/sis/foundations`) | Calm operational intelligence. Glass is for depth in a scene, not chrome on a dashboard |
| Arcanea | Crystal and iridescent material on cinematic world surfaces and the rendered A. App chrome follows `@arcanea/design-system` glass cards | Mythic material fits the world. The flat A still has to exist |
| GenCreator | None. `glass-liquid` is retired for Territory B | The brand's warmth comes from type and paper, not translucency |
| Agentic Income | At most a single proof plane | Conversion surfaces need speed and legibility |
| Reality Architect | Navigation and one proof plane only (already in its pack) | Already correct |

### Orbital glass (definition proposed for Starlight)

The SIS site icon already draws an orbit around the star, and the pack names "the protocol orbit-star" as a variant. Orbital glass formalises that variant as the Starlight material application:

- **Construction.** The flat star with its companion dot (the master) sits behind or within a glass lens. A single orbit path, at the companion dot's angle, defines the lens edge. One light source, matching FrankX's top-left convention, so cross-brand renders sit together.
- **Allowed uses.** App icons at 128px and larger, hero objects, event and keynote stills, Horizon-mode scene anchors.
- **Never.** At favicon size, in monochrome contexts, on operator dashboards, or as a replacement for the flat mark in any lockup.
- **Web.** Build with the tier-one CSS recipe in `claude-skills-library/packs/web-excellence/skills/liquid-glass`, with an opaque fallback and `prefers-reduced-transparency`. A rendered orbital glass still goes through the generated-asset gate.

Promotion of orbital glass from proposal to the pack needs `/starlight-board` review, because it changes a named variant. Until then it is a candidate.

### Glass rules for logos (every brand)

1. Tier 1 is the flat vector master, which is the only identity.
2. Tier 2 is a constrained-colour application, such as the gradient Arcanea A or the gold Starlight star.
3. Tier 3 is a material application (glass, crystal, chrome, 3D), filed under `identity/logo/applications/` and never under `source/`.
4. Every tier 3 file records its tier 1 master hash in the manifest.
5. Glass needs something worth seeing underneath. Glass over a flat colour is a grey box.

## 4. Done means

A brand is "organised" when all of the following hold:

- `identity/logo/source/` holds SVG masters that pass 16px and one-colour proof.
- `identity/brand-manifest.json` lists every copy of every mark.
- The Figma Identity page imports those masters and does not redraw them.
- The Drive `01 Identity masters` folder mirrors exports and holds the signed approval.
- No byte-duplicate or unregistered logo remains in `public/`.
- The audit in [brand-estate-audit-2026-11.md](brand-estate-audit-2026-11.md) shows the brand as Pass.

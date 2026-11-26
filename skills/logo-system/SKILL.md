---
name: logo-system
description: "Use when creating, refining, validating, exporting, or governing an original logo, wordmark, symbol, lockup family, favicon, or app/social identity system."
---

# Logo System

A final logo is an optically corrected vector system with provenance and small-size proof. Generated images and 3D renders may explore or apply a mark; they are not the master identity.

## Prerequisites

Read the selected identity brief, naming decision, audience/category evidence, anti-references, typography rights, and production surfaces. Stop if the canonical name, owner, or selected direction is unknown.

## Best-of-Brand recovery

Start each established-brand job by opening the strongest historical artwork alongside the current product mark and the latest board. Load the owning brand’s VIS record, the actual source pixels or vector, its intended surface and any founder decision for that specific version. A filename, alt text, prompt, thumbnail link or memory of the mark cannot condition a design.

1. Preserve retrieved bytes. Record SHA-256, decoded dimensions, source version and access scope. Keep a renamed, recompressed, cropped or enlarged file as a separate version. Group exact bytes first. Use decoded-pixel hashes, perceptual distance, embeddings, OCR and source metadata to find candidates. Inspect the artwork before assigning a family. A higher resolution or similarity score establishes neither ancestry nor quality.
2. Make a comparison using real art. Show the incumbent, historical leader and proposed change together on equivalent backgrounds and scales. Include the actual 16/32px treatment. Identify which features survive black, reverse and effects-off. Compare identity fidelity, distinctiveness, optical craft and intended use. Preserve a superior incumbent when a revision fails on its intended surface.
3. Record geometry separately for each brand, family and tier. Identify apex, leg/curve construction, aperture, base closure, detachable pieces, silhouette and lettering. For Arcanea, compare the inward-cut open-foot A with closed bridges; distinguish segmented crystal, ceremonial lozenge and dragon coil. Treat lettering traced from pixels as a facsimile. Record an exact typeface only from a verified authored source or font asset with usage evidence.
4. Give each production pass actual source attachments or verified resolver outputs. Bind the bytes of each attached source to its reference digest. For vector, shader and motion work also bind the selected path or mask. A text description cannot replace a required image. When a reference is missing, continue archival review on verified material and hold the dependent creation.
5. Store the founder’s wording, date, target version and scope. “Prioritize these references” grants archival priority. Keep aesthetic ranking, reference priority, rights, founder selection and publication approval in separate fields. Never infer a founder vote from visual resemblance, a board label, file age or agent consensus.
6. Give a second reviewer the same unlabeled comparison or the source files and intended surface, without the first reviewer’s verdict. Record the reviewer, evidence viewed, failure mode and disposition. A material or cinematic expression must preserve its own family’s geometry. Keep inferior proposals in history with a visible reason and a link to the source comparison.

Before producing a new identity treatment, validate the actual source attachments with `python tools/reference_gate.py packet.json`. Read [the packet example](tools/reference-packet.md) for fields and review scope.

## Workflow

1. **Inventory before drawing.** Find every existing source mark, export, sketch, generated image, favicon, social avatar, app icon, and lockup. Record path, Git history/source, dimensions, vector/raster state, approval, and use.
2. **Define the job.** State what the mark must signal, where it must work, what category codes it should avoid, and the one memory it may own.
3. **Similarity screen.** Research direct competitors and adjacent marks. Record sources and obvious collision risks. This is a design screen—not legal trademark clearance.
4. **Sketch families.** Explore wordmark, monogram/symbol, combination, and responsive possibilities in black and white before effects. Build geometry/vector paths; do not trace third-party marks or ship text-to-image output.
5. **Select with proof.** Compare at least three materially distinct candidates against meaning, distinctiveness, legibility, small-size survival, one-color use, motion potential, production feasibility, and collision risk.
6. **Refine optically.** Correct spacing, stroke behavior, counters, joins, negative space, baseline, curves, overshoots, and symbol/wordmark balance. Geometry is a starting point, not the verdict.
7. **Build the lockup family.** Required unless a documented surface exception applies:
   - primary and secondary lockups;
   - horizontal and stacked;
   - symbol-only and wordmark-only;
   - monochrome, reverse, and constrained-color versions;
   - small-size/responsive variant;
   - favicon, app icon, social avatar, and OG-safe placement.
8. **Define rules.** Clear space, minimum digital/print sizes, background control, color modes, co-branding, alignment, placement, safe-area, and explicit misuse examples.
9. **Validate exports.** Inspect SVG source and rasterize actual 16, 32, 64, 128, and 512 pixel outputs. Test one-color, grayscale, light/dark, transparent, high/low contrast, square/circle masks, and print-size proof.
10. **Package provenance.** Record creator/tool, source files, selected direction, font source/license, external references, hashes, approval, and export script/version.

## Source And Export Contract

Keep an editable master and reproducible exports:

```text
identity/logo/
  source/
    mark-master.svg
    wordmark-master.svg
    lockup-primary.svg
  exports/
    svg/
    png/16 32 64 128 512 1024/
    social/
    app/
    print/
  specimens/
    small-size.png
    monochrome.png
    background-matrix.png
    misuse.png
  LOGO-SYSTEM.md
  PROVENANCE.json
```

SVG masters must have an explicit `viewBox`, no broken/external asset reference, no embedded secrets/metadata, and predictable color behavior. Preserve live-type source for editing only when the exact font rights are recorded; production wordmark exports should not depend on the end user's font installation.

## Automatic Failure

- final master exists only as raster or generated image;
- copied/traced symbol, stock icon, emoji, or unlicensed glyph;
- no black-and-white proof;
- mark fails at 16px/32px or becomes a different shape when simplified;
- no clear-space/minimum-size rules;
- wordmark font provenance or rights are missing;
- effects, chrome, glow, glass, texture, or 3D are required for recognition;
- no named decision owner, independent verifier, or rollback/source history.

## Recovered artwork review

For a cross-source SVG comparison, use the [local optical review and motion proof](tools/README.md) after resolving exact sources through VIS and the owning brand kit. Existing Figma components and the owning vector masters retain their roles.

## Output

Return the selected concept, comparison evidence, editable vectors, complete lockup/export matrix, usage rules, small-size/background specimens, provenance, similarity/legal limitations, verifier verdict, and decision-owner approval state.

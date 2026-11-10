# Visual canon critique and controlled supersession — v0.1

Status: **proposed design governance, not owner approval**. Tracking: [#86](https://github.com/Starlight-Intelligence/starlight-design-intelligence/issues/86), [#87](https://github.com/Starlight-Intelligence/starlight-design-intelligence/issues/87), [VIS #71](https://github.com/frankxai/visual-intelligence/issues/71).

## Purpose and authority

Preserve extraordinary existing artwork by separating **visual taste**, **art direction**, **character identity**, **world design**, and **production eligibility**. Newest image does not mean best image or accepted canon. This protocol supplements, not replaces, [character-canon-retrieval.md](character-canon-retrieval.md), the existing brand packs and generated-asset quality gates.

The owner reports strong preference for earlier fox/turtle/botanical/mushroom companions, tactile cinematic craft and earlier Queen studies versus generic subsequent robot crews. This is a *directional preference*, not an approval of a specific image, character name, edition or usage right. Do not infer visual properties of any unseen original.

## Exact evidence to retrieve

- [29 October prompt archive](https://docs.google.com/document/d/12osJF0bNvL29lj3DdhlDSHut6WBi74Ge4CS8HUJPkss/edit): three original direction recipes are **reconstructed**, twenty subsequent image prompts **exact**. Original model/version/seed not established.
- [10 November source kit](https://docs.google.com/document/d/1Kc7PTD86IrPccLldczzVKMyRJmdYuFwjaIdUdNPFJdU/edit): five 1374×2048 RGBA pet sprite sheets and six cinematic studies. Names Starling, Vaelor, Lumara and Nex are provisional where noted; Queen pearl-and-gold sprite is selected for personal pet use, **not** universal brand approval. The kit reports source binary transfer/Figma image fill pending.
- [Identity and sprite atlas](https://app.notion.com/p/41426ac2b7f681b99924d64b3d4487e9): exact private Mini Me masters, Queen folios, specialist proposal registry, guest sprites, ownership distinctions and previous image-review inventory.
- [Figma character atlas](https://www.figma.com/design/m2wi20fAoCgFOKGXkJJGAm?node-id=20-90): editable identity map; evidence labels do not establish actual image bytes.
- [Queen folios](https://www.figma.com/design/skl1Tjgu8iS7rwg5FZFTNg): inspect actual edition nodes before judging.
- [VIS registry](https://github.com/frankxai/visual-intelligence): exact asset/version/hash, rights, approval, placement and retrieval authority.

## Mandatory creative sequence

1. **Locate** exact originals and their source identifiers; recover private bytes only through authorized access. Preserve SHA-256 and original paths. Never paste private hashes or images into a public repo when not already public.
2. **Reconstruct** lineage: parent reference, original prompt status (EXACT / RECONSTRUCTED / MISSING), model and seed only when actually known, iterative edits and owner feedback. Avoid date-based automatic promotion.
3. **Critique** visible originals in comparable context. Record *specific observable features* and avoid making a numeric quality claim for unavailable images.
4. **Compare pairwise** against a reference, with concrete hypotheses about expression, silhouette, shape rhythm, materials, lighting, atmosphere, composition, narrative meaning and intended size. Record counterarguments and context dependence.
5. **Define identity invariants** separately from creative latitude. Queen: evaluate human/portrait, porcelain, pearl-and-gold sprite, orb/ambient and other editions independently; do not collapse distinct editions. Mini Me/companions and vendor pets are different lineages.
6. **Prototype** only the smallest justified visual changes. Require an image-to-image reference or exact source asset where continuity matters; no text-only stand-in claimed as canon.
7. **Test in context**: native resolution, 48px silhouette, phone crop, UI density, expression set, animation and accessibility as relevant.
8. **Approve** an exact asset/version/usage scope by named owner. Rights review, identity approval, visual quality and publication approval are independent gates.
9. **Supersede** by explicit versioned mapping of old and new assets plus rollback, not deletion. Figma/Canva/web are downstream projections; verify actual placements.

## Review packet schema

Use one record per comparison, stored in VIS or linked review artifacts; do not establish a parallel DAM.

```json
{
  "review_id": "review-placeholder",
  "target_context": "queen-ambient-pet",
  "candidate": {"asset_id": null, "version_id": null, "sha256_verified": false},
  "reference": {"asset_id": null, "version_id": null, "sha256_verified": false},
  "prompt_provenance": "MISSING",
  "source_images_visually_inspected": false,
  "observations": [],
  "pairwise_verdict": "UNREVIEWED",
  "strengths": [],
  "regressions": [],
  "identity_invariants_preserved": [],
  "identity_invariants_violated": [],
  "rights_state": "UNKNOWN",
  "owner_selection": "PENDING",
  "release_state": "BLOCKED",
  "reviewer": null,
  "evidence_links": []
}
```

Review dimensions: emotional magnetism, form/silhouette, material and lighting sophistication, cinematic authorship, originality, character identity, narrative/world coherence, and transmedia durability. They are **contextual judgments**, not a compensatory average. A rights failure or identity mismatch cannot be offset by beauty.

## Retrieval and agent acceptance tests

- Correct identity, approved edition and use scope resolved from VIS; record actual retrieval receipt.
- Missing original, unverifiable SHA-256, ambiguous character name, wrong brand or external guest license => do not silently substitute or publish.
- Newer rejected or superseded examples may be loaded as *negative evidence*, not as default positive generation references.
- Agent output must distinguish source-visible observation, inherited textual claim and creative hypothesis.
- Cross-agent enforcement is **not** established merely by adding this playbook. Validate actual scoped AGENTS.md/skill loading and read-only retrieval against the deployed runtime.

## Preservation and status vocabulary

APPROVED_MASTER, PREFERRED_REFERENCE, SHORTLIST, EXPERIMENT, SUPERSEDED, REJECTED_DEFAULT, ARCHIVED, EXTERNAL_GUEST. These describe editorial disposition; retain independent fields for rights, identity approval and release approval. Never delete weaker variants without explicit authorization.

## Release receipt

Provide source asset/version/hash; inspected image proof; comparison and review record; owner signoff; exact Figma/Canva/site placement; preview screenshots; mobile/desktop QA; rights clearance; rollback mapping. If any field is unknown, report it rather than claiming completion.

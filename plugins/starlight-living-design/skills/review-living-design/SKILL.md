---
name: review-living-design
description: "Review character-led AI products for visual craft, identity continuity, truthful agent behavior, accessibility, and operational evidence. Use before handing off Starlight companion designs, agent-team maps, UI kits, generated character assets, or living-design plugin releases."
---

# Review living design

## Purpose

Determine whether the character makes the product clearer, more recognizable, and more useful while preserving accurate operational state.

## Inputs

Read [review rubric](../../assets/living-design/docs/review-rubric.md), the actual changed artifacts, source revision, selected family, current brand pack, intended journey, and evidence. Use [marketing and expansion](../../assets/living-design/docs/marketing-and-expansion.md) for public-facing claims.

## Workflow

1. State the user's task and the evidence needed to call the result usable. Review the actual artifact; a creator's description does not establish quality.
2. Run `node scripts/living-design.mjs validate` from the plugin directory. Validate package/catalog references and the separation of character, role, runtime, provider, and authority. Inspect private/public boundaries and named source revisions.
3. Inspect visual work at its intended size and on representative narrow/wide layouts. Check identity anchors, materials, crop, typography, hierarchy, and the dominance of the user's artifact over decoration.
4. Exercise selection, navigation, keyboard focus, status announcements, reduced motion, empty/error/recovery states, and source inspection where implemented.
5. Challenge operational claims: can a portrait, animated edge, narrative field, or static connector list falsely imply execution, access, memory, confidence, or success? Require actual supporting state.
6. Test at least one failure with realistic permitted data. Record denied, unavailable, stale, or malformed inputs and whether useful work survives.
7. Use an independent reviewer when a worker is available and the task scope permits it. Give them the artifact and intended journey without the desired verdict. Otherwise label the pass as self-review.
8. Repair material defects, repeat affected checks, and issue a verdict tied to the exact revision. Do not average away a failed permission, provenance, accessibility, or content-truth gate.

## Material and character continuity

When the work uses the lab's Observatory Glass candidate, classify each asset
as an identity mark, a material study of the star, or a named companion before
review. Check the material object against the owned silhouette and companion
dot. For a character, inspect its source lineage and test its silhouette, face
and functional feature at 32, 64 and 160px. Preserve the character's anchors
when its surface changes. Keep evidence of real capability beside any status.
[Candidate material and identity rules](https://github.com/Starlight-Intelligence/starlight-design-intelligence/blob/eed60eff204574583fdfd6beb8a20a2d464d9b3b/brand-packs/sis/foundations/README.md)

Compare the opaque and transparent treatments at one scale and light direction.
Read the essential label over the brightest and darkest permitted backdrops,
then on the solid fallback. Replay the specimen, interrupt it and enable reduced
motion. Record whether the final still preserves recognition and task meaning.
Flag a specular highlight or particle pulse that suggests unverified activity.
[Material acceptance gate](https://github.com/Starlight-Intelligence/starlight-design-intelligence/blob/eed60eff204574583fdfd6beb8a20a2d464d9b3b/evals/starlight-material-foundations.md)

## Output contract

Return: verdict; task/hierarchy assessment; visual and identity findings; accessibility and responsive findings; state-truth findings; provenance and authority findings; prioritized corrections; executed checks; source revision; remaining acceptance gate.

## Tools and boundaries

Use approved browser/design tooling for visible behavior and deterministic checks for data and packaging. An unrendered mockup is not visually verified. A saved private plugin is not proof of installation, runtime operation, publication, or customer value.

## Quality bar

Separate implemented, tested, account-saved, installed, runtime-tested, merged, deployed, and customer-accepted states. Keep unknowns explicit. Judge function, craft, and commercial learning separately.

## Example

“Review the Nacre–Helix–Orin team screen.” Verify that each character resolves to a functional role, stale connectors display as unknown, selecting a member reveals source and access details, and the graph has a keyboard-accessible list equivalent.

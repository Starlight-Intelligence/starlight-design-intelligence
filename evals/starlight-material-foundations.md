# Starlight material foundation acceptance

Applies to the candidate [SIS foundations](../brand-packs/sis/foundations/README.md).
Use this alongside the existing interface, typography, motion-purpose and web
release gates. It adds material-specific questions; it grants no release approval.

## Non-compensable checks

| Check | Evidence required |
| --- | --- |
| Owned identity | Current manifest and master vectors resolve to a recorded source revision. Original paths, companion dot, minimum sizes and clear space remain valid. Material applications are separately labeled. |
| Reading survives | Essential text and controls stay readable with optical/texture layers removed, unsupported backdrop filter, forced colors and the solid fallback. Measure worst-case actual compositions. |
| Truthful state | Visual activity is identified as a specimen or corresponds to real state. No speculative progress, confidence, connectivity or completion. |
| Complete controls | Every named material and depth selection visibly changes the actual specimen; selected state is exposed semantically; keyboard use and focus are correct. No fake parameter knobs. |
| Motion control | Explicit replay; one sequence; maximum 1800ms; no continuous idle animation. Repeated replay and material change cannot stack timers or restore stale state. |
| Reduced motion | Same final information immediately; separately sampled reduced-motion frames remain stable. No camera or particle travel hidden behind a nominal preference class. |
| Bounded work | At most 24 points from 768px, 12 below; at most two non-nested backdrop surfaces. No requestAnimationFrame or interval work after settling; hidden and unmounted states stop scheduling work. |
| Source/evidence agreement | Browser captures and tests resolve to the exact candidate deployment and commit. Preview, production and adopted status are distinguished. |

Use at least the product's existing accessibility targets. For contrast,
measure normal text at 4.5:1, large text at 3:1 and essential graphical/control
boundaries at 3:1 where applicable; evaluate exceptions and state-specific
requirements against the governing accessibility standard. This gate does not
replace a full accessibility audit. See [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast). A palette-only ratio does not pass glass.

## Craft review

Each item is 0 absent/failing, 1 partial, 2 convincing. Require **at least 11/12**
and every non-compensable check. This score is a review target, not a current result.

| Item | Reviewer question |
| --- | --- |
| Form | Does the object retain a recognizable silhouette without color or effects? |
| Material | Are porcelain's opacity, obsidian's mass and glass's thickness distinct? |
| Light | Do highlights, edges and shadows agree about where the light comes from? |
| Hierarchy | Is the object useful to the person's decision; are controls and reading stable? |
| Restraint | Does removing an effect lose a meaningful material or spatial cue? |
| Starlight character | Do the owned mark, warm/cool light roles and editorial rhythm belong to this brand? |

## Required inspection matrix

- Capture the owning host before the change, then candidate at 375×812,
  768×1024 and 1440×1000 CSS pixels, with recorded DPR.
- Capture all three materials, all three depth levels, and selected/focus states.
  All nine combinations need functional assertions; visual inspection may focus
  on representative extremes plus any defects discovered.
- Verify computed family, style and weight on real heading, label, body and
  data specimens. Font declarations alone do not establish rendered typography.
- Sample initial, active, settling and resting frames of normal motion, then
  independently sample reduced-motion and settled-state stability. Apply the
  existing decoded-pixel and metadata requirements when claiming shipped motion.
- Test replay→replay, replay→material-change, narrow→wide resize, hidden→visible,
  unmount and effect-support failure. Capture one realistic denied/unavailable
  condition when the component has network dependencies; a local specimen must
  not invent a network failure state merely to fill a checklist.
- Test keyboard selection, visible focus, scroll/reflow at 200% zoom, accessible
  names and the no-script static path. Confirm decorative nodes cannot intercept
  input or enter the accessibility tree.
- Measure input/scroll behavior with the scene active and resting. Record the
  tested device or emulation, viewport and trace. Do not claim physical mobile
  performance from a desktop screenshot. Reject a measurable material regression
  against the host baseline unless the product owner explicitly accepts it.

## Verdict and adoption

Record five separate verdicts: available, functional, useful, distinctive and
sustainable. A working specimen may establish the first two and support a craft
judgment; it does not establish customer usefulness or commercial viability.

The maker records files and exact source. An independent verifier inspects the
actual artifacts and tests. The owning release process records approval and
production proof when applicable. Failed identity, reading, truth or controls
cannot be averaged away by a high craft score. Keep corrections bounded, rerun
the affected matrix and retain the rejected evidence with its status.

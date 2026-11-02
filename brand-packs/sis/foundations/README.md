# Starlight material foundations

Status: **candidate v0.1**, 2 November 2026. This extends the lab's existing
identity for a material workbench. It does not replace a logo, approve a new
character, update installed plugins, or establish adoption across Starlight.

The user requested a stronger owned system for liquid glass, texture, depth,
motion graphics, particles and Starlights. This proposal translates those
qualities into constrained materials and inspectable behavior. Its first user is
a Starlight designer or engineer choosing a material for an actual interface.
They should be able to compare it, change it, see its static equivalent and use
the same recipe in code. The material must survive this practical test.

## Authority and scope

The source baseline is design kernel
`bc4eb09befcb97a7881f7aea983f005fe17a5570`. Read [the constitution](../BRAND.md),
[design rules](../DESIGN.md), [motion language](../MOTION.md) and
[identity authority](../SOURCE_AUTHORITY.md) first. The JSON's identity revision
is that document's **policy pin**, not an assertion about the latest website
implementation. A product adapter must separately record its exact source
revision and compare the current identity manifest and master vectors.

The `.ai` palette and Instrument Sans / Instrument Serif italic / IBM Plex Mono
roles remain owned by the lab. Gold and companion cyan serve edges and emphasis;
they do not carry body text on paper. Academy and protocol retain their local
reading palettes and the protocol orbit-star. The active machine pack's ban on
"radiant particle fields" stays intact. This candidate tests a narrow exception:
a finite, user-triggered particle composition inside an authored specimen.
It grants no permission for a persistent page-wide starfield.

Horizon is warm, curious and expansive. Operator is calm and precise. Academy
is generous and developmental. Cultural may be expressive. Operator wording in
the machine pack and COPY.md is not a universal voice for these other modes.

## Three directions

These are three proposed art directions, not three visually verified exports.
The owning product must retain their actual direction captures before claiming
the flagship release gate. Shared identity does not make them interchangeable.

| Direction | Composition and typography | Material and subject | Interaction and motion | Decision |
| --- | --- | --- | --- | --- |
| **Observatory Glass** | A generous editorial heading and short explanation beside one oversized specimen; Instrument Sans leads, one Serif italic phrase supplies warmth; compact mono measurements sit below. Mobile keeps the specimen first, puts replay beside it and places material controls immediately after; it removes secondary atmospheric layers. | An owned Starlight object sits above a quiet ink stage. Obsidian, porcelain and glass are alternate treatments of the same form. Directional warm light makes mass legible; a cyan rim describes glass thickness. | Material and depth controls expose the system. An explicit replay gathers a few points into the final composition, then rests. Reading and controls never move. | **Selected for the first workbench.** It gives material a clear subject and makes the system testable without pretending to be a live agent console. |
| **Porcelain Atelier** | A paper-led, full-width reading plane; a narrow index and large annotated specimen plates. Serif accents introduce chapters; Sans carries instructions; mono appears only on dimensional callouts. | Ceramic relief, engraved graphite rules and fine paper grain. The star is a printed or embossed application, not a floating interface. | Compare two static specimens and pin a recipe. A short line reveals the connection from an annotation to its subject; no particle entry sequence. | Reserved for Academy and reference documentation where sustained reading is the primary task. |
| **Signal Instrument** | A compact two-pane workspace with a stable instrument canvas and a persistent parameter inspector. Sans remains compact and high-contrast; mono aligns numeric controls; no oversized poetic headline. | One optically layered glass instrument with a solid control chassis. Warm/cool edge separation makes depth legible without a rainbow surface. | User-controlled section view and causal depth transitions reveal construction. No camera flight or ambient starfield. | Reserved for an actual editing or analysis tool. Its denser controls would burden a public foundations introduction. |

## Layer model

Build from the user's artifact outward. The reading plane, controls and current
state are resolved before texture or light is added.

| Layer | Owns | Rule |
| --- | --- | --- |
| Substrate | Ink or paper, text, focus, essential borders | Fully readable when every effect is removed. Use opaque reading areas for essential text. |
| Material | Obsidian, porcelain or liquid glass | Choose one dominant material for the component. A page can compare recipes; a single control should not combine all of them. |
| Depth | Base, raised, floating | Three elevations only. Depth reflects actual overlap or interaction priority. A larger shadow is not evidence of greater importance by itself. |
| Light | Edge, contact, core | One main light direction. Gold warms the authored object; cyan can describe glass edges. State color remains governed by the product's semantics. |
| Texture | Surface grain or ruled construction | Low-amplitude, clipped, non-interactive and static. No texture behind fine body copy or small data. |
| Motion | Causal transition or one brand sequence | A named trigger, finite duration, interruption rule and resting state. |
| Particles | Sparse spatial support | Bounded to the specimen, never used as status, a cursor replacement, or a decoration over reading. |

## Material recipes

**Obsidian.** Use an ink reading substrate. Reveal the object's silhouette with
a broad, quiet top-left highlight and a narrower warm edge. Retain a visible
contact shadow so it feels held by the composition. Grain is at most 0.025
opacity, within the specimen only. Avoid pure-black loss of detail or polished
plastic everywhere. Text does not inherit the surface's gloss.

**Porcelain.** Use paper with ink text. Give the object a soft broad highlight,
a shallow warm contact shadow, and a cooler edge in shadow. Keep its silhouette
readable in monochrome. Porcelain is opaque; do not fake it with a translucent
white card. Grain may be used at the same limit, with no grain under small type.

**Liquid glass.** Show optical thickness through an asymmetric rim, a restrained
inner highlight and the scene behind the object. The candidate CSS blur is
18px, saturation 115%, with at most two visible and non-nested backdrop surfaces.
Do not animate blur, backdrop-filter, noise, or large shadows. The reading
substrate stays opaque. Glass describes the frame or authored object; essential
instructions, form values and evidence need stable contrast.

CSS backdrop blur approximates a material; it is not physically accurate
refraction. Do not call a CSS specimen a 3D simulation. A shader or 3D runtime is
justified only when the object itself is the task, after measured mobile cost
and an equivalent static path. No extra engine is required for this candidate.

### Application recipes

| Recipe | Appropriate use | Essential constraint |
| --- | --- | --- |
| `glass-navigation` | A small navigation shell over an authored visual | Navigation labels have a stable opaque backing; native focus and hit areas remain visible; no backdrop over every menu item. |
| `glass-inspector` | An overlay that preserves a view of the selected object | Reading body is opaque; canvas remains visible at the edge. Keyboard focus enters and returns correctly. |
| `glass-artifact` | A material specimen or a character's authored feature | No essential information inside a distorted layer. Controls and descriptions sit outside the optical object. |

With `@supports` failure, use the selected opaque substrate, an ordinary border
and the same layout. Under forced colors, remove the optical and decorative
layers and use system colors. The user's task must remain complete. If a user
requests reduced transparency, use the same opaque fallback where the platform
exposes that preference; provide an explicit solid treatment when it does not.

## Depth, spacing and reading

The [token contract](tokens.json) supplies three box-shadow levels for rectangular
surfaces and three silhouette-shadow arguments for authored objects. Apply an
object token through `filter: drop-shadow(var(--sl-object-shadow-raised))`; do not
apply a rectangular box shadow to the star. It also supplies a 24px panel
radius and a 12px control radius. These are workbench recipes, not a mandate to
round every product surface. Use the owning product's spacing and typography
scale. Avoid introducing a competing global type or spacing system in this
material slice. A new global foundation requires a measured adoption proposal.

At base elevation the surface rests in the page. Raised elevation separates an
interactive specimen or selected tool. Floating elevation is for a genuinely
overlapping object or temporary inspector. Essential focus must remain legible
at every elevation. No content shifts merely because a shadow changes.

Glass and texture are tested against the actual worst-case background, not just
a token pair on an empty artboard. Test small text, large text, essential control
edges, focus, selection and disabled states separately. Do not claim a whole
page accessibility pass from a palette calculation.

## Starlights and living design

Use **Starlight mark** for the identity: preserve the owned vector silhouette,
center and companion dot; use color from 24px and monochrome below 24px; reserve
clear space of one quarter of its width. Keep the original export available.

Use **Starlight object** for a material application of that form. It may show
ceramic, glass or light, but it is not a new logo master, favicon or runtime
agent. Rendering material over the exact path preserves lineage; a generative
model must not redraw an identity asset used in navigation or downloads.

Use **companion** only for an actual character with its own source references,
recognition anchors and identity contract. Living Design's Porcelain Observatory,
Noble Machines, Prismatic Tide and Living Glasshouse are candidate families,
not interchangeable styles for every avatar. A glass surface alone establishes
no character identity. If a future companion uses these foundations, preserve
its approved silhouette and face construction; material variation is secondary.
Test at 32, 64 and 160px before committing to an elaborate scene.

Light, particles and animation never imply that an agent is executing, online,
confident, remembering, or successful. Show those states only from real product
state, with textual labels and recovery. The material workbench can truthfully
say "Preview" or "Replay motion"; it must not simulate a completed customer job.

## Motion and particles

The motion job is **brand memory and spatial relationship**: a handful of points
resolves around one recognizable object, revealing a composed system. It does
not represent a real execution trace. The first still frame and final still
frame both contain a complete, readable experience.

| Beat | Timing | Behavior |
| --- | --- | --- |
| Rest | Until explicit replay | Final, stable composition. No autoplay or idle pulse. |
| Setup | 0–160ms | Keep copy, controls and object anchor fixed. Establish a small number of points within the specimen. |
| Resolve | 160–1240ms | Transform and opacity move points along short deterministic paths toward their final positions. Avoid zooming the whole scene. |
| Settle | 1240–1800ms | The object edge and final points settle once. No overshoot on text or controls. |
| Hold | After 1800ms | Static final composition. No hidden looping timer or requestAnimationFrame work. |

Motion tokens: micro 120ms, base 220ms, system 360ms, explanation 640ms,
signature resolve 1800ms. These are selected values within the existing SIS
timing ranges. Enter uses `cubic-bezier(0.2, 0.8, 0.2, 1)`; exit uses
`cubic-bezier(0.4, 0, 1, 1)`. Animate transform and opacity. A material change
interrupts the sequence and resolves the new selection without a stale timer
overwriting it. A repeat replay restarts a single sequence, never a second loop.

Particle limits are **24 at widths of 768px and above, 12 below 768px**. These
are ceilings, not targets. Points are at most 3 CSS pixels in diameter while
animated. Deterministic positions prevent hydration shifts. Decorative layers
are `aria-hidden`, have `pointer-events: none`, and cannot receive focus. Small
displays reduce count and travel; they do not merely crop a desktop field.

With reduced motion, replay is disabled and the same final composition remains visible, with a clear static-state explanation.
With the document hidden, settle once and stop scheduling work. Removing the
component cancels its work. The no-JavaScript or failed-script state retains the
static object, readable explanation and available identity downloads; do not
leave the content invisible while waiting for an entrance animation.

For a rendered motion graphic, use the same silhouette, palette, light direction
and beats. Keep typography as editable vector or HTML layers. Produce 16:9 and
9:16 compositions separately; the vertical version reduces points and places
the subject above the caption. No automatic video export or production asset is
claimed by these written directions.

## Adoption and evidence

Read [the acceptance gate](../../../evals/starlight-material-foundations.md) and
[prompt recipes](PROMPTS.md). Validate the candidate with
`npm run validate:foundations`. The normal kernel validation also checks it.
The schema proves bounded values and source references, not aesthetic quality,
browser support, identity approval, or downstream adoption.

A product implementation must bind its exact source revision, captured states,
font proof, runtime behavior and independent review. A Figma representation must
map tokens and components back to this version and state its static/motion
limits. Publishing a Figma library, updating a product's kernel pin and shipping
the preview are separate actions with separate evidence.

Design Intelligence supplies recipes and verification rules. Living Design
supplies identity continuity and state-truth rules. Excellence judges the actual
result and distinguishes implemented, tested, merged, deployed and useful.
These documents connect their responsibilities; they do not prove that any
installed plugin has been updated or that a named agent is running.

The next adoption unit is the lab `/brand` workbench. Keep its implementation
behind its normal review and delivery gates. Retain a working opaque fallback
and the previous source revision as the rollback. Evaluate a second real product
use before promoting these material recipes into portfolio-wide defaults.

## Technical references

Checked on 2 November 2026: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) and [MDN reduced transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency).
Reduced-transparency detection has limited browser availability, so it cannot
be the only route to a solid treatment. These sources support accessibility and
platform behavior; the material values and aesthetic decisions are Starlight
proposals, not requirements attributed to W3C or MDN.

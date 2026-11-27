# Starlight Transformation Architecture — experimental vertical slice

Decision: implement transformation as a constrained animation capability inside the existing living-design layer. Identity survives a form change because the entity, component IDs, local meshes, materials, attachments and provenance persist. A new rendered frame does not create a new agent. This is an experimental extension for OAVS research, not a separately ratified open standard or replacement registry.

The useful outcome is inspectable continuity: an operator can unfold a persistent mechanism, reverse it, identify every moving part, recover the exact source and compare web and cinematic outputs. The first specimen is deliberately noncanonical. No Queen, Mini Me, house conductor, pet, fictional Arcanean character or vendor-owned mascot was adapted.

## Audit and authority

The audit read the design repository at `14f7a9c957b16ac113ddc94792c91cc192bdb5e6`, including AGENTS/SYSTEM/SCHEMA/SKILLS, living-design architecture and catalog, character retrieval boundary, SIS design/motion rules, release and asset gates. Current main contains the living-design contracts/compiler; no separately named OAVS transformation specification was recovered from the bounded repository/issue/Library search. This is a coverage statement, not proof that no other branch or private document exists.

| Source | Observation | Consequence |
|---|---|---|
| Existing living-design catalog | Four visual families and character/role recipes; release state `proposal`, runtime not connected | Extend rendition/asset metadata; do not build a second identity system |
| VIS character reconciliation and identity-source projection | Queen and folios are working studies; Mini Me requires recovered private image hashes; vendor pets remain separate | No suitable approved 3D rig recovered; use the authorized experimental alternative |
| Existing Figma `m2wi20fAoCgFOKGXkJJGAm` | Current pages and source-map node `20:89` inspected; source-linked lineage cards, candidate sprites and source placeholders | Preserve existing designs and source distinctions; no new identity atlas |
| Portfolio `registry/agents.yaml` | Reconciliation pending; `items: []`; candidate records do not establish live agents | `runtime_agent_id` remains null |
| Atlas private studio query | `connector_state: not_configured`, no records for OAVS | Cannot use that response as asset approval or global absence |
| Library | Transformation Architecture and Transformation Dashboard concept images exist | Concept images are reference proposals, not mechanical source geometry |
| Connected n8n workflow `1oEGJktWo9357uQc` | FrankX — Arcanea Video Pipeline exists; inactive; webhook → code → response | Do not clone or activate it; export a media packet for its eventual authorized adapter |
| Cinematic owner issue `agentic-ops#583` | Existing creator-command versus GenCreator episode coordinator ruling is open | No new scheduler/coordinator; integration remains a packet handoff |
| Existing media authority | VIS source decision supersedes stale Blob default in living-design prose with `architecture_media_fabric_v3` | R2 masters/Supabase metadata are the accepted destination model; no bucket write performed |

Audited source links: [living-design architecture](https://github.com/Starlight-Intelligence/starlight-design-intelligence/blob/14f7a9c957b16ac113ddc94792c91cc192bdb5e6/plugins/starlight-living-design/assets/living-design/docs/architecture-and-standards.md), [VIS source reconciliation](https://github.com/frankxai/visual-intelligence/blob/main/docs/character-canon/2026-11-10-cross-platform-reconciliation.md), [asset-estate decision](https://github.com/frankxai/visual-intelligence/blob/main/docs/character-canon/FIGMA_DRIVE_VIS_ASSET_ESTATE_DECISION_20261110.md), [Figma identity map](https://www.figma.com/design/m2wi20fAoCgFOKGXkJJGAm?node-id=20-89), [cinematic coordinator ruling](https://github.com/frankxai/agentic-ops/issues/583). Remote mutable links are audit entry points; the local build manifest pins specimen bytes.

## Identity and graph model

Keep `entity_id`, `character_id`, `asset_id/version_id`, `runtime_agent_id`, provider/model and `run_id` separate. The experimental entity uses `experimental.oavs.seed-bloom.001`; character and runtime-agent bindings are null. Configuration is mutable presentation state under an immutable identity. A costume, form or renderer never grants tools, memory, tenant access or execution.

The component graph is the actual GLB hierarchy: one root; static core/base; six radial stations; one revolute hinge per station; persistent ceramic panel, spine and two trim meshes beneath each hinge. Geometry is generated once. No scale animation, topology change, duplicate complete forms, disappearance, remeshing, reparenting or attachment swapping occurs. The source has Z-up metres; GLB/USD have Y-up metres. Basis conversion maps source hinge +Y to delivery −Z. The sidecar records both axes explicitly.

Valid settled configurations are `seed (q=0)` and `bloom (q=1)`. Every joint lies in [−112°, +4°]. Three opposite panel pairs share phase windows [0,.84], [.08,.92], [.16,1]. The dependency graph is `q → phase pair → two hinges → attached meshes`. Attachments and animation dependencies are distinct acyclic graphs. Source functions reject nonfinite/out-of-range q; schema validation additionally rejects broken component parents, duplicate IDs, cycles and invalid joint limits.

## Transformation and motion

For pair p, `u=clamp((q−.08p)/.84,0,1)` and `θ=θclosed+(θopen−θclosed)(10u³−15u⁴+6u⁵)`. Forward playback advances q from zero to one over six seconds. Reverse uses the same source coordinates in reverse order. Both curves join their endpoint holds with zero velocity and acceleration: C2 continuity. Jerk remains bounded and has finite jumps at phase boundaries. This is a kinematic property, not a dynamics or manufacturability claim.

The controller transitions `seed → unfolding → bloom → folding → seed`. Scrubbing enters `inspection` and requires an endpoint reset before timed playback. Mid-flight reversal is rejected. Synthetic workflow targets arriving during playback queue the latest endpoint until settlement. A future interruptible physical trajectory must preserve q, qdot and qddot while replanning under velocity, acceleration, jerk, contact and collision limits. Negating playback velocity immediately is not such a planner.

Procedural planning for this fixture is intentionally analytic FK. A general authoring adapter should resolve approved endpoint configurations, construct a joint-space path, order clearance-sensitive dependencies, time-parameterize it, check constraints and bake only the accepted path. Skeletons and IK become appropriate for deforming creatures or contact-constrained end effectors; they are unnecessary for this six-link mechanism. IK output still needs joint-limit and collision validation.

## Constraints and validation boundaries

The panel-panel test derives a continuous bound for the complete moving panel assemblies. Every mesh vertex remains inside its radial 60° sector over the entire allowed hinge interval. Radial vertex position is a sinusoid; its exact minima occur at endpoints or derivative-zero angles. Positive separation from both sector planes extends to every triangle interior by convexity, even when panel pairs move asynchronously. The certificate is invalidated by changed geometry, axes, limits or attachments and must be regenerated.

Core/base clearance is separately sampled at 2,001 q values (equivalent 3 ms intervals for a six-second transition). The test uses a convex-hull separating plane against an enclosing core sphere, and a conservative vertical plane above the fixed base. It does not claim continuous all-pairs collision proof. Intentional bearings, axles and rigid attachment contact are excluded. Static supports and mast need explicit clearance qualification before hardware use. No mass, torque, stress, friction, stability, actuator, cable-routing or manufacturing-tolerance analysis is supplied.

Continuity is measured by unchanged local mesh and attachment identities, unit scale, proper rotations, invariant edge lengths, reverse world-transform agreement, schema/graph checks and exported animation comparison. Semantic visual recognition remains a human evaluation; unchanged IDs are insufficient to establish an audience preference or character-quality score.

## Renderer and interchange adapters

| Adapter | Implemented behavior | Boundary |
|---|---|---|
| Blender 4.3.2 | Procedural source, fixed rig, sampled keyframes, studio lighting/camera, stills and frame sequence | CPU prototype samples retain visible noise; no Unreal result implied |
| GLB / glTF 2.0 | Persistent hierarchy, PBR materials, unit scales, single combined six-channel clip | Sidecar owns mechanics/state semantics; playback policy is external |
| OpenUSD SDK 25.11 | GLB geometry/material/hierarchy conversion to USD Xform/Mesh/UsdPreviewSurface, single-axis scalar rotation samples, explicit metres/Y-up/30fps | Fixture-scoped adapter; not a general texture/skin/morph converter |
| Three.js 0.187.0 | Self-contained HTML with embedded GLB, orbit/scrub, exact analytic hinge law, mesh inspection, synthetic event projection, reduced-motion endpoints and embedded static fallback | Source and offline loader checks pass; browser GPU/mobile/performance qualification remains separate |
| Unreal | Research and future Control Rig/USD adapter contract | No Unreal project, render, runtime test or import claimed |
| Cinematic production | Deterministic frames → forward/reverse MP4 plus composed evidence cut | No live provider inference, n8n execution or publication claimed |

Blender's exporter emitted separate hinge clips with frame-one timestamps. `normalize_glb.py` shifts each unique timeline to zero, updates bounds and combines tracks into one `seed_to_bloom` clip. The OpenUSD adapter then maps seconds to `timeCode=30t+1`. Moving hinges use scalar rotateZ samples to preserve their rigid single-axis constraint under USD interpolation; normalized quaternions remain on static nodes. The web adapter uses the exact analytic curve; baked GLB interpolation is independently bounded by the export test. A second fresh-directory build reproduced every vertex attribute, triangle connectivity set, hierarchy/material value and animation accessor exactly. Blender reordered triangles in five static core meshes, so the GLB container hash differs; geometry and motion reproduce. Render containers need not be byte-deterministic for geometry/trajectory reproduction to pass.

## Workflow and storytelling integration

Operational state is independent of visual configuration. The specimen accepts only local synthetic events with explicit entity/scope/run/event/sequence/time fields; it rejects stale, wrong-scope, cross-run, duplicate and out-of-order events. UI freshness expires to unknown. This exercises a projection contract and grants no operational permission. A live integration must join authorized tenant-scoped runtime identities server-side, validate event sources and receipts, and use existing cancellation and replay authority.

| Verified event | Presentation intent | Meaning retained outside shape |
|---|---|---|
| idle | settle to seed | Available state; no inference about connection health |
| running | settle to bloom | Work is active; completion not implied |
| succeeded | retain form and show receipt | Success requires actual artifact/receipt; this demo is explicitly synthetic |
| failed | retain configuration, show attention state | Failure does not destroy identity or hide prior outputs |
| unknown/stale | retain last pose, label unknown | Silence is never success |

Workflow interfaces can bind panels to actual capability groups while the core remains the stable role identity. Cinematic storytelling can reuse the same accepted mechanism as a reveal or return gesture, with authored camera/sound layered above it. A fictional scene may interpret that gesture narratively, while operational UI must retain factual event labels. No narrative becomes an execution receipt.

## Standards research and selection

OpenUSD is suitable for scene composition, asset referencing, animation layers and production interchange. glTF is suitable for efficient runtime delivery of nodes, geometry, materials, skins and animation. Neither is the authority for allowed configurations, mechanical constraints or tenant grants. Blender supplies an accessible deterministic authoring/build environment; Three.js supplies the browser adapter. Unreal Control Rig/FBIK is a later contact and character-performance adapter; it does not remove collision qualification. Use existing animation mixers/state machines for playback rather than inventing a second animation engine.

Generative techniques belong upstream as proposals. Hunyuan3D-2.1 and TRELLIS.2 can propose geometry/PBR appearance; UniRig and RigAnything can propose skeletons/weights; PAct addresses part decomposition and articulation. ArtCrafter is a November 2026 research lead for paired rest/open part geometry; it was not reproduced here and the full paper was unavailable in this bounded review. Generative video interpolation supplies neither persistent mesh identity nor a proven joint path. None of these models was executed or benchmarked for this specimen.

Primary references: [glTF core](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html), [USD transforms/layers/time](https://openusd.org/release/tut_xforms.html), [UsdSkel](https://openusd.org/dev/api/_usd_skel__schema_overview.html), [Blender pipeline](https://www.blender.org/features/pipeline/), [Blender IK implementation](https://developer.blender.org/docs/features/animation/ik/), [Three.js AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html), [Epic FBIK](https://dev.epicgames.com/documentation/unreal-engine/control-rig-full-body-ik-in-unreal-engine), [Unreal USD/Control Rig](https://dev.epicgames.com/documentation/unreal-engine/using-control-rig-with-usd-files-in-unreal-engine), [Hunyuan3D](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), [TRELLIS.2](https://github.com/microsoft/TRELLIS.2), [UniRig](https://github.com/VAST-AI-Research/UniRig), [RigAnything](https://github.com/Isabella98Liu/RigAnything), [PAct](https://pact-project.github.io/), [ArtCrafter preprint](https://arxiv.org/abs/2611.07658). Consulted 10–11 November 2026; this is a bounded comparison, not an exhaustive latest-model ranking.

## Economics, reproducibility and admission

No paid image/3D/video generation provider was called. External generative credits consumed: zero. Chat/model subscription allocation, research tool billing, workstation electricity and host compute price are not exposed; do not infer total zero cost. Build/render receipts record observed tool versions and wall time. Asset reuse is 100% of this specimen's persistent geometry across configurations, not reuse of an approved character asset.

The source proposal belongs under `examples/oavs-transformation` in the existing design repository. It adds no installable skill, agent registry, database, workflow, account, scheduler or production route. The generated sidecar references existing identities and VIS records when those are later authorized. Binaries remain deliverables, not public Git source. Before canonical adoption: qualified approved model/rig, exact asset/version approval, human visual review, real browser/mobile/performance checks, target-product integration and existing release evidence. Rollback is deletion/reversion of the isolated example or closing its draft PR; no migration is involved.

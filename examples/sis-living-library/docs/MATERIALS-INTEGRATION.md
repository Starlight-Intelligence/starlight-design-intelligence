# Integration with the existing material package

This lab is an additive design and interaction study. It is not a second production design-system authority or a published npm package.

The existing implementation candidate is [PR #53](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/53), `packages/materials/`, at observed head `ff12c4c17257659560d9da0f66d14a6f62ebde6c`. It remains draft. Its own runtime and release gaps remain separate from this lab's evidence.

| Concern | Integration decision |
| --- | --- |
| Glass rendering | `@starlight/materials` owns the production candidate: poster, capability gate and GPU lifecycle. This lab demonstrates CSS materials without claiming physical refraction or WebGL. |
| Button / Card / Sheet | Reuse PR #53 primitives during product adoption. `StarlightButton` and `GlassSurface` here are isolated reference APIs, not replacement canonical primitives. |
| Tokens | Midnight, Daylight and Ember are candidate application treatments. Map their roles to the product's accepted tokens; do not import both `--sl-*` token sheets into one scope. Neither this study nor a Figma mode changes the current brand identity. |
| Icons | The 24 original Signal vectors are additive candidates with consistent geometry and accessibility rules. The brand mark remains separately owned. |
| Agent and evidence UI | Carry `AgentPresence`, `StatusBadge` and `EvidenceDisclosure` into the product as composed views over validated runtime input. Unknown remains the default. |
| Registry | This is one local study item for consumer-install testing. It claims no `@starlight` registry namespace. Reconcile with the existing seven-item material registry before publishing. |
| Product adoption | Existing `frankxai/starlightintelligence.ai` owns runtime integration, routes and production validation. Figma remains an editable projection. |

The next bounded implementation should adapt one research/review screen onto the material package, test its real source → review → export flow, and remove overlapping reference primitives from the product import path. Do not infer readiness from either PR's existence.

Observed maintenance issue for PR #53: registry instructions still use the historical `frankxai/starlight-design-intelligence` URL. Reconcile them with the current organization path at its own reviewed release.

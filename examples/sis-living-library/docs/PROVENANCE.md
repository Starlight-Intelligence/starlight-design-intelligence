# Provenance and distribution terms

Version 0.1 · candidate · 31 October 2026

## Original work and owning sources

The component source, CSS material/theme implementation, example composition and 24 Signal icon paths were authored for this candidate. No third-party icon package is imported. This is an authorship record, not proof of trademark clearance or a legal originality certification.

The intended source home is `Starlight-Intelligence/starlight-design-intelligence`, reference path `examples/sis-living-library`, based on `bc4eb09befcb97a7881f7aea983f005fe17a5570`. Runtime adoption belongs to the existing product repositories.

The workbench's four-point star and companion dot preserve the current Starlight product vector from `frankxai/starlightintelligence.ai`, path `public/brand/starlight-star-monochrome.svg`, Git blob `9093c0a17aabbffe30fe14dd11d24f6c283f3d5b`. This mark is distinct from the utility `spark` icon. Brand geometry and use remain governed by the owning product identity; no new brand mark is established here.

No published license was established for the owning Starlight repository. This candidate therefore does not grant MIT or other permissive rights to original Starlight source, icons, marks or documentation. An open MIT core is a release proposal pending the owner's decision. The term “source-owned” describes access to editable source and the intended delivery model; it does not replace a license grant.

## Fonts

The workbench imports local font assets through these exact npm dependencies. Their installed `package.json` and `LICENSE` files were inspected:

| Package | Version | Role | License |
|---|---|---|---|
| `@fontsource/instrument-sans` | 5.3.0 | Interface and reading, weights 400/500/600 | SIL OFL 1.1 |
| `@fontsource/instrument-serif` | 5.3.0 | Regular/italic editorial accent, weight 400 | SIL OFL 1.1 |
| `@fontsource/ibm-plex-mono` | 5.3.0 | Code and aligned data, weight 400 | SIL OFL 1.1 |

The licenses identify the Instrument Sans Project Authors, Instrument Serif Project Authors and IBM Corp. respectively. Retain those license files with redistributed font assets. Do not imply ownership of the font families. The component registry contains font-family declarations and system fallbacks; it does not install font packages or copy font binaries into a consumer application.

The application dependency versions are pinned in `package.json` and resolved in `package-lock.json`. Dependency packages retain their own licenses; this document does not relicense them.

## Reference mechanisms

| Reference | Adopted mechanism | Boundary |
|---|---|---|
| [shadcn registry specification](https://ui.shadcn.com/docs/registry/registry-item-json) | Source payload, files and consumer target aliases | No upstream component implementation copied by this kit |
| [shadcn registry setup](https://ui.shadcn.com/docs/registry/getting-started) | Local HTTP JSON distribution | Public availability and fresh CLI installation need separate verification |
| [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) | Behavioral benchmark and production reuse recommendation | Radix is not a dependency of this reference kit |
| [Motion accessibility](https://motion.dev/docs/react-accessibility) | Meaning-preserving reduced-motion approach | Motion is not a dependency; no premium assets included |
| [DTCG Format 2025.10](https://www.designtokens.org/TR/2025.10/format/) | Typed token exchange conventions | Community specification, not a W3C Standard; complete conformance not claimed |

Official shadcn, Radix Primitives and Motion repository licenses were inspected during research and use MIT terms. That finding supports future reuse subject to retaining applicable notices; it does not place original Starlight work under MIT. When adding copied source later, record its repository, immutable revision, path, license and modifications.

Internal selected guidance: Starlight Living Design 0.1.2; Starlight Design Intelligence 0.1.1 SIS identity/motion and integration contracts; Starlight Excellence 0.2.1; Starlight Marketing Skills 1.2.1 product-marketing and free-tool guidance. These informed this implementation and do not establish hosted capabilities, automatic synchronization or market validation.

## Evidence labels

“Implemented” means source exists. “Built” requires a successful build of its exact revision. “Browser tested” identifies a viewport and exercised state. “Installed” requires a fresh consuming project. “Deployed” requires an observed remote release. “Adopted” requires an owning product to use it. “Customer validated” requires actual customer evidence. A screenshot, source archive or local component test cannot stand in for the later states.

---
name: image-to-threejs
description: "Use for an image-led interactive Three.js scene, procedural object reconstruction, pixel relief or a 3D visual study. Choose between two pinned implementations and report fidelity, missing dependencies and actual rendered verification."
---

# Image to Three.js

The screenshot's label “Image 23.js” does not uniquely identify a repository.
Two independently sourced implementations are bundled. Choose by the requested
result, never imply they are the same project.

| Result | Read | Limits |
| --- | --- | --- |
| Pixel-grid colored relief | `../../vendor/image/SKILL.md` | Image samples become simple meshes; this does not reconstruct hidden geometry |
| Procedural object or character | `../../vendor/img2threejs/SKILL.md` | Code-built, staged approximation; single-view evidence cannot prove unseen geometry |

Inspect the actual input image, confirm its intended use and rights, choose a
mode and state the fidelity target. For recurring brand characters, apply
`../../playbooks/character-canon-retrieval.md` and inspect approved references
before changing identity. A 3D effect is justified only by the surface's job.

For relief, use the full bundled viewer template. The upstream template pins
Three.js 0.160.0 on a CDN; production projects should use their own pinned local
dependency and CSP. For reconstruction, retain the staged forge/next.py state
loop, quality contract, sculpt spec and pass-by-pass visual comparison.
Resolve scripts from `<plugin-root>/vendor/img2threejs`, keep output/state in
the owning project and load grimoire/docs only at their stage. Python 3.10+
stdlib covers the forge; rendered output still requires Three.js and a browser.

## Dependency boundaries

- The pinned procedural base references
  `runtime/scripts/export_mesh_geometry.mjs`, which is absent upstream. Do not
  claim a mesh export or runtime test relying on it. Resolve that integration
  in the owning product before using the affected path.
- Domain harnesses, animated-character plugins and the separate showcase
  runtime are not bundled. Do not silently downgrade a requested profile.
- Do not run the upstream installer, create cross-host symlinks or edit Claude
  permissions as an incidental effect of creating a scene.

Deliver editable code, the exact dependency versions, inspected reference/
render pairs, interaction and performance observations, static fallback and
reduced-motion behavior. Use real captures at the shipped viewport. Label
unrendered work, approximate geometry and unsupported exports explicitly.

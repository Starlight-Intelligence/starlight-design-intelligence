---
name: google-flow-multimodal-studio
description: Orchestrates Google Flow (`flow.google.com`) via BrowserOS Neo alongside native image generation, 30-point visual QA, Cloudflare R2 `vis-media` manifests, and cross-brand domain visual placement.
---

# Google Flow Multimodal Studio

Use this skill to plan, generate, score, derive, and stage multi-brand visual and video assets across **Google Flow** (`flow.google.com`), Antigravity native image tools, and **Visual Intelligence OS** (`visual-intelligence`).

## Workflow

1. **Read Brand and Canon Authority First**:
   - Load `brand-packs/<brand>/{BRAND,DESIGN,COPY,NARRATIVE}.md` and `brand-image-system/runtime/brands/<brand>/brand-pack.json`.
   - Enforce locked canon (`CANON_LOCKED.md` for Arcanea; `AKASHI`/`KAGE`/`MIRA` boundaries for AnimeLegends; **Text / Tradition / Visualization** provenance for Sacred Visions).
2. **Stills-First and Credit Discipline**:
   - Generate base stills, character turnarounds, and clean book/pack plates with included native image tools before spending video credits.
   - Inside Google Flow Agent settings, pin batch count to `x1` and keep `Confirm before generating` explicit unless running an audited batch. Track every run in `credit-ledger.json` and enforce the session cap.
3. **Flow Browser Steering Rules**:
   - Use **BrowserOS Neo** in the user's signed-in profile. Leave user tabs intact.
   - Keep `evaluate_in_page` scripts synchronous and concise (`settle: false`, JSON string return) when reading DOM state in heavy SPA tabs.
4. **Deterministic Typography and Crops**:
   - Never bake headlines, prices, terminal text, or scripture citations into generated pixels.
   - Compile multi-ratio crops (`16:9`, `1200x630` OG, `1:1`, `4:5`, `9:16`) and crisp SVG/HTML text overlays downstream via `visual-intelligence`.
5. **Visual QA and R2 DAM Registration**:
   - Inspect rendered pixels and video keyframes directly; score on the 30-point `visual-qa-gate` (`>=26` PASS, `22-25` ITERATE, `<22` REJECT).
   - Emit `.vis.provenance.json` sidecars and map passing assets to Cloudflare R2 `vis-media` keys (`masters/<sha>` and `renditions/<sha>.<kind>.webp`) and Google Drive review packs.
6. **Human Gates**:
   - Never execute Higgsfield generation without an approved `/hf-plan`.
   - Stage public website updates on draft PRs and route social campaigns through `#social-approvals`.

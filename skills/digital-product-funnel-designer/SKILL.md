---
name: digital-product-funnel-designer
description: Use when designing, writing, packaging, or auditing digital products, skill packs, templates, lead magnets, diagnostic quizzes, pricing ladders, and conversion funnels using Refero MCP style/screen/flow research and Starlight editorial gates.
---

# Digital Product & Funnel Designer

Use this skill whenever an agent builds or upgrades a digital product page, lead magnet, interactive assessment, pricing ladder, bundle comparison, or downloadable pack experience across the portfolio.

## Required Companion Sources

1. `playbooks/refero-funnel-atlas.md` for the 7 Refero-backed conversion funnel archetypes and 6 Brand-World Reference Locks.
2. `playbooks/lead-magnets-and-products-design/INDEX.md` (and its 4 volume specs) for per-product visual tokens, SVG plate direction, and file-tree inspector contracts.
3. `playbooks/lead-magnets-and-products-design/LANGUAGE-AND-COPY-SYSTEM.md` + `brand-packs/frankx/COPY.md` for mechanism-first copy and `scripts/check-frankx-voice.mjs` mechanical verification.
4. Live `refero` MCP tools (`refero_search_styles`, `refero_get_style`, `refero_search_screens`, `refero_get_screen`, `refero_search_flows`, `refero_get_flow`) whenever designing a new surface or variant.

## Six-Step Execution Protocol

### 1. Lock the Brand World & Funnel Archetype First
- Resolve the owning `brand-packs/<brand>/DESIGN.md` contract first; Refero references inform layout, flow, and interaction mechanics and never override an approved brand pack.
- Never average multiple visual references into a warm-cream or purple-gradient middle.
- Pick **one** Primary Style & Structural Reference from `playbooks/refero-funnel-atlas.md` (`Linear Changelog` for Agentic Income, `Warp` for FrankX Flagship, `GenCreator Territory B` `#fbf9f5`/`#221f1b`/`#c8322a` paired with `Craftwork` light-desk structure for GenCreator surfaces, `Elektron` for Vibe OS, `Sequel` for Literary/Chronicles, `19-86` or `Krea` for Starlight Substrate).
- Borrow at most two bounded interaction details (such as `Cycle` two-pane preview `618b2107`, `Polaroid` 4-step fit-check `Flow 9471`, `Amie` split tier selector `548f5d54`, or `Contra` savings readout `4d16a81a`).

### 2. Enforce "Inspect Before You Buy" Transparency
- Every digital pack, vault, or template must display an inspectable file manifest (real filenames, kilobyte sizes, file count, and inline 20-to-35 line file preview) above or adjacent to the conversion action.
- Never hide a digital product behind a generic 3D book box and five vague bullet points.

### 3. Build Value-First Lead Magnets With Contextual Bridges
- Keep lead-magnet forms to a single `email` text field; capture segmentation (`stack`, `goal`, `price band`) through 1-click diagnostic cards or URL intent params.
- Deliver immediate on-screen value on completion (computed Week-1 checklist, local config audit table, or instant `.zip` download) plus **one** relevant paid-pack bridge.

### 4. Craft Code-Exact Visual Plates
- Use razor-sharp SVG architecture schematics, real component renders, or provenance-registered background plates with HTML/SVG code overlays for all labels and metrics.
- Never ship garbled bitmap text, emoji bullets, `border-left: 4px` callout stripes, or stock laptop mockups.

### 5. Pass the Mechanical & Human Editorial Gates
- Keep all badges, tabs, and buttons in **sentence case**.
- Run `node scripts/check-frankx-voice.mjs` on FrankX-branded copy: zero em-dashes, zero earnings promises, zero unattributed forecasts, zero contrast formulas, and zero hype verbs.
- Include an explicit `"Who should skip this"` honesty block near pricing decisions.

### 6. Respect Doctrine 0 (Fail Closed on Money)
- Stage Polar product slugs, `DemandSignal` event capture, `.zip` manifests, and delivery routes cleanly on an isolated `agent/<harness>/<scope>` branch.
- Never flip `for sale` checkout switches live, alter live pricing, or trigger external email sends without named human approval.

## Output Checklist

Return:
1. Selected Brand World + Refero Reference Lock (Style UUID, Screen/Flow IDs, explicit rejects).
2. Funnel Archetype + step-by-step state flow (`DemandSignal` payload included).
3. Pack file-tree manifest + bespoke SVG/visual plate specification.
4. Voice-linted copy deck (headline, 120-word opener, sentence-case CTAs, boundary note).
5. Verification receipt (`validate-kernel`, voice lint, responsive + reduced-motion + `:focus-visible` checks).

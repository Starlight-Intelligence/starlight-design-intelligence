# Core Digital Products & Bundles: Complete `DESIGN.md` Specifications (`L1` & `L2`)

> Covers all **13 Self-Serve Digital Packs, Tripwires, Core Blueprints, Bundles & Monthly Continuity Offers (`USD 19` -> `USD 129`)**.
> Every paid product page MUST include: (1) a literal mechanism-first hero, (2) a bespoke code-exact SVG schematic plate, (3) an interactive **Two-Pane File-Tree Inspector** (`Refero Screen 618b2107`), (4) explicit "Who should skip this" honesty, and (5) Doctrine-0 fail-closed checkout/waitlist gating.

---

## Shared Component Contract: The Two-Pane Pack Inspector

Adapted from **Cycle Template Modal (`618b2107`)**, **Convex (`d500b995`)**, and **Warp (`40a9c295`)**:

```text
+-----------------------------------------------------------------------------------+
| PACK MANIFEST · 6 FILES · 48.2 KB · SHA-256 VERIFIED               [Copy tree]    |
+----------------------------------+------------------------------------------------+
| 00-README.md              4.1 KB | # 01 · Offer & Price-Band Architecture         |
| > 01-offer-spec.md       11.4 KB |                                                |
| 02-funnel-wireframe.md    9.8 KB | Start with one artifact a builder can finish   |
| 03-claims-checklist.md    6.2 KB | in a single weekend. Define three facts:       |
| schemas/signal.json       3.4 KB | 1. Exact input state before installation       |
| scripts/verify-pack.mjs  13.3 KB | 2. Deterministic file output after run         |
|                                  | 3. Verification command that proves completion |
|                                  | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
|                                  | Previewing lines 1-24 of 186 · MIT / Commercial|
+----------------------------------+------------------------------------------------+
```

- **Accessibility & Interaction:** Left file list uses `role="tablist"` (`aria-orientation="vertical"` on desktop, horizontal scrollable pill strip on `<768px` mobile), `:focus-visible` `2px` high-contrast ring, `ArrowUp`/`ArrowDown` keyboard traversal, and `150ms` opacity crossfade (`0ms` when `prefers-reduced-motion: reduce`).

---

## P-01 · Aurora Glass & Dark-Mode UI Kit (`aurora-ui-kit` · `USD 19`)

- **Reference Lock:** **Endlesstools** (`6589ccdf-044a-46f7-b458-724c63806a4f`) primary + **Linear Changelog** (`11d3e58a`) frosted border recipe.
- **Tokens:** Canvas `#080808`, Surface `#1e1e1e`, Hairline `rgba(255,255,255,0.08)`, Text `#ffffff` / `#959595`, CTA `#b8ff45` (`#080808` ink).
- **Deliverable Tree:** `tokens/aurora-tokens.css`, `tailwind.preset.js`, `components/{SurfaceCard,CommandBar,MetricStrip,ComparisonTable,InspectorTabs}.tsx`, `docs/contrast-verification.md` (WCAG AA contrast table for every dark surface).
- **SVG Plate (`plate-aurora-ui-kit.svg`):** Precision wireframe layer stack (`z-0` canvas `#080808`, `z-10` surface `#141516`, `z-20` elevated control bar with `1px` specular top edge and token callout leader lines).

---

## P-02 · Vibe OS Session & Release Pack (`vibe-os-pack` · `USD 24`)

- **Reference Lock:** **Elektron** (`362d9644-ce48-40af-8c2a-35753ec54b5e`) primary + **Ableton Push** (`Screen c293f913` edition spec layout).
- **Tokens:** Canvas `#000000`, Panel `#151515`, Deep Graphite `#222222`, Text `#eeeef2`, Amber Indicator `#ffcc00`.
- **Deliverable Tree:** `00-SESSION-PROTOCOL.md`, `prompts/genre-rigs-25.md`, `templates/stem-folder-taxonomy.json`, `checklists/release-metadata-qc.md`, `scripts/catalog-row.mjs`.
- **SVG Plate (`plate-vibe-os-pack.svg`):** Studio signal-chain schematic (`PROMPT RIG -> SUNO V4 TAKE -> STEM SPLIT -> MASTER QC -> RELEASE LEDGER`) with `#ffcc00` BPM/LUFS telemetry badges.

---

## P-03 · Suno v4 Prompt & Lyric Architecture Library (`suno-prompt-library` · `USD 27`)

- **Reference Lock:** **Elektron** (`362d9644`) primary + **Suno** (`9844e7bf` `#f7f4ef` warm lyric cards + `#fd429c` primary action pill).
- **Deliverable Tree:** `200+` tested style prompts across 8 sonic lanes (`Ambient Focus`, `Cinematic Orchestral`, `Melodic House`, `Neo-Soul`, `Synthwave`, `Acoustic Indie`, `Lo-Fi Study`, ` Percussive Trailer`), `lyric-scaffolds/metatag-dictionary.md`, `troubleshooting/muddy-vocal-fixes.md`.
- **Hero Pattern:** Interactive 4-genre switcher in the first viewport displaying real full-length prompt syntax + resulting arrangement map before purchase.

---

## P-04 · Claims Guard Editorial & Compliance Pack (`claims-guard-pack` · `USD 39`)

- **Reference Lock:** **Linear Changelog** (`11d3e58a`) primary + **Supabase** (`28aeb534` `#3ecf8e` pass indicator) + **Teal** (`Flow 2718` audit table).
- **Deliverable Tree:** `rules/claims-lint-rules.json` (earnings claims, unattributed forecasts, em-dashes, contrast formulas, missing affiliate disclosures), `scripts/check-copy-claims.mjs`, `blocks/ftc-eu-disclosure-snippets.md`, `checklists/public-release-signoff.md`, `.github/workflows/copy-gate.yml`.
- **SVG Plate (`plate-claims-guard.svg`):** Diff-gate diagram showing raw inflated draft lines on the left, deterministic rule filter in the center, and verified green receipt output (`0 errors · 0 unverified claims`) on the right.

---

## P-05 · Creative AI Builder Toolkit (`creative-ai-toolkit` · `USD 47`)

- **Reference Lock:** **Craftwork** (`6d71e1ea-d306-4a0b-b9ab-64454cfac0cd`) for light specimen cards inside **Warp** (`40a9c295`) dark host shell (`#121212` outer, crisp `#1e1e1d` modular grid, `#cafc00` / `#10b981` role-locked primary CTA).
- **Deliverable Tree:** `workflows/research-to-essay.md`, `workflows/spec-to-component.md`, `workflows/visual-brief-packet.md`, `prompts/100-structured-prompts.json`, `rubrics/anti-slop-self-check.md`.

---

## P-06 · InfoGenius Technical Diagram & Prompt Pack (`infogenius-pro` · `USD 49`)

- **Reference Lock:** **Eraser** (`66b9ff99-f7f2-480c-97e9-42718e49cb97`) primary (`#181818` Obsidian, `#e3e3e3` Steel Gray, `#9985ff` tag-outline-only role, `JetBrains Mono` labels).
- **Deliverable Tree:** `packets/architecture-isometric.md`, `packets/data-flow-schematic.md`, `packets/code-overlay-svg-hybrid.md`, `svg-frames/metric-callout-primitives.svg`, `qa/30-point-visual-scorecard.md`.
- **Anti-Slop Highlight:** Explicitly teaches the hybrid rule: generate clean background plates without text, then composite crisp HTML/SVG typography and metrics in code so zero garbled AI lettering ever ships.

---

## P-07 · Income Architecture Blueprint v2 (`blueprint` · `USD 67` · O2 Flagship Pack)

- **Reference Lock:** **Linear Changelog** (`11d3e58a`) primary + **Convex** (`d500b995` syntax-highlighted workbench) + **Amie** (`548f5d54` value breakdown rail).
- **Deliverable Tree (Verified against existing `agenticincome/products/blueprint/`):**
  - `00-README.md` ( Execution order & weekend sprint schedule)
  - `AGENTIC_INCOME_BLUEPRINT.md` (Master system architecture & unit economics)
  - `product-kit.md` (Digital pack scoping, packaging, pricing bands & Polar staging)
  - `service-kit.md` (Scoped technical audit & implementation sprint boundaries)
  - `system-kit.md` (Multi-agent routing, DemandSignal telemetry & verification gates)
- **SVG Plate (`plate-blueprint.svg`):** Three-lane blueprint schematic (`KIT 01 · PRODUCT` + `KIT 02 · SERVICE` + `KIT 03 · SYSTEM`) converging into a single verified receipt ledger (`SHA-256` + `DemandSignal` + `Fail-Closed Money Gate`).

---

## P-08 · Solo Founder Dutch BV Operations Kit (`bv-kit` · `USD 79`)

- **Reference Lock:** **19-86** (`7a8c99db-5ce7-4fa4-b491-8f1fcac18991`) architectural clarity (`1px` tabular checklists, exact statutory cadence tables, zero hype).
- **Deliverable Tree:** `calendar/annual-bv-compliance-cadence.md` (BTW quarterly, ICP, VPB, jaarrekening, UBO, DGA gebruikelijk loon notes), `templates/holding-operating-intercompany-checklist.md`, `templates/invoice-and-vat-reverse-charge-spec.md`, `DISCLAIMER.md` (explicit operational-template boundary: founder study notes, never legal or tax advice).

---

## P-09 · Multi-Harness System Architect Kit (`system-architect-kit` · `USD 97`)

- **Reference Lock:** **Warp** (`40a9c295`) primary + **Supabase** (`28aeb534`) layered graphite surfaces.
- **Deliverable Tree:** `harnesses/{claude,codex,grok,opencode,antigravity}-adapter-spec.md`, `sidecars/zero-secret-mcp-stdio-bridge.mjs`, `lanes/cross-harness-lane-lock.mjs`, `schemas/repo-profile.v2.schema.json`.

---

## P-10 · Agentic Content & Editorial Pipeline (`agentic-content-engine` · `USD 97`)

- **Reference Lock:** **Warp** (`40a9c295`) primary + **19-86** (`7a8c99db`) editorial table structure.
- **Deliverable Tree:** `stages/01-research-brief.md`, `stages/02-first-120-words-contract.md`, `stages/03-voice-linter.mjs`, `stages/04-svg-diagram-spec.md`, `stages/05-distribution-staging.md`.

---

## P-11 · Agentic Business OS Pack Bundle (`abos-pack-bundle` · `USD 99`)

- **Reference Lock:** **Linear Changelog** (`11d3e58a`) + **Amie** (`548f5d54` side-by-side bundle math).
- **Transparent Math:** Combines all **4 Agentic Business OS skill packs** (`Claims Guard` + `Business Intelligence` + `Design Contract` + `Weekly Rhythm`, plus `registry.json` and `PRODUCT-BUNDLE.md` from `frankxai/agentic-business-os`) in one packaged archive for `USD 99`, saving against buying four standalone `USD 39` packs (`USD 156` separate total, saving `USD 57` shown as exact dollar arithmetic rather than inflated percentages).

---

## P-12 · Agent Team Pro Harness & Loop Contracts (`agent-team-pro` · `USD 129`)

- **Reference Lock:** **Linear Changelog** (`11d3e58a`) + **Supabase** (`28aeb534` `#3ecf8e` verifier gate).
- **Deliverable Tree:** `.loop/example-contract/{LOOP,GATE,WORKER,VERIFIER}.md`, `constitutions/{maker,independent-verifier,coordinator}.md`, `scripts/verify-receipt.mjs`, `evals/promptfoo-regression-starter.yaml`.
- **SVG Plate (`plate-agent-team-pro.svg`):** Directed DAG topology (`MAKER WORKTREE -> ARTIFACT + TESTS -> INDEPENDENT VERIFIER -> HUMAN MONEY GATE -> TERMINAL RECEIPT`).

---

## P-13 · Private Operator Brief (`private-intel` · `USD 19/mo`)

- **Reference Lock:** **Linear Changelog** (`11d3e58a`) + **19-86** (`7a8c99db` dated issue index).
- **Deliverable Format:** One dated monthly Markdown + PDF dossier (`YYYY-MM-BRIEF.md`, grounded in `agenticincome/products/private-intel/2026-06-BRIEF.md`) containing: (1) what shipped across the estate that month with real commit/test metrics, (2) one complete funnel or harness tear-down, (3) exact tool stack changes (kept, cut, and cost delta), and (4) one copy-pasteable skill or script.

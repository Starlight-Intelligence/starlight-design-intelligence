# Google Flow Multimodal Production OS (November 2026 Frontier)

This operating system connects **Google Flow** (`flow.google.com`), **BrowserOS Neo**, **Antigravity Native Nano Banana / Gemini Image Generation**, **VIS 3.0**, **Cloudflare R2 (`vis-media`)**, **Google Drive**, **Figma**, **Notion**, **n8n**, **GitHub**, and **Vercel** into one governed creative factory.

## 1. Live November 2026 Capabilities Observed in Google Flow

Inspection of the signed-in **Google AI Ultra** Flow workspace (`flow.google.com`, verified 2026-11-16) confirms the following live production capabilities:

1. **Flow Agent + Direct Project Modes**:
   - Project sidebar: `All media`, `Characters`, `Scenes`, `Library` (`Create collection`), `Tools` (`Create tool` custom reusable spaces), and `Bin`.
   - Agent defaults inside each project:
     - **Confirm before generating**: `Always` (recommended governance default so credits never fire blindly) or `Never`.
     - **Image generation**: **Nano Banana 2.1**, ratios `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, batch `x1`..`x4`.
     - **Video generation**: **Omni 1.2 Flash** (faster character and scene consistency with fewer jump cuts) and Veo 3.1 variants, ratios `16:9` and `9:16`, batch `x1`..`x4`.
2. **Ultra Credit Discipline (Doctrine 0 Applied)**:
   - Default batch count inside Flow MUST be set to **`x1`** during agent exploration (avoids 4x accidental burn).
   - Generate high-volume initial visual stills, book plates, and character turnarounds in Antigravity native `image-generator` first (zero Flow credit burn).
   - Promote only **`>= 26/30` KEEP start-frames** into Flow's `Characters` / `Add ingredients` slot for Omni 1.2 Flash or Veo 3.1 video animation.
   - Maintain a per-run `credit-ledger.json` and enforce a hard stop well inside the session cap (`<= 2,500` credits buffer under any `3,000` overnight cap).

## 2. Canonical Flow Workspace and Space Taxonomy

Organize Flow into dedicated named projects so Ingredients and Characters never bleed across brands:

1. **`Starlight | Horizon & Material Lab`**: Obsidian, porcelain, 18px optical glass, coastal observatories (`Horizon` and `Cultural` modes).
2. **`Arcanea | Guardians & Living Realms`**: Guardian sheets + `STAGING`/`OPEN` Godbeast & companion forms (`Aiyami & Sol [STAGING]`, `Lyria & Yumiko [OPEN]`, `Draconia & Draconis [STAGING]`, `Alera & Otome [STAGING]`, `Stellaris [STAGING]`) and Gate portals.
3. **`AnimeLegends | Studio, Atlas & Forge`**: `AKASHI`, `KAGE`, `MIRA` turnarounds, sakuga keyframes, `16:9` / `9:16` action cuts.
4. **`GenCreator | Publishing Editions`**: Oak workbench loops, creator studio scenes, monograph unboxings.
5. **`FrankX | Physical Systems & Books`**: Tactile modular fiber hardware, *The Golden Age of Intelligence*, *The Wordless Laws*.
6. **`Agentic Income | Precision Machinery`**: Swiss mechanical/optical relay metaphors, clean process loops.
7. **`Sacred Visions | Illuminated Archive`**: Chiaroscuro manuscript studies, *Visions in Motion* `9:16` cathedral pans.
8. **`Portfolio Labs | Reality Architect & VibeClubs`**: Geometric sundials and nocturnal hi-fi listening rooms.

## 3. Six-Stage E2E Asset Lifecycle

Every visual, character sheet, SVG mark, and video clip flows through one deterministic state machine tracked by `visual-intelligence` (`core/vis-lifecycle.mjs`):

1. **`planned`**: Brief, target domain route, Funnel Archetype (1 to 7), aspect ratio, and brand pack pinned.
2. **`created`**: Raw master written locally (`<jobRoot>/<brand>/raw/` or `/flow/`), SHA-256 computed, `.vis.provenance.json` written.
3. **`edited`**: Multi-ratio crops (`16:9`, `1200x630` OG, `1:1`, `1080x1350`, `9:16`), WebP compression (`640w`, `1280w`, `1920w`), deterministic SVG/HTML typography overlays, and static reduced-motion video posters built.
4. **`qa_scored`**: Inspected visually and scored on the 30-point `visual-qa-gate` rubric (`>=26` PASS, `22-25` ITERATE, `<22` REJECT).
5. **`ready_for_publish`**: Rights verified (`generated-owned`), R2 `vis-media` object keys planned (`masters/<sha>` + `renditions/<sha>.<kind>.webp`), Google Drive mirror synced, and `#social-approvals` packet staged.
6. **`placed`**: `usedIn[]` records exact `{ domain, route, component, channel, commitSha, placedAt }`.

## 4. Multi-Harness, Cloud, and Workflow Stack Roles

| Layer | Canonical owner | Responsibility |
|---|---|---|
| **Strategy, Brand Packs, Canon** | GitHub (`starlight-design-intelligence`, `arcanea-ai-app`) | Brand tokens, typography specs, locked character canon, editorial rules, SVG marks |
| **Asset Graph & Lifecycle DAM** | `visual-intelligence` (`vis.sqlite`) + Cloudflare R2 (`vis-media`) | Content-addressed masters, HMAC-signed previews, multi-ratio derivatives, provenance |
| **Browser Steering & Flow Studio** | Antigravity + BrowserOS Neo (`flow.google.com`) | Session-isolated steering, Ingredients upload, Omni 1.2 / Veo generation, master download |
| **Cross-Harness Engineering** | Claude Code, Codex, Grok, Antigravity | Maker != Checker independent PR review (`tools/pr-gate.mjs`), code overlays, Next.js integration |
| **Design Token & Layout Workbench** | Figma (`Starlight Brand OS`, `First light`) + v0 | Editable Auto Layout templates, Variables synced from `export:brand`, component-to-code maps |
| **Working Masters & Human Review** | Google Drive (`Starlight Creative Vault`) | Raw archives (`SL-B001..B003`), review decks, human inspection packages (never prod CDN) |
| **Catalog Projection & Automation** | Notion (`Portfolio Brand Hubs`) + n8n + Slack (`#social-approvals`) | Read-only status projections, scheduled VIS audits, human-gated publish queues |
| **Public Web Delivery** | Vercel + Next.js Image + `DemandSignal` KV | High-speed edge delivery, static reduced-motion fallbacks, honest waitlist/Polar doors |

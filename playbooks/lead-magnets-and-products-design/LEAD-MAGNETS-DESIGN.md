# Lead Magnets: Complete `DESIGN.md` Specifications (`L0` Portfolio)

> Covers all **8 planned Lead Magnets** across `agenticincome`, `frankx.ai`, and `starlight`.
> Every lead magnet must deliver immediate, inspectable utility in under 60 seconds, record a clean `DemandSignal` event, and present a contextual single-pack bridge on the delivery screen without dark patterns.

---

## Global Lead Magnet Rules

1. **Zero gated fluff:** Show a real preview (sample prompt, 25-line checklist excerpt, or interactive diagnostic score) *before* asking for an email address.
2. **Single-input friction ceiling:** Never ask for First Name, Company Name, Phone Number, or Role in a text form. Collect segment intent through **1-click visual step pills** (Refero Polaroid `Flow 9471`) or URL intent query params (`?intent=<slug>`), plus a single `email` input.
3. **Immediate checksummed artifact on `/delivery/<slug>`:** Every opt-in resolves immediately to an on-page download or interactive result alongside email delivery, eliminating "waiting for inbox" drop-off.
4. **Contextual single bridge:** Each delivery screen surfaces **one** logical paid next step (`USD 19` to `USD 67`), never a 12-card catalog dump.

---

## LM-01 · 60-Second Operator Fit-Check (`operator-fit-check`)

### Reference Lock
- **Primary Style:** **Linear Changelog** (`11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6`)
- **Borrowed Details:** **Polaroid Quiz** (`Flow 9471` 4-step card progression) + **Contra Calculator** (`Screen 4d16a81a` quantified time/cost delta header) + **Supabase** (`28aeb534` `#3ecf8e` active state)
- **Explicit Rejects:** Multi-page Typeform iframe, spinning wheel-of-fortune popups, arbitrary percentage loaders (`"Analyzing 847 data points..."`).

### Token Commitments
```css
:root {
  --lm-fit-canvas: #08090a;
  --lm-fit-surface: #141516;
  --lm-fit-elevated: #1c1c1f;
  --lm-fit-border: #23252a;
  --lm-fit-border-active: #3ecf8e;
  --lm-fit-text: #f7f8f8;
  --lm-fit-muted: #8a8f98;
  --lm-fit-accent: #3ecf8e;
  --lm-fit-radius-shell: 12px;
  --lm-fit-radius-option: 8px;
  --lm-fit-radius-pill: 9999px;
}
```

### Viewport & State Anatomy
1. **Header Strip (`48px` height):** Step counter in `JetBrains Mono` (`STEP 01 / 04`), segmented 4-bar progress rail (`2px` height, `#23252a` track, `#3ecf8e` completed bars), keyboard hint (`Press 1-4 or Tab`).
2. **Question Body:** Single sentence question (`22px` `Inter` weight `500`, `-0.02em`), 4 selectable option rows (`min-height: 56px` mobile / `64px` desktop, `1px solid #23252a`, active `1px solid #3ecf8e` + `rgba(62, 207, 142, 0.06)` fill). Each option has a `JetBrains Mono` keycap badge (`[1]`, `[2]`, `[3]`, `[4]`), a crisp title, and a 1-line concrete sublabel.
3. **Result Console (`Step 5`):**
   - **Top Split Readout (Contra `4d16a81a` adaptation):** Left metric cell = `WEEK-1 BUILD SCOPE` (exact artifact to ship by Friday); Right metric cell = `ESTIMATED SETUP SAVED` (`6-9 hrs of boilerplate wiring`).
   - **Generated 5-Step Week-1 Checklist:** Rendered immediately on screen with copy-to-Markdown button.
   - **Primary Capture + Bridge:** Email input to receive the free `starter-kit.zip` + personalized checklist, paired with a quiet secondary card showing the single highest-fit paid pack (`Blueprint USD 67`, `Claims Guard USD 39`, `Vibe OS USD 24`, or `Agent Team Pro USD 129`) and its exact match rationale.

---

## LM-02 · Income Flywheel Starter Kit (`starter-kit`)

### Reference Lock
- **Primary Style:** **Linear Changelog** (`11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6`)
- **Borrowed Details:** **Mural Guide Hero** (`Screen aca74dc4` 7:5 specimen + capture split) + **Cycle Two-Pane Preview** (`Screen 618b2107`)
- **Explicit Rejects:** 3D tilted paperback mockups, "Get Rich With Agents" headline language, fake strike-through `"Valued at USD 297!"` anchors.

### Included Artifact Manifest (Shown in UI)
- `00-START-HERE.md` (15-minute setup sequence)
- `01-offer-narrowing-sheet.md` (1-page buyer, problem, artifact, and price-band worksheet)
- `02-first-skill-template/SKILL.md` (lint-clean starter skill with YAML frontmatter)
- `03-pre-ship-verification.md` (12-check release gate before publishing a page)
- `manifest.json` (byte sizes + SHA-256 checksums)

### Visual Plate Specification (`plate-starter-kit.svg`, `640x360` `16:9`)
- Dark `#08090a` frame with `1px #23252a` border, subtle `24px` dot matrix at `4%` white opacity.
- Three connected schematic nodes (`01 OFFER SPEC` -> `02 SKILL ARTIFACT` -> `03 VERIFIED DOOR`) rendered in `1px #34343a` strokes with `#3ecf8e` terminal node pulse and monospace file annotations.
- Paid Bridge on `/delivery/starter-kit`: **Income Architecture Blueprint (`USD 67`)**.

---

## LM-03 · The Creator's Soulbook Obsidian Vault (`soulbook-vault`)

### Reference Lock
- **Primary Style:** **Sequel** (`50c47480-9451-420b-a372-eb42eda75e56`)
- **Borrowed Details:** **OHZI** (`7524da9c` `#111111` hairline gallery frame) + **Mural** (`aca74dc4` two-column specimen)
- **Tokens:** Canvas `#000000`, Surface `#161616`, Border `#2a2a2a`, Primary Text `#ffffff`, Warm Paper Accent `#f5f5f0`, Muted `#999999`, Editorial Serif (`Newsreader` / `Georgia` fallback, weight `400`, `-0.015em`) + `Inter` UI + `JetBrains Mono` wiki-style note links (`01-North-Star.md`).
- **Visual Plate (`plate-soulbook-vault.svg`):** Constellation node-graph of 7 linked Markdown vaults (`Daily Practice`, `Voice Calibration`, `Energy Ledger`, `Project Canon`, `Weekly Retro`, `Drafting Desk`, `Archive`) with clean `1px` silver-gray link lines (`#444444`) and warm `#f5f5f0` focal node.
- **Paid Bridge:** **Creation Chronicles (`USD 497` cohort dossier)** or **Creative AI Toolkit (`USD 47`)**.

---

## LM-04 · 5 Tested Suno v4 Prompts & Stem Notes (`five-suno-prompts`)

### Reference Lock
- **Primary Style:** **Elektron** (`362d9644-ce48-40af-8c2a-35753ec54b5e`)
- **Borrowed Details:** **Suno** (`9844e7bf` `#f7f4ef` warm prompt text + `#fd429c` play accent) + **ElevenMusic** (`Flow 12577` studio upgrade gate)
- **Tokens:** Canvas `#000000`, Control Panel `#151515`, Input `#222222`, Text `#eeeef2`, Amber LED `#ffcc00` (BPM/Key tags), Play Pill `#fd429c`.
- **Viewport Anatomy:** Displays Prompt `#01` in full (`Style string`, `Arrangement section metatags for Intro and Drop`, `BPM 124`, `Key F#m`, and why the phrasing avoids muddy vocals). Prompts `#02-#05` + stem naming template download immediately on email submit.
- **Visual Plate (`plate-suno-sample.svg`):** Hardware-inspired 16-step sequencer grid (`4x4` pads in `#151515` with `#333337` borders, 3 lit `#ffcc00` step LEDs, waveform envelope line, and monospace parameter bar).
- **Paid Bridge:** **Vibe OS Pack (`USD 24`)** and **Suno Prompt Library (`USD 27`)**.

---

## LM-05 · 50 Builder Prompts & Evaluation Checklist (`prompt-quick-ref`)

### Reference Lock
- **Primary Style:** **Warp** (`40a9c295-7a6f-48b3-ae15-2c4d171cf8fb`)
- **Borrowed Details:** **Cycle** (`618b2107` left category rail + right live prompt inspector)
- **Tokens:** Canvas `#121212`, Surface `#1e1e1d`, Raised `#353534`, Text `#faf9f6`, Muted `#868684`, CTA `#10b981`.
- **Viewport Anatomy:** Filterable 5-category sample viewer (`Architecture`, `Refactoring`, `Editorial Critique`, `Research Synthesis`, `Test Generation`) showing 5 prompts live with 1-click `Copy prompt`, plus single-input capture for the full 50-prompt Markdown + JSON bundle.
- **Paid Bridge:** **Creative AI Toolkit (`USD 47`)** or **System Architect Starter Kit (`USD 97`)**.

---

## LM-06 · MCP Config Doctor & Zero-Secret Bridge (`mcp-doctor-audit`)

### Reference Lock
- **Primary Style:** **Krea** (`3a63b3fa-dc79-4dc3-935e-3f8f4ab447a7`) *(dark telemetry)*
- **Borrowed Details:** **Teal Analysis Walkthrough** (`Flow 2718` line-level pass/fail readout) + **19-86** (`7a8c99db` 1px tabular discipline)
- **Tokens:** Void `#000000`, Coal `#171717`, Iron `#262626`, White `#ffffff`, Ash `#a3a3a3`, Pass `#3ecf8e`, Fail `#ef4444`.
- **Interactive Mechanism:** Client-side static config checker (`100% browser-local; zero network upload`) that inspects observable JSON/TOML config properties (hardcoded `Authorization: Bearer ...` tokens, positional `$<digit>` substitution hazards, Windows path-quoting bugs, and missing timeouts), marks live daemon environment freshness as unverified in-browser (pairing with a local CLI check for running processes), and offers the zero-dependency stdio bridge starter script download.
- **Paid Bridge:** **System Architect Starter Kit (`USD 97`)** or **Agent Team Pro (`USD 129`)**.

---

## LM-07 · The Golden Age of Intelligence: Reader Edition (`golden-age-book`)

### Reference Lock
- **Primary Style:** **Sequel** (`50c47480-9451-420b-a372-eb42eda75e56`)
- **Borrowed Details:** **19-86** (`7a8c99db` chapter index table with 1px horizontal rules and reading-time numerals)
- **Tokens:** Canvas `#0a0a0b`, Elevated `#141416`, Text `#f5f5f0`, Secondary `#b3b3b3`, CTA `#f5f5f0` solid button with `#000000` ink.
- **Viewport Anatomy:** Full online reading access (`USD 0`) with chapter table, estimated reading minutes per essay, and optional email dispatch for the offline EPUB/Markdown annotated edition.
- **Paid Bridge:** **Income Architecture Blueprint (`USD 67`)** or **Agentic Creator OS (`USD 297`)**.

---

## LM-08 · Starlight Architecture Specimen & Proof Ledger (`starlight-signal`)

### Reference Lock
- **Primary Style:** **19-86** (`7a8c99db-5ce7-4fa4-b491-8f1fcac18991`)
- **Tokens:** Pure White `#ffffff` canvas, Obsidian Black `#000000` 1px borders and typography, Slate Gray `#595959` metadata (`7.0:1` contrast on `#ffffff`, passing WCAG AA and AAA). Zero shadows, zero gradients, `0px` to `2px` sharp architectural corners.
- **Viewport Anatomy:** Printable / downloadable 8-page architectural specification specimen showing how memory vaults, lane locks, voice linters, and verification gates connect across multi-agent repos.
- **Paid Bridge:** **Agentic Architecture Field Guide (`USD 147`)**.

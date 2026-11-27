# Figma, Google Flow, Cloudflare R2, Google Drive, Notion, and n8n Interconnect

This specification wires design authoring, generative production, digital asset management, and production web delivery without violating single-authority boundaries (`agentic-ops/registry/architecture_decisions.yaml`).

## 1. Authority Split (Never Duplicate State)

- **GitHub (`starlight-design-intelligence`)**: Authoritative source for brand tokens, editorial rules, SVG marks, and release evidence.
- **Figma (`NjinIfFcg35onCEhvbOp9f` Brand OS, `m2wi20fAoCgFOKGXkJJGAm` First Light)**: Editable component and token workbench populated via `npm run export:brand`. Figma holds layout frames and typography specimens, not raw product truth or unverified copy.
- **Google Flow (`flow.google.com`)**: Generative studio for character ingredients, Nano Banana 2.1 / Imagen plates, and Omni 1.2 Flash / Veo 3.1 motion sequences.
- **Cloudflare R2 (`workers/vis-media`)**: Canonical immutable media lake storing `masters/<prefix>/<sha256>` and `renditions/<prefix>/<sha256>.<kind>.webp` with HMAC-signed preview URLs and zero egress fees.
- **Google Drive (`Starlight Creative Vault`)**: Human review repository holding original high-res PNG/MP4 masters (including `SL-B001-noble-machines-original.png`, `SL-B002-living-glasshouse-original.png`, `SL-B003-prismatic-tide-original.png`) and visual contact sheets. Drive URLs never serve production websites.
- **Vercel (`next/image`)**: Public web rendering plane serving approved, immutable `>=26/30` renditions alongside SVG overlays and static reduced-motion video posters.
- **Notion (`Portfolio Brand Hubs`) + n8n**: Human-readable operational projection and webhook scheduler triggering weekly `vis audit --json` health digests and `#social-approvals` review packets.

## 2. Automated Data Flow

1. **Brand Token Handoff (`Git -> Figma & Flow`)**:
   - Run `node scripts/export-brand-handoff.mjs --brand <id> --out <dir>` to emit `manifest.json` + `adapter-plan.json` with SHA-256 hashes of all brand docs and palettes.
   - Inject exact hex palettes and mood descriptors from the handoff bundle into Flow Space prompt templates and Figma Variables collections.
2. **Generation & Provenance Capture (`Flow / Native -> VIS 3.0`)**:
   - Raw outputs land in `$STARLIGHT_ASSET_ROOT/jobs/<jobId>/<brand>/{raw,flow}/`.
   - Each file receives a `.vis.provenance.json` sidecar capturing model, prompt hash, ingredients, Flow project URL, and credit delta.
3. **Derivative & Overlay Compilation (`VIS -> Edits -> QA`)**:
   - Deterministic `sharp` + SVG compiler slices `16:9` hero, `1200x630` OG, `1:1` square, `4:5` carousel, `9:16` story/reel, and responsive `640w/1280w/1920w` WebP renditions.
   - Code renders all exact headlines, domain tags, and **Text / Tradition / Visualization** captions over clean art plates.
4. **R2 + Drive + Vercel Sync (`QA >= 26/30 -> Ready`)**:
   - Passing assets enter `vis-media` R2 manifest (`core/vis-r2-dam-plan.mjs`) and copy cleanly to target repo `public/assets/<brand>/` or Vercel Image CDN upon human-approved PR merge.
5. **n8n + Notion + Slack Notification Loop**:
   - n8n runs `vis report --json` on a bounded schedule, updates the read-only Notion Brand Asset Ledger via Notion API, and posts ready-for-publish contact sheets into `#social-approvals` for Frank's 1-click greenlight.

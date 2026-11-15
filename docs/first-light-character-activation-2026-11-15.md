# First Light: character, product and media activation
Date: 15 November 2026. Status: implementation proposal grounded in inspected sources; no production release or final rename.
Owner: Frank Riemer. Continues design issues #86/#87, Living Design work #62/#69/#73, and website issues #116/#261. Reconcile current PR heads before implementation; do not build a second registry.

## Decision
First Light and page 04 Character studio are preferred creative references per Frank's current instruction. Noble Machines and Living Glasshouse both belong in the development program. Earlier blanket demotion of robot characters must not override this direction. Preference for a direction does not equate to selection of every face, name or asset.

The existing cast must earn recurring roles in useful experiences. A character introduces a task, helps someone understand a decision, and leads to an inspectable artifact. Preserve the site's successful scenes, cards and Academy lessons while correcting specific defects.

## Evidence and limits
- Website source inspected at f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab: lib/home-visuals.ts, public/brand/identity.json and Astra avatar provenance. Code search is default-branch evidence, not deployment evidence.
- First Light Figma: inspected page inventory; visually reviewed front door 8:2, original cast 5:10, art-direction board 17:103, glass board 107:165. Page 04 is 2:4; material templates are on page 15, 107:89. Private exact file and archive pointers remain in the existing VIS Source Kit.
- Original cast board presents Queen, Pip, Rook and Vela as concept names. It has distinct tall/compact/broad silhouettes, porcelain shells, brass joints and readable luminous eyes. Preserve these attributes in development; do not merge with Mini Frank/Nilo/Brio/Riff.
- Glass board contains placeholder character frames and a candidate lens mark with a placeholder star. Light text on white panels visibly needs contrast repair. This is not the official liquid-glass logo receipt.
- Public homepage, collective and Academy text retrieved. Homepage retains preview/recorded/in-development distinctions. Academy features Sophia, Lin, Verity and Aegis with additional teaching names. Full browser, mobile and interactive validation remains pending.
- Vercel main-site project lookup returned latest deployment BLOCKED. This does not establish that production is down or identify the current serving production SHA.
- Cloudflare zone and eight R2 buckets were listed. Media private/public/archive buckets exist. No object checksums, uploads, delivery linkage or credits consumption were verified.
- Existing Drive kit records original archives, V2 editions and transfer gaps. Metadata discovery is not proof that all binaries were read or hashed.
- Frank identifies an existing official liquid-glass logo. Exact master binding remains unresolved. Preserve it; do not replace it with the Figma placeholder or generate a substitute.
- Astra's reported eye defect has not yet been independently diagnosed at full-resolution source and live crop. Do not claim it fixed.

## Source ownership
| Concern | Authority | Projection |
|---|---|---|
| Character identity and lineage | Existing VIS/character registry with immutable IDs and exact source hashes | Figma, website cards, content |
| Original media | Existing original source archive; preserve original bytes | Figma previews and optimized R2 delivery |
| Design behavior | This repository's brand-packs/sis and owning product contract | Site tokens and Figma variables |
| Implemented product | Owning GitHub repository at recorded commit | Rendered preview |
| Serving behavior | Actual domain, deployment and commit receipt | Capture manifest |
| Editorial delivery | Existing content/asset relationships and approved publication job | Distribution destinations |

No new asset database, executive system or scheduling controller.

## PRD 1: durable character identity and names
### Problem
The website mixes identity, role and display aliases. Forge points to Rivet; Archivist points to Mira. Astra is used for a branded orchestrator while model identifiers also contain astra. Sol and other names occur in different identity namespaces. Model releases must not rename owned characters.

### Contract
Extend the existing registry with character_id, display_name, prior_names, role_id, visual_family, edition_id, source_asset_id, source_sha256, identity_status, approved_usage, model_binding and change_reason. Reuse fields already present. Character IDs and profile URLs remain stable across a display-name change. Model/provider/harness metadata is separate and can change without changing the character.

| Current usage | Immediate proposal | Required review |
|---|---|---|
| Forge / Rivet | Display Rivet with Builder role | Verify all aliases, links and narrative captions |
| Archivist / Mira | Display Mira with Memory role | Distinguish Academy Mira by namespace |
| Astra | Keep existing ID; open name and portrait review | Recover rename history and compare actual master/crop |
| Atlas, Nova, Sol | Portfolio collision review | Avoid automatic mass replacement |
| Queen, Pip, Rook, Vela | Preserve First Light concept lineage | Do not silently equate Queen with Astra or other Queen editions |
| Mini Frank, Nilo, Brio, Riff | Preserve recovered owned identities | Never remap to model vendors |

Naming criteria: memorable when spoken, distinct in silhouette and sound, grounded in character purpose, stable across providers, clear across portfolio and languages. Search portfolio and external conflicts before proposing a final shortlist. Avoid generic cosmic/forge naming as the default. No fresh name is declared cleared by this document.

### Astra repair packet
Trace three assets separately: original portrait, 512 avatar crop, and instrument scene used by the homepage. Avatar sidecar references portrait SHA-256 91ba2443d97e74a3e6413b118201449bf692a0f8ba2f134d175a08eea145598b and output e8665f5a2806038d94fddadd8d7d1b72e9974ed2d8cae7e0a763428689e37f95. Verify bytes before editing.
Compare eyes at native size and 32/48/96/256 px with circle and rectangle masks. Determine source geometry versus lighting versus crop artifact. Produce one conservative eye correction and one comparison crop from the exact master, preserving face, body and material. Keep original immutable. Replace every dependent derivative only after the corrected edition is selected.

### Acceptance
All rendered labels resolve to one character and role; aliases remain navigable; provider changes leave names untouched; no cross-brand identity conflation; native and small-size visual checks pass. Test alias lookup and stable URLs. Rename and portrait decisions are separate.

## PRD 2: First Light, glass and product reconciliation
### Preserve
Front-door composition and warm promise; existing hero worlds and value cards; distinct cast silhouettes; Academy's practical teaching journeys. Capture the actual site before any broad redesign.

### Surface inventory
Capture homepage, collective, one founding agent dossier, houses, team planner, one mission, Memory Studio, Academy home, faculty and a complete lesson. Record URL, final URL, capture time, viewport, route state, repo/commit when verified, deployment ID, image hashes and Figma node. Use 390 and 1440 px plus keyboard/reduced-motion states for interactive work. Keep proposed First Light screens distinct from current-product captures.

### Materials
Noble Machines: porcelain, brushed brass, readable eyes, purposeful instruments.
Living Glasshouse: botanical environments, living companions, warm daylight and tactile workspaces; use original source lineage.
Liquid glass: navigation or temporary controls where it reveals layering; keep dense copy/evidence on stable surfaces. Preserve the exact approved mark geometry. Recover official flat/vector and glass application before linking them. One coherent recipe, opaque fallback, reduced transparency, finite motion and no nested blur.
Academy: preserve its lighter reading mode and named teaching identities; do not apply the lab palette indiscriminately.

### Implementation slices
1. Capture and bind strongest current screens to source; reuse existing Figma components.
2. Correct character-card labels and avatar crop after PRD 1 selection.
3. Fix glass-board contrast and replace placeholders only with resolved source assets.
4. Select three characters with the best complete source coverage and add three useful placements each.
5. Resolve existing panorama import issue #261; verify whether already completed before duplicating imports.

### Acceptance
No placeholder presented as a master. Text >=4.5:1 normal and >=3:1 large; visible keyboard focus; readable no-motion/no-transparency states; primary action usable before large media. Measure LCP/INP/CLS and bytes against actual baseline; field targets 2.5s/200ms/0.1 are targets, not measured results. Each changed route gets a before/after and preview-to-commit receipt. Production promotion requires existing release checks.

## PRD 3: recurring character-led content
### Editorial unit
One real useful task, one recognizable cast interaction, one artifact the audience can inspect. Art establishes recognition; the artifact establishes trust. Never imply a rendered character is a running agent.

### Four repeatable series
| Series | Story | Proof | Action |
|---|---|---|---|
| First Light field notes | A brief becomes a useful piece of work | Actual source-linked artifact | Inspect or adapt it |
| Inside the living glasshouse | How a team remembers and reuses knowledge | Real retrieval/export demonstration | Try the method |
| Meet the craft | One character's role and limitation | Role card plus worked example | Open profile or exercise |
| Academy decisions | A plausible answer meets contradictory evidence | Existing synthetic lesson packet | Make the decision |

Use the existing series names descriptively; this is not a new product naming exercise.

### First production batch
1. First Light 30-second film: 0–5s shared workshop and one question; 5–13s source found; 13–22s artifact constructed; 22–27s review; 27–30s actual destination. Art and product capture remain visibly distinguishable.
2. Six-slide carousel: goal, source, proposed action, human decision, finished artifact, reusable method.
3. Three character cards: exact portrait, name, one job, limitation, useful next action.
4. Academy 45-second lesson: claim, evidence gap, viewer choice, reference answer, lesson link.
5. Founder note: why these characters exist and what their demonstrated work can do today.

Each approved story produces a 16:9 master, 9:16 cut, 4:5 post, still, transcript, alt text and editable layout as applicable. Recompose, do not blindly crop. Assign separate render budgets before expensive jobs.

### Commercial path
Free field note -> practical exercise or reusable sample -> relevant existing toolkit/workshop/offer. Verify fulfillment and checkout before stating availability or prices. Starlight owns the systems story; FrankX supplies founder interpretation; GenCreator packages media; Arcanea retains separate fiction canon. Do not duplicate a SKU across brands.

### Metrics
Track useful-action clicks, exercise starts/completions, artifact downloads, qualified offer visits and purchases when instrumentation exists. Character utilization = approved placed assets / approved eligible assets, with explicit denominator. No invented conversion or revenue target result.

## Execution sequence and handoff
Proposed windows, not scheduled workers:
- Days 1–2: source bindings, official logo recovery, deployment identity and full-resolution Astra comparison.
- Days 3–5: naming proposal, three selected character packets, source-linked current-site captures.
- Days 6–9: first content batch and one collective-page preview.
- Days 10–14: independent review, release through existing gates, measure first useful actions and iterate.

Responsibility: design-intelligence owns art direction and review packet; product repositories own code; existing VIS owns source lineage; existing media workflow owns render/distribution jobs; Frank owns final identity decisions. These assignments are proposed responsibilities, not claims that workers have started.

Delivery receipt per item: source IDs and actual hashes, editable source, preview, exact change, checks run, outstanding gates, approver, destination, measured result and rollback. Revert bounded source changes; preserve old asset versions and aliases.

## Validation of this proposal
Read-only provider/source checks and four Figma visual inspections completed. Full estate inventory, live browser capture, asset-byte verification, naming-history analysis, independent review, production deployment and media publication remain open. No runtime code changed; runtime tests are not applicable to this document.


## Build-ready design reconciliation — 15 November 2026

This dated section supersedes unresolved observations above where later source inspection and Figma changes have supplied evidence. It is a design and implementation handoff, not a production release.

### Implemented design work

- Reused the existing 58-icon page and material/headline/language/web/funnel build kit.
- Replaced the drawn desktop-header mark with an editable instance of the exact owned public/brand/starlight-star.svg. Preserved its four-point geometry, center and companion dot.
- Replaced 14 hand-built responsive headers with one compact component. Bound all four previously unstyled responsive headlines to text styles.
- Added six agentic application families with 24 state variants: Mission contract, Evidence lens, Canon comparator, Branch comparison, Approval contract and Continuity dock. Queued, stop-requested and uncertain failure are explicit.
- Added an editable review composition and content proposals for web, Chrome side panel, Apple mobile, Android, macOS and Windows. These are content/layout contracts; native app shells are not implemented by this Figma work.
- Recovered the two owned cast sheets and confirmed their bytes match the existing source SHA-256 records. Original sources remain distinct from derivatives and from runtime role/model bindings.

The earlier character-repair pass restored30 placements across First Light and the Queen/conductor folios. Exact private Figma and source pointers remain in the existing source kit and review index.

### Source authority and real component mapping

The current web repository is Starlight-Intelligence/starlightintelligence.ai, inspected at f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab. Its private @starlight/ui package already exports AgentCard, AgentAvatar, ApprovalCard, ArtifactCard, RunGraph, ChatStream, BrowserWorkspacePanel, MediaFrame and StatusChip. Extend those primitives and the owning product routes; do not create a parallel UI package or runtime.

Identity comes from public/brand/identity.json. Generated tokens remain generated by packages/ui/scripts/build-tokens.mjs. The owned mark is a flat vector identity; glass is a material application of the same path, not a separate approved identity master.

Figma First Light uses Starlight collections. RC0.2 remains experimental: eight bound nodes were observed on the activation page, with no RC bindings on the other17 inspected pages. Removal requires a dependency/migration review. The standalone preview scopes its projection tokens so it cannot override production CSS.

Figma140/220/360ms map to lib/motion/tokens.ts hover/state/route. Other Figma durations, distances, stagger and easing curves remain proposals; current application choreography is preserved. Actual type is Instrument Sans, Instrument Serif italic and IBM Plex Mono.

ApprovalCard correspondence is proposed, not a published Code Connect mapping. Its existing backend status vocabulary is pending/approved/rejected; the design's Changed presentation wraps a digest mismatch and must not be inserted as a new backend enum without contract work.

### Platform and material contract

Use native navigation and material APIs on Apple, Compose Material3 adaptive patterns on Android, native Windows materials with solid/high-contrast fallback, and an explicit-invocation Chrome MV3 side panel. The same task, evidence and approval records move between surfaces. A service worker is not the durable owner of a job.

Official Apple kits were discoverable but component import was denied in this environment. Reference links are provided; no native import or Apple-resource redistribution is claimed. Glass belongs on appropriate navigation/control layers; stable reading and evidence surfaces retain legibility. The web treatment is original CSS, not Apple's rendering engine.

The application funnel begins with a public useful sample, then a bounded goal, required source authorization, first artifact, review/export, continuity and a verified paid-capacity need. Private sources require identity and permission before retrieval. No speculative catalogue count, price, “zero hallucination” guarantee or60fps result becomes a marketing claim.

### Architecture reconciliation

The accepted registry architecture_media_fabric_v3 in frankxai/agentic-ops at af34ad7523a57c025214a9dc91c61497c369408f supersedes v2: R2 canonical binary/media custody; Vercel Image delivery; Supabase/Postgres metadata, rights and approval; Drive working masters and evidence. Existing Blob renditions remain valid. The web AGENTS and command ARCHITECTURE-STACK projections still contain stale v2 language and need separate source reconciliation; no migration was performed.

### Validation and release boundary

Figma structure, variable/style reuse and representative rendered compositions were checked. Review caught and repaired horizontal-row clipping and a portrait aspect-ratio defect. The prototype and implementation bundle remain draft materials. Repository runtime tests, end-to-end provider execution, native app builds, production performance, cross-provider product-code review and deployment are separate acceptance work. No social publishing or autonomous worker enablement occurred.

Implementation order: bind exact source/identity -> adapt existing @starlight/ui -> implement artifact/digest/checkpoint contracts -> verify browser/mobile/accessibility and uncertain-outcome recovery -> different-provider review -> preview receipt tied to commit -> approved production promotion.

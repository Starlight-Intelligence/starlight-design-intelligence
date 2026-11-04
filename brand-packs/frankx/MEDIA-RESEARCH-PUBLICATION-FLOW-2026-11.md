# FrankX — Media, Research & Publication Flow
**Status:** proposed workflow overlay, NOT an implemented connector or new source of truth. **Date:** 2026-11-02.

## Respect existing owners
- `frankxai/agentic-ops` main: portfolio routing, product/release state, storage ADRs, approval boundaries.
- `brand-packs/frankx/{COPY,DESIGN,SURFACE_MODES}.md`: reviewed copy and experience rules.
- FrankX website: live content, SEO implementation, `lib/voice/frankx-voice.ts`, homepage preservation contract, actual site routes.
- Notion: human campaign cockpit and the existing editorial calendar, Assets database, commissions and review states.
- Google Drive: private originals, source records, creative handoffs and recovery documents.
- Shared metadata registry: rights, provenance, versions, usage, revocation (actual live status must be checked before treating as deployed).
- Vercel Blob/Image: reviewed default for delivery assets; Cloudflare R2 only where a reviewed workload exception or existing binding is justified.
- The pending `agentic-ops` media release-contract PR remains a review candidate, not a live publisher.

## Input boundary: one upload, one record
Use the current private FrankX Content Studio **Raw Inbox**, not a freshly invented drive forest. A curator may find existing media in older FrankX campaign archives; index by source file ID and checksum, never duplicate or overwrite originals to normalize.

For each file:
1. **Receive:** original file, source URL/Drive ID, uploader, content source timestamp, MIME, size; hash bytes where authorized.
2. **Classify:** person/portrait, documentary proof, product UI, creative story, audio/music, research source, other. Do not identify unknown faces automatically or infer relationships.
3. **Rights:** original creator, third parties shown, consent, license, permitted channel, expiry, audience, sensitive/private flag.
4. **Semantic metadata:** title, useful description, format, dimensions, aspect ratio, topics, brands, accurate image/video transcript; inferred tags clearly marked.
5. **Relationships:** parent master, rendition, linked campaign, canonical article, character reference version, publication receipt.
6. **Review:** human grants *publication* approval for the exact rendition and message; *character reference* approval alone is insufficient.
7. **Distribution:** create optimized rendition only after rights check; write channel-specific asset links to existing Notion calendar. No whole-drive public mirror.
8. **Revoke:** remove from retrieval/public delivery on revocation; preserve compliant audit/rollback evidence, not public access.

Example metadata fields:
```json
{
  "asset_id": "fx-media-example-001",
  "source_provider": "google_drive",
  "source_file_id": "example-only-not-a-real-file",
  "sha256": null,
  "kind": "portrait",
  "subject_label": "Frank Riemer (user-provided label)",
  "privacy": "private",
  "rights_state": "review_required",
  "reference_state": "candidate",
  "publication_state": "not_approved",
  "approved_channels": [],
  "campaign_ids": [],
  "source_recorded_at": "2026-11-02",
  "inferred_tags": []
}
```

## Notion content calendar: minimum edition contract
Use the **existing** calendar and Assets relations. Each edition records `idea`, `audience`, `evidence source`, `claim status`, `canonical URL`, `author`, `asset ID/version`, `rights/consent`, `channel`, `exact copy`, `reviewer`, `approval`, `scheduled date`, `public URL`, `publication receipt`, `metrics`, and `revision`.

Suggested states: **seed → researched → draft → reviewed → approved → scheduled → published → measured**. An item with unknown proof is not "approved" because the calendar date arrived. Do not automatically reschedule historical editions. Use the existing database properties rather than creating a duplicate schema.

## Marketing motions by audience
| Reader and offer | Trust-building content | Proof | Best next action |
| --- | --- | --- | --- |
| AI founder/executive | decisions, architectural tradeoffs, quantified case when available | demo, ADR, actual test and risk | scoped architecture review/workshop |
| Individual creator | real creative outcome, before-after sequence, tools with cost | original work plus workflow files | free kit then self-serve product |
| Curious professional | explainers with bounded expert insight | sources, working example | newsletter / workshop |
| Collaborative builder | interview, public contribution, event report | consent, own project link | meet, submit a project, co-create |
| Research/AI lab reader | reproducible comparisons, literature maps, limitation notes | official references, methodology, code and results | reproduce experiment / contribute |
| Agentic Income reader | business-model breakdown, cost/time and funnel test | paid result only when independently evidenced | run test, compare economics |
| Private friend or family | personal history, music, selective photos | direct authorization | private invite, no sales CTA |

No invented customers, independent validation, revenue, lab partnerships or published research. Separate **thought experiment**, **literature synthesis**, **reproducible experiment**, **pilot**, **live revenue**, **external replication**.

## Research and frontier technology discipline
Every significant lab/model article names:
- exact model/version and source date, official lab source URL;
- tested use case and environment, if actually tested;
- observable benchmark, artifacts, failure cases and comparable baseline, if actually measured;
- conflicts, limitations and which data/claims remain unknown;
- commercial/affiliate relationship, if any;
- owner of interpretation and editor approval.

Research sciences beyond AI require the same source/uncertainty discipline; label speculative philosophy clearly and do not imply established scientific consensus where there is none.

## Independent creator economics: evidence ladder
`hypothesis → cost model → implementation → actual transaction test → gross receipts → net contribution → repeatability → third-party reproduction`. Each stage has its own receipt and caveat. Success marketing may reference only the highest stage actually verified, with dates and attribution. No earnings guarantees or artificial social proof.

## Publish and measure
Canonical essay belongs to one owned site. LinkedIn adapts judgment; video demonstrates practice; newsletter adds relationship/context; community posts invite useful participation. Cross-link with tagged URLs and explicit offers; avoid identical syndicated article copies.

Capture post ID, source version, actual reach, saves, qualified replies, verified lead events, trial activation and attributable revenue when the measurement system supplies them. Separate `unknown` from `0`. Spend less time optimizing vanity impressions than evaluating accepted reader action.

## First vertical slice acceptance
One approved raw upload → checksum + rights record → private preview → asset referenced in an existing Notion calendar item → permission-filtered retrieval by one agent → draft derivative with version bound → verified reviewer approval → *optional* authorized publication with real provider receipt. Test duplicate upload, revocation, missing source, wrong account and changed edition. No "automated studio" claim before the full path is exercised.

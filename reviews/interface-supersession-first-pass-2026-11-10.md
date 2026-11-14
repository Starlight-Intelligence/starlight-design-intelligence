# Starlight interface supersession — first comparative selection packet
Status: **proposed, not owner-approved** · 2026-11-10
Tracking: existing [design #86](https://github.com/Starlight-Intelligence/starlight-design-intelligence/issues/86), [#87](https://github.com/Starlight-Intelligence/starlight-design-intelligence/issues/87), [VIS #71](https://github.com/frankxai/visual-intelligence/issues/71).

## Non-negotiable distinction
A Figma node's presence proves editable structure, not visual excellence or approval. Existing Estate Canvas functionality is source-documented, not a verified rendered design. This packet is a comparative *triage*, not a final selection or permission to delete.

## Proposed survival policy
- **Keep source-linked identity and existing reusable component variants** as strongest candidates, pending visual comparison and exact code mapping.
- **Refine existing desktop/mobile product screens**; verify live UX and accessibility before promotion.
- **Compare connected experience** against the real Starlight app; choose the stronger interaction model, not the newer file.
- **Demote the new 20-frame Experience Atlas and purple Founder Cockpit to exploration**. Preserve useful taxonomy; do not publish as the brand master.
- **Retain Estate Canvas as an operational implementation**; redesign only where screenshot-based usability tests justify it.
- **Hold all Queen and character promotion** until exact VIS asset version, rights and owner selection are established.

## Additional layers missing from prior reviews
1. **Information architecture:** one user journey and task outcome per screen; source-to-screen route graph, not vanity dashboards.
2. **Interaction and state semantics:** loading/partial/streaming/error/offline/permission denied/approval required/undo.
3. **Design tokens and accessibility:** approved colors/typography/contrast, WCAG 2.2 AA, reduced motion, 200% zoom, keyboard, 44px touch targets where applicable.
4. **Component fidelity:** map Figma variants to actual `@starlight/ui` exports; no parallel component implementation.
5. **Trust and evidence:** claim/source/receipt status, explicit stale/unknown states, no simulated production telemetry.
6. **Performance and device reality:** 375/768/1440, low-memory desktop, touch and multi-display modes.
7. **Brand and character canon:** VIS provenance, rights, usage scopes, expression and size tests.
8. **Commercial UX:** entitlement visibility, credit estimates, cancellation, refunds and permissions; no dark patterns.
9. **Lifecycle:** versioned supersedes relation, source hash, rollback, archived-but-retrievable rejected experiments.
10. **Agent design governance:** retrieval priority approved masters > review candidates > explorations; require pairwise proof and independent review.

## Review and release gate
Each row in `interface-supersession-candidates.v0.json` requires before approval: exact screenshot or original asset inspection; before/after comparison; Figma node and production component; approved tokens; keyboard/mobile tests; evidence of actual implementation; owner selection; rollback. No bulk rename/delete/migration or automatic merge.

## Current delivery risk
Product PR [#328](https://github.com/Starlight-Intelligence/starlightintelligence.ai/pull/328) remains a draft and the latest inspected CI failed. Design approval cannot stand in for build/release proof.

## Next executable slice
Take **one** current product screen and its 375px variant from the existing product atlas; retrieve actual screenshots, compare against current deployed UI and `@starlight/ui`; produce two evidence-backed refinements in Figma; independently review; implement the winner in a bounded PR. Repeat only after a proven quality delta.

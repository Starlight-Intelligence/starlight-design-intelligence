# Component and interaction contracts

Status: proposed adaptation. Retain @starlight/ui as web/extension component owner. Share semantic data and token roles with native, not DOM implementations or literal CSS pixels.

## Reuse map

| Component | Reuse | Required specification |
| --- | --- | --- |
| WorkspaceShell / Navigation | New app composition around current routes | Persistent project identity, skip link, one main landmark, responsive rail/drawer/bottom bar; focus restored on close |
| AgentCard / StarCard | Existing web AgentCard; new outcome composition | Stable agentId; name, job/outcome, required inputs, output, truthful availability; configure and invoke are separate actions; 44px CTA; portrait never carries status |
| WorkflowCard / PlanReview | New WorkflowCard composition + existing mission brief and console behavior | Schema-owned required inputs, output preview, permissions and cap; card selection never executes; review immutable plan version before Run |
| DraftComposer | Existing extension Composer + candidate TextField | 16px minimum; desktop Enter sends, Shift+Enter newline and IME respected; mobile Return newline with explicit Send; keep draft until accepted; Stop means request, not confirmed cancellation |
| ModelPicker / ModelIdentity | Adapt candidate native ModelSelector | Catalog from authenticated server; provider, model, eligibility, data/cost implications; separate requested route and actual executed model; fallback needs explicit policy; unavailable and unknown states |
| RunView / RunTimeline | Existing reducer, RunGraph, ChatStream | One state projection; timeline default on narrow screens, graph advanced; polite step announcements, never each token; connection freshness independent of execution |
| EvidenceAnchor / SourceInspector | Existing ArtifactCard and EvidenceDisclosure | Claim anchor → source locator, excerpt, retrieval/publication dates, version/hash if available, permission and limits; external opens safe scheme with clear destination |
| ApprovalCard / ApprovalDetail | Existing web authoritative component, not local candidate authority | Actor, destination, full data/files, action revision, scope hash, expiry, cap; explicit Approve and Decline; idempotent submission, receipt and execution result distinct |
| MemoryPermissionEditor | Existing editor + candidate Tabs/Toggle/DataTable | Personal/project/team scope, author and provenance; mutation summary; optimistic UI never claims access enforcement; server handles isolation and revocation |
| UsageMeter / PlanChangeSummary | UsageDisplay behavior | Current entitlement, period and measured timestamp; reserved versus settled; unknown is not zero; one-time PricingCard and local CheckoutSummary do not model subscriptions |
| CaptureCard / VoiceCapture | Existing selected text and PageAccess; new native adapter | Exact origin/selection/destination; local, queued and synced states; payload preview; captureId survives retries; recording/transcription permissions and retention explicit |
| Skeleton / EmptyState / InlineError | Candidate primitives adapted | Geometry matches expected content; no fake percent; contextual next action; preserve last good work and offer same-operation retry only when safe |

## State and truth discipline

Availability describes the product capability (live/preview/recorded/blueprint/unavailable). Execution describes a run. Connection describes transport. Save describes persistence. Approval describes a decision. Never merge these into a single green dot. Existing run/approval enums do not yet express the proposed extended states.

Examples: `Recorded example · no new calls`; `Disconnected · run status unconfirmed · last update 14:32`; `Saved on this device`; `Queued · not yet saved to project`; `Scope changed · review again`; `Decision recorded · execution not confirmed`. Labels appear adjacent to the affected work, not as a repeated wall of disclaimers.

Every list needs initial loading, initial empty, filtered empty, stale last-good data and retryable/final failure. Every mutation needs idle, submitting, confirmed, rejected/conflict and unknown outcome. Approval requires full-scope loading, pending, submitting, resolved, expired and changed-scope states. Offline never produces an approval success.

## Interaction and motion

| Interaction | Behavior | Motion / reduced equivalent |
| --- | --- | --- |
| Open inspector | Trigger stays selected; reading scroll retained; Escape closes overlay; return focus | 220ms opacity + 8px shift; 0ms direct change when reduced |
| Send draft | Lock only active send controls; preserve editable recovery snapshot; announce acceptance once | 120ms local feedback; no transcript reflow animation |
| Run step changes | Keep selected step stable; do not force scroll while user reads | Short opacity on new row; direct update when reduced |
| Approval arrives | Activity count and contextual card, no blocking takeover of typing | One 400ms border emphasis, deduplicated by approvalId; static border when reduced |
| Capture accepted | Receipt and Open in workspace; queue failures remain actionable | 120ms confirmation; direct text change when reduced |
| Voice recording | Persistent text timer, pause/stop and screen reader state | Optional low-cost level meter; static recording indicator when reduced |

No autoplay video, cursor trails, animated blur/shadows or infinite decorative pulses in the workbench. Optional glass belongs to chrome, at most two visible non-nested backdrops; body copy, sources and approval scope are opaque. Use solid surfaces when effects are unsupported or reduced transparency is requested. Mobile operating-system preferences also apply.

## Accessibility and touch acceptance

- Preserve native controls and headings; use a dialog only for genuinely modal work, with focus containment, Escape and restoration. Source inspection is a route on mobile, not a trapped nested sheet.
- Text contrast at least 4.5:1; large text and essential non-text controls at least 3:1. Subtle hairlines cannot be the only field boundary. Proposed token values require contrast verification on final composited surfaces.
- Target WCAG 2.2 AA including keyboard, focus visibility/not obscured, reflow, target spacing and status messaging. Use 44px web/iOS targets and 48dp Android as product policy; logical px/dp/pt are different units.
- Inputs are at least 16px on web; allow zoom. Test 200% text zoom and 320 CSS px without two-dimensional reading scroll. Tables can scroll with named region and keyboard access when genuinely tabular.
- `role=log` wraps the native message list instead of replacing list semantics. Announce new completed messages or coarse step summaries, rate-limit status announcements and keep a reviewable history.
- Use server object IDs plus useId for repeated component DOM associations. Do not derive unique DOM IDs solely from a Star's display name.
- Status has text/icon, not only color. Forced colors uses Canvas/CanvasText/Highlight and visible outlines. Loading state has accessible name and no shimmer requirement.
- No swipe-only approval, hover-only source affordance, auto-dismissed actionable error, countdown-only expiry or notification approval. Screen reader copy includes destination and exact action.
- Test NVDA/Firefox, VoiceOver/Safari and TalkBack/Chrome with real journeys. Test browser keyboard, hardware-keyboard tablet, touch, interrupted voice, OS permission denial and native font scaling.

## Cross-platform design contract

Use the existing run/event reducer as the source, then project into platform-neutral view models. `view-models.proposal.ts` names proposed additions without asserting endpoints or server enforcement. Web/extension render via @starlight/ui; native maps tokens to platform units, font scaling, safe area, navigation and controls. Chrome tab permissions remain Chrome-specific. Voice recording/share sheet, background limits and secure local queue remain native-specific. Backend service, auth and entitlement truth must remain common; do not create UI-local substitutes.

Deep links contain stable IDs, not bearer authority or sensitive source text. On open, authenticate, resolve tenant, fetch latest revision and enforce object access before displaying or deciding. Push notifications contain a minimal project/action summary and open review. Server rejects stale, expired, cross-tenant, duplicate-conflicting or changed-scope decisions.

## Performance and release budget

These are proposed acceptance budgets, not measurements: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on representative devices/network; instrument the authenticated workbench separately from the cinematic home page. No hero film in the app shell. Lazy-load graph/code editor/source PDF renderer; keep capture and approval routes usable without them. Retain font license/provenance and subset/preload only used weights. Virtualized histories must preserve find, keyboard and assistive-tech access.

Before release, capture actual 375/768/1440 states and 320px reflow; run meaningful end-to-end journeys with reconnect, duplicate events, interrupted save, sign-out, cross-tenant denial, permission revocation, stale approval, quota exhaustion and unknown outcome. Run axe and Lighthouse plus manual AT/touch checks. Bind each result to deployment and exact head SHA. Static boards and token calculations cannot pass this gate.

## Primary standards checked on 13 November 2026

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [Core Web Vitals](https://web.dev/articles/vitals): field targets at the 75th percentile, segmented by mobile and desktop. Lab diagnostics are separate.

These sources establish the chosen acceptance criteria; they do not establish application conformance.

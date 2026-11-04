# Landing page PRD

Extends `_intelligence/templates/page-spec.template.md`. The page spec says what the page contains. This PRD says what must be true for it to ship, as checks a reviewer can run. A criterion with no check is a wish, so cut it or write the check.

Status of thresholds: Core Web Vitals "good" values are Google's published thresholds. Everything marked `[PROPOSED]` is a starting bar until Frank rules on it.

Author: <harness> · Date: <YYYY-MM-DD> · Revision: <n> · Review state: draft

## 0. Identity

- Product id (row in `graph/products.graph.json`, no row means no page):
- Route and brand pack:
- Buyer, in one sentence, including what they use today and what it costs them:
- Page type: waitlist (no fresh gate PASS) or checkout (fresh `PRODUCT-RELEASE-GATE` PASS receipt linked)

## 1. Bar to beat

Three current references, opened this week, each with URL, read date and the single dimension this page must beat it on. "Comparable" fails. Copy `mustBeat[]` from the registry row and give each item a beat / not-beat verdict at review time.

| Reference | URL | Read | Dimension | Verdict |
|---|---|---|---|---|

## 2. First viewport (one screen, one job)

State in one line each, on a 375 px phone: what this is, who it is for, the one action, and the one trust signal. If a line needs a second sentence, the page is not ready. Write the actual headline and CTA label here, in the buyer's words.

Check: attach a 375 px screenshot taken without scrolling. A reviewer who has not read this PRD names the offer and the action from the screenshot alone. If the CTA or trust signal is below the fold, it fails.

## 3. Flow

An ordered list. Each section names the question the buyer is asking at that point and the evidence that answers it. A section with no evidence is deleted, not softened.

| # | Buyer's question | Section | Exact supporting passage or measurement | Reviewer: sufficient / insufficient |
|---|---|---|---|---|

A path that exists does not count. The cell quotes the passage or number that answers the question, and the reviewer, not the maker, marks it.

Required order: give, then prove, then position, then invite (`AGENTS.md` §5c.6). The gift is a carved-out slice of the real product, named here.

## 4. Claims ledger

Every number, name, logo, quote and capability on the page, one row each: claim, source path, read date. A claim without a row is removed. No "trusted by", no seeded counts, no undecided dates, no resetting timers.

## 5. Success criteria

Each row is a command or measurement and a pass value. Copy results into the craft receipt.

### Experience
- Phone-first: the predicates in `AGENTS.md` §11.3 pass (viewport-fit cover, themeColor per scheme, manifest, dvh, tap and text-size baseline, hover gated, zoom never disabled). Cite each check.
- Reduced motion: record a run with `prefers-reduced-motion: reduce` that completes the primary task, with focus moves, touch and an interrupted transition exercised. Name the device. Every animated element has a reason in the scene brief.
- Static composition carries the page with motion off.

### Performance
- Before launch (lab, named mid-range phone, throttled): LCP at most 2.5 s and CLS at most 0.1, with the trace attached. INP is a field metric, so lab runs report total blocking time as a proxy and say so.
- After launch (field, 75th percentile, 28-day window from CrUX or the property's RUM): LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1. A page with no field data yet is recorded as `[OPEN]`, not as passing.
- Initial JS and total image weight: state a budget before building, then measure against it. `[PROPOSED]` no budget means no ship.

### Accessibility
- Keep a criterion-level WCAG 2.2 AA audit record: each success criterion marked pass, fail or not applicable, with the tool or manual test behind it. Automated scans (axe, zero serious or critical) are part of the record, not the whole of it.
- Manual: the full task completes by keyboard alone, focus is visible at every step, touch targets are checked on the phone, contrast is measured.

### Agent-readable (`AGENTS.md` §11.4)
- The page exposes what it knows as machine-readable (`/.well-known/starlight.json`, `llms.txt`, install manifest) and an agent can complete the primary action without a browser.

### Demand capture (`AGENTS.md` §5c)
- Standard `DemandSignal` capture only. Price band asked after signup. Gift delivered within 60 seconds. No bespoke form, no `mailto:`. No CTA points at a 404.

### Craft
- Anti-slop table (`AGENTS.md` §11.1): one verdict per row with the page evidence for it. Any matched row is fixed before ship; two or more matched rows fail the page outright. Run `audit-ai-slop.mjs` where it exists and attach its output, but it only scans vocabulary: it printed `0 hits` for 2,592 files of frankx.ai-vercel-website on 2026-10-21 (`node scripts/audit-ai-slop.mjs`, branch `agent/antigravity/model-arena-gemini-4-argon-20261014`), which says nothing about layout or flow.
- Visual QA: verdict Pass on the Core Checks in `design-agent-standards/VISUAL_QA_GATE.md`, with screenshots at 375, 768 and 1440 px. That gate is pass, pass with notes, or fail. It has no score. `TRUTH.md` voids the older "30-point anti-slop gate" as fabricated, so do not cite one.
- Sentence case. Fonts from the brand pack, not browser defaults.

## 6. Review

1. Refinement pass: a separate pass whose only output is cuts and fixes. Record the diff stat.
2. Adversarial critique from a different provider than the maker, prompted as a buyer who declined to pay. Record findings and what was fixed.
3. Craft receipt at `queen/reports/craft/<product-id>-<date>.md`, validated by `node tools/craft-receipt.mjs`.
4. Exact-revision review. A review of an older head does not count.

## 7. Rebuild or refine

Audit the current page against section 5 and record each result. Then decide:

- Rebuild from the brief if any one of these holds: two or more slop rows match, the phone predicates fail, or the first viewport check in section 2 fails.
- Rebuild if both of these hold: fewer than half the flow sections are marked sufficient, and the claims ledger would remove more than a third of the page's claims.
- Otherwise refine, and list the cuts.

Record the audit and the decision in the craft receipt.

## 8. Out of scope and open

List what this page will not do, and every `[OPEN]` item with its owner. Never fill an `[OPEN]` with a guess.

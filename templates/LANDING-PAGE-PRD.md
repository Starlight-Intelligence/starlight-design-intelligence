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

## 3. Flow

An ordered list. Each section names the question the buyer is asking at that point and the evidence that answers it. A section with no evidence path is deleted, not softened.

| # | Buyer's question | Section | Evidence path (file, measurement or receipt) |
|---|---|---|---|

Required order: give, then prove, then position, then invite (`AGENTS.md` §5c.6). The gift is a carved-out slice of the real product, named here.

## 4. Claims ledger

Every number, name, logo, quote and capability on the page, one row each: claim, source path, read date. A claim without a row is removed. No "trusted by", no seeded counts, no undecided dates, no resetting timers.

## 5. Success criteria

Each row is a command or measurement and a pass value. Copy results into the craft receipt.

### Experience
- Phone-first: the predicates in `AGENTS.md` §11.3 pass (viewport-fit cover, themeColor per scheme, manifest, dvh, tap and text-size baseline, hover gated, zoom never disabled). Cite each check.
- Reduced motion is a working path, and every animated element has a reason written in the scene brief.
- Static composition carries the page with motion off.

### Performance (field or lab on a real mid-range phone, 75th percentile)
- LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1.
- Initial JS and total image weight: state a budget before building, then measure against it. `[PROPOSED]` no budget means no ship.

### Accessibility
- WCAG 2.2 AA. Zero serious or critical axe findings. Full task completed by keyboard alone. Focus visible. Contrast measured, not eyeballed.

### Agent-readable (`AGENTS.md` §11.4)
- The page exposes what it knows as machine-readable (`/.well-known/starlight.json`, `llms.txt`, install manifest) and an agent can complete the primary action without a browser.

### Demand capture (`AGENTS.md` §5c)
- Standard `DemandSignal` capture only. Price band asked after signup. Gift delivered within 60 seconds. No bespoke form, no `mailto:`. No CTA points at a 404.

### Craft
- Anti-slop table (`AGENTS.md` §11.1): fewer than two rows matched, each checked by a person, because `audit-ai-slop.mjs` only scans vocabulary. It reported 0 hits across 2,592 files of frankx.ai on 2026-10-21, which says nothing about layout or flow.
- Visual QA 30-point gate: ship at 26 or above, iterate at 22 to 25, restart below 22 (`VISUAL_QA_GATE.md`).
- Sentence case. Fonts from the brand pack, not browser defaults.

## 6. Review

1. Refinement pass: a separate pass whose only output is cuts and fixes. Record the diff stat.
2. Adversarial critique from a different provider than the maker, prompted as a buyer who declined to pay. Record findings and what was fixed.
3. Craft receipt at `queen/reports/craft/<product-id>-<date>.md`, validated by `node tools/craft-receipt.mjs`.
4. Exact-revision review. A review of an older head does not count.

## 7. Rebuild or refine

Score the current page against section 5. Refine if the first viewport, flow and claims ledger survive. Rebuild from the brief if any two of these hold: the first viewport needs a second sentence, fewer than half the sections have an evidence path, the page fails the phone predicates, or two or more slop rows match. Record the score and the decision.

## 8. Out of scope and open

List what this page will not do, and every `[OPEN]` item with its owner. Never fill an `[OPEN]` with a guess.

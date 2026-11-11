# Agentic Income foundations

Draft for Frank's signature — status: unsigned

Author: Claude Code (Opus 5.5), 2026-10-24, revision 1, unreviewed. Later design, logo and copy decisions are checked against this page. Until it is signed, [BRAND.md](BRAND.md), [DESIGN.md](DESIGN.md) and [NARRATIVE.md](NARRATIVE.md) win any conflict.

## 1. Buyer

An operator trying to make agents produce recurring revenue rather than demos (`starlight/graph/products.graph.json`, row `agentic-income`, stage `concept`). The repo narrows it to a technical or semi-technical creator, developer or consultant whose income is still tied to hours (`agenticincome/STRATEGY.md`).

Today they use free YouTube automation content, n8n's 13,708 community workflow templates, or a paid community such as AI Automation Society Plus at USD 129 a month. Pages read 2026-10-24.

Cost to them: [OPEN]; no interview or spend data exists. Price band EUR 99 to 299 has evidence "none yet". Waitlist count: [OPEN].

## 2. Promise

Inspect and run the free agent skills and starter kit before you pay for anything; every number we publish carries its date and source, and we never promise income.

## 3. Proof

Checked 2026-10-24:

- [/delivery/starter-kit](https://agenticincome.ai/delivery/starter-kit) and [/start](https://agenticincome.ai/start) return 200.
- [frankxai/agentic-income-skills](https://github.com/frankxai/agentic-income-skills) is public, MIT, with the [affiliate-audit skill](https://github.com/frankxai/agentic-income-skills/blob/main/skills/affiliate-audit/SKILL.md) and its script.
- Partner rates on the homepage are "verified between 16 Aug 2026 and 28 Sept 2026".
- `/.well-known/mcp.json` returns 200.

Not proven:

- No revenue loop with real figures exists; the registry gift is marked `needs-writing`.
- No customer, case or paid checkout. The live homepage still shows six prices, one "for sale" at USD 67; the fix, PR #87, is open.
- "Production-proven agent architectures" links no evidence.

## 4. Voice

1. Say what it does. Do: "The command reads files and writes an audit." Don't: "Agentic Income — Canonical Agent-as-a-Service Revenue Engine" (current page title).
2. A number needs a date and source. Do: "Every claim dated, costed, sourced." Don't: "Install production-proven agent architectures."
3. A price needs a working checkout. Do: "Nothing says buy until checkout actually exists; today the free starter kit is the only live path." Don't: a USD 129 card marked "not for sale".
4. Mechanism over aphorism. Do: "Agents build. Humans hold the gate." Don't: "Reading about agentic income is research. Querying it is leverage."

## 5. This brand is not

- The make-money-with-AI genre: payout screenshots, passive-income fantasy, urgency, earnings claims.
- Canonical, Sovereign, revenue engine, engineered revenue, revenue operating system, flywheel or leverage on customer surfaces.
- Prices or CTAs on offers nobody can buy.
- Consulting. TRUTH.md §1 [RULED] rules out consulting, yet the homepage sells "productized implementation sprints".
- An affiliate directory as the main capability (repo `TASTE.md`).
- AI gradients, node clouds, fake dashboards or a trading-terminal look (repo `TASTE.md`, `DESIGN.md`).

## 6. Competitor to beat

| Product | What the buyer gets | Dimension to beat |
|---|---|---|
| Free YouTube automation tutorials | A build shown once, costs left out | Full economics: every attempt, cost and failure on record |
| [n8n templates](https://n8n.io/workflows/), 13,708 listed | Wiring with no buyer or price attached | Each skill ships with its buyer, acceptance test and running cost |
| [AI Automation Society Plus](https://www.skool.com/ai-automation-society-plus/about), USD 129/mo | Courses, weekly Q&A, "get paid for it" | Inspectable before purchase, with no income framing |

## 7. Visual direction pointer

Keep the quiet dark palette in `agenticincome/app/globals.css` (origin/main `cfadce8`): background `#05060a`, surface `#0a0c14`, border `#1a1f2e`, ink `#f1f3f9`, muted `#8a90a8`. Emerald `#10b981` is the only action colour; amber `#f59e0b` marks commercial or claim state only. Bricolage Grotesque for display, Geist Sans and Mono for reading and data.

Remove cyan `#06b6d4` and the second green `#34d399`, glass beyond navigation and evidence controls, and motion that does not show Audit, Architect, Implement, Verify.

## 8. Open decisions for Frank

- Place in the ladder: TRUTH.md §2 [RULED 2026-10-22] parks everything outside the Kernel ladder. Recommend treating Agentic Income as parked and maintained, honesty fixes only, until you place it.
- Implementation sprints: recommend removing them from the homepage, as draft PR #83 does.
- PR #87: recommend review through pr-gate, then merge.
- Title: recommend "Agentic Income: agent skills and starter kits you can inspect first". Proposed copy, yours to approve.
- Affiliate revenue: STRATEGY.md ranks it first, TASTE.md says it is not the brand. Recommend keeping it disclosed and out of headlines.
- Cyan and second green: recommend dropping both tokens.

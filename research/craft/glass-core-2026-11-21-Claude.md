# Craft receipt: Glass Core site kit, 2026-11-21

Maker: Claude, branch `agent/claude/glass-core-flagship-20261121`, cut from PR #97 head `7d90e437`. Scope: `examples/sis-living-library/site-kit/` plus a registry builder change, a hover-scope fix in Glass Core `src/components.css`, research, receipt and listings. Spend: EUR 0.

## Research

| Source | URL | Read | Used for |
|---|---|---|---|
| Shadcnblocks pricing | https://www.shadcnblocks.com/pricing | 2026-11-21 | mustBeat price and scope (Pro USD 149, 5,420 stated Pro customers) |
| Tailark pricing | https://tailark.com/pricing | 2026-11-21 | mustBeat price and page-set scope (USD 249 / 299 / 499) |
| Oberon on Framer | https://www.framer.com/marketplace/templates/oberon/ | 2026-11-21 | top paid Framer AI template by rank, USD 129 |
| ThemeForest best sellers, "ai saas nextjs" | themeforest.net (rows in jsonl) | 2026-11-21 | code-template price band, median USD 22 (n=20) |
| Envato Next.js requirements | https://help.author.envato.com/hc/en-us/articles/7583521740569-Jamstack-Requirements-Next-js | 2026-11-21 | ThemeForest listing requirements |
| Framer, how to publish a template | https://www.framer.com/help/articles/how-to-publish-a-template/ | 2026-11-21 | remix URL requirement, no review |
| MCP specification 2026-07-28 | https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http | 2026-11-21 | stub targets stateless revision, `server/discover` |
| GitHub advisories for next | GHSA-mfr8-8qww-v76h, GHSA-vc7v-qv4w-wrv8, GHSA-7qx7-33qx-rqx2 (via `npm audit`) | 2026-11-21 | moved proof from Next 16.4.2 to 16.4.6 |

Full index: `research/market-index/2026-11-21.jsonl` (122 rows) and `2026-11-21-read-Claude.md`. API citations: `research/craft/glass-core-docs-read-2026-11-21.md` (Next.js viewport and manifest, shadcn registry, GSAP licence, MCP, llms.txt, schema.org, AG-UI and CopilotKit, WebGL, iOS input zoom).

## Bar

| mustBeat | Dimension | Verdict | Evidence |
|---|---|---|---|
| Shadcnblocks | Agent-native site surface | Beat | Installed build serves `/llms.txt`, `/.well-known/starlight.json`, JSON-LD Product and Offer and a read-only MCP endpoint from one config; Playwright "agent contract" tests pass. 0 of 4 sampled competitor demos served JSON-LD or llms.txt (market read) |
| Shadcnblocks | Breadth | Not beat | 2,241+ components and 2,697+ blocks versus one site of five routes |
| Tailark Pro | Motion with a designed reduced-motion path | Beat, by our own test | Every animated element has a job in `SCENE-BRIEF.md`; the `pixel-7-reduced-motion` project verifies the final state renders at once and the shader draws one still frame. Tailark's own reduced-motion handling was not inspected: [OPEN] |
| Tailark Pro | Page sets (blog, legal) | Not beat | No blog, changelog or legal pages |
| Oberon (Framer) | Owned, installable source | Beat | `site-kit/INSTALL-PROOF.log`: empty directory, `create-next-app@16.4.6`, `shadcn add`, `next build` pass; no hosted dependency |
| Oberon (Framer) | Visual polish as judged by a buyer | [OPEN] | No human buyer comparison exists |

Rubric scores required by `evals/web-release-gate.md` (editorial 18/20, typography 15/16, visual 28/30, motion 16/18) were not scored by an independent verifier in this run: [OPEN]. This kit is not a production release; the release gate applies when it ships on a real host.

## Refinement

A separate cuts-only pass, commit `b1e05db`:

```
6 files changed, 13 insertions(+), 18 deletions(-)
```

90 diff tokens removed, 11 added; every added line is a shorter version of the line it replaced. Cut: ledger label detail, method sentences to one clause each, second sentence of the pricing lede, one FAQ entry, footer tagline, table of contents on pages with fewer than three sections, two dead CSS rules, the ledger top rule. Playwright after cuts: 43 passed, 2 skipped.

## Critique

Critic: same model provider as the maker, fresh context, briefed as a technical founder who declined to pay EUR 79. **A different-provider critique is missing**: no other provider was reachable from this environment. Full text: `research/craft/glass-core-buyer-critique-2026-11-21.md`.

| # | Finding | Action |
|---|---|---|
| 1 | Scope: three pages versus whole sites [scope] | Partly fixed: added `/signup` and a designed 404. Blog, changelog and legal not built: next bounded action |
| 2 | No licence [trust] | Not fixable by an agent. Decision for Frank |
| 3 | Desktop first screen 60% empty, ledger below the fold [visual] | Fixed (`8b6206d`): desktop spread puts the ledger in the first viewport on an opaque panel, as the scene brief specified |
| 4 | Phone page mostly empty scroll [visual] | Fixed: screens no longer forced to full height; phone home 3,757 to 3,324 CSS px |
| 5 | "Compare plans" stretched full width [visual] | Fixed: flex `align-items: flex-start` |
| 6 | Buy buttons point to a missing `#signup` [dx] | Fixed: `/signup?plan=` with local validation and a `submit` provider hook; test asserts every plan link returns 200 |
| 7 | No slots for logos, quotes, security, integrations [copy] | Not fixed. Deliberate in the brief (no fabricated proof); a typed, empty-by-default proof slot is a candidate next action |
| 8 | Maker brand inside buyer site [trust] | Partly fixed: PR references removed from buyer code. `/.well-known/starlight.json` kept: it is the agent contract the brief requires |
| 9 | Undeclared dependency on `starlight-living`; replaces root layout [dx] | Documented in `site-kit/README.md`. Cannot be declared until a public registry URL exists |
| 10 | "Two months free" does not match EUR 39 vs 49 [copy] | Fixed: "Yearly, save 20%" (39 / 49 = 0.796) |
| 11 | One look, no theme switch [visual] | Fixed: `theme: 'midnight' or 'ember'` in config; field colours, manifest and icons follow. No light theme |
| 12 | Motion plays once, below the fold [motion] | Partly fixed by finding 3: on desktop the sequence now plays above the fold. Once-only is deliberate (brief) |

## Checks, real output

- Playwright, `site-kit/tests/RESULTS-final.txt`: `52 passed`, `2 skipped` (the static source check runs in one project only).
- Install proof, `site-kit/INSTALL-PROOF.log`: `# PASS 2026-11-21T02:23:32.898Z: clean create-next-app + shadcn add + next build`; consumer `npm audit`: `found 0 vulnerabilities`.
- Package: `npm test` `# pass 33 # fail 0`; `npm run check` exit 0; `npm run build` built; `npm run check:budgets` `jsGzipBytes 91557 / 150000`, `cssGzipBytes 15771 / 25000`.
- Repo root: `npm test` `# tests 306 # pass 303 # fail 0`; `npm run validate` `Design kernel valid: 29 skills, 11 brand packs, 4 workflows, 45 required artifacts.`
- Secret check: `gitleaks` not installed; a regex scan of the branch diff for common key formats returned no matches.

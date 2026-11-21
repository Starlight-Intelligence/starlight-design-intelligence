# Template market read, 2026-11-21

Data: `2026-11-21.jsonl` (122 rows). Every number below comes from a page or search snippet read on 2026-11-21; the row's `url` and `notes` hold the source. Unknowns are [OPEN].

## Method

- Tools: Firecrawl search and URL-mode scrape only. EUR 0 spent on paid capabilities; no Alexandria runs, no agent jobs, no sign-ins.
- Read: ThemeForest search "ai saas nextjs" sorted by best sellers (45 results) and site-templates term "saas" sorted by best sellers (2,223 results); Framer startup Trending and Best, AI Best; pricing pages for Shadcnblocks, Tailark, shadcn/studio, Aceternity, 21st.dev; v0 templates home, Landing Pages category and one template page; Etsy search "saas landing page website template"; 9 Gumroad product pages found by web search; one Polar checkout; one Whop store.
- Partly blocked or unreadable:
  - Whop: the discover search redirected to the homepage. One store was found through search. Its prices are [OPEN].
  - Gumroad: discover and category pages render cards client-side with no text.
  - Magic UI: the pricing pages on pro.magicui.design and magicui.design returned 404. The price comes from a snippet on magicui.net, and who owns that domain is [OPEN].
  - Origin UI: not read.
  - Polar: has no public storefront search. Rows come from buy.polar.sh links on Framer listings, and only Wedge was read on Polar itself.
  - Framer: shows no sales, remix or view counts anywhere, so rank in a listing is the only visible signal.
  - v0: card counts carry icons, not labels. The button count is recorded as likes, and the other count's meaning is [OPEN].
  - Direct curl was refused by the sandbox proxy.

## What sells

- Code templates with counted sales (ThemeForest). The top AI-labelled Next.js item is Nexsas, $17, 943 sales (themeforest.net/item/nextsaas-saas-software-startup-nextjs-template/59610421). Next come Lexend, $14, 714 sales, and Aiwave, $9, 684 sales. Older generic SaaS landings outsell every AI template: Sandbox, $17, shown as 7.5K sales; TheSaaS, $39, 4.9K; SuperProps (Next.js), $24, 4.8K. Admin dashboards top the "saas" best-seller sort: Materialize, $39, 12.7K sales.
- Kits sold as libraries. Shadcnblocks states 5,420 Pro customers, 22,162 free users and about 10,000 installs per day (shadcnblocks.com/pricing). 21st.dev shows 9,846 supporters and "used by 4,823,553 builders" (21st.dev/pricing).
- Free attention (v0). The most liked landing page is Brillance SaaS Landing Page with 2.1K likes (v0.app/templates/zdiN8dHwaaT). Pointer AI has 1.9K likes, Optimus (AI platform) 1.6K, and COMPUTE (AI agents) 1K.
- Etsy shows no sales. Rating counts on SaaS listings are small (1 to 55) and are probably shop-level. Etsy sales are [OPEN].
- Gumroad: the AI and SaaS product pages read show 0 or 1 rating each. Gumroad sales are [OPEN].

## At what price

Medians are over positive one-time prices in this file. Team and subscription tiers are excluded unless stated.

| Marketplace | n | Range | Median |
|---|---|---|---|
| ThemeForest | 20 | $9 to $39 | $22 |
| Framer | 20 | $9 to $149 | $99 |
| Polar (Framer items) | 13 | $1 to $149 | $99 |
| shadcn kits, single-user tiers | 12 | $49 to $399 | $220 |
| Gumroad (USD only) | 7 | $9 to $49 | $29 |
| Etsy | 20 | $1.20 to $102.77 | $15.15 |
| 21st.dev | 3 | $6 to $15 a month | [OPEN] |
| v0 | 20 | free | n/a |
| Whop | 1 | [OPEN] | [OPEN] |

Framer clusters at $99 and $129: of 20 rows, 8 are $99 and 8 are $129. Polar rows duplicate Framer items, so do not add the two counts together.

## What all of them lack

These lacks are claimed only where a sample was checked.

- No JSON-LD of any kind: 0 of 4 demo homepages served JSON-LD (Oberon, Wedge, Nexus, Velat; raw HTML checked).
- No llms.txt: 0 of 4 demos served /llms.txt; all returned 404. .well-known paths were not checked and are [OPEN].
- Reduced motion:
  - The two Framer demos each contain one `prefers-reduced-motion` check, inside Framer's own appear-animation runtime, so it is platform behaviour rather than template work. Oberon also has 7 `<canvas>` elements, and their reduced-motion fallback is [OPEN].
  - The two Next.js demos had no reduced-motion rule in their served HTML. Their external CSS was not checked, so the answer for code templates is [OPEN].
- Shader and 3D fallbacks: 1 of 9 Gumroad pages sells a Three.js hero, and its page describes no fallback. This is not checked across the market.
- Install proof: Shadcnblocks is the only seller read that names an install path (shadcn CLI, MCP, IDE extension). Aceternity and 21st.dev name MCP or CLI. None of the 9 Gumroad pages or 20 ThemeForest cards shows a verified install or build log. Their install steps beyond "npm install" are [OPEN].
- Phone-first composition: not assessed; [OPEN].

## The bar to beat

- Shadcnblocks: Pro $149, Premium $299, Elite $399, all one-time. A Black Friday code brings them to $89, $179 and $239. Pro includes 2,241+ components and 2,697+ blocks, Premium adds 22 templates, and Elite adds 97+ pages. Install is through the shadcn CLI and MCP, with 5,420 stated Pro customers.
- Tailark Pro: Essentials $249, Complete $299, Team $499, all one-time, with a free tier at $0. Complete adds full page sets: landing, pricing, blog and legal pages.
- Top Framer AI-startup template: **Oberon®** by Tymofii Bak, **$129** one-time via Lemon Squeezy (framer.com/marketplace/templates/oberon/). The metric is rank: it is the first paid item, at position 2 of the Best AI view. Position 1, Sift by Framer, is free. Whether the view's window was "Last month" or "All" is [OPEN]. Framer publishes no sales numbers, so true best-seller status is [OPEN]. On the Best Startup view the top paid item is Spartan's at $129, also at position 2.

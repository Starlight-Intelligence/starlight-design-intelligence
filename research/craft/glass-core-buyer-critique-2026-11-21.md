# Glass Core site kit: why I did not buy

Critic: same model provider as the maker (fresh context). A different-provider critique is missing.

Persona: technical founder at an AI startup, evaluated on 2026-11-21 against a fresh Next.js install at localhost:3100. Market numbers come only from `research/market-index/2026-11-21-read-Claude.md`.

## Verdict

A tasteful, well-tested demo of one fictional product, sold at EUR 79 as if it were a kit: three pages, four doc stubs, no license, and a desktop layout that looks unfinished.

## Findings, most damaging first

### 1. EUR 79 buys three pages; the comparison set sells whole sites [scope]

- Seen: `app/` has a home, a pricing page and a docs shell with four data stubs (`lib/docs.ts:17-74`). There are no blog, changelog, about, legal, contact, signup or 404 pages (`curl /nope` returns the unstyled Next default 404).
- Why it cost the sale: per the market file, Tailark Complete (USD 299) includes landing, pricing, blog and legal page sets, and Shadcnblocks Pro (USD 149) includes 2,241+ components and 2,697+ blocks. ThemeForest SaaS templates sit at a USD 22 median (USD 9 to 39). At EUR 79 this kit costs about four times the ThemeForest median and ships fewer pages than most of them. I would still have to build privacy, terms and a waitlist page before launch, so I would pay twice.
- Fix: ship blog index and post, changelog, privacy, terms, a styled 404, and a waitlist or signup page, all driven from `site.config.ts`. Without those, price it near the ThemeForest median.

### 2. No license, and the README says so [trust]

- Seen: `examples/sis-living-library/README.md:18` says the offers "remain closed, and carry no new license grant". Line 129 says "No permissive license is granted to original Starlight source". `registry.json:55` calls the block a "Review candidate".
- Why it cost the sale: I will not put source with no license grant into a company I plan to raise on. A diligence lawyer will flag it.
- Fix: publish a one-page commercial license (one product per seat, unlimited client sites or not, stated plainly) and put it in the package and on the sales page.

### 3. Desktop leaves most of the first screen empty [visual]

- Seen: `desktop-home-top.png`. The claim fills the left 40%. The right 60% is a blurred teal fog with nothing on it. The ledger, the only proof object, starts below the fold (`desktop-home-ledger.png`).
- Why it cost the sale: at 1440x900 this reads as an unfinished hero. It does not read as restraint. The Framer templates in the market file (median USD 99) open with a product image on desktop. My investors look at this page on a laptop, not a Pixel.
- Fix: on wide screens, bring the run ledger, or a cropped part of it, into the first viewport on the right five columns, as the brief's own "asymmetric spread" describes (`SCENE-BRIEF.md`, Desktop paragraph). Keep the fog behind it.

### 4. The phone page is mostly empty scroll [visual]

- Seen: `phone-home-full.png` is 9,862 px tall (1082 px wide capture) for four short sections. `app/site.css:101-104` sets every `.ks-screen` to `min-height: 100svh` with up to 10rem padding. The method section is three short sentences on a full screen. The gaps between sections each take most of a phone screen.
- Why it cost the sale: on my phone I scrolled through black and thought the page had stopped loading. "One message per screen" is a rule written for the maker. It does nothing for my visitor.
- Fix: drop `min-height: 100svh` from `.ks-screen` on phones except the opening and the ledger. Cap section padding at about 6rem. Check the page height against a target (for example under 5 phone screens).

### 5. "Compare plans" button stretches the full content width on desktop [visual]

- Seen: `desktop-home-full.png`, last section. The secondary button runs edge to edge across 1180 px. Cause: `.ks-screen` is `display:flex; flex-direction:column` (`app/site.css:103`) with default `align-items: stretch`, and `.ks-action` (`site.css:81`) never sets `align-self`.
- Why it cost the sale: it is a visible layout bug on the second-to-last screen of the homepage. If the maker missed that, I assume there are more I have not found.
- Fix: `.ks-screen > .sl-button { align-self: flex-start; }`, and add a screenshot assertion for button width.

### 6. Every buy button goes nowhere [dx]

- Seen: `lib/site.config.ts:86` and `:96` point "Start free" and "Start a 14 day trial" at `#signup`. No element with `id="signup"` exists on any page (a `grep` of `/` finds 0 matches). The hero "Start free" goes to `/pricing#free`, which leads to a second "Start free" button that goes nowhere.
- Why it cost the sale: conversion is the one job of a startup site. The kit ships no signup form, no waitlist, and no documented hook for Stripe, Clerk, Polar or a form endpoint.
- Fix: ship a waitlist form with a server action and a documented adapter seam (`site.config.ts` → `signup: { provider, endpoint }`). Add a test that every primary action resolves to a real target.

### 7. No slots for the proof I actually have [copy]

- Seen: `app/page.tsx:141-187`. The home page has a claim, a ledger, three method sentences and a price line. There is no slot for a logo row, a quote, a founder note, an integrations list, a security line or an FAQ.
- Why it cost the sale: the brief bans "hero, three cards, call to action" (`SCENE-BRIEF.md`), which is fine. But it left nothing in their place for real social proof. An early-stage company leans on exactly those slots: two design partners, one quote, "SOC 2 in progress". With this kit I would add them myself and break the composition the kit is selling.
- Fix: add optional, config-driven sections (`proof.quotes`, `proof.logos`, `integrations`, `security`). They stay hidden when empty and are designed in the same type-only language.

### 8. Your brand ships inside my site [trust]

- Seen: the manifest route is `/.well-known/starlight.json` with `"schema":"starlight.site.v1"`. The footer on every page links to `.well-known/starlight.json` (`components/site/site-footer.tsx:340`). `components/site/agent-slot.tsx` comments point at "Living Agent UI, PR #99".
- Why it cost the sale: a vendor's name in my public URL space and footer is a watermark. No agent client I know of reads `starlight.json`, so I would be shipping a dependency on your schema with no consumer. `llms.txt` and JSON-LD are worth having (the market file found 0 of 4 demos serving either). That gap is real, but this route does not close it.
- Fix: rename the route to something neutral and configurable (`site.agents.manifestPath`), or document who consumes it. Move the agent links into a single "For developers" footer line. Strip internal PR references from shipped comments.

### 9. Install depends on a second registry item it does not declare [dx]

- Seen: `app/layout.tsx:215-216` imports `@/components/ui/starlight/tokens.css` and `components.css`. The `glass-core-site` block in `registry.json:50-62` lists npm dependencies but no `registryDependencies` on `starlight-living`, which is the item that provides those files (`registry.json:24-31`). The description also says it "Replaces app/layout.tsx and app/page.tsx".
- Why it cost the sale: on a fresh app, `shadcn add glass-core-site` alone fails to build, and on an existing app it overwrites my root layout without warning. Shadcnblocks names its install path in the CLI and MCP (market file, "Install proof").
- Fix: declare `registryDependencies: ["starlight-living"]`. Install into a route group (`app/(marketing)/`) instead of replacing the root layout. Publish a recorded fresh-install log: `create-next-app`, add, build, with exit codes.

### 10. Pricing page is thin and the numbers do not agree [copy]

- Seen: `desktop-pricing-full.png` has two FAQ items (`site.config.ts:110-112`, with a broken indent on line 112). There is no comparison table. "Yearly, two months free" (`pricing-plans.tsx:267`) labels EUR 39 against EUR 49, a 20% discount, which works out to about 2.4 months free, not 2. The JSON-LD `Offer` publishes only the monthly price (`app/pricing/page.tsx:216`).
- Why it cost the sale: an AI buyer reads pricing harder than any other page, so overage, limits, data retention and cancellation need answers. The yearly label would fail my own copy review on day one.
- Fix: derive the period label from the numbers. Add 6 to 8 FAQ defaults (overage, cancellation, DPA, data residency, seats, trial end). Add an optional feature matrix. Emit both prices with `priceSpecification` and `billingDuration`.

### 11. One look, dark only, no theme switch for buyers [visual]

- Seen: `app/layout.tsx:238` hard-codes `colorScheme: 'dark'` and `data-theme="midnight"`. Every screenshot shows the same teal-on-near-black. The README mentions "three candidate themes", but the kit exposes none of them through `site.config.ts`.
- Why it cost the sale: "dark serif with teal accent" is a common look among AI startup sites right now, and I cannot easily make it mine. Recoloring means editing token CSS I did not write.
- Fix: expose `theme` and `accent` in `site.config.ts`. Ship a light variant and at least one more palette. Show all three on the sales page.

### 12. Motion is the selling point, and almost no one will see it [motion]

- Seen: `components/site/run-ledger.tsx:146-148`. Rows verify 90 ms apart and the lens travels in 600 ms, once, when scrolled into view at 75%. The shader is decorative fog (`desktop-home-top.png`). On phone the ledger sits two long scrolls down (`phone-home-full.png`).
- Why it cost the sale: the motion is principled and the reduced-motion path is real (tests pass, `tests/RESULTS-post-refinement.txt`). But about a second of animation, played once below the fold, does not justify EUR 79. A buyer judging from the sales page sees a blurry gradient.
- Fix: show the ledger sequence in the first viewport on desktop (see finding 3). Add a replay control to the ledger, and ship a short video of the sequence for the listing.

## What would have made me pay

- A commercial license I can show a lawyer, in the package and on the sales page.
- Page coverage at least on par with a USD 9 to 39 ThemeForest kit (blog, changelog, legal, 404, signup or waitlist), driven from the same config.
- A working signup or waitlist path with one documented provider adapter, and no dead `#signup` links.
- A desktop first screen that shows the product (the ledger), and a phone page that is not mostly empty scroll.
- A fresh-install log (create-next-app, add, build, green) with declared registry dependencies and no overwrite of my root layout.

# Own storefront draft: Glass Core AI startup site kit

Status: draft, unpublished. Price shown is a hypothesis (evidence: none yet). Checkout stays disabled until licence, price and payment rail are approved.

## Title

Glass Core: an AI startup site you install as source

## One line

Landing, pricing, sign-up and docs for Next.js, phone first, with a site agents can read.

## Body

Your agent product needs a site that explains one thing well. Glass Core ships a landing page built around a single proof object, a run ledger that verifies step by step and puts a lens on the step that mattered, plus pricing, sign-up, a docs shell and a designed 404.

It installs into a fresh Next.js app with one command and you own every line. Rename the company, the claims, the plans and the theme in one config file.

What makes it different from the kits we compared it with (market read, 2026-11-21):

- Agents can read it. `llms.txt`, `/.well-known/starlight.json`, JSON-LD Product and Offer, and a read-only MCP endpoint are generated from the same config as the pages. None of the four template demos we checked served JSON-LD or llms.txt.
- Motion has a job. Each animation is written down with its reason, and reduced motion gets the same information without the sequence. A Playwright project checks it.
- One GPU surface, done properly. The shader field pauses off screen, resumes on return, draws a still frame for reduced motion and falls back to a CSS poster when WebGL is missing or lost.
- Proof of install. The kit ships the log of a clean install and build from an empty directory, plus the test suite (Pixel 7, reduced motion, desktop).

## What you get

- `glass-core-site` registry block: 28 source files for Next.js 16 App Router
- Glass Core components (`starlight-living`): typed React components, three themes, 24 icons
- Scene brief, install proof log, Playwright suite

## What you do not get

No hosting, no auth provider, no model credits, no analytics. The sign-up form validates locally and sends nothing until you connect a provider. The agent slot is empty until you mount your own assistant.

## Price

EUR 79, Essential (hypothesis). Professional EUR 149 and Agent Command Center EUR 349 are separate editions.

## Licence

[OPEN] Draft terms only. Must be approved before any sale.

## FAQ

- Which Next.js version? Built and tested on 16.4.6.
- Tailwind required? No. The kit uses plain CSS with Glass Core tokens; it coexists with Tailwind.
- Light theme? Not yet. Midnight and Ember are both dark.
- Can I resell it? [OPEN] Depends on licence terms.

## Required before publish

Licence text, final tax-inclusive price, payment rail, test-mode purchase and refund rehearsal, hosted live preview, owned screenshots captured from the installed build.

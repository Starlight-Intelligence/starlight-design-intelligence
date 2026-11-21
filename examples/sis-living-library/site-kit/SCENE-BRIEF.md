# Glass Core site kit: scene brief

Written before any composition. Every later decision traces back to a line here.

## Recipient and job

A founder or first engineer at an AI startup who has a working product and no site. They need a landing page, a pricing page and a docs shell that look owned, read well on a phone, and can be understood by agents as well as people. They install source, rename one config file, and deploy.

The demo company is fictional: **Orrery**, replay and evaluation for production agents. Every name, number and price lives in `lib/site.config.ts`. Nothing on the page is a real customer, metric or quote.

## The one idea

An AI product earns trust by showing which step mattered. The page does the same thing it sells: it shows a run, verifies it step by step, and puts a lens on the one step that changed the outcome.

## Rules of the composition

- One message and one action per phone screen. A screen that needs two actions is two screens.
- Type and spacing carry the page. Instrument Serif for the claim, Instrument Sans for reading, IBM Plex Mono only for machine output (step names, counts, endpoints).
- No hero, three cards, call to action. Proof is shown as one artifact (the run ledger), method as numbered sentences, price as a sentence.
- Blank space is the default. Sections are padded by about a fifth of the viewport height (20svh) on phones and spaced by rhythm, not forced to full height. Only the opening screen is full height.
- Opaque surfaces carry reading. Glass appears in exactly one place: the lens over the ledger, where it refracts real row content underneath it.
- The GPU surface is the opening field only. It is a backdrop for one sentence, never a carrier of information.

## Screens (phone first, 390 by 844 reference)

| # | Message | Action | Material |
|---|---|---|---|
| 1 | Know what your agents did last night. | Start free | Shader field, poster fallback |
| 2 | One step changed the outcome. Orrery finds it. | See how replay works | Run ledger, glass lens |
| 3 | Connect, replay, ship. Three sentences, numbered. | Read the quickstart | Type only |
| 4 | Free for the first 10,000 steps a month. | Compare plans | Type only |
| sign-up | Start with one agent. | Start free (plan carried from pricing) | 16px email field, local validation, provider hook |
| 5 | Footer: for agents (llms.txt, MCP, .well-known) | none | Type only |

Desktop keeps the opening as one sentence on the left with the field running full width; the right side stays empty on purpose. Screen 2 becomes an asymmetric spread: the claim on the left five columns, the ledger on the right seven, so the eye moves from sentence to evidence.

Pricing: one sentence headline, a billing switch, three plans as ruled rows (not cards), one recommended plan named in text, FAQ as native disclosures.

Docs: a reading column of 68 characters, navigation in a native disclosure on phones and a sticky rail on desktop, an assistant slot that stays empty and says so until a host connects one.

## Motion, each with a written reason

| Element | Job (motion purpose gate) | Behaviour | Reduced motion |
|---|---|---|---|
| Ledger step verification | State and causality: shows a run being checked in order, so the flagged step reads as the result of the checking | Once, on first entering the viewport: rows move from `queued` to `verified` in sequence, 90 ms apart, the flagged row resolves last | All rows render in final state; the flagged row carries its text label. Same information, no sequence |
| Lens travel | Focus and spatial relationship: moves attention from the first row to the row that mattered | After verification, the lens moves from row 1 to the flagged row in 600 ms with the house ease | Lens sits on the flagged row from first paint |
| Shader field drift | None for information. Allowed as the single GPU surface and the brand memory of the opening | Slow domain-warped flow at no more than 30 frames per second; pauses off-screen and on hidden tabs, resumes on return | One still frame; if WebGL is unavailable or the context is lost, the CSS poster stays |
| Billing switch | State: the price changed because the period changed | Price text cross-fades in 120 ms | Instant swap |

Nothing else moves. No entrance animations on headings, no parallax, no hover lifts.

## Phone contract

- `viewportFit: 'cover'`, `maximumScale: 5`, never `user-scalable=no`.
- Full-height screens use `100svh` with `100dvh` where the element must track the browser chrome; no bare `100vh`.
- Inputs are 16px or larger.
- Hover styles exist only inside `@media (hover: hover) and (pointer: fine)`.
- Safe-area insets pad the header and footer.
- `app/manifest.ts` with generated 192 and 512 PNG icons, including a maskable variant.

## Agent contract

- `/.well-known/starlight.json`: machine-readable description of the site, its pages, endpoints and authority (read-only).
- `/llms.txt`: llmstxt.org structure generated from the same config.
- JSON-LD `Product` with `Offer` entries on the pricing page, generated from the same plans.
- `/api/mcp`: stateless JSON-RPC stub with read-only tools (`get_pricing`, `list_docs`). It grants no write, payment or account authority.
- `AgentSlot`: a typed slot where the AG-UI / CopilotKit surface from Living Agent UI mounts. Empty by default and labelled as such.

## What would make this fail

- Any screen with two competing actions.
- Glass placed over a flat colour, refracting nothing.
- Motion that runs before the reader reaches the ledger, or that cannot be read in reduced mode.
- Any number on the page that looks like a real metric or a real customer.

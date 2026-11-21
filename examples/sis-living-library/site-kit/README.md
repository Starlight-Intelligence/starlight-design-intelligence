# Glass Core site kit

Landing, pricing, sign-up and docs shell for an AI startup on Next.js App Router, installed as source through a shadcn-style registry. Extends Glass Core (`starlight-living`); read [SCENE-BRIEF.md](SCENE-BRIEF.md) for every composition and motion decision.

Review candidate. No licence is granted yet; original source remains UNLICENSED until the owner approves terms.

## Install into a fresh app

```sh
npx create-next-app@16.4.6 my-site --ts --app --no-tailwind --no-src-dir --import-alias "@/*"
cd my-site
npx shadcn@4.23.0 init
npx shadcn@4.23.0 add <registry>/starlight-living.json <registry>/glass-core-site.json --overwrite
npm run dev
```

`glass-core-site` replaces `app/layout.tsx` and `app/page.tsx`; install it into a new app, or commit first and review the diff. It needs `starlight-living` installed in the same command or earlier (no public registry URL exists yet, so it cannot be declared as a `registryDependency`). With no Tailwind, leave `tailwind.baseColor` empty in `components.json`.

The proof of this install from an empty directory is [INSTALL-PROOF.log](INSTALL-PROOF.log), produced by `node scripts/site-kit-install-proof.mjs <empty-dir>`.

## Make it yours

Edit one file: `lib/site.config.ts` (name, URL, claims, ledger steps, plans, FAQ, theme `midnight` or `ember`). Docs live in `lib/docs.ts`. Pages, JSON-LD, `llms.txt`, `/.well-known/starlight.json` and the MCP stub all read from those two files. Connect sign-up in `components/site/signup-form.tsx` (`submit`); by default nothing is sent anywhere.

## What ships

| Route | Purpose |
|---|---|
| `/` | One claim, run ledger with lens, method, price |
| `/pricing` | Billing switch, three ruled plans, FAQ, JSON-LD `Product` + `Offer` |
| `/signup` | Email field (16px), local validation, provider hook |
| `/docs/[slug]` | Reading column, disclosure nav on phones, agent slot |
| `/llms.txt`, `/.well-known/starlight.json` | Read-only agent contract |
| `/api/mcp` | Stateless MCP stub (revision 2026-07-28, answers `initialize` for 2025-11-25 clients), tools `get_pricing`, `list_docs` |
| `/manifest.webmanifest`, `/pwa-icon/*`, `/icon`, `/apple-icon` | Generated PNG icons incl. maskable |

Agent surface: wrap a chat surface in `AgentSlot`; the AG-UI / CopilotKit provider from Living Agent UI (`@starlight/living-agent-ui/copilotkit`) mounts there. No runtime, model key or subscription ships.

## Verify

```sh
node scripts/site-kit-install-proof.mjs /tmp/site-kit-proof
cd /tmp/site-kit-proof/app-under-test && npx next start -p 3100 &
PLAYWRIGHT_CHROMIUM=/path/to/chrome npx playwright test -c site-kit/tests/playwright.config.mjs
```

Projects: Pixel 7, Pixel 7 with reduced motion, desktop 1440. Latest output: [tests/RESULTS-final.txt](tests/RESULTS-final.txt).

## Third-party

GSAP 3 (standard no-charge licence, gsap.com/standard-license; installed from npm, not bundled), Fontsource Instrument Sans, Instrument Serif and IBM Plex Mono (SIL OFL 1.1), Next.js and React (MIT). Whether GSAP's licence permits resale inside a paid template is [OPEN]; the kit lists it as a dependency rather than redistributing it.

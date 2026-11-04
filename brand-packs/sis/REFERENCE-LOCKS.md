# Starlight reference locks by surface mode

Draft for Frank's review, status: unsigned

Author: Claude Code (Sonnet 5.5), 2026-11-03, revision 1, unreviewed by a second provider. This page picks reference sources for Starlight product doors. [DESIGN.md](DESIGN.md) and its four surface modes (PR #67) win any conflict. Nothing here approves a palette, a mark or a layout.

## Scope

In scope: the Starlight product doors that sit in the SIS surface modes: the Cloud console, pairing, the Brain, the Kernel page, the playbook page and the design-partner request.

Out of scope: brand-world and funnel locks for Agentic Income, FrankX, GenCreator, Vibe OS and the literary imprints. Those are in `playbooks/refero-funnel-atlas.md` on branch `agent/antigravity/refero-product-funnels` (no pull request on 2026-11-03). This page reuses its Linear changelog UUID and does not repeat its locks.

## Rules for this page

- Refero's terms forbid mirroring, indexing, caching and AI training. This page stores names, URLs, IDs and our own derived decisions. No Refero style text is pasted.
- A style described here was read at search-preview level on 2026-11-03 unless a line says the full style was opened. Open the full style and capture the live page, with the date, before a DESIGN.md relies on a token value.
- Cloud workers cannot call Refero. Resolve references here, then pass them in.

## Mode map

| Door | Mode | Lock |
|---|---|---|
| Cloud console: first run, permissions, spend limits, keys, composer | Operator | 1 |
| Join and Nexus pairing | Operator | 1 |
| Brain atlas (read-only) | Operator | 1 |
| Kernel page | Operator, documentation register | 1 |
| Home and institutional pages | Horizon | 2 |
| Design-partner request page | Horizon, institutional register (proposed) | 2 |
| Playbook page and receipt | Academy (proposed: the product is a learning artifact) | 3 |
| Music, ritual, character work | Cultural | 4 |

## Lock 1: Operator mode

SIS definition: stable navigation, disciplined density, inspectable system state, restrained signal color. The interface shows what is happening, why it matters and which decision belongs to the operator.

**Primary:** Linear changelog, [linear.app/changelog](https://linear.app/changelog), style `11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6`.

**Preserve:** restraint, hairline depth instead of glow, a tight type scale, surface hierarchy carried by value steps, signal color used rarely.

**Borrow only:** Warp /code, [warp.dev/code](https://www.warp.dev/code), style `3aff8b9c-ac69-4392-9862-c82e9db2dec7`, for command output and receipt panes. It is a different page from Warp /terminal (`40a9c295`); use the UUID given.

**Role rules:**
- Signal colors keep one operational meaning each (SIS rule). Proposed split: cyan or teal for system state and connection; warm gold for a human decision, such as an approval control. Gold never decorates.
- Code colors live inside code and receipt panes only.
- Exact tokens come from `foundations/tokens.json` once PR #67 lands. This page sets no hex values.

**Media:** product capture and diagrams only. Empty states are labelled diagrams. No illustration, no photography inside the console.

**Reject:** Lemni's plan-and-payment-first order (flow 4573); glow as decoration; a Horizon hero inside the console; a real-graph hero on the Brain page.

### Door evidence

| Door | Learn from | Take | Reject |
|---|---|---|---|
| First run | OpenAI developer onboarding, [flow 4178](https://refero.design/flows/4178), 26 screens | Order: account, optional team invite, key with one-time reveal, code samples, credits last and optional | Lemni order |
| Permissions | Intercom consent screen `725f9f07-e8c7-44d9-ab14-56328ae0e815` (flow 683); Rox calendar modal `3106d715-5410-4080-9761-fa4db061dccb`; Appwrite scopes `379d1b00-a6ac-427e-bd82-87a26ed2481e` | Scope cards with expandable detail; read and write as separate boxes; select and deselect all; nothing write-enabled by default | Single "allow everything" button |
| Keys and tokens | Anam [flow 12947](https://refero.design/flows/12947); Steel dialog `764f128f-8c6c-4d9b-bfc4-557f7926a4fa` (flow 14293); OpenAI revoke modal `45bbb3bc-ac45-4d4d-ba8b-6114b323b583` (flow 4226); Cohere tooltip `9ca81230-32bb-4395-aa5d-1bae219ff7a1`; Appwrite dev keys with expiry [flow 6027](https://refero.design/flows/6027) | Name the key, show the secret once, masked list after, revoke behind a confirm, expiry on temporary keys | Showing a secret again after close |
| Spend limits | Cohere [flow 3896](https://refero.design/flows/3896), screen `0a2e47c7-12b6-4f44-a0c5-452c383ffe7e`; OpenAI limits table `379b23fb-5be7-4ecf-b7ce-aa9dfad91d09` | Limit set in a modal with the current figure beside it; limits as a table per scope | A limit described as absolute where the supplier enforces it only as an outer bound |
| Approvals | Acctual [flow 8853](https://refero.design/flows/8853) (7 steps), screen `260c7d9e-ca41-4239-b3dc-2d6deb4020ed`; delete rule [flow 8854](https://refero.design/flows/8854) | Rule list, rule builder, delete behind a confirm | Approval buried in settings: the console shows pending approvals first |
| Agent composer | Cursor, flow 9941 (from the 2 Nov search, not reopened on 3 Nov) | One input, visible scope and spend next to it | A chat transcript as the main surface |
| Pairing | No usable reference. Two searches returned authenticator and SMS flows (Wealthsimple 8515, Fernand 11897, Family 6202, Mapbox 9709) and invite links | Only the recovery-code step: Wealthsimple [flow 8515](https://refero.design/flows/8515), final screen | QR as the only path; the target is an RFC 8628 device code |
| Brain | Memotron, [memotron.app](https://memotron.app), home `dc4bb2a9-3513-404e-9267-4dd07d985aeb`, compare wheel `744a7d5a-cba1-4b4d-a171-21426a82e8b8` | A category wheel as the overview; a dark variant exists (`13027bfd-065d-40f2-82ef-6355a6eb9752`) | A force-directed graph hero |
| Kernel page | Linear changelog (primary above); SST and Tailwind docs, IDs [OPEN] | Dated entries, release notes as the page | Marketing hero on a documentation page |

## Lock 2: Horizon mode

SIS definition: cinematic scale, strong contrast, luminous atmosphere, authored imagery, precise language, a human point of view. Generic starfields are named as a failure.

**Primary candidate:** Drepute, [drepute.xyz](https://drepute.xyz), style `aa138c1f-2b42-4b10-9a3d-bdb09c216c99`. Preview-level read: full-bleed night landscape, centred serif headline, very little else on the page. Its subject is an environment, which fits the SIS preference for human or environmental subjects.

**Preserve:** one full-bleed authored scene per fold, a serif display line, flat dark surfaces, almost no chrome.

**Borrow only:** Chantlings, [iorama.studio/chantlings](https://www.iorama.studio/chantlings), style `1c90b38a-6941-472d-afc9-40a7d42e8bec`: a single warm glow as the only accent. It maps to SIS warm gold for arrival or human contribution. Gold appears once per fold.

**Role rules:** gold marks a person or an arrival. Cyan and teal stay out of Horizon scenes unless the scene shows system state.

**Media:** original generation or commissioned work with a `.vis.provenance.json` sidecar and a ledger row (AGENTS.md §10). A placeholder keeps the aspect ratio and a one-line art direction.

**Reject:** starfield backgrounds; OHZI's floating monolith (`7524da9c-904a-458a-9d46-999772061d83`) and Active Theory's iridescent particles (`9d795615-79d0-4544-ac5e-2858971c3b3b`), both of which SIS names as decoration; Exo Ape's architectural grandeur (`83f0586f-0344-4da8-afbe-3f8bdc508ee7`) kept as a composition reference only.

**Gap:** the Railway night-sky candidate from the 2 Nov notes was not found again on 3 Nov. Drepute replaces it as first candidate. The design-partner page (Pilot Service) borrows this lock in its quiet register, with ElevenLabs and Teachable evidence still to be re-captured, IDs [OPEN].

## Lock 3: Academy mode

SIS definition: brighter surfaces, visible progress, knowledge maps, mentor presence, student artifacts, growing mastery without a game-show feel.

**Primary:** Ableton Push shop page `c293f913-7c99-4c41-8d92-2c6d9f0f12e7` (from the funnel atlas, which read it). Take the narrative on the left and the edition columns with expandable specifications.

**Borrow only:** Brilliant personalized onboarding, [flow 4345](https://refero.design/flows/4345), for visible progress before commitment; a printed-receipt object for the Kernel receipt that each playbook carries (Square receipt, ID [OPEN]).

**Reject:** a billing toggle, because the packs are one-time at EUR 149 to 199; countdowns; badges for progress.

**Status:** thinner evidence than lock 1. Treat as proposed until the Gumroad and Square screens are re-captured.

## Lock 4: Cultural mode

No Starlight door uses Cultural mode yet. For music or character work, use the atlas locks for Vibe OS (Elektron `362d9644-ce48-40af-8c2a-35753ec54b5e`) and the literary imprints (Sequel `50c47480-9451-420b-a372-eb42eda75e56`). No new research.

## Decision ledger

| Decision | Source | Role | Why |
|---|---|---|---|
| Linear changelog is Operator only | PR #67 modes; Refero style | Primary, Operator | Its restraint serves inspection and fails the Horizon test |
| Gold means a human decision | SIS Color section | Role rule | Approval is the operator's decision; the console shows it |
| Read and write scopes are separate boxes | Rox, Appwrite | Permission pattern | Matches the maker, reviewer and gate credential split in the Cloud design |
| Secret shown once, then masked | Steel, Cohere, OpenAI | Key pattern | Three suppliers agree |
| Horizon starts from Drepute | Refero style, SIS imagery rule | Primary candidate | Environmental subject, one serif line, no chrome |
| Playbook page is Academy mode | SIS Academy definition | Mode assignment | The product is a learning artifact; proposed |
| Pairing has no reference | Two empty searches | Gap | RFC 8628 device code flow is not in Refero |

## Open items

1. **Mobbin.** The 2 Nov ruling says recommend a Mobbin quarter after two recorded Refero gaps. Device pairing is the first; the 3 Nov search was a second query on the same topic. Whether it counts as the second gap is Frank's call. Spend stays Frank's.
2. **Sameness risk.** The funnel atlas also uses Linear changelog as the primary for Agentic Income. Two brands on one primary reads as one family. The split here is marketing site (atlas) versus in-app console (this page); a reviewer should confirm that is visible in the rendered result.
3. **IDs to re-capture:** Cursor composer flow 9941 (reopen), SST, Tailwind, Gumroad, Square receipt, ElevenLabs license modal, Teachable trial timeline.
4. **Full styles not opened:** Drepute, Chantlings, Ableton. Open and date-stamp before any DESIGN.md cites a token.
5. **Review:** needs a different-provider read prompted as a buyer who declined, per AGENTS.md §5b.1.

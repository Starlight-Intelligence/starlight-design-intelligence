# Living Design repair-stack verification — v1

**Report author:** GitHub-hosted Copilot agent, acting as the independent verifier.  
**Coordinating lead:** Codex. This is an independent report, not a report authored by Codex.  
**Captured:** 2026-11-04 UTC.  
**Overall verdict:** **PARTIAL — do not promote or merge on this evidence.**

**Report PR:** [#78](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/78), draft against the supplied base. Tracking: `frankxai/agentic-ops-hub#437` and `Starlight-Intelligence/starlight-design-intelligence#61`.

This report verifies the bounded package journey against the requested candidate source. It is not a complete public release gate, production receipt, design approval, or commercial acceptance.

## Separate outcome verdicts

| Outcome | Verdict | Basis |
|---|---|---|
| Availability | **PARTIAL** | The locked workspace-linked example runs locally. The package README says it is not yet published to npm, and the checked-in runtime registry artifacts are stale relative to the repaired package sources. No preview or production deployment was accessed. |
| Functional behavior | **PARTIAL** | The repaired App Router composition, material tests, lifecycle tests, browser state changes, keyboard disclosure, and navigation work. Registry installation does not yet match workspace consumption. |
| Design | **PARTIAL** | Ink and Paper render and change via their CSS attributes; keyboard focus and the evidence disclosure work. There is no user-facing theme switcher, Operator foreground aliases do not agree, the intended fonts could not be fetched, and the dev-only detector result/previous static findings are not a full design pass. |
| Commercial sustainability | **UNKNOWN** | No customer trial, accepted-output, acquisition, repeat-use, support-cost, revenue, or margin evidence was collected. |

## Acceptance items

| Item | Verdict | Evidence / boundary |
|---|---|---|
| Supplied source identity and isolation | **PASS** | Base `2ab4ffd4db3513c018563de01e76e49da88592b9`; candidate commits verified below. Integration was detached in `/tmp/living-design-integration`; the report branch contains no product-source changes. |
| Existing demo baseline | **PASS, bounded** | `/`, `/glass`, `/paper`, `/ink` returned HTTP 200 before candidate integration. Eight desktop/mobile captures are under the evidence directory. Google Fonts requests failed; rendered typography fell back. |
| Next.js server/client boundary | **PASS for supported composition** | Base RSC import/call of `useGlassPlan` failed in the real Next compiler with the `useSyncExternalStore` Client Component diagnostic. After the candidate fix, a Server Component imported `gpuPlan`, `GlassSurface`, and `EvidenceDisclosure` from the package root and passed the hook to a separate `'use client'` island; `/barrel-probe` and the four demo routes returned 200. Calling a hook directly from an RSC remains invalid usage. |
| Materials and plugin regression suites | **PASS** | `corepack pnpm test`: 19 passed, 0 failed, 0 skipped. `node --test tests/living-design.test.mjs`: 32 passed, 0 failed, 0 skipped. On Linux the plugin suite creates a real directory symlink (`symlinkSync(..., 'dir')` on non-Windows). |
| Materials typecheck | **PASS** | `corepack pnpm typecheck` exited 0. |
| Generated registry parity | **BLOCKED** | The styles entry matches byte-for-byte, but `registry:build` changed the checked-in `glass-gate.json` and `glass-surface.json`. Thus a registry consumer would not receive all of the repaired workspace runtime. No actual clean-consumer `shadcn add` was performed. |
| Ink / Paper / Operator, evidence and keyboard | **PARTIAL** | Computed Ink and Paper variables changed; the Operator profile changed `--sl-fg`, but the actual on-surface alias stayed at the Ink value. The attributes were toggled by browser instrumentation; the example has no visible theme-switch control. Evidence disclosure opened/closed with Enter; keyboard focus on the Glass navigation link showed a 2px gold outline. |
| Glass fallback and recovery | **PASS on hosted software rendering; hardware performance unverified** | Desktop → phone → desktop produced WebGL → CSS (`phone layout`) → WebGL. Reduced motion and reduced transparency each selected CSS. Two real software-WebGL route remounts returned to WebGL without page errors. A delayed poster request was interrupted by navigation without an error, but its state remained the initial server CSS state; the deterministic cancellation regression is covered by the lifecycle test, which mocks Three.js. |
| Rendered design/accessibility | **PARTIAL** | No horizontal overflow at 1440×900 or 390×844. Sampled body/heading contrast was 18.38:1 Ink, 15.91:1 Paper, 18.03:1 Operator. The in-browser interface detector reported `icon-semantics` in Next’s injected `<nextjs-portal>` Dev Tools SVG across routes; this was recorded, not suppressed, and is not a clean production-page result. |

## Source and integration identity

- Repository: `Starlight-Intelligence/starlight-design-intelligence`
- Base branch: `agent/antigravity/living-design-trunk`
- Expected and verified base commit: `2ab4ffd4db3513c018563de01e76e49da88592b9`
- Candidate commits, verified against GitHub and fetched locally:
  - #74 `423166821449fddefc348d166eece5d728f80ee0` — Windows directory-link test fixture.
  - #75 `9aab5814a179b02f32af5bde35afa2a981d7f913`, then `32abde8cf5a6aaf8c4ba0bf15e7874259a724fce` — client boundary, context lifecycle, and regression entry points.
  - #77 `970e848d309863d0b7851f3988ea6f93efb72856` — theme, accessibility, and style registry changes.
- No empty initial agent commits were included.
- Temporary combined checkout commit: `fa549486c1bb9204b006ab297720aca3e41fd7d3`
- Temporary combined source tree: `2c4f5135ac0b85d8a7b42be3b563e8f248c03da9`
- The temporary test route, Next-generated files, and rebuilt registry outputs were removed/restored after capture. The temporary worktree is clean at the combined candidate commit. The report branch is limited to the assigned report/evidence paths.

The base reproduction used a temporary default Server Component importing and invoking `useGlassPlan` from `@starlight/materials`. Next.js 16.4.2/Turbopack returned HTTP 500 and reported that `useSyncExternalStore` is only available in Client Components, pointing to `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/src/gate/use-glass-plan.ts:1`. The supported composition follows the current Next.js guidance: `'use client'` declares a client entry boundary, while Server Components may compose Client Components. See [Next.js `use client`](https://nextjs.org/docs/app/api-reference/directives/use-client) and [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components). The direct `web_fetch` request was blocked by sandbox DNS; the official documentation search result was available. The exact compiler result is in `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v1/tests/next-boundary-result.txt`.

## Commands and results

Commands ran only in `/tmp/living-design-integration`, except where the command changes directory into `/tmp/living-design-integration/packages/materials/examples/next-app` or `/tmp/living-design-integration/packages/materials`:

| Command | Result |
|---|---|
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-integration/packages/materials/examples/next-app` | **PASS**, using its existing lockfile. |
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-integration/packages/materials` | **PASS**, using its existing lockfile. The linked example initially could not resolve the package’s CSS/JS dependencies until this package lockfile was installed. |
| `npm ci` at the temporary checkout root | **PASS**, exit 0. npm warned that the root package requests Node `>=24.14.0 <25`, while the host is Node `v22.23.4`; the materials/example packages request `>=22.18.0`. No manifests or lockfiles were changed. |
| `corepack pnpm test` in `/tmp/living-design-integration/packages/materials` | **PASS**, 19/19, 0 skipped. |
| `corepack pnpm typecheck` in `/tmp/living-design-integration/packages/materials` | **PASS**, exit 0. |
| `node --test tests/living-design.test.mjs` at checkout root | **PASS**, 32/32, 0 skipped; includes the Linux directory-symlink fixture. |
| `corepack pnpm registry:build` in `/tmp/living-design-integration/packages/materials` | **Command PASS**, exit 0, but exposed stale checked-in runtime registry outputs; see below. |

The two completed end-to-end browser attempts were the pre-repair baseline and the combined-candidate integration. No production `next build`, public deployment, or production verification was attempted. A preliminary dev-server startup failed before a browser attempt because of command argument handling and missing linked-package installs; the server was restarted correctly after installing only locked dependencies.

## Browser and rendered evidence

Browser: system Chromium `156.0.8078.0`, driven by locked Playwright `1.62.1`, DPR 1. The WebGL renderer was **ANGLE / SwiftShader software rendering**, not physical GPU hardware. Do not treat the hosted result as evidence of Frank’s local Arc GPU performance or a hardware frame budget.

- Baseline capture: `2026-11-04T05:36:59.791Z`; `/`, `/glass`, `/paper`, `/ink`; desktop 1440×900 and mobile 390×844. Every route returned 200.
- Candidate capture: `2026-11-04T05:43:42.045Z`–`05:43:58.225Z`; `/`, `/glass`, `/paper`, `/ink`, and temporary `/barrel-probe`; same desktop/mobile viewports. All returned 200 and had zero page errors.
- Lifecycle pass: `2026-11-04T05:45:31.683Z`–`05:45:36.923Z`; desktop Glass mounted and remounted twice through real Chromium software WebGL. Delayed-poster navigation was also exercised; the unit regression supplies the stronger deterministic asynchronous cancellation assertion.
- On the candidate Paper route, computed body background/text were `rgb(239, 237, 231)` / `rgb(14, 19, 27)`. Ink was `rgb(7, 10, 16)` / `rgb(251, 246, 235)`. Operator (`data-theme="ink" data-mode="operator"`) changed `--sl-bg` to `#0b0d12` and `--sl-fg` to `#e8ebf2`, but `--sl-color-on-surface` and rendered text remained `#fbf6eb`; contrast stayed high, but the semantic foreground mapping is inconsistent in `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/src/tokens/tokens.css:85,194-204`.
- Keyboard navigation reached the Glass link with `:focus-visible` and `outline: solid 2px rgb(240, 200, 126)`. The real `EvidenceDisclosure` rendered and toggled open/closed with Enter.
- The example has no visible Ink/Paper/Operator selector; theme evidence is from computed styles after changing supported DOM attributes, not from a user-facing switch journey.
- The app’s `next/font/google` imports could not reach `fonts.googleapis.com`; Next emitted fallback warnings for Instrument Sans, Instrument Serif, and IBM Plex Mono. Computed family declarations and screenshots are recorded, but the intended font files/weights are **not** proven to have rendered.
- The demo poster is the repository’s existing synthetic procedural example (`/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/examples/next-app/public/poster.png.vis.provenance.json`, `rights_status: generated-owned`, “not a brand asset”). No private session or customer data was used.

Screenshot names, exact route, CSS viewport, DPR, byte size, PNG dimensions, SHA-256, computed styles, detector output, and timestamps are in:

- `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v1/baseline/metadata.json`
- `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v1/integrated/metadata.json`
- `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v1/integrated/lifecycle-mount.json`

The evidence directory contains 19 PNGs and 28 files in total, occupying 2,026,361 bytes (under the 15 MB limit). The accompanying JSON report records screenshot metadata and per-image SHA-256 hashes. Captures are development-server evidence and do not establish production rendering.

## Registry mismatch

The materials-style registry item matches the source byte-for-byte; its committed and rebuilt SHA-256 are both `acedb66c986d87713bf825ddf7a0e5b04f495b5b07ebf967a87099ea4d670655`. The existing `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/tests/registry-parity.test.mjs:10-21` checks this style item only.

Running the existing registry build against the repaired source changed two checked-in generated files:

| Registry file | Candidate committed SHA-256 | Fresh build SHA-256 | Bytes |
|---|---|---|---|
| `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/public/r/glass-gate.json` | `734bb1dc376640fcf57f954e29a6da90714ffb9c7bf46917f8b8a812d6a875fd` | `9c17cd4871eb11033458197b78b6387468b4dc963d79d27f6efe23b65e0cf621` | 7423 → 7440 |
| `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/public/r/glass-surface.json` | `ef33aaae67fecb617dbd91216b98d56c2050435bdd1aa8e31ef06292a7176eda` | `388d37e28d0661ac92be1613a75bc184147540ace26fd2b9b153800e0152f11b` | 19245 → 19226 |

The first stale registry payload omits the new client directive at `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/src/gate/use-glass-plan.ts:1`; the second does not carry the forced-context-loss removal in `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/src/glass/mount-glass.ts:208-211`. The built outputs were restored in the isolated worktree and are **not** copied into this report PR. The next repair is to regenerate/commit these registry outputs, extend parity coverage to the runtime entries, and verify an install in a clean consumer.

## Design and release boundaries

The detector inspected actual hydrated DOM at both viewports. It reported one `icon-semantics` result on each route, originating in the injected Next.js development `<nextjs-portal>` Dev Tools SVG (open shadow root), not in the package’s rendered page DOM. This result was preserved rather than hidden. A production-server detector run was not performed. The request-provided parent scan’s 21 warnings and 3 advisories, including tiny atlas text and width animation, were not rerun or resolved here; no complete design verification is claimed.

Sources reviewed include `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/AGENTS.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/SYSTEM.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/SCHEMA.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/SKILLS.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/README.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/packages/materials/DESIGN.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/brand-packs/sis/DESIGN.md:272-283`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/starlight-material-foundations.md:40-62`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/interface-foundations.md:63-76`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/web-release-gate.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/product-outcome-release-standard.md:11-21`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/skills/world-class-web-release/SKILL.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/skills/motion-and-interaction/SKILL.md`, `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/typography-quality-gate.md`, and `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/evals/motion-purpose-gate.md`.

## CI status, risks, and next bounded action

GitHub Actions runs for the candidate design-kernel workflows were `action_required`; `list_workflow_jobs` returned zero jobs and `get_job_logs` reported zero failed jobs / no job logs for runs `41778038825`, `41778239372`, `41779787759`, and the later #75 runs `41781186539` / `41781186309`. These are **not** CI passes or CI failures.

**Next bounded action for the implementation owner:** regenerate the two runtime registry entries and broaden registry parity tests; then run a clean shadcn consumer install, user-visible theme switching including Operator, and a production-mode interface inspection with fonts available or locally sourced. A separate verifier should inspect the resulting evidence. Measure hardware performance only on an appropriate real device.

No product changes, dependency/lockfile edits, deployments, external sends, merges, or changes to the candidate PRs were made. No production approval is requested. Rollback for this report-only draft PR is to revert its report/evidence commit. The owning lead’s reconciliation and approval remain pending.

# Living Design integration verification — v2

**Report author:** GitHub-hosted Copilot agent. Underlying model/provider is not exposed by trusted runtime metadata; no provider identity or qualifying different-provider receipt is claimed.  
**Coordinating lead:** Codex (OpenAI), as identified in candidate #74.  
**Captured:** 2026-11-04 UTC.  
**Verdict:** **PASS for the bounded behavioral checks below; PARTIAL for overall package/release acceptance.** This does not satisfy the estate's known-different-provider merge policy.

This is a new verification wave for candidate #74 at exact head `773a211f61c56777d17746b8105f0c8319d0503a`, not a rerun or relabeling of v1 evidence. The v1 report and evidence remain unchanged. No product source, candidate branch, dependency manifest/lockfile, workflow, permission, deployment, or public endpoint was changed.

## Outcome boundaries

| Area | Verdict | What this evidence establishes |
|---|---|---|
| Availability | **PASS, local only** | Current source-backed registry entries were generated, installed from a local HTTP registry into a fresh temporary consumer, and compiled by Next.js. No npm publication, public endpoint, or deployment is claimed. |
| Functional behavior | **PASS, bounded** | Installed materials, lifecycle, registry-parity and type tests passed. A production browser sweep passed across the specified routes, profiles, fallback/recovery states and emulated mobile contexts. Real-browser WebGL emitted no `texImage3D` `INVALID_OPERATION`; real GPU performance and direct browser cancellation/poster-change assertions remain unproven. |
| Design / visual review | **PARTIAL** | Rendered contrast, focus, theme semantics, local font glyphs, reduced-motion/transparency behavior and the in-browser interface detector passed in the sampled journey. I visually inspected one desktop screenshot only; mobile screenshots and the broader parent design gate remain for lead review. |
| User value and commercial sustainability | **NOT EVALUATED** | No user acceptance, repeat use, acquisition, support-cost, revenue or margin study was performed. |
| Production / public release approval | **OUT OF SCOPE** | One local production build/start was exercised. No deployment, production URL, public release gate, or promotion approval is supplied. |

## Source identity and isolation

- Repository: `Starlight-Intelligence/starlight-design-intelligence`.
- Actual hosted origin: `http://localhost:26831/Starlight-Intelligence/starlight-design-intelligence` (sandbox Git proxy; not rewritten).
- Base branch and SHA: `agent/antigravity/living-design-trunk`, `2ab4ffd4db3513c018563de01e76e49da88592b9`.
- Candidate: #74, `773a211f61c56777d17746b8105f0c8319d0503a`; parent `423166821449fddefc348d166eece5d728f80ee0`; tree `1d610848052ee885df5ea245e005de2d6c3bcb69`.
- The candidate incorporates the #79 source contribution identified by the lead as `ffb3e08b6ac536e0586b6da78d520e785fcafff3`, plus lead repairs. The prior #79 report and diagnostics were read as context; their screenshots, build results and failures are not treated as this candidate's evidence.
- The task-owned detached source checkout was `/tmp/living-design-v2`. It was clean at the candidate SHA before setup and after restoring incidental generated files. Its repository tree ID remained `1d610848052ee885df5ea245e005de2d6c3bcb69`. Locked installs and generated `.next` files were confined to this checkout.
- The report branch is `copilot/verify-living-design-repair-stack`; this v2 report and evidence are the only new report-owned paths. The original v1 report and evidence were preserved.

## Commands and outcomes

All commands below used `/opt/hostedtoolcache/node/24.22.1/x64/bin/node` first in `PATH`, unless noted. Exact evidence is in `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v2/`.

| Command | Result |
|---|---|
| `npm ci` in `/tmp/living-design-v2` | **PASS**, exit 0; existing root lockfile; npm audit reported zero vulnerabilities. |
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-v2/packages/materials` | **PASS**, exit 0; existing materials lock. |
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-v2/packages/materials/examples/next-app` | **PASS**, exit 0; existing example lock. |
| `corepack pnpm registry:build` in `/tmp/living-design-v2/packages/materials` | **PASS**, exit 0, shadcn 4.22.1. Generated files were semantically equivalent; `glass-surface.json` differed only by a terminal newline. The diff is preserved, then the incidental file change was restored. |
| `corepack pnpm test` in `/tmp/living-design-v2/packages/materials` | **PASS: 20 passed, 0 failed, 0 skipped.** This includes installed shadcn generator parity, the lifecycle regression and all theme/boundary checks. |
| `corepack pnpm typecheck` in `/tmp/living-design-v2/packages/materials` and in `/tmp/living-design-v2/packages/materials/examples/next-app` | **PASS**, both exit 0. |
| `node --test tests/living-design.test.mjs tests/font-artifact.test.mjs` in `/tmp/living-design-v2` | **36 passed, 0 failed, 2 skipped.** Explicit skips: the missing-decoder denial case (decoder is installed) and the opt-in nine remote WOFF2 observations. The real local font files were separately verified by hashes, provenance, computed platform-font glyph use and the browser fallback journey. |
| `npm test` in `/tmp/living-design-v2`, clean tracked tree | **278 passed, 2 failed, 2 skipped** (282 total). The only two failures were unchanged adoption tests rejecting this hosted checkout's localhost origin with `kernel remote must be Starlight-Intelligence/starlight-design-intelligence`. No test or repository identity was edited to mask this environment limitation. |
| Initial `npm test` while the registry generator's newline-only output was still present | The same two origin failures also observed the transient tracked-file modification. Its raw output is preserved separately; it is not the clean-tree root-suite result above. |
| `corepack pnpm build` in `/tmp/living-design-v2/packages/materials/examples/next-app` | **PASS**, exit 0; Next.js 16.4.2/Turbopack compiled and prerendered `/`, `/glass`, `/ink`, `/paper`. This was the sole production build. |
| `corepack pnpm verify:consumer-themes` with `BASE_URL=http://127.0.0.1:33317`, `CHROME_BIN=/usr/bin/chromium`, and the v2 evidence directory | **PASS**, exit 0, one complete run of the committed script. The full browser receipt, warnings/errors and screenshot hashes are preserved in `browser.json`. |
| Fresh local registry installation | **PASS, bounded.** The installed locked shadcn CLI fetched the current local registry and created 13 files for glass and the three material primitives. A disposable consumer's initial CLI dependency step resolved registry ranges through npm; that disposable package lock and its `node_modules` were discarded before compilation. The compiler used a temporary overlay of dependencies already installed from the exact candidate's existing locks. No source manifest or lockfile changed. |
| Registry consumer `tsc --noEmit` and Next 16.4.2 App Router dev compile | **PASS after a harness setup correction.** TypeScript exited 0; Next rendered the isolated RSC/client-component route at HTTP 200. Its Server Component imported installed `gpuPlan`; the client `GlassSurface` came from the generated registry files. The first minimal harness attempt returned HTTP 500 because its CSS/PostCSS and external dependency roots were incomplete. The test-only harness was corrected using the existing locked `tw-animate-css`, PostCSS config and a Turbopack root covering the dependency symlink; the same route then returned 200. This is consumer compile evidence, not another production build or browser sweep. |

The full root failure log, the initial dirty-tree root log, production build log, registry diff, Next-generated `tsconfig.json` diff, registry-consumer install output and consumer compile output are retained under the v2 evidence directory. Next.js rewrote the example `tsconfig.json` during the sole production build; that incidental rewrite was captured and restored. Final source-checkout status was clean.

## Renderer lifecycle and registry delivery

The exact candidate calls the public `renderer.resetState()` before disposal and keeps disposal in `finally` at `/tmp/living-design-v2/packages/materials/src/glass/mount-glass.ts:210-215`. Its mocked lifecycle test sets stale unpack flags during render, checks reset and reuse, and checks disposal when reset throws at `/tmp/living-design-v2/packages/materials/tests/glass-lifecycle.test.mjs:87-103,214-217,289-291`. These are mocked state assertions; they are not themselves a real WebGL proof.

The installed production browser journey passed the candidate's final assertion against `WebGL.*INVALID_OPERATION`. In particular, its recorded `desktop-phone-desktop, transparency fallback/recovery and two route remounts` reached WebGL → CSS → WebGL and CSS reduced-transparency fallback → WebGL recovery, with no `texImage3D` unpack-state `INVALID_OPERATION` in captured console diagnostics. The browser also exercised reduced-motion CSS fallback. This supports the reset behavior on the hosted browser/context; it does not prove a specific GPU or hardware performance. The browser sweep did not change the poster URL or deliberately cancel a pending browser texture load. Poster change, async abort and preference cancellation remain covered only by the mocked lifecycle regression.

The parity test runs the locked installed generator into a temporary directory, compares all seven source-backed registry entries and the index, and checks each source/install mapping at `/tmp/living-design-v2/packages/materials/tests/registry-parity.test.mjs:13-58`. Its installed-dependency test ran with **zero skips**. `registry:build`'s only raw text difference was the missing final newline in generated `glass-surface.json`; parsed registry content and mappings matched, and the clean local-registry consumer installed/compiled the published component files.

## Production browser evidence

- Source bound by the browser receipt: `773a211f61c56777d17746b8105f0c8319d0503a`.
- Browser receipt start: `2026-11-04T07:33:08.963Z`; screenshot capture interval: `07:33:25.634Z`–`07:33:49.276Z`.
- Node `v24.22.1`; Next.js `16.4.2`; system Chromium `/usr/bin/chromium`, `156.0.8078.0`; Playwright `1.62.1`.
- Renderer: **ANGLE / SwiftShader software WebGL**. This is not hardware-GPU, Arc, or Frank's local performance evidence.
- Routes: `/`, `/paper`, `/ink`, `/glass`; profiles Ink, Paper, Operator; CSS viewports 1440×900 and 390×844; DPR 1. The mobile browser contexts set Playwright `isMobile: true` and `hasTouch: true`. This is mobile/touch emulation, not a physical phone; theme choices were selected programmatically in the sweep, not by a physical touch gesture.
- The full sweep recorded 50 state entries, including all 24 route/profile/viewport combinations and supplementary reduced-motion, reduced-transparency, font-failure and no-JavaScript states. The interface detector completed with no failures in those route/profile states.
- Computed sampled contrast minima across the 24 route/profile/viewport states: heading **15.63:1**, headline accent **4.52:1**, selector text **15.91:1**, selector focus outline **4.52:1**. The route-local Paper foreground remained dark on Paper while outer profiles changed. Operator's rendered foreground was `rgb(232, 235, 242)` on `rgb(11, 13, 18)`.
- Keyboard: native select changed profile with ArrowDown/Enter; the Sheet opened with Enter, closed with Escape, and restored focus to its trigger. Focus styles and Paper button contrast assertions passed. The server-rendered no-JavaScript route retained CSS glass/readable default Ink and showed a disabled selector.
- Reduced motion selected the CSS tier. On desktop, reduced transparency selected CSS and recovery returned to WebGL. Desktop → phone-width → desktop and two repeated Glass route remounts completed. No direct delayed-poster cancellation was asserted in this browser sweep.
- Fresh browser contexts aborted font requests to check fallback at both viewports. The browser observed fallback system fonts with custom files blocked (4 blocked requests per context); in the ordinary run, all observed font requests were local to `127.0.0.1:33317`. CDP reported custom glyphs for Instrument Sans, Instrument Serif italic, and IBM Plex Mono. The pinned upstream provenance/license/hash test passed; no Google Fonts request was part of this test.
- `browser.json` contains the exact state readings, font request log, captured console diagnostics and per-screenshot URL, time, DPR, dimensions, bytes and SHA-256. It records **17 PNGs**. The sole recorded console error was the example's `favicon.ico` 404; there were **0 page errors**, no hydration/React diagnostic and no `WebGL.*INVALID_OPERATION`.
- All 17 PNGs are content-addressed. I visually inspected `desktop-home-operator.png`, which shows the selector and focus ring. The image-viewer limit prevented inspection of additional exports; mobile screenshots are not visually approved here and remain for lead inspection.

## Explicit failures, limits, and next bounded action

- The clean root suite's two adoption tests remain blocked by the localhost origin proxy, although the materials suite and local registry consumer passed. GitHub Actions for the exact #74 head showed completed success for media registry (`41792090859`), font artifact (`41792091022`) and design kernel (`41792091148`). These CI checks are corroboration, not a substitute for the recorded executions. The earlier #78 report branch workflows marked `action_required` with zero jobs are unrelated to this candidate.
- The single full production browser sweep passed, but the client code uses a test harness that doesn't simulate a physical touch gesture. Browser cancellation/poster change was not directly verified; the lifecycle's abort path is mocked.
- The exact generated registry JSON differs from the checked-in bytes by one terminal newline in `glass-surface.json`; semantic content, full installed parity test and current local registry consumption passed.
- I visually reviewed only one screenshot. The parent #73 scan's 21 warnings and three advisories, complete design distinction, production deployment, hardware performance, independent release approval, user value and commercial sustainability remain outside this bounded verdict.
- No qualifying different-provider identity was exposed. This behavior report is not an independent-provider merge attestation.
- The production server, local registry server, consumer dev server, browser, and all test-owned processes were stopped. Report evidence totals **1,907,487 bytes** before this Markdown/JSON addition and remains far below the 15 MiB cap. The exact evidence files are under `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v2/`.

**Next bounded action:** the lead inspects the remaining mobile exports, confirms the two root-suite proxy failures are expected for this hosted origin, and obtains any separately required different-provider review before deciding whether to reconcile or promote the candidate. No merge or deployment is requested here.

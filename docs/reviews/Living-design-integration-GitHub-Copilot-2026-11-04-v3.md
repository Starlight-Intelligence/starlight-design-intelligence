# Living Design integration verification — v3

**Report author:** GitHub-hosted Copilot agent. Trusted runtime metadata does not expose an underlying model/provider; none is inferred, and this is not a qualifying different-provider merge receipt.
**Coordinating lead:** Codex (OpenAI), identified in the candidate PR.
**Captured:** 2026-11-04 UTC.
**Wave outcome:** **BLOCKED on a reproduced rendered-contrast assertion.** The committed full browser sweep stopped on its first failing actual Glass/Paper contrast sample. Earlier v1/v2 reports and evidence are preserved; their source and receipts are not relabeled as current-head proof.

## Verdicts

| Area | Verdict | Evidence boundary |
|---|---|---|
| Availability | **PARTIAL, local** | Frozen installs, installed registry parity, and a fresh registry generation passed with no diff. A fresh consumer installation/compile was not repeated for this changed head. No publication or deployment is claimed. |
| Functional behavior | **PARTIAL** | Materials tests and typechecks passed. In the actual production browser, the selector stayed at 16px and the traced `uInk` uploads matched computed Ink and Paper tokens on desktop `/glass`. The full sweep aborted on contrast before Operator, mobile, recovery/remount, and later assertions. |
| Design / visual review | **BLOCKED** | The rendered Paper accent over the actual Glass backdrop measured **2.738:1**, below the committed **3:1** minimum. The check was not weakened. |
| User value / commercial sustainability | **NOT EVALUATED** | No user acceptance, repeat-use, acquisition, support-cost, revenue, or margin evidence. |
| Production / public release approval | **OUT OF SCOPE** | One local production build and partial local browser run are not deployment, production proof, or release approval. |
| Different-provider merge policy | **NOT SATISFIED BY THIS REPORT** | Underlying provider is unknown to trusted runtime metadata. |

This is a specific candidate blocker, not approval of the remaining product or the parent #73 design/release gate. No product source, test, candidate branch, lockfile, workflow, identity, or prior report was changed.

## Source identity and isolation

- Repository: `Starlight-Intelligence/starlight-design-intelligence`.
- Candidate #74: `2e36fe1836881fb6060c852693d629a544215a17`; parent `773a211f61c56777d17746b8105f0c8319d0503a`; tree `e0406116c815f3ad22941e8c139357be15a04410`.
- Base: `agent/antigravity/living-design-trunk`, `2ab4ffd4db3513c018563de01e76e49da88592b9`; base tree `042c57681cc0afacca73490d3d3df4b1d89b64fa`.
- Detached test checkout: `/tmp/living-design-v3`. It was clean before setup and after restoring the incidental Next-generated config and registry output; final candidate tree remained `e0406116c815f3ad22941e8c139357be15a04410`.
- The report branch contains only the new v3 report and `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v3/`. V1 and v2 hashes were recorded before this wave and remain unchanged.

## Commands and outcomes

Commands ran in the detached candidate checkout using hosted Node `v24.22.1` and existing frozen lockfiles only. Exact output is retained under the v3 evidence directory.

| Command | Result |
|---|---|
| `npm ci` at `/tmp/living-design-v3` | **PASS**, exit 0; 22 packages; audit reported 0 vulnerabilities. |
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-v3/packages/materials` | **PASS**, exit 0; lockfile unchanged; pnpm 12.16.1. |
| `corepack pnpm install --frozen-lockfile` in `/tmp/living-design-v3/packages/materials/examples/next-app` | **PASS**, exit 0; lockfile unchanged. |
| `corepack pnpm test` in `/tmp/living-design-v3/packages/materials` | **PASS: 20 passed, 0 failed, 0 skipped.** Installed shadcn registry parity ran (not skipped), including generation and mapping comparisons. |
| `corepack pnpm typecheck` in `packages/materials` and in `packages/materials/examples/next-app` | **PASS**, both exit 0. |
| `npm test` in `/tmp/living-design-v3` | **278 passed, 2 failed, 2 skipped** (282 total). The two failures were unchanged adoption tests rejecting the hosted localhost Git-proxy origin with `kernel remote must be Starlight-Intelligence/starlight-design-intelligence`. The two explicit skips were the missing-decoder denial case (decoder installed) and opt-in nine remote WOFF2 observations. Repository identity/tests were not altered. |
| `corepack pnpm registry:build` in `/tmp/living-design-v3/packages/materials` | **PASS**, exit 0. All registry entries built; generated tracked registry diff was empty. |
| `corepack pnpm build` in `/tmp/living-design-v3/packages/materials/examples/next-app` | **PASS**, exit 0; Next.js 16.4.2 compiled and prerendered `/`, `/glass`, `/ink`, `/paper`. This was the sole production build. |
| `corepack pnpm verify:consumer-themes` with `BASE_URL=http://127.0.0.1:33319`, `CHROME_BIN=/usr/bin/chromium`, `EVIDENCE_DIR` set to the v3 evidence directory | **FAIL, once, at 08:23:02 UTC.** The complete committed script started and preserved its failure receipt. It stopped at the rendered Paper accent threshold described below. No second or reduced browser run was substituted. |

Next rewrote `/tmp/living-design-v3/packages/materials/examples/next-app/tsconfig.json` during the production build. Its exact diff is retained as `next-generated-tsconfig.diff`; the file was restored. A first production-start invocation from the repository root failed with `ERR_PNPM_NO_SCRIPT_OR_SERVER` because that directory has no `start` script; the recorded correction ran `pnpm start` from the example package, returned HTTP 200 on `/glass`, and was the only production server started. The server and browser were stopped after the failed sweep.

GitHub Actions were checked on the expected base first and then the candidate branch. The three base runs and the three runs for exact candidate head `2e36fe1836881fb6060c852693d629a544215a17` (Media registry, Font artifact decoding, Design kernel) all completed successfully. These workflows do not override the local browser failure or root-suite environment failures.

## Three review repairs exercised

1. **Theme selector size:** `packages/materials/examples/next-app/app/globals.css` now inherits only the label's font family. The actual computed selector size was **16px** at every visited route/profile state; its new `>=16px` assertion passed through desktop `/glass` Ink and Paper. This is Chromium evidence, not physical iOS behavior.
2. **Live shader theme updates:** The current committed script instrumented WebGL calls only in its isolated browser contexts. On running desktop `/glass`, actual `uInk` uploads matched computed CSS primary tokens for Ink (`[7,10,16]/255`) and Paper (`[239,237,231]/255`). The current materials lifecycle test also passed its mocked ancestor-observation, coalescing, teardown-disconnect, and no-restart assertions. Operator shader upload was not reached by the browser because the sweep stopped first.
3. **Rendered poster/canvas contrast:** The script first validated its four test fixtures: both poster and canvas returned **21:1** for white and **1:1** for black. It then screenshotted and decoded the actual rendered Glass heading/accent backdrop, with glyphs hidden, on desktop `/glass`.

The actual Paper Glass heading foreground was `rgb(14, 19, 27)` and measured **8.876:1** across 16,056 pixels. Its accent foreground was `rgb(138, 101, 34)` and measured **2.738:1** across 1,519 pixels (`49×31`), failing the required `>=3` assertion at `/tmp/living-design-v3/packages/materials/examples/next-app/scripts/verify-consumer-themes.mjs:255`. Worst sampled backdrop pixel was `rgb(181, 188, 185)` at `(0,29)`. This is a real rendered-canvas/backdrop observation in Chromium, not a CSS ancestry estimate or fixture-only result. The exact error and image hashes are in `browser.json`.

**Smallest next repair:** adjust the Paper Glass accent foreground or provide a localized backing for that accent so the full sampled backdrop meets at least 3:1. Keep the existing threshold and detector unchanged. Then run the complete committed sweep against the repaired exact head; this report did not continue past the first defect.

## Browser and artifact limits

- Browser run source: candidate SHA `2e36fe1836881fb6060c852693d629a544215a17`; captured `2026-11-04T08:22:30.277Z`–`08:23:02Z`.
- Node `v24.22.1`; Next.js `16.4.2`; Playwright `1.62.1`; Chromium `156.0.8078.0`.
- Chromium launch requested SwiftShader using `--use-angle=swiftshader --enable-unsafe-swiftshader`. The full sweep aborted before its later unmasked-renderer collection, so the exact renderer string was not recorded. No physical-GPU or local Arc performance evidence is claimed.
- Only desktop `1440×900`, DPR 1, was reached. Routes `/`, `/paper`, and `/ink` completed all three profiles; `/glass` completed Ink and Paper before the Paper accent assertion failed. No mobile/touch context, Operator `/glass`, reduced-motion/transparency, desktop-phone-desktop, recovery, remount, or no-JavaScript assertion was reached.
- The receipt contains 19 state records and six full-page desktop PNGs (home and Paper routes across three profiles), plus rendered backdrop/fixture PNGs. `browser.json` records per-image hashes, bytes and dimensions; the backdrop assertions additionally record pixel counts and worst pixels. Total v3 evidence is **604,799 bytes**, below the 15 MiB limit.
- Browser diagnostics captured one example favicon 404 and zero page errors before abort. The script's final diagnostic assertions were not reached; do not treat that as a completed console-clean result.
- The image viewer displayed one small rendered accent-backdrop crop. Its limit prevented visual review of full-page exports; there are no mobile captures. Aesthetic/mobile visual approval remains pending.

**Overall next action:** repair the Paper Glass accent contrast without weakening the threshold, then request a new complete exact-head verification. Keep user value, commercial sustainability, parent #73 design findings, deployment, hardware performance, and independent-provider acceptance separate.

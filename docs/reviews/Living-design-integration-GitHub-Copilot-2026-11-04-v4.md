# Living Design integration verification — v4

**Report author:** GitHub-hosted Copilot agent. Trusted runtime metadata does not expose an underlying model/provider; none is inferred, and this is not a qualifying different-provider merge receipt.
**Coordinating lead:** Codex (OpenAI), identified in the candidate PR.
**Captured:** 2026-11-04 UTC.
**Verdict:** **PASS for this bounded v4 regression journey; PARTIAL for visual/release acceptance.** The previous v3 rendered Paper/Glass failure is preserved and was retested against this new exact source, not relabeled.

## Separate outcomes

| Area | Verdict | Evidence boundary |
|---|---|---|
| Availability | **PASS, local generation/parity only** | Frozen installs, installed shadcn parity, and fresh locked registry generation all passed with no registry diff. A fresh registry consumer install/compile was not repeated for this head. No publication or deployment is claimed. |
| Functional behavior | **PASS, bounded** | Materials tests, both typechecks, and the complete committed Chromium journey passed. This includes all 24 route/profile/viewport combinations and the current registry-backed source. |
| Design / visual review | **PARTIAL** | Actual Paper/Glass pixel contrast cleared the unchanged threshold at desktop and mobile; browser detector checks had no failures. The viewer quota prevented human visual inspection of the exported desktop/mobile Glass screenshots, so lead visual review remains open. |
| User value / commercial sustainability | **NOT EVALUATED** | No user-acceptance, repeat-use, acquisition, support-cost, revenue, or margin evidence. |
| Production / public release approval | **OUT OF SCOPE** | One local production build and browser run are not deployment, production proof, or release approval. |
| Different-provider merge policy | **NOT SATISFIED BY THIS REPORT** | Underlying provider is not exposed by trusted runtime metadata. |

This report verifies only the bounded candidate changes. The parent #73 design/release gate, user value, commercial acceptance, production approval, hardware performance, and an independent-provider receipt remain separate.

## Source identity and preservation

- Repository: `Starlight-Intelligence/starlight-design-intelligence`.
- Candidate #74: `924d615f06fdf88a1306731e9ae94a3d56d93167`; parent `2e36fe1836881fb6060c852693d629a544215a17`; tree `b6a66ee93d3cf05e0c7ecd91a7c3c2a4f2c3abef`.
- Base: `agent/antigravity/living-design-trunk`, `2ab4ffd4db3513c018563de01e76e49da88592b9`; tree `042c57681cc0afacca73490d3d3df4b1d89b64fa`.
- Detached verification checkout: `/tmp/living-design-v4`. It was clean before setup and after build-output restoration; final source tree remained `b6a66ee93d3cf05e0c7ecd91a7c3c2a4f2c3abef`.
- The v4 report branch contains only the v4 Markdown/JSON and its new evidence directory. V1, v2, and v3 reports and artifacts remain unchanged. Their report SHA-256 values are recorded in the v4 JSON.
- No product source, candidate branch, dependency manifest/lockfile, workflow, identity, permission, deployment, or public endpoint was changed.

## Commands and outcomes

Commands used hosted Node `v24.22.1` and existing frozen dependency locks. Full stdout/stderr and the browser receipt are under `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence/docs/reviews/living-design-integration-GitHub-Copilot-20261104-v4/`.

| Command | Result |
|---|---|
| `npm ci` in `/tmp/living-design-v4` | **PASS**, exit 0; 22 packages; audit reported 0 vulnerabilities. |
| `corepack pnpm install --frozen-lockfile` in `packages/materials` and `packages/materials/examples/next-app` | **PASS**, both exit 0; pnpm 12.16.1; existing locks unchanged. |
| `corepack pnpm test` in `packages/materials` | **PASS: 21 passed, 0 failed, 0 skipped.** Installed shadcn generator parity ran; not skipped. |
| `corepack pnpm typecheck` in `packages/materials` and `packages/materials/examples/next-app` | **PASS**, both exit 0. |
| `node --test tests/living-design.test.mjs tests/font-artifact.test.mjs` at the repository root | **PASS: 36 passed, 0 failed, 2 skipped** (38 total). Explicit skips: missing-decoder denial case (decoder installed), and nine opt-in remote WOFF2 observations. |
| `corepack pnpm registry:build` in `packages/materials` | **PASS**, exit 0; all seven registry entries built; generated `public/r` diff was empty. |
| `corepack pnpm build` in the Next example | **PASS**, exit 0; Next.js 16.4.2 compiled and prerendered `/`, `/glass`, `/ink`, `/paper`. This was the only production build. |
| `corepack pnpm start --hostname 127.0.0.1 --port 33321` in the example, followed by `corepack pnpm verify:consumer-themes` | **PASS**, one production start and one complete script run; browser exit 0. |

Next rewrote the example `tsconfig.json` during the production build. The exact incidental diff is preserved in `next-generated-tsconfig.diff`; the file was restored. The source checkout was clean afterward.

The root `npm test` suite was **not rerun** in this wave, per the request to avoid spending the bounded budget re-diagnosing the known hosted localhost-origin adoption-test issue. V3 records the earlier root result and exact proxy error; that historical result is not relabeled as a v4 run. The three GitHub Actions checks on the expected base were successful, and the exact v4 candidate's Media registry (`41800650858`), Font artifact (`41800650782`), and Design kernel (`41800650845`) checks completed successfully. These checks do not substitute for the root suite.

The separate registry consumer install/compile from v2 was not rerun and is not claimed as v4 evidence.

## Repaired contrast and browser results

The exact v3 failure measured Paper's previous bright accent at **2.738:1** against the actual Glass backdrop. Candidate v4 changes only Paper's large-text bright gold to `#6b4c19`; it retains the existing base gold, focus/status colors, shader tint, and the browser's **3:1** large-accent threshold. It also adds a token regression against the exact prior worst pixel `#b5bcb9` and the conservative darker bound `#a7a5a1`, and updates the generated `materials-styles` entry.

The current full browser run then measured the rendered Glass accent at:

| Profile | Desktop `1440×900` | Mobile-emulated `390×844` |
|---|---:|---:|
| Ink | 10.041:1 | 10.824:1 |
| Paper | **4.062:1** | **4.112:1** |
| Operator | 9.914:1 | 11.143:1 |

All are above the unchanged 3:1 threshold. Glass heading contrast also passed the 4.5:1 requirement in all six profile/viewport states. The measurements decode the actual screenshot backdrop with text glyphs hidden and sample every pixel in the text element box; they are not computed from CSS ancestry alone. The negative/positive test fixtures also passed: black text against white poster/canvas produced 21:1; against black poster/canvas, 1:1.

The full committed script completed all **24** route/profile/viewport combinations: `/`, `/paper`, `/ink`, `/glass` × Ink/Paper/Operator × 1440×900 and 390×844. The selector measured 16px in each state. Desktop `/glass` traced actual shader `uInk` uploads matching computed profile tokens: Ink `[7,10,16]/255`, Paper `[239,237,231]/255`, Operator `[11,13,18]/255`. The rendered-interface detector reported no failures in the 24 route/profile states.

The same full sweep completed its keyboard selector and Sheet open/Escape/focus-return checks; focus and control contrast assertions; local font glyph checks; fresh-context font-failure fallback at both viewports; reduced-motion CSS fallback; reduced-transparency fallback and WebGL recovery; desktop→phone-width→desktop; two route remounts; and no-JavaScript CSS-glass/default-Ink/disabled-selector assertions. Browser theme selection is automated in the test; Playwright `isMobile`/`hasTouch` is emulation, not a physical touch gesture or iOS run.

## Browser identity, diagnostics, and evidence

- Exact browser source: `924d615f06fdf88a1306731e9ae94a3d56d93167`.
- Browser run: `2026-11-04T08:41:56.534Z` to `08:43:03Z`; production server ready at `08:41:49Z`.
- Node `v24.22.1`; Next.js `16.4.2`; Playwright `1.62.1`; Chromium `156.0.8078.0`.
- Renderer: **ANGLE / SwiftShader software WebGL**. This is a real Chromium WebGL context using software rendering, not a physical GPU, Arc device, or Frank's local performance evidence.
- Viewports: CSS `1440×900` and `390×844`, DPR 1. Mobile contexts set Playwright `isMobile: true` and `hasTouch: true`.
- Receipt: 51 state records, 23 full-page screenshots, plus 16 actual-backdrop/fixture PNGs. The browser receipt contains every file's SHA-256, byte count and dimensions; `browser.json` and the verification command output also preserve exact routes, timings, font requests, diagnostics and measured pixels. All 39 PNG files were independently re-hashed and their dimensions verified.
- The screenshot sweep requested and loaded 56 font-resource requests, all from the local test origin. CDP reported positive custom-font glyph counts for Instrument Sans, Instrument Serif italic, and IBM Plex Mono. Fresh-context font-failure runs blocked four font requests per viewport and passed the fallback assertions.
- The sole console error was the example favicon 404; there were zero page errors. The full script's final diagnostic checks passed, including no hydration/React or WebGL `INVALID_OPERATION` error.
- V4 evidence bundle size: **3,113,716 bytes**, below the 15 MiB cap.
- **Human image inspection:** the image viewer had already exhausted its image quota before this wave. Desktop and mobile Glass exports, including Paper, are preserved and content-addressed, but I could not visually inspect them. Lead inspection remains required before claiming visual approval.

**Next bounded action:** lead visually inspects the preserved desktop/mobile Glass exports, especially Paper. Keep the prior v3 contrast failure visible as historical evidence; v4 supplies a new exact-source pass for that repair. No production promotion, commercial acceptance, hardware performance result, or independent-provider merge approval follows from this report.

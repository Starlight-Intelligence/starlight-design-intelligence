# Living Design consumer repair — v1

**Author:** GitHub-hosted Copilot coding agent, maker/self-checker. The underlying model identity is not exposed.  
**Requester/coordinating lead:** Codex. **Date:** 4 November 2026 UTC. **Revision:** 1.  
**Draft PR:** #79 against `agent/antigravity/living-design-trunk`. Tracking: `frankxai/agentic-ops-hub#437`, product #61.  
**Verdict: PARTIAL. Do not merge or promote on this evidence.** The bounded source repairs are implemented, but the complete browser acceptance gate is not green.

## Separate outcomes

| Outcome | Verdict | Evidence boundary |
|---|---|---|
| Availability | Partial | Local production workspace and isolated registry consumer work. No npm publication, public endpoint or deployment was established. |
| Functional behavior | Partial | Final 20 materials tests and 32 plugin tests pass; types, production build and actual registry add/import/compile pass. Full browser sweeps stopped on a contrast defect, then a verifier serialization bug. A subsequent bounded manual recovery check exposed unresolved WebGL warnings. |
| User value | Not evaluated | Implementer mechanics were exercised, not acceptance by intended users against their alternative. |
| Design distinction | Not re-approved | Existing identity/routes/defaults retained. New exports have hashes but could not be visually reviewed because of the image tool limit. Parent 21 warnings and three advisories remain unassigned and unsuppressed. |
| Commercial sustainability | Unknown | No acquisition, repeat-use, accepted-output, cost, revenue or margin study. |

This is a maker receipt, not independent verification. Codex must review the returned exact revision before any integration. No merge, deployment, existing-PR closure, external send, Windows operation, paid call, extra agent, credential/CI/permission change or source dependency upgrade was performed.

## Identity, isolation and prior evidence

Hosted root (`R` below): `/home/runner/work/starlight-design-intelligence/starlight-design-intelligence`.

- Verified repository: `Starlight-Intelligence/starlight-design-intelligence`.
- Actual origin: `http://localhost:26831/Starlight-Intelligence/starlight-design-intelligence`, the sandbox Git proxy. It was not rewritten.
- Expected/fetched base: `2ab4ffd4db3513c018563de01e76e49da88592b9`.
- Task-owned branch: `copilot/finish-consumer-journey`; native bootstrap HEAD was `3fc81001dce40e035f83809c197aa18588282dcd`.
- Imported, **in order**, using `git cherry-pick --no-commit`, then one import commit:
  1. #74 `423166821449fddefc348d166eece5d728f80ee0`
  2. #75 `9aab5814a179b02f32af5bde35afa2a981d7f913`
  3. #75 `32abde8cf5a6aaf8c4ba0bf15e7874259a724fce`
  4. #75 `d4319599b48771632138d1f87097e9e357f8011d`
  5. #77 `970e848d309863d0b7851f3988ea6f93efb72856`
- Exact candidate diffs were inspected first. Import commit: `1451279c5517911ebc1ce12a6637b4adb6689afe`. No candidate empty initial commits or #78 report commits were imported.
- Main repair/build-2 source: `a9f73785353a35ab3f47064dacae13e4b7a2c3c3`.
- Final verification-code revision: `fe783f7d52253abb49794cc6e49c54ce1aa25d28`. Its runtime sources, layout, fonts, control and registry are byte-identical to build 2; only the browser verifier/evidence changed afterward. The final report/evidence commit is necessarily later.
- The #74 fixture blob remains exactly `b84875ccd720348b758e4d547bbff3f411a0b88b`, equal to the specified candidate. #75 runtime and regression files remain unchanged after import.
- Read root AGENTS (no deeper scoped AGENTS found), materials DESIGN/README, world-class-web-release, typography/interface/editorial/motion/web and product-outcome gates, motion skill, and SIS brand sources. This repair did not reopen identity directions or architecture. No native ownership/router tool was exposed or discovered.
- Read #78 at `aee128af59c2e24dfada26c34e9a1ca5b6c15821`, its JSON, artifacts and comments. Its earlier rendered evidence at `4d68329e0584d9bd092971e345d9d454efe2da38` is historical context, **not proof of this revision**. The lead's Windows/Node-24 resolution stub remains mocked test-entry evidence, not browser/real-Three proof.

## Repairs and maintainability choice

1. **Registry:** ran the existing locked shadcn **4.22.1** generator. The generated gate now carries the hook's client directive; generated glass no longer forces context loss. Only the three entries whose contents changed are in the repair diff. Parity now runs the actual installed generator into a temporary directory, compares all seven entries plus the registry index, checks every source/type/target mapping and CSS bytes, and cleans up. It is not a marker-string test.
2. **Aliases:** shared semantic aliases are re-declared at every explicit profile boundary. CSS resolves `var()` before inheritance; merely inheriting an alias and overriding its referenced variable below it is insufficient. Operator gets the Ink defaults plus its explicit overrides and foreground `#e8ebf2`. Paper materials keep their light surface/dark text pair inside dark outer profiles. Default Ink on-surface remains `#fbf6eb`.
3. **Canonical aliases versus literals:** shared semantic references keep backgrounds, text, glass, borders and focus connected to one profile palette; profile-specific surface pairs remain explicit. Copying all literal aliases into each profile would duplicate the palette and recreate drift. The selector-boundary rebinding is essential; a root-only alias block would still be wrong.
4. **Control:** a labelled native select in the existing shell exposes Ink/Paper/Operator. It has a 44px target, native selected state and keyboard semantics, wrapping layout, no new animation, no storage/API, and default Ink on SSR/reload. Operator uses the existing `data-theme="ink"` / `data-mode="operator"` convention; switching away removes only that root mode. Route-local attributes remain untouched.
5. **Concrete additional defect:** first production inspection measured Paper's pre-existing bright gold at **2.979942:1** against Paper. Paper bright gold now references its existing contrast-safe gold instead of adding a new color. Static regression checks cover the large-text threshold; complete final rendered coverage remains pending.

## Licensed fonts

The layout uses `next/font/local`, not `next/font/google`. Unmodified official Google Fonts originals are pinned to repository revision `2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc`.

| Original file | Style / weights | Bytes | SHA-256 |
|---|---|---:|---|
| `InstrumentSans[wdth,wght].ttf` | Normal, variable 400–700; default width | 194336 | `b24f1812584816958afcf22e22d08e44318c5e51651e25d2438efdde389b33b1` |
| `InstrumentSerif-Italic.ttf` | Italic 400 | 71592 | `08939b8bdf534afec24ae0ef5e03f948940cd9a8fe08e7fecbad040e62327385` |
| `IBMPlexMono-Regular.ttf` | Normal 400 | 135580 | `6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46` |

**401,508 font bytes total**, below 2 MB. Each original SIL OFL 1.1 copyright/license is retained. Exact source URLs, Git blob identities, license URLs/hashes and file sizes are in `$R/packages/materials/examples/next-app/app/fonts/provenance.json`. No substitute family, font conversion, media generation or license invention.

The existing bounded font decoder accepted all three actual files. `production-fonts.json` records final-build CDP custom-font glyphs: Instrument Sans, Instrument Serif italic and IBM Plex Mono. All observed font URLs were local. Instrument Sans produced encoded/unencoded bracket URL variants and an unused-preload warning; this is retained, not labelled a perfect loading result. The failed-font fallback branch of the full browser verifier was **not reached**.

## Commands, environment and results

All source commands used installed hosted `/opt/hostedtoolcache/node/24.22.1/x64/bin` first in `PATH`. Initial Node 22.23.4 discovery was not counted as engine proof. No Node download/install on another machine was needed.

| Command / operation | Actual result |
|---|---|
| `cd "$R" && npm ci` | Exit 0; existing root lock only; audit reported zero vulnerabilities. |
| `cd "$R/packages/materials" && corepack pnpm install --frozen-lockfile` | Exit 0. |
| `cd "$R/packages/materials/examples/next-app" && corepack pnpm install --frozen-lockfile` | Exit 0. |
| `cd "$R/packages/materials" && corepack pnpm registry:build` | Exit 0; actual shadcn 4.22.1. |
| `cd "$R/packages/materials" && corepack pnpm test` | Final **20 passed, 0 failed, 0 skipped**; lifecycle test has real installed Three resolution but mocks its lifecycle exports. |
| `cd "$R" && node --test tests/living-design.test.mjs` | Final **32 passed, 0 failed, 0 skipped**, Linux real directory symlink. Not a Windows run. |
| `cd "$R" && node --test tests/living-design.test.mjs tests/font-artifact.test.mjs` | 36 passed, 0 failed, 2 skipped. Missing-decoder test skips when decoder is installed; pinned-public-network-font observations are opt-in and skipped. Local real fonts were decoded separately. |
| `cd "$R/packages/materials" && corepack pnpm typecheck` | Exit 0. |
| `cd "$R/packages/materials/examples/next-app" && corepack pnpm typecheck` | Exit 0. |
| `node --check "$R/packages/materials/examples/next-app/scripts/verify-consumer-themes.mjs"` | Exit 0 after final verifier correction; not a full browser rerun. |
| `cd "$R" && npm test` | **278 passed, 2 failed, 2 skipped**, 282 total. Both unchanged adoption tests reject the localhost origin proxy: `kernel remote must be Starlight-Intelligence/starlight-design-intelligence`. Raw failure retained. |
| `cd "$R/packages/materials/examples/next-app" && corepack pnpm build` | **Two attempts, both exit 0** on Next 16.4.2 / Turbopack; all four routes prerendered. Next's incidental tsconfig rewrite was restored and is absent from the returned diff. |
| `corepack pnpm start --port 3100 --hostname 127.0.0.1` | Exit 1, EADDRINUSE. Existing process was untouched. |
| `corepack pnpm start --port 33179 --hostname 127.0.0.1` | Task-owned production server started successfully for both build inspections, then stopped. |
| `BASE_URL=http://127.0.0.1:33179 EVIDENCE_DIR=… node …/verify-consumer-themes.mjs` | Full attempt 1 failed on Paper contrast; first receipt identifies HEAD 1451279 but was a **dirty repair tree**, not the complete source identity. |
| `BASE_URL=http://127.0.0.1:33179 EVIDENCE_DIR=… corepack pnpm --dir "$R/packages/materials/examples/next-app" verify:consumer-themes` | Full attempt 2 failed on equivalent CSS color serialization. Raw receipts retained; no third full sweep or build. |
| Changed-UI placeholder scan; `git diff --check` | No placeholder matches; whitespace check passed. |
| Existing `inspectInterfaceFoundations` in actual browser sweeps | Empty findings on the reached home states, including the changed shell. Not an all-route pass. No separate installed static design detector or external materials gate was found. |
| CodeQL tool | First analysis: zero JavaScript alerts. Follow-up request after verifier correction reported analysis skipped because it detected no changes since the last run. |
| Secret scanning | Clean before each source commit; final artifact scan recorded at handoff. |

pnpm: **12.16.1**; React/React DOM **19.3.1**; Three **0.186.1**; Tailwind/PostCSS **4.3.3**; TypeScript **5.9.3**; Playwright **1.62.1**. Production font diagnostic used Chrome **156.0.8078.47**, `/usr/bin/google-chrome`. Manual browser-tool UA is HeadlessChrome 156.0.0.0. Desktop/mobile-shaped captures use DPR 1; manual mobile captures are a resized desktop context with zero touch points, not hardware/touch proof.

GitHub Actions was inspected using workflow runs and job logs: checks at this task's bootstrap were `action_required`; run `41782959318` had zero jobs/failed jobs. No permission change/retry was requested. Official Next/font and shadcn docs fetches failed DNS; installed API declarations/help were consulted. `lint:design` was not run because it invokes an unpinned network-installed tool, outside the locked-source dependency constraint.

## Actual registry consumer, not JSON-only evidence

Temporary isolated copy: `/tmp/materials-consumer-repair/consumer`. No borrowed `node_modules`, workspace materials dependency, temporary manifest or lock entered the PR.

1. Copied the example excluding dependencies, build output and generated type files; removed its workspace materials link **only in the temporary copy**. Repointed imports/styles to the installed registry paths.
2. Served `$R/packages/materials/public` with `python3 -m http.server 33180 --bind 127.0.0.1`.
3. Ran `corepack pnpm install --no-frozen-lockfile` in that isolated consumer. This does not authorize or change a source lock.
4. Used the **installed locked CLI**, not latest:
   `node "$R/packages/materials/node_modules/shadcn/dist/index.js" add @starlight/glass-surface @starlight/material-button @starlight/material-card @starlight/material-sheet --yes`.
5. First add failed resolving `ui.shadcn.com/r/colors/neutral.json`. The temporary consumer's `components.json` then used `"baseColor": ""`, which the installed CLI supports by not fetching a default palette. Its `@starlight` namespace remained real `http://127.0.0.1:33180/r/{name}.json`. No mocked registry/color response or source downgrade.
6. Add succeeded: seven entries, **13 installed files**. Repeated with `--overwrite` after the final token regeneration; one token file updated and 12 were identical. Registry server requests returned 200.
7. Typecheck passed. Next dev on port 33181 compiled `/glass` and `/consumer-probe`, both HTTP 200. The probe actually calls installed `gpuPlan` in an RSC and renders installed client `GlassSurface`; software WebGL mounted. This is **dev compiler evidence**, not a third production build.
8. The installer strips leading comments in three TS files. Ten installed files are byte-identical to their generated contents; all 13 are structurally identical after TypeScript 5.9.3 parse/print with comments removed. Hashes, real target mapping and resolved versions are in `registry-consumer.json`.
9. A verification-only copy of the current workspace `EvidenceDisclosure` opened with Enter and showed keyboard focus. It is **not claimed to be a registry item**, since the current registry has no disclosure entry.

The bare temporary probe's full-page export is 1447px wide at a 1440px viewport. That seven-pixel fixture overflow is untriaged; its successful install/compile is not a consumer visual pass. The canonical route samples above/below have separate computed overflow observations.

Source dependency manifests and all three source lockfiles are unchanged. Only the example's requested verification script was added to its scripts map.

## Bounded browser observations and unresolved gate

Manual diagnostics continued on the second production build; they were not another full automation sweep. The current Operator shell computed `rgb(232, 235, 242)` on `rgb(11, 13, 18)` at 1440×900. At 390×844, the select measured 105×44px with no horizontal overflow. Navigation to Paper preserved the selected Operator profile, while Paper stayed `rgb(7, 10, 16)` on `rgb(239, 237, 231)`. Keyboard focus on its Paper button showed the 2px gold outline plus the light/dark two-tone ring.

Glass exercised mobile CSS → desktop software WebGL → mobile CSS → desktop software WebGL. Probe readout was 0.10ms in that hosted run; this is **not a hardware performance claim**, field-performance result or Frank's Arc GPU result.

**New unresolved runtime diagnostic:** remount/recovery emitted:

```text
WebGL: INVALID_OPERATION: texImage3D: FLIP_Y or PREMULTIPLY_ALPHA isn't allowed for uploading 3D textures
```

The installed Three WebGLState constructor creates empty 3D/array textures with `texImage3D`; its texture upload path sets those unpack flags. The repaired mount reuses a context across renderer instances. A plausible bounded follow-up is to normalize `UNPACK_FLIP_Y_WEBGL` and `UNPACK_PREMULTIPLY_ALPHA_WEBGL` before constructing a new renderer on a reused context, and verify that lifecycle with real WebGL. **Root cause/fix is not proven.** Needed authorization is specifically for `$R/packages/materials/src/glass/mount-glass.ts` and an associated real-context regression (the existing lifecycle test path is also outside this wave's post-import allowance), followed by registry regeneration. No such source edit was made silently. The final browser verifier records and rejects unexpected `WebGL.*INVALID_OPERATION` diagnostics.

Other retained diagnostics: software-renderer deprecation/stall warnings, duplicate/preloaded Instrument Sans URL variants, and favicon 404. See `diagnostics.json`.

**Still incomplete:** a green run of the corrected full browser verifier; actual touch-context selection; all-profile/all-route rendered contrast/focus; production reduced-motion/transparency, missing-font/no-JS checks; screenshot visual review; real-hardware testing. The verifier has those journeys, but code presence is not execution evidence. Both full production attempts were consumed. Do not convert #78's old passing bounded journeys into a new-revision pass.

## Artifacts, cleanup, approvals and next action

Evidence directory: `$R/docs/reviews/living-design-consumer-repair-GitHub-Copilot-20261104-v1/`. `artifacts.json` lists actual artifact hashes, bytes, MIME types and PNG dimensions. It excludes itself to avoid a self-hash. Failed attempts, full root failures, successful targeted checks, font decoding and consumer transforms remain distinct.

Only the historical #78 mobile Paper PNG was visually inspectable before the image tool enforced its one-image limit. New screenshot bytes are genuine browser exports, but **not visually approved**. No media was generated. The report does not assign invented visual/type/motion scores.

All task-owned production/registry/consumer servers and browser tabs were stopped. Port 3100 and other owners' processes/branches remained untouched. Task-owned `/tmp/materials-consumer-repair` diagnostics/copy may remain ephemeral; they are outside Git. There were three implementation cycles (initial repair, reproduced contrast/alias-test refinement, verifier-only corrections), two production builds and two full browser-sweep invocations. Bounded font/keyboard/recovery diagnostics are separately identified above.

**Approval:** none requested or implied; independent lead review remains pending. **Rollback:** do not integrate this draft; the target branch is unchanged at `2ab4ffd…`. If later integrated, revert these task commits under the lead's normal review process; no deployment rollback is needed because none occurred.

**Next bounded action:** Codex reviews `fe783f7…` plus this report-only follow-up, authorizes the exact runtime follow-up if warranted, then grants a fresh verification budget for the corrected full script and exported-image inspection. The complete consumer gate remains open.

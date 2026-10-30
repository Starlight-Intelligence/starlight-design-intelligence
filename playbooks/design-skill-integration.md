# Design skill integration

One owned design authority, five callable capabilities, six licensed source
snapshots. This package extends the existing design kernel; it does not define
a second brand registry, hosted service or agent runtime.

## Source and ownership

`vendor/source-lock.json` records the upstream repository, full commit, source
path, original Git blob, SHA-256, byte size and mode for every imported file.
Upstream files are byte-preserved. Starlight adaptations live in the six new
skills and the local toolkit CLI. `THIRD_PARTY_NOTICES.md` maps licenses.

Use `scripts/vendor-design-skills.py --checkouts <parent>` only with exact
reviewed local checkouts in a clean worktree. It reads immutable Git blobs,
does not run installers and refuses to overlay an existing vendor tree. It
excludes two upstream example environment files and records those exclusions.
Updates require a new source review, regenerated lock and integration checks.
Do not float source refs or run `@latest` as a release dependency.

| Capability | Source | Role |
| --- | --- | --- |
| Taste | Leonxlnx/taste-skill | Subject-specific direction, page/app composition, browser inspection |
| Impeccable | pbakaus/impeccable | Surface-mode routing, critique, craft, deterministic diagnostics |
| Playwright CLI | microsoft/playwright-cli | Browser operation and evidence collection |
| Awesome Design | bergside/awesome-design-skills | Complete text catalogue of style skill/companion pairs |
| Image relief | lijiejoy/dsh-skill-image2threejs | Sampled image to colored mesh relief |
| Procedural Three.js | img2threejs/img2threejs | Staged code-based object/character reconstruction |

The fifth screenshot label is ambiguous. Both 3D modes are candidates, not a
claim of exact identification. Neither is a photogrammetry service.

## Authority and invocation

Read the owning product instructions, brand pack and canonical release gate
first. External styles never override explicit brand choices, product truth,
rights, permissions or host browser policy. Keep source-loaded, executable,
host-loaded, rendered and deployed states separate. Use source modules for a
named contribution; do not load every reference file into every task.

Call `design-orchestrator` for the whole loop or invoke `taste-studio`,
`impeccable-studio`, `browser-verify`, `design-reference-selector` and
`image-to-threejs` independently. All existing canonical design skills remain
available. The toolkit's `route` command returns local skill paths; it does
not create an MCP endpoint or execute a model. Invocation requires a host that
loads this plugin; packaging does not force global use in unrelated sessions.

## Runtime and evidence

`node scripts/design-toolkit.mjs verify` verifies imported bytes and rejects
unlocked files, missing notices, path escapes and symlinks. `doctor` checks
Node, Python and CLI presence without fetching engines or changing settings.
Browser launch and real captures are separate checks.

Taste requires Node 22+ and Chromium-family browser. Its asset command uses
network access. Route draws through `scripts/taste-draw.mjs`; it forces project-local
history rather than the upstream user-wide history file. Impeccable's launcher can fetch its native engine and catalogue;
hooks, telemetry settings and live-mode injection are not activated by this
bundle. Playwright CLI and browser runtime must already be present or be
installed through the owning environment's authorized dependency workflow.
The procedural base lacks its mesh-export runtime and optional domain plugins.

Build a source-pinned archive with
`node scripts/build-design-plugin.mjs --out /absolute/output.zip` after committing
the candidate. The builder reads committed Git blobs and records the exact
source revision and file hashes in an external package receipt. A private
candidate release can be evaluated before source merge; it is not reviewed-main
adoption. Promotion of canonical source remains a reviewed pull request.

## Acceptance

Require source integrity, license/NOTICE retention, unique portable skill
metadata, source-path closure, deterministic package contents and independent
review. Run `npm test` and `npm run validate`. Smoke-test representative offline
tools; test browser/engine outputs only when the runtime actually executes.
Do not infer portfolio adoption, production correctness or commercial outcomes
from this package's existence. Revoke the private candidate or select the prior
plugin release to roll back; source rollback is a bounded revert.

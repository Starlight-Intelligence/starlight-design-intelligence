# Casting resolver spec (v2, stub)

Status: stub plus documented contract. No live VIS transport is wired.

## Contract source (read this first)
The identity resolver lives in draft PR 92 of `frankxai/visual-intelligence`. **That PR was not readable from this session.** Every VIS-side name below was relayed to this repo's maintainers, not read from code. **The contract is taken from PR 92 and must be re-checked when it merges.** Until then treat every name, enum and exit code here as unverified. The synthetic fixture and tests prove only that this resolver is consistent with the relayed names.

## Relayed facts
- MCP tool `visual.character.resolve`, argument `name` (one call per name).
- CLI `node bin/vis-character.mjs --name <name>`.
- Environment: `VIS_CHARACTER_MANIFEST` (authorised manifest path), `VIS_CHARACTER_CACHE` (content-addressed cache, layout `<aa>/<sha256>`).
- Result fields: `status` (`resolved`, `ambiguous`, `not_found` or similar; exit code 3 for any non-resolved status), `identity_id`, `matched_alias`, positive references (each with `edition`, `sha256`, `locators` = figma node, drive file id, r2 key, local cache path), `proposals`, `rejected_lineages`, missing references (for example `not_accessible`), `conflicts` (for example `confusable_alias_not_merged`, `status_conflicts_with_rejected_lineage`), `rights` and `approval` (always `unknown`).
- Vendor guests: `class: "vendor-guest"`, `unofficial: true`, `rights: "pending"`.

Where the relayed description was prose, this repo chose snake_case JSON keys: `positive_references`, `missing_references`, `rejected_lineages`, `locators.figma_node`, `locators.drive_file_id`, `locators.r2_key`, `locators.local_cache_path`. These key spellings are the most likely to differ in the merged code.

## Flow
1. `resolveCasting({ brief, transport })` in `casting/casting-resolver.mjs`.
2. Gate: a named understanding gain (`explains-role`, `shows-relationship`, `reduces-abstraction`, `continuity-with-series`) is required. Technical briefs also need `explicit_character_optin: true`. Otherwise `use_character: false`.
3. Names come from `requested_ids`, else from proposal routing (`casting/routing-defaults.json`).
4. Policy filter: rejected references blocked; vendor guests labelled; co-brand with Anthropic/OpenAI blocked absent permission.
5. For each name: `buildResolveRequest(name)` then `transport(name)`. The result is validated (`validateResult`): `resolved` needs `identity_id` and `matched_alias`; asserted rights or approval are rejected.
6. Any status other than `resolved` blocks the name; nothing is substituted or generated.
7. Any entry in `conflicts` blocks the name. `confusable_alias_not_merged` means two lookalike aliases stay two identities; only the identity owner may merge them.
8. Each positive reference is verified by hashing the real bytes at `locators.local_cache_path` (or `<VIS_CHARACTER_CACHE>/<aa>/<sha256>`). A declared hash without bytes is `bytes-unavailable`, never verified.
9. `proposals` are candidates: output class `candidate-study`, never positive references. A resolved name with positive references gets `resolved-approval-unknown`. This resolver never emits an "approved" class because the VIS result never carries approval.
10. `lineage_required[name]` (an expected `identity_id`) blocks on mismatch or when it appears in `rejected_lineages`.

## Transports
- `createFixtureTransport(path, { cacheDir })`: synthetic fixture; writes ASCII bytes into a temp cache laid out `<aa>/<sha256>`.
- `createCommandTransport({ entry, manifest, cache })`: spawns `node <entry> --name <name>` with the two env vars. Exit 0 is a result; exit 3 is a non-resolved result read from stdout; any other exit code throws. Exit 3 with `status: "resolved"` throws as a contract violation. The default entry `bin/vis-character.mjs` is relative to the visual-intelligence checkout, so pass an absolute `entry`.
- none: `status: "unavailable"`; nothing is generated.

## Routing defaults (proposals)
Founder and creator stories, FrankX technical authority, orchestration, architecture, memory, research and mythic education each nominate names. These nominate; the resolver and the owner decide. Names in `routing-defaults.json` are routing keys, not verified identity ids.

## Hard rules
- Arcanea Fire, Unity v1, Unity v2: rejected, never positive references.
- Biro and Brio are separate identities; no fuzzy or silent aliasing.
- Vendor guests are vendor-owned, labelled "Unofficial vendor guest", rights pending, approval unknown; no logos implying endorsement; no partner claim. Anthropic and OpenAI brand pages require permission and approval for co-branding. Nothing here claims a partnership with Anthropic or OpenAI.
- Rights and approval stay `unknown`. This skill never sets them.
- No character is generated, regenerated or invented by this skill.

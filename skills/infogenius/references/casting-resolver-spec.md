# Casting resolver spec (v1, stub)

Status: stub plus documented contract. No live VIS transport is wired.

## Interface owner
The VIS character retrieval interface is tracked in `frankxai/visual-intelligence` issue 91. That issue was not read when this spec was written (outside this repository's access scope); the JSON below is a **proposed** contract. Reconcile field names with the issue before enabling a live transport, and record the reconciliation in the PR that does so.

## Flow
1. `resolveCasting({ brief, transport })` in `casting/casting-resolver.mjs`.
2. Gate: a named understanding gain (`explains-role`, `shows-relationship`, `reduces-abstraction`, `continuity-with-series`) is required. Technical briefs also need `explicit_character_optin: true`. Otherwise result is `use_character: false`.
3. Candidate ids come from `requested_ids`, else from proposal routing (`casting/routing-defaults.json`).
4. Policy filter: rejected references blocked; vendor guests labelled; co-brand with Anthropic/OpenAI blocked absent permission.
5. Retrieval request → transport → response; response validated; hashes compared against actual bytes (`bytes_base64` or readable `path`). Only a real byte comparison sets `asset_hashes_verified: true`.
6. Lineage guard: if `lineage_required[id]` differs from the returned lineage, block. Lineages are never substituted.
7. Output: decision with `cast`, `blocked`, `notes`, `receipt`.

## Request
```json
{ "schema": "starlight.infogenius.character-retrieval-request.v1", "request_id": "req-0", "character_ids": ["custom.nilo"], "verify": true, "brand": "frankx", "purpose": "explains-role" }
```

## Response
```json
{ "schema": "starlight.infogenius.character-retrieval-response.v1", "request_id": "req-0", "reference_revision": "<index revision>", "characters": [
  { "id": "custom.nilo", "status": "approved-canon", "lineage": "<sprite lineage>", "rights_state": "<state>", "assets": [ { "asset_id": "<id>", "sha256": "<64 hex>", "path": "<local path>" } ] } ] }
```
`status` ∈ `approved-canon | candidate | rejected | vendor-guest | unavailable`. Schema: `schemas/character-retrieval.schema.json`.

## Transports
- `createFixtureTransport(path)`: local synthetic fixture (tests).
- `createCommandTransport(cmd, args)`: JSON on stdin, JSON on stdout (adapter for the owner's VIS CLI; not provided here).
- none: returns `status: "unavailable"`; nothing is generated.

## Routing defaults (proposals)
Mini Frank/Nilo/Brio/Riff: founder and creator stories. Omega: FrankX technical authority. Starlight Queen: orchestration. Noble Machines: architecture. Living Glasshouse: memory and knowledge. Prismatic Tide: research and exploration. Arcanea: mythic education. Custom pets keep distinct sprite lineages. These nominate; retrieval and the owner decide. Ids are routing keys, not verified registry ids.

## Hard rules
- Arcanea Fire, Unity v1, Unity v2: rejected, never positive references.
- Biro and Brio are separate identities; no fuzzy or silent aliasing.
- Vendor guests Clawd, Claude pet, Codex pet, GitHub Mona: vendor-owned; label "Unofficial vendor guest"; no logos implying endorsement; no partner claim; rights pending. Anthropic and OpenAI brand pages require permission and approval for co-branding.
- No character is generated, regenerated or invented by this skill.

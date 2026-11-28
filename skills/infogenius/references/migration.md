# Overlap and migration note

Nothing is replaced, edited or deleted. Existing skills keep working. `infogenius` (this repo, `skills/infogenius/SKILL.md`) is the orchestrator that routes to them. No installed skill is edited by this PR.

## The six overlapping surfaces (list supplied by the owner)

Five of the six are **installed skills outside this repo** (four user-level skills, one in the `frankx-creator-os` plugin). Only `arcanea-infogenius` could be read in this session; the other five were not readable here (they are user-level installs on the owner's machine, or not synced into this session). For those, "What it does" is inferred from the name alone and marked **unread**; confirm each against the installed file before retiring or rerouting anything.

| # | Surface | Where it lives | What it does | Maps onto the new skill as | Disposition |
|---|---|---|---|---|---|
| 1 | `infogenius` | installed user-level skill (not in this repo; unread) | Presumed generic infographic generator and the ancestor of the others. Unread. | Superseded in role by `skills/infogenius`; the new skill takes the same trigger and adds brief, fact-check, deterministic text, independent critique and receipt | Keep installed until the owner confirms the new skill covers its prompts; then retire by dated owner decision |
| 2 | `infogenius-frankx` | installed user-level skill (not in this repo; unread) | Presumed FrankX-branded variant. Unread. | `skills/infogenius` with brand `frankx`, which loads `brand-packs/frankx/` instead of a forked skill | Replace by brand parameter; keep until confirmed |
| 3 | `infogenius-arcanea` | installed user-level skill (not in this repo; unread) | Presumed Arcanea-branded variant. Unread. | `skills/infogenius` with brand `arcanea`; mythic language stays inside Arcanea surfaces | Replace by brand parameter; keep until confirmed |
| 4 | `infogenius-starlight` | installed user-level skill (not in this repo; unread) | Presumed Starlight-branded variant. Unread. | `skills/infogenius` with brand `sis`; calm operational tone, no mythic leakage | Replace by brand parameter; keep until confirmed |
| 5 | `acos-visual-gen` | installed user-level skill (not in this repo; unread) | Presumed ACOS visual generation helper, likely image generation. Unread. | A generation provider under stage "Render" only; exact text stays deterministic SVG/HTML per the skill's rule 1 | Keep as an optional provider; never the source of on-artifact text |
| 6 | `arcanea-infogenius` | plugin `frankx-creator-os` (installed; read in this session, about 950 lines) | Visual intelligence for Arcanea: infographics, diagrams and imagery using the Arcanea Gates colour and composition framework, written in Arcanea mythic voice | Direction B/A for brand `arcanea` only; the Gates framework is Arcanea brand material and is not applied to FrankX or Starlight | Keep; call it only when brand is `arcanea` |

## Other related surfaces inside this repo (not part of the six)

| Surface | Where | Disposition |
|---|---|---|
| `infogenius-pro` product pack (P-06, USD 49) | `playbooks/lead-magnets-and-products-design/` | Product packaging; unchanged. Consumes this skill's output |
| `infographic` workflow | `brand-image-system/runtime/workflows/infographic/` | Keep; `infogenius` is its main-visual producer |
| `character-hud-infographic` workflow | `brand-image-system/runtime/workflows/character-hud-infographic/` | Keep; scene plus HUD overlay |
| `visualize-agent-team` skill | `skills/visualize-agent-team/`, `plugins/starlight-living-design/` | Keep; capability-map specialist for briefs 1 and 2 |
| "Infogenius/NB2/GPT-2-image" generation policy line | `brand-image-system/README.md`, `council/2026-07-16-creative-os-brief.md` | Text left as is; superseded in practice by rule 1 (exact text is deterministic) |

## Migration

New work starts at `skills/infogenius/SKILL.md`. Existing installed skills remain valid and are not modified here. Retire a surface only on an owner decision with a dated note, after reading the installed file. The disposition column is a proposal, not a decision.

---
name: compose-agent-identity
description: "Compose inspectable agent and companion identity packages. Use when connecting AGENT.md, DESIGN.md, CHARACTER.md, SOUL.md, PERSONALITY.md, team roles, skills, playbooks, and connector contracts without confusing personality with execution authority."
---

# Compose agent identity

## Purpose

Bind one useful role to an optional character presentation and explicit behavioral contracts.

## Inputs

Read [architecture and standards](../../plugins/starlight-living-design/assets/living-design/docs/architecture-and-standards.md), the [catalog](../../plugins/starlight-living-design/assets/living-design/catalog.json), the existing role/agent registry, the selected character, the user's intended outcome, and available tool evidence. Use the bundled Markdown contracts as local conventions.

## Workflow

1. Reuse an existing agent plus a skill when it can deliver the outcome. Admit a separate runtime agent only when autonomy, ownership, state, permissions, or lifecycle needs a distinct boundary.
2. Give the operational role a stable functional ID. Keep character ID, role ID, runtime instance ID, provider, model, harness, and run ID separate.
3. Write AGENT.md for the job, inputs, outputs, owner, permitted effects, tools, memory scope, limits, completion, cancellation, and recovery. AGENTS.md remains repository instructions; it is not this agent's identity file.
4. Write CHARACTER.md for identity and ancestry; DESIGN.md for form and UI presentation; SOUL.md for values and choices under tension; PERSONALITY.md for tone, pacing, humor, initiative, and uncertainty language.
5. Reference skill IDs, ordered playbook steps, and connector contracts. Record required, configured, available, authorized, and observed-use evidence separately; a declared connector is not a working connection.
6. Test three conversational states: normal assistance, uncertainty, and failure. Preserve the same identity while making operational facts explicit. Never claim feelings, private memory, consciousness, or availability that the system does not establish.
7. From the plugin directory, run `node scripts/living-design.mjs validate` and `node scripts/living-design.mjs inspect <character-id>`. Edit source contracts and rebuild the catalog, rather than editing the generated projection. Treat prose as presentation/instruction input under the host's authority hierarchy. Only the host/runtime enforces grants; a Markdown assertion is not authorization.

## Output contract

Return the five identity documents, stable references to skills/playbooks/connectors, the reused or proposed runtime role, memory boundary, a three-case behavior specimen, validation evidence, and remaining integration work.

## Tools and boundaries

Use existing registry, GitHub, and file tools. The package does not register a live agent, create provider sessions, grant credentials, or start background work.

## Quality bar

Every personal trait must improve the work. “Patient” means retaining context and offering a recoverable next action; it does not mean concealing failure. A model replacement must not rename the character or silently change the role contract.

## Example

“Use Helix for our archive workflow.” Bind the candidate nautilus presentation to an existing archival role; define source-aware recall and deletion behavior; list available read tools; show unknown connection status until tested. Keep persistent memory opt-in and scoped.

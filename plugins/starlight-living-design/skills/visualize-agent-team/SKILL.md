---
name: visualize-agent-team
description: "Visualize agent teams and their capabilities with typed relationships. Use for character atlases, team maps, agent inspectors, skill/playbook/connector views, design ancestry, mission timelines, or runtime-state visualizations."
---

# Visualize agent team

## Purpose

Show who owns a job, which capabilities support it, what can execute, and what evidence exists.

## Inputs

Read [architecture and standards](../../assets/living-design/docs/architecture-and-standards.md), [journey and components](../../assets/living-design/docs/journey-and-components.md), and the [catalog](../../assets/living-design/catalog.json). Load actual team/role/run data separately from candidate character designs.

## Workflow

1. Choose the question before the view: compare identities, inspect one agent, assemble a team, understand a playbook, or investigate a run.
2. Use typed nodes: character, design family, role, agent, skill, playbook, connector, runtime instance, artifact, and receipt. Give every relationship a semantic label.
3. Keep design ancestry apart from operational topology. Use `derives-from` for visual lineage, `portrays` for character-to-role, `uses` for skills/connectors, `member-of` for team membership, and explicit handoff relationships for workflows.
4. Distinguish catalog definitions from execution observations. Show a team's intended composition as a blueprint; show a live instance only with a current runtime source, timestamp, and tenant scope.
5. Select the simplest view: roster cards for comparison, an inspector for details, a graph for branching, and a timeline for event order. Provide a list or table equivalent to every graph.
6. Resolve each selectable node to its source and dependencies. Expose unknown, stale, denied, and unavailable states; avoid inferred activity from glowing edges or animated particles.
7. Use a small scoped diagram in documentation. Use an interactive graph only when filtering, expanding, selecting, or comparing relationships materially helps the task.
8. Run `node scripts/living-design.mjs validate` from the plugin directory before rendering. Test focus, screen-reader labels, mobile reflow, dense teams, missing references, revoked connectors, stale telemetry, and reduced motion where implemented.

## Output contract

Return typed graph data, the chosen view and legend, accessible table equivalent, selection/inspection behavior, source links, runtime-freshness policy, validation evidence, and proposed versus observed status.

## Tools and boundaries

Use existing graph or UI components in the product. Mermaid serves compact documentation. A graph renderer is not an orchestrator; no edge grants access or launches a worker.

## Quality bar

The map should answer a question in one selection. Avoid displaying the entire portfolio as an undifferentiated constellation. Show role labels alongside names and icons; do not rely on color, animal form, or position alone.

## Example

“Map a research team with Nacre, Helix, and Orin.” Show their candidate character cards, functional research/archive/review roles, selected skills, a sequenced playbook, and connectors with evidence states. Label the map a blueprint until a runtime run is attached.

---
name: design-companion-journey
description: "Design task-focused AI companion journeys and UI components. Use for character-led homepages, onboarding, workspaces, agent cards, inspectors, recovery states, learning experiences, or memory controls based on Starlight living design families."
---

# Design companion journey

## Purpose

Make a character useful at the moments a person needs orientation, action, feedback, or recovery.

## Inputs

Read [journey and components](../../plugins/starlight-living-design/assets/living-design/docs/journey-and-components.md), the selected character/agent contracts, the current brand pack, and existing product screens. Establish one user, task, starting state, and useful result.

## Workflow

1. Choose the product surface mode. Use Horizon for invitation, Operator for execution, Academy for learning, and Cultural for expressive scenes. Keep one character's recognition anchors across modes.
2. Design the shortest complete journey: arrive, understand the role, choose work, inspect access, receive an artifact, review evidence, and recover or continue. Include the actual useful output before adding collection mechanics.
3. Assign the companion a bounded purpose at each step. Let it introduce the task, explain uncertainty, point to relevant evidence, or help recover. Keep the primary action and product artifact visually dominant.
4. Specify components and variants: role card, avatar, team roster, capability list, connector permission row, action receipt, artifact card, empty state, error state, stop control, and memory controls.
5. Define every visible state from a data source. Distinguish unconfigured, ready, running, waiting, failed, cancelled, completed, and unknown. A decorative idle motion must not imply active work; completion needs a real result.
6. Build mobile and keyboard behavior into the component spec. Provide focus names, reading order, minimum targets, sufficient contrast, graph/table alternatives, reduced motion, and plain-text status.
7. Use Figma when the host supports the requested operation; preserve component IDs and source versions. Otherwise produce an editable implementation contract and identify Figma execution as pending.
8. Inspect the actual rendered journey when available. Test success, unavailable connector, revoked permission, timeout, no result, and replay/recovery against the owning runtime's behavior.

## Output contract

Return a journey map, component/state matrix, character placement rules, copy specimens, source-to-screen mapping, accessibility and performance targets, inspected evidence, and unresolved runtime dependencies.

## Tools and boundaries

Use the owning app repository, design connector, approved browser, and existing assets. A prototype cannot establish runtime execution, native Figma publication, conversion lift, or production accessibility.

## Quality bar

Companion visibility is controllable. No guilt, forced attachment, fabricated urgency, or claim that the agent needs the user. Progress represents accepted work; a friendly face never substitutes for permission, evidence, or recovery.

## Example

“Use Coralie in first-run onboarding.” Let Coralie introduce one useful mission, show what will be read, and help recover from an unavailable source. End with an inspectable artifact and an explicit memory choice.

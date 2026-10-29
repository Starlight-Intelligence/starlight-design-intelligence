# Journeys and components

Start with a person who wants a useful result. Introduce only the characters needed to help them reach it. Preserve the artifact, permissions, and next decision as the information hierarchy.

## One complete first-use journey

| Moment | Companion contribution | Interface and evidence |
| --- | --- | --- |
| Arrival | Introduce a concrete role and sample output | One primary action; real example marked with its evidence status |
| Mission choice | Explain what the selected role can produce | Task brief; input requirements; effort/cost boundary when known |
| Access inspection | Explain the relevant source and scope | Connector rows with separate configuration and authorization status |
| Work | Orient to current stage and expose stop/recovery | Runtime-derived state, elapsed time when measured, event/step details |
| Result | Point to the artifact and important caveats | Editable/exportable artifact, sources, acceptance criteria, receipt |
| Review | Invite the user's decision without self-approval | Accept/revise controls, feedback tied to the artifact |
| Return | Restore the chosen workspace under explicit memory policy | Visible memory scope, inspect/export/delete controls, last-known state |

Coralie can guide arrival; Nacre can map research; Helix can preserve sources; Orin can inspect the output. This is a proposed team recipe. Bind it to existing functional roles before creating any new runtime instances.

## Component contract

| Component | Required content | Material variants |
| --- | --- | --- |
| Role card | Character name, functional role, useful output, status, source/inspect action | Compact list, comparison card, selected member |
| Avatar | Accessible name or decorative treatment, rendition ID, stable crop | 32px token, 64px roster, 160px introduction, scene |
| Capability list | Skill/playbook IDs and descriptions, required inputs, evidence state | Simple list; expandable details |
| Connector row | Provider/capability, required scope, configured/authorized/observed states, recovery action | Available, missing, denied, revoked, unknown |
| Team roster | Members, responsibilities, task owner, handoff/review role | Mobile list; desktop grid; scoped graph |
| Agent inspector | Identity/design provenance, functional role, skills, playbooks, connectors, memory, limits | Desktop side pane; mobile full-width detail |
| Artifact card | Actual result, format, source, version, acceptance and export | Draft, ready for review, accepted, failed export |
| Action receipt | What happened, actor, resource, timestamp, source event, outcome | Success, partial, failure, cancellation |
| Recovery panel | Failed stage, retained work, safe retry or alternate path | Permission, timeout, empty result, conflict |
| Memory control | Scope, retention behavior, source inspection, export/deletion | Off, explicit scope, unavailable |

Status is text plus icon/shape, never color alone. Display provider/model separately from character name. When there is no runtime, label the role “Example recipe” or “Blueprint”; do not show a green “Online” badge.

## State semantics

| State | Evidence | Character behavior |
| --- | --- | --- |
| Unconfigured | Required resource absent | Calm explanation with next action |
| Ready | Existing runtime establishes readiness | Resting pose; no implied work |
| Running | Current authorized run/event | Small purposeful gesture and visible stage |
| Waiting | Actual input/approval/dependency wait | Attention directed to the user's decision |
| Failed | Failure event or validated error | Neutral expression; retained work and recovery |
| Cancelled | Cancellation acknowledged by the owner runtime | Settled pose and explicit result boundary |
| Completed | Real output and completion receipt | Brief confirmation; artifact dominates |
| Unknown | Missing, stale, disconnected, or unverified evidence | Static appearance and honest status |

Keep idle expressiveness visually distinct from running state. A subtle wing rest or breathing loop may be decorative; label the status independently. Do not make unverified progress percentages, simulated timers, or fictional output counts look live. A requested stop remains “Stop requested” until acknowledged.

## Visualizing the collective

Use three complementary views:

1. **Atlas:** compare characters, families, professions, and design ancestry. This view is intentionally static unless an actual state source is connected.
2. **Workbench:** select a role and inspect capabilities, access, artifacts, and responsibilities. This is the primary operating view.
3. **Run trace:** inspect ordered handoffs and evidence for one mission. The trace comes from execution records, not the design catalog.

Typed edges prevent ambiguity: character `derives-from` family; character `portrays` role; role `uses` skill/playbook/connector; role `member-of` team; run `produces` artifact; receipt `supports` outcome. Keep delegation, visual ancestry, and capability dependency in different filters or layers. A team map must also work as a table with selectable rows.

## Figma and code mapping

The supplied Observatory kit is a design proposal, not proof of product integration. Reuse its foundations and component structure after inspecting current source. Keep variable/component IDs and source revision in the handoff. Name components by function with character variants, for example `AgentCard/compact` with character and state properties; avoid one independently maintained component per character.

Maintain this chain: character ID → rendition ID → design spec → Figma component/variant → implementation component → exact product screen → release evidence. Keep style tokens and operational status tokens separate. Generated artwork must not contain the editable UI labels.

## Accessibility and performance targets

- Preserve semantic headings, reading order, visible focus, keyboard access, and named controls. Ensure a useful text alternative for every graph interaction.
- Target at least 44×44 CSS-pixel touch controls and WCAG 2.2 AA contrast; record measured results on the actual background, including overlays.
- Support 320px reflow and representative mobile/tablet/desktop layouts. Use mobile detail pages or sheets instead of shrinking a desktop graph.
- Honor reduced motion; remove continuous spatial animation, parallax, and camera travel. Preserve the same state information as text.
- Keep critical interaction usable while artwork loads or fails. Reserve dimensions to avoid layout shift; defer scene artwork and load a small avatar rendition first.
- Treat initial transfer, image size, responsiveness, and core-web-vital budgets as targets until measured in the consuming app. This package does not assert production performance.

Companions remain dismissible or reducible to compact avatars. Never require animation, audio, or simulated intimacy to complete a task.

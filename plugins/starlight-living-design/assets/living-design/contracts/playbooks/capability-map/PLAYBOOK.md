---
{
  "kind": "playbook",
  "id": "playbook.capability-map",
  "name": "Map a team and its capabilities",
  "skill_ids": [
    "skill.compose-agent-identity",
    "skill.bind-character-runtime",
    "skill.visualize-agent-team"
  ],
  "stop_conditions": [
    "unresolved-source",
    "missing-required-input",
    "failed-boundary-check"
  ],
  "status": "proposal"
}
---

# Map a team and its capabilities

1. Use `compose-agent-identity` and preserve its output before the next step.
2. Use `bind-character-runtime` and preserve its output before the next step.
3. Use `visualize-agent-team` and preserve its output before the next step.

A playbook is ordered orchestration advice, not a background scheduler. Record artifact IDs at each handoff; preserve partial work; do not replay external writes without checking their prior receipt.

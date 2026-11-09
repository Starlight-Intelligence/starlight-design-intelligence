---
{
  "kind": "playbook",
  "id": "playbook.mission-design",
  "name": "Compose an accountable mission",
  "skill_ids": [
    "skill.compose-agent-identity",
    "skill.visualize-agent-team",
    "skill.review-living-design"
  ],
  "stop_conditions": [
    "unresolved-source",
    "missing-required-input",
    "failed-boundary-check"
  ],
  "status": "proposal"
}
---

# Compose an accountable mission

1. Use `compose-agent-identity` and preserve its output before the next step.
2. Use `visualize-agent-team` and preserve its output before the next step.
3. Use `review-living-design` and preserve its output before the next step.

A playbook is ordered orchestration advice, not a background scheduler. Record artifact IDs at each handoff; preserve partial work; do not replay external writes without checking their prior receipt.

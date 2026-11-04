---
{
  "kind": "playbook",
  "id": "playbook.first-session",
  "name": "Guide a first useful result",
  "skill_ids": [
    "skill.design-character-lineage",
    "skill.design-companion-journey",
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

# Guide a first useful result

1. Use `design-character-lineage` and preserve its output before the next step.
2. Use `design-companion-journey` and preserve its output before the next step.
3. Use `review-living-design` and preserve its output before the next step.

A playbook is ordered orchestration advice, not a background scheduler. Record artifact IDs at each handoff; preserve partial work; do not replay external writes without checking their prior receipt.

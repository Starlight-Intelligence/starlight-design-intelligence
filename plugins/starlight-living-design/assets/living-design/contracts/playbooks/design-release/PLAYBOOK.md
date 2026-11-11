---
{
  "kind": "playbook",
  "id": "playbook.design-release",
  "name": "Review and export a design package",
  "skill_ids": [
    "skill.design-character-lineage",
    "skill.bind-character-runtime",
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

# Review and export a design package

1. Use `design-character-lineage` and preserve its output before the next step.
2. Use `bind-character-runtime` and preserve its output before the next step.
3. Use `review-living-design` and preserve its output before the next step.

A playbook is ordered orchestration advice, not a background scheduler. Record artifact IDs at each handoff; preserve partial work; do not replay external writes without checking their prior receipt.

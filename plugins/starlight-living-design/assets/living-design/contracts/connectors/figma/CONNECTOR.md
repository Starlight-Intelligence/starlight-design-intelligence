---
{
  "kind": "connector",
  "id": "connector.figma",
  "name": "Figma",
  "state": "requires-host-connection",
  "declared_actions": [
    "read",
    "draft"
  ],
  "credential_ref": null,
  "status": "definition-only"
}
---

# Figma

Inspect or edit the selected design file using authorized native tools.

## Connection contract
Discover the actual host tool, account and permitted resource scope. A plugin dependency name is not an installed integration. Never embed secrets, private account identifiers or guessed MCP URLs. Treat provider annotations as hints, not enforcement. On an unavailable or revoked connection, retain the draft and mark blocked.

## Evidence
A current successful read proves that read only. Publish, deploy, account sharing and spending require their actual permission and acceptance gates. This skills-only plugin does not attach or configure this connector.

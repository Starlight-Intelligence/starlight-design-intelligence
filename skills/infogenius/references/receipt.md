# Provenance receipt

Write `receipt.json` beside the export. Fields not applicable are `null`, never omitted.

```json
{
  "skill": "infogenius",
  "brief_id": "benchmark-01",
  "brand": "sis",
  "direction_chosen": "A",
  "direction_rejected": { "id": "B", "reason": "no understanding gain for a technical topology" },
  "sources": ["sources.json@sha256"],
  "retrieval": { "contract_source": "frankxai/visual-intelligence draft PR 92 (re-check on merge)", "tool": "visual.character.resolve", "identity_ids": [], "reference_revision": null, "asset_hashes_verified": null, "rights": "unknown", "approval": "unknown", "integration_status": "not_asserted" },
  "generation": { "provider": "none", "cost_usd": 0, "model_text": false },
  "render": { "tool": "scripts/compile-brand-diagrams.mjs", "themes": ["dark", "light"], "sha256": {}, "min_contrast": 0, "overflow": 0 },
  "critique": { "reviewer": "separate-session", "score": 0, "scale": 30, "hard_gates": { "factual": "pass", "source_identity": "pass", "accessibility": "pass", "rights": "pass" } },
  "rights": { "vendor_guests": [], "rejected_references_used_positively": false },
  "approval": "pending-human"
}
```

`provider: none` and `cost_usd: 0` are only valid when no generation call was made.

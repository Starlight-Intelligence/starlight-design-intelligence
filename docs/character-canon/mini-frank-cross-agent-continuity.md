# Mini Frank visual continuity: cross-agent contract

**Status:** proposed repo contract; no master binaries in this repository; no deployment or publication.

## Authority
- Original private `mini-me-storyboard` revision `2026-10-09.4`, `references/character-canon-index.json` and `character-registry.json`.
- Master `Mini-Frank-Character-Model-Sheet.png` expected SHA-256 `9a7553c440c7bf5c7a1a88a039aa42112dddf295cb29a3a0d82afdda321d5b7f`.
- Master `Mini-Frank-Cast-Model-Sheet.png` expected SHA-256 `09bb733175c5f1f2f37f88698f8e56e48ca16ad8536d70eafc1408cd82b99fb5`.
- Existing VIS identity/version/rights/approval registry. Do not create another DAM.

## Identity IDs
`host.frank` Mini Frank; `custom.nilo` white/black boxy camera-eyed scout; `custom.brio` copper goggle-eyed builder with one antenna; `custom.riff` scarlet lobster creative catalyst. They are not vendor mascots. Queen, organic Starlight characters, and experimental robots are separate lineages.

## Required agent behavior
1. For creative tasks portraying these identities, load `playbooks/character-canon-retrieval.md` and resolve the **actual** private model/cast sheets. Descriptions or previous chat images alone are not sufficient.
2. Verify master SHA-256 against actual bytes before claiming canon continuity. Historical previews are permitted for **inspection** only.
3. Attach both verified masters to the image/video generation request. Record which actual file bytes the model received. No image attachment = no claim of canonical generation.
4. Compare exported frames to masters for face, quiff, beard, opaque glasses, silhouette, lens eyes, copper antenna, lobster anatomy, and scale. Include visual contact sheet and review receipt.
5. Preserve distinct `identity_id`, `asset_id`, `version_id`, `master_sha256`, `rights_status`, `approval_status`, `source_uri`, `generation_job`, `review_status`, and `publish_status`. Unknown is never approved.
6. Refuse publication and canon promotion without explicit owner review. No vendor-mascot substitution. Do not upload private master bytes into public GitHub.

## Existing plugin
Private Starlight Design Intelligence v0.1.3 embeds genuine **historical preview derivatives** and a fail-closed local resolver under `skills/visual-canon-command/references/mini-frank/`. This is a portable inspection aid, **not** the original full-resolution private skill. Its reference manifest explicitly reports `PREVIEW_ONLY_MASTER_MISSING`.

## Release gate
A test must demonstrate that an unavailable or tampered master blocks canonical generation. After authentic masters are recovered, run actual SHA-256 readback, image-model reference attachment check, visual comparison at 16:9 and 9:16, and human approval. Do not equate plugin installation with cross-runtime enforcement.

## Scope of this PR
Documentation-only agent contract. Follow-up implementation in VIS #65 should expose authenticated `get_asset`, `get_asset_preview`, and versioned source handles through the existing gateway, not a parallel service. No public image bytes, credentials, production migrations, billing or deployment.

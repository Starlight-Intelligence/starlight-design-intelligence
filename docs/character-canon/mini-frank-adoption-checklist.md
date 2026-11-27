# Mini Frank · adoption checklist

Use this checklist in each owning repo before claiming it uses the original cast correctly.

- [ ] Repo-level `AGENTS.md` or `CLAUDE.md` links to the character retrieval contract.
- [ ] Runtime can resolve the exact private reference index.
- [ ] Both original masters are accessible and byte-verified.
- [ ] Image/video generation receives both original images as **image inputs**.
- [ ] Character-ID selection is separate from runtime agent/provider identity.
- [ ] Output inspection checks all four characters and consistent material/scale.
- [ ] VIS stores asset/version, source, rights, owner decision and derivative lineage.
- [ ] Private master bytes never enter a public repo or unrestricted URL.
- [ ] Explicit founder approval precedes canon promotion or publication.
- [ ] CI fails if required references are missing, stale or corrupted.

### Target surfaces
FrankX editorial, GenCreator production, Starlight character interfaces, Arcanea only when intentionally crossing universes. Avoid forcing Mini Frank into unrelated work.

### Blockers
The full-resolution private bundle was not accessible in the connected chat session on 2026-11-17. Preview derivatives exist and were bundled privately; neither of the two expected master hashes was freshly verified. Hosted VIS catalog gateway remains locally tested, not deployed.

### Local check
In the private Starlight Design Intelligence plugin package:
`python skills/visual-canon-command/references/mini-frank/resolve.py --verify --character host.frank --character custom.nilo`
Returns nonzero until authentic masters are supplied. `--preview-only` is for visual inspection only.

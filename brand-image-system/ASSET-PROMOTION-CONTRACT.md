# Asset promotion contract

**Register:** Neutral  
**Authority:** lifecycle boundary between candidate staging and released production assets

## Sources of truth

| Layer | Authority | May claim production release? |
|---|---|---:|
| Candidate intake | `C:/Users/frank/.agent-harness/brand-media-registry.json` | No |
| Evidence-only review | `brand-image-system/runtime/staged-asset-review.json` | No |
| Approved release registry | `brand-image-system/runtime/asset-registry.json` | Yes, only after this contract passes |
| Production truth | Exact product-repository commit plus deployment/route evidence | Yes |

The released registry must never contain placeholders, examples, mere generation outputs, or assets whose production use is inferred from a filename. An empty registry is correct when no asset has complete evidence.

## Canonical brand IDs

`ai-coe`, `animelegends`, `arcanea`, `frankx`, `gencreator`, `reality-architect`, `sis`, and `vibeclubs`.

Aliases such as `vibeclub`, `frankx.ai`, or a staging folder name must be normalized before promotion. The brand pack and surface mode must be explicit.

## Promotion sequence

1. **Intake** — register the original payload in the candidate registry with source, rights basis, SHA-256, detected MIME, dimensions, and intended surface.
2. **Technical verification** — verify the actual payload rather than trusting the extension. Normalize extension and MIME; link duplicates rather than copying silently.
3. **Brand binding** — bind canonical brand ID, surface mode, brand-pack path, and exact brand-pack commit.
4. **Independent review** — maker, reviewer, and approver must be distinct. Apply the premium quality gate and record a score of at least 24/30.
5. **Integration** — add the exact payload to the target product repository and record path, surface ID, and route or channel.
6. **Release proof** — record exact 40-character production commit, deployment or publication evidence, and post-release route/channel verification.
7. **Promotion** — add the normalized record to `runtime/asset-registry.json` and run `npm run validate:assets`.
8. **Retention** — assign canonical, campaign, product-proof, or historical retention and a review/archive date where applicable.

## Required release evidence

A released record includes:

- stable asset ID and canonical brand ID;
- maker, independent reviewer, approver, and integrator;
- source kind, origin/model where relevant, creation timestamp, and evidence URI;
- rights status, basis, terms version, and restrictions;
- repository path, SHA-256, detected MIME, byte size, dimensions, and color space;
- brand-pack path and exact commit;
- target repository, path, surface ID, and route;
- alt/decorative intent, baked-text flag, and responsive behavior;
- rubric, version, score, and review evidence;
- exact production commit and release verification evidence;
- retention class and duplicate lineage.

## Validation

```bash
npm run validate:assets
node --test tests/asset-registry.test.mjs
```

`validate:assets` rejects schema drift, self-approval, and extension/MIME mismatches. Product-repository CI and deployment verification remain separate gates; registry validation cannot prove deployment by itself.

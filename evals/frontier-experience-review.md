# Frontier Experience Review

Use this rubric for materially changed product or media experiences. Score the
checked candidate against observed evidence. Keep the existing [web release
gate](web-release-gate.md) and brand-specific gates.

| Criterion | Points | Assess against |
| --- | ---: | --- |
| Professional workflow depth | 25 | Real task, recoverable decisions, usable output |
| Visual art direction and originality | 20 | Hierarchy, typography, coherence, distinctive art direction |
| Media and spatial experience | 15 | Useful media or spatial mechanisms, reading order, accessible presentation |
| Functional completeness | 15 | Working journey, truthful state, failure and recovery |
| Identity and provenance | 10 | Recorded owner decision, asset version, bytes, rights, lineage |
| Performance and accessibility | 10 | Relevant performance budget, keyboard, semantics, responsive behaviors |
| Continuity and documentation | 5 | Current scope, coherent handoff, rollback and evidence trail |

A deliberate decision to omit spatial or multimedia UI can earn full credit when
reviewers can see how the chosen design better serves the task.

The threshold is **85/100**. Identity, functionality, provenance, accessibility
and publication authorization are critical checks. Mark identity out of scope
only when the change does not use or affect owned identities. Mark publication
authorization out of scope for an explicitly non-public review. Reviewers
may cover more than one specialty and must be independent of the maker.

## Candidate evidence and CI

1. Capture the same task before and after at 375, 768 and 1440 CSS pixels with
   device scale factor 1. Document expected visual parity when behavior changes without a visible difference. Run the applicable visual regression, keyboard and
   accessibility checks, performance measurement and primary interaction including
   recovery. Keep any stricter viewport requirements from the owning product.
2. In an authorized private repository or with approved releasable evidence,
   place the receipt and its evidence files in `.starlight/frontier-review/`.
   Keep originals, restricted screenshots and sensitive data in their governed
   source. Use actual results from the test run and record limitations.
3. Compute the reviewed candidate digest using the base and head SHAs:
   `node scripts/validate-frontier-review.mjs <candidate-repo> <base-sha> <head-sha> --digest`.
   The digest covers the Git change from the merge base to the candidate head outside the evidence directory, so a receipt
   can be committed on top. Source changes invalidate prior evidence. Review the exact
   preview revision and repeat affected checks when merged preview behavior changes.
4. Pin [the reusable workflow](../.github/workflows/frontier-review.yml) at the
   reviewed kernel SHA in the owning repository's PR workflow. Enforce the emitted
   **Frontier candidate evidence** check and authorized human review using the
   owning repository's supported merge controls. The workflow checks a
   receipt and its byte-addressed artifacts. GitHub review or the existing
   approval service must authenticate reviewers and publication authority.

`review.json` uses version `starlight.frontier_review.v1` and includes
`candidate_sha256`, `preview_url`, `task`, `outcome`, `limitations`,
`actors` (maker, design_critic, technical_verifier, brand_verifier), `scores`
(criterion to points and rationale) and `critical` (check to status and reason).
`screenshots` maps viewport width to before/after references. `reports` maps
interaction, visual_regression, accessibility, performance, provenance and
continuation to references. A reference uses `file` and `sha256`. Each JSON
report includes `kind`, `candidate_sha256`, `result: "pass"`, `method` and
`observation`. Include relevant tool outputs, authorization or VIS receipts,
test conditions and exact review links in the report or owning evidence system.
See [the evaluation fixture](../tests/frontier-review.test.mjs) for a complete
synthetic example. Fixture results carry no portfolio score.

CI validates receipt structure, content binding, arithmetic, critical status,
screenshot dimensions and artifact hashes. Independent reviewers assess taste,
artifact authenticity, source authorization, test adequacy and scope exceptions.
Production promotion still uses the owning release workflow and human approval.

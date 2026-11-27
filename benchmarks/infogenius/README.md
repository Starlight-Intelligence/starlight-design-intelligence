# InfoGenius benchmark suite

Ten briefs in `briefs.json`. Five (1, 2, 3, 5, 9) have deterministic specs in `specs/` and are rendered by the existing compiler `scripts/compile-brand-diagrams.mjs` in dark and light. Briefs 4, 6, 7, 8, 10 are defined but not rendered in this run (brief 4 and 8 need private reference retrieval).

```
node scripts/render-infogenius-benchmark.mjs          # compile, measure, write renders/ and RESULTS.md
node scripts/render-infogenius-benchmark.mjs --check  # verify specs compile and renders are current; write nothing
```

Rubric and gates: `RUBRIC.md`. Results: `RESULTS.md` (provider none, cost zero, time measured per compile on the machine that ran it). Round-1 review failed all five (see `REVIEW-round1.md`); rendering is not review: the `Review` column stays `pending` until a separate reviewer scores it.

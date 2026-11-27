# InfoGenius benchmark suite

Ten briefs in `briefs.json`. Eight (1, 2, 3, 5, 6, 7, 9, 10; the list is read from `briefs.json`, `deterministic_render: true`) have deterministic specs in `specs/` and are rendered by the existing compiler `scripts/compile-brand-diagrams.mjs` in dark and light. Briefs 4 and 8 are defined but not rendered (they need private reference retrieval).

```
node scripts/render-infogenius-benchmark.mjs          # compile, measure, write renders/ and RESULTS.md
node scripts/render-infogenius-benchmark.mjs --check  # verify specs compile and renders are current; write nothing
```

Rubric and gates: `RUBRIC.md`. Results: `RESULTS.md` (provider none, cost zero, time measured per compile on the machine that ran it). Round-1 review failed the five then rendered (see `REVIEW-round1.md`); rendering is not review: the `Review` column stays `pending` until a separate reviewer scores it.

## Direction B slot specs (not art)

`direction-b/*.slots.json` describe a character-led composition for briefs 1, 4, 5 and 9 as layout regions plus character slots. Each slot holds a resolver query (name or alias, preferred edition, pose or expression note, minimum status `resolved`) in the VIS resolver contract (draft PR 92, unverified). No character is drawn or invented.

```
node scripts/infogenius-direction-b.mjs           # write previews/ (placeholder outlines) and decisions.json
node scripts/infogenius-direction-b.mjs --check   # validate; fail on drift or orphan previews
node scripts/infogenius-direction-b.mjs --results results.json   # decide for supplied resolver results; writes nothing
```

Rule: a slot whose query is ambiguous, not_found, unresolved, has no result, or resolves with no positive recovered reference blocks Direction B for that brief; the brief falls back to Direction A with a recorded reason (`decisions.json`). With no resolver run, all four fall back today.

# Independent prototype review

Review scope: deterministic seed/bloom experimental mechanism, local source and produced assets. This is an independent technical review, not owner approval, a production release, or hardware certification.

## Historical first-review verdict — superseded below

**Rigid-body prototype structurally sound; export timing, clearance envelope and web fallback require correction before an unqualified pass.** No canonical character assets were modified. Browser rendering, browser performance, mobile interaction and deployment remain unverified because the execution sandbox rejects Chromium's required local Unix socket and the separate cloud browser cannot reach the local preview. No workaround was attempted.

## Independently observed evidence

- Inspected actual 1280×720 form A and form B PNGs. The six ceramic/brass panels, central moss-green housing and amber lens remain recognisable across configurations. These CPU images retain visible sample noise; they qualify as prototype evidence, not a final cinema quality claim.
- Executed the five Node runtime tests: all passed.
- Parsed the actual GLB: 65 nodes, 47 mesh resources, six rotation animation tracks, unit node scales. Static joint world matrices agree with the analytic source after Z-up→Y-up conversion within `8.75e-8` matrix units.
- Reopened the produced USD with the OpenUSD SDK: 52 mesh prim instances. Structural parsing alone does not validate animated equivalence.
- Independently evaluated source mesh edge invariance through 201 q positions × six panels. Maximum edge-length error is below `1e-15 m`; local topology contains 450 vertices and 448 quads per shell. Proper rotation and fixed attachment construction preserve geometric identity.
- The quintic source law has zero velocity and acceleration at both ends of each active phase. Holds therefore join C2. Mid-flight reversal is rejected; scrubbing is inspection, not a dynamically feasible trajectory.
- The moving-panel sector certificate is mathematically appropriate: every triangle is a convex combination of vertices; exact extrema of each vertex's radial sinusoid bound its position for the full permitted angle interval. Positive clearance from both 60-degree wedge boundaries prevents panel-panel intersection even for independently phased joints. The final reported lower bound is 57.40 mm for panel groups, including spines/trim, subject to unchanged source geometry and the verified basis.

## Corrections required

1. **Core envelope:** the actual GLB core's greatest vertex radius from `(0,1.22,0)` in Y-up coordinates is `0.504123 m`; radius `0.48 m` does not enclose the amber lens. Use a derived bound or at least `0.505 m` with an explicit numerical margin, then regenerate the clearance receipt. Convexity of a sphere guarantees that enclosing every triangle vertex encloses triangle interiors.
2. **Animation timeline:** exported GLB keys currently occupy `0.0333333…6.0333333 s`; the analytic law is relative to the first sample. The current USD conversion `frame=t*30+1` shifts source animation by one frame. Before correction, direct comparison shows up to `0.02511 rad` angular error and `0.02254` world-matrix error. Normalize GLB input times to zero and update accessor bounds, or carry the offset explicitly through every adapter. Recheck both keys and intermediate times against the analytic law.
3. **Web fallback:** `WebGLRenderer` construction occurs before the load try/catch. An unavailable WebGL context can abort all setup before the fallback message. The template currently promises a static fallback/source package without embedding or linking those artifacts. Supply an actual static image and honest error path.
4. **Event freshness:** `EventProjection.refresh()` is not invoked by the current UI loop, so stale running/succeeded presentation does not become unknown. Call it and refresh the displayed state.
5. **Event-to-form conflict:** an idle event during unfolding requests seed but is rejected and silently lost. Queue the last presentation target until an endpoint, or surface a rejected/pending request. Never reverse velocity instantaneously.

## Claims that remain out of scope

Core/base clearance is sampled, not a continuous all-pairs collision certificate. Bearing, axle and intended rigid attachment contact is excluded. No mass, torque, balance, friction, manufacturing tolerance or material-strength analysis was performed. Identity recognition has no blinded human study. No generative model was executed. No inference/provider credit cost or hardware frame-rate claim is established by these artifacts.

## Release boundary

Keep the result a bounded noncanonical local experiment until the corrections and exported-animation checks pass. Public flagship release requires separate browser QA, independent release evidence and owner approval under the existing repository contract. There is no need to create a replacement OAVS registry, orchestration service or DAM.


## Final technical recheck — supersedes the initial blocking verdict

**PASS for the bounded deterministic mechanical prototype and qualified GLB/USD exports. Browser presentation and performance remain unverified; this is not a public release approval.**

All material first-review findings have been corrected in the inspected source and delivered artifacts:

- The delivered GLB has one six-channel `seed_to_bloom` clip with normalized zero-based input times. Independent rerun of all nine Node runtime/export tests passed; Khronos validation reports zero errors and zero warnings.
- The actual USD now uses scalar single-axis `rotateZ` hinge tracks, avoiding the observed near-identity quaternion interpolation issue. Static node quaternions are normalized. The independent delivered-artifact comparison ran **10,806 world-transform comparisons** (1,801 q positions × six hinges). Maximum error at baked keys is **4.6774e-7** matrix units; maximum dense intermediate error is **6.3802e-5**, consistent with the measured 30fps baked approximation. The web executor retains the analytic curve.
- Actual final core vertex radius is **0.504123 m**, enclosed by the corrected **0.51 m** sphere. The regenerated source receipt reports a conservative sampled panel/core gap of **24.53 mm**, with the existing scope and contact exclusions preserved.
- The full web initialization is caught; a genuine WebP static fallback is embedded. Explicit fallback/canvas/overlay/loading z-indices resolve the identified paint-order defect. The embedded GLB was checked against the final exported GLB hash. There are no unresolved template substitution tokens.
- The inspected UI invokes event freshness checks every 500 ms and queues a requested presentation endpoint while the current transformation settles. This addresses the reviewed silent loss during timed motion without introducing mid-flight reversal.

The exact independent USD and core-envelope test is included as `checks/verify_usd.py`. It compares the delivered asset against the analytic source rather than importing the export adapter. It asserts a dense matrix error below `1e-4`, key error below `2e-6`, correct units/up-axis/time rate and an enclosing core sphere.

Qualified final asset hashes:

- GLB SHA-256: `16d34d5174ea70023b7907f38117d771e264670d18730487dc5192a0bff27728`
- USD SHA-256: `e91f0c17702a745b375252418dae6d94c04c449fac1e7f05ef3dff4b1fcca5b0`

The earlier scope limitations still apply: sampled core/base clearance, intentional bearing/contact exclusions, no dynamic or manufacturing certification, no human identity study, visible prototype sample noise, no browser rendering/mobile/performance evidence, and no production/deployment claim. Source inspection and offline Three.js animation evaluation do not substitute for browser QA.

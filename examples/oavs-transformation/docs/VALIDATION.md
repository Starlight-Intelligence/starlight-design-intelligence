# Validation receipt — experimental prototype

Independent technical verdict: **PASS for the bounded rigid-link prototype and GLB/USD exports**. Read [independent review](INDEPENDENT_REVIEW.md) for corrected first-candidate defects and remaining limits. This is not owner approval or a production release.

| Check | Observed result |
|---|---|
| Node runtime/export suite | 9 passed, 0 failed |
| Khronos glTF validator | 0 errors, 0 warnings |
| Source geometry | 6 persistent links; 65 nodes; 47 mesh resources; 31,196 triangles |
| Panel sector certificate | 57.40 mm conservative separation bound for all permitted joint angles |
| Sampled core clearance | 24.53 mm lower bound against independently qualified 0.51 m envelope |
| Sampled base clearance | 73.76 mm vertical lower bound |
| Clearance sampling | 2,001 q samples; equivalent 3 ms time intervals |
| Reverse source matrix error | 8.88e-16 |
| Dense GLB angle error | 6.407017e-05 rad |
| GLB key angle error | 4.777676e-07 rad |
| Dense USD world-matrix error | 6.380133e-05; 10,806 comparisons |
| USD key matrix error | 4.677393e-07 |
| Asset/schema graphs | Valid, unique IDs, acyclic attachments/dependencies |
| Web UI | Source/bundle and embedded asset checked; browser GPU, mobile and frame-time unverified |
| Provider generation | 0 paid image/3D/video generation calls; 0 such provider credits |

The panel sector certificate is continuous. Core/base clearance remains sampled; intentional bearing/attachment contact is excluded. Static support/hardware/dynamic feasibility remains outside qualification. Human visual recognition and audience usefulness were not studied.

Prototype build and three 1280×720 stills took 38.01 seconds in the observed CPU build. The final 960×540/24fps cinematic render has its own generated wall-time receipt. Browser fps is unknown. Host electricity/compute price, subscription allocation and research-tool billing are unavailable; total cost is not asserted to be zero.

GLB SHA-256: `16d34d5174ea70023b7907f38117d771e264670d18730487dc5192a0bff27728`  
USD SHA-256: `e91f0c17702a745b375252418dae6d94c04c449fac1e7f05ef3dff4b1fcca5b0`

Reproduce with the lockfile, Blender 4.3.2, OpenUSD 25.11 and the documented Python environment. Geometry/trajectory equality is the reproducibility contract; video and Blender containers are not asserted byte deterministic.

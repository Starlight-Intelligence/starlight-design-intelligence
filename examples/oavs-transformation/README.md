# OAVS transformation experiment

One noncanonical botanical seed/bloom mechanism, built within Starlight's existing living-design authority. Six persistent rigid panels rotate on fixed hinges around one amber-core identity. This is a reproducible research prototype; approved characters and production systems remain unchanged.

Read [architecture and audit](docs/ARCHITECTURE.md). Open the delivered `Starlight-Transformation-Lab.html` for orbit, progress inspection, endpoint transformation and synthetic workflow projection. It contains its own GLB and static fallback. Browser GPU/mobile behavior remains unqualified in the restricted build host.

## Reproduce

Requirements: Blender 4.3.2 with bundled NumPy, FFmpeg, Python 3.12 with NumPy 2.3.5 / SciPy 1.17.0 / jsonschema 4.26.0 / Pillow 13.0.0, OpenUSD `usd-core==25.11`, Node 24 and the committed npm lockfile. Exact observed environment is also recorded in the generated receipt.

```bash
npm ci
blender -b -t 4 --python scripts/build_scene.py
python scripts/validate_mechanism.py
python scripts/export_usd.py
python checks/verify_usd.py
npm test
node scripts/build_web.mjs
python scripts/build_manifest.py
blender -b outputs/seed-bloom.blend -t 4 --python scripts/render_frames.py
python scripts/package_video.py
```

`build_scene.py` normalizes the GLB after export. Do not run normalization twice on a partially published asset; regenerate from source. `export_usd.py` needs the OpenUSD SDK in Python's import path. `build_web.mjs` embeds the actual seed still; the build pipeline creates its WebP derivative. The generated outputs directory is intentionally untracked.

Tests cover source/runtime agreement, event-order/freshness boundaries, endpoint-only reversal, immutable mesh/attachment identities, glTF conformance and actual baked-animation error. The geometry verifier reports a continuous sector bound for panel assemblies and separately sampled core/base clearance. Read its exclusions before reusing the mechanism.

The cinematic cut and inverse use the same rendered ordered frame sequence. No generated intermediate frames are involved. This prototype does not validate actuator loads, hardware construction, live agent execution, or premium public release readiness.

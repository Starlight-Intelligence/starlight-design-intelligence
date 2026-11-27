# Reproduce a recovered identity review

Use the existing VIS resolver and the owning brand kit to select exact source files. Confirm intended-use and channel permissions where the receipt supports them. A local review manifest is evidence for this run. VIS and the owner record decisions.

The owning Starlight site already compiles its kit and checks its deployed brand screen. Atelier I already builds rendered candidate kits and computes connected ink regions. Atelier II records optical sizes and subpixel phase. Run those tools in their owners for those jobs. This adapter adds cross-source SHA-256 verification and Chromium evidence at a common size, on a machine with Python, Pillow, Playwright and Chromium already provisioned. It writes no source files and opens no external requests.

## Inputs and outputs

Provide a JSON array with one record per reviewed SVG. Fields are `id`, `label`, `family`, local `file` relative to the manifest, `source` URL, `status`, `sha256`, optional `background` and optional `show`. Preserve digest and source path from the current authority. Review-only Figma exports and authored originals each retain their own hashes. SHA-256 deduplicates identical bytes. Record visually equivalent or derived artwork as explicit lineage.

```sh
python -m unittest discover -s skills/logo-system/tools -p test_review.py
python skills/logo-system/tools/review.py /path/to/manifest.json /path/to/output
```

Use `--chromium /path/to/headless_shell` to select an existing browser. The output contains `inspection.json` and `favicon-matrix.png`. Measurements cover 16, 24, 32, 64, 128 and 512 CSS pixels at 1×. The display compares one declared background per file. The diagnostic also reports exact solid paint contrast on both brand grounds. Gradient, opacity and visual adaptation need separate review. Alpha measures bounds, centroid, circular mask loss and overlap against the same SVG's 512 px reference. These measurements do not establish recognition, ownership rights or promotion.

## Motion proof

Stage `motion.html`, `motion.js`, the existing `starlight-star.svg` from the owning kit, and the `dist/gsap.min.js` file from the owning site's existing lockfile at GSAP 3.15.0. Compare the tarball against the integrity field in the [pinned product lockfile](https://github.com/Starlight-Intelligence/starlightintelligence.ai/blob/35b9e480ec2e2e1e8ec3ad6fa1e4137eb06e134e/pnpm-lock.yaml) before extracting. The proof verifies the star hash before enhancing the static image. Serve from loopback. Playback requires a user action. Reduced motion and a missing animation runtime retain a still mark.

```sh
python skills/logo-system/tools/test_motion.py /path/to/staged-proof /path/to/output
```

Accepts an optional third argument for the Chromium binary. The test verifies keyboard playback, change of motion preference during playback, exact rest pixels, a mobile viewport, no JavaScript and unavailable GSAP.

## Upstream contributions

| Source at reviewed revision | Contribution applied | Reuse boundary |
| --- | --- | --- |
| [logo-design-skill](https://github.com/kaankiziltug/logo-design-skill/tree/e9eaddc07895575253d6663320354a708f53e955) | True-size comparison and early decision sheet | Existing logo-system owns the workflow. The reference library stays outside the product and third-party marks remain references. |
| [brand-identity-skill](https://github.com/fatihaydost/brand-identity-skill/tree/af7ba40fe067b8b4aaeb2af90ed6c8996d014791) | Keep-source critique, one-ink checks, and evidence from the actual token/type authority | Existing brand kit owns tokens and fonts. The upstream environment and network-enabled steps are outside this run. |
| [pixel2motion](https://github.com/nolangz/pixel2motion/tree/e9faedb28930df0da2acf17da00c80730a78cfe8) | Address the companion as an existing semantic part and test the settled frame against the source | Original vectors already exist, so tracing has no role in this run. |
| [motion-design-skills](https://github.com/iart-ai/motion-design-skills/tree/b85e50c4cef5ff17aa2187a10d49d2dae9226c74) | One motion gesture, brief settle, and still final state for reduced motion | Existing SIS motion language and GSAP pin govern the proof. |

All four repositories had MIT license files at the pinned snapshots. No upstream code or reference library is vendored here.

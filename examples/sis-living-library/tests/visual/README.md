# Reviewed screenshot baselines

UI source: b9c5c411974a6ddb63c338bd29b7360070b13ff6. CI run: 43364639816. Chromium via Playwright 1.62.1, Ubuntu 24.04, DPR 1; desktop 1440×1000, mobile390×844; Midnight fixture state and reduced-motion media emulation.

All eight images were independently inspected. The initial mobile company/geography wrapping was repaired before acceptance. The second render matched every baseline with zero changed pixels. PNGs are reference snapshots, not evidence of a live service or real company/usage data.

CI skips baseline generation when these PNGs exist, then compares decoded pixels with a 0.5% changed-pixel ceiling and channel tolerance24. Missing baselines fail the local comparison command. To intentionally replace them, run UPDATE_SNAPSHOTS=1 npm run test:products, inspect every changed image, record the reason and review the delta before committing.

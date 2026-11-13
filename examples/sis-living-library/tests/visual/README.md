# Reviewed screenshot baselines

Current Console desktop/mobile and Launch desktop captures: source 5e253f87d593a89b525fe2dad6ed0600be79688d, GitHub Actions run 43454295904. All three replacements and the unchanged mobile Launch image were independently viewed and accepted. Chromium/Playwright 1.62.1, Ubuntu 24.04, DPR 1, Midnight, reduced motion, desktop 1440×1000 and mobile 390×844.

The earlier run intentionally failed regression against the previous layout: Console desktop 8.68%, Console mobile 7.89%, Launch desktop 1.39% decoded-pixel change. The other five screenshots matched exactly. All 24 theme/device/route axe, reflow and local-journey checks passed. No full-page, screen-reader, other-browser or real runtime conformance claim.

| Capture | SHA-256 |
|---|---|
| desktop-console.png | 4349e1ee22933a3abba462e4731771f10fff3bfcbefdee71262446339b8de8d8 |
| mobile-console.png | 42cea9abe6cac27dd1a5ca6ed361bc9c16f5bb0b3d6f51cffbb44d2f4e96628c |
| desktop-launch.png | 9a2df233908fd23fdca99ddeee92bd69505e1fffcfaa5c2ad18197fd6f700fae |

Browser/Intelligence and mobile Launch retain the original b9c5c411974a6ddb63c338bd29b7360070b13ff6 baselines, previously reviewed in CI run 43364639816 and matched by the new run.

CI never generates or approves baselines automatically. It compares decoded pixels at a 0.5% changed-pixel ceiling with channel tolerance 24. Missing files fail. Explicit baseline creation requires image inspection, a reason and independent acceptance before commit. These captures show synthetic fixtures, not live customers or provider activity.

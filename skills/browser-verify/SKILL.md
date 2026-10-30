---
name: browser-verify
description: "Use the pinned Microsoft Playwright CLI skill to verify a rendered frontend, capture desktop and mobile, exercise user journeys and collect browser evidence. Prefer an existing supported host browser where host instructions require it."
---

# Browser verification

Read `../../vendor/playwright/SKILL.md` and only the named references needed.
Inspect `node <plugin-root>/scripts/design-toolkit.mjs doctor`; bundled skill
instructions do not install `@playwright/cli` or a browser. The source snapshot
records CLI 0.1.22 and its exact upstream Playwright dependency in package.json.

Use the host's permitted browser surface and existing tooling first. Host browser
instructions take precedence over upstream CLI shortcuts. Do not switch to a
separate Playwright session to evade restrictions or reuse an unavailable
signed-in session. Use CLI automation for the authorized local app or target
where the host allows it. Read current `--help` before commands whose flags
differ from the pinned source. Do not run an upstream installer automatically.

## Evidence contract

1. Bind the run to an exact product commit, URL, route and test data.
2. Capture a representative desktop and mobile viewport. Inspect the actual
   pixels; a snapshot tree alone cannot establish composition or contrast.
3. Exercise the primary journey, focus order, navigation, form validation and
   one applicable loading/empty/error state. Record observed behavior.
4. Sample reduced motion and reflow; for shipped animation use the canonical
   motion evidence contract, not a single static screenshot.
5. Record console/network errors relevant to the journey and the exact covered
   paths. Retain artifact hashes and viewport/DPR in the product receipt.

Keep browser storage state and cookies private. Do not attach them to public
pull requests. Review traces/screenshots for sensitive data before sharing.
Do not submit real payments, send messages or mutate unrelated account data
as a test without task authorization.

Separate source inspection, browser launch, journey success and production
verification. A CLI version response establishes only executable availability.
When the browser cannot run, return the remaining checks explicitly.

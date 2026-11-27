import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const consumer = resolve(import.meta.dirname, '../examples/next-app');
const port = '4189';
const url = `http://127.0.0.1:${port}/orbital-glass`;
const server = spawn(process.execPath, [
  'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port,
], { cwd: consumer, stdio: 'inherit' });

const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, replay: true },
  { name: '320px reflow', viewport: { width: 320, height: 700 }, replay: true },
  { name: 'reduced motion', viewport: { width: 393, height: 852 }, reducedMotion: 'reduce', replay: false },
  { name: 'forced colors', viewport: { width: 393, height: 852 }, forcedColors: 'active', replay: false },
];

let browser;
try {
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) }).catch(() => null);
    if (response?.ok) break;
    assert.equal(server.exitCode, null, 'Next.js server exited before the route was ready');
    assert(attempt < 29, 'Orbital Glass route did not become ready');
    await delay(200);
  }

  browser = await chromium.launch();
  for (const { name, replay: canReplay, ...options } of profiles) {
    const page = await browser.newPage(options);
    page.setDefaultTimeout(5000);
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    try {
      assert((await page.goto(url))?.ok(), name);
      assert(await page.getByRole('heading', { name: 'Orbital Glass', level: 1 }).isVisible(), name);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name);
      const fonts = await page.evaluate(async () => {
        await document.fonts.ready;
        return Array.from(document.fonts).filter(font => font.status === 'loaded').map(font => font.family);
      });
      for (const family of ['Instrument Sans', 'Instrument Serif', 'IBM Plex Mono']) {
        assert(fonts.includes(family), `${name}: missing ${family}`);
      }

      const replay = page.getByRole('button', { name: 'Replay light' });
      assert.equal(await replay.isVisible(), canReplay, name);
      assert.equal(await page.locator('[data-replay]').count(), 0, name);
      if (canReplay) {
        await page.keyboard.press('Tab');
        assert(await replay.evaluate(button => button === document.activeElement), name);
        await page.keyboard.press('Enter');
        const state = await page.locator('[data-replay]').evaluate(async light => {
          const [animation] = light.getAnimations();
          const active = animation?.playState;
          await animation?.finished;
          return [active, animation?.playState];
        });
        assert.deepEqual(state, ['running', 'finished'], name);
        assert(await replay.evaluate(button => button === document.activeElement), name);
      }

      await page.addScriptTag({ path: resolve(import.meta.dirname, '../public/qa/axe.min.js') });
      const violations = await page.evaluate(async () => (await window.axe.run()).violations.map(({ id }) => id));
      assert.deepEqual(violations, [], name);
      assert.deepEqual(browserErrors, [], name);
      console.log(`PASS: ${name}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser?.close();
  server.kill();
}

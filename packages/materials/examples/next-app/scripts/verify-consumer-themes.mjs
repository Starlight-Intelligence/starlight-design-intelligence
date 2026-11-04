import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { inspectInterfaceFoundations } from '../../../../../scripts/inspect-interface-foundations.mjs';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.EVIDENCE_DIR || await mkdtemp(join(tmpdir(), 'materials-themes-'));
await mkdir(output, { recursive: true });
const receipt = {
  capturedAt: new Date().toISOString(),
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version,
  baseURL,
  rendering: 'Hosted Chromium with SwiftShader software rendering; not hardware performance proof',
  states: [], screenshots: [], errors: [], consoleDiagnostics: [], fontRequests: [],
};
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
receipt.browser = browser.version();

function contrast(a, b) {
  const luminance = (rgb) => {
    const [r, g, b] = rgb.slice(0, 3).map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

async function screenshot(page, name) {
  const file = `${name}.png`;
  const bytes = await page.screenshot({ path: join(output, file), fullPage: true });
  receipt.screenshots.push({
    file, sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
    viewport: page.viewportSize(), dpr: await page.evaluate(() => devicePixelRatio),
    url: page.url(), capturedAt: new Date().toISOString(),
  });
}

async function sample(page, selector) {
  return page.locator(selector).first().evaluate((element) => {
    const rgb = (value) => {
      const channels = (value.match(/[\d.]+/g) || []).map(Number);
      if (channels.length === 3) channels.push(1);
      return channels;
    };
    const style = getComputedStyle(element);
    let node = element;
    let background = [0, 0, 0, 0];
    let opacity = 1;
    while (node) {
      const current = getComputedStyle(node);
      opacity *= Number(current.opacity);
      const under = rgb(current.backgroundColor);
      const alpha = background[3] + under[3] * (1 - background[3]);
      if (alpha) {
        background = [
          ...[0, 1, 2].map((i) => (background[i] * background[3] + under[i] * under[3] * (1 - background[3])) / alpha),
          alpha,
        ];
      }
      node = node.parentElement;
    }
    const foreground = rgb(style.color);
    return {
      text: element.textContent.trim().slice(0, 100),
      color: style.color, background: background.slice(0, 3),
      effectiveForeground: foreground.slice(0, 3).map((value, i) => value * opacity + background[i] * (1 - opacity)),
      font: style.fontFamily, weight: style.fontWeight, style: style.fontStyle,
      outline: style.outline, outlineColor: rgb(style.outlineColor), boxShadow: style.boxShadow,
    };
  });
}

async function platformFonts(page, selector) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    assert.ok(nodeId, `font specimen missing: ${selector}`);
    return (await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
  } finally { await session.detach(); }
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const mobile = viewport.width < 900;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
    try {
      const page = await context.newPage();
      page.on('pageerror', (error) => receipt.errors.push(String(error)));
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          receipt.consoleDiagnostics.push({ type: message.type(), text: message.text(), route: page.url() });
        }
      });
      page.on('request', (request) => {
        if (/\.(ttf|woff2?)(?:\?|$)|fonts\.googleapis|fonts\.gstatic/.test(request.url())) receipt.fontRequests.push(request.url());
      });
      for (const route of ['/', '/paper', '/ink', '/glass']) {
        const response = await page.goto(new URL(route, baseURL).href);
        assert.equal(response.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        const control = page.getByRole('combobox', { name: 'Theme', exact: true });
        await control.selectOption('ink');
        for (const profile of ['ink', 'paper', 'operator']) {
          await control.selectOption(profile);
          await control.focus();
          const state = {
            route, profile, viewport, touch: mobile,
            attributes: await page.locator('html').evaluate((root) => ({ theme: root.dataset.theme, mode: root.dataset.mode || null })),
            heading: await sample(page, 'h1'),
            accent: await sample(page, 'h1 em'),
            control: await sample(page, 'select'),
            detector: await page.evaluate(inspectInterfaceFoundations),
          };
          state.headingContrast = contrast(state.heading.effectiveForeground, state.heading.background);
          state.accentContrast = contrast(state.accent.effectiveForeground, state.accent.background);
          state.controlContrast = contrast(state.control.effectiveForeground, state.control.background);
          state.focusContrast = contrast(state.control.outlineColor, state.control.background);
          receipt.states.push(state);
          assert.ok(state.headingContrast >= 4.5, JSON.stringify(state));
          assert.ok(state.accentContrast >= 3, JSON.stringify(state));
          assert.ok(state.controlContrast >= 4.5, JSON.stringify(state));
          assert.ok(state.focusContrast >= 3, JSON.stringify(state));
          assert.match(state.control.outline, /2px/);
          assert.deepEqual(state.detector.failures, []);
          assert.deepEqual(state.attributes, { theme: profile === 'paper' ? 'paper' : 'ink', mode: profile === 'operator' ? 'operator' : null });
          if (profile === 'operator') {
            assert.equal(await page.locator('body').evaluate((body) => getComputedStyle(body).color), 'rgb(232, 235, 242)');
          }
          if (route === '/') {
            state.nestedProfiles = await page.evaluate(() => {
              const outer = document.createElement('div');
              outer.dataset.theme = 'paper';
              const nested = document.createElement('div');
              nested.dataset.mode = 'operator';
              nested.style.cssText = 'background:var(--sl-color-surface);color:var(--sl-color-on-surface)';
              outer.append(nested);
              document.body.append(outer);
              const style = getComputedStyle(nested);
              const operator = { color: style.color, background: style.backgroundColor, glass: style.getPropertyValue('--sl-color-glass-tint-webgl').trim() };
              delete nested.dataset.mode;
              nested.dataset.theme = 'ink';
              const ink = { color: style.color, background: style.backgroundColor };
              nested.dataset.theme = 'paper';
              const paper = { color: style.color, background: style.backgroundColor };
              outer.remove();
              return { operator, ink, paper };
            });
            assert.deepEqual(state.nestedProfiles, {
              operator: { color: 'rgb(232, 235, 242)', background: 'rgb(11, 13, 18)', glass: 'rgba(7, 10, 16, 0.30)' },
              ink: { color: 'rgb(251, 246, 235)', background: 'rgb(7, 10, 16)' },
              paper: { color: 'rgb(14, 19, 27)', background: 'rgb(239, 237, 231)' },
            });
          }
          if (route === '/paper') {
            state.paperButton = await sample(page, '[data-slot="button"][data-material="paper"]');
            assert.ok(contrast(state.paperButton.effectiveForeground, state.paperButton.background) >= 4.5);
            await page.locator('[data-slot="button"][data-material="paper"]').first().focus();
            state.paperButtonFocus = await sample(page, '[data-slot="button"][data-material="paper"]');
            assert.notEqual(state.paperButtonFocus.boxShadow, 'none');
          }
          if (route === '/' || route === '/paper') {
            await screenshot(page, `${mobile ? 'mobile' : 'desktop'}-${route === '/' ? 'home' : 'paper'}-${profile}`);
          }
        }
        const specimens = [
          ['h1', 'Instrument Sans'],
          ['h1 em', 'Instrument Serif'],
          ...(route === '/ink' || route === '/glass' ? [['.font-mono', 'IBM Plex Mono']] : []),
        ];
        for (const [selector, family] of specimens) {
          const fonts = await platformFonts(page, selector);
          receipt.states.push({ route, viewport, selector, platformFonts: fonts });
          assert.ok(fonts.some((font) => font.isCustomFont && font.familyName === family && font.glyphCount > 0), JSON.stringify(fonts));
        }
      }
      await page.goto(new URL('/ink', baseURL).href);
      const control = page.getByRole('combobox', { name: 'Theme', exact: true });
      await control.focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      assert.equal(await control.inputValue(), 'paper');
      await control.selectOption('operator');
      await page.getByRole('button', { name: 'Open the sheet', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('dialog').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('button', { name: 'Open the sheet', exact: true }).evaluate((node) => node === document.activeElement), true);
      await page.reload();
      assert.equal(await control.inputValue(), 'ink', 'reload preserves the default, with no stored preference');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(new URL('/glass', baseURL).href);
      await page.waitForFunction(() => document.querySelector('[data-glass]')?.getAttribute('data-glass') === 'css');
      await screenshot(page, `${mobile ? 'mobile' : 'desktop'}-glass-reduced-motion`);
      receipt.states.push({ viewport, reducedMotion: true, glass: await page.locator('[data-glass]').evaluate((node) => ({ ...node.dataset })) });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      if (!mobile) {
        const waitGlass = async (mode) => page.waitForFunction((mode) => document.querySelector('[data-glass]')?.getAttribute('data-glass') === mode, mode, { timeout: 30_000 });
        await waitGlass('webgl');
        const renderer = await page.locator('canvas').evaluate((canvas) => {
          const gl = canvas.getContext('webgl2');
          const info = gl?.getExtension('WEBGL_debug_renderer_info');
          return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unavailable';
        });
        receipt.renderer = renderer;
        await page.setViewportSize({ width: 390, height: 844 });
        await waitGlass('css');
        await page.setViewportSize(viewport);
        await waitGlass('webgl');
        const session = await context.newCDPSession(page);
        await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
        await waitGlass('css');
        await session.send('Emulation.setEmulatedMedia', { features: [] });
        await waitGlass('webgl');
        await session.detach();
        for (let i = 0; i < 2; i++) {
          await page.getByRole('navigation', { name: 'Materials' }).getByRole('link', { name: 'Ink', exact: true }).click();
          await page.getByRole('navigation', { name: 'Materials' }).getByRole('link', { name: 'Glass', exact: true }).click();
          await waitGlass('webgl');
        }
        receipt.states.push({ viewport, journey: 'desktop-phone-desktop, transparency fallback/recovery and two route remounts', glass: await page.locator('[data-glass]').evaluate((node) => ({ ...node.dataset })) });
        await screenshot(page, 'desktop-glass-recovered');
      }

      const fallback = await context.newPage();
      const blockedFonts = [];
      fallback.on('requestfailed', (request) => blockedFonts.push({ url: request.url(), error: request.failure()?.errorText }));
      await fallback.route('**/*', (route) => /\.(ttf|woff2?)(?:\?|$)/.test(route.request().url()) ? route.abort() : route.continue());
      await fallback.goto(new URL('/', baseURL).href);
      await fallback.evaluate(() => document.fonts.ready);
      receipt.states.push({ viewport, journey: 'font network failure', blockedFonts, heading: await sample(fallback, 'h1'), detector: await fallback.evaluate(inspectInterfaceFoundations) });
      assert.deepEqual(receipt.states.at(-1).detector.failures, []);
      assert.ok(blockedFonts.length >= 3);
      assert.ok((await platformFonts(fallback, 'h1')).every((font) => !font.isCustomFont));
      await screenshot(fallback, `${mobile ? 'mobile' : 'desktop'}-font-fallback`);
      await fallback.close();
    } finally { await context.close(); }
  }
  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await noScript.newPage();
    await page.goto(new URL('/glass', baseURL).href);
    assert.equal(await page.locator('[data-glass]').getAttribute('data-glass'), 'css');
    receipt.states.push({ journey: 'no JavaScript', glass: 'server CSS still', themeControl: 'requires JavaScript; default Ink remains readable' });
  } finally { await noScript.close(); }
  assert.equal(receipt.errors.length, 0, receipt.errors.join('\n'));
  assert.ok(!receipt.consoleDiagnostics.some((message) => /hydration|react error/i.test(message.text)), JSON.stringify(receipt.consoleDiagnostics));
  assert.ok(receipt.fontRequests.length > 0);
  assert.ok(receipt.fontRequests.every((url) => new URL(url).origin === new URL(baseURL).origin), JSON.stringify(receipt.fontRequests));
  receipt.verdict = 'PASS — bounded local production consumer checks, not release approval';
} catch (error) {
  receipt.verdict = 'FAIL';
  receipt.failure = String(error.stack || error);
  throw error;
} finally {
  await browser.close();
  await writeFile(join(output, 'browser.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Browser evidence: ${output}`);
}

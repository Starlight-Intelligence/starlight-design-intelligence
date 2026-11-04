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
      font: style.fontFamily, fontSize: parseFloat(style.fontSize), weight: style.fontWeight, style: style.fontStyle,
      foreground, opacity,
      outline: style.outline, outlineColor: rgb(style.outlineColor), boxShadow: style.boxShadow,
    };
  });
}

// Read the actual image/canvas backdrop with the glyphs hidden. The full bounding box
// is conservative: every sampled background pixel must support the nominal text color.
async function renderedBackdrop(page, selector, name, hideSelector = selector) {
  const foreground = await sample(page, selector);
  assert.equal(foreground.foreground[3], 1, 'rendered contrast requires opaque text');
  assert.equal(foreground.opacity, 1, 'rendered contrast requires opaque ancestors');
  const mask = await page.addStyleTag({ content: `${hideSelector}, ${hideSelector} * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; }` });
  let bytes;
  try {
    bytes = await page.locator(selector).first().screenshot({ animations: 'disabled', caret: 'hide' });
  } finally { await mask.evaluate((node) => node.remove()); }
  const file = `${name}-backdrop.png`;
  await writeFile(join(output, file), bytes);
  const measurement = await page.evaluate(async ({ encoded, foreground }) => {
    const data = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const image = await createImageBitmap(new Blob([data], { type: 'image/png' }));
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const luminance = (rgb) => rgb.reduce((sum, value, index) => {
        const channel = value / 255;
        return sum + [0.2126, 0.7152, 0.0722][index] * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      }, 0);
      const ink = luminance(foreground);
      let minimum = Infinity;
      let worst;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] !== 255) throw new Error('backdrop screenshot contains uncomposited pixels');
        const rgb = Array.from(pixels.slice(offset, offset + 3));
        const background = luminance(rgb);
        const ratio = (Math.max(ink, background) + 0.05) / (Math.min(ink, background) + 0.05);
        if (ratio < minimum) {
          minimum = ratio;
          worst = { rgb, x: (offset / 4) % canvas.width, y: Math.floor(offset / 4 / canvas.width) };
        }
      }
      return { contrast: minimum, worst, sampledPixels: pixels.length / 4, width: canvas.width, height: canvas.height };
    } finally { image.close(); }
  }, { encoded: bytes.toString('base64'), foreground: foreground.foreground.slice(0, 3) });
  return { method: 'nominal foreground against every rendered backdrop pixel with glyphs hidden', selector, foreground: foreground.foreground, file, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, ...measurement };
}

async function verifyBackdropFixture() {
  const context = await browser.newContext({ viewport: { width: 240, height: 120 }, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    await page.setContent('<style>body{margin:0}canvas,img{position:absolute;inset:0;width:240px;height:120px}#specimen{position:absolute;inset:20px;color:rgb(0,0,0);font-size:24px}</style><canvas width="240" height="120"></canvas><img alt=""><div id="specimen">Backdrop fixture</div>');
    const results = [];
    for (const kind of ['poster', 'canvas']) {
      for (const [label, value, expected] of [['white', 255, 21], ['black', 0, 1]]) {
        await page.evaluate(async ({ kind, value }) => {
          const canvas = document.querySelector('canvas');
          const context = canvas.getContext('2d');
          context.fillStyle = `rgb(${value},${value},${value})`;
          context.fillRect(0, 0, canvas.width, canvas.height);
          const image = document.querySelector('img');
          image.style.display = kind === 'poster' ? 'block' : 'none';
          if (kind === 'poster') { image.src = canvas.toDataURL(); await image.decode(); }
        }, { kind, value });
        const measured = await renderedBackdrop(page, '#specimen', `fixture-${kind}-${label}`);
        assert.ok(Math.abs(measured.contrast - expected) < 0.001, JSON.stringify(measured));
        results.push({ kind, label, expected, ...measured });
      }
    }
    receipt.states.push({ journey: 'rendered backdrop detector rejects unreadable poster and canvas fixtures', results });
  } finally { await context.close(); }
}

function traceShaderUniforms() {
  const names = new WeakMap();
  const uploads = new WeakMap();
  Object.defineProperty(window, '__materialsUniformTrace', { value: uploads });
  for (const constructor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!constructor) continue;
    const prototype = constructor.prototype;
    const locate = prototype.getUniformLocation;
    prototype.getUniformLocation = function (...args) {
      const location = Reflect.apply(locate, this, args);
      if (location) names.set(location, args[1]);
      return location;
    };
    for (const method of ['uniform3f', 'uniform3fv']) {
      const original = prototype[method];
      prototype[method] = function (...args) {
        const result = Reflect.apply(original, this, args);
        if (names.get(args[0]) === 'uInk') {
          const vector = method === 'uniform3f' ? args.slice(1, 4) : Array.from(args[1]).slice(args[2] || 0, (args[2] || 0) + 3);
          uploads.set(this.canvas, vector);
        }
        return result;
      };
    }
  }
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
  await verifyBackdropFixture();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const mobile = viewport.width < 900;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
    try {
      await context.addInitScript(traceShaderUniforms);
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
          if (route === '/glass' && !mobile) {
            await page.waitForFunction(() => {
              const scene = document.querySelector('[data-glass]');
              const canvas = scene?.querySelector('canvas');
              const uploaded = window.__materialsUniformTrace?.get(canvas);
              const token = scene && /^#([0-9a-f]{6})$/i.exec(getComputedStyle(scene).getPropertyValue('--sl-color-primary').trim());
              return scene?.dataset.glass === 'webgl' && token && uploaded && [0, 2, 4].every((index, channel) => Math.abs(uploaded[channel] - parseInt(token[1].slice(index, index + 2), 16) / 255) < 0.000001);
            }, undefined, { timeout: 30_000 });
          }
          await page.keyboard.press('Tab');
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
          if (route === '/glass') {
            const name = `${mobile ? 'mobile' : 'desktop'}-glass-${profile}`;
            state.headingBackdrop = await renderedBackdrop(page, 'h1', `${name}-heading`, 'h1');
            state.accentBackdrop = await renderedBackdrop(page, 'h1 em', `${name}-accent`, 'h1');
            state.headingContrast = state.headingBackdrop.contrast;
            state.accentContrast = state.accentBackdrop.contrast;
            if (!mobile) state.shaderInk = await page.locator('canvas').evaluate((canvas) => window.__materialsUniformTrace.get(canvas));
          }
          state.controlContrast = contrast(state.control.effectiveForeground, state.control.background);
          state.focusContrast = contrast(state.control.outlineColor, state.control.background);
          receipt.states.push(state);
          assert.ok(state.headingContrast >= 4.5, JSON.stringify(state));
          assert.ok(state.accentContrast >= 3, JSON.stringify(state));
          assert.ok(state.controlContrast >= 4.5, JSON.stringify(state));
          assert.ok(state.control.fontSize >= 16, `theme selector must remain at least 16px: ${state.control.fontSize}`);
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
              nested.style.cssText = 'background:var(--sl-color-surface);color:var(--sl-color-on-surface);border-color:var(--sl-color-glass-tint-webgl)';
              outer.append(nested);
              document.body.append(outer);
              const style = getComputedStyle(nested);
              const operator = { color: style.color, background: style.backgroundColor, glass: style.borderTopColor };
              delete nested.dataset.mode;
              nested.dataset.theme = 'ink';
              const ink = { color: style.color, background: style.backgroundColor };
              nested.dataset.theme = 'paper';
              const paper = { color: style.color, background: style.backgroundColor };
              outer.remove();
              return { operator, ink, paper };
            });
            const { glass, ...operator } = state.nestedProfiles.operator;
            assert.deepEqual({ ...state.nestedProfiles, operator }, {
              operator: { color: 'rgb(232, 235, 242)', background: 'rgb(11, 13, 18)' },
              ink: { color: 'rgb(251, 246, 235)', background: 'rgb(7, 10, 16)' },
              paper: { color: 'rgb(14, 19, 27)', background: 'rgb(239, 237, 231)' },
            });
            const channels = glass.match(/[\d.]+/g).map(Number);
            assert.deepEqual(channels.slice(0, 3), [7, 10, 16]);
            assert.ok(Math.abs(channels[3] - 0.3) <= 1 / 255, glass);
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
      await page.waitForFunction(() => {
        const scene = document.querySelector('[data-glass]');
        return scene?.getAttribute('data-glass') === 'css' && scene.getAttribute('data-glass-reason') === 'reduced motion requested';
      });
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

      // A fresh context keeps a previously loaded font cache from concealing failure.
      const fallbackContext = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
      try {
        const fallback = await fallbackContext.newPage();
        const blockedFonts = [];
        fallback.on('pageerror', (error) => receipt.errors.push(String(error)));
        fallback.on('requestfailed', (request) => blockedFonts.push({ url: request.url(), error: request.failure()?.errorText }));
        await fallback.route('**/*', (route) => /\.(ttf|woff2?)(?:\?|$)/.test(route.request().url()) ? route.abort() : route.continue());
        await fallback.goto(new URL('/', baseURL).href);
        await fallback.evaluate(() => document.fonts.ready);
        receipt.states.push({ viewport, journey: 'font network failure', blockedFonts, heading: await sample(fallback, 'h1'), detector: await fallback.evaluate(inspectInterfaceFoundations) });
        assert.deepEqual(receipt.states.at(-1).detector.failures, []);
        assert.ok(blockedFonts.length >= 3);
        assert.ok((await platformFonts(fallback, 'h1')).every((font) => !font.isCustomFont));
        await screenshot(fallback, `${mobile ? 'mobile' : 'desktop'}-font-fallback`);
      } finally { await fallbackContext.close(); }
    } finally { await context.close(); }
  }
  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await noScript.newPage();
    await page.goto(new URL('/glass', baseURL).href);
    assert.equal(await page.locator('[data-glass]').getAttribute('data-glass'), 'css');
    assert.equal(await page.getByRole('combobox', { name: 'Theme', exact: true }).isDisabled(), true);
    receipt.states.push({ journey: 'no JavaScript', glass: 'server CSS still', themeControl: 'disabled until hydration; default Ink remains readable' });
  } finally { await noScript.close(); }
  assert.equal(receipt.errors.length, 0, receipt.errors.join('\n'));
  assert.ok(!receipt.consoleDiagnostics.some((message) => /hydration|react error/i.test(message.text)), JSON.stringify(receipt.consoleDiagnostics));
  assert.ok(!receipt.consoleDiagnostics.some((message) => /WebGL.*INVALID_OPERATION/i.test(message.text)), JSON.stringify(receipt.consoleDiagnostics));
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

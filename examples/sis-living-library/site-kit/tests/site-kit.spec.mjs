import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = path.resolve(here, '..');
const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const PAGES = ['/', '/pricing', '/docs/introduction', '/docs/agents'];
const reduced = (info) => info.project.name.includes('reduced');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

test.describe('source contract (static)', () => {
  test('no bare 100vh, no user-scalable=no, hover only for fine pointers', async ({}, info) => {
    test.skip(info.project.name !== 'desktop', 'static check runs once');
    for (const file of await walk(path.join(kit, 'app')).then(async (a) => [...a, ...(await walk(path.join(kit, 'components')))])) {
      const src = await readFile(file, 'utf8');
      expect(src, file).not.toMatch(/\b100vh\b/);
      expect(src, file).not.toMatch(/user-scalable\s*=\s*no/);
      if (file.endsWith('.css')) {
        for (const m of src.matchAll(/@media[^{]*\(hover:\s*hover\)[^{]*\{/g)) expect(m[0], file).toMatch(/pointer:\s*fine/);
        // :hover selectors only appear inside the fine-pointer block
        const fine = src.indexOf('@media (hover: hover) and (pointer: fine)');
        const before = fine === -1 ? src : src.slice(0, fine);
        expect(before, file).not.toMatch(/:hover/);
      }
    }
  });
});

test.describe('phone contract', () => {
  test('viewport meta covers the notch and allows zoom', async ({ page }) => {
    await page.goto('/');
    const content = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(content).toContain('viewport-fit=cover');
    expect(content).toMatch(/maximum-scale=(5|[6-9]|\d{2,})/);
    expect(content).not.toMatch(/user-scalable=(no|0)/);
  });

  for (const p of PAGES)
    test(`no horizontal scroll and no serious axe violations on ${p}`, async ({ page }) => {
      await page.goto(p, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
      const serious = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.length}`);
      expect(serious).toEqual([]);
    });

  test('text inputs are at least 16px', async ({ page }) => {
    await page.goto('/docs/introduction');
    const sizes = await page.$$eval('input[type="search"], input[type="text"], input[type="email"], textarea', (els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBeGreaterThan(0);
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);
  });

  test('manifest lists real PNG icons', async ({ request }) => {
    const m = await (await request.get('/manifest.webmanifest')).json();
    const sizes = m.icons.map((i) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(m.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of m.icons) {
      const r = await request.get(icon.src);
      expect(r.status()).toBe(200);
      expect(r.headers()['content-type']).toBe('image/png');
      const buf = await r.body();
      expect(buf.subarray(1, 4).toString()).toBe('PNG');
      expect(buf.readUInt32BE(16)).toBe(Number(icon.sizes.split('x')[0]));
    }
  });
});

test.describe('motion contract', () => {
  test('ledger: sequence when motion is allowed, final state at once when reduced', async ({ page }, info) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const ledger = page.locator('.ks-ledger');
    if (reduced(info)) {
      await expect(ledger).toHaveAttribute('data-run', 'done');
      await expect(ledger.locator('.ks-ledger__rows').first().locator('.ks-step__verified:visible')).toHaveCount(6);
      const lens = await ledger.evaluate((el) => getComputedStyle(el).getPropertyValue('--lens-i').trim());
      expect(lens).toBe('3');
      return;
    }
    if (info.project.name === 'pixel-7') {
      // Below the fold on phones: still queued until scrolled to.
      await expect(ledger.locator('.ks-ledger__rows').first().locator('.ks-step__queued:visible')).toHaveCount(6);
    }
    await ledger.scrollIntoViewIfNeeded();
    await expect(ledger).toHaveAttribute('data-played', 'true', { timeout: 5000 });
    await expect(ledger.locator('.ks-ledger__rows').first().locator('.ks-step__verified:visible')).toHaveCount(6);
    const lens = await ledger.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--lens-i')));
    expect(lens).toBeCloseTo(3, 1);
  });

  test('shader field: plays on screen, pauses off screen, resumes, still frame when reduced', async ({ page }, info) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const canvas = page.locator('.ks-field__canvas');
    const state = () => canvas.getAttribute('data-state');
    if ((await state()) === 'unsupported') test.skip(true, 'no WebGL in this browser; poster stays');
    if (reduced(info)) {
      await expect(canvas).toHaveAttribute('data-state', 'paused');
      await expect(canvas).toHaveAttribute('data-ready', 'true');
      return;
    }
    await expect(canvas).toHaveAttribute('data-state', 'playing');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(canvas).toHaveAttribute('data-state', 'paused');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(canvas).toHaveAttribute('data-state', 'playing');
  });
});

test.describe('agent contract', () => {
  test('llms.txt follows llmstxt.org structure', async ({ request }) => {
    const body = await (await request.get('/llms.txt')).text();
    expect(body).toMatch(/^# \S/);
    expect(body).toMatch(/\n> \S/);
    expect(body).toMatch(/\n## Docs\n/);
    expect(body).toMatch(/\n## Optional\n/);
  });

  test('well-known manifest declares read-only authority', async ({ request }) => {
    const j = await (await request.get('/.well-known/starlight.json')).json();
    expect(j.authority).toEqual({ read: true, write: false, payments: false, accounts: false });
    expect(j.endpoints.mcp.tools).toEqual(['get_pricing', 'list_docs']);
  });

  test('pricing page carries JSON-LD Product with Offers', async ({ page }) => {
    await page.goto('/pricing');
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
    expect(data['@type']).toBe('Product');
    expect(data.offers.length).toBeGreaterThan(0);
    for (const o of data.offers) {
      expect(o['@type']).toBe('Offer');
      expect(o.priceCurrency).toMatch(/^[A-Z]{3}$/);
      expect(Number.isFinite(Number(o.price))).toBe(true);
    }
  });

  test('MCP stub: discover, list, call, errors', async ({ request }) => {
    const rpc = (method, params, headers = {}) =>
      request.post('/api/mcp', {
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2026-07-28', 'mcp-method': method, ...headers },
        data: { jsonrpc: '2.0', id: 1, method, ...(params ? { params } : {}) },
      });
    const d = await (await rpc('server/discover')).json();
    expect(d.result.resultType).toBe('complete');
    expect(d.result.supportedVersions).toContain('2026-07-28');
    const l = await (await rpc('tools/list')).json();
    expect(l.result.tools.map((t) => t.name)).toEqual(['get_pricing', 'list_docs']);
    expect(l.result.ttlMs).toBeGreaterThan(0);
    const c = await (await rpc('tools/call', { name: 'get_pricing', arguments: {} }, { 'mcp-name': 'get_pricing' })).json();
    expect(c.result.structuredContent.plans.length).toBe(3);
    const legacy = await (await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 't', version: '0' } }, { 'mcp-protocol-version': '2025-11-25' })).json();
    expect(legacy.result.protocolVersion).toBe('2025-11-25');
    expect((await rpc('nope/never')).status()).toBe(404);
    expect((await rpc('tools/list', undefined, { 'mcp-protocol-version': '1999-01-01' })).status()).toBe(400);
    expect((await request.get('/api/mcp')).status()).toBe(405);
  });

  test('agent slot renders an honest empty state', async ({ page }) => {
    await page.goto('/docs/introduction');
    const slot = page.locator('.ks-agent-slot');
    await expect(slot).toHaveAttribute('data-connected', 'false');
    await expect(slot).toContainText('No assistant is connected');
  });
});

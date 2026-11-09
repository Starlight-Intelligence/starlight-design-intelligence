import {createServer} from 'vite';
const server = await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}});
await server.listen();
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = process.env.STARLIGHT_EVIDENCE_DIR || path.join(root, 'test-results');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'], headless: true });
const report = { at: new Date().toISOString(), url: 'http://127.0.0.1:5173', tests: [], axe: [], screenshots: [], consoleErrors: [], pageErrors: [] };
report.sourceHashes = Object.fromEntries(await Promise.all(['src/App.tsx','src/components.tsx','src/components.css','src/icons.tsx','src/tokens.css','src/studio.css'].map(async file => [file, createHash('sha256').update(await readFile(path.join(root,file))).digest('hex')])));
const axe = await readFile(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(5000);
page.setDefaultNavigationTimeout(15000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
async function check(name, fn) {
  try { await fn(); report.tests.push({ name, passed: true }); }
  catch (error) { report.tests.push({ name, passed: false, error: error.message }); }
}
async function view(name) { await page.getByRole('navigation', { name: 'Library', exact: true }).getByRole('button', { name: new RegExp(`^${name}`) }).click(); }
async function shot(name) { const file = path.join(evidence, `${name}.png`); await page.screenshot({ path: file, fullPage: true }); report.screenshots.push(file); }
await page.goto(report.url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  for (const theme of ['Midnight', 'Daylight', 'Ember']) {
    await page.getByRole('group', { name: 'Color theme' }).getByRole('button', { name: theme, exact: true }).click();
    for (const name of ['Overview', 'Components', 'Icons', 'Motion']) {
      await view(name);
      await page.evaluate(() => window.scrollTo(0, 0));
      const label = `${viewport.name}-${theme.toLowerCase()}-${name.toLowerCase()}`;
      await check(`${label}: no horizontal overflow`, async () => {
        const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, body: document.body.scrollWidth, document: document.documentElement.scrollWidth }));
        assert.ok(dimensions.body <= dimensions.viewport && dimensions.document <= dimensions.viewport, JSON.stringify(dimensions));
      });
      await page.evaluate(axe);
      const findings = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
        return result.violations.map(({ id, impact, description, helpUrl, nodes }) => ({ id, impact, description, helpUrl, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })) }));
      });
      report.axe.push({ viewport: viewport.name, theme, view: name, violations: findings });
      await check(`${label}: no serious/critical axe findings`, async () => assert.deepEqual(findings.filter(item => ['serious', 'critical'].includes(item.impact)), []));
      await shot(label);
    }
  }
}

await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole('group', { name: 'Color theme' }).getByRole('button', { name: 'Midnight', exact: true }).click();
await view('Overview');
await check('Agent defaults to unknown and synthetic provenance is inspectable', async () => {
  assert.equal(await page.locator('#runtime-state').inputValue(), 'unknown');
  assert.equal(await page.locator('.sl-presence .sl-status').textContent(), 'Unknown');
  await page.getByText('Inspect specimen provenance', { exact: true }).click();
  assert.equal(await page.locator('.sl-evidence').getAttribute('open'), '');
  assert.ok(await page.getByText('This is synthetic interface data.', { exact: false }).isVisible());
  await page.locator('#runtime-state').selectOption('blocked');
  assert.equal(await page.locator('.sl-presence .sl-status').textContent(), 'Blocked');
  await page.locator('#runtime-state').selectOption('unknown');
});
await check('Glass toggle removes backdrop filtering', async () => {
  await page.getByRole('button', { name: 'Glass effects' }).click();
  assert.equal(await page.locator('.sl-surface--glass').evaluate(element => getComputedStyle(element).backdropFilter), 'none');
  await page.getByRole('button', { name: 'Glass effects' }).click();
});

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  if (await page.locator('dialog').evaluate(element => element.open)) {
    await page.getByRole('button', { name: 'Close command panel', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('dialog').open);
  }
  await check(`${viewport.name}: command empty, selection, Escape and focus return`, async () => {
    await page.getByRole('button', { name: 'Find a component', exact: true }).click();
    await page.getByRole('dialog', { name: 'Explore the library' }).waitFor();
    assert.equal(await page.getByLabel('Search components').evaluate(element => element === document.activeElement), true);
    await page.getByLabel('Search components').fill('not-a-component');
    assert.equal(await page.locator('[data-command-item]').count(), 0);
    assert.ok(await page.getByText('No matching components. Try another name.').isVisible());
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog').open);
    assert.equal(await page.getByRole('button', { name: 'Find a component', exact: true }).evaluate(element => element === document.activeElement), true);
    await page.getByRole('button', { name: 'Find a component', exact: true }).click();
    await page.getByLabel('Search components').fill('components');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.querySelector('dialog').open);
    assert.ok(await page.getByRole('heading', { name: 'Small parts. Coherent systems.' }).isVisible());
  });
}
await check('Command selection from a removed in-content trigger focuses main', async () => {
  if (await page.locator('dialog').evaluate(element => element.open)) {
    await page.getByRole('button', { name: 'Close command panel', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('dialog').open);
  }
  await view('Components');
  await page.getByRole('button', { name: 'Open command menu', exact: true }).click();
  await page.getByLabel('Search components').fill('icons');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  assert.equal(await page.locator('main').evaluate(element => element === document.activeElement), true);
});
await check('Tabs ArrowRight, End and Home update selection and focus', async () => {
  await view('Components');
  const details = page.getByRole('tab', { name: 'Details', exact: true });
  await details.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: 'Sources' }).getAttribute('aria-selected'), 'true');
  assert.equal(await page.getByRole('tab', { name: 'Sources' }).evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('End');
  assert.equal(await page.getByRole('tab', { name: 'History' }).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await details.getAttribute('aria-selected'), 'true');
});
await check('Invalid and valid email paths preserve input and truthful outcome', async () => {
  const input = page.getByLabel('Team email');
  await input.fill('broken');
  await page.getByRole('button', { name: 'Validate address' }).click();
  assert.equal(await input.getAttribute('aria-invalid'), 'true');
  assert.ok(await page.getByText('Enter an address such as team@example.com.').isVisible());
  assert.equal(await input.inputValue(), 'broken');
  await input.fill('team@example.com');
  await page.getByRole('button', { name: 'Validate address' }).click();
  assert.notEqual(await input.getAttribute('aria-invalid'), 'true');
  assert.ok(await page.getByText('Valid address. This specimen does not submit or store it.').isVisible());
});
await check('SVG download is a real vector and icon empty search recovers', async () => {
  await view('Icons');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download compass SVG', exact: true }).click();
  const download = await pending;
  assert.equal(download.suggestedFilename(), 'starlight-compass.svg');
  const downloaded = await download.path();
  assert.match(await readFile(downloaded, 'utf8'), /<svg[\s>]/);
  await page.getByLabel('Find an icon').fill('not-real');
  assert.ok(await page.getByRole('heading', { name: 'No matching icon' }).isVisible());
  await page.getByRole('button', { name: 'Clear search' }).click();
  assert.equal(await page.locator('.icon-tile').count(), 24);
});
await check('Motion reaches result and resets', async () => {
  await view('Motion');
  await page.getByRole('button', { name: 'Play transition' }).click();
  await page.getByText('Review state reached. This is a visual specimen.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  assert.ok(await page.getByText('Ready. A synthetic transition demonstrating causality.', { exact: true }).isVisible());
});
await check('Reduced motion suppresses rendered animation and transitions', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await view('Components');
  const values = await page.evaluate(() => {
    const spinner = getComputedStyle(document.querySelector('.sl-button__spinner'));
    const shimmer = getComputedStyle(document.querySelector('.sl-skeleton'), '::after');
    return { spinner: spinner.animationName, shimmer: shimmer.animationName, shimmerDisplay: shimmer.display, scroll: getComputedStyle(document.documentElement).scrollBehavior };
  });
  assert.equal(values.spinner, 'none'); assert.equal(values.shimmer, 'none'); assert.equal(values.shimmerDisplay, 'none'); assert.equal(values.scroll, 'auto');
  await view('Motion');
  await page.getByRole('button', { name: 'Play transition' }).click();
  await page.getByText('Review state reached. This is a visual specimen.', { exact: true }).waitFor();
  assert.equal(await page.locator('.destination').evaluate(element => getComputedStyle(element).transform), 'none');
  await shot('mobile-reduced-motion-result');
});
await check('No JavaScript errors', async () => assert.deepEqual(report.pageErrors, []));
await browser.close();
await server.close();
report.summary = { tests: report.tests.length, passed: report.tests.filter(item => item.passed).length, failed: report.tests.filter(item => !item.passed).length, seriousCriticalAxeFindings: report.axe.reduce((sum, item) => sum + item.violations.filter(v => ['serious', 'critical'].includes(v.impact)).length, 0), screenshots: report.screenshots.length };
await writeFile(path.join(evidence, 'browser-review.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ summary: report.summary, failed: report.tests.filter(item => !item.passed), consoleErrors: report.consoleErrors, pageErrors: report.pageErrors }, null, 2));
process.exitCode = report.summary.failed ? 1 : 0;

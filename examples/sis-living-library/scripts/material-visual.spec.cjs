const { test, expect } = require('@playwright/test');
const { execFileSync } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

const roots = [process.env.MATERIAL_REFERENCE_DIR, path.resolve(__dirname, '..')];

const states = [
  { theme: 'Midnight', mode: 'glass' },
  { theme: 'Daylight', mode: 'opaque' },
  { theme: 'Ember', mode: 'reduced-transparency' },
];

for (const width of [375, 768, 1440]) {
  for (const { theme, mode } of states) {
    const name = `${width}-${theme.toLowerCase()}-${mode}`;
    test(name, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      if (mode === 'reduced-transparency') {
        const session = await page.context().newCDPSession(page);
        await session.send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
        });
        expect(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches)).toBe(true);
      }
      const file = `${name}.png`;
      const baseline = info.snapshotPath(file);
      await mkdir(path.dirname(baseline), { recursive: true });

      for (const [index, root] of roots.entries()) {
        const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
        info.annotations.push({ type: index === 0 ? 'reference' : 'candidate', description: revision });
        await page.goto(`http://127.0.0.1:${4219 + index}${index === 1 ? '/library.html' : ''}`, { waitUntil: 'networkidle' });
        await page.getByRole('group', { name: 'Color theme' }).getByRole('button', { name: theme }).click();
        const region = page.getByRole('region', { name: 'Inspect a material' });
        await region.getByLabel('Surface', { exact: true }).selectOption('glass');
        if (mode === 'opaque') await region.getByRole('button', { name: 'Preview glass' }).click();
        const filter = mode === 'glass' ? /blur\(/ : 'none';
        await expect(region.locator('.material-review__sample')).toHaveCSS('backdrop-filter', filter);
        await expect(region.getByTestId('backdrop-filter')).toHaveText(filter);
        await region.evaluate(async element => {
          document.activeElement?.blur();
          await document.fonts.ready;
          element.scrollIntoView({ block: 'start', behavior: 'instant' });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const pixels = await region.screenshot({
          animations: 'disabled',
          path: index === 0 ? baseline : info.outputPath(file),
        });
        if (index === 1) {
          expect(pixels).toMatchSnapshot(file, { threshold: 0.1, maxDiffPixelRatio: 0.001 });
        }
      }
    });
  }
}

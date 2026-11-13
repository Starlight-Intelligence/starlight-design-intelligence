import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await preview({ root, preview: { host: '127.0.0.1', port: 5175, strictPort: true } });
await fs.mkdir(path.join(root, 'test-results'), { recursive: true });
const receipts = [];
try {
  for (const preset of ['mobile', 'desktop']) {
    const file = path.join(root, `test-results/lighthouse-${preset}.json`);
    await promisify(execFile)(path.join(root, 'node_modules/.bin/lighthouse'), [
      'http://127.0.0.1:5175/', '--quiet', '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
      '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices',
      ...(preset === 'desktop' ? ['--preset=desktop'] : []),
    ], { cwd: root, env: { ...process.env, CHROME_PATH: chromium.executablePath() }, timeout: 180_000, maxBuffer: 2_000_000 });
    const report = JSON.parse(await fs.readFile(file, 'utf8'));
    const receipt = { preset, version: report.lighthouseVersion, url: report.finalDisplayedUrl, performance: report.categories.performance.score, accessibility: report.categories.accessibility.score, lcpMs: report.audits['largest-contentful-paint'].numericValue, cls: report.audits['cumulative-layout-shift'].numericValue, tbtMs: report.audits['total-blocking-time'].numericValue };
    receipts.push(receipt);
  }
  await fs.writeFile(path.join(root, 'test-results/performance-receipt.json'), JSON.stringify({ scope: 'Local production build; synthetic Lighthouse defaults; not field CWV', runs: receipts }, null, 2) + '\n');
  console.log(JSON.stringify(receipts, null, 2));
  if (receipts.some(run => run.performance < 0.9 || run.accessibility < 1 || run.lcpMs > 2500 || run.cls > 0.1)) throw Error('Candidate misses the declared Lighthouse lab budget.');
} finally { await new Promise(resolve => server.httpServer.close(resolve)); }

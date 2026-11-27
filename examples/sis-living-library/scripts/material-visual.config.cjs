const { defineConfig } = require('@playwright/test');
const path = require('node:path');
const { realpathSync } = require('node:fs');

const candidate = path.resolve(__dirname, '..');
const reference = process.env.MATERIAL_REFERENCE_DIR;
if (!reference || realpathSync(reference) === realpathSync(candidate)) {
  throw new Error('Set MATERIAL_REFERENCE_DIR to the separately checked-out and built reference example.');
}
const evidence = path.join(candidate, 'test-results', 'visual');
module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'material-visual.spec.cjs',
  workers: 1,
  updateSnapshots: 'none',
  outputDir: path.join(evidence, 'candidate'),
  snapshotDir: path.join(evidence, 'reference'),
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  reporter: [['list'], ['json', { outputFile: path.join(evidence, 'report.json') }]],
  webServer: [reference, candidate].map((cwd, index) => {
    const port = 4219 + index;
    return {
      cwd,
      command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: false,
    };
  }),
  use: {
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    locale: 'en-US',
    launchOptions: { executablePath: process.env.STARLIGHT_CHROMIUM_PATH },
  },
});

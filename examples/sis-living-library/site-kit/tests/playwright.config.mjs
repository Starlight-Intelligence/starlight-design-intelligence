// Runs against an installed and started consumer app (see scripts/site-kit-install-proof.mjs).
// SITE_KIT_URL defaults to http://localhost:3100.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs/,
  timeout: 30_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.SITE_KIT_URL ?? 'http://localhost:3100',
    trace: 'off',
    // Set PLAYWRIGHT_CHROMIUM to reuse a preinstalled browser (CI images, sandboxes).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] } : {},
  },
  projects: [
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'pixel-7-reduced-motion', use: { ...devices['Pixel 7'], contextOptions: { reducedMotion: 'reduce' } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});

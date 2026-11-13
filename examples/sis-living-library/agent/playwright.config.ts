import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 30_000,
  maxFailures: 1,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright.json" }],
  ],
  use: {
    baseURL: process.env.STARLIGHT_TEST_URL || "http://127.0.0.1:5174",
    trace: "retain-on-failure",
  },
  webServer: process.env.STARLIGHT_TEST_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:5174",
        reuseExistingServer: false,
      },
});

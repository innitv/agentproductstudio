import { defineConfig, devices } from "@playwright/test";

const webServer = process.env.PLAYWRIGHT_NO_WEBSERVER === "1"
  ? undefined
  : {
      command: "node tooling/scripts/run-playwright-with-preview.mjs --server-only --app=frontend",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    };

export default defineConfig({
  testDir: "tests/playwright",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "reports/logs/playwright" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer,
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});

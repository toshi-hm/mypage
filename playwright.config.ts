import { defineConfig, devices } from "@playwright/test";

// E2E はビルド済みサイト(astro preview)に対して実行する。
// ローカルで Playwright 同梱以外の Chromium を使う場合は PW_CHROMIUM_PATH を指定する。
const executablePath = process.env["PW_CHROMIUM_PATH"];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run preview",
    port: 4321,
    reuseExistingServer: !process.env["CI"],
  },
});

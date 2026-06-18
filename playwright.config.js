// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",

  timeout: 1000 * 60 * 10 * 6,

  expect: {
    timeout: 10 * 1000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,

  workers: process.env.CI ? 1 : 1,

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "https://www.workindia.in/employers-v2/signin/",

    headless: false,

    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on",

    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

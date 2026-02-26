import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",

  // Global timeouts
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Visual regression tolerances (tweak if you get flaky diffs)
    toHaveScreenshot: {
      // "maxDiffPixels" is simplest and stable for small apps
      maxDiffPixels: 250
      // If you prefer percentage-based:
      // maxDiffPixelRatio: 0.01
    }
  },

  // CI resilience
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined, // keep CI stable; increase if you want faster
  fullyParallel: true,

  // Reporters: local readability + HTML; add JUnit for CI if needed
  reporter: [
    ["list"],
    ["html", { open: "never" }]
    // Optional for CI systems:
    // ["junit", { outputFile: "playwright-results/junit.xml" }]
  ],

  // Shared context defaults
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Useful defaults
    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    // Helps reduce animation flakiness
    contextOptions: {
      reducedMotion: "reduce"
    }
  },

  // Where snapshots go + consistent naming
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}",

  // Start your Next dev server automatically
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SITE_URL: baseURL,
      ADMIN_UPLOAD_PASSWORD: "test-password",
      ADMIN_PASSWORD: "test-admin-password",
      RSVP_PASSPHRASE: "JC2026",
      MOCK_UPLOADS: "true"
    }
  },

  projects: [
    // Desktop Light
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        colorScheme: "light"
      }
    },
    // Desktop Dark
    {
      name: "desktop-chrome-dark",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        colorScheme: "dark"
      }
    },

    // Mobile Light (Pixel 5 emulation)
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        colorScheme: "light"
      }
    },
    // Mobile Dark
    {
      name: "mobile-chrome-dark",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        colorScheme: "dark"
      }
    }
  ]
});

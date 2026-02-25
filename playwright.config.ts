import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
      ADMIN_UPLOAD_PASSWORD: "test-password",
      ADMIN_PASSWORD: "test-admin-password",
      RSVP_PASSPHRASE: "JC2026",
      MOCK_UPLOADS: "true"
    }
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

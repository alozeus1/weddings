import { test, expect } from "./_setup";

test("home page visual snapshot", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});

test("rsvp page visual snapshot", async ({ page }) => {
  await page.goto("/rsvp");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("rsvp.png", { fullPage: true });
});

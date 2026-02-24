import { test, expect } from "@playwright/test";

test("gallery page renders curated and live sections", async ({ page }) => {
  await page.goto("/gallery");

  await expect(page.getByRole("heading", { name: /Cinematic Moments/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Curated Gallery/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Live Uploads/i })).toBeVisible();
});

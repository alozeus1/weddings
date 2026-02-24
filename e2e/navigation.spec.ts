import { test, expect } from "@playwright/test";

test("home navigation routes are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Jessica & Chibuike").first()).toBeVisible();

  await page.getByTestId("nav-our-story").click();
  await expect(page).toHaveURL(/\/our-story$/);
  await expect(page.getByRole("heading", { name: /From Then To Forever/i })).toBeVisible();

  await page.getByTestId("nav-weekend").click();
  await expect(page).toHaveURL(/\/weekend$/);
  await expect(page.getByRole("heading", { name: /Schedule/i })).toBeVisible();

  await page.getByTestId("nav-faq").click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("heading", { name: /Information for Guests/i })).toBeVisible();
});

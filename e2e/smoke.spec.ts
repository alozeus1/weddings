import { test, expect } from "./_setup";

test("home page loads and has a title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});

test("no obvious 404 on key pages", async ({ page }) => {
  const routes = ["/", "/rsvp", "/weekend", "/gallery"];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText(/404|not found/i);
  }
});

test("navigation works (basic)", async ({ page }) => {
  const clickRoute = async (slug: string): Promise<void> => {
    const desktopLink = page.getByTestId(`nav-${slug}`);
    if (await desktopLink.isVisible()) {
      await desktopLink.click();
      return;
    }

    await page.getByTestId("nav-menu-toggle").click();
    await page.getByTestId(`mobile-nav-${slug}`).click();
  };

  await page.goto("/");

  await clickRoute("rsvp");
  await expect(page).toHaveURL(/\/rsvp$/);

  await clickRoute("weekend");
  await expect(page).toHaveURL(/\/weekend$/);
});

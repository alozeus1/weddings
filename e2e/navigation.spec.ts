import { test, expect } from "./_setup";

test("home navigation routes are reachable", async ({ page }) => {
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
  await expect(page.getByText("Jessica & Chibuike").first()).toBeVisible();

  await clickRoute("our-story");
  await expect(page).toHaveURL(/\/our-story$/);
  await expect(page.getByRole("heading", { name: /From Then To Forever/i })).toBeVisible();

  await clickRoute("weekend");
  await expect(page).toHaveURL(/\/weekend$/);
  await expect(page.getByRole("heading", { name: /Schedule/i })).toBeVisible();

  await clickRoute("faq");
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("heading", { name: /Information for Guests/i })).toBeVisible();
});

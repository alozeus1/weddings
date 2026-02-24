import { test, expect } from "@playwright/test";

test("rsvp stepper submits successfully", async ({ page }) => {
  await page.goto("/rsvp");

  await page.getByTestId("rsvp-name").fill("Taylor Guest");
  await page.getByTestId("rsvp-email").fill("taylor@example.com");
  await page.getByTestId("rsvp-phone").fill("+1 555 000 1111");
  await page.getByTestId("rsvp-next").click();

  await page.getByTestId("rsvp-next").click();
  await page.getByTestId("rsvp-message").fill("Can't wait to celebrate.");
  await page.getByTestId("rsvp-submit").click();

  await expect(page.getByText(/RSVP submitted successfully/i)).toBeVisible();
});

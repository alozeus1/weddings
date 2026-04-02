import { expect, test } from "./_setup";

test("rsvp lookup shows helper copy and open reservation panel", async ({ page }) => {
  await page.goto("/rsvp");
  await expect(page.getByText(/Type just your first name or last name\.\s*We['’]ll find your invitation\./i)).toBeVisible();

  await page.getByTestId("rsvp-not-on-list").click();
  await expect(page.getByTestId("open-rsvp-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add Your Reservation" })).toBeVisible();

  await page.getByTestId("open-rsvp-fullname").fill("Jordan");
  await page.getByTestId("open-rsvp-start").click();
  await expect(page.getByText(/Please enter both your first and last name to continue\./i)).toBeVisible();

  await page.getByTestId("open-rsvp-fullname").fill("Jordan Example");
  await page.getByTestId("open-rsvp-start").click();

  await expect(page.getByText(/^RSVP for /i)).toBeVisible();
  await expect(page.getByText("Jordan Example")).toBeVisible();
});

test("rsvp step one requires both email and phone before continuing", async ({ page }) => {
  await page.goto("/rsvp");
  await page.getByTestId("rsvp-not-on-list").click();
  await page.getByTestId("open-rsvp-fullname").fill("Jordan Example");
  await page.getByTestId("open-rsvp-start").click();

  await page.getByTestId("rsvp-next").click();
  await expect(page.getByText(/Please enter your email address to continue\./i)).toBeVisible();

  await page.getByTestId("rsvp-email").fill("jordan@example.com");
  await page.getByTestId("rsvp-next").click();
  await expect(page.getByText(/Please enter your phone number to continue\./i)).toBeVisible();

  await page.getByTestId("rsvp-phone").fill("123");
  await page.getByTestId("rsvp-next").click();
  await expect(page.getByText(/Please enter a valid phone number to continue\./i)).toBeVisible();

  await expect(page.getByLabel("Phone Number")).toBeVisible();
});

test("not-on-list reservation submission is reflected in admin rsvp dashboard", async ({ page, context }) => {
  const authHeader = Buffer.from("admin:test-admin-password").toString("base64");
  await context.setExtraHTTPHeaders({
    authorization: `Basic ${authHeader}`
  });

  await page.goto("/rsvp");
  await page.getByTestId("rsvp-not-on-list").click();
  await page.getByTestId("open-rsvp-fullname").fill("Jordan Mirror");
  await page.getByTestId("open-rsvp-start").click();

  await page.getByTestId("rsvp-email").fill("jordan.mirror@example.com");
  await page.getByTestId("rsvp-phone").fill("+1 (312) 555-0101");
  await page.getByTestId("rsvp-attending").selectOption("yes");
  await page.getByTestId("rsvp-plusone-toggle").check();
  await page.getByLabel("Plus One Name").fill("Family Friend");
  await page.getByTestId("rsvp-next").click();

  await page.getByLabel("Meal Category").fill("Main");
  await page.getByLabel("Protein").fill("Fish");
  await page.getByLabel("Soup").fill("Egusi");
  await page.getByLabel("Dietary Notes").fill("None");
  await page.getByTestId("rsvp-next").click();

  await page.getByTestId("rsvp-message").fill("Looking forward to celebrating.");
  await page.getByTestId("rsvp-submit").click();
  await expect(page.getByText(/RSVP submitted successfully/i)).toBeVisible();

  await page.goto("/admin/rsvps");
  const row = page.getByRole("row").filter({ hasText: "Jordan Mirror" }).first();
  await expect(row).toContainText(/Coming/i);
});

test("guest lookup requires at least 2 characters and limits results", async ({ page }) => {
  await page.goto("/rsvp");

  const searchInput = page.getByTestId("rsvp-guest-search");
  await searchInput.fill("o");
  await expect(page.getByText(/Enter at least 2 characters to search/i)).toBeVisible();

  await searchInput.fill("Ocheme");
  const results = page.getByTestId("rsvp-guest-result");
  await expect(results.first()).toBeVisible();

  const count = await results.count();
  expect(count).toBeLessThanOrEqual(5);
});

test("guest lookup allows RSVP and successful submission updates admin status", async ({ page, context }) => {
  await page.goto("/rsvp");

  await page.getByTestId("rsvp-guest-search").fill("Godwill");
  const selectedResult = page.getByTestId("rsvp-guest-result").first();
  await expect(selectedResult).toBeVisible();
  await selectedResult.click();

  await page.getByTestId("rsvp-continue").click();
  await expect(page.getByText(/^RSVP for /i)).toBeVisible();

  await page.getByTestId("rsvp-email").fill("godwill@example.com");
  await page.getByTestId("rsvp-phone").fill("+1 (773) 555-0102");
  await page.getByTestId("rsvp-attending").selectOption("yes");
  await page.getByTestId("rsvp-plusone-toggle").check();
  await page.getByLabel("Plus One Name").fill("Family Friend");
  await page.getByTestId("rsvp-next").click();

  await page.getByLabel("Meal Category").fill("Main");
  await page.getByLabel("Protein").fill("Fish");
  await page.getByLabel("Soup").fill("Egusi");
  await page.getByLabel("Dietary Notes").fill("None");
  await page.getByTestId("rsvp-next").click();

  await page.getByTestId("rsvp-message").fill("Looking forward to celebrating.");
  await page.getByTestId("rsvp-submit").click();
  await expect(page.getByText(/RSVP submitted successfully/i)).toBeVisible();

  const authHeader = Buffer.from("admin:test-admin-password").toString("base64");
  await context.setExtraHTTPHeaders({
    authorization: `Basic ${authHeader}`
  });

  await page.goto("/admin/rsvps");
  const row = page.getByRole("row").filter({ hasText: "Godwill Ocheme" }).first();
  await expect(row).toContainText(/Coming/i);
});

test("countdown timer section is visible on the rsvp page", async ({ page }) => {
  await page.goto("/rsvp");

  const section = page.getByTestId("countdown-section");
  await expect(section).toBeVisible();
  await expect(page.getByText(/until the big day/i)).toBeVisible();
});

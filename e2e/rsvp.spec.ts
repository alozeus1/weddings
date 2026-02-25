import { expect, test } from "@playwright/test";

test("rsvp lookup shows helper copy and request invite panel", async ({ page }) => {
  await page.route("**/api/invite-requests", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "request-1" })
    });
  });

  await page.goto("/rsvp");
  await expect(page.getByText(/Type just your first name or last name\.\s*We['’]ll find your invitation\./i)).toBeVisible();

  await page.getByTestId("rsvp-not-on-list").click();
  await expect(page.getByTestId("request-invite-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request an Invite" })).toBeVisible();

  await page.getByTestId("invite-request-fullname").fill("Jordan Example");
  await page.getByTestId("invite-request-email").fill("jordan@example.com");
  await page.getByTestId("invite-request-phone").fill("+1 555 123 4567");
  await page.getByTestId("invite-request-message").fill("Friend of the bride.");
  await page.getByTestId("invite-request-submit").click();

  await expect(page.getByText("Thanks! Your request was sent to the couple for review.")).toBeVisible();
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

test("guest verification gates RSVP and successful submission updates admin status", async ({ page, context }) => {
  await page.goto("/rsvp");

  await page.getByTestId("rsvp-guest-search").fill("Godwill");
  const selectedResult = page.getByTestId("rsvp-guest-result").first();
  await expect(selectedResult).toBeVisible();
  await selectedResult.click();

  await page.getByTestId("rsvp-passphrase").fill("WRONG");
  await page.getByTestId("rsvp-verify").click();
  await expect(page.getByText(/Verification failed/i)).toBeVisible();

  await page.getByTestId("rsvp-passphrase").fill("JC2026");
  await page.getByTestId("rsvp-verify").click();
  await expect(page.getByText(/RSVP for/i)).toBeVisible();

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

test("admin rsvp page lists pending invite requests", async ({ page, context }) => {
  const authHeader = Buffer.from("admin:test-admin-password").toString("base64");
  await context.setExtraHTTPHeaders({
    authorization: `Basic ${authHeader}`
  });

  await page.route("**/api/admin/invite-requests?status=pending", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        requests: [
          {
            id: "request-1",
            fullName: "Casey Guest",
            email: "casey@example.com",
            phone: "+1 555 777 0000",
            message: "College friend",
            status: "pending",
            createdAt: "2026-02-01T10:00:00.000Z"
          }
        ]
      })
    });
  });

  await page.goto("/admin/rsvps");
  await expect(page.getByTestId("invite-requests-section")).toBeVisible();
  await expect(page.getByTestId("invite-request-row")).toContainText("Casey Guest");
});

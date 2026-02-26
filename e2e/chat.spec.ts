import { expect, test } from "@playwright/test";

test("chat widget opens and renders suggested link", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "The ceremony (Mass) starts at 3:00 PM (MT) at St. Patrick's Cathedral.",
        suggestedPage: "/church",
        confidence: 0.9
      })
    });
  });

  await page.goto("/");
  await page.getByTestId("chat-toggle").click();

  await expect(page.getByTestId("chat-panel")).toBeVisible();
  await page.getByTestId("chat-input").fill("What time is the ceremony?");
  await page.getByTestId("chat-send").click();

  await expect(page.getByText("The ceremony (Mass) starts at 3:00 PM (MT) at St. Patrick's Cathedral.")).toBeVisible();
  await expect(page.getByTestId("chat-suggested-link")).toContainText("/church");
  await expect(page.getByTestId("chat-suggested-link").getByRole("link", { name: "/church" })).toBeVisible();
});

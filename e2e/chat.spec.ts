import { expect, test } from "./_setup";

test("chat widget opens and renders suggested link", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        text: "The ceremony (Mass) starts at 3:00 PM (MT) at St. Patrick's Cathedral.",
        suggestedPage: "/church",
        confidence: 0.9
      })
    });
  });

  await page.addInitScript(() => {
    window.localStorage.removeItem("wedding-chat-history-v1");
  });

  await page.goto("/");
  await page.getByTestId("chatbot-toggle").click();

  await expect(page.getByTestId("chatbot-panel")).toBeVisible();
  await page.getByTestId("chatbot-input").fill("What time is the ceremony?");
  await page.getByTestId("chatbot-send").click();

  await expect(page.getByText("The ceremony (Mass) starts at 3:00 PM (MT) at St. Patrick's Cathedral.")).toBeVisible();
  await expect(page.getByTestId("chatbot-suggested-page")).toContainText("/church");
  await expect(page.getByTestId("chatbot-suggested-page").getByRole("link", { name: "/church" })).toBeVisible();
});

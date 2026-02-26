import { expect, test } from "./_setup";

async function askQuestion(page: import("@playwright/test").Page, question: string) {
  await page.getByTestId("chatbot-input").fill(question);
  await page.getByTestId("chatbot-send").click();
  const assistantMessage = page.locator('[data-testid="chatbot-message"][data-role="assistant"]').last();
  await expect(assistantMessage).toBeVisible();
  return assistantMessage;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("wedding-chat-history-v1");
  });

  await page.goto("/");
  await page.getByTestId("chatbot-toggle").click();
  await expect(page.getByTestId("chatbot-panel")).toBeVisible();
});

test("when is the wedding does not include registry CTA", async ({ page }) => {
  const assistantMessage = await askQuestion(page, "when is the wedding?");

  await expect(assistantMessage).toContainText("June 12, 2026");
  await expect(assistantMessage).not.toContainText("Registry:");
  await expect(assistantMessage).not.toContainText("Suggested page: /registry");
  await expect(assistantMessage.getByTestId("chatbot-cta")).toHaveCount(0);
});

test("where is the wedding does not include registry CTA", async ({ page }) => {
  const assistantMessage = await askQuestion(page, "where is the wedding?");

  await expect(assistantMessage).toContainText("El Paso, TX");
  await expect(assistantMessage).not.toContainText("Registry:");
  await expect(assistantMessage).not.toContainText("Suggested page: /registry");
  await expect(assistantMessage.getByTestId("chatbot-cta")).toHaveCount(0);
});

test("who is getting married does not include registry CTA", async ({ page }) => {
  const assistantMessage = await askQuestion(page, "who is getting married?");

  await expect(assistantMessage).toContainText("Jessica and Chibuike");
  await expect(assistantMessage).not.toContainText("Registry:");
  await expect(assistantMessage).not.toContainText("Suggested page: /registry");
  await expect(assistantMessage.getByTestId("chatbot-cta")).toHaveCount(0);
});

test("where is your registry includes registry CTA", async ({ page }) => {
  const assistantMessage = await askQuestion(page, "where is your registry?");

  await expect(assistantMessage).toContainText("You can use our registry links below.");
  await expect(assistantMessage).toContainText("Suggested page: /registry");
  await expect(assistantMessage.getByTestId("chatbot-cta").first()).toContainText("Registry: Amazon");
});

import { expect, test } from "./_setup";

async function openChat(page: import("@playwright/test").Page): Promise<void> {
  await page.getByTestId("chatbot-toggle").click();
  await expect(page.getByTestId("chatbot-panel")).toBeVisible();
}

async function askQuestion(page: import("@playwright/test").Page, question: string) {
  await page.getByTestId("chatbot-input").fill(question);
  await page.getByTestId("chatbot-send").click();
  const assistantMessage = page.locator('[data-testid="chatbot-message"][data-role="assistant"]').last();
  await expect(assistantMessage).toBeVisible();
  return assistantMessage;
}

test.describe("chatbot routing responses", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem("wedding-chat-history-v1");
      window.localStorage.removeItem("wedding-chat-nudge-v1");
    });

    await page.goto("/");
    await openChat(page);
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

  test("menu for the day returns intentional menu response", async ({ page }) => {
    const assistantMessage = await askQuestion(page, "menu for the day");

    await expect(assistantMessage).not.toContainText("Search your name");
    await expect(assistantMessage).toContainText(/finalizing the menu details/i);
    await expect(assistantMessage).toContainText(/dietary restrictions/i);
    await expect(assistantMessage).toContainText("Suggested page: /rsvp");
  });

  test("what meals are served returns intentional menu response", async ({ page }) => {
    const assistantMessage = await askQuestion(page, "what meals are served");

    await expect(assistantMessage).not.toContainText("Search your name");
    await expect(assistantMessage).toContainText(/finalizing the menu details/i);
    await expect(assistantMessage).toContainText(/dietary restrictions/i);
    await expect(assistantMessage).toContainText("Suggested page: /rsvp");
  });
});

test.describe("chatbot nudge and icon", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem("wedding-chat-nudge-v1");
      window.localStorage.removeItem("wedding-chat-history-v1");
    });
    await page.goto("/");
  });

  test("toggle button exists with icon", async ({ page }) => {
    await expect(page.getByTestId("chatbot-toggle")).toBeVisible();
    await expect(page.getByTestId("chatbot-toggle-icon")).toBeVisible();
  });

  test("nudge appears once, can be dismissed, and does not reappear after reload", async ({ page }) => {
    const nudge = page.getByTestId("chatbot-nudge");
    await expect(nudge).toBeVisible({ timeout: 5000 });

    await page.getByTestId("chatbot-nudge-dismiss").click();
    await expect(nudge).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("chatbot-nudge")).toHaveCount(0);
  });
});

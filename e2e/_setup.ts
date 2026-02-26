import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`[console.${msg.type()}] ${msg.text()}`);
      }
    });

    page.on("requestfailed", (req) => {
      const url = req.url();
      if (!url.includes("favicon")) {
        failedRequests.push(`[requestfailed] ${req.method()} ${url}`);
      }
    });

    await use(page);

    if (consoleErrors.length) {
      await testInfo.attach("console-errors.txt", {
        body: consoleErrors.join("\n"),
        contentType: "text/plain"
      });
    }

    if (failedRequests.length) {
      await testInfo.attach("failed-requests.txt", {
        body: failedRequests.join("\n"),
        contentType: "text/plain"
      });
    }

    expect(consoleErrors, "Console errors detected").toEqual([]);
  }
});

export { expect };

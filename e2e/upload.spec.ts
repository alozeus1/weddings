import path from "node:path";
import { test, expect } from "@playwright/test";

test("guest upload flow works", async ({ page }) => {
  await page.goto("/upload");

  const filePath = path.join(process.cwd(), "e2e/fixtures/upload.jpg");
  await page.getByTestId("upload-name").fill("Jordan");
  await page.getByTestId("upload-file").setInputFiles(filePath);
  await page.getByTestId("upload-submit").click();

  await expect(page.getByText(/Uploaded. Thank you/i)).toBeVisible();
});

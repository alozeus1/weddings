import path from "node:path";
import { expect, test } from "@playwright/test";

test("upload page loads and submits signed Cloudinary upload", async ({ page }) => {
  await page.route("**/api/cloudinary/sign", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        signature: "signed-value",
        timestamp: 1700000000,
        folder: "chibuike-jessica/live-uploads",
        apiKey: "cloudinary-key",
        cloudName: "demo-cloud",
        tags: "live-upload,pending",
        allowedFormats: "jpg,jpeg,png,webp,heic",
        context: "uploaded_by=Jordan"
      })
    });
  });

  await page.route("**/api.cloudinary.com/v1_1/**/image/upload", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        secure_url: "https://res.cloudinary.com/demo-cloud/image/upload/v1/sample.jpg"
      })
    });
  });

  await page.goto("/upload");

  await expect(page.getByTestId("upload-submit")).toBeVisible();

  const filePath = path.join(process.cwd(), "e2e/fixtures/upload.jpg");
  await page.getByTestId("upload-name").fill("Jordan");
  await page.getByTestId("upload-file").setInputFiles(filePath);
  await page.getByTestId("upload-submit").click();

  await expect(page.getByText(/Uploaded. Thank you/i)).toBeVisible();
});

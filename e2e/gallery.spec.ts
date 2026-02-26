import { expect, test } from "./_setup";

test("gallery page renders curated and live sections with cloud uploads", async ({ page }) => {
  await page.route("**/api/cloudinary/live-uploads**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        uploads: [
          {
            id: "asset-1",
            url: "https://res.cloudinary.com/demo/image/upload/v1/photo-1.jpg",
            uploadedByName: "Jordan",
            createdAt: "2026-02-24T12:00:00.000Z",
            status: "approved"
          },
          {
            id: "asset-2",
            url: "https://res.cloudinary.com/demo/image/upload/v1/photo-2.jpg",
            uploadedByName: null,
            createdAt: "2026-02-24T12:05:00.000Z",
            status: "pending"
          }
        ],
        nextCursor: null
      })
    });
  });

  await page.goto("/gallery");

  await expect(page.getByRole("heading", { name: /Cinematic Moments/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Curated Gallery/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Live Uploads/i })).toBeVisible();
  await expect(page.getByTestId("live-upload-item")).toHaveCount(2);
});

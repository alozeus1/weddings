import { expect, test } from "@playwright/test";

test("our story hero uses video and play button opens video route", async ({ page }) => {
  await page.goto("/our-story");

  await expect(page.getByTestId("page-hero-video")).toBeVisible();
  await page.getByTestId("hero-video-play-button").click();

  await expect(page).toHaveURL(/\/our-story\/video$/);

  const player = page.getByTestId("our-story-video-player");
  await expect(player).toBeVisible();
  await expect(player).toHaveJSProperty("controls", true);
  await expect(player).toHaveJSProperty("muted", false);
});

test("church schedule page shows ceremony info and map link", async ({ page }) => {
  await page.goto("/church");

  await expect(page.getByRole("heading", { name: /Church Schedule/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /St. Patrick's Cathedral/i })).toBeVisible();
  await expect(page.getByText(/1118 N Mesa St, El Paso, TX 79902/i)).toBeVisible();

  const mapLink = page.getByTestId("church-map-link");
  await expect(mapLink).toBeVisible();
  await expect(mapLink).toHaveAttribute("href", /google\.com\/maps/);
});

test("travel page includes About El Paso and city imagery", async ({ page }) => {
  await page.goto("/travel");

  await expect(page.getByTestId("about-el-paso")).toBeVisible();
  await expect(page.getByRole("heading", { name: /About El Paso/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /A Continental Crossroads/i })).toBeVisible();
  await expect(page.getByTestId("travel-city-image")).toBeVisible();
});

test("menu page renders exact menu text and uses local menu images", async ({ page }) => {
  await page.goto("/menu");

  await expect(page.getByText("Jollof Rice / Fried Rice with chicken, beef, or fish")).toBeVisible();
  await expect(page.getByText("White rice & Tomatoe stew")).toBeVisible();

  const firstMenuImage = page.locator('[data-testid="menu-photo-mosaic"] img').first();
  await expect(firstMenuImage).toBeVisible();
  await expect(firstMenuImage).toHaveAttribute("src", /images%2Fmenu%2F|\/images\/menu\//);
});

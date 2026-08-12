import { expect, test } from "@playwright/test";

test.describe("media elements", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/media.html");
    await page.waitForFunction(
      () => customElements.get("ds-slideshow") !== undefined,
    );
    await page.waitForLoadState("networkidle");
  });

  test("renders image with loaded placeholder", async ({ page }) => {
    const img = page.locator("ds-image img");
    await expect(img).toHaveCount(1);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "placeholder");
  });

  test("renders video element", async ({ page }) => {
    const video = page.locator("ds-video video");
    await expect(video).toHaveCount(1);
    await expect(video).toBeVisible();
  });

  test("renders counter and resolves reference", async ({ page }) => {
    await expect(page.locator("ds-counter .value")).toHaveText("1");
    await expect(page.locator("ds-reference .value")).toHaveText("Figure 1");
  });
});

import { expect, test } from "@playwright/test";

async function waitForWidgets(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    return (
      customElements.get("ds-slideshow") !== undefined &&
      document.querySelector("ds-slide.active") !== null &&
      (document.querySelector("ds-current-slide")?.textContent ?? "") !== ""
    );
  });
}

test.describe("widgets", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/widgets.html");
    await waitForWidgets(page);
  });

  test("shows fraction and percentage progress", async ({ page }) => {
    await expect(
      page.locator('ds-progress[data-display="fraction"] .text'),
    ).toHaveText("1/3");

    await page.keyboard.press("ArrowRight");
    await expect(
      page
        .locator("ds-slide.active")
        .locator('ds-progress[data-display="percentage"] .text'),
    ).toHaveText("67%");

    await page.keyboard.press("ArrowRight");
    await expect(
      page
        .locator("ds-slide.active")
        .locator('ds-progress[data-display="bar"] .fill'),
    ).toBeVisible();
  });

  test("active slide's current-slide and total-slides update on navigation", async ({
    page,
  }) => {
    const active = page.locator("ds-slide.active");
    await expect(active.locator("ds-current-slide")).toHaveText("1");
    await expect(active.locator("ds-total-slides")).toHaveText("3");

    await page.keyboard.press("ArrowRight");
    await expect(active.locator("ds-current-slide")).toHaveText("2");
    await expect(active.locator("ds-total-slides")).toHaveText("3");

    await page.keyboard.press("ArrowRight");
    await expect(active.locator("ds-current-slide")).toHaveText("3");
  });

  test("renders current section", async ({ page }) => {
    await expect(page.locator("ds-current-section")).toHaveText("1");
  });

  test("visual snapshot of widgets", async ({ page }) => {
    await expect(page).toHaveScreenshot("widgets.png");
  });
});

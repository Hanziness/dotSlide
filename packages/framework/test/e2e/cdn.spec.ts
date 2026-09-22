import { expect, test } from "@playwright/test";

/**
 * The CDN fixture loads the published consumption pattern: a self-contained
 * ESM bundle resolved through an import map (as a CDN would serve it),
 * instead of the framework source used by the other fixtures.
 */

/** Wait for the framework to register `ds-slideshow` and render the first slide. */
async function waitForSlideshow(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    return (
      customElements.get("ds-slideshow") !== undefined &&
      document.querySelector("ds-slide.active") !== null
    );
  });
}

test.describe("CDN-consumed bundle", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/cdn.html");
    await waitForSlideshow(page);
  });

  test("registers custom elements from the bundle", async ({ page }) => {
    const registered = await page.evaluate(() => {
      return [
        "ds-slideshow",
        "ds-slide",
        "ds-button",
        "ds-slide-controls",
      ].every((tag) => customElements.get(tag) !== undefined);
    });
    expect(registered).toBe(true);
  });

  test("renders three slides with the first active", async ({ page }) => {
    await expect(page.locator("ds-slide")).toHaveCount(3);
    await expect(page.locator("ds-slide").nth(0)).toHaveClass(/\bactive\b/);
  });

  test("navigates with keyboard arrows", async ({ page }) => {
    const slides = page.locator("ds-slide");
    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(1)).toHaveClass(/\bactive\b/);
    await page.keyboard.press("ArrowLeft");
    await expect(slides.nth(0)).toHaveClass(/\bactive\b/);
  });

  test("updates slide number indicator", async ({ page }) => {
    await expect(page.locator(".slide-number")).toHaveText("1 / 3");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".slide-number")).toHaveText("2 / 3");
  });
});

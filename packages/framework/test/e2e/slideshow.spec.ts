import { expect, test } from "@playwright/test";

/** Wait for the framework to register `ds-slideshow` and render the first slide. */
async function waitForSlideshow(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    return (
      customElements.get("ds-slideshow") !== undefined &&
      document.querySelector("ds-slide.active") !== null
    );
  });
}

test.describe("base slideshow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/base.html");
    await waitForSlideshow(page);
  });

  test("renders at 1280x720 with three slides", async ({ page }) => {
    const slideshow = page.locator("ds-slideshow");
    await expect(slideshow).toHaveAttribute("data-slideshow-width", "1280");
    await expect(slideshow).toHaveAttribute("data-slideshow-height", "720");
    await expect(page.locator("ds-slide")).toHaveCount(3);
  });

  test("renders slides in order", async ({ page }) => {
    const slides = page.locator("ds-slide");
    await expect(slides.nth(0)).toContainText("Slide 1");
    await expect(slides.nth(1)).toContainText("Slide 2");
    await expect(slides.nth(2)).toContainText("Slide 3");
    await expect(slides.nth(0)).toHaveClass(/\bactive\b/);
  });

  test("navigates with keyboard arrows", async ({ page }) => {
    const slides = page.locator("ds-slide");
    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(1)).toHaveClass(/\bactive\b/);
    await expect(slides.nth(0)).not.toHaveClass(/\bactive\b/);

    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(2)).toHaveClass(/\bactive\b/);

    await page.keyboard.press("ArrowLeft");
    await expect(slides.nth(1)).toHaveClass(/\bactive\b/);
  });

  test("navigates with next/prev buttons", async ({ page }) => {
    const slides = page.locator("ds-slide");
    await page.locator('ds-button[data-action="next"]').click();
    await expect(slides.nth(1)).toHaveClass(/\bactive\b/);

    await page.locator('ds-button[data-action="prev"]').click();
    await expect(slides.nth(0)).toHaveClass(/\bactive\b/);
  });

  test("updates slide number indicator", async ({ page }) => {
    await expect(page.locator(".slide-number")).toHaveText("1 / 3");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".slide-number")).toHaveText("2 / 3");
  });

  test("visual snapshot at 1280x720", async ({ page }) => {
    await expect(page).toHaveScreenshot("base-slideshow.png");
  });
});

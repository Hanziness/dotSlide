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

  test("clamps navigation at the first and last slide", async ({ page }) => {
    const slides = page.locator("ds-slide");

    // Already on slide 0; going left stays on slide 0.
    await page.keyboard.press("ArrowLeft");
    await expect(slides.nth(0)).toHaveClass(/\bactive\b/);

    // Advance to the last slide, then keep going right.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(2)).toHaveClass(/\bactive\b/);

    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(2)).toHaveClass(/\bactive\b/);
    await expect(slides.nth(2)).toHaveCount(1);
  });

  test("scales slide content proportionally to viewport", async ({ page }) => {
    async function measure() {
      return page.evaluate(() => {
        const slide = document.querySelector(
          "ds-slide.active",
        ) as HTMLElement;
        const textNode = slide.childNodes[0];
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const textRect = range.getBoundingClientRect();
        const slideRect = slide.getBoundingClientRect();
        return {
          textWidth: textRect.width,
          textHeight: textRect.height,
          slideWidth: slideRect.width,
          slideHeight: slideRect.height,
        };
      });
    }

    const atFull = await measure();
    const ratioXFull = atFull.textWidth / atFull.slideWidth;
    const ratioYFull = atFull.textHeight / atFull.slideHeight;

    await page.setViewportSize({ width: 640, height: 360 });
    await page.waitForFunction(
      () => {
        const el = document.querySelector("ds-slideshow");
        const scale = getComputedStyle(el!)
          .getPropertyValue("--slide-scale")
          .trim();
        return scale !== "" && Math.abs(parseFloat(scale) - 0.5) < 0.01;
      },
      undefined,
      { timeout: 5000 },
    );

    const atHalf = await measure();
    const ratioXHalf = atHalf.textWidth / atHalf.slideWidth;
    const ratioYHalf = atHalf.textHeight / atHalf.slideHeight;

    expect(ratioXHalf).toBeCloseTo(ratioXFull, 2);
    expect(ratioYHalf).toBeCloseTo(ratioYFull, 2);
  });
});

test.describe("step navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/slideshow.html");
    await waitForSlideshow(page);
  });

  test("steps reveal progressively with keyboard arrows", async ({ page }) => {
    const slides = page.locator("ds-slide");
    const step1 = page.locator("ds-step").nth(0);
    const step2 = page.locator("ds-step").nth(1);

    // Advance to the "Why Web Components?" slide that contains the steps.
    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(1)).toHaveClass(/\bactive\b/);

    // First step visible, second hidden.
    await expect(step1).toHaveClass(/\bactive\b/);
    await expect(step2).not.toHaveClass(/\bactive\b/);

    // Reveal the second step.
    await page.keyboard.press("ArrowRight");
    await expect(step2).toHaveClass(/\bactive\b/);

    // Advancing past the final step moves to the next slide.
    await page.keyboard.press("ArrowRight");
    await expect(slides.nth(2)).toHaveClass(/\bactive\b/);
  });
});

import { expect, test } from "@playwright/test";

const viewports = [
  { name: "base", width: 1280, height: 720 },
  { name: "large", width: 1920, height: 1080 },
  { name: "small", width: 800, height: 600 },
];

for (const viewport of viewports) {
  test(`base slideshow at ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/test/fixtures/base.html");
    await page.waitForFunction(() => {
      return (
        customElements.get("ds-slideshow") !== undefined &&
        document.querySelector("ds-slide.active") !== null
      );
    });
    await expect(page).toHaveScreenshot(`base-${viewport.name}.png`);
  });
}

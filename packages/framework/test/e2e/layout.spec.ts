import { expect, test } from "@playwright/test";

async function waitForDefined(
  page: import("@playwright/test").Page,
  name: string,
) {
  await page.waitForFunction(
    (tag) => customElements.get(tag) !== undefined,
    name,
  );
}

test.describe("layout elements", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/test/fixtures/layout.html");
    await waitForDefined(page, "ds-flex");
  });

  test("renders ds-flex children", async ({ page }) => {
    await expect(page.locator("ds-flex")).toHaveCount(2);
    const rowFlex = page.locator("ds-flex").first();
    await expect(rowFlex.locator("ds-item")).toHaveCount(3);
    await expect(rowFlex).toHaveAttribute("mode", "row");
    await expect(rowFlex).toHaveAttribute("gap", "1");
    await expect(rowFlex).toHaveAttribute("justify", "center");
    await expect(rowFlex).toHaveAttribute("align", "center");
  });

  test("renders ds-list and ds-list-item", async ({ page }) => {
    await expect(page.locator("ds-list")).toHaveCount(2);
    await expect(page.locator("ds-list-item")).toHaveCount(6);
    await expect(
      page.locator("ds-list").first().locator("ds-list-item"),
    ).toHaveCount(3);
    await expect(page.locator("ds-list[data-mode='ordered']")).toHaveCount(1);
  });

  test("visual snapshot of layout", async ({ page }) => {
    await expect(page).toHaveScreenshot("layout.png");
  });
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    HTMLMediaElement.prototype.play = function play() {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {
      this.dispatchEvent(new Event("pause"));
    };
  });
  await page.setViewportSize({ width: 320, height: 568 });
});

test("phone layouts keep cards and controls inside the viewport", async ({ page }) => {
  const routes = ["/timeline", "/gallery", "/places", "/cinema", "/films", "/music", "/treasures", "/letter", "/reasons"];
  for (const route of routes) {
    await page.goto(`/#${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  }

  await page.goto("/#/gallery");
  await expect(page.getByText("73 memories")).toBeVisible();
  const galleryBounds = await page.locator(".gallery-card").evaluateAll((cards) => cards.map((card) => {
    const rect = card.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  }));
  expect(galleryBounds.every(({ left, right }) => left >= 0 && right <= 320)).toBe(true);

  await page.goto("/#/reasons");
  await page.waitForTimeout(500);
  const reasonBounds = await page.locator("button.reason-card").boundingBox();
  expect(reasonBounds?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((reasonBounds?.x ?? 321) + (reasonBounds?.width ?? 0)).toBeLessThanOrEqual(320);
});

test("phone navigation and soundtrack controls remain reachable", async ({ page }) => {
  await page.goto("/#/music");
  await page.locator(".music-page h1").click();

  const dock = page.locator(".audio-dock");
  await expect(dock).toBeVisible();
  await expect(dock.getByRole("button")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Play next song" })).toBeVisible();
  const dockBounds = await dock.boundingBox();
  expect(dockBounds?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((dockBounds?.x ?? 321) + (dockBounds?.width ?? 0)).toBeLessThanOrEqual(320);

  await page.goto("/#/journey");
  await page.getByRole("button", { name: "Open menu" }).click();
  const navigation = page.locator("#mobile-navigation");
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Finale" }).scrollIntoViewIfNeeded();
  await expect(navigation.getByRole("link", { name: "Finale" })).toBeVisible();
  expect(await navigation.evaluate((element) => element.scrollHeight >= element.clientHeight)).toBe(true);
});

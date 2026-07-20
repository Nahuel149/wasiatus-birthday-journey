import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("landing journey unlocks the birthday finale", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Begin our journey" }).click();

  const chapters = page.locator(".chapter");
  await expect(chapters).toHaveCount(6);
  for (let index = 0; index < 6; index += 1) {
    await chapters.nth(index).scrollIntoViewIfNeeded();
    await page.evaluate((chapterIndex) => {
      document.querySelectorAll(".chapter")[chapterIndex]?.scrollIntoView({ block: "center" });
    }, index);
    await page.waitForTimeout(120);
  }

  await expect.poll(async () => page.evaluate(() => {
    return JSON.parse(localStorage.getItem("birthdayJourney:v1:visited") ?? "[]").length;
  })).toBe(6);

  await page.locator(".journey-ending").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: "Open your surprise" }).click();
  await expect(page.getByRole("heading", { name: /Happy 35th Birthday/i })).toBeVisible();
});

test("gallery filters are shareable and the lightbox restores focus", async ({ page }) => {
  await page.goto("/#/gallery");
  const firstMemory = page.getByRole("button", { name: "View The first hello" });
  await firstMemory.click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close viewer" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "All the days between" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(firstMemory).toBeFocused();

  const search = page.getByRole("searchbox", { name: "Search memories" });
  await search.fill("Rayden Japan");
  await expect(page.locator(".gallery-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=Rayden(?:\+|%20)Japan/);
});

test("300-record gallery renders in bounded batches", async ({ page }) => {
  await page.goto("/#/gallery?loadTest=300");

  await expect(page.getByText("300 memories")).toBeVisible();
  await expect(page.locator(".gallery-card")).toHaveCount(60);
  await page.getByRole("button", { name: "Load 60 More Memories" }).click();
  await expect(page.locator(".gallery-card")).toHaveCount(120);
  await expect(page.getByText("Showing 120 of 300")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("printable letter choices produce a clean print view", async ({ page }) => {
  await page.goto("/#/letter");

  await page.getByRole("radio", { name: /Sakura Blush/i }).check();
  await page.getByRole("radio", { name: /Floral Flourish/i }).check();
  await page.getByRole("radio", { name: /US Letter/i }).check();
  await expect(page.getByText(/Previewing Sakura Blush, Floral Flourish, US Letter/i)).toBeVisible();
  await expect(page.locator(".letter-paper")).toHaveClass(/letter-paper--blush/);
  await expect(page.locator(".letter-paper")).toHaveClass(/letter-paper--floral/);

  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".letter-customizer")).toBeHidden();
  await expect(page.locator(".letter-paper")).toBeVisible();
});

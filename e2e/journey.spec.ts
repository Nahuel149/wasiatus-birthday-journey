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
  const firstMemory = page.locator(".gallery-card__image").first();
  await firstMemory.click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close viewer" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "An early favorite" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(firstMemory).toBeFocused();

  const search = page.getByRole("searchbox", { name: "Search memories" });
  await search.fill("Rayden Japan");
  await expect(page.locator(".gallery-card")).toHaveCount(7);
  await expect(page).toHaveURL(/q=Rayden(?:\+|%20)Japan/);
});

test("approved chapter and gallery photographs load successfully", async ({ page }) => {
  await page.goto("/#/journey");
  await expect(page.locator(".chapter .memory-visual--photo")).toHaveCount(23);

  await page.goto("/#/gallery");
  await expect(page.getByText("74 memories")).toBeVisible();
  await expect(page.locator(".gallery-card")).toHaveCount(60);
  const visibleImage = page.locator(".gallery-card img").first();
  await expect.poll(async () => visibleImage.evaluate((image) => (
    (image as HTMLImageElement).complete ? (image as HTMLImageElement).naturalWidth : 0
  ))).toBeGreaterThan(0);
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

test("soundtrack links and floating notes stay usable without covering the journey", async ({ page }) => {
  await page.goto("/#/music");

  const youtubeLinks = page.getByRole("link", { name: /on YouTube/i });
  await expect(youtubeLinks).toHaveCount(7);
  await expect(page.getByLabel("A small love note")).toBeVisible();

  for (const link of await youtubeLinks.all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\/watch\?v=/);
  }

  const lastSong = page.locator(".song-card").last();
  await lastSong.scrollIntoViewIfNeeded();
  await expect(lastSong).toBeVisible();

  const noteBox = await page.getByLabel("A small love note").boundingBox();
  expect(noteBox?.y ?? 0).toBeLessThan(0);

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

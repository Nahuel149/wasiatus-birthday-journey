import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

await desktop.goto("http://127.0.0.1:4173/#/journey");
await desktop.locator(".chapter__moments").first().scrollIntoViewIfNeeded();
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: "test-results/journey-first-chapter.png" });

await desktop.goto("http://127.0.0.1:4173/#/gallery");
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: "test-results/gallery-desktop.png" });

const mobile = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await mobile.goto("http://127.0.0.1:4173/#/gallery");
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: "test-results/gallery-mobile.png" });

await browser.close();

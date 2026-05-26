import { expect, test } from "@playwright/test";
import {
  hasFirecrawlCredentials,
  scrapeForPlaywright,
} from "../../runtime/typescript/firecrawl";

const externalUrl = process.env.FIRECRAWL_TEST_URL ?? "https://example.com";

test.describe("Firecrawl with Playwright", () => {
  test.skip(!hasFirecrawlCredentials(), "Set FIRECRAWL_API_KEY to run Firecrawl-backed Playwright checks.");

  test("scrapes the same external URL that Playwright opens", async ({ page }) => {
    const scraped = await scrapeForPlaywright(externalUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30_000,
    });

    await page.goto(externalUrl, { waitUntil: "domcontentloaded" });
    const browserTitle = await page.title();

    expect(scraped.markdown.length).toBeGreaterThan(20);
    expect(browserTitle.length).toBeGreaterThan(0);
    expect(new URL(scraped.url).hostname).toBe(new URL(externalUrl).hostname);
  });
});

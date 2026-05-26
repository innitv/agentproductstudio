import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, devices, type BrowserContextOptions } from "@playwright/test";
import {
  hasFirecrawlCredentials,
  scrapeForPlaywright,
  stopFirecrawlInteraction,
} from "./firecrawl";

export interface ReferenceScanOptions {
  url: string;
  slug?: string;
  outputRoot?: string;
  waitMs?: number;
}

export interface ReferenceScanResult {
  status: "success" | "partial";
  url: string;
  outputDir: string;
  firecrawl: {
    status: "success" | "skipped" | "failed";
    markdownPath?: string;
    jsonPath?: string;
    screenshotPath?: string;
    error?: string;
  };
  playwright: {
    status: "success" | "failed";
    screenshots: string[];
    error?: string;
  };
}

const defaultViewport = {
  width: 1440,
  height: 1200,
};

export async function scanReference(options: ReferenceScanOptions): Promise<ReferenceScanResult> {
  const url = normalizeUrl(options.url);
  const slug = options.slug ?? createSlug(new URL(url).hostname);
  const outputDir = join(process.cwd(), options.outputRoot ?? "reports/visual-review", slug);
  await mkdir(outputDir, { recursive: true });

  const result: ReferenceScanResult = {
    status: "success",
    url,
    outputDir,
    firecrawl: { status: "skipped" },
    playwright: { status: "success", screenshots: [] },
  };

  if (hasFirecrawlCredentials()) {
    try {
      const scraped = await scrapeForPlaywright(url, {
        formats: [
          "markdown",
          "links",
          "images",
          {
            type: "screenshot",
            fullPage: true,
            viewport: defaultViewport,
          },
        ],
        onlyMainContent: false,
        waitFor: options.waitMs ?? 1_500,
      });
      const markdownPath = join(outputDir, "firecrawl-markdown.md");
      const jsonPath = join(outputDir, "firecrawl-scrape.json");

      await writeFile(markdownPath, scraped.markdown, "utf8");
      await writeFile(
        jsonPath,
        JSON.stringify(
          {
            url: scraped.url,
            title: scraped.title,
            metadata: scraped.metadata,
            links: scraped.links,
            images: scraped.images,
            scrapeId: scraped.scrapeId,
          },
          null,
          2,
        ),
        "utf8",
      );

      const screenshotPath = scraped.screenshot
        ? await writeFirecrawlScreenshot(outputDir, scraped.screenshot)
        : undefined;

      result.firecrawl = {
        status: "success",
        markdownPath,
        jsonPath,
        screenshotPath,
      };

      if (scraped.scrapeId) {
        await stopFirecrawlInteraction(scraped.scrapeId).catch(() => undefined);
      }
    } catch (error) {
      result.status = "partial";
      result.firecrawl = {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  } else {
    result.status = "partial";
    result.firecrawl = {
      status: "skipped",
      error: "FIRECRAWL_API_KEY is not set.",
    };
  }

  try {
    result.playwright.screenshots = await captureReferenceScreenshots(url, outputDir);
  } catch (error) {
    result.status = "partial";
    result.playwright = {
      status: "failed",
      screenshots: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await writeFile(join(outputDir, "reference-scan-result.json"), JSON.stringify(result, null, 2), "utf8");
  return result;
}

async function captureReferenceScreenshots(url: string, outputDir: string): Promise<string[]> {
  const browser = await chromium.launch();
  const screenshots: string[] = [];

  try {
    screenshots.push(
      await captureScreenshot(browser, url, outputDir, "reference-desktop-full.png", {
        viewport: defaultViewport,
        deviceScaleFactor: 1,
      }),
    );
    screenshots.push(
      await captureScreenshot(browser, url, outputDir, "reference-mobile-full.png", {
        ...devices["Pixel 7"],
      }),
    );

    return screenshots;
  } finally {
    await browser.close();
  }
}

async function captureScreenshot(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  url: string,
  outputDir: string,
  fileName: string,
  contextOptions: BrowserContextOptions,
): Promise<string> {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const screenshotPath = join(outputDir, fileName);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  } finally {
    await context.close();
  }
}

async function writeFirecrawlScreenshot(outputDir: string, screenshot: string): Promise<string> {
  if (/^https?:\/\//i.test(screenshot)) {
    const screenshotPath = join(outputDir, "firecrawl-screenshot-url.txt");
    await writeFile(screenshotPath, screenshot, "utf8");
    return screenshotPath;
  }

  const base64 = screenshot.startsWith("data:")
    ? screenshot.slice(screenshot.indexOf(",") + 1)
    : screenshot;
  const buffer = Buffer.from(base64, "base64");
  const extension = detectImageExtension(buffer);

  if (!extension) {
    const screenshotPath = join(outputDir, "firecrawl-screenshot-raw.txt");
    await writeFile(screenshotPath, screenshot, "utf8");
    return screenshotPath;
  }

  const screenshotPath = join(outputDir, `firecrawl-reference-full.${extension}`);
  await writeFile(screenshotPath, buffer);
  return screenshotPath;
}

function detectImageExtension(buffer: Buffer): "png" | "jpg" | "webp" | undefined {
  if (
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  if (
    buffer.length > 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return undefined;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Reference scan requires a URL.");
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "reference";
}

async function main(): Promise<void> {
  const [url, slug] = process.argv.slice(2);
  if (!url) {
    throw new Error("Usage: yarn reference:scan <url> [slug]");
  }

  const result = await scanReference({ url, slug });
  console.log(`Reference scan ${result.status}: ${result.outputDir}`);
  console.log(`Firecrawl: ${result.firecrawl.status}`);
  console.log(`Playwright: ${result.playwright.status}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

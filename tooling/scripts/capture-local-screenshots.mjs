import { chromium, devices } from "playwright";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

async function main() {
  const outputDir = join(process.cwd(), "reports/visual-review/vk-pricing");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  try {
    console.log("Capturing local desktop screenshot of http://127.0.0.1:5173/ ...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 1200 },
      deviceScaleFactor: 1
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle", timeout: 30000 });
    // Даем время на рендер и микроанимации
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({ path: join(outputDir, "local-desktop-after.png"), fullPage: true });
    await desktopContext.close();
    console.log("Local desktop screenshot saved.");

    console.log("Capturing local mobile screenshot of http://127.0.0.1:5173/ ...");
    const mobileContext = await browser.newContext({
      ...devices["Pixel 7"]
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle", timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: join(outputDir, "local-mobile-after.png"), fullPage: true });
    await mobileContext.close();
    console.log("Local mobile screenshot saved.");

    console.log("Screenshots captured successfully!");
  } catch (error) {
    console.error("Failed to capture screenshots:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

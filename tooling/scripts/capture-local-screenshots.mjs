import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const defaultOutputRoot = join(process.cwd(), "reports", "visual-review");
const defaultTimeoutMs = 60_000;

const defaultSections = [
  {
    label: "header",
    referenceSelectors: ["header", "nav", "[role='banner']"],
    localSelectors: ["header", "nav", "[role='banner']"],
  },
  {
    label: "hero",
    referenceSelectors: ["main > section:first-of-type", "section.hero", ".hero", "[class*='hero']"],
    localSelectors: ["main > section:first-of-type", "section.hero", ".hero", "[class*='hero']"],
  },
  {
    label: "main",
    referenceSelectors: ["main"],
    localSelectors: ["main"],
  },
  {
    label: "footer",
    referenceSelectors: ["footer", "[role='contentinfo']"],
    localSelectors: ["footer", "[role='contentinfo']"],
  },
];

export function parseCaptureArgs(rawArgs) {
  const args = [...rawArgs];
  const positional = [];
  const options = {
    referenceUrl: undefined,
    localUrl: undefined,
    outputDir: undefined,
    slug: undefined,
    sectionsPath: undefined,
    timeoutMs: defaultTimeoutMs,
    warmup: true,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    if (arg === "--no-warmup") {
      options.warmup = false;
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${arg} requires a value.`);
    }

    index += 1;
    switch (arg) {
      case "--reference-url":
        options.referenceUrl = value;
        break;
      case "--local-url":
        options.localUrl = value;
        break;
      case "--output-dir":
        options.outputDir = value;
        break;
      case "--slug":
        options.slug = value;
        break;
      case "--sections":
        options.sectionsPath = value;
        break;
      case "--timeout":
        options.timeoutMs = Number(value);
        if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
          throw new Error("--timeout must be a positive number.");
        }
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  options.referenceUrl ??= positional[0];
  options.localUrl ??= positional[1];

  if (!options.referenceUrl || !options.localUrl) {
    throw new Error(usage());
  }

  const slug = options.slug ?? slugFromUrl(options.referenceUrl);
  return {
    ...options,
    slug,
    outputDir: resolve(options.outputDir ?? join(defaultOutputRoot, slug)),
    sections: loadSections(options.sectionsPath),
  };
}

export function normalizeSections(value) {
  if (!Array.isArray(value)) {
    throw new Error("Sections config must be a JSON array.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Section at index ${index} must be an object.`);
    }

    const label = sanitizeLabel(String(item.label ?? ""));
    if (!label) {
      throw new Error(`Section at index ${index} must include a non-empty label.`);
    }

    const sharedSelectors = normalizeSelectors(item.selectors);
    const referenceSelectors = normalizeSelectors(item.referenceSelectors ?? item.reference_selectors) ?? sharedSelectors;
    const localSelectors = normalizeSelectors(item.localSelectors ?? item.local_selectors) ?? sharedSelectors;

    if (!referenceSelectors?.length || !localSelectors?.length) {
      throw new Error(`Section '${label}' must include selectors, or both referenceSelectors and localSelectors.`);
    }

    return { label, referenceSelectors, localSelectors };
  });
}

export async function captureReferenceAndLocalScreenshots(options) {
  const outputDir = resolve(options.outputDir);
  mkdirSync(outputDir, { recursive: true });

  const result = {
    status: "success",
    generatedAt: new Date().toISOString(),
    referenceUrl: options.referenceUrl,
    localUrl: options.localUrl,
    outputDir,
    screenshots: [],
    missingSections: [],
    errors: [],
  };

  const browser = await chromium.launch({ headless: true });
  try {
    for (const target of [
      { kind: "reference", url: options.referenceUrl },
      { kind: "local", url: options.localUrl },
    ]) {
      for (const viewport of ["desktop", "mobile"]) {
        const contextOptions = viewport === "desktop"
          ? { viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 }
          : { ...devices["Pixel 7"] };
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();

        try {
          console.log(`\n=== ${target.kind.toUpperCase()} ${viewport.toUpperCase()} ===`);
          await page.goto(target.url, { waitUntil: "networkidle", timeout: options.timeoutMs });
          if (options.warmup) {
            await warmupScroll(page);
          }

          const fullPath = join(outputDir, `${target.kind}-${viewport}-full.png`);
          await page.screenshot({ path: fullPath, fullPage: true });
          result.screenshots.push({
            label: `${target.kind}-${viewport}-full`,
            target: target.kind,
            viewport,
            captureType: "full_page",
            path: fullPath,
          });
          console.log(`  [ok] full-page -> ${basename(fullPath)}`);

          const sections = target.kind === "reference"
            ? options.sections.map((section) => ({ label: section.label, selectors: section.referenceSelectors }))
            : options.sections.map((section) => ({ label: section.label, selectors: section.localSelectors }));
          await captureSections(page, sections, `${target.kind}-${viewport}`, outputDir, result);
        } finally {
          await context.close();
        }
      }
    }
  } catch (error) {
    result.status = "failed";
    result.errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  if (result.status !== "failed" && result.missingSections.length) {
    result.status = "partial";
  }

  writeFileSync(join(outputDir, "screenshot-capture-result.json"), JSON.stringify(result, null, 2), "utf8");
  return result;
}

async function captureSections(page, sections, prefix, outputDir, result) {
  for (const section of sections) {
    const outputPath = join(outputDir, `${prefix}-section-${section.label}.png`);
    const captured = await captureFirstMatch(page, section.label, section.selectors, outputPath);
    if (captured) {
      const [target, viewport] = prefix.split("-");
      result.screenshots.push({
        label: `${prefix}-section-${section.label}`,
        target,
        viewport,
        captureType: "section",
        path: outputPath,
      });
    } else {
      result.missingSections.push({
        label: section.label,
        prefix,
        selectors: section.selectors,
      });
    }
  }
}

async function warmupScroll(page) {
  console.log("  [scroll] warming up animations");
  await page.evaluate(async () => {
    const stepPx = 500;
    const delayMs = 80;
    const total = document.body.scrollHeight;
    let position = 0;
    while (position < total) {
      window.scrollTo(0, position);
      position += stepPx;
      await new Promise((resolveTimeout) => setTimeout(resolveTimeout, delayMs));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
}

async function captureFirstMatch(page, label, selectors, outputPath) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0) {
        await locator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
        await locator.screenshot({ path: outputPath });
        console.log(`  [ok] ${label} (${selector}) -> ${basename(outputPath)}`);
        return true;
      }
    } catch {
      // Try next selector.
    }
  }

  console.warn(`  [warn] ${label}: selectors not found (${selectors.join(", ")})`);
  return false;
}

function loadSections(sectionsPath) {
  if (!sectionsPath) {
    return defaultSections;
  }

  const parsed = JSON.parse(readFileSync(resolve(sectionsPath), "utf8"));
  return normalizeSections(parsed);
}

function normalizeSelectors(value) {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return undefined;
}

function slugFromUrl(url) {
  try {
    const parsed = new URL(url);
    const pathPart = parsed.pathname.split("/").filter(Boolean).at(-1);
    return sanitizeLabel(pathPart || parsed.hostname.replace(/^www\./, ""));
  } catch {
    return "reference-review";
  }
}

function sanitizeLabel(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function usage() {
  return [
    "Usage:",
    "  node tooling/scripts/capture-local-screenshots.mjs --reference-url <url> --local-url <url> [--slug <slug>] [--output-dir <dir>] [--sections sections.json] [--timeout 60000] [--no-warmup]",
    "  node tooling/scripts/capture-local-screenshots.mjs <reference-url> <local-url> [--slug <slug>]",
  ].join("\n");
}

async function main() {
  const options = parseCaptureArgs(process.argv.slice(2));
  const result = await captureReferenceAndLocalScreenshots(options);
  console.log(`\nScreenshot capture ${result.status}: ${result.outputDir}`);
  if (result.status === "failed") {
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

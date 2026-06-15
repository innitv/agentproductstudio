import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, devices, type BrowserContextOptions, type Page } from "@playwright/test";
import { compareImagePair, type DiffMetrics } from "./visual-diff";

interface SectionDefinition {
  label: string;
  referenceSelectors: string[];
  localSelectors: string[];
}

interface SectionCaptureResult {
  label: string;
  selector: string;
  viewport: "desktop" | "mobile";
  referencePath?: string;
  localPath?: string;
  status: "captured" | "missing_reference" | "missing_local" | "failed";
  error?: string;
  diff?: DiffMetrics;
}

interface SectionDiffResult {
  status: "passed" | "passed_with_notes" | "failed";
  generatedAt: string;
  referenceUrl: string;
  localUrl: string;
  outputDir: string;
  threshold: number;
  maxMismatchRatio: number;
  sections: SectionCaptureResult[];
}

const defaultSections: SectionDefinition[] = [
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

const desktopContext: BrowserContextOptions = {
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
};

const mobileContext: BrowserContextOptions = {
  ...devices["Pixel 7"],
};

export async function runVisualSectionDiff(options: {
  referenceUrl: string;
  localUrl: string;
  outputDir: string;
  threshold?: number;
  maxMismatchRatio?: number;
  sections?: SectionDefinition[];
}): Promise<SectionDiffResult> {
  const outputDir = resolve(options.outputDir);
  const threshold = options.threshold ?? 24;
  const maxMismatchRatio = options.maxMismatchRatio ?? 0.35;
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const results: SectionCaptureResult[] = [];

  try {
    for (const viewport of ["desktop", "mobile"] as const) {
      const contextOptions = viewport === "desktop" ? desktopContext : mobileContext;
      const context = await browser.newContext(contextOptions);
      const referencePage = await context.newPage();
      const localPage = await context.newPage();

      try {
        await referencePage.goto(options.referenceUrl, { waitUntil: "networkidle", timeout: 45_000 });
        await localPage.goto(options.localUrl, { waitUntil: "networkidle", timeout: 45_000 });

        for (const section of options.sections ?? defaultSections) {
          results.push(
            await captureAndCompareSection({
              section,
              viewport,
              referencePage,
              localPage,
              outputDir,
              threshold,
              maxMismatchRatio,
            }),
          );
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const result: SectionDiffResult = {
    status: summarizeSectionStatus(results),
    generatedAt: new Date().toISOString(),
    referenceUrl: options.referenceUrl,
    localUrl: options.localUrl,
    outputDir,
    threshold,
    maxMismatchRatio,
    sections: results,
  };

  await writeFile(join(outputDir, "visual-section-diff-result.json"), JSON.stringify(result, null, 2), "utf8");
  await writeFile(join(outputDir, "visual-section-diff-summary.md"), renderSectionDiffMarkdown(result), "utf8");
  return result;
}

async function captureAndCompareSection(options: {
  section: SectionDefinition;
  viewport: "desktop" | "mobile";
  referencePage: Page;
  localPage: Page;
  outputDir: string;
  threshold: number;
  maxMismatchRatio: number;
}): Promise<SectionCaptureResult> {
  const referenceMatch = await firstAvailableLocator(options.referencePage, options.section.referenceSelectors);
  const localMatch = await firstAvailableLocator(options.localPage, options.section.localSelectors);

  if (!referenceMatch) {
    return {
      label: options.section.label,
      selector: options.section.referenceSelectors.join(" | "),
      viewport: options.viewport,
      status: "missing_reference",
    };
  }

  if (!localMatch) {
    return {
      label: options.section.label,
      selector: options.section.localSelectors.join(" | "),
      viewport: options.viewport,
      status: "missing_local",
    };
  }

  const referencePath = join(options.outputDir, `section-${options.viewport}-${options.section.label}-reference.png`);
  const localPath = join(options.outputDir, `section-${options.viewport}-${options.section.label}-local.png`);

  try {
    await referenceMatch.locator.scrollIntoViewIfNeeded();
    await localMatch.locator.scrollIntoViewIfNeeded();
    await referenceMatch.locator.screenshot({ path: referencePath });
    await localMatch.locator.screenshot({ path: localPath });

    const diff = await compareImagePair(
      {
        label: `${options.viewport}:${options.section.label}`,
        reference: referencePath,
        local: localPath,
      },
      options.threshold,
      options.maxMismatchRatio,
    );

    return {
      label: options.section.label,
      selector: `${referenceMatch.selector} / ${localMatch.selector}`,
      viewport: options.viewport,
      referencePath,
      localPath,
      status: "captured",
      diff,
    };
  } catch (error) {
    return {
      label: options.section.label,
      selector: `${referenceMatch.selector} / ${localMatch.selector}`,
      viewport: options.viewport,
      referencePath,
      localPath,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function firstAvailableLocator(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0) {
      return { selector, locator };
    }
  }

  return undefined;
}

function summarizeSectionStatus(results: SectionCaptureResult[]): SectionDiffResult["status"] {
  if (results.some((result) => result.status !== "captured" || result.diff?.status === "failed")) {
    return "failed";
  }

  if (results.some((result) => result.diff?.status === "passed_with_notes")) {
    return "passed_with_notes";
  }

  return "passed";
}

function renderSectionDiffMarkdown(result: SectionDiffResult): string {
  return [
    "# Visual Section Diff Summary",
    "",
    `Status: ${result.status}`,
    `Generated: ${result.generatedAt}`,
    `Reference URL: ${result.referenceUrl}`,
    `Local URL: ${result.localUrl}`,
    `Threshold: ${result.threshold}`,
    `Max mismatch ratio: ${result.maxMismatchRatio}`,
    "",
    "| Viewport | Section | Selector | Mismatch ratio | Mean delta | Size | Status |",
    "|---|---|---|---:|---:|---:|---|",
    ...result.sections.map((section) => {
      const diff = section.diff;
      return `| ${section.viewport} | ${section.label} | \`${section.selector}\` | ${
        diff ? `${(diff.mismatchRatio * 100).toFixed(2)}%` : "n/a"
      } | ${diff ? diff.meanDelta.toFixed(2) : "n/a"} | ${diff ? diff.comparedSize : "n/a"} | ${
        diff?.status ?? section.status
      } |`;
    }),
    "",
  ].join("\n");
}

function readNumberFlag(args: string[], flag: string): number | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = Number(args[index + 1]);
  return Number.isFinite(value) ? value : undefined;
}

function readStringFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function normalizeSections(value: unknown): SectionDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error("Sections config must be a JSON array.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Section at index ${index} must be an object.`);
    }

    const record = item as Record<string, unknown>;
    const label = sanitizeLabel(String(record.label ?? ""));
    const sharedSelectors = normalizeSelectors(record.selectors);
    const referenceSelectors =
      normalizeSelectors(record.referenceSelectors ?? record.reference_selectors) ?? sharedSelectors;
    const localSelectors = normalizeSelectors(record.localSelectors ?? record.local_selectors) ?? sharedSelectors;

    if (!label || !referenceSelectors?.length || !localSelectors?.length) {
      throw new Error(`Section at index ${index} must include label and selectors.`);
    }

    return { label, referenceSelectors, localSelectors };
  });
}

function normalizeSelectors(value: unknown): string[] | undefined {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return undefined;
}

function sanitizeLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readSectionsFlag(args: string[]): Promise<SectionDefinition[] | undefined> {
  const sectionsPath = readStringFlag(args, "--sections");
  if (!sectionsPath) return undefined;
  return normalizeSections(JSON.parse(await readFile(resolve(sectionsPath), "utf8")));
}

function positionalArgs(args: string[], flagsWithValues: Set<string>): string[] {
  const positional: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (flagsWithValues.has(arg)) {
      index += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  return positional;
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const positional = positionalArgs(rawArgs, new Set(["--sections", "--threshold", "--max-mismatch-ratio"]));
  const [referenceUrl, localUrl, outputDir = "reports/visual-review/section-diff"] = positional;

  if (!referenceUrl || !localUrl) {
    throw new Error(
      "Usage: yarn reference:section-diff <reference-url> <local-url> [output-dir] [--sections sections.json] [--threshold 24] [--max-mismatch-ratio 0.35]",
    );
  }

  const result = await runVisualSectionDiff({
    referenceUrl,
    localUrl,
    outputDir,
    threshold: readNumberFlag(rawArgs, "--threshold"),
    maxMismatchRatio: readNumberFlag(rawArgs, "--max-mismatch-ratio"),
    sections: await readSectionsFlag(rawArgs),
  });

  console.log(`Visual section diff ${result.status}: ${join(resolve(outputDir), "visual-section-diff-summary.md")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

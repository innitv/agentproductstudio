import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface ScreenshotEvidence {
  label: string;
  path: string;
  viewport: "desktop" | "mobile" | "unknown";
  captureType: "full_page" | "viewport" | "section";
  dimensions?: string;
}

interface ReferenceScanResultFile {
  status?: string;
  url?: string;
  firecrawl?: {
    status?: string;
    markdownPath?: string;
    jsonPath?: string;
    screenshotPath?: string;
    error?: string;
  };
  playwright?: {
    status?: string;
    screenshots?: string[];
    error?: string;
  };
}

interface VisualDiffResultFile {
  status?: string;
  threshold?: number;
  maxMismatchRatio?: number;
  pairs?: Array<{
    label: string;
    referenceSize: string;
    localSize: string;
    comparedSize: string;
    mismatchRatio: number;
    meanDelta: number;
    maxDelta: number;
    status: string;
  }>;
}

interface VisualSectionDiffResultFile {
  status?: string;
  threshold?: number;
  maxMismatchRatio?: number;
  sections?: Array<{
    label: string;
    selector: string;
    viewport: string;
    status: string;
    diff?: {
      mismatchRatio: number;
      meanDelta: number;
      comparedSize: string;
      status: string;
    };
  }>;
}

interface VisualReviewOptions {
  reportDir: string;
  localDir?: string;
  localUrl?: string;
  outputPath?: string;
}

interface ComparisonArea {
  area: string;
  referencePattern: string;
  localResult: string;
  status: "passed" | "passed_with_notes" | "accepted_difference" | "blocked";
}

const visualDiffResultFileName = "visual-diff-result.json";
const visualSectionDiffResultFileName = "visual-section-diff-result.json";

export async function generateVisualReferenceReview(options: VisualReviewOptions): Promise<string> {
  const reportDir = resolve(options.reportDir);
  const localDir = options.localDir ? resolve(options.localDir) : undefined;
  const scanResult = await readReferenceScanResult(reportDir);
  const diffResult = await readVisualDiffResult(reportDir);
  const sectionDiffResult = await readVisualSectionDiffResult(reportDir);
  const markdownPath = scanResult.firecrawl?.markdownPath ?? join(reportDir, "firecrawl-markdown.md");
  const headings = await readMarkdownHeadings(markdownPath);
  const screenshots = await collectScreenshots(reportDir, localDir);
  const outputPath = resolve(options.outputPath ?? join(reportDir, "visual-reference-review.md"));

  const hasReferenceDesktop = screenshots.some((item) => item.label.includes("reference-desktop"));
  const hasReferenceMobile = screenshots.some((item) => item.label.includes("reference-mobile"));
  const hasLocalDesktop = screenshots.some((item) => item.label.includes("local-desktop"));
  const hasLocalMobile = screenshots.some((item) => item.label.includes("local-mobile"));
  const hasScreenshotPairs = hasReferenceDesktop && hasReferenceMobile && hasLocalDesktop && hasLocalMobile;
  const hasPassingVisualDiff = diffResult?.status === "passed" || diffResult?.status === "passed_with_notes";
  const hasRequiredEvidence = hasScreenshotPairs && hasPassingVisualDiff;
  const status = hasRequiredEvidence ? "passed_with_notes" : "blocked";
  const gateResult = status;
  const gapNotes = visualGateGaps({
    hasScreenshotPairs,
    diffResult,
    sectionDiffResult,
  });
  const remainingDifferences = hasRequiredEvidence
    ? [
        "Оригинальные brand/SVG assets и точные webfont metrics требуют отдельной asset-сверки.",
        ...(sectionDiffResult ? [] : ["Поблочный visual section diff не найден; final QA должен выполнить section-level сверку."]),
      ]
    : gapNotes;
  const comparisonAreas = buildComparisonAreas({
    sectionDiffResult,
    diffResult,
    screenshots,
    hasRequiredEvidence,
  });
  const artifactPayload = {
    status,
    inputs_used: [
      `Reference URL: ${scanResult.url ?? "unknown"}`,
      `Local URL: ${options.localUrl ?? "not provided"}`,
      `Reference report directory: ${toDisplayPath(reportDir)}`,
      localDir ? `Local screenshot directory: ${toDisplayPath(localDir)}` : "Local screenshot directory: same as reference report directory",
      `${visualDiffResultFileName}: ${diffResult ? diffResult.status ?? "unknown" : "missing"}`,
      `${visualSectionDiffResultFileName}: ${sectionDiffResult ? sectionDiffResult.status ?? "unknown" : "missing"}`,
    ],
    reference_url: scanResult.url ?? "unknown",
    local_url: options.localUrl ?? "not provided",
    visual_diff_result_path: diffResult ? toDisplayPath(join(reportDir, visualDiffResultFileName)) : "",
    visual_section_diff_result_path: sectionDiffResult ? toDisplayPath(join(reportDir, visualSectionDiffResultFileName)) : "",
    screenshots: screenshots.map((item) => ({
      label: item.label,
      path: toDisplayPath(item.path),
      viewport: item.viewport === "unknown" ? "desktop" : item.viewport,
      capture_type: item.captureType,
    })),
    comparison_areas: comparisonAreas.map((item) => ({
      area: item.area,
      reference_pattern: item.referencePattern,
      local_result: item.localResult,
      status: item.status,
    })),
    gaps_found: hasRequiredEvidence
      ? [
          ...(sectionDiffResult ? [] : ["Visual section diff was not found; section-level QA remains required."]),
        ]
      : gapNotes,
    corrections_made: [
      "Generated a structured visual review artifact from scan, screenshot and visual diff evidence.",
      "Linked reference and local screenshot paths for QA review.",
      "Applied a hard gate that blocks review success without visual-diff-result.json.",
    ],
    remaining_differences: remainingDifferences,
    gate_result: gateResult,
  };

  const markdown = [
    "---",
    "schema_payload:",
    ...renderYamlObject(artifactPayload, 2).trimEnd().split("\n"),
    "---",
    "",
    "# Visual Reference Review",
    "",
    "## Artifact Metadata",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Status | ${status} |`,
    "| Owner | qa-review |",
    `| Generated | ${new Date().toISOString()} |`,
    "",
    "## Inputs Used",
    "",
    `- Reference URL: ${scanResult.url ?? "unknown"}`,
    `- Local URL: ${options.localUrl ?? "not provided"}`,
    `- Reference report directory: \`${toDisplayPath(reportDir)}\``,
    `- Local screenshot directory: ${localDir ? `\`${toDisplayPath(localDir)}\`` : "same as reference report directory"}`,
    `- Firecrawl status: ${scanResult.firecrawl?.status ?? "unknown"}`,
    `- Playwright status: ${scanResult.playwright?.status ?? "unknown"}`,
    "",
    "## Screenshot Set",
    "",
    "| Screenshot | Path | Viewport | Capture type | Dimensions |",
    "|---|---|---|---|---|",
    ...screenshots.map(
      (item) =>
        `| ${item.label} | \`${toDisplayPath(item.path)}\` | ${item.viewport} | ${item.captureType} | ${
          item.dimensions ?? "unknown"
        } |`,
    ),
    "",
    "## Firecrawl Structure Summary",
    "",
    headings.length > 0
      ? headings.map((heading) => `- ${heading}`).join("\n")
      : "- Firecrawl markdown headings were not available.",
    "",
    "## Visual Diff Summary",
    "",
    renderVisualDiffSection(diffResult),
    "",
    "## Visual Section Diff Summary",
    "",
    renderVisualSectionDiffSection(sectionDiffResult),
    "",
    "## Full-Site Comparison",
    "",
    "| Area | Reference pattern | Local result | Status |",
    "|---|---|---|---|",
    ...comparisonAreas.map(
      (item) =>
        `| ${item.area} | ${escapeTable(item.referencePattern)} | ${escapeTable(item.localResult)} | ${item.status} |`,
    ),
    "",
    "## Gaps Found",
    "",
    ...(hasRequiredEvidence ? artifactPayload.gaps_found : gapNotes).map((item) => `- ${item}`),
    "",
    "## Corrections Made",
    "",
    ...artifactPayload.corrections_made.map((item) => `- ${item}`),
    "",
    "## Remaining Differences",
    "",
    ...remainingDifferences.map((item) => `- ${item}`),
    "",
    "## Gate Result",
    "",
    hasRequiredEvidence
      ? "passed_with_notes — screenshot pairs and visual diff evidence exist; manual section review can proceed from this artifact."
      : "blocked — missing or failed visual evidence prevents a complete visual reference review.",
    "",
  ].join("\n");

  await writeFile(outputPath, markdown, "utf8");
  return outputPath;
}

async function readReferenceScanResult(reportDir: string): Promise<ReferenceScanResultFile> {
  const scanPath = join(reportDir, "reference-scan-result.json");
  try {
    return JSON.parse(await readFile(scanPath, "utf8")) as ReferenceScanResultFile;
  } catch {
    return {};
  }
}

async function readVisualDiffResult(reportDir: string): Promise<VisualDiffResultFile | undefined> {
  const diffPath = join(reportDir, visualDiffResultFileName);
  try {
    return JSON.parse(await readFile(diffPath, "utf8")) as VisualDiffResultFile;
  } catch {
    return undefined;
  }
}

async function readVisualSectionDiffResult(reportDir: string): Promise<VisualSectionDiffResultFile | undefined> {
  const diffPath = join(reportDir, visualSectionDiffResultFileName);
  try {
    return JSON.parse(await readFile(diffPath, "utf8")) as VisualSectionDiffResultFile;
  } catch {
    return undefined;
  }
}

function renderVisualDiffSection(diffResult: VisualDiffResultFile | undefined): string {
  if (!diffResult) {
    return [
      "- Visual diff was not found.",
      "- Run `yarn reference:diff <reference-report-dir> <local-report-dir>` before final review.",
    ].join("\n");
  }

  return [
    `Status: ${diffResult.status ?? "unknown"}`,
    `Threshold: ${diffResult.threshold ?? "unknown"}`,
    `Max mismatch ratio: ${diffResult.maxMismatchRatio ?? "unknown"}`,
    "",
    "| Pair | Reference size | Local size | Compared size | Mismatch ratio | Mean delta | Max delta | Status |",
    "|---|---:|---:|---:|---:|---:|---:|---|",
    ...(diffResult.pairs ?? []).map(
      (pair) =>
        `| ${pair.label} | ${pair.referenceSize} | ${pair.localSize} | ${pair.comparedSize} | ${(
          pair.mismatchRatio * 100
        ).toFixed(2)}% | ${pair.meanDelta.toFixed(2)} | ${pair.maxDelta.toFixed(2)} | ${pair.status} |`,
    ),
  ].join("\n");
}

function renderVisualSectionDiffSection(diffResult: VisualSectionDiffResultFile | undefined): string {
  if (!diffResult) {
    return [
      "- Visual section diff was not found.",
      "- Run `yarn reference:section-diff <reference-url> <local-url> <output-dir>` before final review.",
    ].join("\n");
  }

  return [
    `Status: ${diffResult.status ?? "unknown"}`,
    `Threshold: ${diffResult.threshold ?? "unknown"}`,
    `Max mismatch ratio: ${diffResult.maxMismatchRatio ?? "unknown"}`,
    "",
    "| Viewport | Section | Selector | Mismatch ratio | Mean delta | Size | Status |",
    "|---|---|---|---:|---:|---:|---|",
    ...(diffResult.sections ?? []).map((section) => {
      const diff = section.diff;
      return `| ${section.viewport} | ${section.label} | \`${section.selector}\` | ${
        diff ? `${(diff.mismatchRatio * 100).toFixed(2)}%` : "n/a"
      } | ${diff ? diff.meanDelta.toFixed(2) : "n/a"} | ${diff?.comparedSize ?? "n/a"} | ${
        diff?.status ?? section.status
      } |`;
    }),
  ].join("\n");
}

async function readMarkdownHeadings(markdownPath: string): Promise<string[]> {
  try {
    const content = await readFile(markdownPath, "utf8");
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^#{1,3}\s+/.test(line))
      .map((line) => line.replace(/^#{1,3}\s+/, "").trim())
      .filter(Boolean)
      .slice(0, 24);
  } catch {
    return [];
  }
}

async function collectScreenshots(reportDir: string, localDir?: string): Promise<ScreenshotEvidence[]> {
  const directories = Array.from(new Set([reportDir, localDir].filter(Boolean) as string[]));
  const screenshots: ScreenshotEvidence[] = [];

  for (const directory of directories) {
    const entries = await readdir(directory);
    const imageNames = entries
      .filter((entry) => [".png", ".jpg", ".jpeg", ".webp"].includes(extname(entry).toLowerCase()))
      .filter((entry) => /(?:reference|local|firecrawl).*(?:desktop|mobile|full|screenshot)/i.test(entry))
      .sort();

    screenshots.push(
      ...(await Promise.all(
        imageNames.map(async (fileName) => {
          const filePath = join(directory, fileName);
          return {
            label: basename(fileName, extname(fileName)),
            path: filePath,
            viewport: detectViewport(fileName),
            captureType: detectCaptureType(fileName),
            dimensions: await readImageDimensions(filePath),
          };
        }),
      )),
    );
  }

  return screenshots.sort((left, right) => left.label.localeCompare(right.label));
}

function detectViewport(fileName: string): ScreenshotEvidence["viewport"] {
  const lower = fileName.toLowerCase();
  if (lower.includes("desktop")) return "desktop";
  if (lower.includes("mobile")) return "mobile";
  return "unknown";
}

function detectCaptureType(fileName: string): ScreenshotEvidence["captureType"] {
  if (fileName.toLowerCase().includes("section")) return "section";
  return fileName.toLowerCase().includes("full") ? "full_page" : "viewport";
}

async function readImageDimensions(filePath: string): Promise<string | undefined> {
  const buffer = await readFile(filePath);
  if (buffer.length >= 24 && buffer.subarray(1, 4).toString("ascii") === "PNG") {
    return `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;
  }

  return undefined;
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function toDisplayPath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function buildComparisonAreas(options: {
  sectionDiffResult: VisualSectionDiffResultFile | undefined;
  diffResult: VisualDiffResultFile | undefined;
  screenshots: ScreenshotEvidence[];
  hasRequiredEvidence: boolean;
}): ComparisonArea[] {
  const sectionAreas = buildSectionComparisonAreas(options.sectionDiffResult);
  if (sectionAreas.length) {
    return sectionAreas;
  }

  const diffAreas = buildVisualDiffComparisonAreas(options.diffResult);
  if (diffAreas.length) {
    return diffAreas;
  }

  const screenshotAreas = buildScreenshotComparisonAreas(options.screenshots, options.hasRequiredEvidence);
  if (screenshotAreas.length) {
    return screenshotAreas;
  }

  return [
    {
      area: "visual-evidence",
      referencePattern: "No reference screenshot or diff evidence was found.",
      localResult: "No local screenshot or diff evidence was found.",
      status: "blocked",
    },
  ];
}

function buildSectionComparisonAreas(diffResult: VisualSectionDiffResultFile | undefined): ComparisonArea[] {
  return (diffResult?.sections ?? []).map((section) => {
    const diff = section.diff;
    return {
      area: `${section.viewport}:${section.label}`,
      referencePattern: `Reference selector evidence: ${section.selector}`,
      localResult: diff
        ? `Compared size ${diff.comparedSize}; mismatch ${formatRatio(diff.mismatchRatio)}; mean delta ${diff.meanDelta.toFixed(2)}.`
        : `Section status: ${section.status}.`,
      status: mapVisualEvidenceStatus(diff?.status ?? section.status),
    };
  });
}

function buildVisualDiffComparisonAreas(diffResult: VisualDiffResultFile | undefined): ComparisonArea[] {
  return (diffResult?.pairs ?? []).map((pair) => ({
    area: pair.label,
    referencePattern: `Reference screenshot size ${pair.referenceSize}; compared area ${pair.comparedSize}.`,
    localResult: `Local screenshot size ${pair.localSize}; mismatch ${formatRatio(pair.mismatchRatio)}; mean delta ${pair.meanDelta.toFixed(2)}; max delta ${pair.maxDelta.toFixed(2)}.`,
    status: mapVisualEvidenceStatus(pair.status),
  }));
}

function buildScreenshotComparisonAreas(screenshots: ScreenshotEvidence[], hasRequiredEvidence: boolean): ComparisonArea[] {
  const labels = new Set<string>();
  for (const screenshot of screenshots) {
    const match = screenshot.label.match(/^(?:reference|local)-(desktop|mobile)-section-(.+)$/);
    if (match) {
      labels.add(`${match[1]}:${match[2]}`);
    }
  }

  const sectionAreas = [...labels].sort().map((label) => {
    const [viewport, section] = label.split(":");
    return {
      area: `${viewport}:${section}`,
      referencePattern: `Reference section screenshot expected: reference-${viewport}-section-${section}.png.`,
      localResult: `Local section screenshot expected: local-${viewport}-section-${section}.png.`,
      status: hasRequiredEvidence ? "passed_with_notes" as const : "blocked" as const,
    };
  });

  if (sectionAreas.length) {
    return sectionAreas;
  }

  const fullPageViewports = new Set(
    screenshots
      .filter((item) => item.captureType === "full_page")
      .map((item) => item.viewport)
      .filter((viewport) => viewport !== "unknown"),
  );

  return [...fullPageViewports].sort().map((viewport) => ({
    area: `${viewport}:full-page`,
    referencePattern: `Reference full-page screenshot expected: reference-${viewport}-full.png.`,
    localResult: `Local full-page screenshot expected: local-${viewport}-full.png.`,
    status: hasRequiredEvidence ? "passed_with_notes" : "blocked",
  }));
}

function mapVisualEvidenceStatus(status: string | undefined): ComparisonArea["status"] {
  if (status === "passed") {
    return "passed";
  }

  if (status === "passed_with_notes" || status === "captured") {
    return "passed_with_notes";
  }

  if (status === "accepted_difference") {
    return "accepted_difference";
  }

  return "blocked";
}

function visualGateGaps(options: {
  hasScreenshotPairs: boolean;
  diffResult: VisualDiffResultFile | undefined;
  sectionDiffResult: VisualSectionDiffResultFile | undefined;
}): string[] {
  const gaps: string[] = [];

  if (!options.hasScreenshotPairs) {
    gaps.push("Missing required screenshot evidence: reference desktop/mobile and local desktop/mobile pairs are mandatory.");
  }

  if (!options.diffResult) {
    gaps.push(`Missing ${visualDiffResultFileName}; run \`yarn reference:diff <reference-report-dir> <local-report-dir>\` before final review.`);
  } else if (options.diffResult.status === "failed") {
    gaps.push(`${visualDiffResultFileName} status is failed; visual reference gate cannot pass until differences are corrected.`);
  } else if (options.diffResult.status !== "passed" && options.diffResult.status !== "passed_with_notes") {
    gaps.push(`${visualDiffResultFileName} status is ${options.diffResult.status ?? "unknown"}; expected passed or passed_with_notes.`);
  }

  if (!options.sectionDiffResult) {
    gaps.push(`Missing ${visualSectionDiffResultFileName}; section-level diff is required before final QA sign-off.`);
  } else if (options.sectionDiffResult.status === "failed") {
    gaps.push(`${visualSectionDiffResultFileName} status is failed; unresolved section differences remain.`);
  }

  return gaps;
}

function formatRatio(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function renderYamlObject(value: unknown, indent = 0): string {
  const padding = " ".repeat(indent);

  if (Array.isArray(value)) {
    if (!value.length) {
      return `${padding}[]\n`;
    }

    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return `${padding}-\n${renderYamlObject(item, indent + 2)}`;
        }

        return `${padding}- ${JSON.stringify(item)}\n`;
      })
      .join("");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        if (Array.isArray(item) || (typeof item === "object" && item !== null)) {
          return `${padding}${key}:\n${renderYamlObject(item, indent + 2)}`;
        }

        return `${padding}${key}: ${JSON.stringify(item)}\n`;
      })
      .join("");
  }

  return `${padding}${JSON.stringify(value)}\n`;
}

async function main(): Promise<void> {
  const { reportDir, localUrl, outputPath, localDir } = parseArgs(process.argv.slice(2));
  if (!reportDir) {
    throw new Error(
      "Usage: yarn reference:review <reports/visual-review/<slug>> [local-url] [output-path] [--local-dir <dir>]",
    );
  }

  const resultPath = await generateVisualReferenceReview({ reportDir, localDir, localUrl, outputPath });
  console.log(`Visual reference review written: ${resultPath}`);
}

function parseArgs(args: string[]): VisualReviewOptions {
  const positional: string[] = [];
  let localDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--local-dir") {
      localDir = args[index + 1];
      index += 1;
      continue;
    }

    positional.push(arg);
  }

  const [reportDir, localUrl, outputPath] = positional;
  return { reportDir, localUrl, outputPath, localDir };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

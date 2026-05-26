import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface ScreenshotEvidence {
  label: string;
  path: string;
  viewport: "desktop" | "mobile" | "unknown";
  captureType: "full_page" | "viewport";
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

const comparisonAreas = [
  {
    area: "Header",
    referencePattern: "Логотип слева, компактная навигация справа, pill CTA в правом верхнем углу.",
    localResult: "Проверить по desktop/mobile скриншотам: nav, CTA, отступы и видимость первого экрана.",
  },
  {
    area: "Hero",
    referencePattern: "Синий градиент, крупный белый headline, короткий supporting copy и белая CTA-кнопка.",
    localResult: "Проверить размер headline, позицию фонового круга, CTA и высоту первого экрана.",
  },
  {
    area: "Logo strip",
    referencePattern: "Белая закруглённая плашка поверх синего hero, ряд приглушённых логотипов.",
    localResult: "Проверить количество элементов, цвет, вертикальные отступы и overflow на mobile.",
  },
  {
    area: "How it works",
    referencePattern: "Белый блок с крупным двухцветным заголовком и строками icon/title/description.",
    localResult: "Проверить количество строк, разделители, ширину колонок и mobile stacking.",
  },
  {
    area: "Modules / cards",
    referencePattern: "Синяя секция, белые карточки в сетке, segmented control над карточками.",
    localResult: "Проверить сетку 3x2 на desktop и один столбец на mobile.",
  },
  {
    area: "Steps",
    referencePattern: "Синяя секция с крупным белым заголовком, круглыми номерами и CTA снизу.",
    localResult: "Проверить линию между шагами на desktop и вертикальную читаемость на mobile.",
  },
  {
    area: "Advantages / tariffs / FAQ",
    referencePattern: "Белые/синие чередующиеся секции с карточками, тарифами и accordion-like FAQ.",
    localResult: "Проверить наличие всех блоков, карточек, открытого FAQ-пункта и CTA states.",
  },
  {
    area: "Lead form / footer",
    referencePattern: "Большой синий question block, белая форма, затем legal footer на синем фоне.",
    localResult: "Проверить поля формы, legal text, footer columns и отсутствие наложений.",
  },
  {
    area: "Mobile layout",
    referencePattern: "Все секции идут в один столбец, без горизонтального overflow и наложений текста.",
    localResult: "Проверить mobile screenshot full-page и высоту карточек/формы.",
  },
];

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
  const hasRequiredEvidence = hasReferenceDesktop && hasReferenceMobile && hasLocalDesktop && hasLocalMobile;
  const status = hasRequiredEvidence ? "passed_with_notes" : "blocked";
  const remainingDifferences = hasRequiredEvidence
    ? [
        "Автоматический генератор фиксирует evidence и section checklist, но не выполняет pixel diff.",
        "Оригинальные brand/SVG assets и точные webfont metrics требуют отдельной asset-сверки.",
      ]
    : [
        "Нужны минимум 4 full-page скриншота: reference desktop/mobile и local desktop/mobile.",
        "Пересними локальную реализацию Playwright перед финальным QA.",
      ];

  const markdown = [
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
        `| ${item.area} | ${escapeTable(item.referencePattern)} | ${escapeTable(item.localResult)} | ${
          hasRequiredEvidence ? "passed_with_notes" : "blocked"
        } |`,
    ),
    "",
    "## Gaps Found",
    "",
    ...(hasRequiredEvidence
      ? [
          "- Pixel-level image diff is not implemented yet.",
          "- Brand assets are checked by screenshot review, not by asset identity hash.",
        ]
      : [
          "- Missing required screenshot evidence for full reference/local comparison.",
          "- Cannot mark visual reference gate as passed until desktop and mobile pairs exist.",
        ]),
    "",
    "## Corrections Made",
    "",
    "- Generated a structured visual review artifact from Firecrawl and Playwright evidence.",
    "- Linked reference and local screenshot paths for manual QA review.",
    "- Added a section-by-section checklist aligned with the reference-driven workflow.",
    "",
    "## Remaining Differences",
    "",
    ...remainingDifferences.map((item) => `- ${item}`),
    "",
    "## Gate Result",
    "",
    hasRequiredEvidence
      ? "passed_with_notes — evidence exists, manual section review can proceed from this artifact."
      : "blocked — missing screenshot evidence prevents a complete visual reference review.",
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
  const diffPath = join(reportDir, "visual-diff-result.json");
  try {
    return JSON.parse(await readFile(diffPath, "utf8")) as VisualDiffResultFile;
  } catch {
    return undefined;
  }
}

async function readVisualSectionDiffResult(reportDir: string): Promise<VisualSectionDiffResultFile | undefined> {
  const diffPath = join(reportDir, "visual-section-diff-result.json");
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

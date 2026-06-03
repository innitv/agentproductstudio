import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateVisualReferenceReview } from "./visual-reference-review";

const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);

async function withReportDir(assertion: (reportDir: string) => Promise<void>): Promise<void> {
  const reportDir = mkdtempSync(join(tmpdir(), "visual-review-"));
  try {
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(
      join(reportDir, "reference-scan-result.json"),
      JSON.stringify({
        status: "success",
        url: "https://example.com",
        firecrawl: { status: "skipped" },
        playwright: { status: "success", screenshots: [] },
      }),
      "utf8",
    );
    writeScreenshotSet(reportDir);
    await assertion(reportDir);
  } finally {
    rmSync(reportDir, { recursive: true, force: true });
  }
}

function writeScreenshotSet(reportDir: string): void {
  for (const fileName of [
    "reference-desktop-full.png",
    "reference-mobile-full.png",
    "local-desktop-full.png",
    "local-mobile-full.png",
  ]) {
    writeFileSync(join(reportDir, fileName), png1x1);
  }
}

function readPayloadStatus(markdown: string): string | undefined {
  return markdown.match(/^\s{2}status:\s+"?([A-Za-z0-9_-]+)/m)?.[1];
}

await withReportDir(async (reportDir) => {
  const outputPath = await generateVisualReferenceReview({
    reportDir,
    localUrl: "http://127.0.0.1:5173",
  });
  const markdown = await import("node:fs/promises").then((fs) => fs.readFile(outputPath, "utf8"));

  assert.match(markdown, /\| Status \| blocked \|/);
  assert.equal(readPayloadStatus(markdown), "blocked");
  assert.match(markdown, /Missing visual-diff-result\.json/);
});

await withReportDir(async (reportDir) => {
  writeFileSync(
    join(reportDir, "visual-diff-result.json"),
    JSON.stringify({
      status: "passed",
      generatedAt: new Date().toISOString(),
      threshold: 24,
      maxMismatchRatio: 0.18,
      pairs: [
        {
          label: "desktop",
          referenceSize: "1x1",
          localSize: "1x1",
          comparedSize: "1x1",
          mismatchRatio: 0,
          meanDelta: 0,
          maxDelta: 0,
          status: "passed",
        },
      ],
    }),
    "utf8",
  );

  const outputPath = await generateVisualReferenceReview({
    reportDir,
    localUrl: "http://127.0.0.1:5173",
  });
  const markdown = await import("node:fs/promises").then((fs) => fs.readFile(outputPath, "utf8"));

  assert.match(markdown, /\| Status \| passed_with_notes \|/);
  assert.equal(readPayloadStatus(markdown), "passed_with_notes");
  assert.doesNotMatch(markdown, /Pixel-level image diff is not implemented yet/);
  assert.doesNotMatch(markdown, /Logo strip|Modules \/ cards|Lead form \/ footer/);
  assert.match(markdown, /\| desktop \| Reference screenshot size 1x1; compared area 1x1\./);
});

console.log("visual reference review gate tests passed");

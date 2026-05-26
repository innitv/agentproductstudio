import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateSync } from "node:zlib";

interface PngImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface DiffPair {
  label: string;
  reference: string;
  local: string;
}

export interface DiffMetrics {
  label: string;
  reference: string;
  local: string;
  referenceSize: string;
  localSize: string;
  comparedSize: string;
  threshold: number;
  mismatchRatio: number;
  meanDelta: number;
  maxDelta: number;
  dimensionDelta: {
    width: number;
    height: number;
  };
  status: "passed" | "passed_with_notes" | "failed";
}

export interface VisualDiffResult {
  status: "passed" | "passed_with_notes" | "failed";
  generatedAt: string;
  threshold: number;
  maxMismatchRatio: number;
  pairs: DiffMetrics[];
}

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function runVisualDiff(options: {
  pairs: DiffPair[];
  outputDir: string;
  threshold?: number;
  maxMismatchRatio?: number;
}): Promise<VisualDiffResult> {
  const threshold = options.threshold ?? 24;
  const maxMismatchRatio = options.maxMismatchRatio ?? 0.18;
  const pairs = await Promise.all(
    options.pairs.map((pair) => compareImagePair(pair, threshold, maxMismatchRatio)),
  );
  const result: VisualDiffResult = {
    status: summarizeStatus(pairs),
    generatedAt: new Date().toISOString(),
    threshold,
    maxMismatchRatio,
    pairs,
  };

  await writeFile(join(options.outputDir, "visual-diff-result.json"), JSON.stringify(result, null, 2), "utf8");
  await writeFile(join(options.outputDir, "visual-diff-summary.md"), renderDiffMarkdown(result), "utf8");
  return result;
}

export async function compareImagePair(
  pair: DiffPair,
  threshold: number,
  maxMismatchRatio: number,
): Promise<DiffMetrics> {
  const reference = decodePng(await readFile(pair.reference));
  const local = decodePng(await readFile(pair.local));
  const width = Math.min(reference.width, local.width);
  const height = Math.min(reference.height, local.height);
  const total = width * height;
  let mismatches = 0;
  let deltaSum = 0;
  let maxDelta = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const refIndex = (y * reference.width + x) * 4;
      const localIndex = (y * local.width + x) * 4;
      const delta =
        (Math.abs(reference.data[refIndex] - local.data[localIndex]) +
          Math.abs(reference.data[refIndex + 1] - local.data[localIndex + 1]) +
          Math.abs(reference.data[refIndex + 2] - local.data[localIndex + 2])) /
        3;

      deltaSum += delta;
      maxDelta = Math.max(maxDelta, delta);
      if (delta > threshold) {
        mismatches += 1;
      }
    }
  }

  const mismatchRatio = total > 0 ? mismatches / total : 1;
  const meanDelta = total > 0 ? deltaSum / total : 255;
  const status =
    mismatchRatio <= maxMismatchRatio
      ? "passed"
      : mismatchRatio <= maxMismatchRatio * 1.75
        ? "passed_with_notes"
        : "failed";

  return {
    label: pair.label,
    reference: pair.reference,
    local: pair.local,
    referenceSize: `${reference.width}x${reference.height}`,
    localSize: `${local.width}x${local.height}`,
    comparedSize: `${width}x${height}`,
    threshold,
    mismatchRatio,
    meanDelta,
    maxDelta,
    dimensionDelta: {
      width: local.width - reference.width,
      height: local.height - reference.height,
    },
    status,
  };
}

function decodePng(buffer: Buffer): PngImage {
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Only PNG screenshots are supported.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}.`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const rowBytes = width * channels;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const raw = unfilterPngRows(inflated, width, height, channels, rowBytes);
  const rgba = new Uint8Array(width * height * 4);

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const src = pixel * channels;
    const dst = pixel * 4;
    rgba[dst] = raw[src];
    rgba[dst + 1] = raw[src + 1];
    rgba[dst + 2] = raw[src + 2];
    rgba[dst + 3] = channels === 4 ? raw[src + 3] : 255;
  }

  return { width, height, data: rgba };
}

function unfilterPngRows(
  inflated: Buffer,
  width: number,
  height: number,
  channels: number,
  rowBytes: number,
): Uint8Array {
  const output = new Uint8Array(width * height * channels);
  let sourceOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const rowStart = y * rowBytes;
    const previousRowStart = rowStart - rowBytes;

    for (let x = 0; x < rowBytes; x += 1) {
      const raw = inflated[sourceOffset + x];
      const left = x >= channels ? output[rowStart + x - channels] : 0;
      const up = y > 0 ? output[previousRowStart + x] : 0;
      const upLeft = y > 0 && x >= channels ? output[previousRowStart + x - channels] : 0;

      output[rowStart + x] = unfilterByte(filter, raw, left, up, upLeft);
    }

    sourceOffset += rowBytes;
  }

  return output;
}

function unfilterByte(filter: number, raw: number, left: number, up: number, upLeft: number): number {
  switch (filter) {
    case 0:
      return raw;
    case 1:
      return (raw + left) & 0xff;
    case 2:
      return (raw + up) & 0xff;
    case 3:
      return (raw + Math.floor((left + up) / 2)) & 0xff;
    case 4:
      return (raw + paeth(left, up, upLeft)) & 0xff;
    default:
      throw new Error(`Unsupported PNG filter: ${filter}.`);
  }
}

function paeth(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function summarizeStatus(pairs: DiffMetrics[]): VisualDiffResult["status"] {
  if (pairs.some((pair) => pair.status === "failed")) return "failed";
  if (pairs.some((pair) => pair.status === "passed_with_notes")) return "passed_with_notes";
  return "passed";
}

function renderDiffMarkdown(result: VisualDiffResult): string {
  return [
    "# Visual Diff Summary",
    "",
    `Status: ${result.status}`,
    `Generated: ${result.generatedAt}`,
    `Threshold: ${result.threshold}`,
    `Max mismatch ratio: ${result.maxMismatchRatio}`,
    "",
    "| Pair | Reference size | Local size | Compared size | Mismatch ratio | Mean delta | Max delta | Dimension delta | Status |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---|",
    ...result.pairs.map(
      (pair) =>
        `| ${pair.label} | ${pair.referenceSize} | ${pair.localSize} | ${pair.comparedSize} | ${formatRatio(
          pair.mismatchRatio,
        )} | ${pair.meanDelta.toFixed(2)} | ${pair.maxDelta.toFixed(2)} | ${pair.dimensionDelta.width}x${
          pair.dimensionDelta.height
        } | ${pair.status} |`,
    ),
    "",
  ].join("\n");
}

function formatRatio(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function parseArgs(args: string[]): {
  referenceDir: string;
  localDir: string;
  outputDir: string;
  threshold?: number;
  maxMismatchRatio?: number;
} {
  const [referenceDir, localDir, outputDir = referenceDir] = args.filter((arg) => !arg.startsWith("--"));
  const threshold = readNumberFlag(args, "--threshold");
  const maxMismatchRatio = readNumberFlag(args, "--max-mismatch-ratio");

  if (!referenceDir || !localDir) {
    throw new Error(
      "Usage: yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir] [--threshold 24] [--max-mismatch-ratio 0.18]",
    );
  }

  return { referenceDir, localDir, outputDir, threshold, maxMismatchRatio };
}

function readNumberFlag(args: string[], flag: string): number | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = Number(args[index + 1]);
  return Number.isFinite(value) ? value : undefined;
}

function screenshotPairs(referenceDir: string, localDir: string): DiffPair[] {
  return [
    {
      label: "desktop",
      reference: join(referenceDir, "reference-desktop-full.png"),
      local: join(localDir, "local-desktop-after.png"),
    },
    {
      label: "mobile",
      reference: join(referenceDir, "reference-mobile-full.png"),
      local: join(localDir, "local-mobile-after.png"),
    },
  ];
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const result = await runVisualDiff({
    pairs: screenshotPairs(resolve(args.referenceDir), resolve(args.localDir)),
    outputDir: resolve(args.outputDir),
    threshold: args.threshold,
    maxMismatchRatio: args.maxMismatchRatio,
  });
  console.log(`Visual diff ${result.status}: ${join(resolve(args.outputDir), "visual-diff-summary.md")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

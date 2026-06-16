import { execFileSync } from "node:child_process";

const args = new Set(process.argv.slice(2));

const allow = {
  outputs: args.has("--allow-outputs") || args.has("--allow-all"),
  siteportfolioRuns: args.has("--allow-siteportfolio-runs") || args.has("--allow-all"),
  lazyweb: args.has("--allow-lazyweb") || args.has("--allow-all"),
  logs: args.has("--allow-logs") || args.has("--allow-all"),
  buildArtifacts: args.has("--allow-build-artifacts") || args.has("--allow-all"),
  media: args.has("--allow-media") || args.has("--allow-all"),
};

const help = args.has("--help") || args.has("-h");

if (help) {
  console.log(`Usage: node tooling/scripts/check-staged-scope.mjs [options]

Checks staged Git files before a selective commit.

Default blocked staged paths:
  outputs/**
  siteportfolio/runs/**
  .lazyweb/**
  reports/logs/**
  test-results/**
  dist/**
  media/evidence files: .png .jpg .jpeg .webp .gif .mp4 .webm .mov .pdf

Options:
  --allow-outputs
  --allow-siteportfolio-runs
  --allow-lazyweb
  --allow-logs
  --allow-build-artifacts
  --allow-media
  --allow-all
`);
  process.exit(0);
}

function getStagedFiles() {
  try {
    const output = execFileSync("git", ["diff", "--cached", "--name-only", "-z"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return output
      .split("\0")
      .map((file) => file.trim())
      .filter(Boolean)
      .map((file) => file.replace(/\\/g, "/"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Не удалось прочитать staged files: ${message}`);
    process.exit(2);
  }
}

const blockedMediaExtensions = /\.(png|jpe?g|webp|gif|mp4|webm|mov|pdf)$/i;

function classifyBlocked(file) {
  if (!allow.outputs && file.startsWith("outputs/")) {
    return "outputs/** запрещены для selective commit без явного разрешения";
  }
  if (!allow.siteportfolioRuns && file.startsWith("siteportfolio/runs/")) {
    return "siteportfolio/runs/** является продуктовым ledger/evidence и не коммитится по умолчанию";
  }
  if (!allow.lazyweb && file.startsWith(".lazyweb/")) {
    return ".lazyweb/** не коммитится по умолчанию";
  }
  if (!allow.logs && file.startsWith("reports/logs/")) {
    return "reports/logs/** не коммитится по умолчанию";
  }
  if (!allow.buildArtifacts && (file.startsWith("test-results/") || file.startsWith("dist/"))) {
    return "build/test artifacts не коммитятся по умолчанию";
  }
  if (!allow.media && blockedMediaExtensions.test(file)) {
    return "media/evidence files не коммитятся по умолчанию";
  }
  return undefined;
}

const stagedFiles = getStagedFiles();

if (stagedFiles.length === 0) {
  console.log("Staged files не найдены. Проверять нечего.");
  process.exit(0);
}

const blocked = stagedFiles
  .map((file) => ({ file, reason: classifyBlocked(file) }))
  .filter((entry) => entry.reason);

if (blocked.length > 0) {
  console.error("Selective commit scope check failed.");
  console.error("");
  console.error("В staged попали файлы, которые заблокированы по умолчанию:");
  for (const entry of blocked) {
    console.error(`- ${entry.file}`);
    console.error(`  ${entry.reason}`);
  }
  console.error("");
  console.error("Исправь staged-набор через git restore --staged <path> или повтори проверку с explicit allow flag.");
  process.exit(1);
}

console.log(`Selective commit scope check passed. Staged files: ${stagedFiles.length}`);


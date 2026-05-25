import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const markdownFiles = ["README.md", "AGENTS.md"];
const pathLikePrefixes = [
  ".codex/",
  "agent-pack/",
  "apps/",
  "integrations/",
  "outputs/",
  "runtime/",
  "tests/",
  "tooling/",
];
const rootFiles = new Set([
  ".env.example",
  ".gitignore",
  "AGENTS.md",
  "README.md",
  "components.json",
  "package.json",
  "playwright.config.ts",
  "tsconfig.json",
  "yarn.lock",
]);

const errors = [];

for (const file of markdownFiles) {
  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    errors.push(`Missing documentation file: ${file}`);
    continue;
  }

  const content = readFileSync(filePath, "utf8");
  for (const reference of extractBacktickReferences(content)) {
    if (!shouldCheckReference(reference)) {
      continue;
    }

    const normalized = reference.replaceAll("\\", "/").replace(/\/+$/, "");
    if (!existsSync(join(root, normalized))) {
      errors.push(`${file}: referenced path does not exist: ${reference}`);
    }
  }
}

if (errors.length) {
  console.error("Documentation audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Documentation audit passed.");

function extractBacktickReferences(markdown) {
  const references = [];
  const pattern = /`([^`\n]+)`/g;
  let match;

  while ((match = pattern.exec(markdown))) {
    references.push(match[1].trim());
  }

  return references;
}

function shouldCheckReference(reference) {
  if (!reference || reference.includes("<") || reference.includes(">")) {
    return false;
  }

  if (reference.includes(" ") || reference.includes("*") || reference.includes("|")) {
    return false;
  }

  const normalized = reference.replaceAll("\\", "/").replace(/\/+$/, "");
  return rootFiles.has(normalized) || pathLikePrefixes.some((prefix) => normalized.startsWith(prefix));
}

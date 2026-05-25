import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const [, , pageArg, outputDirArg = "outputs/valorant-points-store/2026-05-24"] = process.argv;

if (!pageArg) {
  console.error("Usage: node tooling/scripts/publish-notion-workflow.mjs <notion-page-url-or-id> [output-dir]");
  process.exit(1);
}

const token = readNotionToken();
const pageId = extractPageId(pageArg);
const outputDir = resolve(process.cwd(), outputDirArg);

if (!existsSync(outputDir)) {
  console.error(`Output directory not found: ${outputDir}`);
  process.exit(1);
}

const artifactOrder = [
  "notion-workflow-export.md",
  "run-plan.md",
  "recursive-brief.md",
  "research-summary.md",
  "competitive-analysis.md",
  "proto-personas.md",
  "synthetic-interviews.md",
  "swot.md",
  "prd.md",
  "ia-brief.md",
  "reference-analysis.md",
  "design-brief.md",
  "copy-deck.md",
  "screens.md",
  "prototype-report.md",
  "frontend-result.md",
  "test-bench-result.md",
  "qa-report.md",
  "release-notes.md",
  "notion-prd-export.md",
];

const children = [
  heading(1, `Workflow Export: ${basename(outputDir)}`),
  paragraph(`Source: ${outputDirArg}`),
  paragraph(`Published from local artifact bundle. Local files remain the source of truth.`),
];

for (const fileName of artifactOrder) {
  const filePath = join(outputDir, fileName);
  if (!existsSync(filePath)) {
    children.push(heading(2, `${fileName} (missing)`));
    continue;
  }

  const content = readFileSync(filePath, "utf8");
  children.push(heading(2, fileName));
  for (const chunk of chunkText(content, 1800)) {
    children.push(codeBlock(chunk, "markdown"));
  }
}

await appendChildren(pageId, children);
console.log(`Published ${children.length} blocks to Notion page ${pageId}.`);

function readNotionToken() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env with NOTION_TOKEN.");
  }

  const match = readFileSync(envPath, "utf8").match(/^NOTION_TOKEN=(.+)$/m);
  if (!match?.[1]?.trim()) {
    throw new Error("NOTION_TOKEN is missing in .env.");
  }

  return match[1].trim();
}

function extractPageId(value) {
  const compact = value.replace(/-/g, "");
  const match = compact.match(/[0-9a-f]{32}/i);
  if (!match) {
    throw new Error(`Cannot extract Notion page id from: ${value}`);
  }
  return match[0];
}

function heading(level, text) {
  const type = `heading_${level}`;
  return {
    object: "block",
    type,
    [type]: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
    },
  };
}

function paragraph(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
    },
  };
}

function codeBlock(text, language) {
  return {
    object: "block",
    type: "code",
    code: {
      language,
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

function chunkText(text, size) {
  const chunks = [];
  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }
  return chunks.length ? chunks : [""];
}

async function appendChildren(blockId, blocks) {
  for (let index = 0; index < blocks.length; index += 80) {
    const batch = blocks.slice(index, index + 80);
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ children: batch }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Notion append failed (${response.status}): ${body}`);
    }
  }
}

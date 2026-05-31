import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , pageArg, outputDirArg = "outputs/valorant-points-store/2026-05-24"] = process.argv;

if (!pageArg) {
  console.error("Usage: node tooling/scripts/publish-notion-research.mjs <notion-page-url-or-id> [output-dir]");
  process.exit(1);
}

const token = readNotionToken();
const parentPageId = extractPageId(pageArg);
const outputDir = resolve(process.cwd(), outputDirArg);
const pageTitle = `Research Review Pack: VK Cloud Servers Light Landing`;
const pageId = await createChildPage(parentPageId, pageTitle);

if (!existsSync(outputDir)) {
  console.error(`Output directory not found: ${outputDir}`);
  process.exit(1);
}

const researchArtifacts = [
  ["Резюме исследований", "research-summary.md"],
  ["Конкурентный анализ", "competitive-analysis.md"],
  ["Прото-персоны", "proto-personas.md"],
  ["Синтетические интервью", "synthetic-interviews.md"],
  ["SWOT-анализ", "swot.md"],
  ["Анализ референса", "reference-analysis.md"],
];

const children = [
  heading(1, "Пакет обзора исследований: VK Cloud Servers (Светлый B2B-лендинг)"),
  paragraph("Только человекочитаемые артефакты исследований. Локальные файлы Markdown остаются первоисточником истины."),
  paragraph("Синтетические интервью в этом пакете предназначены исключительно для генерации гипотез и не являются свидетельством реального поведения пользователей."),
];

for (const [title, fileName] of researchArtifacts) {
  const filePath = join(outputDir, fileName);
  children.push(heading(2, title));

  if (!existsSync(filePath)) {
    children.push(callout(`Отсутствующий артефакт: ${fileName}`));
    continue;
  }

  const markdown = stripFrontmatter(readFileSync(filePath, "utf8"));
  children.push(...markdownToBlocks(markdown));
}

await appendChildren(pageId, children);
console.log(`Published ${children.length} human-readable research blocks to Notion page ${pageId}.`);

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

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function markdownToBlocks(markdown) {
  const blocks = [];
  const lines = markdown.split(/\r?\n/);
  let paragraphBuffer = [];
  let tableBuffer = [];
  let listBuffer = [];

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];
    if (text) {
      blocks.push(...paragraphChunks(text));
    }
  };

  const flushList = () => {
    for (const item of listBuffer) {
      blocks.push(bulletedListItem(item));
    }
    listBuffer = [];
  };

  const flushTable = () => {
    if (!tableBuffer.length) {
      return;
    }

    const rows = tableBuffer
      .filter((line) => !/^\|\s*-+/.test(line))
      .map((line) => line.split("|").slice(1, -1).map((cell) => cleanInline(cell.trim())));

    tableBuffer = [];
    if (rows.length < 1) {
      return;
    }

    const width = Math.max(...rows.map((row) => row.length));
    blocks.push({
      object: "block",
      type: "table",
      table: {
        table_width: width,
        has_column_header: rows.length > 1,
        has_row_header: false,
        children: rows.map((row) => ({
          object: "block",
          type: "table_row",
          table_row: {
            cells: Array.from({ length: width }, (_, index) => [
              { type: "text", text: { content: (row[index] ?? "").slice(0, 1900) } },
            ]),
          },
        })),
      },
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushParagraph();
      flushList();
      tableBuffer.push(trimmed);
      continue;
    }

    flushTable();

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(heading(3, cleanInline(trimmed.slice(4))));
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(heading(3, cleanInline(trimmed.slice(3))));
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listBuffer.push(cleanInline(trimmed.replace(/^[-*]\s+/, "")));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      listBuffer.push(cleanInline(trimmed.replace(/^\d+\.\s+/, "")));
      continue;
    }

    paragraphBuffer.push(cleanInline(trimmed));
  }

  flushParagraph();
  flushList();
  flushTable();

  return blocks;
}

function cleanInline(text) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
}

function paragraphChunks(text) {
  return chunkText(text, 1900).map(paragraph);
}

function heading(level, text) {
  const safeLevel = Math.min(Math.max(level, 1), 3);
  const type = `heading_${safeLevel}`;
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

function bulletedListItem(text) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
    },
  };
}

function callout(text) {
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
      icon: { type: "emoji", emoji: "⚠️" },
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
    const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ children: blocks.slice(index, index + 80) }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Notion append failed (${response.status}): ${body}`);
    }
  }
}

async function createChildPage(parentPageId, title) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title } }],
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion page creation failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return json.id;
}

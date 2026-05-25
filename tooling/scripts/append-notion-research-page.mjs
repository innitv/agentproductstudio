import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , pageArg, exportPathArg] = process.argv;

if (!pageArg || !exportPathArg) {
  console.error("Usage: node tooling/scripts/append-notion-research-page.mjs <page-url-or-id> <research-export-md>");
  process.exit(1);
}

const token = readNotionToken();
const pageId = extractPageId(pageArg);
const exportPath = resolve(process.cwd(), exportPathArg);

if (!existsSync(exportPath)) {
  console.error(`Research export not found: ${exportPath}`);
  process.exit(1);
}

const markdown = readFileSync(exportPath, "utf8");
const blocks = markdownToBlocks(markdown);
await appendChildren(pageId, blocks);

console.log(`Appended research update to Notion page ${pageId}.`);
console.log(`Published ${blocks.length} human-readable Russian blocks.`);

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
      blocks.push(...chunkText(cleanInline(text), 1900).map(paragraph));
    }
  };

  const flushList = () => {
    for (const item of listBuffer) {
      blocks.push(bulletedListItem(cleanInline(item)));
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
    if (!rows.length) {
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

  blocks.push(heading(2, `Обновление research — ${new Date().toISOString().slice(0, 10)}`));

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

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push(heading(1, trimmed.slice(2)));
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(heading(2, trimmed.slice(3)));
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(heading(3, trimmed.slice(4)));
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushTable();
  return blocks;
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };
}

function heading(level, text) {
  const type = `heading_${level}`;
  return {
    object: "block",
    type,
    [type]: {
      rich_text: [{ type: "text", text: { content: cleanInline(text).slice(0, 1900) } }],
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

function cleanInline(text) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
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
      headers: notionHeaders(),
      body: JSON.stringify({ children: blocks.slice(index, index + 80) }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Notion append failed (${response.status}): ${body}`);
    }
  }
}

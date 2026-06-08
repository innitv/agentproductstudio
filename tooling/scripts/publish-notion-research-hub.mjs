import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipPublicationShapeGate = args.includes("--skip-publication-shape-gate");
const positional = args.filter((arg) => arg !== "--dry-run" && arg !== "--skip-publication-shape-gate");
const [parentArg, exportPathArg, titleArg] = positional;

if (!parentArg || !exportPathArg) {
  console.error("Usage: node tooling/scripts/publish-notion-research-hub.mjs <parent-page-url-or-id> <research-export-md> [hub-title]");
  process.exit(1);
}

const token = readNotionToken();
const parentPageId = extractPageId(parentArg);
const exportPath = resolve(process.cwd(), exportPathArg);

if (!existsSync(exportPath)) {
  console.error(`Research export not found: ${exportPath}`);
  process.exit(1);
}

const markdown = readFileSync(exportPath, "utf8");
const parsed = splitResearchMarkdown(markdown);
const publishUnits = groupResearchSections(parsed.sections);
const hubTitle = titleArg?.trim() || parsed.title || "Пакет исследования";
const shapeGate = validatePublicationShape(parsed.sections);
const completenessGate = validatePublicationCompleteness(exportPath, markdown, parsed.sections);

if (!skipPublicationShapeGate && !shapeGate.pass) {
  console.error(formatPublicationShapeGate(shapeGate));
  process.exit(1);
}

if (!completenessGate.pass) {
  console.error(formatPublicationCompletenessGate(completenessGate));
  process.exit(1);
}

if (dryRun) {
  const plan = publishUnits.map((unit) => ({
    title: unit.title,
    source_sections: unit.sourceSections,
    estimated_blocks: countBlocksDeep(markdownToBlocks(unit.markdown, { sectionToggles: true })),
    top_level_blocks: markdownToBlocks(unit.markdown, { sectionToggles: true }).length,
    toggle_count: countBlocksByType(markdownToBlocks(unit.markdown, { sectionToggles: true }), "toggle"),
  }));
  console.log(JSON.stringify({
    mode: "dry_run",
    layout_strategy: "hub_with_grouped_child_pages_and_selective_toggles",
    hub_title: hubTitle,
    parent_page_id: parentPageId,
    child_pages: plan,
    child_page_count: plan.length,
    estimated_total_blocks: plan.reduce((sum, item) => sum + item.estimated_blocks, 0),
    publication_shape_gate: shapeGate,
    publication_completeness_gate: completenessGate,
  }, null, 2));
  process.exit(0);
}

const hubId = await createChildPage(parentPageId, hubTitle);

const childResults = [];
for (const unit of publishUnits) {
  const pageId = await createChildPage(hubId, unit.title);
  const blocks = markdownToBlocks(unit.markdown, { sectionToggles: true });
  await appendChildren(pageId, blocks);
  childResults.push({
    title: unit.title,
    page_id: pageId,
    blocks: countBlocksDeep(blocks),
    top_level_blocks: blocks.length,
    toggles: countBlocksByType(blocks, "toggle"),
    source_sections: unit.sourceSections,
  });
}

const hubBlocks = buildHubBlocks(parsed, childResults);
await appendChildren(hubId, hubBlocks);

console.log(`Created Notion research hub ${hubId} under parent ${parentPageId}.`);
console.log(`Created ${childResults.length} child pages.`);
console.log(`Published ${childResults.reduce((sum, item) => sum + item.blocks, 0) + hubBlocks.length} human-readable Russian blocks across hub and child pages.`);
console.log(JSON.stringify({ hub_id: hubId, child_pages: childResults }, null, 2));

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

function splitResearchMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine?.replace(/^#\s+/, "").trim();
  const lead = [];
  const sections = [];
  let current = null;
  let pendingMarkers = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      continue;
    }

    const marker = readSectionMarker(line);
    if (marker) {
      if (current) {
        current.markers.push(marker);
        current.markdown += `${line}\n`;
      } else {
        pendingMarkers.push(marker);
      }
      continue;
    }

    if (line.startsWith("## ")) {
      if (current) {
        sections.push(current);
      }
      const sectionTitle = line.replace(/^##\s+/, "").trim();
      current = { title: sectionTitle, markdown: `# ${sectionTitle}\n\n`, markers: pendingMarkers };
      pendingMarkers = [];
      continue;
    }

    if (current) {
      current.markdown += `${line}\n`;
    } else if (line.trim()) {
      lead.push(line);
    }
  }

  if (current) {
    sections.push(current);
  }

  return {
    title,
    lead: lead.join("\n").trim(),
    sections: sections.filter((section) => section.markdown.trim().length > section.title.length + 2),
  };
}

function readSectionMarker(line) {
  const match = line.match(/^<!--\s*notion-section:\s*([a-z0-9_-]+)\s*-->\s*$/i);
  return match?.[1]?.toLowerCase();
}

function groupResearchSections(sections) {
  const groups = [
    {
      title: "00 Обзор, выводы и рамка исследования",
      markers: ["overview"],
      match: /^(Статус документа|Краткий вывод|Исследовательские вопросы|Аудитория документа|Пользовательские задачи|Выводы, подтвержденные источниками|Сводка возможностей по сценариям)$/i,
    },
    {
      title: "02 Конкуренты, активы A3 и стратегия",
      markers: ["competitors"],
      match: /^(Конкурентный контекст|Набор конкурентов|Матрица позиционирования|Активы A3|Незакрытые конкурентами разрывы|Стратегическая рекомендация)$/i,
    },
    {
      title: "03 Прото-персоны",
      markers: ["personas"],
      match: /^(Прото-персоны|Матрица приоритета персон|Персона \d+:.*)$/i,
    },
    {
      title: "04 Синтетические интервью и вопросы для интервью",
      markers: ["interviews"],
      match: /^(Ограничение по synthetic interviews|Ограничение по синтетическим интервью|Синтетическое интервью \d+:.*|Вопросы для реальных интервью)$/i,
    },
    {
      title: "05 CJM и сценарии",
      markers: ["cjm"],
      match: /^(Общая модель CJM|Матрица сценариев CJM|P\d CJM:.*|Сценарий \d+:.*)$/i,
    },
    {
      title: "06 ICE/RICE бэклог и инициативы",
      markers: ["scoring"],
      match: /^(ICE\/RICE backlog|ICE\/RICE бэклог|Детализация backlog|Детализация бэклога|P\d:.*)$/i,
    },
    {
      title: "07 Roadmap и SWOT",
      markers: ["roadmap", "swot"],
      match: /^(Roadmap.*|SWOT|Сильные стороны|Слабые стороны|Возможности|Риски|Стратегическая позиция)$/i,
    },
    {
      title: "08 План валидации, провайдеры и источники",
      markers: ["validation", "sources"],
      match: /^(План валидации исследования|Пользовательские интервью|Партнерские интервью|Количественная валидация|Гипотезы для проверки|Покрытие источников и провайдеров|Выводы DeepSeek\/Gemini cross-check|Источники)$/i,
    },
  ];

  const unitsByTitle = new Map(groups.map((group) => [
    group.title,
    { title: group.title, markdown: `# ${group.title}\n\n`, sourceSections: [] },
  ]));
  const other = { title: "09 Дополнительные материалы", markdown: "# 09 Дополнительные материалы\n\n", sourceSections: [] };

  for (const section of sections) {
    const group = groups.find((item) => sectionMatchesGroup(section, item));
    const unit = group ? unitsByTitle.get(group.title) : other;
    unit.markdown += demoteSectionMarkdown(section.markdown);
    unit.markdown += "\n";
    unit.sourceSections.push(section.title);
  }

  const ordered = groups
    .map((group) => unitsByTitle.get(group.title))
    .filter((unit) => unit.sourceSections.length > 0);

  if (other.sourceSections.length > 0) {
    ordered.push(other);
  }

  return ordered;
}

function sectionMatchesGroup(section, group) {
  return hasAnySectionMarker(section, group.markers ?? []) || group.match.test(section.title);
}

function hasAnySectionMarker(section, markers) {
  return (section.markers ?? []).some((marker) => markers.includes(marker));
}

function demoteSectionMarkdown(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !readSectionMarker(line))
    .map((line) => line.startsWith("# ") ? `## ${line.slice(2)}` : line)
    .join("\n");
}

function validatePublicationShape(sections) {
  const rules = [
    {
      id: "personas_table",
      label: "Прото-персоны должны быть сравнительной таблицей",
      markers: ["personas"],
      sectionMatch: /^(Прото-персоны|Персона \d+:.*)$/i,
      requiredHeaders: ["персона", "jtbd", "боль"],
      hint: "Добавь таблицу с колонками: Персона / Сегмент / Контекст / JTBD / Боль / Ценность / Evidence status.",
    },
    {
      id: "cjm_table",
      label: "CJM должен быть таблицей или схемой",
      markers: ["cjm"],
      sectionMatch: /^(CJM и сценарии|Общая модель CJM|Матрица сценариев CJM|P\d CJM:.*|Сценарий \d+:.*)$/i,
      requiredHeaders: ["этап", "бол"],
      hint: "Добавь таблицу с колонками: Этап / Цель / Действия / Участники / Боли / Возможность.",
    },
    {
      id: "competitors_table",
      label: "Конкурентный контекст должен содержать таблицу",
      markers: ["competitors"],
      sectionMatch: /^(Конкурентный контекст|Набор конкурентов|Матрица позиционирования)$/i,
      requiredHeaders: ["игрок"],
      hint: "Добавь таблицу конкурентов или позиционирования.",
    },
    {
      id: "scoring_table",
      label: "ICE/RICE должен содержать таблицу scoring",
      markers: ["scoring"],
      sectionMatch: /^(ICE\/RICE backlog|ICE\/RICE бэклог|Детализация backlog|Детализация бэклога)$/i,
      requiredHeaders: ["сценарий"],
      hint: "Добавь таблицу ICE/RICE с колонками scoring.",
    },
  ];

  const checks = rules.map((rule) => {
    const matchedSections = sections.filter((section) =>
      hasAnySectionMarker(section, rule.markers ?? []) || rule.sectionMatch.test(section.title)
    );
    const tableSummaries = matchedSections.flatMap((section) => extractMarkdownTables(section.markdown).map((table) => ({
      section: section.title,
      headers: table.headers,
      row_count: table.rowCount,
      matches_required_headers: rule.requiredHeaders.every((required) =>
        table.headers.some((header) => header.toLowerCase().includes(required)),
      ),
    })));
    const hasMatchingTable = tableSummaries.some((table) => table.row_count > 0 && table.matches_required_headers);

    return {
      id: rule.id,
      label: rule.label,
      status: hasMatchingTable ? "pass" : "fail",
      matched_sections: matchedSections.map((section) => section.title),
      tables: tableSummaries,
      hint: rule.hint,
    };
  });

  return {
    pass: checks.every((check) => check.status === "pass"),
    checks,
  };
}

function extractMarkdownTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tables = [];
  let tableLines = [];

  const flush = () => {
    if (tableLines.length >= 2) {
      const rows = tableLines
        .filter((line) => !/^\|\s*:?-+/.test(line))
        .map((line) => line.split("|").slice(1, -1).map((cell) => cleanInline(cell.trim())));
      if (rows.length) {
        tables.push({
          headers: rows[0] ?? [],
          rowCount: Math.max(0, rows.length - 1),
        });
      }
    }
    tableLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      tableLines.push(line.trim());
    } else {
      flush();
    }
  }
  flush();

  return tables;
}

function formatPublicationShapeGate(shapeGate) {
  const lines = [
    "Notion publication shape gate failed.",
    "",
    "Research export contains critical analytical sections that would be published as prose instead of tables/schemes.",
    "Fix `notion-research-export-ru.md` before publication, or use --skip-publication-shape-gate only for legacy/archive exports.",
    "",
    "| Check | Status | Matched sections | Hint |",
    "|---|---|---|---|",
  ];

  for (const check of shapeGate.checks) {
    lines.push(`| ${check.label} | ${check.status} | ${check.matched_sections.join(", ") || "none"} | ${check.hint} |`);
  }

  return lines.join("\n");
}

function validatePublicationCompleteness(exportPath, markdown, sections) {
  const runDir = dirname(exportPath);
  const sourceFiles = [
    "research-summary.md",
    "competitive-analysis.md",
    "proto-personas.md",
    "synthetic-interviews.md",
    "swot.md",
    "cjm-map.md",
    "opportunity-roadmap.md",
  ]
    .map((file) => {
      const path = join(runDir, file);
      if (!existsSync(path)) {
        return undefined;
      }

      const content = readFileSync(path, "utf8");
      return { file, bytes: Buffer.byteLength(content, "utf8") };
    })
    .filter(Boolean);

  const coreSourceFiles = sourceFiles.filter((item) => [
    "research-summary.md",
    "competitive-analysis.md",
    "proto-personas.md",
    "synthetic-interviews.md",
    "swot.md",
  ].includes(item.file));

  if (coreSourceFiles.length < 3) {
    return {
      pass: true,
      status: "not_applicable",
      reason: "Run directory does not contain enough source research artifacts to compare completeness.",
      export_bytes: Buffer.byteLength(markdown, "utf8"),
      source_bytes: sourceFiles.reduce((sum, item) => sum + item.bytes, 0),
      source_files: sourceFiles,
      checks: [],
    };
  }

  const exportBytes = Buffer.byteLength(markdown, "utf8");
  const sourceBytes = sourceFiles.reduce((sum, item) => sum + item.bytes, 0);
  const exportToSourceRatio = sourceBytes > 0 ? exportBytes / sourceBytes : 1;
  const sectionTitles = sections.map((section) => section.title);
  const checks = [
    {
      id: "source_coverage_ratio",
      label: "Export should not be a short digest when full research artifacts exist",
      status: exportToSourceRatio >= 0.3 ? "pass" : "fail",
      value: Number(exportToSourceRatio.toFixed(3)),
      required: ">= 0.3",
      hint: "Regenerate notion-research-export-ru.md from the full research pack, not only from a summary.",
    },
    {
      id: "minimum_export_size",
      label: "Detailed research export should have enough substance for a hub publication",
      status: exportBytes >= 20000 ? "pass" : "fail",
      value: exportBytes,
      required: ">= 20000 bytes",
      hint: "A hub publication below this size is likely a brief summary rather than a full research pack.",
    },
    {
      id: "section_coverage",
      label: "Export should cover core research areas",
      status: hasCoreResearchSections(sectionTitles, sections) ? "pass" : "fail",
      value: sectionTitles,
      required: "personas, CJM/scenarios, competitors, ICE/RICE/backlog, roadmap/SWOT or validation/sources",
      hint: "Include the full sections from research-summary, competitive analysis, personas, interviews, SWOT, CJM and roadmap artifacts.",
    },
  ];

  return {
    pass: checks.every((check) => check.status === "pass"),
    status: checks.every((check) => check.status === "pass") ? "pass" : "fail",
    export_bytes: exportBytes,
    source_bytes: sourceBytes,
    export_to_source_ratio: Number(exportToSourceRatio.toFixed(3)),
    source_files: sourceFiles,
    section_titles: sectionTitles,
    checks,
  };
}

function hasCoreResearchSections(sectionTitles, sections = []) {
  const joined = sectionTitles.join("\n");
  const markers = new Set(sections.flatMap((section) => section.markers ?? []));
  if (["personas", "cjm", "competitors", "scoring"].every((marker) => markers.has(marker))
    && (markers.has("roadmap") || markers.has("swot") || markers.has("sources") || markers.has("validation"))) {
    return true;
  }

  const requiredPatterns = [
    /Прото-персоны|Персона\s+\d+|Proto personas/i,
    /CJM|Сценарий\s+\d+|Матрица сценариев/i,
    /Конкурент|Матрица позиционирования|Competitor/i,
    /ICE\/RICE|backlog|бэклог|Приоритетные возможности/i,
    /Roadmap|Дорожная карта|SWOT|Источники|валидац/i,
  ];

  return requiredPatterns.every((pattern) => pattern.test(joined));
}

function formatPublicationCompletenessGate(completenessGate) {
  const lines = [
    "Notion publication completeness gate failed.",
    "",
    "Research export looks too small or too shallow compared with the source research artifacts in the same run directory.",
    "Fix `notion-research-export-ru.md` by regenerating it from the full research pack before publication.",
    "",
    `Export bytes: ${completenessGate.export_bytes}`,
    `Source bytes: ${completenessGate.source_bytes}`,
    `Export/source ratio: ${completenessGate.export_to_source_ratio ?? "n/a"}`,
    "",
    "| Check | Status | Value | Required | Hint |",
    "|---|---|---|---|---|",
  ];

  for (const check of completenessGate.checks) {
    lines.push(`| ${check.label} | ${check.status} | ${formatCompletenessValue(check.value)} | ${check.required} | ${check.hint} |`);
  }

  return lines.join("\n");
}

function formatCompletenessValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ").replace(/\|/g, "\\|");
  }

  return String(value).replace(/\|/g, "\\|");
}

function buildHubBlocks(parsed, childResults) {
  const blocks = [];
  blocks.push(heading(1, parsed.title || "Пакет исследования"));
  blocks.push(callout("Это hub-страница исследования. Подробные материалы сгруппированы в дочерние страницы по смысловым разделам, чтобы Notion не превращался в одно длинное полотно и не дробился на микространицы."));

  if (parsed.lead) {
    blocks.push(...markdownToBlocks(parsed.lead));
  }

  blocks.push(heading(2, "Навигация по разделам"));
  for (const child of childResults) {
    blocks.push(bulletedListItem(`${child.title} — ${child.blocks} blocks; разделы: ${child.source_sections.join(", ")}`));
  }

  blocks.push(heading(2, "Publication evidence"));
  blocks.push(paragraph(`Создано дочерних страниц: ${childResults.length}.`));
  blocks.push(paragraph(`Стратегия: hub page + grouped child pages + selective toggle/drawer sections, без микространиц и без лишнего сворачивания коротких блоков.`));
  return blocks;
}

async function createChildPage(parentPageId, title) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title.slice(0, 1900) } }],
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

function markdownToBlocks(markdown, options = {}) {
  if (options.sectionToggles) {
    return markdownToBlocksWithSectionToggles(markdown);
  }

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

function markdownToBlocksWithSectionToggles(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let currentToggle = null;
  let currentLines = [];

  const flushToggle = () => {
    if (!currentToggle) {
      return;
    }

    const children = markdownToBlocks(currentLines.join("\n")).filter((block) => block.type !== "paragraph" || block.paragraph.rich_text.length);
    if (shouldUseToggle(currentToggle, children)) {
      blocks.push(toggleBlock(currentToggle, children));
    } else {
      blocks.push(heading(2, currentToggle));
      blocks.push(...children);
    }
    currentToggle = null;
    currentLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushToggle();
      blocks.push(heading(1, line.replace(/^#\s+/, "").trim()));
      continue;
    }

    if (line.startsWith("## ")) {
      flushToggle();
      currentToggle = line.replace(/^##\s+/, "").trim();
      continue;
    }

    if (currentToggle) {
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  flushToggle();

  const tailBlocks = markdownToBlocks(currentLines.join("\n"));
  blocks.push(...tailBlocks);
  return blocks;
}

function shouldUseToggle(title, children) {
  const deepCount = countBlocksDeep(children);
  const hasLargeTable = children.some((block) => block.type === "table" && (block.table.children?.length ?? 0) > 8);
  const isDetailedInitiative = /^P\d:/.test(title);
  const isLongReferenceList = /^(Источники|Покрытие источников|Гипотезы для проверки)$/i.test(title);

  if (isDetailedInitiative || isLongReferenceList) {
    return true;
  }

  if (hasLargeTable) {
    return false;
  }

  return deepCount > 15;
}

function countBlocksDeep(blocks) {
  return blocks.reduce((sum, block) => {
    const payload = block[block.type] ?? {};
    const children = Array.isArray(payload.children) ? payload.children : [];
    return sum + 1 + countBlocksDeep(children);
  }, 0);
}

function countBlocksByType(blocks, type) {
  return blocks.reduce((sum, block) => {
    const payload = block[block.type] ?? {};
    const children = Array.isArray(payload.children) ? payload.children : [];
    return sum + (block.type === type ? 1 : 0) + countBlocksByType(children, type);
  }, 0);
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

function toggleBlock(text, children) {
  return {
    object: "block",
    type: "toggle",
    toggle: {
      rich_text: [{ type: "text", text: { content: cleanInline(text).slice(0, 1900) } }],
      children: children.length ? children : [paragraph("Нет дополнительного описания.")],
    },
  };
}

function callout(text) {
  return {
    object: "block",
    type: "callout",
    callout: {
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

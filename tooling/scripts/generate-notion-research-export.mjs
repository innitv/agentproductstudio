import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [runDirArg, outputArg] = process.argv.slice(2);

if (!runDirArg) {
  console.error("Usage: node tooling/scripts/generate-notion-research-export.mjs <run-dir> [output-md]");
  process.exit(1);
}

const runDir = resolve(process.cwd(), runDirArg);
const outputPath = resolve(process.cwd(), outputArg || join(runDir, "notion-research-export-ru.md"));
const runMeta = readJsonIfExists(join(runDir, "run-meta.json"));

const sourceFileSlots = [
  { required: true, files: ["research-summary.md"] },
  { required: false, files: ["scenario-matrix.md", "payment-method-matrix.md"] },
  { required: true, files: ["scenario-user-flows.md", "payment-user-flows.md"] },
  { required: true, files: ["competitive-analysis.md"] },
  { required: false, files: ["cjm-map.md"] },
  { required: false, files: ["opportunity-roadmap.md"] },
  { required: true, files: ["proto-personas.md"] },
  { required: true, files: ["synthetic-interviews.md"] },
  { required: true, files: ["swot.md"] },
  { required: false, files: ["source-log.md"] },
];
const requiredFiles = resolveSourceFiles(runDir, sourceFileSlots);
const missing = sourceFileSlots
  .filter((slot) => slot.required && !slot.files.some((file) => existsSync(join(runDir, file))))
  .map((slot) => slot.files.join(" or "));
if (missing.length > 0) {
  console.error(`Missing source research artifacts: ${missing.join(", ")}`);
  process.exit(1);
}

// Publication Editor Pass: keep public Notion export curated; internal ledger/debug
// sections stay in local publication records, not in the public hub.
const sections = requiredFiles.map((file) => ({
  file,
  markdown: normalizeMarkdown(readFileSync(join(runDir, file), "utf8"), file),
}));

const exportMarkdown = [
  `# ${inferExportTitle(runMeta)}`,
  "",
  ...buildCrossLinkControlSections(),
  "",
  ...sections.flatMap((section) => [
    `## ${titleForFile(section.file)}`,
    markerForFile(section.file),
    "",
    ...demoteMarkdown(section.markdown).split(/\r?\n/),
    "",
  ]),
].join("\n");

writeFileSync(outputPath, `${exportMarkdown.trim()}\n`, "utf8");
console.log(JSON.stringify({
  output: outputPath,
  bytes: Buffer.byteLength(exportMarkdown, "utf8"),
  source_files: requiredFiles,
}, null, 2));

function normalizeMarkdown(markdown, file) {
  const normalized = markdown
    .replace(/\r\n/g, "\n")
    .replace(/^#\s+.+\n+/, "")
    .trim();

  return removeEmptyHeadings(removeNotionInternalSections(normalized, file));
}

function removeNotionInternalSections(markdown, file) {
  const internalHeadings = new Set([
    "Artifact Metadata",
    "Метаданные артефакта",
    "Inputs Used",
    "Использованные входные материалы",
    "Использованные входные артефакты",
    "Surface Output Contract",
    "Decision Input Audit",
    "Source Policy",
    "Политика источников",
    "Provider Coverage",
    "Publication Shape Gate",
    "Проверка формы публикации",
    "Publication Cross-Link Gate",
    "Research Content Lint",
    "Notion Data Shape Plan",
    "Readiness Checklist",
    "Candidate Quality / Write Gate",
  ]);
  const fileSpecificInternalHeadings = new Map([
    ["research-summary.md", new Set([
      "Карта связей исследования",
      "Цепочка решений",
      "Прото-персоны",
      "Синтетические интервью",
      "Источники",
    ])],
  ]);
  const fileSpecific = fileSpecificInternalHeadings.get(file) || new Set();

  const lines = markdown.split("\n");
  const result = [];
  let skippingLevel = null;

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);

    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();

      if (skippingLevel !== null && level <= skippingLevel) {
        skippingLevel = null;
      }

      if (skippingLevel === null && (internalHeadings.has(title) || fileSpecific.has(title))) {
        skippingLevel = level;
        continue;
      }
    }

    if (skippingLevel === null) {
      result.push(line);
    }
  }

  return result.join("\n").trim();
}

function removeEmptyHeadings(markdown) {
  const lines = markdown.split("\n");
  const result = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^(#{1,6})\s+\S/);

    if (heading && isHeadingEmptyBeforeNextPeer(lines, index, heading[1].length)) {
      continue;
    }

    result.push(line);
  }

  return result.join("\n").trim();
}

function isHeadingEmptyBeforeNextPeer(lines, headingIndex, level) {
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (!trimmed) {
      continue;
    }

    const nextHeading = trimmed.match(/^(#{1,6})\s+\S/);
    return Boolean(nextHeading && nextHeading[1].length <= level);
  }

  return false;
}

function demoteMarkdown(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("#### ")) {
        return `###### ${humanHeading(line.slice(5))}`;
      }
      if (line.startsWith("### ")) {
        return `##### ${humanHeading(line.slice(4))}`;
      }
      if (line.startsWith("## ")) {
        return `#### ${humanHeading(line.slice(3))}`;
      }
      if (line.startsWith("# ")) {
        return `### ${humanHeading(line.slice(2))}`;
      }
      return line;
    })
    .join("\n");
}

function humanHeading(title) {
  const normalized = title.trim();
  return {
    "Artifact Metadata": "Метаданные артефакта",
    "Inputs Used": "Использованные входные материалы",
    "Source Policy": "Политика источников",
    "Research Questions": "Исследовательские вопросы",
    "Audience": "Аудитория исследования",
    "Jobs To Be Done": "Пользовательские задачи",
    "Proto Personas": "Прото-персоны",
    "Synthetic Interviews": "Синтетические интервью",
    "Research Validation Plan": "План валидации исследования",
    "Executive Summary": "Ключевые выводы",
    "Market Facts": "Рыночные факты",
    "Payment Ecosystem Map": "Карта платежной экосистемы",
    "Opportunity Scoring": "Оценка возможностей",
    "Strategic Recommendation": "Стратегическая рекомендация",
    "Competitors and Alternatives": "Конкуренты и альтернативы",
    "Findings": "Наблюдения",
    "Claims To Validate": "Гипотезы для проверки",
    "Sources": "Источники",
    "Publication Shape Gate": "Проверка формы публикации",
    "Unknowns": "Неизвестные и открытые зоны",
    "Opportunity Backlog": "Бэклог возможностей",
    "ICE Matrix": "Матрица ICE",
    "RICE Matrix": "Матрица RICE",
    "Roadmap 12-24 месяца": "Дорожная карта на 12-24 месяца",
    "Product Strategy": "Продуктовая стратегия",
    "Guardrail": "Ограничение",
    "Decision Context": "Контекст решений",
    "Personas": "Таблица персон",
    "Interview Recruiting Plan": "План рекрутинга для интервью",
    "Validation Plan": "План валидации",
    "Simulated Interviews": "Смоделированные интервью",
    "Interviews": "Интервью",
    "Interview Guide Draft": "Черновик гайда интервью",
    "Patterns To Validate": "Паттерны для проверки",
    "SWOT Matrix": "SWOT-матрица",
    "Strategic Posture": "Стратегическая позиция",
    "Strategic Notes": "Стратегические заметки",
    "Sources Reviewed": "Проверенные источники",
  }[normalized] || normalized;
}

function titleForFile(file) {
  return {
    "research-summary.md": "Сводка исследования",
    "scenario-matrix.md": "Матрица сценариев и путь ценности",
    "payment-method-matrix.md": "Матрица способов оплаты и путь денег",
    "scenario-user-flows.md": "Пользовательские флоу исследования",
    "payment-user-flows.md": "Пользовательские флоу способов оплаты",
    "competitive-analysis.md": "Конкурентный анализ",
    "cjm-map.md": "CJM и карта сценариев",
    "opportunity-roadmap.md": "Возможности, приоритизация ICE/RICE и дорожная карта",
    "proto-personas.md": "Прото-персоны",
    "synthetic-interviews.md": "Синтетические интервью",
    "swot.md": "SWOT-анализ",
    "source-log.md": "Источники и журнал доказательств",
  }[file] || file;
}

function markerForFile(file) {
  const marker = {
    "research-summary.md": "overview",
    "scenario-matrix.md": "scenario_matrix",
    "payment-method-matrix.md": "payment_matrix",
    "scenario-user-flows.md": "scenario_flows",
    "payment-user-flows.md": "payment_flows",
    "competitive-analysis.md": "competitors",
    "cjm-map.md": "cjm",
    "opportunity-roadmap.md": "scoring",
    "proto-personas.md": "personas",
    "synthetic-interviews.md": "interviews",
    "swot.md": "swot",
    "source-log.md": "sources",
  }[file];

  return marker ? `<!-- notion-section: ${marker} -->` : "";
}

function resolveSourceFiles(sourceDir, slots) {
  return slots
    .map((slot) => slot.files.find((file) => existsSync(join(sourceDir, file))))
    .filter(Boolean);
}

function buildCrossLinkControlSections() {
  return [
    "## Карта связей исследования",
    "<!-- notion-section: overview -->",
    "",
    "| Если читатель хочет понять... | Куда перейти |",
    "|---|---|",
    "| Какой главный вывод исследования и какие решения из него следуют | Раздел \"Сводка исследования\"; раздел \"Конкурентный анализ\" |",
    "| Какие пользовательские сценарии и боли важнее всего | Раздел \"CJM и сценарии\"; раздел \"ICE/RICE бэклог и инициативы\" |",
    "| Для кого это важно и какие допущения нужно проверить | Раздел \"Прото-персоны\"; раздел \"Синтетические интервью и вопросы для интервью\" |",
    "| Почему приоритеты идут именно в таком порядке | Раздел \"ICE/RICE бэклог и инициативы\"; раздел \"Roadmap и SWOT\" |",
    "| Какие риски, неизвестные и источники ограничивают выводы | Раздел \"Roadmap и SWOT\"; раздел \"План валидации и источники\" |",
    "",
    "## Цепочка решений",
    "<!-- notion-section: overview -->",
    "",
    "| Доказательство | Интерпретация | Продуктовое решение | Где раскрыто подробнее |",
    "|---|---|---|---|",
    "| Source-backed факты показывают реальные ограничения рынка и поведения пользователей. | Выводы должны опираться на наблюдаемое событие, участника, документ или канал. | Продуктовые решения формулируются через конкретный сценарий и проверку. | \"Сводка исследования\", \"Источники и журнал доказательств\" |",
    "| CJM показывает, где пользователь или операционная роль теряет понимание следующего шага. | Приоритет получает не самая громкая идея, а трение с понятным механизмом влияния. | Бэклог связывается с этапом CJM, метрикой и способом валидации. | \"CJM и сценарии\", \"ICE/RICE бэклог и инициативы\" |",
    "| Прото-персоны и интервью-гайд отделяют факты от гипотез. | Сегменты нельзя считать подтвержденными без интервью, логов или первичных данных. | Следующий этап должен проверять самые рискованные допущения. | \"Прото-персоны\", \"Синтетические интервью\" |",
    "| SWOT и источники фиксируют ограничения открытых данных. | Research не должен превращаться в уверенную стратегию без проверки спорных мест. | Риски и unknowns остаются в validation plan до подтверждения. | \"Roadmap и SWOT\", \"План валидации и источники\" |",
    "",
  ];
}

function readJsonIfExists(path) {
  if (!existsSync(path)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function inferExportTitle(meta) {
  const explicitTitle = firstNonEmptyString(
    meta?.notion_title,
    meta?.research_title,
    meta?.title,
  );
  if (explicitTitle) {
    return explicitTitle;
  }

  const sourceRequest = firstNonEmptyString(meta?.source_request, meta?.goal, meta?.project_slug);
  if (!sourceRequest) {
    return "Исследовательский пакет";
  }

  const cleaned = sourceRequest
    .replace(/^Глубокое исследование:\s*/iu, "")
    .replace(/^Исследование:\s*/iu, "")
    .replace(/\s+/g, " ")
    .trim();
  return `Исследование: ${truncateTitle(cleaned)}`;
}

function firstNonEmptyString(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim();
}

function truncateTitle(value, limit = 110) {
  if (value.length <= limit) {
    return value;
  }

  const clipped = value.slice(0, limit).replace(/\s+\S*$/u, "").trim();
  return `${clipped}...`;
}

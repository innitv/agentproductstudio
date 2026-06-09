import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [runDirArg, outputArg] = process.argv.slice(2);

if (!runDirArg) {
  console.error("Usage: node tooling/scripts/generate-notion-research-export.mjs <run-dir> [output-md]");
  process.exit(1);
}

const runDir = resolve(process.cwd(), runDirArg);
const outputPath = resolve(process.cwd(), outputArg || join(runDir, "notion-research-export-ru.md"));

const requiredFiles = [
  "research-summary.md",
  "competitive-analysis.md",
  "cjm-map.md",
  "opportunity-roadmap.md",
  "proto-personas.md",
  "synthetic-interviews.md",
  "swot.md",
  "source-log.md",
];

const missing = requiredFiles.filter((file) => !existsSync(join(runDir, file)));
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
  "# Исследование платежных сценариев России для A3 Pay",
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

function buildCrossLinkControlSections() {
  return [
    "## Карта связей исследования",
    "<!-- notion-section: overview -->",
    "",
    "| Если читатель хочет понять... | Куда перейти |",
    "|---|---|",
    "| Почему A3 Pay должен помогать с доверием, назначением, чеком, статусом и возвратом, а не быть еще одной кнопкой оплаты | Раздел \"Сводка исследования\" -> \"Ключевые выводы\" и \"Наблюдения\"; раздел \"Конкурентный анализ\" -> \"Стратегические выводы\" |",
    "| Какие сценарии дают лучший стартовый рынок | Раздел \"CJM и сценарии\"; раздел \"ICE/RICE бэклог и инициативы\" |",
    "| Для кого это важно и какие боли проверять | Раздел \"Прото-персоны\"; раздел \"Синтетические интервью и вопросы для интервью\" |",
    "| Почему приоритеты идут именно в таком порядке | Раздел \"ICE/RICE бэклог и инициативы\" -> \"Матрица RICE\" и \"Дорожная карта на 12-24 месяца\" |",
    "| Какие риски мешают статусу `ready` | Раздел \"Roadmap и SWOT\"; раздел \"План валидации, провайдеры и источники\" |",
    "",
    "## Цепочка решений",
    "<!-- notion-section: overview -->",
    "",
    "| Доказательство | Интерпретация | Продуктовое решение | Где раскрыто подробнее |",
    "|---|---|---|---|",
    "| Безналичные платежи и СБП стали массовыми, но опыт распределен между банками, QR, PSP и порталами. | Конкурировать отдельным способом оплаты рискованно; ценность выше там, где пользователь теряет контекст и доверие. | Связать получателя, назначение, способ оплаты, чек и статус в одном понятном сценарии. | \"Рыночные факты\", \"Конкурентный анализ\" |",
    "| Малый бизнес и услуги уже используют переводы/QR, но клиенту не хватает счета, назначения, чека и статуса. | Это частый сценарий без тяжелой юридической нагрузки крупной сделки. | Запускать счет по телефону, профиль получателя, чек и сценарий возврата. | \"CJM и сценарии\", \"ICE/RICE бэклог и инициативы\" |",
    "| Регулярные счета дают частоту, но конкурируют с банками, Госуслугами и ГИС ЖКХ. | Центр счетов ценен только если дает память счетов, напоминания и историю лучше банковского кабинета. | Проверить готовность подключать счета и возвращаться каждый месяц до тяжелой интеграции. | \"План валидации\", \"CJM 1: ЖКХ и регулярные счета\" |",
    "| Крупные сделки имеют высокий эффект, но завязаны на документы, банки, эскроу/аккредитив и правовую роль. | Это не стартовое ядро продукта. | Делать помощник статуса и передачу в банк-партнер после проверки юридической и партнерской готовности. | \"Roadmap и SWOT\", \"Дорожная карта на 12-24 месяца\" |",
    "",
  ];
}

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

const sections = requiredFiles.map((file) => ({
  file,
  markdown: normalizeMarkdown(readFileSync(join(runDir, file), "utf8")),
}));

const exportMarkdown = [
  "# Исследование платежных сценариев России для A3 Pay",
  "",
  "## Статус публикационного пакета",
  "",
  "| Поле | Значение |",
  "|---|---|",
  "| Тип | Полный research pack для Notion |",
  "| Источник | `outputs/a3pay-cjm-new/2026-06-07` |",
  "| Ограничение | DeepSeek/Gemini cross-check не выполнен; выводы остаются `partial/needs_validation` там, где это указано в источниках. |",
  "",
  "## Использованные входные артефакты",
  "",
  ...requiredFiles.map((file) => `- \`${file}\``),
  "",
  ...buildPublicationControlSections(),
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

function normalizeMarkdown(markdown) {
  const normalized = markdown
    .replace(/\r\n/g, "\n")
    .replace(/^#\s+.+\n+/, "")
    .trim();

  return removeEmptyHeadings(normalized);
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

function buildPublicationControlSections() {
  return [
    "## Прото-персоны",
    "<!-- notion-section: personas -->",
    "",
    "| Персона | Сегмент | Контекст | JTBD | Боль | Ценность A3 Pay | Evidence status |",
    "|---|---|---|---|---|---|---|",
    "| Анна, 34 | Городской пользователь с семьей | Платит ЖКХ, детские секции, подписки и онлайн-покупки | Видеть регулярные счета и платить без ошибок | Разные кабинеты, забытые сроки, непонятные чеки | Bills hub, reminders, receipt vault | hypothesis/source-informed |",
    "| Сергей, 42 | Мастер или малый бизнес | Принимает предоплаты и финальные оплаты от клиентов | Дать клиенту понятный способ оплатить и не спорить о переводе | Переводы на карту выглядят неформально, нет назначения, возвраты вручную | Phone invoice, merchant profile, refund workflow | hypothesis/source-informed |",
    "| Мария, 29 | E-commerce/travel buyer | Покупает в маркетплейсах, у небольших магазинов и бронирует поездки | Выбрать выгодный и безопасный способ оплаты | Неясные возвраты, много способов, BNPL/кэшбэк неочевидны | Unified checkout, refund vault, payment plan selector | hypothesis/source-informed |",
    "| Алексей, 38 | High-ticket buyer | Покупает авто или недвижимость | Провести крупный платеж без риска ошибиться | Несколько сторон, документы, банк, сроки, аванс | Safe deposit/status companion | hypothesis/needs_validation |",
    "",
    "## Сценарий 1: регулярные счета",
    "<!-- notion-section: cjm -->",
    "",
    "| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |",
    "|---|---|---|---|---|---|",
    "| Получить начисление | Понять сумму и срок | Получает квитанцию или уведомление | УК, РСО, пользователь | Документы в разных местах | Phone-linked bill inbox |",
    "| Проверить | Убедиться, что начисление корректно | Сверяет счетчики и период | Пользователь, УК | Непонятные строки | Explanation layer and history |",
    "| Оплатить | Заплатить без комиссии | Выбирает СБП, Мир или карту | Банк, НСПК, портал | Комиссии и ручной ввод | Best rail selection |",
    "| Подтвердить | Сохранить чек | Получает чек и статус | Банк, УК | Статус не обновился | Receipt/status vault |",
    "| Повторить | Не забыть следующий месяц | Настраивает reminder или автоплатеж | Пользователь | Пропуск срока | Smart reminders |",
    "",
    "## Сценарий 2: услуги и малый бизнес",
    "<!-- notion-section: cjm -->",
    "",
    "| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |",
    "|---|---|---|---|---|---|",
    "| Договориться | Получить услугу | Запись или заказ | Клиент, merchant | Нет формального invoice | Merchant profile by phone |",
    "| Предоплата | Забронировать слот | Перевод, ссылка или QR | Клиент, merchant, банк | Перевод на карту выглядит небезопасно | Phone invoice with terms |",
    "| Оплата | Закрыть сумму | СБП или карта | Банк, merchant | Нет чека и назначения | Receipt and purpose |",
    "| Возврат | Решить exception | Частичный возврат или перенос | Клиент, merchant | Ручная переписка | Refund workflow |",
    "| Повтор | Вернуться | Сохраненный merchant | Клиент | Реквизиты теряются | Favorite merchants |",
    "",
    "## Матрица позиционирования",
    "<!-- notion-section: competitors -->",
    "",
    "| Игрок | Тип | Сильная сторона | Слабое место | Роль A3 Pay |",
    "|---|---|---|---|---|",
    "| СБП | National payment rails | Массовость, низкая стоимость, доверие ЦБ/НСПК | UX зависит от банка, слабый scenario/status layer | UX and trust layer поверх СБП |",
    "| Банковские приложения | Bank superapps | Trust, KYC, счета, кредиты, loyalty | Закрыты внутри своего банка | Cross-bank сценарный слой |",
    "| Pay-сервисы | Bank/ecosystem Pay | Удобный checkout и loyalty | Ecosystem lock-in | Neutral payment selector |",
    "| PSP | Merchant acquiring | APIs, checkout methods, merchant integrations | Merchant-first, нет user-owned payment memory | Receipt/status vault и phone alias |",
    "| BNPL providers | Embedded finance | Affordability и AOV lift | Регулирование, лимиты, risk perception | Один вариант payment plan, не ядро |",
    "| Госуслуги/ГИС ЖКХ | Public payment portal | Официальность и trust | Узкий public domain | Private-sector status/receipt UX |",
    "",
    "## ICE/RICE бэклог",
    "<!-- notion-section: scoring -->",
    "",
    "| Сценарий / инициатива | Reach | Impact | Confidence | Effort | RICE | ICE | Приоритет |",
    "|---|---:|---:|---:|---:|---:|---:|---|",
    "| Phone invoice | 8 | 8 | 7 | 3 | 149.3 | 18.7 | P0 |",
    "| Receipt/refund vault | 7 | 7 | 7 | 3 | 114.3 | 16.3 | P0 |",
    "| Bills hub | 7 | 9 | 7 | 4 | 110.3 | 15.8 | P0 |",
    "| Unified checkout | 8 | 8 | 6 | 5 | 76.8 | 14.4 | P0 |",
    "| Payment plan selector | 6 | 8 | 6 | 5 | 57.6 | 12.0 | P1 |",
    "| Safe auto deposit | 4 | 9 | 5 | 6 | 30.0 | 7.5 | P1 |",
    "| Property companion | 3 | 10 | 4 | 8 | 15.0 | 5.0 | P2 |",
    "",
  ];
}

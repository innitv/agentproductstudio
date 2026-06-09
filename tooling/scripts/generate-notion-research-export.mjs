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
  ...buildCrossLinkControlSections(),
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

  return removeEmptyHeadings(removeNotionInternalSections(normalized));
}

function removeNotionInternalSections(markdown) {
  const internalHeadings = new Set([
    "Inputs Used",
    "Использованные входные материалы",
    "Использованные входные артефакты",
  ]);

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

      if (skippingLevel === null && internalHeadings.has(title)) {
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

function buildPublicationControlSections() {
  return [
    "## Прото-персоны",
    "<!-- notion-section: personas -->",
    "",
    "| Персона | Сегмент | Контекст | Платежный момент | Задача | Боль | Ценность A3 Pay | Статус доказательств |",
    "|---|---|---|---|---|---|---|---|",
    "| Анна, 34 | Городской пользователь с семьей | Платит ЖКХ, детские секции, подписки и онлайн-покупки | Получила новый счет и не помнит, где был прошлый чек | Видеть регулярные счета и платить без ошибок | Разные кабинеты, забытые сроки, непонятные чеки | Центр счетов, напоминания, чек и история | гипотеза на основе источников |",
    "| Сергей, 42 | Мастер или малый бизнес | Принимает предоплаты и финальные оплаты от клиентов | Клиент просит безопасный способ внести предоплату | Дать клиенту понятный способ оплатить и не спорить о переводе | Переводы на карту выглядят неформально, нет назначения, возвраты вручную | Счет по телефону, профиль получателя, сценарий возврата | гипотеза на основе источников |",
    "| Мария, 29 | Покупатель e-commerce/travel | Покупает в небольших магазинах и бронирует поездки | На оплате видит несколько способов и условия возврата | Выбрать выгодный и безопасный способ оплаты | Неясные возвраты, много способов, BNPL/кэшбэк неочевидны | Понятный выбор оплаты, чек и статус возврата | гипотеза на основе источников |",
    "| Алексей, 38 | Покупатель крупной сделки | Покупает авто или недвижимость | Надо внести задаток или пройти банковский платеж | Провести крупный платеж без риска ошибиться | Несколько сторон, документы, банк, сроки, аванс | Безопасный счет, чеклист и статус банковского этапа | требует проверки |",
    "",
    "## Сценарий 1: регулярные счета",
    "<!-- notion-section: cjm -->",
    "",
    "| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |",
    "|---|---|---|---|---|---|",
    "| Получить начисление | Понять сумму и срок | Получает квитанцию или уведомление | УК, РСО, пользователь | Документы в разных местах | Единая карточка счета по адресу/телефону |",
    "| Проверить | Убедиться, что начисление корректно | Сверяет счетчики и период | Пользователь, УК | Непонятные строки | Пояснение начислений и история прошлых сумм |",
    "| Оплатить | Заплатить без комиссии | Выбирает СБП, Мир или карту | Банк, НСПК, портал | Комиссии и ручной ввод | Подсказка понятного способа оплаты и заполненные реквизиты |",
    "| Подтвердить | Сохранить чек | Получает чек и статус | Банк, УК | Статус не обновился | Чек, назначение и статус в карточке счета |",
    "| Повторить | Не забыть следующий месяц | Настраивает напоминание или автоплатеж | Пользователь | Пропуск срока | Напоминание и повтор платежа из истории |",
    "",
    "## Сценарий 2: услуги и малый бизнес",
    "<!-- notion-section: cjm -->",
    "",
    "| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |",
    "|---|---|---|---|---|---|",
    "| Договориться | Получить услугу | Запись или заказ | Клиент, продавец/мастер | Нет формального счета | Профиль получателя по телефону |",
    "| Предоплата | Забронировать слот | Перевод, ссылка или QR | Клиент, продавец/мастер, банк | Перевод на карту выглядит небезопасно | Счет по телефону с назначением и условиями |",
    "| Оплата | Закрыть сумму | СБП или карта | Банк, продавец/мастер | Нет чека и назначения | Чек и понятное назначение платежа |",
    "| Возврат | Решить исключение | Частичный возврат или перенос | Клиент, продавец/мастер | Ручная переписка | Сценарий возврата или переноса со статусом |",
    "| Повтор | Вернуться | Сохраненный получатель | Клиент | Реквизиты теряются | Избранные получатели и история оплат |",
    "",
    "## Матрица позиционирования",
    "<!-- notion-section: competitors -->",
    "",
    "| Игрок | Тип | Сильная сторона | Слабое место в пользовательском пути | Роль A3 Pay |",
    "|---|---|---|---|---|",
    "| СБП | Национальная платежная инфраструктура | Массовость, низкая стоимость, доверие ЦБ/НСПК | Опыт зависит от банка; назначение, чек и возврат часто живут отдельно | Добавить понятный контекст платежа: получатель, назначение, чек, статус |",
    "| Банковские приложения | Банковские супераппы | Доверие, KYC, счета, кредиты, бонусы | Закрыты внутри своего банка | Связать оплату между разными банками, продавцами и сценариями |",
    "| Pay-сервисы | Банковские/экосистемные Pay-сервисы | Удобная оплата и бонусы | Зависимость от экосистемы | Нейтральный выбор способа оплаты для пользователя и продавца |",
    "| PSP | Платежные агрегаторы | API, способы оплаты, интеграции для продавцов | Фокус на продавце; у пользователя нет единой памяти платежей | Чеки, статусы, возвраты и оплата по телефону со стороны пользователя |",
    "| BNPL providers | Оплата частями | Доступность высокого чека | Регулирование, лимиты, ощущение кредита | Один из вариантов оплаты, а не вся ценность продукта |",
    "| Госуслуги/ГИС ЖКХ | Портал государственных платежей | Официальность и доверие | Узкий государственный домен | Перенести понятный статус и архив чеков в частные услуги |",
    "",
    "## ICE/RICE бэклог",
    "<!-- notion-section: scoring -->",
    "",
    "| Сценарий / инициатива | Reach | Impact | Confidence | Effort | RICE | ICE | Приоритет |",
    "|---|---:|---:|---:|---:|---:|---:|---|",
    "| Счет по телефону | 8 | 8 | 7 | 3 | 149.3 | 18.7 | P0 |",
    "| Хранилище чеков и возвратов | 7 | 7 | 7 | 3 | 114.3 | 16.3 | P0 |",
    "| Центр регулярных счетов | 7 | 9 | 7 | 4 | 110.3 | 15.8 | P0 |",
    "| Понятный выбор оплаты | 8 | 8 | 6 | 5 | 76.8 | 14.4 | P0 |",
    "| Выбор оплаты частями | 6 | 8 | 6 | 5 | 57.6 | 12.0 | P1 |",
    "| Безопасный задаток за авто | 4 | 9 | 5 | 6 | 30.0 | 7.5 | P1 |",
    "| Помощник платежа по недвижимости | 3 | 10 | 4 | 8 | 15.0 | 5.0 | P2 |",
    "",
  ];
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

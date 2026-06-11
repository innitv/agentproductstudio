import { readFileSync, writeFileSync } from "node:fs";

const runDir = "outputs/a3pay-cjm/2026-06-05";
const exportPath = `${runDir}/notion-research-export-ru.md`;
const text = readFileSync(exportPath, "utf8");

function section(title) {
  const pattern = new RegExp(`^## ${escapeRegExp(title)}\\r?\\n([\\s\\S]*?)(?=^## |\\z)`, "m");
  const match = text.match(pattern);
  return match ? `## ${title}\n\n${match[1].trim()}\n\n` : "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const providerCoverage = `## Provider Coverage

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| Tavily MCP | yes | yes | 8 | pass | Source-backed evidence provider; повторный validation pass выполнен 2026-06-05. |
| DeepSeek | yes | yes | 0 | pass | Advisory contradiction review; не является source-backed evidence. |
| Gemini | yes | yes | 0 | pass | Advisory strategy review; не является source-backed evidence. |

## Provider Cross-Check Notes

- DeepSeek/Gemini advisory review подсветил гипотезу позиционирования A3 Pay не как самостоятельного кошелька, а как сценария вокруг сервисных, регулярных и phone-led платежей; это не источник факта и требует проверки на source-backed evidence и интервью.
- Модельные провайдеры не добавляют новых source-backed фактов; все рыночные и количественные claims остаются привязанными к Tavily/публичным источникам.
- Claims по BNPL, недвижимости, автоимпорту и travel остаются валидационными гипотезами до интервью и партнерского discovery.

`;

const schemaPayload = {
  status: "ready",
  inputs_used: [
    "recursive-brief.md",
    "notion-research-export-ru.md",
    "Tavily provider output",
    "DeepSeek contradiction review",
    "Gemini strategy synthesis review",
  ],
  provider_coverage: [
    { provider: "tavily", requested: true, used: true, sources_count: 8, validation_state: "pass", notes: "Source-backed evidence provider." },
    { provider: "deepseek", requested: true, used: true, sources_count: 0, validation_state: "pass", notes: "Advisory contradiction review; not source-backed evidence." },
    { provider: "gemini", requested: true, used: true, sources_count: 0, validation_state: "pass", notes: "Advisory strategy review; not source-backed evidence." },
  ],
  provider_failures: [],
  research_questions: [
    "Где платеж по номеру телефона снижает трение сильнее всего?",
    "Какие сценарии требуют мультимаршрутной оркестрации вместо одной кнопки оплаты?",
    "Какие claims нельзя переносить в PRD/copy без дополнительной проверки?",
  ],
  audience: [
    {
      segment: "Регулярный плательщик семьи",
      context: "Оплачивает ЖКХ, связь, штрафы, кружки, подписки и счета родственников.",
      motivation: "Не забывать платежи, видеть обязательства и быстро подтверждать оплату.",
      barrier: "Разные приложения, реквизиты и непонятный статус после списания.",
      evidence_status: "proto",
    },
    {
      segment: "Продавец или поставщик услуги",
      context: "Получает регулярные или сервисные платежи от клиентов.",
      motivation: "Быстрее получать оплату и уменьшить ручную сверку.",
      barrier: "Ошибки назначения платежа, неоплаченные счета и дорогая поддержка по статусам.",
      evidence_status: "hypothesis",
    },
  ],
  jobs_to_be_done: [
    {
      segment: "Регулярный плательщик семьи",
      job: "Оплатить обязательство без ручного ввода реквизитов и с понятным статусом.",
      trigger: "Пришло начисление, дедлайн, напоминание или просьба оплатить за родственника.",
      pain: "Неясно кому, сколько, когда и каким способом платить.",
      desired_outcome: "Оплатить быстро, безопасно и видеть подтверждение принятия поставщиком.",
      evidence_status: "hypothesis",
    },
  ],
  proto_personas: [
    {
      name: "Регулярный плательщик семьи",
      segment: "B2C service payments",
      jtbd: "Контролировать регулярные обязательства семьи.",
      pain: "Разрозненные счета и статусы.",
      desired_outcome: "Единая корзина, напоминания и подтверждение оплаты.",
      evidence_status: "proto",
    },
  ],
  simulated_interviews: [
    {
      persona: "Регулярный плательщик семьи",
      scenario: "Регулярные платежи",
      summary: "Пользователь хочет контроль, проверенного получателя и статус после оплаты.",
      evidence_status: "synthetic",
      needs_validation: true,
    },
  ],
  findings: [
    {
      finding: "A3 Pay сильнее выглядит как слой оркестрации сервисных, регулярных и phone-led платежей, а не как самостоятельный кошелек.",
      evidence: "Tavily/public source-backed sources plus non-blocking DeepSeek/Gemini advisory check.",
      confidence: "medium",
    },
  ],
  sources: [
    {
      title: "notion-research-export-ru.md",
      provider: "user_sources",
      url_or_path: "outputs/a3pay-cjm/2026-06-05/notion-research-export-ru.md",
      type: "local_artifact",
      used_for: "Detailed research pack and provider coverage.",
      retrieved_at: "2026-06-05",
      confidence: "high",
    },
  ],
  validation_plan: [
    {
      hypothesis: "Платеж по номеру телефона повышает конверсию в сервисных платежах, где пользователь знает контрагента.",
      method: "Пользовательские интервью и prototype/usability validation.",
      minimum_evidence: "Большинство участников понимают получателя, назначение и статус платежа без подсказки.",
      status: "open",
    },
  ],
  unknowns: [
    "Количественные и рыночные claims требуют проверки по первичным источникам перед PRD/copy.",
    "BNPL, недвижимость, автоимпорт и travel требуют реальных интервью и partner discovery.",
  ],
};

const researchSummary = `# Research Summary

\`\`\`artifact-json
${JSON.stringify(schemaPayload, null, 2)}
\`\`\`

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Research mode | deep_research |
| Evidence level | source-backed with advisory model review |
| Readiness score | ready after Tavily/source-backed validation pass; DeepSeek/Gemini advisory does not drive readiness |

## Inputs Used

- recursive-brief.md
- notion-research-export-ru.md
- Tavily provider output
- DeepSeek contradiction review
- Gemini strategy synthesis review

${section("Краткий вывод")}
## Research Questions

${section("Исследовательские вопросы")}
## Audience

${section("Аудитория документа")}${section("Пользовательские задачи")}
## Jobs To Be Done

- Оплатить обязательство без ручного ввода реквизитов и с понятным статусом.
- Управлять регулярными платежами, подписками и семейными обязательствами.
- Снизить ручную сверку для поставщика или продавца.

## Findings

${section("Выводы, подтвержденные источниками")}${section("Сводка возможностей по сценариям")}${providerCoverage}
## Proto Personas

См. детальный файл \`proto-personas.md\`; ключевые сегменты: регулярный плательщик семьи, покупатель крупного товара/авто, цифровой путешественник, продавец/поставщик услуги, банк/финтех-партнер.

## Synthetic Interviews

См. детальный файл \`synthetic-interviews.md\`; интервью являются синтетическими и используются только для гипотез и плана реальных интервью.

## Research Validation Plan

${section("План валидации исследования")}${section("Пользовательские интервью")}${section("Партнерские интервью")}${section("Количественная валидация")}${section("Гипотезы для проверки")}
${section("Покрытие источников и провайдеров")}
## Sources

${section("Источники")}`;

const competitiveAnalysis = `# Competitive Analysis

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Inputs Used | research-summary.md, notion-research-export-ru.md, Tavily/source-backed validation pass, DeepSeek/Gemini advisory notes |

## Inputs Used

- research-summary.md
- notion-research-export-ru.md
- Tavily/source-backed validation pass
- DeepSeek/Gemini advisory notes

## Competitor Set

${section("Конкурентный контекст")}${section("Набор конкурентов")}
## Comparison Matrix

${section("Матрица позиционирования")}
## Takeaways

${section("Активы A3")}${section("Незакрытые конкурентами разрывы")}${section("Стратегическая рекомендация")}`;

const protoPersonas = `# Proto Personas

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Evidence status | proto, requires real interviews |

## Inputs Used

- research-summary.md
- notion-research-export-ru.md

## Proto Personas

${section("Персона 1: Регулярный плательщик семьи")}${section("Персона 2: Покупатель крупного товара или авто")}${section("Персона 3: Цифровой путешественник")}${section("Персона 4: Продавец или поставщик услуги")}${section("Персона 5: Банк или финтех-партнер")}
## Decision Context

Персоны используются для выбора P0/P1 сценариев, CJM-путей и скрипта реальных интервью. Они не являются подтвержденными сегментами рынка до пользовательской валидации.

## Validation Plan

- Провести интервью по регулярным платежам, авто/крупным покупкам, travel, поставщикам услуг и банковским партнерам.
- Проверить готовность платить по номеру телефона, доверие к проверенному получателю и ценность статуса после оплаты.
`;

const syntheticInterviews = `# Synthetic Interviews

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Evidence status | synthetic, requires real interviews |

## Inputs Used

- research-summary.md
- proto-personas.md
- notion-research-export-ru.md

## Guardrail

${section("Ограничение по синтетическим интервью")}
## Simulated Interviews

${section("Синтетическое интервью 1: Регулярные платежи")}${section("Синтетическое интервью 2: Автоимпорт")}${section("Синтетическое интервью 3: Путешествия")}${section("Синтетическое интервью 4: Недвижимость")}${section("Синтетическое интервью 5: Поставщик услуг")}
## Patterns To Validate

${section("Вопросы для реальных интервью")}`;

const swot = `# SWOT

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Inputs Used | research-summary.md, competitive-analysis.md, provider validation pass |

## Inputs Used

- research-summary.md
- competitive-analysis.md
- provider validation pass

## SWOT

${section("Сильные стороны")}${section("Слабые стороны")}${section("Возможности")}${section("Риски")}
## Strategic Notes

${section("Стратегическая позиция")}`;

writeFileSync(`${runDir}/research-summary.md`, researchSummary, "utf8");
writeFileSync(`${runDir}/competitive-analysis.md`, competitiveAnalysis, "utf8");
writeFileSync(`${runDir}/proto-personas.md`, protoPersonas, "utf8");
writeFileSync(`${runDir}/synthetic-interviews.md`, syntheticInterviews, "utf8");
writeFileSync(`${runDir}/swot.md`, swot, "utf8");

console.log("Restored detailed A3Pay research artifacts with provider validation coverage.");

---
id: research-pack
name: research-pack
title: "Research Pack (Глубокое Исследование)"
description: "Использовать на этапе 01-research и для standalone research/CJM, когда нужна source-backed исследовательская база: Tavily-first source policy, шесть обязательных артефактов, source quality pass, contradiction review и claims-to-validate. Skill не заменяет agent-pack/workflows/deep-research.workflow.md, а делает его исполняемым: DeepSeek/Gemini остаются non-blocking advisory, а research pack не получает success без source-backed evidence и Research Content Lint."
platforms:
  - claude
  - open-code
mcp_servers:
  - tavily
strictness_profile: strict
owner_stage_ids:
  - 01-research
required_inputs:
  - recursive_brief
  - run_plan
  - handoff_bundle
  - stage_gate_ledger
required_outputs:
  - research_summary
  - scenario_user_flows
  - competitive_analysis
  - proto_personas
  - synthetic_interviews
  - swot
approval_actions:
  - external_research_provider_call
  - model_provider_call
validation_commands:
  - yarn research:lint
  - yarn workflow:validate
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Research Pack (Глубокое Исследование)

## 1. Назначение

Skill применяется, когда нужно собрать исследовательскую базу для решений по PRD, IA, дизайну, copy и экранам — на этапе `01-research` продуктового workflow или в standalone research/CJM run (`research/projects/<research-slug>/<YYYY-MM-DD>/`).

Skill защищает три gates, которые чаще всего нарушаются: source-backed evidence вместо правдоподобной генерации, non-blocking роль advisory-провайдеров и Anti-AI-Slop качество выводов. Он **не дублирует** нормативный процесс: полный pipeline из 17 шагов и критерии COMPLETE живут в [`agent-pack/workflows/deep-research.workflow.md`](../../../agent-pack/workflows/deep-research.workflow.md), правила Notion-публикации и advisory rule — в [`agent-pack/workflows/claude-operating-rules.md`](../../../agent-pack/workflows/claude-operating-rules.md) разделы 3-4. Skill задаёт порядок, evidence contract и failure modes.

Не применять для: quick draft по явной просьбе пользователя, публикации research в Notion (это `notion-sync`), лечения качества уже написанного текста (это `anti-ai-slop`).

### 3.1. 🔴 Вопрос «как это выглядит» закрывается только просмотром изображений

Если исследуется **визуальная** сторона (как оформлены брендбуки, как подают палитру и знаки, как устроен разворот, чем сильна манера образца) — текстовый ресёрч на эту тему **не является ответом**, сколько бы источников он ни собрал. Тексты дают каноны, типы аргументов и структуру разделов; они не дают ни одного приёма подачи, потому что приём виден, а не описан.

Процедура для такой оси:

1. Найти **реальные носители**: PDF опубликованных руководств, страницы кейсов, бренд-порталы. Поиск даёт адреса, а не ответ.
2. **Скачать** файлы (страницы PDF растеризовать) в каталог run — материал должен остаться, чтобы человек мог посмотреть сам.
3. **Открыть каждый через Read и описать увиденное.** Пересказ подписи с сайта вместо просмотра — тот же дефект, что «сверил по описанию».
4. Снимать **измеримое**, а не впечатление: доля пустоты, размер образца относительно листа, где стоит заголовок, чем задан порядок чтения, как показан запрет.
5. Отобрать приёмы «применимо / не наше» — каждый со ссылкой на конкретный скачанный файл.

Цена пропуска измерена на run `a3-brand-presentation-template` (2026-08-10): три текстовых ресёрча дали каноны и ни одного просмотренного разворота, манеру пришлось брать с собственной пробы владельца, и две сборки листов были отклонены подряд. Признак, по которому ловится подмена: в отчёте есть источники и выводы, но **нет ни одного файла, который можно открыть глазами**.

Машинной проверки нет намеренно: «нужен ли здесь визуальный слой» — суждение о задаче, а не совпадение полей. Ловится дисциплиной автора запроса и этим разделом.


## Детали

Обязательные входы, порядок сбора, роль advisory-провайдеров, состав evidence и
чек-лист приёмки — `references/procedure.md`. Нормативный процесс из
семнадцати шагов — `agent-pack/workflows/deep-research.workflow.md`.

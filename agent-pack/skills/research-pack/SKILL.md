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

Skill применяется, когда нужно собрать исследовательскую базу для решений по PRD, IA, дизайну, copy, прототипу и test bench — на этапе `01-research` продуктового workflow или в standalone research/CJM run (`research/projects/<research-slug>/<YYYY-MM-DD>/`).

Skill защищает три gates, которые чаще всего нарушаются: source-backed evidence вместо правдоподобной генерации, non-blocking роль advisory-провайдеров и Anti-AI-Slop качество выводов. Он **не дублирует** нормативный процесс: полный pipeline из 17 шагов и критерии COMPLETE живут в [`agent-pack/workflows/deep-research.workflow.md`](../../workflows/deep-research.workflow.md), правила Notion-публикации и advisory rule — в [`agent-pack/workflows/claude-operating-rules.md`](../../workflows/claude-operating-rules.md) разделы 3-4. Skill задаёт порядок, evidence contract и failure modes.

Не применять для: quick draft по явной просьбе пользователя, публикации research в Notion (это `notion-sync`), лечения качества уже написанного текста (это `anti-ai-slop`).

## 2. Обязательные inputs

- `recursive-brief.md` — вопрос, ограничения и decision needs.
- `run-plan.md` — маршрут run и профиль.
- `handoff-bundle.md`, `stage-gate-ledger.md` — что уже решено и какие gates закрыты.
- Артефакты, уже лежащие в run directory: прошлые research/export/CJM, `stage-results/*.json`, пользовательские local artifacts (screenshots, выгрузки, документы).

Artifact context inventory обязателен до первого поиска. `inputs_used` должен перечислять реально прочитанные файлы, а не только `recursive-brief.md`.

## 3. Процедура

1. **Context inventory.** Прочитай run ledger и все существующие артефакты run. Зафиксируй, что уже известно и какие решения ждут research.
2. **Research plan.** Сформулируй questions, assumptions, decision needs, source classes и search dimensions. План пишется до поиска, а не восстанавливается после.
3. **Targeted queries.** Разложи запрос по осям: рынок/категория, конкуренты и альтернативы, пользовательские сценарии и JTBD, доверие/комплаенс, ценообразование и бизнес-модель, design implications. Query не должен терять ограничения, уже зафиксированные в run artifacts.
4. **Source-backed run.** Основной источник — Tavily или другой primary/source-backed provider. Одиночный LLM-provider не является успешным research gate.
5. **Advisory checks (opt-in).** DeepSeek/Gemini вызываются только при явном opt-in в source policy, `RESEARCH_PROVIDER_ORDER` или прямом запросе пользователя, и только для contradiction review, gap review и claims-to-validate. Их synthesis не является source-backed evidence, не увеличивает `sources_count` и не идёт в факты research pack. Отдельный approval для этого advisory-слоя не требуется; внешние записи через него запрещены.
6. **Source quality pass.** Для каждого источника: authority, freshness, directness, independence, specificity, relevance to decision. Noisy scrape не становится самостоятельным finding.
7. **Gap loop.** Не хватает источников по конкурентам, primary facts, user evidence или design implications — доищи или пометь `needs_validation`. Пустоту не заполняй «разумными» фактами.
8. **Contradiction review.** Расхождения между источниками и провайдерами уходят в `claims_to_validate`, а не «усредняются».
9. **Синтез в артефакты.** Собери шесть обязательных файлов (см. раздел 4). `scenario-user-flows.md` — человекочитаемая страница с реальными флоу: персона/роль, ситуация, шаги, действие, внешний участник/контур, статус, документ или доказательство, исключение, продуктовый ответ и способ проверки. Если тема не про платежи, поле «где находятся деньги» адаптируется в «где находится ценность / документ / статус / решение».
10. **Write gate.** До записи проверь: обязательные секции на месте, есть доменная конкретика, публикационные секции на русском, provider coverage записан, факты source-backed, claims-to-validate выделены, generic placeholders отсутствуют. Слабый candidate не имеет права молча затирать более полный существующий artifact.
11. **Lint.** Прогони `yarn research:lint <run-dir>` — это исполняемая проверка Rules 1-6 Anti-AI-Slop Gate.
12. **Ledger.** Обнови `handoff-bundle.md` и `stage-gate-ledger.md`: `inputs_used`, provider requested/used/unavailable/failures, результат write gate и lint.

Менять можно только артефакты текущего run directory. Внешние записи (Notion, Figma, git) из этого skill запрещены — `deny: external_write` в source policy.

## 4. Evidence и failure modes

Обязательные выходы:

| Артефакт | Что доказывает |
|---|---|
| `research-summary.md` | Findings с источниками, provider log, source quality pass, unknowns |
| `scenario-user-flows.md` | Индекс флоу, подробные P0/P1 флоу, сквозная карта статусов, проверка флоу |
| `competitive-analysis.md` | Конкуренты и альтернативы с evidence |
| `proto-personas.md` | Персоны со статусом evidence |
| `synthetic-interviews.md` | Интервью со статусом evidence: `synthetic` |
| `swot.md` | SWOT с evidence/status |

Дополнительно в ledger: research plan, evidence log, contradiction review, validation plan и claims-to-validate, research-to-design handoff (или `skipped_with_reason`).

Failure modes:

- **`partial`** — Tavily/primary provider вернул неполные результаты, часть research units пропущена со `skipped_with_reason`, или lint нашёл проблемы, которые не удалось исправить в этом run.
- **`blocked`** — нет ключа/доступа к source-backed provider и нет пользовательских источников: собрать research pack «из головы» нельзя.
- **Не является failure** — падение или шум DeepSeek/Gemini. Записывается `advisory_failed`/`skipped_with_reason`, readiness считается по Tavily/primary evidence.

Guardrails: synthetic interviews — только генератор гипотез, они не заменяют реальные интервью. Pricing, market size, competitor claims и user behavior без источника получают `needs validation`.

## 5. Validation gates

- [ ] Artifact context inventory выполнен, `inputs_used` перечисляет реально прочитанные файлы run.
- [ ] Все шесть обязательных артефактов созданы, либо для каждого отсутствующего записан `skipped_with_reason`.
- [ ] Source-backed provider вернул usable results; provider requested/used/unavailable/failures записаны.
- [ ] Advisory-выводы DeepSeek/Gemini не попали в факты и не посчитаны как источники.
- [ ] Contradiction review выполнен, unresolved conflicts лежат в claims-to-validate.
- [ ] `yarn research:lint <run-dir>` пройден или blocker зафиксирован.
- [ ] `yarn workflow:validate <run-dir> --profile standard` пройден для продуктового run.
- [ ] Внешних записей не выполнялось; для Notion-публикации вызывается отдельный `notion-sync` после approval.

# Run Plan: research.agent deep research

## Запрос

Провести глубокое исследование A3 как API-поставщика для раздела "Дом" в приложениях Т-Банка и Альфа-Банка: юзкейсы жильцов, данные по адресу, ГИС ЖКХ, Госуслуги.Дом, управляющая компания, тарифы, начисления, аварийные контакты, отзывы пользователей, протоколы A3.

## Metadata

| Поле | Значение |
|---|---|
| Run ID | `a3-home-services-bank-apps-deep-research-2026-06-26` |
| Work type | `limited engineering task` / `deep_research` |
| Owner | `research.agent` |
| Output surface | `research_report` |
| Status | `partial` |

## Goal

Запустить полноценный `research.agent` / `deep-research.workflow` по теме A3 Home Services для раздела "Дом" в банковских приложениях Т-Банка и Альфа-Банка.

## План этапов

| Этап | Действие | Owner | Output |
|---|---|---|---|
| 00-intake | Подготовить recursive brief, run-plan, handoff, ledger | orchestrator | intake artifacts |
| 01-research | Запустить `research.agent` через `yarn research:run` | research.agent | required research artifacts |
| quality gate | Проверить `yarn research:lint` и `yarn workflow:sync` | orchestrator | validation record |
| publication prep | Подготовить Notion-ready export после agent output | orchestrator/notion-publisher | `notion-research-export-ru.md` |

## Source Policy

```yaml
mode: deep_research
prefer:
  - tavily
  - user_sources
  - official_sources
  - competitor_sites
  - web_search
deny:
  - external_write
require_citations: true
fallback: needs_validation
advisory_models:
  deepseek: skipped_without_opt_in
  gemini: skipped_without_opt_in
```

## Required Outputs

- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Definition of Done

- `yarn research:run` executed for this run directory;
- source provider coverage recorded;
- all required research artifacts exist;
- Research Content Lint passes or blocker is recorded;
- `handoff-bundle.md` and `stage-gate-ledger.md` record agent run result.

## Ограничения

- Не подменять работу `research.agent` ручным синтезом.
- Strict topic boundary: только `Дом`, жильцы, ЖКХ, адрес, дом, УК/ТСЖ, начисления, тарифы, показания, капремонт, аварийные контакты, обращения, семейная оплата жилья. Не уходить в A3 Pay, travel, auto, subscriptions, e-commerce, merchant payments.
- Не выполнять Notion/Figma/deploy/git external write без exact approval.
- DeepSeek/Gemini не запускать без отдельного opt-in.
- Если source-backed provider недоступен или возвращает недостаточное покрытие, фиксировать `partial` и `needs_validation`.
- Публично непроверяемые сведения о A3 endpoint names, Т-Банк/Альфа feature scope и банковских ограничениях помечать как гипотезы.

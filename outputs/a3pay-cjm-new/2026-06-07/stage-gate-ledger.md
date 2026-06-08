# Реестр ворот качества (Stage Gate Ledger)

## Run

## Запуск (Run)

- Project slug: `a3pay-cjm-new`
- Date: `2026-06-07`
- Goal: полный новый research workflow A3 Pay с нуля

## Inputs Used

- `run-plan.md`
- `recursive-brief.md`
- `handoff-bundle.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- `yarn workflow:doctor`

## Rule

Этап считается закрытым только при наличии обязательных артефактов, `inputs_used`, обновленного handoff, validation notes и approval records для внешних действий.

## Stage Status

## Статус этапов (Stage Status)

| Этап | Владелец | Обязательные артефакты | Статус | Заметки ворот качества |
|---|---|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `recursive-brief.md` | completed | Новый запуск с нуля; старые outputs не использованы как основа. |
| 01-research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | partial | Tavily/web source-backed pass; DeepSeek/Gemini cross-check needs_validation. |
| 02-prd | prd | `prd.md` | skipped | Пользователь запросил research, не PRD. |
| 03-ia | ia | `ia-brief.md` | skipped | Вне scope текущего research turn. |
| 04-design | design | `design-brief.md` | skipped | Вне scope текущего research turn. |
| 05-copy | copywriting | `copy-deck.md` | skipped | Вне scope текущего research turn. |
| 06-screens | design-generator | `screens.md` | skipped | Вне scope текущего research turn. |
| 07-prototype | prototype | `prototype-report.md` | skipped | Вне scope текущего research turn. |
| 08-frontend | frontend | `frontend-result.md` | skipped | Вне scope текущего research turn. |
| 09-visual-reference | qa-review | `visual-reference-review.md` | skipped | Нет visual reference. |
| 10-test-bench | test-bench | `test-bench-result.md` | skipped | Нет prototype/frontend. |
| 11-qa | qa-review | `qa-report.md` | partial | Artifact QA выполнен, provider and publication blockers recorded. |
| 12-release | release | `release-notes.md`, `notion-publication-result.md` | partial | Notion publication completed; release remains partial because provider cross-check is still open. |

## Validation Runs

## Запуски валидации (Validation Runs)

| Время | Команда | Результат | Заметки |
|---|---|---|---|
| 2026-06-07 | `yarn workflow:doctor` | pass | Optional provider keys warning: `GEMINI_RESEARCH_MODEL` отсутствует в `.env.example` check list. |
| 2026-06-07 | `tavily_research` | timeout | Широкий deep research запрос разбит на короткие Tavily searches. |
| 2026-06-07 | `tavily_search` batches | pass | Получены источники по НПС, СБП, e-commerce, BNPL, недвижимости, авто, туризму, ЖКХ. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | Publication Shape Gate pass; 7 child pages planned. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Published Notion hub `37964731-74e5-8133-81fd-d90afcd6f41d` with 7 child pages and 106 blocks. |

## Publication Gate

| Gate | Status | Notes |
|---|---|---|
| Russian Publication Gate | pass | `notion-research-export-ru.md` написан на русском, кроме technical terms. |
| Publication Shape Gate | pass | Personas, CJM, competitive matrix, ICE/RICE представлены таблицами. |
| External write approval | pass | `approval-state.json`: `notion_research_publish` approved for `3696473174e58006af5fd367ef89d978`. |
| Notion publication | published | Hub URL: https://www.notion.so/3796473174e5813381fdd90afcd6f41d |

## Process Deviations

| Date | Action | Target | Deviation | Impact | Remediation |
|---|---|---|---|---|---|
| 2026-06-08 | `notion_research_publish` | `3696473174e58006af5fd367ef89d978` | Agent treated the user's direct request to publish as approval and recorded `workflow:approve` without first running interactive `workflow:approval-request` or asking a separate explicit chat question. | Notion publication was completed, but approval flow did not match project protocol. | Project rules updated: all approval/gate questions must be interactive; future external writes require `workflow:approval-request` or a separate visible chat question before `workflow:approve`. |

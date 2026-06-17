# Run Plan

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Project slug | `a3pay-cjm-new` |
| Date | `2026-06-07` |
| Workflow type | `full product workflow / research-focused` |
| Execution mode | `local + source-backed web research` |

## Goal

Запустить новый исследовательский workflow с нуля для A3 Pay, не используя прежние похожие `outputs/a3pay-cjm/*` как основу. Итог: карта платежной экосистемы России, CJM ключевых жизненных сценариев, карта точек интеграции A3 Pay, конкурентный анализ, ICE/RICE приоритизация, backlog возможностей и стратегия развития на 12-24 месяца.

## Запрос

Пользователь попросил запустить полный research по A3 Pay с нуля и довести полноценный research flow до конца, игнорируя наличие похожих прошлых результатов.

## План этапов

| Этап | Действие | Статус |
|---|---|---|
| 00-intake | Новый бриф и run ledger | completed |
| 01-research | Source-backed research pack | partial |
| Notion export | Подготовить публикационный пакет | prepared |
| External publication | Опубликовать research hub в Notion | completed |
| Advisory provider check | DeepSeek/Gemini contradiction review | logged |

## Ограничения

- Не использовать старые A3Pay outputs как основу.
- Не выполнять внешнюю публикацию без exact approval.
- Не маркировать research as `ready`, пока source-backed evidence, legal/rails и custdev gaps не имеют явного pass/deviation record. DeepSeek/Gemini не входят в default-run; при явном opt-in они работают только как advisory checks и сами по себе не блокируют readiness.

## Inputs Used

- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- Сообщение пользователя от `2026-06-07`: "запусти полный ресерч... новый с нуля..."
- `AGENTS.md`
- `yarn workflow:doctor`

## Scope

| Area | Included | Notes |
|---|---|---|
| Intake | yes | Новый бриф создан с нуля. |
| Deep research | yes | Source-backed synthesis по официальным и рыночным источникам. |
| CJM | yes | Крупные жизненные сценарии и отрасли. |
| Competitive analysis | yes | СБП, банки, Pay-сервисы, экосистемы, BNPL, кошельки, международные аналоги. |
| ICE/RICE | yes | Оценка как продуктовая гипотеза, не финансовая модель. |
| Notion export | published | Hub: https://www.notion.so/3796473174e5813381fdd90afcd6f41d |
| PRD/frontend | out of scope for this turn | Пользователь запросил полный research, не реализацию интерфейса. |

## Source Policy

| Provider | Required by project default | Used in this run | Status |
|---|---:|---:|---|
| tavily | yes | yes | pass |
| web search/open sources | allowed | yes | pass |
| deepseek | yes | no | needs_validation: нет подтвержденного локального provider call в текущей сессии |
| gemini | yes | no | needs_validation: optional provider keys предупреждены `workflow:doctor` |

Research stage остается `partial` из-за legal/rails и custdev gaps. DeepSeek/Gemini не являются source-backed evidence: их failure или шум фиксируется как advisory note, но не делает stage `partial` при полноценной source-backed базе.

## Deliverables

| Artifact | Status |
|---|---|
| `recursive-brief.md` | completed |
| `research-summary.md` | partial / source-backed |
| `competitive-analysis.md` | completed |
| `proto-personas.md` | completed |
| `synthetic-interviews.md` | completed |
| `swot.md` | completed |
| `cjm-map.md` | completed |
| `opportunity-roadmap.md` | completed |
| `notion-research-export-ru.md` | published |
| `notion-publication-plan.md` | completed |
| `notion-publication-result.md` | completed |
| `qa-report.md` | partial |
| `release-notes.md` | partial |

## Known Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| Gemini advisory failure после legacy auto-run | Research keeps advisory caveat; readiness depends on source-backed/legal/custdev gates | В этом historical pass DeepSeek/Gemini были запущены без approval; DeepSeek прошёл, Gemini вернул `503 Service Unavailable`. По текущим правилам DeepSeek/Gemini не входят в default-run и запускаются только при explicit opt-in. |

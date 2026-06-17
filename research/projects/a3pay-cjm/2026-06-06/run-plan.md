# Run plan: новое исследование A3 Pay CJM

| Поле | Значение |
|---|---|
| Project slug | `a3pay-cjm` |
| Run date | `2026-06-06` |
| Workflow type | `full product workflow / research-focused` |
| Request type | `full product workflow` с ограничением на research-stage |
| Status | `ready_for_publication` |

## Цель

Провести новое исследование платежных сценариев России для A3 Pay: собрать source-backed картину платежной экосистемы, CJM ключевых жизненных сценариев, конкурентную карту, матрицу возможностей, ICE/RICE и стратегические рекомендации на 12-24 месяца.

## Запрос

Пользователь попросил провести новое полное исследование по тематике A3 Pay согласно полноценному research flow проекта, используя расширенный research request с Desktop.

## План этапов

1. Зафиксировать intake и run ledger.
2. Собрать source-backed research по платежной экосистеме России.
3. Подготовить обязательные research artifacts.
4. Подготовить CJM, opportunity roadmap, ICE/RICE.
5. Подготовить `notion-research-export-ru.md` без внешней публикации.
6. Запустить `workflow:sync` и validation до доступного статуса.

## Ограничения

- Не выполнять external write без exact approval.
- Не заявлять Tavily/DeepSeek/Gemini success без фактического provider call.
- Не использовать старый run как доказательство текущей проверки.
- Не сохранять secrets.

## Inputs Used

- Пользовательский запрос в текущем чате от 2026-06-06.
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`.
- `AGENTS.md` contract, присланный пользователем.
- `agent-pack/workflows/deep-research.workflow.md`.
- `agent-pack/skills/notion-sync/SKILL.md`.
- Существующий контекст `outputs/a3pay-cjm/2026-06-05/` прочитан только как навигационный контекст; он не считается доказательством текущего provider coverage.

## Scope

В рамках этого run выполняется research-stage и подготовка publication-ready export. PRD, IA, дизайн, Figma write, frontend, deploy и git write не входят в текущую задачу.

## Required Artifacts

- `recursive-brief.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `cjm-map.md`
- `opportunity-roadmap.md`
- `source-log.md`
- `notion-research-export-ru.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`

## Provider Status

| Provider | Status | Notes |
|---|---|---|
| Web search | `used` | Использован для свежих source-backed источников на 2026-06-06. |
| Tavily | `pass` | Повторный research pass вернул usable output; шумные источники отфильтрованы из publication pack. |
| DeepSeek | `pass` | Runtime provider call выполнен для contradiction/cross-check. |
| Gemini | `pass` | Runtime provider call выполнен для strategy/cross-check. |

## Quality Gate

Research artifacts имеют статус `ready`: `workflow:validate --through 01-research` прошел без ошибок. Рыночные и количественные claims остаются привязанными к source-backed источникам из `source-log.md`; DeepSeek/Gemini не считаются самостоятельными источниками фактов.

## Publication Shape Gate Update

- Local publication export is fixed after initial Notion publication.
- `notion-research-export-ru.md` now uses tables/schemes for personas, CJM, competitors and ICE/RICE.
- Dry-run passed with `publication_shape_gate.pass=true`.
- Published Notion hub remains the historical pre-fix publication until a new interactive approval is recorded.

## External Writes

Пользователь разрешил публикацию в текущем чате. Exact target для Notion publication: `3696473174e58006af5fd367ef89d978`.

# Реестр ворот качества (Stage Gate Ledger)

## Запуск (Run)

- Project slug:
- Date:
- Goal:
- Profile: standard | reference
- Scale: full | increment | patch   <!-- CLAUDE.md §0.2; не уверен — full -->

## Правило (Rule)

Каждый этап считается завершенным только когда:

- обязательные артефакты этапа записаны в `outputs/<project-slug>/<YYYY-MM-DD>/`;
- каждый артефакт содержит раздел `## Inputs Used`, кроме `run-plan.md` и `handoff-bundle.md`;
- `handoff-bundle.md` обновлен после завершения этапа;
- неизвестные аспекты (unknowns), предположения (assumptions), риски (risks) и следующий требуемый артефакт (next required artifact) явно перенесены дальше;
- фактические локальные команды, решения и ручные approvals фиксируются в заметках этапа;
- если этап создает пользовательскую поверхность, заполнен Surface Output Gate: тип поверхности, заявленный охват, coverage result, evidence map и verification evidence;
- external writes имеют явную approval-запись в `approval-state.json`; если последняя matching-запись является denial, действие считается заблокированным;
- `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` не возвращает ошибок для пакета стандартного профиля (standard profile) без визуального референса;
- `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference` не возвращает ошибок для пакета профиля референса (reference profile) с визуальным референсом;
- если run идёт не на полном масштабе, стадии вне масштаба отмечены статусом `skipped_by_scale` с указанием масштаба ДО их старта; масштаб не понижается задним числом (валидатор отклонит run, где стадия вне масштаба уже отработала);
- в случае настройки интеграции с Notion на стадии релиза подготовлен Agile export plan/dry-run, а внешняя запись Agile-доски выполнена только при наличии exact approval `notion_agile_export` для целевой страницы/базы.

## Статус этапов (Stage Status)

Статусы: `pending` | `success` | `partial` | `blocked` | `skipped_with_reason` | `skipped_by_scale`.
Ниже — полный набор стадий (масштаб `full`). При `increment`/`patch` отметь исключённые стадии как `skipped_by_scale`, а не удаляй строки: пропуск должен быть виден.

| Этап | Владелец | Обязательные артефакты | Статус | Заметки ворот качества |
|---|---|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `recursive-brief.md` | pending |  |
| 01-research | research | `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | pending | Вне масштабов increment/patch -> `skipped_by_scale` |
| 02-prd | prd | `prd.md` | pending | Вне масштабов increment/patch -> `skipped_by_scale` |
| 03-ia | ia | `ia-brief.md` | pending | Вне масштабов increment/patch -> `skipped_by_scale` |
| 04-design | design | `design-brief.md` | pending |  |
| 05-copy | copywriting | `copy-deck.md` | pending | Вне масштаба patch -> `skipped_by_scale` |
| 06-screens | design-generator | `screens.md` | pending | Вне масштаба patch -> `skipped_by_scale` |
| 07-prototype | prototype | `prototype-report.md` | pending | Вне масштабов increment/patch -> `skipped_by_scale` |
| 08-frontend | frontend | `frontend-result.md` | pending |  |
| 09-visual-reference | qa-review | `visual-reference-review.md` | skipped | Только для reference profile |
| 10-test-bench | test-bench | `test-bench-result.md` | pending | Вне масштабов increment/patch -> `skipped_by_scale` |
| 11-qa | qa-review | `qa-report.md` | pending |  |
| 12-release | release | `release-notes.md` | pending | Вне масштаба patch -> `skipped_by_scale` |

## Запуски валидации (Validation Runs)

| Время | Команда | Результат | Заметки |
|---|---|---|---|

## Surface Output Gates

| Этап | Поверхность | Заявленный охват | Coverage result | Evidence map | Verification evidence | Статус |
|---|---|---|---|---|---|---|
| 04-design |  |  |  |  |  | pending |
| 06-screens |  |  |  |  |  | pending |
| 08-frontend |  |  |  |  |  | pending |
| 11-qa |  |  |  |  |  | pending |
| 12-release |  |  |  |  |  | pending |

## Agentic Preflight

| Время | Команда | Ready | Strict gate | Blocking stages | Заметки |
|---|---|---|---|---|---|

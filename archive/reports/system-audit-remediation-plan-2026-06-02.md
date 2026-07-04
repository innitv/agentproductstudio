# Remediation Plan — System Audit 2026-06-02

Источник: `reports/system-audit-2026-06-02.md`

## Цель

Превратить текущий workflow из набора формально валидируемых артефактов в систему, где runtime, validators, gates, QA и release говорят одним языком и не могут пропустить заблокированный run как успешный.

## Рабочие правила

- Исправлять сверху вниз: P0 сначала, затем P1, затем P2.
- После каждого блока запускать минимальные проверки и фиксировать результат.
- Не использовать прошлые `outputs/*` как источник правил, только как regression fixtures.
- Не затирать существующие пользовательские изменения в грязном working tree.

## Очередь задач

| ID | Приоритет | Задача | Definition of Done | Статус |
|---|---|---|---|---|
| R1 | P0 | Усилить `workflow:validate` gate-семантикой | Validator падает на blocked/failed full run, QA blocked + release ready, missing visual diff for reference profile | done |
| R2 | P0 | Ввести canonical status resolver | Есть единый mapper artifact status -> stage status -> run/release eligibility; regex остаётся fallback | done |
| R3 | P0 | Закрыть visual reference gate | `visual-diff-result.json` обязателен для reference profile; review не может быть passed без diff | done |
| R4 | P1 | Сделать screenshot capture универсальным CLI | `capture-local-screenshots.mjs` принимает URL/slug/section map, без Apple/A3 defaults в workflow path | done |
| R5 | P1 | Убрать hardcoded comparison template из visual review | Areas строятся из section pairs / reference-analysis, generic SaaS текст исчезает | done |
| R6 | P1 | Переписать `workflow:sync` на canonical stages | Скрипт использует `workflow-stages.ts`, сохраняет `run_id`, `created_at`, `execution_mode`, умеет preview/diff | done |
| R7 | P1 | Добавить Playwright coverage текущего default product view | Тестируются `/`, hero, configurator, preorder form, mobile overflow | done |
| R8 | P2 | Усилить context truncation | Late-stage payload missing становится error; backups versioned; есть max-size/critical-fields gate | done |
| R9 | P2 | Добавить semantic config validators | Проверяются route/stage/schema/docs/script consistency, а не только snippets | done |
| R10 | P2 | Разобрать dirty tree на логические пачки | Изменения разделены на runtime/docs/frontend/outputs/visual tooling | done |

## Текущий фокус

Все задачи из отчета `reports/system-audit-2026-06-02.md` разложены и выполнены до уровня audit remediation `R1-R10`. Следующий рабочий режим: staged/commit/review по batch map.

## Проверки для R1

- `yarn workflow:test-validator`
- `yarn workflow:validate outputs/apple-iphone-17/2026-06-02 --profile standard` должен вернуть error из-за blocked/partial run-state.
- `yarn workflow:validate outputs/apple-iphone-17/2026-06-02 --profile reference` должен вернуть error из-за missing `visual-diff-result.json`.
- `yarn typecheck`
- `yarn validate:config`

## Журнал

| Время | Событие | Результат |
|---|---|---|
| 2026-06-02 | План создан | Начат R1 |
| 2026-06-02 | R1 выполнен | Добавлены semantic gates и regression tests; проблемный Apple output теперь валидируется с ошибками, а не с ложным success |
| 2026-06-02 | R2 выполнен | Добавлен `runtime/typescript/status-resolver.ts`; validator, stage executor и run summary используют общий mapper статусов |
| 2026-06-02 | R3 выполнен | `visual-reference-review.ts` теперь блокирует gate без `visual-diff-result.json`; добавлен regression-test `test-visual-reference-review.ts` |
| 2026-06-02 | R4 выполнен | `capture-local-screenshots.mjs` переписан как универсальный CLI с URL/slug/output-dir/section map; добавлен CLI regression-test |
| 2026-06-02 | R5 выполнен | `visual-reference-review.ts` строит comparison areas из section diff, visual diff или screenshot evidence; generic SaaS template убран |
| 2026-06-02 | R6 выполнен | `workflow:sync` переведён на `runtime/typescript/sync-run-state.ts`, использует `workflow-stages.ts`, сохраняет metadata и поддерживает `--preview` |
| 2026-06-02 | R7 выполнен | `tests/playwright/frontend.spec.ts` теперь покрывает default A3 Aero view, configurator/preorder flow и horizontal overflow на desktop/mobile |
| 2026-06-02 | R8 выполнен | `context-truncator.ts` теперь требует structured payload для late stages, делает versioned backups и проверяет critical sections/max-size |
| 2026-06-02 | R9 выполнен | Добавлен `validate-config-semantics.ts`; `yarn validate:config` теперь проверяет route/stage/schema/script consistency |
| 2026-06-02 | R10 выполнен | Создан `reports/git-cleanup-batches-2026-06-02.md` с batch map для staged/review/commit без смешивания audit, agentic, frontend и outputs |

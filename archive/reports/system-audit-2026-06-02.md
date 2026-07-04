# System Audit — Product Agent Studio

Дата: 2026-06-02

## Краткий вывод

Система в целом собирается и базовые runtime-тесты проходят, но сейчас есть несколько системных рассинхронов, из-за которых workflow может формально проходить проверки и одновременно оставаться заблокированным или непроверенным по сути.

Главный дефект: `workflow:validate` проверяет наличие файлов, секций и schema payload, но почти не проверяет gate-семантику: статусы стадий, противоречие `qa-report.md` vs `release-notes.md`, обязательный pixel diff, соответствие `run-state.json` и `stage-gate-ledger.md`.

## Проверки

| Команда | Результат | Примечание |
|---|---|---|
| `yarn workflow:doctor` | pass | Есть предупреждение по optional provider keys. |
| `yarn validate:config` | pass | Config validation passed. |
| `yarn docs:audit` | pass | Documentation audit passed. |
| `yarn typecheck` | pass | `tsc --noEmit` passed. |
| `yarn workflow:test-agentic` | pass | 26 проверок agentic rollout/approval/executor/readiness/engine passed. |
| `yarn qa:playwright` | pass | 6 Playwright tests passed, но тесты покрывают console flow, а не текущий `EsportsMouseView`. |
| `yarn workflow:validate outputs/apple-iphone-17/2026-06-02 --profile standard` | pass | 0 errors, 0 warnings, несмотря на blocked run-state. |
| `yarn workflow:validate outputs/apple-iphone-17/2026-06-02 --profile reference` | pass | 0 errors, 0 warnings, несмотря на missing visual diff. |
| `yarn workflow:status outputs/apple-iphone-17/2026-06-02` | blocked | QA blocked, release pending, stages 01-08 partial. |
| `yarn workflow:agentic-preflight outputs/apple-iphone-17/2026-06-02 --strict` | fail | Ожидаемо: run создан в `local` mode, не `agentic`. |

## Findings

### P0 — `workflow:validate` не ловит blocked/partial run как fail

Факт: оба профиля валидации для `outputs/apple-iphone-17/2026-06-02` вернули `0 errors, 0 warnings`, при этом `workflow:status` показывает `Status: blocked`, `01-research`-`08-frontend` как `partial`, `11-qa` как `blocked`.

Причина: `runtime/typescript/validate-workflow-run.ts` проверяет директорию, наличие обязательных файлов, размеры, секции, placeholder-like text, `inputs_used` и schema subset. Он не сверяет:

- `run-state.json`;
- `stage-results/*.json`;
- `stage-gate-ledger.md`;
- blocking statuses;
- соответствие QA verdict release status;
- mandatory visual diff evidence.

Риск: агент может утверждать, что workflow прошел validation, хотя продуктовый gate фактически заблокирован.

Рекомендация:

1. Разделить validation profiles:
   - `structure` — текущая проверка формата;
   - `gate` — статусы, ledger, run-state, approvals, visual diff;
   - `release` — QA pass + Notion/Figma/deploy approvals.
2. Для `--profile standard|reference` по умолчанию включить gate semantics.
3. Если `run-state.status` равен `blocked|partial|failed`, полный validate должен возвращать warning/error, а не pass.

### P0 — единый источник правды по статусу отсутствует

В текущем `apple-iphone-17` одновременно:

- `run-state.json`: run `blocked`, QA `blocked`;
- `qa-report.md`: `status: blocked`;
- `release-notes.md`: `status: ready`;
- `stage-gate-ledger.md`: QA `completed`;
- `visual-reference-review.md`: body `passed_with_notes`, schema payload `passed`, при этом diff missing.

Риск: любой следующий агент может прочитать другой файл и принять противоположное решение.

Рекомендация:

1. Ввести canonical status resolver в runtime:
   - читает schema payload каждого artifact;
   - мапит artifact status в `WorkflowStageStatus`;
   - сверяет `run-state`, `stage-results`, `stage-gate-ledger`, artifacts.
2. `release` может быть `ready/released` только если QA status `pass|pass_with_known_limitations` и нет active blockers.
3. `stage-gate-ledger.md` должен быть производным журналом, а не источником truth.

### P0 — visual reference gate декларирован строже, чем реализован

AGENTS и quality gates требуют:

- парные reference/local screenshots;
- `yarn reference:diff`;
- `visual-diff-result.json`;
- blocked gate без pixel diff.

Факт: `visual-reference-review.md` для Apple/A3 содержит:

- `Visual diff was not found`;
- `Run yarn reference:diff...`;
- `Pixel-level image diff is not implemented yet`;
- при этом schema payload status = `passed`, body gate = `passed_with_notes`.

Риск: reference-driven задачи могут финализироваться без обязательного diff.

Рекомендация:

1. `visual-reference-review.schema.json` должен требовать `visual_diff_result_path` или `visual_diff_status`.
2. `validateWorkflowRun(... --profile reference)` должен проверять физическое наличие `visual-diff-result.json`.
3. `visual-reference-review.ts` должен выставлять `blocked`, если diff missing.

### P1 — `capture-local-screenshots.mjs` захардкожен под Apple/A3

Файл содержит:

- `REFERENCE_URL = "https://www.apple.com/iphone-17/"`;
- `LOCAL_URL = "http://127.0.0.1:5173/"`;
- `OUTPUT_DIR = reports/visual-review/apple-iphone-17`;
- фиксированные секции Apple и A3.

При этом `AGENTS.md` описывает этот скрипт как обязательный универсальный шаг.

Риск: следующая reference-driven задача будет использовать старый Apple/A3 скрипт или потребует ручного переписывания.

Рекомендация:

1. Переделать скрипт в CLI:
   - `node tooling/scripts/capture-local-screenshots.mjs --reference-url ... --local-url ... --slug ... --sections sections.json`
2. Section map брать из `reference-analysis.md` / `screens.md`.
3. Запретить hardcoded project defaults, кроме smoke example.

### P1 — `visual-reference-review.ts` содержит нерелевантный hardcoded comparison template

`comparisonAreas` описывает generic blue SaaS landing: Header, Hero with blue gradient, Logo strip, Modules/cards, Steps, Lead form. Это не соответствует Apple/A3 и не будет соответствовать большинству референсов.

Риск: генератор создает правдоподобные, но ложные review sections.

Рекомендация:

1. Убрать hardcoded `comparisonAreas`.
2. Генерировать areas из:
   - `reference-analysis.md`;
   - найденных пар `reference-*-section-<name>` / `local-*-section-<name>`;
   - optional section map JSON.
3. Если section map недоступен, gate = `blocked`, а не generic review.

### P1 — `sync-run-state.mjs` дублирует workflow stages вручную

Скрипт имеет собственные `stageToArtifacts`, `stageTitles`, `allStages` и эвристику статусов по regex. Он не импортирует `workflow-stages.ts`, не сохраняет `execution_mode`, может перегенерировать `run_id`.

Риск: ручная синхронизация создает состояние, которое расходится с runtime engine.

Рекомендация:

1. Переписать `sync-run-state.mjs` на TypeScript или JS wrapper, который импортирует canonical `workflowStages`, `artifactFiles`, schemas.
2. Не перезаписывать `run_id`, `created_at`, `execution_mode`, если они уже есть.
3. Синхронизация должна возвращать diff/preview перед записью.

### P1 — Playwright QA не покрывает текущий default product view

`tests/playwright/frontend.spec.ts` ходит на `/#console` и проверяет SaaS Console. Текущий `App.tsx` по умолчанию открывает `EsportsMouseView`.

Риск: `yarn qa:playwright` проходит, но не проверяет текущий лендинг, форму заказа, цветовой configurator и главный CTA.

Рекомендация:

1. Добавить тесты default `/` view:
   - hero visible;
   - color selector changes product image/state;
   - preorder form validation/success;
   - no horizontal overflow mobile;
   - primary CTA visible.
2. Разделить tests:
   - `qa:console`;
   - `qa:frontend-current`;
   - `qa:reference`.

### P1 — status taxonomy размножена

Есть разные статусные словари:

- agent output: `success|partial|blocked`;
- workflow stage: `completed|partial|blocked|failed|skipped`;
- product artifacts: `draft|partial|blocked|ready`;
- QA: `pass|pass_with_known_limitations|fail|blocked`;
- visual: `passed|passed_with_notes|blocked`;
- release: `ready|blocked|released`.

Runtime частично мапит `success -> completed`, но многие проверки делают regex по Markdown.

Риск: один и тот же stage может считаться `ready`, `completed`, `pass` или `blocked` в зависимости от файла.

Рекомендация:

1. Ввести `status-map.ts`:
   - artifact status -> stage status;
   - stage status -> run status;
   - release eligibility.
2. Убрать regex status detection как основной механизм.
3. Требовать structured payload для всех stage artifacts в complete workflow.

### P2 — `context-truncator.ts` может терять важный контекст

Truncator оставляет только YAML/JSON payloads. Если payload отсутствует, пишет `No structured payload found`. При этом validator сейчас считает отсутствие payload warning, не error.

Риск: late-stage специалисты могут не получить важные решения/ограничения.

Рекомендация:

1. Начиная с `08-frontend`, structured payload должен быть обязательным error.
2. `handoff-bundle-full.md` не перезаписывать без versioned backups.
3. Добавить max-size и critical fields checklist.

### P2 — config validators проверяют snippets, а не структуру

`validate-config.mjs` в основном ищет required snippets в файлах. Это полезно как smoke, но не ловит противоречия вроде `QA blocked + release ready` или `visual diff missing + visual passed`.

Рекомендация:

1. Оставить snippet audit как smoke.
2. Добавить semantic validators:
   - route/stages/templates consistency;
   - schemas vs workflow-stages consistency;
   - commands referenced in docs exist in `package.json`;
   - scripts referenced in AGENTS are generic, not hardcoded.

## Рекомендуемый порядок исправления

1. **Gate validator first.** Усилить `validate-workflow-run.ts`, чтобы blocked/partial run, missing visual diff, QA blocked/release ready и ledger/run-state mismatch не проходили как clean validation.
2. **Canonical status resolver.** Ввести `runtime/typescript/status-map.ts` и использовать его в engine, sync, validate.
3. **Visual pipeline generic.** Параметризовать `capture-local-screenshots.mjs`, убрать hardcoded comparisonAreas из `visual-reference-review.ts`, требовать `visual-diff-result.json`.
4. **Frontend QA coverage.** Добавить Playwright тесты для текущего default product view и формы.
5. **Sync script rewrite.** Переписать `workflow:sync` на canonical stage config и сделать preview/diff.
6. **Context truncation hardening.** Сделать structured payload обязательным для late-stage handoff.
7. **Dirty tree cleanup.** Разделить текущие изменения на логические пачки: runtime agentic, docs/rules, frontend Apple/A3, outputs, visual tooling.

## Что уже работает

- `workflow:doctor`, `docs:audit`, `validate:config`, `typecheck` проходят.
- Agentic rollout/approval/readiness/executor/engine tests проходят.
- Agents SDK layer собирает standard/reference route tools.
- Базовая структура `outputs/<project-slug>/<YYYY-MM-DD>` согласована лучше, чем раньше.
- Approval gate для model provider calls работает в тестах.

## Главный next step

Начать с `validate-workflow-run.ts`: пока validator не умеет отличать “файлы похожи на артефакты” от “workflow gate реально пройден”, остальные улучшения будут маскироваться зелёными проверками.

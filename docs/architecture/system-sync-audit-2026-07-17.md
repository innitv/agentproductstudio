# Глубокий аудит синхронизации системы — 2026-07-17

## Цель

Сквозная проверка после дня изменений (резка §10–§12 guide → плагин, `plugin:link`, выравнивание skills, ось `scale`): сходятся ли runtime, контракты, обёртки, команды, шаблоны и документация.

## Метод

- Машинная база: `workflow:test-agentic` (13), `qa:quick`, `doctor`, `workflow:skills` — прогнаны оркестратором.
- Два параллельных субагента: срез по оси `scale` (где должны знать, но не знают) и срез агенты↔skills (обёртка ↔ контракт ↔ manifest).
- **Все находки верифицированы оркестратором первоисточником.** Две отсеяны как ложные.

## Верификация находок субагентов

| Находка | Вердикт |
|---|---|
| `output-metadata.ts` scale-blind (3 вызова, интерфейсы без scale) | **Подтверждено.** `grep`: 0 упоминаний `scale` в файле; `createArtifactManifest(state)` заново звал `getWorkflowStagesForProfile(state.profile)` без scale |
| `CLAUDE.md:130` не знает scale-исключения | **Подтверждено** чтением строки. Прямое противоречие §0.2 |
| Оркестратор (обёртка + контракт) не знает про scale | **Подтверждено:** `grep -c scale` = 0 в обоих файлах |
| `/workflow-start` определяет scale, но безусловно стартует research | **Подтверждено** чтением файла |
| `artifact-driven-pipeline.md` scale-agnostic, на него ссылаются start/resume | **Подтверждено** |
| `skills:` обёртка ≠ контракт у 5 агентов | **Подтверждено.** Причина, почему тесты молчали: `agent-metadata.ts` читает skills **из контрактов**, обёртки не сверяются вовсе |
| `notion_research_export_ru` не в `artifactNames` | **ЛОЖЬ.** В явном allowlist `agent-metadata.ts:96`. Осознанное решение, не дыра |
| `approval_record` не в `artifactNames` | **ЛОЖЬ.** В allowlist `skill-metadata.ts:53` |
| `.claude/hooks/*`, `agent-pack/schemas/*`, `validate-config-semantics.ts`, `context-truncator.ts` | **Scale не нужен** — обосновано (guards без run-контекста; content-схемы; self-consistency манифеста; индексная логика на надмножестве не искажается) |

## Исправлено

### P0. `output-metadata.ts` — манифест игнорировал масштаб

`createArtifactManifest` строил список артефактов по полному pipeline независимо от `state.scale`. Следствие: для `increment`/`patch` run артефакты research/PRD/IA попадали в `## Missing Artifacts` в `artifact-manifest.json`, `run-index.md`, `workflow:inspect` — то есть легитимно пропущенная стадия выглядела как забытая. Это ровно то, что CLAUDE.md §0.2 запрещает («молчаливый пропуск неотличим от забытой стадии»), только произведённое кодом.

Проведён scale: `createArtifactManifest`, `createArtifactManifestFromInspectionState`, поля `workflow_scale` в `RunMeta` / `ArtifactManifest` / `WorkflowRunListItem`, показ `Scale` в `workflow:inspect` и колонка `Scale` в `workflow:list` (раньше `workflow-engine` печатал scale, а `inspect`/`list` — нет: два пути статуса врали по-разному).

`normalizeManifestArtifacts` оставлен на полном списке осознанно — это lookup-map по `stage_id` над уже отфильтрованными артефактами, надмножество безопасно.

Проверено на живом прогоне: `full` → 20 артефактов, `increment` → 10, `patch` → 7; `research_summary`/`prd` исчезают из малых масштабов, `run_plan` и `qa_report` остаются во всех.

### P0. Правило frontend противоречило §0.2

`CLAUDE.md:130`, `.claude/agents/orchestrator.md`, `agent-pack/agent-contracts/orchestrator.agent.md` знали единственное исключение — `quick draft`. Буквальное следование заблокировало бы frontend на легитимном `increment`/`patch`, где PRD/IA/prototype отсутствуют по масштабу. Добавлено исключение для `skipped_by_scale` с явным различением: «отсутствие по масштабу зафиксировано в ledger до старта; отсутствие по забывчивости блокирует frontend».

### P0. Оркестратор не знал, что должен выбирать масштаб

Routing Classification Pass в обеих копиях не включал scale — главная сессия не получала инструкции фиксировать масштаб на intake, хотя CLAUDE.md этого требует. Правило держалось только на том, что модель случайно прочитает §0.2. Добавлено в обе копии, в контракт — с полным правилом (оси, дефолт `full`, что не режется, `skipped_by_scale`, запрет понижения).

### P0. `/workflow-start` — внутреннее противоречие

Шаг 11 определял масштаб, шаг 15 безусловно делегировал research — для `increment`/`patch` неверно (там первая продуктовая стадия — design). Исправлено: делегируется первая стадия, входящая в масштаб.

### P0. `artifact-driven-pipeline.md` — корень проблемы

Документ, на который ссылаются `/workflow-start` и `/workflow-resume` как на источник порядка стадий, описывал только `full`. Добавлен раздел «Масштаб (scale): какая часть последовательности обязательна» с таблицей исключений и явным указанием: машинный источник — манифест, документ описывает порядок.

### P1. `/workflow-resume` — двусмысленность

Инструкция «определи следующий этап по последовательности из pipeline-документа» конфликтовала с `yarn workflow:resume`, который учитывает scale. Переписано: следующий этап определяет persisted state, документ — справка; при расхождении верить state.

### P1. `skills:` обёртка ≠ контракт у 5 агентов

`copywriting` (нет `anti-ai-slop`), `design` и `design-generator` (нет `ds-baseline`, `figma-ds-ingest`, `approval-gate`), `frontend` (нет `figma-ds-ingest`), `qa-review` (нет `anti-ai-slop`, `figma-ds-ingest`). Обёртка — то, что исполняет Claude Code; контракт — источник правды по CLAUDE.md. Валидатор расхождение не ловил: `agent-metadata.ts` читает состав из контрактов и обёртки не сверяет.

Все 9 агентов с непустым `skills:` выровнены по контрактам; сверка обёртка↔контракт проходит для всех.

### P1. `stage-gate-ledger.template.md` — нет места для scale

Skill `run-ledger` требует фиксировать `skipped_by_scale`, но шаблон, который агент реально копирует, не имел ни поля `Scale`, ни образца статуса. Добавлены: поля `Profile`/`Scale` в «Запуск», правило про `skipped_by_scale` в «Правило», список допустимых статусов и пометки в заметках стадий, какие из них выпадают на каких масштабах. Строки не удалять, а помечать — пропуск должен быть виден.

## Известные остатки (не чинил, вынесено осознанно)

| Что | Почему не чинил |
|---|---|
| `run-landing-workflow.ts` + `agents.sdk.ts` — legacy-путь `yarn landing:run` не знает scale | Отдельный entry point, не используется основным `workflow:start`/engine. Чинить = трогать legacy без нужды; если путь оживёт — параметризовать так же |
| `stage-handoff-contract.md` — матрица не показывает scale-зависимые входы | Документ читаемый, не исполняемый; манифест остаётся источником. Желательно, но не ломает гейт |
| `.claude/commands/{research,prd,ia,prototype,test-bench}.md` — нет preflight-проверки scale | Валидатор ловит постфактум ошибкой «Scale cannot be lowered». Превентивная проверка дешевле, но требует чтения run-state в каждой команде |
| `frontendPrerequisiteArtifacts` в манифесте не параметризован scale | Сейчас dead code (нигде не потребляется). Если подключат как gate — параметризовать, иначе повторит дефект правила frontend |
| `CLAUDE.md:173` — пример validate без `--scale` | Косметика: валидатор читает scale из `run-state.json`, флаг не обязателен |

## Валидация

- `yarn workflow:test-agentic` — 13/13 passed (включая `workflow validator regression`, `output metadata regression`).
- `yarn qa:quick` — typecheck / validate:config / docs:audit passed.
- `yarn workflow:doctor` — passed.
- Живой прогон манифеста по трём масштабам (20/10/7 артефактов, ledger и qa везде).
- Сверка `skills:` обёртка↔контракт для 9 агентов — совпадает.

## Изменённые файлы

- `runtime/typescript/output-metadata.ts` — scale в манифесте, meta, list, inspect.
- `CLAUDE.md` — правило frontend.
- `.claude/agents/orchestrator.md`, `agent-pack/agent-contracts/orchestrator.agent.md` — routing pass + scale, правило frontend.
- `.claude/commands/workflow-start.md`, `.claude/commands/workflow-resume.md` — первая стадия по масштабу, приоритет persisted state.
- `agent-pack/workflows/artifact-driven-pipeline.md` — раздел про масштаб.
- `.claude/agents/{copywriting,design,design-generator,frontend,qa-review}.md` — `skills:` по контрактам.
- `agent-pack/templates/stage-gate-ledger.template.md` — поля Scale/Profile, `skipped_by_scale`.

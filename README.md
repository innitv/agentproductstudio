# Product Agent Studio

Product Agent Studio — это рабочая среда для Claude Code, которая превращает продуктовый запрос в проверяемый набор артефактов: исследование, PRD, IA, дизайн-brief, спецификацию экранов, прототип, frontend, QA и release notes.

Проект не является обычным prompt pack. Он задает для Claude Code операционный контур: какие роли подключать, какие файлы читать, где хранить результаты, какие проверки выполнять и когда требовать подтверждение человека перед внешними действиями.

## Зачем нужен проект

Product Agent Studio помогает вести продуктовую работу не как длинный чат, а как воспроизводимый pipeline:

- один запрос раскладывается на этапы и артефакты;
- каждый этап фиксирует `inputs_used`, решения, риски и следующий шаг;
- результаты сохраняются в run ledger, а не теряются в переписке;
- frontend, Figma, Notion, research и QA живут в одном понятном процессе;
- внешние записи, публикации, деплой и model-provider calls проходят через approval.

Главный пользовательский сценарий один: работа через Claude Code внутри IDE или чата. Локальный TypeScript runtime, CLI-команды и валидаторы нужны как вспомогательный слой для проверки, синхронизации и сохранения состояния.

## Как устроен workflow

Claude начинает с классификации задачи и выбирает минимальный маршрут:

| Тип задачи | Когда используется | Что происходит |
| --- | --- | --- |
| `full product workflow` | Нужно провести продукт от идеи до реализации | Intake, research, PRD, IA, design, copy, screens, prototype, frontend, QA, release. |
| `reference-driven workflow` | Есть URL, screenshot, Figma, Dribbble или просьба "как этот сайт" | Добавляется reference scan, visual spec и `visual-reference-review.md`. |
| `quick draft` | Только по явной фразе пользователя ("быстрый набросок", "demo only") | Маршрут сокращается, результат помечается `partial`/`draft`, а не `success`. Запрещён для reference-driven задач и внешних публикаций. |
| `limited engineering task` | Нужна узкая правка кода, docs, runtime или rules | Делается scoped-правка без полного продуктового pipeline. |
| `cleanup/sorting` | Нужно разобрать outputs, research, архивы или dirty tree | Выполняется отдельно от feature work. |
| `external write` | Notion, Figma, deploy, секреты, удаление данных, git write | Требует exact approval до действия (см. «Публикации и внешние действия»). |

Базовый маршрут полного workflow:

```text
request
  -> recursive brief
  -> research
  -> PRD
  -> IA
  -> design brief
  -> copy deck
  -> screens
  -> prototype
  -> frontend
  -> test bench
  -> QA
  -> release notes
```

Оркестратор остается владельцем финального результата. Специалисты из `agent-pack/agent-contracts/` работают как ограниченные capabilities: получают входы, возвращают структурированный результат и не подменяют общий статус workflow.

## Как это запускать

Оркестратор — это главная сессия Claude Code. Стадии запускаются slash-командами из `.claude/commands/` или соответствующими триггер-фразами в свободном чате:

| Команда | Этап |
| --- | --- |
| `/workflow-start`, `/workflow-resume`, `/workflow-status` | Управление запуском: intake и scaffold, продолжение с последнего этапа, статус стадий и gates. |
| `/doctor` | Self-check окружения, ключей и шаблонов. |
| `/research` → `/prd` → `/ia` → `/design` → `/copy` → `/screens` → `/prototype` | Стадии `01`-`07`: от research pack до transition map. |
| `/frontend` → `/visual-diff` → `/test-bench` → `/qa` → `/release` | Стадии `08`-`12`: реализация, сверка с референсом, воронка, аудит, release notes. |
| `/notion-publish` | Публикация research pack в Notion после approval. |

Кроме команд Claude Code автоматически подключает **skills** (`.claude/skills/`, детально — `agent-pack/skills/`) по их описанию. Кросс-стадийные skills действуют независимо от этапа: `approval-gate` (любое внешнее действие), `recursive-brief` (intake), `run-ledger` (ведение журнала запуска), `anti-ai-slop` (перед записью research/PRD/copy и публикацией), `selective-commit`, `outputs-cleanup`. Текущее покрытие стадий: `yarn workflow:skills`.

## Дисциплина выполнения

Правила проекта усиливают не скорость, а качество прохождения gates. Перед генерацией артефакта, Figma/Notion write, frontend implementation, публикацией, handoff или финальным статусом действует `Thoroughness-First Gate`:

- `quick draft` включается только по явной фразе пользователя;
- сначала выполняется context/source inventory: какие инструкции, artifacts, references, templates, design-system assets, components и runtime contracts реально являются источником решения;
- новое создается только для доказанного gap;
- если существующий источник подходит, он переиспользуется или расширяется минимально;
- reuse decisions и gap list фиксируются в stage artifacts;
- нарушение уже существующего правила записывается как `process_deviation`, а не как "поправка пользователя".

Это правило продублировано в `CLAUDE.md`, `agent-pack/quality/quality-gates.md`, `agent-pack/workflows/artifact-driven-pipeline.md` и agent docs, поэтому README остается входной картой, а не единственным нормативным слоем.

## Быстрый старт

```bash
yarn install
yarn workflow:doctor
yarn validate:config
yarn typecheck
```

Для просмотра существующих запусков:

```bash
yarn workflow:list
yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>
```

Для синхронизации run-папки после ручных правок:

```bash
yarn workflow:sync outputs/<project-slug>/<YYYY-MM-DD>
```

Для проверки конкретного product workflow:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
```

Reference-driven workflow проверяется отдельным профилем:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

Полный список команд находится в [COMMANDS.md](COMMANDS.md).

## Где что лежит

| Path | Назначение |
| --- | --- |
| `CLAUDE.md` | Главные правила проекта для Claude Code: маршрутизация, язык, approvals, gates, source-of-truth. |
| `.claude/agents/` | Нативные обёртки 13 субагентов (вызываются главной сессией через `Task`, `subagent_type` = имя). |
| `.claude/skills/` | Нативные обёртки skills; полные процедуры — в `agent-pack/skills/`. |
| `.claude/commands/` | Slash-команды этапов и управления workflow. |
| `.claude/hooks/` | Hooks сессии: session-start, orchestrator-reminder, guard-write, guard-bash, post-edit-sync. |
| `.claude/settings.json` | Модель, permissions, разрешённые команды, hooks. |
| `.mcp.json` | MCP-серверы (figma, notion, tavily, playwright, github, gitlab, lazyweb); пример — `integrations/mcp/mcp-servers.example.json`. |
| `agent-pack/agent-contracts/` | Детальные контракты специалистов: orchestrator, research, prd, ia, design, design-generator, copywriting, prototype, frontend, test-bench, qa-review, release, notion-publisher. |
| `agent-pack/skills/` | Детальные процедуры skills: approval-gate, research-pack, anti-ai-slop, run-ledger, figma-*, visual-*, landing-builder и другие. |
| `agent-pack/workflows/` | Описание маршрутов, handoff-контрактов, детальных gates (`claude-operating-rules.md`) и продуктового pipeline. |
| `agent-pack/artifacts/` | Шаблоны человекочитаемых артефактов. |
| `agent-pack/schemas/` | JSON Schema для проверяемых structured outputs. |
| `agent-pack/quality/` | Quality gates, Anti-AI-Slop, visual evidence и review rules. |
| `agent-pack/guardrails/` | Approval matrix, sensitive data policy, guardrails policy. |
| `runtime/typescript/` | Исполняемый слой: workflow engine, validators, approval CLI, sync, research/reference tooling. |
| `apps/frontend/` | Studio/AgentFlow frontend. |
| `outputs/` | Product workflow runs, temp runs и archives. |
| `research/projects/` | Standalone research, CJM, market research и Notion-ready exports. |
| `design/figma/` | Design-system context, Figma maps, component contracts и design artifacts. |
| `docs/architecture/` | Карта репозитория, app boundaries, git workflow и deploy boundaries. |

Подробная карта репозитория: [docs/architecture/repo-map.md](docs/architecture/repo-map.md).

## Что сейчас является source of truth

Короткая версия:

- правила работы Claude Code: `CLAUDE.md`;
- полный product pipeline: `agent-pack/workflows/artifact-driven-pipeline.md`;
- machine-readable stage contract: `runtime/typescript/workflow.manifest.ts`;
- структура репозитория: `docs/architecture/repo-map.md`;
- команды и ручные операции: `COMMANDS.md`;
- product runs: `outputs/<project-slug>/<YYYY-MM-DD>/`;
- standalone research: `research/projects/<research-slug>/<YYYY-MM-DD>/`.

Личный сайт-портфолио вынесен в отдельный репозиторий и в этой студии больше не живёт.

Если README и детальный contract расходятся, сначала проверяй `CLAUDE.md`, `workflow.manifest.ts`, workflow docs и runtime validators. `AGENTS.md` — только указатель на `CLAUDE.md` для сторонних агентов (Codex, OpenCode), а не источник правил. Исторические файлы в `outputs/**` и `research/projects/**` описывают состояние на дату запуска, а не новые правила проекта.

## Run ledger

Каждый продуктовый запуск хранится в:

```text
outputs/<project-slug>/<YYYY-MM-DD>/
```

Standalone research хранится в:

```text
research/projects/<research-slug>/<YYYY-MM-DD>/
```

Run ledger обычно содержит:

- `run-state.json`, `run-meta.json`;
- `artifact-manifest.json`, `run-index.md`;
- `handoff-bundle.md`, `stage-gate-ledger.md`;
- stage artifacts: `research-summary.md`, `prd.md`, `design-brief.md`, `screens.md`, `frontend-result.md`, `qa-report.md` и другие;
- evidence: screenshots, validation reports, visual diff, publication dry-runs;
- external records: approval, Notion, Figma, deploy или release records.

`outputs/temp/` используется для smoke/test/dry-run артефактов. `outputs/products/` остается legacy/archive-зоной и не является source of truth для новых workflow.

## Outputs lifecycle

Новые run-папки создаются либо в `outputs/<project-slug>/<YYYY-MM-DD>/` для product workflow, либо в `research/projects/<research-slug>/<YYYY-MM-DD>/` для standalone research/CJM/market research. После ручных правок запускай `yarn workflow:sync <run-dir>`, затем проверяй результат через `yarn workflow:inspect <run-dir>` или `yarn workflow:outputs <run-dir>`.

Для research-запусков доступны:

```bash
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD> "research query"
yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>
```

Актуальный пример standalone research run: `research/projects/a3-yandex-alice-utilities-smart-home-research/2026-06-30/`. Он содержит полный research pack, `notion-research-export-ru.md`, `notion-publication-result.md`, approval state и run ledger. Такие папки являются артефактами конкретной работы, а не новыми правилами workflow.

Для reference-driven UI work:

```bash
yarn reference:scan <reference-url> [slug]
```

## Визуальная работа

Для UI, Figma, frontend, лендингов, dashboards и прототипов проект требует evidence-driven подход:

- перед дизайном фиксируется visual evidence plan;
- Lazyweb используется по умолчанию для product UI work, если задача требует рыночных UI-референсов;
- существующая design system сначала проверяется на reuse/extend, и только затем создаются новые компоненты;
- Figma/frontend handoff проверяется через component contracts, screenshots, browser evidence и QA notes;
- результат нельзя закрывать как `success`, если нет проверки реального состояния или записанного blocker/deviation.

### Figma App-Likeness Contract

Figma-контракт закрывает проблему "структурно прошло, но выглядит как техническая доска". Для `figma_board`, `product_ui` и `prototype` обязательны два исполняемых артефакта:

- до Figma write: `figma-layout-ir.json` с route, zones, copy-fit, component sources, resize constraints, DS honesty, verification contract и `ui_fidelity_target` для каждого screen;
- после Figma write: `figma-visual-qa.json` со screenshot/object inventory checks, `app_likeness_review` и `gate_result.ready_allowed=true`.

`ready_for_review|ready` запрещен, если `app_likeness_review.verdict != passed` или screenshot выглядит как `technical_board`, `audit_board`, `wireframe`, `component_inventory`, `metadata_panel`, `route_map`, `generic_card_grid` или `empty_ui_shell`. Auto Layout, node inventory и наличие DS instances больше не считаются достаточными сами по себе.

Для DS-first задач действует практический принцип: существующие компоненты использовать как реальные Figma `INSTANCE`, а недостающие product-specific блоки создавать отдельно и тоже вставлять как instances. Пример `instance-first` подхода — A3 Home Services Figma flow artifacts в `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/` (это пример работы, а не нормативный источник).

Для Figma roundtrip смотри:

- [integrations/mcp/figma-canvas-write-guide.md](integrations/mcp/figma-canvas-write-guide.md)
- [agent-pack/skills/figma-roundtrip/SKILL.md](agent-pack/skills/figma-roundtrip/SKILL.md)
- [design/figma/a3-design-system/README.md](design/figma/a3-design-system/README.md)

## Surface и Anti-Slop правила

Для любого пользовательского результата сначала определяется surface type: research report, Notion wiki, Figma board, product UI, dashboard, landing, prototype, frontend, presentation или handoff. Затем фиксируется scope, evidence-to-output map, quality bar и verification plan.

Anti-AI-Slop Gate требует, чтобы выводы были связаны с конкретным пользователем, сценарием, трением, решением и способом проверки. Для research и CJM это означает не только summary, но и кейсы, user flow, roadmap/ICE/RICE, связанные с реальными friction points.

Для Notion/research публикаций действуют отдельные gate names, которые validator ожидает видеть в контракте проекта:

- `Publication Editor Pass`;
- `publication_editor_gate.pass=true`;
- `Publication Completeness Gate`;
- `Publication Shape Gate`;
- `Publication Cross-Link Gate`;
- `Research Content Lint`;
- `entity_ownership_map`.

Подробные публикации могут использовать layout strategy `flat_child_page`, `hub_with_child_pages`, `database_index` или `integrated_hybrid`. Для Notion hub publication используй dry-run перед записью:

```bash
yarn notion:publish-research-hub <notion-parent-page-id> <research-export-md> "<hub title>" --dry-run
```

DeepSeek/Gemini advisory checks допускаются только как явно включенные non-blocking checks на `01-research`; они не заменяют локальные artifacts, source-backed facts и approval-gated external writes.

## Публикации и внешние действия

Notion, Figma, deploy, изменение секретов, удаление данных и git write без текущего явного запроса требуют exact approval.

Approval records ведутся через runtime:

```bash
yarn workflow:approval-request outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human --reason "Публикация research pack в Notion"
yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human
yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>
```

Локальные ключи внешних провайдеров хранятся только в `.env`, созданном по `.env.example`. Реальные значения `OPENAI_API_KEY`, `TAVILY_API_KEY`, `DEEPSEEK_API_KEY`, `FIRECRAWL_API_KEY`, `NOTION_TOKEN` и repository tokens нельзя сохранять в configs, outputs, traces или документацию.

## Основные проверки

```bash
yarn workflow:doctor
yarn validate:config
yarn typecheck
yarn build
yarn qa:studio
yarn qa:playwright
yarn docs:audit
```

Для изменений в agent/runtime contracts дополнительно используй targeted workflow tests, например:

```bash
yarn workflow:test-agentic
yarn workflow:test-agent-capabilities
yarn workflow:test-agent-metadata
yarn workflow:test-skill-usage
```

## Что читать дальше

- [CLAUDE.md](CLAUDE.md) — обязательный операционный контракт Claude Code в этом репозитории.
- [COMMANDS.md](COMMANDS.md) — справочник команд.
- [docs/architecture/repo-map.md](docs/architecture/repo-map.md) — карта репозитория и границы runnable apps/ledgers.
- [docs/architecture/git-workflow.md](docs/architecture/git-workflow.md) — правила веток, staging и selective commit.
- [agent-pack/workflows/artifact-driven-pipeline.md](agent-pack/workflows/artifact-driven-pipeline.md) — полный product workflow.
- [runtime/typescript/README.md](runtime/typescript/README.md) — детали исполняемого слоя.
- [outputs/README.md](outputs/README.md) — lifecycle product workflow outputs.
- [research/README.md](research/README.md) — standalone research runs.

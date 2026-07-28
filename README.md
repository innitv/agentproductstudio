# Agent Product Studio

<!-- Каноническое имя студии — `agent-product-studio` (как в `package.json`). Прежние варианты «Product Agent Studio» и `product-agent-studio` устарели. -->


Рабочая среда для Claude Code, которая превращает продуктовый запрос в проверяемый набор артефактов: исследование, PRD, информационную архитектуру, дизайн, тексты, экраны, прототип, frontend, QA и release notes.

Это не prompt pack. Студия задаёт операционный контур: какие роли подключать, какие файлы читать, где хранить результаты, какие проверки выполнять и когда останавливаться и спрашивать человека.

## Зачем

Продуктовая работа ведётся не как длинный чат, а как воспроизводимый pipeline:

- один запрос раскладывается на этапы и артефакты;
- каждый этап фиксирует, что он прочитал, что решил и какие риски оставил;
- результаты живут в run ledger, а не теряются в переписке;
- внешние действия — публикация, Figma write, деплой, git — проходят через явное подтверждение человека;
- статус `success` нельзя поставить, не показав доказательства: скриншот, прогон, валидатор.

## Как это работает

```text
request → recursive brief → research → PRD → IA → design → copy → screens → prototype
                                                                                 │
                                                          🔴 человек утверждает макеты
                                                                                 │
                                                    frontend → test bench → QA → release
```

Оркестратор — это главная сессия Claude Code. Она владеет маршрутизацией, гейтами и финальным ответом, а специалистов вызывает как ограниченные capabilities: они получают входы, возвращают структурированный результат и не подменяют общий статус workflow.

Маршрут выбирается под задачу — от полного продуктового цикла до узкой правки кода. Полный список типов задач и правила выбора: [CLAUDE.md](CLAUDE.md).

## Быстрый старт

```bash
yarn install
yarn workflow:doctor
```

Дальше — прямо в Claude Code: `/workflow-start` (или просто опиши задачу словами).

## Как запускать

Стадии запускаются slash-командами из `.claude/commands/` — или триггер-фразами в свободном чате.

| Команда | Этап |
| --- | --- |
| `/workflow-start`, `/workflow-resume`, `/workflow-status` | Управление запуском: intake и scaffold, продолжение с последнего этапа, статус стадий и gates |
| `/doctor` | Self-check окружения, ключей и шаблонов |
| `/research` → `/prd` → `/ia` → `/design` → `/copy` → `/screens` → `/prototype` | Стадии `01`-`07`: от research pack до карты переходов |
| `/frontend` → `/visual-diff` → `/test-bench` → `/qa` → `/release` | Стадии `08`-`12`: реализация, сверка с референсом, воронка, аудит, релиз |
| `/notion-publish` | Публикация research pack в Notion после approval |

### Три оси запуска

Запуск описывается тремя независимыми осями, которые фиксируются на intake и живут в `run-state.json`:

| Ось | Значения | Что определяет |
| --- | --- | --- |
| `profile` | `standard` · `reference` | нужна ли сверка с внешним визуальным референсом (`09-visual-reference`) |
| `scale` | `full` · `increment` · `patch` | глубина: сколько стадий реально нужно |
| `track` | `code` (дефолт) · `figma` | через какой инструмент производится макет |

#### Масштаб: не каждая задача стоит 13 стадий

Глубина запуска выбирается на intake осью `scale`. Она не связана с типом задачи: reference-driven бывает любого размера.

| Scale | Когда | Стадии |
| --- | --- | --- |
| `full` (дефолт) | Новый продукт или существенная фича | Весь pipeline `00`→`12` |
| `increment` | Новая секция/экран, продуктовые решения уже приняты | intake, design, copy, screens, frontend, qa, release |
| `patch` | Правка готового: текст, стиль, состояние, баг | intake, design, frontend, qa |

Режется **только глубина проработки**. Approval gates, run ledger и статусы работают на любом уровне, `00-intake` и `11-qa` входят во все три, а понижение масштаба задним числом валидатор отклоняет. Не уверен в масштабе — берётся `full`.

`scale` и `quick draft` — разные вещи: `scale` означает «задача мелкая, делаем аккуратно» (возможен `success`), `quick draft` — «осознанно срезаем качество» (всегда `partial`). Правила — CLAUDE.md §0.2.

```bash
yarn workflow:start "цель" --scale increment
yarn workflow:validate outputs/<slug>/<date> --scale increment
```

#### Маршрут: через что производится макет

`track` — третья ось, независимая от двух других. Дефолт студии — `code`: спецификация экранов плюс shadcn/ui и Storybook как витрина состояний, без Figma. `figma` включается, когда макет действительно собирается на холсте.

Маршрут режет **только состав Figma-специфичных секций** `screens.md` и `frontend-result.md`. Стадии, approval gates, run ledger и машинная приёмка одинаковы на обоих. Figma-**артефакты** на `code` не создаются и записи в журнале не требуют вовсе; Figma-**секции** закрываются строкой `skipped_by_track` в `stage-gate-ledger.md` и проверяются машинно. Маршрут читается из `run-state.json`, а не угадывается по наличию файлов, и задним числом не меняется. Правила — CLAUDE.md §0.3.

```bash
yarn workflow:start "цель" --track figma
yarn workflow:validate outputs/<slug>/<date> --track figma
```

### Дизайн-система и витрина

Для нового product UI компоненты **берутся из shadcn/ui**, а не проектируются с нуля (решение владельца продукта от 2026-07-27, CLAUDE.md §6.1). Код копируется в репозиторий (`apps/frontend/src/components/shadcn/`, ставится `yarn shadcn add <component>`) и принадлежит проекту.

- **Токены** — DTCG-файлы в `design/tokens/`, сборка `yarn tokens:build`. Figma токеном не владеет. Менять смело цвет, гарнитуру и кольцо фокуса; `--spacing` и шкалу радиусов — нельзя, в них лежит выверенная геометрия библиотеки.
- **Витрина** — Storybook: история на каждый компонент с покрытием состояний, composition story с тегом `vr-page` на каждый экран. Экран = composition story = роут приложения, одна и та же сборка. Компонент без истории не считается сданным.
- **Приёмка машинная.** «Похоже» и просмотренный человеком скриншот приёмкой не считаются: для `product_ui|frontend` нужны три вердикта — `yarn vr:test` (пиксельная регрессия витрины), `yarn test-storybook` (поведение и a11y), `yarn qa:mobile` (профиль устройства). `vr:test`/`vr:update` исполняются только внутри пиннутого Docker-образа Playwright: эталон, снятый на Windows-хосте, на Linux не сравнивается, а молча создаёт новый файл.
- Своя дизайн-система с нуля остаётся допустимой, но требует записанного обоснования — сильный визуальный характер продукта или нестандартный интерфейс (редактор, канвас, плотная таблица).

Skills подключаются автоматически по описанию — своих команд у них нет. Кросс-стадийные: `approval-gate` (любое внешнее действие), `recursive-brief` (intake), `run-ledger` (журнал запуска), `anti-ai-slop` (перед записью research/PRD/copy и публикацией), `selective-commit`, `outputs-cleanup`, `run-retrospective` (разбор завершённого run, команда `/retro`). Покрытие стадий: `yarn workflow:skills`.

Отдельно от проектных skills живут **плагины** (`plugins/`, ставятся `yarn plugin:link`):

- **`figma-ds`** — `/figma-ds:build` (механика Figma Plugin API и финальная самопроверка перед отчётом — пакетный гейт, не после каждого write) и `/figma-ds:standard` (textbook-канон дизайн-систем). Граница простая: всё, что верно про Figma безотносительно нашего процесса, — в плагине; гейты, стадии и статусы — в `integrations/mcp/figma-canvas-write-guide.md`. Копий не заводить.
- **`subsystem-audit`** — `/subsystem-audit:audit`: доказательный шаблон аудита подсистемы (верификация находок первоисточником, сравнение с GitHub по реальным URL, эвристики против ложных находок).

Полный справочник команд: [COMMANDS.md](COMMANDS.md).

## Где что лежит

| Path | Назначение |
| --- | --- |
| `CLAUDE.md` | Главные правила: маршрутизация, язык, approvals, gates, source of truth |
| `.claude/agents/` | Нативные обёртки 12 субагентов-специалистов + чек-лист оркестратора (вызов через `Agent`, `subagent_type` = имя; `Task` работает как alias). Оркестратор — это главная сессия, а не субагент: его спавн запрещён механически через `permissions.deny` в `.claude/settings.json` |
| `.claude/skills/` | Обёртки skills; полные процедуры — в `agent-pack/skills/` |
| `.claude/commands/` | Slash-команды этапов и управления workflow |
| `.claude/hooks/` | Hooks сессии: session-start, orchestrator-reminder, guard-write, guard-bash, post-edit-sync |
| `.claude/settings.json` | Модель, permissions, разрешённые команды, hooks |
| `.mcp.json` | MCP-серверы: figma, figmaDesktop, notion, tavily, playwright, github, gitlab, lazyweb |
| `agent-pack/agent-contracts/` | Детальные контракты специалистов: orchestrator, research, prd, ia, design, design-generator, copywriting, prototype, frontend, test-bench, qa-review, release, notion-publisher |
| `agent-pack/skills/` | Детальные процедуры skills: approval-gate, research-pack, anti-ai-slop, run-ledger, figma-*, visual-*, landing-builder и другие |
| `agent-pack/workflows/` | Маршруты, handoff-контракты, детальные gates (`claude-operating-rules.md`), продуктовый pipeline |
| `agent-pack/quality/`, `agent-pack/guardrails/` | Quality gates, approval matrix, sensitive data policy |
| `agent-pack/schemas/`, `agent-pack/artifacts/` | JSON Schema для structured outputs и шаблоны артефактов |
| `plugins/figma-ds/` | Плагин: единый источник Figma-знания вне процесса студии — `/figma-ds:build` (механика Plugin API, грабли, чек-лист после write) и `/figma-ds:standard` (textbook-канон DS). Раздаётся на машину junction'ом из `~/.claude/skills/` |
| `plugins/subsystem-audit/` | Плагин: `/subsystem-audit:audit` — повторяемый шаблон аудита подсистемы. Раздаётся junction'ом так же |
| `runtime/typescript/` | Исполняемый слой: workflow engine, валидаторы, approval CLI, research и reference tooling |
| `apps/frontend/` | Studio frontend |
| `design/figma/` | Design-system context, Figma maps, component contracts |
| `docs/architecture/` | Карта репозитория, границы приложений, git workflow |

Подробная карта: [docs/architecture/repo-map.md](docs/architecture/repo-map.md).

## Правила и gates

Читать в этом порядке, а не пересказ здесь:

- [CLAUDE.md](CLAUDE.md) — операционный контракт Claude Code в этом репозитории. Если README и контракт расходятся, прав контракт.
- [agent-pack/workflows/claude-operating-rules.md](agent-pack/workflows/claude-operating-rules.md) — полный текст детальных gates: Surface-Aware Output Framework, Visual Evidence Grounding, Anti-AI-Slop, research и Notion, маршрут `track` и оформление «Figma не участвует», Design System Strategy Gate, Storybook Showcase Gate, Machine Acceptance Gate, Figma и product UI, approval.
- [agent-pack/workflows/artifact-driven-pipeline.md](agent-pack/workflows/artifact-driven-pipeline.md) — полный product workflow и run ledger.
- [agent-pack/guardrails/approval-matrix.md](agent-pack/guardrails/approval-matrix.md) — что требует подтверждения человека и с какой точной целью.

Коротко о главном: `quick draft` включается только по явной фразе пользователя; новое создаётся только для доказанного gap, а существующее переиспользуется; frontend не начинается, пока человек не утвердил макеты; нарушение уже существующего правила записывается как `process_deviation`, а не как «поправка пользователя».

`AGENTS.md` — только указатель на `CLAUDE.md` для сторонних агентов (Codex, OpenCode), а не источник правил.

## Outputs lifecycle

Продуктовые запуски живут в `outputs/<project-slug>/<YYYY-MM-DD>/`, standalone research и CJM — в `research/projects/<research-slug>/<YYYY-MM-DD>/`. Каждый запуск ведёт ledger: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `artifact-manifest.json` плюс артефакты стадий и evidence.

**Артефакты запусков не версионируются в git** — это локальная история работы, а не часть инструмента. В репозитории остаются только навигационные индексы (`outputs/registry.json`, `research/registry.json`) и описания жизненного цикла: [outputs/README.md](outputs/README.md), [research/README.md](research/README.md).

```bash
yarn workflow:list                     # активные запуски
yarn workflow:inspect <run-dir>        # состояние стадий и gates
yarn workflow:outputs <run-dir>        # созданные артефакты
yarn workflow:sync <run-dir>           # после ручных правок run-папки
yarn workflow:validate <run-dir> --profile standard    # или --profile reference
```

Research и reference-driven задачи:

```bash
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD> "research query"
yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>
yarn reference:scan <reference-url> [slug]
```

## Surface и Anti-Slop правила

Для любого результата сначала определяется surface type (research report, Notion wiki, Figma board, product UI, dashboard, landing, prototype, frontend, handoff), затем фиксируются scope, evidence-to-output map, quality bar и план проверки. Полный текст — в [claude-operating-rules.md](agent-pack/workflows/claude-operating-rules.md).

Anti-AI-Slop Gate требует, чтобы вывод был связан с конкретным пользователем, сценарием, трением, решением и способом проверки. Исполняемая проверка — `Research Content Lint` (`yarn research:lint`); её провал запрещает любую внешнюю запись.

Для research-публикаций в Notion действуют отдельные gates, которые ожидает валидатор: `Publication Completeness Gate`, `Publication Shape Gate`, `Publication Cross-Link Gate`, `Publication Editor Pass` (`publication_editor_gate.pass=true`) и `entity_ownership_map`. Layout выбирается из `flat_child_page`, `hub_with_child_pages`, `database_index` или `integrated_hybrid`; перед записью — dry-run:

```bash
yarn notion:publish-research-hub <notion-parent-page-id> <research-export-md> "<hub title>" --dry-run
```

DeepSeek/Gemini advisory checks допускаются только как явно включённые non-blocking проверки на `01-research`: они не заменяют source-backed факты и не открывают путь к внешним записям.

## Что сейчас является source of truth

- правила работы Claude Code — `CLAUDE.md`;
- полный product pipeline — `agent-pack/workflows/artifact-driven-pipeline.md`;
- machine-readable stage contract — `runtime/typescript/workflow.manifest.ts`;
- структура репозитория — `docs/architecture/repo-map.md`;
- команды — `COMMANDS.md`;
- product runs — `outputs/<project-slug>/<YYYY-MM-DD>/`, standalone research — `research/projects/<research-slug>/<YYYY-MM-DD>/`.

Исторические файлы в `outputs/**` и `research/projects/**` описывают состояние на дату запуска и не являются новыми правилами проекта.

## Проверки

```bash
yarn qa:quick             # typecheck + validate:config + docs:audit
yarn workflow:test-agentic # агенты, skills, approval, figma layout, engine
yarn qa:playwright        # E2E
yarn plugin:link --check  # ссылка ~/.claude/skills -> plugins/ на месте?
```

Приёмка продуктового UI (обязательна до `success` для `product_ui|frontend`, на обоих маршрутах):

```bash
yarn tokens:build         # DTCG design/tokens/ -> CSS-переменные
yarn tokens:check         # паритет темы default со снимком реестра shadcn
yarn storybook            # витрина в dev-режиме
yarn test-storybook       # истории как тесты: play-функции и a11y в Chromium
yarn vr:test              # пиксельная регрессия витрины (только в Docker-образе Playwright)
yarn qa:mobile            # мобильная приёмка в профиле устройства
```

`yarn vr:update` — приёмка нового эталона после осознанного изменения компонента, с записью причины в ledger, а не способ погасить красный тест.

При изменении агентов, маршрутов, skills или approval-слоя обязателен `yarn workflow:test-agentic`: он ловит рассинхрон между контрактом, обёрткой и manifest.

`yarn plugin:link` ставит ссылку из `~/.claude/skills/<name>` на плагин в `plugins/`, вычисляя путь через `git rev-parse`. Нужен один раз на машине — и повторно, если репозиторий переименовали или перенесли (ссылка завязана на путь). Копию вместо ссылки скрипт не создаёт намеренно: копия разъедется с репо.

## Ключи и секреты

Ключи внешних провайдеров хранятся только в `.env`, созданном по `.env.example`. Реальные значения `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `NOTION_TOKEN`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` и repository tokens нельзя сохранять в конфигах, артефактах, traces или документации.

## Лицензия

Проприетарное ПО. Все права защищены — см. [LICENSE](LICENSE).

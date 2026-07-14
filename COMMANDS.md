# Команды проекта

## Рабочий режим

Рабочий сценарий проекта — запросы внутри Claude Code. Claude использует `CLAUDE.md`, инструкции специалистов, workflow-документы и шаблоны как правила работы, а локальные команды нужны для scaffold, проверок и сохранения артефактов.

## Slash-команды Claude Code

Основной способ запускать этапы. Живут в `.claude/commands/`. Каждой соответствуют триггер-фразы в свободном чате (см. раздел «Trigger Phrases»).

| Команда | Что делает |
| --- | --- |
| `/workflow-start` | Новый продуктовый workflow: intake, scaffold run ledger, research первым этапом. |
| `/workflow-resume` | Продолжает начатый run с последнего завершённого этапа, соблюдая dependency order и gates. |
| `/workflow-status` | Список активных run и детальное состояние стадий и gates. |
| `/doctor` | Self-check окружения, ключей и целостности шаблонов артефактов. |
| `/research` | `01-research`: research pack с проверяемыми источниками. |
| `/prd` | `02-prd`: требования, MoSCoW, acceptance criteria. |
| `/ia` | `03-ia`: sitemap, primary user flow, главный экран и главное действие. |
| `/design` | `04-design`: design-brief, design-system mode, visual evidence. |
| `/copy` | `05-copy`: hero, CTA, секции, FAQ, SEO, claims to validate. |
| `/screens` | `06-screens`: спецификация экранов на основе design и copy. |
| `/prototype` | `07-prototype`: transition map и инструкции кликабельного прототипа. |
| `/frontend` | `08-frontend`: реализация UI, состояния, адаптивность, analytics hooks. |
| `/visual-diff` | `09-visual-reference`: парные скриншоты и pixel diff против референса. |
| `/test-bench` | `10-test-bench`: проверка воронки и analytics главного сценария. |
| `/qa` | `11-qa`: аудит PRD fit, UX, a11y, responsive, secrets. |
| `/release` | `12-release`: release notes, validation, deployment/rollback notes. |
| `/notion-publish` | Публикация research pack в Notion после human approval. |

Skills (`.claude/skills/`, детально — `agent-pack/skills/`) slash-команд не имеют: Claude Code подключает их автоматически по описанию. Покрытие стадий: `yarn workflow:skills`.

## Локальные команды

Проверить staged-файлы перед selective commit:

```bash
yarn git:check-staged
```

Команда блокирует случайно staged `outputs/**`, `.lazyweb/**`, logs, build/test artifacts и media/evidence файлы. Если пользователь явно просит коммитить такой target, используй allow-флаг из `tooling/scripts/check-staged-scope.mjs --help`.

Проверить executable handoff/output contracts для agentic stages (frontmatter контрактов: `required_inputs`, `required_outputs`, `skills`, approval actions):

```bash
yarn workflow:test-agent-metadata
```

Весь набор runtime-тестов сразу (agent/skill metadata, capability registry, approval gate, figma layout, output lifecycle, agentic engine):

```bash
yarn workflow:test-agentic
```

Проверить Agent Capability Registry:

```bash
yarn workflow:test-agent-capabilities
```

Проверить standard route без visual reference:

```bash
yarn agents:inspect
```

Проверить reference route с visual reference stage:

```bash
yarn agents:inspect --profile reference
```

Создать стартовый workflow scaffold:

```bash
yarn landing:run "цель лендинга"
```

Создать локальный standard workflow от intake до release artifacts:

```bash
yarn workflow:run-local "цель лендинга"
```

Команда создаёт `outputs/<project-slug>/<YYYY-MM-DD>/` для продуктового workflow, запускает research stage,
генерирует downstream-артефакты и в конце выполняет `workflow:validate`.

Запустить persisted workflow engine:

```bash
yarn workflow:start "цель лендинга"
```

По умолчанию engine работает в `local` mode: research запускается через configured providers,
а downstream stages создаются детерминированным локальным executor.

Запустить persisted workflow engine в agentic mode для staged rollout специалистов:

```bash
yarn workflow:start "цель workflow" --mode agentic
```

Agentic mode использует только включённые rollout stages. Текущий default rollout:

```bash
yarn workflow:agentic-stages
```

Перед `resume` agentic run проверь readiness:

```bash
yarn workflow:agentic-preflight outputs/<project-slug>/<YYYY-MM-DD> --strict
```

Сгенерировать команды approval для включённых model provider stages:

```bash
yarn workflow:agentic-approval-commands outputs/<project-slug>/<YYYY-MM-DD> --by human --missing-only
```

Проверить readiness без списка next actions:

```bash
yarn workflow:agentic-readiness outputs/<project-slug>/<YYYY-MM-DD> --strict
```

Продолжить существующий run:

```bash
yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>
```

Показать состояние run:

```bash
yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>
```

Записать явное подтверждение для внешнего действия или model provider call:

```bash
yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human --notes "Одобрено для публикации research pack"
```

Approval matching строгий по `target`: если runtime запрашивает `--target`, approval должен быть записан с тем же `target`. Targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request.

Посмотреть все approval records для run:

```bash
yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>
```

Зафиксировать явный отказ:

```bash
yarn workflow:deny outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human --notes "Не публиковать research pack"
```

Для Notion Agile export target обычно равен parent page id:

```bash
yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> notion_agile_export --target <notion-parent-page-id> --by human
```

Принудительно переисполнить stage и downstream stages:

```bash
yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> 01-research --force
```

Engine сохраняет `run-state.json` и machine-readable stage results в `stage-results/`.

## Research

Запустить end-to-end research stage для существующей research-папки:

```bash
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD>
```

Запустить research stage с явным research query:

```bash
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD> "research query"
```

Research runner создает:

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

И обновляет:

- `handoff-bundle.md`
- `stage-gate-ledger.md`

Проверить содержательность research/CJM/PRD/copy перед записью и любой внешней публикацией (Anti-AI-Slop Gate, Rules 1-6):

```bash
yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>
yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>
yarn research:lint <research-export-md>
```

Lint проверяет: не тезисная выжимка, глубина CJM/user-flow, связь roadmap с CJM и валидацией, claims с механизмом, неуниверсальные формулировки, неповторяющиеся строки таблиц. **Если lint падает, Notion/Figma/external write запрещён** до исправления источников или export.

## Визуальный референс

Собрать Firecrawl + Playwright reference pack:

```bash
yarn reference:scan https://example.com example-reference
```

Результат сохраняется в:

```text
reports/visual-review/example-reference/
```

Firecrawl используется для публичного URL. Локальный preview проверяется Playwright.

Сгенерировать `visual-reference-review.md` по уже собранным reference/local скриншотам:

```bash
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173
```

Команда ожидает в report-папке evidence из `reference:scan` и локальные Playwright screenshots
вроде `local-desktop-after.png` / `local-mobile-after.png`. Если пары desktop/mobile
не хватает, review будет создан со статусом `blocked`.

Если локальные screenshots лежат отдельно:

```bash
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173 --local-dir reports/visual-review/example-local
```

Посчитать pixel diff между reference и local screenshots:

```bash
yarn reference:diff reports/visual-review/example-reference reports/visual-review/example-local reports/visual-review/example-reference
```

Команда создаёт:

- `visual-diff-result.json`
- `visual-diff-summary.md`

После этого `reference:review` автоматически добавит diff summary в `visual-reference-review.md`.

Посчитать section-aware diff по reference/local URL:

```bash
yarn reference:section-diff https://example.com http://127.0.0.1:4173 reports/visual-review/example-reference
```

Команда снимает секционные screenshots по known selectors/fallback selectors и создаёт:

- `visual-section-diff-result.json`
- `visual-section-diff-summary.md`

После этого `reference:review` автоматически добавит section diff summary в `visual-reference-review.md`.

## Валидация workflow

Проверить workflow до конкретного stage:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research --profile standard
```

Проверить полный standard workflow:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
```

Проверить полный reference workflow:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

Посмотреть, какие skills покрывают какие стадии (таблица stage → agent → skills):

```bash
yarn workflow:skills
```

## Уборка и архивация

Для задач типа `cleanup/sorting`. Инвентаризация выполняется до удаления; необратимое удаление требует approval `delete_data` (см. skill `outputs-cleanup`).

```bash
yarn workflow:list                                  # что вообще есть и в каком статусе
yarn workflow:archive outputs/<project-slug>/<YYYY-MM-DD>   # переместить завершённый run в архив
yarn workflow:cleanup-temp                          # очистить outputs/temp
yarn outputs:cleanup                                # уборка outputs по правилам lifecycle
```

## QA

Быстрая проверка конфигов, типов и документации:

```bash
yarn qa:quick
```

Проверить agentic runtime, rollout, approval gate, executor, readiness и engine:

```bash
yarn workflow:test-agentic
```

Полный Playwright QA:

```bash
yarn qa:playwright
```

Проверить только studio/AgentFlow app:

```bash
yarn qa:studio
```

Проверка Firecrawl + Playwright:

```bash
yarn qa:firecrawl
```

Полный project audit:

```bash
yarn project:audit
```

## Frontend

Dev server:

```bash
yarn dev
```

Production-сборка studio app:

```bash
yarn build:studio
```

`yarn build` оставлен как alias для `yarn build:studio`.

Предпросмотр собранного studio app:

```bash
yarn preview
```

## Notion

Проверить локальный Notion token:

```bash
yarn notion:check
```

Запустить Notion MCP:

```bash
yarn notion:mcp
```

Research publication для полного workflow остается обязательным gate: нужно опубликовать research-only child page или зафиксировать blocker/partial в artifacts.

## Диагностика и восстановление

Запустить утилиту диагностики окружения, ключей и целостности файлов:

```bash
yarn workflow:doctor
```

Отсутствующие optional provider keys считаются предупреждением: работа через Claude Code и local workflow остаются рабочими,
а соответствующие optional provider действия будут blocked до настройки `.env`.

Запустить диагностику с автоматическим восстановлением (repair) поврежденных или удаленных шаблонов артефактов:

```bash
yarn workflow:doctor --repair
```

## Типовые сценарии

Стандартный сценарий без визуального референса:

```bash
yarn landing:run "Лендинг для AI-сервиса записи в салон"
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD>
yarn workflow:validate research/projects/<research-slug>/<YYYY-MM-DD> --through 01-research --profile standard
```

Сценарий с визуальным референсом:

```bash
yarn landing:run "Лендинг как https://example.com для сервиса X"
yarn reference:scan https://example.com example-reference
yarn reference:diff reports/visual-review/example-reference reports/visual-review/example-local reports/visual-review/example-reference
yarn reference:section-diff https://example.com http://127.0.0.1:4173 reports/visual-review/example-reference
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173 --local-dir reports/visual-review/example-local
yarn research:run research/projects/<research-slug>/<YYYY-MM-DD>
yarn workflow:validate research/projects/<research-slug>/<YYYY-MM-DD> --through 01-research --profile reference
```

## Trigger Phrases / Триггер-фразы (Natural Language Intents)

Вместо технических CLI-команд в терминале можно использовать естественный язык. Движок распознает семантические триггеры и автоматически выполняет соответствующие действия на последнем активном проекте.

### Использование в терминале:
```bash
yarn workflow:start "<фраза-триггер>"
```

### Список поддерживаемых триггеров:

#### 1. Глобальное управление:
- **Начало нового проекта**: `начать воркфлоу`, `новый проект`, `новый лендинг`, `start landing`, `create project`.
- **Продолжение воркфлоу**: `продолжить запуск`, `resume workflow`, `поехали дальше`, `погнали дальше`.
- **Проверка статуса**: `покажи статус`, `workflow status`, `что готово`, `status check`.

#### 2. Запуск и перезапуск этапов (Stage Execution):
- **Research (01-research)**: `сделай ресерч`, `проведи исследование`, `исследуй конкурентов`, `run research`, `update research`.
- **PRD Requirements (02-prd)**: `напиши prd`, `сформируй требования`, `подготовь тз`, `generate prd`, `update prd`.
- **Architecture (03-ia)**: `спроектируй структуру`, `сделай карту сайта`, `нарисуй user flow`, `sitemap`, `make sitemap`.
- **Design spec (04-design)**: `подготовь дизайн-бриф`, `создай дизайн`, `сделай дизайн-спеку`, `analyze reference`.
- **Copy deck (05-copy)**: `напиши тексты`, `сделай copy deck`, `копирайт`, `write copywriting deck`, `generate copy`.
- **Screens (06-screens)**: `сгенерируй спецификацию экранов`, `создай экраны`, `опиши экраны`, `generate screens`.
- **Prototype (07-prototype)**: `создай прототип`, `transition map`, `карту переходов`, `make transition map`.
- **Frontend UI (08-frontend)**: `напиши код`, `сверстай лендинг`, `реализуй фронтенд`, `собери интерфейс`, `update ui`.
- **Visual Diff (09-visual-reference)**: `сравни с референсом`, `проверь скриншоты`, `visual diff`, `compare screens`.
- **Test Bench (10-test-bench)**: `запусти тест-бенч`, `протестируй воронку`, `проверь аналитику`, `run test bench`.
- **QA Review (11-qa)**: `проверь качество`, `запусти qa`, `проведи аудит качества`, `run qa review`.
- **Release (12-release)**: `выкатывай релиз`, `подготовь релиз`, `сделай релиз-ноутс`, `release now`.
- **Notion Export**: `опубликуй в notion`, `выложи в ноушен`, `publish to notion`.

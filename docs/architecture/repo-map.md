# Repo Map

Этот документ описывает структуру `product-agent-studio`: где лежит source of truth, что является runnable app, а что является ledger/evidence и не должно случайно попадать в commit.

## Принцип

Ветка не должна хранить отдельную продуктовую реальность. Ветка хранит изменение. Продуктовая архитектура должна быть видна в дереве проекта: приложения отдельно, runtime отдельно, agent rules отдельно, research/product ledgers отдельно.

## Два слоя дерева

Дерево делится на два слоя, и это снимает вопрос «что здесь по правилам Claude, а что нет»:

- **Claude Code канон** — то, что диктует сам Claude Code и что превращает проект в оркестр: `CLAUDE.md`, `.claude/` (`agents/`, `skills/`, `commands/`, `hooks/`, `settings.json`), `.mcp.json`. Только эти пути и имена обязательны по правилам Claude Code, и именно они загружаются/обнаруживаются автоматически.
- **Проектная архитектура** — всё остальное (`agent-pack/`, `runtime/`, `apps/`, `integrations/`, `design/`, `docs/`, `tests/`, `tooling/`, ledgers, `archive/`). Имена и структура здесь — на усмотрение проекта; Claude Code к ним требований не предъявляет.

`CLAUDE.md` — лёгкий индекс: сам по себе он не «самодостаточный установщик», а точка входа, которая ссылается на оба слоя. Единица переноса оркестрации — весь репозиторий (клон), а не один файл.

## Верхний уровень

| Path | Статус | Назначение | Правило изменения |
|---|---|---|---|
| `CLAUDE.md`, `.mcp.json`, `AGENTS.md` | Claude канон | Корневые правила проекта (лёгкий индекс), MCP-серверы, `AGENTS.md` — pointer на `CLAUDE.md` для сторонних агентов. | `CLAUDE.md` держать лёгким; детали — в referenced-файлах. |
| `README.md`, `COMMANDS.md` | doc | Человекочитаемый обзор проекта (`README.md`) и справочник команд проекта — локальные `yarn`-команды и slash/триггеры (`COMMANDS.md`). | Обновлять при изменении onboarding-обзора или списка команд. |
| `.claude/` | Claude канон | Нативный слой Claude Code: `agents/` (субагенты), `skills/`, `commands/`, `hooks/`, `settings.json`. | Менять по правилам Claude Code; синхронизировать с `agent-pack/agent-contracts`. |
| `apps/` | active | Runnable frontend apps и app shells. Главный app target: `apps/frontend` для studio. | Менять через product/frontend tasks, проверять build и relevant QA target. |
| `agent-pack/` | active | Агентная система (проектный слой): `agent-contracts/`, `skills/`, `workflows/`, `artifacts/`, `templates/`, `schemas/`, `guardrails/`, `quality/`. | При изменении правил синхронизировать `CLAUDE.md`, agent docs и validators/tests. |
| `plugins/` | active | Плагины Claude Code — переносимое знание, не привязанное к процессу студии. Сейчас два: `figma-ds/` (`/figma-ds:build` — механика Figma Plugin API и чек-лист после write, `/figma-ds:standard` — textbook-канон DS) и `subsystem-audit/` (`/subsystem-audit:audit` — доказательный шаблон аудита подсистемы). Раздаются на машину junction'ом из `~/.claude/skills/<name>`, поэтому правка из любого проекта попадает сюда. | Всё Figma-знание вне процесса студии держать только здесь; копий в `agent-pack/skills` и guide не заводить. Граница — раздел «Границы знания» в `integrations/mcp/figma-canvas-write-guide.md`. |
| `runtime/` | active | TypeScript workflow runtime: commands, validators, stage engine, route/intent logic. | Менять вместе с tests/runtime commands. |
| `tooling/` | active | Скрипты для audit, publish, screenshots, cleanup, lint и git scope checks. | Проверять точечными командами и `docs:audit`/`validate:config`, если меняются контракты. |
| `tests/` | active | Автотесты. Playwright tests разделяются по app/surface target. | Не смешивать studio и demo assertions в одном spec без явного shared scope. |
| `research/` | active ledger | Standalone research, CJM, market research и Notion-ready exports. | Новые research runs хранить в `research/projects/<slug>/<date>/`. |
| `outputs/` | active/legacy ledger | Product workflow runs, temp runs и archives. | Не использовать как source of truth для правил. `outputs/temp/**` не коммитить. |
| `design/` | active | Design-system context, Figma maps, design artifacts. | Менять вместе с design/rules docs, если меняются tokens/components. |
| `integrations/` | active | MCP, observability и integration docs/config examples. | Не хранить secrets; реальные external writes требуют approval. |
| `docs/architecture/` | active | Навигация по repo, git workflow, deployment boundaries. | Обновлять при изменении структуры или branch/deploy политики. |
| `archive/` | archive | Историческое/legacy: `legacy-codex/` (старый Codex config), `plans/` (датированные планы), `project-plans/`, старые `reports/`, `design-systems/` (выведенные из работы локальные индексы Figma-DS). | Не источник правил; не редактировать как активные контракты. |
| `reports/`, `test-results/`, `dist/`, `node_modules/` | generated | Logs, Playwright artifacts, build output, зависимости. | Не коммитить (в `.gitignore`). |

> Личный сайт-портфолио вынесен в отдельный репозиторий и в карте этого репо больше не описывается.

## Runnable Surfaces

| Surface | Код | Route | QA target |
|---|---|---|---|
| Оболочка студии | `apps/frontend/src/App.tsx` (роутер), `apps/frontend/src/views/StudioIndexView.tsx` (указатель маршрутов), `apps/frontend/src/views/CardRequestShadcnView.tsx` (пилотный экран) | `/`, `#card-request-shadcn` | `yarn qa:studio` |

> Runnable surface в репозитории ровно одна. Строка про «A3Pay demo» удалена 2026-07-25: ни ветки, ни каталога `apps/a3pay-demo` никогда не существовало, а колонки Route и QA target в ней были перепутаны местами. Продуктовые демо, как и портфолио, живут в отдельных репозиториях — сюда они попадают только как ledger в `outputs/<slug>/<date>/`. <!-- docs-audit-ignore: упоминание `apps/a3pay-demo` намеренное — строка утверждает, что каталога не существует -->
>
> Демо вымышленного продукта «AgentFlow» (лендинг + консоль) и слой дизайн-системы A3 удалены 2026-07-28: демо не обслуживало реальных задач, а слой A3 держался только на нём. Витрина компонентов — Storybook, а не роут `/components`.
>
> Там же удалены три темы эксперимента «геометрия против гарнитуры» (`branded`, `calm`, `calm-typed`) вместе с тематическими хешами маршрута: эксперимент завершён, вывод записан в `docs/architecture/`. Осталась одна тема — `default`, штатный реестр shadcn. Постоянных тем верстак не держит: тема это свойство продукта и уезжает в его репозиторий вместе с ним. Механизм тем (`ShadcnThemeScope`, атрибут `data-shadcn-theme`, список `THEMES` в сборщике) сохранён рабочим на одной теме — он скоупит переменные, а не только переключает их, и на нём держатся нейтральная канва Storybook и покраска порталов.

## Ledger Boundaries

Ledger — это история работы, evidence, screenshots, run state и publication records. Ledger не является местом для активного app-кода.

| Ledger | Path | Когда менять |
|---|---|---|
| Product workflow runs | `outputs/<project-slug>/<YYYY-MM-DD>/` | Только при полноценном product workflow или явном update run. |
| Research runs | `research/projects/<research-slug>/<YYYY-MM-DD>/` | Только при standalone research/CJM/market research. |
| Generated artifacts | `reports/`, `test-results/`, `dist/` | Никогда не коммитить в обычных tasks. |

Исторические ledger-файлы отражают состояние на дату run. Если в них встречаются старые route/path references, не используй их как текущие правила архитектуры; сверяйся с `CLAUDE.md`, этим документом, `docs/architecture/git-workflow.md` и актуальными app configs.

## Фактическое дерево

```text
# — Claude Code канон (обязательное по правилам Claude) —
CLAUDE.md                 # корневые правила (лёгкий индекс)
AGENTS.md                 # pointer на CLAUDE.md для сторонних агентов
.mcp.json                 # MCP-серверы
.claude/
  agents/                 # 13 субагентов (нативные обёртки)
  skills/                 # навыки (авто-обнаружение)
  commands/               # slash-команды
  hooks/                  # guard-write, guard-bash, session-start, orchestrator-reminder, post-edit-sync
  settings.json           # модель, permissions, hooks

# — Проектная архитектура —
agent-pack/               # агентная система
  agent-contracts/        # детальные контракты специалистов (runtime-валидация)
  skills/                 # детальные процедуры навыков
  workflows/              # pipeline, handoff-контракты, claude-operating-rules
  artifacts/ templates/ schemas/ guardrails/ quality/
plugins/                  # плагины Claude Code (переносимое знание вне процесса студии)
  figma-ds/               # /figma-ds:build (механика Figma) + /figma-ds:standard (канон DS); junction из ~/.claude/skills
  subsystem-audit/        # /subsystem-audit:audit (доказательный шаблон аудита подсистемы); junction из ~/.claude/skills
runtime/typescript/       # workflow engine, validators, тесты, CLI (yarn workflow:*)
apps/frontend/            # оболочка студии (App-роутер, StudioIndexView, пилотный экран, компоненты shadcn, Storybook)
integrations/ design/ docs/architecture/ tooling/scripts/ tests/playwright/

# — Ledgers (история работы; не source of truth для правил) —
research/projects/        # standalone research runs
outputs/                  # product workflow runs (+ temp, archive)

# — Генерируемое / архив —
dist/ reports/ test-results/ node_modules/   # generated, не коммитить (.gitignore)
archive/                  # legacy-codex, plans, project-plans, design-systems
```

## Migration Rules

1. Не переносить source files и ledgers в одном commit.
2. Каждый перенос app boundary должен иметь route map до/после, build command, targeted QA command, updated docs и staged scope check.
3. Долгоживущие ветки не должны быть единственным местом, где существует production route.
4. Исторические artifacts в `outputs/**`, `research/projects/**` не переписываются ради актуализации правил. Новые правила живут в `CLAUDE.md`, `README.md`, `docs/architecture/**`, agent docs и runtime configs.

# Repo Map

Этот документ описывает структуру `product-agent-studio`: где лежит source of truth, что является runnable app, а что является ledger/evidence и не должно случайно попадать в commit.

## Принцип

Ветка не должна хранить отдельную продуктовую реальность. Ветка хранит изменение. Продуктовая архитектура должна быть видна в дереве проекта: приложения отдельно, runtime отдельно, agent rules отдельно, research/product ledgers отдельно.

## Верхний уровень

| Path | Статус | Назначение | Правило изменения |
|---|---|---|---|
| `apps/` | active | Runnable frontend apps и app shells. Главные app targets: `apps/frontend` для studio и `apps/portfolio` для production-портфолио. | Менять через product/frontend tasks, проверять build и relevant QA target. |
| `agent-pack/` | active | Инструкции агентов, workflow docs, templates, skills, plans и quality gates. | При изменении правил синхронизировать `AGENTS.md`, релевантные agent docs и validators/tests. |
| `runtime/` | active | TypeScript workflow runtime: commands, validators, stage engine, route/intent logic. | Менять вместе с tests/runtime commands. |
| `tooling/` | active | Скрипты для audit, publish, screenshots, cleanup, lint и git scope checks. | Проверять точечными командами и `docs:audit`/`validate:config`, если меняются контракты. |
| `tests/` | active | Автотесты. Playwright tests разделяются по app/surface target. | Не смешивать studio, portfolio и demo assertions в одном spec без явного shared scope. |
| `siteportfolio/` | product source + ledger | Личный сайт-портфолио: `src/` содержит shared source для `/portfolio` preview и `apps/portfolio`, `runs/` содержит исторический ledger/evidence. | UI-правки идут в `siteportfolio/src`; `siteportfolio/runs/**` не коммитится без явного запроса. |
| `research/` | active ledger | Standalone research, CJM, market research и Notion-ready exports. | Новые research runs хранить в `research/projects/<slug>/<date>/`. |
| `outputs/` | active/legacy ledger | Product workflow runs, temp runs и archives. | Не использовать как source of truth для правил. `outputs/temp/**` не коммитить. |
| `design/` | active | Design-system context, Figma maps, design artifacts. | Менять вместе с design/rules docs, если меняются tokens/components. |
| `integrations/` | active | MCP, observability и integration docs/config examples. | Не хранить secrets; реальные external writes требуют approval. |
| `docs/architecture/` | active | Навигация по repo, git workflow, deployment boundaries. | Обновлять при изменении структуры или branch/deploy политики. |
| `reports/`, `test-results/`, `dist/` | generated | Logs, Playwright artifacts, build output. | Не коммитить. |

## Runnable Surfaces

| Surface | Код | Route | QA target |
|---|---|---|---|
| Studio/AgentFlow console | `apps/frontend/src/views/ConsoleView.tsx`, `LandingView.tsx`, `App.tsx` | `/`, `/console`, `/#console`, `/components` | `yarn qa:studio` |
| Site portfolio production | `apps/portfolio` app shell + `siteportfolio/src/PortfolioView.tsx`, `siteportfolio/src/styles.css` | `/`, `/:companyId`, `/:companyId/case/:caseId` | `yarn qa:portfolio` |
| Site portfolio studio preview | `apps/frontend/src/App.tsx` + `siteportfolio/src` | `/portfolio`, `/portfolio/:companyId`, `/portfolio/:companyId/case/:caseId` | covered by targeted/manual preview checks |
| A3Pay demo | product-specific branch/code until promoted | demo routes by branch context | future `apps/a3pay-demo`, if retained |

## Ledger Boundaries

Ledger — это история работы, evidence, screenshots, run state и publication records. Ledger не является местом для активного app-кода.

| Ledger | Path | Когда менять |
|---|---|---|
| Product workflow runs | `outputs/<project-slug>/<YYYY-MM-DD>/` | Только при полноценном product workflow или явном update run. |
| Research runs | `research/projects/<research-slug>/<YYYY-MM-DD>/` | Только при standalone research/CJM/market research. |
| Site portfolio ledger | `siteportfolio/runs/<YYYY-MM-DD>/` | Только при визуально значимой portfolio work, QA evidence или explicit ledger update. |
| Generated artifacts | `reports/`, `test-results/`, `dist/` | Никогда не коммитить в обычных tasks. |

Исторические ledger-файлы отражают состояние на дату run. Если в них встречаются старые route/path references, не используй их как текущие правила архитектуры; сверяйся с `AGENTS.md`, этим документом, `docs/architecture/git-workflow.md`, `siteportfolio/README.md` и актуальными app configs.

## Целевая структура

```text
apps/
  frontend/              # current studio shell until renamed/split
  portfolio/             # production portfolio app
  a3pay-demo/            # target standalone demo app if retained

packages/
  ui/                    # shared UI primitives only when reuse is real
  workflow-runtime/      # possible future home for runtime
  shared-config/         # possible future shared TS/Playwright/Vite config

agent-pack/
runtime/
tooling/
tests/
  playwright/
    studio.spec.ts
    portfolio.spec.ts
    firecrawl.spec.ts

research/
outputs/
siteportfolio/
  README.md
  src/                    # shared portfolio product source used by apps/portfolio
  runs/
```

## Migration Rules

1. Не переносить source files и ledgers в одном commit.
2. Каждый перенос app boundary должен иметь route map до/после, build command, targeted QA command, updated docs и staged scope check.
3. Долгоживущие ветки не должны быть единственным местом, где существует production route. Для портфолио production route `/` выражен через `apps/portfolio`; legacy preview route `/portfolio` остается в `apps/frontend`.
4. Исторические artifacts в `siteportfolio/runs/**`, `outputs/**`, `research/projects/**` не переписываются ради актуализации правил. Новые правила живут в `AGENTS.md`, `README.md`, `docs/architecture/**`, agent docs и runtime configs.

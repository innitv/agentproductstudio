# План: границы repo, приложений и веток

Дата: 2026-06-23
Ветка: `codex/repo-architecture-boundaries`
Тип работы: `limited engineering task`

## Контекст

Проект вырос из одного frontend-прототипа в смешанный monorepo: workflow runtime, agent-pack, research ledgers, product ledgers, портфолио и studio-консоль живут рядом. Из-за этого ветки начали хранить разные версии продуктовой реальности: например, доменное портфолио может жить на root route `/`, а studio-превью продолжает держать его на `/portfolio`.

Цель этого шага — выразить продуктовые границы в дереве проекта и командах, а не держать production-портфолио только в отдельной долгоживущей ветке.

## Решение

1. Описать целевую структуру repo в `docs/architecture/repo-map.md`.
2. Описать правила веток, deploy branches и protected/default branch в `docs/architecture/git-workflow.md`.
3. Разделить Playwright QA targets:
   - `qa:studio` проверяет текущую studio/console поверхность;
   - `qa:portfolio` проверяет production-портфолио из `apps/portfolio` на root route `/`;
   - `qa:playwright` последовательно запускает все Playwright targets.
4. Добавить отдельный Vite app target `apps/portfolio`, который использует shared source из `siteportfolio/src`.
5. Оставить `apps/frontend` route `/portfolio` как preview route для studio, но не считать его production-доменом.

## Scope

### Include

- `docs/architecture/repo-map.md`
- `docs/architecture/git-workflow.md`
- `apps/portfolio/**`
- `siteportfolio/src/**`
- `package.json`
- `playwright.config.ts`
- `tests/playwright/*`
- `tooling/scripts/run-playwright-with-preview.mjs`
- `README.md`
- `AGENTS.md`
- `siteportfolio/README.md`

### Exclude

- `siteportfolio/runs/**`
- `outputs/**`
- `research/projects/**`
- deploy secrets/environments
- физический перенос `siteportfolio/src` внутрь `apps/portfolio`

## Definition of Done

- Новая repo-карта объясняет ownership верхних директорий.
- Git workflow объясняет `main`, `codex/*`, feature branches и deploy branches.
- `apps/portfolio` собирает портфолио как отдельное приложение с root route `/`.
- `yarn qa:studio`, `yarn qa:portfolio`, `yarn qa:playwright` имеют разные понятные targets.
- `yarn docs:audit`, `yarn validate:config`, `yarn typecheck` проходят.

## Статус

Выполнено: добавлен отдельный Vite app target `apps/portfolio`, чтобы домен собирался без отдельной долгоживущей ветки. Source портфолио пока остается в `siteportfolio/src` как shared product source для production app и legacy preview route `/portfolio`.

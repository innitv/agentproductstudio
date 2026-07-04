# Git Workflow

Этот документ фиксирует, как использовать ветки в `product-agent-studio`.

## Принцип

`main` — интеграционная ветка и главный источник правды. Долгоживущие ветки не должны становиться единственным местом, где существует продуктовая архитектура. Если продукту нужен отдельный домен, отдельный route или отдельная сборка, это должно быть выражено в app/deploy structure.

## Ветки

| Branch pattern | Назначение | Время жизни | Merge target |
|---|---|---|---|
| `main` | Стабильная интеграционная ветка. | Постоянная | - |
| `claude/<task>` | Рабочие ветки Claude Code для ограниченных задач, реорганизаций, feature work. | Короткая, до PR/merge. | `main` |
| `feature/<task>` | Ручные продуктовые ветки, если нужно отделить работу человека. | Короткая или средняя. | `main` |
| `release/<version>` | Только при реальном release process. | До релиза/patch window. | `main` |
| `deploy/<surface>` или `gh-pages` | Build/deployment branch, если hosting требует branch source. | Может быть долгой, но не является source branch для разработки. | Не мержить обратно как feature source. |

## Правила для `main`

Рекомендуемые GitHub branch protection settings:

- запрет force push;
- запрет удаления ветки;
- pull request before merge;
- required status checks: `typecheck`, `validate:config`, `docs:audit`, relevant QA target;
- require branches to be up to date before merge, если CI быстрый;
- linear history по возможности;
- conversation resolution before merge.

## Правила для Claude Code branches

1. Имя ветки: `claude/<short-task-slug>`.
2. Перед работой проверить `git status --short`.
3. Для selective commit:
   - выписать include/exclude scope;
   - `git add` только явными путями;
   - запустить `yarn git:check-staged`;
   - проверить `git diff --cached --name-only`.
4. Не коммитить без явного разрешения:
   - `outputs/**`;
   - `research/projects/**`;
   - `research/archive/**`;
   - media/evidence/log/build artifacts;
   - `.env` и secrets.

## Deploy Environments

| Environment | Source | Команда проверки |
|---|---|---|
| `studio-preview` | `apps/frontend` current studio app | `yarn qa:studio` |
| `production` | explicit release/deploy config | `yarn qa:all` или environment-specific workflow |

Deployment branches можно использовать только как publication output. Например, `gh-pages` или `deploy/portfolio` может хранить сгенерированный build, если hosting этого требует. Product source должен оставаться в `main`/PR branches.

## Личный сайт-портфолио

Личный сайт-портфолио вынесен в отдельный репозиторий и больше не является частью этого проекта: здесь нет portfolio app boundary, preview route `/portfolio` или portfolio deploy/QA target.

## QA Targets

| Command | Что проверяет |
|---|---|
| `yarn qa:quick` | TypeScript, config validation, docs audit. |
| `yarn qa:studio` | Studio/AgentFlow Playwright tests на `apps/frontend`. |
| `yarn qa:playwright` | Последовательно запускает studio и firecrawl targets. |
| `yarn qa:all` | Быстрые проверки + все Playwright targets. |

Build targets:

| Command | Что собирает |
|---|---|
| `yarn build` | Alias для `yarn build:studio`. |
| `yarn build:studio` | `apps/frontend` в `dist/frontend`. |

Если `qa:playwright` падает из-за теста другой поверхности, нельзя молча обходить hook. Нужно либо запустить relevant target и записать deviation, либо разделить тесты/commands так, чтобы branch-specific работа не конфликтовала с другой поверхностью.

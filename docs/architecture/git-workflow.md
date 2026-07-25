# Git Workflow

Этот документ фиксирует, как в `product-agent-studio` устроена работа с git: где живёт код, как коммитить и что защищает от ошибочного коммита.

## Принцип: main-direct

**В этом репозитории работа идёт прямо в `main`. Feature-ветки не создаются.** Это не упущение, а осознанное правило: репозиторий — студия одного оператора, изменения проходят человеческий гейт до записи, а защита строится на **scope коммита и локальных проверках**, а не на code review в PR.

Практическое следствие для Claude Code: **не создавай ветку под задачу**, не предлагай PR как обязательный шаг и не считай отсутствие ветки отклонением от процесса. Если задача действительно требует изоляции (длинная рискованная миграция, эксперимент, который может не дожить до merge), ветка допустима — но как явное исключение с обоснованием, а не по умолчанию.

`main` остаётся главным источником правды. Долгоживущие ветки не должны становиться единственным местом, где существует продуктовая архитектура. Если продукту нужен отдельный домен, отдельный route или отдельная сборка, это выражается в app/deploy structure, а не в ветке.

## Ветки

| Branch pattern | Назначение | Время жизни | Merge target |
|---|---|---|---|
| `main` | Единственная рабочая ветка. Сюда коммитят и пушат напрямую. | Постоянная | - |
| `deploy/<surface>` или `gh-pages` | Build/deployment branch, если hosting требует branch source. | Может быть долгой, но не является source branch для разработки. | Не мержить обратно как feature source. |
| временная ветка под исключение | Только для длинной/рискованной работы, изоляция которой обоснована явно. | Максимально короткая. | `main` |

## Что заменяет branch protection и PR

Защита здесь **локальная и запускается до записи**, а не на стороне GitHub:

| Механизм | Где | Что делает |
|---|---|---|
| `pre-commit` hook | `.githooks/pre-commit` (`git config core.hooksPath=.githooks`) | Запускает `yarn qa:quick` — typecheck, `validate:config`, `docs:audit`. |
| `pre-push` hook | `.githooks/pre-push` | Запускает `yarn qa:all` — быстрые проверки + Playwright targets. |
| `yarn git:check-staged` | `tooling/` | Проверяет, что в staged-набор не попали `outputs/**`, media, логи и прочий запрещённый scope. |
| Approval gate | `agent-pack/guardrails/approval-matrix.md` | `git commit`/`push` — внешнее действие: без явного запроса пользователя требуется approval `git_write` с точным target. |

Ограничение, которое надо знать честно: эта защита работает, **пока коммитят с машины, где настроен `core.hooksPath`**. CI-workflow в `.github/` нет — есть только `pull_request_template.md` на случай, если PR всё же создаётся (например, при внешнем контрибьюте через веб-интерфейс). Проверки со стороны сервера отсутствуют.

## Правила коммита (действуют независимо от ветки)

1. Перед работой проверить `git status --short`.
2. Для selective commit (полная процедура — `agent-pack/templates/selective-commit-sop.md`, skill `selective-commit`):
   - выписать include/exclude scope **до** `git add`;
   - `git add` только явными путями; broad staging (`git add .`, `git add -A`) запрещён;
   - запустить `yarn git:check-staged`;
   - проверить `git diff --cached --name-only`.
3. Не коммитить без явного разрешения:
   - `outputs/**`;
   - `research/projects/**`;
   - `research/archive/**`;
   - media/evidence/log/build artifacts;
   - `.env` и secrets.
4. Не смешивать в одном коммите unrelated dirty tree: если в дереве лежат чужие незавершённые правки, коммитить только свой scope.

## Deploy Environments

| Environment | Source | Команда проверки |
|---|---|---|
| `studio-preview` | `apps/frontend` current studio app | `yarn qa:studio` |
| `production` | explicit release/deploy config | `yarn qa:all` или environment-specific workflow |

Deployment branches можно использовать только как publication output. Например, `gh-pages` или `deploy/portfolio` может хранить сгенерированный build, если hosting этого требует. Product source остаётся в `main`.

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

Если `qa:playwright` падает из-за теста другой поверхности, нельзя молча обходить hook. Нужно либо запустить relevant target и записать deviation, либо разделить тесты/commands так, чтобы работа над одной поверхностью не конфликтовала с другой.

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

Проверить, что скелеты Output Contract в `.claude/agents/*.md` и `agent-pack/agent-contracts/*.agent.md` не разошлись с `requiredSectionsByArtifact` в `runtime/typescript/workflow.manifest.ts`:

```bash
yarn workflow:test-agent-output-skeletons
```

Сверить отчёт субагента с фактическим состоянием диска и проверок (Agent Output Critic):

```bash
yarn agent:verify-output <report-file> --run-dir outputs/<project-slug>/<YYYY-MM-DD>
```

Команда проверяет, что заявленные в отчёте файлы существуют и непусты, что заявленные пройденными проверки действительно проходят, и что статус не противоречит фактам; для run-каталога дополнительно прогоняет `workflow:validate`. Вердикт `rejected` даёт ненулевой код выхода. Исполняются только команды из allowlist внутри `runtime/typescript/agent-output-critic.ts` — строки из отчёта никогда не исполняются. Как этим пользоваться — `docs/architecture/agent-output-critic.md`; регрессия — `yarn workflow:test-agent-output-critic`.

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

Выбрать глубину запуска (ось `scale`, см. CLAUDE.md §0.2). Без флага — `full`, то есть весь
pipeline:

```bash
yarn workflow:start "новая секция тарифов" --scale increment
yarn workflow:start "поправить copy в hero" --scale patch
```

`full` — весь pipeline `00`→`12`; `increment` — intake, design, copy, screens, frontend, qa,
release; `patch` — intake, design, frontend, qa. Масштаб режет только глубину: approval gates,
run ledger, `00-intake` и `11-qa` остаются на любом уровне. Масштаб пишется в `run-state.json`
и не может быть понижен задним числом.

Выбрать маршрут производства макета (ось `track`, см. CLAUDE.md §0.3). Без флага — `code`,
умолчание студии (shadcn/ui + Storybook):

```bash
yarn workflow:start "консоль выплат" --track figma
```

`code` не требует Figma-специфичных секций и полей схемы (`## Layout Compiler Contract`,
`## Figma Readiness` в `screens.md`; `## Design System Implementation`,
`## Component Contract Implementation`, `## Frame / State Implementation Map`,
`## Figma Visual QA Gate Summary`, `## Figma Roundtrip Deviations` в `frontend-result.md`) —
валидатор их не спрашивает вовсе. Маршрут пишется в `run-state.json` и `run-meta.json`, берётся
оттуда (а не по наличию `figma-layout-ir.json`) и не может быть сменён после того, как
`06-screens` или `08-frontend` отработали. Пропущенные по маршруту секции перечисляются в
`stage-gate-ledger.md` со статусом `skipped_by_track`.

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

Сверить навигационный индекс `research/registry.json` с фактическими каталогами `research/projects/*`:

```bash
yarn research:registry-sync                  # отчёт; ненулевой код при расхождении
yarn research:registry-sync --force          # привести реестр в соответствие (алиас: --fix)
yarn research:registry-sync --base <путь>    # сверить другой корень research/
```

Ведение реестра здесь частичное — и это осознанно. `yarn research:run` вносит слаг в `activeResearchProjects` сам, но команды создания research-run не существует (каталог заводит оркестратор обычной записью файлов), а архивация research выполняется вручную: `workflow:archive` работает только внутри `outputs/`. Поэтому основной инструмент — сверка, а не автозапись. В отличие от `outputs/registry.json`, рассинхрон здесь ничего не разрушает: скрипты уборки `research/` не читают. Регрессию охраняет `yarn workflow:test-research-registry`.

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

Проверить run, запущенный не на полном масштабе (флаг не нужен, если `scale` уже записан в
`run-state.json` — валидатор прочитает его сам):

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard --scale increment
```

Перепроверить чужой run под другим маршрутом (флаг не нужен для своего run — валидатор читает
`track` из `run-state.json`; на run, где маршрут-зависимая стадия уже отработала, попытка
переобъявить маршрут вернёт ошибку anti-backdating):

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard --track code
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
yarn workflow:registry-sync                         # сверить outputs/registry.json с фактическими каталогами
yarn workflow:registry-sync --force                 # привести реестр в соответствие с диском
yarn outputs:cleanup-dry-run                        # план уборки без единого перемещения — запускать ПЕРВЫМ
yarn outputs:cleanup                                # уборка outputs по правилам lifecycle
```

`outputs:cleanup` переносит в `outputs/temp/` всё, чего нет в `activeProducts` из `outputs/registry.json`. Зоны `products/`, `archive/`, `temp/` защищены в скрипте и в реестр не вносятся. При пустом `activeProducts` и непустом `outputs/` команда останавливается с ошибкой вместо переноса (обойти можно только флагом `--force`).

Реестр ведёт runtime: `workflow:start` вносит слаг в `activeProducts`, `workflow:archive` убирает его, когда у слага не осталось каталогов (и удаляет опустевший `outputs/<slug>/`). `workflow:registry-sync` — сверка: без флага печатает расхождение и завершается с ненулевым кодом, с `--force` чинит. Флаг `--base <путь>` позволяет сверить другой корень `outputs/`. Регрессию охраняет `yarn workflow:test-outputs-registry`.

## Разбор завершённого run

```bash
yarn workflow:retro outputs/<project-slug>/<YYYY-MM-DD>          # пять метрик процесса
yarn workflow:retro outputs/<project-slug>/<YYYY-MM-DD> --json   # то же машиночитаемо
```

Читает `run-state.json`, `run-meta.json`, `stage-gate-ledger.md`, `stage-results/*.json` и markdown-артефакты стадий; считает повторные заходы, канал обнаружения дефектов, отклонения процесса, approval задним числом, долг валидатора на закрытии и слепые зоны ledger. В run ничего не пишет — закрытый run read-only.

Отчёт всегда заканчивается разделом «Чего эти числа не видят»: канал находки машинно не выводится и определяется эвристикой, пока в артефакте нет маркера `<!-- retro: found_by=... -->` под заголовком захода. Интерпретация чисел, пороги и правило «одна находка — одно из трёх решений» — skill `run-retrospective`; slash-команда `/retro`. Регрессию охраняет `yarn workflow:test-run-retro`.

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

Дымовая проверка собранного приложения (корневой указатель маршрутов и пилотный экран):

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

### Токены дизайн-системы

Источник правды для токенов — DTCG-файлы в `design/tokens/shadcn/` (не Figma).
Тем четыре: `default`, `branded`, `calm`, `calm-typed`. Пересобрать
CSS-переменные фронтенда:

```bash
yarn tokens:build
```

Собирает `apps/frontend/src/styles/shadcn/tokens.generated.css` — блок
`@theme inline` с регистрацией цветовых имён в Tailwind и по блоку значений
`[data-shadcn-theme="…"]` на каждую тему. Команда сверяет тему `default` со
снимком реестра `design/tokens/shadcn/_registry/theme-slate.css` и падает при
расхождении: штатный shadcn обязан оставаться штатным, иначе сравнение с
брендовой темой теряет смысл. В конце печатается дистанция между темами —
сколько токенов и в каких группах переопределено.

Проверить, что сгенерированный CSS не отстал от источника, не переписывая файл:

```bash
yarn tokens:check
```

Подробности — в `design/tokens/shadcn/README.md`.

#### Добавление компонентов shadcn/ui

Дизайн-система по умолчанию для нового product UI (`CLAUDE.md` §6.1). Компоненты
ставятся из официального реестра `ui.shadcn.com` и копируются в
`apps/frontend/src/components/shadcn/` — после установки это код проекта, его
можно править.

```bash
yarn shadcn add button
```

CLI объявлен как devDependency и запускается через `yarn`: `npx` в этой среде
не работает (`npm` завершается с кодом 1 и пустым выводом). Команда `init` из
официальной документации не применяется — в 4.x она скаффолдит новый проект;
токены темы приходят отдельным элементом реестра (`yarn shadcn add @shadcn/theme-slate`).

### Storybook

Витрина компонентов. Конфигурация — `apps/frontend/.storybook/`, она подключает
`apps/frontend/vite.config.ts` (React + Tailwind) и `apps/frontend/src/styles.css`,
поэтому истории рендерятся на тех же токенах, что и приложение.

Dev-режим на `http://localhost:6006`:

```bash
yarn storybook
```

Статическая сборка в `dist/storybook`:

```bash
yarn build-storybook
```

Прогон историй как тестов (play-функции в Chromium через Playwright):

```bash
yarn test-storybook
```

Проверка доступности (`@storybook/addon-a11y`, axe-core) включена в режиме
предупреждений: нарушения видны в панели Accessibility, но сборку и
`yarn test-storybook` не валят. Режим переключается параметром `a11y.test`
в `apps/frontend/.storybook/preview.ts` (`todo` -> `error`).

### Визуальная регрессия Storybook

Скриншот-тесты всех историй витрины: замена ручной сверки макета с Figma.
Список story-id берётся программно из `index.json` собранной витрины, каждая
история открывается изолированно (`iframe.html?id=<storyId>`).

Прогнать против эталонов:

```bash
yarn vr:test
```

Перегенерировать эталоны (после осознанного изменения компонента):

```bash
yarn vr:update
```

**Обе команды выполняются только внутри Docker.** Это не удобство, а условие
корректности: имя файла снапшота содержит платформу, поэтому эталон, снятый
на Windows, на Linux не сравнивается, а создаёт новый файл — регрессия просто
не будет замечена. Дока Playwright требует запускать тесты в той же среде, где
сгенерирован эталон, а в `microsoft/playwright#20097` рендеринг расходился даже
между двумя машинами с одинаковой ОС, то есть «та же ОС» недостаточно — нужен
идентичный образ.

Базовый образ пиннут по версии `@playwright/test` из `package.json`
(`mcr.microsoft.com/playwright:v<version>-noble`); тонкий слой поверх него
описан в `tooling/visual-regression/Dockerfile`. Версия образа обязана
совпадать с версией раннера, иначе Playwright не найдёт браузеры — сверка
выполняется на каждом запуске. Архитектура пиннута как `linux/amd64`: в имени
снапшота Playwright пишет платформу, но не архитектуру, и на arm64-хосте
эталоны молча сравнивались бы с другим рендерингом под тем же именем.

Случайно снять эталон на Windows-хосте нельзя: `tooling/scripts/run-visual-regression.mjs`
никогда не вызывает Playwright локально, а `tests/visual-regression/playwright.vr.config.ts`
падает с объяснением, если `process.platform !== "linux"` или в среде нет `/.dockerenv`.
Статическая сборка витрины при этом делается на хосте (в контейнере нет
Windows-сборки `node_modules`), но платформа рендеринга в HTML/JS/CSS не зашита.

Что где лежит:

| Путь | Содержимое |
| --- | --- |
| `tests/visual-regression/storybook-visual.spec.ts` | Спека: перечисление историй и съёмка |
| `tests/visual-regression/playwright.vr.config.ts` | Гейт среды, гейт версии, пороги, JSON reporter |
| `tests/visual-regression/__screenshots__/` | Эталоны, снятые в контейнере (в git) |
| `tooling/visual-regression/Dockerfile` | Тонкий слой поверх пиннутого образа Playwright |
| `tooling/scripts/run-visual-regression.mjs` | Обёртка: сборка витрины, образ, запуск контейнера |
| `tooling/scripts/summarize-visual-regression.mjs` | Сжатие отчёта Playwright в плоский вердикт |
| `tooling/scripts/serve-static.mjs` | Статический сервер витрины внутри контейнера |

Машинно-читаемый вердикт: `reports/visual-regression/verdict.json` (JSON reporter
Playwright целиком) и `reports/visual-regression/summary.json` (плоский список:
story-id, статус, число различающихся пикселей, пути к `-expected` / `-actual` /
`-diff`). Пороги задаются декларативно в конфиге (`maxDiffPixels`,
`maxDiffPixelRatio`, `threshold`), из текста ошибки их читать нельзя — ratio там
округлён до двух знаков.

Отладочные переменные окружения: `VR_STORY_FILTER` (регулярное выражение по
story-id), `VR_WORKERS`, `VR_PORT`. Флаги обёртки: `--no-build` (не пересобирать
витрину), `--grep=<regex>` (подмножество историй).

#### Истории-страницы (composition stories)

Помимо компонентов витрина держит целые экраны приложения (`Pages/*`). Такая
история помечается тегом `vr-page`, и спека снимает её иначе: в вьюпорте
1280×2000 и целиком. Причина в фиксированных слоях — панель действий, тост:
при съёмке длинной страницы в обычном вьюпорте Playwright рисует их на позиции
текущего скролла, и фиксированная панель ложится поперёк середины снимка. В
высоком вьюпорте страница помещается целиком и фиксированный слой стоит там же,
где его видит человек. Эталоны компонентов этим не затронуты: они снимаются
прежним кадром 1280×800.

### Мобильная приёмка

Проверка UI в профиле устройства (`isMobile`, `hasTouch`, настоящие тач-жесты),
норма — `agent-pack/skills/design-engineering/SKILL.md`. Узкий desktop-вьюпорт
приёмкой не считается.

Нужен поднятый превью собранного приложения:

```bash
yarn build
node tooling/scripts/serve-static.mjs dist/frontend 4173
```

В другом окне:

```bash
yarn qa:mobile
```

Адрес перекрывается флагом: `yarn qa:mobile --base=http://127.0.0.1:5173`.
Продуктовая часть (маршруты, селекторы, ожидания) заполнена в блоке `CONFIG`
файла `tests/mobile-acceptance.check.mjs`, механика в нём — из шаблона
`agent-pack/templates/mobile-acceptance.template.mjs` и не правится.
Результат: `test-results/mobile-acceptance/mobile-acceptance.json` со статусами
пяти сценариев нормы и строкой `engine_limitation`. Коды выхода: `0` — приёмка
пройдена, `1` — есть провалившийся сценарий, `2` — `CONFIG` не заполнен.

`CONFIG` заполнен под маршрут `#card-request-shadcn-branded` — единственный
продуктовый экран приложения. Горизонтальная ось скролла помечена как
неприменимая осознанно: ряд категорий собран на `ToggleGroup` с переносом
строк, а не на карусели.

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

## Остальные локальные команды

Раздел закрывает пробел: `README.md` называет этот файл полным справочником, а часть скриптов `package.json` в нём не была описана.

| Команда | Что делает |
| --- | --- |
| `yarn typecheck` | `tsc --noEmit` по всему репозиторию. Входит в `qa:quick`. |
| `yarn validate:config` | Валидация конфигов + семантическая проверка маршрутов и стадий. Входит в `qa:quick`. |
| `yarn docs:audit` | Аудит документации: битые пути в backticks и markdown-ссылки в `docs/**`, `agent-pack/**`, `.claude/**`, `plugins/**`, корневых `*.md`, `outputs/README.md`, `research/README.md`; сверка упомянутых `yarn`-команд с `package.json` в обе стороны; сверка MCP-серверов из `.mcp.json` с `README.md`/`CLAUDE.md`. Входит в `qa:quick`. Правила исключений — в шапке `tooling/scripts/audit-docs.mjs`. |
| `yarn qa:all` | `qa:quick` + полный Playwright. Запускается `pre-push` хуком. |
| `yarn qa:playwright:install` | Установка Chromium для Playwright. |
| `yarn workflow:sync <run-dir>` | Пересобрать `run-state.json` после ручной правки артефактов run. |
| `yarn workflow:inspect <run-dir>` | Детальное состояние стадий и gates одного run. |
| `yarn workflow:outputs <run-dir>` | Список артефактов run с их статусом. |
| `yarn workflow:approval-request <run-dir> <action>` | Интерактивный запрос approval с точным `target` (Interactive Question Gate). |
| `yarn plugin:link` | Ставит плагины из `plugins/` junction'ом в `~/.claude/skills/`. |
| `yarn figma:check` | Проверка локального Figma token. |
| `yarn figma:audit` | Аудит Figma component contracts против live-файла. Систему указывать явно: `--registry design/figma/<slug>/component-contracts.json --out design/figma/<slug>/live-audit.latest.md`. |
| `yarn figma:verify-layout` | Проверка `figma-layout-ir.json` против собранных экранов. |
| `yarn notion:publish-research-hub`, `yarn notion:publish-stories`, `yarn notion:test-export` | Notion publish/export скрипты; требуют approval `notion_research_publish`. |
| `yarn workflow:test-*` | Отдельные runtime-тесты. Обычно запускаются пачкой через `yarn workflow:test-agentic`; поштучный запуск нужен при отладке конкретной подсистемы. |

Полный список подкоманд `workflow:test-*` смотри в `package.json` — цепочка `workflow:test-agentic` перечисляет их в порядке запуска.

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

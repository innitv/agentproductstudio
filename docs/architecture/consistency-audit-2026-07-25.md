# Аудит согласованности студии после run `contractor-payment-demo`

**Дата:** 2026-07-25
**Тип:** limited engineering task / audit (read-only, правки не вносились)
**Повод:** завершён крупный продуктовый run `contractor-payment-demo` (2026-07-23…25); продукт вынесен в отдельный репозиторий, `apps/contractor-payment-demo/` удалён (`e2e9760`), модели трёх агентов подняты до opus и добавлены §11.2 / §3.3 (`ffbd0ca`).
**Вопрос пользователя:** всё ли синхронно — в агентах, README, CLAUDE-файлах и по связям репозитория.
**Метод:** сверка первоисточников (frontmatter, манифест, схемы, конфиги) + запуск машинных проверок + четыре параллельных сборщика с обязательной верификацией каждой находки открытием файла. Ни одна находка ниже не подана по результату грепа без чтения места.

---

## 0. Краткий итог

Слой, который **проверяется машиной**, синхронен: `validate:config`, `docs:audit`, `test-agent-metadata`, `test-agent-capabilities`, `test-skill-metadata`, `test-skill-usage` — все зелёные; 13 агентов ↔ 13 контрактов, 24 skill ↔ 24 skill, 17 команд, `skills:` обёрток совпадают с контрактами посимвольно, права инструментов соответствуют CLAUDE.md §11.

Разъехалось ровно то, что **машиной не проверяется**: (1) скелеты Output Contract в обёртках агентов против `requiredSectionsByArtifact` в манифесте; (2) документация вне трёх корневых файлов (`docs/architecture/**`, `outputs/README.md`); (3) `outputs/registry.json` против фактических каталогов. Это буквальный случай эвристики `/subsystem-audit:audit` §6: «единственная связь между слоями, которую никто не проверял, — ровно та, что молча разъехалась».

Всего находок: **1 P0, 8 P1, 11 P2**.

---

## 1. P0 — блокирует работу

### P0-1. Скелет `frontend-result.md` в обёртке агента вдвое короче обязательного набора секций; гейт валидатора не проходится

**Первоисточники:**
- `.claude/agents/frontend.md:63-86` — Output Contract даёт **4** секции: `## Changed Files`, `## Implementation Notes`, `## Commands Run`, `## Known Limitations`.
- `runtime/typescript/workflow.manifest.ts:283` — `requiredSectionsByArtifact` требует **9**: те же 4 плюс `## Design System Implementation`, `## Component Contract Implementation`, `## Frame / State Implementation Map`, `## Figma Visual QA Gate Summary`, `## Figma Roundtrip Deviations`.
- `agent-pack/agent-contracts/frontend.agent.md:137-177` — контракт содержит все 9 и прямо предупреждает, что секции синхронизированы с `requiredSectionsByArtifact` и не удаляются даже как `not_applicable`, «иначе section-gate валидатора не пройдёт».

**Почему это P0, а не расхождение документов.** Обёртка — системный промпт, который субагент получает всегда; контракт он читает, только если дойдёт до него по ссылке. Агент, выполнивший скелет обёртки буквально, отдаёт артефакт, который валится на `yarn workflow:validate`.

**Это уже сработало.** `yarn workflow:validate outputs/contractor-payment-demo/2026-07-23 --profile reference` → 28 errors, из них 16 — ровно по `frontend-result.md`. Фактические секции артефакта (`outputs/contractor-payment-demo/2026-07-23/frontend-result.md`) — `## Changed Files`, `## Commands Run`, `## Known Limitations`, `## Что реализовано` (вместо `## Implementation Notes`); пяти Figma-секций нет вовсе.

**Предлагаемое исправление:** привести скелет в `.claude/agents/frontend.md` к 9 секциям манифеста, добавив пометку «для не-Figma задач заполняются как `not_applicable` с причиной, но не удаляются» (формулировка уже есть в контракте, строка 177).

**Отложенное структурное решение (не делать молча):** завести тест, который сверяет скелеты Output Contract в `.claude/agents/*.md` и `agent-pack/agent-contracts/*.agent.md` с `requiredSectionsByArtifact` из `workflow.manifest.ts`. Без него P0-1, P1-3, P1-4 и P1-5 воспроизведутся при следующем изменении манифеста. Решение за пользователем — это новая машинная связь, а не правка текста.

---

## 2. P1 — вводит в заблуждение / создаёт реальный риск

### P1-1. `outputs/registry.json` пуст, хотя в `outputs/` четыре продуктовых каталога; `yarn outputs:cleanup` переместит все четыре в `temp/`

**Первоисточники:**
- `outputs/registry.json` — `{"activeProducts": []}`.
- Фактически в `outputs/`: `a3-design-system-review/`, `a3-finance-redesign/`, `portfolio-design-system/`, `contractor-payment-demo/`.
- `tooling/scripts/cleanup-outputs.mjs:35,98-112` — каталог, которого нет в `activeProducts`, помечается «Тест/Мусор» и переносится `fs.renameSync` в `outputs/temp/`. Защищены только `registry.json`, `README.md`, `.gitkeep`, `products`, `temp` (строки 49-55).
- `outputs/README.md:39` — «Все реальные продукты регистрируются в массиве `activeProducts`».

**Проверено, не является ли это намеренной политикой «registry только для активных».** Нет: `research/registry.json` ведётся идеально — 7 записей ↔ 7 каталогов в `research/projects/`, один-в-один. Исторически `outputs/registry.json` был заполнен (`git show 610418f:outputs/registry.json` — 7 продуктов) и опустел в `fe790ed`. Ни один скрипт не пишет его автоматически: `workflow:start`/`workflow:sync` его не трогают, `cleanup-outputs.mjs` только читает. То есть реестр ведётся вручную по правилу `agent-pack/skills/outputs-cleanup/SKILL.md:53,71` — и правило не исполняется.

**Предлагаемое исправление:** внести в `activeProducts` те run, что должны жить в runtime-пути (как минимум `contractor-payment-demo`), а завершённые — провести через `yarn workflow:archive`. Отдельно: рассмотреть предупреждение в `cleanup-outputs.mjs`, когда `activeProducts` пуст, а каталогов много (сейчас скрипт молча считает это «всё мусор»).

### P1-2. Run `contractor-payment-demo/2026-07-23` не закрыт: `status: pending`, отсутствует обязательный по масштабу артефакт релиза

**Первоисточники:**
- `outputs/contractor-payment-demo/2026-07-23/run-meta.json` — `"status": "pending"`, `workflow_scale: "increment"`, `workflow_profile: "reference"`.
- `stage-gate-ledger.md:28-31` — `09-visual-reference` и `11-qa` помечены `⏳ pending`, `08-frontend` — «частично готово, ждёт расширения».
- Валидатор: `ERROR: 12-release Release: missing required artifact release-notes.md`; `ERROR: run-state.json status is 'pending', so the full workflow gate is not complete`.
- CLAUDE.md §0.2 — масштаб `increment` включает `12-release`, то есть `release-notes.md` не может быть опущен «по масштабу».

**Что при этом сделано правильно:** пропуски по масштабу зафиксированы честно — `01-research`, `02-prd`, `03-ia`, `07-prototype`, `10-test-bench` записаны как `skipped_by_scale` с причинами (`stage-gate-ledger.md:20-29`), и валидатор их не требует. Механизм `scale` работает.

**Предлагаемое исправление (решение за пользователем):** либо дозакрыть run (дописать секции артефактов, `release-notes.md`, перевести стадии в completed), либо явно закрыть его как `partial` с reason «продукт вынесен в отдельный репозиторий, релиз ведётся там» и заархивировать через `yarn workflow:archive`. Молча оставить `pending` — худший вариант: неотличимо от забытого run.

### P1-3. Скелет `prototype-report.md` в обёртке — 7 секций против 9 в манифесте

`.claude/agents/prototype.md:62-92` — 7 секций; `agent-pack/agent-contracts/prototype.agent.md:84-124` — 9; манифест: `workflow.manifest.ts:262` (`## Input Readiness Pass`) и `:269` (`## Frontend Handoff Contract`). Тот же класс, что P0-1, ещё не выстреливший только потому, что `07-prototype` был исключён масштабом в последнем run.

### P1-4. Пара `qa-review` (обёртка + контракт) отстала от манифеста на 5 секций

`.claude/agents/qa-review.md:69-102` и `agent-pack/agent-contracts/qa-review.agent.md:194-227` дают по 8 секций; манифест (`workflow.manifest.ts:323-338`) требует 13. Нет `## Research Integrity`, `## Traceability Audit`, `## Negative & Edge Path Pass`, `## Design System Strategy Audit`, `## Component Contract Audit`.

**Подтверждено фактом:** `qa-report.md` последнего run содержит 13 своих секций, но именно четырёх из перечисленных в нём нет — валидатор выдал по ним ошибки. Здесь дрейфует не одна сторона, а согласованная пара против манифеста.

### P1-5. Пара `release` отстала от манифеста на 2 секции

`.claude/agents/release.md:64-94` и `agent-pack/agent-contracts/release.agent.md:95-125` — 7 секций; манифест требует 9 (`workflow.manifest.ts:349-350`): нет `## Release Scope` и `## Run Ledger Audit`. При этом оба документа описывают соответствующие шаги в теле (`release.md:32,34`) — то есть работа предполагается, а места под неё в шаблоне нет.

### P1-6. Документация утверждает, что плагин один, — плагинов два

- `docs/architecture/repo-map.md:27` — «Сейчас один: `figma-ds/`»; то же в дереве, `repo-map.md:80-81`.
- `README.md:73` и `README.md:93` — упоминают только `figma-ds`.
- Факт: `plugins/` содержит `figma-ds/` и `subsystem-audit/` (второй добавлен `050bf33` и описан в CLAUDE.md §11 как `/subsystem-audit:audit`).

Расхождение вводит в заблуждение именно там, где документ обещает быть картой репозитория.

### P1-7. `docs/architecture/git-workflow.md` предписывает работу через ветки, фактическая практика — прямые коммиты в `main`

- `git-workflow.md:11-19` — таблица веток `claude/<task>`, `feature/<task>`, `release/<version>`; `:35-38` — «Имя ветки: `claude/<short-task-slug>`»; `:24-32` — рекомендованный branch protection с required status checks и PR before merge.
- Факт: `git branch -a` → единственная локальная ветка `main`; последние коммиты (`ffbd0ca`, `e2e9760`, `7177c3c`) сделаны прямо в `main`. Память проекта фиксирует это как осознанное правило («в этом репо коммитим/пушим прямо в main, feature-ветки не создавать»).
- CLAUDE.md §2 подаёт `git-workflow.md` как источник правды о ветках, то есть противоречие нормативное, а не бытовое.

**Предлагаемое исправление:** это случай «правило само устарело». Зафиксировать в `git-workflow.md` фактический режим main-direct как основной, а ветки — как исключение для длинных/рискованных работ. Решение за пользователем: возможен и обратный выбор (вернуться к веткам), но текущее состояние — документ против практики.

### P1-8. `outputs/README.md:41` ссылается на два несуществующих каталога и противоречит CLAUDE.md

Цитата: «Сейчас личный сайт-портфолио вынесен в `siteportfolio/`, а production app shell живет в `apps/portfolio/`». Проверено: `siteportfolio/` не существует, `apps/portfolio/` не существует (в `apps/` только `frontend/`). CLAUDE.md §0.1 и `git-workflow.md:52-54` прямо говорят, что портфолио вынесено в **отдельный репозиторий** и в студии не живёт. `repo-map.md:39` уже исправлен, `outputs/README.md` — нет.

---

## 3. P2 — косметика и точность

| # | Первоисточник | Суть | Исправление |
|---|---|---|---|
| P2-1 | `docs/architecture/repo-map.md:45` | В ячейке «Код» третий путь без префикса: `views/LandingView.tsx`; файл лежит в `apps/frontend/src/views/LandingView.tsx`, соседние два пути в той же ячейке префикс сохраняют | Дописать префикс |
| P2-2 | `docs/architecture/repo-map.md:46` | Строка «A3Pay demo \| product-specific branch/code until promoted \| demo routes by branch context \| future `apps/a3pay-demo`, if retained». Проверено: веток кроме `main` нет, `apps/a3pay-demo` нет, единственные упоминания `a3pay-demo` — сама эта строка и архивный план. Плюс колонка «QA target» содержит путь, а не команду | Удалить строку или пометить как исторический план |
| P2-3 | `README.md:87`, `CLAUDE.md:15` | Список MCP-серверов: 7 имён, в `.mcp.json` их 8 — не назван `figmaDesktop` | Дополнить список |
| P2-4 | `.claude/commands/*.md` (14 файлов) | Делегирование описано как «`Task` tool», тогда как CLAUDE.md §0 фиксирует, что в v2.1.63 инструмент называется `Agent`, а `Task` — alias | Переименовать в командах для единой терминологии (поведение не меняется) |
| P2-5 | 8 пар skills | `description` краткой и полной версии разошлись (design-engineering, design-loop, ds-to-storybook, figma-ds-ingest, figma-handoff, research-pack и др.). Триггеринг определяет краткая версия, поэтому поведение не меняется; расходится документация | Синхронизировать description |
| P2-6 | `agent-pack/skills/{funnel-analytics-verifier,landing-builder,seo-copy-validator}/SKILL.md` | В `description` имена артефактов написаны snake_case (`test_bench_result`, `qa_report`, `copy_deck`) вместо реальных дефисных имён файлов; у остальных 21 skill — корректно | Привести к дефисной форме |
| P2-7 | `agent-pack/skills/style-decompose/SKILL.md:566` | Английская вставка «visually risky» в русском description (в краткой версии — «визуально рискованных»); CLAUDE.md §1 запрещает смешение языков без причины | Перевести |
| P2-8 | `agent-pack/agent-contracts/qa-review.agent.md:154-156` | В теле «Required Outputs: `qa-report.md`», тогда как frontmatter (:27-29) и обёртка объявляют ещё `visual-reference-review.md`. Здесь обёртка точнее контракта | Править контракт |
| P2-9 | `agent-pack/agent-contracts/notion-publisher.agent.md:16-17` | `required_outputs: notion_prd_export` расходится с телом (:102-105) и обёрткой, где `notion-research-export-ru.md`; валидатор пропускает по исключению `agent-metadata.ts:96` | Привести frontmatter к телу |
| P2-10 | `agent-pack/agent-contracts/design.agent.md:13` vs `:133`, `.claude/agents/design.md:51` | Статус `reference-analysis.md` противоречив: frontmatter относит к `optional_outputs`, тела обоих файлов называют обязательным. Это про gate, а не про формулировку | Определиться и синхронизировать |
| P2-11 | обёртки vs контракты | Поздние ужесточения контрактов не доехали до обёрток: `test-bench` (стабильные локаторы/web-first assertions, trace+screenshot on failure, consent-gate через network interception — `test-bench.agent.md:55-57`), `qa-review` (привязка a11y-находок к критериям WCAG 2.2 AA + axe/Lighthouse, проверка на slopsquatted зависимости — `:105,110`), `release` (semver по Conventional Commits, anomaly-пороги как rollback trigger — `:59,62`), `prd` (Given-When-Then, evals-критерии для AI-фич — `:59`). Триггер-фразы обёрток `design`/`frontend`/`design-generator` — подмножество контрактных | Дотянуть обёртки по мере необходимости |

Мелочи, не выделенные в находки: `.agents/` — пустой каталог в корне, не описан в `repo-map.md`; `Bash(yarn deploy:*)` в `.claude/settings.json` (ask) ссылается на несуществующий скрипт — безвредно, но мертво; `COMMANDS.md` заявлен «полным справочником» (`README.md:75`), при этом 25 скриптов из `package.json` в нём не описаны (в основном внутренние сабкоманды `workflow:test-*`, но также `typecheck`, `validate:config`, `workflow:approval-request`).

---

## 4. Проверено — расхождений нет

**Машинные проверки (все зелёные):**
`yarn validate:config` — Config + Semantic validation passed. `yarn docs:audit` — passed. `yarn workflow:test-agent-metadata`, `test-agent-capabilities`, `test-skill-metadata`, `test-skill-usage` — passed. `yarn workflow:skills` — покрытие всех 13 стадий, пустой список skills только у `03-ia` (соответствует контракту).

**Агенты:**
13 обёрток ↔ 13 контрактов, расхождений имён нет. Модели: расхождение по модели структурно невозможно — **контракты вообще не задают `model`/`tools`**, их frontmatter другой схемы (`agent_name`, `owner_stage_ids`, `required_inputs/outputs`, `approval_actions`, `skills`, `contract_schema`, валидируется `runtime/typescript/agent-metadata.ts:213-231`). Единственный источник правды по модели — frontmatter обёртки; хардкода версий нет нигде, только алиасы. Подъём `frontend`/`design-generator`/`copywriting` до opus (`ffbd0ca`) ничего не рассинхронизировал.

Правило «специалисты не спавнят субагентов» соблюдено во всех 12 обёртках специалистов: 7 через явный `disallowedTools: Task, Agent`, 5 через allowlist `tools:` без них. Запрет спавна оркестратора продублирован механически в `.claude/settings.json` (`Task(orchestrator)`, `Agent(orchestrator)`). Поле `mcpServers` не используется ни в одной обёртке (и правильно: оно расширяет доступ, а не ограничивает).

`skills:` обёрток совпадают с контрактами во всех 12 непустых списках посимвольно; все 23 упомянутых навыка существуют в обоих деревьях. `owner_stage_ids` ↔ описание роли совпадает везде, включая двухмаршрутный `qa-review` (09 + 11) и внестадийный `notion-publisher` (`owner_stage_ids: []`). `required_inputs`/`required_outputs` соответствуют контрактам во всех 13 парах (кроме внутренних противоречий P2-8/P2-9). Скелеты Output Contract совпадают с манифестом у `copywriting` (5/5), `prd` (7/7), `ia` (4/4), `test-bench` (4/4).

**Skills:**
24 ↔ 24, сирот нет, посторонних каталогов нет. Ссылка на полную версию присутствует и корректна во всех 24 кратких файлах. Содержательных коллизий (разные обязательные шаги, пороги, команды, имена выходных файлов) не найдено ни в одной паре. §3.3 `visual-diff-verifier` из `ffbd0ca` добавлен **синхронно в обе версии** одним диффом и содержательно совпадает — версии не разъехались. Все `yarn`-команды, упомянутые в skills, существуют; все 12 путей к шаблонам/workflow существуют. Списки validation-команд идентичны в каждой паре.

**Следы удалённого демо:**
Мёртвых ссылок нет. Ни `demo:dev`/`demo:build` в `package.json`, ни корневого `vercel.json`, ни `.claude/launch.json`, ни `workspaces`, ни упоминаний в `tsconfig.json`, `playwright.config.ts`, `.gitignore`, `.gitattributes`, `.github/**`, `tooling/**`, `runtime/**`, `.claude/settings.json`, `.claude/commands/`, `.claude/agents/`, `README.md`, `repo-map.md`. Все упоминания `apps/` ведут на существующий `apps/frontend`. Упоминания `contractor-payment-demo` в `CLAUDE.md:213` и `agent-pack/skills/visual-diff-verifier/SKILL.md:84` — датированные ссылки-прецеденты, легитимны. 22 строки с путями `apps/contractor-payment-demo/...` внутри `outputs/contractor-payment-demo/2026-07-23/**` — норма: run фиксирует состояние на свою дату (`repo-map.md:100`, Migration Rule 4).

**Битые ссылки:**
Просканировано 729 кандидатов в `CLAUDE.md`, `README.md`, `AGENTS.md`, `COMMANDS.md`, `docs/**`, `agent-pack/**`, `.claude/**`, `integrations/**`, `plugins/**` (199 отсеяно как шаблоны с плейсхолдерами, 111 — внешние URL). Подтверждена **одна** битая ссылка — P2-1. Остальные 23 кандидата проверены глазами и оказались ложными срабатываниями (traceability-стрелки `->`, списки расширений, `путь:номер_строки`, динамические output-пути ingest).

**Документы и конфигурация:**
`AGENTS.md` — корректный указатель на `CLAUDE.md`, как и требует CLAUDE.md. Нумерация CLAUDE.md после вставки §11.2 не поехала: 0 → 0.1 → 0.2 → 1 … 11 → 11.1 → 11.2 → 12 → 13. `.claude/commands/` — 17 файлов, ровно соответствуют списку CLAUDE.md §12; каждая ведёт на существующего агента. Все 7 hook-скриптов из `settings.json` существуют в `.claude/hooks/`. `permissions.allow/ask` ссылаются на существующие команды (единственное исключение — `yarn deploy:*`). `.mcp.json` против `integrations/mcp/mcp-servers.example.json`: расхождения только ожидаемые (пример шире и содержит REPLACE_WITH-заглушки); реальный конфиг не содержит секретов, только `${ENV}`-подстановки. `README.md`: заявленные «13 субагентов», таблица 13 контрактов, 17 slash-команд, состав кросс-стадийных skills, `apps/frontend` — всё соответствует факту; упоминаний портфолио и демо не осталось. Все не-плейсхолдерные пути в `README.md` и `COMMANDS.md` существуют; упомянутых-но-отсутствующих yarn-команд нет.

**Датированные аудиты** (`agent-audit-2026-07-06.md`, `agent-tooling-update-2026-07-15.md`, `agent-plugin-connectivity-audit-2026-07-17.md`, `plugin-orchestration-benchmark-2026-07-17.md`, `figma-canon-consistency-audit-2026-07-06.md`, `system-sync-audit-2026-07-17.md`): упоминания sonnet в них — общие рассуждения о model-routing, датой в шапке документы честно помечены как состояние на свою дату и не подаются как текущий источник правды. Не находка.

---

## 5. Сравнение с практикой похожих проектов

| Проект | Что там устроено | Чем отличаемся |
|---|---|---|
| [github/spec-kit](https://github.com/github/spec-kit) | Каскад шаблонов (`.specify/templates/` с overrides/presets/extensions), `.pre-commit-config.yaml`, `.markdownlint-cli2.jsonc`, workflows в `.github/`, команда `specify bundle validate` для структурной проверки пользовательских бандлов | У нас проверка шаблонов сильнее по существу (schema + required sections в `workflow.manifest.ts`), но применяется только к **артефактам run**, не к **скелетам в промптах агентов** — отсюда P0-1 |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 12+ ролей-экспертов, манифест `bmad-modules.yaml`, `.husky` для pre-commit, eslint/prettier, `.coderabbit.yaml` для авто-ревью, `.github` workflows | Сопоставимая структура ролей и манифест у нас есть и покрыты тестами. Отличие — у них проверки крутятся **в CI**, у нас только локально |
| [lycheeverse/lychee-action](https://github.com/lycheeverse/lychee-action) | Проверка ссылок (в том числе локальных файловых) в markdown/html прямо в workflow, минимальная конфигурация в несколько строк | У нас `tooling/scripts/audit-docs.mjs` проверяет **только** backtick-пути и **только** в `README.md`, `CLAUDE.md`, `AGENTS.md` (строки 5, 75-86). `docs/**`, `agent-pack/**`, `.claude/**` и markdown-ссылки `[текст](путь)` не покрыты — и единственная битая ссылка нашлась ровно там |

**Состояние CI у нас:** `.github/` содержит только `pull_request_template.md`, workflow-файлов нет. Защита — локальные git-хуки (`core.hooksPath=.githooks`): `pre-commit` → `yarn qa:quick`, `pre-push` → `yarn qa:all`. Это работает, пока коммитят с этой машины; на PR со стороны проверок нет.

---

## 6. Что предлагается решить пользователю (структурное, не делать молча)

1. **Тест «скелеты ↔ манифест»** — закрывает класс P0-1/P1-3/P1-4/P1-5 навсегда. Новая машинная связь, требует решения.
2. **Расширение `audit-docs.mjs`** на `docs/**`, `agent-pack/**`, `.claude/**` и на markdown-ссылки `[](...)`, либо lychee в CI. Закрывает класс P2-1/P1-6/P1-8.
3. **Судьба run `contractor-payment-demo`** (P1-2): дозакрыть или закрыть как `partial` + архив.
4. **`git-workflow.md`** (P1-7): зафиксировать main-direct как правило или вернуться к веткам.
5. **`outputs/registry.json`** (P1-1): заполнить вручную либо научить `workflow:start`/`archive` вести его автоматически (второе — изменение runtime). — **Реализовано 2026-07-25, см. 7.7.**

---

## 7. Что исправлено 2026-07-25

Объём выбран пользователем: **опасное + P0 + системный тест**. Всё остальное осознанно отложено и остаётся в разделах выше.

### 7.1. P1-1 — риск потери каталогов в `outputs/` (опасное)

- `outputs/registry.json` заполнен четырьмя фактическими продуктовыми каталогами (`a3-design-system-review`, `a3-finance-redesign`, `contractor-payment-demo`, `portfolio-design-system`) в историческом формате из `610418f` — плоский массив slug'ов.
- **Найдено сверх отчёта:** незащищённым был не только продуктовый каталог, но и `outputs/archive/` — зона архива по CLAUDE.md §4. Аудит её пропустил, потому что смотрел на список продуктов, а не на список незащищённых имён. `archive` добавлен в `protectedItems` в `tooling/scripts/cleanup-outputs.mjs` рядом с `products` и `temp`. Решение по границе: `products/`, `archive/`, `temp/` — это **зоны хранения**, а не product-slug; их место в `protectedItems`, а не в `activeProducts` (иначе реестр активных продуктов начинает описывать инфраструктуру).
- Добавлен **предохранитель**: при пустом `activeProducts` и непустом `outputs/` скрипт останавливается с ошибкой и перечисляет каталоги, которые были бы перенесены. Обход — только явный `--force`. Именно это состояние (пустой реестр + 5 каталогов) и было опасным.
- Добавлен режим `--dry-run` и команда `yarn outputs:cleanup-dry-run`: план без единого перемещения. Проверка результата выполнена только через него — реальный `outputs:cleanup` не запускался.
- Документация: `outputs/README.md` (структура + правила 8, 9) и `COMMANDS.md` описывают `archive/`, dry-run и предохранитель.

### 7.2. P0-1, P1-3, P1-4, P1-5 — скелеты Output Contract

Приведены к `requiredSectionsByArtifact` (состав **и порядок**):

| Файл | Артефакт | Было | Стало |
|---|---|---|---|
| `.claude/agents/frontend.md` | `frontend-result.md` | 4 | 9 |
| `.claude/agents/prototype.md` | `prototype-report.md` | 7 | 9 |
| `.claude/agents/qa-review.md` | `qa-report.md` | 8 | 13 |
| `.claude/agents/qa-review.md` | `visual-reference-review.md` | скелета не было | 7 |
| `.claude/agents/release.md` | `release-notes.md` | 7 | 9 |
| `agent-pack/agent-contracts/qa-review.agent.md` | `qa-report.md` + `visual-reference-review.md` | 8 / нет | 13 / 7 |
| `agent-pack/agent-contracts/release.agent.md` | `release-notes.md` | 7 | 9 |

**Найдено сверх отчёта:** у `qa-review` не было скелета `visual-reference-review.md` ни в обёртке, ни в контракте, хотя агент владеет стадией `09-visual-reference`, а манифест требует там 7 секций. Это тот же класс, что P0-1, и он объясняет 6 из 28 ошибок валидатора по последнему run.

Проверены все 13 обёрток и все 13 контрактов. Остальные пары совпадают с манифестом (`copywriting` 5/5, `prd` 7/7, `ia` 4/4, `test-bench` 4/4, `frontend.agent.md` 9/9, `prototype.agent.md` 9/9). Свёрнутые скелеты (`design`, `design-generator`) оставлены как есть — они не претендуют быть шаблоном и не вводят агента в заблуждение.

### 7.3. Системный тест «скелеты ↔ манифест»

`runtime/typescript/test-agent-output-skeletons.ts`, команда `yarn workflow:test-agent-output-skeletons`, включён в цепочку `yarn workflow:test-agentic` (рядом с `test-agent-capabilities`, по образцу которого сделан).

Что проверяет: в любом fenced yaml-блоке `.claude/agents/*.md` и `agent-pack/agent-contracts/*.agent.md` ищет ключи `  <artifact_name>: |` из `artifactNames`; если под ключом развёрнут скелет, его секции должны совпадать с манифестом полностью и в том же порядке. Свёрнутый скелет пропускается намеренно: тест ловит **расхождение**, а не отсутствие. Есть защита от самообмана — `assert`, что развёрнутых скелетов найдено не меньше 10 (сейчас 18, свёрнутых 3).

Негативный контроль выполнен дважды — на пропуск секции и на порядок; оба падения приложены в отчёте исполнителя.

### 7.4. P1-7 — `git-workflow.md` приведён к практике

Решение пользователя: практика верна, править документ. Ветки `claude/<task>`, `feature/<task>`, `release/<version>` и рекомендации GitHub branch protection убраны; зафиксирован режим **main-direct** с явным указанием Claude Code не создавать ветку под задачу. Добавлена таблица «что заменяет branch protection и PR» (`pre-commit` → `yarn qa:quick`, `pre-push` → `yarn qa:all`, `yarn git:check-staged`, approval `git_write`) и честное ограничение: защита локальная, CI-workflow нет. Сохранены правила selective commit, список запрещённого к коммиту scope и требование approval — они не про ветки.

Синхронизировано: `CLAUDE.md` §2 (формулировка «правила веток» → «правила git (main-direct, без feature-веток)»). Проверены `README.md`, `COMMANDS.md`, `repo-map.md`, `.github/pull_request_template.md`, `.githooks/**` — предписаний создавать ветки в них нет. `agent-pack/skills/selective-commit/SKILL.md:61` и краткая версия уже говорили main-direct и ссылались на `git-workflow.md`; теперь ссылка ведёт на непротиворечивый документ. PR-шаблон оставлен: он описывает содержимое PR, а не обязательность ветвления.

### 7.5. Что осознанно НЕ трогали

- **P1-2** (run `contractor-payment-demo/2026-07-23` не закрыт) — решение о судьбе run за пользователем.
- **P1-6** (документация про один плагин вместо двух), **P1-8** (`outputs/README.md:41` про `siteportfolio/`), **все P2** — остаются в разделах 2-3 как задел.
- Расширение `audit-docs.mjs` / lychee в CI (предложение 6.2) — не входило в объём.

### 7.6. Валидатор до и после: цифры и их смысл

`yarn workflow:validate outputs/contractor-payment-demo/2026-07-23 --profile reference`: **28 errors до → 28 errors после**.

Это ожидаемо и не является провалом правки. Валидатор проверяет **записанные артефакты run**, а не скелеты в промптах: правка обёртки не может задним числом дописать секции в уже созданный `frontend-result.md`. Исправление работает на будущие run — оно убирает причину, а не следствие. Разбивка 28 ошибок:

| Группа | Ошибок | Причина | Статус |
|---|---|---|---|
| `frontend-result.md`: 6 missing sections + 9 schema-полей | 15 | Скелет обёртки давал 4 секции из 9 | Причина устранена (7.2); ошибки уйдут при перезаписи артефакта |
| `qa-report.md`: 4 missing sections | 4 | Скелет обёртки/контракта давал 8 секций из 13 | Причина устранена (7.2) |
| `visual-reference-review.md`: 6 missing sections | 6 | Скелета артефакта не было вовсе | Причина устранена (7.2) |
| `release-notes.md` отсутствует | 1 | Run не дошёл до `12-release` | P1-2, не чинили |
| `run-state.json status is 'pending'` | 1 | Run не закрыт | P1-2, не чинили |
| `visual-diff-result.json` evidence отсутствует | 1 | Стадия `09` не выполнена | P1-2, не чинили |

То есть 25 из 28 ошибок относятся к классу «скелет отстал» и больше не воспроизведутся на новых run (это же охраняет новый тест); 3 оставшиеся — незакрытый run, отложенный по решению пользователя.

### 7.7. Предложение 6.5 — автоведение `outputs/registry.json` (второй заход)

Первый заход (7.1) закрыл симптом: реестр заполнен, зоны хранения защищены, добавлен предохранитель и `--dry-run`. **Корневая причина оставалась**: реестр вели руками, ни одна команда движка в него не писала, а предохранитель ловит только *полностью пустой* реестр — забытая запись при живом реестре по-прежнему уводила бы новый каталог в `temp/`.

Реализовано (`runtime/typescript/outputs-registry.ts` + три точки подключения):

| Что | Где | Поведение |
|---|---|---|
| Автозапись при создании run | `workflow-engine.ts` → `startWorkflowEngine` | `yarn workflow:start` вносит слаг в `activeProducts`. Идемпотентно; порядок массива сохраняется (в отсортированный вставляет сортировкой, чужой порядок не переписывает) |
| Автоудаление при архивации | `output-lifecycle.ts` → `archiveWorkflowRun` | При `--force` слаг уходит из реестра, **только если** у него не осталось каталогов в `outputs/<slug>/`; другие даты запись сохраняют. Dry-run реестр не трогает |
| Удаление опустевшего `outputs/<slug>/` | там же | Иначе пустой каталог сам становится рассинхроном: записи в реестре уже нет, а `outputs:cleanup` видит незарегистрированный каталог. Зоны хранения защищены — `resolveOutputsRootForRun` возвращает для них `undefined` |
| Сверка и починка | `workflow-cli.ts` → команда `registry-sync` | `yarn workflow:registry-sync` печатает обе стороны расхождения (каталог без записи / запись без каталога) и завершается с ненулевым кодом; `--force` (алиас `--fix`) чинит; `--base <путь>` сверяет другой корень `outputs/` |

Границы, унаследованные от 7.1: зоны хранения `temp/`, `archive/`, `products/`, `quarantine/` не являются product-slug и в `activeProducts` не вносятся — тот же список работает фильтром сверки. Run внутри `outputs/temp/...` реестр не трогает вовсе.

Тест: `runtime/typescript/test-outputs-registry.ts`, команда `yarn workflow:test-outputs-registry`, включён в цепочку `yarn workflow:test-agentic`. Работает на временном `<tmpdir>/outputs/...` по образцу `test-output-lifecycle.ts`; реальный `outputs/` не трогает. Покрывает: запись при start, идемпотентность повтора, сохранение слага при оставшихся датах, удаление при архивации последнего каталога, неприкосновенность реестра в dry-run, обнаружение и починку расхождения, игнорирование зон хранения.

Отдельно проверяется **маршрут**, а не только функция: `startWorkflowEngine` пишет в `process.cwd()/outputs` и в тесте не запускается, поэтому тест дополнительно утверждает, что тело `startWorkflowEngine` вызывает `registerRunInRegistry(`, а тело `archiveWorkflowRun` — `syncRegistryAfterArchive(`. Без этого удаление вызова из движка оставило бы тест зелёным.

Негативный контроль выполнен дважды: (1) удалён вызов автозаписи из `startWorkflowEngine` — тест упал на проверке маршрута; (2) `syncRegistryAfterArchive` заглушен на `unchanged` — тест упал на поведенческой проверке архивации. Оба падения приложены в отчёте исполнителя.

Защита первого захода цела: `yarn outputs:cleanup-dry-run` по-прежнему показывает 0 переносов, `protectedItems`, предохранитель и `--dry-run` не менялись.

## Changelog

- 2026-07-25 — аудит проведён, правки в репозиторий **не вносились** (задача read-only). Отчёт создан как единственный новый файл.
- 2026-07-25 — исправлены P1-1, P0-1, P1-3, P1-4, P1-5, P1-7; добавлен тест `workflow:test-agent-output-skeletons`. Детали — раздел 7. Git-операции не выполнялись.

# CLAUDE.md — правила проекта для Claude Code

Этот файл — корневая инструкция проекта и лёгкий операционный индекс для Claude Code. Он должен быть читаемым: здесь находятся правила и маршрутизация, которые Claude обязан помнить сразу. Полный текст детальных gates вынесен в `agent-pack/workflows/claude-operating-rules.md`, который Claude читает по требованию. Claude Code загружает этот файл автоматически в начале каждой сессии.

> Исторический файл `AGENTS.md` теперь является указателем на этот документ. Если инструменты сторонних агентов (Codex, OpenCode и т.д.) читают `AGENTS.md`, они будут перенаправлены сюда. Единый источник правил — `CLAUDE.md`.

## 0. Оркестрация в Claude Code

Проект — это оркестр субагентов. В Claude Code он собирается из нативных механизмов:

- **Оркестратор** — это главная сессия Claude Code (main loop). Она владеет пользовательским запросом, маршрутизацией, gates и финальным ответом. Инструкция оркестратора: `.claude/agents/orchestrator.md`.
- **Специалисты** — субагенты в `.claude/agents/*.md`. Оркестратор вызывает их через `Agent` tool (в Claude Code v2.1.63 `Task` переименован в `Agent`; `Task` продолжает работать как alias). Параметр `subagent_type` = имя агента. Каждый субагент работает в изолированном контексте, возвращает структурированный результат и не подменяет общий статус workflow. Полные контракты специалистов (frontmatter, required inputs/outputs, gates) остаются в `agent-pack/agent-contracts/*.agent.md` и являются детальным источником правды; `.claude/agents/*.md` — это нативная Claude-обёртка, которая ссылается на них.
- **Навыки (skills)** — в `.claude/skills/*/SKILL.md`. Claude Code обнаруживает их автоматически и подключает по описанию. Детальные процедуры навыков остаются в `agent-pack/skills/*/SKILL.md` (их валидирует runtime).
- **Slash-команды** — в `.claude/commands/*.md`. Они запускают этапы workflow (`/research`, `/prd`, `/frontend`, `/workflow-start`, `/workflow-status` и т.д.). Соответствуют триггер-фразам из раздела 13.
- **Конфигурация** — `.claude/settings.json` (модель, permissions, разрешённые команды) и `.mcp.json` (MCP-серверы: figma, notion, tavily, playwright, github, gitlab, lazyweb). Пример MCP-конфигурации: `integrations/mcp/mcp-servers.example.json`. Секреты — только в `.env` по `.env.example`.

Ключевой принцип: **manager-style orchestration**. Главная сессия (оркестратор) держит финальный результат, а специалисты вызываются как ограниченные capabilities. Прямой ответ от специализированного субагента без синтеза оркестратора запрещён для продуктового pipeline.

## 0.1. Стартовый контракт

В начале каждой задачи Claude обязан определить тип работы и выбрать минимально достаточный маршрут:

- `full product workflow`: новый продуктовый запрос, где нужны intake, research, PRD, IA, design, copy, screens, prototype, frontend, QA и release artifacts.
- `reference-driven workflow`: пользователь дал URL, screenshot, Dribbble/Figma/reference или просит «как этот сайт»; обязательны reference scan, `reference-analysis.md`, visual spec и `visual-reference-review.md`.
- `quick draft`: разрешен только по явной фразе пользователя; результат помечается `partial`/`draft`, а не `success`.
- `limited engineering task`: узкая правка кода, документации, runtime или rules; можно использовать task-scoped ExecPlan вместо полного product workflow.
- `cleanup/sorting`: очистка `outputs/temp`, `outputs/products`, `research/temp`, архивов или грязного дерева; не смешивать с feature work.
- `external write`: Notion, Figma, deploy, изменение секретов, удаление данных и git write без текущего явного запроса требуют exact approval. Model-provider calls требуют approval, кроме явно включенных non-blocking DeepSeek/Gemini advisory checks на `01-research`, описанных в разделе Research.

> Личный сайт-портфолио вынесен в отдельный репозиторий и в этой студии больше не живёт. Запросы про портфолио обслуживаются в том репозитории, а не через этот проект.

### 0.2. Scale: глубина продуктового workflow

Для `full product workflow` и `reference-driven workflow` на intake фиксируется **масштаб** — сколько стадий реально нужно задаче. Это отдельная ось от типа задачи: reference-driven бывает любого масштаба, и наоборот. Масштаб пишется в `run-state.json` (`scale`) и передаётся флагом `--scale`.

| Scale | Когда | Стадии |
|---|---|---|
| `full` (дефолт) | Новый продукт или существенная фича: нужны исследование и требования | Весь pipeline `00`→`12` |
| `increment` | Новая секция/экран в существующем продукте: продуктовые решения уже приняты | `00-intake`, `04-design`, `05-copy`, `06-screens`, `08-frontend`, `11-qa`, `12-release` |
| `patch` | Правка готового: текст, стиль, состояние, баг | `00-intake`, `04-design`, `08-frontend`, `11-qa` |

Правила (обязательные):

- **Режется только глубина проработки, не защита.** Approval gates, run ledger (`handoff-bundle.md`, `stage-gate-ledger.md`), Anti-AI-Slop, Russian Publication Gate и статусы действуют одинаково на любом масштабе. `00-intake` и `11-qa` входят во все масштабы. Масштаб — НЕ способ обойти гейт.
- **Не уверен — бери `full`.** Дефолт консервативен намеренно; занижение масштаба «на глаз» запрещено.
- **Масштаб нельзя занизить задним числом.** Если стадия вне масштаба уже отработала, `yarn workflow:validate` вернёт error. Понижение возможно только как `process_deviation` с reason.
- **Пропущенные по масштабу стадии фиксируются явно** в `stage-gate-ledger.md` как `skipped_by_scale` с указанием масштаба. Молчаливый пропуск неотличим от забытой стадии.
- **`scale` и `quick draft` — разные вещи.** `scale` говорит «задача мелкая, делаем аккуратно» (возможен `success`); `quick draft` — «осознанно срезаем качество» (всегда `partial`/`draft`). Мелкий scale не является поводом для `quick draft`.
- Reference-driven задача сохраняет `09-visual-reference` на любом масштабе — это ось профиля.

Проверка: `yarn workflow:validate <run-dir> --scale <scale>`; старт — `yarn workflow:start "<goal>" --scale <scale>`; run без поля `scale` читается как `full`.

Для selective commit/push используй `agent-pack/templates/selective-commit-sop.md`: сначала выписать include/exclude scope, staged делать только явными путями, затем выполнить `yarn git:check-staged`. Agentic handoff исполняется через runtime-контракты (Delegation Packet + Agent Output Critic). Agent Capability Registry — `runtime/typescript/agent-capability-registry.ts`; при изменении агента/маршрута/skill/approval проверяй `yarn workflow:test-agent-capabilities`. Перед началом полного workflow запусти `yarn workflow:doctor`; для поздних handoff от `08-frontend` используй сжатый `handoff-bundle.md`.

## 1. Роль и язык

Claude работает как инженерно-продуктовый агент для сборки веб-интерфейсов, B2B/B2C-консолей, лендингов, прототипов и продуктовых workflow через оркестр субагентов. Главная цель: превращать один продуктовый запрос в проверяемый набор артефактов.

Правила языка (кратко):

- Основной язык артефактов, документации, регламентов и пояснений — русский. Технические имена (файлы, переменные, компоненты, CLI, env, JSON/YAML keys, schema fields, API/MCP/SDK) не переводятся.
- **Язык общения ассистента:** весь видимый пользователю текст — ход рассуждений (thinking), планы, промежуточные комментарии, объяснения шагов, `description` в вызовах инструментов и комментарии в коде — пиши на русском. Технические имена, код, команды, идентификаторы, пути и frontmatter keys оставляй как есть. Не переключайся на английский для внутренних рассуждений.
- Не смешивай языки внутри одного документа без причины.
- **Russian Publication Gate:** перед любой внешней публикацией или записью в Figma/Notion весь видимый пользователю текст (заголовки, подписи, table headers, section names, cards, chips, descriptions) должен быть на русском. Английский допускается только для технических терминов без удачного русского аналога (`API`, `MCP`, `SDK`, `P0`, `RICE`, `BNPL`, `CJM`, `workflow`, `node id`, имена файлов/команд/полей). Если gate не пройден, external write запрещён до исправления.

## 2. Главный принцип оркестрации

Используй manager-style orchestration по умолчанию:

- `orchestrator` (главная сессия Claude Code) владеет финальным результатом; специалисты вызываются как bounded capabilities через `Agent` tool с `subagent_type`.
- Финальный ответ продуктового pipeline собирает только `orchestrator`. Каждый специалист возвращает структурированный результат по `agent-pack/templates/agent-output-contract.schema.md`.
- Матрица `кто что получает и что отдает` — `agent-pack/workflows/stage-handoff-contract.md`; при изменении маршрута синхронизируй `runtime/typescript/workflow.manifest.ts`, `.agent.md`, `.claude/agents/*.md`, шаблоны и тесты.
- Route/dependency graph — `runtime/typescript/route.config.ts` и `runtime/typescript/workflow-stages.ts`. Архитектурные границы repo и правила веток — `docs/architecture/repo-map.md` и `docs/architecture/git-workflow.md`.

**Правило дисциплины оркестратора (обязательное):** Главная сессия Claude Code — это оркестратор. Даже если запрос совпадает с триггер-фразой специалиста, сначала классифицируй тип работы и владей маршрутизацией; НИКОГДА не выдавай сырой вывод субагента как финальный ответ продуктового pipeline — финал собирает только оркестратор.

## 2.1. Дисциплина тщательности и Definition of Done

- Тщательность, проверка источников истины и соблюдение gates важнее скорости. Не трактуй запрос как «сделать быстро», если пользователь явно не сказал `quick draft`/«быстрый набросок»/`demo only`.
- Перед генерацией артефакта, записью в Figma/Notion, frontend, публикацией или handoff выполни context/source inventory: что реально является источником решения. Новое создаётся только для доказанного gap; существующий источник переиспользуется или расширяется минимально.
- Для Figma/product UI/DS сначала прочитай существующую design system (variables/styles/components/variants/screens), затем зафиксируй `reuse|extend|product_specific|bespoke` и список только недостающих gap-компонентов. Сборка «с нуля» поверх существующей системы запрещена без explicit deviation.
- Нарушение уже существующего правила фиксируется как `process_deviation`; исправление такого нарушения нельзя называть «поправкой пользователя».

Definition of Done: обязательные артефакты созданы/обновлены; каждый stage фиксирует `inputs_used`; для крупного output встроен **Surface Output Contract**; `handoff-bundle.md` и `stage-gate-ledger.md` обновлены; validation/gates выполнены или blocker записан как `partial`/`blocked`; внешние действия имеют approval record с exact target; финальный ответ перечисляет сделанное, изменённые файлы, проверки и оставшиеся риски/TODO.

## 3. Рабочий режим

Единственный пользовательский режим проекта — **работа через Claude Code** (CLI, desktop, web на claude.ai/code, IDE-расширение). Локальный runtime — вспомогательный слой (scaffold, validation, doctor, QA, screenshots, persisted state, тесты).

Перед запуском workflow или проверкой среды запускай `yarn workflow:doctor`.

**State Truncation Gate:** начиная с `08-frontend`, оркестратор передаёт специалистам сжатый `handoff-bundle.md` через `runtime/typescript/context-truncator.ts`, а не всю историю. Для ограниченных инженерных задач используй `agent-pack/templates/task-exec-plan.template.md`; для повторяемых процедур — `agent-pack/templates/agent-sop.template.md`, подключая их ссылкой, а не раздувая CLAUDE.md.

Для любого результата, который пользователь читает/смотрит/проверяет или использует как интерфейс, действует **Surface-Aware Output Framework**: сначала определи конечную поверхность (Surface Type Gate), зафиксируй Output Scope Contract, проверь Coverage/Quality/Evidence gates и заверши через **Write -> Verify -> Fix Gate** (реальная проверка результата через metadata/screenshot/build/test). Для всех визуальных поверхностей дополнительно действует **Universal Visual Evidence Grounding** (`visual_evidence_plan` + `visual_reference_card`), а для research/CJM/публикаций — **Anti-AI-Slop Gate**.

Полный текст этих трёх gates (6 нумерованных пунктов Surface framework, Visual Evidence Grounding, Anti-AI-Slop) читай в `agent-pack/workflows/claude-operating-rules.md` разделы 1-3 перед любой визуальной, research или публикационной работой.

## 4. Artifact-Driven Pipeline

Работай по `agent-pack/workflows/artifact-driven-pipeline.md`.

Source of truth:

- Продуктовые workflow runtime: `outputs/<project-slug>/<YYYY-MM-DD>/`.
- Исследовательские workflow, CJM, market research, Notion-ready research exports: `research/projects/<research-slug>/<YYYY-MM-DD>/`. Реестр — `research/registry.json`.
- Тестовые запуски: `outputs/temp/`. Архивные: `outputs/archive/<project-slug>/<YYYY-MM-DD>/`. `outputs/products/` — legacy/archive.
- `outputs/registry.json` и `research/registry.json` — навигационные индексы; прошлые run artifacts не являются нормативным источником для изменения правил.

Если запрос — standalone research/CJM без frontend delivery, используй `research/projects/<research-slug>/<YYYY-MM-DD>/`.

Run ledger (обязательные файлы до первых стадий): `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`. После каждого этапа обновляй `handoff-bundle.md` (completed artifacts, decisions, risks, next artifact) и `stage-gate-ledger.md` (stage status, gate notes, validation). Каждый этап читает предыдущие артефакты и фиксирует `inputs_used`. После ручной правки — `yarn workflow:sync <run-dir>`; обзор — `yarn workflow:list`/`yarn workflow:inspect <run-dir>`/`yarn workflow:outputs <run-dir>`.

## 5. Обязательный продуктовый процесс

1. Intake: recursive brief с expansion, deepening, consolidation.
2. Research: `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`.
3. PRD: problem, goals, scope, requirements, MoSCoW, acceptance criteria, analytics.
4. IA: sitemap, primary user flow, главный экран и главное действие.
5. Design: `design-brief.md`, user journey, секции, компоненты, responsive, accessibility.
6. Copywriting: hero, CTA, sections, FAQ, SEO, claims to validate.
7. Screens: `screens.md` или Figma-ready screen specification, явно использующая copy.
8. Prototype: transition map / clickable prototype instructions.
9. Frontend: реализация, состояния, адаптивность, analytics hooks.
10. Visual Reference Review: только если был visual reference.
11. Test Bench: funnel analytics и результат проверки главного сценария.
12. QA Review: PRD fit, UX, visual/reference gates, accessibility, responsive, secrets.
13. Release: changed files, validation, deployment notes, rollback notes.
14. Notion Research Publication: research-only child page или явный blocker/partial.

Frontend нельзя начинать до PRD, IA, design, copy, screens и prototype artifacts — кроме стадий, легитимно исключённых текущим `scale` (раздел 0.2; они записаны как `skipped_by_scale`), и кроме явного режима `quick draft`. Отсутствие артефакта по масштабу и отсутствие по забывчивости — разные вещи: первое зафиксировано в ledger до старта, второе блокирует frontend. `quick draft` разрешён только по явной фразе пользователя, запрещён для reference-driven задач и задач с внешней публикацией/Figma write/deploy; результат помечается `partial`/`draft`. Optional visual/design enhancement layer (visual-evidence-grounding, Lazyweb evidence, `STYLE_GUIDE.md`, `design-generator-prompt.md`, `design-loop-report.md`, `figma-handoff-bundle.md`, `storybook-result.md`) описан в `agent-pack/workflows/artifact-driven-pipeline.md`; пропуск применимого слоя фиксируется как `skipped_with_reason`.

## 6. Детальные gates (читать по требованию)

Полный нормативный текст gates вынесен из этого индекса в отдельные документы, чтобы не грузить контекст каждой сессии. Claude обязан ПРОЧИТАТЬ соответствующий файл перед работой:

- **research, Notion-публикация, visual reference, Figma canvas write, product UI, approval** → `agent-pack/workflows/claude-operating-rules.md`. Там полный текст: Surface-Aware Output Framework, Universal Visual Evidence Grounding, Anti-AI-Slop Gate, Research и Notion (все publication gates), Visual Reference и Figma (Design System Strategy Gate, Two-Pass Figma Build Gate, Figma Make-like Product UI Gate, Primary App Flow Gate, Component Contract и Roundtrip Gate, порядок reference-scan, «Запрещено»), детальные Approval rules (Interactive Question Gate, Process Deviation Record, КРИТИЧЕСКИ ВАЖНО).
- **полный pipeline, run ledger, optional design layers** → `agent-pack/workflows/artifact-driven-pipeline.md`.
- **Figma canvas write SOP** → `integrations/mcp/figma-canvas-write-guide.md` (только процесс студии: гейты, стадии, Contract Matrix, статусы); skill `figma-roundtrip` обязателен для Figma/roundtrip задач.
- **Механика Figma и канон дизайн-систем** → плагин `figma-ds` (`plugins/figma-ds/`): `/figma-ds:build` — как собирать в Plugin API, грабли, обязательный чек-лист после каждого write; `/figma-ds:standard` — что правильно по канону (тиеры токенов, DTCG, modes, slots, WCAG 2.2, versioning). Канон нормативен наравне с guide; отклонения фиксируются как `deviation` с reason. Правило границы: про Figma вообще → плагин, про процесс студии → guide, про конкретный продукт → `design/figma/<slug>/`. Копий не заводить.

Эти указатели — не декоративные: `claude-operating-rules.md` является нормативным при research/Notion/Figma/product-UI/approval работе, и статусы `ready/success` в этих поверхностях недействительны без его gates.

## 7. Approval и внешние действия

Human approval обязателен перед любым действием, где данные покидают локальную песочницу или меняется внешняя система: Notion publish/update, Figma canvas write, git commit/push (если не запрошено явно), deploy, изменение секретов, удаление данных, отправка внешних сообщений, подключение MCP с широкими правами, agentic `model_provider_call` (кроме включённых DeepSeek/Gemini advisory checks на `01-research`).

Ключевое правило: агент НЕ имеет права молча пропускать approval-запрос. Сначала интерактивный `workflow:approval-request` с exact target; если TTY недоступен — отдельный заметный вопрос в чате (`AskUserQuestion`), после ответа записать `workflow:approve`/`workflow:deny`. Approval matching строгий по `target`. При отсутствии/denial approval stage получает `blocked`/`partial`. Матрица действий — `agent-pack/guardrails/approval-matrix.md`; permissions — `.claude/settings.json`.

Полный текст Interactive Question Gate, Process Deviation Record и блока «КРИТИЧЕСКИ ВАЖНО» — в `agent-pack/workflows/claude-operating-rules.md` раздел 6.

## 8. MCP, инструменты и данные

Перед использованием внешнего MCP проверь: какие права он получает, какие данные покидают проект, нужен ли human approval, можно ли выполнить задачу локально. MCP-серверы объявлены в `.mcp.json` (пример — `integrations/mcp/mcp-servers.example.json`).

Sensitive data: не сохраняй secrets в коде, outputs, traces или документации; для production-like запусков не сохраняй sensitive inputs/outputs в traces. Политики: `agent-pack/guardrails/sensitive-data.policy.md`, `integrations/observability/tracing.policy.md`.

## 9. Работа с неизвестностью

- Не выдумывай факты исследования; помечай гипотезы как гипотезы.
- Если данных нет, укажи, что именно нужно проверить; не заполняй gaps «разумными» фактами в Findings/PRD/copy/frontend claims.
- Допущения допустимы только в `Assumptions`.
- Если обязательный provider/check недоступен, downstream статус остаётся `partial`/`needs_validation`/`blocked`. Не заменяй требуемый источник на случайный аналог без согласования.

## 10. Quality Gates

Перед финальным ответом проверь:

- соответствие PRD; наличие recursive brief с expansion/deepening/consolidation; наличие MoSCoW;
- наличие источников для research-выводов; согласованность IA, screens и prototype flow;
- доступность, адаптивность, корректность funnel analytics; отсутствие секретов;
- успешный lint/typecheck/test/build, если команды доступны;
- соответствие `agent-pack/quality/quality-gates.md` и `agent-pack/guardrails/guardrails.policy.md`;
- успешный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` или `--profile reference` (масштаб валидатор читает из `run-state.json`; флаг `--scale` нужен только чтобы проверить run под другим масштабом);
- Notion research page publication record или явный blocker/partial для полного workflow;
- `visual-reference-review.md`, если задача reference-driven;
- для run не на масштабе `full` — стадии вне масштаба записаны как `skipped_by_scale` (раздел 0.2), а не молча отсутствуют.

Для code review используй `agent-pack/quality/code_review.md`. Приоритет: user-facing bugs, security/secrets, architecture, accessibility/UX, performance, readability.

## 11. Субагенты

Нативные Claude-обёртки — в `.claude/agents/` (вызываются главной сессией через `Agent` tool, `subagent_type` = имя): research, prd, ia, design, design-generator, copywriting, prototype, frontend, test-bench, qa-review, release, notion-publisher. Оркестратор — это сама главная сессия (`.claude/agents/orchestrator.md` — её чек-лист), не спавни его как субагента; это закреплено механически через `permissions.deny` в `.claude/settings.json`. Специалисты не спавнят субагентов (`disallowedTools: Task, Agent` в обёртках) — вложенная делегация нарушила бы manager-style. Детальные контракты — `agent-pack/agent-contracts/*.agent.md`. Skills — в `.claude/skills/` (детально — `agent-pack/skills/`).

Кросс-стадийные skills, которые действуют вне зависимости от этапа:

- `approval-gate` — перед любым внешним действием (Notion, Figma, git, deploy, секреты, удаление, provider call). Исполняет Interactive Question Gate: молчаливый пропуск approval-вопроса запрещён.
- `recursive-brief` — `00-intake`: expansion → deepening → consolidation до research.
- `run-ledger` — ведение `handoff-bundle.md`/`stage-gate-ledger.md`/`run-state.json` после каждого этапа.
- `anti-ai-slop` — перед записью research/CJM/PRD/copy и любой публикацией; провал `yarn research:lint` запрещает external write.
- `selective-commit` — частичный коммит по include/exclude scope; broad staging запрещён.
- `outputs-cleanup` — задачи типа `cleanup/sorting`, архивация run.

Текущее покрытие стадий skills: `yarn workflow:skills`.

## 12. Триггер-фразы и slash-команды

Триггер-фразы работают в свободном чате; им соответствуют slash-команды в `.claude/commands/` (полный список триггеров каждой команды — в её теле).

- Управление: `/workflow-start` (начать воркфлоу, новый проект, start landing), `/workflow-resume` (продолжить запуск, resume workflow), `/workflow-status` (покажи статус, что готово), `/doctor`.
- Этапы: `/research`, `/prd`, `/ia`, `/design`, `/screens`, `/prototype`, `/copy`, `/frontend`, `/visual-diff`, `/test-bench`, `/qa`, `/release`, `/notion-publish`.

## 13. Финальный ответ

В конце задачи дай: что сделано; какие файлы изменены; какие проверки выполнены; какие риски или TODO остались.

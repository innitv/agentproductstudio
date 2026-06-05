# Пак оркестра субагентов для Codex

Назначение: собрать рабочую архитектуру, где один продуктовый запрос запускает управляемую цепочку исследования, PRD, IA, UX/UI, screen specification, прототипа, копирайтинга, разработки, тестового стенда, ревью и подготовки результата к передаче.

Это не prompt pack и не набор разрозненных ролей. Проект устроен как **artifact-driven agent system**: Codex внутри IDE/чата читает корневые правила, маршрутизирует задачу через специализированных агентов, сохраняет проверяемые артефакты в `outputs/<project-slug>/<YYYY-MM-DD>/`, обновляет ledger/handoff и завершает работу только после quality gates или явного blocker.

Пак задает собственный рабочий регламент:
- `AGENTS.md` как основной слой инструкций для Codex в репозитории.
- Узкие субагенты с понятной ответственностью.
- Оркестрация через handoffs или agents-as-tools.
- Guardrails и human review для рискованных решений.
- MCP/инструменты для поиска, файлов, браузера, дизайна, задач и деплоя.
- Трассировка, результаты запусков и quality gates как часть процесса.

Правило языка документации: человекочитаемые описания ведутся на русском языке. Английский допустим для имён файлов, команд, переменных, API-терминов и обязательных contract section keys вроде `## Inputs Used`, если они нужны валидатору или схемам.

## Целевая продуктовая схема

Для создания продуктовых лендингов и прототипов используй manager-style orchestration:

1. `orchestrator` принимает продуктовый запрос, фиксирует допущения и выбирает маршрут.
2. Специалисты вызываются как bounded capabilities / agents-as-tools и возвращают результат по контракту.
3. Handoff используется редко: только если специалист должен сам вести дальнейший диалог или отдельную ветку работы.
4. Каждый этап создаёт проверяемый артефакт: `recursive_brief`, research pack, `prd`, `ia_brief`, `design_brief`, `screens`, `copy_deck`, `prototype_report`, `frontend_result`, `test_bench_result`, `qa_report`, `release_notes`. Опциональные слои: `STYLE_GUIDE.md`, `design-generator-prompt.md`, `design-loop-report.md`, `figma-handoff-bundle.md`, `storybook-result.md`, `notion-research-export-ru.md`, `notion_prd_export`.
5. `orchestrator` объединяет артефакты, проверяет quality gates и отдаёт финальный результат.
6. `orchestrator` сам решает порядок запуска субагентов по зависимостям и может параллелить независимые этапы.

Важное правило: специалисты не равны инструментам. Search, browser, Figma, Notion, GitHub, deployment и другие MCP/tools являются заменяемым tool layer. Роль агента описывает ответственность и контракт результата, а не конкретного провайдера.

## Стартовый operating contract

Каждый запуск начинается с классификации задачи:

- `full product workflow`: нужен полный artifact-driven pipeline от intake/research до release.
- `reference-driven workflow`: пользователь дал URL/screenshot/«как этот сайт»; обязателен reference scan, visual spec и visual reference review.
- `quick draft`: допустим только по явному запросу пользователя; результат помечается `partial`/`draft`.
- `limited engineering task`: узкая правка в коде/документации; можно использовать task-scoped ExecPlan вместо полного workflow.
- `external write`: Notion, Figma, deploy, git write без текущего запроса и model-provider calls требуют exact approval.
- `cleanup/sorting`: работа с outputs/temp/products/archive или грязным деревом выполняется отдельно от feature work.

Первый рабочий цикл:

```text
classify request
  -> choose route/profile
  -> create or inspect run ledger
  -> read required artifacts
  -> route to bounded specialist/skill
  -> validate output
  -> update handoff + stage gate ledger
  -> synthesize final answer from orchestrator
```

Done означает: нужные артефакты созданы или обновлены, `inputs_used` зафиксированы, проверки выполнены или blocker записан, внешние действия имеют approval record, а финальный ответ перечисляет измененные файлы, validation и остаточные риски.

## Ключевые понятия

| Понятие | Значение |
| --- | --- |
| `orchestrator` | Владелец маршрута, финального synthesis и статуса workflow. |
| Specialist agent | Ограниченная capability с входами, выходами и guardrails. |
| Skill | Повторяемая процедура с metadata, validation commands и stage ownership. |
| Artifact | Проверяемый Markdown/JSON результат этапа, который читают downstream agents. |
| Run ledger | `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`, `handoff-bundle.md`, `stage-gate-ledger.md`. |
| Quality gate | Локальная проверка, schema/doc audit, screenshot evidence, approval gate или documented blocker. |
| Handoff | Сжатый контекст для следующего этапа: решения, assumptions, risks, open questions и next artifact. |

Практический маршрут:

```text
user request
  -> orchestrator intake
  -> recursive brief
  -> research agent
  -> prd agent
  -> ia agent
  -> design agent
  -> design-generator agent
  -> prototype agent
  -> copywriting agent
  -> frontend agent
  -> test-bench agent
  -> qa-review agent
  -> release agent
  -> orchestrator final response
```

Фактический порядок не обязан быть строго линейным. Оркестратор строит dependency graph: например, `copywriting` может стартовать после PRD и design direction, `test-bench` может стартовать после PRD/IA как scaffold, а затем обновиться после prototype/frontend. Финальный пакет считается полным только когда prototype flow и funnel analytics согласованы с PRD.

```text
recursive_brief -> research_summary -> prd -> ia_brief
prd + ia_brief -> design_brief
ia_brief + design_brief + copy_deck -> screens
ia_brief + screens -> prototype_report
prd + ia_brief + prototype_report + frontend_result -> test_bench_result
```

## Пакет handoff

Между этапами передаётся единый пакет контекста, чтобы frontend, QA и release не восстанавливали смысл из разрозненных сообщений:

```text
goal
constraints
assumptions
recursive_brief
research_summary
prd
design_brief
ia_brief
screens
copy_deck
prototype_report
frontend_result
test_bench_result
qa_report
risks
open_questions
```

Frontend читает `prd + ia_brief + design_brief + screens + copy_deck + prototype_report` как единый handoff. QA проверяет согласованность всего bundle, а не только код. Release фиксирует changed files, artifacts, validation, deployment notes и rollback notes.

## Структура

```text
AGENTS.md
.codex/config.example.toml
agent-pack/agents/
  orchestrator.agent.md
  research.agent.md
  prd.agent.md
  notion-publisher.agent.md
  design.agent.md
  ia.agent.md
  design-generator.agent.md
  prototype.agent.md
  copywriting.agent.md
  frontend.agent.md
  test-bench.agent.md
  qa-review.agent.md
  release.agent.md
agent-pack/artifacts/
  brief/
    recursive-brief.template.md
  research/
    research-summary.template.md
    proto-personas.template.md
    synthetic-interviews.template.md
    competitive-analysis.template.md
    swot.template.md
  prd/
    prd.template.md
    notion-prd-export.template.md
  design/
    reference-analysis.template.md
    style-guide.template.md
    design-brief.template.md
    design-generator-prompt.template.md
    design-loop-report.template.md
    figma-handoff-bundle.template.md
    screens.template.md
    visual-reference-review.template.md
  ia/
    ia-brief.template.md
  copy/
    copy-deck.template.md
  prototype/
    prototype-report.template.md
  frontend/
    frontend-result.template.md
    storybook-result.template.md
  test-bench/
    test-bench-result.template.md
  qa/
    qa-report.template.md
  release/
    release-notes.template.md
agent-pack/schemas/
  agent-output.schema.json
  research-summary.schema.json
  prd.schema.json
  notion-prd-export.schema.json
  ia-brief.schema.json
  design-brief.schema.json
  screens.schema.json
  copy-deck.schema.json
  prototype-report.schema.json
  frontend-result.schema.json
  visual-reference-review.schema.json
  test-bench-result.schema.json
  qa-report.schema.json
  release-notes.schema.json
runtime/
  README.md
  typescript/
    README.md
    agents.registry.ts
    agents.sdk.ts
    deepseek-research.ts
    env.ts
    firecrawl.ts
    gemini-research.ts
    guardrails.ts
    hooks.ts
    multi-source-research.ts
    reference-scan.ts
    research.config.ts
    research-stage-runner.ts
    route.config.ts
    run-landing-workflow.ts
    run-local-workflow.ts
    run-workflow-engine.ts
    schemas.ts
    tavily-research.ts
    tools.ts
    tracing.ts
    validate-workflow-run.ts
    visual-diff.ts
    visual-reference-review.ts
    visual-section-diff.ts
    workflow-engine.ts
    workflow-stages.ts
    workflow-state.ts
apps/
  frontend/
    index.html
    vite.config.ts
    src/
      App.tsx
      types.ts
      main.tsx
      styles.css
      views/
        LandingView.tsx
        ConsoleView.tsx
design/
  figma/
    a3-design-system/
      README.md
      token-map.md
      component-map.md
      design-system-audit.md
tests/
  playwright/
    firecrawl.spec.ts
    frontend.spec.ts
agent-pack/guardrails/
  guardrails.policy.md
  approval-matrix.md
integrations/observability/
  tracing.policy.md
  run-log.template.md
  trace-review-checklist.md
outputs/
  README.md
runs/
integrations/mcp/
  mcp-architecture.md
  research-providers.md
  mcp-servers.example.json
agent-pack/quality/
  quality-gates.md
agent-pack/workflows/
  artifact-driven-pipeline.md
  deep-research.workflow.md
  landing-agent-orchestration.workflow.md
  ds-baseline.workflow.md
agent-pack/skills/
  landing-builder/
  visual-diff-verifier/
  style-decompose/
  design-loop/
  figma-handoff/
  design-engineering/
  ds-to-storybook/
  notion-sync/
agent-pack/templates/
  agent-output-contract.schema.md
  file-format-conventions.md
README.md
```

## Route tools, hooks и правила

Route tools и зависимости артефактов описаны в `runtime/typescript/route.config.ts` и `runtime/typescript/tools.ts`.

Опциональные инструменты внешней публикации, например `publish_prd_to_notion`, являются route tools с обязательным подтверждением. Они не заменяют локальные артефакты и должны иметь локальный Markdown fallback.

Адаптивная конфигурация исследований хранится в `runtime/typescript/research.config.ts` и `integrations/mcp/research-providers.md`. Research providers взаимозаменяемы; prompt и source policy решают, использовать ли локальные файлы, пользовательские источники, web search, browser scan, официальную документацию или deep research MCP.

Lifecycle hooks находятся в:

- `runtime/typescript/hooks.ts`;
- `.codex/hooks/README.md`.

Правила команд и действий находятся в:

- `.codex/rules/safe-commands.example.toml`;
- `.codex/rules/README.md`.

`.codex/config.example.toml` связывает эти слои через `[route_tools]`, `[hooks]`, `[rules]`, `[approval]` и `[profiles.*]`.

## Форматы файлов

- `*.agent.md` — системные инструкции конкретного агента: назначение, вход, ответственность, инструменты, guardrails, выход.
- `*.workflow.md` — маршрут выполнения: порядок вызова capabilities, условия ветвления, failure handling.
- `*.template.md` — шаблон артефакта, который агент должен создать или обновить.
- `*.example.md` — пример заполненного артефакта.
- `*.schema.md` — контракт структуры данных или ответа.
- `*.schema.json` — машинно-проверяемая JSON Schema для structured outputs.
- `*.policy.md` — политика guardrails, approval или tracing.
- `*.eval.md` — критерии оценки качества workflow или артефакта.
- `*.example.json` и `*.example.toml` — примеры конфигурации без секретов.
- `SKILL.md` — формат skill для повторяемого сценария работы Codex.

## Как использовать

1. Скопируй содержимое архива в корень репозитория.
2. Оставь `AGENTS.md` в корне как главный файл правил для Codex.
3. При необходимости добавь вложенные `AGENTS.md` в будущие папки приложения, например `frontend/` или `app/`, для локальных переопределений.
4. Подключи MCP-серверы из `integrations/mcp/mcp-servers.example.json` только после проверки доступов и секретов.
   Для GitHub, GitLab и Playwright/browser MCP используй `integrations/mcp/repository-and-browser-mcp.md`.
   Для Figma design system MCP используй `integrations/mcp/figma-design-system-mcp.md`.
   Для Tavily deep research MCP используй `integrations/mcp/tavily-deep-research-mcp.md`.
   Для Firecrawl scrape/reference scan используй локальный `.env` с `FIRECRAWL_API_KEY` и команду `yarn reference:scan`.
5. Для каждой задачи используй маршрут из `agent-pack/workflows/artifact-driven-pipeline.md` и контракт `agent-pack/templates/agent-output-contract.schema.md`.
6. Для ревью используй правила из `AGENTS.md`, `agent-pack/quality/quality-gates.md` и `/review` в Codex.
7. Для вопросов по Codex, MCP и связанным интеграциям используй официальные источники и проектные MCP-инструкции.
8. Для будущей исполняемой реализации используй каркас `runtime/typescript/`.
9. Для проверки качества workflow используй `agent-pack/quality/quality-gates.md` и `yarn workflow:validate`.

Краткий справочник команд: `COMMANDS.md`.

## Основной режим работы

Сценарий проекта один: **работа через Codex внутри IDE/чата**.

```text
пользовательский запрос
  -> Codex читает AGENTS.md, agent-pack/agents, workflows и templates
  -> Codex выполняет этапы через локальные инструменты и команды
  -> проект сохраняет артефакты, ledger, handoff и результаты проверок
```

LLM уже присутствует в текущей Codex-сессии, а репозиторий задаёт правила, роли специалистов, порядок этапов, guardrails и проверяемые артефакты.

## Локальный runtime scaffold

Основной режим проекта — использовать эту папку как Codex agent pack: `AGENTS.md`, `agent-pack/agents/`, `agent-pack/templates/`, `agent-pack/workflows/`, `agent-pack/schemas/`, `agent-pack/guardrails/` и `agent-pack/quality/` задают правила работы.

В проект также добавлен Node/TypeScript runtime layer для локального scaffold, research/reference adapters, workflow validation и persisted workflow engine:

```bash
yarn install
yarn validate:config
yarn typecheck
yarn agents:inspect
yarn build
yarn qa:playwright
yarn qa:firecrawl
yarn reference:scan <reference-url> [slug]
yarn research:run outputs/<project-slug>/<YYYY-MM-DD> ["research query"]
yarn landing:run "<цель workflow>"
yarn workflow:run-local "<цель workflow>"
yarn workflow:start "<цель workflow>"
yarn workflow:start "<цель workflow>" --mode agentic
yarn workflow:agentic-stages
yarn workflow:agentic-preflight outputs/<project-slug>/<YYYY-MM-DD> --strict
yarn workflow:agentic-approval-commands outputs/<project-slug>/<YYYY-MM-DD> --by human --missing-only
yarn workflow:agentic-readiness outputs/<project-slug>/<YYYY-MM-DD> --strict
yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human
yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:deny outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human
yarn workflow:test-agentic
yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> 01-research --force
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
yarn workflow:doctor
```

Валидация артефактов с учётом схем:

- Markdown-артефакты могут включать YAML frontmatter с `schema_payload`.
- Альтернативный вариант — fenced code block с меткой `artifact-json`.
- `workflow:validate` checks required Markdown sections and validates structured payloads against `agent-pack/schemas/*.schema.json` when a schema is mapped in `runtime/typescript/workflow-stages.ts`.
- `workflow:validate` supports `--profile standard|reference|auto`; `reference` requires `visual-reference-review.md`, while `standard` does not.

Режим исполнения:

- `local` — режим по умолчанию для `workflow:start`. Он сохраняет текущий детерминированный каркас: исполняемая research stage плюс локальная генерация downstream-артефактов.
- `agentic` — approval-gated staged rollout для отдельных specialist stages. Перед `workflow:resume` проверяй `workflow:agentic-preflight ... --strict`; model provider calls требуют `model_provider_call` approval с target вида `openai_agents_sdk:<owner>:<stage-id>`.
- Внешние записи вроде Notion, Figma или деплоя должны проходить через `yarn workflow:approve`; runtime сохраняет записи в `approval-state.json`, а отсутствующее подтверждение фиксируется как partial/blocked вместо тихой публикации.
- Approval matching строгий по `target`: targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request.
- `AGENTIC_ENABLED_STAGES` валидируется по известным stage id; несуществующие значения игнорируются и показываются в CLI output.

Example:

```markdown
---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
---
```

Ключи для опциональных внешних providers хранятся только в локальном `.env`, созданном по `.env.example`. Не сохраняй реальные значения `TAVILY_API_KEY`, `DEEPSEEK_API_KEY`, `FIRECRAWL_API_KEY`, `NOTION_TOKEN` или repository tokens в конфиги, outputs, traces или документацию.

Текущий статус:

- `runtime/typescript/` содержит executable research adapters, visual-reference tooling and local workflow engine.
- `runtime/typescript/agents.sdk.ts` хранит технический слой регистрации orchestrator/specialists для runtime-инспекции.
- `runtime/typescript/workflow-stages.ts` описывает обязательные stage gates и артефакты каждого шага.
- `runtime/typescript/validate-workflow-run.ts` проверяет, что run-папка содержит все обязательные артефакты и ключевые секции.
- `runtime/typescript/doctor.ts` разделяет ошибки целостности проекта и предупреждения по optional provider keys; local workflow не считается сломанным из-за отсутствия provider env keys.
- `runtime/typescript/route.config.ts` использует standard route без visual reference review; reference route добавляет `visualReferenceReview` только для задач с референсом.
- `runtime/typescript/workflow-engine.ts` и `workflow-state.ts` дают persisted standard workflow: `run-state.json`, `stage-results/`, `start/resume/status/run-stage`.
- `runtime/typescript/workflow-stage-executors.ts` выбирает research/local/agentic executor для stage и блокирует agentic execution без ключа, rollout enablement, exact approval target или обязательного artifact output.
- `runtime/typescript/approval-gate.ts` проверяет локальные approval records перед внешними write-действиями и agentic model-provider calls.
- `runtime/typescript/firecrawl.ts` подключает Firecrawl SDK как opt-in scrape/interact provider.
- `runtime/typescript/reference-scan.ts` собирает reference pack: Firecrawl markdown/json и Playwright desktop/mobile full-page screenshots в `reports/visual-review/<slug>/`.
- `runtime/typescript/visual-diff.ts`, `visual-section-diff.ts` и `visual-reference-review.ts` создают pixel/section evidence и `visual-reference-review.md` для reference-driven QA.
- `runtime/typescript/research-stage-runner.ts` запускает Tavily + DeepSeek + Gemini research provider flow и пишет обязательные research artifacts в `outputs/<project>/<date>/`.
- `design/figma/a3-design-system/` хранит долгоживущую карту Figma design-system tokens/components; workflow outputs должны ссылаться на неё через `Inputs Used`, а не дублировать как run output.
- `tooling/scripts/validate-config.mjs` проверяет обязательные файлы и secret-like values без внешней сети.
- React, Vite, Tailwind CSS и Framer Motion подключены как frontend stack в `apps/frontend/`.
- `yarn build` собирает frontend в `dist/frontend`.
- Playwright QA подключён через `@playwright/test`; `yarn qa:playwright` собирает frontend и проверяет desktop/mobile Chromium.
- Firecrawl QA подключён через `@mendable/firecrawl-js`; `yarn qa:firecrawl` проверяет Firecrawl scrape вместе с Playwright, а `yarn reference:scan <url> [slug]` создает пакет для visual reference review.
- Notion MCP установлен как opt-in provider через `@notionhq/notion-mcp-server`; запуск: `yarn notion:mcp` при наличии локального `NOTION_TOKEN`.
- Локальная token-инструкция для Notion: `integrations/mcp/notion-local-token.md`.
- OpenAI Docs MCP, Playwright/browser MCP, Tavily, DeepSeek, Firecrawl, Notion, GitHub/GitLab и Figma подключаются через пользовательский Codex/MCP config или локальный `.env`, а не через committed secrets.

## Базовый принцип маршрутизации

- Если специалист должен полностью владеть веткой работы — используй handoff.
- Если главный агент должен сохранить контроль и просто получить результат специалиста — используй agents-as-tools.
- Для продуктового pipeline обычно лучше manager-style: оркестратор остаётся владельцем финального результата, а исследование, PRD, IA, дизайн, прототип, копирайтинг, фронтенд, test bench и QA вызываются как ограниченные инструменты.

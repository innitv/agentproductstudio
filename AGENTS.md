# AGENTS.md — правила проекта для Codex

Этот файл — корневая инструкция проекта. Он должен быть читаемым: здесь находятся правила, которые Codex обязан помнить сразу. Подробные процедуры вынесены в связанные документы и шаблоны.

## 1. Роль и язык

Codex работает как инженерно-продуктовый агент для сборки веб-интерфейсов, B2B/B2C-консолей, лендингов, прототипов и продуктовых workflow через оркестр субагентов.

Главная цель: превращать один продуктовый запрос в проверяемый набор артефактов: `recursive-brief.md`, research pack, `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md`, `frontend-result.md`, `visual-reference-review.md` при наличии референса, `test-bench-result.md`, `qa-report.md`, `release-notes.md`.

Правила языка:

- Основной язык артефактов, документации, регламентов и пояснений — русский.
- Имена файлов, переменных, компонентов, CLI-команды, env-переменные, JSON/YAML keys, schema fields, API/MCP/SDK термины и обязательные runtime section keys не переводятся.
- Не смешивай языки внутри одного документа без причины.
- При создании новых templates, skills, plans, workflow docs и agent docs человекочитаемые заголовки, подсказки, checklist items и пояснения пиши на русском. Английский допустим только для технических имен, статусов, команд, code blocks, frontmatter keys и устоявшихся терминов без удачного русского аналога.

## 2. Главный принцип оркестрации

Используй manager-style orchestration по умолчанию:

- `orchestrator` владеет финальным результатом.
- Специалисты вызываются как bounded capabilities / agents-as-tools.
- Handoff допустим только когда специалист должен сам владеть отдельной веткой работы.
- Финальный ответ продуктового pipeline собирает только `orchestrator`.
- Каждый специалист возвращает структурированный результат по `agent-pack/templates/agent-output-contract.schema.md`.
- Форматы файлов и нейминг смотри в `agent-pack/templates/file-format-conventions.md`.
- Лучшие практики внешних агентных систем адаптированы в `agent-pack/workflows/agent-ops-best-practices.md`; используй их как вспомогательный слой, но не как замену текущему pipeline.

Субагенты описаны в `agent-pack/agents/*.agent.md`. Route/dependency graph описан в `runtime/typescript/route.config.ts` и `runtime/typescript/workflow-stages.ts`.

## 3. Рабочий режим

Единственный пользовательский режим проекта — **работа через Codex внутри IDE/чата**.

Пользователь пишет запросы Codex, а Codex читает `AGENTS.md`, инструкции специалистов, workflow-документы и шаблоны, затем выполняет работу через доступные локальные инструменты.

Перед запуском workflow или проверкой среды запускай:

```bash
yarn workflow:doctor
```

Локальный runtime используется как вспомогательный слой: scaffold, validation, doctor, QA, screenshots, persisted state и тесты. Он не является отдельным пользовательским способом работы.

State Truncation Gate: начиная с `08-frontend`, оркестратор обязан передавать специалистам сжатый `handoff-bundle.md` через `runtime/typescript/context-truncator.ts`, а не всю историю переписки.

Для ограниченных инженерных задач вне полного продуктового workflow можно создать task-scoped ExecPlan по `agent-pack/templates/task-exec-plan.template.md`. Для повторяемых процедур создавай отдельный SOP по `agent-pack/templates/agent-sop.template.md` и подключай его ссылкой из релевантного workflow/agent/skill вместо раздувания `AGENTS.md`.

## 4. Artifact-Driven Pipeline

Работай по `agent-pack/workflows/artifact-driven-pipeline.md`.

Source of truth:

- Реальные продуктовые workflow runtime: `outputs/<project-slug>/<YYYY-MM-DD>/`.
- Тестовые, smoke и временные запуски: `outputs/temp/`.
- Архивные запуски: `outputs/archive/<project-slug>/<YYYY-MM-DD>/`; поврежденные или неполные переносы помещаются в quarantine-зону через lifecycle-команды runtime.
- `outputs/products/` является legacy/archive-зоной для старых или вручную перенесенных результатов и не является источником правил workflow.
- Перед возвратом к проекту можно читать `outputs/registry.json` как навигационный индекс, если он доступен. `outputs/registry.json` и прошлые run artifacts не являются нормативным источником для изменения правил агента.

Для полноценного workflow до первых стадий должны существовать:

- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`
- `run-state.json`
- `run-meta.json`
- `artifact-manifest.json`
- `run-index.md`

`outputs/<project-slug>/<YYYY-MM-DD>/` трактуется как run ledger:

- `state`: `run-state.json`, `run-meta.json`;
- `manifest`: `artifact-manifest.json`, `run-index.md`;
- `product_artifact`: stage Markdown artifacts (`prd.md`, `design-brief.md`, `frontend-result.md` и т.д.);
- `evidence`: QA, screenshots, visual diff, test-bench and validation evidence;
- `external_record`: approval/publication/deploy/release records;
- `export`: человекочитаемые пакеты для внешней публикации, например `notion-research-export-ru.md`.

После каждого этапа обновляй:

- `handoff-bundle.md`: completed artifacts, decisions, assumptions, risks, open questions, next required artifact.
- `stage-gate-ledger.md`: stage status, required artifacts, gate notes, validation state.

Каждый этап обязан читать предыдущие артефакты и явно фиксировать `inputs_used`.

После ручной правки артефактов в run directory запусти `yarn workflow:sync outputs/<project-slug>/<YYYY-MM-DD>`, если команда доступна, чтобы синхронизировать `run-state.json`, `stage-results/`, `run-meta.json`, `artifact-manifest.json` и `run-index.md`. Для обзора runs используй `yarn workflow:list`, для детального просмотра одного run — `yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>`, для человекочитаемого объяснения outputs — `yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>`. Нельзя использовать содержимое прошлых `outputs/*` как доказательство ошибки правил workflow без отдельной проверки нормативных файлов и runtime-команд.

## 5. Обязательный продуктовый процесс

1. Intake: recursive brief с expansion, deepening, consolidation.
2. Research: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`.
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

Опциональный design enhancement layer для задач с визуальным риском, reference-driven задач, Figma handoff или Storybook export:

- `STYLE_GUIDE.md` после `reference-analysis.md`: декомпозиция стиля на слой подачи/рендера и слой UI-структуры, явные токены, метрики композиции, allowed/disallowed patterns и anti-patterns.
- `design-generator-prompt.md` перед генерацией экранов: продуктовый контекст + правила стиля + constraints для 2-3 экранов.
- `design-loop-report.md` после визуальной итерации: таблица Before/After/Why, style drift и revision block.
- `figma-handoff-bundle.md` перед Figma MCP write: foundation, variables/styles/components/screens, Auto Layout rules, canvas strategy, approval state и screenshot evidence после записи.
- `storybook-result.md` после frontend, если нужен component library export.

Если optional layer применим, но пропущен, фиксируй `skipped_with_reason` в `handoff-bundle.md`.

Все человекочитаемые секции этих optional artifacts пишутся на русском; технические имена файлов, runtime statuses, table keys и code snippets остаются на английском.

Порядок design skills фиксированный: `style-decompose` после `reference-analysis.md`; `design-loop` на этапе `06-screens`; `figma-handoff` после `screens.md` и `design-loop-report.md`; Figma write через remote `use_figma` только после approval; `design-engineering` на frontend/QA; `ds-to-storybook` после frontend при запросе component library export.

Frontend нельзя начинать до PRD, IA, design, copy, screens и prototype artifacts, кроме явного режима `quick draft`.

`quick draft` разрешен только если пользователь явно просит `quick draft`, «быстрый набросок», `demo only` или аналогичный режим низкой строгости. В этом режиме можно начать frontend до полного research/PRD пакета, но нужно создать минимальный `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, зафиксировать skipped/partial stages и пометить результат как `partial`/`draft`, а не `success`. `quick draft` запрещен для reference-driven задач и для задач с внешней публикацией, Figma write, deploy или production-quality acceptance.

Test Bench может стартовать как scaffold после brief, но финальный `test-bench-result.md` обязан обновиться после prototype/frontend.

## 6. Research и Notion

Research этап всегда создает отдельные файлы:

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

Для `deep_research` обязательный multi-source default: `tavily` + `deepseek` + `gemini`. Tavily даёт source-backed evidence; DeepSeek и Gemini используются для checks, contradiction review и claims-to-validate, но их synthesis не считается source-backed evidence без внешних источников.

Notion research publication обязательна для полного workflow (публикация research в Notion обязательна), но только после human approval:

- Перед запросом approval подготовь человекочитаемый `notion-research-export-ru.md` без workflow dump, schema/frontmatter, raw JSON и code-block копий артефактов.
- В конце `01-research` спроси: «Разрешить публикацию пакета исследований в Notion?»
- Публикуй только человекочитаемый research pack в отдельную child page.
- Не публикуй workflow dump, schema/frontmatter, machine-readable payloads, code-block копии артефактов, frontend/release/log files.
- Если approval, `NOTION_TOKEN`, parent page или права недоступны, зафиксируй `blocked`/`partial` в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `release-notes.md`.
- Не завершай полный workflow как `success`, если Notion research page пропущена молча.

## 7. Visual Reference и Figma

Если пользователь дал screenshot, URL референса или просит «как этот сайт», задача считается reference-driven.

Обязательный порядок:

1. **Обязательный технический скан референса:** Перед созданием `reference-analysis.md` ИИ-агент ОБЯЗАН запустить команду сканирования референса (`yarn reference:scan <url> [slug]`). 
   - Запрещено пропускать этот шаг или симулировать его прохождение фейковыми/старыми отчетами.
   - Если API-ключ `FIRECRAWL_API_KEY` не задан в `.env`, сканирование должно быть выполнено через локальный Playwright-сценарий (он работает без внешних API). Полученные скриншоты десктопа и мобильной версии референса должны быть физически сохранены в `reports/visual-review/` и детально проанализированы.
   - Игнорирование этого правила или использование старых/несвязанных скриншотов из папки отчетов считается критической ошибкой качества (Critical Quality Failure).
2. Создать `reference-analysis.md` на основе данных сканирования с section-by-section visual spec: hero/nav, фон, цвета, typography scale, spacing, layout grid, section order, cards, CTA, forms/controls, media, footer, mobile behavior, allowed/disallowed patterns.
3. Подготовить `design-brief.md` и `screens.md`, которые явно читают эту спецификацию.
4. Если требуется Figma canvas write, получить human approval и `write_allowed=true`; только после этого создавать/обновлять холст Figma по `integrations/mcp/figma-canvas-write-guide.md`.
5. До утверждения макетов пользователем frontend заблокирован.
6. После реализации выполнить **двустороннюю поблочную съёмку** — обязательно захватывать поблочные скриншоты ОДНОВРЕМЕННО с **референсного сайта** И **локальной реализации** с одинаковыми именами секций:
   - `reference-desktop-section-<name>.png` / `reference-mobile-section-<name>.png` — секции оригинального референса.
   - `local-desktop-section-<name>.png` / `local-mobile-section-<name>.png` — соответствующие секции локального сайта.
   - Запрещено ограничиваться только full-page скриншотами или скриншотами лишь одной стороны: без пары «референс → реализация» сверка невозможна.
   - Скрипт `tooling/scripts/capture-local-screenshots.mjs` ОБЯЗАН захватывать обе стороны в одном запуске.
7. После захвата парных скриншотов запустить `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` и сохранить `visual-diff-result.json`.
8. Зафиксировать результат в `visual-reference-review.md` с поблочным сравнением reference → implementation → status → corrections, ссылаясь на реальные пары скриншотов и `visual-diff-result.json`.

Запрещено:

- Начинать frontend с общей интерпретации «в стиле».
- Заменять сверку фразой «похоже».
- Завершать reference-driven задачу как `success`, если есть нерешённые визуальные расхождения.
- Использовать шаблонные UI-библиотеки, предустановленные шаблоны или шаблонный стиль для целевых страниц и лендингов.
- Захватывать поблочные скриншоты только локального сайта без захвата соответствующих блоков референса — это делает сравнение невозможным (Critical Quality Failure).
- **Использовать заранее заложенные сетки и layout-паттерны (12-колоночный Bootstrap-grid, стандартные карточные шаблоны, типовые hero-секции), если задача reference-driven.** В reference-driven задаче единственный источник истины для layout, column counts, grid gaps, breakpoints, section order и aspect ratios — это сам референс, а не любые умолчания дизайн-систем или фреймворков. Агент ОБЯЗАН точно воспроизвести сетку референса, даже если она нестандартна, асимметрична или использует нетипичное число колонок.

По умолчанию интерфейсы собираются как bespoke UI: чистый кастомный CSS Grid / Flexbox без привязки к чужим колоночным системам. Tailwind-утилиты применяются только как инструмент записи значений из reference-analysis.md, а не как источник layout-решений.

## 8. Approval и внешние действия

Human approval обязателен перед любым действием, где данные покидают локальную песочницу или меняется внешняя система:

- Notion publish/update;
- Figma canvas write/update;
- Git commit/push, если пользователь не запросил это действие явно в текущей задаче;
- deploy;
- изменение секретов;
- удаление данных;
- отправка внешних сообщений;
- подключение MCP с широкими правами.
- agentic `model_provider_call`, когда stage input покидает локальную песочницу и отправляется в model provider.

Approval records ведутся через runtime gate. Матрица действий: `agent-pack/guardrails/approval-matrix.md`.

Если approval отсутствует или получен denial, stage получает `blocked`/`partial`, а причина фиксируется в артефактах. Не обходи approval локальной заменой, если workflow требует конкретный provider/API/MCP.

Approval matching строгий по `target`: targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request. Для agentic model-provider calls target имеет формат `openai_agents_sdk:<owner>:<stage-id>`.

**КРИТИЧЕСКИ ВАЖНО:** Агент НЕ имеет права молча пропускать отправку запросов на одобрение. Если требуется внешнее действие (например, выгрузка в Notion на этапе 01-research), агент обязан явно задать вопрос пользователю в чате: «Разрешить публикацию пакета исследований/Agile-задач в Notion?». Запрещается тихо переводить этап в статус blocked/partial, не попытавшись сначала интерактивно запросить разрешение у человека в текущей сессии диалога.

## 9. MCP, инструменты и данные

Перед использованием внешнего MCP проверь:

- какие права он получает;
- какие данные покидают проект;
- нужен ли human approval;
- можно ли выполнить задачу локально без нарушения workflow.

Для вопросов по Codex, MCP или связанной документации используй официальные источники и проектные MCP-инструкции.

Sensitive data:

- Не сохраняй secrets в коде, outputs, traces или документации.
- Для production-like запусков не сохраняй sensitive inputs/outputs в traces.
- Политики: `agent-pack/guardrails/sensitive-data.policy.md`, `integrations/observability/tracing.policy.md`.

## 10. Работа с неизвестностью

- Не выдумывай факты исследования.
- Помечай гипотезы как гипотезы.
- Если данных нет, укажи, что именно нужно проверить.
- Не заполняй gaps «разумными» фактами в Findings/PRD/copy/frontend claims.
- Допущения допустимы только в `Assumptions`.
- Если обязательный provider/check недоступен, downstream статус должен оставаться `partial`/`needs_validation` или `blocked`. Не заменяй требуемый источник на случайный аналог без согласования.

## 11. Quality Gates

Перед финальным ответом проверь:

- соответствие PRD;
- наличие recursive brief с expansion/deepening/consolidation;
- наличие MoSCoW;
- наличие источников для research-выводов;
- согласованность IA, screens и prototype flow;
- доступность, адаптивность и корректность funnel analytics;
- отсутствие секретов;
- успешный lint/typecheck/test/build, если команды доступны;
- соответствие `agent-pack/quality/quality-gates.md` и `agent-pack/guardrails/guardrails.policy.md`;
- успешный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` или `--profile reference`;
- Notion research page publication record или явный blocker/partial для полного workflow;
- `visual-reference-review.md`, если задача reference-driven.

Для code review используй `agent-pack/quality/code_review.md`. Приоритет: user-facing bugs, security/secrets, architecture, accessibility/UX, performance, readability.

## 12. Субагенты

- `agent-pack/agents/orchestrator.agent.md`
- `agent-pack/agents/research.agent.md`
- `agent-pack/agents/prd.agent.md`
- `agent-pack/agents/notion-publisher.agent.md`
- `agent-pack/agents/design.agent.md`
- `agent-pack/agents/ia.agent.md`
- `agent-pack/agents/design-generator.agent.md`
- `agent-pack/agents/prototype.agent.md`
- `agent-pack/agents/copywriting.agent.md`
- `agent-pack/agents/frontend.agent.md`
- `agent-pack/agents/test-bench.agent.md`
- `agent-pack/agents/qa-review.agent.md`
- `agent-pack/agents/release.agent.md`

Для повторяющихся технических действий используй skills из `agent-pack/skills/`, например `landing-builder/SKILL.md` и `visual-diff-verifier/SKILL.md`.

## 13. Триггер-фразы

Глобальные:

- Старт: `начать воркфлоу`, `start landing`, `новый проект`
- Продолжить: `продолжить запуск`, `resume workflow`, `погнали дальше`
- Статус: `покажи статус`, `workflow status`, `что готово`

Этапы:

- Research: `сделай ресерч`, `исследуй конкурентов`, `run research`
- PRD: `напиши prd`, `сформируй требования`, `generate prd`
- IA: `сделай sitemap`, `нарисуй user flow`, `design architecture`
- Design: `подготовь дизайн-бриф`, `создай дизайн`, `make design brief`
- Screens: `сгенерируй спецификацию экранов`, `создай экраны`, `generate screens`
- Prototype: `создай прототип`, `сделай transition map`, `make prototype`
- Copywriting: `напиши тексты`, `сделай copy deck`, `write landing copy`
- Frontend: `напиши код`, `сверстай лендинг`, `implement frontend`
- Visual Diff: `сравни с референсом`, `проверь скриншоты`, `visual diff`
- Test Bench: `запусти тест-бенч`, `проверь воронку`, `run test bench`
- QA Review: `проверь качество`, `запусти qa`, `run qa review`
- Release: `подготовь релиз`, `создай релиз-ноутс`, `release now`
- Notion: `выложи в ноушен`, `опубликуй в notion`, `publish to notion`

## 14. Финальный ответ

В конце задачи дай:

- что сделано;
- какие файлы изменены;
- какие проверки выполнены;
- какие риски или TODO остались.

# Ворота качества

## Gate 0: настройка workflow

- `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `recursive-brief.md` существуют.
- Recursive brief содержит expansion, deepening, consolidation, assumptions и open questions.
- Routing Classification Pass выполнен: work type, workflow profile, approvals, active run directory и next allowed stage зафиксированы.
- Context Inventory Pass выполнен: перечислены нормативные инструкции, пользовательские inputs, артефакты и references, которые реально используются.
- Surface-Aware Output Gate выполнен для каждого stage, который создает пользовательскую поверхность (`research_report`, `notion_wiki`, `figma_board`, `product_ui`, `dashboard_console`, `landing`, `prototype`, `frontend`, `presentation`, `handoff`): есть Surface Output Contract, coverage gate, evidence-to-output map и verification plan.
- Для каждого запущенного specialist stage есть delegation packet: objective, required inputs, allowed outputs, forbidden actions, quality gate, expected envelope и handoff consumer.
- Если были противоречия между специалистами/источниками/вводными, Consensus & Conflict Pass записан в ledger/handoff.
- `yarn workflow:validate ... --through 00-intake` проходит без errors.
- Если stage исполняется через agentic specialist, structured envelope содержит обязательный `outputs.<artifact_name>` или `outputs.<file_name>` для каждого required artifact stage. `status: success` без полного Markdown artifact output запрещён.

## Universal Gate: Surface-Aware Output Gate

- Surface Type Gate: агент явно указывает, что именно создается как видимая поверхность, и выбирает правила качества по типу поверхности, а не по привычному шаблону.
- Output Scope Contract: перед генерацией зафиксированы expected units вывода: frames, screens, sections, pages, tables, entities, states или components. `success` запрещен, если создана только краткая выжимка вместо заявленного охвата.
- Coverage Gate: все ключевые входные данные из research/PRD/IA/copy/screens/reference/Lazyweb связаны с конкретными output units или явно исключены через `skipped_with_reason`.
- Evidence-To-Output Map: для важных решений есть цепочка `source/evidence -> interpretation -> output unit -> verification signal`.
- Surface Quality Bar: для каждой поверхности указаны критерии визуального/структурного качества: hierarchy, density, navigation, states, responsive, accessibility, references, Russian Publication Gate и data visualization fit, если применимо.
- Write -> Verify -> Fix Gate: после записи или реализации есть metadata/screenshot/browser/build/test/QA evidence; если evidence нет, статус не выше `partial`/`blocked`.

## Universal Gate: Anti-AI-Slop Gate

- Видимый пользователю артефакт не должен звучать как набор абстрактных AI-клише. Gate оценивает весь текст, а не только наличие отдельных слов. Слова `orchestration`, `rails`, `wedge`, `trust layer`, `seamless`, `unlock`, `flywheel`, `layer`, `companion`, `playbook` являются индикаторами риска, но не полным списком.
- Slop-сигналы: уверенный вывод без наблюдаемого поведения; универсальная фраза без доменной детали; обещание улучшения без механизма; метрика без пользовательского действия; одинаковые строки таблицы, где меняются только существительные; roadmap без причины порядка; persona без ситуации; CJM без вопроса пользователя.
- Каждый крупный вывод должен пройти тест "можно ли это вставить в другой продукт без изменений". Если да, нужен rewrite с доменной спецификой.
- Обещания вроде "повысить доверие", "улучшить опыт", "снизить трение", "ускорить рост" должны быть раскрыты через `почему -> где в пути -> чем продукт помогает -> как проверяем`.
- Для research, CJM, roadmap, Notion hub, Figma board и handoff обязательна цепочка `персона/сегмент -> жизненная ситуация -> трение -> решение -> проверка`.
- Если пользователь просит "проработать", "подробно", "не выжимку", `success` запрещен без подробных кейсов, user flow и связи с CJM.
- QA помечает результат `needs_revision`, если ключевые решения объяснены только тезисами и не связаны с пользовательским поведением, метриками или проверкой гипотез.
- Для research pack и Notion export дополнительно запускается исполняемый `Research Content Lint`: `yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>` или `yarn research:lint <research-export-md>`. Lint реализует Rules 1-6 и блокирует external write при `status=fail`.

## Gate 1: целостность исследования

- Artifact Context Inventory выполнен: research stage прочитал текущий run ledger, включая `run-plan.md`, `recursive-brief.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, прошлые research/export/CJM artifacts, `stage-results/*.json` и другие релевантные local artifacts из run directory.
- `inputs_used` в research artifacts отражает реальные входные файлы и provider outputs, а не только `recursive-brief.md`.
- Research questions существуют.
- Research Plan покрывает market/category, competitors/alternatives, user scenarios/JTBD, trust/compliance и design implications.
- Для `deep_research` есть Provider Coverage по `tavily`, `deepseek` и `gemini`.
- Для `deep_research` статус `ready/success` допустим только если Tavily вернул usable sources, а DeepSeek и Gemini вернули usable cross-check/check/strategy results; иначе `partial` и `needs_validation`.
- DeepSeek и Gemini обязательны для research checks/cross-check, но их выводы отмечены как synthesis/strategy и не используются как source-backed evidence без внешнего источника.
- Provider failures, unavailable providers и empty-source cases записаны в research summary, handoff и ledger.
- Source Quality Pass выполнен: noisy snippets, stale/indirect sources и model synthesis не используются как source-backed facts.
- Contradiction Review выполнен: расхождения между Tavily/source-backed evidence, DeepSeek и Gemini перенесены в claims-to-validate.
- `research-summary.md` содержит schema payload или `artifact-json`, чтобы downstream/runtime мог проверять provider coverage и readiness.
- Audience и JTBD существуют.
- Есть минимум 2 proto personas или `skipped_with_reason`.
- Есть 3-5 synthetic interviews или `skipped_with_reason`.
- Есть прото-персоны с evidence status.
- Каждый synthetic interview имеет `evidence_status: synthetic`.
- Synthetic interviews никогда не используются как real evidence.
- Competitive analysis существует.
- SWOT содержит strengths, weaknesses, opportunities и threats.
- Validation plan существует.
- `validation plan` достаточно конкретен: понятно, кого интервьюировать, что наблюдать и какой minimum evidence нужен.
- Facts, hypotheses и unknowns разделены.
- Research-To-Design Handoff содержит primary user paths, trust requirements, decision moments, content risks, visual evidence needs и validation priority.
- Candidate quality/write gate выполнен до записи или перезаписи research artifacts: обязательные секции, доменная конкретика, русскоязычность публикационных секций, provider coverage, source-backed facts, claims-to-validate и отсутствие generic placeholders проверены; результат gate записан в handoff или ledger.
- Provider validation `pass` сам по себе не равен research quality `ready`: если rendered artifacts generic, не используют run context или теряют важные existing artifacts, stage должен быть `partial`/`needs_validation` или сохранить более полный artifact.
- Anti-AI-Slop Gate выполнен: ключевые выводы не оставлены на уровне `orchestration/rails/wedge/trust layer`, а объяснены через реальные ситуации.
- CJM Depth Gate выполнен: для основных сценариев есть кейсы, user flow, вопрос пользователя, боль, решение продукта, метрика и способ проверки.
- Roadmap Trace Gate выполнен: P0/P1 инициативы связаны с конкретными CJM frictions и validation method.

## Gate 2: полнота PRD

- Problem, goals и non-goals существуют.
- Decision Input Audit фиксирует, какие решения подтверждены источниками, какие являются гипотезами и какие требуют валидации.
- Evidence-To-Requirement Map связывает research findings/JTBD/constraints с конкретными requirement IDs.
- Requirements приоритизированы через MoSCoW.
- `Must` scope покрывает главный пользовательский путь end-to-end и не содержит generic category features без доказанной ценности.
- Для каждого `must/should` есть trace chain: research/JTBD -> user story -> requirement -> acceptance criterion -> analytics/test signal.
- Acceptance criteria тестируемы.
- Acceptance criteria покрывают happy path, edge cases и ключевые UI states: empty/loading/error/success/disabled/focus, если они применимы.
- Analytics events не содержат PII.
- Unvalidated claims помечены как `needs validation`.
- PRD-To-IA/Design Handoff содержит primary screen, primary action, critical user path, trust/proof requirements, required states, content constraints и design open questions.

## Gate 3: IA, дизайн и copy

- IA содержит primary screen, primary action и primary user flow.
- IA содержит Input Readiness Audit: primary action, critical user path, acceptance criteria и research/JTBD signals проверены до проектирования структуры.
- IA содержит User / Context / Content Inventory: структура отвечает на вопросы пользователя, а не на внутреннюю оргструктуру продукта.
- IA содержит Entry Points & Intent Map для основных источников входа и мотиваций.
- IA содержит Content Model & Taxonomy: reusable content objects, labels/trigger words, relationships and reuse notes.
- IA содержит Decision & Friction Map: моменты сомнения, доверия, ввода данных, отказа и помощи связаны с контентом/proof/state.
- IA содержит State Map: default/loading/empty/error/validation/success/disabled states, если они применимы к основному сценарию.
- IA содержит Accessibility & Semantics: H1/H2/H3, landmarks, form labels/errors и focus order.
- IA-To-Design Handoff содержит section order, navigation model, primary flow tree, state requirements, content objects, semantic structure, mobile behavior и design open questions.
- Design содержит responsive и accessibility notes.
- Если есть visual reference, `reference-analysis.md` содержит section-by-section visual spec, а `design-brief.md` и `screens.md` явно используют этот spec.
- Для reference-driven или high-visual-risk задач рекомендуется `STYLE_GUIDE.md`; если он пропущен, `handoff-bundle.md` содержит `skipped_with_reason`.
- Если создан `STYLE_GUIDE.md`, он содержит два слоя: presentation/render и UI structure, а также явные tokens, composition metrics, allowed/disallowed patterns и anti-patterns.
- Если создан `design-loop-report.md`, он содержит таблицу `Before | After | Why`, style drift и revision block.
- Если запрошен Figma handoff, `figma-handoff-bundle.md` создан после `screens.md` и содержит canvas strategy, variables/styles/components/screens, Auto Layout rules, approval state и target.
- Если создается Figma board или Figma-ready handoff, Surface Output Contract содержит список expected frames/sections/entities, карту данных к фреймам и критерии screenshot verification. Неполная доска без coverage rationale блокирует `ready`.
- Если Figma write выполнен, bundle содержит node/frame evidence, screenshot verification и известные visual gaps.
- Copy содержит hero, CTA, sections, FAQ, SEO и claims to validate.
- Copy содержит Message Source Map: важные секции связаны с research/JTBD/PRD/design inputs и evidence status.
- Copy содержит Voice & Terminology: tone rules, terms to use/avoid, customer language и trust language.
- Copy содержит UX Microcopy для forms/validation/empty/loading/success/consent states, если такие состояния есть в PRD/design.
- Copy содержит Responsive Copy Variants для H1, CTA, карточек и validation messages, если эти элементы есть в screen scope.
- Copy содержит Copy-To-Design Handoff: CTA labels, length constraints, required microcopy, content risks and visual proof/support needs.
- Copy не использует synthetic interviews как testimonials.
- Copy не использует fake metrics, fake logos, fake case studies, неподтвержденные ROI/guarantee claims или generic AI/SaaS cliches.

## Gate 4: экраны и прототип

- Screens согласованы с PRD, IA, design и copy.
- Screens содержат Input Readiness Pass по PRD, IA, design, copy и reference/style inputs; пропуски фиксируются как `partial`/`blocked`.
- Screens содержат Surface Output Contract для screen surface: expected screens/sections/states, evidence-to-screen map, coverage gate и verification plan.
- Screens содержат Design-System Grounding: reused tokens/components/styles и gaps для новых компонентов.
- Screens содержат Screen Traceability: `research/JTBD -> PRD requirement -> IA node -> copy source -> prototype/test signal`.
- Screens содержат component inventory, state inventory, responsive constraints и accessibility notes.
- Screens содержат Figma Readiness: variables/styles, component sets/variants, Auto Layout critical areas, canvas strategy и screenshot verification plan.
- Screens не могут быть `ready`, если layout или section order основаны на generic/default шаблоне вместо `design-brief.md`, `STYLE_GUIDE.md` или reference scan.
- Prototype содержит start screen, transition map и completion step.
- Prototype содержит Input Readiness Pass: PRD, IA, design, screens и copy дали достаточно данных для интерактивной спецификации; пропуски фиксируются как `partial`/`blocked`, а не додумываются.
- Prototype содержит Flow Goal: user, goal, success outcome и primary action.
- Prototype содержит entry points, state inventory и alternate/recovery paths для ключевого пользовательского сценария.
- Prototype содержит manual test script для happy path, negative path, keyboard path и mobile path.
- Prototype содержит instrumentation/test hooks без PII и frontend handoff contract.
- Если нужен Figma prototype write, есть approval record с exact target; без approval допустима только handoff-ready specification.
- Missing interactions явно описаны.

## Gate 5: фронтенд

- Frontend читает все upstream artifacts.
- Frontend содержит Surface Output Contract summary в `frontend-result.md`: surface type, implemented views/components/states, upstream coverage, visual/browser verification и unresolved deviations.
- Если frontend сделан в режиме `quick draft`, gate не может быть `passed`: допустим только `passed_with_notes`/`partial` с явным списком skipped upstream artifacts.
- Secrets не добавлены.
- Базовые responsive и accessibility требования реализованы.
- Motion/interaction gate: нет `transition: all`, UI-анимации имеют явную цель и обычно короче 300ms, hover-анимации gated через fine pointer media query, transform-based motion имеет `prefers-reduced-motion`, интерактивные элементы имеют focus/active/disabled/loading/error states.
- Если есть `figma-handoff-bundle.md`, frontend либо реализует эквиваленты variables/component states/Auto Layout rules, либо фиксирует deviations в `frontend-result.md`.
- Если есть `storybook-result.md`, он содержит связь Figma component -> frontend component -> Story и проверку states.
- Доступные build/typecheck/test commands выполнены или blockers задокументированы.
- Если был visual reference: сняты full-page desktop/mobile screenshots референса и реализации.
- Если был visual reference: для каждой видимой секции сняты пары скриншотов с одинаковыми именами секций: `reference-desktop-section-<name>.png` + `local-desktop-section-<name>.png`, `reference-mobile-section-<name>.png` + `local-mobile-section-<name>.png`. Без полных пар gate = `blocked`.
- Если был visual reference: выполнен `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]`, создан `visual-diff-result.json`, а результат зафиксирован в `visual-reference-review.md`. Без pixel diff gate = `blocked`.
- Если был visual reference: создан `visual-reference-review.md`, зафиксированы concrete gaps и corrections по всем секциям, компонентам и стилям.
- Если был visual reference: финальная реализация сверена по section-by-section mapping; generic/default landing style без соответствия референсу блокирует gate.

## Gate 6: test bench, QA и релиз

- Test bench описывает primary funnel и PII risk.
- QA проверяет Research integrity, PRD fit, UX, accessibility, responsive, analytics и secrets.
- QA проверяет Surface-Aware Output Gate по всем созданным пользовательским поверхностям и фиксирует результат в Evidence Matrix.
- QA содержит QA Scope & Evidence Plan: для каждой области аудита указан источник доказательств, команда/артефакт/скриншот или причина недоступности.
- QA содержит Traceability Audit: `research/JTBD -> PRD requirement -> IA node -> screen/component -> copy/prototype/test signal`; разрыв для `must` scope блокирует release или требует explicit waiver.
- QA содержит Evidence Matrix и Severity Matrix с уровнями `blocker`, `critical`, `high`, `medium`, `low`, `info`.
- QA содержит Negative & Edge Path Pass: empty/loading/error/validation/success states, long text/overflow, duplicate submit, touch/keyboard completion.
- QA содержит Skipped / Unavailable Checks; полный `pass` запрещен, если обязательные проверки пропущены без причины и follow-up.
- QA содержит Devil's Advocate / False Positive Pass, если все основные проверки получили `pass`.
- QA проверяет full-page visual reference screenshot review, если пользователь давал reference URL/site.
- Для reference-driven workflow QA не принимает desktop-only visual review: нужны desktop/mobile пары секций, `visual-diff-result.json` и `visual-reference-review.md`.
- Accessibility-выводы в QA должны иметь authoritative source/evidence или явную пометку `experience_based`.
- Release notes включают changed files, validation и rollback notes.
- Release notes содержат Surface Output Summary: какие поверхности изменены, какой scope был заявлен, какая verification evidence есть, какие deviations остались.
- Release notes содержат Release Scope: тип выпуска, exact target, необходимость approval и owner.
- Release notes содержат Run Ledger Audit по `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`, `stage-gate-ledger.md` и `handoff-bundle.md`.
- Release notes отделяют текущий release scope от unrelated dirty tree; смешивать старые изменения с текущим выпуском запрещено.
- Release notes содержат Dependency & Sensitive Delta: package/lockfile, env/secrets, analytics payloads, raw provider outputs и PII risk.
- Release notes содержат Validation Matrix с command/evidence, result и release impact.
- Release notes содержат Release Decision Matrix; `ready/released` запрещен без QA pass/pass_with_known_limitations, workflow validation, approval/external records и rollback readiness.
- Release notes содержат Deployment Plan, Post-Release Smoke Checks и Rollback Plan без destructive defaults. `git reset --hard` не является стандартным rollback.
- Release notes содержат Approval And External Records для Notion, Figma, deploy и git write либо явный blocker/not_requested.
- Notion research-only child page publication выполнена для полного workflow и записана в `stage-gate-ledger.md` + `release-notes.md`, либо workflow явно помечен `partial/blocked` с причиной.
- Перед Notion write создан `publication plan` и dry-run/preview с exact target, source checksum, block count, expected writes и unsupported blocks.
- Перед Notion write dry-run содержит `notion_data_shape_plan`: selected layout, child pages, table blocks, `database_index_candidates`, schema preview, idempotency strategy и API limits. Сущности, которые нужно фильтровать, сортировать, обновлять или связывать, не должны публиковаться только prose/table block без rationale.
- Перед Notion write пройден `Publication Shape Gate`: personas, CJM/user paths, competitive matrix и ICE/RICE/backlog представлены таблицами или схемами; для hub-публикации dry-run содержит `publication_shape_gate.pass=true`.
- Approval на Notion write привязан к точному `action` и `target`; targetless approval не засчитывается.
- Markdown экспорт опубликован как структурированные Notion blocks, а не как один raw code block.
- Для Notion API/MCP записи зафиксированы block count, chunk count, retry count и обработка request limits/429.
- Повторная публикация имеет idempotency strategy: existing page/database lookup, source checksum/export marker или явный versioning policy.
- Notion publication не содержит full workflow dump, schema/frontmatter, raw JSON payloads или code-block копии всех артефактов.
- Полный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` возвращает no errors для complete workflow без visual reference.
- Полный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference` возвращает no errors для complete workflow с visual reference.

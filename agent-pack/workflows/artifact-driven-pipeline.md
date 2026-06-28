# Артефакт-ориентированный конвейер (Artifact-Driven Pipeline)

## Источник истины (Source Of Truth)

Источником истины для продуктовых runtime workflow являются файлы, расположенные в каталоге: `outputs/<project-slug>/<YYYY-MM-DD>/`.

Источником истины для standalone research/CJM/market-research workflow являются файлы, расположенные в каталоге: `research/projects/<research-slug>/<YYYY-MM-DD>/`. Для временных проверочных запусков и тестов используется каталог `outputs/temp/`; для временных исследовательских черновиков используется `research/temp/`.

`outputs/products/` является legacy/archive-зоной для старых или вручную перенесенных результатов. Она не является нормативным источником для правил агента и не должна использоваться как путь по умолчанию в командах `workflow:*`.

`outputs/registry.json` может использоваться как навигационный индекс активных продуктов, а `research/registry.json` — как навигационный индекс исследовательских проектов. Эти registry не являются gate и не являются доказательством корректности или некорректности правил workflow. Состояние конкретного `run-state.json` в прошлых `outputs/*` или `research/projects/*` считается диагностикой отдельного запуска, а не дефектом инструкций.

Матрица владельцев, входов и выходов этапов находится в `agent-pack/workflows/stage-handoff-contract.md`. При изменении `runtime/typescript/workflow.manifest.ts` нужно синхронно обновить эту матрицу, `.agent.md`, шаблоны артефактов и regression tests, чтобы downstream агенты понимали, какие файлы они обязаны прочитать и какие outputs передать дальше.

## Обязательная последовательность этапов

```text
исходный запрос
  -> run-plan.md + handoff-bundle.md + stage-gate-ledger.md
  -> recursive-brief.md
  -> research-summary.md + scenario-user-flows.md + competitive-analysis.md + proto-personas.md + synthetic-interviews.md + swot.md
  -> prd.md
  -> ia-brief.md
  -> reference-analysis.md (если был задан визуальный референс)
  -> STYLE_GUIDE.md (опционально, если есть визуальный риск или референс)
  -> design-brief.md
  -> copy-deck.md
  -> design-generator-prompt.md (опционально, перед генерацией экранов)
  -> screens.md
  -> design-loop-report.md (опционально, после первичной спецификации/макета экранов)
  -> figma-layout-ir.json (обязательно для Figma/product UI/prototype surface перед Figma write)
  -> figma-handoff-bundle.md
  -> Figma canvas write (опционально, approval-gated)
  -> figma-visual-qa.json (обязательно после Figma write перед ready_for_review)
  -> prototype-report.md
  -> frontend-result.md
  -> visual-reference-review.md (если был задан визуальный референс)
  -> test-bench-result.md
  -> qa-report.md
  -> release-notes.md
  -> Запись о публикации исследования в Notion (обязательно для полного воркфлоу)
  -> notion-prd-export.md (если требуется отдельный плоский экспорт PRD)
  -> storybook-result.md (опциональный export/evidence artifact)
```

## Жесткий контроль этапов (Hard Stage Enforcement)

На каждом этапе (stage) исполнитель обязан:

1. Проверить наличие обязательных входных данных (required inputs).
2. Убедиться, что предыдущий этап имеет статус `complete` (завершен).
3. Создать обязательные артефакты этапа.
4. Обновить файл `handoff-bundle.md`.
5. Обновить файл `stage-gate-ledger.md`.
6. Успешно пройти валидацию (validation).

Если этап создает пользовательскую поверхность (`figma_board`, `product_ui`, `dashboard_console`, `landing`, `prototype`, `frontend`, `notion_wiki`, `research_report`, `presentation` или `handoff`), до генерации результата должен быть создан или встроен **Surface Output Contract** по `agent-pack/templates/surface-output-contract.template.md`. Контракт фиксирует surface type, scope, coverage, evidence-to-output map, quality bar и verification plan.

Если этап создает визуальную или интерактивную поверхность (`figma_board`, `product_ui`, `dashboard_console`, `landing`, `prototype`, `frontend`, `presentation` или visual `handoff`), до генерации результата должен быть создан **Visual Evidence Grounding**. Он фиксирует real-world visual references независимо от продукта: same-domain examples, adjacent high-quality examples, interaction/state examples и design-system grounding. UI Kit/design system не считается достаточным доказательством сам по себе. Если real-world visual evidence недоступен, stage получает `partial/blocked`, кроме explicit waiver/deviation.

Если визуальная поверхность проходит через несколько источников правды, stage обязан определить **Source Pair Matrix**: `reference_to_figma`, `figma_to_frontend`, `reference_to_frontend`, `spec_to_frontend_behavior`. Для каждой пары фиксируются required yes/no, evidence, status и notes. Эта матрица записывается в `figma-handoff-bundle.md`, `frontend-result.md`, `visual-reference-review.md` или `qa-report.md` в зависимости от stage.

Если поверхность проходит через Figma или дизайн-систему, stage обязан выполнить **Design System Strategy Gate**: выбрать `reuse|extend|product_specific|bespoke`. Новая продуктовая дизайн-система является штатным маршрутом. Для `extend|product_specific` действует Two-Pass Figma Build: сначала `visual_calibration` на 2-3 экранах, затем `systemization` без visual regression. Для `figma_board|product_ui|prototype` surface до Figma write обязателен `figma-layout-ir.json` с route, zones, copy-fit, component sources, resize constraints и verification contract; после write обязателен `figma-visual-qa.json` с screenshot/object inventory checks и `gate_result.ready_allowed=true` или explicit deviation. Перед frontend handoff обязательны Component Contract Matrix, Code Connect/fallback status и frame/state -> route/story/component mapping по `integrations/mcp/figma-canvas-write-guide.md`.

Для запросов на макеты, use cases, app flow, мобильное приложение, Figma screens или product UI действует **Design Agent First Gate**: первым визуальным владельцем всегда является `04-design` (`design`). `06-screens`, `figma-screen-compiler`, `figma-handoff`, `figma-roundtrip`, `visual-layout-verifier` и Figma `use_figma` не могут начинать работу, если нет свежего `design-brief.md` от Design Agent для того же запроса. Этот handoff должен содержать LazyWeb/reference evidence, `design_system_mode`, решение reuse/extend/product_specific/bespoke, список существующих компонентов для переиспользования и список только недостающих gap-компонентов. Если gate не выполнен, stage status = `blocked_missing_design_agent_handoff`.

Невыполнение любого из пунктов переводит этап в статус `blocked` (заблокирован); следующий этап не может быть начат.

## Рабочий режим

Проект работает через Codex внутри IDE/чата: Codex читает инструкции агентов, workflow-документы и шаблоны, затем выполняет этапы через локальные инструменты и фиксирует артефакты.

Локальный runtime используется как вспомогательный слой для scaffold, validation, persisted state и QA-команд.

Перед запуском workflow или проверкой среды Оркестратор выполняет `yarn workflow:doctor`. Перед финальным статусом запускается `workflow:validate` по нужному profile.

## Конечно-разностный автомат состояний этапа (Stage State Machine)

```text
NOT_STARTED -> IN_PROGRESS -> GENERATED -> VALIDATED -> HANDED_OFF -> COMPLETE
```

Запрещенные переходы состояний:

- GENERATED -> COMPLETE
- GENERATED -> NEXT_STAGE (переход к следующему этапу)
- IN_PROGRESS -> COMPLETE

## Исследовательская блокировка (Research Lock)

Этап PRD и все последующие этапы строго запрещены до тех пор, пока данные артефакты не будут созданы и успешно не пройдут валидацию:

- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

Структурированные результаты исследования должны обязательно включать:

- `proto_personas`
- `simulated_interviews`
- `skipped_with_reason` (с указанием веской причины, если обязательное исследование подготовить невозможно)
- `evidence_status: synthetic` для каждого сгенерированного (симулированного) интервью

## Исследовательские ворота качества (Research Gate)

Исследование должно содержать:

- artifact context inventory: список run artifacts, которые были реально прочитаны перед synthesis;
- `inputs_used`, отражающий `run-plan.md`, `recursive-brief.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, прошлые research/export/CJM artifacts, `stage-results/*.json` и provider outputs, если они использовались;
- исследовательские вопросы (research questions);
- журнал источников и доказательств (sources/evidence log);
- сегменты целевой аудитории (audience segments);
- Jobs To Be Done (JTBD);
- CJM/user paths или `skipped_with_reason`, если CJM неприменим к задаче;
- opportunity scoring или приоритеты возможностей, если research должен кормить PRD/IA/design;
- `proto_personas`: от 2 до 4 прото-персон (или `skipped_with_reason`);
- `synthetic_interviews`: от 3 до 5 синтетических интервью (или `skipped_with_reason`);
- у каждой персоны должен быть указан `Evidence status`;
- у каждого синтетического интервью должен быть статус `evidence_status: synthetic`;
- конкурентный анализ;
- SWOT-анализ;
- план валидации;
- research-to-design handoff;
- unknowns и гипотезы для проверки (claims to validate);
- candidate quality/write gate: решение о записи или сохранении существующего artifact, если новый candidate слабее, слишком generic или теряет контекст.
- Anti-AI-Slop Gate: ключевые выводы не должны состоять из паттерных AI-слов и абстрактных продуктовых ярлыков без жизненного объяснения. Формулировки вроде `orchestration`, `rails`, `wedge`, `trust layer`, `seamless`, `unlock`, `flywheel`, `layer`, `companion` должны быть заменены на конкретный русский сценарий или сопровождаться понятной расшифровкой.
- Narrative Depth Gate: если пользователь просит проработку, research artifact не может быть только тезисной выжимкой. Должны быть подробные кейсы, user flow под CJM, вопросы пользователя на этапах, метрики и связь `CJM friction -> initiative -> validation method`.

Исследование получает статус `fail` (ошибка), если:

- прото-персоны отсутствуют без указания причины `skipped_with_reason`;
- симулированные интервью отсутствуют без указания причины `skipped_with_reason`;
- синтетические интервью используются как реальные доказательства;
- утверждения из симулированных интервью переносятся в PRD или копирайт без пометки `needs validation` (требует валидации).
- research runner игнорирует уже существующие run artifacts и строит synthesis только из query/provider output;
- provider validation `pass` используется как единственное основание для `ready`, хотя rendered artifacts остаются generic, неполными или не отражают текущий run ledger.
- CJM содержит только обобщенную stage table без ключевых кейсов, user flow, вопросов пользователя, метрик и связи с roadmap;
- roadmap/ICE/RICE не привязан к конкретным трениям из CJM и способам проверки.

## Контроль передачи данных (Handoff Enforcement)

Каждый этап обязан обновлять файл `handoff-bundle.md`, фиксируя следующие данные:

- результаты (outputs);
- принятые решения (decisions);
- предположения (assumptions);
- риски (risks);
- нерешенные вопросы (unresolved questions);
- следующий требуемый артефакт (next required artifact).
- surface output contract summary, если stage создал пользовательскую поверхность: surface type, must-cover sections, coverage gaps, evidence-to-output decisions, verification evidence.
- visual evidence grounding summary, если stage создал визуальную/интерактивную поверхность: какие real-world references использованы, какие слои пропущены, какие visual decisions применены к output units и какой screenshot/visual review нужен downstream.
- source pair status, если stage создал или проверял Figma/frontend/reference surface: какие пары обязательны, где evidence, какие gaps передаются следующему stage.

После ручной правки артефактов в run directory оркестратор запускает `yarn workflow:sync <run-dir>`, если команда доступна. Для standalone research `<run-dir>` обычно находится в `research/projects/<research-slug>/<YYYY-MM-DD>`. Если синхронизация невозможна, причина фиксируется в `handoff-bundle.md` и `stage-gate-ledger.md`.

## Ведение реестра ворот качества (Ledger Enforcement)

Каждый этап обязан обновлять реестр в файле `stage-gate-ledger.md`, фиксируя:

- идентификатор этапа (stage);
- владельца/исполнителя (owner);
- текущий статус (status);
- метку времени (timestamp);
- созданные артефакты (artifacts);
- результаты валидации (validation);
- подтверждение обновления handoff: `handoff_updated=true`.

Переход к следующему этапу требует соблюдения условий:

- `status=complete`;
- `validation=passed`;
- `handoff_updated=true`.

## Блокировка фронтенда (Frontend Lock)

Разработка фронтенда не может быть начата до завершения этапов PRD, информационной архитектуры (IA), дизайна, копирайтинга, спецификации экранов и прототипа, за исключением специального демонстрационного режима быстрого наброска (`quick draft`).

`quick draft` разрешен только при явном запросе пользователя: `quick draft`, «быстрый набросок», `demo only` или эквивалентная формулировка. В этом режиме frontend может стартовать раньше полного upstream пакета, но workflow обязан создать минимальные `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, записать пропущенные стадии как `partial`/`skipped_with_reason` и не возвращать финальный `success`. `quick draft` запрещен для reference-driven задач, внешних публикаций, Figma write, deploy и production-quality acceptance.

Если пользователь передает визуальные референсы или требует соответствия определенному сайту, создание `reference-analysis.md` является строго обязательным до начала работы над `design-brief.md`.
Анализ референса должен четко разделять разрешенные паттерны (allowed patterns), запрещенное копирование (disallowed copying), фирменный стиль и риски нарушения интеллектуальной собственности (IP risks).

## Ворота спецификации визуального референса (Reference-Driven Visual Spec Gate)

Для задач с визуальным референсом фронтенд не может быть начат до тех пор, пока `reference-analysis.md` не будет содержать подробную поблочную визуальную спецификацию (section-by-section visual spec):

- первый экран и шапка (hero/nav);
- фоновые решения и цветовая система;
- масштаб типографики и ритм начертаний шрифтов;
- отступы, максимальная ширина блоков и сетка макета (layout grid);
- порядок секций и вертикальный ритм прокрутки;
- карточки, строки списков и таблицы;
- стиль CTA (призывов к действию), формы и элементы управления (controls);
- правила обработки медиа-контента и иллюстраций;
- подвал сайта (footer);
- адаптивное поведение на мобильных устройствах (mobile behavior);
- явный список разрешенных и запрещенных паттернов.

`design-brief.md` и `screens.md` обязаны считывать эту спецификацию и транслировать её в конкретные проектные решения. Использование референса исключительно как «источника абстрактного вдохновения» без структурного маппинга строго запрещено.

## Опциональный слой декомпозиции стиля и дизайн-итераций (Design Enhancement Layer)

Для любой визуальной/интерактивной поверхности действует обязательный Visual Evidence Grounding: `visual_evidence_plan`, `visual_reference_cards` и `visual evidence -> output unit` mapping должны быть встроены в `design-brief.md`, `screens.md`, `figma-handoff-bundle.md`, `frontend-result.md` или соответствующий surface artifact. Для задач с высоким визуальным риском, референсами, Figma handoff или запросом на дизайн-систему Оркестратор может включить дополнительный слой артефактов. Эти файлы не являются обязательными для каждого standard workflow, но если они созданы, downstream stages обязаны читать их как inputs:

- `STYLE_GUIDE.md`: системная декомпозиция стиля. Разделяет слой подачи/рендера (свет, глубина, материал, фон, грейд) и слой структуры UI (сетка, компоненты, типографика, цвет, иерархия). Должен содержать явные токены, композиционные метрики, allowed/disallowed patterns и anti-patterns.
- `design-generator-prompt.md`: prompt package для генерации или ручного проектирования 2-3 экранов, основанный на `STYLE_GUIDE.md`, PRD, IA и copy. Запрещено подменять продукт третьей придуманной идеей.
- `design-loop-report.md`: evidence итераций "скрин -> критика -> revision block". Критика фиксирует не общие пожелания, а конкретные причины визуальной дешевизны, style drift и required corrections.
- `figma-layout-ir.json`: machine-readable contract перед Figma write: P0 route, screen zones, copy-fit, layout constraints, component sources, DS honesty и verification contract.
- `figma-handoff-bundle.md`: approval-gated пакет foundation/components/screens перед любой записью в Figma.
- `figma-visual-qa.json`: evidence после Figma write: screenshots/object inventory, checks, repair actions и gate result перед frontend/QA.
- `storybook-result.md`: optional evidence для компонентной библиотеки, Storybook states и motion/a11y checks.

Для reference-driven задач `STYLE_GUIDE.md` рекомендуется создавать сразу после `reference-analysis.md`, чтобы `design-brief.md`, `screens.md` и frontend не скатывались в generic/default landing style. Если этот слой пропущен, причина фиксируется в `handoff-bundle.md` как `skipped_with_reason`.

Figma write и Storybook export не выполняются молча: Figma требует human approval и `write_allowed=true`, Storybook требует явного запроса пользователя или release/export scope.

### Порядок Skills В Design Enhancement Layer

Design skills применяются в таком порядке:

1. `style-decompose` на `04-design`: после `reference-analysis.md`, до финального `design-brief.md`.
2. `design-loop` на `06-screens`: сначала `design-generator-prompt.md`, затем `screens.md`, затем `design-loop-report.md`.
3. `figma-screen-compiler` на `06-screens`: создает `figma-layout-ir.json` до любого Figma write для app/Figma/prototype surface.
4. `figma-handoff` после `screens.md`, `design-loop-report.md` и `figma-layout-ir.json`: готовит `figma-handoff-bundle.md`, approval gate и canvas strategy.
5. Figma `use_figma` write выполняется только после human approval, `write_allowed=true`, проверки target и `search_design_system`.
6. `visual-layout-verifier` после Figma write/systemization: создает `figma-visual-qa.json`; `ready_for_review` запрещен без passed/passed_with_notes gate.
7. `design-engineering` на `08-frontend` и `11-qa`: проверяет motion, focus, hover, active, disabled/loading/error/empty states и reduced motion.
8. `ds-to-storybook` после frontend: только если нужен component library / Storybook export.

Figma canvas strategy выбирается по задаче: если пользователь дал anchor frame, он может использоваться как точка привязки, но полноценная дизайн-доска должна создаваться отдельными frames на canvas, если это улучшает читаемость handoff.

После Figma write обязательна Figma Surface Verification: `get_metadata`/object inventory, `get_screenshot`, список created/updated frame/node IDs, component/library grounding, Auto Layout/variables deviations, `figma-visual-qa.json` и Russian Publication Gate result. Без этих evidence Figma surface не может быть `ready`.

## Ворота скриншот-сверки с референсом (Visual Reference Screenshot Gate)

Если пользователь предоставляет визуальный референс, ссылку на него или просит сделать сайт «как этот», рабочий процесс не может быть успешно завершен без создания артефакта `visual-reference-review.md`.

Артефакт `visual-reference-review.md` обязан содержать:

- использованные входные данные (`inputs_used`);
- Source Pair Matrix: `reference_to_figma`, `figma_to_frontend`, `reference_to_frontend`, `spec_to_frontend_behavior` с required/evidence/status/notes;
- ссылки или пути к полноразмерным скриншотам (full-page desktop & mobile screenshots) референса;
- ссылки или пути к полноразмерным скриншотам текущей реализации;
- ссылки или пути к парным скриншотам отдельных секций с одинаковыми именами: `reference-desktop-section-<name>.png` + `local-desktop-section-<name>.png`, `reference-mobile-section-<name>.png` + `local-mobile-section-<name>.png`;
- результат `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` в `visual-diff-result.json` и краткую интерпретацию pixel diff;
- результат `yarn reference:section-diff <reference-url> <local-url> [output-dir] [--sections sections.json]`, если обе стороны доступны как URL, либо `skipped_with_reason`;
- детальное сравнение первого экрана как критически важной зоны;
- сравнение всех видимых блоков, компонентов, стилей, сетки, шрифтов, плотности контента, CTA, карточек, форм, подвала и мобильного отображения;
- список выявленных расхождений (gaps);
- список внесенных исправлений (corrections) или `skipped_with_reason`;
- поблочную таблицу соответствия: блок референса -> Figma block при наличии -> локальный блок -> статус соответствия -> исправление;
- явное подтверждение того, что реализация не скатилась в дефолтный или шаблонный стиль;
- финальный вердикт ворот качества (gate result): `passed` (пройдено), `passed_with_notes` или `blocked`.

Если хотя бы для одной видимой секции отсутствует пара reference/local desktop или mobile, либо не создан `visual-diff-result.json`, visual reference gate получает статус `blocked`.

Этапы QA и релиза не могут получить статус успешного завершения (`success`), если визуальный референс был задан, но скриншот-сверка не была проведена или не зафиксирована в реестре `stage-gate-ledger.md`.

## Финальные ворота завершения конвейера (Completion Gate)

Вся цепочка воркфлоу завершается только тогда, когда созданы все обязательные артефакты конвейера и финальная скриншот-сверка/валидация успешно пройдены.

## Ворота публикации исследования в Notion (Notion Research Publication Gate)

Для полного воркфлоу публикация результатов исследования в Notion является строго обязательной перед подготовкой финального ответа.

Требования к публикации:
- публикуется исключительно пакет результатов исследования (research-only human-readable pack): `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, а также `reference-analysis.md` (при наличии);
- перед запросом approval создается `notion-research-export-ru.md` как человекочитаемый research pack без workflow dump, schema/frontmatter, raw JSON и code-block копий артефактов;
- до внешней записи создается `publication plan` и dry-run/preview: target, Notion mode, source artifacts, checksum, block count, unsupported blocks и expected writes;
- до внешней записи проходит `Publication Completeness Gate`: export должен быть собран из полного research pack, а не из краткого summary. Если в run directory есть `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, `cjm-map.md` или `opportunity-roadmap.md`, publication preview обязан сверить размер/покрытие export с этими источниками и заблокировать shallow export;
- до внешней записи проходит `Publication Shape Gate`: personas, CJM/user paths, competitive matrix и ICE/RICE/backlog должны быть представлены таблицами или схемами; если эти разделы уходят прозой вместо структурированного вида, публикация блокируется до исправления `notion-research-export-ru.md`;
- до внешней записи проходит `Publication Editor Pass`: public export не содержит internal ledger sections (`Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy, shape/lint/data-shape gates), duplicate overview/control sections и повторные копии сущностей. Для каждой сущности есть `entity_ownership_map`: где она живет как narrative, table block, database index или embedded linked view;
- до внешней записи проходит `Publication Cross-Link Gate`: подробный hub должен содержать `Карта связей исследования` и `Цепочка решений`; отсылки к personas, CJM, ICE/RICE, roadmap/SWOT, validation и sources должны быть кликабельными Markdown links, Notion page mentions или ссылками на реальные child pages. Если gate не пройден, публикация блокируется до исправления `notion-research-export-ru.md` или отдельного approval-gated cross-link pass;
- до внешней записи проходит `Publication Anti-AI-Slop Gate` и исполняемый `Research Content Lint`: `yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>`, `yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>` для продуктового run или `yarn research:lint <research-export-md>`. Проверка реализует Rules 1-6: не тезисная выжимка, CJM/user-flow depth, roadmap trace, claims с механизмом, неуниверсальные формулировки и неповторяющиеся таблицы. Если lint падает, публикация блокируется до исправления sources/templates/export;
- публикация осуществляется по выбранной layout strategy:
  - короткий export до 120 blocks и до 6 крупных разделов — отдельная дочерняя страница (`flat_child_page`);
  - подробный research pack — hub page + child pages по разделам (`hub_with_child_pages`);
  - personas, user stories, backlog, risks, opportunities, sources или interview insights — базы данных (`database_index`) в составе `integrated_hybrid`;
  - если публикация содержит и narrative child pages, и базы данных, обязательна форма `integrated_hybrid`: каждая рабочая база должна быть встроена linked database view в соответствующую смысловую child page, а не оставаться только отдельной detached database;
  - запрещено публиковать подробный research pack одной длинной страницей;
- dry-run подробного research hub обязан вернуть `notion_data_shape_plan`: selected layout, child pages, table blocks, `database_index_candidates`, schema preview, idempotency strategy и API limits. Если сущность будет фильтроваться, сортироваться, обновляться или связываться с другими сущностями, preferred shape = `database_index` внутри `integrated_hybrid`, а не prose/table block;
- dry-run подробного research hub обязан вернуть `publication_editor_gate`: public/private split, internal sections removed, duplicate sections removed/kept with rationale, `entity_ownership_map` и `dedupe_actions`;
- для `integrated_hybrid` dry-run обязан показать `embedded_database_views`: page title/id target, source database/data source, view name, visible properties и rationale. Стандартное сопоставление: personas -> страница персон, CJM frictions -> страница CJM/user flow, opportunities/backlog -> страница roadmap/ICE/RICE, requirements/user stories -> PRD/requirements, validation claims/sources -> validation/source page;
- после записи Combined Notion Workspace Gate проходит только если fetch/metadata verification подтверждает inline linked database views на целевых child pages. Если базы созданы, но не встроены в страницы, publication status = `partial` до отдельного integrated pass;
- для `hub_with_child_pages` действует micro-page gate: цель 6-12 дочерних страниц, без отдельной страницы для блока меньше 8-10 Notion blocks; короткие детали группируются в крупные страницы; toggle/drawer используется выборочно для длинных списков, validation details и повторяемых карточек инициатив/задач, а не для каждого малого блока;
- Markdown преобразуется в структурированные Notion blocks через MCP/tool/converter; запрещено публиковать весь export как один raw code block;
- категорически запрещено публиковать машиночитаемые схемы, frontmatter, сырые JSON-данные, полный системный дамп воркфлоу, файлы фронтенда, логов или релизов, а также копии файлов в виде блоков кода;
- если `NOTION_TOKEN` и родительская страница доступны, оркестратор запрашивает подтверждение пользователя через интерактивный `workflow:approval-request` на exact target и запускает подходящий скрипт: `tooling/scripts/publish-notion-research-page.mjs <parent-page> <research-export-md> "<page-title>"` для короткого export или `tooling/scripts/publish-notion-research-hub.mjs <parent-page> <research-export-md> "<hub-title>"` для подробного research pack;
- при Notion API записи blocks append выполняется чанками до 100 blocks с обработкой `429` через `Retry-After`/backoff;
- повторная публикация использует idempotency strategy: existing child page/export marker/source checksum или явную versioning strategy;
- реестр `stage-gate-ledger.md` фиксирует publication plan, dry-run result, команду/режим публикации, результат, ID/URL созданной или обновленной дочерней страницы, количество blocks/chunks/retries и unsupported blocks;
- для hub-публикации dry-run должен фиксировать `publication_shape_gate.pass=true`; если gate пропущен через legacy override, причина и риск фиксируются в ledger/release notes;
- `release-notes.md` фиксирует итоговый URL дочерней страницы Notion или явную блокировку;
- если целевая страница Notion, токен, доступы или подтверждение пользователя отсутствуют, воркфлоу получает статус `partial` или `blocked` с детальной фиксацией причин в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `release-notes.md`;
- запрещено возвращать успешный финальный статус (`success`), если публикация результатов исследования была пропущена молча.

## Ворота Agile-экспорта (Notion Agile Board & User Stories Export Gate)

В ходе релизной фазы (`12-release`) движок или Агент публикации выполняют интерактивный экспорт пользовательских историй и персон в Notion.

Требования:
- Экспорт парсит файлы `proto-personas.md` и `prd.md` для автоматического извлечения профилей персон, историй и критериев приемки (Acceptance Criteria).
- Создает две взаимосвязанные базы данных: **Proto Personas** и **User Stories** (с Relation-связью между ними).
- До записи создает database schema preview: properties, statuses, priorities, relation names и idempotency marker для повторного запуска.
- Каждая карточка пользовательской истории внутри наполняется интерактивным чек-листом Acceptance Criteria в виде блоков задач `to_do`.
- Если движок обнаруживает `NOTION_TOKEN` и родительский ID/URL страницы в переменных окружения, `.env` или scaffold-файлах, он может подготовить schema preview, idempotency marker и approval request на стадии `12-release`. Внешняя запись в Notion срабатывает только после exact approval `notion_agile_export` для конкретной target page/database.
- Результаты экспорта и статус фиксируются в `stage-gate-ledger.md` и `release-notes.md`.

## Валидация во время выполнения (Runtime Validation)

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through <stage-id>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

Любая ошибка валидации блокирует финальный статус `success`.

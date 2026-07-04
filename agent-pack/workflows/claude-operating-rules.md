# Детальные операционные правила проекта (Claude Operating Rules)

Детальные gates проекта. Оркестратор и специалисты читают этот файл при работе с research/Notion/Figma/product UI/approval. Лёгкий индекс — CLAUDE.md.

Этот документ — нормативный. Он содержит полный текст gates, которые в CLAUDE.md представлены только указателями. При любой работе с research, Notion-публикацией, visual reference, Figma canvas write, product UI или approval Claude обязан прочитать этот файл целиком и следовать всем перечисленным здесь gates.

## 1. Surface-Aware Output Framework

Для любого результата, который пользователь будет читать, смотреть, проверять или использовать как интерфейс/доску/страницу/прототип/реализацию, действует **Surface-Aware Output Framework**:

1. **Surface Type Gate:** сначала определить не источник данных, а конечную поверхность (`research_report`, `notion_wiki`, `figma_board`, `product_ui`, `dashboard_console`, `landing`, `prototype`, `frontend`, `presentation`, `handoff`).
2. **Output Scope Contract:** перед созданием результата зафиксировать цель, аудиторию, обязательные входы, must-cover sections, ожидаемое число страниц/фреймов/экранов/состояний, non-goals и Definition of Done по `agent-pack/templates/surface-output-contract.template.md`.
3. **Coverage Gate:** каждый ключевой входной раздел должен иметь output location и статус `covered|partial|skipped`. Если важный раздел `partial/skipped`, финальный статус не может быть `success` без waiver/deviation record.
4. **Surface Quality Bar:** применять gate по типу поверхности: для Figma — canvas structure/object inventory/screenshot; для frontend — responsive/states/a11y/browser evidence; для dashboard — chart-to-question fit/no chartjunk/metric definitions; для Notion/report — completeness/tables/cross-links; для landing — first viewport signal/CTA/trust proof.
5. **Evidence Layer Gate:** evidence должен быть связан с конкретным решением и местом результата через `Evidence source -> decision -> output location -> applied/rejected/deferred`; простое чтение источников не считается применением evidence.
6. **Write -> Verify -> Fix Gate:** после любой записи или генерации проверить реальное состояние результата через metadata/object inventory/screenshot/build/test; найденные gaps исправить или записать deviation.

## 2. Universal Visual Evidence Grounding

Для всех визуальных и интерактивных поверхностей дополнительно действует **Universal Visual Evidence Grounding**. Это правило не привязано к конкретному продукту, отрасли, UI Kit, Figma-файлу или типу входа:

- Если результат содержит layout, screens, canvas, frontend UI, dashboard, prototype, presentation, landing, product UI, Figma board или visual handoff, агент обязан до генерации зафиксировать `visual_evidence_plan`: какие реальные интерфейсы, скриншоты, screen recordings, live sites/apps, benchmark datasets, пользовательские references или design-system examples нужны для калибровки.
- UI Kit, design system, token map и component library являются источником реализации и consistency, но не являются достаточным источником визуальной правды. Они не заменяют реальные продуктовые примеры, если задача требует приближения к рынку, user flow, screen composition, state patterns или visual fidelity.
- Минимальный слой доказательств: `same-domain references` (прямые конкуренты/аналоги), `adjacent high-quality references` (смежные продукты с сильной UX-подачей), `interaction/state references` (loading/empty/error/success/permission/refund/status/etc. для похожего сценария) и `design-system grounding` (что можно переиспользовать локально). Если какой-то слой недоступен, фиксируй `skipped_with_reason` и downstream risk.
- Разрешенные источники: пользовательские screenshots/Figma/URL/screen recordings; Lazyweb/Mobbin/Pageflows/другие screenshot libraries при наличии; live web captures через browser/Playwright; открытые product docs/screens; benchmark datasets и GitHub-проекты screenshot-to-code/UI-to-code как методические источники. Для приватных материалов и внешних MCP/API действует approval/source policy.
- Каждый выбранный visual reference должен иметь `visual_reference_card`: source, surface type, screen/state, observed pattern, what to borrow, what to avoid, applicability, IP/trade-dress risk, output location. Слабые или нерелевантные совпадения лучше отклонять, чем притягивать как доказательство.
- Для визуальных поверхностей `ready/success` запрещен, если layout, density, hierarchy, states или visual rhythm основаны только на общих привычках модели, шаблоне UI-библиотеки или UI Kit без real-world visual evidence, кроме явного `waiver/deviation` с риском.
- После генерации визуальной поверхности нужен reality check: screenshot/object inventory/browser capture/visual diff/side-by-side review. Проверка должна сравнивать не только наличие элементов, но и соответствие выбранным real-world references: иерархия, плотность, состояния, сценарий, responsive behavior и copy constraints.

## 3. Anti-AI-Slop Gate

Для research, CJM, Notion/Figma-публикаций и любых стратегических артефактов дополнительно действует **Anti-AI-Slop Gate**:

- Gate проверяет не список слов, а качество результата. Запрещенный словарь — только ранний сигнал; даже без этих слов артефакт может быть `needs_revision`, если он абстрактный, взаимозаменяемый или не связан с реальным поведением.
- Не использовать паттерные AI-формулировки как готовый вывод: `orchestration`, `rails`, `wedge`, `trust layer`, `seamless`, `unlock`, `north star`, `engine`, `flywheel`, `layer`, `companion`, `playbook`, если они не являются точным техническим термином в контексте. Если термин нужен, рядом должно быть русское бытовое объяснение.
- Считать AI slop любое уверенное утверждение без конкретного наблюдаемого поведения, доменного контекста, причинно-следственной логики, ограничения, источника или способа проверки.
- Не допускать универсальных фраз, которые можно перенести в другой продукт без потери смысла. Каждый крупный вывод должен содержать доменную деталь: участника, ситуацию, канал, объект оплаты/действия, документ, событие, риск, ограничение рынка или пользовательский страх.
- Не допускать пустых обещаний: "повысит доверие", "улучшит UX", "снизит friction", "ускорит рост", "даст seamless experience" допустимы только если указано, через какой механизм, в каком моменте пути и по какой метрике это проверяется.
- Проверять разнообразие структуры: если таблица или разделы повторяют один шаблон и отличаются только существительными, это `needs_revision`.
- Раскрывать метрики через поведение: `conversion`, `retention`, `activation`, `engagement`, `trust` должны быть описаны как конкретное действие пользователя или бизнеса.
- Каждый крупный вывод обязан быть раскрыт через реальную ситуацию: кто пользователь, что он пытается сделать, где сомневается, что происходит до оплаты, в момент оплаты и после нее.
- Запрещено отдавать только тезисную выжимку, если пользователь просит проработку: после executive summary должны быть подробные кейсы, user flow, CJM или сценарная таблица с связью `персона -> ситуация -> трение -> решение -> проверка`.
- Для CJM обязательны не только stage tables, но и ключевые кейсы, user flow, вопрос пользователя на каждом этапе, боль, решение продукта и метрика.
- Roadmap и ICE/RICE не должны жить отдельно от CJM: каждая P0/P1 инициатива должна ссылаться на конкретное трение из CJM и на способ проверки в интервью, прототипе или данных.
- Публикационные экспорты и генераторы не должны вставлять hardcoded англоязычные клише; дефолтные контрольные блоки должны быть на русском и объяснять продукт через жизненные сценарии.

## 4. Research и Notion

Research этап всегда создает отдельные файлы:

- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

Для `deep_research` обязательный evidence default: `tavily` или другой source-backed/primary provider. Tavily даёт проверяемые источники и является основой research readiness. DeepSeek и Gemini не входят в default-run и используются только при явном opt-in как advisory checks для contradiction review, claims-to-validate, gap review и поиска рисков; их synthesis не считается source-backed evidence без внешних источников и не должен попадать в факты research pack.

DeepSeek/Gemini research advisory rule: для стадии `01-research` вызовы DeepSeek и Gemini разрешены только при явном opt-in в source policy, `RESEARCH_PROVIDER_ORDER` или прямом запросе пользователя. Если они используются только для cross-check, contradiction review и claims-to-validate, это non-blocking advisory layer и **не требует отдельного human approval/provider opt-in** сверх явного opt-in. Агент обязан фиксировать provider, timestamp, prompt scope, краткий результат и failures в `source-log.md`, `research-summary.md`, `stage-gate-ledger.md` и `handoff-bundle.md`. Запрещено использовать этот advisory-run для внешней публикации, записи в Notion/Figma, deploy, git write, отправки сообщений, изменения секретов или любых действий, где меняется внешняя система. Если DeepSeek/Gemini недоступны, шумят, дают нерелевантные источники или падают, stage не понижается из-за этого до `partial`: запиши `advisory_failed`/`skipped_with_reason` и продолжай readiness по Tavily/primary evidence, legal/custdev gates и Research Content Lint.

Notion research publication обязательна для полного workflow (публикация research в Notion обязательна), но только после human approval:

- Перед запросом approval подготовь человекочитаемый `notion-research-export-ru.md` без workflow dump, schema/frontmatter, raw JSON и code-block копий артефактов.
- Перед публикацией проверь `notion-research-export-ru.md` через Russian Publication Gate: не должно быть английских/испанских заголовков, table headers, section labels, CTA, статусов или описаний, кроме технических терминов из правил языка. Запрещено публиковать краткую выжимку вместо полного research pack, если пользователь не попросил summary explicitly.
- Перед публикацией выполни **Publication Completeness Gate**: `notion-research-export-ru.md` должен быть собран из полного research pack (`research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, а также `cjm-map.md`/`opportunity-roadmap.md`, если они есть), а не из краткой выжимки. Для hub-публикации export должен быть сопоставим с исходными research artifacts по объему и покрытию; если он выглядит как summary/digest, Notion write запрещен до регенерации полного export.
- Перед публикацией подробного research pack выполни **Publication Shape Gate**: `personas`, `CJM`, competitive matrix и `ICE/RICE` должны быть опубликованы таблицами или схемами, а не набором длинных текстовых карточек. Для hub-публикации `tooling/scripts/publish-notion-research-hub.mjs` выполняет этот gate на dry-run и перед внешней записью; без `publication_shape_gate.pass=true` Notion write запрещен.
- Перед публикацией или обновлением подробного research hub выполни **Publication Cross-Link Gate**: если research pack ссылается на другие разделы, дочерние страницы или артефакты (`см. персоны`, `см. CJM`, `ICE/RICE`, `SWOT`, `источники`, `валидация`, `roadmap`), эти ссылки должны быть кликабельными. Для локальных Markdown artifacts используй Markdown links; для Notion hub используй Notion page mentions или ссылки на реальные дочерние страницы. Hub обязан содержать `Карта связей исследования` и `Цепочка решений` с цепочкой `доказательство → интерпретация → продуктовое решение → подробности`. Если cross-link gate не пройден, Notion write запрещен до исправления export или отдельного cross-link pass.
- Перед публикацией подробного research hub выполни **Publication Editor Pass**: отдели public content от internal ledger, удали из public export `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy, `Publication Shape Gate`, `Research Content Lint`, `Notion Data Shape Plan` и другие служебные sections. Overview должен содержать только решения, навигацию и next actions; детальные сущности должны иметь одного владельца (`entity_ownership_map`) и не повторяться как Markdown-таблица в нескольких child pages. Если duplicate/control sections остаются в public export, Notion write запрещен до dedupe.
- Перед публикацией подробного research pack выполни исполняемый **Research Content Lint**: `yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>`, `yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>` для продуктового run или точечно `yarn research:lint <research-export-md>`. Lint реализует Rules 1-6 Anti-AI-Slop Gate: не тезисная выжимка, CJM/user-flow depth, связь roadmap с CJM и валидацией, claims с механизмом, неуниверсальные формулировки и неповторяющиеся строки таблиц. Если lint падает, Notion/Figma/external write запрещен до исправления источников, шаблонов или export.
- До внешней записи подготовь `publication plan` и dry-run/preview: exact target, mode, source artifacts, checksum, block count, unsupported blocks и expected writes.
- В конце `01-research` используй интерактивный approval request: `yarn workflow:approval-request outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human --reason "Публикация research pack в Notion"`. Если TTY недоступен, задай отдельный заметный вопрос в чате и затем запиши `workflow:approve` или `workflow:deny`.
- До публикации выбери Notion layout strategy:
  - `flat_child_page` разрешен только для коротких export до 120 blocks и до 6 крупных разделов;
  - `hub_with_child_pages` обязателен для подробного research pack, если ожидается больше 120 blocks, больше 6 крупных разделов или есть CJM/competitive/personas/interviews/SWOT/backlog/roadmap в одном export;
  - `database_index` используется для рабочих сущностей, которые нужно фильтровать/сортировать: personas, user stories, backlog, risks, opportunities, sources, interview insights;
  - `integrated_hybrid` обязателен для подробных Notion workspace-публикаций, где одновременно есть narrative child pages и рабочие базы: каждая database_index должна быть встроена linked database view в релевантную смысловую child page, а не жить только отдельной базой рядом;
  - для полного research по умолчанию используй `hub_with_child_pages`: главная страница с краткой навигацией + дочерние страницы по разделам.
- Dry-run подробной Notion-публикации обязан включать `notion_data_shape_plan`: выбранный layout, список child pages, table blocks, `database_index_candidates`, schema preview для сущностей, idempotency strategy и учет лимитов API. Если personas/CJM/opportunities/validation/sources нужны для сортировки, фильтрации, повторного обновления или связей, публикуй их как database_index/integrated_hybrid после отдельного approval, а не только как prose/table block.
- Для `integrated_hybrid` действует **Combined Notion Workspace Gate**: page narrative и database_index не должны расходиться по разным местам без связи. Персоны встраиваются в страницу персон, CJM frictions — в CJM/user-flow страницу, opportunities/backlog — в roadmap/ICE/RICE страницу, requirements/user stories — в PRD/requirements страницу, validation claims и sources — в validation/source страницу. Если сущность не имеет подходящей child page, создай или сгруппируй смысловую страницу вместо отдельной микространицы. После записи fetch/metadata verification обязан подтвердить inline linked database views на целевых страницах; без этого Notion surface получает `partial`.
- Для `Publication Editor Pass` используй GitHub-inspired docs-as-source принцип: локальные artifacts и publication records остаются source of truth, а Notion public hub получает только curated workspace content. Служебный trace пишется в `notion-publication-result.md`, `stage-gate-ledger.md` и `release-notes.md`, а не в пользовательские страницы.
- Для `hub_with_child_pages` действует micro-page gate: целевой диапазон 6-12 дочерних страниц; не создавай отдельную страницу для короткого блока меньше 8-10 Notion blocks, одной служебной секции или одного короткого вывода. Такие блоки группируй в крупную смысловую страницу. Toggle/drawer используй выборочно: не сворачивай короткие блоки до 15 blocks, если они читаются inline; сворачивай длинные reference lists, validation details и повторяемые карточки инициатив/задач.
- Публикуй только человекочитаемый research pack: короткие документы можно в отдельную child page, подробные research pack — через hub page + child pages.
- Markdown должен быть преобразован в структурированные Notion blocks через MCP/tool/converter; нельзя публиковать весь export одним raw code block.
- При повторной публикации используй idempotency strategy: existing child page/export marker/source checksum или явную versioning strategy.
- При Notion API записи учитывай request limits: append children чанками до 100 blocks и `429` через `Retry-After`/backoff. Для `hub_with_child_pages` можно использовать `tooling/scripts/publish-notion-research-hub.mjs <parent-page> <research-export-md> "<hub-title>"`.
- Не публикуй workflow dump, schema/frontmatter, machine-readable payloads, code-block копии артефактов, frontend/release/log files.
- Если approval, `NOTION_TOKEN`, parent page или права недоступны, зафиксируй `blocked`/`partial` в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `release-notes.md`.
- Не завершай полный workflow как `success`, если Notion research page пропущена молча. Финальный workflow должен иметь Notion research page publication record или явный blocker/partial.

## 5. Visual Reference и Figma

Если пользователь дал screenshot, URL референса или просит «как этот сайт», задача считается reference-driven.

### Design System Strategy Gate

До `design-brief.md`, `screens.md`, Figma write или frontend implementation выбери и зафиксируй `design_system_mode`:

- `reuse`: существующая дизайн-система подходит продукту; используй ее variables/components без создания параллельных primitives.
- `extend`: foundation подходит, но нужны новые product-specific components/variants; каждое расширение имеет gap/reason и не ломает существующий contract.
- `product_specific`: продукту нужен самостоятельный визуальный язык; создай новую локальную систему из подтвержденных экранов и не наследуй A3 или другую библиотеку по умолчанию.
- `bespoke`: уникальная композиция важнее библиотеки; сначала создай экраны, а в компоненты выноси только доказанно повторяющиеся элементы.

Наличие A3 или другой готовой системы не обязывает использовать ее. Запрещено автоматически выбирать `reuse` только потому, что библиотека доступна. Решение должно учитывать характер продукта, аудиторию, brand separation, плотность, платформу, срок жизни интерфейса и цену поддержки. Результат выбора записывается в `design-brief.md`, `screens.md` и `figma-handoff-bundle.md`.

### Two-Pass Figma Build Gate

Для `product_specific`, `extend` и визуально рискованных задач Figma собирается в два прохода:

1. `visual_calibration`: 2-3 ключевых экрана, реальные visual references, сценарная иерархия, плотность, rhythm, copy fit и responsive direction. На этом проходе запрещено систематизировать макет ценой ухудшения композиции.
2. `systemization`: только после visual review создаются/уточняются variables, styles, component sets, properties, nested instances, Auto Layout, resizing и prototype links. Если systemization меняет утвержденную композицию, нужен screenshot comparison и deviation record.

Figma-макет не считается качественным только по числу components/variables/Auto Layout frames. Для `ready` одновременно нужны visual calibration evidence и structural evidence.

### Figma Make-like Product UI Gate

Когда пользователь просит `собери макеты`, `собери use cases`, `сделай экраны`, `собери flow`, `макеты в Figma` или аналогичный результат, целевой output — приближенный к реальному приложению UI, а не техническая схема. Работай как Figma Make: сначала продуктовая композиция и визуальное качество, потом техническая проверка.

Перед любым Figma/screen/write действием оркестратор обязан сначала направить задачу через `design` agent (`04-design`), если в текущем run нет свежего `design-brief.md`/`reference-analysis.md`, созданного под этот же запрос и эти же use cases. `design-generator`, `figma-screen-compiler`, `figma-handoff`, `figma-roundtrip`, `visual-layout-verifier` и прямой `use_figma` не имеют права быть первым владельцем задачи про макеты/use cases/flow. Они запускаются только downstream после решения design agent: визуальная гипотеза, LazyWeb evidence, design-system mode, reuse/extend/gap-компоненты и критерии app-like UI.

Обязательный порядок:

1. Собери visual evidence через Lazyweb/референсы по текущей тематике и платформе. Для мобильного приложения ищи именно mobile app screens/flows: dashboard/home, detail, payment/review, status, request/support, settings/access и другие релевантные состояния.
2. Прочитай use cases/scenario-user-flows и выбери главный app flow. Use cases должны стать пользовательскими экранами и переходами внутри приложения, а не плитками, таблицами, evidence map или техническим board.
3. В текущем Figma-файле проверь существующую дизайн-систему: components, variants, variables, text/effect styles, existing screens. Если компонент есть — используй его instance/API. Если не хватает одного компонента/variant/state — создай только этот gap и продолжай использовать все остальное существующее.
4. Сначала собери 1-3 полноценных product screens в реальном viewport с нормальной плотностью, иерархией, навигацией, CTA, состояниями и русским UI-copy. Только после визуального review расширяй flow.
5. Технические artifacts (`figma-layout-ir.json`, object inventory, node IDs, visual QA JSON, component matrix) являются внутренним контролем и не могут быть основным видимым deliverable. Их нельзя выносить на canvas как пользовательский результат без явного запроса.

Запрещено для такого запроса:

- создавать технические доски с мелкими экранами, labels, evidence notes, route arrows, metadata panels или проверочными таблицами вместо приложения;
- закрывать задачу как `ready/success`, если результат выглядит как wireframe, audit board, component inventory, shadcn-like reconstruction, service blueprint или схема для разработчика;
- использовать `reconstruct-from-contracts` как путь к product UI, если в файле есть дизайн-система или можно собрать UI из существующих components/styles;
- считать `screen_count`, отсутствие clipping/overlap, node inventory или `ready_allowed=true` достаточным доказательством качества интерфейса;
- создавать полный component kit или библиотеку ради одного недостающего элемента.

Минимальный визуальный acceptance для `ready`: скриншот должен выглядеть как реальный экран мобильного/веб-приложения выбранной тематики, с узнаваемой продуктовой иерархией, содержательным контентом, рабочими состояниями и компонентами выбранной DS. Если screenshot показывает техническую схему или пустые карточки, статус не выше `rejected_needs_redesign`, даже если все структурные проверки прошли.

Для `figma_board|product_ui|prototype` surface это фиксируется исполняемым контрактом: каждый screen в `figma-layout-ir.json` обязан иметь `ui_fidelity_target`, а `figma-visual-qa.json` после write обязан иметь `app_likeness_review`. Если `app_likeness_review.verdict != passed` или наблюдаются `technical_board|audit_board|wireframe|component_inventory|metadata_panel|route_map|generic_card_grid|empty_ui_shell`, `ready_for_review|ready` запрещен независимо от Auto Layout, node inventory, DS instances или отсутствия clipping.

### Primary App Flow Gate

Для `figma_board`, `product_ui`, `prototype` и `frontend` surface макет не считается приложением, если это только набор отдельных экранов. До `screens.md`, Figma write или frontend handoff нужно зафиксировать:

- primary user/job, trigger и entry point;
- главный пользовательский сценарий как route/transition map;
- для каждого экрана: вопрос пользователя, primary action, next state, success/completion evidence и error/recovery path;
- secondary entry/exit points и состояния `loading|empty|error|success|permission/disabled`, если они применимы;
- acceptance walkthrough: пошаговая проверка, что пользователь может пройти основной сценарий от входа до результата.

Если хотя бы P0-сценарий не проходит walkthrough, статус поверхности не выше `partial`, даже если визуально экранов много и они хорошо оформлены.

### Component Contract и Roundtrip Gate

Для каждого повторяемого или интерактивного компонента создай Component Contract Matrix:

`Figma component/property -> allowed values -> semantic variables -> React component/prop -> required states -> story/test/locator -> deviation`.

- Если Code Connect доступен по тарифу и доступам, используй его как основной production mapping.
- Если Code Connect недоступен, та же связь обязательна в `figma-handoff-bundle.md`, `screens.md` и `frontend-result.md`; зафиксируй `code_connect_status=unavailable|not_configured|skipped_with_reason`.
- Для `reuse|extend` используй выбранную систему из `design/figma/registry.json`: сначала локальный индекс `design/figma/<design-system-slug>/`, затем `yarn figma:audit --registry design/figma/<design-system-slug>/component-contracts.json` после изменения component sets или React API. Для A3 alias `yarn figma:audit:a3` допустим только при явно выбранном `selected_design_system_slug=a3-design-system`. Live-аудит со статусом `needs_revision|blocked` запрещает закрывать Figma roundtrip как `success` без deviation/waiver.
- Для `reuse|extend` действует **Reuse-First Component Rule**: перед созданием компонента проверь выбранную DS, локальный индекс, React components и уже существующие Figma component sets. Если подходящий компонент есть, используй его instance/API и не создавай параллельную версию. Если компонента или нужного variant/state нет, создай только точечное расширение для зафиксированного gap/reason; запрещено собирать полный набор компонентов или новую библиотеку только потому, что не хватает одного элемента.
- Для `reuse|extend` каждый Figma screen обязан использовать реальные instances выбранной DS там, где DS содержит подходящий компонент. Локальный component/wrapper допустим только для product-specific gap или composition вокруг DS instances; он не может заменять существующий DS component. `local_components_with_deviation` не является waiver и не дает `ready`: `visual-layout-verifier` должен показать `ds_instance_summary` с selected-DS sources, visible selected-DS instances, local wrapper count и missing required DS sources.
- Нельзя выдавать импорт DOM/screenshot в Figma за полноценную обратную синхронизацию. Такой импорт является только draft/evidence; финальная версия должна использовать variables, components и instances.
- Code -> Figma изменения разделяй на `token_change`, `component_api_change` и `screen_composition_change`. Не перерисовывай весь canvas, если достаточно patch существующих instances.
- Frontend, собранный по Figma, не может иметь статус `success` без frame/state -> route/story/component mapping, paired Figma/browser screenshots и behavior evidence для обязательных состояний.

Единый исполняемый SOP: `integrations/mcp/figma-canvas-write-guide.md`. Skill `figma-roundtrip` обязателен для Figma design system, Figma canvas write, Figma -> frontend и frontend -> Figma задач.

### Обязательный порядок reference-scan и Figma write

1. **Обязательный технический скан референса:** Перед созданием `reference-analysis.md` Claude ОБЯЗАН запустить команду сканирования референса (`yarn reference:scan <url> [slug]`).
   - Запрещено пропускать этот шаг или симулировать его прохождение фейковыми/старыми отчетами.
   - Если API-ключ `FIRECRAWL_API_KEY` не задан в `.env`, сканирование должно быть выполнено через локальный Playwright-сценарий (он работает без внешних API). Полученные скриншоты десктопа и мобильной версии референса должны быть физически сохранены в `reports/visual-review/` и детально проанализированы.
   - Игнорирование этого правила или использование старых/несвязанных скриншотов из папки отчетов считается критической ошибкой качества (Critical Quality Failure).
2. **Lazyweb Evidence Gate:** Для задач с UI-риском, конкурентными паттернами или запросом на визуализацию/дизайн сначала используй Lazyweb MCP/skills как evidence layer: `lazyweb-design` для optimize/improve/create product screen, `lazyweb-quick-search` для быстрых экранов и benchmark references, `lazyweb_search_ab_tests` только при явном запросе на monetization/A/B evidence. Старые имена `lazyweb-design-research`, `lazyweb-quick-references`, `lazyweb-design-improve`, `lazyweb-design-brainstorm`, `lazyweb-ab-test-research` являются retired aliases и не вызываются напрямую; их intent маршрутизируется в актуальные skills/tools. Если Lazyweb tools недоступны в текущей сессии, зафиксируй `skipped_with_reason=lazyweb_unavailable_reload_required` и продолжай через обычный reference scan/web research.
3. Создать `reference-analysis.md` на основе данных сканирования и Lazyweb evidence при наличии с section-by-section visual spec: hero/nav, фон, цвета, typography scale, spacing, layout grid, section order, cards, CTA, forms/controls, media, footer, mobile behavior, allowed/disallowed patterns.
4. Подготовить `design-brief.md` и `screens.md`, которые явно читают эту спецификацию и проходят Primary App Flow Gate для всех app/prototype/frontend/Figma surfaces.
5. Если требуется Figma canvas write, получить human approval и `write_allowed=true`; только после этого создавать/обновлять холст Figma по `integrations/mcp/figma-canvas-write-guide.md`.
   - Перед записью и перед финальным screenshot обязательно пройти Russian Publication Gate для видимого текста Figma: frame names, headers, labels, cards, chips и descriptions на русском; старые draft-фреймы должны быть обновлены, скрыты или явно помечены `superseded`.
6. После Figma write выполнить **Figma Surface Verification**: `get_metadata`/object inventory, `get_screenshot`, список созданных frame/node IDs, component/library grounding, Auto Layout/variables deviations и Russian Publication Gate result. Эта проверка является safety layer после визуальной сборки, а не заменой дизайна. Figma write без metadata + screenshot evidence считается `partial`/`blocked`, даже если canvas фактически создан; Figma write с хорошей metadata, но плохим UI screenshot считается `rejected_needs_redesign`.
7. До утверждения макетов пользователем frontend заблокирован.
8. Перед frontend handoff определить **Universal Source Pair Matrix** для текущей задачи:
   - `reference_to_figma`: обязателен, если есть внешний visual reference и Figma canvas write;
   - `figma_to_frontend`: обязателен, если frontend строится по Figma handoff или screen frames;
   - `reference_to_frontend`: обязателен для reference-driven frontend;
   - `spec_to_frontend_behavior`: обязателен, если есть prototype states, формы, навигация, ошибки или другие интерактивные сценарии.
   Для каждой пары фиксируй required yes/no, evidence, status и notes. Pixel diff — только один сигнал; он не заменяет structure/metadata/state/behavior checks.
9. После реализации выполнить **двустороннюю поблочную съёмку** — обязательно захватывать поблочные скриншоты ОДНОВРЕМЕННО с **референсного сайта** И **локальной реализации** с одинаковыми именами секций:
   - `reference-desktop-section-<name>.png` / `reference-mobile-section-<name>.png` — секции оригинального референса.
   - `local-desktop-section-<name>.png` / `local-mobile-section-<name>.png` — соответствующие секции локального сайта.
   - Запрещено ограничиваться только full-page скриншотами или скриншотами лишь одной стороны: без пары «референс → реализация» сверка невозможна.
   - Скрипт `tooling/scripts/capture-local-screenshots.mjs` ОБЯЗАН захватывать обе стороны в одном запуске.
10. После захвата парных скриншотов запустить `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` и сохранить `visual-diff-result.json`. Для URL-to-URL section review можно дополнительно запустить `yarn reference:section-diff <reference-url> <local-url> [output-dir] [--sections sections.json]`.
11. Зафиксировать результат в `visual-reference-review.md` с `Source Pair Matrix` и поблочным сравнением reference → Figma при наличии → frontend → status → corrections, ссылаясь на реальные пары скриншотов, Lazyweb evidence при наличии, Figma screenshot/node evidence при наличии и `visual-diff-result.json`.

Запрещено:

- Начинать frontend с общей интерпретации «в стиле».
- Заменять сверку фразой «похоже».
- Завершать reference-driven задачу как `success`, если есть нерешённые визуальные расхождения.
- Использовать шаблонные UI-библиотеки, предустановленные шаблоны или шаблонный стиль для целевых страниц и лендингов.
- Захватывать поблочные скриншоты только локального сайта без захвата соответствующих блоков референса — это делает сравнение невозможным (Critical Quality Failure).
- Считать Figma макет проверенным только по сообщению агента без `get_metadata`/object inventory и `get_screenshot`.
- Считать frontend проверенным по Figma/reference без парных screenshots, DOM/locator/behavior evidence или явного deviation.
- **Использовать заранее заложенные сетки и layout-паттерны (12-колоночный Bootstrap-grid, стандартные карточные шаблоны, типовые hero-секции), если задача reference-driven.** В reference-driven задаче единственный источник истины для layout, column counts, grid gaps, breakpoints, section order и aspect ratios — это сам референс, а не любые умолчания дизайн-систем или фреймворков. Агент ОБЯЗАН точно воспроизвести сетку референса, даже если она нестандартна, асимметрична или использует нетипичное число колонок.

По умолчанию интерфейсы собираются как bespoke UI: чистый кастомный CSS Grid / Flexbox без привязки к чужим колоночным системам. Tailwind-утилиты применяются только как инструмент записи значений из reference-analysis.md, а не как источник layout-решений.

## 6. Approval и внешние действия (детальные правила)

Human approval обязателен перед любым действием, где данные покидают локальную песочницу или меняется внешняя система:

- Notion publish/update;
- Figma canvas write/update;
- Git commit/push, если пользователь не запросил это действие явно в текущей задаче;
- deploy;
- изменение секретов;
- удаление данных;
- отправка внешних сообщений;
- подключение MCP с широкими правами.
- agentic `model_provider_call`, когда stage input покидает локальную песочницу и отправляется в model provider, кроме явно включенных non-blocking DeepSeek/Gemini advisory checks на `01-research`, где действует Research advisory rule.

Approval records ведутся через runtime gate. Матрица действий: `agent-pack/guardrails/approval-matrix.md`. Дополнительно permissions на уровне инструментов Claude Code настроены в `.claude/settings.json` (external write требует `ask`).

Если approval отсутствует или получен denial, stage получает `blocked`/`partial`, а причина фиксируется в артефактах. Не обходи approval локальной заменой, если workflow требует конкретный provider/API/MCP.

Approval matching строгий по `target`: targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request. Для agentic model-provider calls target имеет формат `openai_agents_sdk:<owner>:<stage-id>`.

**КРИТИЧЕСКИ ВАЖНО:** Агент НЕ имеет права молча пропускать отправку запросов на одобрение. Если требуется внешнее действие (например, выгрузка в Notion на этапе 01-research), агент обязан сначала использовать интерактивный approval request (`workflow:approval-request`) с exact target. Если TTY/интерактивный выбор недоступен, агент обязан явно задать отдельный заметный вопрос пользователю в чате: «Разрешить публикацию пакета исследований/Agile-задач в Notion?» и после ответа записать `workflow:approve` или `workflow:deny`. Запрещается тихо переводить этап в статус blocked/partial, не попытавшись сначала интерактивно запросить разрешение у человека в текущей сессии диалога.

**Interactive Question Gate:** Все approval-вопросы, provider opt-in, waiver, публикационные вопросы, Figma/Notion/deploy/git write confirmations и gate-вопросы, влияющие на статус workflow, должны быть интерактивными: сначала `workflow:approval-request`/runtime prompt с exact target, а если TTY недоступен — отдельный заметный вопрос в чате (используй `AskUserQuestion` tool) до выполнения действия. Нельзя трактовать общую фразу пользователя вроде «опубликуй», «давай», «продолжай», «сделай» как замену интерактивного approval, если workflow требует отдельный approval record или waiver. Исключение: явно включенные DeepSeek/Gemini advisory checks на `01-research` не являются отдельным provider opt-in вопросом и не блокируют readiness при сбое. После ответа пользователя агент обязан записать `workflow:approve`/`workflow:deny` либо явно зафиксировать waiver/denial в run ledger.

**Process Deviation Record:** Если агент выполнил внешнее действие, записал approval, пропустил provider/gate или изменил статус без требуемого интерактивного вопроса, это считается `process_deviation`. Агент обязан сразу зафиксировать нарушение в `stage-gate-ledger.md`, `handoff-bundle.md` и `release-notes.md` с action, exact target, фактическим действием, недостающим интерактивным шагом и remediation. Запрещено скрывать deviation или переписывать историю так, будто gate был пройден корректно.

Не заменяй требуемый источник на случайный аналог без согласования. Не обходи approval локальной заменой, если workflow требует конкретный provider/API/MCP.

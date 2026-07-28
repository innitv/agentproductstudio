# Контракт передачи между этапами

Этот документ фиксирует, кто владеет каждым этапом workflow, какие входы обязан прочитать агент и какие артефакты он передает дальше. Он дополняет исполняемый источник `runtime/typescript/workflow.manifest.ts`: если таблица ниже расходится с manifest, сначала обнови manifest, затем синхронизируй этот документ, `.agent.md`, шаблоны артефактов и тесты.

## Правило синхронизации

- `owner` в таблице должен совпадать с `workflowStages[].owner` и `routeTools.*.agent`.
- `Receives` должен совпадать с `routeTools.*.inputs` и frontmatter `required_inputs` соответствующего агента, кроме явно optional/reference-only inputs.
- `Produces` должен совпадать с `workflowStages[].requiredArtifacts`, `routeTools.*.outputs` и frontmatter `required_outputs`.
- Каждый созданный артефакт должен записывать `inputs_used`: реальные файлы и источники, которые были прочитаны, а не общий список желаемых inputs.
- `handoff-bundle.md` после каждого этапа должен перечислять completed artifacts, решения, assumptions, risks, open questions и next required artifact.
- `stage-gate-ledger.md` после каждого этапа должен фиксировать stage status, gate notes, validation state и blockers/deviations.
- Design/Figma/frontend handoff должен фиксировать `design_system_mode=reuse|extend|product_specific|bespoke`; наличие существующей системы не означает обязательный reuse.
- Design/Figma/frontend handoff по умолчанию идёт **без Figma** : витрина продуктового UI — Storybook в коде, токены — DTCG в `design/tokens/`. Figma-артефакты при этом не создаются и записи в ledger не требуют.
- Маршрут берётся из `run-state.json`, а не выводится по наличию `figma-layout-ir.json`, и не меняется задним числом после отработки `06-screens`/`08-frontend`.
- При работе по переданному Figma-файлу обязательны visual calibration до systemization, `figma-layout-ir.json` до Figma write, `figma-visual-qa.json` после write, Component Contract Matrix и frame/state -> route/story/component mapping.
- Если один агент владеет несколькими route/stage, как `qa-review`, его `.agent.md` обязан разделять stage-specific required inputs в тексте. Frontmatter `required_inputs` может быть union-контрактом, но runtime validation должна подтверждать, что каждый artifact из union достижим через хотя бы один route input/dependsOn/referenceInputs.

## Матрица этапов

| Этап | Владелец | Получает | Создает | Кто получает дальше |
|---|---|---|---|---|
| `00-intake` | `orchestrator` | `goal`, `context`, `constraints` | `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md` | Все этапы как исходный контекст и ledger. |
| `01-research` | `research` | `goal`, `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md`, `constraints`, `sources`, `source_policy` | `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | PRD, IA, design, copy, test bench, QA, Notion publication. |
| `02-prd` | `prd` | `recursive-brief.md`, полный research pack (`research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`), `handoff-bundle.md`, `goal`, `constraints` | `prd.md` | IA, design, copy, screens, prototype, frontend, test bench, QA, release. |
| `03-ia` | `ia` | `recursive-brief.md`, `prd.md`, `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `handoff-bundle.md` | `ia-brief.md` | Design, screens, prototype, frontend, test bench, QA. |
| `04-design` | `design` | `prd.md`, `research-summary.md`, `scenario-user-flows.md`, `ia-brief.md` | `design-brief.md` с Design System Strategy; для reference profile также `reference-analysis.md` | Copy, screens, prototype, frontend, visual reference review, QA. |
| `05-copy` | `copywriting` | `recursive-brief.md`, `prd.md`, `design-brief.md`, `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `handoff-bundle.md` | `copy-deck.md` | Screens, prototype, frontend, QA. |
| `06-screens` | `design-generator` | `prd.md`, `ia-brief.md`, `design-brief.md`, `copy-deck.md` | `screens.md` с Component Contract Matrix и Frame/State Implementation Map; экран описывается как composition story (роут приложения), а не как отдельный «макет для витрины»; optional `design-loop-report.md`; | Prototype, frontend, visual reference review, QA. |
| `08-frontend` | `frontend` | `handoff-bundle.md`, `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`; при Figma handoff также `figma-layout-ir.json`, `figma-handoff-bundle.md`, `figma-visual-qa.json`; начиная с этого этапа использовать сжатый `handoff-bundle.md` | `frontend-result.md` с component/state mapping, visual QA gate summary и roundtrip deviations; **истории Storybook на каждый реализованный компонент и composition story на каждый экран** (`apps/frontend/src/**/*.stories.tsx`) плюс машинный вердикт приёмки (`yarn vr:test`, `yarn test-storybook`, `yarn qa:mobile`); `storybook-result.md` как отдельный файл optional — при его отсутствии state/variant coverage и вердикты записываются в `frontend-result.md` | Visual reference review, test bench, QA, release. |
| `09-visual-reference` | `qa-review` | `reference-analysis.md`, `design-brief.md`, `screens.md`, `frontend-result.md`, `reference_url`, `local_url`, `screenshots` | `visual-reference-review.md` | Test bench и QA в reference profile. Стадия по-прежнему сравнивает реализацию с **внешним референсом**; сверка с Figma в неё не входит. |
| `11-qa` | `qa-review` | `recursive-brief.md`, полный research pack, `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `frontend-result.md`, `stage-gate-ledger.md`, `handoff-bundle.md`; машинные вердикты приёмки (`reports/visual-regression/summary.json`, результат `yarn test-storybook`, `test-results/mobile-acceptance/mobile-acceptance.json`); для Figma surface также `figma-layout-ir.json`, `figma-handoff-bundle.md`, `figma-visual-qa.json`; для reference profile также `visual-reference-review.md` | `qa-report.md` — аудит опирается на машинные вердикты, а не на визуальный осмотр скриншотов | Release и финальный ответ оркестратора. |
| `12-release` | `release` | `qa-report.md`, `frontend-result.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `artifact-manifest.json`, `run-index.md`, `changed_files`, `validation` | `release-notes.md` | Финальный пакет и handoff пользователю. |

## Передача research

Research больше не передает downstream только краткую выжимку. Для любого полноценного исследования обязательны шесть файлов:

- `research-summary.md`: вопросы, аудитория, JTBD, findings, sources, validation plan.
- `scenario-user-flows.md`: реальная сценарная страница; P0/P1 флоу, состояния, исключения, доказательства и проверки.
- `competitive-analysis.md`: набор конкурентов, матрица сравнения и выводы.
- `proto-personas.md`: протоперсоны, decision context и validation plan.
- `synthetic-interviews.md`: явно синтетические интервью и patterns to validate.
- `swot.md`: SWOT и strategic notes.

Если есть `cjm-map.md`, `opportunity-roadmap.md`, `scenario-matrix.md`, `payment-method-matrix.md` или доменные аналоги, они становятся optional inputs для publication/QA, но не заменяют `scenario-user-flows.md`.

## Что получает downstream

- PRD получает не только факты и personas, но и конкретные флоу. Requirements `must/should` должны ссылаться на friction, документ, статус, деньги/ценность или проверку из `scenario-user-flows.md`, если такой сценарий есть.
- IA получает сценарии как основу sitemap, primary user flow, state map и decision/friction map.
- Design получает сценарии как evidence для visual direction, state coverage, trust/proof blocks и Surface Output Contract.
- Copywriting получает сценарии как источник пользовательских вопросов, возражений, microcopy, CTA и claims-to-validate.
- Test Bench получает сценарии как источник main funnel, analytics spec, executable checks и negative/edge paths.
- QA получает полный research pack и проверяет traceability chain от сценариев до requirements, screens, frontend и тестов.

## Передача витрины и приёмки (дефолт)

Дефолтный маршрут продуктового UI не проходит через Figma (CLAUDE.md §6.1). Передача выглядит так:

- **Design → Screens:** `design-brief.md` фиксирует `design_system_mode`; при умолчании `reuse` источник компонентов — shadcn/ui в коде (`apps/frontend/src/components/shadcn/`, `yarn shadcn add <component>`), а не Figma-библиотека. Список gap-компонентов передаётся отдельным перечнем.
- **Screens → Frontend:** экран описывается так, чтобы он собирался как composition story и роут одновременно. Две расходящиеся сборки одного экрана не передаются дальше.
- **Frontend → QA:** передаются истории (компонентные + `vr-page` composition) и три машинных вердикта: `yarn vr:test` → `reports/visual-regression/summary.json`, `yarn test-storybook` → exit code, `yarn qa:mobile` → `test-results/mobile-acceptance/mobile-acceptance.json`. Компонент без истории не считается сданным.
- **Токены:** источник правды — DTCG в `design/tokens/`, сборка `yarn tokens:build`. Стадии не передают друг другу значения цветов/размеров текстом — только имена токенов.
- **Ограничение среды:** `yarn vr:test`/`yarn vr:update` исполняются только внутри пиннутого Docker-образа Playwright. Эталон, снятый на Windows-хосте, на Linux не сравнивается, а создаёт новый файл — регрессия остаётся незамеченной. Недоступен Docker → `skipped_with_reason` и статус surface не выше `partial`, а не «проверено глазами».
- `storybook-result.md` остаётся machine-optional артефактом (`designEnhancementArtifacts` в `runtime/typescript/workflow.manifest.ts`); обязательна не форма файла, а наличие историй и вердиктов — они могут жить в `frontend-result.md`.

## Передача Figma ↔ frontend (когда Figma участвует)

Раздел применяется, когда пользователь дал Figma-файл и требуется canvas write или разовое извлечение токенов. Иначе он не применяется, и отсутствие Figma-артефактов пропуском не считается.

- Design выбирает `reuse|extend|product_specific|bespoke`; новая система под продукт является штатным результатом.
- Screens передает visual calibration verdict, `figma-layout-ir.json`, Component Contract Matrix и frame/state mapping.
- Figma handoff передает exact nodes/screenshots, variables/instances/resizing evidence, Code Connect/fallback status и `figma-visual-qa.json` после write.
- Frontend не создает параллельный primitive без `gap_reason` и возвращает React prop/state/test mapping.
- QA сравнивает не только pixels, но и IR route/zones/copy-fit, visual QA checks, properties, states, instances, bindings, behavior и accepted deviations.

## Передача во внешние поверхности

Notion/Figma/deploy/git write не являются обычным downstream. Перед внешней записью нужен exact approval, Russian Publication Gate и Write -> Verify -> Fix Gate. Для Notion research hub publication source set должен включать полный research pack, включая `scenario-user-flows.md`, а не только `research-summary.md`.

## Проверка контракта

После изменения workflow, агента или шаблона нужно выполнить минимальный набор:

```bash
yarn validate:config
yarn workflow:test-agent-metadata
yarn typecheck
```

Если менялись runner, sync или validator:

```bash
yarn workflow:test-validator
yarn workflow:test-agentic-engine
yarn workflow:test-agentic-executor
```

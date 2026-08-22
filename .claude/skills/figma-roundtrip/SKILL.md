---
id: figma-roundtrip
name: figma-roundtrip
title: "Figma Roundtrip Quality"
description: "Использовать для выбора reuse/extend/product-specific/bespoke стратегии, создания или обновления Figma design system, Figma canvas write, Figma-to-frontend и frontend-to-Figma передачи. Обеспечивает visual calibration до systemization, Component Contract Matrix, Code Connect/fallback mapping и paired verification."
platforms:
  - claude
mcp_servers:
  - figma
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
  - 08-frontend
  - 11-qa
required_inputs:
  - design_brief
  - screens
required_outputs:
  - figma_handoff_bundle
  - figma_layout_ir
  - figma_visual_qa
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
  - yarn typecheck
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Roundtrip Quality

## Применимость

**Skill применяется, только когда Figma реально в деле.** По решению от 2026-07-27 (`CLAUDE.md` §6.1, обоснование — `docs/architecture/storybook-figma-research-2026-07-27.md`) Figma сузилась до двух ролей: **дивергентный черновик** на `04-design` (дёшево ошибиться до кода) и **разовый показ человеку**. Обе — до кода или в сторону от него; постоянной синхронизации нет, Figma-кит компонентов студия не ведёт.

Что это меняет в самом roundtrip:

- **Дефолтный `design_system_mode` — `reuse` поверх shadcn/ui в коде** (`apps/frontend/src/components/shadcn/`), а не поверх Figma-библиотеки. Пункт 1 порядка ниже относится к случаю, когда Figma-DS действительно выбрана источником.
- **Направление «frontend → Figma» (пункт 10) больше не является каналом синхронизации.** Обратный патч допустим только как разовый показ человеку; расхождение кода и Figma после него — норма, а не дефект, и не блокирует код.
- **Токены не ходят по кругу.** Источник правды — `design/tokens/` (DTCG, `yarn tokens:build`); из Figma решения извлекаются один раз (`figma-token-extractor`), обратно не возвращаются.
- **Приёмка результата в коде — не через сверку с макетом:** `yarn vr:test`, `yarn test-storybook`, `yarn qa:mobile`. `figma-visual-qa.json` относится к Figma-поверхности, а не к коду.

## Нормативный источник

Перед действием прочитай `integrations/mcp/figma-canvas-write-guide.md`. Не дублируй его полную процедуру в run artifacts.

Для пользовательских макетов roundtrip работает в Figma Make-like режиме: сначала визуально правдоподобные product screens из текущей DS и референсов, затем systemization и verification. Node IDs, IR, inventory и QA JSON не являются пользовательским результатом.

## Порядок

1. Выбери `design_system_mode`: `reuse|extend|product_specific|bespoke`. Не выбирай `reuse` только из-за доступности библиотеки.
2. Если mode `reuse|extend`, выбери `selected_design_system_slug` из `design/figma/registry.json`. Если нужной ДС нет или индекс `partial|blocked`, сначала используй `figma-ds-ingest`.
2a. Для макетов на shadcn кит уже внесён — `shadcn-ui-community`, ingest не нужен. Он **не опубликован как библиотека**, поэтому требование шага 3a («собрано из реальных instances выбранной DS») выполняется только **внутри файла кита**: снаружи `importComponentByKeyAsync` даёт `not found`, проверено негативным контролем. Если задача требует собрать в отдельном проектном файле — это блокер уровня процесса, а не ошибка сборки: пользователь должен перенести кит в команду с платным планом и опубликовать. Фиксировать как `blocked` с этой причиной, а не подменять инстансы локальными копиями.
3. Для внесенной ДС сначала читай локальный индекс: `ds.config.json`, `foundation.md`, `components.md` и только нужные `components/<category>.md`. Не читай весь Figma файл, если индекс достаточен.
3a. Для `reuse|extend` screen surface должен быть собран из реальных instances выбранной DS. Локальные components допустимы только для отсутствующих product-specific gaps или wrappers вокруг DS instances; они не могут быть основной заменой DS. Если подходящий DS component существует, но агент создает локальный аналог, Figma readiness блокируется.
4. Для новой/расширяемой системы выполни `visual_calibration` на 2-3 ключевых экранах до создания component matrix. Если пользователь просит макеты, эти 2-3 экрана должны быть полноценными UI screens, а не technical mockups.
4a. Для Figma/product UI/prototype surface создай `figma-layout-ir.json` через `figma-screen-compiler` до write: route, zones, layout constraints, copy-fit, component sources, DS honesty и verification contract.
5. После visual verdict выполни `systemization`: variables/styles, component sets/properties, instances, Auto Layout/resizing и prototype links. Systemization не имеет права ухудшать screenshot или превращать UI в техническую схему.
6. Создай Component Contract Matrix для повторяемых и интерактивных компонентов.
7. **Code Connect нам недоступен — не трать на него шаги.** По состоянию на
   2026-07-27 официальная дока требует план Organization/Enterprise и полный
   Design/Dev Mode seat; проверять это заново на каждой задаче не нужно. Сразу
   фиксируй fallback: та же связь «компонент → React API» обязана жить в
   `figma-handoff-bundle.md`, `screens.md` и `frontend-result.md`, плюс
   `code_connect_status=unavailable|not_configured|skipped_with_reason`.
8. Для Figma write проверь exact target/approval, загрузи обязательный skill текущего `use_figma` tool и пиши небольшими idempotent patches: сначала настоящие product screens, затем только недостающие component gaps.
8a. После write запусти `visual-layout-verifier` и создай `figma-visual-qa.json`; readiness запрещен без passed/passed_with_notes gate. Passed structural QA не дает readiness, если human-visible screenshot выглядит как technical board, wireframe или audit artifact.
8b. Соблюдай textbook-канон — skill `/figma-ds:standard` (`plugins/figma-ds/skills/standard/SKILL.md`): три тиера токенов (primitive→semantic→component), role-based naming, modes на semantic, покрытие типов; component API (variant/boolean/text/instance-swap/slot); a11y (контраст AA≥4.5:1/non-text≥3:1, видимый focus, target ≥24px); versioning/статусы. Реализация в Plugin API и чек-лист после write — `/figma-ds:build`.
8c. Оформи presentation-слой (`/figma-ds:standard`, раздел Presentation): cover-страница (name/version/meta/оглавление), page-интро на каждой странице, документация ключевых компонентов (свойства/состояния/примеры). DS-deliverable без него — presentation не выше `passed_with_notes`.
9. Для Figma → frontend передай exact nodes/screenshots, state inventory, contracts и frame/state mapping.
10. Для frontend → Figma классифицируй patch как `token_change|component_api_change|screen_composition_change`; DOM/screenshot import считай только draft/evidence.
11. Проверь structural, visual и behavioral evidence. Visual regression после systemization блокирует `ready`.

### Reuse-First Component Rule (режимы `reuse`/`extend`)

Перед созданием компонента проверь выбранную DS, локальный индекс, React-компоненты и уже существующие Figma component sets. Подходящий есть — используй его instance/API, параллельную версию не создавай. Нет нужного variant/state — создай ТОЛЬКО точечное расширение под записанный gap. Собирать полный набор компонентов или новую библиотеку из-за одного недостающего элемента запрещено.

Каждый Figma screen обязан использовать реальные instances выбранной DS там, где DS содержит подходящий компонент. Локальный wrapper допустим для product-specific gap или композиции вокруг DS instances, но не как замена существующего компонента. `local_components_with_deviation` — не waiver и `ready` не даёт: `visual-layout-verifier` обязан показать `ds_instance_summary` с источниками выбранной DS, числом видимых instances, числом локальных wrapper и списком недостающих источников.

**Аудит контрактов на Figma-маршруте.** Если источником DS является Figma-библиотека, зафиксируй `selected_design_system_slug` из `design/figma/registry.json`, работай сначала по локальному индексу `design/figma/<slug>/`, а после изменения component sets или React API прогони `yarn figma:audit --registry design/figma/<slug>/component-contracts.json`. Live-аудит со статусом `needs_revision|blocked` запрещает закрывать roundtrip как `success` без deviation/waiver.

🔴 **По умолчанию (`reuse` shadcn/ui в коде) реестр не используется:** выбранная система — `apps/frontend/src/components/shadcn/`, её аудит — `yarn tokens:check`, `yarn test-storybook`, `yarn vr:test`. Запись `shadcn-ui-community` в реестре этого не меняет: Figma-кит нужен, когда задача требует макетов, и источником правды о составе и поведении компонентов не является — им остаётся код. Требовать `selected_design_system_slug` или `figma:audit` без Figma-работы запрещено: там нечего аудировать.

## Минимальный output

- выбранный mode и rationale;
- selected design-system slug или reason `none`;
- локальный DS index paths или ingest blocker;
- visual calibration verdict/evidence;
- `figma-layout-ir.json` status;
- Component Contract Matrix или ссылка на нее;
- selected-DS instance evidence count и local wrapper count;
- Code Connect/fallback status;
- frame/state → route/story/component mapping;
- `figma-visual-qa.json` gate result and paired screenshot status;
- presentation-слой: cover-страница, page-интро, документация ключевых компонентов — или presentation blocker;
- deviations с owner/follow-up.

Failure mode: если результат можно описать как "техническая картинка", "маленькие экраны на доске", "компонентная матрица" или "схема use cases", статус должен быть `rejected_needs_redesign`, даже при корректных node IDs и отсутствии clipping.

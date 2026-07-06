---
id: figma-screen-compiler
name: figma-screen-compiler
title: "Figma Screen Compiler"
description: "Использовать, когда Figma/product UI/prototype surface нужно собрать или обновить из screens и design-контекста: компилирует спецификации экранов в figma-layout-ir.json, применяет route/component/layout constraints и блокирует готовность к Figma write, если отсутствуют IR, DS honesty, copy-fit или visual QA требования."
platforms:
  - claude
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
required_inputs:
  - screens
  - design_brief
  - copy_deck
required_outputs:
  - figma_layout_ir
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
  - yarn workflow:test-skill-metadata
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Screen Compiler

## 1. Назначение

Применяй этот skill перед любым Figma canvas write для `figma_board`, `product_ui` или `prototype`, если результат должен быть похож на приложение, а не на набор декоративных страниц.

Нормативный источник — `integrations/mcp/figma-canvas-write-guide.md`: §3 (Two-Pass Build), §4 (Component Contract Matrix / DS Instance Enforcement) и §12 (textbook-канон: тиеры токенов, component API/slots/states, a11y). IR обязан отражать эти требования; сам write выполняется через `figma-roundtrip`/`figma-handoff`.

Skill превращает `screens.md` и дизайн-контекст в `figma-layout-ir.json`: компактный machine-readable контракт для route, screens, zones, layout constraints, component sources, copy-fit и verification contract. IR — внутренний guardrail, а не макет и не canvas deliverable.

Если пользователь просит макеты/use cases/flow, этот skill обязан поддержать Figma Make-like результат: приближенные product UI screens в реальном viewport. Запрещено превращать IR в видимую техническую доску, таблицу зон, node inventory или набор мелких карточек.

## 2. Обязательные inputs

- `screens.md`: Primary App Flow Gate, screen list, states, component inventory.
- `design-brief.md`: visual direction, design_system_mode, visual evidence grounding.
- `copy-deck.md`: CTA, labels, microcopy and long-copy constraints.
- `design/figma/registry.json` и выбранный DS index, если `design_system_mode=reuse|extend`.
- `figma-handoff-bundle.md`, если уже есть target file/page/node.

## 3. Процедура

1. Прочитай входы и выпиши `inputs_used`.
2. Определи `surface`, `design_system.mode`, `selected_slug` и `reuse_honesty`.
3. Если заявлен `reuse|extend`, каждый screen обязан иметь хотя бы один `design_system_component` source из выбранного `selected_slug`; локальные компоненты допускаются только как documented product gaps и не заменяют DS source.
3a. Если выбранная DS содержит подходящий компонент, но IR предлагает локальный wrapper вместо DS component instance, ставь `reuse_honesty=blocked`, а не `local_components_with_deviation`.
3b. `local_components_with_deviation` допустим только когда в IR уже есть реальные `design_system_component` sources и локальный компонент является wrapper/composition вокруг DS instances или закрывает явно отсутствующую молекулу.
4. Скомпилируй P0 route: каждый step обязан иметь `screen_id`, `primary_action`, `next_state`, `completion_evidence` и recovery path по применимости.
5. Для каждого screen запиши zones, priorities, max text lines, overflow behavior, min row height, touch target, bottom nav behavior, no-clip/no-overlap constraints и `ui_fidelity_target`: какой реальный app pattern должен получиться на screenshot, какие evidence/reference его калибруют и какие prohibited patterns (`technical_board`, `audit_board`, `wireframe`, `component_inventory`, `metadata_panel`, `route_map`, `generic_card_grid`, `empty_ui_shell`) сразу блокируют readiness.
6. Для каждого повторяемого component запиши `stable_id`, source, resize contract, required states и deviation.
7. Запиши `verification_contract`: обязательные screenshots, object inventory, route walkthrough и visual QA.
8. Если IR не может быть собран без выдумывания product logic или copy, верни `partial|blocked`; не переходи к Figma write.
9. Если IR описывает только техническую проверку, component matrix или route labels без полноценной UI-композиции, верни `blocked_for_ui_redesign`; не передавай это в Figma write как макет.

## 4. Evidence и failure modes

Обязательный output: `figma-layout-ir.json` по `agent-pack/schemas/figma-layout-ir.schema.json`.

Блокируй readiness, если:

- screens являются набором страниц без P0 route;
- нет copy-fit constraints для длинного русского текста;
- DS reuse/extend заявлен, но нет реальных `design_system_component` sources по выбранной DS;
- локальные components заменяют выбранную DS вместо того, чтобы быть wrapper/gap вокруг DS instances;
- нет `verification_contract.visual_qa_required=true`;
- screen zones не отражают user question, primary action и next state.
- `ui_fidelity_target` отсутствует или допускает технический board вместо product screen;
- IR может пройти `screen_count`/copy-fit, но screenshot результата не будет похож на реальное приложение.
- app-likeness нельзя доказать будущим обещанием: нужен screenshot acceptance criterion до write и `app_likeness_review` после write.

## 5. Validation gates

- [ ] `figma-layout-ir.json` создан или blocker записан.
- [ ] Route содержит минимум один P0 walkthrough.
- [ ] Every screen has zones and layout constraints.
- [ ] Every repeated component has source and resize contract.
- [ ] For `reuse|extend`, every screen declares selected-DS component sources; local wrappers have gap reasons and do not outvote DS evidence.
- [ ] Verification contract requires screenshots and visual QA.
- [ ] IR explicitly blocks technical boards as deliverables and requires product UI screenshot review.

---
id: figma-screen-compiler
name: figma-screen-compiler
title: "Figma Screen Compiler"
description: "Use when a Figma/product UI/prototype surface must be built or updated from screens/design context: compile screen specs into figma-layout-ir.json, enforce route/component/layout constraints, and block Figma write readiness when IR, DS honesty, copy-fit, or visual QA requirements are missing."
platforms:
  - codex
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

Skill превращает `screens.md` и дизайн-контекст в `figma-layout-ir.json`: компактный machine-readable контракт для route, screens, zones, layout constraints, component sources, copy-fit и verification contract.

## 2. Обязательные inputs

- `screens.md`: Primary App Flow Gate, screen list, states, component inventory.
- `design-brief.md`: visual direction, design_system_mode, visual evidence grounding.
- `copy-deck.md`: CTA, labels, microcopy and long-copy constraints.
- `design/figma/registry.json` и выбранный DS index, если `design_system_mode=reuse|extend`.
- `figma-handoff-bundle.md`, если уже есть target file/page/node.

## 3. Процедура

1. Прочитай входы и выпиши `inputs_used`.
2. Определи `surface`, `design_system.mode`, `selected_slug` и `reuse_honesty`.
3. Если заявлен `reuse`, но нет component source для реальных DS components/instances, ставь `reuse_honesty=blocked` или `local_components_with_deviation`.
4. Скомпилируй P0 route: каждый step обязан иметь `screen_id`, `primary_action`, `next_state`, `completion_evidence` и recovery path по применимости.
5. Для каждого screen запиши zones, priorities, max text lines, overflow behavior, min row height, touch target, bottom nav behavior, no-clip/no-overlap constraints.
6. Для каждого повторяемого component запиши `stable_id`, source, resize contract, required states и deviation.
7. Запиши `verification_contract`: обязательные screenshots, object inventory, route walkthrough и visual QA.
8. Если IR не может быть собран без выдумывания product logic или copy, верни `partial|blocked`; не переходи к Figma write.

## 4. Evidence и failure modes

Обязательный output: `figma-layout-ir.json` по `agent-pack/schemas/figma-layout-ir.schema.json`.

Блокируй readiness, если:

- screens являются набором страниц без P0 route;
- нет copy-fit constraints для длинного русского текста;
- DS reuse заявлен, но не подтвержден component source/instance strategy;
- нет `verification_contract.visual_qa_required=true`;
- screen zones не отражают user question, primary action и next state.

## 5. Validation gates

- [ ] `figma-layout-ir.json` создан или blocker записан.
- [ ] Route содержит минимум один P0 walkthrough.
- [ ] Every screen has zones and layout constraints.
- [ ] Every repeated component has source and resize contract.
- [ ] Verification contract requires screenshots and visual QA.

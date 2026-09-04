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

## Когда включается

Только работа по переданному Figma-файлу: canvas write для `figma_board`,
`product_ui` или `prototype`, когда результат должен быть похож на приложение,
а не на набор декоративных страниц.

🔴 **В большинстве задач этот skill не запускается.** По `CLAUDE.md` §6.1 Figma
сузилась до дивергентной фазы на `04-design` и разового показа человеку: экран
собирается сразу в коде, а его контракт — composition story плюс приёмка
`yarn vr:test` / `yarn test-storybook`. IR — guardrail перед Figma write и ни
для чего другого не нужен.

## Что производит

`figma-layout-ir.json` по схеме `agent-pack/schemas/figma-layout-ir.schema.json`
— машиночитаемый контракт route, screens, zones, layout constraints, component
sources, copy-fit и verification. Это внутренний guardrail, а не макет и не
deliverable: превращать IR в видимую техническую доску, таблицу зон, node
inventory или набор карточек запрещено.

## Что блокирует готовность

- screens — набор страниц без P0 route;
- нет copy-fit constraints для длинного русского текста;
- заявлен DS `reuse|extend`, но нет реальных `design_system_component` sources
  по выбранной DS, либо локальные компоненты подменяют её вместо того, чтобы
  быть wrapper вокруг DS instances;
- нет `verification_contract.visual_qa_required=true`;
- zones не отражают вопрос пользователя, главное действие и следующее состояние;
- `ui_fidelity_target` отсутствует или допускает технический board вместо
  product screen;
- IR проходит формальные проверки, но скриншот результата не будет похож на
  приложение. App-likeness нельзя доказать обещанием: нужен критерий приёмки по
  скриншоту до write и `app_likeness_review` после.

Собрать IR нельзя без выдумывания product logic или copy — статус
`partial|blocked`, к Figma write не переходить. IR описывает только техническую
проверку или матрицу компонентов — `blocked_for_ui_redesign`.

## Детали

Полные inputs, процедура из девяти шагов и чек-лист приёмки —
`references/ir-contract.md`. Нормативные источники: процесс студии
`integrations/mcp/figma-canvas-write-guide.md` §3-4 и канон
`/figma-ds:standard`. Сам write выполняется через `figma-roundtrip` /
`figma-handoff`.

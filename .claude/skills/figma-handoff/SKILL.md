---
id: figma-handoff
name: figma-handoff
title: "Figma Handoff Bundle"
description: "Использовать, когда пользователь просит Figma design system или canvas write. Skill создает figma-handoff-bundle.md — текстовый foundation/components/screens contract — перед любым approval-gated Figma MCP write."
platforms:
  - claude
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
required_inputs:
  - style_guide
  - design_brief
  - screens
  - figma_layout_ir
required_outputs:
  - figma_handoff_bundle
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Handoff Bundle

## Когда включается

Только когда работа идёт в Figma: человек просит макет в Figma либо предстоит
показ результата человеку в ней. По `CLAUDE.md` §6.1 Figma сузилась до
дивергентной фазы на `04-design` и разового показа; Figma-кит компонентов не
ведётся, синхронизации с кодом нет. Маршрут читается из `run-state.json`, а не
выводится по наличию файлов.

🔴 **Handoff не является предусловием frontend.** Код собирается из
`design/tokens/` и shadcn; bundle описывает Figma-поверхность и только её.

🔴 **`design_system_mode` по умолчанию решается в пользу shadcn/ui в коде**, а
не Figma-библиотеки. Ветка про `selected_design_system_slug` и локальный индекс
работает лишь тогда, когда Figma-DS действительно выбрана источником.

## Что производит

`figma-handoff-bundle.md` — текстовый контракт foundation / components /
screens, который пишется до записи в Figma. Работает в паре с
`figma-roundtrip`: сначала стратегия и визуальная калибровка, затем
систематизация, затем этот контракт и approval, и только потом MCP write.

## Что блокирует

- нет `figma-layout-ir.json` для поверхности `figma_board|product_ui|prototype`
  — сначала `figma-screen-compiler`, write без IR запрещён;
- нет локального индекса выбранной DS — сначала `figma-ds-ingest`;
- для `extend|product_specific` нет вердикта визуальной калибровки по двум-трём
  ключевым экранам;
- при `reuse|extend` экраны собраны в основном из локальных компонентов агента:
  локальный компонент допустим только как wrapper или закрытие gap с явной
  причиной и не заменяет источник из DS;
- не пройден Russian Publication Gate: весь видимый текст в Figma, включая
  имена фреймов, заголовки, подписи, карточки и чипы, обязан быть на русском;
- нет approval и `write_allowed=true`, недоступен `use_figma` или нет прав на
  запись — статус `partial`/`blocked`, запись не имитировать.

🔴 **Закрывать handoff как `ready` запрещено, если скриншот показывает
технический board, пустые карточки, матрицу компонентов или audit layout
вместо интерфейса заявленной тематики.** Пользовательский canvas — это экраны
приложения, а не спецификация; технический слой остаётся внутренним.

## Детали

Процедура записи из десяти шагов, стратегия раскладки canvas и полный состав
evidence после write — `references/write-procedure.md`. Нормативный источник —
`integrations/mcp/figma-canvas-write-guide.md`.

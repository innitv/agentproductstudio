---
id: figma-handoff
name: figma-handoff
title: "Figma Handoff Bundle"
description: "Использовать, когда пользователь просит Figma design system или canvas write. Создает figma-handoff-bundle.md перед любым approval-gated Figma MCP write."
platforms:
  - codex
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
required_outputs:
  - figma_handoff_bundle
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Handoff Bundle

## Назначение

Готовит текстовый foundation/components/screens bundle перед любой записью в Figma. Сначала текст и approval, только потом MCP write.

## Процедура

1. Прочитай `STYLE_GUIDE.md`, `design-brief.md`, `screens.md` и при наличии `design-loop-report.md`.
2. Подготовь primitive variables, semantic aliases, text styles, paint/effect styles, components и screen list.
3. Определи canvas strategy:
   - отдельные frames на странице, если это полноценная дизайн-доска;
   - target frame, если пользователь явно просит вписать результат в конкретное место;
   - component/foundation frames отдельно от screen frames;
   - не вписывать все в один frame только потому, что пользователь дал ссылку на anchor.
4. Проверь существующую дизайн-систему: `search_design_system`, libraries, variables, styles, components. Если assets найдены, импортируй/используй их вместо ручного пересоздания.
5. Запиши `figma-handoff-bundle.md` по `agent-pack/artifacts/design/figma-handoff-bundle.template.md`.
6. Выполни Russian Publication Gate до Figma write:
   - весь видимый текст в Figma, включая frame names, headers, labels, cards, chips, table headers и descriptions, должен быть на русском;
   - английский допускается только для технических терминов без удачного русского аналога (`API`, `MCP`, `SDK`, `P0`, `RICE`, `BNPL`, `CJM`, `workflow`, `node id`);
   - испанский и другие посторонние языки запрещены;
   - старые draft-фреймы должны быть обновлены, скрыты или явно помечены `superseded`, если не соответствуют актуальному research pack.
7. Запроси human approval на Figma write и проверь `write_allowed=true`.
8. Перед write убедись, что доступен official remote `use_figma`; локальный Figma Dev Mode MCP может быть read-only.
9. Выполняй write малыми шагами:
   - write-check или non-destructive probe;
   - foundation/components;
   - screen frames;
   - screenshot verification;
   - polish pass;
   - update handoff status and node IDs.
10. Если approval отсутствует, `use_figma` недоступен или нет edit прав, верни `partial`/`blocked`; не имитируй запись в Figma.

## Evidence

После записи в Figma зафиксируй в `figma-handoff-bundle.md`:

- target file и target node/anchor;
- созданные frame names и node IDs, если доступны;
- использованные libraries/components или причину `none_found`;
- результат `get_screenshot` или другую визуальную проверку;
- Russian Publication Gate status;
- известные visual gaps и следующий gate для human visual review.

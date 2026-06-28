---
id: visual-layout-verifier
name: visual-layout-verifier
title: "Visual Layout Verifier"
description: "Use after Figma screen creation or systemization to verify screenshots/object inventory against figma-layout-ir.json: detect clipped text, overlap, unsafe top/bottom areas, density/hierarchy problems, DS instance dishonesty, route incoherence, and systemization regressions before marking a mockup ready."
platforms:
  - codex
mcp_servers:
  - figma
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 06-screens
  - 08-frontend
  - 11-qa
required_inputs:
  - figma_layout_ir
  - figma_handoff_bundle
required_outputs:
  - figma_visual_qa
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
  - yarn workflow:test-skill-metadata
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Visual Layout Verifier

## 1. Назначение

Применяй после Figma write, calibration write или component systemization. Skill защищает от результата, который структурно выглядит правильным в слоях, но визуально разваливается: обрезанный текст, наезды, слабая плотность, неверная иерархия, отсутствие app route.

## 2. Обязательные inputs

- `figma-layout-ir.json`.
- `figma-handoff-bundle.md` с target file/page/node IDs.
- Figma screenshots по всем calibration screens и board.
- Object inventory или metadata по screen frames.
- Before/after screenshots, если была systemization.

## 3. Процедура

1. Проверь target: file key, page, board node, screen node IDs.
2. Сними или прочитай screenshot evidence для board и каждого required screen из IR.
3. Проверь object inventory:
   - подозрительно низкая высота text nodes;
   - text width меньше ожидаемой зоны;
   - screen/card clipping;
   - detached/local copies там, где IR требует DS instances.
4. Проверь screenshot вручную или инструментально:
   - safe area title/header;
   - overlap amount/subtitle/button/list rows;
   - bottom nav position;
   - visual hierarchy and density;
   - route coherence across screens.
5. Запиши `repair_actions`; если repair применялся, повтори screenshot evidence.
6. Сравни calibration/systemized screenshots. Если systemization ухудшила композицию, gate блокируется.
7. Запиши `figma-visual-qa.json`.

## 4. Evidence и failure modes

Обязательный output: `figma-visual-qa.json` по `agent-pack/schemas/figma-visual-qa.schema.json`.

`ready_allowed=false`, если:

- любой required screen имеет clipped text, overlap или unsafe header;
- нет screenshot evidence по required screens;
- DS reuse заявлен без real instances/imports/component mapping и без deviation;
- route walkthrough не читается из board/screens;
- visual regression после systemization не исправлен.

## 5. Validation gates

- [ ] Screenshot evidence есть для board и required screens.
- [ ] Checks cover text height, overflow, overlap, clipping, safe area, hierarchy, route coherence and DS honesty.
- [ ] Repair actions записаны.
- [ ] `gate_result.ready_allowed=true` только при `verdict=passed|passed_with_notes`.

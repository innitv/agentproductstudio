---
name: visual-layout-verifier
description: Использовать после создания Figma-экранов или systemization, чтобы проверить screenshots/object inventory против figma-layout-ir.json: обнаружить обрезанный текст, наезды, unsafe top/bottom зоны, проблемы плотности/иерархии, DS instance dishonesty, route incoherence и systemization-регрессии до отметки макета как ready.
---

# Visual Layout Verifier

Skill защищает от результата, который структурно выглядит правильным в слоях, но визуально разваливается: обрезанный текст, наезды, слабая плотность, неверная иерархия, отсутствие app route. Применяй после Figma write, calibration write или component systemization, сверяя screenshots с `figma-layout-ir.json`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/visual-layout-verifier/SKILL.md`](../../../agent-pack/skills/visual-layout-verifier/SKILL.md). Следуй ей.**

## Когда использовать
- После Figma write, calibration write или component systemization.
- Этапы 06-screens, 08-frontend, 11-qa перед отметкой макета как ready.
- Нужно проверить screenshots/object inventory против `figma-layout-ir.json`.
- Есть подозрение на обрезанный текст, наезды, DS instance dishonesty или route incoherence.

## Ключевые шаги
- Проверь target: file key, page, board node, screen node IDs.
- Собери Figma screenshots по всем calibration screens и board; object inventory/metadata по frames.
- Обнаружь clipped text, overlap, unsafe top/bottom зоны, проблемы density/hierarchy.
- Проверь DS instance honesty и route coherence.
- При systemization сравни before/after screenshots на регрессии; запиши `figma-visual-qa`.

## Обязательные проверки
- `yarn validate:config`
- `yarn workflow:test-skill-metadata`

---
name: figma-token-extractor
description: Использовать, когда design/frontend работа должна извлечь source-backed visual tokens из Figma-файла или node в design-brief. Skill отделяет read-only извлечение токенов от approval-gated Figma canvas writes, фиксирует token evidence и маппит значения в CSS variables только на этапе реализации.
---

# Figma Design Token Extractor

Skill извлекает visual tokens из Figma (styles, variables, выбранные nodes) как evidence для `design-brief.md` или frontend implementation. Read-only извлечение отделено от canvas write/update, который требует `figma_write` approval. Каждый токен фиксируется с исходными evidence fields.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-token-extractor/SKILL.md`](../../../agent-pack/skills/figma-token-extractor/SKILL.md). Следуй ей.**

## Когда использовать
- Workflow содержит Figma URL/file id/node id и нужно извлечь visual tokens.
- Нужны source-backed токены как evidence для `design-brief.md`.
- Frontend implementation требует значений токенов из Figma.
- Этапы 04-design или 08-frontend.

## Ключевые шаги
- Проверь Figma credentials/MCP и зафиксируй источник токенов; проверь, какие данные покидают проект.
- Считай styles, variables или выбранные nodes (read-only).
- Извлеки tokens с evidence fields: token name, source, значение.
- Маппи значения в CSS variables только если этап реализации это позволяет.
- Canvas write — отдельное действие, требует `figma_write` approval.

## Обязательные проверки
- `yarn validate:config`

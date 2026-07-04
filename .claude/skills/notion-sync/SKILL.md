---
name: notion-sync
description: Использовать, когда на этапе 01-research или 12-release нужна одобренная человеком публикация/экспорт research-only или PRD артефактов в Notion. Skill готовит читаемый notion_research_export_ru, запрашивает approval в чате, публикует только разрешенный контент и фиксирует blocked/partial состояния при отсутствии approval, token, parent page или permissions.
---

# Notion Research & PRD Sync

Skill управляет публикацией и экспортом research-only и PRD артефактов в Notion. Любая запись во внешний Notion требует human approval в текущем диалоге и доступных credentials — approval request нельзя молча пропускать. Готовит читаемый экспорт и фиксирует blocked/partial состояния.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/notion-sync/SKILL.md`](../../../agent-pack/skills/notion-sync/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 01-research: публикация research-only артефактов в Notion.
- Этап 12-release: экспорт PRD в Notion.
- Нужен человек-approval для внешней записи в Notion.
- Нужно зафиксировать blocked/partial при отсутствии approval, token, parent page, permissions.

## Ключевые шаги
- Собери входы: research-summary, scenario/flows, competitive analysis, personas, interviews, SWOT, PRD, approval-record.
- Подготовь читаемый `notion_research_export_ru` (или PRD export).
- Запроси approval в текущем чате; без approval не публикуй.
- Публикуй только разрешенный контент; проверь token, parent page, permissions.
- При нехватке условий зафиксируй blocked/partial состояние.

## Обязательные проверки
- `yarn notion:check`

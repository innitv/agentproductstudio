---
name: figma-ds-ingest
description: Использовать, когда нужно внести большую или новую Figma дизайн-систему в локальный индекс design/figma/<slug>/, чтобы дальше собирать макеты и frontend по Node ID без постоянного чтения всего Figma-файла. Также при выборе reuse/extend для незарегистрированной DS.
---

# Figma DS Ingest

Skill превращает большую Figma дизайн-систему в локальный индекс `design/figma/<design_system_slug>/`. Индекс держит компактную карту с Node ID, Variables, variant matrices и component profiles, чтобы агент не перечитывал Figma целиком при каждой задаче. Read-only операция.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-ds-ingest/SKILL.md`](../../../agent-pack/skills/figma-ds-ingest/SKILL.md). Следуй ей.**

## Когда использовать
- Пользователь дает новую Figma DS, UI kit, корпоративную библиотеку или community copy.
- Нужно выбрать `reuse|extend` для системы, не зарегистрированной в `design/figma/registry.json`.
- Нужно собрать экраны по реальным Figma components/instances, но локального индекса нет.
- Нужно обновить индекс после изменения библиотеки.

## Ключевые шаги
- Соблюдай Read-Only Gate: индексирование не пишет в Figma canvas.
- Считай Node ID, Variables, variant matrices и component profiles из Figma.
- Собери компактный локальный индекс в `design/figma/<slug>/`.
- Зарегистрируй/обнови DS в `design/figma/registry.json`.
- Зафиксируй результат в `design-brief.md`.

## Обязательные проверки
- `yarn validate:config`

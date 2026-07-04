---
name: style-decompose
description: Использовать на этапе 04-design для reference-driven или визуально рискованных задач, чтобы превратить визуальный референс в STYLE_GUIDE.md со слоем подачи/рендера, UI-структурой, явными токенами, композиционными метриками и анти-паттернами.
---

# Декомпозиция Стиля Референса

Skill разбирает визуальный референс в систему правил для `design-brief.md`, `screens.md`, frontend и QA — не "вдохновение", а декомпозиция стиля. Разделяет presentation/render слой и UI structure, фиксирует явные composition metrics и anti-patterns. Применяется после `reference-analysis.md`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/style-decompose/SKILL.md`](../../../agent-pack/skills/style-decompose/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 04-design для reference-driven задач.
- Высокий визуальный риск или требование точного соответствия референсу.
- Есть `reference-analysis.md` и scan evidence (без scan evidence — blocker).
- Нужно превратить стиль в токены и правила, а не в просьбу "сделай красиво".

## Ключевые шаги
- Прочитай `reference-analysis.md`, скриншоты/scan evidence и продуктовые артефакты.
- Отдели product intent от visual borrowing (что нужно, что разрешено, что запрещено как trade dress).
- Раздели стиль на Layer A (presentation/render) и Layer B (UI structure).
- Зафиксируй явные composition metrics: типо-шкала, веса, радиусы, отступы, shadow/light, density, breakpoints.
- Опиши разрешенные/запрещенные паттерны и anti-patterns; запиши `STYLE_GUIDE.md` с downstream notes.

## Обязательные проверки
- `yarn validate:config`

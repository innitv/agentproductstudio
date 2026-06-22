# Design Generator Prompt

## Статус

`draft|ready|partial|blocked`

## Использованные Входы

- `STYLE_GUIDE.md`
- `prd.md`
- `ia-brief.md`
- `copy-deck.md`
- `screens.md`, если идет итерация существующих экранов

## Контекст Продукта

Опишите реальный продукт, аудиторию, главное действие и количество экранов. Не выдумывайте третий продукт, если пользователь уже дал свой.

## Принципы Стиля

1.
2.
3.
4.
5.
6.

## Design System Strategy

- Mode: `reuse|extend|product_specific|bespoke`
- Existing foundation candidate:
- What must remain product-specific:
- What must not be inherited:
- Componentization threshold:

## Токены, Которые Нужно Сохранить

- Цвет:
- Типографика:
- Отступы:
- Радиусы:
- Тени/свет:
- Motion:

## Правила Компонентов

- Навигация:
- Hero:
- Карточки:
- Формы/controls:
- Data visualization:
- CTA:
- Footer:

## Правила Layout

- Desktop:
- Tablet:
- Mobile:
- Порядок секций:
- Поведение grid/columns:
- Auto Layout intent:
- Fixed / Fill / Hug rules:
- Min/max constraints:

## Правила Языка И Copy

- Язык UI:
- Claims, которых нужно избегать:
- Язык CTA:

## Делать

-

## Не Делать

-

## Figma Readiness

- Нужен Figma handoff: `yes|no`
- Canvas strategy recommendation: `separate_frames|target_frame|update_existing|component_library_only`
- Variables needed:
- Component sets needed:
- Auto Layout critical areas:
- Existing design system to search:
- Screens for first write pass:
- First pass: `visual_calibration` only, 2-3 screens
- Visual calibration verdict required before systemization: `yes`
- Screenshot comparison before/after systemization: `required`

## Запрос На Выход

Сгенерировать максимум 2-3 экрана для калибровки стиля. Вернуть desktop/mobile notes, состояния компонентов, Auto Layout intent, variables/component sets requirements и ограничения для реализации.

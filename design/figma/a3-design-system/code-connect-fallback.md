# Code Connect fallback mapping

## Статус

- Figma file: `4ufM1XdtXzSwbCNpulxETA` / A3 Design System.
- Code Connect: `unavailable_plan` — 22 июня 2026 года Figma API подтвердил требование Dev/Full seat в Organization/Enterprise.
- Source of truth для автоматической проверки: `component-contracts.json`.

Этот файл не выдаёт fallback за опубликованный Code Connect. Он сохраняет ту же связь Figma → React для агентов и handoff, пока тариф не позволяет создать mapping в Dev Mode.

## Pilot mappings

| Figma component | Figma property/state | React target | Правило |
|---|---|---|---|
| Button `213:183` | `size=xl|l|m|s` | `Button.size` | прямой enum mapping |
| Button `213:183` | `variant=primary|secondary|outline|ghost` | `Button.variant` | прямой enum mapping |
| Button `213:183` | `state=disabled` | `Button.disabled` | `true`; hover/pressed реализуются CSS-состояниями |
| Button `213:183` | `Label text`, `icon`, `action icon` | `children`, `leadingIcon`, `actionIcon` | text/slot mapping |
| Input `492:2765` | `size=l|m|s` | `Input.size` | прямой enum mapping |
| Input `492:2765` | `state=error|disabled` | `invalid`, `disabled` | boolean mapping; hover/focus — CSS/browser state |
| Input `492:2765` | `value=none|placeholder|filled` | `value/defaultValue/placeholder` | определяется фактическими input props, не отдельным `value` enum |
| Switch `608:662` | `size=s|xs` | `Switch.size` | прямой enum mapping |
| Switch `608:662` | `checked=false|true` | `checked/defaultChecked` | boolean mapping |
| Switch `608:662` | `label position=right|left` | `labelPosition` | `right|left` |
| Switch `608:662` | `state=disabled` | `disabled` | hover реализуется CSS-состоянием |
| Chips `234:38` | `variant=primary|secondary` | `Chip.variant` | прямой enum mapping |
| Chips `234:38` | `selected=false|true` | `Chip.selected` | boolean mapping + `aria-pressed` |
| Chips `234:38` | `state=disabled` | `Chip.disabled` | hover/pressed реализуются CSS-состояниями |
| InlineNotification `579:4735` | `colorScheme=info|success|warning|error` | `InlineNotification.colorScheme` | прямой enum mapping; опечатка `succes` исправлена и подтверждена live-аудитом 22 июня 2026 года |

## Правило публикации

После upgrade тарифа сначала повторно вызвать Code Connect suggestions/context для exact component properties, затем опубликовать только подтверждённые mappings. После публикации сменить `codeConnectStatus` на `connected`, добавить URL/record ID и повторно запустить `yarn figma:audit:a3`.

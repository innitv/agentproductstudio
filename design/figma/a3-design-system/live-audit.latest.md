# Live-аудит Figma component contracts

- Статус: `pass`
- Файл: `A3 Design System` (`4ufM1XdtXzSwbCNpulxETA`)
- Версия: `2368184558309241059`
- Последнее изменение Figma: `2026-06-23T07:16:41Z`
- Проверено: `2026-06-24T17:31:52.022Z`
- Code Connect: `unavailable_plan` (проверено 2026-06-22)
- Охват: 5 pilot-компонентов; найдено проблем: 0

## Результаты

| Component | Node | Variants | Status | Code source |
|---|---:|---:|---|---|
| Button | `213:183` | 64 | `pass` | `apps/frontend/src/components/ui/button.tsx` |
| Input | `492:2765` | 45 | `pass` | `apps/frontend/src/components/ui/input.tsx` |
| Switch | `608:662` | 24 | `pass` | `apps/frontend/src/components/ui/switch.tsx` |
| Chips | `234:38` | 16 | `pass` | `apps/frontend/src/components/ui/chip.tsx` |
| InlineNotification | `579:4735` | 4 | `pass` | `apps/frontend/src/components/ui/inline-notification.tsx` |

## Найденные расхождения

Расхождений в проверяемом pilot-наборе не найдено.

## Ограничения проверки

- Аудит проверяет live Figma node inventory, variant axes/values и наличие React export.
- Визуальная точность, variable bindings, Auto Layout/resizing, accessibility и browser parity требуют отдельных screenshot/plugin-context проверок.
- `unavailable_plan` означает, что Code Connect не был опубликован: Figma требует Dev/Full seat в Organization/Enterprise.

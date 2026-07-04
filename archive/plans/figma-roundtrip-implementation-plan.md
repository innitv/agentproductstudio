# План внедрения Figma roundtrip quality gates

Дата: `2026-06-22`

## Цель

Внедрить результаты аудита Figma ↔ frontend в нормативные инструкции, skills, agents, templates, schemas, runtime contracts и validators. Поддержать четыре равноправных режима дизайн-системы: `reuse`, `extend`, `product_specific`, `bespoke`.

## План

| Этап | Статус |
|---|---|
| Закрепить Design System Strategy Gate и двухпроходную сборку Figma в `AGENTS.md` | completed |
| Заменить устаревший canvas-write guide единым plugin-context roundtrip SOP | completed |
| Синхронизировать design/design-generator/frontend/QA agents и Figma/design skills | completed |
| Обновить design/frontend/QA templates и JSON schemas | completed |
| Обновить workflow manifest, stage handoff contract и config invariants | completed |
| Запустить metadata/config/typecheck/tests/docs validation и исправить расхождения | completed |
| Проверить доступность Code Connect для A3 Design System | completed — заблокирован тарифом Figma (`unavailable_plan`) |
| Создать machine-readable component registry и live-аудит Figma → React | completed |
| Запустить live-аудит pilot-компонентов и сохранить Markdown/JSON evidence | completed — после исправления `succes` → `success` получен `pass`, 5/5 компонентов, 0 расхождений |

## Definition of Done

- Новая продуктовая дизайн-система явно разрешена и не обязана наследовать A3.
- До Figma write выбран и записан `design_system_mode`.
- Visual calibration выполняется до systemization.
- Component Contract Matrix связывает Figma properties, React props, states, tokens, stories/tests и deviations.
- Figma-driven frontend нельзя закрыть как `success` без frame/state mapping и paired screenshot evidence.
- Правила закреплены validators/tests, а не только prose.

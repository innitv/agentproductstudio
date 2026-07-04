---
name: landing-builder
description: Использовать при реализации этапа 08-frontend для landing, console или product UI из одобренных PRD/IA/design/copy/screens/prototype артефактов. Skill собирает bespoke React/Vite/Tailwind UI, выводит стиль из design-артефактов или reference-analysis, сохраняет workflow gates и пишет frontend-result evidence.
---

# Bespoke UI Landing Builder

Skill реализует landing, console или product UI на React + Vite + Tailwind CSS из одобренных артефактов. Применяй только для 08-frontend, когда уже есть `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md` и `prototype-report.md`. Верстка живет в `apps/frontend/src/views/`, `App.tsx` остается тонким роутером.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/landing-builder/SKILL.md`](../../../agent-pack/skills/landing-builder/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 08-frontend для landing, console или product UI.
- Уже готовы PRD, IA, design-brief, screens, copy-deck, prototype-report.
- Нужен bespoke React/Vite/Tailwind UI со стилем из design-артефактов или reference-analysis.
- Нужно сохранить workflow gates и записать frontend-result evidence.

## Ключевые шаги
- Прочитай `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md` перед изменением кода.
- Для базового лендинга используй `LandingView.tsx`; для отдельного продукта — новый `<ProductName>View.tsx`; не смешивай с `ConsoleView.tsx`.
- Выведи стиль из design-артефактов или reference-analysis; используй финальные тексты из copy-deck.
- Реализуй экраны/секции и состояния из screens; сохрани workflow gates.
- Запиши `frontend-result.md` с локальным URL и командами запуска.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`

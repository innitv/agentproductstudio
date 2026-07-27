---
name: landing-builder
description: Использовать при реализации этапа 08-frontend для landing, console или product UI из одобренных PRD/IA/design/copy/screens/prototype артефактов. Skill собирает React/Vite/Tailwind UI: для product UI по умолчанию из компонентов shadcn/ui, bespoke — для лендингов с сильным визуальным характером и нестандартных интерфейсов; выводит стиль из design-артефактов или reference-analysis, сохраняет workflow gates и пишет frontend-result evidence.
---

# Bespoke UI Landing Builder

Skill реализует landing, console или product UI на React + Vite + Tailwind CSS из одобренных артефактов. Основа по умолчанию — shadcn/ui; bespoke — по характеру задачи (см. ниже). Применяй только для 08-frontend, когда уже есть `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md` и `prototype-report.md`. Верстка живет в `apps/frontend/src/views/`, `App.tsx` остается тонким роутером.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/landing-builder/SKILL.md`](../../../agent-pack/skills/landing-builder/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 08-frontend для landing, console или product UI.
- Уже готовы PRD, IA, design-brief, screens, copy-deck, prototype-report.
- Нужно сохранить workflow gates и записать frontend-result evidence.

## Выбор основы (до первой строки разметки)
- **Product UI, формы, таблицы, оверлеи — дефолт shadcn/ui** (`CLAUDE.md` §6.1): `yarn shadcn add <component>` в `apps/frontend/src/components/shadcn/`, дальше это код проекта.
- **Bespoke** — для лендинга с сильным визуальным характером и нестандартных интерфейсов (редактор, канвас, плотная таблица); требует обоснования по Design System Strategy Gate.
- Характер вкладывается в тему (цвет, гарнитура, фокус) и композицию. `--spacing` и шкалу радиусов shadcn не трогать.

## Ключевые шаги
- Прочитай `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md` перед изменением кода.
- Один экран — один файл: заводи новый `<ProductName>View.tsx`, а не переписывай чужой экран; маршрут добавляй и в список корневого указателя `StudioIndexView.tsx`.
- Выведи стиль из design-артефактов или reference-analysis; используй финальные тексты из copy-deck.
- Значения бери из `design/tokens/` (`yarn tokens:build`; для shadcn-темы — `design/tokens/shadcn/`, `yarn tokens:build`), а не из Figma-файла и не сырыми hex/px.
- Реализуй экраны/секции и состояния из screens; сохрани workflow gates.
- Заведи composition story для экрана (`ds-to-storybook`): витрина обязательна, а не опциональна.
- Запиши `frontend-result.md` с локальным URL, командами запуска и выбранной основой.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`

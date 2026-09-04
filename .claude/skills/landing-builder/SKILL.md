---
id: landing-builder
name: landing-builder
title: "Bespoke UI Landing Builder"
description: "Использовать при реализации этапа 08-frontend для landing, console или product UI из одобренных PRD/IA/design/copy/screens артефактов. Skill собирает React/Vite/Tailwind UI: для product UI по умолчанию из компонентов shadcn/ui, bespoke — для лендингов с сильным визуальным характером и нестандартных интерфейсов; выводит стиль из design-артефактов или reference-analysis, сохраняет workflow gates и пишет frontend-result evidence."
platforms:
  - open-code
  - claude
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 08-frontend
required_inputs:
  - prd
  - ia_brief
  - design_brief
  - screens
  - copy_deck
required_outputs:
  - frontend_result
approval_actions: []
validation_commands:
  - yarn typecheck
  - yarn build
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Bespoke UI Landing Builder

## Когда включается

Стадия `08-frontend`, когда уже есть `prd.md`, `ia-brief.md`, `design-brief.md`,
`screens.md`, `copy-deck.md`. Раньше этих артефактов фронтенд в полном workflow
начинать нельзя — исключение только явный `quick draft`.

Стек по умолчанию: React + Vite + Tailwind. Экраны живут в
`apps/frontend/src/views/`, один экран — один файл. Заводится новый
`<ProductName>View.tsx`, а не переписывается чужой; `App.tsx` остаётся тонким
роутером, и маршрут добавляется в `StudioIndexView.tsx` — иначе экран не увидит
никто, кроме исходников роутера.

## Выбор основы: shadcn по умолчанию

🔴 Решение владельца от 2026-07-27 (`CLAUDE.md` §6.1): для product UI дефолт —
компоненты shadcn/ui, а не вёрстка примитивов с нуля. Выбор делается до первой
строки разметки и записывается в `frontend-result.md`.

| Поверхность | Основа |
|---|---|
| app, консоль, формы, таблицы, оверлеи | shadcn/ui; свой код только на подтверждённый пробел |
| marketing/landing с сильным визуальным характером | bespoke композиция, но поля, кнопки и диалоги всё равно из shadcn |
| редактор, канвас, плотная таблица | bespoke с обоснованием в `design-brief.md` |

Bespoke без обоснования — не «характер», а лишняя работа и второй
непроверенный слой примитивов.

🔴 **Границы правки shadcn** (метод и числа — `design/tokens/shadcn/README.md`):
цвет, гарнитуру и кольцо фокуса менять смело, но через `design/tokens/shadcn/`
и `yarn tokens:build`, а не правкой значений в компоненте. `--spacing` и шкалу
радиусов не трогать: в Tailwind 4 от `--spacing` считаются все отступы и
высоты, сжатие даёт дробные пиксели и ломает ритм. Порталы (`SelectContent`,
`DropdownMenuContent`, `TooltipContent`, `sonner`) рендерятся вне контейнера
темы; тени Tailwind впечатаны константой и токеном не управляются.

Механика библиотеки, известные пробелы реестра и грабли — навык
`shadcn-library`.

## Чего не делать

Узнаваемый признак интерфейса, собранного без решения: фиолетово-синие
градиенты, одинаковые карточки, избыточный `rounded-2xl`, декоративные тени,
«hero card» без связи с продуктом. Дальше по списку: подставной текст, который
прячет реальные переносы; мозаика равных карточек вместо иерархии; сырые hex и
пиксели при наличии токенов; цвет как единственный индикатор статуса;
hover без клавиатурного эквивалента; дашборд, где все панели равны и не видно
главного действия.

## Детали

Входы, процедура реализации, архитектура компонентов, состав evidence и
чек-лист приёмки — `references/implementation.md`.

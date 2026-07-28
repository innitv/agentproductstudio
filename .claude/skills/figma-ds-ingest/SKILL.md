---
id: figma-ds-ingest
name: figma-ds-ingest
title: "Figma DS Ingest"
description: "Использовать, когда нужно внести большую или новую Figma дизайн-систему в локальный индекс design/figma/<slug>/, чтобы дальше собирать макеты и frontend по Node ID без постоянного чтения всего Figma-файла. Также при выборе reuse/extend для незарегистрированной DS."
platforms:
  - claude
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
  - 08-frontend
  - 11-qa
required_inputs:
  - run_plan
  - design_brief
required_outputs:
  - design_brief
approval_actions: []
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma DS Ingest

## Назначение

Превращает большую Figma дизайн-систему в локальный индекс `design/figma/<design_system_slug>/`. Индекс нужен, чтобы агент держал в контексте компактную карту с Node ID, Variables, variant matrices и component profiles, а не перечитывал Figma целиком при каждой задаче.

## Применимость

**Только когда источником DS выбрана именно Figma-библиотека.** По `CLAUDE.md` §6.1 дизайн-система по умолчанию — shadcn/ui в коде (`apps/frontend/src/components/shadcn/`), и её состав читается прямо из кода: индексы её компонентов **не заводить**, второй источник правды неизбежно разъедется (прецедент — `token-map.md`, описывавший 28% реальности). Ingest нужен там, где кода нет и Figma — единственный носитель системы: чужой UI kit, корпоративная библиотека, community copy.

🔴 **Кит shadcn/ui в Figma уже заингестен — не ингестить повторно.** `design/figma/shadcn-ui-community/` (file key `pCDj1p7ItjKJcXPJZDqXi6`, 2026-07-28): 172 компонента и сета с Node ID, ключами и матрицами вариантов, 47 семантических переменных в light/dark, 14 125 иконок счётчиками. Для макетов на shadcn в Figma читать этот индекс.

Отдельная ловушка: в `archive/design-systems/shadcn-ui-components-2026/` лежит индекс **этой же библиотеки, но другого файла** (community-оригинал `NUoNEuTJ3OZOGH2c780Z55`). ID страниц там совпадают с действующим китом, **Node ID компонентов — нет** (`Badge` `73:3479` против `665:2024`). Адресацию брать только из действующего индекса.

## Когда использовать

- Пользователь дает новую Figma DS, UI kit, корпоративную библиотеку или community copy — **которой ещё нет в `design/figma/registry.json`**.
- Нужно выбрать `reuse|extend` для системы, которая еще не зарегистрирована в `design/figma/registry.json`.
- Нужно собрать экраны по реальным Figma components/instances, но текущего локального индекса нет.
- Нужно обновить индекс после изменения библиотеки — по смене `version_id`/`lastModified` или ручному re-baseline, а не «на всякий случай».

## Read-Only Gate

Этот skill не пишет в Figma. Любой canvas write, создание Variables/components или изменение файла требует отдельного `figma_write` approval и выполняется через `figma-handoff` / `figma-roundtrip`.

## Рабочий Порядок

1. **Preflight**
   - Зафиксируй `design_system_slug`, Figma URL, source type и scope.
   - Проверь `design/figma/registry.json`.
   - Если slug уже есть, определи режим: `refresh|extend_index|inspect_only`.
   - Запиши `source.md`.

2. **Census First**
   - Сначала снимай только страницы, top-level types, ComponentSet/Component counts и Variable collections.
   - Не используй полный `get_design_context` на больших выделениях.
   - Не заходи в instance children.
   - Выход: `_scan/census.md`.

3. **Chunk Manifest**
   - Нарежь чтение на page/section/frame/window chunks.
   - Выход: `_scan/manifest.md` со статусами `pending|done|blocked`.
   - При перезапуске пропускай `done`.

4. **Foundation**
   - Читай Variables по коллекциям и modes.
   - Пиши `foundation.md`: primitive, semantic aliases, component tokens, notes.
   - Если semantic layer отсутствует или collection плоская, запиши risk вместо silent normalization.

5. **Components**
   - Для каждой pending-порции читай `id`, `name`, `description`, `componentPropertyDefinitions`.
   - Для `COMPONENT_SET` фиксируй compact matrix.
   - Для standalone `COMPONENT` фильтруй variant children по `parent.type !== "COMPONENT_SET"`.
   - Выход: `components.md`.

6. **Deep Profiles**
   - Создавай только для категорий, которые нужны для screen build/frontend mapping.
   - Пиши `components/<category>.md`: Node ID, variants, props, slots, anatomy depth <= 3, representative dimensions.

7. **Contract**
   - Создай/обнови `component-contracts.json`.
   - Запиши Code Connect status или fallback mapping.
   - Создай `ds.config.json`.
   - Обнови `design/figma/registry.json`.

## Инварианты

- Локальный индекс является первым источником после ingest.
- Figma читается точечно: missing nodes, refresh, screenshot verification, approved write.
- Node ID обязателен для каждого компонента, пригодного к сборке.
- ComponentSet Node ID нельзя путать с page/frame Node ID.
- Не сохраняй raw private dumps.
- Не закрывай `reuse` как ready без `foundation.md`, `components.md` и registry entry.
- Не закрывай frontend/Figma roundtrip как success без `component-contracts.json` или explicit deviation.

## Формат Итогового Отчета

В финальном ответе укажи:

- slug;
- source URL/scope;
- созданные/обновленные файлы;
- ingest status;
- component/variable counts;
- gaps/risks;
- можно ли использовать систему для `reuse|extend`;
- какие проверки выполнены.

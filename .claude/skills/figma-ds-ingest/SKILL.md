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

## Что делает

Превращает большую Figma дизайн-систему в локальный индекс
`design/figma/<design_system_slug>/`: компактная карта с Node ID, переменными, матрицами
вариантов и профилями компонентов. Нужен, чтобы не перечитывать Figma целиком
при каждой задаче.

## Когда включается

Только когда источником DS выбрана именно Figma-библиотека, и её ещё нет в
`design/figma/registry.json`: чужой UI kit, корпоративная библиотека, community
copy. Плюс обновление индекса после смены `version_id`/`lastModified` — по
факту изменения, а не «на всякий случай».

🔴 **Для shadcn/ui индексы не заводить.** По `CLAUDE.md` §6.1 дизайн-система по
умолчанию — shadcn/ui в коде, и её состав читается прямо из кода. Второй
источник правды неизбежно разъедется: прецедент — `token-map.md`, описывавший
28 % реальности.

🔴 **Кит shadcn/ui в Figma уже внесён — не вносить повторно.**
`design/figma/shadcn-ui-community/` (file key `pCDj1p7ItjKJcXPJZDqXi6`,
2026-07-28): 172 компонента и сета с Node ID, ключами и матрицами вариантов, 47
семантических переменных в light/dark, 14 125 иконок счётчиками. Индекс этой
библиотеки существует ровно один: прежний, по community-оригиналу
`NUoNEuTJ3OZOGH2c780Z55`, удалён как источник путаницы — имена страниц
совпадали с действующим китом, а Node ID компонентов нет.

## Read-only

Skill не пишет в Figma. Любая запись — отдельный approval `figma_write` и путь
через `figma-handoff` / `figma-roundtrip`.

## Порядок: сначала перепись, потом чтение

Шесть шагов, порядок обязателен:

1. **Preflight** — slug, URL, тип источника, режим при повторном заходе.
2. **Census First** — только страницы, типы верхнего уровня, счётчики
   компонентов и коллекции переменных. Полный `get_design_context` на большом
   выделении не используется, в детей инстансов заходить не нужно.
3. **Chunk Manifest** — чтение режется на части, у каждой статус
   `pending|done|blocked`; при перезапуске готовые пропускаются.
4. **Foundation** — переменные по коллекциям и режимам. Нет семантического слоя
   или коллекция плоская — записывается риск, а не тихая нормализация.
5. **Components** и **Deep Profiles** — матрицы вариантов для сетов; глубокие
   профили только для категорий, нужных под сборку экранов.
6. **Contract** — `component-contracts.json`, `ds.config.json`, запись в
   реестр.

## Чем заканчивается

Индекс становится первым источником после ingest; Figma читается точечно.
Закрывать `reuse` как готовый нельзя без `foundation.md`, `components.md` и
записи в реестре; закрывать roundtrip как успех — без
`component-contracts.json` или явно записанного отклонения.

## Детали

Полный порядок из семи шагов, инварианты и формат отчёта —
`references/ingest-procedure.md`.

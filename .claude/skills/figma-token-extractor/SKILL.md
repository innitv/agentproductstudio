---
id: figma-token-extractor
name: figma-token-extractor
title: "Figma Design Token Extractor"
description: "Использовать, когда design/frontend работа должна извлечь source-backed visual tokens из Figma-файла или node в design-brief. Skill отделяет read-only извлечение токенов от approval-gated Figma canvas writes, фиксирует token evidence и маппит значения в CSS variables только на этапе реализации."
platforms:
  - open-code
  - claude
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 08-frontend
required_inputs:
  - recursive_brief
  - run_plan
  - design_brief
required_outputs:
  - design_brief
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Design Token Extractor

## Когда включается

В задаче есть Figma URL, file или node id, и оттуда нужно снять visual tokens
как evidence для `design-brief.md` или для реализации. Запись в canvas — другое
действие, требует approval `figma_write`.

## Главное правило

🔴 **Извлечение разовое и однонаправленное.** По решению от 2026-07-27
(`CLAUDE.md` §6.1) источник правды для токенов — репозиторий: `design/tokens/`
(DTCG, сборка `yarn tokens:build`; для тем shadcn — `design/tokens/shadcn/`).
Figma здесь донор решения, а не хранилище: значение переносится один раз,
обратной синхронизации нет, Figma-кит не ведётся.

Два следствия:

- Значение считается принятым, только когда записано в `design/tokens/` и
  прошло `yarn tokens:build` с baseline-гейтом. Токен, оставшийся в таблице
  `design-brief.md`, — это evidence, а не решение.
- Расхождение Figma-переменной и токена в репозитории после переноса — не
  дефект и не повод перечитывать Figma. Правда в репозитории.

🔴 **Структура токенов — один плоский слой на тему** (группы
`color`/`density`/`typography`), а не три тиера: канон трёх тиеров из
`/figma-ds:standard` относится к Figma-переменным. Извлечённое значение
кладётся в существующую группу; переписывать файл под три тиера запрещено —
сломает гейт паритета `yarn tokens:check`.

🔴 **Расхождение с `shadcn-ui-community` — не дефект.** Имена токенов там
совпадают с `design/tokens/shadcn/default.json`, а значения цвета нет: кит на
базе `neutral`, наша тема `default` — на `slate` (радиусы совпадают численно).
Совпадение имени при разном значении — ожидаемое состояние, фиксировать фактом,
а не конфликтом для эскалации.

## Чем заканчивается

`partial` — Figma недоступна, но дизайн можно продолжить с явно помеченными
допущениями. `blocked` — человек требует реализации точно по Figma, а доступа к
файлу или узлу нет.

## Детали

Входы, процедура извлечения из пяти шагов, формат таблицы в `design-brief.md`,
правила переноса в `design/tokens/shadcn/` и чек-лист приёмки —
`references/extraction.md`.

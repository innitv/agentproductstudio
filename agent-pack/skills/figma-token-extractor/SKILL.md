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

## 1. Назначение

Применяй skill, когда workflow содержит Figma URL/file/node id и нужно извлечь visual tokens как evidence для `design-brief.md` или frontend implementation. Canvas write/update является отдельным действием и требует `figma_write` approval.

**Извлечение разовое и однонаправленное.** По решению от 2026-07-27 (`CLAUDE.md` §6.1) источник правды для токенов — репозиторий: `design/tokens/` (DTCG, сборка `yarn tokens:build`; для shadcn-тем — `design/tokens/shadcn/`). Фактическая структура — **один плоский слой на тему** (группы `color`/`density`/`typography`), а не три тиера: канон трёх тиеров из `/figma-ds:standard` относится к Figma-переменным. Извлечённое значение кладётся в существующую группу, а файл к трём тиерам не переписывается — это сломает гейт паритета `yarn tokens:check`. Figma в этом маршруте — донор решения, а не хранилище: значение из макета переносится в токены один раз, обратной синхронизации нет и Figma-кит не ведётся.

Отсюда два следствия для процедуры ниже:

- Извлечённое значение считается принятым, только когда оно записано в `design/tokens/` и прошло `yarn tokens:build` с baseline-гейтом. Токен, оставшийся только в таблице `design-brief.md`, — это evidence, а не решение.
- Расхождение Figma-переменной и токена в репозитории после переноса — не дефект и не повод перечитывать Figma. Правда — в репозитории.

## 2. Обязательные inputs

- Figma URL, file id или node id из `recursive-brief.md`, `run-plan.md` или `design-brief.md`.
- Цель извлечения: design documentation или frontend implementation.
- Проверка прав и того, какие данные покидают локальный проект.

## 3. Процедура read-only extraction

1. Проверь наличие Figma credentials/MCP и зафиксируй источник токенов.
2. Считай styles, variables или выбранные nodes.
3. Извлеки tokens с исходными evidence fields:
   - token name;
   - value;
   - type: color, typography, spacing, radius, shadow, effect, asset;
   - Figma style/node id;
   - usage context.
4. Сверь с выбранной системой из `design/figma/registry.json`: `design/figma/<selected_design_system_slug>/foundation.md`. Если реестр не содержит выбранной системы, сверять не с чем — извлечённые значения остаются гипотезой и помечаются `needs_validation`. Заархивированные индексы из `archive/design-systems/` источником сверки не являются.
5. Запиши результат в `design-brief.md` в секцию `## Visual Direction` или `## Design Tokens`.

## 4. Frontend mapping

На `08-frontend` перенос идёт в `design/tokens/shadcn/` — правку значений делай там и пересобирай `yarn tokens:build`. Сгенерированный файл `apps/frontend/src/styles/shadcn/tokens.generated.css` руками не редактируется: сборка его перезапишет, а baseline-гейт отклонит незаявленное изменение значений. Не меняй `apps/frontend/src/styles.css` на design stage только ради extraction.

Пример формата в `design-brief.md`:

| Token | Value | Type | Source | Usage |
| --- | --- | --- | --- | --- |
| `--color-primary` | `#005FFC` | color | Figma style/node id | Primary CTA |

## 5. Canvas write gate

Если задача требует создать или обновить Figma canvas, остановись до human approval и `write_allowed=true`. После approval следуй `integrations/mcp/figma-canvas-write-guide.md`.

## 6. Evidence и failure modes

Ставь `partial`, если Figma недоступна, но дизайн можно продолжить с явно помеченными assumptions. Ставь `blocked`, если пользователь требует точного Figma-based implementation, а credentials/node access отсутствуют.

## 7. Validation gates

- [ ] Все ключевые tokens имеют source id или помечены как assumption.
- [ ] `design-brief.md` обновлен таблицей tokens.
- [ ] Принятые значения записаны в `design/tokens/` и проходят `yarn tokens:build` с baseline-гейтом; сгенерированные CSS-файлы вручную не правились.
- [ ] Figma write не выполнялся без approval.
- [ ] `yarn validate:config` проходит.

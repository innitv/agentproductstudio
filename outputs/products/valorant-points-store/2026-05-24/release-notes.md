---
schema_payload:
  status: ready
  inputs_used:
    - qa-report.md
    - frontend-result.md
    - test-bench-result.md
  changed_files:
    - apps/frontend/src/App.tsx
    - apps/frontend/src/styles.css
    - apps/frontend/src/assets/vp-nexus-hero.png
    - tests/playwright/frontend.spec.ts
  what_changed:
    - "Собран лендинг VP Nexus."
    - "Создан полный artifact bundle."
    - "Workflow bundle опубликован на предоставленную пользователем Notion page."
    - "Опубликована человекочитаемая research-only Notion section."
    - "Создана отдельная русскоязычная Notion research page."
  validation:
    - command: "yarn qa:playwright"
      result: "pass"
  deployment_notes:
    - "Добавить реальный checkout перед production."
  rollback_notes:
    - "При необходимости восстановить предыдущие frontend files."
---
# Release Notes

## Inputs Used

- `qa-report.md`
- `frontend-result.md`
- `test-bench-result.md`

## Status

`ready`

## Changed Files

| Файл | Изменение |
|---|---|
| `apps/frontend/src/App.tsx` | Новая страница VP Nexus |
| `apps/frontend/src/styles.css` | Новый styling |
| `apps/frontend/src/assets/vp-nexus-hero.png` | Оригинальный generated asset |
| `tests/playwright/frontend.spec.ts` | Обновленные QA tests |

## Changed Artifacts

Полный bundle находится в `outputs/valorant-points-store/2026-05-24/`.

## What Changed

- Создан оригинальный неофициальный landing для VP code marketplace.
- Добавлен `reference-analysis.md`, где зафиксировано, почему официальный дизайн VALORANT является только inspiration, а не копируется.
- Добавлены disclaimer, region checker, package cards, safety и FAQ.
- Копирование Riot/VALORANT design и assets не использовалось.

## Validation

| Команда | Результат |
|---|---|
| `yarn qa:playwright` | pass |
| `node tooling/scripts/publish-notion-workflow.mjs <page> outputs/valorant-points-store/2026-05-24` | pass |
| `node tooling/scripts/publish-notion-research.mjs <page> outputs/valorant-points-store/2026-05-24` | pass |
| `node tooling/scripts/publish-notion-research-page.mjs <page> outputs/valorant-points-store/2026-05-24/notion-research-export-ru.md` | pass |

## Deployment Notes

- Перед production добавить legal review, real seller identity, stock, prices, checkout и refund policy.

## Rollback Notes

- При необходимости восстановить предыдущие `App.tsx`, `styles.css` и tests.

## Remaining Risks

- Commercial Riot IP use требует legal review.
- Unauthorized resale может создавать policy/payment risk.

## Approval Notes

Notion publication была одобрена и выполнена: `https://www.notion.so/3696473174e58006af5fd367ef89d978`.
Human-readable research-only section была добавлена после broad bundle publication.
Отдельная русскоязычная research page создана: `36a64731-74e5-813d-b889-fc772fd59367`.

# Release Notes

agent_name: release
status: success

## Changed

- Добавлен frontend лендинг для SIM/eSIM assistant product.
- Добавлен локальный hero visual asset.
- Обновлены Playwright smoke tests под новый лендинг.
- Созданы продуктовые artifacts по `AGENTS.md`.
- Создан Notion-ready export.

## Validation

- `yarn typecheck`
- `yarn validate:config`
- `yarn build`
- `yarn qa:playwright`
- `yarn notion:check`

## Deployment Notes

- Dev server: `yarn dev --port 5173`.
- Production build output: `dist/frontend` после `yarn build`.

## Rollback Notes

- Вернуть предыдущий `App.tsx`, `styles.css` и тесты.
- Удалить `apps/frontend/src/assets/sim-assistant-hero.svg`.
- Удалить `outputs/sim-assistant-landing/2026-05-23` если нужно убрать artifacts этого run.


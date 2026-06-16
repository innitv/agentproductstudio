# Siteportfolio

`siteportfolio` — отдельный продуктовый каталог для личного сайта-портфолио Ивана Игнатова.

Этот каталог вынесен из общего `outputs/`, чтобы запросы и артефакты по портфолио не смешивались с обычными research/product workflow runs.

## Что где лежит

| Слой | Путь | Назначение |
|---|---|---|
| Frontend route | `apps/frontend/src/App.tsx` | Маршрут `/portfolio` подключает портфолио. |
| Frontend view | `apps/frontend/src/views/PortfolioView.tsx` | Основной React-view сайта портфолио. |
| Styles | `apps/frontend/src/styles.css` | CSS-блоки `.portfolio-*` для сайта портфолио. |
| Product ledger | `siteportfolio/runs/2026-06-14/` | История редизайна, QA, screenshots, surface contract и frontend-result. |

## Правило маршрутизации

Если пользователь пишет `мой сайт`, `мой сайт портфолио`, `портфолио`, `portfolio`, `siteportfolio`, `персональный сайт`, `сайт Ивана` или просит правку `/portfolio`, Codex должен считать это запросом к продукту `siteportfolio`.

Для таких задач:

- сначала читать этот README и `siteportfolio/runs/2026-06-14/handoff-bundle.md`;
- для UI-правок менять `apps/frontend/src/views/PortfolioView.tsx` и соответствующие `.portfolio-*` стили;
- не создавать новый `outputs/<project-slug>/...` без явного запроса на полный новый workflow;
- после визуально значимой правки обновлять или добавлять evidence в `siteportfolio/runs/<date>/`.

## Текущий статус

Активный продуктовый run: `siteportfolio/runs/2026-06-14/`.


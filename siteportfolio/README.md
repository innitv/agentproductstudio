# Siteportfolio

`siteportfolio` — отдельный продуктовый каталог для личного сайта-портфолио Ивана Игнатова.

Этот каталог вынесен из общего `outputs/`, чтобы запросы и артефакты по портфолио не смешивались с обычными research/product workflow runs.

## Что где лежит

| Слой | Путь | Назначение |
|---|---|---|
| Route hook | `apps/frontend/src/App.tsx` | Тонкое подключение маршрута `/portfolio` к сайту. |
| Site source | `siteportfolio/src/` | Исходники личного сайта портфолио. |
| Product ledger | `siteportfolio/runs/2026-06-14/` | История редизайна, QA, screenshots, surface contract и frontend-result. |

## Внутренняя структура

| Папка / файл | Назначение |
|---|---|
| `src/PortfolioView.tsx` | Основной React-view сайта: главная, страницы компаний и детальные кейсы. |
| `src/styles.css` | Все scoped-стили сайта с namespace `.portfolio-*`. |

## Правило маршрутизации

Если пользователь пишет `мой сайт`, `мой сайт портфолио`, `портфолио`, `portfolio`, `siteportfolio`, `персональный сайт`, `сайт Ивана` или просит правку `/portfolio`, Codex должен считать это запросом к продукту `siteportfolio`.

Для таких задач:

- сначала читать этот README и `siteportfolio/runs/2026-06-14/handoff-bundle.md`;
- для UI-правок менять `siteportfolio/src/PortfolioView.tsx` и `siteportfolio/src/styles.css`;
- общий frontend-route в `apps/frontend/src/App.tsx` менять только если меняется способ подключения `/portfolio`;
- не создавать новый `outputs/<project-slug>/...` без явного запроса на полный новый workflow;
- после визуально значимой правки обновлять или добавлять evidence в `siteportfolio/runs/<date>/`.

## Текущий статус

Активный продуктовый run: `siteportfolio/runs/2026-06-14/`.

# Siteportfolio

`siteportfolio` — отдельный продуктовый каталог для личного сайта-портфолио Ивана Игнатова.

Этот каталог вынесен из общего `outputs/`, чтобы запросы и артефакты по портфолио не смешивались с обычными research/product workflow runs.

Важно: `codex/siteportfolio-domain` — transition branch, где проверена модель доменного root route `/`. Production-портфолио теперь имеет отдельный app boundary `apps/portfolio`; этот каталог хранит app shell и Vite config, а продуктовый source остается в `siteportfolio/src`.

## Что где лежит

| Слой | Путь | Назначение |
|---|---|---|
| Production app | `apps/portfolio/` | Отдельная Vite-сборка для домена с root route `/`. |
| Preview route hook | `apps/frontend/src/App.tsx` | Тонкое подключение маршрута `/portfolio` к сайту внутри studio app. |
| Site source | `siteportfolio/src/` | Shared source личного сайта портфолио. |
| Product ledger | `siteportfolio/runs/2026-06-14/` | История редизайна, QA, screenshots, surface contract и frontend-result. |

`siteportfolio/runs/**` — исторический ledger. Он может ссылаться на маршруты и файлы, актуальные на дату run, например `/portfolio` внутри `apps/frontend`. Текущие правила app/deploy boundaries находятся в `docs/architecture/repo-map.md`, `docs/architecture/git-workflow.md` и этом README.

## Внутренняя структура

| Папка / файл | Назначение |
|---|---|
| `src/PortfolioView.tsx` | Основной React-view сайта: главная, страницы компаний и детальные кейсы. Поддерживает base path `/portfolio` для studio preview и `/` для production app. |
| `src/styles.css` | Все scoped-стили сайта с namespace `.portfolio-*`. |

## Правило маршрутизации

Если пользователь пишет `мой сайт`, `мой сайт портфолио`, `портфолио`, `portfolio`, `siteportfolio`, `персональный сайт`, `сайт Ивана` или просит правку `/portfolio`, Codex должен считать это запросом к продукту `siteportfolio`.

Для таких задач:

- сначала читать этот README и `siteportfolio/runs/2026-06-14/handoff-bundle.md`;
- для route/deploy/branch решений читать `docs/architecture/repo-map.md` и `docs/architecture/git-workflow.md`;
- для UI-правок менять `siteportfolio/src/PortfolioView.tsx` и `siteportfolio/src/styles.css`;
- production app shell и сборку менять в `apps/portfolio/`;
- общий frontend-route в `apps/frontend/src/App.tsx` менять только если меняется способ подключения `/portfolio`;
- не создавать новый `outputs/<project-slug>/...` без явного запроса на полный новый workflow;
- после визуально значимой правки обновлять или добавлять evidence в `siteportfolio/runs/<date>/`.

## Текущий статус

Активный продуктовый run: `siteportfolio/runs/2026-06-14/`.

## Деплой на Reg.ru

Production-сборка портфолио — статический сайт из `apps/portfolio/` с source в `siteportfolio/src/`.

1. Скопировать пример настроек:

```bash
cp apps/portfolio/deploy.regru.env.example .env.portfolio-deploy
```

2. Заполнить в `.env.portfolio-deploy` FTP/FTPS-доступы из панели Reg.ru:

- `PORTFOLIO_FTP_PROTOCOL`
- `PORTFOLIO_FTP_HOST`
- `PORTFOLIO_FTP_PORT`
- `PORTFOLIO_FTP_USER`
- `PORTFOLIO_FTP_PASSWORD`
- `PORTFOLIO_FTP_REMOTE_DIR`

Файл `.env.portfolio-deploy` игнорируется git и не должен попадать в commit.

3. Проверить список файлов без загрузки:

```bash
yarn deploy:portfolio:dry-run
```

4. Собрать и залить сайт:

```bash
yarn deploy:portfolio
```

Скрипт загружает содержимое `dist/portfolio`: `.htaccess`, `index.html` и `assets/`. `.htaccess` нужен для прямых ссылок на внутренние страницы вроде `/smlt/case/mdg`.

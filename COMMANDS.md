# Project Commands

## Agent Runtime

Проверить standard route без visual reference:

```bash
yarn agents:inspect
```

Проверить reference route с visual reference stage:

```bash
yarn agents:inspect --profile reference
```

Создать стартовый workflow scaffold:

```bash
yarn landing:run "цель лендинга"
```

Создать локальный standard workflow от intake до release artifacts:

```bash
yarn workflow:run-local "цель лендинга"
```

Команда создаёт `outputs/<project-slug>/<YYYY-MM-DD>/`, запускает research stage,
генерирует downstream-артефакты и в конце выполняет `workflow:validate`.

Запустить persisted workflow engine:

```bash
yarn workflow:start "цель лендинга"
```

Продолжить существующий run:

```bash
yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>
```

Показать состояние run:

```bash
yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>
```

Принудительно переисполнить stage и downstream stages:

```bash
yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> 01-research --force
```

Engine сохраняет `run-state.json` и machine-readable stage results в `stage-results/`.

## Research

Запустить end-to-end research stage для существующей output-папки:

```bash
yarn research:run outputs/<project-slug>/<YYYY-MM-DD>
```

Запустить research stage с явным research query:

```bash
yarn research:run outputs/<project-slug>/<YYYY-MM-DD> "research query"
```

Research runner создает:

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

И обновляет:

- `handoff-bundle.md`
- `stage-gate-ledger.md`

## Visual Reference

Собрать Firecrawl + Playwright reference pack:

```bash
yarn reference:scan https://example.com example-reference
```

Результат сохраняется в:

```text
reports/visual-review/example-reference/
```

Firecrawl используется для публичного URL. Локальный preview проверяется Playwright.

Сгенерировать `visual-reference-review.md` по уже собранным reference/local скриншотам:

```bash
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173
```

Команда ожидает в report-папке evidence из `reference:scan` и локальные Playwright screenshots
вроде `local-desktop-after.png` / `local-mobile-after.png`. Если пары desktop/mobile
не хватает, review будет создан со статусом `blocked`.

Если локальные screenshots лежат отдельно:

```bash
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173 --local-dir reports/visual-review/example-local
```

Посчитать pixel diff между reference и local screenshots:

```bash
yarn reference:diff reports/visual-review/example-reference reports/visual-review/example-local reports/visual-review/example-reference
```

Команда создаёт:

- `visual-diff-result.json`
- `visual-diff-summary.md`

После этого `reference:review` автоматически добавит diff summary в `visual-reference-review.md`.

Посчитать section-aware diff по reference/local URL:

```bash
yarn reference:section-diff https://example.com http://127.0.0.1:4173 reports/visual-review/example-reference
```

Команда снимает секционные screenshots по known selectors/fallback selectors и создаёт:

- `visual-section-diff-result.json`
- `visual-section-diff-summary.md`

После этого `reference:review` автоматически добавит section diff summary в `visual-reference-review.md`.

## Workflow Validation

Проверить workflow до конкретного stage:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research --profile standard
```

Проверить полный standard workflow:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
```

Проверить полный reference workflow:

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

## QA

Быстрая проверка конфигов, типов и документации:

```bash
yarn qa:quick
```

Полный Playwright QA:

```bash
yarn qa:playwright
```

Firecrawl + Playwright check:

```bash
yarn qa:firecrawl
```

Полный project audit:

```bash
yarn project:audit
```

## Frontend

Dev server:

```bash
yarn dev
```

Production build:

```bash
yarn build
```

Preview built frontend:

```bash
yarn preview
```

## Notion

Проверить локальный Notion token:

```bash
yarn notion:check
```

Запустить Notion MCP:

```bash
yarn notion:mcp
```

Research publication для полного workflow остается обязательным gate: нужно опубликовать research-only child page или зафиксировать blocker/partial в artifacts.

## Typical Flows

Standard flow без visual reference:

```bash
yarn landing:run "Лендинг для AI-сервиса записи в салон"
yarn research:run outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research --profile standard
```

Reference flow:

```bash
yarn landing:run "Лендинг как https://example.com для сервиса X"
yarn reference:scan https://example.com example-reference
yarn reference:diff reports/visual-review/example-reference reports/visual-review/example-local reports/visual-review/example-reference
yarn reference:section-diff https://example.com http://127.0.0.1:4173 reports/visual-review/example-reference
yarn reference:review reports/visual-review/example-reference http://127.0.0.1:4173 --local-dir reports/visual-review/example-local
yarn research:run outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research --profile reference
```

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
yarn research:run outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through 01-research --profile reference
```


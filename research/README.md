# Research

`research/` — отдельный каталог для исследовательских запусков, CJM, market research, Notion-ready research exports и связанных evidence.

Этот каталог отделен от `outputs/`, чтобы продуктовые прототипы, временные workflow-запуски и исследовательские артефакты не смешивались.

## Структура

```text
research/
  README.md
  registry.json
  projects/
    <research-slug>/
      <YYYY-MM-DD>/
        run-index.md
        run-state.json
        run-meta.json
        artifact-manifest.json
        research-summary.md
        competitive-analysis.md
        scenario-user-flows.md
        source-log.md
        notion-research-export-ru.md
        ...
  archive/
    <research-slug>/
  temp/
    <scratch-or-smoke-run>/
```

## Что куда класть

| Зона | Назначение |
|---|---|
| `projects/` | Активные или полезные research/CJM/market-research runs. |
| `archive/` | Старые research runs, которые больше не являются рабочим контекстом. |
| `temp/` | Временные research-проверки, черновики, smoke runs. |

## Текущие проекты

Список живёт в `research/registry.json` (массив `activeResearchProjects`) — здесь он не дублируется, потому что ручная копия неизбежно устаревает: до 2026-07-25 в этом разделе стоял `projects/a3pay-cjm/`, давно уехавший в `archive/`, и не было трёх из семи актуальных проектов.

Реестр — навигационный индекс, а не gate: ни один скрипт уборки его не читает (в отличие от `outputs/registry.json`, по которому `yarn outputs:cleanup` решает судьбу каталогов). Поэтому ведение здесь такое:

- `yarn research:run <research/projects/<slug>/<date>>` вносит слаг в `activeResearchProjects` автоматически;
- команды создания research-run не существует (каталог заводит оркестратор обычной записью файлов), поэтому автозапись перекрывает не все случаи. Основная проверка — `yarn research:registry-sync`: печатает обе стороны расхождения и завершается с ненулевым кодом; `--force` чинит;
- архивация research выполняется вручную (`workflow:archive` работает только внутри `outputs/`), поэтому запись уехавшего в `archive/` слага убирает та же сверка.

Регрессию охраняет `yarn workflow:test-research-registry` (входит в `yarn workflow:test-agentic`).

## Правила работы

- Для research-задач сначала искать здесь, а не в `outputs/`.
- `run-index.md` остается первым файлом для человека внутри конкретного запуска.
- `run-meta.json`, `run-state.json` и `artifact-manifest.json` остаются machine-readable ledger.
- Исторические записи в `stage-gate-ledger.md`, publication records и release notes можно не переписывать после переноса, если они фиксируют команды или пути, которые реально использовались в момент запуска.
- Новые research runs по умолчанию создавать в `research/projects/<research-slug>/<YYYY-MM-DD>/`, если пользователь явно не просит временный запуск.
- `outputs/` больше не использовать как место хранения исследований; он остается для runtime/temp/legacy output-зоны.

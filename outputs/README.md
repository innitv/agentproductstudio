# Outputs (Результаты запусков)

Эта папка предназначена для runtime/temp/legacy результатов workflow и разделена на зоны во избежание захламления.

Исследовательские runs, CJM и market research теперь вынесены в отдельный каталог `research/`.

## Структура папки

```text
outputs/
  registry.json          # Единый реестр активных продуктов (B2B/B2C)
  <project-slug>/        # Runtime source of truth для активного workflow
    <YYYY-MM-DD>/
      run-index.md
      run-state.json
      run-meta.json
      artifact-manifest.json
      recursive-brief.md
      research-summary.md
      prd.md
      ...
  products/              # Legacy/archive-зона для старых или вручную перенесенных результатов
    <project-slug>/
      <YYYY-MM-DD>/
        recursive-brief.md
        research-summary.md
        prd.md
        ...
  temp/                  # Временные папки проверок, тестов и дымовых (smoke) запусков
    <test-run-slug>/

research/
  projects/              # Research/CJM/market-research runs
    <research-slug>/
      <YYYY-MM-DD>/
```

## Правила и регламенты

1. **Реестр (`registry.json`):** Все реальные продукты регистрируются в массиве `activeProducts` в `registry.json`.
   Отдельные продукты могут жить вне `outputs/`, если это явно зафиксировано в корне проекта. Сейчас личный сайт-портфолио вынесен в `siteportfolio/`.
   Исследовательские проекты регистрируются отдельно в `research/registry.json`.
2. **Runtime source of truth:** Workflow-агент и команды `workflow:*` по умолчанию работают с `outputs/<project-slug>/<YYYY-MM-DD>/`. Содержимое прошлых run folders используется только как диагностический контекст конкретного запуска, а не как источник правил workflow.
3. **Run ledger:** каждый полноценный run содержит `run-index.md`, `run-state.json`, `run-meta.json` и `artifact-manifest.json`. `run-index.md` — первый файл для человека; `artifact-manifest.json` — machine-readable ledger артефактов.
4. **Artifact types:** manifest классифицирует файлы как `state`, `manifest`, `product_artifact`, `evidence`, `external_record` или `export`.
5. **Visual evidence:** для reference/Figma/frontend задач run должен хранить реальные evidence-файлы: paired screenshots, `visual-diff-result.json`, `visual-section-diff-result.json` при наличии, Figma screenshot/node evidence, `visual-reference-review.md` с Source Pair Matrix.
6. **Inspection:** для списка runs используй `yarn workflow:list`; для технической диагностики одного run — `yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>`; для человекочитаемого объяснения outputs — `yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>`.
7. **Sync:** после ручной правки run artifacts запускай `yarn workflow:sync outputs/<project-slug>/<YYYY-MM-DD>`, чтобы `run-state.json`, `artifact-manifest.json`, `run-index.md` и stage results не расходились с Markdown-артефактами.
8. **Очистка (`yarn outputs:cleanup`):** Для наведения порядка в корне `outputs/` используйте команду `yarn outputs:cleanup`. Она оставляет зарегистрированные активные продукты в runtime-пути `outputs/<project-slug>/` и переносит только незарегистрированные папки/файлы в `outputs/temp/`.
9. **Legacy/archive:** `outputs/products/` хранит старые или вручную перенесенные результаты и не является путем по умолчанию для новых запусков.
10. **Research:** `research/projects/` хранит исследовательские runs, CJM, market research, source logs и Notion-ready research exports.
11. **Безопасность:** Категорически запрещено сохранять секреты, пароли или токены доступа в отчетах.
12. **Достоверность:** Все утверждения (claims) без явных внешних источников обязаны помечаться статусом `needs validation`.
13. **Согласованность:** Каждый отчет `prototype-report` обязан содержать transition map и конкретный completion step.

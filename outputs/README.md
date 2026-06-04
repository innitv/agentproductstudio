# Outputs (Результаты запусков)

Эта папка предназначена для хранения результатов запусков workflow и разделена на две основные зоны во избежание захламления:

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
```

## Правила и регламенты

1. **Реестр (`registry.json`):** Все реальные продукты регистрируются в массиве `activeProducts` в `registry.json`.
2. **Runtime source of truth:** Workflow-агент и команды `workflow:*` по умолчанию работают с `outputs/<project-slug>/<YYYY-MM-DD>/`. Содержимое прошлых run folders используется только как диагностический контекст конкретного запуска, а не как источник правил workflow.
3. **Run ledger:** каждый полноценный run содержит `run-index.md`, `run-state.json`, `run-meta.json` и `artifact-manifest.json`. `run-index.md` — первый файл для человека; `artifact-manifest.json` — machine-readable ledger артефактов.
4. **Artifact types:** manifest классифицирует файлы как `state`, `manifest`, `product_artifact`, `evidence`, `external_record` или `export`.
5. **Inspection:** для списка runs используй `yarn workflow:list`; для технической диагностики одного run — `yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>`; для человекочитаемого объяснения outputs — `yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>`.
6. **Очистка (`yarn outputs:cleanup`):** Для наведения порядка в корне `outputs/` используйте команду `yarn outputs:cleanup`. Она оставляет зарегистрированные активные продукты в runtime-пути `outputs/<project-slug>/` и переносит только незарегистрированные папки/файлы в `outputs/temp/`.
7. **Legacy/archive:** `outputs/products/` хранит старые или вручную перенесенные результаты и не является путем по умолчанию для новых запусков.
8. **Безопасность:** Категорически запрещено сохранять секреты, пароли или токены доступа в отчетах.
9. **Достоверность:** Все утверждения (claims) без явных внешних источников обязаны помечаться статусом `needs validation`.
10. **Согласованность:** Каждый отчет `prototype-report` обязан содержать transition map и конкретный completion step.

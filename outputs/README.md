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
  archive/               # Архив завершённых продуктовых run (yarn workflow:archive)
    <project-slug>/
      <YYYY-MM-DD>/
  temp/                  # Временные папки проверок, тестов и дымовых (smoke) запусков
    <test-run-slug>/

research/
  projects/              # Research/CJM/market-research runs
    <research-slug>/
      <YYYY-MM-DD>/
```

## Правила и регламенты

1. **Реестр (`registry.json`):** Все реальные продукты регистрируются в массиве `activeProducts` в `registry.json`. **Реестр ведёт runtime, а не человек:**
   - `yarn workflow:start` вносит слаг нового run в `activeProducts` (идемпотентно: повторный запуск того же слага дубля не создаёт);
   - `yarn workflow:archive` убирает слаг, когда у него не осталось ни одного каталога в `outputs/<slug>/`, и удаляет опустевший `outputs/<slug>/`; при других датах того же слага запись сохраняется;
   - `yarn workflow:registry-sync` сверяет реестр с фактическими каталогами `outputs/*` и печатает расхождение; `yarn workflow:registry-sync --force` приводит реестр в соответствие. Команда завершается с ненулевым кодом, если реестр разошёлся, — это её штатный способ сообщить проблему.

   **Что делать при расхождении.** Причина почти всегда — каталог, созданный или перенесённый мимо `workflow:*` (вручную, скриптом, из другого репозитория). Порядок: `yarn workflow:registry-sync` (посмотреть, что именно разошлось) → убедиться, что каталог из списка «есть на диске, нет в реестре» действительно нужен → `yarn workflow:registry-sync --force`. Правка `registry.json` руками допустима, но не нужна: сверка делает то же самое и не ошибается в формате. Регрессию охраняет `yarn workflow:test-outputs-registry` (входит в `yarn workflow:test-agentic`).

   Отдельные продукты могут жить вне `outputs/`, если это явно зафиксировано в корне проекта. Сейчас личный сайт-портфолио вынесен в `siteportfolio/`, а production app shell живет в `apps/portfolio/`.
   Исследовательские проекты регистрируются отдельно в `research/registry.json`.
2. **Runtime source of truth:** Workflow-агент и команды `workflow:*` по умолчанию работают с `outputs/<project-slug>/<YYYY-MM-DD>/`. Содержимое прошлых run folders используется только как диагностический контекст конкретного запуска, а не как источник правил workflow.
3. **Run ledger:** каждый полноценный run содержит `run-index.md`, `run-state.json`, `run-meta.json` и `artifact-manifest.json`. `run-index.md` — первый файл для человека; `artifact-manifest.json` — machine-readable ledger артефактов.
4. **Artifact types:** manifest классифицирует файлы как `state`, `manifest`, `product_artifact`, `evidence`, `external_record` или `export`.
5. **Visual evidence:** для reference/Figma/frontend задач run должен хранить реальные evidence-файлы: paired screenshots, `visual-diff-result.json`, `visual-section-diff-result.json` при наличии, Figma screenshot/node evidence, `visual-reference-review.md` с Source Pair Matrix.
6. **Inspection:** для списка runs используй `yarn workflow:list`; для технической диагностики одного run — `yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>`; для человекочитаемого объяснения outputs — `yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>`.
7. **Sync:** после ручной правки product run artifacts запускай `yarn workflow:sync outputs/<project-slug>/<YYYY-MM-DD>`, чтобы `run-state.json`, `artifact-manifest.json`, `run-index.md` и stage results не расходились с Markdown-артефактами. Для standalone research используй аналогичный путь `research/projects/<research-slug>/<YYYY-MM-DD>`.
8. **Очистка (`yarn outputs:cleanup`):** Для наведения порядка в корне `outputs/` используйте команду `yarn outputs:cleanup`. Она оставляет зарегистрированные активные продукты в runtime-пути `outputs/<project-slug>/` и переносит только незарегистрированные папки/файлы в `outputs/temp/`.
   Перед реальным запуском обязательно сверяйся с планом: `yarn outputs:cleanup-dry-run` (ничего не перемещает). Зоны хранения `products/`, `archive/`, `temp/` защищены в скрипте и не вносятся в `activeProducts` — это не product-slug. Если `activeProducts` пуст, а каталоги в `outputs/` есть, скрипт останавливается с ошибкой (иначе одна команда увела бы все продукты в `temp/`); осознанный перенос требует `--force`. Предохранитель ловит только полностью пустой реестр, поэтому основная защита — автоведение реестра (правило 1) и сверка `yarn workflow:registry-sync` перед уборкой.
9. **Legacy/archive:** `outputs/products/` хранит старые или вручную перенесенные результаты и не является путем по умолчанию для новых запусков. `outputs/archive/<project-slug>/<YYYY-MM-DD>/` — архив завершённых run (`yarn workflow:archive`).
10. **Research:** `research/projects/` хранит исследовательские runs, CJM, market research, source logs и Notion-ready research exports.
11. **Безопасность:** Категорически запрещено сохранять секреты, пароли или токены доступа в отчетах.
12. **Достоверность:** Все утверждения (claims) без явных внешних источников обязаны помечаться статусом `needs validation`.
13. **Согласованность:** Каждый отчет `prototype-report` обязан содержать transition map и конкретный completion step.

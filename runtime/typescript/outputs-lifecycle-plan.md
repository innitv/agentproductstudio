# Outputs Lifecycle Plan

Этот план фиксирует инженерную работу по превращению `outputs/` из набора папок в управляемый lifecycle workflow runs. План учитывает уже выполненные изменения и служит рабочим трекером для следующих инкрементов.

## Уже сделано

1. `run-meta.json` добавлен как краткая машинная карточка persisted run.
2. `artifact-manifest.json` добавлен как машинный индекс обязательных артефактов run.
3. `workflow:list` добавлен для обзора runs без ручного обхода папок.
4. `workflow:sync` и persisted state writes синхронизируют output metadata.
5. `runtime/typescript/README.md` фиксирует правило: source of truth находится внутри run directory, а `outputs/registry.json` является навигационным индексом.
6. Добавлен regression-тест `workflow:test-output-metadata`.

## План следующих инкрементов

1. `workflow:inspect outputs/<run>` — done
   Показывает подробную карточку одного run: meta, status, stages, missing artifacts, blockers, validation hint.

2. `workflow:cleanup-temp` — done
   Безопасно очищает только `outputs/temp` с dry-run по умолчанию и явным `--force` для удаления.

3. `workflow:archive outputs/<run>` — done
   Переносит старый run в `outputs/archive/<project-slug>/<date>/` или `outputs/quarantine/` для поврежденных runs. Не трогает active run без `--force`.

4. Validation rules для persisted runs — done
   `workflow:validate` должен предупреждать или ошибаться, если persisted run не имеет `run-meta.json` и `artifact-manifest.json`.

5. Документация lifecycle outputs — done
   Обновить `AGENTS.md`, `runtime/typescript/README.md` и workflow docs: структура, source of truth, archive/temp/quarantine правила.

6. Regression tests — done
   Покрыть inspect/archive/cleanup/validation, включая защиту от удаления не-temp runs и сохранение unrelated product files.

7. Чистый commit-slice
   Коммитить только runtime/docs изменения, не включая продуктовые `apps/frontend`, `outputs`, `tests/playwright`, `design`.

## Рабочие ограничения

- Не использовать `outputs/products/` как путь по умолчанию для новых workflow.
- Не считать `outputs/registry.json` нормативным источником правил.
- Не удалять и не переносить run без явного безопасного режима или `--force`.
- Не смешивать runtime lifecycle изменения с продуктовыми прототипами.

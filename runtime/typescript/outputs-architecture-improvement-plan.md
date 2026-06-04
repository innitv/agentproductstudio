# Outputs Architecture Improvement Plan

Дата: 2026-06-03

## Цель

Сделать `outputs/<project-slug>/<YYYY-MM-DD>/` понятным run ledger: не складом файлов, а структурой, где видно состояние workflow, продуктовые артефакты, evidence, external records, publishable exports и следующий шаг.

## Практики, которые адаптируем

- Artifact sets: отделять agent outputs, activation/state metadata, audit/evidence logs и publishable/safe outputs.
- Artifacts are run-scoped: `outputs/*` описывает конкретный run, а не reusable rules/cache.
- Manifest-first navigation: каждый файл должен иметь тип, producer stage/agent, consumers, status и evidence/publish safety flags.
- Checkpoint/state split: `run-state.json` отвечает за resume/checkpoint, а reusable knowledge остается в нормативных docs, не в прошлых run folders.
- Safe outputs: внешние действия должны читаться из явных export/external-record artifacts после approval, а не из raw workflow dump.

## План внедрения

1. [done] Расширить `artifact-manifest.json`:
   - `artifact_type`;
   - `producer_stage`;
   - `producer_agent`;
   - `consumers`;
   - `checksum_sha256`;
   - `human_readable`;
   - `safe_to_publish`;
   - `lifecycle`.
2. [done] Добавить `run-index.md`, который генерируется при `workflow:sync`/state write:
   - run summary;
   - what to read;
   - blocking stages;
   - artifact groups;
   - next action.
3. [done] Добавить команду `yarn workflow:outputs <run>` как человекочитаемый inspection layer поверх `workflow:inspect`.
4. [done] Обновить conventions:
   - `AGENTS.md`;
   - `outputs/README.md`;
   - `agent-pack/templates/file-format-conventions.md`.
5. [done] Добавить regression tests для manifest enrichment, `run-index.md` и backward-compatible inspection старых manifests.
6. [done] Прогнать проверки:
   - `yarn typecheck`;
   - `yarn validate:config`;
   - `yarn docs:audit`;
   - профильные tests;
   - `git diff --check`.

## Текущий статус

- `workflow:outputs` показывает группы `product_artifact`, `evidence`, `export`, `external_record`, `manifest`, `state`.
- `workflow:outputs` рекомендует `run-index.md` первым файлом для чтения, если он есть.
- Inspection layer нормализует старые `artifact-manifest.json` без новых полей и не требует ручной пересинхронизации run только для чтения.
- `artifact-manifest.json` включает обнаруженные optional files: export artifacts, approval records и visual diff evidence, если они лежат в run directory.
- `workflow:validate` проверяет наличие `run-index.md` вместе с `run-meta.json` и `artifact-manifest.json` для persisted runs.
- Regression test `yarn workflow:test-output-metadata` покрывает генерацию `run-index.md`, enrichment manifest и readable outputs guide.
- Пройдены проверки: `yarn workflow:test-output-metadata`, `yarn typecheck`, `yarn validate:config`.
- Финальные проверки пройдены: `yarn docs:audit`, `yarn workflow:test-agentic`, `git diff --check`.

## Критерий готовности

Новый run после `workflow:sync` получает `run-index.md`, расширенный `artifact-manifest.json`, а `yarn workflow:outputs <run>` объясняет человеку, какие файлы читать, какие являются evidence/export/external records, что заблокировано и какой следующий шаг.

---
id: run-ledger
name: run-ledger
title: "Run Ledger (Ведение Журнала Запуска)"
description: "Использовать при старте продуктового run и после каждого этапа, чтобы вести run ledger: run-plan, handoff-bundle, stage-gate-ledger, run-state, artifact-manifest. Skill фиксирует inputs_used, статусы стадий и gate notes, синхронизирует состояние через yarn workflow:sync после ручных правок и не позволяет закрыть workflow как success при незаписанных blocker и skipped_with_reason."
platforms:
  - claude
  - open-code
mcp_servers: []
strictness_profile: standard
owner_stage_ids:
  - 00-intake
  - 12-release
required_inputs:
  - run_plan
  - handoff_bundle
  - stage_gate_ledger
required_outputs:
  - run_plan
  - handoff_bundle
  - stage_gate_ledger
approval_actions: []
validation_commands:
  - yarn workflow:sync
  - yarn workflow:validate
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Run Ledger (Ведение Журнала Запуска)

## 1. Назначение

Skill применяется при старте продуктового run и **после каждого этапа**. Он отвечает за то, чтобы состояние workflow было записано, а не восстанавливалось по памяти сессии: какие артефакты готовы, какие решения приняты, какие gates пройдены, что осталось риском.

Нормативный процесс — [`agent-pack/workflows/artifact-driven-pipeline.md`](../../workflows/artifact-driven-pipeline.md). Skill даёт исполняемый минимум.

Главная ошибка, от которой он защищает: этап «сделан», но `handoff-bundle.md` и `stage-gate-ledger.md` не обновлены — и следующий агент (или следующая сессия после сжатия контекста) не знает, на чём стоит.

## 2. Обязательные inputs

- Директория run: `outputs/<project-slug>/<YYYY-MM-DD>/` или `research/projects/<research-slug>/<YYYY-MM-DD>/`.
- Существующий ledger: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`.
- Артефакты завершённого этапа.

## 3. Процедура

### При старте run

1. Создай директорию run по правилам маршрутизации: продуктовый workflow → `outputs/<project-slug>/<YYYY-MM-DD>/`; standalone research/CJM → `research/projects/<research-slug>/<YYYY-MM-DD>/`; тестовый прогон → `outputs/temp/`.
2. Создай обязательный ledger **до первых стадий**: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`.
3. Зафиксируй в `run-plan.md`: тип работы, профиль (`standard`/`reference`), **масштаб** (`full`/`increment`/`patch`, см. CLAUDE.md §0.2), маршрут стадий и non-goals. Масштаб — отдельная ось от профиля; не уверен — бери `full`.
3a. Стадии, которые масштаб исключает, перечисли сразу в `stage-gate-ledger.md` как `skipped_by_scale` с указанием масштаба. Пропуск по масштабу — легальное решение, но только записанное: молчаливый пропуск неотличим от забытой стадии. Список даёт `getStagesSkippedByScale` (или `yarn workflow:validate <run-dir> --scale <scale>`).

### После каждого этапа

4. **`handoff-bundle.md`:** completed artifacts, принятые решения, риски, следующий артефакт. Это то, что реально читает следующий агент.
5. **`stage-gate-ledger.md`:** статус стадии (`success`/`partial`/`blocked`), gate notes, результат validation.
6. **`inputs_used`:** перечисли файлы, которые этап реально прочитал. Не «recursive-brief.md» по умолчанию, а фактический список.
7. **Незакрытое — записывается.** Пропущенный слой → `skipped_with_reason`. Стадия вне масштаба → `skipped_by_scale`. Недоступный provider/approval → `blocked`/`partial`. Молчаливый пропуск запрещён.
7a. **Масштаб не понижается задним числом.** Обнаружил, что задача крупнее — поднимай масштаб и добирай стадии. Понижение ради пропуска уже начатой стадии — `process_deviation` с reason; валидатор такой run отклонит.
8. **После ручной правки файлов** run — `yarn workflow:sync <run-dir>`, иначе `run-state.json` разойдётся с реальностью.

### Обзор

- `yarn workflow:list` — активные run.
- `yarn workflow:inspect <run-dir>` — состояние стадий и gates.
- `yarn workflow:outputs <run-dir>` — созданные артефакты.

### Начиная с 08-frontend

Оркестратор передаёт специалистам сжатый `handoff-bundle.md` (через `runtime/typescript/context-truncator.ts`), а не всю историю сессии. Качество bundle прямо определяет качество позднего handoff.

## 4. Evidence и failure modes

Definition of Done для этапа: обязательные артефакты созданы/обновлены; `inputs_used` зафиксирован; `handoff-bundle.md` и `stage-gate-ledger.md` обновлены; validation выполнена или blocker записан.

- **`partial`** — артефакты есть, но gate/validation не пройдены и это записано.
- **`blocked`** — отсутствует обязательный вход, provider или approval.
- **Нарушение** — этап закрыт как `success`, а ledger не обновлён: workflow не может считаться завершённым, статус пересматривается.

## 5. Validation gates

- [ ] Ledger создан до первых стадий (7 файлов).
- [ ] После каждого этапа обновлены `handoff-bundle.md` и `stage-gate-ledger.md`.
- [ ] `inputs_used` отражает реально прочитанные файлы.
- [ ] Все пропуски записаны как `skipped_with_reason`, `skipped_by_scale`, `partial` или `blocked`.
- [ ] Масштаб зафиксирован в `run-plan.md` и `run-state.json`; стадии вне масштаба перечислены как `skipped_by_scale`.
- [ ] `yarn workflow:sync <run-dir>` выполнен после ручных правок.
- [ ] `yarn workflow:validate <run-dir> --profile standard` (или `--profile reference`) пройден.

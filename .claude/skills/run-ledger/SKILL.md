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

Нормативный процесс — [`agent-pack/workflows/artifact-driven-pipeline.md`](../../../agent-pack/workflows/artifact-driven-pipeline.md). Skill даёт исполняемый минимум.

Главная ошибка, от которой он защищает: этап «сделан», но `handoff-bundle.md` и `stage-gate-ledger.md` не обновлены — и следующий агент (или следующая сессия после сжатия контекста) не знает, на чём стоит.

## 2. Обязательные inputs

- Директория run: `outputs/<project-slug>/<YYYY-MM-DD>/` или `research/projects/<research-slug>/<YYYY-MM-DD>/`.
- Существующий ledger: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`.
- Артефакты завершённого этапа.

## 3. Процедура

### При старте run

1. Создай директорию run по правилам маршрутизации: продуктовый workflow → `outputs/<project-slug>/<YYYY-MM-DD>/`; standalone research/CJM → `research/projects/<research-slug>/<YYYY-MM-DD>/`; тестовый прогон → `outputs/temp/`.
2. Создай обязательный ledger **до первых стадий**: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`.
3. Зафиксируй в `run-plan.md`: тип работы, профиль (`standard`/`reference`), **масштаб** (`full`/`increment`/`patch`, см. CLAUDE.md §0.2), **маршрут** (`code`/`figma`, см. CLAUDE.md §0.3), последовательность стадий и non-goals. Это три независимые оси: профиль — «какого типа задача», масштаб — «какого размера», маршрут — «через какой инструмент делается макет». Не уверен в масштабе — бери `full`.
3a. Стадии, которые масштаб исключает, перечисли сразу в `stage-gate-ledger.md` как `skipped_by_scale` с указанием масштаба. Пропуск по масштабу — легальное решение, но только записанное: молчаливый пропуск неотличим от забытой стадии. Это проверяется машинно: на полном прогоне валидатор возвращает ошибку для каждой стадии вне масштаба, у которой нет строки `skipped_by_scale`. Список даёт `getStagesSkippedByScale` (или `yarn workflow:validate <run-dir> --scale <scale>`).

### После каждого этапа

4. **`handoff-bundle.md`:** completed artifacts, принятые решения, риски, следующий артефакт. Это то, что реально читает следующий агент.
5. **`stage-gate-ledger.md`:** статус стадии (`success`/`partial`/`blocked`), gate notes, результат validation, **вердикт Agent Output Critic** для делегированных стадий.
5a. **Вердикт Critic — часть записи, а не устная оценка.** Для стадии, выполненной субагентом, оркестратор прогоняет `yarn agent:verify-output <отчёт>` и пишет вердикт (`accepted` / `accepted_with_warnings` / `rejected`) рядом с validation notes. `rejected` несовместим с `success`: отчёт заявляет, а Critic сверяет с диском, git и валидатором. Причина правила — два реальных случая в run `contractor-payment-demo`: прерванный агент оставил состояние, выглядевшее завершённым, и отчёт `success` о правке, не изменившей результат валидатора.
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

### 4.0. Показ человеку фиксируется строкой `human_review`

Два гейта человека внутри `08-frontend` (`CLAUDE.md` §5, пункты 8.5a/8.5b) записываются в `stage-gate-ledger.md`:

```
human_review: 8.5a | Storybook показан 2026-07-29, замечания: тени на кнопках, серые поля
human_review: 8.5b | dev-сервер показан 2026-07-29, замечания: зазор кнопок 32 вместо 12
```

Обязательны маркер `human_review:` и номер точки; замечания кратко, «замечаний нет» — валидная запись.

**Проверяется машинно:** `yarn workflow:validate` после отработавшей `08-frontend` требует обе строки, иначе `08`, `09` и `11` не закрываются как `success`. Показ невозможен по окружению — `process_deviation` с причиной, а не пропуск.

Записывает оркестратор в момент показа, а не задним числом при закрытии run: запись, восстановленная по памяти, не отличается от невыполненного гейта.

### 4.1. Повторный заход оформляется заходом, а не переписыванием

Правка артефакта после внешнего замечания добавляется **отдельным датированным `##`-заходом** с разметкой канала, а не вливается в текст:

```
## Правки по замечаниям пользователя (2026-07-29)
<!-- retro: pass=2 found_by=user_device -->
```

Значения `found_by` от дешёвого канала к дорогому: `validator`, `agent_self`, `qa`, `orchestrator`, `user_review`, `user_device`.

Почему это обязанность, а не пожелание: `yarn workflow:retro` считает возвраты по датированным заголовкам, а канал находки машинно не выводится — кто нашёл дефект, знает только тот, кто в этот момент правит. На run `a3-shadcn` (2026-07-29) ни один агент разметку не поставил и ни один не оформил правку заходом: отчёты переписывались целиком. Ретро показало **0 повторных заходов и 0 дорогих находок** при девяти фактических возвратах и восьми дефектах, найденных пользователем глазами. Порог «хотя бы одна находка `user_device`» не сработал на своём главном случае.

### 4.2. Знание пишется туда, где его будут искать, а не туда, где идёт правка

Перед фиксацией любого знания — вопрос: **кто прочитает это в следующий раз**.

| Знание | Место |
|---|---|
| О библиотеке или стеке (поведение shadcn, Tailwind, реестра) | `CLAUDE.md` §6.1 |
| О процессе студии (гейты, статусы, маршруты) | `agent-pack/workflows/claude-operating-rules.md` |
| О конкретном продукте (значения, node id, решения этого run) | рядом с продуктом: run-каталог, `design/figma/<slug>/`, комментарий в его коде |
| Переносимое ремесло (как собирать в Figma, как верстать, как аудировать) | соответствующий плагин `plugins/*` |

Знание о библиотеке, записанное в продуктовый файл, — дефект размещения, даже если текст верен: следующий продукт этот файл не откроет. Прецеденты: `token-map.md`, описывавший 28 % реальности, и правило про `shadow-xs`, записанное 2026-07-29 в `apps/frontend/src/styles/a3.css` вместо `CLAUDE.md` §6.1 — нашёл пользователь вопросом «а если я буду собирать другие макеты, откуда ты это вспомнишь». Машинные сторожа против расползания инструкций такое не ловят: запись формально корректна и лежит в валидном файле.

## 5. Validation gates

- [ ] Ledger создан до первых стадий (7 файлов).
- [ ] После каждого этапа обновлены `handoff-bundle.md` и `stage-gate-ledger.md`.
- [ ] `inputs_used` отражает реально прочитанные файлы.
- [ ] Все пропуски записаны как `skipped_with_reason`, `skipped_by_scale`, `partial` или `blocked`.
- [ ] Масштаб зафиксирован в `run-plan.md` и `run-state.json`; стадии вне масштаба перечислены как `skipped_by_scale`.
- [ ] `yarn workflow:sync <run-dir>` выполнен после ручных правок.
- [ ] `yarn workflow:validate <run-dir> --profile standard` (или `--profile reference`) пройден.

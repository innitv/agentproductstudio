---
id: outputs-cleanup
name: outputs-cleanup
title: "Outputs Cleanup (Уборка И Архивация Запусков)"
description: "Использовать для задач типа cleanup/sorting: разбор outputs/temp, устаревших run-каталогов, грязного рабочего дерева и архивации завершённых запусков. Skill требует инвентаризации до удаления, отделяет archive от delete, запрещает удалять run с незакрытыми обязательствами и получает approval delete_data перед необратимым удалением."
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
required_outputs:
  - stage_gate_ledger
approval_actions:
  - delete_data
contract_schema: agent-pack/templates/skill.template.md
validation_commands:
  - yarn workflow:list
---

# Skill: Outputs Cleanup (Уборка И Архивация Запусков)

## 1. Назначение

Skill применяется, когда тип работы — `cleanup/sorting`: разобрать `outputs/temp`, `outputs/products` (legacy), `research/temp`, архивы или грязное рабочее дерево.

Два правила задают всю дисциплину:

- **Cleanup не смешивается с feature work.** Уборка идёт отдельной задачей и отдельным коммитом, иначе в диффе не разобраться, что было удалено намеренно.
- **Инвентаризация до удаления.** Если содержимое каталога противоречит тому, как его описали («там мусор»), это повод показать находку пользователю, а не удалить.

## 2. Обязательные inputs

- Явный запрос пользователя на уборку с указанием области.
- `yarn workflow:list` — какие run активны, а какие завершены.
- Содержимое целевых каталогов: что там на самом деле лежит.
- Approval `delete_data` с exact path target — перед любым необратимым удалением.

## 3. Процедура

1. **Инвентаризация.** Перечисли, что лежит в целевой области: run-каталоги с датами, их статус (`success`/`partial`/`blocked`), размер, есть ли незакрытые обязательства (blocked approvals, needs_validation, неопубликованный research).
2. **Классификация.** Раздели на три группы:
   - **Archive** — завершённый run, который может понадобиться: `yarn workflow:archive <run-dir>` → `outputs/archive/<project-slug>/<YYYY-MM-DD>/`.
   - **Delete** — временные прогоны без ценности: `outputs/temp/**`, `yarn workflow:cleanup-temp`.
   - **Keep** — активные run и всё, у чего есть незакрытые обязательства.
3. **Покажи план пользователю** до выполнения: что уйдёт в архив, что удаляется, что остаётся. Список конкретный, а не «почищу временные файлы».
4. **Approval.** Необратимое удаление требует approval `delete_data` с exact path (см. [`approval-gate`](../approval-gate/SKILL.md)). Архивация — перемещение, а не удаление, и такого approval не требует.
5. **Выполнение.** `yarn outputs:cleanup`, `yarn workflow:cleanup-temp`, `yarn workflow:archive <run-dir>` — по составленному плану.
6. **Синхронизация индексов.** После перемещений обнови `outputs/registry.json` и `research/registry.json` — они навигационные, и рассинхрон делает их бесполезными.
7. **Запись.** Зафиксируй в `stage-gate-ledger.md`: что заархивировано, что удалено, с чьим approval.

## 4. Evidence и failure modes

Evidence: инвентарный список до уборки, план (archive/delete/keep), approval record для удалений, обновлённые registry, итоговый список изменений.

- **`blocked`** — approval `delete_data` не получен: run остаётся на месте.
- **Запрещено** — удалять run с незакрытыми обязательствами (blocked approval, неопубликованный research, `needs_validation` без переноса выводов). Сначала обязательство закрывается или переносится, потом уборка.
- **Запрещено** — удалять то, что не создавал текущий процесс, если содержимое не совпадает с описанием. Показать пользователю и спросить.
- **Не смешивать** — cleanup-коммит не содержит функциональных правок.

## 5. Validation gates

- [ ] Инвентаризация выполнена; статусы run проверены через `yarn workflow:list`.
- [ ] План (archive / delete / keep) показан пользователю конкретным списком.
- [ ] Approval `delete_data` с exact path получен перед необратимым удалением.
- [ ] Run с незакрытыми обязательствами не удалены.
- [ ] `outputs/registry.json` и `research/registry.json` синхронизированы.
- [ ] Cleanup не смешан с feature work в одном коммите.

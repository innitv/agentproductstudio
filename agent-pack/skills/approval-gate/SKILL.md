---
id: approval-gate
name: approval-gate
title: "Approval Gate (Интерактивное Одобрение Внешних Действий)"
description: "Использовать перед любым действием, где данные покидают локальную песочницу или меняется внешняя система: Notion publish, Figma canvas write, git commit/push, deploy, изменение секретов, удаление данных, внешние сообщения, agentic model-provider call. Skill исполняет Interactive Question Gate (approval-request с exact target, вопрос в чате при отсутствии TTY, запись approve/deny) и Process Deviation Record при пропуске шага."
platforms:
  - claude
  - open-code
mcp_servers: []
strictness_profile: strict
owner_stage_ids:
  - 00-intake
  - 01-research
  - 04-design
  - 06-screens
  - 12-release
required_inputs:
  - run_plan
  - approval_record
  - stage_gate_ledger
required_outputs:
  - handoff_bundle
  - stage_gate_ledger
approval_actions:
  - notion_research_publish
  - notion_agile_export
  - notion_prd_export
  - figma_write
  - external_research_provider_call
  - model_provider_call
  - git_write
  - deploy
  - delete_data
  - change_secrets
  - send_external_message
  - external_write
validation_commands:
  - yarn workflow:approvals
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Approval Gate (Интерактивное Одобрение Внешних Действий)

## 1. Назначение

Skill применяется **до** любого действия, где данные покидают локальную песочницу или меняется внешняя система. Он существует потому, что типичный сбой здесь — не отказ пользователя, а **молчаливый пропуск вопроса**: агент либо тихо ставит stage в `blocked`, не спросив человека, либо выполняет внешнюю запись, посчитав общую фразу «давай, публикуй» за approval.

Нормативные источники: [`agent-pack/guardrails/approval-matrix.md`](../../guardrails/approval-matrix.md) (что требует approval) и [`agent-pack/workflows/claude-operating-rules.md`](../../workflows/claude-operating-rules.md), раздел 6 (Interactive Question Gate, Process Deviation Record).

Главное правило: **агент не имеет права молча пропускать approval-запрос.** Тихий перевод этапа в `blocked`/`partial` без попытки спросить человека — сам по себе нарушение.

## 2. Обязательные inputs

- `run-plan.md` — какой run и какой профиль.
- Текущее состояние approvals: `yarn workflow:approvals <run-dir>`.
- `stage-gate-ledger.md` — куда пишется результат gate.
- Точная цель действия (exact target): id страницы Notion, file/node Figma, repo/branch, environment, provider/stage.

## 3. Процедура

1. **Классифицируй действие** по [approval-matrix](../../guardrails/approval-matrix.md). Локальная запись артефакта и локальная команда валидации approval не требуют. Всё, что уходит наружу, — требует.
2. **Определи exact target.** Approval matching строгий: targetless approval не покрывает targeted request, и наоборот. Для agentic model-provider calls формат — `openai_agents_sdk:<owner>:<stage-id>`.
3. **Запроси интерактивно:**
   ```
   yarn workflow:approval-request <run-dir> <action> --target <exact-target> --by human --reason "<причина>"
   ```
4. **Если TTY недоступен** — задай отдельный заметный вопрос в чате через `AskUserQuestion`. Вопрос обязан называть: действие, exact target и какие данные покинут локальную песочницу. Для provider calls — назвать провайдера и stage/run target.
5. **Запиши ответ:** `yarn workflow:approve <run-dir> <action> --target <exact-target>` или `yarn workflow:deny ...`. Approval без записи не существует.
6. **Выполни действие** только после записанного approve. При denial — stage получает `blocked`/`partial`, причина фиксируется в артефактах.
7. **Post-write verification.** После внешней записи проверь реальное состояние (metadata/screenshot/fetch), а не сообщение об успехе.

**Что не считается approval:** общая фраза пользователя «сделай», «давай», «продолжай», «опубликуй» — если action требует exact target или отдельный waiver. Approval из прошлой задачи или прошлого run. Approval на другой target.

**Исключение:** явно включённые non-blocking DeepSeek/Gemini advisory checks на `01-research` не являются отдельным provider opt-in, не требуют approval-вопроса и не блокируют readiness при сбое — но логируются в run ledger. Через них запрещены любые внешние записи.

## 4. Evidence и failure modes

Evidence: approval record с action, exact target, `approved_by`, timestamp; запись gate в `stage-gate-ledger.md` и `handoff-bundle.md`; для внешних записей — post-write verification evidence.

- **`blocked`/`partial`** — approval запрошен и получен denial, либо отсутствуют credentials/target/права. Причина пишется в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `release-notes.md`.
- **`process_deviation`** — агент выполнил внешнее действие, записал approval, пропустил provider/gate или изменил статус **без** требуемого интерактивного вопроса. Фиксируется немедленно в `stage-gate-ledger.md`, `handoff-bundle.md` и `release-notes.md` с полями: action, exact target, что фактически сделано, какой интерактивный шаг пропущен, remediation. Скрывать deviation или переписывать историю так, будто gate пройден корректно, запрещено.
- **Запрещённый обход:** заменять требуемый provider/API/MCP локальным аналогом, чтобы обойти approval.

## 5. Validation gates

- [ ] Действие классифицировано по approval-matrix; для локальных операций gate не вызывался впустую.
- [ ] Exact target определён и совпадает в request и в записи approve/deny.
- [ ] Интерактивный запрос выполнен: `workflow:approval-request` или заметный вопрос в чате через `AskUserQuestion`.
- [ ] Ответ человека записан через `workflow:approve`/`workflow:deny`; `yarn workflow:approvals <run-dir>` показывает актуальное состояние.
- [ ] Внешнее действие выполнено только после записанного approve.
- [ ] После внешней записи выполнена post-write verification.
- [ ] При пропуске любого шага записан `process_deviation`, а не «успешно пройденный gate».

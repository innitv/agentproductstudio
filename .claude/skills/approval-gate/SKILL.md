---
name: approval-gate
description: Использовать перед любым действием, где данные покидают локальную песочницу или меняется внешняя система: Notion publish, Figma canvas write, git commit/push, deploy, изменение секретов, удаление данных, внешние сообщения, agentic model-provider call. Skill исполняет Interactive Question Gate (approval-request с exact target, вопрос в чате при отсутствии TTY, запись approve/deny) и Process Deviation Record при пропуске шага.
---

# Approval Gate (Интерактивное Одобрение Внешних Действий)

Типичный сбой здесь — не отказ пользователя, а **молчаливый пропуск вопроса**: агент тихо ставит stage в `blocked`, не спросив человека, либо считает общую фразу «давай, публикуй» за approval. Skill закрывает оба сценария.

**Полная процедура, failure modes и Process Deviation Record — в [`agent-pack/skills/approval-gate/SKILL.md`](../../../agent-pack/skills/approval-gate/SKILL.md). Следуй ей.** Матрица действий — [`agent-pack/guardrails/approval-matrix.md`](../../../agent-pack/guardrails/approval-matrix.md).

## Когда использовать
- Notion publish/update, Figma canvas write, deploy, изменение секретов, удаление данных, внешние сообщения.
- Git commit/push, если пользователь не запросил это явно в текущей задаче.
- Agentic `model_provider_call` и `external_research_provider_call`.

Не нужен для локальной записи артефактов и локальных команд валидации.

## Ключевые шаги
- Определи exact target: matching строгий, targetless approval не покрывает targeted request.
- `yarn workflow:approval-request <run-dir> <action> --target <exact-target> --by human --reason "<причина>"`.
- Нет TTY — задай отдельный заметный вопрос через `AskUserQuestion`, назвав действие, target и какие данные уйдут наружу.
- Запиши ответ: `yarn workflow:approve` / `yarn workflow:deny`. Approval без записи не существует.
- Действуй только после записанного approve; после внешней записи — post-write verification (metadata/screenshot/fetch).
- Пропустил шаг — пиши `process_deviation` в ledger, handoff и release notes. Не выдавай gate за пройденный.

## Обязательные проверки
- `yarn workflow:approvals <run-dir>`

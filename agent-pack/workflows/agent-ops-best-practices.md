# Лучшие практики агентных workflow

Дата обзора: 2026-06-02.

Этот документ фиксирует практики, которые можно применять в `product-agent-studio` без переноса чужого runtime или шаблонного поведения. Внешние `outputs/*` и старые run artifacts не являются источником правил; этот документ относится только к нормативному слою `AGENTS.md`, `agent-pack/workflows`, `agent-pack/agents`, `agent-pack/templates`, `agent-pack/quality` и runtime-командам.

## Адаптированные наблюдения

| Наблюдение | Что берем |
|---|---|---|
| Dynamic workflow + sequential workflow: planner routes tasks, specialists run parallel/sequential, large outputs are summarized before handoff. | Разделять fixed pipeline и dynamic routing; сжимать context перед specialist handoff. |
| SOPs are markdown workflows with overview, parameters, step instructions, constraints, examples and troubleshooting. | Для повторяемых процедур заводить SOP-документ, а не раздувать `AGENTS.md`. |
| Agent ops loop: intake, execution, review, gate, record; run ledger, dashboard events, policy gates, replayable state. | Удерживать workflow как ops loop и всегда иметь record: ledger, artifacts, logs, validation. |
| One task = one plan; plan stores progress, decisions, surprises, verification and can be cleaned after merge. | Для non-product задач использовать task-scoped execution plan вместо чтения старых `outputs`. |
| Workflow files support dry-run, validate, explicit inputs, metadata, workspace instructions, human gates and conditional routing. | Перед execution иметь validate/preflight; routing decisions должны быть структурными, не устными. |
| Agent/workflow/skill files have frontmatter, naming conventions and validators before publication. | Для новых skills/workflows требовать metadata, naming, validation и README/index update when applicable. |
| Single canonical guide, approval gates, architecture-aligned changes, high-signal context and memory/state discipline. | Не множить корневые инструкции; использовать linked procedures и focused context. |

## Принципы для нашего проекта

1. **Один нормативный слой.** Правила живут в `AGENTS.md` и `agent-pack/*`. `outputs/*` описывает конкретные запуски и не должен менять правила без отдельной проверки нормативных файлов и runtime.
2. **Pipeline + dynamic routing.** Полный продуктовый workflow остается fixed artifact-driven pipeline. Внутри этапов допустим dynamic routing специалистов, если входы и выходы явно зафиксированы.
3. **Task-scoped plans.** Для задач, которые не являются полным продуктовым workflow, агент может создать краткий ExecPlan по `agent-pack/templates/task-exec-plan.template.md` в `.agents/plans/<task-slug>/PLAN.md` или в текущем run directory.
4. **SOP over bloated AGENTS.** Повторяемая процедура оформляется как отдельный SOP по `agent-pack/templates/agent-sop.template.md`, затем ссылка добавляется в релевантный workflow/agent/skill.
5. **Validate before handoff.** Каждый переход этапа должен иметь локальную проверку: `workflow:validate`, `workflow:agentic-preflight`, `docs:audit`, `typecheck` или documented blocker.
6. **Record everything important.** Решения, approvals, skipped providers, validation, screenshots, diff results and blockers фиксируются в `stage-gate-ledger.md`, `handoff-bundle.md` или task ExecPlan.
7. **Human gates are explicit.** Любая внешняя запись, model-provider call с project context, удаление, deploy, Figma write, Notion publish и git write без текущего запроса пользователя требуют явного approval с exact target.
8. **Context is a budgeted asset.** Перед late-stage handoff использовать `context-truncator.ts`; специалистам передавать только нужные artifacts, decisions, risks and next action.
9. **Artifact output is the contract.** `status: success` возможен только если specialist вернул полный Markdown обязательного stage artifact в `outputs.<artifact_name>` или `outputs.<file_name>`.
10. **Config is code.** Agent, skill, workflow and policy files должны проходить docs/config validation. Конфликтующие инструкции считаются дефектом, а не “стилем”.

## Что не берем

- Не вводим отдельный внешний orchestrator framework вместо текущего runtime.
- Не делаем `outputs/products/` source of truth.
- Не используем чужие готовые UI/templates для frontend.
- Не добавляем параллельных агентов без владельца результата и gate criteria.
- Не разрешаем `skip-gates` для полного workflow.

## Минимальный audit checklist

Перед изменением agent workflow проверь:

- Затрагивает ли правка нормативный слой или только прошлый run artifact.
- Есть ли один владелец итогового результата.
- Есть ли structured inputs/outputs и `inputs_used`.
- Есть ли gate для validation и human approval.
- Не появляется ли дублирование правил в `AGENTS.md`, workflow, agent и skill одновременно.
- Обновлены ли templates/SOP, если процедура стала повторяемой.

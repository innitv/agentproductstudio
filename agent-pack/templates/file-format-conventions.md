# File Format Conventions

## Output Directory

Все артефакты полного workflow лежат в:

```text
outputs/<project-slug>/<YYYY-MM-DD>/
```

## Required Run Files

- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`

## Task-Scoped Files

Для ограниченных инженерных задач вне полного продуктового workflow можно использовать:

- `agent-pack/templates/task-exec-plan.template.md` -> `.agents/plans/<task-slug>/PLAN.md` или текущий run directory.
- `agent-pack/templates/agent-sop.template.md` -> отдельный SOP-документ для повторяемой процедуры.

Task ExecPlan не заменяет `run-plan.md` полного workflow. SOP не должен дублировать весь `AGENTS.md`; он фиксирует только одну повторяемую процедуру и подключается ссылкой из workflow/agent/skill.

## Required Research Files

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Language

- Артефакты: русский.
- Код, имена файлов, переменные: английский.

## Validation

Перед финальным ответом полного workflow:

```text
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

## Structured Payload

Для schema-aware validation markdown артефакт может содержать YAML frontmatter:

```yaml
---
schema_payload:
  status: ready
  inputs_used:
    - upstream-artifact.md
---
```

Или JSON code block:

```artifact-json
{
  "status": "ready",
  "inputs_used": ["upstream-artifact.md"]
}
```

Если для артефакта есть schema в `agent-pack/schemas/`, `workflow:validate` проверит payload по этой schema.

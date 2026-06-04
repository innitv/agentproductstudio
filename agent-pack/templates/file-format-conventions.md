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
- `run-state.json`
- `run-meta.json`
- `artifact-manifest.json`
- `run-index.md`

## Output Artifact Types

`outputs/<project-slug>/<YYYY-MM-DD>/` является ledger конкретного запуска. `artifact-manifest.json` должен помогать понять назначение каждого файла:

- `state`: JSON state/checkpoint files for resume and status.
- `manifest`: navigation and ledger files such as `artifact-manifest.json` and `run-index.md`.
- `product_artifact`: stage outputs consumed by downstream agents, such as `prd.md`, `design-brief.md`, `copy-deck.md`.
- `evidence`: validation, QA, screenshots, visual diff, test-bench and audit proof.
- `external_record`: approval, publication, release, deploy and rollback records.
- `export`: human-readable packages prepared for external publication, such as `notion-research-export-ru.md`.

Человек начинает чтение с `run-index.md`. Агент или runtime начинает диагностику с `run-state.json`, `run-meta.json` и `artifact-manifest.json`.

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

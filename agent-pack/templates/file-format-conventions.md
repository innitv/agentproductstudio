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
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD>
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

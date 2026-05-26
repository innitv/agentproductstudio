# Workflow Engine Retry/Rerun Work Plan

## Goal

Добавить управляемое переисполнение стадий workflow engine, чтобы можно было исправлять `partial`, `blocked` или `failed` stages без пересоздания всего output-run.

## Why

Первый workflow engine уже сохраняет `run-state.json` и `stage-results/`, но после partial research или blocked QA/release нужен удобный способ:

- переисполнить конкретную стадию после настройки provider keys;
- сбросить downstream стадии, которые зависят от переисполненной стадии;
- продолжить workflow через `resume`;
- сохранить историю attempts и stage results.

## Scope

### In

- CLI команда:
  - `yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> <stage-id> --force`
- Engine API:
  - `rerunWorkflowStage(outputDir, stageId, { force })`
- Reset logic:
  - forced stage becomes `pending`;
  - downstream stages become `pending` when they were `partial`, `blocked`, `failed` or `completed`;
  - intake is protected from force rerun in this increment.
- Status output should reflect new attempts and reset stages.

### Out

- Parallel retry.
- Provider-specific retry backoff.
- Selective artifact deletion.
- Reference profile rerun logic.

## Execution Plan

1. Add stage order helpers.
   - Resolve stage ids from `workflow-stages.ts`.
   - Find downstream stages by order for standard profile.

2. Add rerun API.
   - Validate `run-state.json` exists.
   - Refuse `00-intake` force rerun.
   - Mark target and downstream stages as `pending`.
   - Append ledger note.
   - Execute `resumeWorkflowEngine`.

3. Add CLI command.
   - `run-stage <outputDir> <stageId> --force`.
   - Clear error message when `--force` is missing for already attempted stage.

4. Update docs.
   - `package.json`
   - `COMMANDS.md`
   - `runtime/typescript/README.md`

5. Validate.
   - `yarn typecheck`
   - `yarn workflow:run-stage outputs/engine-smoke/2026-05-26 01-research --force`
   - `yarn workflow:status outputs/engine-smoke/2026-05-26`
   - `yarn workflow:validate outputs/engine-smoke/2026-05-26 --profile standard`
   - `yarn qa:quick`

## Success Criteria

- A blocked/partial run can force-rerun `01-research`.
- Downstream stages are regenerated after the forced stage.
- `run-state.json` remains valid and readable.
- Structural workflow validation stays green.


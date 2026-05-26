# Workflow Engine Work Plan

## Goal

Сделать настоящий локальный workflow engine поверх текущих artifact-driven правил: persisted state, stage results, resume/status CLI и последовательное выполнение standard workflow без потери уже созданных артефактов.

## Scope

### In

- `run-state.json` в output-папке.
- `stage-results/<stage-id>.json` для machine-readable результата каждого stage.
- Sequential engine для standard workflow.
- CLI:
  - `workflow:start "<goal>"`
  - `workflow:resume outputs/<project-slug>/<YYYY-MM-DD>`
  - `workflow:status outputs/<project-slug>/<YYYY-MM-DD>`
- Валидация после stage через существующий `validateWorkflowRun`.
- Повторное использование существующих генераторов intake/research/downstream artifacts.

### Out For First Increment

- Parallel execution.
- Full reference profile automation.
- Notion publication automation.
- Durable distributed execution or external queue.
- Semantic LLM evals.

## Execution Plan

1. Add workflow state model.
   - Define stage statuses: `pending`, `running`, `completed`, `partial`, `blocked`, `failed`, `skipped`.
   - Persist `run-state.json`.
   - Persist per-stage results in `stage-results/`.

2. Add sequential engine.
   - Load or initialize run state.
   - Execute stages in dependency order.
   - Skip already completed stages on resume.
   - Validate after each stage.
   - Stop on validation errors or blocked status.

3. Add stage executors.
   - `00-intake`: call `runLandingWorkflow`.
   - `01-research`: call `runResearchStage`, allow `partial` when providers are unavailable but artifacts validate.
   - Downstream stages: call local deterministic artifact generation from current local runner.

4. Add CLI.
   - `start`: create a new run and execute standard workflow.
   - `resume`: continue existing run.
   - `status`: print stage table and validation summary.

5. Update commands/docs.
   - Add scripts to `package.json`.
   - Add usage to `COMMANDS.md` and runtime README.

6. Validate.
   - `yarn typecheck`
   - `yarn workflow:start "..."` sample
   - `yarn workflow:status outputs/...`
   - `yarn workflow:validate outputs/... --profile standard`
   - `yarn qa:quick`
   - `yarn build`

## Success Criteria

- A new workflow run can be started and completed with persisted state.
- Resume does not recreate completed stages.
- Status command is readable and machine state is inspectable.
- Generated output validates with zero workflow errors.
- Existing commands keep working.

## Risks

- Research may remain `partial` when Tavily/DeepSeek are not configured.
- Existing validator is structural, not semantic.
- Generated downstream artifacts are deterministic starter artifacts, not final human-approved product decisions.


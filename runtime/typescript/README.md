# Каркас TypeScript Runtime

Эта папка содержит вспомогательный runtime для работы через Codex в IDE: локальные проверки, scaffold, persisted workflow state, validation, research/reference adapters и QA-команды.

Пользовательский сценарий проекта один: запросы выполняются через Codex внутри IDE/чата. Runtime не является отдельным способом работы.

## Основные файлы

- `workflow-stages.ts` — stage ids, владельцы, обязательные артефакты и секции.
- `workflow-state.ts` — persisted `run-state.json` и `stage-results/*.json`.
- `workflow-engine.ts` — start/resume/status/run-stage для persisted workflow.
- `workflow-stage-executors.ts` — выбор research, local или approval-gated agentic executor.
- `run-workflow-engine.ts` — CLI entrypoint для `workflow:start`, `workflow:resume`, `workflow:status`, `workflow:run-stage`, approvals и agentic preflight/readiness commands.
- `agentic-rollout.ts`, `agentic-approval-targets.ts` — staged rollout agentic stages и стабильные approval targets для model provider calls.
- `run-local-workflow.ts` — deterministic local artifact generator.
- `run-landing-workflow.ts` — scaffold workflow-папки.
- `research-stage-runner.ts` — research stage runner для `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`.
- `reference-scan.ts`, `visual-diff.ts`, `visual-section-diff.ts`, `visual-reference-review.ts` — visual reference и screenshot QA.
- `approval-gate.ts` — локальный helper approval records для внешних записей.
- `doctor.ts` — диагностика структуры проекта, шаблонов и optional provider keys.
- `context-truncator.ts` — State Truncation Gate для поздних стадий.
- `agents.registry.ts`, `agents.sdk.ts`, `route.config.ts` — регистрация агентов и маршрутов для инспекции/совместимости.

## Runtime Contract

- Codex остаётся главным исполнителем и оркестратором в IDE.
- Runtime помогает сохранять артефакты, проверять структуру, вести state и запускать локальные проверки.
- Все внешние записи проходят через approval gate.
- Agentic model-provider calls проходят через target-scoped approval gate и включаются только для staged rollout stages.
- Отсутствующие optional provider keys считаются предупреждением, а не ошибкой проекта.
- Outputs валидируются по JSON Schema или required Markdown sections перед передачей следующему этапу.
- Agentic specialist output должен содержать structured envelope и Markdown для обязательного artifact в `outputs.<artifact_name>` или `outputs.<file_name>`; иначе stage понижается до `partial`.
- Sensitive inputs/outputs не сохраняются в traces для production-like запусков.

## Команды

```bash
yarn validate:config
yarn typecheck
yarn agents:inspect
yarn landing:run "<landing workflow goal>"
yarn workflow:run-local "<landing workflow goal>"
yarn workflow:start "<landing workflow goal>"
yarn workflow:start "<workflow goal>" --mode agentic
yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> 01-research --force
yarn workflow:agentic-stages
yarn workflow:agentic-preflight outputs/<project-slug>/<YYYY-MM-DD> --strict
yarn workflow:agentic-approval-commands outputs/<project-slug>/<YYYY-MM-DD> --by human --missing-only
yarn workflow:agentic-readiness outputs/<project-slug>/<YYYY-MM-DD> --strict
yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human
yarn workflow:deny outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human
yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
yarn workflow:doctor
yarn research:run outputs/<project-slug>/<YYYY-MM-DD> ["research query"]
yarn reference:scan "<reference url>" [slug]
yarn reference:diff reports/visual-review/<reference-slug> reports/visual-review/<local-slug> [output-dir]
yarn reference:section-diff "<reference url>" "<local url>" [output-dir]
yarn reference:review reports/visual-review/<slug> [local-url] [output-path] [--local-dir reports/visual-review/<local-slug>]
```

`workflow:validate` поддерживает профили `standard`, `reference` и `auto`. Standard workflow не требует `visual-reference-review.md`; reference workflow требует его строго.

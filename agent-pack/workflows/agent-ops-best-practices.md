# Лучшие практики агентных workflow

Дата обзора: 2026-06-02.

Этот документ фиксирует практики, которые можно применять в `product-agent-studio` без переноса чужого runtime или шаблонного поведения. Внешние `outputs/*` и старые run artifacts не являются источником правил; этот документ относится только к нормативному слою `AGENTS.md`, `agent-pack/workflows`, `agent-pack/agent-contracts`, `agent-pack/templates`, `agent-pack/quality` и runtime-командам.

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
| Multi-agent systems work лучше как software pipelines: shared state, explicit communication, guardrails, routing, handoff and recovery. | Оркестратор обязан держать route classification, delegation packet, stage gate, ledger и re-orchestration loop. |
| Research -> plan -> assign workflows require concrete artifacts at every transition and human checkpoints before irreversible actions. | Не передавать specialist stage без artifact contract, acceptance criteria и approval status. |
| Consensus workflows useful only when disagreement is explicit: agreement, divergent views, tie-break owner and chosen decision are recorded. | Для research/PRD/design конфликтов фиксировать Consensus & Conflict Pass в `handoff-bundle.md` и `stage-gate-ledger.md`. |
| QA agents are most useful when they inspect real surfaces, not summaries: browser state, accessibility tree, screenshots, traces, console/network signals and structured artifacts. | QA-агент обязан строить Evidence Matrix, а не ограничиваться текстовым впечатлением от артефактов. |
| Design QA catches issues that code review misses when it combines visual hierarchy, typography, spacing, contrast, responsive behavior and before/after screenshots. | Для visual/reference задач QA требует desktop/mobile screenshot evidence, section pairs и `visual-diff-result.json`. |
| Accessibility automation is only a first pass; recommendations need authoritative evidence or explicit `experience_based` labeling. | Accessibility-выводы в QA не должны выглядеть как абсолютные факты без evidence/source marker. |
| Multi-agent QA benefits from a meta-review / devil's advocate pass that challenges happy-path-only findings. | Если QA получает 100% pass, нужен отдельный False Positive Pass по mock-only, stale evidence, skipped negative cases и release risk. |
| Useful QA findings are classified by severity, owner, reproduction evidence and release impact. | `qa-report.md` должен иметь Severity Matrix: `blocker`, `critical`, `high`, `medium`, `low`, `info`. |
| Prototype agents work лучше как executable UX specifications: goal, entry points, state machine, alternate paths, test script and implementation handoff. | `prototype-report.md` должен связывать PRD/IA/design/copy с transition map, state inventory, manual test script и frontend handoff contract. |
| Good UX-flow agents avoid filling upstream gaps silently; they mark open decisions and blocked interactions before downstream implementation starts. | Prototype stage не додумывает отсутствующие validation/error/CTA decisions, а фиксирует `Missing Interactions` и `Open Decisions`. |
| Prototype reviews improve when they cover happy path, negative path, keyboard path and mobile path before frontend. | Manual test script в prototype artifact должен покрывать эти четыре пути до `08-frontend`. |
| Release agents work лучше when release is treated as an auditable change record: scope, validation, approvals, rollback, post-release checks and exact targets. | `release-notes.md` должен содержать Release Scope, Validation Matrix, Release Decision Matrix, Approval/External Records, Deployment Plan и Rollback Plan. |
| Agent deployment systems emphasize human approval before irreversible writes and one-step undo/revert paths for agent-made changes. | Release stage не делает git/deploy/Notion/Figma writes без approval и всегда фиксирует rollback readiness. |
| Changelog/release tooling separates added/changed/fixed/internal/dependency updates and includes links to evidence or commits. | В нашем release artifact изменения разделяются на product artifacts, code, config, tests, docs, external records и unrelated dirty tree. |
| Production release playbooks pair preflight checks with post-release smoke and monitoring windows. | Release notes должны включать Post-Release Smoke Checks и stop conditions, даже если фактический deploy не запрошен. |
| Design generation agents produce better downstream results when screens are grounded in tokens, components, states, responsive constraints and traceability rather than visual vibes. | `screens.md` должен содержать Input Readiness, Design-System Grounding, Screen Traceability, Component Inventory, State Inventory и Figma Readiness. |
| Figma/design-system agent tooling works best when variables, component variants, Auto Layout intent and screenshot verification are planned before writing to canvas. | Design generator обязан описать variables/styles/components, Auto Layout critical areas, canvas strategy и screenshot evidence plan до `use_figma`. |
| Design-to-code systems avoid drift by mapping Figma/design components to code components and preserving copy/source bindings. | Screen specs должны связывать component source, copy source, frontend owner и prototype/test signals. |

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
11. **Delegation packet before delegation.** Каждый specialist получает stage id, objective, inputs, allowed outputs, forbidden actions, gate, expected envelope и next consumer.
12. **Conflict resolution is explicit.** Оркестратор не усредняет мнения агентов; он выбирает решение по project rules, evidence, approval gates and downstream impact, а rejected alternatives записывает.
13. **Re-orchestration is normal.** Если вводные или upstream artifacts меняются, сначала определить affected artifacts and invalidated downstream stages, затем перезапускать только нужную часть pipeline.

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

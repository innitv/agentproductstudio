# Git Cleanup Batches — 2026-06-02

Источник: состояние после выполнения audit remediation `R1-R10`.

## Цель

Разделить текущий dirty tree на логические пачки, чтобы дальше можно было staged/commit/review без смешивания runtime fixes, visual tooling, agentic migration, frontend prototype и generated outputs.

## Batch A — Audit Validator Core

Статус: уже staged.

Файлы:

- `reports/git-cleanup-inventory-2026-06-02.md`
- `reports/git-cleanup-staging-2026-06-02.md`
- `reports/system-audit-2026-06-02.md`
- `reports/system-audit-remediation-plan-2026-06-02.md` staged base version
- `runtime/typescript/status-resolver.ts`
- `runtime/typescript/test-workflow-validator.ts`
- `runtime/typescript/validate-workflow-run.ts`

Покрывает:

- `R1` validator semantic gates.
- `R2` canonical status resolver.

Проверки:

- `yarn workflow:test-validator`
- `yarn typecheck`
- `yarn validate:config`

## Batch B — Audit Visual Gate And Tooling

Статус: staged.

Файлы:

- `runtime/typescript/visual-reference-review.ts`
- `runtime/typescript/test-visual-reference-review.ts`
- `tooling/scripts/capture-local-screenshots.mjs`
- `tooling/scripts/test-capture-local-screenshots.mjs`

Покрывает:

- `R3` visual reference gate requires `visual-diff-result.json`.
- `R4` generic screenshot capture CLI.
- `R5` evidence-driven comparison areas.

Проверки:

- `yarn tsx runtime/typescript/test-visual-reference-review.ts`
- `node tooling/scripts/test-capture-local-screenshots.mjs`
- `yarn typecheck`

## Batch C — Audit Runtime Sync And Context

Статус: staged.

Файлы:

- `runtime/typescript/sync-run-state.ts`
- `runtime/typescript/test-sync-run-state.ts`
- `runtime/typescript/context-truncator.ts`
- `runtime/typescript/test-context-truncator.ts`
- `package.json` partial hunks:
  - `workflow:sync` -> `runtime/typescript/sync-run-state.ts`

Покрывает:

- `R6` canonical `workflow:sync`.
- `R8` stronger State Truncation Gate.

Проверки:

- `yarn tsx runtime/typescript/test-sync-run-state.ts`
- `yarn tsx runtime/typescript/test-context-truncator.ts`
- `yarn workflow:sync outputs/apple-iphone-17/2026-06-02 --preview`
- `yarn typecheck`

Примечание:

- `package.json` staged только audit hunk; agentic scripts оставлены unstaged для Batch F.

## Batch D — Audit Config And E2E Coverage

Статус: partially staged.

Файлы:

- `runtime/typescript/validate-config-semantics.ts` staged
- `tests/playwright/frontend.spec.ts` unstaged
- `package.json` partial hunks:
  - `validate:config` запускает `validate-config.mjs && validate-config-semantics.ts` staged

Покрывает:

- `R7` Playwright coverage default product view.
- `R9` semantic config validator.

Проверки:

- `yarn validate:config`
- `yarn qa:playwright`
- `yarn typecheck`

Примечание:

- `R9` staged.
- `R7` остается unstaged, потому что тест зависит от Batch H frontend prototype.

## Batch E — Remediation Plan Updates

Статус: staged.

Файл:

- `reports/system-audit-remediation-plan-2026-06-02.md`

Покрывает:

- Журнал `R3-R9`.
- Текущий фокус `R10`.

Рекомендация:

- Можно держать вместе с Batch A как living plan, но финальную версию после `R10` лучше staged отдельным hunk или целиком после завершения всех audit batches.

## Batch F — Agentic Runtime / Approval Migration

Статус: unstaged/untracked, не часть audit remediation `R1-R9`.

Файлы:

- `runtime/typescript/run-workflow-engine.ts`
- `runtime/typescript/workflow-engine.ts`
- `runtime/typescript/workflow-state.ts`
- `runtime/typescript/workflow-stage-executors.ts`
- `runtime/typescript/agentic-approval-targets.ts`
- `runtime/typescript/agentic-rollout.ts`
- `runtime/typescript/approval-gate.ts`
- `runtime/typescript/test-agentic-*.ts`
- `runtime/typescript/test-approval-gate.ts`
- `package.json` partial hunks:
  - `workflow:approve`
  - `workflow:deny`
  - `workflow:approvals`
  - `workflow:agentic-*`
  - `workflow:test-agentic*`

Проверки:

- `yarn workflow:test-agentic`
- `yarn workflow:doctor`
- `yarn typecheck`

Рекомендация:

- Не смешивать с Batch A-D.
- Перед staging проверить как отдельную миграцию.

## Batch G — Docs / Agents / Guardrails

Статус: unstaged/untracked.

Файлы:

- `AGENTS.md`
- `COMMANDS.md`
- `README.md`
- `PROJECT_CONNECTION_WORK_PLAN.md`
- `AGENTIC_EXECUTION_MIGRATION_PLAN.md`
- `agent-pack/agents/*.agent.md`
- `agent-pack/guardrails/*.md`
- `agent-pack/quality/*.md`
- `agent-pack/templates/*.md`
- `agent-pack/workflows/*.md`
- `agent-pack/skills/*/SKILL.md`
- `integrations/observability/*.md`
- `runtime/typescript/README.md`

Проверки:

- `yarn docs:audit`
- `yarn validate:config`

Рекомендация:

- Лучше review после Batch F, потому что большая часть текста описывает agentic/approval/process changes.

## Batch H — Frontend Product Prototype

Статус: unstaged/untracked.

Файлы:

- `apps/frontend/src/App.tsx`
- `apps/frontend/src/views/EsportsMouseView.tsx`
- `apps/frontend/src/assets/cyber_mouse_black.png`
- `apps/frontend/src/assets/cyber_mouse_cyan.png`
- `apps/frontend/src/assets/cyber_mouse_silver.png`

Проверки:

- `yarn build`
- `yarn qa:playwright`

Рекомендация:

- Если A3 Aero является текущим default product view, Batch H нужно принять до/вместе с Batch D, иначе новые Playwright tests будут ссылаться на несуществующий экран.
- Если это эксперимент, Batch D нужно адаптировать под актуальный default view.

## Batch I — Outputs / Generated

Статус: unstaged/untracked.

Файлы:

- `outputs/README.md`
- `outputs/registry.json`
- `outputs/product-agent-studio-deck.html` deleted
- `outputs/apple-iphone-17/`
- `design/figma/product-agent-studio-deck/design-spec.md`

Рекомендация:

- Не коммитить вместе с runtime/docs.
- Удаление `outputs/product-agent-studio-deck.html` подтвердить отдельно.
- `outputs/apple-iphone-17/` можно оставить как локальный regression fixture или перенести/удалить после explicit approval.

## Batch J — Misc Tooling / Env

Статус: unstaged.

Файлы:

- `.env.example`
- `tooling/scripts/cleanup-outputs.mjs`

Рекомендация:

- Проверить отдельно: `.env.example` может влиять на doctor/provider behavior, `cleanup-outputs.mjs` связан с policy удаления старых проектов.

## Рекомендуемый порядок

1. Commit/review staged `audit-remediation-runtime` пачку.
2. Stage Batch H if A3 Aero default view сохраняется.
3. Stage remaining Batch D `tests/playwright/frontend.spec.ts` only after Batch H decision.
4. Review Batch F + G as agentic migration.
5. Resolve Batch I generated outputs.
6. Resolve Batch J cleanup/env policy.

## Что нельзя делать без отдельного подтверждения

- `git checkout --` / revert чужих изменений.
- Удалять `outputs/apple-iphone-17/`.
- Восстанавливать или окончательно удалять `outputs/product-agent-studio-deck.html`.
- Удалять A3 Aero frontend prototype.
- Коммитить/push без явного запроса.

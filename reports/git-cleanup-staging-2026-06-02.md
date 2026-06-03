# Git Cleanup Staging — 2026-06-02

## Что уже staged

Эта пачка выделена как безопасная часть audit/runtime fixes без смешивания с agentic migration и frontend prototype:

- `package.json` partial staged:
  - `validate:config` запускает semantic config validator
  - `workflow:sync` указывает на `runtime/typescript/sync-run-state.ts`
  - `workflow:test-validator`
- `reports/git-cleanup-inventory-2026-06-02.md`
- `reports/git-cleanup-batches-2026-06-02.md`
- `reports/git-cleanup-staging-2026-06-02.md`
- `reports/system-audit-2026-06-02.md`
- `reports/system-audit-remediation-plan-2026-06-02.md`
- `runtime/typescript/context-truncator.ts`
- `runtime/typescript/validate-workflow-run.ts`
- `runtime/typescript/status-resolver.ts`
- `runtime/typescript/sync-run-state.ts`
- `runtime/typescript/test-context-truncator.ts`
- `runtime/typescript/test-sync-run-state.ts`
- `runtime/typescript/test-visual-reference-review.ts`
- `runtime/typescript/test-workflow-validator.ts`
- `runtime/typescript/validate-config-semantics.ts`
- `runtime/typescript/visual-reference-review.ts`
- `tooling/scripts/capture-local-screenshots.mjs`
- `tooling/scripts/test-capture-local-screenshots.mjs`

Покрытие staged-пачки:

- `R1` validator semantic gates.
- `R2` canonical status resolver.
- `R3` visual reference gate requires `visual-diff-result.json`.
- `R4` generic screenshot capture CLI.
- `R5` evidence-driven comparison areas.
- `R6` canonical `workflow:sync`.
- `R8` stronger State Truncation Gate.
- `R9` semantic config validator.
- `R10` cleanup batch map.

## Что оставлено unstaged специально

Эти файлы связаны с audit/runtime fixes, но одновременно содержат agentic/runtime migration или frontend prototype:

- `package.json`
  - staged audit part: `validate:config`, `workflow:sync`, `workflow:test-validator`
  - unstaged agentic part: `workflow:approve`, `workflow:deny`, `workflow:agentic-*`, `workflow:test-agentic*`
- `tests/playwright/frontend.spec.ts`
  - audit part: `R7` coverage
  - blocked by frontend prototype acceptance, because it depends on A3 Aero view/assets
- `runtime/typescript/workflow-engine.ts`
  - audit part: shared `summarizeRunStatus`
  - agentic part: execution mode and extracted stage executor
- `runtime/typescript/workflow-stage-executors.ts`
  - audit part: shared status resolver usage
  - agentic part: new agentic executor, approval gate, Notion approval handling
- `runtime/typescript/workflow-state.ts`
  - agentic execution mode type/state

## Почему так

Сортировка сейчас должна уменьшить грязь, а не создать ложную чистоту. Если staged-пачка включит смешанные файлы целиком, audit fix и agentic migration снова окажутся в одном коммите/ревью.

## Следующий шаг

1. Принять staged пачку как `audit-remediation-runtime`.
2. Отдельно решить Batch H frontend prototype, потому что от него зависит `R7` Playwright coverage.
3. Затем разбирать `Batch F Agentic Runtime / Approval Migration`.

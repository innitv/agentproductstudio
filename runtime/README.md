# Runtime

Эта папка предназначена для исполняемого слоя системы продуктовой оркестрации.

Документы в `agent-pack/agents/`, `agent-pack/workflows/`, `agent-pack/artifacts/`, `agent-pack/templates/`, `agent-pack/guardrails/` и `agent-pack/schemas/` задают продуктовую и архитектурную спецификацию. Runtime должен реализовать эти правила через OpenAI Agents SDK или другой совместимый агентный слой.

## Рекомендуемый старт

Основной вариант для будущей реализации: TypeScript.

Причины:

- удобно связывать агентный workflow с frontend-инструментами;
- Zod-схемы хорошо подходят для structured outputs;
- проще интегрировать будущий web UI для продуктового дизайнера.

## Требования к runtime

- `orchestrator` владеет финальным ответом;
- специалисты вызываются как agents-as-tools;
- `orchestrator` строит dependency graph и сам выбирает порядок запуска субагентов;
- IA, screens, prototype report и test bench result являются частью базового продуктового pipeline;
- route tools описаны в `runtime/typescript/route.config.ts`;
- adaptive research layer описан в `runtime/typescript/research.config.ts` и `integrations/mcp/research-providers.md`;
- lifecycle hooks описаны в `runtime/typescript/hooks.ts`; Claude Code hooks — в `.claude/settings.json` и `.claude/hooks/` (legacy `.codex/hooks/` в `archive/legacy-codex/`);
- command/action rules описаны в `.claude/settings.json` permissions (legacy `.codex/rules/` в `archive/legacy-codex/`);
- handoff используется только по правилам `agent-pack/workflows/landing-agent-orchestration.workflow.md`;
- outputs валидируются по схемам из `agent-pack/schemas/`;
- рискованные действия проходят approval matrix;
- tracing настроен по `integrations/observability/tracing.policy.md`;
- reference-driven проверки используют единый visual toolchain:
  - `reference-scan.ts` собирает Firecrawl/Playwright reference evidence;
  - `visual-diff.ts` автоматически сопоставляет `reference-*` и `local-*` PNG pairs, включая section screenshots;
  - `visual-section-diff.ts` сравнивает URL-to-URL секции с универсальными default selectors или `--sections sections.json`;
  - `visual-reference-review.ts` генерирует `visual-reference-review.md` с `Source Pair Matrix`;
- Figma/frontend visual QA должен различать пары `reference_to_figma`, `figma_to_frontend`, `reference_to_frontend` и `spec_to_frontend_behavior`.
- Figma roundtrip использует `design_system_mode=reuse|extend|product_specific|bespoke`, visual calibration до systemization, Component Contract Matrix и frame/state -> route/story/component mapping.
- Agent Capability Registry собирается в `runtime/typescript/agent-capability-registry.ts` и проверяется `yarn workflow:test-agent-capabilities`.

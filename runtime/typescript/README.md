# TypeScript Runtime Skeleton

Эта папка содержит каркас будущей реализации на OpenAI Agents SDK для TypeScript.

Файлы намеренно не содержат production-ready интеграции и секретов. Их задача — зафиксировать ожидаемую структуру исполняемого слоя.

## Файлы

- `schemas.ts` — место для Zod-схем, соответствующих JSON Schema из `agent-pack/schemas/`.
- `agents.registry.ts` — регистрация orchestrator и специалистов.
- `tools.ts` — wrappers для agents-as-tools и локальных capabilities.
- `route.config.ts` — dependency graph, route tools, artifact ownership and required inputs.
- `research.config.ts` — adaptive research modes, provider registry and source policy defaults.
- `env.ts` — minimal local `.env` loader for standalone runtime provider keys.
- `firecrawl.ts` — Firecrawl SDK adapter for scrape, metadata/links/images, screenshot output and browser interact code.
- `reference-scan.ts` — Firecrawl + Playwright reference scanner that writes markdown/json and desktop/mobile screenshots to `reports/visual-review/<slug>/`.
- `visual-diff.ts` — dependency-free PNG diff for reference/local Playwright screenshots with JSON and Markdown outputs.
- `visual-section-diff.ts` — Playwright section screenshot capture plus per-section PNG diff for reference-driven QA.
- `visual-reference-review.ts` — visual reference review artifact generator from Firecrawl markdown, reference screenshots and local Playwright screenshots.
- `tavily-research.ts` — Tavily Search API adapter for source-backed web/deep research.
- `gemini-research.ts` — Gemini adapter for strategy, contradiction review and claims-to-validate checks.
- `multi-source-research.ts` — local runtime fan-out over configured executable research providers.
- `research-stage-runner.ts` — end-to-end research stage runner that writes `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` and updates handoff/ledger.
- `deepseek-research.ts` — DeepSeek Chat Completions adapter for research cross-check/synthesis.
- `run-local-workflow.ts` — deterministic local standard workflow artifact generator from research through release notes.
- `workflow-state.ts` — persisted `run-state.json` and per-stage `stage-results/*.json` helpers.
- `workflow-engine.ts` — sequential standard workflow engine with start/resume/status and force rerun support.
- `run-workflow-engine.ts` — CLI entrypoint for `workflow:start`, `workflow:resume`, `workflow:status` and `workflow:run-stage`.
- `context-truncator.ts` — сжатие контекста `handoff-bundle.md` (State Truncation Gate) перед тяжелыми этапами разработки.
- `doctor.ts` — диагностическая утилита для проверки целостности шаблонов, структуры папок и доступности MCP-серверов.
- `hooks.ts` — lifecycle hook skeleton for guard checks, bundle checks and final checks.
- `guardrails.ts` — input/output/tool guardrails и approval hooks.
- `tracing.ts` — настройки tracing и sensitive-data режима.
- `run-landing-workflow.ts` — точка входа для запуска workflow.

## Ожидаемый runtime contract

- Orchestrator создаёт специалистов и вызывает их как `agent.asTool()`, сохраняя финальный ответ за orchestrator.
- Handoff используется только если отдельная ветка должна перейти под ответственность специалиста.
- Каждый шаг получает и возвращает `handoff_bundle`, сохраняя `assumptions`, `risks` и `open_questions`.
- Orchestrator строит dependency graph и сам выбирает порядок запуска IA, design, copy, prototype, frontend и test bench.
- Route tools are the only supported specialist entry points for the runtime.
- Research provider selection is adaptive and must respect user source policy.
- Local executable research providers are enabled by env keys and ordered by `RESEARCH_PROVIDER_ORDER`.
- Firecrawl is an optional executable provider for `browser_scan`, competitor/reference page scrape and visual reference evidence collection; Playwright remains responsible for local screenshots and responsive QA.
- Full `deep_research` requires multi-source coverage from `tavily`, `deepseek` and `gemini`; missing or failed providers must produce `needs_validation` instead of silent success.
- `deepseek` and `gemini` are default required cross-check/check providers, but their outputs must not be treated as source-backed evidence without external sources.
- The local workflow engine persists run state and supports explicit stage reruns with `--force`; it currently supports the `standard` profile.
- Hooks validate inputs, tool calls, output status, QA readiness and final readiness.
- Hooks enforce that QA receives the complete bundle, including `visual_reference_review` for reference-driven landing work, and that final synthesis has both QA and release notes.
- Tool layer должен быть заменяемым: search/browser/Figma/Notion/GitHub/deploy подключаются как capabilities, а не как обязательные роли.
- Outputs валидируются по JSON Schema или Zod-схемам перед передачей следующему этапу.
- Tracing включён, но sensitive inputs/outputs не сохраняются для production-like запусков.

## Команды

```bash
yarn validate:config
yarn typecheck
yarn agents:inspect
yarn qa:firecrawl
yarn reference:scan "<reference url>" [slug]
yarn reference:diff reports/visual-review/<reference-slug> reports/visual-review/<local-slug> [output-dir]
yarn reference:section-diff "<reference url>" "<local url>" [output-dir]
yarn reference:review reports/visual-review/<slug> [local-url] [output-path] [--local-dir reports/visual-review/<local-slug>]
yarn research:run outputs/<project-slug>/<YYYY-MM-DD> ["research query"]
yarn landing:run "<landing workflow goal>"
yarn workflow:run-local "<landing workflow goal>"
yarn workflow:start "<landing workflow goal>"
yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>
yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> 01-research --force
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference
```

`package.json`, `yarn.lock` и `tsconfig.json` добавлены в корне проекта. Перед запуском TypeScript-команд установи зависимости через `yarn install`.

`agents.sdk.ts` создаёт optional Agents SDK слой без вызова модели: загружает инструкции из `agent-pack/agents/*.agent.md`, создаёт orchestrator и specialists, затем подключает specialists к orchestrator через `agent.asTool()` по `route.config.ts`.

`run-landing-workflow.ts` в основном no-API-key режиме проверяет структуру workflow и создаёт scaffold в `outputs/<project-slug>/<date>/`. Standalone запуск модели через OpenAI API остаётся optional и требует `OPENAI_API_KEY`.

`reference-scan.ts` требует публично доступный URL. Firecrawl не читает локальный `127.0.0.1` preview без публичного туннеля; для локальной реализации используй Playwright screenshots из `qa:playwright`.

`workflow:validate` поддерживает профили `standard`, `reference` и `auto`. Standard workflow не требует `visual-reference-review.md`; reference workflow требует его строго.

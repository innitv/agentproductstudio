# Figma Agent Sync Source-Layer Plan

## Статус

`partial`

## Цель

Синхронизировать Figma-ответственных агентов и соседние workflow/runtime файлы после внедрения `figma-screen-compiler`, `visual-layout-verifier`, `figma-layout-ir.json` и `figma-visual-qa.json`.

## Scope

В работе участвуют только нормативные и исполняемые source-layer файлы:

- `agent-pack/agents/*.agent.md` для orchestrator, frontend и QA;
- `agent-pack/workflows/*.md`;
- `agent-pack/templates/file-format-conventions.md`;
- `agent-pack/schemas/*.schema.json`;
- `runtime/typescript/workflow.manifest.ts`;
- `runtime/typescript/output-metadata.ts`;
- runtime regression tests.

Не трогать пользовательские незавершенные изменения в `siteportfolio/`, `apps/portfolio/` и Notion tooling.

## Найденные расхождения

| Layer | Gap |
|---|---|
| Orchestrator | Design enhancement order не включает `figma-screen-compiler` и `visual-layout-verifier`, поэтому новый compile/verify loop можно обойти. |
| Frontend | Не читает явно `figma-layout-ir.json` и `figma-visual-qa.json`, хотя должен блокировать Figma-driven frontend при failed visual QA. |
| QA | Не подключает `visual-layout-verifier` как skill и не требует проверки IR/QA artifacts при Figma surface. |
| Stage handoff docs | `06-screens`, `08-frontend`, `11-qa` не описывают передачу IR/visual QA как first-class artifacts. |
| Artifact pipeline | Последовательность Figma layer все еще говорит `figma-handoff-bundle.md / Figma canvas write`, без compile -> write -> verify. |
| Output metadata | Optional discovered artifacts не включает `figma-layout-ir.json` и `figma-visual-qa.json`, поэтому run index может терять evidence. |
| Schemas | `screens.schema.json` не содержит first-class layout compiler contract. `frontend-result.schema.json` не содержит visual QA gate summary. |

## План работ

1. Обновить агенты orchestration/frontend/QA так, чтобы Figma-ready surface шел через `figma-layout-ir.json` до write и `figma-visual-qa.json` после write.
2. Обновить workflow docs и file conventions, чтобы downstream handoff не терял новые artifacts.
3. Обновить runtime metadata discovery и тесты для optional Figma evidence artifacts.
4. Расширить schemas для `screens` и `frontend-result` без ломки существующих payloads.
5. Запустить validation: `yarn validate:config`, `yarn workflow:test-agent-metadata`, `yarn workflow:test-skill-metadata`, `yarn workflow:test-skill-usage`, `yarn workflow:test-figma-layout-contract`, `yarn workflow:test-figma-layout-verifier`, `yarn workflow:test-output-metadata`, `yarn typecheck`.

## Definition Of Done

- Все владельцы Figma handoff используют одинаковую цепочку: visual evidence -> screens -> layout IR -> handoff bundle -> approved Figma write -> visual QA -> frontend/QA mapping.
- Runtime metadata показывает IR и visual QA в `artifact-manifest.json`/outputs guide, если файлы есть в run directory.
- Проверки проходят или blockers записаны явно.

## Текущее состояние

На 2026-06-28 закрыта первая часть: orchestrator, design/design-generator, frontend, Figma handoff skills, schemas, manifest и verifier tests синхронизированы с compile -> write -> verify loop.

Остается отдельным follow-up: расширить QA-agent docs, stage handoff docs, `output-metadata.ts`, `screens.schema.json` и `frontend-result.schema.json` там, где это еще не покрыто текущими tests.

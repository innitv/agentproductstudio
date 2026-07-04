# Plan: Figma/Lazyweb flow gates 2026-06-27

## Work type

`limited engineering task`: source-layer fix for agent rules, templates and MCP guidance. No Figma/Notion external write.

## Problem

Recent Figma output could pass as a set of styled pages while failing as an application surface. The source rules also still referenced retired Lazyweb skill names, so agents could route to stale capabilities.

## Scope

- Update Lazyweb routing to current installed skills and MCP tool names.
- Add a Primary App Flow Gate for `figma_board`, `product_ui`, `prototype` and `frontend` surfaces.
- Require screen specs and Figma handoff to include entry point, primary action, next state, completion evidence and error/recovery paths.
- Validate agent metadata and search for retired Lazyweb terms after edits.

## Out of scope

- Rewriting old generated Figma boards.
- Calling external Figma write tools.
- Publishing to Notion or committing changes.

## Validation plan

- `rg` for retired Lazyweb skill names.
- `yarn tsx runtime/typescript/agent-capability-registry.ts`.
- `yarn workflow:test-agent-metadata`.
- `yarn workflow:test-skill-metadata`.

# A3 Design System Figma Source

## Source

- Figma file: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System
- Color base token node: `16:203`
- Color palette token node: `16:292`
- Access mode: Figma REST API through local `FIGMA_API_TOKEN`

## Purpose

This folder stores long-lived design-system source artifacts extracted from Figma. These files are not single workflow outputs; product runs in `outputs/<project-slug>/<YYYY-MM-DD>/` should reference them through `Inputs Used`.

## Files

- `token-map.md` — accepted design-system token map: colors, typography, effects, radius, spacing and component sizes.
- `component-map.md` — component mapping status, extraction plan and frontend migration targets.
- `design-system-audit.md` — current audit status for tokens, components, frontend mapping, risks and next actions.
- `raw/` — optional sanitized node summaries. Do not store private full file dumps or tokens.

## Frontend Preview

- Local component playground: `http://127.0.0.1:5173/components` when `yarn dev --port 5173` is running.
- Playground source: `apps/frontend/src/components-playground.tsx`.
- Current landing page remains available at `/`.

## Update Rules

- Keep Figma access tokens only in local `.env`.
- Do not commit raw private Figma dumps.
- Prefer Figma Variables API when token scope includes `file_variables:read`.
- When Variables API is unavailable, extract token values from specific frame/node evidence and record the limitation.
- User-provided Figma exports may be used as source evidence when the export is recorded in `token-map.md`.
- Downstream workflow artifacts should cite `design/figma/a3-design-system/token-map.md` and, when components are involved, `design/figma/a3-design-system/component-map.md`.

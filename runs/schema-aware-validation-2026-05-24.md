# Schema-Aware Workflow Validation: 2026-05-24

## What Changed

- Added schema mapping for workflow artifacts in `runtime/typescript/workflow-stages.ts`.
- Extended `runtime/typescript/validate-workflow-run.ts` to parse structured payloads from:
  - YAML frontmatter key `schema_payload`;
  - YAML frontmatter key `artifact`;
  - fenced code blocks labeled `artifact-json` or `json`.
- Added lightweight local JSON Schema subset validation:
  - `type`;
  - `required`;
  - `properties`;
  - `items`;
  - `enum`;
  - `const`;
  - `minLength`;
  - `minItems`;
  - local `$ref` into `$defs`.
- Added local TypeScript declaration for `js-yaml`.
- Documented structured payload conventions in `README.md` and `agent-pack/templates/file-format-conventions.md`.
- Added fixture run: `outputs/schema-aware-validation-fixture/2026-05-24`.

## Validation

| Command | Result |
|---|---|
| `yarn workflow:validate outputs\schema-aware-validation-fixture\2026-05-24 --through 01-research` | pass, 0 errors, 0 warnings |
| `yarn typecheck` | pass |
| `yarn validate:config` | pass |
| `yarn agents:inspect` | pass |
| `yarn qa:playwright` | pass, 4 tests |

## Notes

- Legacy artifacts without structured payload now receive warnings when they have mapped schemas.
- Section-marker validation remains active alongside schema-aware validation.
- This is intentionally dependency-light and does not require adding a direct package dependency.

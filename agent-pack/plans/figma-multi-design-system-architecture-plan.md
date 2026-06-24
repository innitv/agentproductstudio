# План: универсальная Figma design-system архитектура

## Цель

Перевести Figma/DS контур из A3-first пилота в multi-DS систему, где агент может работать с любой дизайн-системой любого объема через локальный индекс, а не через постоянное чтение всего Figma-файла.

## Принцип

1. A3 остается первой зарегистрированной дизайн-системой, но не дефолтным источником для новых продуктов.
2. Любая общая Figma-библиотека сначала проходит read-only ingest:
   - census;
   - chunk manifest;
   - foundation;
   - component map;
   - deep component profiles;
   - contract.
3. После ingest агент читает `design/figma/<slug>/...` и обращается в Figma только для missing nodes, refresh, write или verification.
4. Для canvas write используется composition plan + approval + small idempotent patches + screenshot/object inventory.
5. Для frontend используется Component Contract Matrix, Code Connect или fallback mapping и paired evidence.

## Source-Layer Changes

| Layer | Изменение | Status |
|---|---|---|
| Registry | `design/figma/registry.json` + schema | done |
| DS index | `design/figma/design-system-index.schema.json` | done |
| Ingest skill | `agent-pack/skills/figma-ds-ingest/SKILL.md` | done |
| Ingest workflow | `agent-pack/workflows/figma-ds-ingest.workflow.md` | done |
| Audit CLI | generic `figma:audit` + A3 alias | done |
| Agents | убрать A3-default из inputs, читать selected DS registry | done |
| Templates | ссылаться на selected DS index вместо A3 paths | done |
| Validators | проверять наличие registry/index source layer | done |

## Definition Of Done

- Новая ДС может быть зарегистрирована в `design/figma/registry.json`.
- Для `reuse|extend` агент обязан указать `selected_design_system_slug`.
- Если DS ingest есть, агент сначала читает локальный index, а не весь Figma файл.
- `yarn figma:audit --registry <path>` работает для любой registry.
- `yarn figma:audit:a3` остается совместимым alias.
- A3-specific docs остаются внутри `design/figma/a3-design-system/`.

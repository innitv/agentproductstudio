# Skills Architecture Plan

Цель: привести `agent-pack/skills/*/SKILL.md` к контрактному виду, сопоставимому с agent metadata, но без превращения skills во второй `AGENTS.md`.

## План

1. Проанализировать текущие skills и существующий YAML frontmatter.
2. Зафиксировать минимальный skill metadata contract.
3. Добавить недостающие machine-readable поля в `SKILL.md`.
4. Добавить runtime parser/validator для skill metadata.
5. Подключить skill validation к `yarn validate:config`.
6. Добавить regression-тесты для skill metadata.
7. Проверить agent frontmatter и убрать неоднозначные свободные значения.
8. Прогнать `typecheck`, `validate:config`, профильные tests и docs audit.
9. Подготовить чистый commit-slice только по agent/skills/runtime docs.

## Минимальный Skill Metadata Contract

- `id`: стабильный skill id.
- `title`: человекочитаемое имя.
- `description`: краткое назначение.
- `platforms`: поддерживаемые среды.
- `mcp_servers`: требуемые MCP/server capabilities.
- `strictness_profile`: `standard` или `strict`.
- `owner_stage_ids`: workflow stages, где skill применим.
- `required_inputs`: artifact ids, runtime files, env vars или explicit user inputs.
- `required_outputs`: artifact ids или file outputs.
- `approval_actions`: approval gate actions, если skill может инициировать внешнюю запись или внешний вызов.
- `validation_commands`: локальные команды проверки.
- `contract_schema`: путь к schema/contract документу, если есть.

## Agent Frontmatter Check

Agent frontmatter должен оставаться валидным YAML и использовать machine-readable ids. Свободный текст допустим внутри body, но не в metadata lists, если список используется runtime validation.

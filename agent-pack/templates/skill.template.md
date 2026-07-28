---
id: skill-id-placeholder
name: skill-id-placeholder
title: "Название Навыка"
description: "Use when <stage/task trigger> needs <capability>. State required context, expected evidence/output, and any blocker/approval behavior in one trigger-oriented sentence."
platforms:
  - claude
  - open-code
mcp_servers:
  - optional-mcp-server-name
strictness_profile: standard
owner_stage_ids:
  - 00-intake
required_inputs:
  - recursive_brief
required_outputs:
  - run_plan
approval_actions: []
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: {{title}}

## 1. Назначение

Кратко опиши, когда agent обязан применить skill, какие workflow gates он защищает и какой результат должен оставить. Не дублируй `AGENTS.md`; skill должен быть компактной процедурой для повторяемой capability.

## 2. Обязательные inputs

Перечисли файлы, runtime state, URL, approval records или env capability, которые нужно прочитать перед действием. Имена должны соответствовать `required_inputs` в frontmatter.

**Что означает `required_inputs` у навыка, работающего на нескольких стадиях.** Это объединение по всем его `owner_stage_ids`, а не набор, обязательный на каждой из них. `anti-ai-slop` числит входами `research_summary`, `prd` и `copy_deck`, хотя на `01-research` двух последних ещё не существует: навык читает то, что к его стадии готово. Так же трактуются опциональные артефакты (`style_guide`, `figma-*`): они входы, когда созданы, и их отсутствие не блокирует навык. Валидатор проверяет, что каждое имя существует в `artifactNames`, но не требует, чтобы артефакт был доступен на самой ранней стадии владения — иначе пришлось бы дробить навык по стадиям ради формальности.

## 3. Процедура

1. Опиши минимальный порядок действий.
2. Укажи, какие decisions, assumptions и risks нужно записать в run artifacts.
3. Укажи, какие файлы или внешние системы можно менять, а какие нельзя.

## 4. Evidence и failure modes

Опиши обязательный evidence/output contract: какие артефакты, таблицы, ссылки на отчеты, команды или records должны появиться.

Опиши, когда stage получает `partial` или `blocked`, особенно если отсутствуют inputs, approval, credentials, screenshots, validation или source-backed evidence.

## 5. Validation gates

- [ ] `required_inputs` прочитаны и перечислены в `inputs_used`.
- [ ] `required_outputs` созданы или blocker/partial зафиксирован.
- [ ] Approval actions не выполнялись без human approval.
- [ ] Команды из `validation_commands` запущены или причина пропуска записана.

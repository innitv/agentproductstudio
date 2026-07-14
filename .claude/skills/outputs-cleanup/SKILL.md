---
name: outputs-cleanup
description: Использовать для задач типа cleanup/sorting: разбор outputs/temp, устаревших run-каталогов, грязного рабочего дерева и архивации завершённых запусков. Skill требует инвентаризации до удаления, отделяет archive от delete, запрещает удалять run с незакрытыми обязательствами и получает approval delete_data перед необратимым удалением.
---

# Outputs Cleanup (Уборка И Архивация Запусков)

Два правила задают дисциплину: cleanup не смешивается с feature work (иначе в диффе не разобрать, что удалено намеренно), и инвентаризация идёт до удаления (если содержимое каталога противоречит описанию «там мусор» — показать пользователю, а не удалить).

**Полная процедура — в [`agent-pack/skills/outputs-cleanup/SKILL.md`](../../../agent-pack/skills/outputs-cleanup/SKILL.md). Следуй ей.**

## Когда использовать
- Разбор `outputs/temp`, `outputs/products` (legacy), `research/temp`, архивов.
- Архивация завершённых run.
- Грязное рабочее дерево мешает работе.

## Ключевые шаги
- Инвентаризация: что лежит, статус run, есть ли незакрытые обязательства.
- Классификация: **archive** (`yarn workflow:archive`), **delete** (`yarn workflow:cleanup-temp`, `yarn outputs:cleanup`), **keep**.
- План показать пользователю конкретным списком до выполнения.
- Approval `delete_data` с exact path — перед необратимым удалением. Архивация approval не требует.
- Run с незакрытыми обязательствами (blocked approval, неопубликованный research, needs_validation) не удаляются.
- После перемещений синхронизировать `outputs/registry.json` и `research/registry.json`.

## Обязательные проверки
- `yarn workflow:list`

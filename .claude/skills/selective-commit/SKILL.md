---
name: selective-commit
description: Использовать, когда пользователь просит закоммитить или запушить только часть изменений: без outputs, только основные изменения, не трогай frontend, только docs. Skill требует выписать include/exclude scope до git add, запрещает broad staging (git add . / -A), проверяет staged-набор через yarn git:check-staged и требует approval git_write, если пользователь не запросил коммит явно.
---

# Selective Commit (Частичный Коммит)

Защищает от `git add -A` в грязном дереве, из-за которого в коммит уезжают чужие run artifacts, скриншоты и логи.

**Полная процедура и список блокируемых зон — в [`agent-pack/skills/selective-commit/SKILL.md`](../../../agent-pack/skills/selective-commit/SKILL.md). Следуй ей.** Нормативный SOP — [`agent-pack/templates/selective-commit-sop.md`](../../../agent-pack/templates/selective-commit-sop.md).

## Когда использовать
- «Закоммить без outputs», «только основные изменения», «не трогай frontend», «только этот фикс».
- Рабочее дерево содержит и продуктовые правки, и run artifacts.

## Ключевые шаги
- Выписать `include-list` и `exclude-list` **до** `git add` и показать пользователю.
- Staging только явными путями. `git add .` и `git add -A` запрещены.
- `yarn git:check-staged` + `git diff --cached --name-only` до коммита. Падает — не коммить.
- По умолчанию блокируются: `outputs/**`, `siteportfolio/runs/**`, `.lazyweb/**`, `reports/logs/**`, `test-results/**`, `dist/**`, media/evidence файлы.
- Approval `git_write` нужен, если пользователь не запросил коммит явно в текущей задаче.
- Коммитим прямо в `main` — feature-ветки под такие изменения не создаются.
- В финальном ответе перечислить: что вошло, что проверено, что осталось вне коммита.

## Обязательные проверки
- `yarn git:check-staged`

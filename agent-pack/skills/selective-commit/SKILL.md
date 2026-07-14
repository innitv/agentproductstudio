---
id: selective-commit
name: selective-commit
title: "Selective Commit (Частичный Коммит)"
description: "Использовать, когда пользователь просит закоммитить или запушить только часть изменений: без outputs, только основные изменения, не трогай frontend, только docs. Skill требует выписать include/exclude scope до git add, запрещает broad staging (git add . / -A), проверяет staged-набор через yarn git:check-staged и требует approval git_write, если пользователь не запросил коммит явно."
platforms:
  - claude
  - open-code
mcp_servers: []
strictness_profile: strict
owner_stage_ids:
  - 12-release
required_inputs:
  - run_plan
required_outputs:
  - release_notes
approval_actions:
  - git_write
validation_commands:
  - yarn git:check-staged
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Selective Commit (Частичный Коммит)

## 1. Назначение

Skill применяется, когда в рабочем дереве смешаны продуктовые изменения и run artifacts, а пользователь просит закоммитить только часть: «без outputs», «только основные изменения», «не трогай frontend», «только этот фикс».

Нормативный SOP — [`agent-pack/templates/selective-commit-sop.md`](../../templates/selective-commit-sop.md). Skill делает его исполняемым и связывает с approval gate.

Главная ошибка, от которой он защищает: `git add -A` в грязном дереве, из-за которого в коммит уезжают чужие run artifacts, скриншоты и логи.

## 2. Обязательные inputs

- Текущее состояние дерева: `git status --short`.
- Явная формулировка пользователя, что входит и что не входит в коммит.
- `run-plan.md` — если коммит относится к продуктовому run.
- Approval `git_write` с exact repo/branch target — **если** пользователь не запросил коммит явно в текущей задаче.

## 3. Процедура

1. **Зафиксируй scope до `git add`.** Выпиши два списка: `include-list` (что можно staged) и `exclude-list` (что нельзя). Списки показываются пользователю, а не держатся в уме.
   «Без outputs» означает: не staged `outputs/**`, generated run/evidence artifacts, screenshots, logs и временные отчёты.
2. **Staging только по allowlist.** Явными путями:
   ```bash
   git add CLAUDE.md runtime/typescript/intent-parser.ts
   ```
   Запрещено для selective commit: `git add .`, `git add -A`.
3. **Проверь staged scope:**
   ```bash
   yarn git:check-staged
   git diff --cached --name-only
   git diff --cached --stat
   ```
   Если `yarn git:check-staged` падает — не коммить, пока набор не исправлен или пользователь явно не изменил scope.
4. **Коммит.** Сообщение описывает содержательное изменение, а не «update files».
5. **Перед push** проверь `git status --short` и `git show --stat --oneline --no-renames HEAD`.
6. **В финальном ответе** перечисли: что вошло в коммит, какие проверки прошли, что осталось вне коммита.

Ветка: в этом репозитории коммит идёт прямо в `main` — feature-ветки под такие изменения не создаются (см. [`docs/architecture/git-workflow.md`](../../../docs/architecture/git-workflow.md)).

## 4. Evidence и failure modes

По умолчанию `yarn git:check-staged` блокирует staged-файлы в зонах: `outputs/**`, `siteportfolio/runs/**`, `.lazyweb/**`, `reports/logs/**`, `test-results/**`, `dist/**`, а также media/evidence (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.mp4`, `.webm`, `.mov`, `.pdf`). Чтобы закоммитить такой файл, пользователь должен явно назвать target и причину.

- **`blocked`** — `git:check-staged` падает и пользователь не менял scope.
- **`process_deviation`** — коммит или push выполнен без запрошенного пользователем действия и без approval `git_write` (см. [`approval-gate`](../approval-gate/SKILL.md)).
- **Broad staging** (`git add -A` при selective-запросе) — нарушение, даже если результат случайно оказался верным: пересобери staged-набор явными путями.

## 5. Validation gates

- [ ] `include-list` и `exclude-list` выписаны до `git add` и показаны пользователю.
- [ ] Staging выполнен явными путями; `git add .` / `-A` не использовались.
- [ ] `yarn git:check-staged` пройден.
- [ ] `git diff --cached --name-only` соответствует `include-list`.
- [ ] Approval `git_write` получен, если коммит не был явно запрошен пользователем.
- [ ] В финальном ответе перечислено, что вошло и что осталось вне коммита.

# SOP: Selective Commit

Используй этот SOP, когда пользователь просит закоммитить или запушить только часть изменений: `без outputs`, `только основные изменения`, `не трогай frontend`, `только docs`, `только этот фикс`.

## 1. Сначала зафиксировать scope

Перед `git add` явно раздели:

- `include-list`: файлы и папки, которые можно staged/commit.
- `exclude-list`: файлы и папки, которые нельзя staged/commit.

Если пользователь сказал `без outputs`, это означает:

- не staged `outputs/**`;
- не staged generated run/evidence artifacts;
- не staged screenshots, logs и временные отчеты;
- не staged `siteportfolio/runs/**`, если пользователь не попросил именно продуктовый ledger.

## 2. Staging только по allowlist

Используй явные пути:

```bash
git add AGENTS.md README.md runtime/typescript/intent-parser.ts
```

Не используй broad staging для selective commit:

```bash
git add .
git add -A
```

## 3. Обязательная проверка staged scope

Перед commit запусти:

```bash
yarn git:check-staged
git diff --cached --name-only
git diff --cached --stat
```

Если `yarn git:check-staged` падает, не коммить до исправления staged-набора или явного изменения scope пользователем.

## 4. Что блокируется по умолчанию

`yarn git:check-staged` блокирует staged-файлы в этих зонах:

- `outputs/**`
- `siteportfolio/runs/**`
- `.lazyweb/**`
- `reports/logs/**`
- `test-results/**`
- `dist/**`
- media/evidence файлы: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.mp4`, `.webm`, `.mov`, `.pdf`

Если такие файлы действительно нужно коммитить, пользователь должен явно назвать target и причину.

## 5. Перед push

Перед `git push` проверь:

```bash
git status --short
git show --stat --oneline --no-renames HEAD
```

В финальном ответе перечисли, что вошло в commit, какие проверки прошли и что осталось вне commit.


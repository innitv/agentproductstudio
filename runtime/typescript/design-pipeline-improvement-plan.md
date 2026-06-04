# План Улучшения Дизайн-Pipeline

Дата: 2026-06-04

## Цель

Усилить дизайн-часть workflow между `reference-analysis.md`, `design-brief.md`, `screens.md` и frontend: извлекать стиль из референса как систему, прогонять дизайн через критику, фиксировать motion/interaction gates и готовить optional handoff в Figma/Storybook без ломки обычного продуктового pipeline.

## Правило Языка

Все человекочитаемые артефакты, templates, skills, plans, workflow docs и agent docs пишутся на русском. Английский сохраняется только для технических имен файлов, CLI-команд, env-переменных, JSON/YAML/frontmatter keys, schema/runtime fields, code blocks, статусов и терминов вроде `frontend`, `Storybook`, `Figma`, `motion`, если перевод ухудшает точность.

## Что адаптируем из внешних design skills

- `style-decompose`: `STYLE_GUIDE.md` как системная декомпозиция стиля, а не общая фраза "вдохновиться референсом".
- `design-loop`: `design-generator-prompt.md` и `design-loop-report.md` для итераций "скрин -> критика -> revision block".
- `emil-design-eng`: motion/interaction checklist для frontend и QA.
- `handoff-to-figma`: approval-gated `figma-handoff-bundle.md` перед Figma MCP write.
- `ds-to-storybook`: optional `storybook-result.md` для компонентной библиотеки и Storybook QA.

## План внедрения

1. [done] Сохранить этот план как нормативный task-scoped roadmap.
2. [done] Добавить шаблоны optional artifacts:
   - `STYLE_GUIDE.md`;
   - `design-generator-prompt.md`;
   - `design-loop-report.md`;
   - `figma-handoff-bundle.md`;
   - `storybook-result.md`.
3. [done] Обновить workflow/docs:
   - artifact-driven pipeline;
   - file format conventions;
   - design/frontend/qa agent instructions;
   - quality gates.
4. [done] Научить runtime manifest распознавать optional design enhancement artifacts как `product_artifact`, `evidence` или `export`.
5. [done] Добавить regression coverage для manifest discovery и outputs guide.
6. [done] Прогнать проверки:
   - `yarn typecheck`;
   - `yarn build`;
   - `yarn validate:config`;
   - `yarn docs:audit`;
   - `yarn workflow:test-output-metadata`;
   - `git diff --check`.

## Границы изменения

Новые артефакты остаются optional. Они не становятся обязательными для standard workflow и не блокируют старые runs. Для reference-driven задач `STYLE_GUIDE.md` и `design-loop-report.md` рекомендуются как design enhancement gate, но жесткая блокировка остается за существующими `reference-analysis.md`, `screens.md`, `visual-reference-review.md` и `visual-diff-result.json`.

Figma write, Storybook export, Notion и любые внешние действия остаются approval-gated. План не добавляет внешние вызовы и не меняет секреты.

## Критерий готовности

Проект содержит шаблоны и инструкции для нового design enhancement layer, runtime показывает эти файлы в `artifact-manifest.json`/`workflow:outputs`, а проверки проходят без регрессий.

---
id: visual-diff-verifier
name: visual-diff-verifier
title: "Visual Reference Screenshot Verifier"
description: "Use when a task is reference-driven or stage 09-visual-reference/11-qa must compare implementation against a screenshot or URL reference. Requires technical reference scan, paired reference/local section screenshots, visual diff artifacts, and visual_reference_review evidence before success."
platforms:
  - codex
  - open-code
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 09-visual-reference
  - 11-qa
required_inputs:
  - reference_analysis
  - design_brief
  - screens
  - frontend_result
required_outputs:
  - visual_reference_review
approval_actions: []
validation_commands:
  - yarn reference:scan
  - yarn reference:diff
  - yarn reference:section-diff
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Visual Reference Screenshot Verifier

## 1. Назначение

Применяй skill, если пользователь дал screenshot, URL референса или просит сделать "как этот сайт". Финальный `success` запрещен, пока нет технического скана референса, поблочных paired screenshots и `visual-reference-review.md`.

## 2. Обязательные inputs

- `reference-analysis.md`, созданный после `yarn reference:scan <url> [slug]`.
- `design-brief.md` и `screens.md`, которые явно используют reference spec.
- `frontend-result.md` с локальным URL или способом запуска.

## 3. Процедура

1. Перед созданием или обновлением `reference-analysis.md` запусти `yarn reference:scan <reference-url> [slug]`. Если `FIRECRAWL_API_KEY` не задан, используй локальный Playwright fallback, предусмотренный сканером.
2. Проверь, что в `reports/visual-review/` физически сохранены desktop и mobile screenshots референса.
3. Запусти локальную реализацию через проектный yarn-flow: `yarn build` плюс локальный preview/host, либо уже доступный dev server из `frontend-result.md`.
4. Захвати reference и local секции в одном naming contract:
   - `reference-desktop-section-<name>.png`
   - `reference-mobile-section-<name>.png`
   - `local-desktop-section-<name>.png`
   - `local-mobile-section-<name>.png`
5. Запусти `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` и, если доступны секционные пары, `yarn reference:section-diff`.
6. Прочитай `visual-diff-result.json` перед вердиктом. Не заменяй diff фразой "похоже".
7. Запиши `visual-reference-review.md` с таблицей: section, reference screenshot, local screenshot, diff result, status, corrections.

## 4. Evidence и failure modes

`visual-reference-review.md` обязан ссылаться на реальные screenshot files и `visual-diff-result.json`.

Ставь `blocked`/`partial`, если:
- нет `reference-analysis.md`;
- reference scan не запускался в текущей задаче;
- есть только local screenshots без reference pair;
- есть нерешенные расхождения в layout, typography, spacing, media, CTA или mobile behavior;
- скриншоты взяты из старого или несвязанного отчета.

## 5. Validation gates

- [ ] `yarn reference:scan` был запущен для текущего reference.
- [ ] Desktop и mobile screenshots существуют для reference и local.
- [ ] Для каждой видимой секции есть пары reference/local.
- [ ] `visual-diff-result.json` создан и прочитан.
- [ ] Нет horizontal overflow, перекрытия текста, битых изображений и missing media.

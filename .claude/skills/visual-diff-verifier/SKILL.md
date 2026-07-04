---
name: visual-diff-verifier
description: Использовать, когда задача reference-driven или на этапе 09-visual-reference/11-qa нужно сравнить реализацию со screenshot или URL референса. Skill требует технический scan референса, поблочные paired reference/local screenshots, visual diff артефакты и visual_reference_review evidence до success.
---

# Visual Reference Screenshot Verifier

Skill сравнивает реализацию с визуальным референсом (screenshot или URL). Финальный `success` запрещен, пока нет технического скана референса, поблочных paired screenshots и `visual-reference-review.md`. Применяется, если пользователь дал референс или просит "как этот сайт".

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/visual-diff-verifier/SKILL.md`](../../../agent-pack/skills/visual-diff-verifier/SKILL.md). Следуй ей.**

## Когда использовать
- Задача reference-driven: пользователь дал screenshot, URL или просит "как этот сайт".
- Этап 09-visual-reference или 11-qa.
- Нужно сравнить frontend-реализацию с референсом поблочно.
- Нужны visual diff артефакты и `visual-reference-review.md` до success.

## Ключевые шаги
- Запусти `yarn reference:scan <url> [slug]` перед созданием/обновлением `reference-analysis.md` (при отсутствии `FIRECRAWL_API_KEY` — Playwright fallback).
- Убедись, что в `reports/visual-review/` сохранены desktop и mobile screenshots референса.
- Сделай поблочные paired reference/local section screenshots.
- Сгенерируй visual diff артефакты (`reference:diff`, `reference:section-diff`).
- Зафиксируй `visual-reference-review.md`; success только при полном evidence.

## Обязательные проверки
- `yarn reference:scan`
- `yarn reference:diff`
- `yarn reference:section-diff`

---
name: seo-copy-validator
description: Использовать, когда на этапе 05-copy или 11-qa нужно проверить landing copy, SEO metadata, семантическую иерархию заголовков и marketing claims против source-backed research. Skill создает copy-deck/qa-report evidence и помечает неподтвержденные claims как needs_validation.
---

# SEO & Copywriting Validator

Skill проверяет, что тексты `copy-deck.md` соответствуют PRD, IA, research evidence и SEO constraints и не содержат неподтвержденных claims. Проверяет структуру copy, heading hierarchy и SEO metadata. Неподтвержденные утверждения помечаются как `needs_validation`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/seo-copy-validator/SKILL.md`](../../../agent-pack/skills/seo-copy-validator/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 05-copy: создание или проверка `copy-deck.md`.
- Этап 11-qa: валидация landing copy и SEO metadata.
- Нужно проверить heading hierarchy и семантическую структуру.
- Нужно проверить marketing claims против research evidence.

## Ключевые шаги
- Прочитай `prd.md`, `research-summary.md`, `copy-deck.md` и дополнительные research files при ссылках на claims.
- Проверь структуру copy по IA/screens: каждая секция имеет назначение, CTA или следующий шаг.
- Проверь heading hierarchy: один H1, секционные H2, вложенные H3 без пропусков уровней.
- Проверь SEO metadata и соответствие PRD-позиционированию.
- Пометь неподтвержденные claims как `needs_validation`; запиши evidence в copy-deck/qa-report.

## Обязательные проверки
- `yarn validate:config`

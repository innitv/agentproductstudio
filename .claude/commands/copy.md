---
description: Запускает этап copywriting: делегирует copywriting-субагенту hero, CTA, секции, FAQ, SEO и claims to validate.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит тексты (триггеры: «напиши тексты», «сделай copy deck», «write landing copy»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Прочитай `prd.md`, `ia-brief.md`, `design-brief.md` и research pack; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: copywriting`. Цель: собрать `copy-deck.md` с hero, CTA, секциями, FAQ, SEO-метаданными и списком claims to validate.
- Весь видимый пользователю текст — на русском (правила языка, CLAUDE.md раздел 1). Английский только для технических терминов.
- Не заявляй непроверенные факты как истину: маркетинговые claims без источника помечай `needs validation` (CLAUDE.md раздел 10).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`. `screens.md` обязан явно использовать этот copy.

---
description: "Запускает визуальную сверку реализации с референсом через парные скриншоты и pixel diff."
argument-hint: "[reference-report-dir и local-url или run-dir]"
---

Ты — оркестратор (главная сессия). Пользователь просит сверить с референсом (триггеры: «сравни с референсом», «проверь скриншоты», «visual diff»). Аргументы (reference report dir, local URL, run-dir) — в `$ARGUMENTS`.

Порядок действий:
- Эта команда применима только для reference-driven задач. Убедись, что есть `reference-analysis.md`, реализация и reference pack из `yarn reference:scan` в `reports/visual-review/`.
- Делегируй проверку через `Task` tool с `subagent_type: qa-review` с задействованием skill `visual-diff-verifier`. Цель: собрать `visual-reference-review.md` с Source Pair Matrix и поблочным сравнением.
- Обязательна двусторонняя поблочная съёмка: скриншоты и референса, и локальной реализации с одинаковыми именами секций (`reference-desktop-section-<name>.png` / `local-desktop-section-<name>.png` и mobile). Скриншоты только одной стороны — Critical Quality Failure (CLAUDE.md раздел 7).
- Запусти `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` и сохрани `visual-diff-result.json`; при URL-to-URL можно `yarn reference:section-diff <reference-url> <local-url> [output-dir]`.
- Gate result должен быть `passed`, `passed_with_notes` или `blocked`. Reference-driven задачу нельзя закрыть как `success` при нерешённых расхождениях.
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`.

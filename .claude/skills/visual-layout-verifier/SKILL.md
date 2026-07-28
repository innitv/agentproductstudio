---
name: visual-layout-verifier
description: Использовать после создания Figma-экранов или systemization, чтобы проверить screenshots/object inventory против figma-layout-ir.json: обнаружить обрезанный текст, наезды, unsafe top/bottom зоны, проблемы плотности/иерархии, DS instance dishonesty, route incoherence и systemization-регрессии до отметки макета как ready.
---

# Visual Layout Verifier

Skill защищает от результата, который структурно выглядит правильным в слоях, но визуально разваливается: обрезанный текст, наезды, слабая плотность, неверная иерархия, отсутствие app route. Применяй после Figma write, calibration write или component systemization, сверяя screenshots с `figma-layout-ir.json`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/visual-layout-verifier/SKILL.md`](../../../agent-pack/skills/visual-layout-verifier/SKILL.md). Следуй ей.**

## Когда использовать
**Только когда Figma реально в деле.** По `CLAUDE.md` §6.1 Figma сузилась до дивергентной фазы на `04-design` и разового извлечения решений в токены — постоянной синхронизации нет.

- После Figma write, calibration write или component systemization.
- Этапы 06-screens, 08-frontend, 11-qa перед отметкой **макета** как ready.
- Нужно проверить screenshots/object inventory против `figma-layout-ir.json`.
- Есть подозрение на обрезанный текст, наезды, DS instance dishonesty или route incoherence.

**Только маршрут `track: figma`** из `run-state.json` (CLAUDE.md §0.3); определять маршрут по наличию `figma-layout-ir.json` запрещено. **Не использовать для UI в коде.** Там приёмка другая: `yarn vr:test` (пиксельная регрессия историй витрины, вердикт в `reports/visual-regression/summary.json`), `yarn test-storybook` (интеракции + a11y), `yarn qa:mobile` (профиль устройства).

На маршруте `track: code` `figma-visual-qa.json` не создаётся и **записи в ledger не требует вовсе** — это штатный маршрут, а не пропуск проверки: приёмка идёт по трём машинным осям и обязательна. Писать `skipped_with_reason` **запрещено** (замена прежнего указания). Записи требуют только маршрут-условные **секции** `frontend-result.md` (`## Figma Visual QA Gate Summary`, `## Figma Roundtrip Deviations` и др.) — строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Ключевые шаги
- Проверь target: file key, page, board node, screen node IDs.
- Собери Figma screenshots по всем calibration screens и board; object inventory/metadata по frames.
- Обнаружь clipped text, overlap, unsafe top/bottom зоны, проблемы density/hierarchy.
- Проверь DS instance honesty и route coherence.
- При systemization сравни before/after screenshots на регрессии; запиши `figma-visual-qa`.
- Прогони post-write чек-лист гигиены сборки из `/figma-ds:build` (мастер в своей панели, хвосты клона, сырые заливки, слот ↔ семья семантики, дубли стилей, оси вариантов, подписи значений против фактических).

## Обязательные проверки
- `yarn validate:config`
- `yarn workflow:test-skill-metadata`

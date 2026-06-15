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
3. Если есть Figma output, сначала проверь его как отдельную поверхность:
   - `get_metadata` или object inventory: ожидаемые frames, screen count, component instances, states, overlay/deviation notes;
   - `get_screenshot`: desktop/mobile или frame-by-frame screenshot evidence;
   - design-system grounding: реальные component instances/variables/styles или `skipped_with_reason`;
   - Russian Publication Gate для видимого текста.
4. Запусти локальную реализацию через проектный yarn-flow: `yarn build` плюс локальный preview/host, либо уже доступный dev server из `frontend-result.md`.
5. Захвати reference и local секции в одном naming contract:
   - `reference-desktop-section-<name>.png`
   - `reference-mobile-section-<name>.png`
   - `local-desktop-section-<name>.png`
   - `local-mobile-section-<name>.png`
6. Запусти `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]` и, если доступны URL обеих сторон, `yarn reference:section-diff`.
7. Прочитай `visual-diff-result.json` перед вердиктом. Не заменяй diff фразой "похоже".
8. Запиши `visual-reference-review.md` с таблицей: section, reference screenshot, Figma screenshot при наличии, frontend screenshot, diff result, status, corrections.

## 3.1 Universal Source Pair Matrix

Для любой визуальной задачи сначала определи пары сравнения, а не только конечный артефакт:

| Pair | Когда нужен | Evidence | Gate |
|---|---|---|---|
| `reference -> Figma` | Есть внешний screenshot/URL/Lazyweb/reference и Figma canvas write | reference screenshots/cards, Figma screenshot, Figma object inventory | Макет не `ready`, если нет screenshot review и coverage по ключевым секциям |
| `Figma -> frontend` | Frontend строится по макету или Figma handoff | Figma screenshot/node ids, frontend screenshots, DOM/locator map | Frontend не `success`, если ключевые frames/states не представлены в UI |
| `reference -> frontend` | Reference-driven frontend или проверка финальной реализации | paired screenshots, `visual-diff-result.json`, section diff, browser evidence | `visual-reference-review.md` не `passed`, если diff отсутствует или есть blocker |
| `spec -> frontend behavior` | Есть прототип, states, формы, ошибки, навигация | Playwright interactions, traces/screenshots, state inventory | Визуальный pass не закрывает интерактивный fail |

Минимальный review для каждой пары: `structure`, `visual`, `content`, `states`, `responsive`, `behavior`. Pixel diff — только один сигнал; он не заменяет DOM/metadata/state checks.

## 3.2 Reference Evidence Quality

- UI Kit, token map и component library считаются implementation grounding, но не считаются полноценной visual reference truth.
- Для realistic output нужен хотя бы один реальный visual source: пользовательский screenshot/Figma/URL, Lazyweb/Mobbin/Pageflows/live capture, open product docs/screens или подтвержденный benchmark/example.
- Каждый reference должен иметь краткую карточку: source, screen/state, observed pattern, borrow, avoid, applicability, IP/trade-dress risk, output location.
- Для интерактивных интерфейсов снимай не только initial screen, но и основные states: loading, empty, error, success, disabled, modal/drawer/dropdown, mobile nav.
- Для Figma макета object inventory без screenshot не считается достаточной проверкой: дерево может быть правильным, а композиция визуально сломанной.

## 4. Evidence и failure modes

`visual-reference-review.md` обязан ссылаться на реальные screenshot files и `visual-diff-result.json`.

Ставь `blocked`/`partial`, если:
- нет `reference-analysis.md`;
- reference scan не запускался в текущей задаче;
- есть только local screenshots без reference pair;
- Figma write подтвержден только сообщением агента, без metadata/object inventory и screenshot;
- frontend сравнивается только с текстовой spec, хотя Figma/reference screenshots доступны;
- есть нерешенные расхождения в layout, typography, spacing, media, CTA или mobile behavior;
- скриншоты взяты из старого или несвязанного отчета.

## 5. Validation gates

- [ ] `yarn reference:scan` был запущен для текущего reference.
- [ ] Desktop и mobile screenshots существуют для reference и local.
- [ ] Для каждой видимой секции есть пары reference/local.
- [ ] `visual-diff-result.json` создан и прочитан.
- [ ] Нет horizontal overflow, перекрытия текста, битых изображений и missing media.

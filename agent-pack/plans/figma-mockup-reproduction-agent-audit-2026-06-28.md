# Figma Mockup Reproduction Agent Audit

## Status

`diagnosis_ready`

## Problem

Пользовательская обратная связь: текущие Figma-макеты не выглядят даже как нормальные wireframes/app screens. Они читаются как набор страниц или auto-layout карточек, а не как приложение с реальной визуальной логикой, плотностью, состояниями и UX-маршрутом.

Это не проблема одного плохого экрана. Это проблема производственного контура:

- смысл и сценарий собираются в research/design artifacts;
- правила Figma handoff описаны в markdown;
- но между `screens.md` и `use_figma` нет жесткого слоя компиляции, измерения и ремонта макета.

## Local System Map

| Layer | Current Assets | What Works | Gap |
|---|---|---|---|
| Product/research context | `research-summary.md`, `scenario-user-flows.md`, `handoff-bundle.md` | Сценарии, риски и trust requirements есть | Нет machine-readable UI intent, который напрямую компилируется в экран |
| Design agent | `agent-pack/agents/design.agent.md` | Есть Visual Evidence, Lazyweb, Primary App Flow Gate, Design System Strategy | Gate текстовый; агент может пройти в Figma без фактической visual calibration |
| Screen generator | `agent-pack/agents/design-generator.agent.md`, `screens.template.md`, `screens.schema.json` | Требует screen traceability, state inventory, component matrix | Schema не требует layout IR, geometry constraints, измеримых screenshot checks |
| Figma SOP | `integrations/mcp/figma-canvas-write-guide.md` | Правильно описывает two-pass build, visual calibration, systemization, screenshot QA | Не исполняется автоматически; не блокирует большой write технически |
| DS ingest | `figma-ds-ingest.workflow.md`, `design/figma/registry.json`, shadcn index | Можно читать локальный индекс DS вместо всего файла | `shadcn-ui-components-2026` пока `partial`; reuse не превращен в импорт/инстансы компонентов |
| Roundtrip skill | `agent-pack/skills/figma-roundtrip/SKILL.md` | Хорошо формулирует Component Contract Matrix и regression check | Skill не является runtime executor/verifier |
| QA | `get_screenshot`, manual visual review | Позволяет поймать клиппинг и stacking bugs | Проверка ручная, поздняя и не имеет количественных критериев |

## External Patterns Reviewed

| Source | Relevant Idea | What To Borrow |
|---|---|---|
| `zai-org/UI2Code_N` | Treats UI-to-code as visual optimization, not one-shot generation | Ввести итерационный цикл screenshot -> evaluation -> repair before ready |
| `leigest519/ScreenCoder` | Multi-agent decomposition: detection, planning, generation | Разделить Figma work на `layout detector/planner`, `Figma builder`, `visual verifier` |
| `abi/screenshot-to-code` | Uses screenshot as primary reproduction target and supports variant generation | Ввести screenshot target/reference as first-class input and compare generated output to it |
| WebVIA paper/site | Adds exploration/interaction agent and validation module for frontend reproduction | Для app mockups проверять не только static frame, но route walkthrough and state transitions |
| Figma Code Connect docs | Component/code mapping is explicit contract, not implicit visual similarity | Для DS reuse требовать concrete component mapping/import, not "shadcn-like primitives" |

## Root Causes

### 1. Markdown Gates Without Runtime Enforcement

Локальные правила говорят правильные вещи: Primary App Flow, visual evidence, two-pass build, Component Contract Matrix, screenshot QA. Но они не превращены в обязательный executor. Поэтому Figma write может быть сделан вручную большим script patch, а потом агент постфактум называет это Auto Layout/DS grounding.

### 2. Missing Design Intermediate Representation

Сейчас нет промежуточного формата между `screens.md` и Figma nodes:

- screen geometry;
- hierarchy;
- semantic zones;
- fixed/hug/fill constraints;
- min heights;
- text wrapping bounds;
- component instance contract;
- state transitions;
- measurable acceptance.

Из-за этого Figma script сам становится “дизайнером”, “верстальщиком” и “QA” одновременно.

### 3. DS Reuse Is Too Weak

В последней сборке shadcn file был использован как окружение и источник токенов, но не как настоящая component system:

- не импортированы/использованы реальные `Button`, `Card`, `Badge`, `Tabs` instances;
- не создана product-specific component layer после visual calibration;
- не выполнен detached-instance audit;
- local primitives были названы как shadcn primitives, но это не равно Figma component reuse.

### 4. Visual Evidence Is Not Bound To Pixel/Composition Checks

Lazyweb/reference evidence фиксируется как текстовая применимость. Не хватает проверки:

- screen density versus reference;
- hierarchy placement;
- information grouping;
- text amount per card;
- mobile safe area;
- bottom navigation position;
- state progression across route.

### 5. Verification Happens Too Late

Клиппинг текста и stacking bug были найдены только после screenshot. Это хорошо, что QA поймала, но плохо, что первый write вообще мог получить `ready_for_review` без автоматического fail.

## Required Architecture Change

### New Capability: `figma-screen-compiler`

Создать отдельный runtime/skill layer между screen spec и `use_figma`.

Inputs:

- `screens.md` / structured JSON extracted from it;
- selected DS index;
- visual reference cards;
- target file/page/node;
- copy deck;
- screen/state inventory.

Outputs:

- `figma-layout-ir.json`;
- `figma-build-plan.md`;
- Figma node IDs;
- `figma-visual-qa.json`;
- screenshot artifacts;
- repair patches.

### Figma Layout IR Minimum Shape

```json
{
  "surface": "figma_board",
  "viewport": { "width": 390, "height": 844, "safeAreaTop": 34 },
  "route": [
    { "screenId": "home", "primaryAction": "pay_all", "nextState": "bill_detail" }
  ],
  "screens": [
    {
      "id": "home",
      "zones": ["header", "hero_card", "task_list", "insight", "bottom_nav"],
      "constraints": {
        "maxTextLinesPerCard": 3,
        "minRowHeight": 64,
        "bottomNavPinned": true,
        "noClip": true
      },
      "components": [
        { "id": "primary_button", "source": "ds:Button", "fallback": "local_component" }
      ]
    }
  ]
}
```

### Build Loop

1. `compile`: screen spec -> layout IR.
2. `preflight`: validate IR, copy length, DS coverage, missing states.
3. `calibration write`: build 2-3 screens only.
4. `screenshot`: capture each calibration screen.
5. `visual verifier`: detect clipping, overlap, density, hierarchy, route coherence.
6. `repair`: generate targeted patches.
7. `systemize`: create/import components and replace repeated frames with instances.
8. `regression`: screenshot before/after systemization.
9. `route QA`: verify P0 walkthrough.
10. Only then mark `ready_for_review`.

## Proposed Agent Changes

| Agent/Skill | Change |
|---|---|
| `design.agent.md` | Stop at `design-brief.md`; do not imply visual readiness without measurable calibration |
| `design-generator.agent.md` | Require `figma-layout-ir.json` for Figma-ready surfaces |
| `figma-handoff` | Add hard requirement: DS component import/instance audit or explicit `bespoke` |
| `figma-roundtrip` | Promote from guidance skill to verifier-backed workflow |
| New `figma-screen-compiler` | Own IR generation, build plan, screenshot QA and repair loop |
| New `visual-layout-verifier` | Own screenshot/object inventory checks: clipping, overlap, density, hierarchy, safe area, route coherence |

## Proposed Runtime Checks

| Check | Failure Example | Gate |
|---|---|---|
| Text node height | text remains 10px after `textAutoResize=HEIGHT` | block |
| Overlap | amount text overlaps subtitle | block |
| Clipping | card content clipped by screen frame | block |
| Safe area | title touches top radius/status area | block |
| Route coherence | screens have no primary action/next state | block |
| DS honesty | "shadcn" claimed but no DS instances/imports/component mapping | block or deviation |
| Systemization regression | componentized version visually worse than calibration | block |

## Immediate Fixes To Implement Next

1. Add `figma-layout-ir.schema.json`.
2. Add `figma-visual-qa.schema.json`.
3. Add `agent-pack/skills/figma-screen-compiler/SKILL.md`.
4. Add `agent-pack/skills/visual-layout-verifier/SKILL.md`.
5. Update `design-generator.agent.md`: Figma canvas write requires IR + visual QA.
6. Update `figma-handoff-bundle.template.md`: require calibration screenshots per screen and DS honesty audit.
7. Add a script scaffold:
   - parse/author layout IR;
   - run Figma screenshot capture;
   - inspect node metadata;
   - flag text nodes with suspicious height/width;
   - flag overlapping bounding boxes inside each screen.
8. Change acceptance language from `screenshot QA done` to `visual QA passed with checks`.

## Non-Goals

- Do not add another generic prompt.
- Do not rely on a larger one-shot `use_figma` script.
- Do not pretend a community UI kit equals app design evidence.
- Do not make DS reuse mandatory when product-specific visual calibration is better.

## Decision

The next quality improvement should not be another mockup attempt. It should be a source-layer change: introduce a compiler/verifier loop that makes bad Figma output mechanically harder to produce and impossible to mark as ready without evidence.

---
name: ds-baseline
description: Использовать, когда design_system_mode = product_specific или подтверждённый extend требует нового foundation: продукту нужен самостоятельный визуальный язык, а не наследование существующей библиотеки. Skill ведёт двухпроходную сборку — visual calibration на 2-3 экранах, затем systemization токенов и компонентов — и запрещает генерировать foundation из отраслевого preset вместо утверждённых экранов.
---

# DS Baseline (Новая Дизайн-Система С Нуля)

Skill защищает от главной ошибки: сборки foundation до того, как появился хотя бы один хороший экран. Токены и палитра извлекаются из утверждённых экранов, а не из отраслевого preset. Наличие A3 или другой готовой системы не обязывает её наследовать.

**Полная процедура, quality gates и failure modes — в [`agent-pack/skills/ds-baseline/SKILL.md`](../../../agent-pack/skills/ds-baseline/SKILL.md). Следуй ей.** Нормативный workflow — [`agent-pack/workflows/ds-baseline.workflow.md`](../../../agent-pack/workflows/ds-baseline.workflow.md).

## Когда использовать
- `design_system_mode = product_specific`, либо `extend`, требующий нового foundation.
- Продукту нужен самостоятельный визуальный язык (brand separation, другая плотность, другая платформа).

Не использовать для: выбора самого режима (`figma-roundtrip`), техники записи в Figma (`/figma-ds:build`), reuse существующей DS.

## Ключевые шаги
- Strategy: подтвердить режим, записать rationale и отклонённые системы.
- Visual calibration: 2-3 ключевых экрана **без** component matrix; проверить композицию, плотность, иерархию, ритм, copy fit.
- Visual verdict `passed|passed_with_notes|blocked`; при `blocked` foundation не строится.
- Foundation extraction: токены из утверждённых экранов, не из preset.
- Pattern inventory: уникальные блоки остаются bespoke, «универсальный набор компонентов» не создаётся.
- Systemization → Component Contract Matrix → regression check (systemization не ухудшает композицию).

## Обязательные проверки
- `yarn figma:audit --registry design/figma/<slug>/component-contracts.json`
- `yarn validate:config`

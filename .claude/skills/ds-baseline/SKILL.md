---
name: ds-baseline
description: Использовать, когда design_system_mode = product_specific или подтверждённый extend требует нового foundation: продукту нужен самостоятельный визуальный язык, а не наследование существующей библиотеки. Skill ведёт двухпроходную сборку — visual calibration на 2-3 экранах, затем systemization токенов и компонентов — и запрещает генерировать foundation из отраслевого preset вместо утверждённых экранов.
---

# DS Baseline (Новая Дизайн-Система С Нуля)

Skill защищает от главной ошибки: сборки foundation до того, как появился хотя бы один хороший экран. Токены и палитра извлекаются из утверждённых экранов, а не из отраслевого preset. Наличие A3 или другой готовой системы не обязывает её наследовать.

**Полная процедура, quality gates и failure modes — в [`agent-pack/skills/ds-baseline/SKILL.md`](../../../agent-pack/skills/ds-baseline/SKILL.md). Следуй ей.** Нормативный workflow — [`agent-pack/workflows/ds-baseline.workflow.md`](../../../agent-pack/workflows/ds-baseline.workflow.md).

## Когда использовать
**Своя DS — исключение, а не старт.** По `CLAUDE.md` §6.1 дизайн-система по умолчанию — shadcn/ui. Skill открывается только после preflight (§1.1 полной версии): записано, почему тема поверх shadcn (`design/tokens/shadcn/`, `yarn tokens:build`) задачу не закрывает. Без этого — `blocked`.

- `design_system_mode = product_specific`, либо `extend`, требующий нового foundation.
- Продукту нужен самостоятельный визуальный язык: сильный визуальный характер или нестандартный интерфейс (редактор, канвас, плотная таблица).

Не использовать для: выбора самого режима (`figma-roundtrip`), техники записи в Figma (`/figma-ds:build`), reuse существующей DS, а также когда «не хватает одного компонента» — пробел реестра дописывается точечно в своём слое.

## Ключевые шаги
- Preflight: почему shadcn + тема не подходят.
- Strategy: подтвердить режим, записать rationale и отклонённые системы (shadcn/ui обязательно среди них).
- Visual calibration: 2-3 ключевых экрана **без** component matrix; проверить композицию, плотность, иерархию, ритм, copy fit. Поверхность — экран в коде + composition story либо Figma-черновик, если направление ещё расходится.
- Visual verdict `passed|passed_with_notes|blocked`; при `blocked` foundation не строится.
- Foundation extraction: токены из утверждённых экранов, не из preset; результат кладётся в `design/tokens/` и проходит `yarn tokens:build` с baseline-гейтом.
- Pattern inventory: уникальные блоки остаются bespoke, «универсальный набор компонентов» не создаётся.
- Systemization (компоненты + стори состояний в витрине; Figma-слой — только как показ из уже принятых токенов) → Component Contract Matrix → regression check.

## Обязательные проверки
- `yarn figma:audit --registry design/figma/<slug>/component-contracts.json`
- `yarn validate:config`

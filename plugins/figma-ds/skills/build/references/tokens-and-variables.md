# Токены и Variables (механика Plugin API)

Что правильно по канону — три тиера, role-based naming, modes, DTCG, покрытие ≥ цвета — `/figma-ds:standard` §1. Здесь только **как это сделать** в Plugin API и на какие грабли не наступить.

## Цвета — Variables, а не Paint Styles
- **Принцип:** заливки/обводки биндить напрямую к переменной, а не красить Paint-стилями.
- **API:** `figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r,g,b}}, "color", variable)`.
- **Грабля:** Paint-styles для цвета читается как «покрашено стилями», а не токенами.
- **Фикс:** только variable-bound fills; Paint-styles для цвета не использовать.

## Три тира: palette → semantic → component
`palette` (primitives, сырые) → `semantic` (bg/ink/muted/accent/…, alias на primitive) → `component` (индивидуально под каждый компонент, alias на semantic).

- **Обоснование трёх тиеров и почему component-тир обязателен — `/figma-ds:standard` §1.** Ниже — Figma-механика привязки.
- **API:**
  - primitive → semantic: `sem.setValueForMode(mode, figma.variables.createVariableAlias(primVar))`. Альфа-варианты — отдельный primitive (alias не меняет alpha).
  - semantic → component: то же, alias на semantic.
- **Правило привязки нод:** ноды компонентов биндить к **COMPONENT-слою**, не к semantic напрямую. Экраны/макеты — к **semantic**.
- **Figma-специфика (эмпирика):** без component-тира иконочные/лейбловые слоты наследуют не тот общий цвет — это класс багов «иконка/лейбл унаследовал не тот общий цвет». Плюс component-тир даёт изоляцию (перекрасить один компонент, не трогая другие), явную документацию токен↔слот и темизацию на уровне компонента.

## Именование component-токенов — через СЛЭШИ
Слэш = уровень дерева в панели Variables; коллекция `components`, 1 mode.

- **цвет:** `{component}/{variant}/{scheme}/{slot}/color/{state}` — напр. `button/primary/accent/bg/color/default`, `button/primary/accent/label/color/disabled`, `button/primary/accent/icon/color/disabled`, `button/ghost/accent/border/color/hover`. slot = bg/label/border/**icon**; state = default/hover/active/focus/disabled/loading.
- **размер:** `{component}/{size}/{dim}` — напр. `button/md/height`, `button/md/padding-left`, `button/md/padding-right`, `button/md/min-width`, `button/md/border-radius`, `button/md/spacing`, `button/md/border-width`; вложенные — `button/sm/label/padding-horizontal`.

## Code Syntax — обязателен для каждого токена
- **Принцип:** без code syntax токен не подхватится в коде при handoff/Dev Mode.
- **API:** `variable.setVariableCodeSyntax("WEB", "var(--<имя-со-слэшами→дефисы>)")`. Напр. `button/primary/accent/bg/color/default` → `var(--button-primary-accent-bg-color-default)`; `button/md/padding-left` → `var(--button-md-padding-left)`. Задавать и цветовым, и FLOAT-токенам (минимум платформа WEB).
- **Правило:** слэши — в имени переменной (группировка), дефисы — только в code syntax.

## Символы в имени — ДВА разных запрета, не путать
- **Точка — жёсткий запрет Plugin API** (`createVariable` кидает «invalid variable name»).
- **`_` — НАША конвенция** (CSS-стиль токенов; API подчёркивание допускает).
- Дробь в имени — ДЕФИСОМ: `border/width/1-5`, не `1_5` и не `1.5`.
- **Проверка перед отчётом:** `_` и точек в именах и code syntax по системе = 0.

## Переменная — это НЕ нода
- `figma.getNodeByIdAsync("VariableID:262:2")` вернёт `null`; переменную достаёт `figma.variables.getVariableByIdAsync("VariableID:…")`.
- **Грабля:** легко потерять время, решив «токена нет».

## Spacing/radius/border — FLOAT-переменные
- Биндить layout-свойства **и в компонентах, и в макетах:** `node.setBoundVariable("itemSpacing"|"paddingLeft"|"strokeRightWeight"|..., floatVar)`.
- **Правило:** НИКОГДА не хардкодить числа отступов даже «по шкале» — биндить к `space/*` (в макетах) / component-размерным токенам (в компонентах).

## scopes — ограничить, где переменную предлагает пикер
- **Принцип:** иначе каждый FLOAT предлагается во ВСЕХ числовых полях, а цвет — во всех заливках; пикер «замусоривается».
- **Примеры:** spacing → `["GAP","WIDTH_HEIGHT"]`, radius → `["CORNER_RADIUS"]`, цвет фона → `["FRAME_FILL","SHAPE_FILL"]`, цвет текста → `["TEXT_FILL"]`. `ALL_SCOPES`/`ALL_FILLS` взаимоисключающи с частными.
- Задавать вместе с code syntax — это часть «правильно оформленного токена».

## Типографика
- **Text Styles** (уместно). Цвет текста — отдельно, через variable-bound fill (к component-токену лейбла).

## Modes — на semantic, не на primitives
- Light/Dark = разные значения semantic-переменных; primitives неизменны. В Figma: collections + modes, semantic aliasʼит primitive под каждый mode. `theme` (бренд) и `domain` — отдельные оси/коллекции, не мешать с mode.
- Канон и обоснование — `/figma-ds:standard` §1.

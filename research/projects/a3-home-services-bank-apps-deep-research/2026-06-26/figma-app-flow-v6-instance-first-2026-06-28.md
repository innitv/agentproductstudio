# Figma App Flow v6 / Instance-First DS Reuse

## Status

`ready_for_review`

## Target

| Field | Value |
|---|---|
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55 |
| Figma page | `A3 Дом x банк - v6 instance-first` |
| Board node | `3049:1075` |

## Correction

v5 был частичным: CTA были заменены на DS instances, но большая часть карточек и строк в самих экранах оставалась вручную собранными primitives. Это не соответствует ожиданию "использовать дизайн-систему", где ключевые UI-блоки должны быть `INSTANCE` от main component и подсвечиваться как связанные экземпляры.

v6 создан как отдельная `instance-first` версия:

- экранные контейнеры остаются обычными layout frames;
- все повторяемые UI-блоки внутри экранов являются `INSTANCE`;
- существующие DS-компоненты используются напрямую;
- новые компоненты созданы только для отсутствующих A3/GIS-паттернов и затем вставлены как instances.

## Reused Existing DS Components

| Need | Source | Component key |
|---|---|---|
| Primary CTA | `Simple Design System / Button` | `cc8b558dc7d9684011b6b99ce8e6509399bc836b` |
| Payment card | `Library_МосПлатежи / Card for Payment` | `b0a51aeef43fe6725284d54da3e3ffbec32b722f` |
| History / receipt card | `Library_МосПлатежи / Card for History` | `1614bd5a20d6db18dfd692d8da7e267a3182654d` |
| Bank card | `App Ui-kit / mini card/alfa/mir` | `c8e00abd4db84d1ee0ae86f29c2487c483e4a01d` |

## Created Only Missing Product-Specific Components

| Component | Why created |
|---|---|
| `A3 missing/Header object context` | Контекст адреса/объекта в банковском разделе "Дом". |
| `A3 missing/GIS sync chip` | Статус синхронизации банк -> A3 -> ГИС ЖКХ отсутствует в DS. |
| `A3 missing/Home object status row` | Строка связи адреса, лицевого счета, источника ЖКХ и риска ошибки. |
| `A3 missing/Supplier reconciliation block` | Recovery-блок: банк принял платеж, но долг у поставщика еще отображается. |
| `A3 missing/Bank bottom nav` | Банковская навигация раздела в рамках этого product flow. |
| `A3 missing/Bill explain lines` | Объяснение роста счета ЖКУ по строкам начисления. |

## Figma Inventory

| Check | Result |
|---|---|
| Instances in board | `64` |
| Local main components | `6` |
| Primitive `button/` or `card/` frames in screens | `0` |
| Existing DS imported | `4` component sources |
| Product-specific created components | `6`, all used as instances |

## Sample Instance Evidence

| Instance | Main component |
|---|---|
| `INSTANCE DS/Button - Подключить дом` | `Variant=Primary, State=Default, Size=Medium` |
| `INSTANCE DS/Card for Payment - current bill` | `Type=ЖКХ Москвы, Button=Yes` |
| `INSTANCE DS/mini card alfa` | `mini card/alfa/mir` |
| `INSTANCE A3/GIS sync chip` | `A3 missing/GIS sync chip` |
| `INSTANCE A3/reconciliation block` | `A3 missing/Supplier reconciliation block` |

## Remaining Constraint

Некоторые импортированные DS-карточки имеют ограниченные exposed text properties, поэтому часть текста внутри них остается ближе к исходному компоненту (`ЖКХ Москвы`, стандартные поля). Это честный trade-off instance-first подхода: сначала сохраняем связь с DS, затем отдельно решаем, нужно ли расширять component properties в самой дизайн-системе.

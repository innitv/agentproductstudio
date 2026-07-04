# Figma App Flow v5 / DS Reuse Mobile Screens

## Status

`ready_with_notes`

## Target

| Field | Value |
|---|---|
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55 |
| Figma page | `A3 Дом x банк - v5 app-like screens` |
| Board node | `3042:3` |
| DS reuse strip | `3044:2` |

## What Changed

v5 исправляет отклоненную v4: экраны больше не выглядят как техническая доска. Это мобильный банковский flow для раздела "Дом": подтверждение адреса, домовой dashboard, счет ЖКУ, проверка платежа, статус банка/A3/ГИС ЖКХ, recovery при висящем долге, показания и сервисы дома.

## Lazyweb Evidence

| Query / Source | Coverage | Applied pattern |
|---|---|---|
| `utility bill payment` / Xfinity utility overview | moderate | Карточка текущего счета, быстрые действия, объект сверху. |
| `payment review` / Discover, Chime | moderate | Проверка суммы, получателя, источника списания и условий перед CTA. |
| `payment receipt/status` / Discover payment confirmation | moderate | Разделение факта платежа, деталей чека и следующего статуса. |
| `support request status` / WeWork support request | moderate | Категория обращения, описание, адресат, attachment/proof. |

Lazyweb `objective=create` вернул redirect в greenfield research flow, потому что текущего screen screenshot не было. Поэтому применен доступный Lazyweb evidence через `lazyweb_search`, а не optimize/improve report.

## DS Reuse Contract

| UI need | Decision | Source |
|---|---|---|
| Primary CTA buttons | reused | `Simple Design System / Button`, component key `cc8b558dc7d9684011b6b99ce8e6509399bc836b`; экранные CTA заменены на instances с `Label#2:0` overrides. |
| Payment card | reused candidate | `Library_МосПлатежи / Card for Payment`, component key `b0a51aeef43fe6725284d54da3e3ffbec32b722f`; показан в DS reuse strip. |
| History card | reused candidate | `Library_МосПлатежи / Card for History`, component key `1614bd5a20d6db18dfd692d8da7e267a3182654d`; показан в DS reuse strip. |
| Bank card | reused candidate | `App Ui-kit / mini card/alfa/mir`, component key `c8e00abd4db84d1ee0ae86f29c2487c483e4a01d`; показан в DS reuse strip. |
| `App Ui-kit/buttons` | rejected for screen CTA | Component exists, but text override is blocked by missing `Mont SemiBold` font in current Figma environment. |
| GIS sync chip | create only missing | Product-specific status for bank -> A3 -> GIS ЖКХ synchronization. |
| Supplier reconciliation block | create only missing | Product-specific recovery when bank payment is accepted but supplier/GIS debt still appears. |
| Home object status row | create only missing | Product-specific row connecting address, account, source and payment-risk signal. |

## Screen Route

| Step | Screen | Primary action |
|---|---|---|
| 1 | `Подключить дом` | `Подключить дом` |
| 2 | `Дом` | `Открыть счет` |
| 3 | `Счет ЖКУ` | `Перейти к оплате` |
| 4 | `Проверка платежа` | `Оплатить 6 180 ₽` |
| 5 | `Платеж принят` | `Смотреть чек` / `Что с долгом?` |
| 6 | `Долг еще висит` | `Отправить обращение` |
| 7 | `Показания` | `Передать` / `Не мой прибор` |
| 8 | `Сервисы дома` | `Создать заявку` |

## QA Notes

| Check | Result |
|---|---|
| Screen count | pass: 8 mobile screens |
| App-like UI gate | pass: screens read as mobile banking UI, not a technical board |
| Lazyweb evidence gate | pass_with_degradation: report redirect for greenfield; direct search evidence used |
| DS reuse gate | pass_with_notes: CTA instances replaced with Simple Design System Button; payment/history/bank cards imported as reuse candidates; only product-specific GIS/A3 blocks remain custom |
| Russian Publication Gate | pass |

## Remaining Notes

- One more mechanical pass can replace local payment-card primitives inside individual screens with `Library_МосПлатежи` card instances where text/property overrides fit the scenario.
- Current v5 is suitable for review of flow, hierarchy, copy and product logic; production-grade DS cleanup should keep replacing primitives with DS instances screen by screen.

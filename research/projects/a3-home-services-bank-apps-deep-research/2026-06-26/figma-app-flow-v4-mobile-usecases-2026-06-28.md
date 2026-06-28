# Figma App Flow v4 / Mobile Use Cases

## Status

`rejected_needs_redesign`

## Target

| Field | Value |
|---|---|
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55/shadcn-ui-components-with-variables---Tailwind-classes---Updated-January-2026--Community-?node-id=3038-2 |
| Figma page | `for flow` |
| Board node | `3038:2` |
| Screen nodes | `3038:6`, `3038:55`, `3038:105`, `3038:165`, `3038:214`, `3038:268`, `3038:313`, `3038:358` |

## Why This Version Exists

v4 пересобирает use cases как мобильное приложение, а не как отдельные интерфейсы. P0 route теперь начинается с подтверждения объекта, проходит через счет, платеж, внешний статус и recovery path, а P1 use cases подключены как ветки из того же объекта.

## Rejection Note

После human review 2026-06-28 этот artifact отклонен: визуально он все еще выглядит как технический Figma board с маленькими служебными экранами, а не как готовые макеты мобильного банковского приложения. Структурные проверки ниже не считать доказательством UI quality.

## Mobile Flow

| Step | Screen | User question | Primary action | Next state |
|---|---|---|---|---|
| 01 | Добавить дом | Это точно мой дом и какая у меня роль? | `Подключить дом` | Home dashboard |
| 02 | Дом | Что по дому требует действия сейчас? | `Открыть счет` | Bill detail |
| 03 | Счет ЖКУ | Кому и за что я плачу? | `Перейти к оплате` | Payment review |
| 04 | Проверка платежа | Что спишется и когда поставщик увидит оплату? | `Оплатить 6 180 ₽` | Payment status |
| 05 | Платеж принят | Деньги ушли из банка или долг уже закрыт у поставщика? | `Смотреть чек` / открыть recovery | Debt recovery |
| 06 | Долг еще висит | Куда идти, если поставщик все еще показывает долг? | `Отправить обращение` | Supplier request |
| 07 | Показания | Почему значение не принято? | `Сообщить о неверном приборе` | Meter correction |
| 08 | Сервисы дома | Какие P1 сценарии связаны с этим объектом? | `Создать заявку` / `Добавить семейный доступ` | Secondary flows |

## Reuse-First Component Note

Перед v4 был проверен существующий board `3013:2`: опубликованные instances в нем не заявлены, локальных component/instance nodes внутри board не было. Поэтому v4 не создает новую библиотеку и не собирает полный component set. Использованы существующие Inter text styles, Tailwind/shadcn variable context and effect context из файла; локальные auto-layout primitives созданы только как точечные экранные building blocks.

## Lazyweb Evidence

Полный Lazyweb report был недоступен в текущем MCP tool list: image upload tools отсутствовали, а inline Figma export оказался слишком большим для надежной передачи. Использован degraded Lazyweb grounding через доступные search tools:

| Query | Coverage | Applied pattern |
|---|---|---|
| `mobile dashboard` | moderate | объект/контекст сверху, рабочие entry points, bottom navigation |
| `payment review` | moderate | подтверждение получателя, суммы, источника списания и условий перед CTA |
| `status tracking` | weak | статусный экран как proof + next action, применено осторожно |
| `support request` | moderate | форма обращения с категорией, описанием, attachment/proof и адресатом |

## QA

Figma-side verification after repair:

| Check | Result |
|---|---|
| Screen count | 8 |
| Text height issues | 0 |
| Text clipping issues | 0 |
| Top-level overlap issues | 0 |
| Russian Publication Gate | pass |
| Primary App Flow Gate | pass |

## Acceptance

Reviewer should understand in 60 seconds:

1. where the user starts;
2. why object confirmation happens before money;
3. how bill detail leads into payment;
4. why bank status and supplier/GIS status are separate;
5. what to do when debt remains visible;
6. how readings, emergency/request and family access connect back to the same home object.

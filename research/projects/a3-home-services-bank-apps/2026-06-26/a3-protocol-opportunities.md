# A3 Protocol Opportunities

## Назначение

Этот документ переводит исследование в каталог API/protocol capabilities, которые A3 может предложить банкам для раздела "Дом". Названия протоколов условные: они описывают продуктовую способность, а не существующую публичную спецификацию A3.

## Принцип упаковки

Каждый протокол должен возвращать не только значение поля, но и:

- `source`: откуда взято поле;
- `updated_at`: когда поле обновлялось;
- `confidence`: насколько надежна связка адреса/дома/счета;
- `user_action`: что пользователь может сделать дальше;
- `privacy_scope`: какой consent нужен;
- `fallback`: что показывать, если данных нет.

## Каталог P0

| Protocol | Endpoint concept | Input | Output | User value | Bank value |
|---|---|---|---|---|---|
| `address.resolve` | `/address/resolve` | строка адреса, координата, ФИАС/ГАР id, квартира optional | нормализованный адрес, дом, помещение, confidence, возможные дубль-адреса | не ошибиться домом/квартирой | меньше ошибок поиска начислений |
| `home.identity.match` | `/home/identity/match` | адрес + ФИО/телефон/лицевой счет optional | возможные лицевые счета и поставщики с уровнем подтверждения | понять, что это мой счет | повышает оплату в банке |
| `billing.accruals.get` | `/billing/accruals` | confirmed home/account id | начисления, задолженность, период, поставщик, комиссия, срок | увидеть, что надо оплатить | платежная конверсия |
| `billing.explain` | `/billing/explain` | начисление + история | рост/снижение по категориям, тариф, показания, перерасчет | понять "почему так дорого" | меньше недоверия и обращений |
| `home.management.get` | `/home/management` | house id | УК/ТСЖ/ЖСК, контакты, лицензия, диспетчерская, аварийка | знать, куда обращаться | daily utility внутри банка |
| `meters.state.get` | `/meters/state` | account/home id | счетчики, последние показания, срок передачи, срок поверки | не забыть показания/поверку | monthly retention |
| `resident.calendar.get` | `/resident/calendar` | home/account id | платежи, показания, поверка, плановые отключения, собрания, капремонт | календарь дома | регулярный возврат |

## Каталог P1

| Protocol | Endpoint concept | Input | Output | User value | Caveat |
|---|---|---|---|---|---|
| `home.profile.get` | `/home/profile` | house id | год постройки, материал, этажность, лифты, серия, площадь, аварийность, капремонт | оценить дом и понимать расходы | нужны даты обновления и источники |
| `repairs.plan.get` | `/repairs/plan` | house id | программа капремонта, виды работ, сроки, фонд, статус | понять, за что взносы и когда ремонт | региональные различия |
| `incidents.route` | `/incidents/route` | house id + problem type | ответственный канал: УК, РСО, ГЖИ, город, фонд капремонта | не искать вручную | нельзя обещать результат |
| `appeals.create` | `/appeals` | problem, фото, адрес, contact consent | обращение, номер, канал, SLA, next step | подать жалобу из банка | требуется правовой контур |
| `appeals.status.get` | `/appeals/status` | appeal id | статус, ответ, дедлайн, возможность оспорить | контролировать "отписку" | зависит от интеграций |
| `provider.directory.get` | `/providers/directory` | house/account id | РСО: вода, тепло, электричество, газ, мусор | понимать поставщиков | не все поставщики доступны |

## Каталог P2

| Protocol | Endpoint concept | Input | Output | User value | Caveat |
|---|---|---|---|---|---|
| `owners.meetings.get` | `/owners/meetings` | property proof + house id | ОСС, повестки, решения, протоколы | участвовать в управлении домом | высокие требования к идентификации |
| `owners.vote.intent` | `/owners/vote-intent` | meeting id + user id | подготовка к голосованию / deeplink в официальный канал | проще голосовать | банк может быть только витриной |
| `quality.benchmark.get` | `/quality/benchmark` | house id / management id | жалобы, сроки ответов, дома УК, рейтинг | оценить качество УК | риск споров и клеветы |
| `services.marketplace.recommend` | `/services/recommend` | incident/home context | поверка, сантехник, электрик, страховка | решить бытовую задачу | нужен нейтральный disclosure рекламы |
| `family.home.link` | `/family-home/link` | invite + consent | доступ к платежам и напоминаниям родственника | забота о родителях | consent и роли доступа |

## API Objects

| Object | Ключевые поля |
|---|---|
| `HomeAddress` | `raw_address`, `normalized_address`, `fias_id`, `gar_id`, `house_guid`, `flat`, `confidence` |
| `HomeProfile` | `house_guid`, `build_year`, `building_type`, `material`, `floors`, `entrances`, `lifts`, `area_total`, `is_emergency`, `source`, `updated_at` |
| `ManagementOrg` | `org_name`, `inn`, `ogrn`, `license`, `management_form`, `contract_from`, `contacts`, `emergency_contacts`, `source` |
| `UtilityProvider` | `service_type`, `provider_name`, `inn`, `payment_identifier`, `contact`, `billing_role` |
| `Accrual` | `account_id`, `period`, `amount`, `debt`, `service_lines`, `due_date`, `payment_status`, `explainability` |
| `Meter` | `meter_id`, `resource_type`, `last_reading`, `reading_window`, `verification_due`, `submit_available` |
| `ResidentAction` | `action_type`, `priority`, `deadline`, `responsible_party`, `deeplink`, `status` |
| `Appeal` | `appeal_id`, `problem_type`, `channel`, `sla`, `evidence`, `status`, `answer`, `dispute_available` |

## Банковская упаковка

| Bank module | Какие протоколы нужны | MVP behavior |
|---|---|---|
| "Мой дом" | `address.resolve`, `home.profile.get`, `home.management.get` | карточка адреса, УК, аварийка, основные характеристики |
| "Счета и объяснения" | `billing.accruals.get`, `billing.explain`, `provider.directory.get` | начисление, оплата, причина изменения суммы |
| "Показания" | `meters.state.get`, `meters.readings.submit`, `resident.calendar.get` | напоминание и отправка показаний |
| "Проблема в доме" | `incidents.route`, `appeals.create`, `appeals.status.get` | выбрать проблему и увидеть, куда она ушла |
| "Дом родителей" | `family.home.link`, `billing.accruals.get`, `resident.calendar.get` | оплачивать и получать напоминания по доверенному адресу |

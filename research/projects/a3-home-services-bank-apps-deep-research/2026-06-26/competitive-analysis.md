# Competitive Analysis: раздел "Дом" и ЖКХ-сервисы

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`
- `scenario-user-flows.md`
- Google Play: Госуслуги Дом
- App Store: Госуслуги.Дом
- публичный контекст ГИС ЖКХ

## Competitor / Alternative Set

| Name | Type | Category | Source URL | Evidence status | What it proves |
|---|---|---|---|---|---|
| Госуслуги.Дом | direct alternative | государственный домовой сервис | https://play.google.com/store/apps/details?id=ru.sigma.gisgkh&hl=ru; https://apps.apple.com/ru/app/госуслуги-дом/id1616550510 | source-backed | Набор ожидаемых жильцом функций: счета, показания, заявки, аварии, ОСС, чаты, поверка, гостевой доступ. |
| ГИС ЖКХ | infrastructure / data system | государственный источник данных ЖКХ | https://dom.gosuslugi.ru | source-backed | Контур данных: жилищный фонд, услуги, начисления, задолженность, поставщики информации. |
| Приложения УК/ТСЖ/ЖСК | substitute workflow | локальный сервис дома | local/partner validation needed | needs_validation | Могут быть ближе к заявкам, диспетчерской и домофону, но редко покрывают банковскую оплату и семейные платежи. |
| Региональные и городские сервисы | substitute workflow | городские услуги и ЖКХ | source discovery needed | needs_validation | Могут иметь сильный контур обращений/городских услуг, но покрытие зависит от региона. |
| Банковский раздел "Дом" Т-Банка | target channel | банковское приложение | публичный exact feature scope не подтвержден в run | needs_validation | Нужен product walkthrough или партнерское подтверждение. |
| Банковский раздел "Дом" Альфа-Банка | target channel | банковское приложение | публичный exact feature scope не подтвержден в run | needs_validation | Нужен product walkthrough или партнерское подтверждение. |

## Comparison Matrix

| Capability | Госуслуги.Дом | ГИС ЖКХ | УК/ТСЖ app | Bank + A3 opportunity | Evidence / risk |
|---|---|---|---|---|---|
| Подтягивание недвижимости | заявлено через подтвержденную учетную запись и данные ГИС ЖКХ | источник данных | зависит от дома | показывать объект в банке через consent и object matching | source-backed для Госуслуги.Дом; bank API = needs_validation |
| Оплата ЖКУ | заявлена | данные/квитирование | зависит от УК/РСО | единый платежный сценарий с банковским чеком и статусом поставщика | source-backed для user need |
| Статус квитирования | зависит от данных поставщика | системный источник | зависит от интеграции | разделить "банк принял" и "поставщик учел" | App Store review/answer |
| Показания счетчиков | заявлены | источник/поставщик данных | часто есть локально | показать прибор, период, последнее значение, ошибку и адресата | source-backed |
| Заявки жильцов | заявлены официальные ответы УК | может хранить/маршрутизировать данные | сильный локальный канал | банк как входная точка, A3 как маршрутизация, УК как исполнитель | legal role = needs_validation |
| Аварийная диспетчерская | заявлена | контактный контур | часто есть | быстрый аварийный контакт в карточке дома | source-backed pattern |
| Гостевой/семейный доступ | есть в release notes | права зависят от данных | редко стандартизован | ограниченная роль плательщика за другой адрес | hypothesis, validate |
| Поверка счетчиков | заявлена | приборы/документы | зависит от партнеров | напоминания и партнерский сценарий после P0 | source-backed as feature, business model = needs_validation |

## Scenario Opportunity Map

| Scenario | Главное трение | A3 Home Services response | Priority | Validation |
|---|---|---|---|---|
| Объект "Дом" по адресу/лицевому счету | объект не найден, пользователь не понимает права доступа | object matching, role, source, consent explanation | P0 | walkthrough + API discovery |
| Счета ЖКУ и статус оплаты | долг висит после оплаты, получателей несколько | normalized bill, bank status, supplier/GIS status, receipt escalation | P0 | usability test + support data |
| Показания счетчиков | неверный прибор, закрытый период, отклоненное значение | meter card, allowed window, previous value, rejection reason | P0 | task tests with edge cases |
| Заявка/аварийный контакт | непонятно, кто исполнитель и куда звонить | house contact card, emergency route, request status | P1 | service blueprint with УК/РСО |
| Семейная оплата жилья | плательщик не собственник, несколько адресов | guest payer role, object list, reminders, proof sharing | P1 | interviews with family payers |
| Поверка и плановые события | пользователь узнает поздно | reminder, meter verification status, partner route | P2 | smoke test + partner validation |

## Takeaways

- Прямой продуктовый ориентир для A3 Home Services не "еще одна оплата", а банковский вход в домовые статусы: объект, счет, прибор, заявка, контакт, подтверждение.
- Самая сильная зона дифференциации для банка: понятный статус после действия. Госуслуги.Дом показывает, что пользовательская боль возникает именно там, где источник данных и источник оплаты расходятся.
- Exact claims по Т-Банку, Альфа-Банку и A3 endpoints нельзя переносить дальше без source-backed product walkthrough.

## Strategic Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Банк не контролирует данные поставщика ЖКУ | пользователь будет винить банк за долг/ошибку счетчика | copy и UI должны показывать источник статуса и адресата исправления |
| Consent выглядит чрезмерным | пользователь может отказаться от подключения объекта | purpose-by-purpose consent и минимальный доступ для роли плательщика |
| УК/РСО не отвечает быстро | заявка в банковском приложении может ухудшить доверие | SLA/role boundaries до запуска; статус "ожидается ответ УК" |
| Public competitor scope неполный | можно ошибиться в сравнении с Т-Банком/Альфой | validate через реальные экраны или stakeholder demo |

## Readiness Checklist

- [x] Минимум 3 alternatives captured.
- [x] Банковские exact features помечены `needs_validation`.
- [x] Нет рекомендаций вне темы "Дом"/ЖКХ.

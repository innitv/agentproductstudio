# SWOT: A3 Home Services / раздел "Дом"

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`

## SWOT

| Quadrant | Item | Evidence | Confidence | Implication |
|---|---|---|---|---|
| Strength | Банк уже является привычным местом оплаты, а A3 может добавить домовой контекст: объект, счет, прибор, заявку, статус | source-backed user need from Госуслуги.Дом features and reviews; exact A3/bank contract needs validation | medium | PRD начинать со счета ЖКУ и статуса, а не с широкого каталога услуг |
| Strength | Статусная модель может решить боль "оплатил, но долг висит" | App Store review/answer about supplier data and operation history | medium | UI должен показывать несколько статусов и источник каждого статуса |
| Weakness | Точные A3 endpoints и банковский scope непубличны | current run source quality pass | high | Все endpoint/partner claims идут в `claims_to_validate` |
| Weakness | Банк не исполнитель по заявкам УК/РСО и не владелец всех данных ГИС ЖКХ | product/legal inference from source-backed system boundaries | medium | Требуется честная граница ответственности в copy и support |
| Opportunity | Добавление объекта по лицевому счету, семейная оплата и гостевой доступ | App Store release notes show related patterns in Госуслуги.Дом | medium | P1 growth path после P0 счетов/статусов |
| Opportunity | Показания счетчиков и поверка дают ежемесячный/периодический return loop | public feature list includes readings and meter verification | medium | Создать регулярные напоминания и error-state flow |
| Threat | Пользователь может отказаться из-за широкого доступа к данным | App Store review about permission concerns | medium | Consent wording and minimal-role mode are launch gates |
| Threat | Неверные данные дома/счетчика или медленная УК ударят по доверию к банку | Google Play reviews about wrong meters, loading and support | medium | Нужно показывать источник ошибки и маршрут исправления |

## Strategic Notes

- Самая сильная первая ставка: `Дом -> объект -> счет ЖКУ -> статус оплаты/квитирования -> заявка по проблеме`.
- Второй слой: `Дом -> счетчики -> показания -> ошибка/принято -> поверка`.
- Третий слой: `семейные роли`, несколько объектов, нежилые помещения, плановые события дома.
- Запрещено переносить downstream точные утверждения о Т-Банке, Альфа-Банке и A3 endpoints без partner validation.

## Strategic Decisions

| Decision | Rationale | Validation |
|---|---|---|
| Начать с P0 счетов и статусов | Это денежный сценарий с максимальной близостью к банковскому приложению и подтвержденной пользовательской болью | prototype task: понять статус после оплаты |
| Не делать заявки жильцов первым единственным сценарием | Высокая ценность, но банк не владеет исполнением УК/РСО | service blueprint and legal review |
| Разделить roles: собственник, гость, плательщик | Гостевой/семейный сценарий подтвержден как паттерн, но требует consent | interviews with family payers |
| В каждом спорном экране показывать источник данных | Иначе пользователь считает ошибку банка ошибкой начисляющей организации | comprehension test |

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| API discovery покажет, что часть данных недоступна A3 или банку | high | staged roadmap; mark unavailable data as manual/partner flow |
| Пользователь ждет мгновенного исчезновения долга после оплаты | high | clear status copy and receipt escalation |
| УК/РСО не отвечает в приемлемый срок | medium | status "ожидается ответ организации"; escalation path |
| Consent drop-off высокий | medium | test minimal data scopes before launch |

## Readiness Checklist

- [x] SWOT привязан к домовым сценариям и source-backed evidence.
- [x] Synthetic/advisory data не используется как факт.
- [x] Claims-to-validate вынесены в `research-summary.md`.

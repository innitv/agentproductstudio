# Обновление исследования SIM Line — multi-source API

## Статус

Проведен повторный research через внешние API-провайдеры. Запрошены `tavily` и `deepseek`.

Итоговый статус: `ready`. Tavily вернул источники, DeepSeek отработал как обязательный cross-check/check provider.

| Provider | Requested | Used | Sources | Validation state | Notes |
|---|---:|---:|---:|---|---|
| Tavily | yes | yes | 8 | pass | Источники для рынка, конкурентов и activation-flow patterns |
| DeepSeek | yes | yes | 0 | pass | Обязательная проверка гипотез/рисков, не доказательная база |

## Новые выводы

| Вывод | Основание | Уверенность | Что делать в продукте |
|---|---|---|---|
| eSIM purchase flow должен объяснять выбор страны/пакета, QR или app delivery, активацию и поддержку до заявки | Tavily sources: Telna, Telwel, EVERY | medium | Оставить checker, шаги активации и support promise в первой половине лендинга |
| Travel eSIM и второй номер — видимые сценарии спроса | Tavily sources: Telwel, EVERY, Telna | medium | В hero/copy сохранять сценарии "поездка", "второй номер", "без салона" |
| Для русскоязычного рынка нельзя обещать "полностью онлайн без документов" без юридической проверки | Tavily sources: TAdviser, Klerk + DeepSeek cross-check | medium | Claims про KYC, MNP и мгновенную активацию оставить `needs validation` |
| B2B/partner angle возможен, но вторичен | Sonalake / Sim Local case study | low | B2B CTA оставить вторичным, не делать главным сценарием |
| Количественные market-size claims нельзя выносить в лендинг без primary validation | Data Bridge, TAdviser surfaced via Tavily | low | Не использовать цифры рынка в публичном copy |

## Конкурентные ориентиры

| Источник | Что проверяли | Вывод для SIM Line |
|---|---|---|
| Telwel | Русскоязычная eSIM-продажа и активация | Нужны понятные шаги: выбрать страну/пакет, установить eSIM, активировать |
| EVERY | Travel eSIM позиционирование | Для travel-сценария важны простота, страны, отсутствие роуминга |
| Telna | Platform/white-label eSIM sales flow | QR/app delivery и operational readiness должны быть объяснены до оплаты |
| Sim Local case study | B2C/B2B eSIM sales platform | B2B workflow и partner onboarding возможны, но это отдельный сценарий |

## Что нельзя утверждать без проверки

- "Активация за 2-5 минут" — нужно подтверждение оператора и фактического provisioning flow.
- "Полностью онлайн без документов" — высокий риск из-за KYC/идентификации.
- "Мгновенный перенос номера" — нужен подтвержденный MNP-сценарий.
- "Работает на всех устройствах" — нужен compatibility whitelist.
- "$4B+ рынок eSIM" — цифра surfaced через вторичные/коммерческие источники и требует primary validation.

## Источники Tavily

| Source | Used for |
|---|---|
| https://www.databridgemarketresearch.com/reports/global-esim-market | Market context; quantitative claims require validation |
| https://www.tadviser.ru/index.php/Статья:ESIM_(Embedded_SIM)_Электронная_сим-карта | Russian eSIM/KYC context |
| https://www.telna.com/how-to-sell-esims-for-travelling | eSIM purchase, QR/app delivery and activation-flow patterns |
| https://telwel.io | Russian-language travel eSIM competitor UX |
| https://sonalake.com/case-studies/enabling-growth-through-engineering-scaling-sim-local%E2%80%99s-esim-sales-platform | B2C/B2B eSIM platform and partner onboarding angle |
| https://www.klerk.ru/blogs/exnode/692349 | Russian online eSIM purchase caveats |
| https://trustedconnectivity.valid.com/solutions/esims | eSIM security/provisioning context |
| https://every.ru/esim | Travel eSIM competitor positioning |

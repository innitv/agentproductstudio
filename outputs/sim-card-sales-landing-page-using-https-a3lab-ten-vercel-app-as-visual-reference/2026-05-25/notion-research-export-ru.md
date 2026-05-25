# Исследование SIM Line

## Краткое резюме

SIM Line — концепт лендинга для подбора SIM и eSIM. Пользовательский сценарий строится вокруг простого выбора: проверить формат, понять тариф, оставить заявку и получить SIM-карту, QR для eSIM или консультацию.

Визуальный референс `https://a3lab-ten.vercel.app/` использован только как ориентир по структуре и качеству подачи: крупный первый экран, понятная навигация, карточки преимуществ, последовательное снятие операционных вопросов и CTA. Бренд, тексты, платёжное позиционирование и фирменный стиль A3 не копируются.

## Главные выводы

| Вывод | Основание | Уверенность | Что делать в продукте |
|---|---|---|---|
| Первый экран должен сразу говорить про SIM/eSIM, а не про абстрактный сервис | Анализ референса и PRD | high | Крупный заголовок "SIM и eSIM без лишних походов" |
| Проверка eSIM должна идти до выбора тарифа | GSMA eSIM context + пользовательский риск совместимости | medium | Добавить блок проверки устройства/региона |
| Trust-блок обязателен | SIM/eSIM связаны с номером, безопасностью и оформлением | high | Показать ограничения: совместимость, перенос номера, юридический продавец |
| Нельзя обещать сроки, цены и перенос номера без реального каталога | Research unknowns | high | Все такие claims оставить как `needs validation` |

## Аудитории

| Сегмент | Контекст | Мотивация | Барьер |
|---|---|---|---|
| Покупатель eSIM | Новый смартфон, нужен быстрый второй номер | Подключиться без салона | Не уверен, поддерживает ли устройство eSIM |
| Покупатель физической SIM | Нужна SIM для работы, объявлений или поездки | Получить карту доставкой | Доверие, сроки, документы |
| Малый бизнес | Нужны номера для сотрудников или точек | Быстро выдать связь команде | Документы, контроль, поддержка |

## Jobs To Be Done

| Сегмент | Job | Trigger | Desired outcome |
|---|---|---|---|
| eSIM buyer | Подобрать eSIM под устройство | Новый смартфон или второй номер | QR и понятная инструкция |
| Physical SIM buyer | Заказать SIM без похода в салон | Нужен отдельный номер | SIM с доставкой и понятной активацией |
| Team buyer | Подключить несколько номеров | Рост команды или новая точка | Пакет SIM и единый контакт |

## Прото-персоны

| Персона | Сегмент | JTBD | Боль | Evidence status |
|---|---|---|---|---|
| Илья, 27 | eSIM buyer | Подключить eSIM на новый смартфон | Не уверен в совместимости | proto |
| Марина, 34 | Second-number buyer | Купить второй номер | Не хочет светить основной номер | proto |
| Сергей, 41 | Small business owner | Подключить сотрудников | Нужны документы и поддержка | proto |

## Synthetic Interviews

Synthetic interviews используются только для генерации гипотез и вопросов проверки. Это не доказательство реального поведения пользователей и не testimonials.

| Персона | Сценарий | Гипотеза | Что проверить |
|---|---|---|---|
| Илья | Выбор eSIM | Пользователь хочет сначала проверить модель телефона | Usability test с eSIM buyers |
| Марина | Заказ физической SIM | Главный вопрос — доставка и данные для оформления | Проверить в интервью и операционной модели |
| Сергей | Пакет SIM для команды | Нужны документы и единый контакт | Проверить B2B demand |

## Конкуренты и альтернативы

| Альтернатива | Сила | Слабость | Вывод для SIM Line |
|---|---|---|---|
| Официальный салон оператора | Доверие, документы | Нужно идти физически | Продавать удобство и понятность |
| Сайт оператора | Официальный канал | Может быть сложная навигация | Упростить сценарий выбора |
| Реселлер SIM | Скорость и выбор | Риск доверия | Сразу объяснить условия и ограничения |
| Маркетплейс | Привычная доставка | Слабая консультация | Добавить консультационный слой |

## SWOT

| Type | Item | Implication |
|---|---|---|
| Strength | Четкий выбор SIM/eSIM снижает путаницу | Поставить checker выше тарифов |
| Weakness | Нет реального каталога и SLA | Не обещать production claims |
| Opportunity | eSIM может быть быстрым цифровым сценарием | Разделить eSIM и physical SIM |
| Threat | SIM swap/port-out concerns | Добавить trust/security notes |

## Visual Reference Notes

Разрешено использовать: крупный hero, светлый фон, сервисные карточки, спокойные акценты, CTA-led layout.

Запрещено использовать: бренд A3, тексты A3, платежное позиционирование, идентичную визуальную композицию, trade dress и полный workflow dump в Notion.

## Visual Correction V2

После повторной сверки референса UI был перестроен ближе к A3 structure:

- яркий синий hero с большим белым заголовком;
- белая скруглённая плашка поверх нижней части hero;
- центрированный заголовок следующей секции с синим/тёмным split;
- строковый список преимуществ в белой секции;
- синяя секция с белыми карточками модулей;
- блок из 4 шагов с крупной белой типографикой.

Тексты и бренд остаются SIM/eSIM-specific и не копируют A3.

## Multi-source API Research Update — 2026-05-25

Проведен повторный research через подключенные внешние API-провайдеры. Запрошены `tavily` и `deepseek`.

Итоговый статус: `ready`. Tavily вернул источники, DeepSeek отработал как обязательный cross-check/check provider.

| Provider | Requested | Used | Sources | Validation state | Notes |
|---|---:|---:|---:|---|---|
| Tavily | yes | yes | 8 | pass | Использован для источников, конкурентов, activation-flow patterns |
| DeepSeek | yes | yes | 0 | pass | Обязательная проверка гипотез/рисков, не доказательная база |

## Новые выводы из API-ресерча

| Вывод | Основание | Уверенность | Что делать в продукте |
|---|---|---|---|
| eSIM purchase flow должен объяснять выбор страны/пакета, QR или app delivery, активацию и поддержку до заявки | Tavily sources: Telna, Telwel, EVERY | medium | Оставить checker, шаги активации и support promise в первой половине лендинга |
| Travel eSIM и второй номер — видимые сценарии спроса | Tavily sources: Telwel, EVERY, Telna | medium | В hero/copy сохранять сценарии "поездка", "второй номер", "без салона" |
| Для русскоязычного рынка нельзя обещать "полностью онлайн без документов" без юридической проверки | Tavily sources: TAdviser, Klerk + DeepSeek cross-check | medium | Все claims про KYC, MNP и мгновенную активацию оставить `needs validation` |
| B2B/partner angle возможен, но вторичен | Sonalake / Sim Local case study | low | B2B CTA оставить вторичным, не делать главным сценарием |
| Количественные market-size claims нельзя выносить в лендинг без primary validation | Data Bridge, TAdviser surfaced via Tavily | low | Не использовать цифры рынка в публичном copy |

## Конкурентные ориентиры из Tavily

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

## Claims To Validate

- Сроки доставки SIM.
- Время eSIM activation.
- Возможность переноса номера.
- Доступные операторы, тарифы и регионы.
- Юридический продавец и KYC/обработка персональных данных.

## Sources

| Source | Used for |
|---|---|
| https://a3lab-ten.vercel.app/ | Visual reference only |
| GSMA eSIM material | eSIM context |
| Ofcom mobile switching guidance | Switching/porting context |
| FTC SIM swap guidance | Security/trust context |
| https://www.databridgemarketresearch.com/reports/global-esim-market | Market context; quantitative claims require validation |
| https://www.tadviser.ru/index.php/Статья:ESIM_(Embedded_SIM)_Электронная_сим-карта | Russian eSIM/KYC context |
| https://www.telna.com/how-to-sell-esims-for-travelling | eSIM purchase, QR/app delivery and activation-flow patterns |
| https://telwel.io | Russian-language travel eSIM competitor UX |
| https://sonalake.com/case-studies/enabling-growth-through-engineering-scaling-sim-local%E2%80%99s-esim-sales-platform | B2C/B2B eSIM platform and partner onboarding angle |
| https://www.klerk.ru/blogs/exnode/692349 | Russian online eSIM purchase caveats |
| https://trustedconnectivity.valid.com/solutions/esims | eSIM security/provisioning context |
| https://every.ru/esim | Travel eSIM competitor positioning |

# Source Log

## Inputs Used

- User request
- `AGENTS.md`
- Tavily source-backed search, 2026-06-15
- `yarn workflow:doctor`

## Provider Coverage

| Provider | Status | Scope | Notes |
|---|---|---|---|
| Tavily search | pass | official/legal/bank/aggregator/developer/commercial rental sources | Used as required source-backed layer |
| Tavily research pro | timeout | broad synthesis attempt | Timed out after 120s; not used as factual source |
| DeepSeek/Gemini | skipped | advisory contradiction review | No explicit opt-in; skipped by policy |
| Notion/Figma | not_requested | external write | No approval requested yet |

## Sources

| ID | Source | URL | Used for |
|---|---|---|---|
| S01 | Банк России: финансирование долевого строительства | https://www.cbr.ru/banking_sector/equity_const_financing | эскроу, проектное финансирование, ИЖС с 2025, страхование до 10 млн |
| S02 | Банк России: IV квартал 2025 по проектному финансированию | https://www.cbr.ru/press/event?id=28386 | масштаб эскроу-поступлений, рассрочка как неоплаченная часть ДДУ |
| S03 | КонсультантПлюс: 214-ФЗ ст. 15.4 | https://www.consultant.ru/document/cons_doc_LAW_51038/57da6efc7ca337d428cf526d01e70925ce5bdcb0 | обязанность оплаты ДДУ через эскроу |
| S04 | КонсультантПлюс: 214-ФЗ ст. 15.5 | https://www.consultant.ru/document/cons_doc_LAW_51038/7e20edcc51ba599c70fb328204e3ac1226e7d912 | открытие/ведение/закрытие счета эскроу |
| S05 | Росреестр: электронная регистрация | https://rosreestr.gov.ru/press/news/483879 | роль регистрации как триггера завершения сделки |
| S06 | Росреестр: регистрация недвижимости | https://rosreestr.gov.ru/eservices/real_estate_registration | электронная подача/регистрация прав |
| S07 | Домклик: сделка за свои средства | https://my.domclick.ru/easy-deal | регистрация и расчеты, номинальный счет в Сбербанке |
| S08 | Домклик: сервис безопасных расчетов | https://blog.domclick.ru/nedvizhimost/post/servis-bezopasnykh-raschetov-chto-eto-i-dlya-kogo | СБР для покупателя/продавца |
| S09 | М2: сервис безопасных расчетов | https://m2.ru/support/secure-payment-service | номинальный счет, ВТБ, переход права как триггер выплаты |
| S10 | М2: как проходят сделки | https://m2.ru/media/article/kak-prokhodyat-sdelki-s-nedvizhimostyu-na-platforme-m2 | онлайн-сделка, мастер-счет ВТБ, ЭП |
| S11 | Циан: правила бронирования посуточно | https://www.cian.ru/legal-documents/pravila_bronirovaniya_posutochno_716 | предоплата брони, карта/онлайн-платеж, остаток наймодателю |
| S12 | Авито: инструкция онлайн-бронирования | https://www.avito.ru/journal/articles/kak-zabronirovat-zhilyo-na-avito-onlayn-podrobnaya-instrukciya | предоплата, СБП/карта, хранение до заселения |
| S13 | Авито: онлайн-бронирование для посуточников | https://www.avito.ru/blog/novoe-onlayn-bronirovanie-na-avito-chto-ono-dayot-posutochniku | комиссия, выплаты физлицам/юрлицам |
| S14 | Роскачество: приложения поиска недвижимости | https://rskrf.ru/ratings/tekhnika-i-elektronika/mobilnye-prilozheniya/prilozheniya-dlya-poiska-nedvizhimosti | landscape агрегаторов, онлайн-бронирование |
| S15 | Яндекс Недвижимость | https://realty.yandex.ru | категории: продажа, аренда, коммерческая, новостройки, маткапитал/ипотека фильтры |
| S16 | М2 services/deal | https://m2.ru/services/deal | вторичная сделка без ипотеки, безопасные расчеты и электронная регистрация |
| S17 | ВТБ: аккредитивы физическим лицам | https://www.vtb.ru/personal/drugie-uslugi/akkreditivy | аккредитив как банковский расчет для недвижимости |
| S18 | Домклик: аккредитив при покупке недвижимости | https://blog.domclick.ru/nedvizhimost/post/chto-takoe-akkreditiv-pri-pokupke-nedvizhimosti | сценарий аккредитива для покупки |
| S19 | ДОМ.РФ: материнский капитал | https://спроси.дом.рф/instructions/kak-kupit-kvartiru-na-materinskii-kapital | маткапитал: цели, безналичное перечисление, ДКП/ДДУ |
| S20 | ДОМ.РФ: военная ипотека | https://спроси.дом.рф/catalog/voennaya-ipoteka | покупка первички/вторички/дома через НИС |
| S21 | Контур.Реестро: коммерческая недвижимость | https://kontur.ru/reestro/blog/55875-sdat_kommercheskuyu_nedvizhimost | коммерческая аренда: юрлица/ИП, квартальные/годовые платежи |
| S22 | Налог-налог: обеспечительный платеж и НДС | https://nalog-nalog.ru/nds/nalogovaya_baza_nds/nuzhno_li_ischislyat_nds_s_denezhnyh_sredstv_poluchennyh_v_kachestve_obespechitelnogo_garantijnogo_platezha_zaloga_depozita-23 | обеспечительный платеж, НДС-риск |
| S23 | РБК Недвижимость: обеспечительный платеж | https://realty.rbc.ru/news/64c9a0ec9a7947ddc1ac15e8 | депозит в аренде, отличие от аванса |
| S24 | Profitbase: бронирование квартир у застройщика | https://blog.profitbase.ru/kak-zastroishchiku-orghanizovat-protsiess-bronirovaniia-kvartir-v-novostroikie | платная бронь, эквайринг, CRM девелопера |
| S25 | Novostroev: договор бронирования | https://novostroev.ru/articles/dogovor-bronirovaniya-kvartiry-v-novostroyke-podrobnyy-razbor-dlya-pokupatelya | бронь новостройки, сроки/возврат/зачет |
| S26 | Яндекс Аренда: что такое сервис | https://arenda.yandex.ru/journal/post/chto-takoe-yandeks-arenda-izachem-myeyopridumali | долгосрочная аренда, онлайн-договор, ежемесячные платежи, 5% сервисная надбавка, финзащита |
| S27 | Яндекс Аренда: Платим вперед | https://arenda.yandex.ru/platim-vpered | ранняя выплата собственнику, удержание из будущей арендной платы, условия доступа |
| S28 | Самолет Плюс: сервис безопасных расчетов | https://ft.samoletplus.ru/sbr | СБР через специальный счет, блокировка до регистрации Росреестром, автоматическая выплата продавцу |
| S29 | Донстрой: FAQ по покупке | https://donstroy.moscow/faq | онлайн-сделка, бронь 50 000 руб., оплата брони по ссылке, ВТБ, СБР, эскроу, юрлица |
| S30 | КонсультантПлюс: НДС и обеспечительный платеж в аренде | https://www.consultant.ru/law/podborki/nds_zachet_obespechitelnogo_platezha_arenda | НДС при зачете обеспечительного платежа, счет-фактура, документы для вычета |
| S31 | 1С/Деловые решения: учет обеспечительного платежа | https://www.arenda1c.ru/instrukcii-po-1s/1s-buhgalteriya/obespechitelnyij-platezh.html | бухгалтерский учет обеспечений на счетах 008/009, возврат и удержание |
| S32 | Банк ДОМ.РФ: аккредитив | https://domrfbank.ru/akkreditiv | аккредитив как безналичный расчет, деньги на специальном счете до условий сделки |
| S33 | Т-Банк: Т-Сделка с недвижимостью | https://www.tbank.ru/deal/realty | цифровой аккредитив для вторички, 500 тыс.-100 млн руб., до 180 дней, ЕГРН как триггер |
| S34 | Коммерсантъ: Т-Банк запустил Т-Сделку | https://www.kommersant.ru/doc/8534781 | рыночный контекст цифровых аккредитивов, дистанционные сделки, ограничения акта передачи |
| S35 | Федеральная нотариальная палата: депозит нотариуса | https://notariat.ru/ru-ru/news/depozit-notariusa-pri-sdelkah-s-nedvizhimostyu-kak-garantirovat-bezopasnost-raschetov-2501 | нотариальный депозит как альтернатива ячейке, условия выплаты, защита от кражи/банкротства банка |
| S36 | Спроси.ДОМ.РФ: способы расчетов при покупке недвижимости | https://спроси.дом.рф/instructions/sposoby-raschyetov-pri-pokupke-nedvizhimosti | наличные, безналичный перевод, ячейка, эскроу, аккредитив, СБР, депозит нотариуса |
| S37 | Банки Сегодня: trade-in квартиры у застройщика | https://bankstoday.net/last-articles/zastrojshhik-prinimaet-staruyu-kvartiru-v-zachet-pri-pokupke-novoj-kak-eto-rabotaet-i-est-li-u-shemy-podvodnye-kamni | trade-in как продажа старого объекта через агентство, срочный выкуп, зачет средств в новую покупку |
| S38 | CyberLeninka: лизинг коммерческой недвижимости в РФ | https://cyberleninka.ru/article/n/osobennosti-lizinga-kommercheskoy-nedvizhimosti-v-rossiyskoy-federatsii | лизинг коммерческой недвижимости: аванс, график платежей, балансодержатель, выкуп |
| S39 | Torgi-ru: торги по банкротству недвижимости | https://www.torgi-ru.ru/articles/poshagovoe-rukovodstvo-2025-po-uchastiyu-v-torgakh-po-bankrotstvu-kak-kupit-nedvizhimost-vygodno | задаток на торгах, ДКП с арбитражным управляющим, оплата остатка, регистрация права |
| S40 | МГСН: аренда квартиры с выкупом | https://www.mgsn.ru/usefull/stati/arenda-kvartiry-s-vykupom | аренда с последующим выкупом: первоначальный взнос, арендные и выкупные платежи, переход права |
| S41 | КонсультантПлюс: ГК РФ ст. 624 | https://www.consultant.ru/document/cons_doc_LAW_9027/cfe7418cf134fe86ed9a413ddf0bea9413614e07 | выкуп арендованного имущества, зачет арендной платы в выкупную цену по договору |
| S42 | Банк ДОМ.РФ: аванс или задаток | https://domrfbank.ru/mortgage/articles/advance-or-deposit | аванс, задаток, возврат, двойной возврат при нарушении продавцом, учет отказа ипотеки |
| S43 | КонсультантПлюс: ГК РФ ст. 380 | https://www.consultant.ru/document/cons_doc_LAW_5142/36878dd6799afdf645dfc02bdf275402c7077d96 | задаток как доказательство договора и обеспечение исполнения, письменная форма, презумпция аванса |
| S44 | Самолет Плюс: стоимость услуг риелтора | https://samoletplus.ru/journal/skolko-berut-rieltory-za-svoi-uslugi-i-chto-vhodit-v-ih-obyazannosti | агентская комиссия: процент/фикс/смешанная модель, окончательный расчет после успешной сделки |
| S45 | Эксперт РА: жилищное строительство и рынок арендного жилья | https://raexpert.ru/researches/housing_const_2025 | 2,2 трлн руб. рынка аренды жилья в 2024, 251 млн кв. м рыночной аренды, более 5,5 млн квартир, прогноз площади/ставок до 2030 |
| S46 | ДОМ.РФ / ЦИАН: обзор рынка аренды жилья за IV кв. 2025 | https://opis-cdn.tinkoffjournal.ru/mercury/%D0%9E%D0%B1%D0%B7%D0%BE%D1%80_%D1%80%D1%8B%D0%BD%D0%BA%D0%B0_%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D1%8B_%D0%B6%D0%B8%D0%BB%D1%8C%D1%8F_%D0%B7%D0%B0_IV_%D0%BA%D0%B2_2025_%D0%B3_.pdf | 95,2 тыс. актуальных объявлений, 82 тыс. новых объявлений, ставки Москвы/СПб/нестоличных городов |
| S47 | ДОМ.РФ / ЦИАН: обзор рынка аренды жилья за I кв. 2025 | https://opis-cdn.tinkoffjournal.ru/mercury/%D0%9E%D0%B1%D0%B7%D0%BE%D1%80_%D1%80%D1%8B%D0%BD%D0%BA%D0%B0_%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D1%8B_%D0%B6%D0%B8%D0%BB%D1%8C%D1%8F_%D0%B7%D0%B0_I_%D0%BA%D0%B2_2025_%D0%B3_.pdf | 101 тыс. активных объявлений, рост предложения, доходность аренды Москва/СПб/нестоличные города |
| S48 | РБК Недвижимость / ЦСР: рынок краткосрочной аренды | https://realty.rbc.ru/news/657837f09a7947955271bf43 | 231,2 млрд руб. 2023, 315,2 млрд руб. 2024, 389,9 млрд руб. 2025, 495,3 млрд руб. 2026 по краткосрочной аренде |
| S49 | Forbes / Авито Путешествия: прогноз посуточной аренды | https://www.forbes.ru/biznes/546244-analitiki-avito-sprognozirovali-rost-rynka-posutocnoj-arendy-zil-a-na-22-v-god | прогноз рынка посуточной аренды 381 млрд руб. в 2025, рост предложения, среднего чека и ночей |
| S50 | Авито Путешествия для хозяев | https://host.avito.com | предоплата гостя, сроки выплат, комиссия платформы, продвижение за комиссию |
| S51 | Суточно.ру: размер предоплаты и вознаграждение | https://sutochno.ru/help/arendodateli/bronirovanie/predoplata-razmer | предоплата 15-100%, выплата после заселения, удержание/компенсация вознаграждения сервиса |
| S52 | Яндекс Аренда | https://arenda.yandex.ru | сервисная модель долгосрочной аренды, цена с включенной стоимостью сервиса, отсутствие отдельной комиссии/депозита для арендатора |
| S53 | ЦИАН: комиссия риелтора при аренде | https://www.cian.ru/stati-kto-dolzhen-platit-komissiju-rieltoru-pri-arende-zhilja-338240 | рыночная рамка комиссии 50-100% месячной аренды, зависимость от сегмента и ликвидности |
| S54 | Домклик: кто платит комиссию риелтору при аренде | https://blog.domclick.ru/nedvizhimost/post/kto-dolzhen-platit-komissiyu-rieltoru-pri-arende-kvartiry | комиссия 50-100% месячной аренды, средний ориентир около 50%, возможность торга |
| S55 | Freedome Realty: комиссия при съеме квартиры | https://freedome-realty.ru/blog/agentskie-uslugi/chto-takoe-komissiya-pri-seme-kvartiry-i-zachem-ona-nuzhna | сегментация комиссии в Москве по ценовым диапазонам, кто чаще платит комиссию |
| S56 | CORE.XP: офисный рынок Москвы, II кв. 2025 | https://core-xp.ru/research/rynok-ofisnoy-nedvizhimosti-moskvy-ii-kv-2025 | ставки офисной аренды Prime/A/B+, спрос, доступное предложение |
| S57 | CORE.XP: складской рынок Московского региона, IV кв. 2025 | https://core-xp.ru/research/skladskoy-rynok-moskovskogo-regiona-iv-kv-2025 | 10 500-11 500 руб./кв. м/год, 6,4% свободных площадей, OPEX/НДС отдельно |
| S58 | Regfile: ОКВЭД 68.20 | https://www.regfile.ru/okved2/razdel-l/68/68.2/68.20.html | аренда и управление собственным/арендованным жильем и нежилой недвижимостью, методологическое смешение сегментов |
| S59 | Т-Ж: налог за сдачу квартиры физлицом, ИП, самозанятым | https://t-j.ru/ask/uzakonit-dohody | НПД 4%/6%, НДФЛ как альтернативный режим для арендных доходов |

## Evidence To Output Map

| Evidence | Decision | Output location | Status |
|---|---|---|---|
| S01-S04 | Первичка и ИЖС описываются через эскроу как базовый защищенный контур | `research-summary.md`, `payment-method-matrix.md` | applied |
| S07-S10, S16 | Вторичка через СБР/номинальный счет выделена отдельно от аккредитива/ячейки | `research-summary.md`, `competitive-analysis.md` | applied |
| S11-S13 | Агрегаторы участвуют в предоплате аренды, но не всегда в основной сделке купли-продажи | `competitive-analysis.md`, `cjm-map.md` | applied |
| S21-S23 | Коммерческая аренда требует отдельной B2B-логики, счета/акты/НДС/депозиты | `payment-method-matrix.md`, `swot.md` | applied |
| S24-S25 | Бронь новостройки — отдельный платеж до ДДУ, часто через эквайринг и CRM | `research-summary.md`, `opportunity-roadmap.md` | applied |
| S26-S27 | Долгосрочная аренда через сервис может включать финзащиту, контроль платежей и раннюю выплату собственнику | `research-summary.md`, `payment-method-matrix.md`, `cjm-map.md` | applied |
| S28, S33-S34 | Банки и платформы переводят вторичный рынок от ячейки к СБР/аккредитиву с цифровым статусом денег | `research-summary.md`, `competitive-analysis.md`, `payment-method-matrix.md` | applied |
| S29 | Девелоперская онлайн-покупка включает бронь по ссылке, эскроу/СБР и отдельную проверку юрлиц | `research-summary.md`, `competitive-analysis.md`, `cjm-map.md` | applied |
| S30-S31 | В коммерческой аренде продукт должен учитывать не только платеж, но и НДС, счет-фактуру, 008/009, возврат/удержание депозита | `research-summary.md`, `payment-method-matrix.md`, `opportunity-roadmap.md` | applied |
| S32, S35 | Аккредитив и депозит нотариуса выделены как разные способы условного расчета: банк проверяет документы, нотариус может задать дополнительные условия | `payment-method-matrix.md`, `swot.md` | applied |
| S36 | Полная карта способов расчета должна включать прямые наличные/безналичные платежи, а не только защищенные банковские схемы | `research-summary.md`, `payment-method-matrix.md`, `notion-research-export-ru.md` | applied |
| S37 | Trade-in описывается как путь денег через продажу старого объекта, срочный выкуп или агентскую реализацию, а не как буквальный обмен квартир | `research-summary.md`, `payment-method-matrix.md` | applied |
| S38 | Лизинг коммерческой недвижимости выделен как B2B-финансирование между покупкой, арендой и кредитом | `research-summary.md`, `payment-method-matrix.md`, `cjm-map.md` | applied |
| S39 | Торги по банкротству добавлены как отдельный маршрут денег: задаток на площадку/счет, затем остаток управляющему и распределение кредиторам | `research-summary.md`, `payment-method-matrix.md` | applied |
| S40-S41 | Аренда с выкупом добавлена как гибрид аренды и покупки с арендными и выкупными платежами | `research-summary.md`, `payment-method-matrix.md`, `cjm-map.md` | applied |
| S42-S43 | Аванс и задаток разделены как разные pre-deal платежи с разными последствиями при срыве | `research-summary.md`, `payment-method-matrix.md`, `notion-research-export-ru.md` | applied |
| S44 | Агентская комиссия выделена как отдельный платежный поток, который часто закрывается после успешной сделки/регистрации и акта | `research-summary.md`, `payment-method-matrix.md`, `notion-research-export-ru.md` | applied |
| S45-S47 | Долгосрочная аренда описана как большой повторяющийся денежный поток, где видимые объявления не равны всему действующему рынку | `rental-market-russia.md` | applied |
| S48-S51 | Посуточная аренда выделена как меньший по объему, но более платежно-цифровой сегмент с бронью, удержанием, комиссией и выплатой собственнику | `rental-market-russia.md` | applied |
| S52-S55 | Комиссии в долгосрочной аренде описаны через разные модели: классическая комиссия 50-100%, сервисная надбавка, отсутствие отдельного депозита/комиссии в отдельных сервисах | `rental-market-russia.md` | applied |
| S56-S58 | Коммерческая аренда отделена от жилой, потому что в ней ставки, OPEX, НДС, обеспечительный платеж и бухгалтерские документы важнее бытовой карточки объявления | `rental-market-russia.md` | applied |
| S59 | Налоговый слой добавлен как часть пути денег собственника, но не как юридическая консультация | `rental-market-russia.md` | applied |

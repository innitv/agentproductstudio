# Source Log

## Использованные источники и как они применены

| Source | URL / path | What it supports | Evidence status | Notes |
|---|---|---|---|---|
| Previous A3 Home Services research | `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/` | Домовой платежный контур: объект, счет ЖКУ, статус оплаты/квитирования, показания, семейная оплата | reused_local_evidence | Используется как доменная база, не как voice/smart-home proof. |
| Яндекс "Умное здание с Алисой" | `https://alice.yandex.ru/smart-building` | Алиса уже выходит за пределы квартиры в сервисы ЖК: домофон, гостевой пропуск, шлагбаум, камеры, связка аккаунта приложения ЖК с Яндекс ID | source-backed_by_subagent | Близкий российский аналог канала. Оплата ЖКУ не заявлена. |
| Яндекс "Умный дом с Алисой" | `https://alice.yandex.ru/smart-home` | Голосовое управление устройствами, приложение, сценарии, расписания, статусы, уведомления | source-backed_by_subagent | Поддерживает UX-паттерн "дом как объект состояния и действий". |
| Yandex Smart Home developer platform | `https://yandex.ru/dev/dialogs/smart-home/` | OAuth/account linking, provider adapter, device state and command model, moderation | source-backed_by_subagent | Локальный `Invoke-WebRequest` уперся в TLS/auth; требуется ручная перепроверка при публикации. |
| Alexa Smart Home state reporting | `https://developer.amazon.com/en-US/docs/alexa/smarthome/state-reporting-for-a-smart-home-skill.html` | State/change reporting как модель проверяемого состояния | adjacent_evidence | Переносится только как UX/status pattern, не как платежный proof. |
| Alexa account linking | `https://developer.amazon.com/en-US/docs/alexa/account-linking/how-users-experience-account-linking.html` | Связка аккаунта для персональных сценариев | adjacent_evidence | Полезно для consent и personal data boundary. |
| Alexa voice-forward consent | `https://developer.amazon.com/en-US/docs/alexa/custom-skills/use-voice-forward-consent.html` | Явное согласие в голосовом сценарии | adjacent_evidence | Используется как trust pattern. |
| Alexa PIN confirmation | `https://developer.amazon.com/en-US/docs/alexa/custom-skills/pin-confirmation-for-alexa-skills.html` | PIN confirmation для чувствительных действий | adjacent_evidence | Для ЖКУ безопаснее финальное подтверждение в приложении/банке. |
| Google Home account linking | `https://developers.home.google.com/cloud-to-cloud/primer/account-linking` | OAuth linking и multi-user household account patterns | adjacent_evidence | Используется для ролей семьи/домохозяйства. |
| Google Pay availability | `https://support.google.com/googlepay/answer/12429287` | Платежные возможности зависят от региона и продукта | weak_adjacent_evidence | Не является voice/smart-home proof. |
| Bharat Connect overview | `https://www.bharatconnect.gov.in/` | Bill presentment/payment network как инфраструктурный аналог | weak_adjacent_evidence | Не voice/smart-home; полезно только как модель агрегации счетов. |
| Lazyweb `lazyweb_get_flows` | queries: `chat payment confirmation bill pay`, `checkout confirmation` | UI evidence для похожих multi-screen flows | skipped_with_reason | Вернул `count: 0`; не используется как визуальное доказательство. |

## Важная граница доказательств

Публично подтвержденного exact-аналога "Алиса / умный дом / чат / голос / оплатить ЖКУ через домовой контекст" в рамках этого исследования не найдено. Идея A3 должна подаваться как новая продуктовая связка зрелых соседних паттернов:

- smart building assistant;
- bill presentment/payment;
- explicit consent and secure confirmation;
- статусная модель после платежа.


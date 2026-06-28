# Synthetic Interviews: гипотезы для проверки A3 Home Services

## Guardrail

Synthetic interviews are not evidence of real user behavior. They are only for hypothesis generation, language exploration, edge-case discovery and interview guide preparation.

## Inputs Used

- `research-summary.md`
- `proto-personas.md`
- `scenario-user-flows.md`

## Interview Metadata

- Goal: подготовить вопросы для custdev/prototype test по разделу "Дом".
- Evidence status: `synthetic`
- Source-backed facts are not derived from these interviews.

## Simulated Interviews

| Interview | Persona | Scenario | Key paraphrase | Objections | Opportunity | Evidence status | Needs validation |
|---|---|---|---|---|---|---|---|
| 1 | Собственник-плательщик | оплатил ЖКУ, но видит долг | "Я хочу понять, это банк не отправил деньги или УК еще не обновила данные." | не верит одному зеленому статусу | сделать отдельные статусы: банк, поставщик, квитирование | synthetic | yes |
| 2 | Семейный плательщик | платит за родителей | "Мне нужен доступ только к счетам и чекам, не ко всем документам родителей." | боится перепутать адрес и нарушить приватность | роль плательщика с ограниченным доступом | synthetic | yes |
| 3 | Жилец со счетчиками | показание не принимается | "Если цифра меньше прошлой, скажите, что делать, а не просто блокируйте." | отказ без причины выглядит как поломка сервиса | объяснение причины отказа и заявка по прибору | synthetic | yes |
| 4 | Жилец в проблемной ситуации | течет труба или пропало отопление | "Мне нужен телефон диспетчерской сейчас, а заявку можно оформить после." | банк не должен прятать аварийный контакт в длинный сценарий | аварийный shortcut в карточке дома | synthetic | yes |
| 5 | Осторожный пользователь данных | подключает объект впервые | "Я не понимаю, почему ради счетчиков нужно столько разрешений." | consent выглядит чрезмерным | purpose-by-purpose объяснение доступа | synthetic | yes |

## Interview Guide From Synthetic Signals

| Question | Why ask | Expected decision |
|---|---|---|
| После оплаты какие статусы вы ожидаете увидеть в тот же день и через несколько дней? | Проверить понимание банковского статуса и квитирования поставщика | статусная модель F02 |
| Какие данные вы готовы дать банку, чтобы видеть квартиру и счета? | Проверить consent boundary | минимальный data scope |
| Как вы обычно платите за родителей или вторую квартиру? | Проверить семейный flow | roles and second object IA |
| Что вы делаете, если счетчик отображается неверно? | Проверить edge states показаний | meter correction path |
| В аварии вы хотите звонок, заявку или оба действия? | Проверить приоритет emergency UI | emergency contact design |

## Patterns To Validate

| Pattern | Why it matters | How to validate with real evidence | Priority |
|---|---|---|---|
| Раздельные статусы оплаты | пользовательская боль возникает после действия, когда долг не исчезает | prototype test + support log analysis | high |
| Минимальный доступ для плательщика | семейный сценарий не должен требовать передачи аккаунта собственника | interviews + consent prototype | high |
| Error-state для показаний | регулярный сценарий ломается на неверном приборе/периоде/значении | usability edge cases | high |
| Аварийный shortcut | стрессовый сценарий требует быстрого контакта | timed task | medium |
| Источник данных в каждом спорном месте | снижает неверные ожидания к банку | comprehension test | high |

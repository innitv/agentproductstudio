# Synthetic Interviews

## Inputs Used

- `proto-personas.md`
- `cjm-map.md`
- `research-summary.md`

## Guardrail

Synthetic interviews используются только для генерации гипотез, stress test интервью-гайда и поиска validation questions. Это не evidence о реальном поведении.

## Simulated Interviews

## Interviews

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|
| SI-1 | Анна | Оплата ЖКХ и секций | "Я уже плачу в банке, зачем еще приложение?" | A3 Pay должен показывать не только кнопку оплаты, а общий список счетов, сроки, чеки и историю | synthetic | Проверить willingness-to-switch |
| SI-2 | Сергей | Предоплата клиентом услуги | "Мне проще дать номер карты" | Формальный phone invoice повышает доверие клиента и снижает споры | synthetic | Проверить merchant willingness to pay |
| SI-3 | Мария | Покупка в небольшом интернет-магазине | "Я не хочу вводить карту и не уверена, что вернут деньги" | Unified checkout + refund tracker может повысить conversion | synthetic | Проверить trust signals |
| SI-4 | Алексей | Покупка автомобиля | "Задаток страшно переводить, пока не понял условия" | Safe deposit invoice and status checklist полезны даже без custody | synthetic | Проверить роль банка/гаранта |
| SI-5 | Мария | Бронирование тура | "Рассрочка удобна, но я боюсь переплаты и отмены" | Payment plan selector должен показывать график, переплату, refund rules | synthetic | Проверить comprehension of payment plans |

## Interview Guide Draft

## Patterns To Validate

| Topic | Question | Decision unlocked |
|---|---|---|
| Trust | Что должно быть на экране, чтобы вы оплатили по номеру телефона компании/человеку? | Trust UX and merchant profile requirements |
| Rail choice | Когда вы выбираете карту, СБП, QR, BNPL или перевод? | Payment routing logic |
| Receipts | Где вы ищете чек и статус возврата? | Receipt vault MVP |
| Recurring | Какие платежи чаще всего забываются? | Bills hub priority |
| High-ticket | Кто должен гарантировать безопасность крупного платежа? | Partner and legal strategy |

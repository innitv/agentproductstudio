# Извлечение токенов: процедура, перенос в код, приёмка

Детали для `figma-token-extractor`. Читать, когда skill запущен — то есть когда
в задаче есть Figma URL/file/node и оттуда нужно снять значения.

## Обязательные inputs

- Figma URL, file id или node id из `recursive-brief.md`, `run-plan.md` или `design-brief.md`.
- Цель извлечения: design documentation или frontend implementation.
- Проверка прав и того, какие данные покидают локальный проект.

## 3. Процедура read-only extraction

1. Проверь наличие Figma credentials/MCP и зафиксируй источник токенов.
2. Считай styles, variables или выбранные nodes.
3. Извлеки tokens с исходными evidence fields:
   - token name;
   - value;
   - type: color, typography, spacing, radius, shadow, effect, asset;
   - Figma style/node id;
   - usage context.
4. Сверь с выбранной системой из `design/figma/registry.json`: `design/figma/<selected_design_system_slug>/foundation.md`. Если реестр не содержит выбранной системы, сверять не с чем — извлечённые значения остаются гипотезой и помечаются `needs_validation`. Заархивированные индексы из `archive/design-systems/` источником сверки не являются.
   - 🔴 **Расхождение с `shadcn-ui-community` — не дефект и не повод «исправлять» токен.** Имена токенов там совпадают с `design/tokens/shadcn/default.json`, а значения цвета нет: кит на базе `neutral`, наша тема `default` — на `slate` (радиусы при этом совпадают численно). Источник правды для токенов — репозиторий, а не Figma. Совпадение имени при разном значении — ожидаемое состояние, фиксировать как факт, а не как конфликт для эскалации.
5. Запиши результат в `design-brief.md` в секцию `## Visual Direction` или `## Design Tokens`.

## 4. Frontend mapping

На `08-frontend` перенос идёт в `design/tokens/shadcn/` — правку значений делай там и пересобирай `yarn tokens:build`. Сгенерированный файл `apps/frontend/src/styles/shadcn/tokens.generated.css` руками не редактируется: сборка его перезапишет, а baseline-гейт отклонит незаявленное изменение значений. Не меняй `apps/frontend/src/styles.css` на design stage только ради extraction.

Пример формата в `design-brief.md`:

| Token | Value | Type | Source | Usage |
| --- | --- | --- | --- | --- |
| `--color-primary` | `#005FFC` | color | Figma style/node id | Primary CTA |

## 5. Canvas write gate

Если задача требует создать или обновить Figma canvas, остановись до human approval и `write_allowed=true`. После approval следуй `integrations/mcp/figma-canvas-write-guide.md`.

## 6. Evidence и failure modes

Ставь `partial`, если Figma недоступна, но дизайн можно продолжить с явно помеченными assumptions. Ставь `blocked`, если пользователь требует точного Figma-based implementation, а credentials/node access отсутствуют.

## 7. Validation gates

- [ ] Все ключевые tokens имеют source id или помечены как assumption.
- [ ] `design-brief.md` обновлен таблицей tokens.
- [ ] Принятые значения записаны в `design/tokens/` и проходят `yarn tokens:build` с baseline-гейтом; сгенерированные CSS-файлы вручную не правились.
- [ ] Figma write не выполнялся без approval.
- [ ] `yarn validate:config` проходит.

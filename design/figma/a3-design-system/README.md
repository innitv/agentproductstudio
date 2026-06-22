# Исходный код Figma дизайн-системы A3

## Источник

- Файл Figma: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System
- Нода базовых токенов цвета (Color base): `16:203`
- Нода палитры цветов (Color palette): `16:292`
- Режим доступа: Figma REST API с использованием локального `FIGMA_API_TOKEN`

## Назначение

В этой папке хранятся долгоживущие исходные артефакты дизайн-системы, извлеченные из Figma. Эти файлы не являются результатами одного прогона; продуктовые запуски в `outputs/<project-slug>/<YYYY-MM-DD>/` должны ссылаться на них через раздел `Inputs Used`.

A3 применяется только при явно выбранном `design_system_mode=reuse|extend`. Для нового продукта допустимы `product_specific` и `bespoke`; наличие этой папки не означает обязательное наследование A3.

## Файлы

- `token-map.md` — принятая карта токенов дизайн-системы: цвета, типографика, эффекты, скругления (radius), отступы (spacing) и размеры компонентов (size).
- `component-map.md` — статус маппинга компонентов, план извлечения и цели миграции фронтенда.
- `component-contracts.json` — machine-readable registry Figma node → variant contract → React source/export.
- `code-connect-fallback.md` — явный prop/state mapping на время, пока Code Connect недоступен по тарифу.
- `live-audit.latest.md` / `.json` — результат последнего live-аудита pilot-компонентов командой `yarn figma:audit:a3`.
- `design-system-audit.md` — текущий статус аудита токенов, компонентов, маппинга фронтенда, рисков и следующих шагов.
- `variants-and-states-policy.md` — директива по расширению вариантов и состояний компонентов в Figma.
- `ds-baseline-policy.md` — директива по созданию стартовой дизайн-системы с нуля в новом проекте.
- `raw/` — опциональные очищенные сводные данные нод. Не сохраняйте здесь приватные дампы файлов или токены.

## Предпросмотр фронтенда

- Локальная песочница компонентов: `http://127.0.0.1:5173/components` при запущенном `yarn dev --port 5173`.
- Исходный код песочницы: `apps/frontend/src/components-playground.tsx`.
- Текущий лендинг остаётся доступным по адресу `/`.

## Правила обновления

- Храните токены доступа Figma только в локальном `.env`.
- После изменения Figma component sets или React API запускайте `yarn figma:audit:a3`; `needs_revision` блокирует roundtrip `success` до исправления или deviation.
- Не коммитьте сырые приватные дампы Figma.
- Отдавайте предпочтение Figma Variables API, когда область действия токена включает `file_variables:read`.
- Если Variables API недоступен, извлекайте значения токенов на основе визуальных фреймов/нод и фиксируйте это ограничение.
- Пользовательские экспорты из Figma могут использоваться в качестве исходных данных, если этот экспорт зафиксирован в `token-map.md`.
- Артефакты последующих этапов с выбранной A3 foundation должны ссылаться на `design/figma/a3-design-system/token-map.md`, а если задействованы компоненты — на `design/figma/a3-design-system/component-map.md`.

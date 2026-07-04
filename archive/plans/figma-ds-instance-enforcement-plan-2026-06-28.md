# План: DS instance enforcement для Figma mockups

## Контекст

Проблема: при `design_system_mode=extend` агент смог создать локальную мини-дизайн-систему (`A3 ...` component sets) и закрыть Figma QA как `passed_with_notes`, хотя пользователь ожидал сборку экранов из компонентов выбранной shadcn DS.

Корневая причина: `runtime/typescript/figma-layout-verifier.ts` считал `reuse_honesty=local_components_with_deviation` успешным исходом без проверки доли реальных DS component instances. Это превращало deviation в обходной путь.

## Цель

Сделать так, чтобы для `reuse|extend` readiness блокировался, если:

- в `figma-layout-ir.json` нет `design_system_component` sources;
- required DS component sources не подтверждены visible instances в inventory;
- screen-level component list не использует DS sources;
- local components составляют основную стратегию без явного `product_specific|bespoke` режима.

## Изменения

1. Ужесточить `checkDsInstanceHonesty` в `runtime/typescript/figma-layout-verifier.ts`.
2. Обновить тесты verifier: старый кейс `local_components_with_deviation` должен блокировать DS-only impostor scenario.
3. Обновить skill/source docs: `figma-screen-compiler`, `figma-handoff`, `figma-roundtrip`, `visual-layout-verifier`.
4. Запустить targeted tests.

## Definition of Done

- Verifier блокирует `extend/reuse` без DS instance evidence.
- Тесты покрывают both pass и block paths.
- Документы запрещают использовать `local_components_with_deviation` как замену выбранной DS.

# Design Brief

agent_name: design
status: success

## Direction

Визуальный стиль: современный B2B/fintech лендинг с крупной типографикой, спокойной сеткой, акцентными цветами и понятным продуктовым визуалом.

Reference influence:

- От A3 берем структурную дисциплину, крупный hero и доверительный B2B тон.
- Не копируем фирменные элементы, цветовую схему или контент.

## Components

- Header with brand/nav/CTA.
- Hero copy + visual asset.
- Product cards.
- Metrics strip.
- Assistant chat panel.
- Process steps.
- Final CTA.
- Footer trust note.

## Responsive

- Desktop: 2-column hero and assistant section.
- Tablet: single-column hero, 2-column cards/metrics.
- Mobile: single-column everything, hidden nav links, compact topbar.

## Accessibility

- Semantic `header`, `main`, `section`, `footer`.
- `aria-label` for nav and assistant preview.
- Hero image has meaningful `alt`.
- Buttons use visible text and focus-visible ring from shadcn button.
- Text uses high contrast on light/dark backgrounds.

## Visual Asset

Локальный SVG `apps/frontend/src/assets/sim-assistant-hero.svg` показывает телефон, eSIM cards, chat messages and network indicators. Он нужен, чтобы первый экран был не абстрактным, а сразу показывал продуктовый контекст.


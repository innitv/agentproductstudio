---
schema_payload:
  {
    "status": "partial",
    "inputs_used": [
      "prd.md",
      "ia-brief.md",
      "research-summary.md"
    ],
    "visual_direction": "Сдержанный продуктовый лендинг: ясная иерархия, плотные секции, заметный CTA, без декоративного шума.",
    "sections": [
      {
        "name": "Hero"
      },
      {
        "name": "Value"
      },
      {
        "name": "FAQ"
      },
      {
        "name": "Lead form"
      }
    ],
    "components": [
      "Header",
      "CTA button",
      "Value cards",
      "FAQ item",
      "Lead form",
      "Footer"
    ],
    "responsive_notes": [
      "Mobile: один столбец, CTA видим без горизонтального overflow",
      "Desktop: секции ограничены читаемой шириной"
    ],
    "accessibility_notes": [
      "Сохранить порядок h1-h2-h3",
      "Все поля формы имеют label",
      "Focus states видимы",
      "Контраст CTA проверяется"
    ]
  }
---

# Design Brief

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Owner | design |
## Inputs Used
- prd.md
- ia-brief.md
- research-summary.md
## Visual Direction
Сдержанный продуктовый лендинг: ясная иерархия, плотные секции, заметный CTA, без декоративного шума.
## UX Principles
- Сначала смысл, затем доказательства
- Каждый блок отвечает на один пользовательский вопрос
## User Journey
| Step | User intent | UI response | Risk |
|---|---|---|---|
| Hero | Быстро понять продукт | Headline, lead, CTA | Слишком общий claim |
| FAQ | Снять сомнения | Короткие ответы | Неподтвержденные обещания |
## Sections
| Section | Purpose | Components | Content source |
|---|---|---|---|
| Hero | Обещание и CTA | Header, CTA | copy-deck.md |
| Lead form | Конверсия | Form, consent note | PRD |
## Components
- Header
- CTA button
- Value cards
- FAQ item
- Lead form
- Footer
## Responsive Notes
| Viewport | Layout | Priority content | Risk |
|---|---|---|---|
| Mobile | One column | H1, CTA, form | Overflow |
| Desktop | Constrained sections | Value proof | Low density |
## Accessibility Notes
- Сохранить порядок h1-h2-h3
- Все поля формы имеют label
- Focus states видимы
- Контраст CTA проверяется
## Asset Requirements
- Использовать реальные или явно продуктовые assets только после проверки прав
## Risks
- Research coverage is partial; product claims must remain marked needs validation.

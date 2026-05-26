---
schema_payload:
  {
    "status": "partial",
    "inputs_used": [
      "recursive-brief.md",
      "research-summary.md",
      "competitive-analysis.md",
      "proto-personas.md",
      "synthetic-interviews.md",
      "swot.md"
    ],
    "problem": "Пользователь должен быстро понять ценность предложения \"Локальный тест workflow Codex\", довериться маршруту и оставить заявку без лишней неопределенности.",
    "goals": [
      "Объяснить ценность первого экрана",
      "Довести пользователя до заявки",
      "Сохранить проверяемость claims"
    ],
    "non_goals": [
      "Не запускать платежи или личный кабинет в рамках лендинга",
      "Не использовать неподтвержденные гарантии результата"
    ],
    "requirements": [
      {
        "id": "REQ-001",
        "description": "Первый экран объясняет предложение и содержит основной CTA",
        "priority": "must",
        "evidence_status": "partial"
      },
      {
        "id": "REQ-002",
        "description": "Страница показывает аудиторию, сценарии, доверительные аргументы и FAQ",
        "priority": "must",
        "evidence_status": "needs_validation"
      },
      {
        "id": "REQ-003",
        "description": "Форма заявки фиксирует лид без сохранения лишних персональных данных в аналитике",
        "priority": "should",
        "evidence_status": "policy-backed"
      }
    ],
    "moscow": {
      "must": [
        "Hero с ясным CTA",
        "Секции ценности и сценариев",
        "Форма заявки",
        "FAQ",
        "Analytics без PII"
      ],
      "should": [
        "Доказательства и ограничения claims",
        "Адаптивная структура"
      ],
      "could": [
        "Интерактивный калькулятор",
        "Расширенный social proof после валидации"
      ],
      "wont": [
        "Оплата внутри прототипа",
        "Гарантии без источников"
      ]
    },
    "acceptance_criteria": [
      "CTA виден на desktop и mobile",
      "Основной funnel можно пройти вручную",
      "Все спорные claims отмечены needs validation"
    ],
    "analytics": [
      {
        "event": "hero_cta_click",
        "trigger": "Клик по основному CTA",
        "properties": [
          "section",
          "cta_text"
        ],
        "pii_risk": "none"
      },
      {
        "event": "lead_form_submit",
        "trigger": "Отправка формы",
        "properties": [
          "source_section"
        ],
        "pii_risk": "low"
      }
    ]
  }
---

# PRD

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Owner | prd |
## Inputs Used
- recursive-brief.md
- research-summary.md
- competitive-analysis.md
- proto-personas.md
- synthetic-interviews.md
- swot.md
## Problem
Пользователь должен быстро понять ценность предложения "Локальный тест workflow Codex", довериться маршруту и оставить заявку без лишней неопределенности.
## Target Users And JTBD
| Segment | JTBD | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|
| Потенциальный клиент | Понять ценность и оставить заявку | Недоверие к условиям | Ясный следующий шаг | needs validation |
## Goals
| Goal | Metric / evidence | Priority |
|---|---|---|
| Довести до заявки | lead_form_submit | must |
| Снизить неопределенность | FAQ engagement, scroll depth | should |
## Non-Goals
- Не запускать платежи или личный кабинет в рамках лендинга
- Не использовать неподтвержденные гарантии результата
## Scope
### MVP
- Лендинг
- Форма заявки
- Базовая аналитика
- QA артефакты
### Future
- Калькулятор
- CMS-контент
- A/B тесты
## Requirements
| ID | Requirement | User / business value | Evidence | Priority |
|---|---|---|---|---|
| REQ-001 | Первый экран объясняет предложение и содержит основной CTA | Быстрое понимание | recursive brief + research | must |
| REQ-002 | Страница показывает аудиторию, сценарии, доверительные аргументы и FAQ | Снижение риска | research partial | must |
| REQ-003 | Форма заявки не отправляет PII в аналитику | Compliance | guardrails | should |
## MoSCoW
### Must
- Hero с ясным CTA
- Секции ценности и сценариев
- Форма заявки
- FAQ
- Analytics без PII
### Should
- Доказательства и ограничения claims
- Адаптивная структура
### Could
- Интерактивный калькулятор
- Расширенный social proof после валидации
### Won't
- Оплата внутри прототипа
- Гарантии без источников
## Acceptance Criteria
| Criterion | How to verify | Owner |
|---|---|---|
| CTA виден на desktop и mobile | Playwright/manual QA | frontend |
| Funnel завершается заявкой | Test bench | test-bench |
## Analytics
| Event | Trigger | Properties | PII risk | Success signal |
|---|---|---|---|---|
| hero_cta_click | Клик по CTA | section, cta_text | none | intent |
| lead_form_submit | Отправка формы | source_section | low | conversion |
## Dependencies
- Research provider coverage
- Frontend implementation
- Manual claim validation
## Risks
- Research coverage is partial; product claims must remain marked needs validation.
## Open Questions
- Какие claims подтвердит владелец продукта?
- Какая география и юридические ограничения?

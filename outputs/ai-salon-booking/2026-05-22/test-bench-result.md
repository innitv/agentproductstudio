# Test Bench Result

## Summary

Спроектирован test bench для главного сценария: visitor понимает AI-запись и отправляет заявку на демо. В static prototype события описаны в коде через `window.dataLayer`.

## Main Scenario

- Scenario: посетитель открывает лендинг, изучает механику, отправляет demo form.
- Source: PRD + IA.

## Completion Metric

- Metric: demo request completion.
- Completion event: `demo_form_submit`.
- Success threshold: для первого пилота needs validation; предложенный ориентир - 3-7% submit rate на warm traffic.

## Funnel Steps

| Step | Event | Trigger | Required properties |
|---|---|---|---|
| Landing view | `landing_view` | Page load | `slug` |
| CTA click | `hero_cta_click` | Hero CTA click | `section`, `cta_text` |
| Flow preview | `secondary_cta_click` | Secondary CTA click | `section`, `cta_text` |
| Form start | `demo_form_start` | First form focus | `field` |
| Submit | `demo_form_submit` | Valid form submit | `business_type`, `team_size`, `lead_channel` |
| FAQ | `faq_open` | FAQ open | `question_id` |

## Events

| Event | Purpose | Properties | PII risk |
|---|---|---|---|
| `landing_view` | Traffic baseline | slug | low |
| `hero_cta_click` | CTA interest | section, cta_text | low |
| `demo_form_start` | Form friction | field | low |
| `demo_form_submit` | Conversion | business_type, team_size, lead_channel | medium |
| `faq_open` | Objection analysis | question_id | low |

## Files Changed

| File | Purpose |
|---|---|
| `frontend/index.html` | Static landing prototype |

## Dashboard

- URL / route: not implemented.
- Metrics: conversion rate, CTA click rate, FAQ opens, form start-to-submit.
- Limitations: local prototype only; no real analytics backend.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `ConvertFrom-Json` for MCP config | pass | Existing config still valid |
| HTML/browser QA | not run | No browser integrations/mcp/live server in current session |

## Known Limitations

- No backend submission.
- PII must not be sent to analytics in production.
- Success threshold is a planning hypothesis.

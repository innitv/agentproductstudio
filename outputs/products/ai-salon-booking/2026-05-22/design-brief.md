# Design Brief

## Product Goal

Собрать заявки на демо AI-сервиса, который помогает beauty-бизнесу автоматически отвечать клиентам и доводить их до записи.

## Audience

Владельцы салонов, администраторы, solo-мастера. Аудитория прагматичная: ценит скорость, понятный контроль и отсутствие сложной настройки.

## User Journey

1. Awareness: "Мы теряем заявки, когда заняты или не отвечаем сразу".
2. Understanding: AI принимает входящую заявку, уточняет услугу, предлагает слоты.
3. Trust: правила задает салон, сложные случаи уходят администратору.
4. Action: visitor оставляет заявку на демо.

## Page Structure

| Section | Purpose | Content | UX notes |
|---|---|---|---|
| Hero | Explain value | H1, subheading, CTA, product preview | First viewport shows interface mockup and CTA |
| Problem | Build urgency | Missed requests, manual rescheduling, reminders | Use concise cards |
| How it works | Explain AI flow | 3 steps from message to confirmed booking | Timeline layout |
| Features | Show scope | Slots, rules, reminders, handoff, client notes, channels | Dense grid |
| Product preview | Make product tangible | Chat + calendar + admin review | HTML mockup |
| Trust | Reduce AI concerns | Rules, manual approval, privacy, launch checklist | No fake badges |
| Demo form | Convert | Qualification fields | Success state |
| FAQ | Handle objections | integrations, setup, pricing, safety | Accordion/details |

## Visual Direction

- Mood: calm, precise, modern service-business tool.
- Typography: system sans, clear hierarchy, no oversized decorative type outside hero.
- Layout: compact B2B SaaS landing with visible product mockup.
- Motion: subtle hover and form success only.
- Imagery: interface-style product mockup instead of stock beauty photos.

## Components

- Button
- Card
- Form
- FAQ accordion
- Timeline step
- Product preview panel
- Status pill
- Metric strip

## Responsive Rules

- Mobile first.
- CTA remains visible and reachable.
- Hero becomes single column.
- Cards collapse into single column.
- Product mockup uses fixed responsive constraints, not viewport-scaled typography.

## Accessibility

- Semantic headings.
- Keyboard focus states.
- Alt text is not required for CSS-only mockup; visible text is semantic.
- Sufficient contrast.
- Form labels are explicit.

## Nielsen Heuristics Audit

| Heuristic | Status | Severity | Evidence | Recommendation |
|---|---|---|---|---|
| Visibility of system status | pass | low | Form success state planned | Keep success copy explicit |
| Match between system and real world | pass | low | Uses salon terms: услуга, мастер, слот | Validate with salon users |
| User control and freedom | pass | medium | Trust section explains manual handoff | Add real settings UI later |
| Consistency and standards | pass | low | Standard landing and form patterns | Keep CTA wording consistent |
| Error prevention | pass | medium | Claims avoid exact ROI/no-show promises | Keep evidence table |
| Recognition rather than recall | pass | low | Product preview makes flow visible | Add interactive simulator later |
| Flexibility and efficiency of use | pass | low | CTA repeats after sections | Track CTA sources |
| Aesthetic and minimalist design | pass | low | Dense, restrained layout | Avoid decorative clutter |
| Help users recognize, diagnose and recover from errors | pass | low | Form validation via required fields | Add inline errors in production |
| Help and documentation | pass | low | FAQ covers setup and integrations | Link docs when product exists |

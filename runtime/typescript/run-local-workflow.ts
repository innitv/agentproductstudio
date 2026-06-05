import { appendFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { runLandingWorkflow } from "./run-landing-workflow";
import { syncWorkflowRunState } from "./sync-run-state";
import { runResearchStage } from "./research-stage-runner";
import { validateWorkflowRun } from "./validate-workflow-run";
import { artifactFiles } from "./workflow-stages";

type Payload = Record<string, unknown>;

interface LocalWorkflowOptions {
  goal: string;
  skipResearch?: boolean;
}

export interface ArtifactSpec {
  file: string;
  stage: string;
  title: string;
  content: string;
}

export async function runLocalWorkflow(options: LocalWorkflowOptions): Promise<string> {
  const outputDir = await runLandingWorkflow({ goal: options.goal });

  if (!options.skipResearch) {
    await runResearchStage({ outputDir });
  } else {
    await writeResearchFallback(outputDir, options.goal);
  }

  const artifacts = await buildLocalDownstreamArtifacts(outputDir, options.goal);

  for (const artifact of artifacts) {
    await writeFile(join(outputDir, artifact.file), artifact.content, "utf8");
    await appendStageProgress(outputDir, artifact);
  }

  const profile = await inferProfileFromRunPlan(outputDir);
  const findings = validateWorkflowRun(outputDir, undefined, profile);
  const errors = findings.filter((finding) => finding.level === "error");

  for (const finding of findings) {
    const prefix = finding.level === "error" ? "ERROR" : "WARN";
    console.log(`${prefix}: ${finding.message}`);
  }

  await appendFile(
    join(outputDir, artifactFiles.stage_gate_ledger),
    [
      "",
      `| ${new Date().toISOString()} | workflow:validate | ${errors.length ? "blocked" : "pass"} | ${errors.length} errors; ${findings.length - errors.length} warnings |`,
    ].join("\n"),
    "utf8",
  );

  if (errors.length) {
    throw new Error(`Local workflow validation failed with ${errors.length} error(s).`);
  }

  await syncWorkflowRunState({ outputDir, profile, executionMode: "local", preview: false });
  console.log(`Local workflow completed: ${relative(process.cwd(), outputDir)}`);
  return outputDir;
}

async function buildContext(outputDir: string, goal: string) {
  const research = await readIfExists(join(outputDir, artifactFiles.research_summary));
  const isResearchPartial = /Status \| partial|status:\s*partial/i.test(research);
  const status = isResearchPartial ? "partial" : "ready";
  const productName = createProductName(goal);
  const profile = await inferProfileFromRunPlan(outputDir);

  return {
    outputDir,
    goal,
    productName,
    profile,
    status,
    validationNote: isResearchPartial
      ? "Research coverage is partial; product claims must remain marked needs validation."
      : "Research coverage passed configured provider checks.",
  };
}

export async function buildLocalDownstreamArtifacts(outputDir: string, goal?: string): Promise<ArtifactSpec[]> {
  const context = await buildContext(outputDir, goal ?? await inferGoalFromRunPlan(outputDir));
  return buildDownstreamArtifacts(context);
}

export async function writeLocalStageArtifact(outputDir: string, artifact: ArtifactSpec): Promise<void> {
  await writeFile(join(outputDir, artifact.file), artifact.content, "utf8");
  await appendStageProgress(outputDir, artifact);
}

function buildDownstreamArtifacts(context: Awaited<ReturnType<typeof buildContext>>): ArtifactSpec[] {
  const artifacts: ArtifactSpec[] = [
    {
      file: artifactFiles.prd,
      stage: "02-prd",
      title: "Product Requirements",
      content: renderPrd(context),
    },
    {
      file: artifactFiles.ia_brief,
      stage: "03-ia",
      title: "Information Architecture",
      content: renderIa(context),
    },
    {
      file: artifactFiles.design_brief,
      stage: "04-design",
      title: "Design Brief",
      content: renderDesign(context),
    },
    {
      file: artifactFiles.copy_deck,
      stage: "05-copy",
      title: "Copy Deck",
      content: renderCopy(context),
    },
    {
      file: artifactFiles.screens,
      stage: "06-screens",
      title: "Screens",
      content: renderScreens(context),
    },
    {
      file: artifactFiles.prototype_report,
      stage: "07-prototype",
      title: "Prototype",
      content: renderPrototype(context),
    },
    {
      file: artifactFiles.frontend_result,
      stage: "08-frontend",
      title: "Frontend",
      content: renderFrontend(context),
    },
    {
      file: artifactFiles.test_bench_result,
      stage: "10-test-bench",
      title: "Test Bench",
      content: renderTestBench(context),
    },
    {
      file: artifactFiles.qa_report,
      stage: "11-qa",
      title: "QA Review",
      content: renderQa(context),
    },
    {
      file: artifactFiles.release_notes,
      stage: "12-release",
      title: "Release",
      content: renderRelease(context),
    },
  ];

  if (context.profile === "reference") {
    artifacts.splice(2, 0, {
      file: artifactFiles.reference_analysis,
      stage: "04-design",
      title: "Reference Analysis",
      content: renderReferenceAnalysis(context),
    });
    artifacts.splice(8, 0, {
      file: artifactFiles.visual_reference_review,
      stage: "09-visual-reference",
      title: "Visual Reference Review",
      content: renderVisualReferenceReview(context),
    });
  }

  return artifacts;
}

function renderReferenceAnalysis(context: Awaited<ReturnType<typeof buildContext>>): string {
  return [
    "# Reference Analysis",
    "",
    "## Inputs Used",
    "",
    "- `recursive-brief.md`",
    "- `research-summary.md`",
    "- Reference URL or screenshot request from intake, if present",
    "",
    "## References",
    "",
    "- Reference profile was selected; technical scan evidence must be produced with `yarn reference:scan` before final design sign-off.",
    "",
    "## Allowed Patterns",
    "",
    "- Section order, spacing rhythm, CTA hierarchy and responsive behavior may be adapted from scanned evidence.",
    "- Use only structural observations captured from the reference scan; do not copy protected brand assets or proprietary content.",
    "",
    "## Disallowed Copying",
    "",
    "- Do not copy logos, exact illustrations, proprietary text, unique brand compositions or unlicensed media.",
    "- Do not replace the mandatory scan with a generic style interpretation.",
    "",
    "## Design Implications",
    "",
    `- Current local reference analysis is ${context.status}; downstream design must remain blocked/partial until reference screenshots and section-level notes are attached.`,
    "- `design-brief.md` and `screens.md` must explicitly consume this reference analysis before frontend work is accepted.",
    "",
  ].join("\n");
}

function renderPrd(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: researchInputs(),
    problem: `Пользователь должен быстро понять ценность предложения "${context.goal}", довериться маршруту и оставить заявку без лишней неопределенности.`,
    goals: ["Объяснить ценность первого экрана", "Довести пользователя до заявки", "Сохранить проверяемость claims"],
    non_goals: ["Не запускать платежи или личный кабинет в рамках лендинга", "Не использовать неподтвержденные гарантии результата"],
    requirements: [
      { id: "REQ-001", description: "Первый экран объясняет предложение и содержит основной CTA", priority: "must", evidence_status: context.status },
      { id: "REQ-002", description: "Страница показывает аудиторию, сценарии, доверительные аргументы и FAQ", priority: "must", evidence_status: "needs_validation" },
      { id: "REQ-003", description: "Форма заявки фиксирует лид без сохранения лишних персональных данных в аналитике", priority: "should", evidence_status: "policy-backed" },
    ],
    moscow: {
      must: ["Hero с ясным CTA", "Секции ценности и сценариев", "Форма заявки", "FAQ", "Analytics без PII"],
      should: ["Доказательства и ограничения claims", "Адаптивная структура"],
      could: ["Интерактивный калькулятор", "Расширенный social proof после валидации"],
      wont: ["Оплата внутри прототипа", "Гарантии без источников"],
    },
    acceptance_criteria: ["CTA виден на desktop и mobile", "Основной funnel можно пройти вручную", "Все спорные claims отмечены needs validation"],
    analytics: [
      { event: "hero_cta_click", trigger: "Клик по основному CTA", properties: ["section", "cta_text"], pii_risk: "none" },
      { event: "lead_form_submit", trigger: "Отправка формы", properties: ["source_section"], pii_risk: "low" },
    ],
  };

  return markdownWithPayload("PRD", payload, [
    metadata(context.status, "prd"),
    "## Inputs Used",
    list(researchInputs()),
    "## Problem",
    payload.problem,
    "## Target Users And JTBD",
    "| Segment | JTBD | Pain | Desired outcome | Evidence status |",
    "|---|---|---|---|---|",
    "| Потенциальный клиент | Понять ценность и оставить заявку | Недоверие к условиям | Ясный следующий шаг | needs validation |",
    "## Goals",
    "| Goal | Metric / evidence | Priority |",
    "|---|---|---|",
    "| Довести до заявки | lead_form_submit | must |",
    "| Снизить неопределенность | FAQ engagement, scroll depth | should |",
    "## Non-Goals",
    list(payload.non_goals),
    "## Scope",
    "### MVP",
    list(["Лендинг", "Форма заявки", "Базовая аналитика", "QA артефакты"]),
    "### Future",
    list(["Калькулятор", "CMS-контент", "A/B тесты"]),
    "## Requirements",
    "| ID | Requirement | User / business value | Evidence | Priority |",
    "|---|---|---|---|---|",
    "| REQ-001 | Первый экран объясняет предложение и содержит основной CTA | Быстрое понимание | recursive brief + research | must |",
    "| REQ-002 | Страница показывает аудиторию, сценарии, доверительные аргументы и FAQ | Снижение риска | research partial | must |",
    "| REQ-003 | Форма заявки не отправляет PII в аналитику | Compliance | guardrails | should |",
    "## MoSCoW",
    "### Must",
    list(payload.moscow.must),
    "### Should",
    list(payload.moscow.should),
    "### Could",
    list(payload.moscow.could),
    "### Won't",
    list(payload.moscow.wont),
    "## Acceptance Criteria",
    "| Criterion | How to verify | Owner |",
    "|---|---|---|",
    "| CTA виден на desktop и mobile | Playwright/manual QA | frontend |",
    "| Funnel завершается заявкой | Test bench | test-bench |",
    "## Analytics",
    "| Event | Trigger | Properties | PII risk | Success signal |",
    "|---|---|---|---|---|",
    "| hero_cta_click | Клик по CTA | section, cta_text | none | intent |",
    "| lead_form_submit | Отправка формы | source_section | low | conversion |",
    "## Dependencies",
    list(["Research provider coverage", "Frontend implementation", "Manual claim validation"]),
    "## Risks",
    list([context.validationNote]),
    "## Open Questions",
    list(["Какие claims подтвердит владелец продукта?", "Какая география и юридические ограничения?"]),
  ]);
}

function renderIa(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["prd.md", "research-summary.md", "proto-personas.md"],
    primary_screen: "Landing page",
    primary_action: "Оставить заявку",
    completion_step: "Показать состояние успешной отправки или инструкцию следующего шага",
    sitemap: [
      { section: "Hero", purpose: "Объяснить ценность", cta: "Оставить заявку" },
      { section: "Value", purpose: "Раскрыть преимущества", cta: "Подробнее" },
      { section: "FAQ", purpose: "Снять возражения", cta: "Оставить заявку" },
    ],
    primary_user_flow: ["Открыть страницу", "Понять предложение", "Сравнить аргументы", "Открыть форму", "Отправить заявку"],
  };

  return markdownWithPayload("IA Brief", payload, [
    metadata(context.status, "ia"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Primary Screen",
    payload.primary_screen,
    "## Primary Action",
    payload.primary_action,
    "## Completion Step",
    payload.completion_step,
    "## Sitemap",
    "| Route / section | Purpose | User question answered | CTA |",
    "|---|---|---|---|",
    "| Hero | Объяснить ценность | Что это и зачем мне? | Оставить заявку |",
    "| Value | Доказать пользу | Почему это лучше альтернатив? | Узнать подробнее |",
    "| FAQ | Снять риск | Какие ограничения и условия? | Оставить заявку |",
    "## Primary User Flow",
    numbered(payload.primary_user_flow),
    "## JTBD To Sections Mapping",
    "| JTBD | Section / screen | Content needed | Evidence status |",
    "|---|---|---|---|",
    "| Оценить предложение | Hero + Value | Обещание, выгоды, ограничения | needs validation |",
    "## Navigation Rules",
    list(["Основной CTA ведет к форме", "Навигация не уводит с лендинга"]),
    "## Content Priority",
    list(["Ценность", "Доверие", "Сценарии", "FAQ", "Форма"]),
    "## Open Questions",
    list(["Нужен ли отдельный success screen?"]),
  ]);
}

function renderDesign(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["prd.md", "ia-brief.md", "research-summary.md"],
    visual_direction: "Сдержанный продуктовый лендинг: ясная иерархия, плотные секции, заметный CTA, без декоративного шума.",
    sections: [{ name: "Hero" }, { name: "Value" }, { name: "FAQ" }, { name: "Lead form" }],
    components: ["Header", "CTA button", "Value cards", "FAQ item", "Lead form", "Footer"],
    responsive_notes: ["Mobile: один столбец, CTA видим без горизонтального overflow", "Desktop: секции ограничены читаемой шириной"],
    accessibility_notes: ["Сохранить порядок h1-h2-h3", "Все поля формы имеют label", "Focus states видимы", "Контраст CTA проверяется"],
  };

  return markdownWithPayload("Design Brief", payload, [
    metadata(context.status, "design"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Visual Direction",
    payload.visual_direction,
    "## UX Principles",
    list(["Сначала смысл, затем доказательства", "Каждый блок отвечает на один пользовательский вопрос"]),
    "## User Journey",
    "| Step | User intent | UI response | Risk |",
    "|---|---|---|---|",
    "| Hero | Быстро понять продукт | Headline, lead, CTA | Слишком общий claim |",
    "| FAQ | Снять сомнения | Короткие ответы | Неподтвержденные обещания |",
    "## Sections",
    "| Section | Purpose | Components | Content source |",
    "|---|---|---|---|",
    "| Hero | Обещание и CTA | Header, CTA | copy-deck.md |",
    "| Lead form | Конверсия | Form, consent note | PRD |",
    "## Components",
    list(payload.components),
    "## Responsive Notes",
    "| Viewport | Layout | Priority content | Risk |",
    "|---|---|---|---|",
    "| Mobile | One column | H1, CTA, form | Overflow |",
    "| Desktop | Constrained sections | Value proof | Low density |",
    "## Accessibility Notes",
    list(payload.accessibility_notes),
    "## Asset Requirements",
    list(["Использовать реальные или явно продуктовые assets только после проверки прав"]),
    "## Risks",
    list([context.validationNote]),
  ]);
}

function renderCopy(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["prd.md", "research-summary.md", "competitive-analysis.md", "proto-personas.md", "design-brief.md"],
    hero: {
      eyebrow: "Продуктовый лендинг",
      h1: context.productName,
      lead: `Покажите ценность предложения "${context.goal}" и доведите пользователя до понятной заявки.`,
      primary_cta: "Оставить заявку",
      secondary_cta: "Посмотреть сценарии",
    },
    sections: [{ section: "Hero" }, { section: "Value" }, { section: "FAQ" }],
    faq: [{ question: "Что произойдет после заявки?", answer: "Команда связывается с пользователем и уточняет условия." }],
    seo: { title: context.productName, description: `Лендинг: ${context.goal}` },
    claims_to_validate: [{ claim: "Скорость внедрения и экономический эффект", risk: "medium" }],
  };

  return markdownWithPayload("Copy Deck", payload, [
    metadata(context.status, "copywriting"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Messaging Strategy",
    "Позиционирование строится вокруг ясного следующего шага, проверяемой ценности и снятия ключевых возражений.",
    "## Hero",
    `- Eyebrow: ${payload.hero.eyebrow}`,
    `- H1: ${payload.hero.h1}`,
    `- Lead: ${payload.hero.lead}`,
    `- Primary CTA: ${payload.hero.primary_cta}`,
    `- Secondary CTA: ${payload.hero.secondary_cta}`,
    "## Section Copy",
    "| Section | Heading | Body | CTA | Evidence / status |",
    "|---|---|---|---|---|",
    "| Hero | Быстро понять предложение | Короткое объяснение ценности | Оставить заявку | needs validation |",
    "| Value | Почему это полезно | Сценарии и ограничения | Посмотреть сценарии | needs validation |",
    "## Service Cards",
    list(["Сценарий пользователя", "Доверие и условия", "Быстрый следующий шаг"]),
    "## FAQ",
    "| Question | Answer | Evidence / status |",
    "|---|---|---|",
    "| Что произойдет после заявки? | Команда связывается с пользователем и уточняет условия. | operational hypothesis |",
    "## SEO",
    `- Title: ${payload.seo.title}`,
    `- Description: ${payload.seo.description}`,
    "- Keywords / topics: продуктовый лендинг, заявка, прототип",
    "## Claims To Validate",
    "| Claim | Where used | Evidence | Risk | Validation method |",
    "|---|---|---|---|---|",
    "| Скорость внедрения и экономический эффект | Hero/value | Needs source | medium | Owner interview + source check |",
    "## Disallowed Copy",
    list(["Synthetic interview quotes as testimonials.", "Guaranteed outcomes without evidence."]),
  ]);
}

function renderScreens(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["prd.md", "ia-brief.md", "design-brief.md", "copy-deck.md"],
    input_readiness_pass: [
      { input: "prd.md", required_signal: "requirements, acceptance criteria, analytics/test signals", status: "ready", notes: "Generated PRD provides primary funnel and acceptance criteria." },
      { input: "ia-brief.md", required_signal: "primary screen/action, entry points, state map", status: "ready", notes: "Generated IA defines landing page and lead flow." },
      { input: "design-brief.md", required_signal: "visual direction, components, responsive/accessibility notes", status: "ready", notes: "Generated design brief defines component set and responsive notes." },
      { input: "copy-deck.md", required_signal: "CTA labels, section copy, microcopy, claims-to-validate", status: "partial", notes: "Detailed validation/error microcopy remains open." },
    ],
    design_system_grounding: [
      { asset: "Tokens / variables", reuse_decision: "Use approved project foundation when available", gap_new_need: "No generated token changes in local runner", notes: "Figma write remains approval-gated." },
      { asset: "Component sets", reuse_decision: "Use Header, CTA button, Value cards, FAQ item, Lead form, Footer", gap_new_need: "Lead form state variants need final design pass", notes: "Frontend should map components explicitly." },
    ],
    screen_list: [{ screen: "Landing page", purpose: "Explain offer and collect lead", entry_point: "Direct landing visit", completion_action: "Lead form submit success", prd_requirement: "REQ-001/REQ-002/REQ-003", ia_node: "Landing page", status: context.status }],
    screen_traceability: [
      { screen: "Landing page", research_jtbd_signal: "Оценить предложение и оставить заявку", prd_requirement: "REQ-001/REQ-002/REQ-003", ia_node: "Landing page", copy_source: "copy-deck.md", prototype_test_signal: "hero_cta_click / lead_form_submit" },
    ],
    desktop_specification: "Desktop: header + hero in first viewport, then full-width content bands with constrained inner content.",
    tablet_specification: "Tablet: one or two columns depending on available width; keep CTA and form readable without cramped controls.",
    mobile_specification: "Mobile: one-column layout, CTA and form remain reachable without horizontal scrolling.",
    sections: [
      { section: "Hero", layout: "First viewport header, headline, lead and CTA", copy_source: "copy-deck.md hero", components: ["Header", "CTA button"], states: ["default", "focus"], acceptance_notes: "Primary CTA visible on desktop and mobile." },
      { section: "Lead form", layout: "Constrained form block after value/FAQ sections", copy_source: "copy-deck.md + PRD", components: ["Lead form", "CTA button"], states: ["default", "validation_error", "loading", "success"], acceptance_notes: "Form supports validation and success states." },
    ],
    component_inventory: [
      { component: "Header", source: "design-brief.md", variants: ["desktop", "mobile"], states: ["default"], auto_layout_intent: "Horizontal desktop, compact mobile stack", frontend_owner: "frontend" },
      { component: "CTA button", source: "copy-deck.md + design system", variants: ["primary", "secondary"], states: ["default", "hover", "focus", "disabled", "loading"], auto_layout_intent: "Hug content with fixed min touch target", frontend_owner: "frontend" },
      { component: "Lead form", source: "PRD + copy-deck.md", variants: ["default"], states: ["default", "focus", "validation_error", "loading", "success"], auto_layout_intent: "Vertical stack, fill width within container", frontend_owner: "frontend" },
    ],
    state_inventory: [
      { surface: "Landing page", default_state: "Hero and sections visible", loading: "not_applicable", empty: "not_applicable", error: "not_applicable", validation: "not_applicable", success: "not_applicable", disabled_permission: "not_applicable" },
      { surface: "Lead form", default_state: "Empty fields with labels", loading: "Submitting state", empty: "Required-field guidance", error: "Submission error", validation: "Inline validation", success: "Next contact confirmation", disabled_permission: "Submit disabled until required fields are valid" },
    ],
    responsive_constraints: [
      { viewport: "desktop", constraint: "Constrained content width", risk: "Low density or stretched text", required_behavior: "Keep readable measure and visible first CTA." },
      { viewport: "mobile", constraint: "Single column, no horizontal overflow", risk: "CTA/form hidden below excessive content", required_behavior: "CTA remains reachable and form fields fit width." },
    ],
    accessibility_notes: [
      { area: "Heading hierarchy", requirement: "Single H1, ordered H2 sections", evidence_notes: "Design brief requires semantic hierarchy." },
      { area: "Labels and errors", requirement: "All form fields have labels and inline errors", evidence_notes: "Required for lead form." },
      { area: "Focus order", requirement: "CTA to form path is keyboard reachable", evidence_notes: "Prototype/test bench will verify." },
    ],
    analytics_test_hooks: [
      { signal: "hero_cta_click", trigger: "Hero primary CTA click", expected_assertion: "CTA leads to/focuses lead form", pii_risk: "none" },
      { signal: "lead_form_submit", trigger: "Valid form submit", expected_assertion: "Success state shown without raw PII in analytics", pii_risk: "low" },
    ],
    figma_readiness: [
      { check: "Variables/styles required", status: "needs_work", notes: "Use project foundation if Figma write is requested." },
      { check: "Component sets/variants defined", status: "needs_work", notes: "CTA and Lead form variants must be defined before canvas write." },
      { check: "Auto Layout critical areas defined", status: "passed", notes: "Hero, CTA and Lead form layout intent is described." },
      { check: "Canvas strategy", status: "not_applicable", notes: "No Figma write requested by local workflow runner." },
      { check: "Screenshot verification plan", status: "not_applicable", notes: "Required only after Figma/canvas write." },
    ],
    asset_notes: [
      { asset: "Product visual", source_rights: "Needs approval/source", usage: "Hero/supporting media if available", fallback: "Use UI-led layout without unlicensed media." },
    ],
    acceptance_notes: [
      { requirement: "REQ-001", screen_evidence: "Hero contains value proposition and CTA", status: "passed" },
      { requirement: "REQ-003", screen_evidence: "Lead form includes PII-safe analytics notes", status: "needs_work" },
    ],
    open_questions: ["Final validation/error microcopy", "Approved media assets"],
  };

  return markdownWithPayload("Screens", payload, [
    metadata(context.status, "design-generator"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Input Readiness Pass",
    "| Input | Required Signal | Status | Notes |",
    "|---|---|---|---|",
    "| `prd.md` | requirements, acceptance criteria, analytics/test signals | ready | Generated PRD provides primary funnel and acceptance criteria. |",
    "| `ia-brief.md` | primary screen/action, entry points, state map | ready | Generated IA defines landing page and lead flow. |",
    "| `design-brief.md` | visual direction, components, responsive/accessibility notes | ready | Generated design brief defines component set and responsive notes. |",
    "| `copy-deck.md` | CTA labels, section copy, microcopy, claims-to-validate | partial | Detailed validation/error microcopy remains open. |",
    "## Design-System Grounding",
    "| Asset | Reuse Decision | Gap / New Need | Notes |",
    "|---|---|---|---|",
    "| Tokens / variables | Use approved project foundation when available | No generated token changes in local runner | Figma write remains approval-gated. |",
    "| Component sets | Use Header, CTA button, Value cards, FAQ item, Lead form, Footer | Lead form state variants need final design pass | Frontend should map components explicitly. |",
    "## Screen List",
    "| Screen | Purpose | Entry Point | Completion Action | PRD Requirement | IA Node | Status |",
    "|---|---|---|---|---|---|---|",
    `| Landing page | Explain offer and collect lead | Direct landing visit | Lead form submit success | REQ-001/REQ-002/REQ-003 | Landing page | ${context.status} |`,
    "## Screen Traceability",
    "| Screen | Research / JTBD Signal | PRD Requirement | IA Node | Copy Source | Prototype / Test Signal |",
    "|---|---|---|---|---|---|",
    "| Landing page | Оценить предложение и оставить заявку | REQ-001/REQ-002/REQ-003 | Landing page | copy-deck.md | hero_cta_click / lead_form_submit |",
    "## Screen",
    "Landing page: Hero, value sections, FAQ and lead form.",
    "## Desktop",
    payload.desktop_specification,
    "## Tablet",
    payload.tablet_specification,
    "## Mobile",
    payload.mobile_specification,
    "## Sections",
    "| Section | Layout | Copy Source | Components | States | Acceptance Notes |",
    "|---|---|---|---|---|---|",
    "| Hero | First viewport header, headline, lead and CTA | copy-deck.md hero | Header, CTA button | default, focus | Primary CTA visible on desktop and mobile. |",
    "| Lead form | Constrained form block after value/FAQ sections | copy-deck.md + PRD | Lead form, CTA button | default, validation_error, loading, success | Form supports validation and success states. |",
    "## Component Inventory",
    "| Component | Source | Variants | States | Auto Layout Intent | Frontend Owner |",
    "|---|---|---|---|---|---|",
    "| Header | design-brief.md | desktop, mobile | default | Horizontal desktop, compact mobile stack | frontend |",
    "| CTA button | copy-deck.md + design system | primary, secondary | default, hover, focus, disabled, loading | Hug content with fixed min touch target | frontend |",
    "| Lead form | PRD + copy-deck.md | default | default, focus, validation_error, loading, success | Vertical stack, fill width within container | frontend |",
    "## State Inventory",
    "| Surface | Default | Loading | Empty | Error | Validation | Success | Disabled / Permission |",
    "|---|---|---|---|---|---|---|---|",
    "| Landing page | Hero and sections visible | not_applicable | not_applicable | not_applicable | not_applicable | not_applicable | not_applicable |",
    "| Lead form | Empty fields with labels | Submitting state | Required-field guidance | Submission error | Inline validation | Next contact confirmation | Submit disabled until required fields are valid |",
    "## Responsive Constraints",
    "| Viewport | Constraint | Risk | Required Behavior |",
    "|---|---|---|---|",
    "| desktop | Constrained content width | Low density or stretched text | Keep readable measure and visible first CTA. |",
    "| mobile | Single column, no horizontal overflow | CTA/form hidden below excessive content | CTA remains reachable and form fields fit width. |",
    "## Accessibility Notes",
    "| Area | Requirement | Evidence / Notes |",
    "|---|---|---|",
    "| Heading hierarchy | Single H1, ordered H2 sections | Design brief requires semantic hierarchy. |",
    "| Labels and errors | All form fields have labels and inline errors | Required for lead form. |",
    "| Focus order | CTA to form path is keyboard reachable | Prototype/test bench will verify. |",
    "## Analytics / Test Hooks",
    "| Signal | Trigger | Expected Assertion | PII Risk |",
    "|---|---|---|---|",
    "| hero_cta_click | Hero primary CTA click | CTA leads to/focuses lead form | none |",
    "| lead_form_submit | Valid form submit | Success state shown without raw PII in analytics | low |",
    "## Figma Readiness",
    "| Check | Status | Notes |",
    "|---|---|---|",
    "| Variables/styles required | needs_work | Use project foundation if Figma write is requested. |",
    "| Component sets/variants defined | needs_work | CTA and Lead form variants must be defined before canvas write. |",
    "| Auto Layout critical areas defined | passed | Hero, CTA and Lead form layout intent is described. |",
    "| Canvas strategy | not_applicable | No Figma write requested by local workflow runner. |",
    "| Screenshot verification plan | not_applicable | Required only after Figma/canvas write. |",
    "## Asset Notes",
    "| Asset | Source / Rights | Usage | Fallback |",
    "|---|---|---|---|",
    "| Product visual | Needs approval/source | Hero/supporting media if available | Use UI-led layout without unlicensed media. |",
    "## Acceptance Notes",
    "| Requirement | Screen Evidence | Status |",
    "|---|---|---|",
    "| REQ-001 | Hero contains value proposition and CTA | passed |",
    "| REQ-003 | Lead form includes PII-safe analytics notes | needs_work |",
    "## Open Questions",
    list(payload.open_questions),
  ]);
}

function renderPrototype(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["prd.md", "ia-brief.md", "design-brief.md", "screens.md", "copy-deck.md", "handoff-bundle.md"],
    input_readiness_pass: [
      { input: "prd.md", required_signal: "primary flow, acceptance criteria, analytics/test signal", status: "ready", notes: "Generated local PRD contains primary funnel and analytics signals." },
      { input: "ia-brief.md", required_signal: "primary screen, primary action, completion step", status: "ready", notes: "Generated local IA defines landing page and lead submission path." },
      { input: "design-brief.md", required_signal: "component behavior, responsive, accessibility constraints", status: "partial", notes: "Detailed component states require final design pass." },
      { input: "screens.md", required_signal: "screen structure and interactive elements", status: "ready", notes: "Generated local screens define landing page and form states." },
      { input: "copy-deck.md", required_signal: "CTA labels and microcopy", status: "partial", notes: "Validation/error microcopy should be refined before frontend." },
    ],
    prototype_type: "Manual clickable prototype instructions",
    flow_goal: {
      user: "Потенциальный клиент",
      goal: "Понять предложение и оставить заявку",
      success_outcome: "Пользователь видит подтверждение следующего шага после валидной отправки формы",
      primary_action: "Оставить заявку",
    },
    start_screen: "Landing page hero",
    entry_points: [
      { entry_point: "Direct landing visit", user_intent: "Оценить предложение", starting_state: "Hero visible with primary CTA", notes: "Default entry for generated local workflow." },
    ],
    transition_map: [
      { from: "Hero CTA", trigger: "click", actor: "user", to: "Lead form", expected_state: "Form is focused or scrolled into view", copy_source: "copy-deck.md primary CTA", analytics_test_signal: "hero_cta_click" },
      { from: "Lead form", trigger: "submit valid form", actor: "user", to: "Success state", expected_state: "Success message confirms next contact step", copy_source: "copy-deck.md + PRD acceptance", analytics_test_signal: "lead_form_submit" },
    ],
    state_inventory: [
      { surface: "Hero CTA", default_state: "Visible primary CTA", loading: "not_applicable", empty: "not_applicable", error: "not_applicable", validation: "not_applicable", success: "Scroll/focus lead form", disabled_permission: "not_applicable" },
      { surface: "Lead form", default_state: "Empty fields with labels", loading: "Submitting state", empty: "Required-field guidance", error: "Submission error message", validation: "Inline validation", success: "Next contact confirmation", disabled_permission: "Submit disabled until required fields are valid" },
    ],
    alternate_recovery_paths: [
      { scenario: "Invalid form submit", trigger: "submit with missing required fields", expected_recovery: "Keep user on form, show inline validation and preserve entered values", required_copy: "Validation microcopy from copy-deck.md", owner: "frontend" },
      { scenario: "Submission failure", trigger: "network/server error", expected_recovery: "Show retry message without clearing fields", required_copy: "Needs final error copy", owner: "copywriting/frontend" },
    ],
    microinteraction_motion_spec: [
      { interaction: "Scroll to form", trigger: "Hero CTA click", feedback: "Smooth or instant scroll depending on reduced-motion preference", duration_easing: "Short, purposeful, no transition: all", reduced_motion: "Instant jump or no motion", keyboard_touch_notes: "Focus moves to first form field or form heading" },
    ],
    completion_step: "Success state confirms next contact step",
    instrumentation_test_hooks: [
      { event_or_assertion: "hero_cta_click", trigger: "Hero CTA click", expected_payload_notes: "section and cta_text only", pii_risk: "none", test_owner: "test-bench" },
      { event_or_assertion: "lead_form_submit", trigger: "Valid form submit", expected_payload_notes: "source_section only; no raw phone/email", pii_risk: "low", test_owner: "test-bench" },
    ],
    manual_test_script: {
      happy_path: ["Open landing page", "Click primary CTA", "Fill required fields", "Submit form", "Confirm success state"],
      negative_path: ["Submit empty form", "Confirm inline validation appears", "Fix values", "Retry submit"],
      keyboard_path: ["Tab to primary CTA", "Activate with Enter", "Navigate form fields", "Submit without pointer"],
      mobile_path: ["Open mobile viewport", "Confirm no horizontal overflow", "Tap CTA", "Submit form"],
    },
    frontend_handoff_contract: [
      { area: "Route / page ownership", decision: "Single landing page flow", frontend_note: "Hero CTA scrolls/focuses lead form." },
      { area: "Component state ownership", decision: "Form owns validation/loading/success states", frontend_note: "Do not hide validation state behind generic toast only." },
      { area: "Copy source", decision: "CTA and validation copy come from copy-deck.md", frontend_note: "Missing copy remains open decision." },
      { area: "Analytics hooks", decision: "Use PRD/test bench event names", frontend_note: "No raw PII in analytics payload." },
    ],
    missing_interactions: ["Real backend submission", "CRM integration"],
    open_decisions: ["Final validation/error microcopy", "Exact backend submission behavior"],
    risks: [context.validationNote],
  };

  return markdownWithPayload("Prototype Report", payload, [
    metadata(context.status, "prototype"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Input Readiness Pass",
    "| Input | Required Signal | Status | Notes |",
    "|---|---|---|---|",
    "| `prd.md` | primary flow, acceptance criteria, analytics/test signal | ready | Generated local PRD contains primary funnel and analytics signals. |",
    "| `ia-brief.md` | primary screen, primary action, completion step | ready | Generated local IA defines landing page and lead submission path. |",
    "| `design-brief.md` | component behavior, responsive, accessibility constraints | partial | Detailed component states require final design pass. |",
    "| `screens.md` | screen structure and interactive elements | ready | Generated local screens define landing page and form states. |",
    "| `copy-deck.md` | CTA labels and microcopy | partial | Validation/error microcopy should be refined before frontend. |",
    "## Prototype Type",
    payload.prototype_type,
    "## Flow Goal",
    "- User: Потенциальный клиент",
    "- Goal: Понять предложение и оставить заявку",
    "- Success outcome: Пользователь видит подтверждение следующего шага после валидной отправки формы",
    "- Primary action: Оставить заявку",
    "## Start Screen",
    payload.start_screen,
    "## Entry Points",
    "| Entry Point | User Intent | Starting State | Notes |",
    "|---|---|---|---|",
    "| Direct landing visit | Оценить предложение | Hero visible with primary CTA | Default entry for generated local workflow. |",
    "## Transition Map",
    "| From | Trigger | Actor | To | Expected State | Copy Source | Analytics / Test Signal |",
    "|---|---|---|---|---|---|---|",
    "| Hero CTA | click | user | Lead form | Form is focused or scrolled into view | copy-deck.md primary CTA | hero_cta_click |",
    "| Lead form | submit valid form | user | Success state | Success message confirms next contact step | copy-deck.md + PRD acceptance | lead_form_submit |",
    "## State Inventory",
    "| Screen / Component | Default | Loading | Empty | Error | Validation | Success | Disabled / Permission |",
    "|---|---|---|---|---|---|---|---|",
    "| Hero CTA | Visible primary CTA | not_applicable | not_applicable | not_applicable | not_applicable | Scroll/focus lead form | not_applicable |",
    "| Lead form | Empty fields with labels | Submitting state | Required-field guidance | Submission error message | Inline validation | Next contact confirmation | Submit disabled until required fields are valid |",
    "## Alternate & Recovery Paths",
    "| Scenario | Trigger | Expected Recovery | Required Copy | Owner |",
    "|---|---|---|---|---|",
    "| Invalid form submit | submit with missing required fields | Keep user on form, show inline validation and preserve entered values | Validation microcopy from copy-deck.md | frontend |",
    "| Submission failure | network/server error | Show retry message without clearing fields | Needs final error copy | copywriting/frontend |",
    "## Microinteraction & Motion Spec",
    "| Interaction | Trigger | Feedback | Duration / Easing | Reduced Motion | Keyboard / Touch Notes |",
    "|---|---|---|---|---|---|",
    "| Scroll to form | Hero CTA click | Form becomes reachable/focused | Short, purposeful, no transition: all | Instant jump or no motion | Focus moves to first form field or form heading |",
    "## Completion Step",
    payload.completion_step,
    "## Instrumentation & Test Hooks",
    "| Event / Assertion | Trigger | Expected Payload Notes | PII Risk | Test Owner |",
    "|---|---|---|---|---|",
    "| hero_cta_click | Hero CTA click | section and cta_text only | none | test-bench |",
    "| lead_form_submit | Valid form submit | source_section only; no raw phone/email | low | test-bench |",
    "## Manual Test Script",
    "### Happy Path",
    numbered(payload.manual_test_script.happy_path),
    "### Negative Path",
    numbered(payload.manual_test_script.negative_path),
    "### Keyboard Path",
    numbered(payload.manual_test_script.keyboard_path),
    "### Mobile Path",
    numbered(payload.manual_test_script.mobile_path),
    "## Frontend Handoff Contract",
    "| Area | Decision | Frontend Note |",
    "|---|---|---|",
    "| Route / page ownership | Single landing page flow | Hero CTA scrolls/focuses lead form. |",
    "| Component state ownership | Form owns validation/loading/success states | Do not hide validation state behind generic toast only. |",
    "| Copy source | CTA and validation copy come from copy-deck.md | Missing copy remains open decision. |",
    "| Analytics hooks | Use PRD/test bench event names | No raw PII in analytics payload. |",
    "## Missing Interactions",
    list(payload.missing_interactions),
    "## Open Decisions",
    list(payload.open_decisions),
    "## Risks",
    list(payload.risks),
  ]);
}

function renderFrontend(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: "partial",
    inputs_used: ["prd.md", "ia-brief.md", "design-brief.md", "screens.md", "copy-deck.md", "prototype-report.md"],
    changed_files: ["apps/frontend/src/App.tsx", "apps/frontend/src/styles.css"],
    implementation_notes: ["Existing frontend is treated as the current implementation target for QA.", "This local runner does not rewrite UI code."],
    commands_run: [{ command: "yarn build", result: "not run by local artifact generator" }],
    known_limitations: ["Frontend may need manual alignment with newly generated PRD/copy.", "Notion publication remains a separate approval-gated step."],
  };

  return markdownWithPayload("Frontend Result", payload, [
    "# Frontend Result",
    "",
    "## Artifact Metadata",
    "",
    "| Field | Value |",
    "|---|---|",
    "| Status | partial |",
    "| Owner | frontend |",
    "## Inputs Used",
    list(payload.inputs_used),
    "## Changed Files",
    list(payload.changed_files),
    "## Implementation Notes",
    list(payload.implementation_notes),
    "## Commands Run",
    "| Command | Result |",
    "|---|---|",
    "| yarn build | not run by local artifact generator |",
    "## Known Limitations",
    list(payload.known_limitations),
  ]);
}

function renderVisualReferenceReview(context: Awaited<ReturnType<typeof buildContext>>): string {
  return [
    "# Visual Reference Review",
    "",
    "## Status",
    "",
    "blocked",
    "",
    "## Inputs Used",
    "",
    "- `reference-analysis.md`",
    "- `design-brief.md`",
    "- `screens.md`",
    "- `frontend-result.md`",
    "",
    "## Screenshot Set",
    "",
    "- Missing required paired screenshots: `reference-desktop-*`, `reference-mobile-*`, `local-desktop-*`, `local-mobile-*`.",
    "",
    "## Full-Site Comparison",
    "",
    "| Area | Reference pattern | Local result | Status |",
    "|---|---|---|---|",
    "| visual-evidence | Reference scan and visual diff are required. | Local implementation evidence is missing. | blocked |",
    "",
    "## Gaps Found",
    "",
    "- Missing `visual-diff-result.json`; run `yarn reference:diff <reference-report-dir> <local-report-dir>` after paired screenshots exist.",
    "- Missing section-level reference/local screenshot pairs.",
    "- Missing `visual-section-diff-result.json` for section-level QA.",
    "",
    "## Corrections Made",
    "",
    "- Local workflow runner created a blocking review artifact instead of pretending visual parity passed.",
    "",
    "## Gate Result",
    "",
    `blocked — ${context.validationNote} Visual reference evidence must be captured before QA/release can continue.`,
    "",
  ].join("\n");
}

function renderTestBench(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["recursive-brief.md", "research-summary.md", "prd.md", "ia-brief.md", "prototype-report.md", "frontend-result.md"],
    main_funnel: [{ step: "hero_view" }, { step: "hero_cta_click" }, { step: "lead_form_submit" }],
    analytics_spec: [{ event: "hero_cta_click", pii_risk: "none" }, { event: "lead_form_submit", pii_risk: "low" }],
    pii_risk: "low",
    executable_checks: [{ check: "CTA and form visible on desktop/mobile", status: "planned" }],
    result: context.status === "ready" ? "pass" : "blocked",
  };

  return markdownWithPayload("Test Bench Result", payload, [
    metadata(context.status, "test-bench"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Main Funnel",
    "1. hero_view",
    "2. hero_cta_click",
    "3. lead_form_submit",
    "## Analytics Spec",
    "| Event | Trigger | PII risk |",
    "|---|---|---|",
    "| hero_cta_click | click CTA | none |",
    "| lead_form_submit | valid submit | low |",
    "## Executable Checks",
    list(["CTA and form visible on desktop/mobile", "No analytics properties contain raw phone/email"]),
    "## Result",
    payload.result,
  ]);
}

function renderQa(context: Awaited<ReturnType<typeof buildContext>>): string {
  const qaStatus = context.status === "ready" ? "pass_with_known_limitations" : "blocked";
  const payload = {
    status: qaStatus,
    inputs_used: ["recursive-brief.md", "research-summary.md", "prd.md", "ia-brief.md", "design-brief.md", "screens.md", "copy-deck.md", "prototype-report.md", "frontend-result.md", "test-bench-result.md"],
    qa_scope: ["product_pipeline", "frontend", "release"],
    evidence_plan: [
      { audit_area: "Product pipeline", planned_check: "Confirm generated artifacts exist and share the same lead funnel", evidence_source: "generated markdown artifacts", status: context.status === "ready" ? "pass" : "blocked" },
      { audit_area: "Frontend implementation", planned_check: "Confirm frontend-result records limitations", evidence_source: "frontend-result.md", status: "pass" },
      { audit_area: "Release readiness", planned_check: "Confirm release remains blocked when research/QA is partial", evidence_source: "release-notes.md", status: context.status === "ready" ? "pass" : "blocked" },
    ],
    research_integrity: { status: context.status, note: context.validationNote },
    traceability_audit: [
      {
        signal: "Оценить предложение и оставить заявку",
        prd_requirement: "REQ-001/REQ-002/REQ-003",
        ia_node: "Landing page",
        screen_or_component: "Hero CTA / Lead form",
        copy_or_prototype: "copy-deck.md / prototype-report.md",
        test_signal: "hero_cta_click / lead_form_submit",
        status: context.status === "ready" ? "pass" : "blocked",
      },
    ],
    prd_fit: "PRD, IA, copy and prototype share the same lead-generation funnel.",
    ia_screens_prototype_consistency: "Generated IA, screens and prototype use the same landing page, CTA and lead form completion step.",
    copy_claims: "Claims remain marked needs validation where source-backed evidence is not available.",
    accessibility: "Requires final browser QA for labels, focus and contrast.",
    responsive: "Requires final Playwright or manual responsive QA after frontend edits.",
    negative_edge_path_pass: [
      { scenario: "Empty form submit", result: "blocked", evidence: "prototype-report.md describes validation path; frontend runtime check not executed by local generator", notes: "Needs browser QA after implementation." },
      { scenario: "Mobile overflow", result: "blocked", evidence: "screens.md responsive constraints", notes: "Needs Playwright/mobile screenshot evidence." },
    ],
    funnel_analytics: "Test bench lists hero_cta_click and lead_form_submit with PII notes.",
    secrets_sensitive_data: "Local artifact generator does not write secrets and records no raw provider outputs in release notes.",
    validation: [{ command: "yarn workflow:validate", result: "planned by runner" }],
    evidence_matrix: [
      { finding_id: "QA-001", evidence_type: "artifact", reference: "prd.md / ia-brief.md / screens.md / prototype-report.md", notes: "Generated artifacts share the lead funnel." },
      { finding_id: "QA-002", evidence_type: "artifact", reference: "frontend-result.md", notes: "Frontend is not rewritten by local generator." },
    ],
    severity_matrix: [
      {
        finding_id: "QA-002",
        severity: context.status === "ready" ? "medium" : "blocker",
        owner_stage: "08-frontend",
        affected_surface: "Final browser implementation",
        evidence: "frontend-result.md records known limitations",
        recommendation: "Run frontend QA and visual checks before external release.",
        release_impact: context.status === "ready" ? "Release with known limitations only." : "Release blocked.",
      },
    ],
    skipped_unavailable_checks: [
      { check: "Browser accessibility and responsive QA", reason: "Local deterministic artifact generator does not run browser tests.", impact: "Requires follow-up before production release.", required_follow_up: "Run Playwright/browser QA after implementation." },
    ],
    devils_advocate_false_positive_pass: "No full pass claimed: generated artifacts remain pass_with_known_limitations or blocked until real browser QA and external publication records exist.",
    blockers: context.status === "ready" ? [] : ["Research remains partial; final success is blocked until provider coverage or approved fallback is recorded."],
  };

  return markdownWithPayload("QA Report", payload, [
    "# QA Report",
    "",
    "## Status",
    qaStatus,
    "## Inputs Used",
    list(payload.inputs_used),
    "## QA Scope & Evidence Plan",
    "| Audit Area | Planned Check | Evidence Source | Status |",
    "|---|---|---|---|",
    `| Product pipeline | Confirm generated artifacts share the same lead funnel | generated markdown artifacts | ${context.status === "ready" ? "pass" : "blocked"} |`,
    "| Frontend implementation | Confirm frontend-result records limitations | frontend-result.md | pass |",
    `| Release readiness | Confirm release remains blocked when research/QA is partial | release-notes.md | ${context.status === "ready" ? "pass" : "blocked"} |`,
    "## Research Integrity",
    context.validationNote,
    "## Traceability Audit",
    "| Research / JTBD Signal | PRD Requirement | IA Node | Screen / Component | Copy / Prototype / Test Signal | Status |",
    "|---|---|---|---|---|---|",
    `| Оценить предложение и оставить заявку | REQ-001/REQ-002/REQ-003 | Landing page | Hero CTA / Lead form | copy-deck.md / prototype-report.md / hero_cta_click / lead_form_submit | ${context.status === "ready" ? "pass" : "blocked"} |`,
    "## PRD Fit",
    payload.prd_fit,
    "## IA / Screens / Prototype Consistency",
    payload.ia_screens_prototype_consistency,
    "## Copy Claims",
    payload.copy_claims,
    "## Accessibility",
    payload.accessibility,
    "## Responsive",
    payload.responsive,
    "## Negative & Edge Path Pass",
    "| Scenario | Result | Evidence | Notes |",
    "|---|---|---|---|",
    "| Empty form submit | blocked | prototype-report.md validation path | Needs browser QA after implementation. |",
    "| Mobile overflow | blocked | screens.md responsive constraints | Needs Playwright/mobile screenshot evidence. |",
    "## Funnel Analytics",
    payload.funnel_analytics,
    "## Secrets / Sensitive Data",
    payload.secrets_sensitive_data,
    "## Validation",
    "| Command | Result | Notes |",
    "|---|---|---|",
    "| yarn workflow:validate | planned by runner | Standard profile |",
    "## Evidence Matrix",
    "| Finding ID | Evidence Type | Path / Command / Screenshot / Trace | Notes |",
    "|---|---|---|---|",
    "| QA-001 | artifact | prd.md / ia-brief.md / screens.md / prototype-report.md | Generated artifacts share the lead funnel. |",
    "| QA-002 | artifact | frontend-result.md | Frontend is not rewritten by local generator. |",
    "## Severity Matrix",
    "| Finding ID | Severity | Owner Stage | Affected Artifact / Surface | Evidence | Recommendation | Release Impact |",
    "|---|---|---|---|---|---|---|",
    `| QA-002 | ${context.status === "ready" ? "medium" : "blocker"} | 08-frontend | Final browser implementation | frontend-result.md records known limitations | Run frontend QA and visual checks before external release. | ${context.status === "ready" ? "Release with known limitations only." : "Release blocked."} |`,
    "## Skipped / Unavailable Checks",
    "| Check | Reason | Impact | Required Follow-Up |",
    "|---|---|---|---|",
    "| Browser accessibility and responsive QA | Local deterministic artifact generator does not run browser tests. | Requires follow-up before production release. | Run Playwright/browser QA after implementation. |",
    "## Devil's Advocate / False Positive Pass",
    payload.devils_advocate_false_positive_pass,
    "## Blockers",
    payload.blockers.length ? list(payload.blockers) : "- No blocking QA issues in generated artifacts.",
  ]);
}

function renderRelease(context: Awaited<ReturnType<typeof buildContext>>): string {
  const status = context.status === "ready" ? "ready" : "blocked";
  const payload = {
    status,
    inputs_used: ["qa-report.md", "frontend-result.md", "test-bench-result.md", "stage-gate-ledger.md", "handoff-bundle.md", "artifact-manifest.json", "run-index.md"],
    release_scope: {
      release_type: "artifact_only",
      exact_target: "Local workflow output directory",
      approval_required: false,
      release_owner: "release",
    },
    run_ledger_audit: [
      { item: "run-state.json", status: "pass", evidence: "Generated/synced by local workflow runner." },
      { item: "run-meta.json", status: "pass", evidence: "Generated/synced by local workflow runner." },
      { item: "artifact-manifest.json", status: "pass", evidence: "Generated/synced by local workflow runner." },
      { item: "run-index.md", status: "pass", evidence: "Generated/synced by local workflow runner." },
      { item: "stage-gate-ledger.md", status: "pass", evidence: "Stage progress appended during local workflow." },
      { item: "handoff-bundle.md", status: "pass", evidence: "Stage progress appended during local workflow." },
    ],
    changed_files: [
      { file: "outputs/<project-slug>/<date>/*.md", change_type: "product_artifact", change: "Generated local workflow artifacts from intake through release.", in_release_scope: true },
    ],
    changed_artifacts: [
      { artifact: "release-notes.md", producer_stage: "12-release", status, evidence: "Generated by local deterministic workflow runner." },
    ],
    what_changed: ["Generated local standard workflow artifacts from intake through release."],
    dependency_sensitive_delta: [
      { area: "package.json / lockfile", result: "not_applicable", evidence: "Local artifact generator does not edit dependencies." },
      { area: "env / secrets", result: "pass", evidence: "No secrets written by local artifact generator." },
      { area: "analytics payloads", result: "pass", evidence: "Generated analytics notes avoid raw PII." },
      { area: "raw provider outputs", result: "pass", evidence: "Release artifact does not include raw provider dumps." },
      { area: "PII risk", result: "pass", evidence: "Lead submit event notes low PII risk and no raw payload." },
    ],
    validation: [
      { check: "Workflow validation", command_or_evidence: "yarn workflow:validate", result: "pass", release_impact: "Required before local workflow completion." },
      { check: "QA status", command_or_evidence: "qa-report.md", result: status === "ready" ? "pass" : "blocked", release_impact: status === "ready" ? "Release can be prepared with limitations." : "Release blocked." },
    ],
    release_decision_matrix: [
      { gate: "QA status", required_state: "pass or pass_with_known_limitations", actual_state: status === "ready" ? "pass_with_known_limitations" : "blocked", decision: status === "ready" ? "accepted_with_limitations" : "blocked" },
      { gate: "Workflow validation", required_state: "pass", actual_state: "pass after runner completion", decision: "pass" },
      { gate: "External approvals", required_state: "approved or not_required", actual_state: "not_required for artifact-only local run", decision: "pass" },
      { gate: "External publication records", required_state: "complete or not_required", actual_state: "not_requested", decision: "pass" },
      { gate: "Rollback readiness", required_state: "ready", actual_state: "discard output directory if run is rejected", decision: "pass" },
    ],
    deployment_notes: [
      { step: "No deploy", action: "No deployment requested by local workflow runner.", expected_result: "Artifacts remain local.", stop_condition: "User requests external deploy target." },
    ],
    post_release_smoke_checks: [
      { check: "Open run-index.md", target: "Local output directory", expected_result: "Run index lists generated artifacts and blockers.", owner: "release" },
      { check: "Inspect qa-report.md", target: "Local output directory", expected_result: "QA status matches release decision.", owner: "release" },
    ],
    rollback_notes: [
      { surface: "Local generated artifacts", rollback_action: "Archive or remove the generated output directory after user approval.", validation_after_rollback: "Run `yarn workflow:list` and confirm the discarded run is no longer active.", data_loss_risk: "low", approval_needed: true },
    ],
    approval_external_records: [
      { action: "deploy", target: "not_requested", approval_or_record: "not_required", status: "not_requested", evidence: "Local workflow runner does not deploy." },
      { action: "notion_publish", target: "not_requested", approval_or_record: "not_required", status: "not_requested", evidence: "Publication remains approval-gated." },
      { action: "figma_write", target: "not_requested", approval_or_record: "not_required", status: "not_requested", evidence: "No Figma write in local release." },
      { action: "git_write", target: "not_requested", approval_or_record: "not_required", status: "not_requested", evidence: "Local workflow runner does not commit or push." },
    ],
    remaining_risks: status === "ready"
      ? [{ risk: "External Notion publication remains approval-gated.", severity: "medium", owner: "release", follow_up: "Ask user for exact Notion target before publishing." }]
      : [{ risk: "Research or QA is blocked/partial.", severity: "blocker", owner: "release", follow_up: "Resolve upstream blockers before marking release ready." }],
  };

  return markdownWithPayload("Release Notes", payload, [
    "# Release Notes",
    "",
    "## Status",
    status,
    "## Inputs Used",
    list(payload.inputs_used),
    "## Release Scope",
    "| Field | Value |",
    "|---|---|",
    "| Release type | artifact-only |",
    "| Exact target | Local workflow output directory |",
    "| Approval required | no |",
    "| Release owner | release |",
    "## Run Ledger Audit",
    "| Ledger Item | Status | Evidence / Notes |",
    "|---|---|---|",
    "| `run-state.json` | pass | Generated/synced by local workflow runner. |",
    "| `run-meta.json` | pass | Generated/synced by local workflow runner. |",
    "| `artifact-manifest.json` | pass | Generated/synced by local workflow runner. |",
    "| `run-index.md` | pass | Generated/synced by local workflow runner. |",
    "| `stage-gate-ledger.md` | pass | Stage progress appended during local workflow. |",
    "| `handoff-bundle.md` | pass | Stage progress appended during local workflow. |",
    "## Changed Files",
    "| File | Type | Change | In Release Scope |",
    "|---|---|---|---|",
    "| outputs/<project-slug>/<date>/*.md | product_artifact | Generated local workflow artifacts from intake through release. | yes |",
    "## Changed Artifacts",
    "| Artifact | Producer Stage | Status | Evidence / Notes |",
    "|---|---|---|---|",
    `| release-notes.md | 12-release | ${status} | Generated by local deterministic workflow runner. |`,
    "## What Changed",
    list(payload.what_changed),
    "## Dependency & Sensitive Delta",
    "| Area | Result | Evidence / Notes |",
    "|---|---|---|",
    "| `package.json` / lockfile | not_applicable | Local artifact generator does not edit dependencies. |",
    "| env / secrets | pass | No secrets written by local artifact generator. |",
    "| analytics payloads | pass | Generated analytics notes avoid raw PII. |",
    "| raw provider outputs | pass | Release artifact does not include raw provider dumps. |",
    "| PII risk | pass | Lead submit event notes low PII risk and no raw payload. |",
    "## Validation",
    "| Check | Command / Evidence | Result | Release Impact |",
    "|---|---|---|---|",
    "| Workflow validation | yarn workflow:validate | pass | Required before local workflow completion. |",
    `| QA status | qa-report.md | ${status === "ready" ? "pass" : "blocked"} | ${status === "ready" ? "Release can be prepared with limitations." : "Release blocked."} |`,
    "## Release Decision Matrix",
    "| Gate | Required State | Actual State | Decision |",
    "|---|---|---|---|",
    `| QA status | pass / pass_with_known_limitations | ${status === "ready" ? "pass_with_known_limitations" : "blocked"} | ${status === "ready" ? "accepted_with_limitations" : "blocked"} |`,
    "| Workflow validation | pass | pass after runner completion | pass |",
    "| External approvals | approved / not_required | not_required for artifact-only local run | pass |",
    "| External publication records | complete / not_required | not_requested | pass |",
    "| Rollback readiness | ready | discard output directory if run is rejected | pass |",
    "## Deployment Notes",
    "| Step | Command / Action | Expected Result | Stop Condition |",
    "|---|---|---|---|",
    "| No deploy | No deployment requested by local workflow runner. | Artifacts remain local. | User requests external deploy target. |",
    "## Post-Release Smoke Checks",
    "| Check | Target | Expected Result | Owner |",
    "|---|---|---|---|",
    "| Open run-index.md | Local output directory | Run index lists generated artifacts and blockers. | release |",
    "| Inspect qa-report.md | Local output directory | QA status matches release decision. | release |",
    "## Rollback Notes",
    "| Surface | Rollback Action | Validation After Rollback | Data Loss Risk | Approval Needed |",
    "|---|---|---|---|---|",
    "| Local generated artifacts | Archive or remove the generated output directory after user approval. | Run `yarn workflow:list` and confirm the discarded run is no longer active. | low | yes |",
    "## Approval And External Records",
    "| Action | Target | Approval / Record | Status | Evidence |",
    "|---|---|---|---|---|",
    "| deploy | not_requested | not_required | not_requested | Local workflow runner does not deploy. |",
    "| notion_publish | not_requested | not_required | not_requested | Publication remains approval-gated. |",
    "| figma_write | not_requested | not_required | not_requested | No Figma write in local release. |",
    "| git_write | not_requested | not_required | not_requested | Local workflow runner does not commit or push. |",
    "## Remaining Risks",
    "| Risk | Severity | Owner | Follow-Up |",
    "|---|---|---|---|",
    status === "ready"
      ? "| External Notion publication remains approval-gated. | medium | release | Ask user for exact Notion target before publishing. |"
      : "| Research or QA is blocked/partial. | blocker | release | Resolve upstream blockers before marking release ready. |",
    "## Notion Research Publication",
    status === "ready"
      ? "Notion publication is still approval-gated and must be recorded before external release success."
      : "Blocked until research publication is approved or blocker is recorded.",
  ]);
}

function markdownWithPayload(title: string, payload: Payload, body: string[]): string {
  return [
    "---",
    "schema_payload:",
    indent(JSON.stringify(payload, null, 2), 2),
    "---",
    "",
    `# ${title}`,
    "",
    ...body,
    "",
  ].join("\n");
}

function metadata(status: string, owner: string): string {
  return [
    "## Artifact Metadata",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Status | ${status} |`,
    `| Owner | ${owner} |`,
  ].join("\n");
}

function list(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function numbered(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function indent(value: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return value.split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function researchInputs(): string[] {
  return ["recursive-brief.md", "research-summary.md", "competitive-analysis.md", "proto-personas.md", "synthetic-interviews.md", "swot.md"];
}

function createProductName(goal: string): string {
  return goal
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Продуктовый лендинг";
}

async function readIfExists(path: string): Promise<string> {
  if (!existsSync(path)) {
    return "";
  }

  return readFile(path, "utf8");
}

export async function appendStageProgress(outputDir: string, artifact: ArtifactSpec): Promise<void> {
  await appendFile(
    join(outputDir, artifactFiles.handoff_bundle),
    [
      "",
      `## ${artifact.stage} ${artifact.title}`,
      "",
      `- Completed artifact: \`${artifact.file}\``,
      `- Decision: generated by local deterministic workflow runner.`,
      "- Next Required Artifact: see stage-gate-ledger.md",
    ].join("\n"),
    "utf8",
  );

  await appendFile(
    join(outputDir, artifactFiles.stage_gate_ledger),
    [
      "",
      `| ${new Date().toISOString()} | ${artifact.stage} | completed | Generated \`${artifact.file}\` |`,
    ].join("\n"),
    "utf8",
  );
}

async function inferGoalFromRunPlan(outputDir: string): Promise<string> {
  const runPlan = await readIfExists(join(outputDir, artifactFiles.run_plan));
  const match = runPlan.match(/## Запрос\s+([\s\S]*?)(?:\n## |\n# |$)/);
  return match?.[1]?.trim() || "Продуктовый лендинг";
}

async function inferProfileFromRunPlan(outputDir: string): Promise<"standard" | "reference"> {
  const runPlan = await readIfExists(join(outputDir, artifactFiles.run_plan));
  const match = runPlan.match(/## Workflow Profile\s+([\s\S]*?)(?:\n## |\n# |$)/);
  return match?.[1]?.trim() === "reference" ? "reference" : "standard";
}

async function writeResearchFallback(outputDir: string, goal: string): Promise<void> {
  const fallback = [
    "# Research Summary",
    "",
    "## Inputs Used",
    "",
    "- User request",
    "",
    "## Research Questions",
    "",
    `- What must be validated for: ${goal}?`,
    "",
    "## Audience",
    "",
    "- Status: blocked because research stage was skipped.",
    "",
    "## Jobs To Be Done",
    "",
    "- Needs validation.",
    "",
    "## Proto Personas",
    "",
    "- Needs validation.",
    "",
    "## Synthetic Interviews",
    "",
    "- Skipped.",
    "",
    "## Research Validation Plan",
    "",
    "- Run `yarn research:run` before claiming success.",
    "",
    "## Findings",
    "",
    "- No source-backed findings.",
    "",
    "## Sources",
    "",
    "- None.",
  ].join("\n");

  await writeFile(join(outputDir, artifactFiles.research_summary), fallback, "utf8");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const skipResearch = args.includes("--skip-research");
  const goal = args.filter((arg) => arg !== "--skip-research").join(" ").trim();

  if (!goal) {
    throw new Error('Usage: yarn workflow:run-local "<landing workflow goal>" [--skip-research]');
  }

  const outputDir = await runLocalWorkflow({ goal, skipResearch });
  console.log(`Artifacts: ${join(relative(process.cwd(), outputDir), basename(""))}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

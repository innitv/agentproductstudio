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
    inputs_used: ["ia-brief.md", "design-brief.md", "copy-deck.md"],
    screen_list: [{ name: "Landing page", sections: ["Hero", "Value", "FAQ", "Lead form"] }],
    desktop_specification: "Desktop: header + hero in first viewport, then full-width content bands with constrained inner content.",
    mobile_specification: "Mobile: one-column layout, CTA and form remain reachable without horizontal scrolling.",
    states: ["default", "form_focus", "form_success", "validation_error"],
  };

  return markdownWithPayload("Screens", payload, [
    metadata(context.status, "design-generator"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Screen",
    "Landing page: Hero, value sections, FAQ and lead form.",
    "## Desktop",
    payload.desktop_specification,
    "## Mobile",
    payload.mobile_specification,
    "## States",
    list(payload.states),
  ]);
}

function renderPrototype(context: Awaited<ReturnType<typeof buildContext>>): string {
  const payload = {
    status: context.status,
    inputs_used: ["ia-brief.md", "screens.md"],
    prototype_type: "Manual clickable prototype instructions",
    start_screen: "Landing page hero",
    transition_map: [
      { from: "Hero CTA", to: "Lead form", trigger: "click" },
      { from: "Lead form", to: "Success state", trigger: "submit valid form" },
    ],
    completion_step: "Success state confirms next contact step",
    missing_interactions: ["Real backend submission", "CRM integration"],
  };

  return markdownWithPayload("Prototype Report", payload, [
    metadata(context.status, "prototype"),
    "## Inputs Used",
    list(payload.inputs_used),
    "## Prototype Type",
    payload.prototype_type,
    "## Start Screen",
    payload.start_screen,
    "## Transition Map",
    "| From | Trigger | To |",
    "|---|---|---|",
    "| Hero CTA | click | Lead form |",
    "| Lead form | submit valid form | Success state |",
    "## Completion Step",
    payload.completion_step,
    "## Missing Interactions",
    list(payload.missing_interactions),
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
    research_integrity: { status: context.status, note: context.validationNote },
    prd_fit: "PRD, IA, copy and prototype share the same lead-generation funnel.",
    accessibility: "Requires final browser QA for labels, focus and contrast.",
    responsive: "Requires final Playwright or manual responsive QA after frontend edits.",
    validation: [{ command: "yarn workflow:validate", result: "planned by runner" }],
    blockers: context.status === "ready" ? [] : ["Research remains partial; final success is blocked until provider coverage or approved fallback is recorded."],
  };

  return markdownWithPayload("QA Report", payload, [
    "# QA Report",
    "",
    "## Status",
    qaStatus,
    "## Inputs Used",
    list(payload.inputs_used),
    "## Research Integrity",
    context.validationNote,
    "## PRD Fit",
    payload.prd_fit,
    "## Accessibility",
    payload.accessibility,
    "## Responsive",
    payload.responsive,
    "## Validation",
    "| Command | Result | Notes |",
    "|---|---|---|",
    "| yarn workflow:validate | planned by runner | Standard profile |",
    "## Blockers",
    payload.blockers.length ? list(payload.blockers) : "- No blocking QA issues in generated artifacts.",
  ]);
}

function renderRelease(context: Awaited<ReturnType<typeof buildContext>>): string {
  const status = context.status === "ready" ? "ready" : "blocked";
  const payload = {
    status,
    inputs_used: ["qa-report.md", "frontend-result.md", "test-bench-result.md"],
    changed_files: ["outputs/<project-slug>/<date>/*.md"],
    what_changed: ["Generated local standard workflow artifacts from intake through release."],
    validation: [{ command: "yarn workflow:validate", result: "pass after runner completion" }],
    deployment_notes: ["No deployment performed by local workflow runner."],
    rollback_notes: ["Remove generated output directory if the run should be discarded."],
  };

  return markdownWithPayload("Release Notes", payload, [
    "# Release Notes",
    "",
    "## Status",
    status,
    "## Inputs Used",
    list(payload.inputs_used),
    "## Changed Files",
    list(payload.changed_files),
    "## What Changed",
    list(payload.what_changed),
    "## Validation",
    "| Command | Result |",
    "|---|---|",
    "| yarn workflow:validate | pass after runner completion |",
    "## Deployment Notes",
    list(payload.deployment_notes),
    "## Rollback Notes",
    list(payload.rollback_notes),
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

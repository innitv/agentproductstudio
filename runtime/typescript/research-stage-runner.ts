import { existsSync, readFileSync } from "node:fs";
import { appendFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { artifactFiles } from "./workflow-stages";
import { runMultiSourceResearch, type MultiSourceResearchResult } from "./multi-source-research";
import { researchProviders, type ResearchProvider } from "./research.config";
import { validateWorkflowRun } from "./validate-workflow-run";

interface ResearchStageRunOptions {
  outputDir: string;
  query?: string;
}

interface ResearchSummaryPayload {
  status: "ready" | "partial";
  inputs_used: string[];
  provider_coverage: Array<{
    provider: ResearchProvider;
    requested: boolean;
    used: boolean;
    sources_count: number;
    validation_state: "pass" | "needs_validation" | "failed" | "skipped";
    notes: string;
  }>;
  provider_failures: Array<{
    provider: ResearchProvider;
    error: string;
    impact: string;
    follow_up: string;
  }>;
  research_questions: string[];
  audience: Array<{
    segment: string;
    context: string;
    motivation: string;
    barrier: string;
    evidence_status: "source-backed" | "hypothesis" | "needs validation";
  }>;
  jobs_to_be_done: Array<{
    segment: string;
    job: string;
    trigger: string;
    pain: string;
    desired_outcome: string;
    evidence_status: "source-backed" | "hypothesis" | "needs validation";
  }>;
  proto_personas: Array<{
    name: string;
    segment: string;
    jtbd: string;
    pain: string;
    desired_outcome: string;
    evidence_status: "proto" | "source-backed" | "needs validation";
  }>;
  simulated_interviews: Array<{
    persona: string;
    scenario: string;
    summary: string;
    evidence_status: "synthetic";
    needs_validation: boolean;
  }>;
  findings: Array<{
    finding: string;
    evidence: string;
    confidence: "high" | "medium" | "low";
  }>;
  sources: Array<{
    title: string;
    provider: ResearchProvider;
    url_or_path: string;
    type: string;
    used_for: string;
    retrieved_at: string;
    confidence: "high" | "medium" | "low";
  }>;
  validation_plan: Array<{
    hypothesis: string;
    method: string;
    minimum_evidence: string;
    status: "open" | "validated" | "rejected";
  }>;
  unknowns: string[];
}

const requiredIntakeFiles = [
  artifactFiles.run_plan,
  artifactFiles.handoff_bundle,
  artifactFiles.stage_gate_ledger,
  artifactFiles.recursive_brief,
] as const;

export async function runResearchStage(options: ResearchStageRunOptions): Promise<void> {
  const outputDir = resolve(process.cwd(), options.outputDir);

  if (!existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }

  const missing = requiredIntakeFiles.filter((file) => !existsSync(join(outputDir, file)));
  if (missing.length) {
    throw new Error(`Research stage requires intake artifacts first. Missing: ${missing.join(", ")}`);
  }

  const query = options.query?.trim() || inferQuery(outputDir);
  const multiSource = await runMultiSourceResearch({
    query,
    productContext: readArtifactIfExists(outputDir, artifactFiles.recursive_brief).slice(0, 4_000),
    language: "ru",
    maxResultsPerProvider: 8,
  });
  const payload = buildResearchSummaryPayload(multiSource);

  await writeFile(join(outputDir, artifactFiles.research_summary), renderResearchSummary(multiSource, payload), "utf8");
  await writeFile(join(outputDir, artifactFiles.competitive_analysis), renderCompetitiveAnalysis(multiSource), "utf8");
  await writeFile(join(outputDir, artifactFiles.proto_personas), renderProtoPersonas(payload), "utf8");
  await writeFile(join(outputDir, artifactFiles.synthetic_interviews), renderSyntheticInterviews(payload), "utf8");
  await writeFile(join(outputDir, artifactFiles.swot), renderSwot(multiSource), "utf8");

  await appendResearchHandoff(outputDir, payload.status, multiSource);
  await appendResearchLedger(outputDir, payload.status, multiSource);

  const findings = validateWorkflowRun(options.outputDir, "01-research");
  const errors = findings.filter((finding) => finding.level === "error");

  for (const finding of findings) {
    const prefix = finding.level === "error" ? "ERROR" : "WARN";
    console.log(`${prefix}: ${finding.message}`);
  }

  if (errors.length) {
    throw new Error(`Research stage validation failed with ${errors.length} error(s).`);
  }

  console.log(`Research stage ${payload.status}: ${options.outputDir}`);
  console.log(`Providers used: ${multiSource.providersUsed.join(", ") || "none"}`);
  console.log(`Validation: ${multiSource.validation.status}`);
}

function inferQuery(outputDir: string): string {
  const runPlan = readArtifactIfExists(outputDir, artifactFiles.run_plan);
  const recursiveBrief = readArtifactIfExists(outputDir, artifactFiles.recursive_brief);
  const requestMatch = runPlan.match(/## Запрос\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const expansionMatch = recursiveBrief.match(/## Expansion\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const candidate = [requestMatch?.[1], expansionMatch?.[1]]
    .filter(Boolean)
    .join("\n")
    .replace(/`partial`/g, "")
    .trim();

  if (!candidate) {
    throw new Error("Research query was not provided and could not be inferred from intake artifacts.");
  }

  return candidate;
}

function buildResearchSummaryPayload(result: MultiSourceResearchResult): ResearchSummaryPayload {
  const status = result.validation.status === "pass" ? "ready" : "partial";
  const retrievedAt = new Date().toISOString();
  const used = new Set(result.providersUsed);
  const sourcesByProvider = new Map<ResearchProvider, number>();

  for (const source of result.sources) {
    sourcesByProvider.set(source.provider, (sourcesByProvider.get(source.provider) ?? 0) + 1);
  }

  const providerCoverage = result.providersRequested.map((provider) => {
    const failure = result.failures.find((item) => item.provider === provider);
    const isUsed = used.has(provider);
    const isUnavailable = result.unavailableProviders.includes(provider);

    return {
      provider,
      requested: true,
      used: isUsed,
      sources_count: sourcesByProvider.get(provider) ?? 0,
      validation_state: isUsed ? "pass" as const : failure ? "failed" as const : isUnavailable ? "skipped" as const : "needs_validation" as const,
      notes: provider === researchProviders.deepseek
        ? "DeepSeek is a check provider and not source-backed evidence."
        : provider === researchProviders.gemini
        ? "Gemini is a strategy and cross-check provider."
        : failure?.error ?? (isUnavailable ? "Provider was requested but not configured or executable locally." : "Provider returned usable output."),
    };
  });

  const providerFailures = [
    ...result.failures.map((failure) => ({
      provider: failure.provider,
      error: failure.error,
      impact: "Research stage cannot be marked ready if this is a required default provider.",
      follow_up: `Configure or rerun ${failure.provider}; keep downstream claims marked needs validation until resolved.`,
    })),
    ...result.unavailableProviders.map((provider) => ({
      provider,
      error: "Provider requested by source policy but not configured or executable in local runtime.",
      impact: provider === researchProviders.tavily || provider === researchProviders.deepseek
        ? "Required default deep research coverage is incomplete."
        : "Optional source coverage is incomplete.",
      follow_up: `Configure ${provider} or record an approved fallback before claiming success.`,
    })),
  ];

  const tavilyFindings = result.results
    .flatMap((item) => item.provider === "tavily" ? item.findings : [])
    .slice(0, 5);
  const deepSeekSummary = result.results.find((item) => item.provider === "deepseek")?.provider === "deepseek"
    ? result.results.find((item) => item.provider === "deepseek")?.summary
    : undefined;
  const geminiSummary = result.results.find((item) => item.provider === "gemini")?.provider === "gemini"
    ? (result.results.find((item) => item.provider === "gemini") as any)?.summary
    : undefined;

  return {
    status,
    inputs_used: ["recursive-brief.md", "handoff-bundle.md", "stage-gate-ledger.md", "Tavily provider output when configured", "DeepSeek provider output when configured"],
    provider_coverage: providerCoverage,
    provider_failures: providerFailures,
    research_questions: [
      `Какие сегменты и JTBD наиболее вероятны для запроса: ${result.query.slice(0, 180)}?`,
      "Какие конкуренты, альтернативы и паттерны позиционирования подтверждаются источниками?",
      "Какие claims нельзя переносить в PRD/copy без дополнительной проверки?",
    ],
    audience: [
      {
        segment: "Потенциальный покупатель продукта из запроса",
        context: "Изучает предложение онлайн и сравнивает альтернативы перед заявкой.",
        motivation: "Быстро понять ценность, условия, доверие и следующий шаг.",
        barrier: "Недоверие к неподтвержденным обещаниям, скрытым условиям и непонятному процессу.",
        evidence_status: result.sources.length ? "source-backed" : "needs validation",
      },
      {
        segment: "Операционный или B2B-покупатель",
        context: "Оценивает решение для повторяемого процесса или команды.",
        motivation: "Снизить ручную координацию и получить прозрачный маршрут внедрения.",
        barrier: "Нужны документы, SLA, поддержка и понятные ограничения.",
        evidence_status: "hypothesis",
      },
    ],
    jobs_to_be_done: [
      {
        segment: "Потенциальный покупатель продукта из запроса",
        job: "Оценить, подходит ли решение под мою задачу, и оставить заявку без лишнего риска.",
        trigger: "Появилась потребность быстро выбрать услугу или продукт онлайн.",
        pain: "Сложно понять реальные условия, цену, ограничения и качество поддержки.",
        desired_outcome: "Получить понятный следующий шаг и подтверждение, что решение подходит.",
        evidence_status: result.sources.length ? "source-backed" : "needs validation",
      },
      {
        segment: "Операционный или B2B-покупатель",
        job: "Понять, можно ли масштабировать решение на несколько пользователей или процессов.",
        trigger: "Нужно стандартизировать закупку или подключение без хаоса в коммуникации.",
        pain: "Риски в документах, сроках, поддержке и ответственности поставщика.",
        desired_outcome: "Получить предсказуемый процесс, контакт и прозрачные условия.",
        evidence_status: "hypothesis",
      },
    ],
    proto_personas: [
      {
        name: "Рациональный покупатель",
        segment: "Потенциальный покупатель продукта из запроса",
        jtbd: "Сравнить варианты и безопасно оставить заявку.",
        pain: "Неясные условия и сомнения в достоверности claims.",
        desired_outcome: "Понятная ценность, условия и быстрый контакт.",
        evidence_status: "proto",
      },
      {
        name: "Операционный координатор",
        segment: "Операционный или B2B-покупатель",
        jtbd: "Проверить, выдержит ли решение повторяемый процесс.",
        pain: "Нужно согласовать документы, сроки и поддержку.",
        desired_outcome: "Управляемый процесс и меньше ручной координации.",
        evidence_status: "needs validation",
      },
    ],
    simulated_interviews: [
      {
        persona: "Рациональный покупатель",
        scenario: "Сравнивает лендинг с альтернативами.",
        summary: "Ожидает увидеть цену, ограничения, доказательства доверия и простой CTA.",
        evidence_status: "synthetic",
        needs_validation: true,
      },
      {
        persona: "Операционный координатор",
        scenario: "Проверяет пригодность решения для команды.",
        summary: "Ищет процесс, документы, поддержку и ответственность после заявки.",
        evidence_status: "synthetic",
        needs_validation: true,
      },
      {
        persona: "Сомневающийся посетитель",
        scenario: "Уходит, если claims звучат неподтвержденно.",
        summary: "Нужны конкретные источники, ограничения и безопасный способ связаться.",
        evidence_status: "synthetic",
        needs_validation: true,
      },
    ],
    findings: [
      ...tavilyFindings.map((finding) => ({
        finding: finding.finding.slice(0, 500),
        evidence: finding.evidence.map((source) => source.url).join(", ") || "Tavily answer with source list.",
        confidence: finding.confidence,
      })),
      ...(deepSeekSummary ? [{
        finding: deepSeekSummary.slice(0, 500),
        evidence: "DeepSeek cross-check only; not source-backed evidence.",
        confidence: "low" as const,
      }] : []),
      ...(geminiSummary ? [{
        finding: geminiSummary.slice(0, 500),
        evidence: "Gemini deep strategy synthesis & cross-check.",
        confidence: "medium" as const,
      }] : []),
    ].slice(0, 7),
    sources: result.sources.map((source) => ({
      title: source.title ?? source.url,
      provider: source.provider,
      url_or_path: source.url,
      type: "web",
      used_for: "Research finding and competitor/context evidence",
      retrieved_at: retrievedAt,
      confidence: source.provider === researchProviders.tavily ? "medium" : "low",
    })),
    validation_plan: [
      {
        hypothesis: "Hero value proposition and CTA match the primary buyer job.",
        method: "5-7 target-user interviews or moderated landing usability sessions.",
        minimum_evidence: "At least 4 participants can explain the offer and next step without prompting.",
        status: "open",
      },
      {
        hypothesis: "Trust and limitation copy reduces hesitation.",
        method: "Compare prototype with/without explicit constraints and proof points.",
        minimum_evidence: "Improved CTA intent or fewer unresolved objections in qualitative testing.",
        status: "open",
      },
    ],
    unknowns: [
      ...result.unknowns,
      ...result.results.flatMap((item) => item.unknowns),
      ...result.results.flatMap((item) => item.claimsToValidate),
    ],
  };
}

function renderResearchSummary(result: MultiSourceResearchResult, payload: ResearchSummaryPayload): string {
  return [
    "---",
    "schema_payload:",
    indentYaml(JSON.stringify(payload, null, 2)),
    "---",
    "# Research Summary",
    "",
    "## Artifact Metadata",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Status | ${payload.status} |`,
    "| Research mode | deep_research |",
    `| Evidence level | ${result.sources.length ? "mixed" : "hypothesis"} |`,
    `| Readiness score | ${payload.status === "ready" ? "ready" : "partial"} |`,
    "",
    "## Inputs Used",
    "",
    ...payload.inputs_used.map((item) => `- ${item}`),
    "",
    "## Source Policy",
    "",
    "- Allowed sources: Tavily, DeepSeek, Gemini, Firecrawl/browser fallback when configured.",
    "- Denied sources: external write actions without approval.",
    "- Citation requirement: required for market and competitor claims.",
    "- External write: denied unless approval exists.",
    "",
    "## Provider Coverage",
    "",
    "| Provider | Requested | Used | Sources count | Validation state | Notes |",
    "|---|---:|---:|---:|---|---|",
    ...payload.provider_coverage.map((item) => `| ${item.provider} | ${yesNo(item.requested)} | ${yesNo(item.used)} | ${item.sources_count} | ${item.validation_state} | ${cell(item.notes)} |`),
    "",
    "## Provider Failures",
    "",
    "| Provider | Error / blocker | Impact | Follow-up |",
    "|---|---|---|---|",
    ...(payload.provider_failures.length
      ? payload.provider_failures.map((item) => `| ${item.provider} | ${cell(item.error)} | ${cell(item.impact)} | ${cell(item.follow_up)} |`)
      : ["| none | none | none | none |"]),
    "",
    "## Research Questions",
    "",
    "| Question | Why it matters | Evidence needed | Status |",
    "|---|---|---|---|",
    ...payload.research_questions.map((question) => `| ${cell(question)} | Blocks PRD and copy claims | Source-backed provider output plus user validation | ${payload.status === "ready" ? "answered" : "needs validation"} |`),
    "",
    "## Audience",
    "",
    "| Segment | Context | Motivation | Barrier | Evidence status |",
    "|---|---|---|---|---|",
    ...payload.audience.map((item) => `| ${cell(item.segment)} | ${cell(item.context)} | ${cell(item.motivation)} | ${cell(item.barrier)} | ${item.evidence_status} |`),
    "",
    "## Jobs To Be Done",
    "",
    "| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |",
    "|---|---|---|---|---|---|",
    ...payload.jobs_to_be_done.map((item) => `| ${cell(item.segment)} | ${cell(item.job)} | ${cell(item.trigger)} | ${cell(item.pain)} | ${cell(item.desired_outcome)} | ${item.evidence_status} |`),
    "",
    "## Proto Personas",
    "",
    "| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |",
    "|---|---|---|---|---|---|---|",
    ...payload.proto_personas.map((item) => `| ${cell(item.name)} | ${cell(item.segment)} | ${cell(item.jtbd)} | Product need from research query | ${cell(item.pain)} | ${cell(item.desired_outcome)} | ${item.evidence_status} |`),
    "",
    "## Synthetic Interviews",
    "",
    "Guardrail: synthetic interviews are used only for hypothesis generation and validation planning.",
    "",
    "| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |",
    "|---|---|---|---|---|---|---|",
    ...payload.simulated_interviews.map((item, index) => `| ${index + 1} | ${cell(item.persona)} | ${cell(item.scenario)} | Claims need proof | Use as interview guide | synthetic | yes |`),
    "",
    "## Competitors and Alternatives",
    "",
    "| Name | Type | Category | Core offer | Source | Evidence status |",
    "|---|---|---|---|---|---|",
    ...competitorRows(result),
    "",
    "## Findings",
    "",
    "| Finding | Impact | Evidence | Confidence | Product implication |",
    "|---|---|---|---|---|",
    ...(payload.findings.length
      ? payload.findings.map((item) => `| ${cell(item.finding)} | Informs PRD, IA and copy | ${cell(item.evidence)} | ${item.confidence} | Keep claims sourced or marked needs validation |`)
      : ["| No source-backed finding returned | Research cannot be treated as ready | Provider output missing | low | Keep downstream work partial |"]),
    "",
    "## Claims To Validate",
    "",
    "| Claim | Current evidence | Risk | Validation method |",
    "|---|---|---|---|",
    ...payload.unknowns.slice(0, 8).map((unknown) => `| ${cell(unknown)} | Provider output or gap | Misleading PRD/copy claim | Validate with primary sources or user research |`),
    "",
    "## Research Validation Plan",
    "",
    "| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |",
    "|---|---|---|---|---|",
    ...payload.validation_plan.map((item) => `| ${cell(item.hypothesis)} | Target segment from research | ${cell(item.minimum_evidence)} | PRD/copy confidence | ${item.status} |`),
    "",
    "## Sources",
    "",
    "| Source | Provider | Type | URL/path | Used for | Retrieved at | Confidence |",
    "|---|---|---|---|---|---|---|",
    ...(payload.sources.length
      ? payload.sources.map((item) => `| ${cell(item.title)} | ${item.provider} | ${item.type} | ${cell(item.url_or_path)} | ${cell(item.used_for)} | ${item.retrieved_at} | ${item.confidence} |`)
      : ["| No source returned | none | none | none | none | n/a | low |"]),
    "",
    "## Unknowns",
    "",
    ...(payload.unknowns.length ? payload.unknowns.map((item) => `- ${item}`) : ["- No additional unknowns recorded."]),
    "",
    "## Readiness Checklist",
    "",
    `- [${payload.status === "ready" ? "x" : " "}] Tavily, DeepSeek and Gemini coverage is sufficient for ready status.`,
    "- [x] DeepSeek and Gemini outputs are marked as cross-check/synthesis and not source-backed evidence.",
    "- [x] Proto personas and synthetic interviews are marked as validation inputs, not facts.",
    "",
  ].join("\n");
}

function renderCompetitiveAnalysis(result: MultiSourceResearchResult): string {
  const competitors = result.results.flatMap((item) => item.provider === "tavily" ? item.competitors : []).slice(0, 5);

  return [
    "# Competitive Analysis",
    "",
    "## Artifact Metadata",
    "",
    `Status: ${result.validation.status === "pass" ? "ready" : "partial"}`,
    "",
    "## Inputs Used",
    "",
    "- `research-summary.md`",
    "- Tavily provider output when configured",
    "",
    "## Competitor Set",
    "",
    "| Name | Type | Source URL | Last Verified | Evidence Status |",
    "|---|---|---|---|---|",
    ...(competitors.length
      ? competitors.map((item) => `| ${cell(item.title ?? hostname(item.url))} | market alternative | ${cell(item.url)} | ${new Date().toISOString()} | source-backed |`)
      : ["| Competitor discovery incomplete | unknown | n/a | n/a | needs validation |"]),
    "",
    "## Comparison Matrix",
    "",
    "| Competitor | Claim | Evidence | Confidence |",
    "|---|---|---|---|",
    ...(competitors.length
      ? competitors.map((item) => `| ${cell(item.title ?? hostname(item.url))} | ${cell((item.content ?? item.title ?? "Competitor source found").slice(0, 220))} | ${cell(item.url)} | low |`)
      : ["| needs validation | Need competitor set from Tavily or Firecrawl crawl | n/a | low |"]),
    "",
    "## Takeaways",
    "",
    "- Keep competitor claims conservative until source-backed comparison is complete.",
    "- Use this analysis to identify trust, pricing, proof and CTA patterns for PRD and IA.",
    "",
    "## Strategic Risks",
    "",
    "- Competitor set may be incomplete if Tavily returned few or no relevant sources.",
    "",
    "## Differentiation Opportunities",
    "",
    "- Clarify process, constraints and proof points earlier than generic alternatives.",
    "",
    "## Readiness Checklist",
    "",
    `- [${competitors.length >= 3 ? "x" : " "}] At least 3 competitor or alternative sources captured.`,
    "",
  ].join("\n");
}

function renderProtoPersonas(payload: ResearchSummaryPayload): string {
  return [
    "# Proto Personas",
    "",
    "## Artifact Metadata",
    "",
    `Status: ${payload.status}`,
    "",
    "## Inputs Used",
    "",
    "- `research-summary.md`",
    "",
    "## Guardrail",
    "",
    "Proto personas are assumption-based unless backed by real user data. Do not label a persona validated without direct evidence.",
    "",
    "## Proto Personas",
    "",
    "| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |",
    "|---|---|---|---|---|---|---|",
    ...payload.proto_personas.map((item) => `| ${cell(item.name)} | ${cell(item.segment)} | ${cell(item.jtbd)} | Product need from query | ${cell(item.pain)} | ${cell(item.desired_outcome)} | ${item.evidence_status} |`),
    "",
    "## Decision Context",
    "",
    "| Persona | Buying context | Objections | Trust signals | Success metric |",
    "|---|---|---|---|---|",
    ...payload.proto_personas.map((item) => `| ${cell(item.name)} | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |`),
    "",
    "## Evidence Map",
    "",
    "| Persona | Evidence | Source | Confidence | Needs validation |",
    "|---|---|---|---|---|",
    ...payload.proto_personas.map((item) => `| ${cell(item.name)} | ${cell(item.evidence_status)} | research-summary.md | low | yes |`),
    "",
    "## Validation Plan",
    "",
    "- What to validate: segment fit, objections, decision language and trust signals.",
    "- Who to interview: target buyers matching the primary segment and operational/B2B segment.",
    "- Minimum evidence needed: 5-7 interviews or observable funnel data before treating personas as validated.",
    "",
  ].join("\n");
}

function renderSyntheticInterviews(payload: ResearchSummaryPayload): string {
  return [
    "# Synthetic Interviews",
    "",
    "## Guardrail",
    "",
    "Synthetic interviews are not evidence of real user behavior. They are only for hypothesis generation, language exploration, edge-case discovery and interview guide preparation.",
    "",
    "## Inputs Used",
    "",
    "- `research-summary.md`",
    "- `proto-personas.md`",
    "",
    "## Interview Metadata",
    "",
    "- Goal: stress-test buyer objections and interview guide.",
    "- Personas / segments: primary buyer, operational coordinator, hesitant visitor.",
    "- Script version: generated from research stage runner.",
    "- Evidence status: `synthetic`",
    "",
    "## Simulated Interviews",
    "",
    "| Interview | Persona | Scenario | Key quotes/paraphrases | Objections | Opportunity | Evidence status | Needs validation |",
    "|---|---|---|---|---|---|---|---|",
    ...payload.simulated_interviews.map((item, index) => `| ${index + 1} | ${cell(item.persona)} | ${cell(item.scenario)} | ${cell(item.summary)} | Claims need proof | Convert objections into validation questions | synthetic | yes |`),
    "",
    "## Patterns To Validate",
    "",
    "| Pattern | Why it matters | How to validate with real evidence | Priority |",
    "|---|---|---|---|",
    "| Need for proof before CTA | Prevents misleading copy and drop-off | User interviews and analytics on CTA flow | high |",
    "| Process clarity | Reduces uncertainty in high-intent flows | Usability test with first-time visitors | high |",
    "",
  ].join("\n");
}

function renderSwot(result: MultiSourceResearchResult): string {
  return [
    "# SWOT",
    "",
    "## Artifact Metadata",
    "",
    `Status: ${result.validation.status === "pass" ? "ready" : "partial"}`,
    "",
    "## Inputs Used",
    "",
    "- `research-summary.md`",
    "- `competitive-analysis.md`",
    "",
    "## SWOT",
    "",
    "| Quadrant | Item | Evidence | Confidence | Implication |",
    "|---|---|---|---|---|",
    "| Strength | Clear artifact-driven workflow can preserve research-to-frontend traceability | Local workflow files and provider output | medium | Use handoff bundle as source of truth |",
    "| Weakness | Research readiness depends on configured external providers | Provider coverage state | medium | Keep partial status when providers are missing |",
    "| Opportunity | Firecrawl and Playwright can improve reference-driven evidence collection | reference:scan package | medium | Feed screenshots and markdown into design gates |",
    "| Threat | Unsourced market claims can leak into PRD or copy | DeepSeek guardrail and validation plan | high | Block success until claims are validated |",
    "",
    "## Strategic Notes",
    "",
    "- Treat Tavily as source-backed evidence provider, and DeepSeek/Gemini as contradiction, check and strategic synthesis providers.",
    "- Use Firecrawl/reference scan for public competitor/reference pages when URLs are known.",
    "",
    "## Strategic Decisions",
    "",
    "- Downstream PRD should inherit `partial` if default provider coverage is incomplete.",
    "",
    "## Risks",
    "",
    ...(result.unknowns.length ? result.unknowns.map((item) => `- ${item}`) : ["- No additional provider risks recorded."]),
    "",
    "## Readiness Checklist",
    "",
    `- [${result.validation.status === "pass" ? "x" : " "}] Default multi-source research coverage passed.`,
    "",
  ].join("\n");
}

async function appendResearchHandoff(outputDir: string, status: ResearchSummaryPayload["status"], result: MultiSourceResearchResult): Promise<void> {
  const content = [
    "",
    "## Research Stage Update",
    "",
    `- Status: ${status}`,
    "- Completed artifacts: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`",
    `- Providers used: ${result.providersUsed.join(", ") || "none"}`,
    `- Validation state: ${result.validation.status}`,
    `- Next Required Artifact: \`prd.md\`${status === "partial" ? " with claims marked needs validation" : ""}`,
    "",
  ].join("\n");

  await appendFile(join(outputDir, artifactFiles.handoff_bundle), content, "utf8");
}

async function appendResearchLedger(outputDir: string, status: ResearchSummaryPayload["status"], result: MultiSourceResearchResult): Promise<void> {
  const content = [
    "",
    "## Research Stage Runner Record",
    "",
    `| ${new Date().toISOString()} | 01-research | ${status} | Providers used: ${result.providersUsed.join(", ") || "none"}; validation: ${result.validation.status} |`,
    "",
  ].join("\n");

  await appendFile(join(outputDir, artifactFiles.stage_gate_ledger), content, "utf8");
}

function competitorRows(result: MultiSourceResearchResult): string[] {
  const competitors = result.results.flatMap((item) => item.provider === "tavily" ? item.competitors : []).slice(0, 5);

  if (!competitors.length) {
    return ["| Competitor discovery incomplete | alternative | unknown | Needs configured Tavily/Firecrawl run | n/a | needs validation |"];
  }

  return competitors.map((item) => `| ${cell(item.title ?? hostname(item.url))} | alternative | market context | ${cell((item.content ?? "Source captured").slice(0, 180))} | ${cell(item.url)} | source-backed |`);
}

function readArtifactIfExists(outputDir: string, fileName: string): string {
  const filePath = join(outputDir, fileName);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function indentYaml(json: string): string {
  return json
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function yesNo(value: boolean): "yes" | "no" {
  return value ? "yes" : "no";
}

function cell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function main(): Promise<void> {
  const [outputDir, ...queryParts] = process.argv.slice(2);

  if (!outputDir) {
    throw new Error("Usage: yarn research:run <outputs/project-slug/YYYY-MM-DD> [research query]");
  }

  await runResearchStage({
    outputDir,
    query: queryParts.join(" "),
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

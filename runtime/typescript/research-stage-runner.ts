import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

interface ResearchArtifactWriteDecision {
  file: string;
  action: "written" | "preserved_existing";
  existing_score: number;
  candidate_score: number;
  reason: string;
}

interface RunArtifactContext {
  files: Array<{
    file: string;
    content: string;
  }>;
  combined_text: string;
  inputs_used: string[];
}

interface DomainScenario {
  name: string;
  user_goal: string;
  friction: string;
  product_role: string;
  priority: "P0" | "P1" | "P2";
  evidence_status: "source-backed" | "hypothesis" | "needs validation";
}

interface DomainOpportunity {
  initiative: string;
  scenario: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  priority: "P0" | "P1" | "P2";
}

interface DomainSynthesis {
  theme: string;
  positioning: string;
  primary_paths: string[];
  scenarios: DomainScenario[];
  opportunities: DomainOpportunity[];
  roadmap: Array<{
    horizon: string;
    focus: string;
    outcome: string;
  }>;
  design_handoff: {
    trust_requirements: string[];
    decision_moments: string[];
    content_risks: string[];
    visual_evidence_needs: string[];
  };
  source_backed_facts: Array<{
    fact: string;
    source: string;
    confidence: "high" | "medium" | "low";
  }>;
  contradiction_review: Array<{
    topic: string;
    agreement: string;
    disagreement: string;
    decision: string;
  }>;
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
  domain_synthesis: DomainSynthesis;
}

const requiredIntakeFiles = [
  artifactFiles.run_plan,
  artifactFiles.handoff_bundle,
  artifactFiles.stage_gate_ledger,
  artifactFiles.recursive_brief,
] as const;

const artifactContextExtensions = new Set([".md", ".json", ".yaml", ".yml", ".txt"]);
const maxArtifactContextFileChars = 12_000;
const maxArtifactContextTotalChars = 80_000;

export async function runResearchStage(options: ResearchStageRunOptions): Promise<void> {
  const outputDir = resolve(process.cwd(), options.outputDir);

  if (!existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }

  const missing = requiredIntakeFiles.filter((file) => !existsSync(join(outputDir, file)));
  if (missing.length) {
    throw new Error(`Research stage requires intake artifacts first. Missing: ${missing.join(", ")}`);
  }

  const artifactContext = collectRunArtifactContext(outputDir);
  const query = options.query?.trim() || inferQuery(outputDir, artifactContext);
  const multiSource = await runMultiSourceResearch({
    query,
    productContext: artifactContext.combined_text.slice(0, 16_000),
    language: "ru",
    maxResultsPerProvider: 8,
  });
  const payload = buildResearchSummaryPayload(multiSource, artifactContext);

  const writeDecisions: ResearchArtifactWriteDecision[] = [];
  writeDecisions.push(await writeResearchArtifact(outputDir, artifactFiles.research_summary, renderResearchSummary(multiSource, payload), query));
  writeDecisions.push(await writeResearchArtifact(outputDir, artifactFiles.competitive_analysis, renderCompetitiveAnalysis(multiSource, payload.domain_synthesis), query));
  writeDecisions.push(await writeResearchArtifact(outputDir, artifactFiles.proto_personas, renderProtoPersonas(payload), query));
  writeDecisions.push(await writeResearchArtifact(outputDir, artifactFiles.synthetic_interviews, renderSyntheticInterviews(payload), query));
  writeDecisions.push(await writeResearchArtifact(outputDir, artifactFiles.swot, renderSwot(multiSource, payload.domain_synthesis), query));

  await appendResearchHandoff(outputDir, payload.status, multiSource, writeDecisions);
  await appendResearchLedger(outputDir, payload.status, multiSource, writeDecisions);

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
  console.log(`Artifact writes: ${writeDecisions.map((item) => `${item.file}=${item.action}`).join(", ")}`);
}

function inferQuery(outputDir: string, artifactContext: RunArtifactContext): string {
  const runPlan = readArtifactIfExists(outputDir, artifactFiles.run_plan);
  const recursiveBrief = readArtifactIfExists(outputDir, artifactFiles.recursive_brief);
  const requestMatch = runPlan.match(/## Запрос\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const expansionMatch = recursiveBrief.match(/## Expansion\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const goalMatch = artifactContext.combined_text.match(/## Цель\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const candidate = [requestMatch?.[1], expansionMatch?.[1], goalMatch?.[1]]
    .filter(Boolean)
    .join("\n")
    .replace(/`partial`/g, "")
    .trim();

  if (!candidate) {
    throw new Error("Research query was not provided and could not be inferred from intake artifacts.");
  }

  return candidate;
}

function collectRunArtifactContext(outputDir: string): RunArtifactContext {
  const files: RunArtifactContext["files"] = [];
  const visited = new Set<string>();
  let totalChars = 0;

  walkArtifactFiles(outputDir, "", (absolutePath, relativePath) => {
    if (visited.has(relativePath) || totalChars >= maxArtifactContextTotalChars) {
      return;
    }

    visited.add(relativePath);
    const content = readFileSync(absolutePath, "utf8")
      .replace(/\r\n/g, "\n")
      .slice(0, maxArtifactContextFileChars);
    const remaining = maxArtifactContextTotalChars - totalChars;
    const sliced = content.slice(0, Math.max(0, remaining));

    if (!sliced.trim()) {
      return;
    }

    files.push({ file: relativePath, content: sliced });
    totalChars += sliced.length;
  });

  const combinedText = files
    .map((item) => `# Artifact: ${item.file}\n${item.content}`)
    .join("\n\n---\n\n");

  return {
    files,
    combined_text: combinedText,
    inputs_used: files.map((item) => item.file),
  };
}

function walkArtifactFiles(rootDir: string, relativeDir: string, onFile: (absolutePath: string, relativePath: string) => void): void {
  const absoluteDir = join(rootDir, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    const absolutePath = join(rootDir, relativePath);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "screenshots" || entry.name === "assets") {
        continue;
      }

      walkArtifactFiles(rootDir, relativePath, onFile);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = entry.name.includes(".") ? entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase() : "";
    if (!artifactContextExtensions.has(extension)) {
      continue;
    }

    const stat = statSync(absolutePath);
    if (stat.size > 2_000_000) {
      continue;
    }

    onFile(absolutePath, relativePath);
  }
}

function buildResearchSummaryPayload(result: MultiSourceResearchResult, artifactContext: RunArtifactContext): ResearchSummaryPayload {
  const status = result.validation.status === "pass" ? "ready" : "partial";
  const retrievedAt = new Date().toISOString();
  const used = new Set(result.providersUsed);
  const sourcesByProvider = new Map<ResearchProvider, number>();
  const synthesis = buildDomainSynthesis(result, artifactContext);

  for (const source of result.sources) {
    sourcesByProvider.set(source.provider, (sourcesByProvider.get(source.provider) ?? 0) + 1);
  }

  const providerCoverage = result.providersRequested.map((provider) => {
    const failure = result.failures.find((item) => item.provider === provider);
    const fallback = result.fallbacks.find((item) => item.from === provider || item.to === provider);
    const isUsed = used.has(provider);
    const isUnavailable = result.unavailableProviders.includes(provider);

    return {
      provider,
      requested: true,
      used: isUsed,
      sources_count: sourcesByProvider.get(provider) ?? 0,
      validation_state: isUsed ? "pass" as const : failure ? "failed" as const : isUnavailable ? "skipped" as const : "needs_validation" as const,
      notes: provider === researchProviders.deepseek
        ? fallback?.to === provider
          ? `${fallback.notes} DeepSeek is a check provider and not source-backed evidence.`
          : "DeepSeek is a check provider and not source-backed evidence."
        : provider === researchProviders.gemini
        ? "Gemini is a strategy and cross-check provider."
        : fallback?.from === provider
        ? `${failure?.error ?? "Provider failed."} Fallback: ${fallback.notes}`
        : failure?.error ?? (isUnavailable ? "Provider was requested but not configured or executable locally." : "Provider returned usable output."),
    };
  });

  const providerFailures = [
    ...result.failures.map((failure) => ({
      provider: failure.provider,
      error: failure.error,
      impact: "Research stage cannot be marked ready if this is a required default provider.",
      follow_up: result.fallbacks.find((fallback) => fallback.from === failure.provider)
        ? `Fallback was applied; keep downstream claims marked needs validation until source-backed coverage is restored.`
        : `Configure or rerun ${failure.provider}; keep downstream claims marked needs validation until resolved.`,
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
    inputs_used: [
      ...artifactContext.inputs_used,
      "Tavily provider output when configured",
      "DeepSeek provider output when configured",
      "Gemini provider output when configured",
    ],
    provider_coverage: providerCoverage,
    provider_failures: providerFailures,
    research_questions: buildResearchQuestions(result, synthesis),
    audience: buildAudience(synthesis, result.sources.length > 0),
    jobs_to_be_done: buildJobsToBeDone(synthesis, result.sources.length > 0),
    proto_personas: buildProtoPersonas(synthesis),
    simulated_interviews: buildSimulatedInterviews(synthesis),
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
        hypothesis: `${synthesis.positioning} понятно целевому пользователю без объяснения команды.`,
        method: "5-7 проблемных интервью и модерируемых сессий с прототипом.",
        minimum_evidence: "Минимум 4 участника верно объясняют ценность, следующий шаг и ограничения продукта.",
        status: "open",
      },
      {
        hypothesis: "Статусы, подтверждение получателя и прозрачные ограничения снижают тревожность перед действием.",
        method: "Сравнить прототип с явным слоем доверия и без него.",
        minimum_evidence: "Меньше нерешенных возражений и меньше ошибок понимания основного сценария.",
        status: "open",
      },
    ],
    unknowns: [
      ...result.unknowns,
      ...result.results.flatMap((item) => item.unknowns),
      ...result.results.flatMap((item) => item.claimsToValidate),
    ],
    domain_synthesis: synthesis,
  };
}

function buildDomainSynthesis(result: MultiSourceResearchResult, artifactContext: RunArtifactContext): DomainSynthesis {
  const evidenceText = [
    result.query,
    artifactContext.combined_text,
    ...result.sources.map((source) => `${source.title ?? ""} ${"content" in source ? "" : ""}`),
    ...result.results.flatMap((item) => item.findings.map((finding) => finding.finding)),
    ...result.results.map((item) => "summary" in item ? item.summary : ""),
  ].join("\n").toLowerCase();
  const paymentDomain = /a3pay|a3 pay|сбп|плат[её]ж|payment|checkout|bnpl|жкх|недвиж|авто|travel|путешеств|подпис|номер[ау] телефона/.test(evidenceText);
  const scenarios = paymentDomain ? buildPaymentScenarios(evidenceText, result.sources.length > 0) : buildGenericScenarios(result, evidenceText);
  const opportunities = buildOpportunities(scenarios);
  const sourceBackedFacts = result.results
    .flatMap((item) => item.provider === "tavily" ? item.findings : [])
    .slice(0, 6)
    .map((finding) => ({
      fact: finding.finding.slice(0, 260),
      source: finding.evidence.map((source) => source.url).filter(Boolean).join(", ") || "Tavily source-backed finding",
      confidence: finding.confidence,
    }));

  return {
    theme: inferTheme(paymentDomain, artifactContext),
    positioning: paymentDomain
      ? "A3 Pay как слой оркестрации платежных обязательств, статусов и способов оплаты, а не отдельный кошелек"
      : inferGenericPositioning(artifactContext),
    primary_paths: scenarios.slice(0, 4).map((scenario) => `${scenario.name}: ${scenario.user_goal}`),
    scenarios,
    opportunities,
    roadmap: buildRoadmap(paymentDomain, artifactContext),
    design_handoff: paymentDomain ? {
      trust_requirements: [
        "Проверенный получатель и понятное назначение платежа.",
        "Статус: банк списал, поставщик принял, требуется действие.",
        "Явное управление подписками, лимитами и повторными списаниями.",
        "Отдельная маркировка сценариев, где A3 Pay не заменяет банк/реестр/нотариуса.",
      ],
      decision_moments: [
        "Пользователь понимает, что именно нужно оплатить.",
        "Пользователь доверяет получателю и сумме.",
        "Пользователь выбирает способ оплаты или принимает рекомендацию.",
        "Пользователь получает подтверждение и следующий шаг.",
      ],
      content_risks: [
        "Не обещать escrow/аккредитив/регулируемый платежный сервис без юридического подтверждения.",
        "Не переносить рыночные объемы, комиссии и конверсию в PRD/copy без первичного источника.",
        "Не выдавать synthetic interviews за реальные пользовательские данные.",
      ],
      visual_evidence_needs: [
        "Скриншоты СБП/банковских сценариев оплаты и привязки счета.",
        "Публичные сценарии ЖКХ/Госуслуг/ГИС ЖКХ по оплате и статусам.",
        "Примеры BNPL и туристического чекаута с разделением платежа, возвратами и статусами.",
      ],
    } : {
      trust_requirements: ["Проверяемые доказательства ценности.", "Прозрачные ограничения и следующий шаг."],
      decision_moments: ["Понимание проблемы.", "Сравнение альтернатив.", "Выбор действия."],
      content_risks: ["Не утверждать неподтвержденные метрики.", "Не смешивать гипотезы и факты."],
      visual_evidence_needs: ["Референсы конкурентов.", "Скриншоты ключевых пользовательских сценариев.", ...inferVisualEvidenceNeeds(artifactContext)],
    },
    source_backed_facts: sourceBackedFacts,
    contradiction_review: buildContradictionReview(result, paymentDomain),
  };
}

function buildPaymentScenarios(evidenceText: string, hasSources: boolean): DomainScenario[] {
  const evidenceStatus = hasSources ? "source-backed" : "needs validation";
  const scenarios: DomainScenario[] = [
    {
      name: "ЖКХ, налоги, штрафы и регулярные услуги",
      user_goal: "Оплатить обязательство без ручного ввода реквизитов и проверить, что поставщик принял платеж.",
      friction: "Начисления разбросаны по приложениям, реквизиты и статусы расходятся.",
      product_role: "Корзина проверенных счетов, напоминания, выбор платежного маршрута и статус принятия поставщиком.",
      priority: "P0",
      evidence_status: evidenceStatus,
    },
    {
      name: "Подписки и повторные списания",
      user_goal: "Разрешить регулярный платеж и контролировать будущие списания.",
      friction: "Пользователь боится скрытых списаний, а продавец теряет платежи из-за ошибок и отказов.",
      product_role: "Центр подписок: мандаты, лимиты, пауза/отмена, умные повторы и резервный способ оплаты.",
      priority: "P0",
      evidence_status: /подпис|recurring|mandate/.test(evidenceText) ? evidenceStatus : "hypothesis",
    },
    {
      name: "Путешествия",
      user_goal: "Оплатить поездку, доплаты, страховку и возвраты в одном понятном маршруте.",
      friction: "Несколько поставщиков, предоплаты, изменения, возвраты и групповые платежи.",
      product_role: "Платежный маршрут поездки: план платежей, запросы разделения суммы, трекер возвратов и статусов.",
      priority: "P1",
      evidence_status: /travel|путешеств|билет|аэропорт/.test(evidenceText) ? evidenceStatus : "hypothesis",
    },
    {
      name: "Авто: покупка, импорт и владение",
      user_goal: "Провести цепочку платежей по авто без потери статусов, документов и сроков.",
      friction: "Дилер/брокер/таможня/страховка/сервис требуют разные платежи и подтверждения.",
      product_role: "Калькулятор, этапные платежи, хранилище чеков и проверенные запросы на оплату по этапам.",
      priority: "P1",
      evidence_status: /авто|тамож|утиль|эптс|broker/.test(evidenceText) ? evidenceStatus : "hypothesis",
    },
    {
      name: "Недвижимость",
      user_goal: "Понять платежи сделки и безопасно пройти задаток, регистрацию и последующие обязательства.",
      friction: "Крупный чек, много регулируемых участников, высокий риск ошибки и мошенничества.",
      product_role: "Payment companion: чек-лист платежей, verified requests, статусы банка/реестра/поставщиков.",
      priority: "P2",
      evidence_status: /недвиж|ипотек|эскроу|аккредитив|росреестр/.test(evidenceText) ? evidenceStatus : "hypothesis",
    },
    {
      name: "Повседневные покупки",
      user_goal: "Быстро оплатить товар выгодным способом и получить чек/возврат.",
      friction: "Сохраненные карты уже сильны; СБП/кошелек/BNPL конкурируют за кнопку оплаты.",
      product_role: "Выбор лучшего способа оплаты, loyalty/BNPL-брокер и трекер чеков/возвратов там, где есть явная выгода.",
      priority: "P1",
      evidence_status: /marketplace|повседнев|покуп/.test(evidenceText) ? evidenceStatus : "hypothesis",
    },
  ];

  return scenarios;
}

function buildGenericScenarios(result: MultiSourceResearchResult, evidenceText: string): DomainScenario[] {
  const hasSources = result.sources.length > 0;
  const requestedArtifacts = extractNamedArtifacts(evidenceText).slice(0, 3);
  const artifactDrivenScenario = requestedArtifacts[0]
    ? {
        name: `Артефакт: ${requestedArtifacts[0]}`,
        user_goal: "Получить проверяемый результат, который можно передать следующему этапу workflow.",
        friction: "Контекст часто размазан между брифом, handoff, ledger и предыдущими output-файлами.",
        product_role: "Собрать входные данные из всех артефактов run directory и сохранить traceability.",
        priority: "P0" as const,
        evidence_status: hasSources ? "source-backed" as const : "needs validation" as const,
      }
    : undefined;

  return [
    ...(artifactDrivenScenario ? [artifactDrivenScenario] : []),
    {
      name: "Первичная оценка ценности",
      user_goal: "Понять, решает ли продукт мою задачу.",
      friction: "Недостаточно доказательств, ограничений и ясного следующего шага.",
      product_role: "Показать проблему, доказательство, ограничения и CTA в одном пути.",
      priority: "P0",
      evidence_status: hasSources ? "source-backed" : "needs validation",
    },
    {
      name: "Сравнение альтернатив",
      user_goal: "Выбрать между несколькими решениями без потери времени.",
      friction: "Сложно сравнить условия, риски, стоимость и поддержку.",
      product_role: "Дать comparison frame, objection handling и proof blocks.",
      priority: "P1",
      evidence_status: /competitor|alternative|конкур/.test(evidenceText) ? "source-backed" : "hypothesis",
    },
    {
      name: "Переход к действию",
      user_goal: "Оставить заявку или начать процесс без риска.",
      friction: "Неясно, что будет после CTA.",
      product_role: "Показать onboarding path, статус и ответственность команды.",
      priority: "P0",
      evidence_status: "hypothesis",
    },
  ];
}

function buildOpportunities(scenarios: DomainScenario[]): DomainOpportunity[] {
  return scenarios.map((scenario, index) => {
    const priorityWeight = scenario.priority === "P0" ? 5 : scenario.priority === "P1" ? 3 : 1;
    return {
      initiative: initiativeForScenario(scenario),
      scenario: scenario.name,
      reach: Math.max(1, priorityWeight - Math.floor(index / 3)),
      impact: scenario.priority === "P2" ? 5 : 4,
      confidence: scenario.evidence_status === "source-backed" ? 4 : scenario.evidence_status === "hypothesis" ? 3 : 2,
      effort: scenario.priority === "P0" ? 2 : scenario.priority === "P1" ? 3 : 5,
      priority: scenario.priority,
    };
  });
}

function initiativeForScenario(scenario: DomainScenario): string {
  if (/ЖКХ|налоги|штрафы/.test(scenario.name)) return "Корзина проверенных счетов и напоминаний";
  if (/Подписки/.test(scenario.name)) return "Центр регулярных платежей и лимитов";
  if (/Путешествия/.test(scenario.name)) return "Маршрут платежей поездки и возвратов";
  if (/Авто/.test(scenario.name)) return "Трекер этапных авто-платежей";
  if (/Недвижимость/.test(scenario.name)) return "Платежный companion для сделки и владения";
  if (/Повседневные/.test(scenario.name)) return "Выбор лучшего способа оплаты";
  return `Улучшить сценарий: ${scenario.name}`;
}

function buildRoadmap(paymentDomain: boolean, artifactContext: RunArtifactContext): DomainSynthesis["roadmap"] {
  const explicitRoadmap = extractRoadmapFromArtifacts(artifactContext);
  if (explicitRoadmap.length) {
    return explicitRoadmap;
  }

  if (!paymentDomain) {
    return [
      { horizon: "0-3 месяца", focus: "Интервью, конкурентные экраны и проблемные гипотезы", outcome: "Подтвержденная problem framing." },
      { horizon: "3-6 месяцев", focus: "MVP главного действия и измерение funnel events", outcome: "Проверенный путь до целевого действия." },
      { horizon: "6-12 месяцев", focus: "Расширение сценариев и proof system", outcome: "Снижение возражений и рост повторяемости." },
    ];
  }

  return [
    { horizon: "0-3 месяца", focus: "Проверка P0 сценариев: счета, регулярные платежи, verified request-to-pay", outcome: "Подтвержденный MVP scope и список партнерских API." },
    { horizon: "3-6 месяцев", focus: "Корзина счетов, статусы поставщика, повторные поручения", outcome: "Снижение ручной сверки и забытых платежей." },
    { horizon: "6-12 месяцев", focus: "Семейные/делегированные платежи, умные повторы и резервные платежные маршруты", outcome: "Рост удержания и доли повторных платежей." },
    { horizon: "12-18 месяцев", focus: "Путешествия, авто-этапы, BNPL-брокер", outcome: "Выход в высокотревожные многосторонние сценарии." },
    { horizon: "18-24 месяца", focus: "Недвижимость и регулируемые партнерские сценарии", outcome: "Партнерский вход в крупные чеки без подмены банковских ролей." },
  ];
}

function inferTheme(paymentDomain: boolean, artifactContext: RunArtifactContext): string {
  if (paymentDomain) {
    return "Платежная оркестрация по номеру телефона";
  }

  const title = extractFirstHeading(artifactContext.combined_text);
  if (title) {
    return title.replace(/^Recursive brief:\s*/i, "").trim();
  }

  const requestedArtifacts = extractNamedArtifacts(artifactContext.combined_text);
  if (requestedArtifacts.length) {
    return `Artifact-driven research для ${requestedArtifacts.slice(0, 3).join(", ")}`;
  }

  return "Продуктовый discovery и проверка спроса";
}

function inferGenericPositioning(artifactContext: RunArtifactContext): string {
  const consolidation = extractSection(artifactContext.combined_text, "Consolidation")
    || extractSection(artifactContext.combined_text, "Цель")
    || extractSection(artifactContext.combined_text, "Goal");

  if (consolidation) {
    return firstSentence(consolidation, "Продукт как управляемый путь от боли пользователя к проверяемому действию");
  }

  return "Продукт как управляемый путь от боли пользователя к проверяемому действию";
}

function inferVisualEvidenceNeeds(artifactContext: RunArtifactContext): string[] {
  const text = artifactContext.combined_text.toLowerCase();
  const needs: string[] = [];

  if (/figma|фигм|макет|design|screens/.test(text)) {
    needs.push("Макеты, screen spec и Figma handoff из текущего run.");
  }

  if (/reference|референс|dribbble|visual/.test(text)) {
    needs.push("Скриншоты и reference-analysis для визуального сравнения.");
  }

  if (/notion|ноушен|publication/.test(text)) {
    needs.push("Публикационный export без raw workflow dump и без смешения языков.");
  }

  return needs;
}

function extractRoadmapFromArtifacts(artifactContext: RunArtifactContext): DomainSynthesis["roadmap"] {
  const roadmapSection = extractSection(artifactContext.combined_text, "12-24 month roadmap")
    || extractSection(artifactContext.combined_text, "Дорожная карта")
    || extractSection(artifactContext.combined_text, "Roadmap");

  if (!roadmapSection) {
    return [];
  }

  const rows = roadmapSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/---/.test(line))
    .slice(1, 6)
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean));

  return rows
    .filter((cells) => cells.length >= 3)
    .map((cells) => ({
      horizon: cells[0],
      focus: cells[1],
      outcome: cells[2],
    }));
}

function buildSimulatedInterviews(synthesis: DomainSynthesis): ResearchSummaryPayload["simulated_interviews"] {
  return synthesis.scenarios.slice(0, 3).map((scenario) => ({
    persona: personaNameForScenario(scenario.name),
    scenario: scenario.name,
    summary: `Проверить, понимает ли пользователь цель "${scenario.user_goal}", доверяет ли роли продукта и где возникают возражения: ${scenario.friction}`,
    evidence_status: "synthetic" as const,
    needs_validation: true,
  }));
}

function extractNamedArtifacts(text: string): string[] {
  const matches = text.match(/`?([a-z0-9-]+(?:\.[a-z0-9]+)+)`?/gi) ?? [];
  return Array.from(new Set(matches
    .map((item) => item.replace(/`/g, ""))
    .filter((item) => /\.(md|json|yaml|yml|txt)$/i.test(item))))
    .slice(0, 12);
}

function extractFirstHeading(text: string): string | undefined {
  return text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^#\s+/.test(line))
    ?.replace(/^#\s+/, "")
    .trim();
}

function extractSection(text: string, heading: string): string | undefined {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`##\\s+${escaped}\\s+([\\s\\S]*?)(?:\\n##\\s+|\\n#\\s+|$)`, "i"));
  return match?.[1]?.trim();
}

function firstSentence(text: string, fallback: string): string {
  const normalized = text
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = normalized.split(/(?<=[.!?。])\s+/)[0]?.trim();
  return sentence && sentence.length >= 24 ? sentence.slice(0, 240) : fallback;
}

function buildContradictionReview(result: MultiSourceResearchResult, paymentDomain: boolean): DomainSynthesis["contradiction_review"] {
  const providerSet = new Set(result.providersUsed);
  const coverage = providerSet.has("tavily") && providerSet.has("deepseek") && providerSet.has("gemini")
    ? "Все default providers вернули результат."
    : "Покрытие provider-ов неполное.";

  return [
    {
      topic: "Факты против synthesis",
      agreement: coverage,
      disagreement: "DeepSeek/Gemini помогают найти риски, но не являются доказательством из источников.",
      decision: "Рыночные цифры и конкурентные claims переносить downstream только с источником или `needs_validation`.",
    },
    {
      topic: paymentDomain ? "Платеж по номеру телефона как универсальный UX" : "Единое позиционирование продукта",
      agreement: "Может снижать трение в сценариях с известным получателем и повторяемым обязательством.",
      disagreement: "В товарном чекауте с сохраненными картами эффект может быть слабее.",
      decision: "Приоритет отдавать сценариям, где важны статус, доверие, повторяемость и несколько участников.",
    },
  ];
}

function buildResearchQuestions(result: MultiSourceResearchResult, synthesis: DomainSynthesis): string[] {
  return [
    `Какие сценарии лучше всего подтверждают позиционирование: ${synthesis.positioning}?`,
    "Какие пользовательские пути дают лучший баланс reach, impact, confidence и effort?",
    "Какие claims нельзя переносить в PRD/copy без дополнительной проверки?",
    `Какие элементы доказательства, статуса и доверия нужны для сценариев: ${synthesis.scenarios.slice(0, 3).map((item) => item.name).join(", ")}?`,
    `Какие источники из ${result.providersUsed.join(", ") || "нет provider-ов"} подтверждают или ограничивают выводы?`,
  ];
}

function buildAudience(synthesis: DomainSynthesis, hasSources: boolean): ResearchSummaryPayload["audience"] {
  return synthesis.scenarios.slice(0, 3).map((scenario) => ({
    segment: audienceSegmentForScenario(scenario.name),
    context: scenario.user_goal,
    motivation: "Быстро завершить сценарий с понятным статусом, ответственностью и следующим шагом.",
    barrier: scenario.friction,
    evidence_status: hasSources ? "source-backed" : "needs validation",
  }));
}

function buildJobsToBeDone(synthesis: DomainSynthesis, hasSources: boolean): ResearchSummaryPayload["jobs_to_be_done"] {
  return synthesis.scenarios.slice(0, 4).map((scenario) => ({
    segment: audienceSegmentForScenario(scenario.name),
    job: scenario.user_goal,
    trigger: triggerForScenario(scenario.name),
    pain: scenario.friction,
    desired_outcome: scenario.product_role,
    evidence_status: hasSources && scenario.evidence_status === "source-backed" ? "source-backed" : "hypothesis",
  }));
}

function buildProtoPersonas(synthesis: DomainSynthesis): ResearchSummaryPayload["proto_personas"] {
  return synthesis.scenarios.slice(0, 3).map((scenario) => ({
    name: personaNameForScenario(scenario.name),
    segment: audienceSegmentForScenario(scenario.name),
    jtbd: scenario.user_goal,
    pain: scenario.friction,
    desired_outcome: scenario.product_role,
    evidence_status: scenario.evidence_status === "source-backed" ? "proto" : "needs validation",
  }));
}

function audienceSegmentForScenario(name: string): string {
  if (/ЖКХ|налоги|штрафы|регулярные услуги/.test(name)) return "Регулярный плательщик семьи";
  if (/Подписки/.test(name)) return "Пользователь с повторными цифровыми сервисами";
  if (/Путешествия/.test(name)) return "Путешественник или организатор поездки";
  if (/Авто/.test(name)) return "Покупатель/владелец автомобиля";
  if (/Недвижимость/.test(name)) return "Покупатель или владелец недвижимости";
  if (/Повседневные/.test(name)) return "Покупатель в чекауте";
  if (/Сравнение/.test(name)) return "Покупатель, сравнивающий альтернативы";
  return "Целевой пользователь продукта";
}

function personaNameForScenario(name: string): string {
  if (/ЖКХ|налоги|штрафы|регулярные услуги/.test(name)) return "Регулярный плательщик";
  if (/Подписки/.test(name)) return "Контролирующий подписки";
  if (/Путешествия/.test(name)) return "Организатор поездки";
  if (/Авто/.test(name)) return "Авто-покупатель";
  if (/Недвижимость/.test(name)) return "Покупатель недвижимости";
  if (/Повседневные/.test(name)) return "Рациональный покупатель";
  return "Рациональный пользователь";
}

function triggerForScenario(name: string): string {
  if (/ЖКХ|налоги|штрафы/.test(name)) return "Пришло начисление, дедлайн, штраф или напоминание.";
  if (/Подписки/.test(name)) return "Нужно оформить, продлить, отменить или ограничить повторное списание.";
  if (/Путешествия/.test(name)) return "Планируется поездка, появилась доплата, возврат или групповой платеж.";
  if (/Авто/.test(name)) return "Покупка, импорт, обслуживание или обязательный платеж по автомобилю.";
  if (/Недвижимость/.test(name)) return "Сделка, регистрация, задаток или регулярные платежи после покупки.";
  return "Появилась задача, которую нужно решить без лишнего риска.";
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
    ...payload.inputs_used.slice(0, 30).map((item) => `- ${item}`),
    ...(payload.inputs_used.length > 30 ? [`- ...и еще ${payload.inputs_used.length - 30} входных файлов из run directory`] : []),
    "",
    "## Source Policy",
    "",
    "- Allowed sources: Tavily, DeepSeek, Gemini, Firecrawl/browser fallback when configured.",
    "- Denied sources: external write actions without approval.",
    "- Citation requirement: required for market and competitor claims.",
    "- External write: denied unless approval exists.",
    "",
    "## Продуктовый синтез",
    "",
    `**Тема:** ${payload.domain_synthesis.theme}`,
    "",
    `**Позиционирование:** ${payload.domain_synthesis.positioning}.`,
    "",
    "### Основные пользовательские пути",
    "",
    ...payload.domain_synthesis.primary_paths.map((item) => `- ${item}`),
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
    ...payload.research_questions.map((question) => `| ${cell(question)} | Блокирует решения PRD и copy claims | Данные провайдеров с источниками и пользовательская валидация | ${payload.status === "ready" ? "answered" : "needs validation"} |`),
    "",
    "## CJM-синтез сценариев",
    "",
    "| Сценарий | Цель пользователя | Трение | Роль продукта | Приоритет | Статус доказательств |",
    "|---|---|---|---|---|---|",
    ...payload.domain_synthesis.scenarios.map((item) => `| ${cell(item.name)} | ${cell(item.user_goal)} | ${cell(item.friction)} | ${cell(item.product_role)} | ${item.priority} | ${item.evidence_status} |`),
    "",
    "## Оценка возможностей",
    "",
    "| Инициатива | Сценарий | Reach | Impact | Confidence | Effort | RICE | Приоритет |",
    "|---|---|---:|---:|---:|---:|---:|---|",
    ...payload.domain_synthesis.opportunities.map((item) => `| ${cell(item.initiative)} | ${cell(item.scenario)} | ${item.reach} | ${item.impact} | ${item.confidence} | ${item.effort} | ${riceScore(item)} | ${item.priority} |`),
    "",
    "## Дорожная карта",
    "",
    "| Горизонт | Фокус | Результат |",
    "|---|---|---|",
    ...payload.domain_synthesis.roadmap.map((item) => `| ${cell(item.horizon)} | ${cell(item.focus)} | ${cell(item.outcome)} |`),
    "",
    "## Research-to-design handoff",
    "",
    "| Область | Сигналы |",
    "|---|---|",
    `| Требования доверия | ${cell(payload.domain_synthesis.design_handoff.trust_requirements.join("; "))} |`,
    `| Моменты решения | ${cell(payload.domain_synthesis.design_handoff.decision_moments.join("; "))} |`,
    `| Риски контента | ${cell(payload.domain_synthesis.design_handoff.content_risks.join("; "))} |`,
    `| Нужные визуальные доказательства | ${cell(payload.domain_synthesis.design_handoff.visual_evidence_needs.join("; "))} |`,
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
    "### Факты из источников",
    "",
    "| Факт | Источник | Confidence |",
    "|---|---|---|",
    ...(payload.domain_synthesis.source_backed_facts.length
      ? payload.domain_synthesis.source_backed_facts.map((item) => `| ${cell(item.fact)} | ${cell(item.source)} | ${item.confidence} |`)
      : ["| Недостаточно source-backed фактов | Нужно расширить поиск или добавить пользовательские источники | low |"]),
    "",
    "### Синтезированные выводы",
    "",
    "| Finding | Impact | Evidence | Confidence | Product implication |",
    "|---|---|---|---|---|",
    ...(payload.findings.length
      ? payload.findings.map((item) => `| ${cell(item.finding)} | Влияет на PRD, IA и copy | ${cell(item.evidence)} | ${item.confidence} | Сохранять источник или метку needs_validation |`)
      : ["| No source-backed finding returned | Research cannot be treated as ready | Provider output missing | low | Keep downstream work partial |"]),
    "",
    "## Contradiction Review",
    "",
    "| Тема | Согласие | Расхождение / риск | Решение |",
    "|---|---|---|---|",
    ...payload.domain_synthesis.contradiction_review.map((item) => `| ${cell(item.topic)} | ${cell(item.agreement)} | ${cell(item.disagreement)} | ${cell(item.decision)} |`),
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

function renderCompetitiveAnalysis(result: MultiSourceResearchResult, synthesis: DomainSynthesis): string {
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
    "| Конкурент / альтернатива | Давление на сценарий | Claim | Evidence | Confidence |",
    "|---|---|---|---|---|",
    ...(competitors.length
      ? competitors.map((item, index) => `| ${cell(item.title ?? hostname(item.url))} | ${cell(synthesis.scenarios[index % synthesis.scenarios.length]?.name ?? "Общий рынок")} | ${cell((item.content ?? item.title ?? "Competitor source found").slice(0, 220))} | ${cell(item.url)} | low |`)
      : ["| needs validation | Все сценарии | Need competitor set from Tavily or Firecrawl crawl | n/a | low |"]),
    "",
    "## Scenario Opportunity Map",
    "",
    "| Сценарий | Главное трение | Ответ продукта | Приоритет |",
    "|---|---|---|---|",
    ...synthesis.scenarios.map((item) => `| ${cell(item.name)} | ${cell(item.friction)} | ${cell(item.product_role)} | ${item.priority} |`),
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

function renderSwot(result: MultiSourceResearchResult, synthesis: DomainSynthesis): string {
  const topScenario = synthesis.scenarios[0];
  const p0Initiatives = synthesis.opportunities.filter((item) => item.priority === "P0").map((item) => item.initiative);

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
    `| Strength | ${cell(synthesis.positioning)} | Provider coverage and source-backed findings | medium | Use this as PRD/IA/design framing |`,
    `| Weakness | Сильнейший сценарий пока требует validation: ${cell(topScenario?.name ?? "primary scenario")} | Evidence status: ${topScenario?.evidence_status ?? "needs validation"} | medium | Keep claims scoped until user/partner validation |`,
    `| Opportunity | ${cell(p0Initiatives.join("; ") || "P0 opportunity requires discovery")} | Opportunity score and scenario synthesis | medium | Start roadmap from highest repeatability and trust leverage |`,
    "| Threat | Unsourced market claims can leak into PRD or copy | DeepSeek/Gemini guardrail and validation plan | high | Block success until claims are validated |",
    "",
    "## Strategic Notes",
    "",
    "- Treat Tavily as source-backed evidence provider, and DeepSeek/Gemini as contradiction, check and strategic synthesis providers.",
    `- Дизайн должен сохранить роль продукта: ${synthesis.design_handoff.trust_requirements[0] ?? "понятное доказательство и статус"}.`,
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

async function writeResearchArtifact(
  outputDir: string,
  fileName: string,
  candidate: string,
  query: string,
): Promise<ResearchArtifactWriteDecision> {
  const filePath = join(outputDir, fileName);
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const existingScore = existing ? scoreResearchArtifact(existing, query, fileName) : 0;
  const candidateScore = scoreResearchArtifact(candidate, query, fileName);
  const preserveExisting = Boolean(existing)
    && existingScore >= 70
    && candidateScore + 12 < existingScore;

  if (preserveExisting) {
    return {
      file: fileName,
      action: "preserved_existing",
      existing_score: existingScore,
      candidate_score: candidateScore,
      reason: "Существующий артефакт сильнее по доменной глубине, русскому публикационному качеству или обязательной research-структуре.",
    };
  }

  await writeFile(filePath, candidate, "utf8");

  return {
    file: fileName,
    action: "written",
    existing_score: existingScore,
    candidate_score: candidateScore,
    reason: existing ? "Новый артефакт прошел quality gate или существующий артефакт был слабее." : "Нет существующего артефакта для сохранения.",
  };
}

function scoreResearchArtifact(content: string, query: string, fileName: string): number {
  const lower = content.toLowerCase();
  const queryTerms = extractDomainTerms(query);
  const matchedQueryTerms = queryTerms.filter((term) => lower.includes(term)).length;
  const requiredSections = requiredSectionsForResearchFile(fileName);
  const matchedSections = requiredSections.filter((section) => content.includes(section)).length;
  const cyrillicChars = content.match(/[А-Яа-яЁё]/g)?.length ?? 0;
  const latinChars = content.match(/[A-Za-z]/g)?.length ?? 0;
  const cyrillicRatio = cyrillicChars / Math.max(1, cyrillicChars + latinChars);
  const genericPenalty = [
    "Потенциальный покупатель продукта из запроса",
    "Операционный или B2B-покупатель",
    "Product need from research query",
    "Claims need proof",
    "Competitor discovery incomplete",
    "No source-backed finding returned",
  ].filter((marker) => content.includes(marker)).length;
  const hasPayload = content.includes("artifact-json") || content.includes("schema_payload");
  const hasProviderCoverage = content.includes("tavily") && content.includes("deepseek") && content.includes("gemini");
  const hasValidationLanguage = lower.includes("needs validation")
    || lower.includes("требует валидации")
    || lower.includes("validation");

  let score = 0;
  score += Math.min(25, Math.round(content.length / 900));
  score += Math.min(20, matchedQueryTerms * 4);
  score += requiredSections.length ? Math.round((matchedSections / requiredSections.length) * 20) : 12;
  score += cyrillicRatio >= 0.55 ? 15 : cyrillicRatio >= 0.35 ? 8 : 0;
  score += hasPayload ? 6 : 0;
  score += hasProviderCoverage ? 8 : 0;
  score += hasValidationLanguage ? 6 : 0;
  score -= genericPenalty * 8;

  return Math.max(0, Math.min(100, score));
}

function extractDomainTerms(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, " ");
  const stopWords = new Set([
    "and",
    "the",
    "with",
    "for",
    "как",
    "что",
    "или",
    "для",
    "при",
    "это",
    "нужно",
    "исследование",
    "сценарии",
    "payment",
    "payments",
    "research",
  ]);

  return Array.from(new Set(normalized
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 4 && !stopWords.has(term))))
    .slice(0, 12);
}

function requiredSectionsForResearchFile(fileName: string): string[] {
  if (fileName === artifactFiles.research_summary) {
    return ["## Inputs Used", "## Provider Coverage", "## Research Questions", "## Findings", "## Claims To Validate", "## Sources"];
  }

  if (fileName === artifactFiles.competitive_analysis) {
    return ["## Inputs Used", "## Competitor Set", "## Comparison Matrix", "## Takeaways", "## Readiness Checklist"];
  }

  if (fileName === artifactFiles.proto_personas) {
    return ["## Inputs Used", "## Guardrail", "## Proto Personas", "## Evidence Map", "## Validation Plan"];
  }

  if (fileName === artifactFiles.synthetic_interviews) {
    return ["## Guardrail", "## Inputs Used", "## Simulated Interviews", "## Patterns To Validate"];
  }

  if (fileName === artifactFiles.swot) {
    return ["## Inputs Used", "## SWOT", "## Strategic Notes", "## Risks", "## Readiness Checklist"];
  }

  return [];
}

async function appendResearchHandoff(
  outputDir: string,
  status: ResearchSummaryPayload["status"],
  result: MultiSourceResearchResult,
  decisions: ResearchArtifactWriteDecision[],
): Promise<void> {
  const content = [
    "",
    "## Research Stage Update",
    "",
    `- Status: ${status}`,
    "- Completed artifacts: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`",
    `- Providers used: ${result.providersUsed.join(", ") || "none"}`,
    `- Validation state: ${result.validation.status}`,
    `- Гейт записи артефактов: ${decisions.map((item) => `${item.file}=${item.action}`).join(", ")}`,
    `- Next Required Artifact: \`prd.md\`${status === "partial" ? " with claims marked needs validation" : ""}`,
    "",
  ].join("\n");

  await appendFile(join(outputDir, artifactFiles.handoff_bundle), content, "utf8");
}

async function appendResearchLedger(
  outputDir: string,
  status: ResearchSummaryPayload["status"],
  result: MultiSourceResearchResult,
  decisions: ResearchArtifactWriteDecision[],
): Promise<void> {
  const content = [
    "",
    "## Research Stage Runner Record",
    "",
    `| ${new Date().toISOString()} | 01-research | ${status} | Providers used: ${result.providersUsed.join(", ") || "none"}; validation: ${result.validation.status} |`,
    "",
    "## Гейт записи research-артефактов",
    "",
    "| Файл | Действие | Оценка существующего | Оценка кандидата | Причина |",
    "|---|---|---:|---:|---|",
    ...decisions.map((item) => `| ${item.file} | ${item.action} | ${item.existing_score} | ${item.candidate_score} | ${cell(item.reason)} |`),
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

function riceScore(item: DomainOpportunity): number {
  return Number(((item.reach * item.impact * item.confidence) / Math.max(1, item.effort)).toFixed(1));
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

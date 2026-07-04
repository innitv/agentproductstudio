import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "CLAUDE.md",
  "AGENTS.md",
  ".mcp.json",
  ".claude/settings.json",
  "integrations/mcp/mcp-servers.example.json",
  "integrations/mcp/lazyweb.md",
  "integrations/mcp/notion-local-token.mcp.example.json",
  "runtime/typescript/run-landing-workflow.ts",
  "runtime/typescript/workflow.manifest.ts",
  "runtime/typescript/route.config.ts",
  "runtime/typescript/research.config.ts",
  "runtime/typescript/env.ts",
  "runtime/typescript/tavily-research.ts",
  "runtime/typescript/deepseek-research.ts",
  "runtime/typescript/gemini-research.ts",
  "runtime/typescript/multi-source-research.ts",
  "runtime/typescript/firecrawl.ts",
  "runtime/typescript/reference-scan.ts",
  "runtime/typescript/research-stage-runner.ts",
  "tooling/scripts/lint-research-content.mjs",
  "agent-pack/workflows/stage-handoff-contract.md",
  "agent-pack/workflows/claude-operating-rules.md",
  "agent-pack/templates/agent-output-contract.schema.md",
  "agent-pack/templates/surface-output-contract.template.md",
  "agent-pack/skills/figma-roundtrip/SKILL.md",
  "agent-pack/skills/figma-ds-ingest/SKILL.md",
  "integrations/mcp/figma-canvas-write-guide.md",
  "integrations/mcp/figma-design-system-mcp.md",
  "agent-pack/workflows/ds-baseline.workflow.md",
  "agent-pack/workflows/figma-ds-ingest.workflow.md",
  "design/figma/README.md",
  "design/figma/registry.json",
  "design/figma/registry.schema.json",
  "design/figma/design-system-index.schema.json",
  "design/figma/a3-design-system/ds-baseline-policy.md",
  "design/figma/a3-design-system/ds.config.json",
  "agent-pack/guardrails/guardrails.policy.md",
  "agent-pack/guardrails/approval-matrix.md",
];

const scannedFiles = [
  ".mcp.json",
  ".claude/settings.json",
  "integrations/mcp/mcp-servers.example.json",
  "integrations/mcp/notion-local-token.mcp.example.json",
  ".env.example",
];

const projectTextFilesForPackageManagerPolicy = [
  "CLAUDE.md",
  "AGENTS.md",
  "README.md",
  "archive/project-plans/PROJECT_CONNECTION_WORK_PLAN.md",
  "integrations/mcp/mcp-servers.example.json",
  ".mcp.json",
  ".claude/settings.json",
  ".gitignore",
  ".idea/workspace.xml",
  "integrations/mcp/repository-and-browser-mcp.md",
  "integrations/mcp/lazyweb.md",
  "runtime/typescript/README.md",
  "agent-pack/agent-contracts/frontend.agent.md",
];

const researchEnforcementFiles = [
  {
    file: "agent-pack/agent-contracts/research.agent.md",
    requiredSnippets: ["proto_personas", "simulated_interviews", "synthetic", "tavily", "deepseek", "gemini", "providers", "browser scan", "Required provider skipped", "lazyweb_evidence_need", "Publication Cross-Link Gate", "Research Content Lint", "Notion Data Shape Plan", "database_index_candidates"],
  },
  {
    file: "agent-pack/artifacts/research/research-summary.template.md",
    requiredSnippets: ["Proto Personas", "Synthetic Interviews", "Research Validation Plan", "skipped_with_reason", "Provider Coverage", "deepseek", "gemini", "Anti-AI-Slop Gate", "User Flow под CJM", "Scenario User Flows Handoff", "scenario-user-flows.md", "Связь возможностей с CJM", "Publication Cross-Link Gate", "Publication Editor Pass", "Research Content Lint", "Notion Data Shape Plan", "notion_data_shape_plan", "publication_editor_gate", "integrated_hybrid", "embedded_database_views"],
  },
  {
    file: "agent-pack/artifacts/research/scenario-user-flows.template.md",
    requiredSnippets: ["Индекс флоу и покрытие сценариев", "Реальные пользовательские флоу", "Сквозная карта состояний продукта", "Проверка флоу", "персона, ситуация, шаги, статус, исключение, доказательство"],
  },
  {
    file: "agent-pack/artifacts/research/proto-personas.template.md",
    requiredSnippets: ["Required", "Evidence status", "Validation Plan", "Anti-AI-Slop Gate", "CJM Link"],
  },
  {
    file: "agent-pack/artifacts/research/synthetic-interviews.template.md",
    requiredSnippets: ["Evidence status: `synthetic`", "Required", "Needs validation"],
  },
  {
    file: "agent-pack/schemas/research-summary.schema.json",
    requiredSnippets: ["proto_personas", "simulated_interviews", "\"const\": \"synthetic\"", "provider_coverage", "deepseek", "gemini"],
  },
  {
    file: "agent-pack/quality/quality-gates.md",
    requiredSnippets: ["прото-персоны", "synthetic interviews", "validation plan", "Provider Coverage", "Tavily", "DeepSeek", "Gemini", "Surface-Aware Output Gate", "Visual Evidence Grounding", "visual_reference_card", "Write -> Verify -> Fix Gate", "Anti-AI-Slop Gate", "CJM Depth Gate", "Roadmap Trace Gate", "Publication Editor Pass", "Research Content Lint", "notion_data_shape_plan", "publication_editor_gate", "integrated_hybrid", "embedded_database_views"],
  },
  {
    file: "agent-pack/agent-contracts/qa-review.agent.md",
    requiredSnippets: ["Research integrity", "proto-personas", "synthetic interviews", "synthetic-as-fact", "Surface-Aware Output Audit", "Visual Evidence Grounding Audit", "Surface Output Contract"],
  },
  {
    file: "agent-pack/workflows/artifact-driven-pipeline.md",
    requiredSnippets: ["stage-handoff-contract.md", "proto_personas", "simulated_interviews", "skipped_with_reason", "evidence_status: synthetic", "Surface Output Contract", "Anti-AI-Slop Gate", "Narrative Depth Gate", "Publication Editor Pass", "Research Content Lint", "notion_data_shape_plan", "publication_editor_gate", "integrated_hybrid", "embedded_database_views"],
  },
  {
    file: "agent-pack/workflows/stage-handoff-contract.md",
    requiredSnippets: ["Владелец", "Получает", "Создает", "scenario-user-flows.md", "Кто получает дальше", "required_inputs", "routeTools", "Notion/Figma/deploy/git write"],
  },
  {
    file: "agent-pack/workflows/deep-research.workflow.md",
    requiredSnippets: ["tavily", "deepseek", "gemini", "Multi-Source Default", "needs_validation", "scenario-user-flows.md"],
  },
  {
    file: "agent-pack/workflows/artifact-driven-pipeline.md",
    requiredSnippets: ["Notion Research Publication Gate", "Reference-Driven Visual Spec Gate", "section-by-section visual spec", "research-only human-readable", "Publication Cross-Link Gate", "Карта связей исследования", "publish-notion-research-page", "stage-gate-ledger.md", "release-notes.md"],
  },
  {
    file: "agent-pack/agent-contracts/design.agent.md",
    requiredSnippets: ["Visual Reference Rule", "Lazyweb Evidence Rule", "Universal Visual Evidence Rule", "visual_evidence_plan", "visual_reference_card", "lazyweb_evidence", "section-by-section visual spec", "frontend stage is blocked", "Surface Output Contract Pass", "Design System Strategy Gate", "design_system_mode=reuse|extend|product_specific|bespoke", "Two-Pass Figma Build", "surface_output"],
  },
  {
    file: "agent-pack/agent-contracts/frontend.agent.md",
    requiredSnippets: ["Visual Reference Rule", "Lazyweb Implementation Check", "Visual Evidence Implementation Check", "visual_evidence_plan", "visual_reference_cards", "lazyweb_evidence", "section-by-section structural mapping", "generic landing template", "Surface Output Contract Pass", "Surface Output Summary", "Design System Mode Pass", "Component Contract Pass", "figma-roundtrip", "surface_output"],
  },
  {
    file: "agent-pack/agent-contracts/notion-publisher.agent.md",
    requiredSnippets: ["research-only child page publication is mandatory", "separate Notion child page", "notion-research-export-ru.md", "Publication Cross-Link Gate", "Publication Editor Pass", "Цепочка решений", "Publication Anti-AI-Slop Gate", "Research Content Lint", "publication_editor_gate", "notion_data_shape_plan", "database_index_candidates", "integrated_hybrid", "embedded_database_views", "stage-gate-ledger.md", "release-notes.md", "Surface Output Contract", "surface_output"],
  },
  {
    file: "agent-pack/workflows/claude-operating-rules.md",
    requiredSnippets: ["публикация research в Notion обязательна", "Universal Visual Evidence Grounding", "visual_evidence_plan", "visual_reference_card", "Lazyweb Evidence Gate", "section-by-section visual spec", "шаблонный стиль", "Не заменяй требуемый источник", "Не обходи approval", "человекочитаемый research pack", "отдельную child page", "Publication Cross-Link Gate", "Publication Editor Pass", "Карта связей исследования", "Anti-AI-Slop Gate", "Research Content Lint", "notion_data_shape_plan", "integrated_hybrid", "Combined Notion Workspace Gate", "Notion research page publication record", "Surface-Aware Output Framework", "Surface Type Gate", "Write -> Verify -> Fix Gate", "Design System Strategy Gate", "Two-Pass Figma Build Gate", "Component Contract и Roundtrip Gate", "product_specific", "figma-roundtrip", "design/figma/registry.json", "selected_design_system_slug"],
  },
  {
    file: "agent-pack/guardrails/guardrails.policy.md",
    requiredSnippets: ["Не подменяй required source-backed provider", "documented failure", "Assumptions не могут заменять Findings", "Surface Output Contract", "evidence-to-output map", "Anti-AI-Slop Gate", "Тезисная выжимка не заменяет проработку"],
  },
  {
    file: "agent-pack/templates/surface-output-contract.template.md",
    requiredSnippets: ["Surface Type", "Coverage Gate", "Evidence-To-Output Map", "Visual Evidence Grounding", "Visual Reference Cards", "Surface Quality Bar", "Write -> Verify -> Fix Plan", "Public / Internal Split", "Entity Ownership Map", "Notion Data Shape Plan", "database_index", "embedded_linked_database_view", "integrated_hybrid"],
  },
  {
    file: "agent-pack/templates/agent-output-contract.schema.md",
    requiredSnippets: ["surface_output", "coverage_gate", "evidence_to_output_map", "verification"],
  },
  {
    file: "agent-pack/templates/stage-gate-ledger.template.md",
    requiredSnippets: ["Surface Output Gates", "Coverage result", "Verification evidence"],
  },
  {
    file: "agent-pack/artifacts/design/screens.template.md",
    requiredSnippets: ["Surface Output Contract", "Coverage Gate", "Evidence-To-Output Map", "Visual Evidence-To-Screen Map", "Design System Strategy", "Component Contract Matrix", "Frame / State Implementation Map"],
  },
  {
    file: "agent-pack/artifacts/design/figma-handoff-bundle.template.md",
    requiredSnippets: ["Surface Output Contract", "Evidence-To-Frame Map", "Design System Strategy", "Two-Pass Build", "Component Contract Matrix", "Code Connect / Mapping Status", "Systemization visual regression check"],
  },
  {
    file: "agent-pack/artifacts/frontend/frontend-result.template.md",
    requiredSnippets: ["Surface Output Summary", "Upstream Coverage", "Evidence-To-Implementation Map", "Visual Evidence-To-Implementation Map", "Design System Implementation", "Component Contract Implementation", "Frame / State Implementation Map", "Figma Roundtrip Deviations"],
  },
  {
    file: "agent-pack/artifacts/qa/qa-report.template.md",
    requiredSnippets: ["Surface Output Gates", "Surface Evidence Map", "Design System Strategy Audit", "Component Contract Audit", "Systemization regression check"],
  },
  {
    file: "agent-pack/skills/figma-roundtrip/SKILL.md",
    requiredSnippets: ["reuse|extend|product_specific|bespoke", "visual_calibration", "systemization", "Component Contract Matrix", "Code Connect", "frame/state → route/story/component mapping", "design/figma/registry.json", "figma-ds-ingest"],
  },
  {
    file: "agent-pack/skills/figma-ds-ingest/SKILL.md",
    requiredSnippets: ["Census First", "Chunk Manifest", "Foundation", "Deep Profiles", "design/figma/<design_system_slug>", "Node ID"],
  },
  {
    file: "integrations/mcp/figma-canvas-write-guide.md",
    requiredSnippets: ["Design System Strategy Gate", "Two-pass build", "Component Contract Matrix", "Frontend → Figma", "Figma → frontend", "Visual regression", "pseudo-REST", "Local DS index first"],
  },
  {
    file: "integrations/mcp/figma-design-system-mcp.md",
    requiredSnippets: ["design/figma/registry.json", "Large DS Ingest", "census", "manifest", "локальный индекс"],
  },
  {
    file: "agent-pack/workflows/ds-baseline.workflow.md",
    requiredSnippets: ["design_system_mode=product_specific", "Visual calibration", "Foundation extraction", "Component Contract Matrix", "Regression check"],
  },
  {
    file: "agent-pack/workflows/figma-ds-ingest.workflow.md",
    requiredSnippets: ["Census", "Chunk Manifest", "Foundation", "Component Map", "Deep Profiles", "registry.json"],
  },
  {
    file: "design/figma/README.md",
    requiredSnippets: ["registry.json", "selected_design_system_slug", "локальным индексом"],
  },
  {
    file: "design/figma/registry.json",
    requiredSnippets: ["a3-design-system", "component_contracts", "unavailable_plan"],
  },
  {
    file: "design/figma/design-system-index.schema.json",
    requiredSnippets: ["foundation", "components", "component_contracts_path"],
  },
  {
    file: "design/figma/a3-design-system/ds-baseline-policy.md",
    requiredSnippets: ["product_specific", "A3 не является обязательным foundation", "Component Contract Matrix", "visual regression"],
  },
  {
    file: "agent-pack/artifacts/release/release-notes.template.md",
    requiredSnippets: ["Surface Output Summary"],
  },
  {
    file: "agent-pack/artifacts/prd/notion-prd-export.template.md",
    requiredSnippets: ["Notion Data Shape Plan", "Publication Editor Pass", "database_index", "Idempotency key", "integrated_hybrid", "Target page for embedded view"],
  },
  {
    file: "agent-pack/guardrails/approval-matrix.md",
    requiredSnippets: ["External research API call", "Required source-backed provider unavailable"],
  },
  {
    file: "tooling/scripts/publish-notion-research-page.mjs",
    requiredSnippets: ["page-title", "createChildPage", "markdownToBlocks"],
  },
  {
    file: "tooling/scripts/generate-notion-research-export.mjs",
    requiredSnippets: ["buildCrossLinkControlSections", "Publication Editor Pass", "removeNotionInternalSections", "scenario-user-flows.md", "scenario_flows", "Карта связей исследования", "Цепочка решений"],
  },
  {
    file: "tooling/scripts/publish-notion-research-hub.mjs",
    requiredSnippets: ["validatePublicationCrossLinks", "publication_cross_link_gate", "validatePublicationEditor", "publication_editor_gate", "validatePublicationAntiSlop", "publication_anti_slop_gate", "publication_allowed", "publication_blockers", "scenario_flows", "lintResearchMarkdown", "buildNotionDataShapePlan", "notion_data_shape_plan", "database_index_candidates", "embedded_database_views", "integrated_hybrid", "schema preview", "buildHubCrossLinkBlocks", "mentionPageRich"],
  },
  {
    file: "tooling/scripts/lint-research-content.mjs",
    requiredSnippets: ["lintResearchMarkdown", "scenario-user-flows.md", "no_shallow_summary", "cjm_depth_required", "roadmap_trace_required", "generic_claim_detector", "portable_sentence_detector", "repetitive_table_rows"],
  },
  {
    file: "package.json",
    requiredSnippets: ["\"research:lint\"", "tooling/scripts/lint-research-content.mjs"],
  },
  {
    file: "integrations/mcp/lazyweb.md",
    requiredSnippets: ["Lazyweb MCP", "lazyweb_get_workflows", "lazyweb_search", "human approval", "reload/restart"],
  },
  {
    file: ".mcp.json",
    requiredSnippets: ["lazyweb", "LAZYWEB_MCP_TOKEN"],
  },
  {
    file: ".claude/settings.json",
    requiredSnippets: ["permissions", "enableAllProjectMcpServers"],
  },
  {
    file: "runtime/typescript/research.config.ts",
    requiredSnippets: ["defaultMultiSourceResearchProviders", "researchProviders.tavily", "researchProviders.deepseek", "researchProviders.gemini", "researchProviders.firecrawl"],
  },
  {
    file: "runtime/typescript/route.config.ts",
    requiredSnippets: ["standardRoutePlan", "referenceRoutePlan", "getRoutePlanForProfile", "referenceBundleArtifacts"],
  },
  {
    file: "runtime/typescript/workflow.manifest.ts",
    requiredSnippets: ["WorkflowProfile", "scenarioUserFlows", "scenario_user_flows", "routeStepToStageId", "getWorkflowStagesForProfile", "getRequiredArtifactsForStage", "profile: \"reference\""],
  },
  {
    file: "runtime/typescript/agent-metadata.ts",
    requiredSnippets: ["routeArtifactInputs", "metadata required_inputs is missing route input", "knownArtifacts.has(input)"],
  },
  {
    file: "runtime/typescript/workflow-stages.ts",
    requiredSnippets: ["WorkflowProfile", "getWorkflowStagesForProfile", "getRequiredArtifactsForStage", "workflow.manifest"],
  },
  {
    file: "runtime/typescript/validate-workflow-run.ts",
    requiredSnippets: ["--profile", "detectWorkflowProfile", "standard", "reference"],
  },
  {
    file: "runtime/typescript/multi-source-research.ts",
    requiredSnippets: ["runMultiSourceResearch", "loadLocalEnv", "runDeepSeekResearch", "runGeminiResearch", "validateMultiSourceCoverage", "needs_validation"],
  },
  {
    file: "runtime/typescript/research-stage-runner.ts",
    requiredSnippets: ["runResearchStage", "runMultiSourceResearch", "research-summary.md", "stage_gate_ledger", "validateWorkflowRun", "gemini"],
  },
  {
    file: "runtime/typescript/deepseek-research.ts",
    requiredSnippets: ["runDeepSeekResearch", "DEEPSEEK_API_KEY", "deepseek-v4-flash", "claimsToValidate"],
  },
  {
    file: "runtime/typescript/gemini-research.ts",
    requiredSnippets: ["runGeminiResearch", "GEMINI_API_KEY", "gemini-2.5-flash", "claimsToValidate"],
  },
  {
    file: "runtime/typescript/tavily-research.ts",
    requiredSnippets: ["runTavilyResearch", "TAVILY_API_KEY", "MAX_TAVILY_QUERY_LENGTH", "truncateQuery"],
  },
  {
    file: "runtime/typescript/firecrawl.ts",
    requiredSnippets: ["createFirecrawlClient", "FIRECRAWL_API_KEY", "scrapeForPlaywright", "runFirecrawlPlaywrightCode"],
  },
  {
    file: "runtime/typescript/reference-scan.ts",
    requiredSnippets: ["scanReference", "captureReferenceScreenshots", "firecrawl-markdown.md", "reference-desktop-full.png"],
  },
  {
    file: "README.md",
    requiredSnippets: ["Что сейчас является source of truth", "Surface и Anti-Slop правила", "Outputs lifecycle", "workflow.manifest.ts", "yarn workflow:sync", "yarn workflow:list", "yarn workflow:inspect", "yarn workflow:outputs", "yarn research:run", "yarn reference:scan", "--profile standard", "--profile reference", "FIRECRAWL_API_KEY", "Publication Editor Pass", "publication_editor_gate.pass=true", "Publication Completeness Gate", "Publication Shape Gate", "Publication Cross-Link Gate", "Research Content Lint", "integrated_hybrid", "entity_ownership_map", "DeepSeek/Gemini advisory", "notion:publish-research-hub"],
  },
  {
    file: "runtime/typescript/env.ts",
    requiredSnippets: ["loadLocalEnv", ".env", "process.env"],
  },
];

const secretPatterns = [
  {
    name: "OpenAI API key",
    pattern: /sk-[A-Za-z0-9_-]{20,}/g,
  },
  {
    name: "Tavily API key",
    pattern: /tvly-[A-Za-z0-9_-]{20,}/g,
  },
  {
    name: "GitHub token",
    pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  },
  {
    name: "Notion token",
    pattern: /secret_[A-Za-z0-9]{20,}/g,
  },
  {
    name: "Firecrawl API key",
    pattern: /fc-[A-Za-z0-9_-]{20,}/g,
  },
];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const file of scannedFiles) {
  const path = join(root, file);
  if (!existsSync(path)) {
    continue;
  }

  const content = readFileSync(path, "utf8");

  for (const { name, pattern } of secretPatterns) {
    const matches = content.match(pattern);
    if (matches?.length) {
      errors.push(`${file}: contains ${name}-like value (${matches.length} match).`);
    }
  }
}

const forbiddenPackageManagerNames = ["n" + "pm", "n" + "px"];
const forbiddenLockfiles = [
  "package-" + "lock.json",
  "n" + "pm-shrinkwrap.json",
  "p" + "n" + "pm-lock.yaml",
];
const forbiddenPackageManagerPattern = new RegExp(
  `\\b(${forbiddenPackageManagerNames.join("|")})\\b|package-${"lock"}`,
  "i",
);

for (const forbiddenLockfile of forbiddenLockfiles) {
  if (existsSync(join(root, forbiddenLockfile))) {
    errors.push(`Forbidden lockfile found: ${forbiddenLockfile}. This project uses yarn.lock only.`);
  }
}

for (const file of projectTextFilesForPackageManagerPolicy) {
  const path = join(root, file);
  if (!existsSync(path)) {
    continue;
  }

  const content = readFileSync(path, "utf8");
  if (forbiddenPackageManagerPattern.test(content)) {
    errors.push(`${file}: package manager policy violation. Use yarn only.`);
  }
}

for (const { file, requiredSnippets } of researchEnforcementFiles) {
  const path = join(root, file);
  if (!existsSync(path)) {
    errors.push(`Research enforcement file missing: ${file}`);
    continue;
  }

  const content = readFileSync(path, "utf8");
  for (const snippet of requiredSnippets) {
    if (!content.includes(snippet)) {
      errors.push(`${file}: missing research enforcement snippet: ${snippet}`);
    }
  }
}

const mcpConfigPath = join(root, ".mcp.json");
if (existsSync(mcpConfigPath)) {
  const config = readFileSync(mcpConfigPath, "utf8");
  if (!config.includes("https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}")) {
    errors.push(".mcp.json: Tavily MCP URL must be https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}.");
  }
}

const mcpExamplePath = join(root, "integrations/mcp/mcp-servers.example.json");
if (existsSync(mcpExamplePath)) {
  const mcpExample = readFileSync(mcpExamplePath, "utf8");
  if (!mcpExample.includes("https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}")) {
    errors.push("integrations/mcp/mcp-servers.example.json: Tavily MCP URL must use the official /mcp/ endpoint.");
  }
}

const packagePath = join(root, "package.json");
if (existsSync(packagePath)) {
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const dependencyBlocks = [
    ["dependencies", packageJson.dependencies ?? {}],
    ["devDependencies", packageJson.devDependencies ?? {}],
  ];

  for (const [blockName, dependencies] of dependencyBlocks) {
    for (const [name, version] of Object.entries(dependencies)) {
      if (version === "latest") {
        errors.push(`package.json: ${blockName}.${name} must be pinned, not latest.`);
      }
    }
  }
}

const envExamplePath = join(root, ".env.example");
if (existsSync(envExamplePath)) {
  const envExample = readFileSync(envExamplePath, "utf8");
  const requiredSnippets = [
    "TAVILY_API_KEY=",
    "DEEPSEEK_API_KEY=",
    "DEEPSEEK_RESEARCH_MODEL=deepseek-v4-flash",
  ];
  for (const snippet of requiredSnippets) {
    if (!envExample.includes(snippet)) {
      errors.push(`.env.example: missing multi-source research env snippet: ${snippet}`);
    }
  }
  if (!envExample.includes("RESEARCH_PROVIDER_ORDER=tavily")) {
    errors.push(`.env.example: missing source-backed default research env snippet: RESEARCH_PROVIDER_ORDER=tavily`);
  }

  if (!envExample.includes("Optional opt-in advisory check")) {
    errors.push(`.env.example: missing DeepSeek/Gemini opt-in advisory comment`);
  }
}

if (errors.length) {
  console.error("Config validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Config validation passed.");

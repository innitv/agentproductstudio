// Future tool wrappers.
// In OpenAI Agents SDK terms, specialists should be exposed to orchestrator
// through agent.asTool() when the orchestrator must keep final ownership.

export const toolNames = {
  createRecursiveBrief: "create_recursive_brief",
  runResearch: "run_research",
  createPrd: "create_prd",
  publishPrdToNotion: "publish_prd_to_notion",
  createDesignBrief: "create_design_brief",
  createIaBrief: "create_ia_brief",
  generateScreens: "generate_screens",
  buildPrototype: "build_prototype",
  createCopyDeck: "create_copy_deck",
  implementFrontend: "implement_frontend",
  createVisualReferenceReview: "create_visual_reference_review",
  createTestBench: "create_test_bench",
  runQaReview: "run_qa_review",
  createReleaseNotes: "create_release_notes",
} as const;

export const approvalRequiredTools = new Set<string>([
  "deploy",
  "delete_data",
  "external_send",
  "notion_write",
  "change_secrets",
  "connect_broad_mcp",
  "github_write",
  "gitlab_write",
  "figma_write",
  "browser_external_action",
]);

export const routeToolNames = [
  toolNames.createRecursiveBrief,
  toolNames.runResearch,
  toolNames.createPrd,
  toolNames.publishPrdToNotion,
  toolNames.createIaBrief,
  toolNames.createDesignBrief,
  toolNames.createCopyDeck,
  toolNames.generateScreens,
  toolNames.buildPrototype,
  toolNames.implementFrontend,
  toolNames.createVisualReferenceReview,
  toolNames.createTestBench,
  toolNames.runQaReview,
  toolNames.createReleaseNotes,
] as const;

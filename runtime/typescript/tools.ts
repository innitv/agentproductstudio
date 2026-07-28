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
  createCopyDeck: "create_copy_deck",
  implementFrontend: "implement_frontend",
  createVisualReferenceReview: "create_visual_reference_review",
  runQaReview: "run_qa_review",
  createReleaseNotes: "create_release_notes",
} as const;

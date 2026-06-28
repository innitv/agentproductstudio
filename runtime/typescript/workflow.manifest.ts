import { agentNames } from "./agents.registry";
import { defaultSourcePolicy } from "./research.config";
import { toolNames } from "./tools";

export type WorkflowProfile = "standard" | "reference";

export const artifactNames = {
  runPlan: "run_plan",
  handoffBundle: "handoff_bundle",
  stageGateLedger: "stage_gate_ledger",
  recursiveBrief: "recursive_brief",
  researchSummary: "research_summary",
  scenarioUserFlows: "scenario_user_flows",
  competitiveAnalysis: "competitive_analysis",
  protoPersonas: "proto_personas",
  syntheticInterviews: "synthetic_interviews",
  swot: "swot",
  prd: "prd",
  notionPrdExport: "notion_prd_export",
  iaBrief: "ia_brief",
  referenceAnalysis: "reference_analysis",
  styleGuide: "style_guide",
  designBrief: "design_brief",
  designGeneratorPrompt: "design_generator_prompt",
  designLoopReport: "design_loop_report",
  figmaHandoffBundle: "figma_handoff_bundle",
  figmaLayoutIr: "figma_layout_ir",
  figmaVisualQa: "figma_visual_qa",
  screens: "screens",
  copyDeck: "copy_deck",
  prototypeReport: "prototype_report",
  frontendResult: "frontend_result",
  storybookResult: "storybook_result",
  visualReferenceReview: "visual_reference_review",
  testBenchResult: "test_bench_result",
  qaReport: "qa_report",
  releaseNotes: "release_notes",
} as const;

export interface WorkflowStage {
  id: string;
  title: string;
  owner: string;
  requiredArtifacts: readonly string[];
  requiredArtifactsByProfile?: Partial<Record<WorkflowProfile, readonly string[]>>;
  requiredSectionsByArtifact: Readonly<Record<string, readonly string[]>>;
  mustUpdateHandoff: boolean;
  blocksFrontendUntilComplete?: boolean;
  profile?: WorkflowProfile;
}

export const artifactSchemas: Readonly<Record<string, string>> = {
  [artifactNames.researchSummary]: "agent-pack/schemas/research-summary.schema.json",
  [artifactNames.prd]: "agent-pack/schemas/prd.schema.json",
  [artifactNames.notionPrdExport]: "agent-pack/schemas/notion-prd-export.schema.json",
  [artifactNames.iaBrief]: "agent-pack/schemas/ia-brief.schema.json",
  [artifactNames.designBrief]: "agent-pack/schemas/design-brief.schema.json",
  [artifactNames.figmaLayoutIr]: "agent-pack/schemas/figma-layout-ir.schema.json",
  [artifactNames.figmaVisualQa]: "agent-pack/schemas/figma-visual-qa.schema.json",
  [artifactNames.screens]: "agent-pack/schemas/screens.schema.json",
  [artifactNames.copyDeck]: "agent-pack/schemas/copy-deck.schema.json",
  [artifactNames.prototypeReport]: "agent-pack/schemas/prototype-report.schema.json",
  [artifactNames.frontendResult]: "agent-pack/schemas/frontend-result.schema.json",
  [artifactNames.visualReferenceReview]: "agent-pack/schemas/visual-reference-review.schema.json",
  [artifactNames.testBenchResult]: "agent-pack/schemas/test-bench-result.schema.json",
  [artifactNames.qaReport]: "agent-pack/schemas/qa-report.schema.json",
  [artifactNames.releaseNotes]: "agent-pack/schemas/release-notes.schema.json",
};

export const artifactFiles: Readonly<Record<string, string>> = {
  [artifactNames.runPlan]: "run-plan.md",
  [artifactNames.handoffBundle]: "handoff-bundle.md",
  [artifactNames.stageGateLedger]: "stage-gate-ledger.md",
  [artifactNames.recursiveBrief]: "recursive-brief.md",
  [artifactNames.researchSummary]: "research-summary.md",
  [artifactNames.scenarioUserFlows]: "scenario-user-flows.md",
  [artifactNames.competitiveAnalysis]: "competitive-analysis.md",
  [artifactNames.protoPersonas]: "proto-personas.md",
  [artifactNames.syntheticInterviews]: "synthetic-interviews.md",
  [artifactNames.swot]: "swot.md",
  [artifactNames.prd]: "prd.md",
  [artifactNames.notionPrdExport]: "notion-prd-export.md",
  [artifactNames.iaBrief]: "ia-brief.md",
  [artifactNames.referenceAnalysis]: "reference-analysis.md",
  [artifactNames.styleGuide]: "STYLE_GUIDE.md",
  [artifactNames.designBrief]: "design-brief.md",
  [artifactNames.designGeneratorPrompt]: "design-generator-prompt.md",
  [artifactNames.designLoopReport]: "design-loop-report.md",
  [artifactNames.figmaHandoffBundle]: "figma-handoff-bundle.md",
  [artifactNames.figmaLayoutIr]: "figma-layout-ir.json",
  [artifactNames.figmaVisualQa]: "figma-visual-qa.json",
  [artifactNames.screens]: "screens.md",
  [artifactNames.copyDeck]: "copy-deck.md",
  [artifactNames.prototypeReport]: "prototype-report.md",
  [artifactNames.frontendResult]: "frontend-result.md",
  [artifactNames.storybookResult]: "storybook-result.md",
  [artifactNames.visualReferenceReview]: "visual-reference-review.md",
  [artifactNames.testBenchResult]: "test-bench-result.md",
  [artifactNames.qaReport]: "qa-report.md",
  [artifactNames.releaseNotes]: "release-notes.md",
};

export const workflowStages: readonly WorkflowStage[] = [
  {
    id: "00-intake",
    title: "Intake and Recursive Brief",
    owner: "orchestrator",
    requiredArtifacts: [
      artifactNames.runPlan,
      artifactNames.handoffBundle,
      artifactNames.stageGateLedger,
      artifactNames.recursiveBrief,
    ],
    requiredSectionsByArtifact: {
      [artifactNames.runPlan]: ["## Запрос", "## План этапов", "## Ограничения"],
      [artifactNames.handoffBundle]: ["## Goal", "## Completed Artifacts", "## Next Required Artifact"],
      [artifactNames.stageGateLedger]: ["## Run", "## Rule", "## Stage Status", "## Validation Runs"],
      [artifactNames.recursiveBrief]: ["## Expansion", "## Deepening", "## Consolidation", "## Assumptions", "## Open Questions"],
    },
    mustUpdateHandoff: true,
  },
  {
    id: "01-research",
    title: "Deep Research",
    owner: "research",
    requiredArtifacts: [
      artifactNames.researchSummary,
      artifactNames.scenarioUserFlows,
      artifactNames.competitiveAnalysis,
      artifactNames.protoPersonas,
      artifactNames.syntheticInterviews,
      artifactNames.swot,
    ],
    requiredSectionsByArtifact: {
      [artifactNames.researchSummary]: [
        "## Research Questions",
        "## Audience",
        "## Jobs To Be Done",
        "## Proto Personas",
        "## Synthetic Interviews",
        "## Research Validation Plan",
        "## Findings",
        "## Sources",
      ],
      [artifactNames.scenarioUserFlows]: [
        "## Индекс флоу и покрытие сценариев",
        "## Реальные пользовательские флоу",
        "## Сквозная карта состояний продукта",
        "## Проверка флоу",
      ],
      [artifactNames.competitiveAnalysis]: ["## Competitor Set", "## Comparison Matrix", "## Takeaways"],
      [artifactNames.protoPersonas]: ["## Proto Personas", "## Decision Context", "## Validation Plan"],
      [artifactNames.syntheticInterviews]: ["## Guardrail", "## Simulated Interviews", "## Patterns To Validate"],
      [artifactNames.swot]: ["## SWOT", "## Strategic Notes"],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "02-prd",
    title: "Product Requirements",
    owner: "prd",
    requiredArtifacts: [artifactNames.prd],
    requiredSectionsByArtifact: {
      [artifactNames.prd]: ["## Problem", "## Goals", "## Non-Goals", "## Requirements", "## MoSCoW", "## Acceptance Criteria", "## Analytics"],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "03-ia",
    title: "Information Architecture",
    owner: "ia",
    requiredArtifacts: [artifactNames.iaBrief],
    requiredSectionsByArtifact: {
      [artifactNames.iaBrief]: ["## Primary Screen", "## Primary Action", "## Sitemap", "## Primary User Flow"],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "04-design",
    title: "Design Brief",
    owner: "design",
    requiredArtifacts: [artifactNames.designBrief],
    requiredArtifactsByProfile: {
      reference: [artifactNames.referenceAnalysis, artifactNames.designBrief],
    },
    requiredSectionsByArtifact: {
      [artifactNames.referenceAnalysis]: ["## Inputs Used", "## References", "## Allowed Patterns", "## Disallowed Copying", "## Design Implications"],
      [artifactNames.designBrief]: ["## Design System Strategy", "## Visual Direction", "## Sections", "## Components", "## Responsive Notes", "## Accessibility Notes"],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "05-copy",
    title: "Copy Deck",
    owner: "copywriting",
    requiredArtifacts: [artifactNames.copyDeck],
    requiredSectionsByArtifact: {
      [artifactNames.copyDeck]: ["## Hero", "## Service Cards", "## FAQ", "## SEO", "## Claims To Validate"],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "06-screens",
    title: "Screens",
    owner: "design-generator",
    requiredArtifacts: [artifactNames.screens],
    requiredSectionsByArtifact: {
      [artifactNames.screens]: [
        "## Inputs Used",
        "## Input Readiness Pass",
        "## Design System Strategy",
        "## Design-System Grounding",
        "## Screen List",
        "## Screen Traceability",
        "## Component Inventory",
        "## Component Contract Matrix",
        "## Frame / State Implementation Map",
        "## State Inventory",
        "## Figma Readiness",
      ],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "07-prototype",
    title: "Prototype",
    owner: "prototype",
    requiredArtifacts: [artifactNames.prototypeReport],
    requiredSectionsByArtifact: {
      [artifactNames.prototypeReport]: [
        "## Input Readiness Pass",
        "## Prototype Type",
        "## Flow Goal",
        "## Start Screen",
        "## Transition Map",
        "## State Inventory",
        "## Manual Test Script",
        "## Frontend Handoff Contract",
        "## Missing Interactions",
      ],
    },
    mustUpdateHandoff: true,
    blocksFrontendUntilComplete: true,
  },
  {
    id: "08-frontend",
    title: "Frontend",
    owner: "frontend",
    requiredArtifacts: [artifactNames.frontendResult],
    requiredSectionsByArtifact: {
      [artifactNames.frontendResult]: ["## Changed Files", "## Implementation Notes", "## Design System Implementation", "## Component Contract Implementation", "## Frame / State Implementation Map", "## Commands Run", "## Known Limitations", "## Figma Roundtrip Deviations"],
    },
    mustUpdateHandoff: true,
  },
  {
    id: "09-visual-reference",
    title: "Visual Reference Review",
    owner: "qa-review",
    requiredArtifacts: [artifactNames.visualReferenceReview],
    requiredSectionsByArtifact: {
      [artifactNames.visualReferenceReview]: [
        "## Inputs Used",
        "## Source Pair Matrix",
        "## Screenshot Set",
        "## Full-Site Comparison",
        "## Gaps Found",
        "## Corrections Made",
        "## Gate Result",
      ],
    },
    mustUpdateHandoff: true,
    profile: "reference",
  },
  {
    id: "10-test-bench",
    title: "Test Bench",
    owner: "test-bench",
    requiredArtifacts: [artifactNames.testBenchResult],
    requiredSectionsByArtifact: {
      [artifactNames.testBenchResult]: ["## Main Funnel", "## Analytics Spec", "## Executable Checks", "## Result"],
    },
    mustUpdateHandoff: true,
  },
  {
    id: "11-qa",
    title: "QA Review",
    owner: "qa-review",
    requiredArtifacts: [artifactNames.qaReport],
    requiredSectionsByArtifact: {
      [artifactNames.qaReport]: [
        "## Status",
        "## QA Scope & Evidence Plan",
        "## Research Integrity",
        "## Traceability Audit",
        "## PRD Fit",
        "## Accessibility",
        "## Responsive",
        "## Negative & Edge Path Pass",
        "## Design System Strategy Audit",
        "## Component Contract Audit",
        "## Validation",
        "## Evidence Matrix",
        "## Severity Matrix",
      ],
    },
    mustUpdateHandoff: true,
  },
  {
    id: "12-release",
    title: "Release",
    owner: "release",
    requiredArtifacts: [artifactNames.releaseNotes],
    requiredSectionsByArtifact: {
      [artifactNames.releaseNotes]: [
        "## Status",
        "## Release Scope",
        "## Run Ledger Audit",
        "## Changed Files",
        "## What Changed",
        "## Validation",
        "## Release Decision Matrix",
        "## Rollback Notes",
        "## Approval And External Records",
      ],
    },
    mustUpdateHandoff: true,
  },
];

export const routeTools = {
  intake: {
    stageId: "00-intake",
    tool: toolNames.createRecursiveBrief,
    agent: agentNames.orchestrator,
    inputs: ["goal", "context", "constraints"],
    outputs: [
      artifactNames.runPlan,
      artifactNames.handoffBundle,
      artifactNames.stageGateLedger,
      artifactNames.recursiveBrief,
    ],
    dependsOn: [],
  },
  research: {
    stageId: "01-research",
    tool: toolNames.runResearch,
    agent: agentNames.research,
    inputs: ["goal", artifactNames.recursiveBrief, "constraints", "sources", "source_policy"],
    outputs: [
      artifactNames.researchSummary,
      artifactNames.scenarioUserFlows,
      artifactNames.competitiveAnalysis,
      artifactNames.protoPersonas,
      artifactNames.syntheticInterviews,
      artifactNames.swot,
    ],
    dependsOn: [artifactNames.recursiveBrief],
    sourcePolicy: defaultSourcePolicy,
  },
  prd: {
    stageId: "02-prd",
    tool: toolNames.createPrd,
    agent: agentNames.prd,
    inputs: [artifactNames.recursiveBrief, artifactNames.researchSummary, artifactNames.scenarioUserFlows, "goal", "constraints"],
    outputs: [artifactNames.prd],
    dependsOn: [artifactNames.researchSummary],
  },
  notionPrdExport: {
    stageId: undefined,
    tool: toolNames.publishPrdToNotion,
    agent: agentNames.notionPublisher,
    inputs: [artifactNames.prd, artifactNames.recursiveBrief, artifactNames.researchSummary, "notion_target", "approval_record"],
    outputs: [artifactNames.notionPrdExport],
    dependsOn: [artifactNames.prd],
    requiresApproval: true,
    fallback: "notion-ready markdown export",
  },
  ia: {
    stageId: "03-ia",
    tool: toolNames.createIaBrief,
    agent: agentNames.ia,
    inputs: [artifactNames.prd, artifactNames.researchSummary, artifactNames.scenarioUserFlows],
    outputs: [artifactNames.iaBrief],
    dependsOn: [artifactNames.prd, artifactNames.researchSummary],
  },
  design: {
    stageId: "04-design",
    tool: toolNames.createDesignBrief,
    agent: agentNames.design,
    inputs: [artifactNames.prd, artifactNames.researchSummary, artifactNames.scenarioUserFlows, artifactNames.iaBrief],
    outputs: [artifactNames.designBrief],
    referenceOutputs: [artifactNames.referenceAnalysis],
    dependsOn: [artifactNames.prd, artifactNames.iaBrief],
  },
  copywriting: {
    stageId: "05-copy",
    tool: toolNames.createCopyDeck,
    agent: agentNames.copywriting,
    inputs: [artifactNames.prd, artifactNames.designBrief, artifactNames.researchSummary, artifactNames.scenarioUserFlows],
    outputs: [artifactNames.copyDeck],
    dependsOn: [artifactNames.prd, artifactNames.designBrief],
  },
  screens: {
    stageId: "06-screens",
    tool: toolNames.generateScreens,
    agent: agentNames.designGenerator,
    inputs: [artifactNames.prd, artifactNames.iaBrief, artifactNames.designBrief, artifactNames.copyDeck],
    outputs: [artifactNames.screens],
    dependsOn: [artifactNames.prd, artifactNames.iaBrief, artifactNames.designBrief, artifactNames.copyDeck],
  },
  prototype: {
    stageId: "07-prototype",
    tool: toolNames.buildPrototype,
    agent: agentNames.prototype,
    inputs: [
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.handoffBundle,
    ],
    outputs: [artifactNames.prototypeReport],
    dependsOn: [artifactNames.prd, artifactNames.iaBrief, artifactNames.designBrief, artifactNames.screens, artifactNames.copyDeck],
  },
  frontend: {
    stageId: "08-frontend",
    tool: toolNames.implementFrontend,
    agent: agentNames.frontend,
    inputs: [
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
    ],
    outputs: [artifactNames.frontendResult],
    dependsOn: [
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
    ],
  },
  visualReferenceReview: {
    stageId: "09-visual-reference",
    tool: toolNames.createVisualReferenceReview,
    agent: agentNames.qaReview,
    inputs: [
      artifactNames.referenceAnalysis,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.frontendResult,
      "reference_url",
      "local_url",
      "screenshots",
    ],
    outputs: [artifactNames.visualReferenceReview],
    dependsOn: [
      artifactNames.referenceAnalysis,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.frontendResult,
    ],
  },
  testBench: {
    stageId: "10-test-bench",
    tool: toolNames.createTestBench,
    agent: agentNames.testBench,
    inputs: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
      artifactNames.scenarioUserFlows,
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
    ],
    outputs: [artifactNames.testBenchResult],
    dependsOn: [
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
    ],
    referenceInputs: [artifactNames.visualReferenceReview],
    referenceDependsOn: [artifactNames.visualReferenceReview],
    companionMode: {
      canStartAfter: [artifactNames.recursiveBrief],
      mustRefreshAfter: [
        artifactNames.researchSummary,
        artifactNames.scenarioUserFlows,
        artifactNames.prd,
        artifactNames.iaBrief,
        artifactNames.prototypeReport,
        artifactNames.frontendResult,
      ],
      referenceMustRefreshAfter: [artifactNames.visualReferenceReview],
    },
  },
  qaReview: {
    stageId: "11-qa",
    tool: toolNames.runQaReview,
    agent: agentNames.qaReview,
    inputs: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
      artifactNames.scenarioUserFlows,
      artifactNames.competitiveAnalysis,
      artifactNames.protoPersonas,
      artifactNames.syntheticInterviews,
      artifactNames.swot,
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
      artifactNames.stageGateLedger,
      artifactNames.handoffBundle,
    ],
    outputs: [artifactNames.qaReport],
    dependsOn: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
      artifactNames.scenarioUserFlows,
      artifactNames.competitiveAnalysis,
      artifactNames.protoPersonas,
      artifactNames.syntheticInterviews,
      artifactNames.swot,
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
      artifactNames.stageGateLedger,
      artifactNames.handoffBundle,
    ],
    referenceInputs: [artifactNames.visualReferenceReview],
    referenceDependsOn: [artifactNames.visualReferenceReview],
  },
  release: {
    stageId: "12-release",
    tool: toolNames.createReleaseNotes,
    agent: agentNames.release,
    inputs: [
      artifactNames.qaReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
      artifactNames.handoffBundle,
      artifactNames.stageGateLedger,
      "artifact_manifest",
      "run_index",
      "changed_files",
      "validation",
    ],
    outputs: [artifactNames.releaseNotes],
    dependsOn: [
      artifactNames.qaReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
      artifactNames.handoffBundle,
      artifactNames.stageGateLedger,
    ],
  },
} as const;

export type RouteStepName = keyof typeof routeTools;
export type OptionalRouteStepName = "notionPrdExport";
export type RouteProfile = WorkflowProfile;

export const standardRoutePlan = [
  "intake",
  "research",
  "prd",
  "ia",
  "design",
  "copywriting",
  "screens",
  "prototype",
  "frontend",
  "testBench",
  "qaReview",
  "release",
] as const satisfies readonly RouteStepName[];

export const referenceRoutePlan = [
  "intake",
  "research",
  "prd",
  "ia",
  "design",
  "copywriting",
  "screens",
  "prototype",
  "frontend",
  "visualReferenceReview",
  "testBench",
  "qaReview",
  "release",
] as const satisfies readonly RouteStepName[];

export const routePlan = standardRoutePlan;

export const optionalRoutePlan = ["notionPrdExport"] as const satisfies readonly OptionalRouteStepName[];

export const routeStepToStageId = Object.fromEntries(
  Object.entries(routeTools).map(([step, route]) => [step, route.stageId]),
) as Readonly<Record<RouteStepName, string | undefined>>;

export const coreBundleArtifacts = [
  artifactNames.runPlan,
  artifactNames.handoffBundle,
  artifactNames.stageGateLedger,
  artifactNames.recursiveBrief,
  artifactNames.researchSummary,
  artifactNames.scenarioUserFlows,
  artifactNames.competitiveAnalysis,
  artifactNames.protoPersonas,
  artifactNames.syntheticInterviews,
  artifactNames.swot,
  artifactNames.prd,
  artifactNames.iaBrief,
  artifactNames.designBrief,
  artifactNames.screens,
  artifactNames.copyDeck,
  artifactNames.prototypeReport,
  artifactNames.frontendResult,
  artifactNames.testBenchResult,
  artifactNames.qaReport,
  artifactNames.releaseNotes,
] as const;

export const referenceBundleArtifacts = [artifactNames.referenceAnalysis, artifactNames.visualReferenceReview] as const;

export const designEnhancementArtifacts = [
  artifactNames.styleGuide,
  artifactNames.designGeneratorPrompt,
  artifactNames.designLoopReport,
  artifactNames.figmaHandoffBundle,
  artifactNames.figmaLayoutIr,
  artifactNames.figmaVisualQa,
  artifactNames.storybookResult,
] as const;

export const optionalBundleArtifacts = [artifactNames.notionPrdExport, ...referenceBundleArtifacts, ...designEnhancementArtifacts] as const;

export const fullBundleArtifacts = [...coreBundleArtifacts, ...optionalBundleArtifacts] as const;

export const frontendPrerequisiteArtifacts = workflowStages
  .filter((stage) => stage.blocksFrontendUntilComplete)
  .flatMap((stage) => stage.requiredArtifacts);

export function getRoutePlanForProfile(profile: RouteProfile): readonly RouteStepName[] {
  return profile === "reference" ? referenceRoutePlan : standardRoutePlan;
}

export function getCoreBundleArtifactsForProfile(profile: RouteProfile): readonly string[] {
  return profile === "reference"
    ? [...coreBundleArtifacts, ...referenceBundleArtifacts]
    : coreBundleArtifacts;
}

export function getWorkflowStagesForProfile(profile: WorkflowProfile): readonly WorkflowStage[] {
  return workflowStages.filter((stage) => !stage.profile || stage.profile === profile);
}

export function getRequiredArtifactsForStage(stage: WorkflowStage, profile: WorkflowProfile): readonly string[] {
  return stage.requiredArtifactsByProfile?.[profile] ?? stage.requiredArtifacts;
}

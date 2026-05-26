import { agentNames } from "./agents.registry";
import { defaultSourcePolicy } from "./research.config";
import { toolNames } from "./tools";

export const artifactNames = {
  runPlan: "run_plan",
  handoffBundle: "handoff_bundle",
  stageGateLedger: "stage_gate_ledger",
  recursiveBrief: "recursive_brief",
  researchSummary: "research_summary",
  competitiveAnalysis: "competitive_analysis",
  protoPersonas: "proto_personas",
  syntheticInterviews: "synthetic_interviews",
  swot: "swot",
  prd: "prd",
  notionPrdExport: "notion_prd_export",
  iaBrief: "ia_brief",
  referenceAnalysis: "reference_analysis",
  designBrief: "design_brief",
  screens: "screens",
  copyDeck: "copy_deck",
  prototypeReport: "prototype_report",
  frontendResult: "frontend_result",
  visualReferenceReview: "visual_reference_review",
  testBenchResult: "test_bench_result",
  qaReport: "qa_report",
  releaseNotes: "release_notes",
} as const;

export const routeTools = {
  intake: {
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
    tool: toolNames.runResearch,
    agent: agentNames.research,
    inputs: ["goal", artifactNames.recursiveBrief, "constraints", "sources", "source_policy"],
    outputs: [
      artifactNames.researchSummary,
      artifactNames.competitiveAnalysis,
      artifactNames.protoPersonas,
      artifactNames.syntheticInterviews,
      artifactNames.swot,
    ],
    dependsOn: [artifactNames.recursiveBrief],
    sourcePolicy: defaultSourcePolicy,
  },
  prd: {
    tool: toolNames.createPrd,
    agent: agentNames.prd,
    inputs: [artifactNames.recursiveBrief, artifactNames.researchSummary, "goal", "constraints"],
    outputs: [artifactNames.prd],
    dependsOn: [artifactNames.researchSummary],
  },
  notionPrdExport: {
    tool: toolNames.publishPrdToNotion,
    agent: agentNames.notionPublisher,
    inputs: [artifactNames.prd, artifactNames.recursiveBrief, artifactNames.researchSummary, "notion_target", "approval_record"],
    outputs: [artifactNames.notionPrdExport],
    dependsOn: [artifactNames.prd],
    requiresApproval: true,
    fallback: "notion-ready markdown export",
  },
  ia: {
    tool: toolNames.createIaBrief,
    agent: agentNames.ia,
    inputs: [artifactNames.prd, artifactNames.researchSummary],
    outputs: [artifactNames.iaBrief],
    dependsOn: [artifactNames.prd, artifactNames.researchSummary],
  },
  design: {
    tool: toolNames.createDesignBrief,
    agent: agentNames.design,
    inputs: [artifactNames.prd, artifactNames.researchSummary, artifactNames.iaBrief],
    outputs: [artifactNames.designBrief],
    referenceOutputs: [artifactNames.referenceAnalysis],
    dependsOn: [artifactNames.prd, artifactNames.iaBrief],
  },
  copywriting: {
    tool: toolNames.createCopyDeck,
    agent: agentNames.copywriting,
    inputs: [artifactNames.prd, artifactNames.designBrief, artifactNames.researchSummary],
    outputs: [artifactNames.copyDeck],
    dependsOn: [artifactNames.prd, artifactNames.designBrief],
  },
  screens: {
    tool: toolNames.generateScreens,
    agent: agentNames.designGenerator,
    inputs: [artifactNames.iaBrief, artifactNames.designBrief, artifactNames.copyDeck],
    outputs: [artifactNames.screens],
    dependsOn: [artifactNames.iaBrief, artifactNames.designBrief, artifactNames.copyDeck],
  },
  prototype: {
    tool: toolNames.buildPrototype,
    agent: agentNames.prototype,
    inputs: [artifactNames.iaBrief, artifactNames.screens],
    outputs: [artifactNames.prototypeReport],
    dependsOn: [artifactNames.iaBrief, artifactNames.screens],
  },
  frontend: {
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
    tool: toolNames.createTestBench,
    agent: agentNames.testBench,
    inputs: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
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
        artifactNames.prd,
        artifactNames.iaBrief,
        artifactNames.prototypeReport,
        artifactNames.frontendResult,
      ],
      referenceMustRefreshAfter: [artifactNames.visualReferenceReview],
    },
  },
  qaReview: {
    tool: toolNames.runQaReview,
    agent: agentNames.qaReview,
    inputs: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
    ],
    outputs: [artifactNames.qaReport],
    dependsOn: [
      artifactNames.recursiveBrief,
      artifactNames.researchSummary,
      artifactNames.prd,
      artifactNames.iaBrief,
      artifactNames.designBrief,
      artifactNames.screens,
      artifactNames.copyDeck,
      artifactNames.prototypeReport,
      artifactNames.frontendResult,
      artifactNames.testBenchResult,
    ],
    referenceInputs: [artifactNames.visualReferenceReview],
    referenceDependsOn: [artifactNames.visualReferenceReview],
  },
  release: {
    tool: toolNames.createReleaseNotes,
    agent: agentNames.release,
    inputs: [artifactNames.qaReport, "changed_files", "validation"],
    outputs: [artifactNames.releaseNotes],
    dependsOn: [artifactNames.qaReport],
  },
} as const;

export type RouteStepName = keyof typeof routeTools;

export type OptionalRouteStepName = "notionPrdExport";

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

export type RouteProfile = "standard" | "reference";

export function getRoutePlanForProfile(profile: RouteProfile): readonly RouteStepName[] {
  return profile === "reference" ? referenceRoutePlan : standardRoutePlan;
}

export const optionalRoutePlan = ["notionPrdExport"] as const satisfies readonly OptionalRouteStepName[];

export const coreBundleArtifacts = [
  artifactNames.runPlan,
  artifactNames.handoffBundle,
  artifactNames.stageGateLedger,
  artifactNames.recursiveBrief,
  artifactNames.researchSummary,
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

export const optionalBundleArtifacts = [artifactNames.notionPrdExport, ...referenceBundleArtifacts] as const;

export const fullBundleArtifacts = [...coreBundleArtifacts, ...optionalBundleArtifacts] as const;

export function getCoreBundleArtifactsForProfile(profile: RouteProfile): readonly string[] {
  return profile === "reference"
    ? [...coreBundleArtifacts, ...referenceBundleArtifacts]
    : coreBundleArtifacts;
}

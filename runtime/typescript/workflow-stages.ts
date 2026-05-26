import { artifactNames } from "./route.config";

export interface WorkflowStage {
  id: string;
  title: string;
  owner: string;
  requiredArtifacts: readonly string[];
  requiredArtifactsByProfile?: Partial<Record<WorkflowProfile, readonly string[]>>;
  requiredSectionsByArtifact: Readonly<Record<string, readonly string[]>>;
  mustUpdateHandoff: boolean;
  blocksFrontendUntilComplete?: boolean;
  profile?: "standard" | "reference";
}

export type WorkflowProfile = "standard" | "reference";

export const artifactSchemas: Readonly<Record<string, string>> = {
  [artifactNames.researchSummary]: "agent-pack/schemas/research-summary.schema.json",
  [artifactNames.prd]: "agent-pack/schemas/prd.schema.json",
  [artifactNames.notionPrdExport]: "agent-pack/schemas/notion-prd-export.schema.json",
  [artifactNames.iaBrief]: "agent-pack/schemas/ia-brief.schema.json",
  [artifactNames.designBrief]: "agent-pack/schemas/design-brief.schema.json",
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
  [artifactNames.competitiveAnalysis]: "competitive-analysis.md",
  [artifactNames.protoPersonas]: "proto-personas.md",
  [artifactNames.syntheticInterviews]: "synthetic-interviews.md",
  [artifactNames.swot]: "swot.md",
  [artifactNames.prd]: "prd.md",
  [artifactNames.notionPrdExport]: "notion-prd-export.md",
  [artifactNames.iaBrief]: "ia-brief.md",
  [artifactNames.referenceAnalysis]: "reference-analysis.md",
  [artifactNames.designBrief]: "design-brief.md",
  [artifactNames.screens]: "screens.md",
  [artifactNames.copyDeck]: "copy-deck.md",
  [artifactNames.prototypeReport]: "prototype-report.md",
  [artifactNames.frontendResult]: "frontend-result.md",
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
      [artifactNames.designBrief]: ["## Visual Direction", "## Sections", "## Components", "## Responsive Notes", "## Accessibility Notes"],
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
      [artifactNames.screens]: ["## Inputs Used", "## Screen", "## Mobile"],
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
      [artifactNames.prototypeReport]: ["## Prototype Type", "## Start Screen", "## Transition Map", "## Missing Interactions"],
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
      [artifactNames.frontendResult]: ["## Changed Files", "## Implementation Notes", "## Commands Run", "## Known Limitations"],
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
      [artifactNames.qaReport]: ["## Status", "## PRD Fit", "## Accessibility", "## Responsive", "## Validation"],
    },
    mustUpdateHandoff: true,
  },
  {
    id: "12-release",
    title: "Release",
    owner: "release",
    requiredArtifacts: [artifactNames.releaseNotes],
    requiredSectionsByArtifact: {
      [artifactNames.releaseNotes]: ["## Status", "## Changed Files", "## What Changed", "## Validation", "## Rollback Notes"],
    },
    mustUpdateHandoff: true,
  },
];

export const frontendPrerequisiteArtifacts = workflowStages
  .filter((stage) => stage.blocksFrontendUntilComplete)
  .flatMap((stage) => stage.requiredArtifacts);

export function getWorkflowStagesForProfile(profile: WorkflowProfile): readonly WorkflowStage[] {
  return workflowStages.filter((stage) => !stage.profile || stage.profile === profile);
}

export function getRequiredArtifactsForStage(stage: WorkflowStage, profile: WorkflowProfile): readonly string[] {
  return stage.requiredArtifactsByProfile?.[profile] ?? stage.requiredArtifacts;
}

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const stageToArtifacts = {
  "00-intake": ["run-plan.md", "handoff-bundle.md", "stage-gate-ledger.md", "recursive-brief.md"],
  "01-research": ["research-summary.md", "competitive-analysis.md", "proto-personas.md", "synthetic-interviews.md", "swot.md"],
  "02-prd": ["prd.md"],
  "03-ia": ["ia-brief.md"],
  "04-design": ["design-brief.md"],
  "05-copy": ["copy-deck.md"],
  "06-screens": ["screens.md"],
  "07-prototype": ["prototype-report.md"],
  "08-frontend": ["frontend-result.md"],
  "09-visual-reference": ["visual-reference-review.md"],
  "10-test-bench": ["test-bench-result.md"],
  "11-qa": ["qa-report.md"],
  "12-release": ["release-notes.md"]
};

const stageTitles = {
  "00-intake": "Intake and Recursive Brief",
  "01-research": "Deep Research",
  "02-prd": "Product Requirements",
  "03-ia": "Information Architecture",
  "04-design": "Design Brief",
  "05-copy": "Copy Deck",
  "06-screens": "Screens",
  "07-prototype": "Prototype",
  "08-frontend": "Frontend",
  "09-visual-reference": "Visual Reference Review",
  "10-test-bench": "Test Bench",
  "11-qa": "QA Review",
  "12-release": "Release"
};

function main() {
  const args = process.argv.slice(2);
  const outputDirInput = args[0];

  if (!outputDirInput) {
    console.error("Usage: node tooling/scripts/sync-run-state.mjs <outputs/project-slug/YYYY-MM-DD>");
    process.exit(1);
  }

  const outputDir = resolve(process.cwd(), outputDirInput);

  if (!existsSync(outputDir)) {
    console.error(`Error: Directory does not exist: ${outputDir}`);
    process.exit(1);
  }

  console.log(`Synchronizing workflow state for: ${outputDir}`);

  // 1. Read run-plan.md or infer goal/profile
  let goal = "Продажа AI-агентов";
  let profile = "standard";

  const runPlanPath = join(outputDir, "run-plan.md");
  if (existsSync(runPlanPath)) {
    const runPlan = readFileSync(runPlanPath, "utf8");
    const goalMatch = runPlan.match(/## Запрос\s+([\s\S]*?)(?:\n## |\n# |$)/);
    if (goalMatch) goal = goalMatch[1].trim();

    const profileMatch = runPlan.match(/## Workflow Profile\s+([\s\S]*?)(?:\n## |\n# |$)/);
    if (profileMatch) {
      const p = profileMatch[1].trim().toLowerCase();
      if (p === "reference" || p === "standard") {
        profile = p;
      }
    }
  }

  console.log(`Detected Goal: "${goal}"`);
  console.log(`Detected Profile: ${profile}`);

  // 2. Prepare WorkflowRunState
  const now = new Date().toISOString();
  const stagesState = {};

  const allStages = [
    "00-intake", "01-research", "02-prd", "03-ia", "04-design", "05-copy",
    "06-screens", "07-prototype", "08-frontend", "09-visual-reference",
    "10-test-bench", "11-qa", "12-release"
  ];

  const resultsDir = join(outputDir, "stage-results");
  mkdirSync(resultsDir, { recursive: true });

  let runStatus = "completed";

  for (const stageId of allStages) {
    // Skip visual reference if profile is standard
    if (stageId === "09-visual-reference" && profile === "standard") {
      continue;
    }

    const expectedArtifacts = stageToArtifacts[stageId];
    const createdArtifacts = [];
    let isComplete = true;
    let isPartial = false;
    let isBlocked = false;

    for (const artifact of expectedArtifacts) {
      const artPath = join(outputDir, artifact);
      if (existsSync(artPath)) {
        createdArtifacts.push(artifact);
        const content = readFileSync(artPath, "utf8");
        if (/status:\s*partial|## Status\s+partial|Status \| partial/i.test(content)) {
          isPartial = true;
        }
        if (/status:\s*blocked|## Status\s+blocked|Status \| blocked/i.test(content)) {
          isBlocked = true;
        }
      } else {
        isComplete = false;
      }
    }

    let status = "pending";
    if (createdArtifacts.length > 0) {
      if (isBlocked) {
        status = "blocked";
        runStatus = "blocked";
      } else if (isPartial || !isComplete) {
        status = "partial";
        if (runStatus !== "blocked") runStatus = "partial";
      } else {
        status = "completed";
      }
    }

    stagesState[stageId] = {
      id: stageId,
      title: stageTitles[stageId],
      status: status,
      attempts: createdArtifacts.length > 0 ? 1 : 0,
      artifacts: createdArtifacts,
      updated_at: now
    };

    // Write Stage Result JSON
    if (createdArtifacts.length > 0) {
      const resultPayload = {
        stage_id: stageId,
        title: stageTitles[stageId],
        status: status,
        artifacts_created: createdArtifacts,
        inputs_used: inferInputs(outputDir, createdArtifacts[0]),
        warnings: [],
        errors: [],
        completed_at: now
      };
      writeFileSync(
        join(resultsDir, `${stageId}.json`),
        JSON.stringify(resultPayload, null, 2) + "\n",
        "utf8"
      );
    }
  }

  const runState = {
    run_id: `${basename(outputDir)}-${Date.now()}`,
    goal: goal,
    profile: profile,
    status: runStatus,
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    stages: stagesState
  };

  writeFileSync(
    join(outputDir, "run-state.json"),
    JSON.stringify(runState, null, 2) + "\n",
    "utf8"
  );

  console.log(`Successfully synchronized run-state.json and stage-results/ in ${outputDir}`);
  console.log(`Overall Run Status: ${runStatus}`);
}

function inferInputs(outputDir, artifact) {
  if (!artifact) return [];
  const filePath = join(outputDir, artifact);
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf8");
  const match = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (!match) return [];

  return [...match[1].matchAll(/`([^`]+)`|-\s+([^\n]+)/g)]
    .map((item) => item[1] ?? item[2])
    .map((item) => item.trim())
    .filter(Boolean);
}

main();

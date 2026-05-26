import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getWorkflowEngineStatus, rerunWorkflowStage, resumeWorkflowEngine, startWorkflowEngine } from "./workflow-engine";

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "start") {
    const goal = rest.join(" ").trim();
    if (!goal) {
      throw new Error('Usage: yarn workflow:start "<landing workflow goal>"');
    }

    const state = await startWorkflowEngine({ goal });
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "resume") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>");
    }

    const state = await resumeWorkflowEngine(resolve(process.cwd(), outputDir));
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "status") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>");
    }

    console.log(await getWorkflowEngineStatus(resolve(process.cwd(), outputDir)));
    return;
  }

  if (command === "run-stage") {
    const outputDir = rest[0];
    const stageId = rest[1];
    const force = rest.includes("--force");
    if (!outputDir || !stageId) {
      throw new Error("Usage: yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> <stage-id> --force");
    }

    const state = await rerunWorkflowStage(resolve(process.cwd(), outputDir), stageId, { force });
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return;
  }

  throw new Error("Usage: workflow engine command must be one of: start, resume, status, run-stage");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

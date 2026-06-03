import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { artifactFiles, artifactSchemas, getWorkflowStagesForProfile } from "./workflow-stages";
import { readRunState } from "./workflow-state";

const lateStageStartId = "08-frontend";
const maxCompressedHandoffBytes = 80_000;
const handoffBackupDirName = "handoff-backups";

/**
 * Извлекает YAML frontmatter или JSON payload из содержимого артефакта.
 */
function extractPayload(content: string): string | undefined {
  const yamlMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (yamlMatch?.[1]) {
    return yamlMatch[1].trim();
  }
  
  const jsonMatch = content.match(/```(?:artifact-json|json)\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch?.[1]) {
    return jsonMatch[1].trim();
  }

  return undefined;
}

/**
 * Выполняет интеллектуальное сжатие handoff-bundle.md для минимизации контекста (State Truncation).
 * Сохраняет полную копию в handoff-bundle-full.md.
 */
export async function truncateContextForSpecialist(outputDir: string, nextStageId: string): Promise<string> {
  const statePath = join(outputDir, "run-state.json");
  if (!existsSync(statePath)) {
    throw new Error(`Missing run-state.json in ${outputDir}`);
  }

  const state = await readRunState(outputDir);
  const handoffPath = join(outputDir, artifactFiles.handoff_bundle);
  const handoffBackupPath = join(outputDir, "handoff-bundle-full.md");
  const stageIds = getWorkflowStagesForProfile(state.profile).map((stage) => stage.id);
  const targetStageIndex = stageIds.indexOf(nextStageId);
  const lateStageStartIndex = stageIds.indexOf(lateStageStartId);
  const isLateStage = lateStageStartIndex >= 0 && targetStageIndex >= lateStageStartIndex;

  if (targetStageIndex < 0) {
    throw new Error(`Unknown workflow stage for context truncation: ${nextStageId}`);
  }

  // 1. Создаем бэкап полного handoff-bundle, если он существует
  if (existsSync(handoffPath)) {
    const currentHandoff = await readFile(handoffPath, "utf8");
    await writeFile(handoffBackupPath, currentHandoff, "utf8");
    await writeVersionedHandoffBackup(outputDir, nextStageId, currentHandoff);
  }

  console.log(`[State Truncation Gate] Compressing context for stage: ${nextStageId}`);

  // 2. Собираем базовую информацию о проекте
  const runPlanPath = join(outputDir, artifactFiles.run_plan);
  let runPlanContent = "";
  if (existsSync(runPlanPath)) {
    runPlanContent = await readFile(runPlanPath, "utf8");
  }

  // Извлекаем только ключевые цели и ограничения из run-plan
  const goalMatch = runPlanContent.match(/## Запрос[\s\S]*?(?=\n##|$)/i);
  const goalSection = goalMatch?.[0] || `## Запрос\n${state.goal}`;

  // 3. Собираем сжатые данные по каждому завершенному этапу
  const compressedSections: string[] = [];
  const payloadErrors: string[] = [];

  for (const [stageId, stageInfo] of Object.entries(state.stages)) {
    if (stageInfo.status !== "completed" && stageInfo.status !== "partial") {
      continue;
    }

    // Для каждого этапа ищем его сгенерированные файлы
    for (const artifactFile of stageInfo.artifacts) {
      const filePath = join(outputDir, artifactFile);
      if (existsSync(filePath)) {
        const fileContent = await readFile(filePath, "utf8");
        const payload = extractPayload(fileContent);

        if (!payload && requiresStructuredPayload(artifactFile)) {
          payloadErrors.push(`${stageId} ${stageInfo.title}: ${artifactFile} has no structured payload`);
          continue;
        }
        
        compressedSections.push(
          `### Stage ${stageId} - ${stageInfo.title} (Artifact: \`${artifactFile}\`)`,
          payload ? "```yaml" : "```text",
          payload ?? extractSectionFallback(fileContent),
          "```",
          ""
        );
      }
    }
  }

  if (isLateStage && payloadErrors.length) {
    throw new Error(`State Truncation Gate failed: missing structured payloads for late-stage handoff: ${payloadErrors.join("; ")}`);
  }

  // 4. Формируем сжатый handoff-bundle.md
  const truncatedHandoffContent = [
    `# Handoff Bundle (Compressed / State Truncated)`,
    `*Generated automatically at ${new Date().toISOString()} for Stage ${nextStageId}*`,
    "",
    `> [!NOTE]`,
    `> This is a minimized context representation to prevent context pollution (Memory Explosion).`,
    `> Full logs and raw texts are backed up in \`handoff-bundle-full.md\`.`,
    "",
    `## Goal`,
    "",
    state.goal,
    "",
    `## Project Metadata`,
    `- **Run ID**: \`${state.run_id}\``,
    `- **Goal**: ${state.goal}`,
    `- **Profile**: \`${state.profile}\``,
    `- **Target Stage**: \`${nextStageId}\``,
    `- **Execution Mode**: \`${state.execution_mode ?? "local"}\``,
    "",
    goalSection,
    "",
    `## Completed Artifacts (Structured Payloads Only)`,
    "",
    ...compressedSections,
    compressedSections.length ? "" : "- No completed artifact payloads were available.",
    "",
    `## Next Required Artifact`,
    "",
    `Target stage: \`${nextStageId}\`. See \`stage-gate-ledger.md\` and workflow stage contract for required outputs.`,
    "",
    `## Stage Decisions & State Gate Ledger`,
    `*See stage-gate-ledger.md for verification status.*`
  ].join("\n");

  assertCompressedHandoffQuality(truncatedHandoffContent, nextStageId);
  await writeFile(handoffPath, truncatedHandoffContent, "utf8");
  console.log(`[State Truncation Gate] Context compressed successfully. New size: ${truncatedHandoffContent.length} bytes.`);

  return truncatedHandoffContent;
}

async function writeVersionedHandoffBackup(outputDir: string, nextStageId: string, content: string): Promise<void> {
  const backupDir = join(outputDir, handoffBackupDirName);
  await mkdir(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await writeFile(join(backupDir, `${timestamp}-${nextStageId}-handoff-bundle-full.md`), content, "utf8");
}

function requiresStructuredPayload(fileName: string): boolean {
  return Object.entries(artifactFiles).some(([artifactName, artifactFile]) => artifactFile === fileName && Boolean(artifactSchemas[artifactName]));
}

function extractSectionFallback(content: string): string {
  const inputs = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/)?.[0];
  const status = content.match(/## Status\s+([\s\S]*?)(?:\n## |\n# |$)/)?.[0];
  return [status, inputs].filter(Boolean).join("\n\n") || "Structured payload unavailable; non-schema artifact summarized by filename only.";
}

function assertCompressedHandoffQuality(content: string, nextStageId: string): void {
  const requiredSections = [
    "# Handoff Bundle (Compressed / State Truncated)",
    "## Goal",
    "## Project Metadata",
    "## Completed Artifacts (Structured Payloads Only)",
    "## Next Required Artifact",
    "## Stage Decisions & State Gate Ledger",
  ];
  const missing = requiredSections.filter((section) => !content.includes(section));
  if (missing.length) {
    throw new Error(`State Truncation Gate failed: compressed handoff is missing critical sections: ${missing.join(", ")}`);
  }

  if (!content.includes(`Target stage: \`${nextStageId}\``)) {
    throw new Error(`State Truncation Gate failed: compressed handoff does not name target stage ${nextStageId}.`);
  }

  if (Buffer.byteLength(content, "utf8") > maxCompressedHandoffBytes) {
    throw new Error(`State Truncation Gate failed: compressed handoff exceeds ${maxCompressedHandoffBytes} bytes.`);
  }
}

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { artifactFiles } from "./workflow-stages";
import { readRunState } from "./workflow-state";

/**
 * Извлекает YAML frontmatter или JSON payload из содержимого артефакта.
 */
function extractPayload(content: string): string {
  const yamlMatch = content.match(/^---([\s\S]*?)---/);
  if (yamlMatch?.[1]) {
    return yamlMatch[1].trim();
  }
  
  const jsonMatch = content.match(/```json\s+([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    return jsonMatch[1].trim();
  }

  return "No structured payload found.";
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

  // 1. Создаем бэкап полного handoff-bundle, если он существует
  if (existsSync(handoffPath)) {
    const currentHandoff = await readFile(handoffPath, "utf8");
    await writeFile(handoffBackupPath, currentHandoff, "utf8");
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
        
        compressedSections.push(
          `### Stage ${stageId} - ${stageInfo.title} (Artifact: \`${artifactFile}\`)`,
          "```yaml",
          payload,
          "```",
          ""
        );
      }
    }
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
    `## Project Metadata`,
    `- **Run ID**: \`${state.run_id}\``,
    `- **Goal**: ${state.goal}`,
    `- **Profile**: \`${state.profile}\``,
    `- **Target Stage**: \`${nextStageId}\``,
    "",
    goalSection,
    "",
    `## Completed Artifacts (Structured Payloads Only)`,
    "",
    ...compressedSections,
    "",
    `## Stage Decisions & State Gate Ledger`,
    `*See stage-gate-ledger.md for verification status.*`
  ].join("\n");

  await writeFile(handoffPath, truncatedHandoffContent, "utf8");
  console.log(`[State Truncation Gate] Context compressed successfully. New size: ${truncatedHandoffContent.length} bytes.`);

  return truncatedHandoffContent;
}

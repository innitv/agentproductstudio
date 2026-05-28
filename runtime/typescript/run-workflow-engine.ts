import { resolve, join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { getWorkflowEngineStatus, rerunWorkflowStage, resumeWorkflowEngine, startWorkflowEngine } from "./workflow-engine";
import { parseUserIntent } from "./intent-parser";

/**
 * Рекурсивно находит самый последний измененный проект в папке outputs/
 */
function findMostRecentRunDir(baseDir: string = resolve(process.cwd(), "outputs")): string | null {
  if (!existsSync(baseDir)) {
    return null;
  }

  let mostRecentDir: string | null = null;
  let mostRecentMtime = 0;

  function traverse(dir: string) {
    if (existsSync(join(dir, "run-state.json"))) {
      try {
        const mtime = statSync(join(dir, "run-state.json")).mtimeMs;
        if (mtime > mostRecentMtime) {
          mostRecentMtime = mtime;
          mostRecentDir = dir;
        }
      } catch {
        // Игнорируем ошибки чтения метаданных файлов
      }
      return;
    }

    try {
      const items = readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && item.name !== "node_modules" && item.name !== ".git") {
          traverse(join(dir, item.name));
        }
      }
    } catch {
      // Игнорируем ошибки чтения директорий
    }
  }

  traverse(baseDir);
  return mostRecentDir;
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0];
  const rest = rawArgs.slice(1);

  const fullInput = rawArgs.join(" ").trim();

  // 1. Попробуем определить намерение (intent) из ввода пользователя
  let intent = null;
  if (["start", "resume", "status", "run-stage"].includes(command)) {
    const restText = rest.join(" ").trim();
    if (restText) {
      // Если передана команда с аргументами, парсим аргументы (например, start "сделай ресерч")
      intent = parseUserIntent(restText);
    }
  } else if (fullInput) {
    // Если передан просто текст триггера (например, yarn workflow:start "поехали дальше")
    intent = parseUserIntent(fullInput);
  }

  // 2. Если найдено высокоуверенное намерение, отличное от создания проекта с произвольным текстом,
  // переопределяем команду выполнения.
  if (intent && intent.confidence !== "low") {
    const recentDir = findMostRecentRunDir();

    if (intent.command === "resume" && recentDir) {
      console.log(`[Intent Parser] Распознано намерение: Продолжить последний проект (${recentDir})`);
      const state = await resumeWorkflowEngine(recentDir);
      console.log(await getWorkflowEngineStatus(state.output_dir));
      return;
    }

    if (intent.command === "status" && recentDir) {
      console.log(`[Intent Parser] Распознано намерение: Показать статус последнего проекта (${recentDir})`);
      console.log(await getWorkflowEngineStatus(recentDir));
      return;
    }

    if (intent.command === "run-stage" && intent.stageId && recentDir) {
      console.log(`[Intent Parser] Распознано намерение: Запустить этап "${intent.stageId}" для проекта (${recentDir})`);
      const state = await rerunWorkflowStage(recentDir, intent.stageId, { force: true });
      console.log(await getWorkflowEngineStatus(state.output_dir));
      return;
    }
  }

  // 3. Стандартное CLI-поведение по умолчанию
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

  throw new Error("Usage: workflow engine command must be one of: start, resume, status, run-stage\nOr use a natural trigger phrase!");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}

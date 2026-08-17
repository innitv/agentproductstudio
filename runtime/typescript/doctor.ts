import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { detectGlobalSkillConflicts } from "./skill-metadata";
import { collectStudioHygieneFindings, detectAbandonedWorktrees } from "./studio-hygiene";

interface DiagnosticResult {
  check: string;
  passed: boolean;
  level: "pass" | "warning" | "error";
  message: string;
  canRepair: boolean;
}

const REQUIRED_DIRS = [
  "agent-pack/agent-contracts",
  "agent-pack/templates",
  ".claude/skills",
  "agent-pack/schemas",
  "runtime/typescript",
  "outputs"
];

const REQUIRED_TEMPLATES = [
  "agent-pack/templates/skill.template.md",
  // Шаблон плана запуска: держит формат ответов на вопросы intake и утверждённого плана
  // работ, из которого выводится масштаб. Валидатор требует раздел «Ответы на вопросы
  // intake» в `run-plan.md`, поэтому пропажа шаблона ломала бы каждый новый запуск молча.
  "agent-pack/templates/run-plan.template.md",
  "agent-pack/artifacts/brief/recursive-brief.template.md",
  "agent-pack/artifacts/prd/prd.template.md"
];

async function runDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // 1. Проверка директорий
  for (const dir of REQUIRED_DIRS) {
    const dirPath = join(process.cwd(), dir);
    const exists = existsSync(dirPath);
    results.push({
      check: `Директория: ${dir}`,
      passed: exists,
      level: exists ? "pass" : "error",
      message: exists ? "Присутствует на диске." : "Директория отсутствует!",
      canRepair: false
    });
  }

  // 2. Проверка .env и .env.example
  const envPath = join(process.cwd(), ".env");
  const envExamplePath = join(process.cwd(), ".env.example");

  if (!existsSync(envPath)) {
    results.push({
      check: "Файл конфигурации окружения (.env)",
      passed: false,
      level: "error",
      message: ".env файл не найден в корне проекта!",
      canRepair: true
    });
  } else {
    try {
      const envContent = await readFile(envPath, "utf8");
      const envExampleContent = await readFile(envExamplePath, "utf8");
      
      const missingKeys: string[] = [];
      const exampleKeys = envExampleContent.match(/^[A-Z0-9_]+/gm) || [];
      
      for (const key of exampleKeys) {
        if (!envContent.includes(key)) {
          missingKeys.push(key);
        }
      }

      results.push({
        check: "Optional provider keys в .env",
        passed: true,
        level: missingKeys.length === 0 ? "pass" : "warning",
        message: missingKeys.length === 0 
          ? "Все optional provider keys из примера присутствуют." 
          : `В .env отсутствуют optional keys из примера: ${missingKeys.join(", ")}. Это блокирует только соответствующие optional provider actions, но не работу через Claude Code/IDE и не local workflow.`,
        canRepair: false
      });
    } catch (e) {
      results.push({
        check: "Ключи в .env",
        passed: false,
        level: "error",
        message: "Ошибка при чтении или парсинге файлов .env.",
        canRepair: false
      });
    }
  }

  // 3. Проверка обязательных шаблонов
  for (const template of REQUIRED_TEMPLATES) {
    const path = join(process.cwd(), template);
    const exists = existsSync(path);
    results.push({
      check: `Шаблон: ${template}`,
      passed: exists,
      level: exists ? "pass" : "error",
      message: exists ? "Шаблон присутствует." : "Файл шаблона не найден!",
      canRepair: true
    });
  }

  // 3a. Конфликт имён с глобальными навыками `~/.claude/skills/<id>`
  //
  // Глобальная копия выигрывает коллизию имён, и роутер видит ЕЁ описание — проектная
  // версия не доезжает никогда. Проверка живёт в doctor, а не в `qa:quick`: домашний
  // каталог принадлежит конкретному человеку, в CI и у другого разработчика его нет.
  // Поэтому только предупреждение, никогда не ошибка (сам детектор покрыт тестом
  // `workflow:test-skill-metadata` на подставном домашнем каталоге).
  const globalSkillConflicts = detectGlobalSkillConflicts();
  results.push({
    check: "Глобальные копии навыков (~/.claude/skills)",
    passed: true,
    level: globalSkillConflicts.length === 0 ? "pass" : "warning",
    message:
      globalSkillConflicts.length === 0
        ? "Копий проектных навыков в домашнем каталоге нет (симлинки конфликтом не считаются)."
        : `Глобальные каталоги перебивают проектные навыки: ${globalSkillConflicts
            .map((conflict) => `${conflict.id} (${conflict.globalPath})`)
            .join(", ")}. Роутер выбирает навык по описанию глобальной копии, проектная версия не применяется. ` +
          "Удали каталог или замени его симлинком на этот репозиторий.",
    canRepair: false,
  });

  // 3b. Брошенные worktree агентов в `.claude/worktrees/`
  //
  // Каждая копия удваивает выдачу любого грепа и `Glob` по репозиторию — система начинает
  // проверять себя по удвоенной реальности. Как и проверка выше, только предупреждение:
  // worktree живой параллельной сессии удалять нельзя, а брошенной считается лишь та, где
  // нечего терять (чистое дерево, HEAD влит в main).
  const abandonedWorktrees = detectAbandonedWorktrees();
  results.push({
    check: "Брошенные worktree агентов (.claude/worktrees)",
    passed: true,
    level: abandonedWorktrees.length === 0 ? "pass" : "warning",
    message:
      abandonedWorktrees.length === 0
        ? "Брошенных worktree нет (живые worktree параллельных сессий не считаются)."
        : `Найдены worktree без незавершённой работы: ${abandonedWorktrees
            .map((worktree) => `${worktree.path} (HEAD ${worktree.head.slice(0, 7)}, влит в main)`)
            .join(", ")}. Каждая копия удваивает выдачу грепа и Glob по репозиторию. ` +
          "Удалить: git worktree remove <путь> && git worktree prune.",
    canRepair: false,
  });

  // 3c. Гигиена студии: размер индекса, указатели плагинов, инварианты темы, покрытие тестов
  //
  // 🔴 Заведено 2026-08-17 по аудиту. До этого `doctor` брал из `studio-hygiene` ровно одну
  // функцию — `detectAbandonedWorktrees`, — а остальные четыре проверки вызывались ТОЛЬКО из
  // `test-studio-hygiene.ts`. Тот, кто следовал §3 «перед запуском workflow запускай doctor»,
  // не узнавал, что `CLAUDE.md` в двухсот символах от провала порога: аудит застал его с
  // запасом 231 символ из 35 000.
  //
  // Уровень `warning`, а не `error`: doctor проверяет готовность СРЕДЫ к прогону, и превышение
  // порога индекса прогон не ломает. Ошибкой это делает агрегатор тестов, где оно и должно
  // валить сборку.
  const hygieneFindings = collectStudioHygieneFindings();
  results.push({
    check: "Гигиена студии (индекс, указатели плагинов, тема, покрытие тестов)",
    passed: true,
    level: hygieneFindings.length === 0 ? "pass" : "warning",
    message:
      hygieneFindings.length === 0
        ? "Порог размера CLAUDE.md, указатели плагинов в обёртках, инварианты темы и покрытие агрегатора тестов — в норме."
        : `${hygieneFindings.length} замечание(й): ${hygieneFindings.join(" | ")}`,
    canRepair: false,
  });

  // 4. Проверка конфига MCP
  const mcpExamplePath = join(process.cwd(), "integrations/mcp/mcp-servers.example.json");
  const mcpExists = existsSync(mcpExamplePath);
  results.push({
    check: "MCP примеры конфигурации",
    passed: mcpExists,
    level: mcpExists ? "pass" : "error",
    message: mcpExists ? "Файл mcp-servers.example.json присутствует." : "Файл примера MCP-конфига не найден!",
    canRepair: false
  });

  return results;
}

async function repair(results: DiagnosticResult[]) {
  console.log("\n[doctor] Запускаем автоматическое исправление (Repair)...");
  
  for (const result of results) {
    if (!result.passed && result.canRepair) {
      if (result.check === "Файл конфигурации окружения (.env)") {
        const envPath = join(process.cwd(), ".env");
        const envExamplePath = join(process.cwd(), ".env.example");
        if (existsSync(envExamplePath)) {
          const exampleContent = await readFile(envExamplePath, "utf8");
          await writeFile(envPath, exampleContent, "utf8");
          console.log(`[doctor:repair] Создан базовый .env на основе .env.example.`);
        }
      }

      if (result.check.startsWith("Шаблон: ")) {
        const templatePath = result.check.replace("Шаблон: ", "");
        const absolutePath = join(process.cwd(), templatePath);
        // Запишем пустой скелет шаблона, если он удален
        await writeFile(absolutePath, `---\nstatus: ready\n---\n# Восстановленный шаблон\n`, "utf8");
        console.log(`[doctor:repair] Восстановлен пустой шаблон: ${templatePath}`);
      }
    }
  }
}

async function main() {
  console.log("=== ЗАПУСК ДИАГНОСТИКИ PRODUCT AGENT STUDIO ===");
  const args = process.argv.slice(2);
  const shouldRepair = args.includes("--repair");

  const results = await runDiagnostics();
  let allPassed = true;

  for (const result of results) {
    const symbol = result.level === "pass" ? "✔" : result.level === "warning" ? "!" : "✖";
    const statusText = result.level === "pass" ? "ПРОЙДЕНО" : result.level === "warning" ? "ПРЕДУПРЕЖДЕНИЕ" : "ОШИБКА";
    console.log(`[${statusText}] ${symbol} ${result.check}: ${result.message}`);
    if (result.level === "error") {
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.log("\n[doctor] Обнаружены проблемы в конфигурации или целостности файлов.");
    if (shouldRepair) {
      await repair(results);
      console.log("[doctor] Повторите запуск без флага --repair для проверки.");
    } else {
      console.log("[doctor] Запустите 'yarn workflow:doctor --repair' для автоматического исправления ошибок.");
    }
  } else {
    console.log("\n[doctor] Диагностика пройдена успешно! Система полностью готова к работе.");
  }
}

main().catch((err) => {
  console.error("Ошибка при работе утилиты doctor:", err);
  process.exitCode = 1;
});

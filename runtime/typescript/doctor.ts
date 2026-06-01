import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface DiagnosticResult {
  check: string;
  passed: boolean;
  message: string;
  canRepair: boolean;
}

const REQUIRED_DIRS = [
  "agent-pack/agents",
  "agent-pack/templates",
  "agent-pack/skills",
  "agent-pack/schemas",
  "runtime/typescript",
  "outputs"
];

const REQUIRED_TEMPLATES = [
  "agent-pack/templates/skill.template.md",
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
        check: "Ключи в .env",
        passed: missingKeys.length === 0,
        message: missingKeys.length === 0 
          ? "Все необходимые переменные окружения присутствуют." 
          : `В .env отсутствуют ключи из примера: ${missingKeys.join(", ")}`,
        canRepair: false
      });
    } catch (e) {
      results.push({
        check: "Ключи в .env",
        passed: false,
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
      message: exists ? "Шаблон присутствует." : "Файл шаблона не найден!",
      canRepair: true
    });
  }

  // 4. Проверка конфига MCP
  const mcpExamplePath = join(process.cwd(), "integrations/mcp/mcp-servers.example.json");
  const mcpExists = existsSync(mcpExamplePath);
  results.push({
    check: "MCP примеры конфигурации",
    passed: mcpExists,
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
    const symbol = result.passed ? "✔" : "✖";
    const statusText = result.passed ? "ПРОЙДЕНО" : "ОШИБКА";
    console.log(`[${statusText}] ${symbol} ${result.check}: ${result.message}`);
    if (!result.passed) {
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

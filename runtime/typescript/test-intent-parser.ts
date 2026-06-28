import { parseUserIntent } from "./intent-parser";

interface TestCase {
  input: string;
  expectedCommand: string;
  expectedStageId?: string;
  expectedConfidence?: string;
}

const testCases: TestCase[] = [
  // Глобальные команды
  { input: "начать воркфлоу для нового проекта", expectedCommand: "start" },
  { input: "start landing page builder", expectedCommand: "start" },
  { input: "продолжить запуск проекта", expectedCommand: "resume" },
  { input: "поехали дальше", expectedCommand: "resume" },
  { input: "покажи статус выполнения", expectedCommand: "status" },
  { input: "что готово?", expectedCommand: "status" },

  // Локальные стадии (высокая уверенность)
  { input: "сделай ресерч", expectedCommand: "run-stage", expectedStageId: "01-research" },
  { input: "проведи исследование рынка", expectedCommand: "run-stage", expectedStageId: "01-research" },
  { input: "напиши prd пожалуйста", expectedCommand: "run-stage", expectedStageId: "02-prd" },
  { input: "сформируй требования для проекта", expectedCommand: "run-stage", expectedStageId: "02-prd" },
  { input: "сделай sitemap", expectedCommand: "run-stage", expectedStageId: "03-ia" },
  { input: "нарисуй user flow", expectedCommand: "run-stage", expectedStageId: "03-ia" },
  { input: "подготовь дизайн-бриф", expectedCommand: "run-stage", expectedStageId: "04-design" },
  { input: "проанализируй референс", expectedCommand: "run-stage", expectedStageId: "04-design" },
  { input: "собери макеты use cases как мобильное приложение", expectedCommand: "run-stage", expectedStageId: "04-design" },
  { input: "собери flow в Figma по текущей дизайн-системе", expectedCommand: "run-stage", expectedStageId: "04-design" },
  { input: "mobile app screens for onboarding flow", expectedCommand: "run-stage", expectedStageId: "04-design" },
  { input: "напиши тексты для кнопок", expectedCommand: "run-stage", expectedStageId: "05-copy" },
  { input: "сделай copy deck", expectedCommand: "run-stage", expectedStageId: "05-copy" },
  { input: "создай экраны", expectedCommand: "run-stage", expectedStageId: "06-screens" },
  { input: "сгенерируй спецификацию экранов", expectedCommand: "run-stage", expectedStageId: "06-screens" },
  { input: "сделай transition map", expectedCommand: "run-stage", expectedStageId: "07-prototype" },
  { input: "создай прототип", expectedCommand: "run-stage", expectedStageId: "07-prototype" },
  { input: "напиши код интерфейса", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
  { input: "реализуй фронтенд", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
  { input: "обнови мой сайт портфолио", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
  { input: "поправь /portfolio", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
  { input: "siteportfolio поменяй первый экран", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
  { input: "запусти visual diff", expectedCommand: "run-stage", expectedStageId: "09-visual-reference" },
  { input: "сравни с референсом", expectedCommand: "run-stage", expectedStageId: "09-visual-reference" },
  { input: "запусти тест-бенч", expectedCommand: "run-stage", expectedStageId: "10-test-bench" },
  { input: "протестируй воронку", expectedCommand: "run-stage", expectedStageId: "10-test-bench" },
  { input: "проверь качество", expectedCommand: "run-stage", expectedStageId: "11-qa" },
  { input: "запусти qa", expectedCommand: "run-stage", expectedStageId: "11-qa" },
  { input: "выкатывай релиз", expectedCommand: "run-stage", expectedStageId: "12-release" },
  { input: "сделай релиз-ноутс", expectedCommand: "run-stage", expectedStageId: "12-release" },

  // Нечеткий поиск (средняя уверенность)
  { input: "нужен какой-то ресерч", expectedCommand: "run-stage", expectedStageId: "01-research" },
  { input: "давай посмотрим требования", expectedCommand: "run-stage", expectedStageId: "02-prd" },
  { input: "обнови верстку", expectedCommand: "run-stage", expectedStageId: "08-frontend" },
];

function runTests() {
  console.log("=== Запуск тестов Intent Parser ===");
  let passed = 0;
  let failed = 0;

  for (const { input, expectedCommand, expectedStageId } of testCases) {
    const result = parseUserIntent(input);
    if (!result) {
      console.error(`FAIL: "${input}" => Ничего не распознано (ожидалось: ${expectedCommand})`);
      failed++;
      continue;
    }

    const commandMatch = result.command === expectedCommand;
    const stageMatch = expectedStageId ? result.stageId === expectedStageId : true;

    if (commandMatch && stageMatch) {
      console.log(`PASS: "${input}" => ${result.command}${result.stageId ? ` (${result.stageId})` : ""}`);
      passed++;
    } else {
      console.error(
        `FAIL: "${input}" => Получено: ${result.command}${result.stageId ? ` (${result.stageId})` : ""}, Ожидалось: ${expectedCommand}${
          expectedStageId ? ` (${expectedStageId})` : ""
        }`
      );
      failed++;
    }
  }

  console.log("\n=== Итоги тестирования ===");
  console.log(`Всего тестов: ${testCases.length}`);
  console.log(`Успешно: ${passed}`);
  console.log(`Ошибок: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

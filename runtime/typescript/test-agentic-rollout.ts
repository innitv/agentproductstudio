import { formatAgenticRolloutStatus, getAgenticRolloutConfig } from "./agentic-rollout";

interface TestCase {
  name: string;
  envValue: string | undefined;
  expectedEnabled: string[];
  expectedInvalid: string[];
  expectedSource: "default" | "env";
}

const originalEnvValue = process.env.AGENTIC_ENABLED_STAGES;

const testCases: TestCase[] = [
  {
    name: "default rollout",
    envValue: undefined,
    expectedEnabled: ["02-prd", "03-ia"],
    expectedInvalid: [],
    expectedSource: "default",
  },
  {
    name: "valid env override",
    envValue: "02-prd,03-ia,04-design",
    expectedEnabled: ["02-prd", "03-ia", "04-design"],
    expectedInvalid: [],
    expectedSource: "env",
  },
  {
    name: "invalid env entries are ignored",
    envValue: "02-prd,99-missing,03-ia,nope",
    expectedEnabled: ["02-prd", "03-ia"],
    expectedInvalid: ["99-missing", "nope"],
    expectedSource: "env",
  },
  {
    name: "empty env falls back to default",
    envValue: "   ",
    expectedEnabled: ["02-prd", "03-ia"],
    expectedInvalid: [],
    expectedSource: "default",
  },
];

function runTests(): void {
  console.log("=== Запуск тестов agentic rollout ===");
  let passed = 0;
  let failed = 0;

  try {
    for (const testCase of testCases) {
      applyEnv(testCase.envValue);
      const result = getAgenticRolloutConfig();

      const enabledMatch = sameItems(result.enabledStageIds, testCase.expectedEnabled);
      const invalidMatch = sameItems(result.invalidStageIds, testCase.expectedInvalid);
      const sourceMatch = result.source === testCase.expectedSource;

      if (enabledMatch && invalidMatch && sourceMatch) {
        console.log(`PASS: ${testCase.name}`);
        passed++;
      } else {
        console.error(`FAIL: ${testCase.name}`);
        console.error(`  enabled: expected ${testCase.expectedEnabled.join(", ")}; got ${result.enabledStageIds.join(", ")}`);
        console.error(`  invalid: expected ${testCase.expectedInvalid.join(", ")}; got ${result.invalidStageIds.join(", ")}`);
        console.error(`  source: expected ${testCase.expectedSource}; got ${result.source}`);
        failed++;
      }
    }

    applyEnv("02-prd,missing-stage");
    const formatted = formatAgenticRolloutStatus();
    if (formatted.includes("Enabled agentic stages: 02-prd") && formatted.includes("Ignored invalid stage ids: missing-stage")) {
      console.log("PASS: formatted rollout status includes invalid entries");
      passed++;
    } else {
      console.error("FAIL: formatted rollout status includes invalid entries");
      console.error(formatted);
      failed++;
    }
  } finally {
    applyEnv(originalEnvValue);
  }

  console.log("\n=== Итоги тестирования ===");
  console.log(`Всего проверок: ${passed + failed}`);
  console.log(`Успешно: ${passed}`);
  console.log(`Ошибок: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

function applyEnv(value: string | undefined): void {
  if (typeof value === "undefined") {
    delete process.env.AGENTIC_ENABLED_STAGES;
  } else {
    process.env.AGENTIC_ENABLED_STAGES = value;
  }
}

function sameItems(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && expected.every((item, index) => actual[index] === item);
}

runTests();


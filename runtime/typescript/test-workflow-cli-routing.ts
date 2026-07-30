/**
 * Регрессия маршрутизации workflow CLI.
 *
 * Инцидент 2026-07-30: `yarn workflow:start "Редизайн мобильных экранов A3Pay в стиле Ozon
 * Банка" --scale increment` не создал новый прогон. Текст цели содержал слово «дизайн»,
 * эвристика intent-парсера превратила команду в `run-stage 04-design`, и стадия отработала
 * в самом свежем ЧУЖОМ run-каталоге, перезаписав там `design-brief.md` и весь run ledger.
 * `outputs/` в `.gitignore`, восстановить было нечем.
 *
 * Тест закрывает два правила:
 * 1. Явная команда имеет безусловный приоритет над эвристикой; текст после `start` — цель.
 * 2. Каталог, выведенный эвристикой, требует подтверждения или явного `--run-dir`.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseUserIntent } from "./intent-parser";
import { planCliRoute, runWorkflowCli, type WorkflowCliEngine } from "./workflow-cli";
import type { WorkflowRunState } from "./workflow-state";

const incidentGoal = "Редизайн мобильных экранов A3Pay в стиле Ozon Банка";

interface EngineCalls {
  start: Array<{ goal: string; scale?: string; profile?: string; executionMode?: string }>;
  resume: string[];
  rerun: Array<{ outputDir: string; stageId: string; force?: boolean }>;
  status: string[];
}

function createFakeEngine(): { engine: WorkflowCliEngine; calls: EngineCalls } {
  const calls: EngineCalls = { start: [], resume: [], rerun: [], status: [] };
  const state = (outputDir: string) => ({ output_dir: outputDir }) as WorkflowRunState;

  const engine: WorkflowCliEngine = {
    async startWorkflowEngine(options) {
      calls.start.push({
        goal: options.goal,
        scale: options.scale,
        profile: options.profile,
        executionMode: options.executionMode,
      });
      return state(join("outputs", "fake-start", "2026-07-30"));
    },
    async resumeWorkflowEngine(outputDir) {
      calls.resume.push(outputDir);
      return state(outputDir);
    },
    async rerunWorkflowStage(outputDir, stageId, options) {
      calls.rerun.push({ outputDir, stageId, force: options?.force });
      return state(outputDir);
    },
    async getWorkflowEngineStatus(outputDir) {
      calls.status.push(outputDir);
      return `status stub for ${outputDir}`;
    },
  };

  return { engine, calls };
}

/** Песочница с посторонним прогоном: он не назван человеком и трогать его нельзя. */
function createSandbox(): { root: string; foreignRunDir: string; snapshot: Map<string, { content: string; mtimeMs: number }> } {
  const root = mkdtempSync(join(tmpdir(), "workflow-cli-routing-"));
  const foreignRunDir = join(root, "outputs", "contractor-payment-demo", "2026-07-23");
  mkdirSync(foreignRunDir, { recursive: true });

  const files: Record<string, string> = {
    "run-state.json": JSON.stringify({ run_id: "foreign-run", goal: "Чужая цель", stages: {} }),
    "design-brief.md": "# Design Brief\n\nБоевой контент постороннего прогона.\n",
    "stage-gate-ledger.md": "# Stage Gate Ledger\n\n04-design: completed\n",
  };

  const snapshot = new Map<string, { content: string; mtimeMs: number }>();
  for (const [file, content] of Object.entries(files)) {
    const path = join(foreignRunDir, file);
    writeFileSync(path, content, "utf8");
    snapshot.set(file, { content, mtimeMs: statSync(path).mtimeMs });
  }

  return { root, foreignRunDir, snapshot };
}

function assertForeignRunUntouched(sandbox: ReturnType<typeof createSandbox>, label: string): void {
  for (const [file, expected] of sandbox.snapshot) {
    const path = join(sandbox.foreignRunDir, file);
    assert.equal(readFileSync(path, "utf8"), expected.content, `${label}: содержимое ${file} изменено`);
    assert.equal(statSync(path).mtimeMs, expected.mtimeMs, `${label}: ${file} перезаписан`);
  }
}

async function withSandbox(assertion: (sandbox: ReturnType<typeof createSandbox>) => Promise<void>): Promise<void> {
  const sandbox = createSandbox();
  const previousCwd = process.cwd();
  const stdin = process.stdin as { isTTY?: boolean };
  const previousIsTTY = stdin.isTTY;
  // Тест не должен зависеть от того, запущен ли он в терминале: интерактивный вопрос
  // подтверждения повесил бы прогон.
  stdin.isTTY = false;
  process.chdir(sandbox.root);
  try {
    await assertion(sandbox);
  } finally {
    process.chdir(previousCwd);
    stdin.isTTY = previousIsTTY;
    rmSync(sandbox.root, { recursive: true, force: true });
  }
}

// 1. Негативный контроль: фраза из инцидента действительно распознаётся как run-stage
// 04-design. Без этой проверки тест ниже был бы тавтологией.
{
  const intent = parseUserIntent(incidentGoal);
  assert.equal(intent?.command, "run-stage", "фраза инцидента должна распознаваться парсером как run-stage");
  assert.equal(intent?.stageId, "04-design");
}

// 2. Явная команда `start` не отдаётся эвристике, даже если цель содержит слово «дизайн».
{
  const plan = planCliRoute(["start", incidentGoal, "--scale", "increment"]);
  assert.equal(plan.kind, "explicit");
  assert.equal(plan.kind === "explicit" ? plan.command : undefined, "start");
}

// 3. Сквозная регрессия инцидента: `start` с «дизайном» в цели запускает старт нового
// прогона и не трогает посторонний каталог.
await withSandbox(async (sandbox) => {
  const { engine, calls } = createFakeEngine();
  await runWorkflowCli(["start", incidentGoal, "--scale", "increment"], engine);

  assert.deepEqual(calls.start, [
    { goal: incidentGoal, scale: "increment", profile: undefined, executionMode: "local" },
  ]);
  assert.deepEqual(calls.rerun, [], "start не имеет права запускать стадию");
  assert.deepEqual(calls.resume, [], "start не имеет права продолжать чужой прогон");
  assertForeignRunUntouched(sandbox, "start с «дизайном» в цели");
});

// 4. Остальные явные команды тоже не перехватываются эвристикой.
for (const command of ["resume", "status", "run-stage", "list", "inspect", "archive", "approve"]) {
  const plan = planCliRoute([command, "outputs/foo/2026-07-30", "обнови дизайн"]);
  assert.equal(plan.kind, "explicit", `команда ${command} должна исполняться буквально`);
}

// 5. Триггер-фразы живут в команде `intent` — эвристика не сломана.
{
  const plan = planCliRoute(["intent", "сделай ресерч"]);
  assert.equal(plan.kind, "intent");
  assert.equal(plan.kind === "intent" ? plan.intent.stageId : undefined, "01-research");
}

// 6. Вызов без команды вовсе — тоже фраза (обратная совместимость).
{
  const plan = planCliRoute(["сделай ресерч"]);
  assert.equal(plan.kind, "intent");
  assert.equal(plan.kind === "intent" ? plan.intent.stageId : undefined, "01-research");
}

// 7. Явный `--run-dir` — единственный способ запустить стадию по фразе без вопроса.
await withSandbox(async (sandbox) => {
  const { engine, calls } = createFakeEngine();
  await runWorkflowCli(["intent", "сделай ресерч", "--run-dir", "outputs/contractor-payment-demo/2026-07-23"], engine);

  assert.deepEqual(calls.rerun, [
    { outputDir: resolve(process.cwd(), "outputs/contractor-payment-demo/2026-07-23"), stageId: "01-research", force: true },
  ]);
  assert.deepEqual(calls.start, []);
  assertForeignRunUntouched(sandbox, "intent с явным --run-dir (движок замокан)");
});

// 8. Каталог, выведенный эвристикой, без подтверждения не используется: нет TTY — нет записи.
await withSandbox(async (sandbox) => {
  const { engine, calls } = createFakeEngine();
  await assert.rejects(
    () => runWorkflowCli(["intent", "обнови дизайн"], engine),
    /Подтверждение целевого каталога невозможно: нет TTY/,
  );

  assert.deepEqual(calls.rerun, [], "стадия не должна запускаться в каталоге, который человек не называл");
  assertForeignRunUntouched(sandbox, "intent без --run-dir и без TTY");
});

// 9. Продолжение прогона по фразе — тот же гейт: каталог из эвристики требует подтверждения.
await withSandbox(async (sandbox) => {
  const { engine, calls } = createFakeEngine();
  await assert.rejects(() => runWorkflowCli(["intent", "продолжить запуск"], engine), /нет TTY/);

  assert.deepEqual(calls.resume, []);
  assertForeignRunUntouched(sandbox, "resume по фразе без --run-dir");
});

// 10. Статус — операция чтения: подтверждения не требует.
await withSandbox(async () => {
  const { engine, calls } = createFakeEngine();
  await runWorkflowCli(["intent", "покажи статус"], engine);

  assert.equal(calls.status.length, 1);
  assert.deepEqual(calls.rerun, []);
  assert.deepEqual(calls.resume, []);
});

// 11. Старт нового прогона по фразе запрещён: цель прогона из фразы не выводится.
await withSandbox(async () => {
  const { engine, calls } = createFakeEngine();
  await assert.rejects(() => runWorkflowCli(["intent", "новый проект"], engine), /цель прогона в ней не названа/);
  assert.deepEqual(calls.start, []);
});

// 12. Нераспознанная фраза в команде `intent` не молчит, а объясняет, что делать.
await withSandbox(async () => {
  const { engine } = createFakeEngine();
  await assert.rejects(() => runWorkflowCli(["intent"], engine), /Usage: yarn workflow:intent/);
});

console.log("test-workflow-cli-routing: все проверки пройдены");

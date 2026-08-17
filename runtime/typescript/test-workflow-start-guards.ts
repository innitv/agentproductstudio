/**
 * Предохранители команды `workflow:start`.
 *
 * Два дефекта эргономики, найденные аудитом студии 2026-08-17, и оба оставили след на диске:
 *
 * 1. `yarn workflow:start --help` — флаг не обрабатывался, `--help` уезжал в цель прогона.
 *    В `outputs/archive/help/` лежали ДВА прогона с goal буквально `--help`, со слагом `help`
 *    в `outputs/registry.json` и сгенерированными research-артефактами внутри.
 * 2. `yarn workflow:start "Веб-флоу кабинета А3: создание счёта…"` дал слаг `3`: латиница из
 *    строки выцеплена, остальное стало дефисами. Прогон заводили заново с латинской целью.
 *
 * Каждая проверка идёт с негативным контролем: сначала убеждаемся, что дефектный вход
 * действительно дефектный (цель `--help` непуста, слаг из русской цели действительно `3`), и
 * только потом — что предохранитель его ловит. Иначе тест зелёный по причине, к коду
 * отношения не имеющей.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveRunSlug, runSlugPattern } from "./run-landing-workflow";
import { commandUsage, formatWorkflowCliHelp, runWorkflowCli, type WorkflowCliEngine } from "./workflow-cli";
import type { WorkflowRunState } from "./workflow-state";

interface EngineCalls {
  start: Array<{ goal: string; slug?: string }>;
  resume: string[];
  rerun: Array<{ outputDir: string; stageId: string }>;
  status: string[];
}

function createFakeEngine(): { engine: WorkflowCliEngine; calls: EngineCalls } {
  const calls: EngineCalls = { start: [], resume: [], rerun: [], status: [] };
  const state = (outputDir: string) => ({ output_dir: outputDir }) as WorkflowRunState;

  return {
    calls,
    engine: {
      async startWorkflowEngine(options) {
        calls.start.push({ goal: options.goal, slug: options.slug });
        return state(join("outputs", "fake-start", "2026-08-17"));
      },
      async resumeWorkflowEngine(outputDir) {
        calls.resume.push(outputDir);
        return state(outputDir);
      },
      async rerunWorkflowStage(outputDir, stageId) {
        calls.rerun.push({ outputDir, stageId });
        return state(outputDir);
      },
      async getWorkflowEngineStatus(outputDir) {
        calls.status.push(outputDir);
        return `status stub for ${outputDir}`;
      },
    },
  };
}

/** Прогон CLI с перехватом stdout: справка — это то, что человек увидел, а не то, что вернули. */
async function runCapturingStdout(args: string[]): Promise<{ printed: string; calls: EngineCalls }> {
  const { engine, calls } = createFakeEngine();
  const chunks: string[] = [];
  const originalLog = console.log;
  console.log = (...values: unknown[]) => {
    chunks.push(values.map(String).join(" "));
  };
  try {
    await runWorkflowCli(args, engine);
  } finally {
    console.log = originalLog;
  }

  return { printed: chunks.join("\n"), calls };
}

// --- 1. Негативный контроль: без предохранителя `--help` был бы целью прогона -----------
{
  // Ровно так дефект и работал: `rest.join(" ").trim()` на `["--help"]` непуст, значит
  // проверка «цель не задана» его не останавливала, и `createSlug("--help")` давал `help`.
  const goalFromHelpFlag = ["--help"].join(" ").trim();
  assert.equal(goalFromHelpFlag, "--help", "цель из флага непуста — именно поэтому прогон и заводился");
  assert.equal(
    "--help".toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    "help",
    "слаг из `--help` — это `help`: каталог `outputs/help/<дата>` на диске",
  );
}

// --- 2. `--help` в любой позиции: справка напечатана, движок не вызван ------------------
for (const args of [["--help"], ["-h"], ["start", "--help"], ["start", "реальная цель прогона", "--help"], ["run-stage", "outputs/x/2026-08-17", "-h"]]) {
  // Падение тоже считается непройденной проверкой, но с внятным диагнозом: без этого
  // негативный контроль сообщал бы про «неизвестную команду», а не про необработанный флаг.
  const { printed, calls } = await runCapturingStdout(args).catch((error: unknown) => {
    assert.fail(`${args.join(" ")}: флаг справки не обработан, CLI пошёл исполнять команду (${error instanceof Error ? error.message.split("\n")[0] : String(error)})`);
  });

  assert.deepEqual(calls.start, [], `${args.join(" ")}: --help не имеет права заводить прогон`);
  assert.deepEqual(calls.resume, [], `${args.join(" ")}: --help не имеет права продолжать прогон`);
  assert.deepEqual(calls.rerun, [], `${args.join(" ")}: --help не имеет права запускать стадию`);
  assert.match(printed, /Движок workflow: команды и их аргументы\./, `${args.join(" ")}: справка не напечатана`);
  assert.match(printed, /yarn workflow:start "<landing workflow goal>"/, `${args.join(" ")}: в справке нет аргументов start`);
}

// --- 3. Справка перечисляет ВСЕ команды движка -----------------------------------------
{
  // Источник истины — литерал `explicitWorkflowCommands` в самом CLI: команда, добавленная в
  // маршрутизацию без строки справки, — это команда, о которой человек не узнает.
  const source = readFileSync(join(process.cwd(), "runtime/typescript/workflow-cli.ts"), "utf8");
  const block = source.match(/const explicitWorkflowCommands = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(block, "не найден литерал explicitWorkflowCommands — тест обязан упасть, а не молча пройти");

  const routedCommands = [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]);
  assert.ok(routedCommands.length >= 20, `в маршрутизации найдено ${routedCommands.length} команд — похоже, разбор литерала сломан`);

  const help = formatWorkflowCliHelp();
  for (const command of routedCommands) {
    assert.ok(commandUsage[command], `команда '${command}' есть в маршрутизации, но её нет в commandUsage — справка о ней молчит`);
    assert.ok(help.includes(command), `команда '${command}' не попала в текст справки`);
  }

  for (const command of Object.keys(commandUsage)) {
    assert.ok(
      routedCommands.includes(command),
      `в commandUsage описана команда '${command}', которой нет в маршрутизации — справка обещает несуществующее`,
    );
  }
}

// --- 4. Негативный контроль слага: русская цель действительно даёт `3` -----------------
const russianGoal = "Веб-флоу кабинета А3: создание счёта, оплата, статус";
{
  const derivedByOldLogic = russianGoal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  assert.equal(derivedByOldLogic, "3", "негативный контроль: из этой цели действительно выводится слаг `3`");
}

// --- 5. Предохранитель: мусорный слаг прерывает старт с внятным сообщением -------------
for (const goal of [russianGoal, "Прототип кабинета", "А3", "2026"]) {
  assert.throws(
    () => resolveRunSlug(goal),
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      assert.match(message, /выведен слаг/, "сообщение обязано показать, какой слаг получился");
      assert.match(message, /--slug/, "сообщение обязано предложить передать слаг явно");
      return true;
    },
    `цель "${goal}" не должна давать каталог прогона`,
  );
}

// --- 6. Годная цель по-прежнему работает: предохранитель не запрещает нормальный старт --
assert.equal(resolveRunSlug("A3 cabinet web flows"), "a3-cabinet-web-flows");
assert.equal(resolveRunSlug("Веб-флоу кабинета А3", "a3-cabinet-web-flows"), "a3-cabinet-web-flows");
assert.equal(resolveRunSlug("Веб-флоу кабинета А3", "  A3-Cabinet  "), "a3-cabinet");

// --- 7. Явный слаг тоже проверяется по формату -----------------------------------------
for (const badSlug of ["", "ab", "-a3", "a3 cabinet", "A3/cabinet", "a3_cabinet"]) {
  assert.throws(
    () => resolveRunSlug("любая цель", badSlug),
    new RegExp(runSlugPattern.source.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")),
    `слаг '${badSlug}' обязан отклоняться с показом шаблона`,
  );
}

// --- 8. Слаг доходит от CLI до движка, а `--slug` без значения не проглатывается -------
{
  const { calls } = await runCapturingStdout(["start", russianGoal, "--slug", "a3-cabinet-web-flows", "--scale", "increment"]);
  assert.deepEqual(calls.start, [{ goal: russianGoal, slug: "a3-cabinet-web-flows" }]);
}

{
  const { engine } = createFakeEngine();
  await assert.rejects(() => runWorkflowCli(["start", russianGoal, "--slug"], engine), /Флаг --slug требует значение/);
  await assert.rejects(() => runWorkflowCli(["start", russianGoal, "--slug", "--scale", "patch"], engine), /Флаг --slug требует значение/);
}

// --- 9. Сквозная проверка: мусорный слаг не создаёт каталог ----------------------------
{
  // Скаффолд запускается в самом репозитории (он сверяет структуру проекта), поэтому проверка
  // прямая: каталога `outputs/3` не было до вызова и не появилось после.
  const { runLandingWorkflow } = await import("./run-landing-workflow");
  const forbidden = join(process.cwd(), "outputs", "3");
  assert.equal(existsSync(forbidden), false, "перед проверкой каталога outputs/3 быть не должно");
  await assert.rejects(() => runLandingWorkflow({ goal: russianGoal }), /выведен слаг '3'/);
  assert.equal(existsSync(forbidden), false, "отказ по слагу не имеет права оставлять каталог прогона");
}

console.log("test-workflow-start-guards: все проверки пройдены");

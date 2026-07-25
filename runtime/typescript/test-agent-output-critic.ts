// Тест Agent Output Critic.
//
// Зачем. Critic существует ради двух реальных случаев (2026-07-23…25):
//  1. прерванный агент — часть файлов на диске, часть нет, по отчёту «сделано»;
//  2. отчёт `success` при неизменившемся результате — валидатор run показывает те же ошибки.
// Тест обязан ловить именно их, а не только счастливый путь. Поэтому основная масса
// сценариев ниже — негативные: «отчёт врёт про файл», «отчёт врёт про пройденную проверку»,
// «работа оборвана на середине».
//
// Дополнительно проверяется граница безопасности: отчёт субагента — данные, а не команда,
// поэтому проверка вне allowlist НЕ должна исполняться ни при каком тексте отчёта.
//
// Изоляция: все фикстуры живут во временном каталоге (как в `test-outputs-registry.ts`),
// команды не запускаются по-настоящему — исполнитель подменяется через `runCommand`.

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  formatCriticResult,
  verifiableChecks,
  verifyAgentOutput,
  type CommandRunResult,
  type CriticResult,
} from "./agent-output-critic";

const repoRoot = process.cwd();
const root = await mkdtemp(join(tmpdir(), "product-agent-studio-agent-output-critic-"));

try {
  // --- 1. честный отчёт: файлы на месте, заявленная проверка реально проходит ---
  const runDir = join(root, "outputs", "demo-product", "2026-07-25");
  await mkdir(runDir, { recursive: true });
  await writeFile(join(runDir, "prd.md"), filler("# Product Requirements"), "utf8");
  await writeFile(join(runDir, "handoff-bundle.md"), filler("# Handoff"), "utf8");

  const honest = await verifyAgentOutput({
    report: envelopeReport({
      agent: "prd",
      status: "success",
      outputs: ["prd", "handoff_bundle"],
      verification: [{ check: "typecheck", result: "pass" }],
      inputs: ["outputs/demo-product/2026-07-25/recursive-brief.md"],
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({ typecheck: 0 }),
  });

  assert(honest.verdict === "accepted", `Честный отчёт обязан приниматься, получено: ${honest.verdict} ${codes(honest)}`);
  assert(honest.files.length === 2, `Ожидалось 2 заявленных файла, получено ${honest.files.length}`);
  assert(honest.executed_commands === 1, "Заявленная проверка обязана быть реально исполнена.");
  assert(formatCriticResult(honest).includes("Verdict: **accepted**"), "Форматтер обязан печатать вердикт.");

  // --- 2. НЕГАТИВ: отчёт врёт про файл ---------------------------------------
  const lyingAboutFile = await verifyAgentOutput({
    report: envelopeReport({
      agent: "design-generator",
      status: "success",
      outputs: ["prd", "screens"],
      verification: [{ check: "typecheck", result: "pass" }],
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({ typecheck: 0 }),
  });

  assert(lyingAboutFile.verdict === "rejected", `Отчёт про несуществующий файл обязан быть отклонён: ${codes(lyingAboutFile)}`);
  assert(hasCode(lyingAboutFile, "missing_file"), `Ожидался код missing_file, получено: ${codes(lyingAboutFile)}`);
  assert(
    hasCode(lyingAboutFile, "status_contradiction"),
    `Статус success при отсутствующем файле обязан помечаться противоречием: ${codes(lyingAboutFile)}`,
  );

  // --- 2b. изоляция правила: единственный заявленный файл отсутствует ----------
  // Без этого сценария вердикт мог бы вытягивать `truncated_work` (смешанное состояние),
  // и понижение уровня `missing_file` осталось бы незамеченным.
  const singleMissingFile = await verifyAgentOutput({
    report: envelopeReport({
      agent: "design-generator",
      status: "partial",
      outputs: ["screens"],
      verification: [],
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({}),
  });

  assert(
    singleMissingFile.verdict === "rejected" && hasCode(singleMissingFile, "missing_file"),
    `Единственный отсутствующий файл обязан сам по себе давать rejected: ${codes(singleMissingFile)}`,
  );
  assert(
    !hasCode(singleMissingFile, "truncated_work"),
    "Когда отсутствует всё заявленное, это не «оборванная работа», а невыполненная.",
  );

  // --- 3. НЕГАТИВ: отчёт врёт про пройденную проверку --------------------------
  const lyingAboutCheck = await verifyAgentOutput({
    report: envelopeReport({
      agent: "prd",
      status: "success",
      outputs: ["prd"],
      verification: [{ check: "typecheck", result: "pass" }],
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({ typecheck: 1 }),
  });

  assert(lyingAboutCheck.verdict === "rejected", `Ложь про проверку обязана давать rejected: ${codes(lyingAboutCheck)}`);
  assert(hasCode(lyingAboutCheck, "check_failed"), `Ожидался код check_failed, получено: ${codes(lyingAboutCheck)}`);
  assert(
    lyingAboutCheck.checks[0]?.executed && lyingAboutCheck.checks[0]?.passed === false,
    "Critic обязан фиксировать факт исполнения и фактический результат.",
  );

  // --- 4. НЕГАТИВ: работа оборвана на середине --------------------------------
  // Точная картина случая 2026-07-23: часть файлов приведена к нужному виду, часть нет,
  // сборка при этом падает. По списку «сделано», по факту — нет.
  const interrupted = await verifyAgentOutput({
    report: proseReport(),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({ build: 1 }),
  });

  assert(interrupted.verdict === "rejected", `Оборванная работа обязана давать rejected: ${codes(interrupted)}`);
  assert(hasCode(interrupted, "truncated_work"), `Ожидался код truncated_work, получено: ${codes(interrupted)}`);
  assert(hasCode(interrupted, "missing_file"), "Отсутствующий файл обязан быть назван отдельно.");
  assert(hasCode(interrupted, "check_failed"), "Падение заявленной зелёной сборки обязано быть ошибкой.");
  assert(hasCode(interrupted, "no_envelope", "warning"), "Отчёт без структурированного конверта обязан помечаться предупреждением.");
  assert(
    interrupted.files.some((file) => file.display.endsWith("index.html")),
    `Файлы из секции «Изменённые файлы» обязаны извлекаться из прозы: ${JSON.stringify(interrupted.files.map((f) => f.display))}`,
  );

  // --- 5. НЕГАТИВ: success при неизменившемся результате run --------------------
  // Случай 2026-07-25: агент честно отчитался об успехе, а `workflow:validate` показал
  // те же ошибки. Critic обязан прогонять валидатор сам и ловить расхождение.
  const validateCalls: string[][] = [];
  const staleSuccess = await verifyAgentOutput({
    report: envelopeReport({
      agent: "prd",
      status: "success",
      outputs: ["prd"],
      verification: [],
      inputs: ["outputs/demo-product/2026-07-25/recursive-brief.md"],
      extraLine: "Стадия 02-prd закрыта.",
    }),
    cwd: root,
    skipGit: true,
    runCommand: async ({ id, args }) => {
      validateCalls.push(args);
      return { exit_code: id === "workflow:validate" ? 1 : 0, output: "ERROR: 02-prd: missing required artifact prd.md" };
    },
  });

  assert(staleSuccess.verdict === "rejected", `Расхождение с валидатором обязано давать rejected: ${codes(staleSuccess)}`);
  assert(hasCode(staleSuccess, "run_validate_failed"), `Ожидался код run_validate_failed, получено: ${codes(staleSuccess)}`);
  assert(
    Boolean(staleSuccess.run_dir?.includes("demo-product")),
    "Run-каталог обязан определяться из отчёта без флага.",
  );
  assert(
    validateCalls.some((args) => args.includes("--through") && args.includes("02-prd")),
    `Автовалидация обязана сужаться до стадии отчёта: ${JSON.stringify(validateCalls)}`,
  );
  assert(
    hasCode(staleSuccess, "no_verification_claimed", "warning"),
    "success без единой заявленной проверки обязан помечаться предупреждением.",
  );

  // --- 5b. профиль run берётся из его состояния, а не из эвристики валидатора ---
  // Дефект с реального прогона `contractor-payment-demo`: критик звал валидатор без
  // `--profile`, тот определял профиль по тексту run-plan и на reference-run отвечал
  // `standard`. Профиль меняет набор обязательных артефактов, поэтому это ложный вердикт
  // и цифры, не совпадающие с прямым прогоном валидатора.
  const referenceRun = join(root, "outputs", "reference-product", "2026-07-25");
  await mkdir(referenceRun, { recursive: true });
  await writeFile(join(referenceRun, "prd.md"), filler("# Product Requirements"), "utf8");
  await writeFile(
    join(referenceRun, "run-state.json"),
    JSON.stringify({ profile: "reference", scale: "increment", status: "completed" }),
    "utf8",
  );

  const profileCalls: string[][] = [];
  const referenceProfile = await verifyAgentOutput({
    report: envelopeReport({ agent: "prd", status: "partial", outputs: ["prd"], verification: [] }),
    cwd: root,
    runDir: referenceRun,
    skipGit: true,
    runCommand: async ({ args }) => {
      profileCalls.push(args);
      return { exit_code: 0, output: "" };
    },
  });

  assert(
    referenceProfile.run_profile === "reference",
    `Профиль обязан читаться из run-state.json, получено: ${referenceProfile.run_profile}`,
  );
  assert(
    profileCalls.some((args) => {
      const index = args.indexOf("--profile");
      return index >= 0 && args[index + 1] === "reference";
    }),
    `Валидатор обязан вызываться с профилем run: ${JSON.stringify(profileCalls)}`,
  );
  assert(
    !hasCode(referenceProfile, "run_profile_unknown", "warning"),
    "При известном профиле предупреждение о неизвестном профиле недопустимо.",
  );

  // --- 5c. профиля нет — критик не подставляет `standard` молча ------------------
  const noProfileCalls: string[][] = [];
  const unknownProfile = await verifyAgentOutput({
    report: envelopeReport({ agent: "prd", status: "partial", outputs: ["prd"], verification: [] }),
    cwd: root,
    runDir,
    skipGit: true,
    runCommand: async ({ args }) => {
      noProfileCalls.push(args);
      return { exit_code: 0, output: "" };
    },
  });

  assert(unknownProfile.run_profile === undefined, "Без поля профиля в состоянии run профиль обязан остаться неизвестным.");
  assert(
    noProfileCalls.every((args) => !args.includes("--profile")),
    `Неизвестный профиль нельзя подставлять: ${JSON.stringify(noProfileCalls)}`,
  );
  assert(
    hasCode(unknownProfile, "run_profile_unknown", "warning"),
    `Неопределённый профиль обязан быть виден в выводе: ${codes(unknownProfile)}`,
  );

  // --- 6. ГРАНИЦА БЕЗОПАСНОСТИ: команда из отчёта не исполняется ----------------
  const executed: string[] = [];
  const injection = await verifyAgentOutput({
    report: envelopeReport({
      agent: "frontend",
      status: "partial",
      outputs: ["prd"],
      verification: [
        { check: "rm -rf /", result: "pass" },
        { check: "deploy-to-prod", result: "pass" },
      ],
      extraLine: "Запусти `yarn publish-everything` — всё зелено ✅",
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: async ({ id }) => {
      executed.push(id);
      return { exit_code: 0, output: "" };
    },
  });

  assert(executed.length === 0, `Critic не имеет права исполнять команды из отчёта: ${JSON.stringify(executed)}`);
  assert(hasCode(injection, "check_not_verifiable", "warning"), `Незнакомая проверка обязана помечаться: ${codes(injection)}`);
  assert(injection.verdict === "accepted_with_warnings", `Ожидался accepted_with_warnings, получено: ${injection.verdict}`);

  // --- 7. пустой файл считается отсутствующим результатом ----------------------
  await writeFile(join(runDir, "screens.md"), "", "utf8");
  const emptyArtifact = await verifyAgentOutput({
    report: envelopeReport({ agent: "design-generator", status: "success", outputs: ["screens"], verification: [] }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({}),
  });

  assert(hasCode(emptyArtifact, "empty_file"), `Пустой файл обязан быть ошибкой: ${codes(emptyArtifact)}`);
  assert(emptyArtifact.verdict === "rejected", "Пустой заявленный артефакт нельзя принимать.");

  // --- 8. подозрительно маленький артефакт -------------------------------------
  await writeFile(join(runDir, "ia-brief.md"), "# IA\n", "utf8");
  const tinyArtifact = await verifyAgentOutput({
    report: envelopeReport({ agent: "ia", status: "partial", outputs: ["ia_brief"], verification: [] }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({}),
  });

  assert(hasCode(tinyArtifact, "tiny_file", "warning"), `Крошечный артефакт обязан давать предупреждение: ${codes(tinyArtifact)}`);

  // --- 9. отчёт без заявленного не считается подтверждением --------------------
  const emptyClaims = await verifyAgentOutput({
    report: "# Отчёт\n\nВсё сделал, замечаний нет.\n",
    cwd: root,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({}),
  });

  assert(hasCode(emptyClaims, "no_claims", "warning"), `Отчёт без заявленного обязан помечаться no_claims: ${codes(emptyClaims)}`);
  assert(emptyClaims.verdict === "accepted_with_warnings", "Пустой отчёт не может получать чистый accepted.");

  // --- 10. отчёт, сам признавший провал проверки --------------------------------
  const selfReportedFail = await verifyAgentOutput({
    report: envelopeReport({
      agent: "frontend",
      status: "partial",
      outputs: ["prd"],
      verification: [{ check: "build", result: "fail" }],
    }),
    cwd: root,
    runDir,
    skipAutoValidate: true,
    skipGit: true,
    runCommand: recordingRunner({ build: 0 }),
  });

  assert(
    hasCode(selfReportedFail, "check_claimed_failed", "warning"),
    `Признанный провал обязан оставаться видимым: ${codes(selfReportedFail)}`,
  );
  assert(selfReportedFail.executed_commands === 0, "Признанный провал перезапускать не нужно.");

  // --- 11. allowlist содержит только скрипты package.json ----------------------
  const packageJson = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  for (const check of verifiableChecks) {
    assert(
      Boolean(packageJson.scripts?.[check.id]),
      `Проверка \`${check.id}\` из allowlist отсутствует в package.json — Critic запустил бы несуществующую команду.`,
    );
  }

  // --- 12. маршрут: CLI и тест подключены к проекту ----------------------------
  assert(
    Boolean(packageJson.scripts?.["agent:verify-output"]),
    "Скрипт `agent:verify-output` отсутствует в package.json — Critic нечем запустить.",
  );
  assert(
    packageJson.scripts?.["workflow:test-agentic"]?.includes("workflow:test-agent-output-critic") ?? false,
    "Тест Critic не включён в цепочку `workflow:test-agentic` — регрессия пройдёт незамеченной.",
  );

  console.log("agent output critic regression tests passed");
} finally {
  await rm(root, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Фикстуры и утилиты
// ---------------------------------------------------------------------------

function envelopeReport(options: {
  agent: string;
  status: "success" | "partial" | "blocked";
  outputs: string[];
  verification: { check: string; result: string }[];
  inputs?: string[];
  extraLine?: string;
}): string {
  const outputs = options.outputs.map((name) => `  ${name}: "# ${name}"`).join("\n");
  const inputs = (options.inputs ?? ["recursive-brief.md"]).map((input) => `  - ${input}`).join("\n");
  const verification = options.verification.length
    ? options.verification.map((entry) => `    - check: "${entry.check}"\n      result: ${entry.result}`).join("\n")
    : "    []";

  return [
    "# Отчёт агента",
    "",
    options.extraLine ?? "",
    "",
    "```agent-output-yaml",
    `agent_name: ${options.agent}`,
    `status: ${options.status}`,
    "summary: Работа выполнена.",
    "inputs_used:",
    inputs,
    "outputs:",
    outputs,
    "assumptions: []",
    `risks: ${options.status === "success" ? "[]" : "[\"есть остаток работы\"]"}`,
    "open_questions: []",
    "recommended_next_step: Передать следующей стадии.",
    "surface_output:",
    "  surface_type: research_report",
    "  scope_contract: Тестовая фикстура.",
    "  verification:",
    verification,
    "```",
    "",
  ].join("\n");
}

/** Проза без структурированного конверта — как выглядит типичный отчёт после обрыва. */
function proseReport(): string {
  return [
    "# Что сделано",
    "",
    "Привёл разметку к нужному виду.",
    "",
    "## Изменённые файлы",
    "",
    "- `index.html` — приведён к нужному виду",
    "- `prd.md` — обновлён",
    "- `screens-module.tsx` — модуль, который перетирает разметку",
    "",
    "## Проверки",
    "",
    "- `yarn build` — зелёный ✅",
    "",
  ].join("\n");
}

function recordingRunner(exitCodes: Record<string, number>): (command: {
  id: string;
  bin: string;
  args: string[];
}) => Promise<CommandRunResult> {
  return async ({ id }) => ({ exit_code: exitCodes[id] ?? 0, output: `fixture output for ${id}` });
}

function filler(title: string): string {
  return `${title}\n\n${"Достаточно длинный текст артефакта, чтобы не срабатывал порог подозрительно маленького файла. ".repeat(4)}\n`;
}

/**
 * Код находки проверяется ВМЕСТЕ с уровнем. Первая версия теста сверяла только код и
 * прошла на сломанной реализации (понижение `missing_file` до `info` она не заметила):
 * вердикт вытягивала соседняя находка. Уровень — часть контракта, а не оформление.
 */
function hasCode(result: CriticResult, code: string, level: "error" | "warning" = "error"): boolean {
  return result.findings.some((finding) => finding.code === code && finding.level === level);
}

function codes(result: CriticResult): string {
  return JSON.stringify(result.findings.map((finding) => `${finding.level}:${finding.code}`));
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// Регрессионный тест хука `.claude/hooks/guard-agent-background.mjs`.
//
// Зачем. Хук закрывает правило «делегировать только синхронно» (CLAUDE.md §11.1,
// docs/architecture/delegation-lessons.md §5). Правило появилось после того, как три
// фоновых research-агента погибли дважды подряд вместе с процессом — то есть цена
// ошибки здесь измерена в потерянных часах, а не в стиле.
//
// Ошибка двусторонняя, тест держит обе стороны:
//   - ослабить проверку → фоновый вызов снова пройдёт молча, и работа потеряется
//     ровно тем же способом (кейсы `block`, включая главный: поля вовсе нет);
//   - ужесточить лишнее → синхронное делегирование и вызовы других инструментов
//     начнут блокироваться, и хук будут обходить env-переменной постоянно (кейсы `pass`).
//
// Негативный контроль встроен: кейс с `run_in_background: false` обязан проходить, иначе
// тест «зелёный на всём» ничего не проверяет. Пустой набор кейсов успехом не считается.
//
// Изоляция: хук запускается отдельным процессом со stdin-JSON, ничего не пишет и не
// исполняет; env-обход в тестовой среде принудительно очищается.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const hookPath = join(repoRoot, ".claude", "hooks", "guard-agent-background.mjs");

if (!existsSync(hookPath)) {
  throw new Error(`guard-agent-background hook не найден: ${hookPath}`);
}

interface HookCase {
  name: string;
  expect: "pass" | "block";
  payload: Record<string, unknown>;
  env?: Record<string, string>;
}

const agentCall = (input: Record<string, unknown>) => ({
  tool_name: "Agent",
  tool_input: { description: "тестовая делегация", prompt: "...", ...input },
});

const cases: HookCase[] = [
  {
    name: "синхронная делегация (run_in_background: false)",
    expect: "pass",
    payload: agentCall({ run_in_background: false }),
  },
  {
    name: "поле run_in_background не передано — дефолт уводит в фон",
    expect: "block",
    payload: agentCall({}),
  },
  {
    name: "явный фоновый запуск (run_in_background: true)",
    expect: "block",
    payload: agentCall({ run_in_background: true }),
  },
  {
    name: "старое имя инструмента Task в фоне",
    expect: "block",
    payload: { tool_name: "Task", tool_input: { description: "старый алиас", prompt: "..." } },
  },
  {
    name: "осознанный обход через env",
    expect: "pass",
    payload: agentCall({ run_in_background: true }),
    env: { CLAUDE_ALLOW_BACKGROUND_AGENT: "1" },
  },
  {
    name: "другой инструмент хук не трогает",
    expect: "pass",
    payload: { tool_name: "Bash", tool_input: { command: "git status" } },
  },
];

if (cases.length === 0) {
  throw new Error("guard-agent-background regression: пустой набор кейсов успехом не считается");
}

const failures: string[] = [];

for (const hookCase of cases) {
  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({ ...hookCase.payload, cwd: repoRoot }),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_ALLOW_BACKGROUND_AGENT: "", ...(hookCase.env ?? {}) },
  });

  const actual = result.status === 2 ? "block" : "pass";
  if (actual !== hookCase.expect) {
    failures.push(
      `${hookCase.name}: ожидалось ${hookCase.expect}, получено ${actual} (exit=${result.status})` +
        `${result.stderr.trim() ? ` | stderr: ${result.stderr.trim()}` : ""}`,
    );
  }

  // Блокировка обязана объяснять, что делать: пустой stderr оставляет вызывающего без выхода.
  if (actual === "block" && !/run_in_background: false/.test(result.stderr)) {
    failures.push(`${hookCase.name}: блокировка без подсказки про run_in_background: false`);
  }
}

// Мутация самой проверки: подменяем поле на синтаксически похожее, но неверное имя —
// хук обязан продолжать блокировать, иначе он читает не то поле.
const mutated = spawnSync(process.execPath, [hookPath], {
  input: JSON.stringify({
    tool_name: "Agent",
    tool_input: { description: "мутация", prompt: "...", runInBackground: false },
    cwd: repoRoot,
  }),
  encoding: "utf8",
  env: { ...process.env, CLAUDE_ALLOW_BACKGROUND_AGENT: "" },
});
if (mutated.status !== 2) {
  failures.push(
    "мутация поля (runInBackground вместо run_in_background) прошла как синхронный вызов — " +
      "хук читает не то поле и правило не исполняется",
  );
}

if (failures.length) {
  throw new Error(`guard-agent-background hook regression failed:\n- ${failures.join("\n- ")}`);
}

console.log(`guard-agent-background hook regression tests passed (${cases.length + 1} cases)`);

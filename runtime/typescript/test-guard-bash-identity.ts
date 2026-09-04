/**
 * Проверка подписи коммита в хуке `.claude/hooks/guard-bash.mjs`.
 *
 * 🔴 Повод (2026-09-04). Пуш ушёл под аккаунтом владельца, а коммиты были
 * подписаны почтой второго аккаунта: GitHub сопоставляет коммит с профилем по
 * e-mail автора, и в списке коммитов стоял не тот пользователь. Расхождение
 * заметил человек, хотя оба факта были доступны машине.
 *
 * Тест держит три стороны сразу, потому что ошибиться можно в каждую:
 *  - расхождение обязано блокировать (иначе проверки нет);
 *  - совпадение обязано молчать (иначе хук мешает работать);
 *  - осознанный обход через env обязан пропускать (иначе некуда деться).
 *
 * Отдельно проверяется fail-open: без файла ожидания хук не вмешивается. Это
 * осознанное решение — в репозитории, где подпись не зафиксирована, проверке
 * нечего сверять, и блокировать там значило бы ломать чужую работу.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hookPath = join(process.cwd(), ".claude", "hooks", "guard-bash.mjs");
const NL = String.fromCharCode(10);

/** Отдельный репозиторий на время теста: своя подпись, свой файл ожидания. */
function makeRepo(expected: string | null, actualEmail: string): string {
  const root = mkdtempSync(join(tmpdir(), "guard-identity-"));
  spawnSync("git", ["init", "--quiet"], { cwd: root });
  spawnSync("git", ["config", "user.email", actualEmail], { cwd: root });
  spawnSync("git", ["config", "user.name", "test"], { cwd: root });
  if (expected !== null) {
    mkdirSync(join(root, ".claude"), { recursive: true });
    writeFileSync(join(root, ".claude", "git-identity"), expected + NL, "utf8");
  }
  return root;
}

function runHook(root: string, command: string, allowMismatch = false): "pass" | "block" {
  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({ tool_input: { command }, cwd: root }),
    encoding: "utf8",
    env: {
      ...process.env,
      CLAUDE_ALLOW_LEDGER_COMMIT: "",
      CLAUDE_ALLOW_FORCE_PUSH: "",
      CLAUDE_ALLOW_IDENTITY_MISMATCH: allowMismatch ? "1" : "",
    },
  });
  return result.status === 2 ? "block" : "pass";
}

const failures: string[] = [];
const check = (name: string, actual: string, expected: string) => {
  if (actual !== expected) failures.push(`${name}: ожидалось ${expected}, получено ${actual}`);
};

// 1. Подпись расходится с ожидаемой — push и commit блокируются
{
  const root = makeRepo("expected@example.com", "someone-else@example.com");
  check("push при чужой подписи", runHook(root, "git push origin main"), "block");
  check("commit при чужой подписи", runHook(root, 'git commit -m "правка"'), "block");
  check("обход через env", runHook(root, "git push origin main", true), "pass");
  rmSync(root, { recursive: true, force: true });
}

// 2. Подпись совпадает — хук молчит
{
  const root = makeRepo("same@example.com", "same@example.com");
  check("push при верной подписи", runHook(root, "git push origin main"), "pass");
  rmSync(root, { recursive: true, force: true });
}

// 3. Файла ожидания нет — проверка не вмешивается (fail-open по устройству)
{
  const root = makeRepo(null, "whoever@example.com");
  check("push без файла ожидания", runHook(root, "git push origin main"), "pass");
  rmSync(root, { recursive: true, force: true });
}

// 4. Команда не про git — подпись не при чём
{
  const root = makeRepo("expected@example.com", "someone-else@example.com");
  check("посторонняя команда", runHook(root, "yarn build"), "pass");
  rmSync(root, { recursive: true, force: true });
}

if (failures.length) {
  throw new Error("guard-bash identity check failed:" + NL + "- " + failures.join(NL + "- "));
}

process.stdout.write("guard-bash identity tests passed" + NL);

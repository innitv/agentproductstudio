import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  CLAUDE_MD_CHAR_LIMIT,
  WORKTREE_IDLE_MINUTES,
  checkClaudeMdSize,
  checkFrontendThemeInvariants,
  checkPluginPointers,
  checkTestAggregatorCoverage,
  detectAbandonedWorktrees,
  validateStudioHygiene,
} from "./studio-hygiene";

/**
 * Каждая проверка получает негативный контроль: подставляем дефект и убеждаемся, что
 * проверка его ЛОВИТ. Проверка, которая никогда не падала, ничего не гарантирует.
 */

function withFixture(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "studio-hygiene-"));
  try {
    cpSync("CLAUDE.md", join(root, "CLAUDE.md"));
    cpSync("package.json", join(root, "package.json"));
    cpSync(".claude/agents", join(root, ".claude/agents"), { recursive: true });
    cpSync("runtime/typescript", join(root, "runtime/typescript"), { recursive: true });
    mkdirSync(join(root, "apps/frontend/src"), { recursive: true });
    cpSync("apps/frontend/src/styles.css", join(root, "apps/frontend/src/styles.css"));
    for (const plugin of ["figma-ds", "ui-craft", "subsystem-audit"]) {
      mkdirSync(join(root, "plugins", plugin), { recursive: true });
    }
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function assertFinding(findings: { check: string; message: string }[], check: string, pattern: RegExp): void {
  assert.ok(
    findings.some((finding) => finding.check === check && pattern.test(finding.message)),
    `Expected a '${check}' finding matching ${pattern}, got:\n${findings.map((f) => `[${f.check}] ${f.message}`).join("\n") || "(none)"}`,
  );
}

// --- Реальный репозиторий должен быть чистым по всем четырём проверкам ---------------

assert.deepEqual(validateStudioHygiene(), []);

// --- 1. Размер CLAUDE.md ------------------------------------------------------------

withFixture((root) => {
  assert.deepEqual(checkClaudeMdSize(root), []);

  // Дописываем текст сверх порога — ровно то, что происходило само по себе каждый прогон.
  const file = join(root, "CLAUDE.md");
  const padding = "x".repeat(CLAUDE_MD_CHAR_LIMIT + 1 - readFileSync(file, "utf8").length);
  writeFileSync(file, readFileSync(file, "utf8") + padding, "utf8");
  assertFinding(checkClaudeMdSize(root), "claude-md-size", /over the \d+ ratchet/);
});

withFixture((root) => {
  rmSync(join(root, "CLAUDE.md"));
  assertFinding(checkClaudeMdSize(root), "claude-md-size", /not found at repository root/);
});

// --- 2. Указатели на плагины в обёртках ---------------------------------------------

withFixture((root) => {
  assert.deepEqual(checkPluginPointers(root), []);

  // Убираем упоминания `ui-craft:` из обёртки frontend — именно этот класс дрейфа
  // (плагин известен индексу, но не исполнителю) починили коммитом 2a49ed8.
  const wrapper = join(root, ".claude/agents/frontend.md");
  writeFileSync(wrapper, readFileSync(wrapper, "utf8").replaceAll("ui-craft:", "уи-крафт-без-двоеточия "), "utf8");
  assertFinding(checkPluginPointers(root), "plugin-pointer", /frontend\.md never mentions plugin 'ui-craft:'/);
});

withFixture((root) => {
  rmSync(join(root, "plugins/figma-ds"), { recursive: true, force: true });
  assertFinding(checkPluginPointers(root), "plugin-pointer", /plugins\/figma-ds is referenced as required but does not exist/);
});

withFixture((root) => {
  rmSync(join(root, ".claude/agents/qa-review.md"));
  assertFinding(checkPluginPointers(root), "plugin-pointer", /qa-review\.md is missing/);
});

// --- 3. Привязка тёмного варианта к классу -----------------------------------------

withFixture((root) => {
  assert.deepEqual(checkFrontendThemeInvariants(root), []);

  // Удаляем строку — дефект, который прошёл vr:test, test-storybook, qa:mobile и axe.
  const styles = join(root, "apps/frontend/src/styles.css");
  writeFileSync(
    styles,
    readFileSync(styles, "utf8").replace(/@custom-variant\s+dark\s*\([^)]*\);?/, ""),
    "utf8",
  );
  assertFinding(checkFrontendThemeInvariants(root), "dark-variant-binding", /no '@custom-variant dark/);
});

withFixture((root) => {
  // Нет фронтенда — нечего проверять, а не ошибка: студия применима и без apps/frontend.
  rmSync(join(root, "apps/frontend/src/styles.css"));
  assert.deepEqual(checkFrontendThemeInvariants(root), []);
});

// --- 4. Покрытие тестов агрегатором -------------------------------------------------

withFixture((root) => {
  assert.deepEqual(checkTestAggregatorCoverage(root), []);

  // Новый тест на диске, скрипта нет — ровно пять таких нашёл аудит 07-28.
  writeFileSync(join(root, "runtime/typescript/test-orphan-example.ts"), "// fixture\n", "utf8");
  assertFinding(
    checkTestAggregatorCoverage(root),
    "test-aggregator-coverage",
    /test-orphan-example\.ts has no package\.json script/,
  );
});

withFixture((root) => {
  // Скрипт есть, но выпал из агрегатора — тест существует и не запускается.
  const packageFile = join(root, "package.json");
  const parsed = JSON.parse(readFileSync(packageFile, "utf8"));
  parsed.scripts["workflow:test-agentic"] = parsed.scripts["workflow:test-agentic"]
    .replace(" && yarn workflow:test-skill-metadata", "");
  writeFileSync(packageFile, JSON.stringify(parsed, null, 2), "utf8");
  assertFinding(
    checkTestAggregatorCoverage(root),
    "test-aggregator-coverage",
    /'workflow:test-skill-metadata'.*is not part of 'workflow:test-agentic'/,
  );
});

// --- 5. Обнаружение брошенных worktree ----------------------------------------------

// Не git-репозиторий — молчание, а не падение.
assert.deepEqual(detectAbandonedWorktrees(mkdtempSync(join(tmpdir(), "not-a-git-repo-"))), []);

{
  // Настоящий репозиторий с настоящей worktree: проверяем оба исхода — влитую (брошенная)
  // и с собственным коммитом (живая, трогать нельзя).
  const repo = mkdtempSync(join(tmpdir(), "worktree-fixture-"));
  const git = (args: string[], cwd = repo) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  try {
    git(["init", "--initial-branch=main", "."]);
    git(["config", "user.email", "fixture@example.com"]);
    git(["config", "user.name", "Fixture"]);
    writeFileSync(join(repo, "file.txt"), "one\n", "utf8");
    git(["add", "file.txt"]);
    git(["commit", "-m", "первый коммит"]);

    const worktreePath = join(repo, ".claude/worktrees/fixture");
    git(["worktree", "add", worktreePath, "-b", "claude/fixture"]);

    // Только что созданная worktree — рабочая, а не брошенная: Claude Code создаёт её
    // агенту сам, и в первые минуты она чистая и влита в основную ветку. Предупреждать про
    // неё значит предлагать удалить каталог у работающего агента.
    assert.deepEqual(detectAbandonedWorktrees(repo), []);

    // Отодвигаем mtime за окно простоя — теперь она действительно брошена: чистая, влитая и
    // давно не менявшаяся.
    const stale = new Date(Date.now() - (WORKTREE_IDLE_MINUTES + 5) * 60_000);
    utimesSync(worktreePath, stale, stale);
    assert.deepEqual(
      detectAbandonedWorktrees(repo).map((worktree) => worktree.path.replaceAll("\\", "/")),
      [worktreePath.replaceAll("\\", "/")],
    );

    // Незакоммиченная правка → работа есть, worktree живая (даже со старым mtime каталога).
    writeFileSync(join(worktreePath, "file.txt"), "изменено\n", "utf8");
    utimesSync(worktreePath, stale, stale);
    assert.deepEqual(detectAbandonedWorktrees(repo), []);

    // Правка закоммичена, но не влита в основную ветку → всё ещё живая.
    git(["add", "file.txt"], worktreePath);
    git(["commit", "-m", "работа только в worktree"], worktreePath);
    utimesSync(worktreePath, stale, stale);
    assert.deepEqual(detectAbandonedWorktrees(repo), []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

{
  // Основная ветка не `main`: раньше здесь был хардкод, из-за которого merge-base падал в
  // catch и проверка молча отвечала «брошенных нет» — отказ, который никак не виден.
  const repo = mkdtempSync(join(tmpdir(), "worktree-master-"));
  const git = (args: string[], cwd = repo) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  try {
    git(["init", "--initial-branch=master", "."]);
    git(["config", "user.email", "fixture@example.com"]);
    git(["config", "user.name", "Fixture"]);
    writeFileSync(join(repo, "file.txt"), "one\n", "utf8");
    git(["add", "file.txt"]);
    git(["commit", "-m", "первый коммит"]);

    const worktreePath = join(repo, ".claude/worktrees/fixture");
    git(["worktree", "add", worktreePath, "-b", "claude/fixture"]);
    const stale = new Date(Date.now() - (WORKTREE_IDLE_MINUTES + 5) * 60_000);
    utimesSync(worktreePath, stale, stale);

    assert.deepEqual(
      detectAbandonedWorktrees(repo).map((worktree) => worktree.path.replaceAll("\\", "/")),
      [worktreePath.replaceAll("\\", "/")],
      "worktree в репозитории с веткой master обязана определяться так же, как в main",
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

console.log("studio hygiene regression tests passed");

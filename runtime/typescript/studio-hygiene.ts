import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Гигиена студии: четыре связи, которые были правилами-договорённостями и потому
 * разъезжались молча. Аудит 2026-07-30 показал общий механизм: правило записано верно, но
 * его нарушение ничем не ловится, — поэтому каждое из четырёх здесь становится проверкой.
 *
 * Модуль один намеренно: четыре отдельных теста на четыре греповых проверки — это четыре
 * новых сущности там, где хватает одной.
 */

export interface HygieneFinding {
  check: string;
  message: string;
}

/**
 * Порог размера `CLAUDE.md`.
 *
 * Это **ratchet, а не идеал**: рекомендация Anthropic — под 200 строк
 * (https://code.claude.com/docs/en/memory), у нас 245 при длинных строках. Смысл порога не
 * в достижении идеала, а в запрете отката: 2026-07-28 файл сократили с 58 454 до 47 112
 * байт, и за два дня он вернулся к 55 094 — потому что ничто не мешало. Замер по символам,
 * а не по строкам: строки здесь намеренно длинные, а в контекст едут символы.
 *
 * Снижать порог по мере выноса знания в навыки — можно и нужно. Повышать — только вместе с
 * ответом на вопрос, почему знание не уехало в навык.
 */
export const CLAUDE_MD_CHAR_LIMIT = 35_000;

/**
 * Плагины доходят до субагента не через `skills:` (там их нет), а текстовым указателем в
 * обёртке. Пока эту связь никто не сверял, она уже рвалась: коммит `2a49ed8` — «Подключить
 * плагины к обёрткам агентов: раньше о них знал только индекс». `instruction-lint`
 * проверяет обратное направление (что упомянутый навык существует), а не то, что нужный
 * плагин упомянут там, где он нужен.
 */
export const requiredPluginPointers: Readonly<Record<string, readonly string[]>> = {
  "figma-ds": ["design", "design-generator", "frontend", "qa-review"],
  "ui-craft": ["design", "design-generator", "frontend", "qa-review"],
  // Аудит подсистемы — работа оркестратора: специалисты исполняют стадию, а не аудируют
  // систему (`.claude/agents/orchestrator.md`).
  "subsystem-audit": ["orchestrator"],
};

export function checkClaudeMdSize(root = process.cwd()): HygieneFinding[] {
  const file = join(root, "CLAUDE.md");
  if (!existsSync(file)) {
    return [{ check: "claude-md-size", message: "CLAUDE.md not found at repository root." }];
  }

  const size = readFileSync(file, "utf8").length;
  if (size <= CLAUDE_MD_CHAR_LIMIT) return [];

  return [{
    check: "claude-md-size",
    message:
      `CLAUDE.md is ${size} characters, over the ${CLAUDE_MD_CHAR_LIMIT} ratchet. ` +
      "The index loads into every session AND every subagent, so growth here is paid on every turn. " +
      "Move mechanics of a library/tool into a skill or plugin and leave a pointer — do not raise the limit " +
      "without answering why the knowledge cannot live in a skill.",
  }];
}

export function checkPluginPointers(root = process.cwd()): HygieneFinding[] {
  const findings: HygieneFinding[] = [];

  for (const [plugin, wrappers] of Object.entries(requiredPluginPointers)) {
    const pluginDir = join(root, "plugins", plugin);
    if (!existsSync(pluginDir)) {
      findings.push({
        check: "plugin-pointer",
        message: `plugins/${plugin} is referenced as required but does not exist on disk.`,
      });
      continue;
    }

    for (const wrapper of wrappers) {
      const wrapperFile = join(root, ".claude/agents", `${wrapper}.md`);
      if (!existsSync(wrapperFile)) {
        findings.push({
          check: "plugin-pointer",
          message: `.claude/agents/${wrapper}.md is missing, so the '${plugin}' pointer cannot be delivered.`,
        });
        continue;
      }

      if (!readFileSync(wrapperFile, "utf8").includes(`${plugin}:`)) {
        findings.push({
          check: "plugin-pointer",
          message:
            `.claude/agents/${wrapper}.md never mentions plugin '${plugin}:'. ` +
            "A subagent sees only its wrapper and its skills — a plugin absent from the wrapper is invisible to it.",
        });
      }
    }
  }

  return findings;
}

/**
 * Одна строка в `styles.css`, снявшая дефект, который прошёл `vr:test`, `test-storybook`,
 * `qa:mobile` и axe: контейнеры стартуют со светлой системной темой, поэтому машинно его
 * увидеть было нельзя (нашёл человек глазами, 2026-07-29). Правило записано в §6.1 и в
 * навыке `shadcn-library`, но удаление самой строки ничего не ломало.
 */
export function checkFrontendThemeInvariants(root = process.cwd()): HygieneFinding[] {
  const file = join(root, "apps/frontend/src/styles.css");
  if (!existsSync(file)) return [];

  const content = readFileSync(file, "utf8");
  if (/@custom-variant\s+dark\s*\(/.test(content)) return [];

  return [{
    check: "dark-variant-binding",
    message:
      "apps/frontend/src/styles.css has no '@custom-variant dark (...)' declaration. " +
      "Without it Tailwind's dark: variant follows prefers-color-scheme, and registry components " +
      "carry dark variants in their classes — inputs and outline buttons go grey on a dark-themed OS " +
      "while the project declares no dark tokens. This defect passes vr:test, test-storybook, qa:mobile and axe.",
  }];
}

/**
 * Аудит 07-28 нашёл пять тестов, которые не запускались никогда (включая точку обхода
 * anti-backdating). Состояние починили — механизм нет: связь «файл `test-*.ts` → скрипт →
 * строка в агрегаторе» держалась вручную.
 */
export function checkTestAggregatorCoverage(root = process.cwd()): HygieneFinding[] {
  const findings: HygieneFinding[] = [];
  const runtimeDir = join(root, "runtime/typescript");
  const packageFile = join(root, "package.json");
  if (!existsSync(runtimeDir) || !existsSync(packageFile)) return findings;

  const scripts = JSON.parse(readFileSync(packageFile, "utf8")).scripts as Record<string, string>;
  const aggregator = scripts["workflow:test-agentic"] ?? "";
  const aggregated = new Set([...aggregator.matchAll(/yarn (workflow:test-[a-z0-9-]+)/g)].map((m) => m[1]));

  const testFiles = readdirSync(runtimeDir)
    .filter((name) => name.startsWith("test-") && name.endsWith(".ts"))
    .map((name) => `runtime/typescript/${name}`);

  for (const testFile of testFiles) {
    const owner = Object.entries(scripts).find(([, command]) => command.includes(testFile));
    if (!owner) {
      findings.push({
        check: "test-aggregator-coverage",
        message: `${testFile} has no package.json script — nothing ever runs it.`,
      });
      continue;
    }

    const [scriptName] = owner;
    // Агрегатор запускает скрипты по имени; сам агрегатор в себя не входит.
    if (scriptName === "workflow:test-agentic") continue;
    if (!aggregated.has(scriptName)) {
      findings.push({
        check: "test-aggregator-coverage",
        message:
          `script '${scriptName}' (${testFile}) is not part of 'workflow:test-agentic'. ` +
          "A test outside the aggregator is a test nobody runs.",
      });
    }
  }

  return findings;
}

export interface AbandonedWorktree {
  path: string;
  head: string;
}

/**
 * Брошенные worktree агентов в `.claude/worktrees/<ветка>/`.
 *
 * Вред не в занятом месте, а в шуме поиска: каждая копия удваивает выдачу любого грепа и
 * `Glob` по репозиторию, то есть система проверяет себя по удвоенной реальности (аудит
 * 2026-07-30 нашёл копию на 15 МБ и 172 файла `.md`; в первом же поиске по `.claude` 25
 * строк из 28 пришли из неё). Симптом до этого лечили точечно — исключением в
 * `audit-docs.mjs`, про которое остальные потребители не знают.
 *
 * Только предупреждение и никогда не ошибка, по образцу проверки глобальных навыков:
 * worktree живой параллельной сессии удалять нельзя, а её наличие — нормальное состояние
 * машины. Брошенной считается только та, у которой нечего терять: чистое дерево и HEAD уже
 * влит в основную ветку.
 */
/**
 * Окно, в течение которого свежая worktree считается рабочей, а не брошенной.
 *
 * Claude Code создаёт worktree агенту сам (`isolation: "worktree"`), и в первые минуты она
 * выглядит ровно как брошенная: дерево чистое, HEAD совпадает с основной ветвью. Без этого
 * окна `doctor` предлагал бы удалить каталог у работающего агента — проверено собственным
 * тестом, где worktree, созданная секунду назад, попадала в выдачу.
 */
export const WORKTREE_IDLE_MINUTES = 60;

export function detectAbandonedWorktrees(root = process.cwd()): AbandonedWorktree[] {
  let listing: string;
  try {
    listing = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // Не git-репозиторий или git недоступен — проверять нечего.
    return [];
  }

  const abandoned: AbandonedWorktree[] = [];
  const blocks = listing.split(/\r?\n\r?\n/).filter((block) => block.trim());

  // Основная ветка берётся из первого блока — это ветка основного рабочего дерева.
  // Хардкод `main` здесь был бы молчаливым отказом: в репозитории с `master` вызов
  // merge-base падал бы в catch, и проверка всегда возвращала бы «брошенных нет».
  const mainBranch = blocks[0]?.match(/^branch refs\/heads\/(.+)$/m)?.[1];
  if (!mainBranch) return [];

  for (const [index, block] of blocks.entries()) {
    // Первый блок — основное рабочее дерево, оно не worktree агента.
    if (index === 0) continue;

    const path = block.match(/^worktree (.+)$/m)?.[1];
    const head = block.match(/^HEAD ([0-9a-f]+)$/m)?.[1];
    if (!path || !head) continue;

    try {
      const dirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
        cwd: path,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (dirty) continue;

      // `--is-ancestor` завершается кодом 1, если коммит ещё не влит: тогда в worktree
      // лежит работа, которой больше нигде нет.
      execFileSync("git", ["merge-base", "--is-ancestor", head, mainBranch], {
        cwd: root,
        stdio: "ignore",
      });

      const idleMinutes = (Date.now() - statSync(path).mtimeMs) / 60_000;
      if (idleMinutes < WORKTREE_IDLE_MINUTES) continue;
    } catch {
      continue;
    }

    abandoned.push({ path, head });
  }

  return abandoned;
}

export function collectStudioHygieneFindings(root = process.cwd()): HygieneFinding[] {
  return [
    ...checkClaudeMdSize(root),
    ...checkPluginPointers(root),
    ...checkFrontendThemeInvariants(root),
    ...checkTestAggregatorCoverage(root),
  ];
}

export function validateStudioHygiene(root = process.cwd()): string[] {
  return collectStudioHygieneFindings(root).map((finding) => `[${finding.check}] ${finding.message}`);
}

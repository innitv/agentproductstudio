/**
 * Аудит документации: ловит расхождения между текстом документов и фактическим
 * состоянием репозитория.
 *
 * Зона покрытия (см. `documentationRoots` / `standaloneFiles`):
 * корневые `README.md`/`CLAUDE.md`/`AGENTS.md`/`COMMANDS.md`, `docs/**`,
 * `agent-pack/**`, `.claude/**`, `plugins/**`, `outputs/README.md`,
 * `research/README.md`.
 *
 * Проверки:
 *   1. Обязательные корневые документы существуют.
 *   2. Пути в backticks указывают на существующие файлы/каталоги.
 *   3. Markdown-ссылки `[текст](путь)` ведут на существующие файлы.
 *   4. Упомянутые `yarn <script>` существуют в `package.json`.
 *   5. Каждый скрипт `package.json` описан в `COMMANDS.md` (он заявлен полным справочником).
 *   6. Каждый MCP-сервер из `.mcp.json` упомянут в `README.md` и `CLAUDE.md`.
 *
 * Защита от ложных срабатываний (скрипт стоит в pre-commit через `qa:quick`):
 *   - содержимое fenced code blocks не проверяется;
 *   - кандидаты с плейсхолдерами (`<slug>`, `{...}`, `${...}`, `*`, `...`) отбрасываются;
 *   - внешние URL, якоря и `mailto:` не проверяются;
 *   - `путь:123` и `путь:12-34` нормализуются в путь (это ссылка на строку, а не файл);
 *   - markdown-ссылка считается валидной, если резолвится либо относительно файла,
 *     либо относительно корня репозитория (в проекте используются оба стиля);
 *   - датированные снимки (`*-YYYY-MM-DD.md`) не сканируются на пути: они фиксируют
 *     состояние на свою дату и законно упоминают уже удалённые каталоги;
 *   - строка или файл с маркером `docs-audit-ignore` в HTML-комментарии пропускается
 *     (для прозы вида «каталога X никогда не существовало»).
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = process.cwd();

/** Обязательные корневые документы: их отсутствие — ошибка сама по себе. */
const requiredRootDocs = ["README.md", "CLAUDE.md", "AGENTS.md", "COMMANDS.md"];

/** Каталоги, markdown внутри которых сканируется целиком. */
const documentationRoots = ["docs", "agent-pack", ".claude", "plugins"];

/** Отдельные файлы вне этих каталогов. */
const standaloneFiles = [...requiredRootDocs, "outputs/README.md", "research/README.md"];

/** Префиксы, по которым backtick-строка опознаётся как путь в репозитории. */
const pathLikePrefixes = [
  ".claude/",
  ".githooks/",
  ".github/",
  "agent-pack/",
  "apps/",
  "design/",
  "docs/",
  "integrations/",
  "outputs/",
  "plugins/",
  "research/",
  "runtime/",
  "tests/",
  "tooling/",
];

/** Корневые файлы, упоминаемые без префикса-каталога. */
const rootFiles = new Set([
  ".env.example",
  ".gitignore",
  ".mcp.json",
  "AGENTS.md",
  "CLAUDE.md",
  "COMMANDS.md",
  "README.md",
  "components.json",
  "package.json",
  "playwright.config.ts",
  "tsconfig.json",
  "yarn.lock",
]);

/** Первые токены после `yarn`, которые являются бинарями, а не скриптами package.json. */
const yarnPassthroughBinaries = new Set([
  "add",
  "dlx",
  "install",
  "node",
  "playwright",
  "run",
  "tsx",
  "workspace",
]);

/*
 * `worktrees` — временные git worktree агентов (`.claude/worktrees/<ветка>/`).
 * Это КОПИЯ репозитория внутри репозитория: аудит проверял бы одни и те же
 * документы дважды, причём во второй раз относительные пути из копии не
 * разрешаются, и падал на файле, которого в рабочем дереве никто не менял.
 * Живой worktree параллельной сессии удалять нельзя, поэтому исключение.
 */
const skippedDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "test-results",
  "worktrees",
]);
const snapshotFilePattern = /-\d{4}-\d{2}-\d{2}\.md$/;
const ignoreMarker = "docs-audit-ignore";

const errors = [];
const existsCache = new Map();
const stats = { pathReferences: 0, links: 0 };

function pathExists(relativePath) {
  if (!existsCache.has(relativePath)) {
    existsCache.set(relativePath, existsSync(join(root, relativePath)));
  }

  return existsCache.get(relativePath);
}

// ---------------------------------------------------------------------------
// 1. Обязательные корневые документы
// ---------------------------------------------------------------------------

for (const file of requiredRootDocs) {
  if (!existsSync(join(root, file))) {
    errors.push(`${file}: обязательный документ отсутствует`);
  }
}

// ---------------------------------------------------------------------------
// 2-3. Сканирование markdown: пути в backticks и markdown-ссылки
// ---------------------------------------------------------------------------

const markdownFiles = collectMarkdownFiles();
const yarnMentions = new Map();

for (const file of markdownFiles) {
  const content = readFileSync(join(root, file), "utf8");
  const fileIgnored = snapshotFilePattern.test(file) || content.includes(`${ignoreMarker}-file`);
  const lines = stripFencedBlocks(content);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lineIgnored = fileIgnored || line.includes(ignoreMarker);

    for (const span of line.matchAll(/`([^`\n]+)`/g)) {
      const raw = span[1].trim();

      // Датированные снимки и строки с маркером не проверяются целиком: они законно
      // упоминают состояние, которого уже нет.
      if (lineIgnored) {
        continue;
      }

      collectYarnMention(raw, file, lineNumber);

      const candidate = normalizeBacktickPath(raw);
      if (candidate) {
        stats.pathReferences += 1;
      }

      if (candidate && !pathExists(candidate)) {
        errors.push(`${file}:${lineNumber}: путь не существует: \`${raw}\``);
      }
    }

    if (lineIgnored) {
      return;
    }

    for (const link of line.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)) {
      const raw = link[1].trim();
      const target = normalizeLinkTarget(raw);
      if (!target) {
        continue;
      }

      stats.links += 1;

      const fromFile = normalizeRelative(join(dirname(file), target));
      const fromRoot = target.replace(/^\//, "");
      if (!pathExists(fromFile) && !pathExists(fromRoot)) {
        errors.push(`${file}:${lineNumber}: ссылка ведёт в никуда: (${raw})`);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 4-5. yarn-команды в обе стороны
// ---------------------------------------------------------------------------

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const scriptNames = Object.keys(packageJson.scripts ?? {});
const scriptSet = new Set(scriptNames);

for (const [name, origin] of yarnMentions) {
  if (!scriptSet.has(name) && !yarnPassthroughBinaries.has(name)) {
    errors.push(`${origin}: команда \`yarn ${name}\` отсутствует в package.json`);
  }
}

const commandsPath = join(root, "COMMANDS.md");
if (existsSync(commandsPath)) {
  const commandsDoc = readFileSync(commandsPath, "utf8");
  const documentedGlobs = [...commandsDoc.matchAll(/`([a-z0-9:_-]+)\*`/g)].map((match) => match[1]);

  for (const name of scriptNames) {
    const documented =
      commandsDoc.includes(name) || documentedGlobs.some((glob) => name.startsWith(glob));
    if (!documented) {
      errors.push(`COMMANDS.md: скрипт \`yarn ${name}\` не описан в справочнике команд`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. MCP-серверы из .mcp.json упомянуты в README.md и CLAUDE.md
// ---------------------------------------------------------------------------

const mcpConfigPath = join(root, ".mcp.json");
if (existsSync(mcpConfigPath)) {
  const mcpServers = Object.keys(JSON.parse(readFileSync(mcpConfigPath, "utf8")).mcpServers ?? {});

  for (const doc of ["README.md", "CLAUDE.md"]) {
    const docPath = join(root, doc);
    if (!existsSync(docPath)) {
      continue;
    }

    const text = readFileSync(docPath, "utf8");
    for (const server of mcpServers) {
      if (!text.includes(server)) {
        errors.push(`${doc}: MCP-сервер \`${server}\` из .mcp.json не упомянут`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Самопроверка: сломанный сканер обязан падать, а не «проходить» на пустоте
// ---------------------------------------------------------------------------

const minimumMarkdownFiles = 100;
const minimumPathReferences = 250;

if (markdownFiles.length < minimumMarkdownFiles || stats.pathReferences < minimumPathReferences) {
  errors.push(
    `самопроверка аудита: найдено ${markdownFiles.length} md-файлов и ` +
      `${stats.pathReferences} путей (ожидалось не меньше ${minimumMarkdownFiles} и ` +
      `${minimumPathReferences}). Скорее всего сломан обход дерева или отбор кандидатов — ` +
      "зелёный результат в таком состоянии ничего не гарантирует.",
  );
}

// ---------------------------------------------------------------------------

if (errors.length) {
  console.error("Documentation audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Documentation audit passed: ${markdownFiles.length} md-файлов, ` +
    `${stats.pathReferences} путей в backticks, ${stats.links} markdown-ссылок, ` +
    `${yarnMentions.size} yarn-команд, ${scriptNames.length} скриптов package.json.`,
);

// ---------------------------------------------------------------------------
// Вспомогательные функции
// ---------------------------------------------------------------------------

function collectMarkdownFiles() {
  const files = [];

  for (const directory of documentationRoots) {
    if (existsSync(join(root, directory))) {
      walkMarkdown(directory, files);
    }
  }

  for (const file of standaloneFiles) {
    if (existsSync(join(root, file))) {
      files.push(file);
    }
  }

  return files;
}

function walkMarkdown(relativeDir, files) {
  for (const entry of readdirSync(join(root, relativeDir), { withFileTypes: true })) {
    if (skippedDirectories.has(entry.name)) {
      continue;
    }

    const relativePath = `${relativeDir}/${entry.name}`;
    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      walkMarkdown(relativePath, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(relativePath);
    }
  }
}

/** Вырезает содержимое fenced code blocks, сохраняя нумерацию строк. */
function stripFencedBlocks(markdown) {
  let insideFence = false;

  return markdown.split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      return "";
    }

    return insideFence ? "" : line;
  });
}

/**
 * Возвращает нормализованный путь, если backtick-строка похожа на путь в репозитории,
 * иначе `null`.
 */
function normalizeBacktickPath(reference) {
  if (!reference) {
    return null;
  }

  // Плейсхолдеры, glob-шаблоны, перечисления и фразы — не проверяем.
  if (/[<>{}$*|,\s]/.test(reference)) {
    return null;
  }

  if (reference.endsWith("...") || /^\.+$/.test(reference)) {
    return null;
  }

  const normalized = reference
    .replaceAll("\\", "/")
    .replace(/:\d+(?:[-–]\d+)?$/, "") // `файл.ts:120` и `файл.md:12-34` — ссылка на строку
    .replace(/\/+$/, "");

  if (!normalized) {
    return null;
  }

  const isPathLike =
    rootFiles.has(normalized) || pathLikePrefixes.some((prefix) => normalized.startsWith(prefix));

  return isPathLike ? normalized : null;
}

/**
 * Возвращает путь из markdown-ссылки, если её вообще имеет смысл проверять,
 * иначе `null`.
 */
function normalizeLinkTarget(target) {
  if (!target || /^(https?:|mailto:|ftp:|tel:|#|data:)/i.test(target)) {
    return null;
  }

  if (/[<>{}$*]/.test(target)) {
    return null;
  }

  const withoutAnchor = target.split("#")[0].split("?")[0];
  if (!withoutAnchor || /^\.+$/.test(withoutAnchor)) {
    return null;
  }

  // Только ASCII-пути: `[текст](путь)` в прозе — это пример синтаксиса, а не ссылка.
  if (!/^[A-Za-z0-9._/@-]+$/.test(withoutAnchor)) {
    return null;
  }

  if (!withoutAnchor.includes("/") && !withoutAnchor.includes(".")) {
    return null;
  }

  return withoutAnchor.replace(/:\d+(?:[-–]\d+)?$/, "").replace(/\/+$/, "");
}

function normalizeRelative(path) {
  return relative(root, join(root, path)).replaceAll("\\", "/");
}

function collectYarnMention(reference, file, lineNumber) {
  const match = /^yarn\s+([^\s]+)/.exec(reference);
  if (!match) {
    return;
  }

  const name = match[1];
  if (name.includes("*") || name.includes("<") || name.includes("$")) {
    return;
  }

  if (!yarnMentions.has(name)) {
    yarnMentions.set(name, `${file}:${lineNumber}`);
  }
}

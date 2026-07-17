#!/usr/bin/env node
// Ставит ссылку из пользовательского skills-каталога на плагин студии.
//
// Зачем: плагины в `plugins/` — единый источник переносимого знания (см. repo-map).
// Claude Code грузит их как skills-directory plugins из `~/.claude/skills/<name>`,
// поэтому нужна ссылка, а не копия: копия неизбежно разъедется с репо.
//
// Путь к репо вычисляется через `git rev-parse`, а не хардкодится: переименовал или
// перенёс репозиторий — просто перезапусти скрипт.
//
// Использование:
//   yarn plugin:link            — все плагины из plugins/
//   yarn plugin:link figma-ds   — только указанный
//   yarn plugin:link --check    — только проверить, ничего не менять

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, lstatSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const wanted = args.filter((a) => !a.startsWith("--"));

function repoRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    console.error("[plugin:link] Не найден git-репозиторий. Запускай изнутри репо студии.");
    process.exit(1);
  }
}

const root = repoRoot();
const pluginsDir = join(root, "plugins");
const skillsDir = join(homedir(), ".claude", "skills");

if (!existsSync(pluginsDir)) {
  console.error(`[plugin:link] Нет каталога ${pluginsDir}.`);
  process.exit(1);
}

const plugins = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => (wanted.length === 0 ? true : wanted.includes(name)));

if (plugins.length === 0) {
  console.error(`[plugin:link] Плагины не найдены${wanted.length ? `: ${wanted.join(", ")}` : ""}.`);
  process.exit(1);
}

// Ссылка считается корректной, только если реально указывает на этот плагин.
// Иначе junction, оставшийся от прежнего пути репо, молча выглядел бы рабочим.
function linkState(linkPath, target) {
  if (!existsSync(linkPath)) return "missing";
  let stat;
  try {
    stat = lstatSync(linkPath);
  } catch {
    return "missing";
  }
  const isLink = stat.isSymbolicLink() || (process.platform === "win32" && stat.isDirectory());
  if (!isLink) return "occupied";
  try {
    return realpathSync(linkPath) === realpathSync(target) ? "ok" : "stale";
  } catch {
    return "stale";
  }
}

function createLink(linkPath, target) {
  if (process.platform === "win32") {
    // Junction, а не symlink: не требует прав администратора и Developer Mode.
    execFileSync("cmd", ["/c", "mklink", "/J", linkPath, target], { stdio: "pipe" });
  } else {
    execFileSync("ln", ["-s", target, linkPath], { stdio: "pipe" });
  }
}

let failed = 0;
for (const name of plugins) {
  const target = resolve(pluginsDir, name);
  const linkPath = join(skillsDir, name);
  const state = linkState(linkPath, target);

  if (state === "ok") {
    console.log(`[plugin:link] ${name}: ссылка на месте -> ${target}`);
    continue;
  }
  if (state === "occupied") {
    console.error(`[plugin:link] ${name}: ПРОПУЩЕН — ${linkPath} существует и это не ссылка.`);
    console.error("             Похоже на настоящую копию skill. Разберись вручную: две копии = дрейф.");
    failed += 1;
    continue;
  }
  if (checkOnly) {
    console.error(`[plugin:link] ${name}: ${state === "stale" ? "ссылка ведёт не туда" : "ссылки нет"}.`);
    failed += 1;
    continue;
  }
  try {
    if (state === "stale") {
      execFileSync(
        process.platform === "win32" ? "cmd" : "rm",
        process.platform === "win32" ? ["/c", "rmdir", linkPath] : ["-r", linkPath],
        { stdio: "pipe" },
      );
    }
    createLink(linkPath, target);
    console.log(`[plugin:link] ${name}: ссылка создана -> ${target}`);
  } catch (error) {
    console.error(`[plugin:link] ${name}: не удалось создать ссылку: ${error.message}`);
    failed += 1;
  }
}

if (failed > 0) process.exit(1);
console.log(
  checkOnly
    ? "[plugin:link] Проверка пройдена."
    : "[plugin:link] Готово. Перезапусти Claude Code, чтобы плагин подхватился.",
);

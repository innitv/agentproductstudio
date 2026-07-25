// Сверка и автоведение `research/registry.json`.
//
// Чем этот реестр отличается от `outputs/registry.json` — и почему автоведение здесь
// принципиально частичное.
//
// 1. Цена рассинхрона другая. `outputs/registry.json` читает `tooling/scripts/cleanup-outputs.mjs`
//    и уводит незарегистрированный каталог в `outputs/temp/` — то есть забытая запись означала
//    потерю продуктового каталога. `research/registry.json` не читает НИ ОДИН скрипт уборки
//    (в `cleanup-outputs.mjs` слова `research` нет вовсе), он чисто навигационный индекс.
//    Значит задача здесь — точность, а не защита от разрушения.
//
// 2. Точки создания run нет. `outputs/<slug>/<date>` создаёт ровно одна функция
//    (`runLandingWorkflow` из `workflow:start`), поэтому там автозапись перекрывает все случаи.
//    Research-run создаётся оркестратором/агентом обычным `Write` по правилу
//    `research/projects/<slug>/<YYYY-MM-DD>/` — команды-аналога `research:start` не существует,
//    и перехватить создание нечем. Единственный runtime-туда-заход — `yarn research:run <dir>`,
//    и он ТРЕБУЕТ уже существующий каталог. Поэтому:
//      - автозапись подключена к `research:run` (перекрывает run, прошедшие через runtime);
//      - основная защита — сверка `yarn research:registry-sync`, которая ловит любой каталог
//        независимо от того, как он появился.
//
// 3. Автоудаления нет. Архивация research (`research/archive/<slug>/`) выполняется вручную:
//    `workflow:archive` отказывается работать вне `outputs/` (`assertArchivableRun`). Удаление
//    записи закрывает та же сверка: слаг, уехавший в архив, пропадает из `research/projects/`
//    и попадает в `missing_on_disk`.
//
// Границы. Зоны хранения `projects/`, `archive/`, `temp/` — это не research-slug. Слаги живут
// ВНУТРИ `research/projects/`, а реестр лежит уровнем выше, в `research/registry.json`.

import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

/** Зоны хранения в `research/`, которые никогда не являются research-slug. */
export const researchReservedDirs = ["projects", "archive", "temp"] as const;

export interface ResearchRegistry {
  activeResearchProjects: string[];
  [key: string]: unknown;
}

export type ResearchRegistryChangeAction = "added" | "removed" | "unchanged" | "skipped";

export interface ResearchRegistryChange {
  action: ResearchRegistryChangeAction;
  slug?: string;
  registry_path?: string;
  active_research_projects: string[];
  /** Причина, по которой реестр не трогали (только для `skipped`). */
  reason?: string;
}

export interface ResearchRegistryDiff {
  research_root: string;
  projects_root: string;
  registry_path: string;
  registry_exists: boolean;
  active_research_projects: string[];
  actual_slugs: string[];
  /** Каталог есть в `research/projects/`, записи в реестре нет — индекс не находит проект. */
  missing_in_registry: string[];
  /** Запись в реестре есть, каталога нет — обычно слаг уехал в `research/archive/`. */
  missing_on_disk: string[];
  in_sync: boolean;
}

export interface ResearchRegistrySyncResult extends ResearchRegistryDiff {
  fixed: boolean;
  added: string[];
  removed: string[];
}

/**
 * Определяет корень `research/` по каталогу run вида `<...>/research/projects/<slug>/<date>`.
 * Возвращает `undefined` для любой другой формы — в том числе для `research/temp/<slug>/<date>`
 * и `research/archive/<slug>/<date>`: временные и архивные run в реестр активных не попадают.
 */
export function resolveResearchRootForRun(runDir: string): string | undefined {
  const resolved = resolve(runDir);
  const slugDir = dirname(resolved);
  const projectsRoot = dirname(slugDir);
  const researchRoot = dirname(projectsRoot);

  if (basename(projectsRoot).toLowerCase() !== "projects") {
    return undefined;
  }

  if (basename(researchRoot).toLowerCase() !== "research") {
    return undefined;
  }

  return researchRoot;
}

export function resolveResearchRegistryPath(researchRoot: string): string {
  return join(resolve(researchRoot), "registry.json");
}

export function resolveResearchProjectsRoot(researchRoot: string): string {
  return join(resolve(researchRoot), "projects");
}

export async function readResearchRegistry(researchRoot: string): Promise<ResearchRegistry | undefined> {
  const registryPath = resolveResearchRegistryPath(researchRoot);
  if (!existsSync(registryPath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }

    const record = parsed as Record<string, unknown>;
    const activeResearchProjects = Array.isArray(record.activeResearchProjects)
      ? record.activeResearchProjects.filter((item): item is string => typeof item === "string")
      : [];
    return { ...record, activeResearchProjects };
  } catch {
    return undefined;
  }
}

export async function writeResearchRegistry(researchRoot: string, registry: ResearchRegistry): Promise<void> {
  await writeFile(
    resolveResearchRegistryPath(researchRoot),
    `${JSON.stringify(registry, null, 2)}\n`,
    "utf8",
  );
}

/**
 * Идемпотентно вносит слаг в `activeResearchProjects`.
 * Порядок массива уважается так же, как в `outputs-registry.ts`: отсортированный остаётся
 * отсортированным, чужой осознанный порядок не переписывается.
 */
export async function registerActiveResearchProject(
  researchRoot: string,
  slug: string,
): Promise<ResearchRegistryChange> {
  const guard = guardResearchRoot(researchRoot);
  if (guard) {
    return guard;
  }

  const registryPath = resolveResearchRegistryPath(researchRoot);
  const registry = (await readResearchRegistry(researchRoot)) ?? { activeResearchProjects: [] };

  if (registry.activeResearchProjects.includes(slug)) {
    return {
      action: "unchanged",
      slug,
      registry_path: registryPath,
      active_research_projects: registry.activeResearchProjects,
    };
  }

  registry.activeResearchProjects = insertSlug(registry.activeResearchProjects, slug);
  await writeResearchRegistry(researchRoot, registry);
  return {
    action: "added",
    slug,
    registry_path: registryPath,
    active_research_projects: registry.activeResearchProjects,
  };
}

/** Убирает слаг из `activeResearchProjects`. Идемпотентно. */
export async function unregisterActiveResearchProject(
  researchRoot: string,
  slug: string,
): Promise<ResearchRegistryChange> {
  const guard = guardResearchRoot(researchRoot);
  if (guard) {
    return guard;
  }

  const registryPath = resolveResearchRegistryPath(researchRoot);
  const registry = await readResearchRegistry(researchRoot);
  if (!registry) {
    return {
      action: "skipped",
      slug,
      registry_path: registryPath,
      active_research_projects: [],
      reason: "registry.json не найден",
    };
  }

  if (!registry.activeResearchProjects.includes(slug)) {
    return {
      action: "unchanged",
      slug,
      registry_path: registryPath,
      active_research_projects: registry.activeResearchProjects,
    };
  }

  registry.activeResearchProjects = registry.activeResearchProjects.filter((item) => item !== slug);
  await writeResearchRegistry(researchRoot, registry);
  return {
    action: "removed",
    slug,
    registry_path: registryPath,
    active_research_projects: registry.activeResearchProjects,
  };
}

/**
 * Вызывается из `yarn research:run` — единственной runtime-точки, которая работает с
 * research-run. Run вне `research/projects/<slug>/<date>` (продуктовый `outputs/**`,
 * `research/temp/**`, `research/archive/**`) реестр не трогает.
 */
export async function registerResearchRunInRegistry(runDir: string): Promise<ResearchRegistryChange> {
  const researchRoot = resolveResearchRootForRun(runDir);
  if (!researchRoot) {
    return {
      action: "skipped",
      active_research_projects: [],
      reason: `run вне research/projects/<slug>/<date>: ${runDir}`,
    };
  }

  return registerActiveResearchProject(researchRoot, basename(dirname(resolve(runDir))));
}

/** Сверяет `activeResearchProjects` с фактическими каталогами `research/projects/*`. */
export async function diffResearchRegistry(researchRoot: string): Promise<ResearchRegistryDiff> {
  const root = resolve(researchRoot);
  const projectsRoot = resolveResearchProjectsRoot(root);
  const registry = await readResearchRegistry(root);
  const activeResearchProjects = registry?.activeResearchProjects ?? [];
  const actualSlugs = await listResearchSlugs(projectsRoot);

  const missingInRegistry = actualSlugs.filter((slug) => !activeResearchProjects.includes(slug));
  const missingOnDisk = activeResearchProjects.filter((slug) => !actualSlugs.includes(slug));

  return {
    research_root: root,
    projects_root: projectsRoot,
    registry_path: resolveResearchRegistryPath(root),
    registry_exists: Boolean(registry),
    active_research_projects: activeResearchProjects,
    actual_slugs: actualSlugs,
    missing_in_registry: missingInRegistry,
    missing_on_disk: missingOnDisk,
    in_sync: missingInRegistry.length === 0 && missingOnDisk.length === 0,
  };
}

/** Сверка с опциональной починкой. Без `fix` только сообщает расхождение. */
export async function syncResearchRegistry(options: {
  researchRoot?: string;
  fix?: boolean;
} = {}): Promise<ResearchRegistrySyncResult> {
  const root = resolve(options.researchRoot ?? join(process.cwd(), "research"));
  const diff = await diffResearchRegistry(root);

  if (!options.fix || diff.in_sync) {
    return { ...diff, fixed: false, added: [], removed: [] };
  }

  const registry = (await readResearchRegistry(root)) ?? { activeResearchProjects: [] };
  let next = registry.activeResearchProjects;
  for (const slug of diff.missing_in_registry) {
    next = insertSlug(next, slug);
  }
  next = next.filter((slug) => !diff.missing_on_disk.includes(slug));
  registry.activeResearchProjects = next;
  await writeResearchRegistry(root, registry);

  return {
    ...(await diffResearchRegistry(root)),
    fixed: true,
    added: diff.missing_in_registry,
    removed: diff.missing_on_disk,
  };
}

export function formatResearchRegistrySync(result: ResearchRegistrySyncResult): string {
  const lines = [
    "# Research Registry Sync",
    "",
    `- Mode: ${result.fixed ? "fix" : "report"}`,
    `- Registry: ${relative(process.cwd(), result.registry_path) || result.registry_path}`,
    `- Registry exists: ${result.registry_exists ? "yes" : "no"}`,
    `- Active research projects: ${result.active_research_projects.length}`,
    `- Directories on disk: ${result.actual_slugs.length}`,
    `- In sync: ${result.in_sync ? "yes" : "no"}`,
    "",
  ];

  if (result.fixed) {
    lines.push(
      `- Added to registry: ${result.added.join(", ") || "none"}`,
      `- Removed from registry: ${result.removed.join(", ") || "none"}`,
      "",
    );
  }

  if (result.in_sync) {
    lines.push("Реестр соответствует фактическому состоянию `research/projects/`.");
    return lines.join("\n");
  }

  if (result.missing_in_registry.length) {
    lines.push(
      "## Каталог есть, записи в реестре нет",
      "",
      "Навигационный индекс не находит эти проекты:",
      "",
      ...result.missing_in_registry.map((slug) => `- research/projects/${slug}`),
      "",
    );
  }

  if (result.missing_on_disk.length) {
    lines.push(
      "## Запись в реестре есть, каталога нет",
      "",
      "Обычно слаг уехал в `research/archive/` — запись пора убрать:",
      "",
      ...result.missing_on_disk.map((slug) => `- ${slug}`),
      "",
    );
  }

  lines.push("Починить: `yarn research:registry-sync --force`.");
  return lines.join("\n");
}

function guardResearchRoot(researchRoot: string): ResearchRegistryChange | undefined {
  const root = resolve(researchRoot);
  if (basename(root).toLowerCase() !== "research") {
    return { action: "skipped", active_research_projects: [], reason: `не корень research/: ${root}` };
  }

  if (!existsSync(root)) {
    return { action: "skipped", active_research_projects: [], reason: `каталог не найден: ${root}` };
  }

  return undefined;
}

function insertSlug(slugs: string[], slug: string): string[] {
  if (slugs.includes(slug)) {
    return slugs;
  }

  const wasSorted = slugs.every((item, index) => index === 0 || slugs[index - 1].localeCompare(item) <= 0);
  if (!wasSorted) {
    return [...slugs, slug];
  }

  const next = [...slugs, slug];
  next.sort((a, b) => a.localeCompare(b));
  return next;
}

async function listResearchSlugs(projectsRoot: string): Promise<string[]> {
  const items = await readdir(projectsRoot, { withFileTypes: true }).catch(() => []);
  return items
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => !researchReservedDirs.includes(name.toLowerCase() as (typeof researchReservedDirs)[number]))
    .sort((a, b) => a.localeCompare(b));
}

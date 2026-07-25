// Автоведение `outputs/registry.json`.
//
// Зачем. `tooling/scripts/cleanup-outputs.mjs` считает мусором любой каталог в
// `outputs/`, которого нет в `activeProducts`. Пока реестр вели руками, забытая
// запись означала, что одна команда уборки уводит живой продуктовый каталог в
// `outputs/temp/`. Предохранитель в скрипте ловит только ПОЛНОСТЬЮ пустой реестр —
// забытая запись при живом реестре по-прежнему опасна.
//
// Поэтому реестр ведёт runtime: `workflow:start` вносит слаг, `workflow:archive`
// убирает его, когда у слага не осталось ни одного каталога, а `workflow:registry-sync`
// сверяет реестр с фактическим состоянием диска и чинит расхождение по явному флагу.
//
// Границы. Зоны хранения (`temp/`, `archive/`, `products/`, `quarantine/`) — это не
// product-slug: они защищены в `cleanup-outputs.mjs` через `protectedItems` и в
// `activeProducts` не вносятся (иначе реестр активных продуктов начинает описывать
// инфраструктуру). Здесь тот же список работает как фильтр сверки.

import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

/** Зоны хранения в `outputs/`, которые никогда не являются product-slug. */
export const outputsReservedDirs = ["temp", "archive", "products", "quarantine"] as const;

/** Файлы в корне `outputs/`, которые не являются каталогами продуктов. */
const outputsReservedFiles = ["registry.json", "README.md", ".gitkeep"] as const;

export interface OutputsRegistry {
  activeProducts: string[];
  [key: string]: unknown;
}

export type RegistryChangeAction = "added" | "removed" | "unchanged" | "skipped";

export interface RegistryChange {
  action: RegistryChangeAction;
  slug?: string;
  registry_path?: string;
  active_products: string[];
  /** Причина, по которой реестр не трогали (только для `skipped`). */
  reason?: string;
}

export interface OutputsRegistryDiff {
  outputs_root: string;
  registry_path: string;
  registry_exists: boolean;
  active_products: string[];
  actual_slugs: string[];
  /** Каталог есть на диске, записи в реестре нет — именно это уводит продукт в `temp/`. */
  missing_in_registry: string[];
  /** Запись в реестре есть, каталога нет — реестр описывает несуществующее. */
  missing_on_disk: string[];
  in_sync: boolean;
}

export interface OutputsRegistrySyncResult extends OutputsRegistryDiff {
  fixed: boolean;
  added: string[];
  removed: string[];
}

/**
 * Определяет корень `outputs/` по каталогу run вида `<...>/outputs/<slug>/<date>`.
 * Возвращает `undefined`, если путь не такой формы — например для `outputs/temp/<slug>/<date>`
 * (там корнем оказался бы `outputs/temp`) или для архивных путей.
 */
export function resolveOutputsRootForRun(runDir: string): string | undefined {
  const resolved = resolve(runDir);
  const slugDir = dirname(resolved);
  const outputsRoot = dirname(slugDir);
  if (basename(outputsRoot).toLowerCase() !== "outputs") {
    return undefined;
  }

  if (outputsReservedDirs.includes(basename(slugDir).toLowerCase() as (typeof outputsReservedDirs)[number])) {
    return undefined;
  }

  return outputsRoot;
}

export function resolveRegistryPath(outputsRoot: string): string {
  return join(resolve(outputsRoot), "registry.json");
}

export async function readOutputsRegistry(outputsRoot: string): Promise<OutputsRegistry | undefined> {
  const registryPath = resolveRegistryPath(outputsRoot);
  if (!existsSync(registryPath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }

    const record = parsed as Record<string, unknown>;
    const activeProducts = Array.isArray(record.activeProducts)
      ? record.activeProducts.filter((item): item is string => typeof item === "string")
      : [];
    return { ...record, activeProducts };
  } catch {
    return undefined;
  }
}

export async function writeOutputsRegistry(outputsRoot: string, registry: OutputsRegistry): Promise<void> {
  const registryPath = resolveRegistryPath(outputsRoot);
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

/**
 * Идемпотентно вносит слаг в `activeProducts`.
 * Порядок: если массив был отсортирован по возрастанию, слаг вставляется в отсортированную
 * позицию; иначе дописывается в конец — чтобы не переписывать чужой осознанный порядок.
 */
export async function registerActiveProduct(outputsRoot: string, slug: string): Promise<RegistryChange> {
  const guard = guardOutputsRoot(outputsRoot);
  if (guard) {
    return guard;
  }

  const registryPath = resolveRegistryPath(outputsRoot);
  const registry = (await readOutputsRegistry(outputsRoot)) ?? { activeProducts: [] };

  if (registry.activeProducts.includes(slug)) {
    return { action: "unchanged", slug, registry_path: registryPath, active_products: registry.activeProducts };
  }

  registry.activeProducts = insertSlug(registry.activeProducts, slug);
  await writeOutputsRegistry(outputsRoot, registry);
  return { action: "added", slug, registry_path: registryPath, active_products: registry.activeProducts };
}

/** Убирает слаг из `activeProducts`. Идемпотентно. */
export async function unregisterActiveProduct(outputsRoot: string, slug: string): Promise<RegistryChange> {
  const guard = guardOutputsRoot(outputsRoot);
  if (guard) {
    return guard;
  }

  const registryPath = resolveRegistryPath(outputsRoot);
  const registry = await readOutputsRegistry(outputsRoot);
  if (!registry) {
    return {
      action: "skipped",
      slug,
      registry_path: registryPath,
      active_products: [],
      reason: "registry.json не найден",
    };
  }

  if (!registry.activeProducts.includes(slug)) {
    return { action: "unchanged", slug, registry_path: registryPath, active_products: registry.activeProducts };
  }

  registry.activeProducts = registry.activeProducts.filter((item) => item !== slug);
  await writeOutputsRegistry(outputsRoot, registry);
  return { action: "removed", slug, registry_path: registryPath, active_products: registry.activeProducts };
}

/**
 * Вызывается при создании run (`workflow:start`). Вносит слаг run в реестр.
 * Run вне `outputs/<slug>/<date>` (например `outputs/temp/...`) реестр не трогает.
 */
export async function registerRunInRegistry(runDir: string): Promise<RegistryChange> {
  const outputsRoot = resolveOutputsRootForRun(runDir);
  if (!outputsRoot) {
    return { action: "skipped", active_products: [], reason: `run вне outputs/<slug>/<date>: ${runDir}` };
  }

  return registerActiveProduct(outputsRoot, basename(dirname(resolve(runDir))));
}

/**
 * Вызывается после успешной архивации run (`workflow:archive --force`).
 * Слаг уходит из реестра, только если у него не осталось ни одного каталога в
 * `outputs/<slug>/`; другие даты того же слага запись сохраняют.
 */
export async function syncRegistryAfterArchive(runDir: string): Promise<RegistryChange> {
  const outputsRoot = resolveOutputsRootForRun(runDir);
  if (!outputsRoot) {
    return { action: "skipped", active_products: [], reason: `run вне outputs/<slug>/<date>: ${runDir}` };
  }

  const slugDir = dirname(resolve(runDir));
  const slug = basename(slugDir);
  const remaining = await listRunDirs(slugDir);
  if (remaining.length > 0) {
    const registry = await readOutputsRegistry(outputsRoot);
    return {
      action: "unchanged",
      slug,
      registry_path: resolveRegistryPath(outputsRoot),
      active_products: registry?.activeProducts ?? [],
      reason: `у слага осталось каталогов: ${remaining.length}`,
    };
  }

  return unregisterActiveProduct(outputsRoot, slug);
}

/** Сверяет `activeProducts` с фактическими каталогами `outputs/*`. */
export async function diffOutputsRegistry(outputsRoot: string): Promise<OutputsRegistryDiff> {
  const root = resolve(outputsRoot);
  const registryPath = resolveRegistryPath(root);
  const registry = await readOutputsRegistry(root);
  const activeProducts = registry?.activeProducts ?? [];
  const actualSlugs = await listProductSlugs(root);

  const missingInRegistry = actualSlugs.filter((slug) => !activeProducts.includes(slug));
  const missingOnDisk = activeProducts.filter((slug) => !actualSlugs.includes(slug));

  return {
    outputs_root: root,
    registry_path: registryPath,
    registry_exists: Boolean(registry),
    active_products: activeProducts,
    actual_slugs: actualSlugs,
    missing_in_registry: missingInRegistry,
    missing_on_disk: missingOnDisk,
    in_sync: missingInRegistry.length === 0 && missingOnDisk.length === 0,
  };
}

/** Сверка с опциональной починкой. Без `fix` только сообщает расхождение. */
export async function syncOutputsRegistry(options: {
  outputsRoot?: string;
  fix?: boolean;
} = {}): Promise<OutputsRegistrySyncResult> {
  const root = resolve(options.outputsRoot ?? join(process.cwd(), "outputs"));
  const diff = await diffOutputsRegistry(root);

  if (!options.fix || diff.in_sync) {
    return { ...diff, fixed: false, added: [], removed: [] };
  }

  const registry = (await readOutputsRegistry(root)) ?? { activeProducts: [] };
  let next = registry.activeProducts;
  for (const slug of diff.missing_in_registry) {
    next = insertSlug(next, slug);
  }
  next = next.filter((slug) => !diff.missing_on_disk.includes(slug));
  registry.activeProducts = next;
  await writeOutputsRegistry(root, registry);

  return {
    ...(await diffOutputsRegistry(root)),
    fixed: true,
    added: diff.missing_in_registry,
    removed: diff.missing_on_disk,
  };
}

export function formatOutputsRegistrySync(result: OutputsRegistrySyncResult): string {
  const lines = [
    "# Outputs Registry Sync",
    "",
    `- Mode: ${result.fixed ? "fix" : "report"}`,
    `- Registry: ${relative(process.cwd(), result.registry_path) || result.registry_path}`,
    `- Registry exists: ${result.registry_exists ? "yes" : "no"}`,
    `- Active products: ${result.active_products.length}`,
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
    lines.push("Реестр соответствует фактическому состоянию `outputs/`.");
    return lines.join("\n");
  }

  if (result.missing_in_registry.length) {
    lines.push(
      "## Каталог есть, записи в реестре нет",
      "",
      "`yarn outputs:cleanup` перенёс бы эти каталоги в `outputs/temp/`:",
      "",
      ...result.missing_in_registry.map((slug) => `- outputs/${slug}`),
      "",
    );
  }

  if (result.missing_on_disk.length) {
    lines.push(
      "## Запись в реестре есть, каталога нет",
      "",
      ...result.missing_on_disk.map((slug) => `- ${slug}`),
      "",
    );
  }

  lines.push("Починить: `yarn workflow:registry-sync --force`.");
  return lines.join("\n");
}

function guardOutputsRoot(outputsRoot: string): RegistryChange | undefined {
  const root = resolve(outputsRoot);
  if (basename(root).toLowerCase() !== "outputs") {
    return { action: "skipped", active_products: [], reason: `не корень outputs/: ${root}` };
  }

  if (!existsSync(root)) {
    return { action: "skipped", active_products: [], reason: `каталог не найден: ${root}` };
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

async function listProductSlugs(outputsRoot: string): Promise<string[]> {
  const items = await readdir(outputsRoot, { withFileTypes: true }).catch(() => []);
  return items
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => !outputsReservedDirs.includes(name.toLowerCase() as (typeof outputsReservedDirs)[number]))
    .filter((name) => !outputsReservedFiles.includes(name as (typeof outputsReservedFiles)[number]))
    .sort((a, b) => a.localeCompare(b));
}

async function listRunDirs(slugDir: string): Promise<string[]> {
  const items = await readdir(slugDir, { withFileTypes: true }).catch(() => []);
  return items.filter((item) => item.isDirectory() && !item.name.startsWith(".")).map((item) => item.name);
}

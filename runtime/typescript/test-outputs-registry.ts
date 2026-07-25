// Тест автоведения `outputs/registry.json`.
//
// Зачем. `tooling/scripts/cleanup-outputs.mjs` уводит в `outputs/temp/` любой каталог,
// которого нет в `activeProducts`. Пока реестр вели руками, забытая запись означала
// потерю живого продуктового каталога. Предохранитель в скрипте ловит только полностью
// пустой реестр, поэтому единственная надёжная защита — вести реестр из runtime.
//
// Что проверяется:
// 1. `start` вносит слаг в реестр (поведение `registerRunInRegistry` + факт вызова из
//    `startWorkflowEngine`: без второй проверки тест сторожил бы функцию, а не маршрут);
// 2. повторный `start` того же слага не создаёт дубль;
// 3. `archive` последнего каталога слага убирает его из реестра, а при наличии других
//    дат того же слага — не убирает;
// 4. сверка `syncOutputsRegistry` обнаруживает расхождение и чинит его по флагу.
//
// Изоляция: всё происходит во временном `<tmpdir>/outputs/...`, как в
// `test-output-lifecycle.ts`. Реальный `outputs/` тест не трогает.

import { readFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { archiveWorkflowRun } from "./output-lifecycle";
import {
  diffOutputsRegistry,
  registerRunInRegistry,
  resolveOutputsRootForRun,
  syncOutputsRegistry,
} from "./outputs-registry";

const repoRoot = process.cwd();
const root = await mkdtemp(join(tmpdir(), "product-agent-studio-outputs-registry-"));

try {
  const outputsRoot = join(root, "outputs");
  await mkdir(outputsRoot, { recursive: true });
  await writeFile(join(outputsRoot, "registry.json"), `${JSON.stringify({ activeProducts: [] }, null, 2)}\n`, "utf8");

  // --- 1. start вносит слаг в реестр -----------------------------------------
  const runA = join(outputsRoot, "demo-product", "2026-07-25");
  await mkdir(runA, { recursive: true });
  await writeFile(join(runA, "run-state.json"), JSON.stringify({ status: "partial" }), "utf8");

  const added = await registerRunInRegistry(runA);
  assert(added.action === "added", `registerRunInRegistry должен внести новый слаг, получено: ${added.action}`);
  assert(
    (await readActiveProducts(outputsRoot)).includes("demo-product"),
    "После start слаг обязан быть в activeProducts.",
  );

  // --- 2. повторный start того же слага не создаёт дубль ----------------------
  const runB = join(outputsRoot, "demo-product", "2026-07-26");
  await mkdir(runB, { recursive: true });
  await writeFile(join(runB, "run-state.json"), JSON.stringify({ status: "partial" }), "utf8");

  const again = await registerRunInRegistry(runB);
  assert(again.action === "unchanged", `Повторный start не должен менять реестр, получено: ${again.action}`);
  const afterRepeat = await readActiveProducts(outputsRoot);
  assert(
    afterRepeat.filter((slug) => slug === "demo-product").length === 1,
    `Дубль слага в реестре: ${JSON.stringify(afterRepeat)}`,
  );

  // --- 3a. archive при оставшихся датах слаг не убирает ------------------------
  const archiveRoot = join(outputsRoot, "archive");
  const archivedFirst = await archiveWorkflowRun({ outputDir: runA, targetRoot: archiveRoot, force: true });
  assert(archivedFirst.moved, "archive --force должен переносить run.");
  assert(
    (await readActiveProducts(outputsRoot)).includes("demo-product"),
    "Пока у слага остались каталоги, запись в реестре обязана сохраниться.",
  );
  assert(
    archivedFirst.registry_change?.action === "unchanged",
    `archive при оставшихся датах должен вернуть unchanged, получено: ${archivedFirst.registry_change?.action}`,
  );

  // --- 3b. archive последнего каталога слага убирает запись --------------------
  const archivedLast = await archiveWorkflowRun({ outputDir: runB, targetRoot: archiveRoot, force: true });
  assert(archivedLast.moved, "archive --force должен переносить последний run слага.");
  assert(
    archivedLast.registry_change?.action === "removed",
    `archive последнего каталога должен вернуть removed, получено: ${archivedLast.registry_change?.action}`,
  );
  assert(
    !(await readActiveProducts(outputsRoot)).includes("demo-product"),
    "После архивации последнего каталога слаг обязан уйти из activeProducts.",
  );
  assert(!existsSync(join(outputsRoot, "demo-product", "2026-07-26")), "Архивация должна убрать исходный каталог.");
  assert(
    !existsSync(join(outputsRoot, "demo-product")),
    "Опустевший outputs/<slug>/ обязан удаляться: иначе он сам становится рассинхроном с реестром.",
  );

  // --- 3c. archive не трогает реестр в dry-run --------------------------------
  const runC = join(outputsRoot, "dry-run-product", "2026-07-25");
  await mkdir(runC, { recursive: true });
  await writeFile(join(runC, "run-state.json"), JSON.stringify({ status: "partial" }), "utf8");
  await registerRunInRegistry(runC);
  const archiveDry = await archiveWorkflowRun({ outputDir: runC, targetRoot: archiveRoot });
  assert(archiveDry.registry_change === undefined, "archive dry-run не должен трогать реестр.");
  assert(
    (await readActiveProducts(outputsRoot)).includes("dry-run-product"),
    "archive dry-run обязан сохранить запись в реестре.",
  );
  await rm(join(outputsRoot, "dry-run-product"), { recursive: true, force: true });
  await syncOutputsRegistry({ outputsRoot, fix: true });

  // --- 4. сверка обнаруживает расхождение и чинит по флагу ---------------------
  // Каталог на диске без записи в реестре — ровно то состояние, при котором
  // `yarn outputs:cleanup` увёл бы продукт в `outputs/temp/`.
  const orphanRun = join(outputsRoot, "orphan-product", "2026-07-25");
  await mkdir(orphanRun, { recursive: true });
  // Запись в реестре без каталога на диске.
  await writeFile(
    join(outputsRoot, "registry.json"),
    `${JSON.stringify({ activeProducts: ["ghost-product"] }, null, 2)}\n`,
    "utf8",
  );

  const drift = await diffOutputsRegistry(outputsRoot);
  assert(!drift.in_sync, "Сверка обязана обнаружить расхождение.");
  assert(
    drift.missing_in_registry.includes("orphan-product"),
    `Сверка должна найти каталог без записи: ${JSON.stringify(drift.missing_in_registry)}`,
  );
  assert(
    drift.missing_on_disk.includes("ghost-product"),
    `Сверка должна найти запись без каталога: ${JSON.stringify(drift.missing_on_disk)}`,
  );

  const reportOnly = await syncOutputsRegistry({ outputsRoot });
  assert(reportOnly.fixed === false, "Сверка без флага не должна править реестр.");
  assert(
    (await readActiveProducts(outputsRoot)).includes("ghost-product"),
    "Сверка без флага обязана оставить реестр как есть.",
  );

  const fixed = await syncOutputsRegistry({ outputsRoot, fix: true });
  assert(fixed.fixed && fixed.in_sync, "Сверка с флагом обязана привести реестр в соответствие.");
  const afterFix = await readActiveProducts(outputsRoot);
  assert(afterFix.includes("orphan-product"), "Починка обязана внести существующий каталог.");
  assert(!afterFix.includes("ghost-product"), "Починка обязана убрать запись без каталога.");

  // --- 5. зоны хранения не считаются продуктами -------------------------------
  await mkdir(join(outputsRoot, "temp"), { recursive: true });
  await mkdir(join(outputsRoot, "products"), { recursive: true });
  const zonesDiff = await diffOutputsRegistry(outputsRoot);
  assert(
    zonesDiff.in_sync,
    `Зоны temp/archive/products не должны требовать записи в реестре: ${JSON.stringify(zonesDiff.missing_in_registry)}`,
  );
  assert(
    resolveOutputsRootForRun(join(outputsRoot, "temp", "smoke", "2026-07-25")) === undefined,
    "Run внутри outputs/temp не должен вести к записи в реестр.",
  );

  // --- 6. маршрут: start действительно вызывает автозапись ---------------------
  // Поведенческие проверки выше живут на временном `outputs/`; сам `startWorkflowEngine`
  // пишет в `process.cwd()/outputs` и в тесте не запускается. Поэтому связь «start ->
  // реестр» проверяется отдельно: без неё тест сторожил бы функцию, а не маршрут.
  await assertCallInFunction(
    join(repoRoot, "runtime", "typescript", "workflow-engine.ts"),
    "startWorkflowEngine",
    "registerRunInRegistry(",
  );
  await assertCallInFunction(
    join(repoRoot, "runtime", "typescript", "output-lifecycle.ts"),
    "archiveWorkflowRun",
    "syncRegistryAfterArchive(",
  );

  console.log("outputs registry regression tests passed");
} finally {
  await rm(root, { recursive: true, force: true });
}

async function readActiveProducts(outputsRoot: string): Promise<string[]> {
  const raw = JSON.parse(await readFile(join(outputsRoot, "registry.json"), "utf8")) as { activeProducts?: string[] };
  return raw.activeProducts ?? [];
}

/** Проверяет, что тело именованной экспортируемой функции содержит вызов. */
async function assertCallInFunction(file: string, functionName: string, call: string): Promise<void> {
  const source = await readFile(file, "utf8");
  const start = source.indexOf(`export async function ${functionName}(`);
  assert(start >= 0, `Не найдена функция ${functionName} в ${file}.`);
  const rest = source.slice(start + 1);
  const nextExport = rest.indexOf("\nexport ");
  const body = nextExport >= 0 ? rest.slice(0, nextExport) : rest;
  assert(
    body.includes(call),
    `Функция ${functionName} в ${file} не вызывает ${call} — автоведение outputs/registry.json разорвано.`,
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

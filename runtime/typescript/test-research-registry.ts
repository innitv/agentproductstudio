// Тест сверки и автоведения `research/registry.json`.
//
// Зачем. `research/registry.json` — навигационный индекс исследовательских проектов
// (`CLAUDE.md` §4). Разрушительных последствий у рассинхрона нет: `cleanup-outputs.mjs`
// research не читает вовсе. Цена другая — индекс молча перестаёт находить проекты, и
// research-задача начинает искать материалы в `outputs/`, вопреки правилу.
//
// Что проверяется:
// 1. `registerResearchRunInRegistry` вносит слаг для run вида `research/projects/<slug>/<date>`;
// 2. повторный вызов дубля не создаёт;
// 3. run вне `research/projects/` (temp, archive, продуктовый `outputs/`) реестр не трогает;
// 4. сверка находит обе стороны расхождения и чинит их только по флагу;
// 5. маршрут: `runResearchStage` действительно вызывает автозапись — без этой проверки
//    тест сторожил бы функцию, а не подключение (тот же приём, что в `test-outputs-registry.ts`).
//
// Изоляция: всё происходит во временном `<tmpdir>/research/...`. Реальные `research/` и
// `outputs/` тест не трогает.

import { readFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  diffResearchRegistry,
  registerResearchRunInRegistry,
  resolveResearchRootForRun,
  syncResearchRegistry,
} from "./research-registry";

const repoRoot = process.cwd();
const root = await mkdtemp(join(tmpdir(), "product-agent-studio-research-registry-"));

try {
  const researchRoot = join(root, "research");
  const projectsRoot = join(researchRoot, "projects");
  await mkdir(projectsRoot, { recursive: true });
  await writeFile(
    join(researchRoot, "registry.json"),
    `${JSON.stringify({ activeResearchProjects: [] }, null, 2)}\n`,
    "utf8",
  );

  // --- 1. research:run вносит слаг в реестр ------------------------------------
  const runA = join(projectsRoot, "demo-research", "2026-07-25");
  await mkdir(runA, { recursive: true });

  const added = await registerResearchRunInRegistry(runA);
  assert(added.action === "added", `registerResearchRunInRegistry должен внести новый слаг, получено: ${added.action}`);
  assert(
    (await readActiveProjects(researchRoot)).includes("demo-research"),
    "После research:run слаг обязан быть в activeResearchProjects.",
  );

  // --- 2. повторный прогон дубля не создаёт ------------------------------------
  const runB = join(projectsRoot, "demo-research", "2026-07-26");
  await mkdir(runB, { recursive: true });

  const again = await registerResearchRunInRegistry(runB);
  assert(again.action === "unchanged", `Повторный прогон не должен менять реестр, получено: ${again.action}`);
  const afterRepeat = await readActiveProjects(researchRoot);
  assert(
    afterRepeat.filter((slug) => slug === "demo-research").length === 1,
    `Дубль слага в реестре: ${JSON.stringify(afterRepeat)}`,
  );

  // --- 3. run вне research/projects реестр не трогает ---------------------------
  // Временные и архивные research-run не являются активными проектами; продуктовый run
  // ведёт другой реестр (`outputs/registry.json`).
  const tempRun = join(researchRoot, "temp", "smoke", "2026-07-25");
  const archiveRun = join(researchRoot, "archive", "old-research", "2026-07-25");
  const productRun = join(root, "outputs", "demo-product", "2026-07-25");
  await mkdir(tempRun, { recursive: true });
  await mkdir(archiveRun, { recursive: true });
  await mkdir(productRun, { recursive: true });

  for (const [label, dir] of [["temp", tempRun], ["archive", archiveRun], ["outputs", productRun]] as const) {
    assert(
      resolveResearchRootForRun(dir) === undefined,
      `Run в ${label} не должен разрешаться в корень research/: ${dir}`,
    );
    const skipped = await registerResearchRunInRegistry(dir);
    assert(skipped.action === "skipped", `Run в ${label} обязан быть пропущен, получено: ${skipped.action}`);
  }

  assert(
    (await readActiveProjects(researchRoot)).length === 1,
    "Реестр не должен пополняться от temp/archive/outputs run.",
  );

  // --- 4. сверка находит расхождение и чинит по флагу --------------------------
  // `orphan-research` — каталог без записи (индекс его не найдёт).
  // `ghost-research` — запись без каталога (типично после ручного переноса в archive/).
  await mkdir(join(projectsRoot, "orphan-research", "2026-07-25"), { recursive: true });
  await writeFile(
    join(researchRoot, "registry.json"),
    `${JSON.stringify({ activeResearchProjects: ["ghost-research"] }, null, 2)}\n`,
    "utf8",
  );

  const drift = await diffResearchRegistry(researchRoot);
  assert(!drift.in_sync, "Сверка обязана обнаружить расхождение.");
  assert(
    drift.missing_in_registry.includes("orphan-research") && drift.missing_in_registry.includes("demo-research"),
    `Сверка должна найти каталоги без записи: ${JSON.stringify(drift.missing_in_registry)}`,
  );
  assert(
    drift.missing_on_disk.includes("ghost-research"),
    `Сверка должна найти запись без каталога: ${JSON.stringify(drift.missing_on_disk)}`,
  );

  const reportOnly = await syncResearchRegistry({ researchRoot });
  assert(reportOnly.fixed === false, "Сверка без флага не должна править реестр.");
  assert(
    (await readActiveProjects(researchRoot)).includes("ghost-research"),
    "Сверка без флага обязана оставить реестр как есть.",
  );

  const fixed = await syncResearchRegistry({ researchRoot, fix: true });
  assert(fixed.fixed && fixed.in_sync, "Сверка с флагом обязана привести реестр в соответствие.");
  const afterFix = await readActiveProjects(researchRoot);
  assert(afterFix.includes("orphan-research"), "Починка обязана внести существующий каталог.");
  assert(afterFix.includes("demo-research"), "Починка не должна терять уже существующие проекты.");
  assert(!afterFix.includes("ghost-research"), "Починка обязана убрать запись без каталога.");
  assert(
    !afterFix.some((slug) => ["temp", "archive", "projects"].includes(slug)),
    `Зоны хранения не должны попадать в реестр: ${JSON.stringify(afterFix)}`,
  );

  // --- 5. маршрут: research:run действительно вызывает автозапись ----------------
  // Поведенческие проверки выше живут на временном `research/`; сам `runResearchStage`
  // ходит в сеть за провайдерами и в тесте не запускается. Поэтому связь
  // «research:run -> реестр» проверяется отдельно.
  await assertCallInFunction(
    join(repoRoot, "runtime", "typescript", "research-stage-runner.ts"),
    "runResearchStage",
    "registerResearchRunInRegistry(",
  );

  console.log("research registry regression tests passed");
} finally {
  await rm(root, { recursive: true, force: true });
}

async function readActiveProjects(researchRoot: string): Promise<string[]> {
  const raw = JSON.parse(await readFile(join(researchRoot, "registry.json"), "utf8")) as {
    activeResearchProjects?: string[];
  };
  return raw.activeResearchProjects ?? [];
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
    `Функция ${functionName} в ${file} не вызывает ${call} — автозапись research/registry.json разорвана.`,
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

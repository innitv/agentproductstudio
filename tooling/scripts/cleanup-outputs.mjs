import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --dry-run: показать план без единого перемещения. Обязательный способ проверить
// содержимое registry.json до того, как скрипт тронет реальные каталоги.
const dryRun = process.argv.includes("--dry-run");
// --force: разрешить перенос, даже если реестр пуст (см. предохранитель ниже).
const force = process.argv.includes("--force");

// Определяем базовые пути
const workspaceRoot = path.resolve(__dirname, "../..");
const outputsDir = path.join(workspaceRoot, "outputs");
const productsDir = path.join(outputsDir, "products");
const tempDir = path.join(outputsDir, "temp");
const registryPath = path.join(outputsDir, "registry.json");

console.log("=================================================");
console.log("  ЗАПУСК БЕЗОПАСНОЙ ОЧИСТКИ И РЕОРГАНИЗАЦИИ OUTPUTS ");
console.log("=================================================\n");

// Убедимся, что реестр существует
if (!fs.existsSync(registryPath)) {
  console.error(`Ошибка: файл реестра не найден по пути: ${registryPath}`);
  process.exit(1);
}

// Считываем реестр активных продуктов
let registry;
try {
  const registryData = fs.readFileSync(registryPath, "utf8");
  registry = JSON.parse(registryData);
} catch (err) {
  console.error("Ошибка при чтении или парсинге registry.json:", err);
  process.exit(1);
}

const activeProducts = registry.activeProducts || [];
console.log(`Загружено активных продуктов из реестра: ${activeProducts.length}`);
console.log(`Список активных продуктов: ${activeProducts.join(", ")}\n`);

if (dryRun) {
  console.log("Режим: DRY-RUN. Ни один файл не будет перемещён.\n");
}

// Создаем папки-контейнеры, если их нет
if (!dryRun && !fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
  console.log(`Создана legacy/archive-папка: ${productsDir}`);
}
if (!dryRun && !fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Создана папка для временных запусков: ${tempDir}`);
}

// Список системных файлов/папок в outputs, которые нельзя трогать.
// Это ЗОНЫ хранения (CLAUDE.md §4), а не product-slug: их нельзя вносить
// в activeProducts, но и переносить в temp/ нельзя.
const protectedItems = [
  "registry.json",
  "README.md",
  ".gitkeep",
  "products", // legacy/archive-зона
  "archive",  // outputs/archive/<project-slug>/<YYYY-MM-DD>/ — архив завершённых run
  "temp"
];

// Читаем содержимое outputs/
let items;
try {
  items = fs.readdirSync(outputsDir);
} catch (err) {
  console.error("Не удалось прочитать папку outputs:", err);
  process.exit(1);
}

// Предохранитель: пустой реестр при непустом outputs/ почти всегда означает
// «реестр не ведут», а не «всё в outputs — мусор». Без этой проверки одна команда
// уводила все продуктовые каталоги в temp/.
const unprotectedDirs = items.filter(
  (item) =>
    !protectedItems.includes(item) &&
    fs.existsSync(path.join(outputsDir, item)) &&
    fs.statSync(path.join(outputsDir, item)).isDirectory()
);

if (activeProducts.length === 0 && unprotectedDirs.length > 0 && !force) {
  console.error("ОСТАНОВЛЕНО: registry.json содержит пустой activeProducts, но в outputs/ есть каталоги:");
  for (const dir of unprotectedDirs) {
    console.error(`  - outputs/${dir}`);
  }
  console.error("\nБез записей в реестре все они были бы перенесены в outputs/temp/.");
  console.error("Заполни outputs/registry.json (массив activeProducts) либо запусти с --force, если это действительно мусор.");
  process.exit(1);
}

let keptActiveCount = 0;
let movedToTempCount = 0;

for (const item of items) {
  // Пропускаем защищенные файлы и папки
  if (protectedItems.includes(item)) {
    continue;
  }

  const fullPath = path.join(outputsDir, item);
  let isDirectory = false;
  try {
    isDirectory = fs.statSync(fullPath).isDirectory();
  } catch (e) {
    continue;
  }

  if (!isDirectory) {
    // Если это незащищенный файл в корне outputs, переносим его в temp
    const destPath = path.join(tempDir, item);
    if (dryRun) {
      console.log(`[DRY-RUN] Файл был бы перенесён: ${item} -> outputs/temp/${item}`);
      movedToTempCount++;
      continue;
    }
    try {
      fs.renameSync(fullPath, destPath);
      console.log(`[Файл -> Temp] Перенесен файл: ${item} -> outputs/temp/${item}`);
      movedToTempCount++;
    } catch (err) {
      console.error(`Ошибка при переносе файла ${item}:`, err.message);
    }
    continue;
  }

  // Если это директория
  if (activeProducts.includes(item)) {
    // Это активный runtime-продукт. Не переносим его: workflow:* команды
    // используют outputs/<project-slug>/<YYYY-MM-DD>/ как source of truth.
    console.log(`[Продукт] Оставлен в runtime-пути: outputs/${item}`);
    keptActiveCount++;
  } else {
    // Это временная папка/тест, переносим в outputs/temp/
    const destPath = path.join(tempDir, item);
    if (dryRun) {
      console.log(`[DRY-RUN] Каталог был бы перенесён: ${item} -> outputs/temp/${item}`);
      movedToTempCount++;
      continue;
    }
    try {
      fs.renameSync(fullPath, destPath);
      console.log(`[Тест/Мусор] Успешно перемещен в архив: ${item} -> outputs/temp/${item}`);
      movedToTempCount++;
    } catch (err) {
      console.error(`Ошибка при переносе временной папки ${item}:`, err.message);
    }
  }
}

console.log("\n=================================================");
console.log(dryRun ? "  DRY-RUN ЗАВЕРШЁН (ничего не перемещено)" : "  РЕОРГАНИЗАЦИЯ УСПЕШНО ЗАВЕРШЕНА");
console.log(`  Активных продуктов оставлено: ${keptActiveCount}`);
console.log(`  ${dryRun ? "Было бы перенесено в temp:  " : "Перенесено в архив temp:      "}  ${movedToTempCount}`);
console.log("=================================================");

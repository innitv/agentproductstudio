import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Создаем папки-контейнеры, если их нет
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
  console.log(`Создана папка для продуктов: ${productsDir}`);
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Создана папка для временных запусков: ${tempDir}`);
}

// Список системных файлов/папок в outputs, которые нельзя трогать
const protectedItems = [
  "registry.json",
  "README.md",
  ".gitkeep",
  "products",
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

let movedToProductsCount = 0;
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
    // Это активный продукт, переносим в outputs/products/
    const destPath = path.join(productsDir, item);
    try {
      fs.renameSync(fullPath, destPath);
      console.log(`[Продукт] Успешно перемещен: ${item} -> outputs/products/${item}`);
      movedToProductsCount++;
    } catch (err) {
      console.error(`Ошибка при переносе продукта ${item}:`, err.message);
    }
  } else {
    // Это временная папка/тест, переносим в outputs/temp/
    const destPath = path.join(tempDir, item);
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
console.log("  РЕОРГАНИЗАЦИЯ УСПЕШНО ЗАВЕРШЕНА");
console.log(`  Перенесено активных продуктов: ${movedToProductsCount}`);
console.log(`  Перенесено в архив temp:        ${movedToTempCount}`);
console.log("=================================================");

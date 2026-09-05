/**
 * Противоречие между документами об одном и том же поле контракта.
 *
 * 🔴 Повод (2026-09-04). Норма записи применённых навыков была разложена по
 * адресам и проверена грепом: `skills_used` упоминался в семи документах, то
 * есть формально «правило доведено». При этом skill `run-ledger` требовал
 * записи всегда, а контракт вывода агента в том же репозитории называл поле
 * опциональным — «укажи, если применял». Одного слова хватало, чтобы отчёт
 * `yarn workflow:skill-usage` навсегда остался без знаменателя: отсутствие
 * записи неотличимо от «навык не понадобился».
 *
 * Ни одна существующая проверка этого не видела. Греп по маркеру считает, в
 * скольких файлах правило упомянуто, но не читает, ЧТО там сказано; схема
 * валидирует данные, а не прозу о данных.
 *
 * Что проверяется здесь: модальность требования. Для каждого поля из схемы
 * вывода агента нормативная проза не имеет права противоречить схеме — если
 * поле обязательно, никакой документ не называет его опциональным, и наоборот.
 * Это узкий класс: семантику текста машина не понимает, но расхождение
 * «обязателен против опционален» об одном имени — понимает.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ContractConflict {
  field: string;
  file: string;
  quote: string;
  message: string;
}

/** Где живёт нормативная проза: те же каталоги, что у проверок гигиены. */
const NORMATIVE_ROOTS = [
  "CLAUDE.md",
  "COMMANDS.md",
  ".claude/skills",
  ".claude/agents",
  "agent-pack/agent-contracts",
  "agent-pack/workflows",
  "agent-pack/templates",
  "agent-pack/quality",
];

/** Слова, которыми проза объявляет поле необязательным. */
const OPTIONAL_WORDS = /опционал|необязател|не обязател|по желанию|при наличии/i;

/** Слова, которыми проза объявляет поле обязательным. */
const REQUIRED_WORDS = /обязател|всегда указыв|указывается всегда/i;

/**
 * Условие рядом с «обязателен» снимает конфликт: схема не умеет выражать
 * «обязателен для product_ui, но не для research», поэтому такое поле законно
 * лежит вне `required`, а проза уточняет случай. Без этого фильтра проверка
 * давала семь ложных срабатываний на `surface_output` — поле условное по
 * устройству.
 */
const CONDITIONAL_WORDS = new RegExp("(^|[^а-яё])(для|если|когда|при)([^а-яё]|$)|surface", "i");

/**
 * Окно — строка целиком, а не отрезок фиксированной длины.
 *
 * Срез по символам захватывал соседний текст: заголовок «## Обязательные
 * результаты» через строку от упоминания поля читался как требование к этому
 * полю, и проверка выдавала шесть ложных находок. В markdown правило живёт в
 * строке — пункт списка, ячейка таблицы, абзац; за её пределами речь уже о
 * другом.
 */

function collectFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (path: string): void => {
    if (!existsSync(path)) return;
    if (statSync(path).isDirectory()) {
      for (const entry of readdirSync(path)) walk(join(path, entry));
      return;
    }
    if (path.endsWith(".md")) files.push(path);
  };
  for (const target of NORMATIVE_ROOTS) walk(join(root, target));
  return files;
}

/**
 * Все схемы студии, а не только вывод агента: артефакты стадий описаны так же,
 * и проза о них расходится по той же причине.
 *
 * Поле, обязательное в одной схеме и необязательное в другой, из проверки
 * исключается: в такой ситуации текст не может противоречить «схеме» вообще —
 * он говорит о конкретном артефакте, а связать фразу с нужной схемой машина не
 * умеет. Молчать на неоднозначном честнее, чем угадывать.
 */
function readSchemas(root: string): { required: Set<string>; optional: Set<string> } | null {
  const dir = join(root, "agent-pack", "schemas");
  if (!existsSync(dir)) return null;
  const required = new Set<string>();
  const optional = new Set<string>();
  let seen = 0;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith(".json")) continue;
    let parsed: { required?: string[]; properties?: Record<string, unknown> };
    try {
      parsed = JSON.parse(readFileSync(join(dir, entry), "utf8"));
    } catch {
      continue; // нечитаемая схема — забота валидатора конфигурации, не эта
    }
    seen += 1;
    const req = new Set(parsed.required ?? []);
    for (const field of Object.keys(parsed.properties ?? {})) {
      (req.has(field) ? required : optional).add(field);
    }
  }
  if (seen === 0) return null;
  // Поле с разной модальностью в разных схемах однозначного ответа не имеет
  for (const field of [...required]) {
    if (optional.has(field)) {
      required.delete(field);
      optional.delete(field);
    }
  }
  return { required, optional };
}

/**
 * Поля с говорящими именами вроде `status` встречаются в прозе повсеместно и в
 * другом смысле. Проверяются только те, что читаются как поле контракта: с
 * подчёркиванием в имени.
 */
function isCheckable(field: string): boolean {
  return field.includes("_");
}

export function findContractConflicts(root = process.cwd()): ContractConflict[] {
  const schema = readSchemas(root);
  if (!schema) {
    return [{
      field: "—",
      file: "agent-pack/schemas",
      quote: "",
      message: "схем не найдено: проверять нечего, а значит проверка не работает",
    }];
  }

  const files = collectFiles(root);
  if (files.length === 0) {
    return [{
      field: "—",
      file: "—",
      quote: "",
      message: "нормативных документов не найдено: пустой набор успехом не считается",
    }];
  }

  const fields = [...schema.required, ...schema.optional].filter(isCheckable);
  const conflicts: ContractConflict[] = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(String.fromCharCode(10));
    for (const field of fields) {
      const mandatory = schema.required.has(field);
      for (const line of lines) {
        if (!line.includes(field)) continue;
        const window = line;
        const saysOptional = OPTIONAL_WORDS.test(window);
        const saysRequired = REQUIRED_WORDS.test(window);
        const quote = window.replace(/\s+/g, " ").trim().slice(0, 120);

        if (mandatory && saysOptional && !saysRequired) {
          conflicts.push({
            field,
            file: file.replace(root, "").replace(/\\/g, "/").replace(/^\//, ""),
            quote,
            message: `поле '${field}' обязательно по схеме, а текст называет его необязательным`,
          });
        }
        if (!mandatory && saysRequired && !saysOptional && !CONDITIONAL_WORDS.test(window)) {
          conflicts.push({
            field,
            file: file.replace(root, "").replace(/\\/g, "/").replace(/^\//, ""),
            quote,
            message: `поле '${field}' не входит в required схемы, а текст требует его всегда`,
          });
        }
      }
    }
  }

  return conflicts;
}

export function validateContractConsistency(root = process.cwd()): string[] {
  return findContractConflicts(root).map(
    (item) => `[contract-consistency] ${item.file}: ${item.message}. Фрагмент: «${item.quote}»`,
  );
}

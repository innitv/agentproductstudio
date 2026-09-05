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
 * Окно вокруг упоминания поля. Предложение целиком выделить нельзя — в текстах
 * есть списки, таблицы и переносы, — поэтому берётся отрезок фиксированной
 * длины: достаточно, чтобы захватить модальность в той же фразе, и мало,
 * чтобы не поймать соседнее правило о другом поле.
 */
const WINDOW = 140;

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

function readSchema(root: string): { required: string[]; known: string[] } | null {
  const file = join(root, "agent-pack", "schemas", "agent-output.schema.json");
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, "utf8")) as {
    required?: string[];
    properties?: Record<string, unknown>;
  };
  return {
    required: parsed.required ?? [],
    known: Object.keys(parsed.properties ?? {}),
  };
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
  const schema = readSchema(root);
  if (!schema) {
    return [{
      field: "—",
      file: "agent-pack/schemas/agent-output.schema.json",
      quote: "",
      message: "схема вывода агента не найдена: проверять нечего, а значит проверка не работает",
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

  const fields = schema.known.filter(isCheckable);
  const conflicts: ContractConflict[] = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const field of fields) {
      const mandatory = schema.required.includes(field);
      let from = 0;
      for (;;) {
        const at = text.indexOf(field, from);
        if (at < 0) break;
        from = at + field.length;
        const window = text.slice(Math.max(0, at - 30), at + WINDOW);
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

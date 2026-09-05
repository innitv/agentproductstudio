/**
 * Проверка сверки модальности требования между схемой и прозой.
 *
 * Негативный контроль здесь не формальность: первая версия фильтра условий
 * молча ловила только слово «surface», потому что границы слов в регулярке
 * превратились в невидимые символы. Проверка при этом печатала ноль конфликтов
 * и выглядела исправной. Поэтому тест обязан показывать, что она ЛОВИТ, а не
 * только что молчит.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { findContractConflicts } from "./contract-consistency";

const NL = String.fromCharCode(10);

function makeRoot(required: string[], prose: string): string {
  const root = mkdtempSync(join(tmpdir(), "contract-consistency-"));
  mkdirSync(join(root, "agent-pack", "schemas"), { recursive: true });
  writeFileSync(
    join(root, "agent-pack", "schemas", "agent-output.schema.json"),
    JSON.stringify({
      required,
      properties: { skills_used: { type: "array" }, surface_output: { type: "object" } },
    }),
    "utf8",
  );
  mkdirSync(join(root, "agent-pack", "templates"), { recursive: true });
  writeFileSync(join(root, "agent-pack", "templates", "contract.md"), prose, "utf8");
  return root;
}

// 1. Тот самый случай: схема требует поле, а документ называет его опциональным
{
  const root = makeRoot(
    ["skills_used"],
    "- `skills_used` опционален, но если stage применял skill, укажи его id.",
  );
  const found = findContractConflicts(root);
  assert.equal(found.length, 1, "противоречие «обязателен по схеме, опционален в тексте» обязано ловиться");
  assert.equal(found[0].field, "skills_used");
  assert.match(found[0].message, /называет его необязательным/);
  rmSync(root, { recursive: true, force: true });
}

// 2. Схема и текст согласны — тишина
{
  const root = makeRoot(
    ["skills_used"],
    "- `skills_used` обязателен, но пустой список — законный ответ.",
  );
  assert.deepEqual(findContractConflicts(root), [], "согласованные документы конфликтов давать не должны");
  rmSync(root, { recursive: true, force: true });
}

// 3. Условная обязательность — не конфликт: схема не умеет выражать «обязателен для одной поверхности»
{
  const root = makeRoot(
    [],
    "- `surface_output` обязателен для `product_ui` и `landing`, для research не требуется.",
  );
  assert.deepEqual(findContractConflicts(root), [], "условное требование не является противоречием схеме");
  rmSync(root, { recursive: true, force: true });
}

// 4. Безусловное требование поля, которого нет в required — конфликт
{
  const root = makeRoot([], "- `skills_used` обязателен всегда и проверяется на каждом этапе.");
  const found = findContractConflicts(root);
  assert.equal(found.length, 1, "текст требует поле, схема — нет: это расхождение");
  assert.match(found[0].message, /не входит в required/);
  rmSync(root, { recursive: true, force: true });
}

// 5. Мутация фильтра условий: слово «применял» не должно считаться условием
{
  const root = makeRoot(
    ["skills_used"],
    "- `skills_used` опционален: заполняется, когда агент применял навык.",
  );
  const found = findContractConflicts(root);
  assert.equal(
    found.length,
    1,
    "«применял» содержит подстроку «при», но условием не является — конфликт обязан остаться видимым",
  );
  rmSync(root, { recursive: true, force: true });
}

// 6. Пустой набор документов и отсутствие схемы успехом не считаются
{
  const root = mkdtempSync(join(tmpdir(), "contract-consistency-empty-"));
  const found = findContractConflicts(root);
  assert.equal(found.length, 1, "без схемы проверка обязана сообщить, что ей нечего читать");
  assert.match(found[0].message, /схема вывода агента не найдена/);
  rmSync(root, { recursive: true, force: true });
}

process.stdout.write("contract consistency tests passed" + NL);

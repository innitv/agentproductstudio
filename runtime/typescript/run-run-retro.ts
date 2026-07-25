// CLI ретро-разбора завершённого run.
//
// Отдельной командой, а не подкомандой движка: ретро читает run, но ничего в нём не
// меняет и не требует его состояния — запускать его можно и на архивном, и на чужом
// каталоге. Образец — `run-research-registry-sync.ts`.
//
// Usage:
//   yarn workflow:retro <run-dir>          # отчёт в markdown
//   yarn workflow:retro <run-dir> --json   # машинный вывод для дальнейшей обработки

import { pathToFileURL } from "node:url";
import { collectRunRetro, formatRunRetro } from "./run-retro";

function main(): void {
  const args = process.argv.slice(2);
  const runDir = args.find((arg) => !arg.startsWith("--"));

  if (!runDir) {
    throw new Error(
      "Укажи каталог run: yarn workflow:retro outputs/<project-slug>/<YYYY-MM-DD> [--json]",
    );
  }

  const report = collectRunRetro(runDir);
  console.log(args.includes("--json") ? JSON.stringify(report, null, 2) : formatRunRetro(report));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

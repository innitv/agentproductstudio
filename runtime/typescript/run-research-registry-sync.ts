// CLI сверки `research/registry.json` с фактическими каталогами `research/projects/*`.
//
// Аналог `yarn workflow:registry-sync`, но отдельной командой: у research нет engine-CLI,
// потому что нет и команды создания run (см. заголовок `research-registry.ts`). Именно
// поэтому сверка здесь — основная защита индекса, а не подстраховка автозаписи.
//
// Usage:
//   yarn research:registry-sync                 # только отчёт, ненулевой код при расхождении
//   yarn research:registry-sync --force         # починить реестр (алиас: --fix)
//   yarn research:registry-sync --base <путь>   # сверить другой корень research/

import { pathToFileURL } from "node:url";
import { formatResearchRegistrySync, syncResearchRegistry } from "./research-registry";

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return undefined;
  }

  const value = args[index + 1];
  return value.startsWith("--") ? undefined : value;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const researchRoot = readFlagValue(args, "--base");
  const fix = args.includes("--force") || args.includes("--fix");

  const result = await syncResearchRegistry({ researchRoot, fix });
  console.log(formatResearchRegistrySync(result));

  if (!result.in_sync) {
    throw new Error("Research registry is out of sync. Re-run with --force to fix.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

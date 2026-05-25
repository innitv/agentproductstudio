import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runMultiSourceResearch } from "../../runtime/typescript/multi-source-research.ts";

const [, , outArg = "reports/research/multi-source-result.json", ...queryParts] = process.argv;
const query = queryParts.join(" ").trim() || [
  "SIM and eSIM online sales landing research",
  "Audience needs: eSIM compatibility, physical SIM delivery, number porting, trust and KYC",
  "Geography: Russian-speaking market prototype",
].join(". ");

const result = await runMultiSourceResearch({
  query,
  productContext: "SIM Line landing for selling SIM cards and eSIM with visual reference-driven product workflow.",
  geography: "Russian-speaking market prototype",
  language: "ru",
  maxResultsPerProvider: 8,
});

const outPath = resolve(process.cwd(), outArg);
await writeFile(outPath, JSON.stringify(result, null, 2), "utf8");

console.log(`Wrote multi-source research result: ${outArg}`);
console.log(`Providers requested: ${result.providersRequested.join(", ")}`);
console.log(`Providers used: ${result.providersUsed.join(", ") || "none"}`);
console.log(`Unavailable providers: ${result.unavailableProviders.join(", ") || "none"}`);
console.log(`Failures: ${result.failures.map((failure) => `${failure.provider}: ${failure.error}`).join(" | ") || "none"}`);
console.log(`Validation: ${result.validation.status}`);

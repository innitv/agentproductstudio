import { runDeepSeekResearch, type DeepSeekResearchResult } from "./deepseek-research";
import { loadLocalEnv } from "./env";
import {
  defaultMultiSourceResearchProviders,
  researchModes,
  researchProviders,
  resolveSourcePolicy,
  type ResearchMode,
  type ResearchProvider,
} from "./research.config";
import { runTavilyResearch, type TavilyResearchResult } from "./tavily-research";

export interface MultiSourceResearchInput {
  query: string;
  productContext?: string;
  geography?: string;
  language?: "ru" | "en";
  mode?: ResearchMode;
  maxResultsPerProvider?: number;
}

export interface ProviderFailure {
  provider: ResearchProvider;
  error: string;
}

export interface MultiSourceResearchResult {
  query: string;
  providersRequested: ResearchProvider[];
  providersUsed: ResearchProvider[];
  unavailableProviders: ResearchProvider[];
  failures: ProviderFailure[];
  results: Array<TavilyResearchResult | DeepSeekResearchResult>;
  sources: Array<{ provider: ResearchProvider; url: string; title?: string }>;
  validation: {
    status: "pass" | "needs_validation";
    checks: string[];
  };
  unknowns: string[];
}

const executableProviders = [
  researchProviders.tavily,
  researchProviders.deepseek,
] as const satisfies readonly ResearchProvider[];

export async function runMultiSourceResearch(input: MultiSourceResearchInput): Promise<MultiSourceResearchResult> {
  loadLocalEnv();
  const sourcePolicy = resolveSourcePolicy(input.mode);
  const providersRequested = resolveProviderOrder(sourcePolicy.prefer, sourcePolicy.allow, sourcePolicy.deny);
  const runnableProviders = providersRequested.filter((provider) => {
    return executableProviders.includes(provider as (typeof executableProviders)[number]) && isProviderConfigured(provider);
  });
  const unavailableProviders = providersRequested.filter((provider) => !runnableProviders.includes(provider));
  const settled = await Promise.allSettled(
    runnableProviders.map(async (provider) => {
      if (provider === researchProviders.tavily) {
        return runTavilyResearch({
          query: input.query,
          productContext: input.productContext,
          geography: input.geography,
          language: input.language,
          maxResults: input.maxResultsPerProvider,
        });
      }

      if (provider === researchProviders.deepseek) {
        return runDeepSeekResearch({
          query: input.query,
          productContext: input.productContext,
          geography: input.geography,
          language: input.language,
        });
      }

      throw new Error(`Provider is not executable in local TypeScript runtime: ${provider}`);
    }),
  );

  const results: MultiSourceResearchResult["results"] = [];
  const failures: ProviderFailure[] = [];

  settled.forEach((result, index) => {
    const provider = runnableProviders[index];

    if (result.status === "fulfilled") {
      results.push(result.value);
      return;
    }

    failures.push({
      provider,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    });
  });

  return {
    query: input.query,
    providersRequested,
    providersUsed: results.map((result) => result.provider),
    unavailableProviders,
    failures,
    results,
    sources: collectSources(results),
    validation: validateMultiSourceCoverage(input.mode, results, unavailableProviders, failures),
    unknowns: buildUnknowns(providersRequested, unavailableProviders, failures, results.length),
  };
}

function resolveProviderOrder(
  prefer: readonly ResearchProvider[],
  allow: readonly ResearchProvider[],
  deny: readonly ResearchProvider[],
): ResearchProvider[] {
  const envOrder = process.env.RESEARCH_PROVIDER_ORDER
    ?.split(",")
    .map((provider) => provider.trim())
    .filter(Boolean) as ResearchProvider[] | undefined;
  const candidateOrder = envOrder?.length ? envOrder : prefer;
  const allowed = new Set(allow);
  const denied = new Set(deny);
  const result: ResearchProvider[] = [];

  for (const provider of candidateOrder) {
    if (!allowed.has(provider) || denied.has(provider) || result.includes(provider)) {
      continue;
    }

    result.push(provider);
  }

  return result;
}

function isProviderConfigured(provider: ResearchProvider): boolean {
  if (provider === researchProviders.tavily) {
    return Boolean(process.env.TAVILY_API_KEY);
  }

  if (provider === researchProviders.deepseek) {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  }

  return false;
}

function validateMultiSourceCoverage(
  mode: ResearchMode | undefined,
  results: MultiSourceResearchResult["results"],
  unavailableProviders: ResearchProvider[],
  failures: ProviderFailure[],
): MultiSourceResearchResult["validation"] {
  const checks: string[] = [];
  const used = new Set(results.map((result) => result.provider));
  const requiresDefaultMultiSource = !mode || mode === researchModes.deepResearch;

  if (!requiresDefaultMultiSource) {
    checks.push(`Multi-source minimum is not enforced for mode '${mode}'.`);
    return { status: "pass", checks };
  }

  for (const provider of defaultMultiSourceResearchProviders) {
    if (used.has(provider)) {
      checks.push(`${provider}: returned results.`);
      continue;
    }

    if (unavailableProviders.includes(provider)) {
      checks.push(`${provider}: configured as default but unavailable in current environment.`);
      continue;
    }

    if (failures.some((failure) => failure.provider === provider)) {
      checks.push(`${provider}: request failed and requires review.`);
      continue;
    }

    checks.push(`${provider}: did not return results.`);
  }

  const status = defaultMultiSourceResearchProviders.every((provider) => used.has(provider))
    ? "pass"
    : "needs_validation";

  return { status, checks };
}

function collectSources(results: MultiSourceResearchResult["results"]): MultiSourceResearchResult["sources"] {
  const sources: MultiSourceResearchResult["sources"] = [];
  const seen = new Set<string>();

  for (const result of results) {
    for (const source of result.sources) {
      const url = source.url;
      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      sources.push({
        provider: result.provider,
        url,
        title: source.title,
      });
    }
  }

  return sources;
}

function buildUnknowns(
  providersRequested: ResearchProvider[],
  unavailableProviders: ResearchProvider[],
  failures: ProviderFailure[],
  resultsCount: number,
): string[] {
  const unknowns: string[] = [];

  if (!resultsCount) {
    unknowns.push("No configured executable research providers returned results.");
  }

  if (unavailableProviders.length) {
    unknowns.push(`Providers requested but not configured/executable locally: ${unavailableProviders.join(", ")}.`);
  }

  if (failures.length) {
    unknowns.push(`Provider failures need review: ${failures.map((failure) => failure.provider).join(", ")}.`);
  }

  if (!providersRequested.length) {
    unknowns.push("Source policy resolved to an empty provider list.");
  }

  return unknowns;
}

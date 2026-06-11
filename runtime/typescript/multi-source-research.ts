import { runDeepSeekResearch, type DeepSeekResearchResult } from "./deepseek-research";
import { loadLocalEnv } from "./env";
import { runGeminiResearch, type GeminiResearchResult } from "./gemini-research";
import {
  advisoryResearchProviders,
  defaultMultiSourceResearchProviders,
  requiredSourceBackedResearchProviders,
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

export interface ProviderFallback {
  from: ResearchProvider;
  to: ResearchProvider;
  reason: string;
  status: "used" | "already_used" | "unavailable" | "failed";
  notes: string;
}

export interface MultiSourceResearchResult {
  query: string;
  providersRequested: ResearchProvider[];
  providersUsed: ResearchProvider[];
  unavailableProviders: ResearchProvider[];
  failures: ProviderFailure[];
  fallbacks: ProviderFallback[];
  results: Array<TavilyResearchResult | DeepSeekResearchResult | GeminiResearchResult>;
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
  researchProviders.gemini,
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

      if (provider === researchProviders.gemini) {
        return runGeminiResearch({
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

  const fallbacks = await applyProviderFallbacks({
    input,
    providersRequested,
    results,
    failures,
  });

  return {
    query: input.query,
    providersRequested,
    providersUsed: results.map((result) => result.provider),
    unavailableProviders,
    failures,
    fallbacks,
    results,
    sources: collectSources(results),
    validation: validateMultiSourceCoverage(input.mode, providersRequested, results, unavailableProviders, failures, fallbacks),
    unknowns: buildUnknowns(providersRequested, unavailableProviders, failures, fallbacks, results.length),
  };
}

async function applyProviderFallbacks(args: {
  input: MultiSourceResearchInput;
  providersRequested: ResearchProvider[];
  results: MultiSourceResearchResult["results"];
  failures: ProviderFailure[];
}): Promise<ProviderFallback[]> {
  const fallbacks: ProviderFallback[] = [];
  const tavilyFailure = args.failures.find((failure) => failure.provider === researchProviders.tavily);

  if (!tavilyFailure || !isTavilyLimitError(tavilyFailure.error)) {
    return fallbacks;
  }

  if (!args.providersRequested.includes(researchProviders.deepseek)) {
    return fallbacks;
  }

  const fallback: ProviderFallback = {
    from: researchProviders.tavily,
    to: researchProviders.deepseek,
    reason: "tavily_limit",
    status: "unavailable",
    notes: "Tavily reached a rate/daily limit. Explicitly requested DeepSeek may continue synthesis, but it is not source-backed evidence.",
  };

  if (args.results.some((result) => result.provider === researchProviders.deepseek)) {
    fallbacks.push({
      ...fallback,
      status: "already_used",
      notes: "Tavily reached a rate/daily limit. DeepSeek already returned results in this run and should be used only for synthesis/claims-to-validate.",
    });
    return fallbacks;
  }

  if (!isProviderConfigured(researchProviders.deepseek)) {
    fallbacks.push({
      ...fallback,
      status: "unavailable",
      notes: "Tavily reached a rate/daily limit, but DEEPSEEK_API_KEY is not configured.",
    });
    return fallbacks;
  }

  try {
    const result = await runDeepSeekResearch({
      query: [
        args.input.query,
        "",
        "Fallback context: Tavily hit a rate or daily limit. Continue research as DeepSeek synthesis only.",
        "Mark all market facts, quantitative claims and external-source claims as needs_validation unless supplied in the prompt.",
      ].join("\n"),
      productContext: args.input.productContext,
      geography: args.input.geography,
      language: args.input.language,
    });
    args.results.push(result);
    fallbacks.push({
      ...fallback,
      status: "used",
      notes: "DeepSeek was used as a fallback after Tavily limit. Output is synthesis only and does not satisfy Tavily source-backed coverage.",
    });
  } catch (error) {
    fallbacks.push({
      ...fallback,
      status: "failed",
      notes: error instanceof Error ? error.message : String(error),
    });
  }

  return fallbacks;
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

  if (provider === researchProviders.gemini) {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  return false;
}

function validateMultiSourceCoverage(
  mode: ResearchMode | undefined,
  providersRequested: ResearchProvider[],
  results: MultiSourceResearchResult["results"],
  unavailableProviders: ResearchProvider[],
  failures: ProviderFailure[],
  fallbacks: ProviderFallback[],
): MultiSourceResearchResult["validation"] {
  const checks: string[] = [];
  const used = new Set(results.map((result) => result.provider));
  const requiresDefaultMultiSource = !mode || mode === researchModes.deepResearch;

  if (!requiresDefaultMultiSource) {
    checks.push(`Multi-source minimum is not enforced for mode '${mode}'.`);
    return { status: "pass", checks };
  }

  for (const provider of requiredSourceBackedResearchProviders) {
    if (used.has(provider)) {
      checks.push(`${provider}: returned source-backed results.`);
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

  const requestedAdvisoryProviders = advisoryResearchProviders.filter((provider) => providersRequested.includes(provider));

  for (const provider of requestedAdvisoryProviders) {
    if (used.has(provider)) {
      checks.push(`${provider}: advisory cross-check returned results; not source-backed evidence.`);
      continue;
    }

    if (unavailableProviders.includes(provider)) {
      checks.push(`${provider}: advisory cross-check unavailable; non-blocking for ready status.`);
      continue;
    }

    if (failures.some((failure) => failure.provider === provider)) {
      checks.push(`${provider}: advisory cross-check failed; non-blocking for ready status.`);
      continue;
    }

    checks.push(`${provider}: advisory cross-check did not return results; non-blocking for ready status.`);
  }

  for (const fallback of fallbacks) {
    checks.push(`${fallback.from}: fallback to ${fallback.to} ${fallback.status} (${fallback.reason}).`);
  }

  const status = requiredSourceBackedResearchProviders.every((provider) => used.has(provider))
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
  fallbacks: ProviderFallback[],
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

  if (fallbacks.some((fallback) => fallback.from === researchProviders.tavily && fallback.to === researchProviders.deepseek)) {
    unknowns.push("Tavily limit triggered DeepSeek fallback; source-backed evidence remains incomplete until Tavily, web search or another source-backed provider succeeds.");
  }

  if (!providersRequested.length) {
    unknowns.push("Source policy resolved to an empty provider list.");
  }

  return unknowns;
}

function isTavilyLimitError(error: string): boolean {
  return /429|rate.?limit|daily.?cap|daily_cap_reached|too many requests|quota|limit/i.test(error);
}

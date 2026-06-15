import { loadLocalEnv } from "./env";

export interface TavilyResearchInput {
  query: string;
  productContext?: string;
  geography?: string;
  language?: "ru" | "en";
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeRawContent?: boolean | "markdown" | "text";
}

export interface TavilyEvidence {
  url: string;
  title?: string;
  content?: string;
  score?: number;
  publishedDate?: string;
}

export interface TavilyFinding {
  finding: string;
  evidence: TavilyEvidence[];
  confidence: "high" | "medium" | "low";
}

export interface TavilyResearchResult {
  provider: "tavily";
  query: string;
  answer?: string;
  sources: TavilyEvidence[];
  findings: TavilyFinding[];
  competitors: TavilyEvidence[];
  claimsToValidate: string[];
  unknowns: string[];
  responseTime?: number;
}

interface TavilySearchResponse {
  query?: string;
  answer?: string;
  response_time?: number;
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    raw_content?: string | null;
    score?: number;
    published_date?: string;
  }>;
}

const DEFAULT_ENDPOINT = "https://api.tavily.com/search";
const MAX_TAVILY_QUERY_LENGTH = 380;
const DEFAULT_TAVILY_TIMEOUT_MS = 180_000;

export async function runTavilyResearch(input: TavilyResearchInput): Promise<TavilyResearchResult> {
  loadLocalEnv();
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is required for tavily research.");
  }

  const query = buildTavilyQuery(input);
  const response = await searchTavily({
    apiKey,
    query,
    maxResults: input.maxResults ?? 8,
    includeDomains: input.includeDomains,
    excludeDomains: input.excludeDomains,
    includeRawContent: input.includeRawContent ?? false,
  });
  const sources = normalizeTavilySources(response.results ?? []);
  const competitors = sources.filter((source) => {
    const haystack = `${source.title ?? ""} ${source.content ?? ""}`.toLowerCase();
    return /competitor|alternative|review|pricing|compare|marketplace|service/.test(haystack);
  });

  return {
    provider: "tavily",
    query,
    answer: response.answer,
    sources,
    findings: buildFindings(response.answer, sources),
    competitors,
    claimsToValidate: buildClaimsToValidate(response.answer, sources),
    unknowns: sources.length ? [] : ["Tavily returned no sources; validate the query and provider availability."],
    responseTime: response.response_time,
  };
}

async function searchTavily(args: {
  apiKey: string;
  query: string;
  maxResults: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeRawContent: boolean | "markdown" | "text";
}): Promise<TavilySearchResponse> {
  const endpoint = process.env.TAVILY_API_ENDPOINT || DEFAULT_ENDPOINT;
  const timeoutMs = resolveTavilyTimeoutMs();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      query: args.query,
      topic: "general",
      search_depth: "advanced",
      max_results: args.maxResults,
      include_answer: true,
      include_raw_content: args.includeRawContent,
      include_domains: args.includeDomains ?? [],
      exclude_domains: args.excludeDomains ?? [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const details = errorText ? ` ${truncateErrorDetails(errorText)}` : "";
    throw new Error(`Tavily research failed: ${response.status} ${response.statusText}.${details}`);
  }

  return response.json() as Promise<TavilySearchResponse>;
}

function resolveTavilyTimeoutMs(): number {
  const raw = process.env.TAVILY_TIMEOUT_MS;

  if (!raw) {
    return DEFAULT_TAVILY_TIMEOUT_MS;
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("TAVILY_TIMEOUT_MS must be a positive number of milliseconds.");
  }

  return value;
}

function truncateErrorDetails(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function buildTavilyQuery(input: TavilyResearchInput): string {
  const parts = [
    input.query,
    input.productContext ? `Product context: ${input.productContext}` : undefined,
    input.geography ? `Geography: ${input.geography}` : undefined,
    input.language ? `Preferred language: ${input.language}` : undefined,
  ].filter(Boolean);

  return truncateQuery(parts.join("\n"));
}

function truncateQuery(query: string): string {
  const normalized = query.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_TAVILY_QUERY_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_TAVILY_QUERY_LENGTH - 1).trim()}…`;
}

function normalizeTavilySources(results: NonNullable<TavilySearchResponse["results"]>): TavilyEvidence[] {
  const seen = new Set<string>();
  const sources: TavilyEvidence[] = [];

  for (const result of results) {
    if (!result.url || seen.has(result.url)) {
      continue;
    }

    seen.add(result.url);
    sources.push({
      url: result.url,
      title: result.title,
      content: result.content ?? result.raw_content ?? undefined,
      score: result.score,
      publishedDate: result.published_date,
    });
  }

  return sources;
}

function buildFindings(answer: string | undefined, sources: TavilyEvidence[]): TavilyFinding[] {
  const findings: TavilyFinding[] = [];

  if (answer) {
    findings.push({
      finding: answer,
      evidence: sources.slice(0, 5),
      confidence: sources.length >= 3 ? "medium" : "low",
    });
  }

  for (const source of sources.slice(0, 5)) {
    const finding = source.content?.trim() || source.title?.trim();
    if (!finding) {
      continue;
    }

    findings.push({
      finding,
      evidence: [source],
      confidence: typeof source.score === "number" && source.score >= 0.75 ? "medium" : "low",
    });
  }

  return findings;
}

function buildClaimsToValidate(answer: string | undefined, sources: TavilyEvidence[]): string[] {
  const claims: string[] = [];

  if (answer && /\d|%|market|рын|цена|стоим|growth|users|revenue/i.test(answer)) {
    claims.push("Validate quantitative or market-size claims from Tavily answer against primary sources.");
  }

  if (sources.some((source) => !source.publishedDate)) {
    claims.push("Check publication dates for sources that do not expose freshness metadata.");
  }

  return claims;
}

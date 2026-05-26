import Firecrawl, {
  type Document,
  type ScrapeExecuteRequest,
  type ScrapeExecuteResponse,
  type ScrapeOptions,
} from "@mendable/firecrawl-js";
import { loadLocalEnv } from "./env";

export interface FirecrawlScrapeForPlaywrightResult {
  url: string;
  title?: string;
  markdown: string;
  metadata: NonNullable<Document["metadata"]>;
  links: string[];
  images: string[];
  screenshot?: string;
  scrapeId?: string;
}

export function hasFirecrawlCredentials(): boolean {
  loadLocalEnv();
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

export function createFirecrawlClient(): Firecrawl {
  loadLocalEnv();
  return new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY,
    apiUrl: process.env.FIRECRAWL_API_URL,
    timeoutMs: Number(process.env.FIRECRAWL_TIMEOUT_MS ?? 60_000),
  });
}

export async function scrapeForPlaywright(
  url: string,
  options: ScrapeOptions = {},
): Promise<FirecrawlScrapeForPlaywrightResult> {
  if (!hasFirecrawlCredentials()) {
    throw new Error("FIRECRAWL_API_KEY is required for Firecrawl scrape.");
  }

  const client = createFirecrawlClient();
  const document = await client.scrape(url, {
    formats: ["markdown", "links", "images"],
    onlyMainContent: true,
    ...options,
  });
  const metadata = document.metadata ?? {};
  const markdown = document.markdown?.trim();

  if (!markdown) {
    throw new Error(`Firecrawl returned empty markdown for ${url}.`);
  }

  return {
    url: metadata.sourceURL ?? metadata.url ?? url,
    title: metadata.title,
    markdown,
    metadata,
    links: document.links ?? [],
    images: document.images ?? [],
    screenshot: document.screenshot,
    scrapeId: metadata.scrapeId,
  };
}

export async function runFirecrawlPlaywrightCode(
  scrapeId: string,
  code: string,
  options: Omit<ScrapeExecuteRequest, "code" | "language"> = {},
): Promise<ScrapeExecuteResponse> {
  if (!hasFirecrawlCredentials()) {
    throw new Error("FIRECRAWL_API_KEY is required for Firecrawl interact.");
  }

  const client = createFirecrawlClient();
  return client.interact(scrapeId, {
    ...options,
    language: "node",
    code,
  });
}

export async function stopFirecrawlInteraction(scrapeId: string): Promise<void> {
  if (!hasFirecrawlCredentials()) {
    return;
  }

  const client = createFirecrawlClient();
  await client.stopInteraction(scrapeId);
}

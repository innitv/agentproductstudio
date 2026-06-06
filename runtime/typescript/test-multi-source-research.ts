import assert from "node:assert/strict";

import { runMultiSourceResearch } from "./multi-source-research";

const originalFetch = globalThis.fetch;
const originalEnv = {
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  RESEARCH_PROVIDER_ORDER: process.env.RESEARCH_PROVIDER_ORDER,
};

try {
  process.env.TAVILY_API_KEY = "test-tavily-key";
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  delete process.env.GEMINI_API_KEY;
  process.env.RESEARCH_PROVIDER_ORDER = "tavily";

  globalThis.fetch = async (input, init) => {
    const url = String(input);

    if (url.includes("api.tavily.com")) {
      return new Response(JSON.stringify({ code: "daily_cap_reached", message: "Keyless daily limit reached" }), {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("api.deepseek.com")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { messages?: Array<{ content?: string }> };
      const prompt = body.messages?.at(-1)?.content ?? "";
      assert(prompt.includes("Fallback context: Tavily hit a rate or daily limit."));
      return Response.json({
        choices: [{ message: { content: "DeepSeek fallback synthesis. Claims need validation." } }],
        usage: { prompt_tokens: 10, completion_tokens: 6, total_tokens: 16 },
      });
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await runMultiSourceResearch({
    query: "A3 Pay fallback research",
    geography: "Russia",
    language: "ru",
  });

  assert(result.failures.some((failure) => failure.provider === "tavily"));
  assert(result.fallbacks.some((fallback) => fallback.from === "tavily" && fallback.to === "deepseek" && fallback.status === "used"));
  assert(result.providersUsed.includes("deepseek"));
  assert(!result.providersUsed.includes("tavily"));
  assert.equal(result.validation.status, "needs_validation");
  assert(result.unknowns.some((unknown) => unknown.includes("source-backed evidence remains incomplete")));
} finally {
  globalThis.fetch = originalFetch;
  restoreEnv("TAVILY_API_KEY", originalEnv.TAVILY_API_KEY);
  restoreEnv("DEEPSEEK_API_KEY", originalEnv.DEEPSEEK_API_KEY);
  restoreEnv("GEMINI_API_KEY", originalEnv.GEMINI_API_KEY);
  restoreEnv("RESEARCH_PROVIDER_ORDER", originalEnv.RESEARCH_PROVIDER_ORDER);
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

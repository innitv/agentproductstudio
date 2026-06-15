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
      throw new Error("DeepSeek must not run without explicit opt-in.");
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await runMultiSourceResearch({
    query: "payment product fallback research",
    geography: "Russia",
    language: "ru",
  });

  assert(result.failures.some((failure) => failure.provider === "tavily"));
  assert(!result.fallbacks.some((fallback) => fallback.to === "deepseek"));
  assert(!result.providersUsed.includes("deepseek"));
  assert(!result.providersUsed.includes("tavily"));
  assert.equal(result.validation.status, "needs_validation");
  assert(result.unknowns.some((unknown) => unknown.includes("Provider failures need review: tavily")));

  process.env.TAVILY_API_KEY = "test-tavily-key";
  delete process.env.DEEPSEEK_API_KEY;
  process.env.GEMINI_API_KEY = "test-gemini-key";
  process.env.RESEARCH_PROVIDER_ORDER = "tavily,gemini";

  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.includes("api.tavily.com")) {
      return Response.json({
        answer: "Payment product source-backed summary.",
        response_time: 0.1,
        results: [
          {
            title: "Bank of Russia payment systems",
            url: "https://www.cbr.ru/",
            content: "Source-backed payment market context.",
            score: 0.91,
            published_date: "2026-01-01",
          },
        ],
      });
    }

    if (url.includes("generativelanguage.googleapis.com")) {
      return new Response("Service Unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      });
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const advisoryFailureResult = await runMultiSourceResearch({
    query: "payment product advisory failure research",
    geography: "Russia",
    language: "ru",
  });

  assert(advisoryFailureResult.providersUsed.includes("tavily"));
  assert(!advisoryFailureResult.providersUsed.includes("gemini"));
  assert(advisoryFailureResult.failures.some((failure) => failure.provider === "gemini"));
  assert.equal(advisoryFailureResult.validation.status, "pass");
  assert(
    advisoryFailureResult.validation.checks.some((check) =>
      check.includes("advisory cross-check failed; non-blocking for ready status"),
    ),
  );
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

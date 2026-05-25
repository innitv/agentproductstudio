import { loadLocalEnv } from "./env";

export interface DeepSeekResearchInput {
  query: string;
  productContext?: string;
  geography?: string;
  language?: "ru" | "en";
  maxTokens?: number;
}

export interface DeepSeekResearchResult {
  provider: "deepseek";
  model: string;
  query: string;
  summary: string;
  findings: Array<{
    finding: string;
    evidence: [];
    confidence: "low";
  }>;
  sources: [];
  claimsToValidate: string[];
  unknowns: string[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

interface DeepSeekChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

const DEFAULT_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";

export async function runDeepSeekResearch(input: DeepSeekResearchInput): Promise<DeepSeekResearchResult> {
  loadLocalEnv();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is required for deepseek research.");
  }

  const model = process.env.DEEPSEEK_RESEARCH_MODEL || DEFAULT_MODEL;
  const response = await createDeepSeekCompletion({
    apiKey,
    model,
    prompt: buildDeepSeekPrompt(input),
    maxTokens: input.maxTokens ?? 1200,
  });
  const summary = extractContent(response);

  return {
    provider: "deepseek",
    model,
    query: input.query,
    summary,
    findings: summary
      ? [{
          finding: summary,
          evidence: [],
          confidence: "low",
        }]
      : [],
    sources: [],
    claimsToValidate: [
      "DeepSeek output is model synthesis, not source-backed evidence; validate claims against Tavily and primary sources.",
    ],
    unknowns: summary ? [] : ["DeepSeek returned no content."],
    usage: {
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    },
  };
}

async function createDeepSeekCompletion(args: {
  apiKey: string;
  model: string;
  prompt: string;
  maxTokens: number;
}): Promise<DeepSeekChatCompletionResponse> {
  const endpoint = process.env.DEEPSEEK_API_ENDPOINT || DEFAULT_ENDPOINT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: args.model,
      messages: [
        {
          role: "system",
          content: "You are a research cross-check assistant. Do not invent sources. Mark unsupported claims as needs_validation.",
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
      max_tokens: args.maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek research failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<DeepSeekChatCompletionResponse>;
}

function buildDeepSeekPrompt(input: DeepSeekResearchInput): string {
  const language = input.language ?? "ru";
  const geography = input.geography ?? "not specified";
  const productContext = input.productContext ?? "not specified";

  return [
    `Language: ${language}`,
    `Geography: ${geography}`,
    `Product context: ${productContext}`,
    `Research query: ${input.query}`,
    "",
    "Act as an independent research cross-check provider.",
    "Return concise sections:",
    "- likely audience and JTBD hypotheses",
    "- competitor discovery angles",
    "- risks and contradictions to verify",
    "- claims_to_validate",
    "- unknowns",
    "",
    "Do not cite URLs unless they are supplied in the prompt. Do not present model knowledge as verified evidence.",
  ].join("\n");
}

function extractContent(response: DeepSeekChatCompletionResponse): string {
  const message = response.choices?.[0]?.message;
  return [message?.reasoning_content, message?.content].filter(Boolean).join("\n\n").trim();
}

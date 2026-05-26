import { loadLocalEnv } from "./env";

export interface GeminiResearchInput {
  query: string;
  productContext?: string;
  geography?: string;
  language?: "ru" | "en";
  maxTokens?: number;
}

export interface GeminiResearchResult {
  provider: "gemini";
  model: string;
  query: string;
  summary: string;
  findings: Array<{
    finding: string;
    evidence: [];
    confidence: "medium";
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

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

const DEFAULT_ENDPOINT_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
const DEFAULT_MODEL = "gemini-2.5-flash";

export async function runGeminiResearch(input: GeminiResearchInput): Promise<GeminiResearchResult> {
  loadLocalEnv();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for gemini research.");
  }

  const model = process.env.GEMINI_RESEARCH_MODEL || DEFAULT_MODEL;
  const response = await createGeminiCompletion({
    apiKey,
    model,
    prompt: buildGeminiPrompt(input),
    maxTokens: input.maxTokens ?? 1500,
  });
  const summary = extractContent(response);

  return {
    provider: "gemini",
    model,
    query: input.query,
    summary,
    findings: summary
      ? [{
          finding: summary,
          evidence: [],
          confidence: "medium",
        }]
      : [],
    sources: [],
    claimsToValidate: [
      "Gemini output is deep model synthesis and cross-check; validate key assumptions against Tavily or other source-backed providers.",
    ],
    unknowns: summary ? [] : ["Gemini returned no content."],
    usage: {
      promptTokens: response.usageMetadata?.promptTokenCount,
      completionTokens: response.usageMetadata?.candidatesTokenCount,
      totalTokens: response.usageMetadata?.totalTokenCount,
    },
  };
}

async function createGeminiCompletion(args: {
  apiKey: string;
  model: string;
  prompt: string;
  maxTokens: number;
}): Promise<GeminiGenerateContentResponse> {
  const endpoint = (process.env.GEMINI_API_ENDPOINT || DEFAULT_ENDPOINT_TEMPLATE)
    .replace("{model}", args.model)
    .replace("{apiKey}", args.apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: args.prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: args.maxTokens,
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini research failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GeminiGenerateContentResponse>;
}

function buildGeminiPrompt(input: GeminiResearchInput): string {
  const language = input.language ?? "ru";
  const geography = input.geography ?? "not specified";
  const productContext = input.productContext ?? "not specified";

  return [
    "You are a highly capable AI product research and strategy assistant.",
    "Do not invent external source URLs. Mark unsupported claims as needs_validation.",
    "",
    `Language: ${language}`,
    `Geography: ${geography}`,
    `Product context: ${productContext}`,
    `Research query: ${input.query}`,
    "",
    "Provide a deep, structured analysis covering the following points:",
    "1. Likely Audience Segments & their JTBD (Jobs To Be Done) hypotheses.",
    "2. Competitor Discovery Angles & market positioning patterns.",
    "3. Key Strategic Risks, pitfalls and potential contradictions to verify.",
    "4. Specific Claims to validate (claims_to_validate).",
    "5. Unknowns that require primary target user research.",
    "",
    "Format the response cleanly in markdown. Be specific and rigorous.",
  ].join("\n");
}

function extractContent(response: GeminiGenerateContentResponse): string {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts || !parts.length) {
    return "";
  }
  return parts.map((part) => part.text).filter(Boolean).join("\n").trim();
}

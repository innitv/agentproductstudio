export const researchModes = {
  localOnly: "local_only",
  userSourcesOnly: "user_sources_only",
  webSearch: "web_search",
  browserScan: "browser_scan",
  deepResearch: "deep_research",
  officialDocs: "official_docs",
} as const;

export type ResearchMode = (typeof researchModes)[keyof typeof researchModes];

export const researchProviders = {
  fileSearch: "file_search",
  openaiDocs: "openai_docs",
  webSearch: "web_search",
  browser: "browser",
  deepseek: "deepseek",
  tavily: "tavily",
  deepResearchMcp: "deep_research_mcp",
  userSources: "user_sources",
  customMcp: "custom_mcp",
} as const;

export type ResearchProvider = (typeof researchProviders)[keyof typeof researchProviders];

export const defaultMultiSourceResearchProviders = [
  researchProviders.tavily,
  researchProviders.deepseek,
] as const satisfies readonly ResearchProvider[];

export interface SourcePolicy {
  mode: ResearchMode;
  prefer: ResearchProvider[];
  allow: ResearchProvider[];
  deny: ResearchProvider[];
  require_citations: boolean;
  fallback: "needs_validation" | "ask_user" | "blocked";
}

export const defaultSourcePolicy: SourcePolicy = {
  mode: researchModes.deepResearch,
  prefer: [
    ...defaultMultiSourceResearchProviders,
    researchProviders.userSources,
    researchProviders.openaiDocs,
    researchProviders.deepResearchMcp,
    researchProviders.webSearch,
    researchProviders.browser,
  ],
  allow: [
    researchProviders.fileSearch,
    researchProviders.userSources,
    researchProviders.openaiDocs,
    researchProviders.deepseek,
    researchProviders.tavily,
    researchProviders.deepResearchMcp,
    researchProviders.webSearch,
    researchProviders.browser,
    researchProviders.customMcp,
  ],
  deny: [],
  require_citations: true,
  fallback: "needs_validation",
};

export const sourcePoliciesByMode: Record<ResearchMode, SourcePolicy> = {
  [researchModes.localOnly]: {
    mode: researchModes.localOnly,
    prefer: [researchProviders.fileSearch],
    allow: [researchProviders.fileSearch],
    deny: [
      researchProviders.webSearch,
      researchProviders.browser,
      researchProviders.deepseek,
      researchProviders.tavily,
      researchProviders.deepResearchMcp,
      researchProviders.customMcp,
    ],
    require_citations: false,
    fallback: "needs_validation",
  },
  [researchModes.userSourcesOnly]: {
    mode: researchModes.userSourcesOnly,
    prefer: [researchProviders.userSources, researchProviders.fileSearch],
    allow: [researchProviders.userSources, researchProviders.fileSearch],
    deny: [
      researchProviders.webSearch,
      researchProviders.browser,
      researchProviders.deepseek,
      researchProviders.tavily,
      researchProviders.deepResearchMcp,
      researchProviders.customMcp,
    ],
    require_citations: true,
    fallback: "ask_user",
  },
  [researchModes.webSearch]: {
    mode: researchModes.webSearch,
    prefer: [researchProviders.webSearch, researchProviders.browser],
    allow: [researchProviders.webSearch, researchProviders.browser, researchProviders.userSources],
    deny: [],
    require_citations: true,
    fallback: "needs_validation",
  },
  [researchModes.browserScan]: {
    mode: researchModes.browserScan,
    prefer: [researchProviders.browser, researchProviders.webSearch],
    allow: [researchProviders.browser, researchProviders.webSearch, researchProviders.userSources],
    deny: [],
    require_citations: true,
    fallback: "needs_validation",
  },
  [researchModes.deepResearch]: defaultSourcePolicy,
  [researchModes.officialDocs]: {
    mode: researchModes.officialDocs,
    prefer: [researchProviders.openaiDocs, researchProviders.userSources],
    allow: [researchProviders.openaiDocs, researchProviders.userSources, researchProviders.fileSearch],
    deny: [researchProviders.webSearch, researchProviders.browser, researchProviders.deepResearchMcp, researchProviders.deepseek],
    require_citations: true,
    fallback: "blocked",
  },
};

export function resolveSourcePolicy(mode?: ResearchMode): SourcePolicy {
  if (!mode) {
    return defaultSourcePolicy;
  }

  return sourcePoliciesByMode[mode];
}

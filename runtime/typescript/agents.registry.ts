// Future OpenAI Agents SDK registry.
// The manager-style pattern should expose specialists as tools to orchestrator.

export const agentNames = {
  orchestrator: "orchestrator",
  research: "research",
  prd: "prd",
  notionPublisher: "notion-publisher",
  design: "design",
  ia: "ia",
  designGenerator: "design-generator",
  prototype: "prototype",
  copywriting: "copywriting",
  frontend: "frontend",
  testBench: "test-bench",
  qaReview: "qa-review",
  release: "release",
} as const;

export const agentInstructionFiles = {
  orchestrator: "agent-pack/agents/orchestrator.agent.md",
  research: "agent-pack/agents/research.agent.md",
  prd: "agent-pack/agents/prd.agent.md",
  notionPublisher: "agent-pack/agents/notion-publisher.agent.md",
  design: "agent-pack/agents/design.agent.md",
  ia: "agent-pack/agents/ia.agent.md",
  designGenerator: "agent-pack/agents/design-generator.agent.md",
  prototype: "agent-pack/agents/prototype.agent.md",
  copywriting: "agent-pack/agents/copywriting.agent.md",
  frontend: "agent-pack/agents/frontend.agent.md",
  testBench: "agent-pack/agents/test-bench.agent.md",
  qaReview: "agent-pack/agents/qa-review.agent.md",
  release: "agent-pack/agents/release.agent.md",
} as const;

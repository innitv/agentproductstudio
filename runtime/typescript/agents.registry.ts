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
  orchestrator: "agent-pack/agent-contracts/orchestrator.agent.md",
  research: "agent-pack/agent-contracts/research.agent.md",
  prd: "agent-pack/agent-contracts/prd.agent.md",
  notionPublisher: "agent-pack/agent-contracts/notion-publisher.agent.md",
  design: "agent-pack/agent-contracts/design.agent.md",
  ia: "agent-pack/agent-contracts/ia.agent.md",
  designGenerator: "agent-pack/agent-contracts/design-generator.agent.md",
  prototype: "agent-pack/agent-contracts/prototype.agent.md",
  copywriting: "agent-pack/agent-contracts/copywriting.agent.md",
  frontend: "agent-pack/agent-contracts/frontend.agent.md",
  testBench: "agent-pack/agent-contracts/test-bench.agent.md",
  qaReview: "agent-pack/agent-contracts/qa-review.agent.md",
  release: "agent-pack/agent-contracts/release.agent.md",
} as const;

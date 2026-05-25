// Future tracing configuration.
// Production-like runs should avoid storing sensitive inputs and outputs.

export const tracingDefaults = {
  traceName: "landing-agent-workflow",
  includeSensitiveData: false,
  logToolCalls: true,
  logHandoffs: true,
  logGuardrails: true,
} as const;

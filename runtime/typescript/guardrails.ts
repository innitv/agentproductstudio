// Future guardrail definitions.
// Keep policy in ../../guardrails as the source of truth.

export function containsSecretLikeValue(value: string): boolean {
  return /sk-[A-Za-z0-9_-]+/.test(value) || /OPENAI_API_KEY\s*=/.test(value);
}

export function requiresHumanApproval(action: string): boolean {
  return [
    "deploy",
    "delete_data",
    "external_send",
    "mass_change",
    "change_secrets",
    "connect_broad_mcp",
  ].includes(action);
}

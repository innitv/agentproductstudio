# Rules

Rules define deterministic command and action policy for the product pipeline. They complement sandbox and approval settings; they do not replace human approval for risky actions.

## Files

- `safe-commands.example.toml` — example command/action policy without secrets.

## Policy Groups

- `safe_commands`: local read/check commands that can run without approval in the workspace.
- `approval_required_actions`: actions that require explicit human approval.
- `blocked_patterns`: destructive or unsafe command patterns that should not run automatically.

## Product Pipeline Defaults

Safe by default:

- reading project files;
- validating JSON schemas;
- running local lint/typecheck/test/build when available;
- updating markdown artifacts and runtime skeleton files inside the workspace.

Approval required:

- deploy;
- deletion;
- external sends;
- mass changes;
- changing secrets/env;
- connecting broad MCP servers;
- granting filesystem/browser/GitHub write access.

Blocked without explicit task and approval:

- recursive deletion;
- force reset/checkout;
- writing real secrets;
- publishing or sending external messages;
- production data mutation.

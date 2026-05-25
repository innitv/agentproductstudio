# Release Notes

agent_name: release
status: success

## Changed

- Replaced previous SIM landing with VALORANT prepaid-code marketplace concept.
- Added custom gaming commerce hero SVG.
- Updated Playwright smoke tests.
- Added full `AGENTS.md` artifact chain.

## Validation

- `yarn validate:config`
- `yarn typecheck`
- `yarn build`
- `yarn qa:playwright`
- `yarn agents:inspect`

## Deployment Notes

- Dev: `yarn dev --port <port>`.
- Build: `yarn build`.

## Rollback Notes

- Restore previous `App.tsx`, `styles.css`, and Playwright spec if needed.
- Remove `apps/frontend/src/assets/vp-vault-hero.svg`.

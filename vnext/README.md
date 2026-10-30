# Club Control Player TEST — vNext foundation

This directory starts the **modular rewrite** of the Player against the same isolated TEST backend as Manager. It is not currently mounted in the existing Player PWA.

- `vnext/shared/domain-contract.v1.json` mirrors the **canonical Manager TEST** contract. Sync deliberately; avoid independent player-only source-of-truth tables.
- No LIVE data or main branch modified, no service-role credentials in client, and no outbound notification dispatch.
- Existing `app.js` and `config.js` remain as working reference; source config is intentionally in demo mode. Hosted connected TEST PWA is a separate release gate.
- First module: sign-in/sign-out, identity resolution, effective team membership and scoped navigation; then actual RSVP round-trip and event calendar.
- Full production-schema parity and mobile E2E are not yet claimed.

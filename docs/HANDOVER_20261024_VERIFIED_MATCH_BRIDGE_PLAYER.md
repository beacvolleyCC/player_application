# Club Control Player — verified canonical match-ID bridge staging (2026-10-24)

**PR #27: DRAFT ONLY. Feature flag OFF. Not merged, not deployed.**
Dependency: Manager draft [PR #75](https://github.com/beacvolleyCC/club-control-manager/pull/75) staging the private, manually reviewed bridge and two new v3 RPCs.

## Integration
- Both Manager and Player now use the same `competition-match-bridge.js` pure, read-only helper. Enabled only when `CANONICAL_BRIDGE_V3_ENABLED===true`; **default false**. In the default state, **only the current v2 Supabase RPC is called**.
- Explicit opt-in: `cc_player_competition_mrsz_snapshot_v3` first. Revert to existing v2 **only if the requested v3 function is missing**, identified by relevant PostgREST/Pg codes and matching function name. Authentication/RLS/permission/network failures are never silently bypassed.
- Parse only `verifiedLegacyMatchBridge` entries with explicit `verified:true`, `verification:'official_identity_manually_verified'` and correct season, competition, valid distinct UUIDs, source key. Conflict/duplicate IDs are rejected.
- Canonical game rows are annotated with `_ccVerifiedLegacyMatchId` **only** after match UUID + source key + league + season all match. No Manager event ID, RSVP, booking, score, roster, or result is mutated; zero verified rows is an unchanged v2 UI.
- Old league readout and team picker authorization stays untouched; Women I `299`, Women II/B `959`, Men I/B `709` never merge by overlapping club names.
- `index.html`, `sw.js`, app registration, script/style assets and the bridge share cache version `20261024-verified-bridge-v1`; no mixed stale PWA payload. The undated postponed match card now clearly shows **„Halasztva · Időpont nélkül”** instead of implying a kickoff.
- No official league position, table points, or ranking are invented from partial results. Existing standings QA now verifies `position:null` and `tablePoints:null` for partial data.

## Tests / release gate
On commit `efdd8e4a6caee6abbb40e926a63646a7904305da`, these Player workflows were **success**:
- [Player MRSZ standings QA](https://github.com/beacvolleyCC/player_application/actions/runs/40044622908)
- [Verified match bridge UI contract QA](https://github.com/beacvolleyCC/player_application/actions/runs/40044623009)
- [Player men's B fixtures and standings QA](https://github.com/beacvolleyCC/player_application/actions/runs/40044623015)
- [Player match order and protocol QA](https://github.com/beacvolleyCC/player_application/actions/runs/40044622956)

The contract tests cover feature flag OFF/ON, v3 missing fallback, hard authorization errors, league separation, bad UUIDs, duplicate matches, and source immutability. GitHub CI and Node tests **do not** substitute for logged-in Player/mobile UI testing.

**Do not enable until Manager PR #75 has been reviewed, deployed under explicit release approval with DB auth checks, and its approved mappings have been separately verified.** No live Supabase writes were made. Other in-flight draft PRs (#25 subscription calendar; #26 source protocols) remain independent.

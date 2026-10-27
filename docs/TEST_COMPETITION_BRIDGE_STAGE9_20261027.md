# Club Control TEST – competition schedule bridge, 2026-10-27

## Scope and confirmed changes
ONLY isolated Supabase TEST `szzoubvhlwnojtzqjebc`; LIVE `snqsxlyhontaepembaic` was read-only. No new paid feature, push, email sender or LIVE write.

Migration `cc_test_player_competition_bridge_scoped_20261027` installed four functions:
- `cc_player_competition_mrsz_snapshot_v1()`: explicitly empty MRSZ arrays because TEST has zero MRSZ source rows; requires an active Auth-linked player and an active team membership.
- `cc_player_competition_mrsz_snapshot_v2()`: retains the Player v2 JSON shape including empty canonicalMatches/coverage/team stats until sources are reconstructed.
- `cc_player_competition_source_matches_effective_v1()`: real TEST BRSZ fixture rows for **only current player's active team memberships**, preserving Player source/meta keys. No cross-team BRSZ lookup.
- `cc_player_competition_user_schedule_v1()`: only the three TEST-supported distinct leagues, womenI = Női BB1, womenIIB = Női BB2/B, menA = Férfi A, filtered by active team membership with the canonical `legacy_team_id` mapping. Other leagues aren't mixed in.

After checking TEST's primary key (season,source_key), inserted three independent **synthetic** user-supplied schedule rows (one each for womenI, womenIIB and menA). All use `MINTA TEST` names and notes, not actual federation results.

## QA performed
- All four functions: signed-in EXECUTE=true, anonymous EXECUTE=false (readback).
- All four functions rejected a role-authenticated but unlinked test session in a rollback transaction. This is a **negative** authorization test only; not a real sign-in.
- TEST source counts: `competition_source_matches=9`, `cc_competition_user_schedule_v1=3`, MRSZ snapshots `0`, Auth users `0`; no entries in push outbox.
- TEST routine count in public/private: `92`.
- Code-level Player test + CI workflow added to confirm it references all three needed RPCs without combining MRSZ, BRSZ and user-provided feeds, and to check demo-only isolation.

## Explicit limitations
This is not MRSZ functional parity: the v2 MRSZ payload intentionally contains empty lists, and no real MRSZ federation data were ingested. No TEST Auth users exist, so **positive** Player sign-in, cross-team runtime checks, Realtime, and iOS installation tests are not completed. Manager/Player TEST applications remain DEMO and not yet separately deployed.

## Remaining priorities
1. Create real TEST Auth user through TEST Dashboard Authentication → Users (don't write auth.users manually), link only to a TEST player, and verify active membership.
2. Run positive and denied access tests across BB1 / BB2 / men identities, including notifications and competition views.
3. Restore validated MRSZ source data / canonical functions while preserving independent league identities and federation provenance.
4. Then complete other RPCs and deploy/install separated TEST PWAs with the TEST publishable key; don't enable external notifications.

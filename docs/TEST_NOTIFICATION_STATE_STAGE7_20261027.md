# Club Control Player TEST – értesítési állapotkezelés (2026-10-27)

**Kizárólag TEST Supabase:** szzoubvhlwnojtzqjebc. Az éles adatbázisban nem történt írás.

Applied migration `cc_test_player_own_notification_updates_20261027`:
- `public.cc_player_notification_read_v1(p_notification_id uuid)` – sets only the caller's own notification `read_at`.
- `public.cc_player_notification_dismiss_v1(p_notification_id uuid)` – sets only the caller's own notification `read_at` and `dismissed_at`.
- Both require valid `auth.uid()`, active player mapped to that Auth user, and matching `player_notifications.player_id`. Both use an explicitly empty search_path, revoke default PUBLIC and anon EXECUTE, grant EXECUTE only to authenticated users. No external network, SMTP or push dispatch.
- Verified readback: anon_execute=false, authenticated_execute=true for both functions; no custom triggers on player_notifications.
- Created six clearly labeled `MINTA TEST` notifications: two per sample player in BB1, BB2, and Férfi teams. No contact addresses were involved.
- Negative integration test in a rollback transaction with authenticated role but **no** valid auth identity rejected both actions with expected error; cannot falsely claim positive functional test without TEST Auth user.
- Static Player JS uses both RPC signatures. Added separate code contract QA workflow.
- The PWA stays **DEMO-only**, push disabled, no API backend/credentials. This commit does not deploy an app or grant special access.

Remaining: provision confirmed TEST Auth identity via TEST dashboard, link it to a TEST player, test signed-in read/dismiss both positive and cross-team negative, then enable the staging client only after further competition, payment, health, Manager and security acceptance. Costs 0 HUF.

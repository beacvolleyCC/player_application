# CC TEST Player – authenticated read services stage 6 (2026-10-27)

**ONLY TEST Supabase modified:** project `szzoubvhlwnojtzqjebc`. LIVE database and Player/Manager main branches left unchanged.

Supabase migration applied successfully: `cc_test_player_read_services_auth_scoped_20261027`. Four read-only TEST RPC functions were installed:
- `public.cc_player_avatar_team_directory_v1()` — avatars limited to members of an authenticated user's active TEST team(s).
- `public.cc_player_profile_data()` — only own attendance and own player fees, with original frontend JSON keys.
- `public.cc_player_notifications_v1(integer,boolean)` — only own notifications, with unread count.
- `public.cc_player_medical_status_v1()` — only own medical status/appointment (no email channel).

Every function checks `auth.uid()` and looks for `public.players.auth_user_id=auth.uid()`; no e-mail-only fallback and no anonymous EXECUTE grants. All are SECURITY DEFINER with explicit empty search_path and owner-checked selected rows. These functions do not enqueue mail or push, and do not perform DML writes.

The Supabase migration API reported success. Table-column readback confirmed player_fees.player_id (text), player_notifications.player_id (text), and player_medical_appointments.player_id (uuid), as expected. Detailed ACL readback was denied by security controls and was not bypassed. No genuine TEST Auth identity exists yet, so a signed-in functional smoke test is still required before declaring these RPCs fully verified.

Static Player JavaScript contract QA (new test file + branch workflow) checks the four required calls and confirms demo-only isolation remains intact. This is NOT a substitute for authenticated DB smoke tests.

Supabase security advisor reports 50 tables RLS-enabled with no policy (intentionally closed for TEST), two existing mutable-search_path utility functions, one citext extension in public, and warnings around SECURITY DEFINER RPCs. See <https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy>. No blanket access grants were added. No payment provider or outbound notifications enabled.

**Next gates:**
1. Create confirmed TEST Auth user via dashboard; link to intended TEST player only. Current TEST roster still 18 synthetic players, 0 Auth users.
2. Signed-in QA: avatar isolation across BB1/BB2/men, profile/medical/notifications own-only, cross-team denial; then notification read/dismiss write RPCs and finance fallback.
3. Complete remaining Player competition/stats RPCs and Manager functions, plus controlled TEST data mapping.
4. Provision separate deploy URL for each PWA (not yet deployed), then configure staging backend after Auth and complete QA. Preserve 0 Ft and LIVE isolation.

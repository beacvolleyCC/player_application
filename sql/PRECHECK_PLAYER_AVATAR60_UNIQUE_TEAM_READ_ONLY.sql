-- CLUB CONTROL / PLAYER — AVATAR 60 + TEAM UNIQUE V1
-- READ ONLY PRECHECK. Every boolean should be TRUE.
WITH deps AS (
  SELECT
    to_regclass('public.player_settings') IS NOT NULL AS player_settings_ok,
    to_regclass('public.players') IS NOT NULL AS players_ok,
    to_regclass('public.team_memberships') IS NOT NULL AS memberships_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='player_settings' AND column_name='player_id') AS settings_player_id_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='player_settings' AND column_name='avatar_id') AS settings_avatar_id_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='players' AND column_name='auth_user_id') AS players_auth_user_id_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_memberships' AND column_name='player_id') AS membership_player_id_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_memberships' AND column_name='team_id') AS membership_team_id_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_memberships' AND column_name='active') AS membership_active_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_memberships' AND column_name='starts_on') AS membership_starts_on_ok,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_memberships' AND column_name='ends_on') AS membership_ends_on_ok,
    to_regprocedure('public.cc_player_avatar_directory()') IS NOT NULL AS avatar_directory_rpc_ok
), dups AS (
  SELECT count(*)::int AS duplicate_groups
  FROM (
    SELECT tm.team_id, ps.avatar_id
    FROM public.team_memberships tm
    JOIN public.player_settings ps ON ps.player_id=tm.player_id
    WHERE tm.active=true
      AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
      AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
      AND nullif(trim(coalesce(ps.avatar_id,'')),'') IS NOT NULL
    GROUP BY tm.team_id, ps.avatar_id
    HAVING count(DISTINCT tm.player_id)>1
  ) q
)
SELECT
  deps.player_settings_ok,
  deps.players_ok,
  deps.memberships_ok,
  deps.settings_player_id_ok,
  deps.settings_avatar_id_ok,
  deps.players_auth_user_id_ok,
  deps.membership_player_id_ok,
  deps.membership_team_id_ok,
  deps.membership_active_ok,
  deps.membership_starts_on_ok,
  deps.membership_ends_on_ok,
  deps.avatar_directory_rpc_ok,
  (dups.duplicate_groups=0) AS no_existing_same_team_avatar_duplicates,
  NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid='public.player_settings'::regclass
      AND tgname='trg_cc_player_avatar_unique_team_v1'
      AND NOT tgisinternal
  ) AS target_trigger_missing,
  NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='cc_player_avatar_unique_team_guard_v1'
  ) AS target_guard_missing,
  to_regprocedure('public.cc_player_avatar_team_directory_v1()') IS NULL AS target_team_directory_missing
FROM deps,dups;

-- CLUB CONTROL / PLAYER — AVATAR 60 + TEAM UNIQUE V1
-- READ ONLY POSTCHECK. Every boolean should be TRUE.
WITH dups AS (
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
), ck AS (
  SELECT pg_get_constraintdef(c.oid) AS def
  FROM pg_constraint c
  WHERE c.conrelid='public.player_settings'::regclass
    AND c.conname='player_settings_avatar_id_check'
)
SELECT
  EXISTS(SELECT 1 FROM ck WHERE def LIKE '%extra_lemur%' AND def LIKE '%extra_axolotl%') AS avatar60_constraint_ok,
  to_regprocedure('public.cc_player_avatar_unique_team_guard_v1()') IS NOT NULL AS guard_function_ok,
  EXISTS(
    SELECT 1 FROM pg_trigger
    WHERE tgrelid='public.player_settings'::regclass
      AND tgname='trg_cc_player_avatar_unique_team_v1'
      AND NOT tgisinternal
      AND tgenabled<>'D'
  ) AS unique_team_trigger_ok,
  (dups.duplicate_groups=0) AS no_same_team_duplicates,
  to_regprocedure('public.cc_player_avatar_directory()') IS NOT NULL AS legacy_avatar_directory_rpc_still_ok,
  to_regprocedure('public.cc_player_avatar_team_directory_v1()') IS NOT NULL AS team_avatar_directory_rpc_ok,
  has_function_privilege('authenticated','public.cc_player_avatar_team_directory_v1()','EXECUTE') AS team_avatar_directory_authenticated_ok
FROM dups;

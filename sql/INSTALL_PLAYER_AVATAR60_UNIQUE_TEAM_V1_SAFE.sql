-- CLUB CONTROL / PLAYER — AVATAR 60 + TEAM UNIQUE V1
-- Adds 8 avatar IDs and enforces that an avatar cannot be used twice inside
-- the same currently-active competition team. No existing profile is changed.
BEGIN;

DO $$
DECLARE v_dups integer;
BEGIN
  IF to_regclass('public.player_settings') IS NULL OR to_regclass('public.team_memberships') IS NULL THEN
    RAISE EXCEPTION 'AVATAR60_DEPENDENCY_MISSING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='player_settings' AND column_name='avatar_id') THEN
    RAISE EXCEPTION 'AVATAR60_AVATAR_ID_COLUMN_MISSING';
  END IF;
  SELECT count(*) INTO v_dups FROM (
    SELECT tm.team_id, ps.avatar_id
    FROM public.team_memberships tm
    JOIN public.player_settings ps ON ps.player_id=tm.player_id
    WHERE tm.active=true
      AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
      AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
      AND nullif(trim(coalesce(ps.avatar_id,'')),'') IS NOT NULL
    GROUP BY tm.team_id,ps.avatar_id
    HAVING count(DISTINCT tm.player_id)>1
  ) x;
  IF v_dups>0 THEN
    RAISE EXCEPTION 'AVATAR60_EXISTING_TEAM_DUPLICATES:%',v_dups;
  END IF;
END $$;

ALTER TABLE public.player_settings
  DROP CONSTRAINT IF EXISTS player_settings_avatar_id_check;

ALTER TABLE public.player_settings
  ADD CONSTRAINT player_settings_avatar_id_check CHECK (
    avatar_id IS NULL OR avatar_id='' OR avatar_id = ANY (ARRAY[
      'alpaca','lion','tiger','panther','lynx','cat','husky','wolf',
      'fox','rabbit','bear','deer','panda','gorilla','monkey','elephant',
      'rhino','hippo','giraffe','buffalo','mammoth','donkey','goat','raccoon',
      'dog','otter','cow','ram','hedgehog','horse','zebra','turtle',
      'penguin','owl','eagle','dolphin','crocodile','frog','shark','moose',
      'extra_zebra','extra_horse','extra_deer','extra_kangaroo',
      'extra_rabbit','extra_eagle','extra_turtle','extra_dolphin',
      'extra_boar','extra_ram','extra_frog','extra_parrot',
      'extra_lemur','extra_mouse','extra_pig','extra_duck',
      'extra_sheep','extra_chicken','extra_trex','extra_axolotl'
    ]::text[])
  );

CREATE OR REPLACE FUNCTION public.cc_player_avatar_unique_team_guard_v1()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE v_avatar text := nullif(trim(coalesce(NEW.avatar_id,'')),'');
BEGIN
  IF v_avatar IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.team_memberships mine
    JOIN public.team_memberships other
      ON other.team_id=mine.team_id
     AND other.player_id<>NEW.player_id
    JOIN public.player_settings other_settings
      ON other_settings.player_id=other.player_id
     AND nullif(trim(coalesce(other_settings.avatar_id,'')),'')=v_avatar
    WHERE mine.player_id=NEW.player_id
      AND mine.active=true
      AND (mine.starts_on IS NULL OR mine.starts_on<=current_date)
      AND (mine.ends_on IS NULL OR mine.ends_on>=current_date)
      AND other.active=true
      AND (other.starts_on IS NULL OR other.starts_on<=current_date)
      AND (other.ends_on IS NULL OR other.ends_on>=current_date)
  ) THEN
    RAISE EXCEPTION 'AVATAR_TAKEN_IN_TEAM' USING ERRCODE='23505';
  END IF;

  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION public.cc_player_avatar_unique_team_guard_v1()
FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_cc_player_avatar_unique_team_v1 ON public.player_settings;
CREATE TRIGGER trg_cc_player_avatar_unique_team_v1
BEFORE INSERT OR UPDATE OF avatar_id,player_id ON public.player_settings
FOR EACH ROW EXECUTE FUNCTION public.cc_player_avatar_unique_team_guard_v1();



CREATE OR REPLACE FUNCTION public.cc_player_avatar_team_directory_v1()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE v_player_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT p.id INTO v_player_id FROM public.players p WHERE p.auth_user_id=auth.uid() LIMIT 1;
  IF v_player_id IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_LINKED'; END IF;

  RETURN (
    WITH my_teams AS (
      SELECT DISTINCT tm.team_id
      FROM public.team_memberships tm
      WHERE tm.player_id=v_player_id
        AND tm.active=true
        AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
        AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
    ), visible_players AS (
      SELECT DISTINCT tm.player_id
      FROM public.team_memberships tm
      JOIN my_teams mt ON mt.team_id=tm.team_id
      WHERE tm.active=true
        AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
        AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
    )
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'playerId',vp.player_id::text,
      'avatarId',coalesce(ps.avatar_id,'')
    ) ORDER BY vp.player_id::text),'[]'::jsonb)
    FROM visible_players vp
    LEFT JOIN public.player_settings ps ON ps.player_id=vp.player_id
  );
END
$$;

REVOKE ALL ON FUNCTION public.cc_player_avatar_team_directory_v1()
FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_avatar_team_directory_v1()
TO authenticated,service_role;

COMMIT;

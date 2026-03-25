-- Migration 028: Replace full_name with first_name + last_name on users table
--
-- 1. Update auth trigger to populate first_name / last_name from Supabase metadata
--    (handles both email signup keys and LinkedIn OIDC keys)
-- 2. Backfill existing users from auth.users metadata
-- 3. Drop the redundant full_name column

-- ── 1. Updated trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name  TEXT;
BEGIN
  -- Email signup sends first_name / last_name
  -- LinkedIn OIDC sends given_name / family_name
  v_first_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'given_name'), ''),
    ''
  );
  v_last_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'family_name'), ''),
    ''
  );

  INSERT INTO public.users (supabase_uid, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, v_first_name, v_last_name)
  ON CONFLICT (supabase_uid) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Backfill existing users from auth.users metadata ───────────────────────
-- Uses full_name as a fallback only if the column still exists (it may already
-- have been dropped in a previous partial run or earlier migration).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) THEN
    UPDATE public.users u
    SET
      first_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
        NULLIF(TRIM(au.raw_user_meta_data->>'given_name'), ''),
        NULLIF(TRIM(split_part(u.full_name, ' ', 1)), ''),
        ''
      ),
      last_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
        NULLIF(TRIM(au.raw_user_meta_data->>'family_name'), ''),
        NULLIF(TRIM(substring(u.full_name FROM position(' ' IN u.full_name) + 1)), ''),
        ''
      ),
      updated_at = NOW()
    FROM auth.users au
    WHERE au.id = u.supabase_uid
      AND (u.first_name = '' OR u.last_name = '');
  ELSE
    UPDATE public.users u
    SET
      first_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
        NULLIF(TRIM(au.raw_user_meta_data->>'given_name'), ''),
        ''
      ),
      last_name = COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
        NULLIF(TRIM(au.raw_user_meta_data->>'family_name'), ''),
        ''
      ),
      updated_at = NOW()
    FROM auth.users au
    WHERE au.id = u.supabase_uid
      AND (u.first_name = '' OR u.last_name = '');
  END IF;
END;
$$;

-- ── 3. Drop redundant full_name column ────────────────────────────────────────

ALTER TABLE public.users DROP COLUMN IF EXISTS full_name;

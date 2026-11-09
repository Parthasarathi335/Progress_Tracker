-- ============================================================
-- CONSISTENCY CLUB — Initial Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================
-- MISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.missions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  emoji        TEXT NOT NULL DEFAULT '✅',
  description  TEXT,
  created_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- assigned_to: NULL = both users, UUID = specific user
  assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_created_by   ON public.missions(created_by);
CREATE INDEX IF NOT EXISTS idx_missions_assigned_to  ON public.missions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_missions_mission_date ON public.missions(mission_date);

-- ============================================================
-- MISSION_COMPLETIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mission_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id   UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_completions_mission  ON public.mission_completions(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_completions_user     ON public.mission_completions(user_id);

-- ============================================================
-- DAILY_ACTIVITY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date         DATE NOT NULL,
  login_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  all_missions_completed BOOLEAN NOT NULL DEFAULT FALSE,
  login_streak          INTEGER NOT NULL DEFAULT 0,
  coding_streak         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user        ON public.daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date        ON public.daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date   ON public.daily_activity(user_id, activity_date);

-- ============================================================
-- XP_TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,
  reason        TEXT NOT NULL,
  activity_date DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user        ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_date        ON public.xp_transactions(activity_date);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_date   ON public.xp_transactions(user_id, activity_date);

-- ============================================================
-- USER_BADGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_name  TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- Only authenticated users whose emails match the allowlist can access data.
-- The allowlist is enforced at the application layer AND at DB level via a helper function.
-- ============================================================

-- Helper: returns true when the calling user is one of the two authorised users
-- (We rely on the app-layer allowlist; at DB level we simply require authentication)
-- For stronger DB-level enforcement, add a check table with allowed emails.

CREATE TABLE IF NOT EXISTS public.allowed_emails (
  email TEXT PRIMARY KEY
);

-- NOTE: Insert your two emails here after creating the table, e.g.:
-- INSERT INTO public.allowed_emails VALUES ('user1@example.com'), ('user2@example.com');

CREATE OR REPLACE FUNCTION public.is_allowed_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_emails ae
    WHERE ae.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$;

-- ---- PROFILES ----
CREATE POLICY "allowed_users_read_profiles"
  ON public.profiles FOR SELECT
  USING (public.is_allowed_user());

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() AND public.is_allowed_user())
  WITH CHECK (id = auth.uid() AND public.is_allowed_user());

CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND public.is_allowed_user());

-- ---- MISSIONS ----
CREATE POLICY "allowed_users_read_missions"
  ON public.missions FOR SELECT
  USING (public.is_allowed_user());

CREATE POLICY "allowed_users_insert_missions"
  ON public.missions FOR INSERT
  WITH CHECK (created_by = auth.uid() AND public.is_allowed_user());

CREATE POLICY "users_update_own_missions"
  ON public.missions FOR UPDATE
  USING (created_by = auth.uid() AND public.is_allowed_user())
  WITH CHECK (created_by = auth.uid() AND public.is_allowed_user());

CREATE POLICY "users_delete_own_missions"
  ON public.missions FOR DELETE
  USING (created_by = auth.uid() AND public.is_allowed_user());

-- ---- MISSION_COMPLETIONS ----
CREATE POLICY "allowed_users_read_completions"
  ON public.mission_completions FOR SELECT
  USING (public.is_allowed_user());

CREATE POLICY "users_insert_own_completions"
  ON public.mission_completions FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_allowed_user());

CREATE POLICY "users_delete_own_completions"
  ON public.mission_completions FOR DELETE
  USING (user_id = auth.uid() AND public.is_allowed_user());

-- ---- DAILY_ACTIVITY ----
CREATE POLICY "allowed_users_read_daily_activity"
  ON public.daily_activity FOR SELECT
  USING (public.is_allowed_user());

-- Daily activity is written only by server-side functions (SECURITY DEFINER)
-- No direct insert/update from the client

-- ---- XP_TRANSACTIONS ----
CREATE POLICY "allowed_users_read_xp"
  ON public.xp_transactions FOR SELECT
  USING (public.is_allowed_user());

-- XP is inserted only by server-side secure functions (SECURITY DEFINER)
-- No direct insert from the client

-- ---- USER_BADGES ----
CREATE POLICY "allowed_users_read_badges"
  ON public.user_badges FOR SELECT
  USING (public.is_allowed_user());

-- Badges are inserted only by server-side secure functions (SECURITY DEFINER)

-- ============================================================
-- SECURE SERVER-SIDE FUNCTIONS
-- ============================================================

-- Function: record_login_and_update_streak
-- Called by the server-side API route when a user logs in.
CREATE OR REPLACE FUNCTION public.record_login_and_update_streak(p_user_id UUID, p_today DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_yesterday         DATE := p_today - INTERVAL '1 day';
  v_existing          public.daily_activity%ROWTYPE;
  v_yesterday_row     public.daily_activity%ROWTYPE;
  v_new_login_streak  INTEGER;
BEGIN
  -- Check if today's record already exists
  SELECT * INTO v_existing
  FROM public.daily_activity
  WHERE user_id = p_user_id AND activity_date = p_today;

  IF FOUND THEN
    -- Already logged in today — return current state
    RETURN jsonb_build_object(
      'already_recorded', true,
      'login_streak', v_existing.login_streak
    );
  END IF;

  -- Get yesterday's record for streak calculation
  SELECT * INTO v_yesterday_row
  FROM public.daily_activity
  WHERE user_id = p_user_id AND activity_date = v_yesterday;

  IF FOUND AND v_yesterday_row.login_completed THEN
    v_new_login_streak := v_yesterday_row.login_streak + 1;
  ELSE
    v_new_login_streak := 1;
  END IF;

  -- Insert today's record
  INSERT INTO public.daily_activity (
    user_id, activity_date, login_completed, login_streak, coding_streak, updated_at
  ) VALUES (
    p_user_id, p_today, TRUE, v_new_login_streak,
    COALESCE((SELECT coding_streak FROM public.daily_activity
              WHERE user_id = p_user_id AND activity_date = v_yesterday), 0),
    now()
  )
  ON CONFLICT (user_id, activity_date) DO UPDATE
    SET login_completed = TRUE,
        login_streak    = v_new_login_streak,
        updated_at      = now();

  RETURN jsonb_build_object(
    'already_recorded', false,
    'login_streak', v_new_login_streak
  );
END;
$$;

-- Function: award_daily_xp_if_complete
-- Called server-side when a mission completion changes.
-- Awards 10 XP if all assigned missions for that date are complete.
CREATE OR REPLACE FUNCTION public.award_daily_xp_if_complete(p_user_id UUID, p_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_missions    INTEGER;
  v_completed_missions INTEGER;
  v_already_awarded   BOOLEAN;
  v_all_complete      BOOLEAN;
  v_coding_streak     INTEGER;
  v_yesterday         DATE := p_date - INTERVAL '1 day';
  v_yesterday_row     public.daily_activity%ROWTYPE;
BEGIN
  -- Count missions assigned to this user for this date
  SELECT COUNT(*) INTO v_total_missions
  FROM public.missions m
  WHERE m.mission_date = p_date
    AND (m.assigned_to = p_user_id OR m.assigned_to IS NULL);

  IF v_total_missions = 0 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_missions');
  END IF;

  -- Count completed missions for this user/date
  SELECT COUNT(*) INTO v_completed_missions
  FROM public.mission_completions mc
  JOIN public.missions m ON m.id = mc.mission_id
  WHERE mc.user_id = p_user_id
    AND m.mission_date = p_date
    AND (m.assigned_to = p_user_id OR m.assigned_to IS NULL);

  v_all_complete := (v_completed_missions >= v_total_missions);

  -- Check if XP already awarded today
  SELECT EXISTS (
    SELECT 1 FROM public.xp_transactions
    WHERE user_id = p_user_id
      AND activity_date = p_date
      AND reason = 'daily_missions_complete'
  ) INTO v_already_awarded;

  -- Update daily_activity coding streak
  SELECT * INTO v_yesterday_row
  FROM public.daily_activity
  WHERE user_id = p_user_id AND activity_date = v_yesterday;

  IF v_all_complete THEN
    -- Calculate new coding streak
    IF FOUND AND v_yesterday_row.all_missions_completed THEN
      v_coding_streak := v_yesterday_row.coding_streak + 1;
    ELSE
      v_coding_streak := 1;
    END IF;
  ELSE
    v_coding_streak := 0;
  END IF;

  -- Upsert daily_activity
  INSERT INTO public.daily_activity (
    user_id, activity_date, all_missions_completed, coding_streak, login_completed, login_streak, updated_at
  ) VALUES (
    p_user_id, p_date, v_all_complete, v_coding_streak, FALSE, 0, now()
  )
  ON CONFLICT (user_id, activity_date) DO UPDATE
    SET all_missions_completed = v_all_complete,
        coding_streak          = v_coding_streak,
        updated_at             = now();

  -- Award XP if all missions complete and not already awarded
  IF v_all_complete AND NOT v_already_awarded THEN
    INSERT INTO public.xp_transactions (user_id, amount, reason, activity_date)
    VALUES (p_user_id, 10, 'daily_missions_complete', p_date);

    -- Check and award badges
    PERFORM public.check_and_award_badges(p_user_id);

    RETURN jsonb_build_object('awarded', true, 'xp', 10, 'coding_streak', v_coding_streak);
  END IF;

  -- If missions were un-completed, revoke XP
  IF NOT v_all_complete AND v_already_awarded THEN
    DELETE FROM public.xp_transactions
    WHERE user_id = p_user_id
      AND activity_date = p_date
      AND reason = 'daily_missions_complete';
    RETURN jsonb_build_object('awarded', false, 'reason', 'revoked', 'coding_streak', v_coding_streak);
  END IF;

  RETURN jsonb_build_object('awarded', false, 'reason', 'incomplete_or_already_awarded', 'coding_streak', v_coding_streak);
END;
$$;

-- Function: check_and_award_badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total_xp
  FROM public.xp_transactions
  WHERE user_id = p_user_id;

  -- Bronze at 150 XP
  IF v_total_xp >= 150 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (p_user_id, 'Bronze')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Silver at 350 XP
  IF v_total_xp >= 350 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (p_user_id, 'Silver')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Gold at 500 XP
  IF v_total_xp >= 500 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (p_user_id, 'Gold')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Platinum at 750 XP
  IF v_total_xp >= 750 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (p_user_id, 'Platinum')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Diamond at 1000 XP
  IF v_total_xp >= 1000 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (p_user_id, 'Diamond')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Function: get_user_total_xp
CREATE OR REPLACE FUNCTION public.get_user_total_xp(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::INTEGER
  FROM public.xp_transactions
  WHERE user_id = p_user_id;
$$;

-- Function: recalculate_coding_streak_for_date
-- Called when mission completions change to update the streak chain
CREATE OR REPLACE FUNCTION public.recalculate_coding_streak_for_date(p_user_id UUID, p_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.award_daily_xp_if_complete(p_user_id, p_date);
END;
$$;

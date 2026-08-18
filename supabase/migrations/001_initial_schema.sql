-- ============================================================
-- DYPSN AWS Student Builder Group — Supabase Schema Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- Linked to auth.users via trigger on signup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  admission_year INTEGER,
  academic_year TEXT CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year')),
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, admission_year, academic_year, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    (NEW.raw_user_meta_data->>'admission_year')::INTEGER,
    NEW.raw_user_meta_data->>'academic_year',
    CASE
      WHEN NEW.email = 'captain@dypsn.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  event_date       DATE,
  event_time       TIME,
  location         TEXT,
  registration_url TEXT,
  image_url        TEXT,
  status           TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'happened', 'cancelled')),
  form_fields      JSONB DEFAULT '[]'::JSONB,
  capacity         INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS events_slug_idx ON public.events(slug);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);

-- ============================================================
-- 3. EVENT REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug     TEXT NOT NULL REFERENCES public.events(slug) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email     TEXT NOT NULL,
  user_name      TEXT,
  form_data      JSONB DEFAULT '{}'::JSONB,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_slug, user_id)
);

CREATE INDEX IF NOT EXISTS event_reg_slug_idx ON public.event_registrations(event_slug);
CREATE INDEX IF NOT EXISTS event_reg_user_idx ON public.event_registrations(user_id);

-- ============================================================
-- 4. CERTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  code           TEXT,
  level          TEXT,
  color          TEXT DEFAULT '#A855F7',
  description    TEXT,
  duration       TEXT,
  questions      TEXT,
  passing_score  TEXT,
  topics         JSONB DEFAULT '[]'::JSONB,
  image          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 5. TEAM MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  tagline        TEXT,
  avatar         TEXT,
  color          TEXT DEFAULT '#A855F7',
  bio            TEXT,
  image_url      TEXT,
  github_url     TEXT,
  linkedin_url   TEXT,
  instagram_url  TEXT,
  member_type    TEXT NOT NULL DEFAULT 'core' CHECK (member_type IN ('core', 'contributor')),
  certifications JSONB DEFAULT '[]'::JSONB,
  social         JSONB DEFAULT '{}'::JSONB,
  order_index    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS team_members_type_idx ON public.team_members(member_type);
CREATE INDEX IF NOT EXISTS team_members_order_idx ON public.team_members(order_index);

-- ============================================================
-- 6. QUIZZES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  color            TEXT DEFAULT '#A855F7',
  time_limit_seconds INTEGER DEFAULT 30,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 7. QUIZ QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  -- Legacy columns for compatibility with existing code
  options        JSONB,
  correct_index  INTEGER,
  points         INTEGER DEFAULT 10,
  order_index    INTEGER NOT NULL DEFAULT 0,
  order_num      INTEGER GENERATED ALWAYS AS (order_index) STORED,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON public.quiz_questions(quiz_id);

-- ============================================================
-- 8. QUIZ ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email      TEXT,
  user_name       TEXT NOT NULL DEFAULT 'Anonymous',
  score           INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. QUIZ ANSWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_index  INTEGER NOT NULL DEFAULT -1,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- ============================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- EVENTS RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_public_read" ON public.events
  FOR SELECT USING (TRUE);

CREATE POLICY "events_admin_write" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "events_admin_update" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "events_admin_delete" ON public.events
  FOR DELETE USING (public.is_admin());

-- EVENT REGISTRATIONS RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_user_read_own" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "reg_user_insert" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reg_user_delete_own" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "reg_admin_all" ON public.event_registrations
  FOR ALL USING (public.is_admin());

-- CERTIFICATIONS RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_public_read" ON public.certifications
  FOR SELECT USING (TRUE);

CREATE POLICY "certifications_admin_write" ON public.certifications
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "certifications_admin_update" ON public.certifications
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "certifications_admin_delete" ON public.certifications
  FOR DELETE USING (public.is_admin());

-- TEAM MEMBERS RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_public_read" ON public.team_members
  FOR SELECT USING (TRUE);

CREATE POLICY "team_admin_write" ON public.team_members
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "team_admin_update" ON public.team_members
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "team_admin_delete" ON public.team_members
  FOR DELETE USING (public.is_admin());

-- QUIZZES RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes_public_read" ON public.quizzes
  FOR SELECT USING (TRUE);

CREATE POLICY "quizzes_admin_write" ON public.quizzes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "quizzes_admin_update" ON public.quizzes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "quizzes_admin_delete" ON public.quizzes
  FOR DELETE USING (public.is_admin());

-- QUIZ QUESTIONS RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_public_read" ON public.quiz_questions
  FOR SELECT USING (TRUE);

CREATE POLICY "quiz_questions_admin_write" ON public.quiz_questions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "quiz_questions_admin_update" ON public.quiz_questions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "quiz_questions_admin_delete" ON public.quiz_questions
  FOR DELETE USING (public.is_admin());

-- QUIZ ATTEMPTS RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_public_read" ON public.quiz_attempts
  FOR SELECT USING (TRUE);

CREATE POLICY "quiz_attempts_user_insert" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "quiz_attempts_user_update_own" ON public.quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- QUIZ ANSWERS RLS
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_answers_user_read_own" ON public.quiz_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "quiz_answers_user_insert" ON public.quiz_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
  );

CREATE POLICY "quiz_answers_admin_all" ON public.quiz_answers
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 11. REALTIME — Enable on public tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;

-- ============================================================
-- 12. SEED: Admin profile entry (run AFTER creating the admin
--     user in Supabase Auth Dashboard)
--     Only needed if the trigger didn't fire for existing users.
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'captain@dypsn.com';

-- =============================================================================
-- BUCKLABS AI — Core Schema, Triggers, Indexes & Row-Level Security (RLS)
-- Migration: 20261018000001_initial_schema_and_rls.sql
-- =============================================================================

-- 1. Updated-at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Learner Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  learning_level text NOT NULL DEFAULT 'Beginner'
    CHECK (learning_level IN ('Beginner', 'Intermediate', 'Advanced')),
  primary_goal text,
  preferred_language text NOT NULL DEFAULT 'Python'
    CHECK (preferred_language IN ('Python', 'Java', 'C++', 'JavaScript', 'TypeScript')),
  areas_of_interest text[] NOT NULL DEFAULT '{}',
  target_role text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  difficulty text NOT NULL
    CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration text NOT NULL,
  target_role text NOT NULL,
  prerequisites text[] NOT NULL DEFAULT '{}',
  outcomes text[] NOT NULL DEFAULT '{}',
  course_ids text[] NOT NULL DEFAULT '{}',
  problem_ids text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_learning_paths_updated_at ON public.learning_paths;
CREATE TRIGGER trg_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  long_description text NOT NULL,
  difficulty text NOT NULL
    CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration text NOT NULL,
  lessons_count integer NOT NULL DEFAULT 0,
  instructor text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  prerequisites text[] NOT NULL DEFAULT '{}',
  outcomes text[] NOT NULL DEFAULT '{}',
  curriculum jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_path_id text REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_learning_path ON public.courses(learning_path_id);

-- 5. Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled'
    CHECK (status IN ('enrolled', 'in_progress', 'completed')),
  progress integer NOT NULL DEFAULT 0
    CHECK (progress >= 0 AND progress <= 100),
  completed_modules text[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

DROP TRIGGER IF EXISTS trg_course_enrollments_updated_at ON public.course_enrollments;
CREATE TRIGGER trg_course_enrollments_updated_at
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);

-- 6. Practice Problems
CREATE TABLE IF NOT EXISTS public.practice_problems (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  source text NOT NULL
    CHECK (source IN ('LeetCode', 'Codeforces', 'HackerRank', 'BUCKLABS Original')),
  canonical_url text NOT NULL,
  difficulty text NOT NULL
    CHECK (difficulty IN ('Beginner', 'Easy', 'Medium', 'Hard')),
  external_difficulty text NOT NULL,
  topics text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  content_type text NOT NULL DEFAULT 'external_link'
    CHECK (content_type IN ('external_link', 'original_content', 'licensed_import')),
  learning_objective text NOT NULL,
  summary text NOT NULL,
  hints text[] NOT NULL DEFAULT '{}',
  approach_outline text NOT NULL,
  complexity_time text NOT NULL,
  complexity_space text NOT NULL,
  attribution text NOT NULL,
  metadata_provenance text NOT NULL,
  related_course_id text REFERENCES public.courses(id) ON DELETE SET NULL,
  curated_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_practice_problems_updated_at ON public.practice_problems;
CREATE TRIGGER trg_practice_problems_updated_at
  BEFORE UPDATE ON public.practice_problems
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_practice_problems_difficulty ON public.practice_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_practice_problems_source ON public.practice_problems(source);
CREATE INDEX IF NOT EXISTS idx_practice_problems_topics ON public.practice_problems USING GIN (topics);

-- 7. Problem Bookmarks
CREATE TABLE IF NOT EXISTS public.problem_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL REFERENCES public.practice_problems(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_bookmarks_user ON public.problem_bookmarks(user_id);

-- 8. Practice Attempts
CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL REFERENCES public.practice_problems(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'solved', 'needs_revision')),
  verification_type text NOT NULL DEFAULT 'user_reported'
    CHECK (verification_type IN ('user_reported', 'verified_integration')),
  preferred_language text,
  notes text NOT NULL DEFAULT '',
  first_attempted_at timestamptz NOT NULL DEFAULT now(),
  last_attempted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, problem_id)
);

DROP TRIGGER IF EXISTS trg_practice_attempts_updated_at ON public.practice_attempts;
CREATE TRIGGER trg_practice_attempts_updated_at
  BEFORE UPDATE ON public.practice_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user ON public.practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_status ON public.practice_attempts(user_id, status);

-- 9. Learning Activity Log
CREATE TABLE IF NOT EXISTS public.learning_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL
    CHECK (activity_type IN (
      'course_enrolled',
      'module_completed',
      'course_completed',
      'problem_status_updated',
      'problem_bookmarked',
      'onboarding_completed',
      'ai_tutor_used',
      'career_assessment_completed'
    )),
  resource_type text NOT NULL
    CHECK (resource_type IN ('course', 'learning_path', 'problem', 'profile', 'ai_tutor', 'career')),
  resource_id text NOT NULL,
  resource_title text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_learning_activity_user_time
  ON public.learning_activity(user_id, occurred_at DESC);

-- 10. Contact Submissions & Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 255),
  topic text NOT NULL DEFAULT 'General Inquiry',
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'reviewed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (char_length(trim(email)) BETWEEN 3 AND 255),
  status text NOT NULL DEFAULT 'subscribed'
    CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/write their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Public Catalogs: Anyone can read published learning_paths, courses, and practice_problems
DROP POLICY IF EXISTS "learning_paths_select_published" ON public.learning_paths;
CREATE POLICY "learning_paths_select_published" ON public.learning_paths
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "practice_problems_select_published" ON public.practice_problems;
CREATE POLICY "practice_problems_select_published" ON public.practice_problems
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- Course Enrollments: Users can only read/write their own enrollments
DROP POLICY IF EXISTS "course_enrollments_select_own" ON public.course_enrollments;
CREATE POLICY "course_enrollments_select_own" ON public.course_enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "course_enrollments_insert_own" ON public.course_enrollments;
CREATE POLICY "course_enrollments_insert_own" ON public.course_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "course_enrollments_update_own" ON public.course_enrollments;
CREATE POLICY "course_enrollments_update_own" ON public.course_enrollments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "course_enrollments_delete_own" ON public.course_enrollments;
CREATE POLICY "course_enrollments_delete_own" ON public.course_enrollments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Problem Bookmarks: Users can only read/write their own bookmarks
DROP POLICY IF EXISTS "problem_bookmarks_select_own" ON public.problem_bookmarks;
CREATE POLICY "problem_bookmarks_select_own" ON public.problem_bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "problem_bookmarks_insert_own" ON public.problem_bookmarks;
CREATE POLICY "problem_bookmarks_insert_own" ON public.problem_bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "problem_bookmarks_delete_own" ON public.problem_bookmarks;
CREATE POLICY "problem_bookmarks_delete_own" ON public.problem_bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Practice Attempts: Users can only read/write their own attempts
DROP POLICY IF EXISTS "practice_attempts_select_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_select_own" ON public.practice_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "practice_attempts_insert_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_insert_own" ON public.practice_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "practice_attempts_update_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_update_own" ON public.practice_attempts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "practice_attempts_delete_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_delete_own" ON public.practice_attempts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Learning Activity: Users can only read/insert/delete their own activity records
DROP POLICY IF EXISTS "learning_activity_select_own" ON public.learning_activity;
CREATE POLICY "learning_activity_select_own" ON public.learning_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "learning_activity_insert_own" ON public.learning_activity;
CREATE POLICY "learning_activity_insert_own" ON public.learning_activity
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "learning_activity_delete_own" ON public.learning_activity;
CREATE POLICY "learning_activity_delete_own" ON public.learning_activity
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Contact Submissions: Anyone can submit valid contact messages; authenticated users can view their own
DROP POLICY IF EXISTS "contact_submissions_insert_public" ON public.contact_submissions;
CREATE POLICY "contact_submissions_insert_public" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "contact_submissions_select_own" ON public.contact_submissions;
CREATE POLICY "contact_submissions_select_own" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Newsletter Subscriptions: Anyone can subscribe
DROP POLICY IF EXISTS "newsletter_subscriptions_insert_public" ON public.newsletter_subscriptions;
CREATE POLICY "newsletter_subscriptions_insert_public" ON public.newsletter_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'subscribed');

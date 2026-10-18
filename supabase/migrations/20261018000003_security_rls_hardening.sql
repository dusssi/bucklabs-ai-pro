-- =============================================================================
-- BUCKLABS AI — Security & Row-Level Security (RLS) Hardening
-- Migration: 20261018000003_security_rls_hardening.sql
-- =============================================================================

-- 1. Enforce FORCE ROW LEVEL SECURITY across all 10 tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths FORCE ROW LEVEL SECURITY;
ALTER TABLE public.courses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.practice_problems FORCE ROW LEVEL SECURITY;
ALTER TABLE public.problem_bookmarks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions FORCE ROW LEVEL SECURITY;

-- 2. Immutable ownership & primary-key guard for profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_identity_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Cannot reassign profile id' USING ERRCODE = '42501';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    NEW.created_at = OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_immutable_identity ON public.profiles;
CREATE TRIGGER trg_profiles_immutable_identity
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_identity_mutation();

-- 3. Immutable ownership & primary-key guard for user-owned activity tables
CREATE OR REPLACE FUNCTION public.prevent_user_ownership_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Cannot modify record primary key' USING ERRCODE = '42501';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot reassign record ownership (user_id)' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_enrollments_immutable_owner ON public.course_enrollments;
CREATE TRIGGER trg_course_enrollments_immutable_owner
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_ownership_mutation();

DROP TRIGGER IF EXISTS trg_problem_bookmarks_immutable_owner ON public.problem_bookmarks;
CREATE TRIGGER trg_problem_bookmarks_immutable_owner
  BEFORE UPDATE ON public.problem_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_ownership_mutation();

DROP TRIGGER IF EXISTS trg_practice_attempts_immutable_owner ON public.practice_attempts;
CREATE TRIGGER trg_practice_attempts_immutable_owner
  BEFORE UPDATE ON public.practice_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_ownership_mutation();

DROP TRIGGER IF EXISTS trg_learning_activity_immutable_owner ON public.learning_activity;
CREATE TRIGGER trg_learning_activity_immutable_owner
  BEFORE UPDATE ON public.learning_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_ownership_mutation();

-- 4. Tighten practice_attempts policies to prevent client spoofing of verification_type
DROP POLICY IF EXISTS "practice_attempts_insert_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_insert_own" ON public.practice_attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND verification_type = 'user_reported'
  );

DROP POLICY IF EXISTS "practice_attempts_update_own" ON public.practice_attempts;
CREATE POLICY "practice_attempts_update_own" ON public.practice_attempts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND verification_type = 'user_reported'
  );

-- 5. Tighten contact_submissions insert policy to enforce initial status = 'received'
DROP POLICY IF EXISTS "contact_submissions_insert_public" ON public.contact_submissions;
CREATE POLICY "contact_submissions_insert_public" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND status = 'received'
  );

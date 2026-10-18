import { supabase } from "@/integrations/supabase/client";
import { calculateCourseProgress, courses, getCourseById, type Course } from "@/data/courses";
import {
  calculateLearningPathProgress,
  learningPaths,
  type LearningPath,
} from "@/data/learning-paths";
import {
  calculateTopicProgress,
  getProblemById,
  practiceProblems,
  type PracticeProblem,
  type PracticeStatus,
  type TopicProgressStat,
} from "@/data/practice-problems";
import { onboardingProfileSchema, practiceAttemptSchema } from "@/lib/validation";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  authMode: "supabase" | "local_fallback";
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  learningLevel: "Beginner" | "Intermediate" | "Advanced";
  primaryGoal: string;
  preferredLanguage: "Python" | "Java" | "C++" | "JavaScript" | "TypeScript";
  areasOfInterest: string[];
  targetRole: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  status: "enrolled" | "in_progress" | "completed";
  progress: number;
  completedModules: string[];
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface ProblemBookmarkRecord {
  id: string;
  userId: string;
  problemId: string;
  createdAt: string;
}

export interface PracticeAttemptRecord {
  id: string;
  userId: string;
  problemId: string;
  status: PracticeStatus;
  verificationType: "user_reported" | "verified_integration";
  preferredLanguage: string | null;
  notes: string;
  firstAttemptedAt: string;
  lastAttemptedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface LearningActivityRecord {
  id: string;
  userId: string;
  activityType:
    | "course_enrolled"
    | "module_completed"
    | "course_completed"
    | "problem_status_updated"
    | "problem_bookmarked"
    | "onboarding_completed"
    | "ai_tutor_used"
    | "career_assessment_completed";
  resourceType: "course" | "learning_path" | "problem" | "profile" | "ai_tutor" | "career";
  resourceId: string;
  resourceTitle: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
}

interface LocalAccountRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
}

interface LocalDatabaseState {
  accounts: Record<string, LocalAccountRecord>;
  currentSessionUserId: string | null;
  profiles: Record<string, LearnerProfile>;
  enrollments: Record<string, CourseEnrollmentRecord[]>;
  bookmarks: Record<string, ProblemBookmarkRecord[]>;
  attempts: Record<string, PracticeAttemptRecord[]>;
  activities: Record<string, LearningActivityRecord[]>;
}

const STORAGE_KEY = "bucklabs_platform_state_v1";
const authListeners = new Set<(user: AuthUser | null) => void>();

let forceProductionModeForTesting = false;

/**
 * Allows automated tests to simulate strict production mode where local fallback is forbidden.
 */
export function setForceProductionModeForTesting(force: boolean): void {
  forceProductionModeForTesting = force;
}

/**
 * Strictly determines whether local/test fallback persistence is allowed.
 * - In Production (`NODE_ENV === "production"` or `forceProductionModeForTesting`), ALWAYS returns `false`.
 * - Only returns `true` in automated test suites (`VITEST`) or when `VITE_ENABLE_LOCAL_FALLBACK === "true"` in non-production dev/sandbox environments.
 */
export function isLocalFallbackAllowed(): boolean {
  if (forceProductionModeForTesting) {
    return false;
  }
  const nodeEnv = typeof process !== "undefined" && process.env ? process.env.NODE_ENV : undefined;
  if (nodeEnv === "production") {
    return false;
  }
  const isVitest =
    typeof process !== "undefined" &&
    Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test");
  if (isVitest) {
    return true;
  }
  const viteFlag =
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_ENABLE_LOCAL_FALLBACK === "true") ||
    (typeof process !== "undefined" && process.env?.VITE_ENABLE_LOCAL_FALLBACK === "true");
  return Boolean(viteFlag);
}

function createEmptyState(): LocalDatabaseState {
  return {
    accounts: {},
    currentSessionUserId: null,
    profiles: {},
    enrollments: {},
    bookmarks: {},
    attempts: {},
    activities: {},
  };
}

// Isolated test-only state used exclusively when VITEST is running in Node/jsdom
let testHarnessState: LocalDatabaseState = createEmptyState();

function loadLocalState(): LocalDatabaseState {
  if (!isLocalFallbackAllowed()) {
    return createEmptyState();
  }
  // Never share a mutable server singleton across SSR requests outside Vitest
  if (typeof window === "undefined") {
    const isVitest =
      typeof process !== "undefined" &&
      Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test");
    return isVitest ? testHarnessState : createEmptyState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return testHarnessState;
    const parsed = JSON.parse(raw) as Partial<LocalDatabaseState>;
    testHarnessState = {
      accounts: parsed.accounts ?? {},
      currentSessionUserId: parsed.currentSessionUserId ?? null,
      profiles: parsed.profiles ?? {},
      enrollments: parsed.enrollments ?? {},
      bookmarks: parsed.bookmarks ?? {},
      attempts: parsed.attempts ?? {},
      activities: parsed.activities ?? {},
    };
    return testHarnessState;
  } catch {
    return testHarnessState;
  }
}

function saveLocalState(state: LocalDatabaseState): void {
  if (!isLocalFallbackAllowed()) {
    return;
  }
  const isVitest =
    typeof process !== "undefined" &&
    Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test");
  if (isVitest) {
    testHarnessState = state;
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }
}

export function resetLocalStateForTesting(): void {
  testHarnessState = createEmptyState();
  supabaseOfflineUntil = 0;
  forceProductionModeForTesting = false;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function simpleHashPassword(password: string): string {
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}_${password.length}`;
}

let supabaseOfflineUntil = 0;

function isNetworkFailure(err: unknown): boolean {
  if (!err) return false;
  const msg =
    typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : String(err);
  const failed =
    msg.includes("Failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("NetworkError") ||
    msg.includes("Load failed") ||
    msg.includes("SUPABASE_TIMEOUT") ||
    msg.includes("SUPABASE_OFFLINE") ||
    msg.includes("ERR_NAME_NOT_RESOLVED");
  if (failed && isLocalFallbackAllowed()) {
    supabaseOfflineUntil = Date.now() + 60_000;
  }
  return failed;
}

function shouldAttemptRemoteSupabase(): boolean {
  if (!isLocalFallbackAllowed()) {
    // In production mode, ALWAYS attempt remote Supabase!
    return true;
  }
  if (typeof process !== "undefined" && process.env?.VITEST) {
    return false;
  }
  return Date.now() >= supabaseOfflineUntil;
}

async function withFastTimeout<T>(promise: PromiseLike<T>, ms = 2500): Promise<T> {
  if (!shouldAttemptRemoteSupabase()) {
    throw new Error("SUPABASE_OFFLINE");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (isLocalFallbackAllowed()) {
        supabaseOfflineUntil = Date.now() + 60_000;
      }
      reject(new Error("SUPABASE_TIMEOUT"));
    }, ms);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } catch (err) {
    isNetworkFailure(err);
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function getLocalSessionUser(): AuthUser | null {
  if (!isLocalFallbackAllowed()) {
    return null;
  }
  const state = loadLocalState();
  if (!state.currentSessionUserId) return null;
  const acct = Object.values(state.accounts).find((a) => a.id === state.currentSessionUserId);
  if (!acct) return null;
  return {
    id: acct.id,
    email: acct.email,
    fullName: acct.fullName,
    authMode: "local_fallback",
  };
}

function notifyAuthListeners(user: AuthUser | null): void {
  for (const listener of authListeners) {
    try {
      listener(user);
    } catch {
      // Ignore listener errors
    }
  }
}

function ensureDefaultProfile(
  state: LocalDatabaseState,
  userId: string,
  displayName: string,
): LearnerProfile {
  const existing = state.profiles[userId];
  if (existing) return existing;
  const now = new Date().toISOString();
  const created: LearnerProfile = {
    id: userId,
    displayName: displayName || "Learner",
    learningLevel: "Beginner",
    primaryGoal: "Master data structures and algorithms",
    preferredLanguage: "Python",
    areasOfInterest: ["Data Structures and Algorithms", "Full Stack"],
    targetRole: "Software Development Engineer (SDE-1 / Intern)",
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
  if (isLocalFallbackAllowed()) {
    state.profiles[userId] = created;
    saveLocalState(state);
  }
  return created;
}

/**
 * Row-Level Security guard:
 * Ensures the caller is authenticated as `targetUserId`.
 */
export async function assertAuthorizedUser(targetUserId: string): Promise<AuthUser> {
  const current = await getCurrentAuthUser();
  if (!current) {
    throw new Error("Unauthorized: You must be signed in to perform this action.");
  }
  if (current.id !== targetUserId) {
    throw new Error(
      "Forbidden: Row-level security policy prevents accessing another user's records.",
    );
  }
  return current;
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const localUser = getLocalSessionUser();
  try {
    const { data, error } = await withFastTimeout(supabase.auth.getSession(), 2000);
    if (error) {
      if (!isLocalFallbackAllowed()) {
        throw new Error(`Authentication check failed: ${error.message}`);
      }
    } else if (data?.session?.user) {
      const u = data.session.user;
      const fullName =
        (typeof u.user_metadata?.full_name === "string" && u.user_metadata.full_name) ||
        (u.email ? u.email.split("@")[0] : "Learner");
      return {
        id: u.id,
        email: u.email ?? "",
        fullName,
        authMode: "supabase",
      };
    }
  } catch (err) {
    if (!isLocalFallbackAllowed()) {
      return null;
    }
  }
  return localUser;
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  authListeners.add(callback);
  let sub: { unsubscribe: () => void } | null = null;
  try {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        callback({
          id: u.id,
          email: u.email ?? "",
          fullName:
            (typeof u.user_metadata?.full_name === "string" && u.user_metadata.full_name) ||
            (u.email ? u.email.split("@")[0] : "Learner"),
          authMode: "supabase",
        });
      } else {
        callback(getLocalSessionUser());
      }
    });
    sub = data.subscription;
  } catch {
    // Ignore when offline in test/sandbox mode
  }

  return () => {
    authListeners.delete(callback);
    sub?.unsubscribe();
  };
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser; requiresEmailConfirmation: boolean }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedName = input.fullName.trim();

  try {
    const { data, error } = await withFastTimeout(
      supabase.auth.signUp({
        email: normalizedEmail,
        password: input.password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
          data: { full_name: trimmedName },
        },
      }),
      2500,
    );

    if (error) {
      if (!isLocalFallbackAllowed() || !isNetworkFailure(error)) {
        throw new Error(error.message);
      }
      throw error;
    }

    if (data.user) {
      const state = loadLocalState();
      ensureDefaultProfile(state, data.user.id, trimmedName);
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? normalizedEmail,
        fullName: trimmedName,
        authMode: "supabase",
      };
      if (data.session) {
        notifyAuthListeners(authUser);
        return { user: authUser, requiresEmailConfirmation: false };
      }
      return { user: authUser, requiresEmailConfirmation: true };
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to reach the authentication service. Your account could not be created—please retry.",
      );
    }
  }

  // Explicitly enabled development/test fallback ONLY
  const state = loadLocalState();
  if (state.accounts[normalizedEmail]) {
    throw new Error("An account with this email address already exists. Please sign in.");
  }

  const userId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `user_${Date.now()}`;
  const now = new Date().toISOString();
  state.accounts[normalizedEmail] = {
    id: userId,
    email: normalizedEmail,
    fullName: trimmedName,
    passwordHash: simpleHashPassword(input.password),
    createdAt: now,
  };
  state.currentSessionUserId = userId;
  ensureDefaultProfile(state, userId, trimmedName);
  saveLocalState(state);

  const authUser: AuthUser = {
    id: userId,
    email: normalizedEmail,
    fullName: trimmedName,
    authMode: "local_fallback",
  };
  notifyAuthListeners(authUser);
  return { user: authUser, requiresEmailConfirmation: false };
}

export async function signInUser(input: { email: string; password: string }): Promise<AuthUser> {
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    const { data, error } = await withFastTimeout(
      supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: input.password,
      }),
      2500,
    );

    if (error) {
      if (!isLocalFallbackAllowed()) {
        throw new Error(error.message);
      }
      if (!isNetworkFailure(error)) {
        const state = loadLocalState();
        const localAcct = state.accounts[normalizedEmail];
        if (!localAcct) {
          throw new Error(error.message);
        }
      } else {
        throw error;
      }
    } else if (data.user) {
      const fullName =
        (typeof data.user.user_metadata?.full_name === "string" &&
          data.user.user_metadata.full_name) ||
        normalizedEmail.split("@")[0];
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? normalizedEmail,
        fullName,
        authMode: "supabase",
      };
      notifyAuthListeners(authUser);
      return authUser;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed()) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Authentication service is unreachable. Please verify your connection and retry.",
      );
    }
    if (!isNetworkFailure(err)) {
      const state = loadLocalState();
      if (!state.accounts[normalizedEmail]) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  const state = loadLocalState();
  const account = state.accounts[normalizedEmail];
  if (!account || account.passwordHash !== simpleHashPassword(input.password)) {
    throw new Error("Invalid email or password. Please check your credentials.");
  }

  state.currentSessionUserId = account.id;
  ensureDefaultProfile(state, account.id, account.fullName);
  saveLocalState(state);

  const authUser: AuthUser = {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    authMode: "local_fallback",
  };
  notifyAuthListeners(authUser);
  return authUser;
}

export async function signOutUser(): Promise<void> {
  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    state.currentSessionUserId = null;
    saveLocalState(state);
  }
  try {
    await withFastTimeout(supabase.auth.signOut(), 1500);
  } catch {
    // Ignore network timeout on signOut
  }
  notifyAuthListeners(null);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { error } = await withFastTimeout(
      supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
      }),
      2500,
    );
    if (error) {
      if (!isLocalFallbackAllowed() || !isNetworkFailure(error)) {
        throw new Error(error.message);
      }
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Password recovery service is currently unreachable. Please retry.",
      );
    }
  }
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const current = await getCurrentAuthUser();
  if (isLocalFallbackAllowed() && current?.authMode === "local_fallback") {
    const state = loadLocalState();
    const acct = state.accounts[current.email.toLowerCase()];
    if (acct) {
      acct.passwordHash = simpleHashPassword(newPassword);
      saveLocalState(state);
      return;
    }
  }
  try {
    const { error } = await withFastTimeout(
      supabase.auth.updateUser({ password: newPassword }),
      2500,
    );
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to update your password because the authentication service is unreachable.",
      );
    }
  }
}

export async function getLearnerProfile(userId: string): Promise<LearnerProfile> {
  const currentUser = await assertAuthorizedUser(userId);
  const state = loadLocalState();

  try {
    const { data, error } = await withFastTimeout(
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      2000,
    );
    if (error) {
      if (!isLocalFallbackAllowed()) {
        throw new Error(`Failed to load learner profile: ${error.message}`);
      }
    } else if (data) {
      const mapped: LearnerProfile = {
        id: data.id,
        displayName: data.display_name || currentUser.fullName,
        learningLevel: data.learning_level,
        primaryGoal: data.primary_goal || "Master data structures and algorithms",
        preferredLanguage: data.preferred_language,
        areasOfInterest: data.areas_of_interest ?? [],
        targetRole: data.target_role,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      if (isLocalFallbackAllowed()) {
        state.profiles[userId] = mapped;
        saveLocalState(state);
      }
      return mapped;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed()) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to load your learner profile from Supabase. Please check your connection and retry.",
      );
    }
  }

  return ensureDefaultProfile(state, userId, currentUser.fullName);
}

export async function updateLearnerProfile(
  userId: string,
  rawInput: unknown,
): Promise<LearnerProfile> {
  await assertAuthorizedUser(userId);
  const parsed = onboardingProfileSchema.parse(rawInput);
  const state = loadLocalState();
  const existing = ensureDefaultProfile(state, userId, parsed.displayName);
  const now = new Date().toISOString();

  const updated: LearnerProfile = {
    ...existing,
    displayName: parsed.displayName,
    learningLevel: parsed.learningLevel,
    primaryGoal: parsed.primaryGoal,
    preferredLanguage: parsed.preferredLanguage,
    areasOfInterest: parsed.areasOfInterest,
    targetRole: parsed.targetRole ?? existing.targetRole,
    onboardingCompleted: parsed.onboardingCompleted,
    updatedAt: now,
  };

  try {
    const { error } = await withFastTimeout(
      supabase.from("profiles").upsert({
        id: userId,
        display_name: updated.displayName,
        learning_level: updated.learningLevel,
        primary_goal: updated.primaryGoal,
        preferred_language: updated.preferredLanguage,
        areas_of_interest: updated.areasOfInterest,
        target_role: updated.targetRole,
        onboarding_completed: updated.onboardingCompleted,
      }),
      2000,
    );
    if (error) {
      throw new Error(`Database error while saving profile: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Failed to save your learner profile to the database. Your changes were not saved—please retry.",
      );
    }
  }

  if (isLocalFallbackAllowed()) {
    state.profiles[userId] = updated;
    saveLocalState(state);
  }

  await recordLearningActivity(userId, {
    activityType: "onboarding_completed",
    resourceType: "profile",
    resourceId: userId,
    resourceTitle: `Updated learner profile (${updated.learningLevel} · ${updated.preferredLanguage})`,
    metadata: { primaryGoal: updated.primaryGoal },
  });

  return updated;
}

export async function getUserEnrollments(userId: string): Promise<CourseEnrollmentRecord[]> {
  await assertAuthorizedUser(userId);
  const state = loadLocalState();

  try {
    const { data, error } = await withFastTimeout(
      supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      2000,
    );
    if (error) {
      throw new Error(`Failed to fetch enrollments: ${error.message}`);
    }
    if (data) {
      const mapped: CourseEnrollmentRecord[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        status: row.status,
        progress: row.progress,
        completedModules: row.completed_modules ?? [],
        startedAt: row.started_at,
        completedAt: row.completed_at,
        updatedAt: row.updated_at,
      }));
      if (isLocalFallbackAllowed()) {
        state.enrollments[userId] = mapped;
        saveLocalState(state);
      }
      return mapped;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to load course enrollments from the database. Please retry.",
      );
    }
  }

  return state.enrollments[userId] ?? [];
}

export async function enrollInCourse(
  userId: string,
  courseId: string,
): Promise<CourseEnrollmentRecord> {
  await assertAuthorizedUser(userId);
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course "${courseId}" does not exist.`);
  }

  const state = loadLocalState();
  const list = state.enrollments[userId] ?? [];
  const existing = list.find((e) => e.courseId === course.id);
  if (existing && isLocalFallbackAllowed()) {
    return existing;
  }

  const now = new Date().toISOString();
  const record: CourseEnrollmentRecord = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `enr_${Date.now()}`,
    userId,
    courseId: course.id,
    status: "enrolled",
    progress: 0,
    completedModules: [],
    startedAt: now,
    completedAt: null,
    updatedAt: now,
  };

  try {
    const { error } = await withFastTimeout(
      supabase.from("course_enrollments").upsert(
        {
          id: record.id,
          user_id: userId,
          course_id: course.id,
          status: record.status,
          progress: record.progress,
          completed_modules: record.completedModules,
          started_at: record.startedAt,
        },
        { onConflict: "user_id,course_id" },
      ),
      2000,
    );
    if (error) {
      throw new Error(`Failed to persist course enrollment: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Could not save your course enrollment to the database. Please check your connection and retry.",
      );
    }
  }

  if (isLocalFallbackAllowed()) {
    state.enrollments[userId] = [record, ...list];
    saveLocalState(state);
  }

  await recordLearningActivity(userId, {
    activityType: "course_enrolled",
    resourceType: "course",
    resourceId: course.id,
    resourceTitle: course.title,
    metadata: { category: course.category, level: course.level },
  });

  return record;
}

export async function toggleCourseModuleCompletion(
  userId: string,
  courseId: string,
  moduleId: string,
): Promise<CourseEnrollmentRecord> {
  await assertAuthorizedUser(userId);
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course "${courseId}" does not exist.`);
  }
  const validModule = course.curriculum.some((m) => m.id === moduleId);
  if (!validModule) {
    throw new Error(`Module "${moduleId}" does not belong to course "${course.title}".`);
  }

  const enrollments = await getUserEnrollments(userId);
  let current = enrollments.find((e) => e.courseId === course.id);
  if (!current) {
    current = await enrollInCourse(userId, course.id);
  }

  const completedSet = new Set(current.completedModules);
  let wasAdded = false;
  if (completedSet.has(moduleId)) {
    completedSet.delete(moduleId);
  } else {
    completedSet.add(moduleId);
    wasAdded = true;
  }

  const completedModules = Array.from(completedSet);
  const progress = calculateCourseProgress(completedModules, course.curriculum.length);
  const status: CourseEnrollmentRecord["status"] =
    progress === 100 ? "completed" : progress > 0 ? "in_progress" : "enrolled";
  const now = new Date().toISOString();

  const updated: CourseEnrollmentRecord = {
    ...current,
    completedModules,
    progress,
    status,
    completedAt: progress === 100 ? now : null,
    updatedAt: now,
  };

  try {
    const { error } = await withFastTimeout(
      supabase
        .from("course_enrollments")
        .update({
          completed_modules: updated.completedModules,
          progress: updated.progress,
          status: updated.status,
          completed_at: updated.completedAt,
        })
        .eq("user_id", userId)
        .eq("course_id", course.id),
      2000,
    );
    if (error) {
      throw new Error(`Failed to persist module completion: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Could not save module completion to the database. Please retry.",
      );
    }
  }

  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    const list = state.enrollments[userId] ?? [];
    const idx = list.findIndex((e) => e.courseId === course.id);
    if (idx >= 0) {
      list[idx] = updated;
      state.enrollments[userId] = [...list];
    } else {
      state.enrollments[userId] = [updated, ...list];
    }
    saveLocalState(state);
  }

  if (wasAdded) {
    const mod = course.curriculum.find((m) => m.id === moduleId);
    await recordLearningActivity(userId, {
      activityType: progress === 100 ? "course_completed" : "module_completed",
      resourceType: "course",
      resourceId: course.id,
      resourceTitle:
        progress === 100
          ? `Completed course: ${course.title}`
          : `Completed module "${mod?.title ?? moduleId}" in ${course.title}`,
      metadata: { moduleId, progress },
    });
  }

  return updated;
}

export async function getUserBookmarks(userId: string): Promise<ProblemBookmarkRecord[]> {
  await assertAuthorizedUser(userId);
  const state = loadLocalState();

  try {
    const { data, error } = await withFastTimeout(
      supabase
        .from("problem_bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      2000,
    );
    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }
    if (data) {
      const mapped: ProblemBookmarkRecord[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        problemId: row.problem_id,
        createdAt: row.created_at,
      }));
      if (isLocalFallbackAllowed()) {
        state.bookmarks[userId] = mapped;
        saveLocalState(state);
      }
      return mapped;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to load problem bookmarks from the database.",
      );
    }
  }

  return state.bookmarks[userId] ?? [];
}

export async function toggleProblemBookmark(
  userId: string,
  problemId: string,
): Promise<{ bookmarked: boolean; bookmarks: ProblemBookmarkRecord[] }> {
  await assertAuthorizedUser(userId);
  const problem = getProblemById(problemId);
  if (!problem) {
    throw new Error(`Problem "${problemId}" does not exist.`);
  }

  const currentBookmarks = await getUserBookmarks(userId);
  const existingIdx = currentBookmarks.findIndex((b) => b.problemId === problem.id);

  if (existingIdx >= 0) {
    const next = currentBookmarks.filter((b) => b.problemId !== problem.id);
    try {
      const { error } = await withFastTimeout(
        supabase
          .from("problem_bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("problem_id", problem.id),
        2000,
      );
      if (error) {
        throw new Error(`Failed to remove bookmark: ${error.message}`);
      }
    } catch (err) {
      if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
        throw new Error(
          err instanceof Error && !err.message.includes("SUPABASE_")
            ? err.message
            : "Could not remove bookmark because the database is unreachable.",
        );
      }
    }
    if (isLocalFallbackAllowed()) {
      const state = loadLocalState();
      state.bookmarks[userId] = next;
      saveLocalState(state);
    }
    return { bookmarked: false, bookmarks: next };
  }

  const record: ProblemBookmarkRecord = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `bm_${Date.now()}`,
    userId,
    problemId: problem.id,
    createdAt: new Date().toISOString(),
  };

  try {
    const { error } = await withFastTimeout(
      supabase.from("problem_bookmarks").upsert(
        {
          id: record.id,
          user_id: userId,
          problem_id: problem.id,
        },
        { onConflict: "user_id,problem_id" },
      ),
      2000,
    );
    if (error) {
      throw new Error(`Failed to save bookmark: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Could not save bookmark to the database. Please retry.",
      );
    }
  }

  const next = [record, ...currentBookmarks];
  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    state.bookmarks[userId] = next;
    saveLocalState(state);
  }

  await recordLearningActivity(userId, {
    activityType: "problem_bookmarked",
    resourceType: "problem",
    resourceId: problem.id,
    resourceTitle: `Bookmarked "${problem.title}" (${problem.source})`,
    metadata: { source: problem.source, difficulty: problem.difficulty },
  });

  return { bookmarked: true, bookmarks: next };
}

export async function getUserPracticeAttempts(userId: string): Promise<PracticeAttemptRecord[]> {
  await assertAuthorizedUser(userId);
  const state = loadLocalState();

  try {
    const { data, error } = await withFastTimeout(
      supabase
        .from("practice_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("last_attempted_at", { ascending: false }),
      2000,
    );
    if (error) {
      throw new Error(`Failed to fetch practice attempts: ${error.message}`);
    }
    if (data) {
      const mapped: PracticeAttemptRecord[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        problemId: row.problem_id,
        status: row.status,
        verificationType: row.verification_type,
        preferredLanguage: row.preferred_language,
        notes: row.notes,
        firstAttemptedAt: row.first_attempted_at,
        lastAttemptedAt: row.last_attempted_at,
        completedAt: row.completed_at,
        updatedAt: row.updated_at,
      }));
      if (isLocalFallbackAllowed()) {
        state.attempts[userId] = mapped;
        saveLocalState(state);
      }
      return mapped;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to load practice history from the database.",
      );
    }
  }

  return state.attempts[userId] ?? [];
}

export async function upsertPracticeAttempt(
  userId: string,
  rawInput: unknown,
): Promise<PracticeAttemptRecord> {
  await assertAuthorizedUser(userId);
  const parsed = practiceAttemptSchema.parse(rawInput);
  const problem = getProblemById(parsed.problemId);
  if (!problem) {
    throw new Error(`Problem "${parsed.problemId}" does not exist.`);
  }

  const currentAttempts = await getUserPracticeAttempts(userId);
  const existingIdx = currentAttempts.findIndex((a) => a.problemId === problem.id);
  const now = new Date().toISOString();

  const record: PracticeAttemptRecord =
    existingIdx >= 0
      ? {
          ...currentAttempts[existingIdx],
          status: parsed.status,
          verificationType: "user_reported",
          preferredLanguage:
            parsed.preferredLanguage ?? currentAttempts[existingIdx].preferredLanguage,
          notes: parsed.notes,
          lastAttemptedAt: now,
          completedAt: parsed.status === "solved" ? now : null,
          updatedAt: now,
        }
      : {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `att_${Date.now()}`,
          userId,
          problemId: problem.id,
          status: parsed.status,
          verificationType: "user_reported",
          preferredLanguage: parsed.preferredLanguage ?? "Python",
          notes: parsed.notes,
          firstAttemptedAt: now,
          lastAttemptedAt: now,
          completedAt: parsed.status === "solved" ? now : null,
          updatedAt: now,
        };

  try {
    const { error } = await withFastTimeout(
      supabase.from("practice_attempts").upsert(
        {
          id: record.id,
          user_id: userId,
          problem_id: problem.id,
          status: record.status,
          verification_type: "user_reported",
          preferred_language: record.preferredLanguage,
          notes: record.notes,
          first_attempted_at: record.firstAttemptedAt,
          last_attempted_at: record.lastAttemptedAt,
          completed_at: record.completedAt,
        },
        { onConflict: "user_id,problem_id" },
      ),
      2000,
    );
    if (error) {
      throw new Error(`Failed to save practice attempt: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Could not save your practice progress to the database. Please retry.",
      );
    }
  }

  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    const list = state.attempts[userId] ?? [];
    const idx = list.findIndex((a) => a.problemId === problem.id);
    if (idx >= 0) {
      list[idx] = record;
      state.attempts[userId] = [...list];
    } else {
      state.attempts[userId] = [record, ...list];
    }
    saveLocalState(state);
  }

  await recordLearningActivity(userId, {
    activityType: "problem_status_updated",
    resourceType: "problem",
    resourceId: problem.id,
    resourceTitle: `${problem.title} — marked as ${record.status.replace("_", " ")} (self-reported)`,
    metadata: {
      status: record.status,
      verificationType: "user_reported",
      source: problem.source,
    },
  });

  return record;
}

export async function recordLearningActivity(
  userId: string,
  input: {
    activityType: LearningActivityRecord["activityType"];
    resourceType: LearningActivityRecord["resourceType"];
    resourceId: string;
    resourceTitle: string;
    metadata?: Record<string, unknown>;
  },
): Promise<LearningActivityRecord> {
  await assertAuthorizedUser(userId);
  const record: LearningActivityRecord = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `act_${Date.now()}`,
    userId,
    activityType: input.activityType,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    resourceTitle: input.resourceTitle,
    occurredAt: new Date().toISOString(),
    metadata: input.metadata ?? {},
  };

  try {
    const { error } = await withFastTimeout(
      supabase.from("learning_activity").insert({
        id: record.id,
        user_id: userId,
        activity_type: record.activityType,
        resource_type: record.resourceType,
        resource_id: record.resourceId,
        resource_title: record.resourceTitle,
        occurred_at: record.occurredAt,
        metadata: record.metadata as never,
      }),
      1500,
    );
    if (error && !isLocalFallbackAllowed()) {
      throw new Error(`Failed to record activity: ${error.message}`);
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to record learning activity in the database.",
      );
    }
  }

  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    const list = state.activities[userId] ?? [];
    state.activities[userId] = [record, ...list].slice(0, 50);
    saveLocalState(state);
  }
  return record;
}

export async function getUserLearningActivity(userId: string): Promise<LearningActivityRecord[]> {
  await assertAuthorizedUser(userId);
  const state = loadLocalState();

  try {
    const { data, error } = await withFastTimeout(
      supabase
        .from("learning_activity")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .limit(25),
      2000,
    );
    if (error) {
      throw new Error(`Failed to load learning activity: ${error.message}`);
    }
    if (data) {
      const mapped: LearningActivityRecord[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        activityType: row.activity_type,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        resourceTitle: row.resource_title,
        occurredAt: row.occurred_at,
        metadata: (row.metadata as Record<string, unknown>) ?? {},
      }));
      if (isLocalFallbackAllowed()) {
        state.activities[userId] = mapped;
        saveLocalState(state);
      }
      return mapped;
    }
  } catch (err) {
    if (!isLocalFallbackAllowed() || !isNetworkFailure(err)) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to load learning activity from the database.",
      );
    }
  }

  return state.activities[userId] ?? [];
}

export async function clearAllUserData(userId: string): Promise<void> {
  await assertAuthorizedUser(userId);
  if (isLocalFallbackAllowed()) {
    const state = loadLocalState();
    delete state.profiles[userId];
    delete state.enrollments[userId];
    delete state.bookmarks[userId];
    delete state.attempts[userId];
    delete state.activities[userId];
    saveLocalState(state);
  }

  try {
    const results = await Promise.all([
      withFastTimeout(supabase.from("course_enrollments").delete().eq("user_id", userId), 1500),
      withFastTimeout(supabase.from("problem_bookmarks").delete().eq("user_id", userId), 1500),
      withFastTimeout(supabase.from("practice_attempts").delete().eq("user_id", userId), 1500),
      withFastTimeout(supabase.from("learning_activity").delete().eq("user_id", userId), 1500),
    ]);
    if (!isLocalFallbackAllowed()) {
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        throw new Error(`Failed to clear account data: ${failed.error.message}`);
      }
    }
  } catch (err) {
    if (!isLocalFallbackAllowed()) {
      throw new Error(
        err instanceof Error && !err.message.includes("SUPABASE_")
          ? err.message
          : "Unable to delete account data because the database is unreachable.",
      );
    }
  }
}

export interface DashboardSnapshot {
  profile: LearnerProfile;
  enrollments: Array<CourseEnrollmentRecord & { course: Course }>;
  bookmarks: Array<ProblemBookmarkRecord & { problem: PracticeProblem }>;
  attempts: Array<PracticeAttemptRecord & { problem: PracticeProblem }>;
  statusByProblemId: Record<string, PracticeStatus>;
  bookmarkedProblemIds: Set<string>;
  activities: LearningActivityRecord[];
  metrics: {
    enrolledCoursesCount: number;
    completedCoursesCount: number;
    completedModulesCount: number;
    solvedProblemsCount: number;
    inProgressProblemsCount: number;
    needsRevisionProblemsCount: number;
    bookmarkedProblemsCount: number;
  };
  topicProgress: TopicProgressStat[];
  pathProgress: Array<{
    path: LearningPath;
    completedCourses: number;
    totalCourses: number;
    solvedProblems: number;
    totalProblems: number;
    overallPercent: number;
  }>;
  recommendedNextStep: {
    title: string;
    description: string;
    ctaLabel: string;
    href: string;
    type: "onboarding" | "revision" | "course" | "practice";
  };
}

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const [profile, rawEnrollments, rawBookmarks, rawAttempts, activities] = await Promise.all([
    getLearnerProfile(userId),
    getUserEnrollments(userId),
    getUserBookmarks(userId),
    getUserPracticeAttempts(userId),
    getUserLearningActivity(userId),
  ]);

  const enrollments = rawEnrollments
    .map((e) => {
      const course = getCourseById(e.courseId);
      return course ? { ...e, course } : null;
    })
    .filter((item): item is CourseEnrollmentRecord & { course: Course } => item !== null);

  const bookmarks = rawBookmarks
    .map((b) => {
      const problem = getProblemById(b.problemId);
      return problem ? { ...b, problem } : null;
    })
    .filter((item): item is ProblemBookmarkRecord & { problem: PracticeProblem } => item !== null);

  const attempts = rawAttempts
    .map((a) => {
      const problem = getProblemById(a.problemId);
      return problem ? { ...a, problem } : null;
    })
    .filter((item): item is PracticeAttemptRecord & { problem: PracticeProblem } => item !== null);

  const statusByProblemId: Record<string, PracticeStatus> = {};
  for (const att of attempts) {
    statusByProblemId[att.problemId] = att.status;
  }

  const bookmarkedProblemIds = new Set(bookmarks.map((b) => b.problemId));
  const completedCourseIds = new Set(
    enrollments.filter((e) => e.status === "completed").map((e) => e.courseId),
  );
  const solvedProblemIds = new Set(
    attempts.filter((a) => a.status === "solved").map((a) => a.problemId),
  );

  const completedModulesCount = enrollments.reduce((sum, e) => sum + e.completedModules.length, 0);
  const solvedProblemsCount = attempts.filter((a) => a.status === "solved").length;
  const inProgressProblemsCount = attempts.filter((a) => a.status === "in_progress").length;
  const needsRevisionProblemsCount = attempts.filter((a) => a.status === "needs_revision").length;

  const topicProgress = calculateTopicProgress(practiceProblems, statusByProblemId);
  const pathProgress = learningPaths.map((path) => ({
    path,
    ...calculateLearningPathProgress(path, completedCourseIds, solvedProblemIds),
  }));

  let recommendedNextStep: DashboardSnapshot["recommendedNextStep"];
  const revisionProblem = attempts.find((a) => a.status === "needs_revision");
  const activeCourse = enrollments.find((e) => e.status !== "completed");

  if (!profile.onboardingCompleted) {
    recommendedNextStep = {
      title: "Personalize your learning profile",
      description:
        "Set your current level, preferred programming language, and primary goal so BUCKLABS can tailor your learning path.",
      ctaLabel: "Complete Onboarding",
      href: "/profile",
      type: "onboarding",
    };
  } else if (revisionProblem) {
    recommendedNextStep = {
      title: `Revise "${revisionProblem.problem.title}"`,
      description: `You flagged this ${revisionProblem.problem.difficulty} ${revisionProblem.problem.topics[0]} problem for revision. Review the approach or ask the AI Tutor.`,
      ctaLabel: "Open Problem for Revision",
      href: `/practice/${revisionProblem.problem.id}`,
      type: "revision",
    };
  } else if (activeCourse) {
    recommendedNextStep = {
      title: `Continue "${activeCourse.course.title}"`,
      description: `You have completed ${activeCourse.completedModules.length} of ${activeCourse.course.curriculum.length} modules (${activeCourse.progress}%).`,
      ctaLabel: "Continue Course",
      href: `/courses/${activeCourse.course.id}`,
      type: "course",
    };
  } else if (solvedProblemsCount === 0) {
    const firstProblem = practiceProblems[0];
    recommendedNextStep = {
      title: `Solve your first curated problem: "${firstProblem.title}"`,
      description: `Start building momentum with this ${firstProblem.difficulty} ${firstProblem.topics[0]} problem linked to our foundational track.`,
      ctaLabel: "Start Coding Practice",
      href: `/practice/${firstProblem.id}`,
      type: "practice",
    };
  } else {
    const nextUnsolved =
      practiceProblems.find((p) => (statusByProblemId[p.id] ?? "not_started") === "not_started") ??
      practiceProblems[0];
    recommendedNextStep = {
      title: `Next Practice Challenge: "${nextUnsolved.title}"`,
      description: `${nextUnsolved.difficulty} · ${nextUnsolved.topics.join(", ")} — ${nextUnsolved.learningObjective}`,
      ctaLabel: "Practice Problem",
      href: `/practice/${nextUnsolved.id}`,
      type: "practice",
    };
  }

  return {
    profile,
    enrollments,
    bookmarks,
    attempts,
    statusByProblemId,
    bookmarkedProblemIds,
    activities,
    metrics: {
      enrolledCoursesCount: enrollments.length,
      completedCoursesCount: completedCourseIds.size,
      completedModulesCount,
      solvedProblemsCount,
      inProgressProblemsCount,
      needsRevisionProblemsCount,
      bookmarkedProblemsCount: bookmarks.length,
    },
    topicProgress,
    pathProgress,
    recommendedNextStep,
  };
}

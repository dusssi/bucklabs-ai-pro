import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Complement the offline journeys with authenticated Supabase adapter contracts.
// This is an SDK mock, NOT a live Auth, network, persistence, or database RLS test.
const sdk = vi.hoisted(() => ({
  getSession: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  insert: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: sdk.getSession,
      signUp: sdk.signUp,
      signInWithPassword: sdk.signInWithPassword,
    },
    from: sdk.from,
  },
}));

import {
  getCurrentAuthUser,
  getLearnerProfile,
  isLocalFallbackAllowed,
  registerUser,
  resetLocalStateForTesting,
  signInUser,
  updateLearnerProfile,
} from "@/services/platform-store";

const userId = "28fe3242-9915-42e4-9c70-c21d74d2e881"; // Fixture only; never sent externally.
const user = {
  id: userId,
  email: "learner@example.invalid",
  user_metadata: { full_name: "Contract Learner" },
};
const session = { data: { session: { user } }, error: null };
const profileInput = {
  displayName: "Saved Learner",
  learningLevel: "Intermediate",
  primaryGoal: "Master data structures and algorithms",
  preferredLanguage: "Python",
  areasOfInterest: ["Data Structures and Algorithms"],
  onboardingCompleted: true,
};

beforeEach(() => {
  vi.resetAllMocks();
  resetLocalStateForTesting();
  vi.stubEnv("NODE_ENV", "production");
  // Production must take precedence even when test/dev flags are present.
  vi.stubEnv("VITE_ENABLE_LOCAL_FALLBACK", "true");
  sdk.getSession.mockResolvedValue(session);
  const query = {
    select: sdk.select,
    eq: sdk.eq,
    maybeSingle: sdk.maybeSingle,
    upsert: sdk.upsert,
    insert: sdk.insert,
  };
  sdk.from.mockReturnValue(query);
  sdk.select.mockReturnValue(query);
  sdk.eq.mockReturnValue(query);
  sdk.upsert.mockResolvedValue({ data: null, error: null });
  sdk.insert.mockResolvedValue({ data: null, error: null });
});
afterEach(() => {
  vi.unstubAllEnvs();
  resetLocalStateForTesting();
});

describe("Production-mode Supabase store adapter contracts", () => {
  it("uses a returned SDK session, not the offline test account store", async () => {
    expect(isLocalFallbackAllowed()).toBe(false);
    expect(await getCurrentAuthUser()).toMatchObject({
      id: userId,
      fullName: "Contract Learner",
      authMode: "supabase",
    });
    expect(sdk.getSession).toHaveBeenCalledOnce();
  });

  it("preserves required email confirmation when signup has no session", async () => {
    sdk.signUp.mockResolvedValue({ data: { user, session: null }, error: null });
    const result = await registerUser({
      fullName: "Contract Learner",
      email: user.email,
      password: "ContractPassword123!",
    });
    expect(result.requiresEmailConfirmation).toBe(true);
    expect(result.user.authMode).toBe("supabase");
    expect(sdk.signUp).toHaveBeenCalledOnce();
  });

  it("maps successful SDK login without manufacturing local persistence", async () => {
    sdk.signInWithPassword.mockResolvedValue({ data: { user }, error: null });
    expect(await signInUser({ email: user.email, password: "ContractPassword123!" })).toMatchObject(
      { id: userId, authMode: "supabase" },
    );
    expect(sdk.signInWithPassword).toHaveBeenCalledOnce();
  });

  it("maps a real-shaped profile response and scopes the query to the caller", async () => {
    sdk.maybeSingle.mockResolvedValue({
      data: {
        id: userId,
        display_name: "From Database",
        learning_level: "Intermediate",
        primary_goal: profileInput.primaryGoal,
        preferred_language: "Python",
        areas_of_interest: ["DSA"],
        target_role: "SDE",
        onboarding_completed: true,
        created_at: "2026-10-18T00:00:00Z",
        updated_at: "2026-10-18T01:00:00Z",
      },
      error: null,
    });
    expect(await getLearnerProfile(userId)).toMatchObject({
      id: userId,
      displayName: "From Database",
      onboardingCompleted: true,
    });
    expect(sdk.from).toHaveBeenCalledWith("profiles");
    expect(sdk.eq).toHaveBeenCalledWith("id", userId);
  });

  it("sends profile and activity writes only under the authenticated caller", async () => {
    expect(await updateLearnerProfile(userId, profileInput)).toMatchObject({
      displayName: "Saved Learner",
    });
    expect(sdk.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: userId, display_name: "Saved Learner" }),
    );
    expect(sdk.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId, activity_type: "onboarding_completed" }),
    );
  });

  it.each([
    ["database denial", { message: "row-level security denied write" }],
    ["network failure", { message: "fetch failed" }],
  ])(
    "rejects an authenticated profile write on %s without false success",
    async (_label, error) => {
      sdk.upsert.mockResolvedValue({ data: null, error });
      await expect(updateLearnerProfile(userId, profileInput)).rejects.toThrow(error.message);
      // Proves the test reached the database adapter, not just an unauthenticated guard.
      expect(sdk.upsert).toHaveBeenCalledOnce();
      expect(sdk.insert).not.toHaveBeenCalled();
      expect(isLocalFallbackAllowed()).toBe(false);
    },
  );

  it("rejects a different caller's profile before querying the SDK", async () => {
    await expect(getLearnerProfile("45c535f4-c5aa-488f-9727-3cf0aa501914")).rejects.toThrow(
      /Forbidden/,
    );
    expect(sdk.from).not.toHaveBeenCalled();
  });
});

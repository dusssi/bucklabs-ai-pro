import { beforeEach, describe, expect, it, vi } from "vitest";

// These are offline store-contract tests, not browser E2E or PostgreSQL RLS tests.
// Simulate a transport outage explicitly so a clean checkout needs no credentials
// and can never register accounts or write records in a real Supabase project.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: new Proxy(
    {},
    {
      get() {
        throw new TypeError("fetch failed: isolated offline journey test");
      },
    },
  ),
}));
import {
  enrollInCourse,
  getCurrentAuthUser,
  getDashboardSnapshot,
  getLearnerProfile,
  getUserBookmarks,
  getUserEnrollments,
  getUserPracticeAttempts,
  registerUser,
  resetLocalStateForTesting,
  signInUser,
  signOutUser,
  toggleCourseModuleCompletion,
  toggleProblemBookmark,
  updateLearnerProfile,
  upsertPracticeAttempt,
} from "@/services/platform-store";

describe("Offline Store Contracts — Auth, Persistence & Ownership Isolation", () => {
  beforeEach(() => {
    resetLocalStateForTesting();
  });

  it("Journey 1 & 2: Register -> Onboard -> Enroll -> Complete Modules -> Dashboard reflects real data", async () => {
    // 1. Register new learner
    const { user } = await registerUser({
      fullName: "Vikram Aditya",
      email: "vikram@bucklabs.edu",
      password: "StrongPassword123!",
    });
    expect(user.email).toBe("vikram@bucklabs.edu");

    // 2. Initial dashboard has 0 fabricated statistics
    const initialDash = await getDashboardSnapshot(user.id);
    expect(initialDash.metrics.enrolledCoursesCount).toBe(0);
    expect(initialDash.metrics.solvedProblemsCount).toBe(0);
    expect(initialDash.recommendedNextStep.type).toBe("onboarding");

    // 3. Complete onboarding preferences
    const updatedProfile = await updateLearnerProfile(user.id, {
      displayName: "Vikram A.",
      learningLevel: "Intermediate",
      primaryGoal: "Prepare for software engineering interviews",
      preferredLanguage: "Python",
      areasOfInterest: ["Data Structures and Algorithms", "Full Stack"],
      targetRole: "Software Development Engineer (SDE-1 / Intern)",
      onboardingCompleted: true,
    });
    expect(updatedProfile.onboardingCompleted).toBe(true);
    expect(updatedProfile.preferredLanguage).toBe("Python");

    // 4. Enroll in course and complete 2 modules
    const enrollment = await enrollInCourse(user.id, "python-programming-foundations");
    expect(enrollment.progress).toBe(0);

    await toggleCourseModuleCompletion(user.id, "python-programming-foundations", "py-mod-1");
    const afterMod2 = await toggleCourseModuleCompletion(
      user.id,
      "python-programming-foundations",
      "py-mod-2",
    );
    expect(afterMod2.completedModules).toEqual(["py-mod-1", "py-mod-2"]);
    expect(afterMod2.progress).toBe(33);
    expect(afterMod2.status).toBe("in_progress");

    // 5. Verify dashboard reflects exact persisted progress
    const dashAfterCourse = await getDashboardSnapshot(user.id);
    expect(dashAfterCourse.metrics.enrolledCoursesCount).toBe(1);
    expect(dashAfterCourse.metrics.completedModulesCount).toBe(2);
    expect(dashAfterCourse.enrollments[0].progress).toBe(33);
  });

  it("Journey 3, 4 & 5: Practice Bookmark -> Update Status & Notes -> Logout -> Login -> Verify Persistence", async () => {
    const { user } = await registerUser({
      fullName: "Meera Krishnan",
      email: "meera@bucklabs.edu",
      password: "SecurePassword99!",
    });

    await updateLearnerProfile(user.id, {
      displayName: "Meera Krishnan",
      learningLevel: "Intermediate",
      primaryGoal: "Master data structures and algorithms",
      preferredLanguage: "Python",
      areasOfInterest: ["Data Structures and Algorithms"],
      onboardingCompleted: true,
    });

    // Bookmark a problem
    const bmRes = await toggleProblemBookmark(user.id, "two-sum-lookup");
    expect(bmRes.bookmarked).toBe(true);

    // Mark problem solved (user-reported) with notes
    const attempt = await upsertPracticeAttempt(user.id, {
      problemId: "two-sum-lookup",
      status: "solved",
      preferredLanguage: "Python",
      notes: "O(N) hash map storing complement indices.",
    });
    expect(attempt.status).toBe("solved");
    expect(attempt.verificationType).toBe("user_reported");

    // Mark a second problem as needs_revision
    await upsertPracticeAttempt(user.id, {
      problemId: "coin-change-dp",
      status: "needs_revision",
      preferredLanguage: "C++",
      notes: "Review bottom-up tabulation vs greedy counterexample.",
    });

    // Sign out
    await signOutUser();
    expect(await getCurrentAuthUser()).toBeNull();

    // Sign back in and verify all activity persisted
    const signedBackIn = await signInUser({
      email: "meera@bucklabs.edu",
      password: "SecurePassword99!",
    });
    expect(signedBackIn.id).toBe(user.id);

    const bookmarks = await getUserBookmarks(user.id);
    expect(bookmarks.map((b) => b.problemId)).toEqual(["two-sum-lookup"]);

    const attempts = await getUserPracticeAttempts(user.id);
    expect(attempts).toHaveLength(2);

    const snapshot = await getDashboardSnapshot(user.id);
    expect(snapshot.metrics.solvedProblemsCount).toBe(1);
    expect(snapshot.metrics.needsRevisionProblemsCount).toBe(1);
    expect(snapshot.metrics.bookmarkedProblemsCount).toBe(1);
    // Needs revision problem is prioritized in recommendedNextStep
    expect(snapshot.recommendedNextStep.href).toBe("/practice/coin-change-dp");
  });

  it("Journey 6: Enforces Row-Level Access Control — prevents User B from reading or modifying User A's records", async () => {
    const { user: userA } = await registerUser({
      fullName: "User A",
      email: "usera@bucklabs.edu",
      password: "PasswordA123!",
    });
    await enrollInCourse(userA.id, "modern-fullstack-web");
    await toggleProblemBookmark(userA.id, "lru-cache-design");
    await signOutUser();

    const { user: userB } = await registerUser({
      fullName: "User B",
      email: "userb@bucklabs.edu",
      password: "PasswordB123!",
    });
    expect(userB.id).not.toBe(userA.id);

    // User B attempting to read or mutate User A's data must be rejected
    await expect(getLearnerProfile(userA.id)).rejects.toThrow(/Forbidden/i);
    await expect(getUserEnrollments(userA.id)).rejects.toThrow(/Forbidden/i);
    await expect(enrollInCourse(userA.id, "cloud-engineering")).rejects.toThrow(/Forbidden/i);
    await expect(toggleProblemBookmark(userA.id, "two-sum-lookup")).rejects.toThrow(/Forbidden/i);
    await expect(
      upsertPracticeAttempt(userA.id, {
        problemId: "two-sum-lookup",
        status: "solved",
        notes: "Unauthorized write attempt",
      }),
    ).rejects.toThrow(/Forbidden/i);
  });
});

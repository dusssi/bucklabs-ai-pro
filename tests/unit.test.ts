import { describe, expect, it } from "vitest";
import {
  aiTutorRequestSchema,
  contactSubmissionSchema,
  loginSchema,
  newsletterSchema,
  onboardingProfileSchema,
  practiceAttemptSchema,
  registerSchema,
} from "@/lib/validation";
import { calculateCourseProgress, courses, filterCourses } from "@/data/courses";
import { calculateLearningPathProgress, learningPaths } from "@/data/learning-paths";
import {
  calculateTopicProgress,
  filterAndSortProblems,
  mapExternalDifficulty,
  PRACTICE_TOPICS,
  practiceProblems,
} from "@/data/practice-problems";
import { analyzeCareerReadiness } from "@/data/career-roadmaps";

describe("Unit Tests — Form & Payload Validation", () => {
  it("validates registration inputs and rejects mismatched or short passwords", () => {
    const valid = registerSchema.safeParse({
      fullName: "Ananya Verma",
      email: "ananya@student.edu",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    expect(valid.success).toBe(true);

    const shortPass = registerSchema.safeParse({
      fullName: "Ananya Verma",
      email: "ananya@student.edu",
      password: "short",
      confirmPassword: "short",
    });
    expect(shortPass.success).toBe(false);

    const mismatch = registerSchema.safeParse({
      fullName: "Ananya Verma",
      email: "ananya@student.edu",
      password: "Password123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(mismatch.success).toBe(false);
  });

  it("validates login credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "learner@bucklabs.ai",
        password: "secretPassword",
      }).success,
    ).toBe(true);

    expect(
      loginSchema.safeParse({
        email: "not-an-email",
        password: "",
      }).success,
    ).toBe(false);
  });

  it("validates contact form and rejects messages under 10 characters", () => {
    expect(
      contactSubmissionSchema.safeParse({
        name: "Rohan",
        email: "rohan@college.edu",
        topic: "General Inquiry",
        message: "Too short",
      }).success,
    ).toBe(false);

    expect(
      contactSubmissionSchema.safeParse({
        name: "Rohan Gupta",
        email: "rohan@college.edu",
        topic: "Beta Access & Onboarding",
        message: "I would love to join the controlled beta for my MCA cohort.",
      }).success,
    ).toBe(true);
  });

  it("validates newsletter subscription and AI Tutor request payloads", () => {
    expect(newsletterSchema.safeParse({ email: "valid@domain.com" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "bad-email" }).success).toBe(false);

    expect(
      aiTutorRequestSchema.safeParse({
        mode: "hint",
        problemId: "two-sum-lookup",
        topic: "Hashing",
        language: "Python",
        userQuestion: "How do I avoid checking the same index twice?",
      }).success,
    ).toBe(true);
  });

  it("validates onboarding profile and practice attempt schemas", () => {
    expect(
      onboardingProfileSchema.safeParse({
        displayName: "Dev Learner",
        learningLevel: "Intermediate",
        primaryGoal: "Prepare for software engineering interviews",
        preferredLanguage: "Java",
        areasOfInterest: ["Data Structures and Algorithms"],
      }).success,
    ).toBe(true);

    expect(
      practiceAttemptSchema.safeParse({
        problemId: "two-sum-lookup",
        status: "solved",
        preferredLanguage: "Python",
        notes: "Used a single-pass dictionary mapping value to index.",
      }).success,
    ).toBe(true);
  });
});

describe("Unit Tests — Difficulty Mapping & Progress Calculations", () => {
  it("maps external difficulty labels and ratings defensibly", () => {
    expect(mapExternalDifficulty("Easy", true)).toBe("Beginner");
    expect(mapExternalDifficulty("Easy")).toBe("Easy");
    expect(mapExternalDifficulty("Medium")).toBe("Medium");
    expect(mapExternalDifficulty("1900 / Hard")).toBe("Hard");
    expect(mapExternalDifficulty("800")).toBe("Beginner");
    expect(mapExternalDifficulty("1100")).toBe("Easy");
    expect(mapExternalDifficulty("1500")).toBe("Medium");
    expect(mapExternalDifficulty("2100")).toBe("Hard");
  });

  it("calculates course progress accurately without fabricating percentages", () => {
    expect(calculateCourseProgress([], 6)).toBe(0);
    expect(calculateCourseProgress(["m1", "m2", "m3"], 6)).toBe(50);
    expect(calculateCourseProgress(["m1", "m1", "m2"], 4)).toBe(50);
    expect(calculateCourseProgress(["m1", "m2", "m3", "m4", "m5", "m6"], 6)).toBe(100);
  });

  it("calculates learning path progress from completed courses and solved problems", () => {
    const path = learningPaths[0];
    const zeroStats = calculateLearningPathProgress(path, new Set(), new Set());
    expect(zeroStats.overallPercent).toBe(0);

    const partialStats = calculateLearningPathProgress(
      path,
      new Set([path.courseIds[0]]),
      new Set(path.problemIds.slice(0, 4)),
    );
    expect(partialStats.completedCourses).toBe(1);
    expect(partialStats.solvedProblems).toBe(4);
    expect(partialStats.overallPercent).toBeGreaterThan(0);
  });

  it("calculates topic-level progress across all 16 initial DSA topics", () => {
    const stats = calculateTopicProgress(practiceProblems, {
      "two-sum-lookup": "solved",
      "container-most-water": "in_progress",
      "coin-change-dp": "needs_revision",
    });

    expect(stats).toHaveLength(PRACTICE_TOPICS.length);
    const hashingTopic = stats.find((s) => s.topic === "Hashing");
    expect(hashingTopic?.solved).toBe(1);

    const dpTopic = stats.find((s) => s.topic === "Dynamic Programming");
    expect(dpTopic?.needsRevision).toBe(1);
  });
});

describe("Unit Tests — Catalogue Filtering, Search & Career Skill-Gap Analysis", () => {
  it("filters and sorts practice problems by topic, difficulty, source, language, and bookmark status", () => {
    const graphsOnly = filterAndSortProblems(practiceProblems, {
      topic: "Graphs",
    });
    expect(graphsOnly.length).toBeGreaterThanOrEqual(3);
    expect(graphsOnly.every((p) => p.topics.includes("Graphs"))).toBe(true);

    const codeforcesHard = filterAndSortProblems(practiceProblems, {
      source: "Codeforces",
      difficulty: "Hard",
    });
    expect(codeforcesHard).toHaveLength(1);
    expect(codeforcesHard[0].id).toBe("dijkstra-shortest-routes");

    const bookmarkedSet = new Set(["lru-cache-design", "two-sum-lookup"]);
    const bookmarkedResults = filterAndSortProblems(practiceProblems, {
      bookmarkedOnly: true,
      bookmarkedIds: bookmarkedSet,
      sortBy: "title",
    });
    expect(bookmarkedResults.map((p) => p.id)).toEqual(["lru-cache-design", "two-sum-lookup"]);
  });

  it("filters courses by search query, category, and difficulty level", () => {
    const securityCourses = filterCourses(courses, {
      category: "Security",
      level: "Advanced",
    });
    expect(securityCourses).toHaveLength(1);
    expect(securityCourses[0].id).toBe("ethical-hacking-defense");

    const ragSearch = filterCourses(courses, { query: "RAG" });
    expect(ragSearch.some((c) => c.id === "llm-application-engineering")).toBe(true);
  });

  it("identifies matched skills, missing skill gaps, and recommended courses in Career Lab", () => {
    const report = analyzeCareerReadiness({
      roleId: "sde-interview-track",
      resumeOrSkillsText:
        "Experienced with Python, Arrays, Hashing, and Git. Reduced query latency by 35%.",
      jobDescriptionText: "Looking for an intern strong in Python, Graphs, and Docker.",
      completedCourseIds: ["python-programming-foundations"],
      solvedProblemIds: ["two-sum-lookup"],
    });

    expect(report.matchedSkills).toContain("Python");
    expect(report.matchedSkills).toContain("Arrays");
    expect(report.missingSkills).toContain("Graphs");
    expect(report.jdExtraKeywordsMissing).toContain("docker");
    expect(report.recommendedCourseIds).toContain("dsa-problem-solving-foundations");
  });
});

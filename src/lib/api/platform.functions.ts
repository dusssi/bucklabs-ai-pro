import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  aiTutorRequestSchema,
  contactSubmissionSchema,
  newsletterSchema,
  onboardingProfileSchema,
  practiceAttemptSchema,
  type AiTutorMode,
} from "@/lib/validation";
import { sanitizePublicErrorMessage } from "@/lib/config.server";
import { getProblemById } from "@/data/practice-problems";
import { getCourseById } from "@/data/courses";
import {
  authorizeServerOperation,
  generateAiTutorGuidance,
  processContactSubmission,
  processNewsletterSubscription,
} from "./platform.server";

export interface AiTutorResponse {
  mode: AiTutorMode;
  modeLabel: string;
  generationEngine: "live_llm" | "deterministic_beta_engine";
  engineBadge: string;
  headline: string;
  guidanceSteps: string[];
  complexityAnalysis: {
    time: string;
    space: string;
    rationale: string;
  };
  codeChecklist: string[];
  relatedCourse: { id: string; title: string } | null;
  relatedProblems: Array<{ id: string; title: string; difficulty: string }>;
  disclaimer: string;
  remainingQuota: number;
  generatedAt: string;
}

export const submitContactServerFn = createServerFn({ method: "POST" })
  .inputValidator(contactSubmissionSchema)
  .handler(async ({ data }) => {
    return processContactSubmission(data, process.env);
  });

export const subscribeNewsletterServerFn = createServerFn({ method: "POST" })
  .inputValidator(newsletterSchema)
  .handler(async ({ data }) => {
    return processNewsletterSubscription(data, process.env);
  });

export const askAiTutorServerFn = createServerFn({ method: "POST" })
  .inputValidator(aiTutorRequestSchema)
  .handler(async ({ data }): Promise<AiTutorResponse> => {
    return generateAiTutorGuidance(data);
  });

// =============================================================================
// PROTECTED SERVER FUNCTIONS (Enforced via requireSupabaseAuth middleware)
// =============================================================================

export const getVerifiedSessionServerFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = authorizeServerOperation(context.userId);
    return {
      userId,
      email: context.email,
      authenticated: true as const,
    };
  });

export const saveLearnerProfileServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    onboardingProfileSchema.extend({
      targetUserId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const userId = authorizeServerOperation(context.userId, data.targetUserId);

    const { error } = await context.supabase.from("profiles").upsert({
      id: userId,
      display_name: data.displayName,
      learning_level: data.learningLevel,
      primary_goal: data.primaryGoal,
      preferred_language: data.preferredLanguage,
      areas_of_interest: data.areasOfInterest,
      target_role: data.targetRole ?? null,
      onboarding_completed: data.onboardingCompleted,
    });

    if (error) {
      throw new Error(
        sanitizePublicErrorMessage(error.message, "Failed to persist learner profile."),
      );
    }

    return {
      userId,
      updatedAt: new Date().toISOString(),
    };
  });

export const enrollCourseProtectedServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      courseId: z.string().trim().min(1).max(120),
      targetUserId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const userId = authorizeServerOperation(context.userId, data.targetUserId);
    const course = getCourseById(data.courseId);
    if (!course) {
      throw new Error(`Course "${data.courseId}" does not exist.`);
    }

    const { data: row, error } = await context.supabase
      .from("course_enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: course.id,
          status: "enrolled",
          progress: 0,
          completed_modules: [],
        },
        { onConflict: "user_id,course_id" },
      )
      .select("*")
      .single();

    if (error || !row) {
      throw new Error(sanitizePublicErrorMessage(error?.message, "Failed to enroll in course."));
    }

    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      status: row.status,
      progress: row.progress,
    };
  });

export const savePracticeAttemptProtectedServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    practiceAttemptSchema.extend({
      targetUserId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const userId = authorizeServerOperation(context.userId, data.targetUserId);
    const problem = getProblemById(data.problemId);
    if (!problem) {
      throw new Error(`Problem "${data.problemId}" does not exist.`);
    }

    const now = new Date().toISOString();
    const { data: row, error } = await context.supabase
      .from("practice_attempts")
      .upsert(
        {
          user_id: userId,
          problem_id: problem.id,
          status: data.status,
          verification_type: "user_reported",
          preferred_language: data.preferredLanguage ?? "Python",
          notes: data.notes,
          last_attempted_at: now,
          completed_at: data.status === "solved" ? now : null,
        },
        { onConflict: "user_id,problem_id" },
      )
      .select("*")
      .single();

    if (error || !row) {
      throw new Error(
        sanitizePublicErrorMessage(error?.message, "Failed to save practice attempt."),
      );
    }

    return {
      id: row.id,
      userId: row.user_id,
      problemId: row.problem_id,
      status: row.status,
      verificationType: row.verification_type,
      updatedAt: row.updated_at,
    };
  });

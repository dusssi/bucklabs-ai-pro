import { z } from "zod";
import {
  PRACTICE_DIFFICULTIES,
  PRACTICE_LANGUAGES,
  PRACTICE_SOURCES,
  PRACTICE_TOPICS,
} from "@/data/practice-problems";

export const LEARNING_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const PREFERRED_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "TypeScript"] as const;

export const LEARNING_GOALS = [
  "Learn programming fundamentals",
  "Master data structures and algorithms",
  "Prepare for software engineering interviews",
  "Learn AI and machine learning",
  "Build practical projects",
  "Prepare for job applications",
] as const;

export const PRACTICE_STATUSES = [
  "not_started",
  "in_progress",
  "solved",
  "needs_revision",
] as const;

export const AI_TUTOR_MODES = ["hint", "concept", "debug", "solution", "revision"] as const;

export type AiTutorMode = (typeof AI_TUTOR_MODES)[number];

/**
 * Prevents open-redirect vulnerabilities by strictly allowing only internal, single-slash relative paths.
 */
export function sanitizeRedirectPath(
  redirect: string | null | undefined,
  defaultPath = "/dashboard",
): string {
  if (!redirect || typeof redirect !== "string") {
    return defaultPath;
  }
  const trimmed = redirect.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed) ||
    !/^\/[a-zA-Z0-9/_?=&.-]*$/.test(trimmed)
  ) {
    return defaultPath;
  }
  return trimmed;
}

/**
 * Validates plain-text or Markdown resume uploads (.txt / .md, <= 100 KB, no binary/null bytes).
 */
export function validateResumeFilePayload(input: {
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  content: string;
}): { valid: boolean; sanitizedContent: string; error?: string } {
  const lowerName = input.fileName.trim().toLowerCase();
  const allowedExtensions = [".txt", ".md"];
  if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      sanitizedContent: "",
      error: "Only plain-text (.txt) and Markdown (.md) files are allowed.",
    };
  }

  const allowedMimes = ["", "text/plain", "text/markdown", "text/x-markdown"];
  const normalizedMime = (input.mimeType ?? "").split(";")[0].trim().toLowerCase();
  if (!allowedMimes.includes(normalizedMime)) {
    return {
      valid: false,
      sanitizedContent: "",
      error: `Unsupported file MIME type "${normalizedMime}". Upload a plain-text or Markdown file.`,
    };
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > 100 * 1024) {
    return {
      valid: false,
      sanitizedContent: "",
      error: "File size must be between 1 byte and 100 KB.",
    };
  }

  if (input.content.includes("\0")) {
    return {
      valid: false,
      sanitizedContent: "",
      error: "Binary content is not permitted. Upload a UTF-8 text or Markdown file.",
    };
  }

  let sanitizedContent = "";
  for (let i = 0; i < input.content.length && sanitizedContent.length < 6000; i++) {
    const code = input.content.charCodeAt(i);
    const isAllowedControl = code === 9 || code === 10 || code === 13;
    if (isAllowedControl || (code >= 32 && code !== 127)) {
      sanitizedContent += input.content[i];
    }
  }

  return {
    valid: true,
    sanitizedContent,
  };
}

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be 100 characters or fewer"),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const onboardingProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(80, "Display name must be 80 characters or fewer"),
  learningLevel: z.enum(LEARNING_LEVELS),
  primaryGoal: z.string().trim().min(3, "Select or enter a primary learning goal").max(160),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES),
  areasOfInterest: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  targetRole: z.string().trim().max(120).optional().nullable(),
  onboardingCompleted: z.boolean().default(true),
});

export const practiceAttemptSchema = z.object({
  problemId: z.string().trim().min(1, "Problem ID is required").max(120),
  status: z.enum(PRACTICE_STATUSES),
  preferredLanguage: z.enum(PREFERRED_LANGUAGES).optional().nullable(),
  notes: z.string().max(4000, "Notes must be 4000 characters or fewer").default(""),
});

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  topic: z
    .enum([
      "General Inquiry",
      "Beta Access & Onboarding",
      "Course & Practice Feedback",
      "University / Campus Partnership",
      "Security or Privacy Report",
    ])
    .default("General Inquiry"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
  honeypot: z.string().max(0, "Automated spam submission rejected").optional().default(""),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  honeypot: z.string().max(0, "Automated spam submission rejected").optional().default(""),
});

export const aiTutorRequestSchema = z.object({
  mode: z.enum(AI_TUTOR_MODES),
  problemId: z.string().trim().max(120).optional(),
  topic: z.string().trim().min(1, "Topic is required").max(100),
  language: z.enum(PREFERRED_LANGUAGES).default("Python"),
  userQuestion: z
    .string()
    .trim()
    .min(5, "Please describe your question or what you have tried (at least 5 characters)")
    .max(1500, "Question must be 1500 characters or fewer"),
  userCode: z
    .string()
    .max(6000, "Code snippet must be 6000 characters or fewer")
    .optional()
    .default(""),
});

export const practiceFilterSchema = z.object({
  topic: z.enum(["All", ...PRACTICE_TOPICS]).default("All"),
  difficulty: z.enum(["All", ...PRACTICE_DIFFICULTIES]).default("All"),
  source: z.enum(["All", ...PRACTICE_SOURCES]).default("All"),
  language: z.enum(["All", ...PRACTICE_LANGUAGES]).default("All"),
});

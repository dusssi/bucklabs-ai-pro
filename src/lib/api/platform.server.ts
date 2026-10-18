import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  aiTutorRequestSchema,
  contactSubmissionSchema,
  newsletterSchema,
  type AiTutorMode,
} from "@/lib/validation";
import { sanitizePublicErrorMessage } from "@/lib/config.server";
import { getProblemById, practiceProblems } from "@/data/practice-problems";
import { courses } from "@/data/courses";
import type { AiTutorResponse } from "./platform.functions";

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const recentContactIdempotencyCache = new Map<
  string,
  { id: string; createdAt: string; expiresAt: number }
>();
const testNewsletterSet = new Set<string>();

/**
 * Determines whether local/test fallback is explicitly permitted.
 * In production (NODE_ENV === "production"), fallback is NEVER permitted.
 */
export function isServerTestFallbackAllowed(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV === "production") {
    return false;
  }
  return (
    env.VITEST === "true" || env.NODE_ENV === "test" || env.VITE_ENABLE_LOCAL_FALLBACK === "true"
  );
}

export function resetServerRateLimitsForTesting(): void {
  rateLimitBuckets.clear();
  recentContactIdempotencyCache.clear();
  testNewsletterSet.clear();
}

export function getCallerIdentifier(fallbackKey: string): string {
  try {
    const req = getRequest();
    if (req?.headers) {
      const forwarded = req.headers.get("x-forwarded-for");
      if (forwarded) {
        return forwarded.split(",")[0].trim();
      }
      const realIp = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
      if (realIp) {
        return realIp.trim();
      }
    }
  } catch {
    // getRequest() may throw when invoked outside an HTTP request context (e.g. unit tests)
  }
  return fallbackKey;
}

export function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number,
): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const current = rateLimitBuckets.get(bucketKey);
  if (!current || now >= current.resetAt) {
    rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetInSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

/**
 * Enforces server-side authorization: verifies that `contextUserId` is present from verified JWT claims
 * and rejects any request attempting to act on another user's `targetUserId` (IDOR prevention).
 */
export function authorizeServerOperation(
  contextUserId: string | null | undefined,
  targetUserId?: string | null,
): string {
  if (!contextUserId || typeof contextUserId !== "string" || !contextUserId.trim()) {
    throw new Error("Unauthorized: Valid authentication token required.");
  }
  if (targetUserId && targetUserId !== contextUserId) {
    throw new Error("Forbidden: Cannot access or modify records belonging to another user.");
  }
  return contextUserId;
}

function getServerSupabasePublicClient(env: Record<string, string | undefined> = process.env) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
  const key = (env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function withTimeout<T>(promise: PromiseLike<T>, ms = 3500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("SUPABASE_TIMEOUT")), ms);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function processContactSubmission(
  rawInput: unknown,
  env: Record<string, string | undefined> = process.env,
): Promise<{
  id: string;
  status: "received";
  createdAt: string;
  persistedVia: "supabase" | "test_fallback";
  deduplicated?: boolean;
}> {
  const data = contactSubmissionSchema.parse(rawInput);

  if (data.honeypot && data.honeypot.trim().length > 0) {
    throw new Error("Automated spam submission rejected.");
  }

  const normalizedEmail = data.email.trim().toLowerCase();
  const callerKey = getCallerIdentifier(normalizedEmail);
  const rate = checkRateLimit(`contact:${callerKey}:${normalizedEmail}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    throw new Error(
      `Rate limit exceeded. Please wait ${rate.resetInSeconds} seconds before sending another message.`,
    );
  }

  const idempotencyKey = `${normalizedEmail}::${data.topic}::${data.message.trim()}`;
  const existingTicket = recentContactIdempotencyCache.get(idempotencyKey);
  if (existingTicket && existingTicket.expiresAt > Date.now()) {
    return {
      id: existingTicket.id,
      status: "received",
      createdAt: existingTicket.createdAt,
      persistedVia: "supabase",
      deduplicated: true,
    };
  }

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const fallbackAllowed = isServerTestFallbackAllowed(env);

  const sb = getServerSupabasePublicClient(env);
  if (!sb) {
    if (!fallbackAllowed) {
      throw new Error(
        "Contact service is temporarily unavailable due to missing database configuration.",
      );
    }
    return { id, status: "received", createdAt, persistedVia: "test_fallback" };
  }

  try {
    const { error } = await withTimeout(
      sb.from("contact_submissions").insert({
        id,
        name: data.name,
        email: normalizedEmail,
        topic: data.topic,
        message: data.message,
        status: "received",
      }),
      3500,
    );

    if (error) {
      if (!fallbackAllowed) {
        throw new Error(
          sanitizePublicErrorMessage(
            error.message,
            "Unable to record your message at this time. Please retry shortly.",
          ),
        );
      }
      return { id, status: "received", createdAt, persistedVia: "test_fallback" };
    }

    recentContactIdempotencyCache.set(idempotencyKey, {
      id,
      createdAt,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });

    return {
      id,
      status: "received",
      createdAt,
      persistedVia: "supabase",
    };
  } catch (err) {
    if (!fallbackAllowed) {
      throw new Error(
        sanitizePublicErrorMessage(
          err,
          "Could not persist your contact submission to the database. Please retry.",
        ),
      );
    }
    return { id, status: "received", createdAt, persistedVia: "test_fallback" };
  }
}

export async function processNewsletterSubscription(
  rawInput: unknown,
  env: Record<string, string | undefined> = process.env,
): Promise<{
  id: string;
  email: string;
  status: "subscribed";
  alreadySubscribed: boolean;
  createdAt: string;
  persistedVia: "supabase" | "test_fallback";
}> {
  const data = newsletterSchema.parse(rawInput);

  if (data.honeypot && data.honeypot.trim().length > 0) {
    throw new Error("Automated spam submission rejected.");
  }

  const normalizedEmail = data.email.trim().toLowerCase();
  const callerKey = getCallerIdentifier(normalizedEmail);
  const rate = checkRateLimit(`newsletter:${callerKey}:${normalizedEmail}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    throw new Error("Too many subscription attempts. Please try again later.");
  }

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const fallbackAllowed = isServerTestFallbackAllowed(env);

  const sb = getServerSupabasePublicClient(env);
  if (!sb) {
    if (!fallbackAllowed) {
      throw new Error(
        "Newsletter subscription service is unavailable due to missing database configuration.",
      );
    }
    const already = testNewsletterSet.has(normalizedEmail);
    testNewsletterSet.add(normalizedEmail);
    return {
      id,
      email: normalizedEmail,
      status: "subscribed",
      alreadySubscribed: already,
      createdAt,
      persistedVia: "test_fallback",
    };
  }

  try {
    const { error } = await withTimeout(
      sb.from("newsletter_subscriptions").insert({
        id,
        email: normalizedEmail,
        status: "subscribed",
      }),
      3500,
    );

    if (!error) {
      return {
        id,
        email: normalizedEmail,
        status: "subscribed",
        alreadySubscribed: false,
        createdAt,
        persistedVia: "supabase",
      };
    }

    if (error.code === "23505") {
      return {
        id,
        email: normalizedEmail,
        status: "subscribed",
        alreadySubscribed: true,
        createdAt,
        persistedVia: "supabase",
      };
    }

    if (!fallbackAllowed) {
      throw new Error(
        sanitizePublicErrorMessage(
          error.message,
          "Unable to complete your newsletter subscription. Please try again.",
        ),
      );
    }
  } catch (err) {
    if (!fallbackAllowed) {
      throw new Error(
        sanitizePublicErrorMessage(
          err,
          "Could not save your newsletter subscription to the database. Please retry.",
        ),
      );
    }
  }

  const already = testNewsletterSet.has(normalizedEmail);
  testNewsletterSet.add(normalizedEmail);
  return {
    id,
    email: normalizedEmail,
    status: "subscribed",
    alreadySubscribed: already,
    createdAt,
    persistedVia: "test_fallback",
  };
}

const MODE_LABELS: Record<AiTutorMode, string> = {
  hint: "Progressive Hint Mode",
  concept: "Concept & Mental Model Mode",
  debug: "Code Diagnostic & Edge-Case Mode",
  solution: "Approach & Trade-Off Walkthrough",
  revision: "Spaced Revision & Pattern Recall",
};

export async function generateAiTutorGuidance(rawInput: unknown): Promise<AiTutorResponse> {
  const data = aiTutorRequestSchema.parse(rawInput);
  const callerKey = getCallerIdentifier("anonymous");
  const rate = checkRateLimit(`ai-tutor:${callerKey}`, 20, 10 * 60 * 1000);
  if (!rate.allowed) {
    throw new Error(
      `AI Tutor usage quota reached (20 requests / 10 min). Try again in ${rate.resetInSeconds}s.`,
    );
  }

  const problem = data.problemId ? getProblemById(data.problemId) : undefined;
  const activeTopic = problem ? problem.topics[0] : data.topic;

  const matchingProblems = practiceProblems
    .filter(
      (p) =>
        p.id !== problem?.id && p.topics.some((t) => t.toLowerCase() === activeTopic.toLowerCase()),
    )
    .slice(0, 3)
    .map((p) => ({ id: p.id, title: p.title, difficulty: p.difficulty }));

  const relatedCourseObj = problem
    ? courses.find((c) => c.id === problem.relatedCourseId)
    : (courses.find(
        (c) =>
          c.tags.some((t) => t.toLowerCase().includes(activeTopic.toLowerCase())) ||
          c.category.toLowerCase().includes(activeTopic.toLowerCase()),
      ) ?? courses[1]);

  const codeLength = (data.userCode ?? "").trim().length;
  const hasNestedLoops =
    /for\s*\(.*\)\s*\{?[\s\S]*for\s*\(/i.test(data.userCode ?? "") ||
    /for\s+.*:\s*\n\s+for\s+/i.test(data.userCode ?? "");

  let headline = "";
  let guidanceSteps: string[] = [];
  const timeComplexity = problem?.complexityTime ?? "O(N) target (vs O(N^2) brute force)";
  const spaceComplexity = problem?.complexitySpace ?? "O(N) or O(1) depending on auxiliary state";
  const rationale =
    problem?.learningObjective ??
    `Focus on maintaining a clear invariant over ${activeTopic} so each element is processed a bounded number of times.`;

  if (data.mode === "hint") {
    headline = problem
      ? `Progressive hints for "${problem.title}" (${data.language})`
      : `Step-by-step intuition for ${activeTopic} (${data.language})`;
    guidanceSteps = problem
      ? [
          `Hint 1 (Observation): ${problem.hints[0] ?? problem.learningObjective}`,
          `Hint 2 (Data Structure / Invariant): ${problem.hints[1] ?? "Identify which state needs fast lookup or monotonic ordering."}`,
          `Hint 3 (Transition): ${problem.hints[2] ?? "Verify boundary conditions on empty/single-element inputs before coding."}`,
        ]
      : [
          `Hint 1: Start by stating the brute-force baseline for your ${activeTopic} question and identifying the repeated work.`,
          `Hint 2: Ask what invariant or auxiliary structure (hash map, two pointers, monotonic stack, or prefix array) eliminates the inner loop.`,
          `Hint 3: Trace a 4-element example by hand in ${data.language} before writing the full loop.`,
        ];
  } else if (data.mode === "concept") {
    headline = `Core Mental Model: ${activeTopic}`;
    guidanceSteps = [
      `1. Core Invariant: ${problem ? problem.learningObjective : `In ${activeTopic}, define what property holds true at the start and end of every iteration.`}`,
      `2. Why Brute Force Degrades: Scanning all pairs or subarrays recomputes overlapping state from scratch, turning linear scans into quadratic bottlenecks.`,
      `3. Pattern Recognition Trigger: Choose ${activeTopic} techniques when the problem asks for contiguous constraints, fast key lookups, or hierarchical state transitions.`,
    ];
  } else if (data.mode === "debug") {
    headline = `Diagnostic Review (${data.language}${codeLength > 0 ? " — Code Snippet Provided" : ""})`;
    guidanceSteps = [
      codeLength > 0
        ? hasNestedLoops
          ? "Detected nested iteration in your snippet: check whether the inner scan can be replaced with a precomputed lookup table or sliding pointer."
          : "Reviewed your snippet structure: verify off-by-one loop bounds and ensure mutating state is updated before early returns."
        : "No code snippet was attached—diagnosing based on your question description.",
      "Boundary Check 1: Test minimal inputs (empty collection, n = 1, all identical values, or negative numbers).",
      `Boundary Check 2: In ${data.language}, watch for integer overflow, shallow reference copies, or uninitialized map keys.`,
    ];
  } else if (data.mode === "solution") {
    headline = problem
      ? `Structured Approach for "${problem.title}"`
      : `Algorithmic Blueprint for ${activeTopic}`;
    guidanceSteps = problem
      ? [
          `Problem Objective: ${problem.summary}`,
          `Optimal Strategy: ${problem.approachOutline}`,
          `Implementation Plan in ${data.language}: Initialize your state container, iterate while maintaining the invariant, and validate the return contract on edge cases.`,
        ]
      : [
          `1. State Definition: Represent only the minimal information needed at step i.`,
          `2. Transition Rule: Update state deterministically in O(1) or O(log N) per step.`,
          `3. Verification: Confirm both time (${timeComplexity}) and space (${spaceComplexity}) bounds hold in the worst case.`,
        ];
  } else {
    headline = `Revision & Pattern Recall: ${activeTopic}`;
    guidanceSteps = [
      `Recall Prompt 1: Without looking at notes, state the time and space trade-off for ${problem ? problem.title : activeTopic}.`,
      `Recall Prompt 2: What single change in problem constraints (e.g., unsorted input, negative weights, or duplicate elements) would break the standard ${activeTopic} template?`,
      `Spaced Practice Action: Solve one related ${activeTopic} problem below without hints, then record key takeaways in your problem notes.`,
    ];
  }

  const codeChecklist = [
    `Language target: ${data.language} — prefer explicit variable names describing the invariant (e.g., left/right, seenIndices, minHeap).`,
    "Dry-run your logic on a tiny counterexample before submitting on the external judge.",
    "Document the time and space complexity in your BUCKLABS practice notes for pre-interview revision.",
  ];

  return {
    mode: data.mode,
    modeLabel: MODE_LABELS[data.mode],
    generationEngine: "deterministic_beta_engine",
    engineBadge:
      "Beta Rule-Based Pedagogical Engine (Structured Curriculum Metadata — No Live LLM API Key Configured)",
    headline,
    guidanceSteps,
    complexityAnalysis: {
      time: timeComplexity,
      space: spaceComplexity,
      rationale,
    },
    codeChecklist,
    relatedCourse: relatedCourseObj
      ? { id: relatedCourseObj.id, title: relatedCourseObj.title }
      : null,
    relatedProblems: matchingProblems,
    disclaimer:
      "Transparent Engine Notice: This guidance is generated by BUCKLABS AI's deterministic beta pedagogical engine using curated problem metadata (no external LLM provider key is active in this environment). Always verify edge cases on the canonical judge.",
    remainingQuota: rate.remaining,
    generatedAt: new Date().toISOString(),
  };
}

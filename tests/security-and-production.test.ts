import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  extractBearerToken,
  verifySupabaseBearerToken,
} from "@/integrations/supabase/auth-middleware";
import {
  redactSensitiveData,
  sanitizePublicErrorMessage,
  validateServerEnv,
} from "@/lib/config.server";
import { sanitizeRedirectPath, validateResumeFilePayload } from "@/lib/validation";
import {
  authorizeServerOperation,
  isServerTestFallbackAllowed,
  processContactSubmission,
  processNewsletterSubscription,
  resetServerRateLimitsForTesting,
} from "@/lib/api/platform.server";
import {
  enrollInCourse,
  isLocalFallbackAllowed,
  registerUser,
  resetLocalStateForTesting,
  setForceProductionModeForTesting,
  signInUser,
  toggleCourseModuleCompletion,
  toggleProblemBookmark,
  updateLearnerProfile,
  upsertPracticeAttempt,
} from "@/services/platform-store";

describe("Security Audit Suite — Environment, Redaction, Redirects & File Uploads", () => {
  it("validates required environment variables and detects privileged secrets in VITE_ variables", () => {
    const missingResult = validateServerEnv({});
    expect(missingResult.valid).toBe(false);
    expect(missingResult.missing.length).toBeGreaterThanOrEqual(2);

    const leakedServiceRole = validateServerEnv({
      SUPABASE_URL: "https://kyjgpywuoatbhjtvkmax.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "anon-public-placeholder",
      VITE_SUPABASE_SERVICE_ROLE_KEY: "sb_secret_privileged_value_1234567890",
    });
    expect(leakedServiceRole.valid).toBe(false);
    expect(leakedServiceRole.securityViolations[0]).toMatch(
      /Privileged credential detected in client-visible environment variable/i,
    );

    const validConfig = validateServerEnv({
      SUPABASE_URL: "https://kyjgpywuoatbhjtvkmax.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "anon-public-placeholder",
      NODE_ENV: "production",
    });
    expect(validConfig.valid).toBe(true);
    expect(validConfig.securityViolations).toHaveLength(0);
  });

  it("redacts JWTs, Bearer tokens, API keys, DB URIs, and passwords from logs and errors", () => {
    const rawLog =
      'Auth failed for jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c and header Bearer opaqueSessionToken987654321 with key sk-proj1234567890abcdef and postgres://admin:supersecret@db.host:5432/postgres and "password":"mySecretPassword123"';
    const redacted = redactSensitiveData(rawLog);

    expect(redacted).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(redacted).not.toContain("opaqueSessionToken987654321");
    expect(redacted).not.toContain("sk-proj1234567890abcdef");
    expect(redacted).not.toContain("supersecret");
    expect(redacted).not.toContain("mySecretPassword123");
    expect(redacted).toContain("[REDACTED_JWT]");
    expect(redacted).toContain("[REDACTED_TOKEN]");
    expect(redacted).toContain("[REDACTED_API_KEY]");
    expect(redacted).toContain("[REDACTED_DB_URI]");

    const sqlTraceError = new Error("syntax error at or near SELECT FROM pg_catalog.pg_authid");
    expect(sanitizePublicErrorMessage(sqlTraceError, "Safe fallback error")).toBe(
      "Safe fallback error",
    );
  });

  it("blocks open-redirect payloads and permits only safe internal paths", () => {
    expect(sanitizeRedirectPath("//evil.attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("https://evil.attacker.com/login")).toBe("/dashboard");
    expect(sanitizeRedirectPath("http://evil.attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeRedirectPath("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/dashboard");

    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/practice/two-sum-lookup")).toBe("/practice/two-sum-lookup");
    expect(sanitizeRedirectPath("/courses/python-programming-foundations")).toBe(
      "/courses/python-programming-foundations",
    );
  });

  it("enforces strict file upload validation (.txt/.md, MIME, size <= 100KB, no null bytes)", () => {
    expect(
      validateResumeFilePayload({
        fileName: "exploit.html",
        mimeType: "text/html",
        sizeBytes: 120,
        content: "<script>alert(1)</script>",
      }).valid,
    ).toBe(false);

    expect(
      validateResumeFilePayload({
        fileName: "oversized.txt",
        mimeType: "text/plain",
        sizeBytes: 150 * 1024,
        content: "A".repeat(100),
      }).valid,
    ).toBe(false);

    expect(
      validateResumeFilePayload({
        fileName: "binary.txt",
        mimeType: "text/plain",
        sizeBytes: 64,
        content: "Resume\0BinaryNullBytePayload",
      }).valid,
    ).toBe(false);

    const validMd = validateResumeFilePayload({
      fileName: "resume.md",
      mimeType: "text/markdown",
      sizeBytes: 512,
      content: "# Engineering Resume\n- Built Python and PostgreSQL services.",
    });
    expect(validMd.valid).toBe(true);
    expect(validMd.sanitizedContent).toContain("Engineering Resume");
  });
});

describe("Security Audit Suite — Server-Function Authentication & IDOR Authorization", () => {
  it("rejects missing, non-Bearer, or malformed Authorization headers", () => {
    expect(() => extractBearerToken(undefined)).toThrow(/No authorization header/i);
    expect(() => extractBearerToken("")).toThrow(/No authorization header/i);
    expect(() => extractBearerToken("Basic dXNlcjpwYXNz")).toThrow(
      /Only Bearer tokens are supported/i,
    );
    expect(() => extractBearerToken("Bearer short")).toThrow(/Malformed bearer token/i);
    expect(() => extractBearerToken("Bearer token with spaces")).toThrow(/Malformed bearer token/i);
  });

  it("rejects unverified or missing-config token verification server-side", async () => {
    await expect(
      verifySupabaseBearerToken("Bearer valid_looking_token_1234567890", {}),
    ).rejects.toThrow(/Server configuration error/i);
  });

  it("enforces server-side caller identity and blocks cross-user IDOR attempts", () => {
    expect(() => authorizeServerOperation(undefined)).toThrow(/Unauthorized/i);
    expect(() => authorizeServerOperation("")).toThrow(/Unauthorized/i);

    const userA = "00000000-0000-4000-a000-000000000001";
    const userB = "00000000-0000-4000-a000-000000000002";

    expect(() => authorizeServerOperation(userA, userB)).toThrow(/Forbidden/i);
    expect(authorizeServerOperation(userA, userA)).toBe(userA);
    expect(authorizeServerOperation(userA)).toBe(userA);
  });
});

describe("Security Audit Suite — Production Data Integrity & False-Success Prevention", () => {
  beforeEach(() => {
    resetLocalStateForTesting();
    resetServerRateLimitsForTesting();
  });

  afterEach(() => {
    setForceProductionModeForTesting(false);
    resetLocalStateForTesting();
  });

  it("disables local mock persistence in production mode and rejects failed Supabase writes instead of reporting false success", async () => {
    // Enable strict production mode (no local fallback allowed)
    setForceProductionModeForTesting(true);
    expect(isLocalFallbackAllowed()).toBe(false);
    expect(isServerTestFallbackAllowed({ NODE_ENV: "production" })).toBe(false);

    // 1. Auth operations must fail when Supabase is unreachable in production — never create a local mock account
    await expect(
      registerUser({
        fullName: "Prod Learner",
        email: "prod@bucklabs.ai",
        password: "StrongPassword123!",
      }),
    ).rejects.toThrow(/Unable to reach the authentication service|fetch|Failed/i);

    await expect(
      signInUser({
        email: "prod@bucklabs.ai",
        password: "StrongPassword123!",
      }),
    ).rejects.toThrow(/Authentication service is unreachable|Invalid|fetch/i);

    // 2. Unauthenticated or failed write operations in production must reject and never write to localStorage
    await expect(
      enrollInCourse("00000000-0000-4000-a000-000000000001", "python-programming-foundations"),
    ).rejects.toThrow(/Unauthorized/i);

    await expect(
      toggleCourseModuleCompletion(
        "00000000-0000-4000-a000-000000000001",
        "python-programming-foundations",
        "py-mod-1",
      ),
    ).rejects.toThrow(/Unauthorized/i);

    await expect(
      toggleProblemBookmark("00000000-0000-4000-a000-000000000001", "two-sum-lookup"),
    ).rejects.toThrow(/Unauthorized/i);

    await expect(
      upsertPracticeAttempt("00000000-0000-4000-a000-000000000001", {
        problemId: "two-sum-lookup",
        status: "solved",
        notes: "Should not persist",
      }),
    ).rejects.toThrow(/Unauthorized/i);

    await expect(
      updateLearnerProfile("00000000-0000-4000-a000-000000000001", {
        displayName: "Prod User",
        learningLevel: "Intermediate",
        primaryGoal: "Master data structures and algorithms",
        preferredLanguage: "Python",
        areasOfInterest: ["Data Structures and Algorithms"],
      }),
    ).rejects.toThrow(/Unauthorized/i);

    // 3. Public forms in production mode must reject when Supabase persistence fails or is unavailable
    await expect(
      processContactSubmission(
        {
          name: "Prod Visitor",
          email: "visitor@bucklabs.ai",
          topic: "General Inquiry",
          message: "Testing that production mode never fakes a contact submission success.",
          honeypot: "",
        },
        { NODE_ENV: "production" },
      ),
    ).rejects.toThrow(/unavailable|Could not persist/i);

    await expect(
      processNewsletterSubscription(
        {
          email: "visitor@bucklabs.ai",
          honeypot: "",
        },
        { NODE_ENV: "production" },
      ),
    ).rejects.toThrow(/unavailable|Could not save/i);
  });

  it("blocks honeypot spam submissions and enforces rate limits on contact and newsletter workflows", async () => {
    // Honeypot filled by bot must be rejected
    await expect(
      processContactSubmission(
        {
          name: "Spam Bot",
          email: "bot@spam.example",
          topic: "General Inquiry",
          message: "Buy cheap followers now!",
          honeypot: "https://spam-link.example",
        },
        { NODE_ENV: "test", VITEST: "true" },
      ),
    ).rejects.toThrow(/spam/i);

    await expect(
      processNewsletterSubscription(
        {
          email: "bot@spam.example",
          honeypot: "filled-by-bot",
        },
        { NODE_ENV: "test", VITEST: "true" },
      ),
    ).rejects.toThrow(/spam/i);

    // Rate limiting: 5 allowed, 6th rejected
    for (let i = 1; i <= 5; i++) {
      const res = await processNewsletterSubscription(
        { email: "ratelimit@bucklabs.edu", honeypot: "" },
        { NODE_ENV: "test", VITEST: "true" },
      );
      expect(res.status).toBe("subscribed");
      if (i > 1) {
        expect(res.alreadySubscribed).toBe(true);
      }
    }

    await expect(
      processNewsletterSubscription(
        { email: "ratelimit@bucklabs.edu", honeypot: "" },
        { NODE_ENV: "test", VITEST: "true" },
      ),
    ).rejects.toThrow(/Too many subscription attempts/i);
  });
});

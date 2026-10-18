export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  securityViolations: string[];
  supabaseUrl: string | null;
  hasPublishableKey: boolean;
  hasServiceRoleKey: boolean;
  hasOpenAiKey: boolean;
  nodeEnv: string;
}

/**
 * Redacts JWTs, Bearer tokens, API keys, database connection strings, and passwords
 * from log output or error messages so secrets and credentials are never disclosed.
 */
export function redactSensitiveData(input: unknown): string {
  const raw =
    input instanceof Error
      ? `${input.name}: ${input.message}`
      : typeof input === "string"
        ? input
        : JSON.stringify(input ?? "");

  return raw
    .replace(/eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g, "[REDACTED_JWT]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/\b(sb_secret_|sb_publishable_|sbp_|sk-)[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_API_KEY]")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgresql://[REDACTED_DB_URI]")
    .replace(
      /("?(?:password|secret|token|service_role_key|api_key)"?\s*[:=]\s*"?)([^"&,\s}]+)/gi,
      "$1[REDACTED]",
    );
}

/**
 * Produces a safe, user-facing error message with secrets, tokens, and internal stack traces stripped.
 */
export function sanitizePublicErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string {
  if (!error) return fallback;
  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : fallback;

  const redacted = redactSensitiveData(rawMessage)
    .replace(/^Error:\s*/i, "")
    .trim();
  if (!redacted) return fallback;

  // Never leak raw SQL / Postgres internal driver traces to browser clients
  if (/pg_catalog|syntax error at or near|stack trace|ECONNREFUSED\s+\d+\.\d+/i.test(redacted)) {
    return fallback;
  }

  return redacted;
}

/**
 * Validates required server/SSR environment variables without printing secret values.
 */
export function validateServerEnv(
  env: Record<string, string | undefined> = process.env,
): EnvValidationResult {
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim() || null;
  const publishableKey = (
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();
  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const openAiKey = (env.OPENAI_API_KEY || "").trim();

  const missing: string[] = [];
  const securityViolations: string[] = [];

  if (!supabaseUrl) {
    missing.push("SUPABASE_URL (or VITE_SUPABASE_URL)");
  } else {
    try {
      const parsed = new URL(supabaseUrl);
      const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      if (parsed.protocol !== "https:" && !isLocal) {
        securityViolations.push("SUPABASE_URL must use https:// in non-local environments.");
      }
    } catch {
      securityViolations.push("SUPABASE_URL is not a valid URL.");
    }
  }

  if (!publishableKey) {
    missing.push("SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)");
  }

  // Ensure no VITE_ public variable accidentally exposes a privileged secret key
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("VITE_") || !value) continue;
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("service_role") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("openai") ||
      lowerKey.includes("private") ||
      value.startsWith("sb_secret_") ||
      value.startsWith("sk-") ||
      value.startsWith("sbp_")
    ) {
      securityViolations.push(
        `Privileged credential detected in client-visible environment variable: ${key}`,
      );
    }
  }

  return {
    valid: missing.length === 0 && securityViolations.length === 0,
    missing,
    securityViolations,
    supabaseUrl,
    hasPublishableKey: publishableKey.length > 0,
    hasServiceRoleKey: serviceRoleKey.length > 0,
    hasOpenAiKey: openAiKey.length > 0,
    nodeEnv: env.NODE_ENV ?? "development",
  };
}

export function getServerConfig() {
  const validation = validateServerEnv(process.env);
  return {
    nodeEnv: validation.nodeEnv,
    supabaseUrl: validation.supabaseUrl,
    hasPublishableKey: validation.hasPublishableKey,
    hasServiceRoleKey: validation.hasServiceRoleKey,
    hasOpenAiKey: validation.hasOpenAiKey,
    aiModelId: process.env.AI_MODEL_ID || "gpt-4o-mini",
    envValid: validation.valid,
    missingEnvVars: validation.missing,
    securityViolations: validation.securityViolations,
  };
}

import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface VerifiedAuthContext {
  supabase: SupabaseClient<Database>;
  userId: string;
  email: string | null;
  claims: Record<string, unknown>;
}

/**
 * Extracts and validates the Bearer token from an Authorization header value.
 * Rejects missing headers, non-Bearer schemes, empty tokens, or tokens with invalid structure.
 */
export function extractBearerToken(authHeader: string | null | undefined): string {
  if (!authHeader || typeof authHeader !== "string") {
    throw new Error("Unauthorized: No authorization header provided");
  }
  const trimmed = authHeader.trim();
  if (!trimmed.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Only Bearer tokens are supported");
  }
  const token = trimmed.slice("Bearer ".length).trim();
  if (!token || token.length < 16 || /\s/.test(token)) {
    throw new Error("Unauthorized: Malformed bearer token");
  }
  return token;
}

/**
 * Validates a Supabase JWT server-side using Supabase Auth (`getClaims` / `getUser`)
 * and derives the caller's `userId` strictly from verified token claims.
 */
export async function verifySupabaseBearerToken(
  authHeader: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): Promise<VerifiedAuthContext> {
  const SUPABASE_URL = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
  const SUPABASE_PUBLISHABLE_KEY = (
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Server configuration error: Missing ${missing.join(", ")}`);
  }

  const token = extractBearerToken(authHeader);

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    throw new Error("Unauthorized: Invalid or expired authentication token");
  }

  const claims = data.claims as Record<string, unknown>;
  const sub = typeof claims.sub === "string" ? claims.sub.trim() : "";
  if (!sub || !UUID_REGEX.test(sub)) {
    throw new Error("Unauthorized: No valid user ID (sub) found in verified token claims");
  }

  if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) {
    throw new Error("Unauthorized: Authentication token has expired");
  }

  const email = typeof claims.email === "string" ? claims.email : null;

  return {
    supabase,
    userId: sub,
    email,
    claims,
  };
}

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    const verified = await verifySupabaseBearerToken(authHeader);

    return next({
      context: verified,
    });
  },
);

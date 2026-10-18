import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";
import { loginSchema, sanitizeRedirectPath } from "@/lib/validation";
import { getLearnerProfile, signInUser } from "@/services/platform-store";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign in — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Sign in to your BUCKLABS AI account to continue your learning paths and coding practice.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const user = await signInUser(parsed.data);
      const profile = await getLearnerProfile(user.id);
      toast.success(`Welcome back, ${profile.displayName || user.fullName}.`);
      if (!profile.onboardingCompleted) {
        navigate({ to: "/profile" });
      } else {
        const safeTarget = sanitizeRedirectPath(search.redirect, "/dashboard");
        navigate({ to: safeTarget });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to sign in with those credentials.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      subtitle="Authenticated Workspace"
      title="Welcome back."
      footer={
        <>
          New to BUCKLABS AI?{" "}
          <Link to="/register" className="text-accent font-bold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/15 ring-1 ring-destructive/40 text-xs text-red-200"
          >
            {errorMsg}
          </div>
        )}
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@university.edu"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

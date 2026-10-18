import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";
import { registerSchema } from "@/lib/validation";
import { registerUser } from "@/services/platform-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Register for BUCKLABS AI to track learning paths, coding practice, and career readiness.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (result.requiresEmailConfirmation) {
        toast.success(
          "Account created. Please check your email to confirm your address before signing in.",
        );
        navigate({ to: "/login" });
      } else {
        toast.success("Account created! Complete your quick learner onboarding.");
        navigate({ to: "/profile" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create account.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      subtitle="Controlled Beta Registration"
      title="Create your account."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Sign in
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
          label="Full name"
          name="fullName"
          required
          autoComplete="name"
          placeholder="Aarav Sharma"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@university.edu"
        />
        <AuthField
          label="Password (min 8 characters)"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

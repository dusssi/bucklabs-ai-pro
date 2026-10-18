import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";
import { forgotPasswordSchema } from "@/lib/validation";
import { requestPasswordReset } from "@/services/platform-store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset Password — BUCKLABS AI" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSentTo(parsed.data.email);
      toast.success("Password recovery instructions sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      subtitle="Account Recovery"
      title="Forgot password?"
      footer={
        <Link to="/login" className="text-accent font-bold hover:underline">
          &larr; Back to sign in
        </Link>
      }
    >
      {sentTo ? (
        <div className="space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200">
            If an account exists for <strong>{sentTo}</strong>, a password reset link has been
            dispatched.
          </div>
          <p className="text-xs text-muted-foreground">
            You can also proceed directly to{" "}
            <Link to="/reset-password" className="text-accent underline">
              set a new password
            </Link>{" "}
            if you have an active session.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AuthField
            label="Account Email"
            name="email"
            type="email"
            required
            placeholder="name@university.edu"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";
import { resetPasswordSchema } from "@/lib/validation";
import { updateUserPassword } from "@/services/platform-store";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — BUCKLABS AI" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(parsed.data.password);
      toast.success("Password updated successfully.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      subtitle="Security Update"
      title="Set a new password."
      footer={
        <Link to="/login" className="text-accent font-bold hover:underline">
          &larr; Return to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthField
          label="New password"
          name="password"
          type="password"
          required
          placeholder="At least 8 characters"
        />
        <AuthField
          label="Confirm password"
          name="confirm"
          type="password"
          required
          placeholder="Repeat new password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}

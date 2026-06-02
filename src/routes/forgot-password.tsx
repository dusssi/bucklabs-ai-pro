import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — BUCKLABS" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const parsed = z.string().email().max(255).safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email for a reset link.");
  };
  return (
    <AuthShell
      subtitle="Reset"
      title="Forgot password?"
      footer={<><Link to="/login" className="text-accent font-bold hover:underline">Back to sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="Email" name="email" type="email" required />
        <button disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-60">
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
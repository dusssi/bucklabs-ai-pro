import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — BUCKLABS" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = z
      .object({ password: z.string().min(8).max(72), confirm: z.string() })
      .refine((d) => d.password === d.confirm, { message: "Passwords don't match" })
      .safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/login" });
  };
  return (
    <AuthShell subtitle="Reset" title="Set a new password." footer={null}>
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="New password" name="password" type="password" required />
        <AuthField label="Confirm password" name="confirm" type="password" required />
        <button disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-60">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthField } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BUCKLABS" },
      { name: "description", content: "Sign in to continue learning on BUCKLABS." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error("Enter a valid email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell
      subtitle="Sign in"
      title="Welcome back."
      footer={
        <>
          New to BUCKLABS?{" "}
          <Link to="/register" className="text-accent font-bold hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="Email" name="email" type="email" required placeholder="name@student.edu" />
        <AuthField label="Password" name="password" type="password" required />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
        </div>
        <button
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
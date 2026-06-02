import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BUCKLABS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(data.user.email ?? null);
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <section className="pt-16 pb-12 max-w-7xl mx-auto px-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent block mb-3">Welcome back</span>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[0.9]">
          Hi, <span className="text-accent">{email}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">Your learning dashboard is just getting started. Continue where you left off.</p>
      </section>
      <section className="pb-24 max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {courses.slice(0, 3).map((c) => (
          <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="bg-card rounded-2xl ring-1 ring-white/5 hover:ring-accent/40 transition-all p-6">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">{c.category}</span>
            <h3 className="font-display text-2xl mt-3 mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{c.description}</p>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${Math.max(c.progress, 10)}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{c.progress}% complete</p>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
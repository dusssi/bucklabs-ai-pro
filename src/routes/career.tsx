import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career Hub — BUCKLABS" },
      { name: "description", content: "AI Resume & LinkedIn analyzer, mock interviews, and career roadmaps." },
      { property: "og:title", content: "Career Hub — BUCKLABS" },
      { property: "og:description", content: "Career tools for the AI era." },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <section className="pt-24 pb-16 max-w-5xl mx-auto px-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Launchpad</span>
        <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.9]">Career <span className="text-accent">Hub</span></h1>
        <p className="mt-8 text-lg text-muted-foreground max-w-2xl">
          We don't just teach you to code; we prepare you for the interview room.
        </p>
      </section>
      <section className="pb-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        {[
          { t: "AI Resume Analyzer", d: "ATS scoring, keyword optimization, and rewritten bullet points tailored to target roles." },
          { t: "LinkedIn Profile Review", d: "Headline, About, and Skills suggestions calibrated to recruiter search behavior." },
          { t: "Mock Interview Engine", d: "Technical, HR, behavioral, DSA, web, ML, and data science interviews with feedback." },
          { t: "Career Roadmaps", d: "Full Stack, AI/ML, Data Science, Cybersecurity, and Cloud — step by step." },
          { t: "Skill Gap Analysis", d: "Compare your current skills to a target role and get a personalized plan." },
          { t: "Interview Report", d: "Scores across technical, communication, confidence, and problem solving." },
        ].map((f) => (
          <div key={f.t} className="bg-card rounded-2xl ring-1 ring-white/5 p-8 hover:ring-accent/40 transition-all">
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4 block">Module</span>
            <h3 className="font-display text-2xl mb-3">{f.t}</h3>
            <p className="text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
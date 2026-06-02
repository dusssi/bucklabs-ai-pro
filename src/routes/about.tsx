import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BUCKLABS" },
      { name: "description", content: "BUCKLABS is the career operating system for the next generation of engineers." },
      { property: "og:title", content: "About — BUCKLABS" },
      { property: "og:description", content: "Our mission: make every student job-ready." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <section className="pt-24 pb-24 max-w-3xl mx-auto px-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">About</span>
        <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.9]">Built for the next generation.</h1>
        <div className="mt-12 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>BUCKLABS is an AI-powered learning and career development platform for MCA, BCA, and Engineering students.</p>
          <p>We combine structured course learning, an AI Tutor that understands your lesson context, auto-generated notes and flashcards, dynamic quizzes, and AI mock interviews — wrapped with a Career Hub that helps you actually land the role.</p>
          <p>Our goal: a single platform that takes a student from concept to confident professional.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
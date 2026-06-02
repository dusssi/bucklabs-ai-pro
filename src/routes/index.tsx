import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BUCKLABS — Accelerate Your Career with AI Learning" },
      { name: "description", content: "AI-powered learning, mock interviews, and career tools for MCA, BCA, and Engineering students." },
      { property: "og:title", content: "BUCKLABS — Accelerate Your Career" },
      { property: "og:description", content: "AI-powered learning, mock interviews, and career tools for students." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = courses.slice(0, 3);
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent mb-6 block animate-fade-up">
            Engineering Tomorrow
          </span>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.85] mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
            ACCELERATE <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>YOUR CAREER</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty animate-fade-up" style={{ animationDelay: "200ms" }}>
            AI-powered learning designed for the next generation of engineers, developers, and data scientists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "300ms" }}>
            <Link to="/courses" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform">
              Explore Courses
            </Link>
            <Link to="/register" className="px-8 py-4 bg-card ring-1 ring-white/10 text-foreground rounded-xl font-bold hover:bg-white/5 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-4xl mb-2">Featured Pathways</h2>
            <p className="text-muted-foreground">Master in-demand technologies with expert guidance.</p>
          </div>
          <Link to="/courses" className="font-mono text-xs text-accent border-b border-accent pb-1">
            View All Pathways
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featured.map((c) => (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="group relative bg-card rounded-2xl overflow-hidden ring-1 ring-white/5 hover:ring-accent/40 transition-all">
              <div className="w-full aspect-video bg-background grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                <span className="relative text-[10px] uppercase tracking-widest text-muted-foreground">{c.category}</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[10px] font-mono">{c.category}</span>
                  <span className="text-muted-foreground text-xs">{c.duration}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{c.description}</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${Math.max(c.progress, 20)}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="font-display text-4xl mb-12">Learning Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Full Stack", "AI / ML", "Data Science", "Security", "Cloud"].map((cat) => (
            <div key={cat} className="aspect-square bg-card rounded-2xl ring-1 ring-white/5 hover:ring-accent/40 transition-all p-6 flex flex-col justify-between">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Track</span>
              <span className="font-display text-2xl leading-tight">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Tutor Section */}
      <section className="py-24 bg-card/50 border-y border-white/5 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square bg-background rounded-3xl ring-1 ring-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 opacity-60" />
              <div className="absolute left-0 w-full h-1 bg-accent shadow-[0_0_20px_#a78bfa] animate-scanner" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-6xl text-foreground/30">AI</span>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="font-display text-5xl">
              AI TUTOR: <br />
              <span className="text-accent">SMARTER</span> LEARNING
            </h2>
            <div className="space-y-6">
              {[
                { n: "01", t: "Context-Aware Tutoring", d: "Our AI understands your code snippets and provides instant corrections." },
                { n: "02", t: "Dynamic Flashcards", d: "Automatically generated review decks based on your weakest concepts." },
                { n: "03", t: "Mock Interview Engine", d: "Practice with AI role-players simulating top-tier tech interviews." },
              ].map((f) => (
                <div key={f.n} className="flex gap-4">
                  <div className="size-10 shrink-0 bg-primary/20 rounded-lg flex items-center justify-center text-accent font-bold font-mono">
                    {f.n}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{f.t}</h4>
                    <p className="text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career Hub teaser */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Resume Analyzer", d: "ATS-grade scoring and rewrite suggestions powered by AI." },
            { t: "LinkedIn Review", d: "Headline, skills, and summary optimization for recruiters." },
            { t: "Career Roadmaps", d: "Step-by-step paths into Full Stack, AI/ML, Cloud, and more." },
          ].map((f) => (
            <div key={f.t} className="bg-card rounded-2xl ring-1 ring-white/5 p-8 hover:ring-accent/40 transition-all">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4 block">Career Hub</span>
              <h3 className="font-display text-2xl mb-3">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/career" className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform">
            Visit Career Hub
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-card/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-4xl mb-12">Student Voices</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: "The AI Tutor helped me debug a complex state issue in minutes.", n: "Arjun Mehta", r: "SDE at a Fintech" },
              { q: "Went from confusing BCA curriculum to a Cloud Engineering role.", n: "Sanya Khan", r: "Cloud Architect Apprentice" },
              { q: "AI Notes saves me at least 10 hours a week on study prep.", n: "Rahul Verma", r: "3rd Year Engineering" },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl bg-background p-8 ring-1 ring-white/5">
                <p className="text-sm italic leading-relaxed text-foreground/80">"{t.q}"</p>
                <div className="mt-8">
                  <p className="text-sm font-bold">{t.n}</p>
                  <p className="text-xs text-muted-foreground">{t.r}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="font-display text-4xl mb-12 text-center">Frequently Asked</h2>
        <div className="space-y-4">
          {[
            { q: "Who is BUCKLABS for?", a: "MCA, BCA, and Engineering students plus early-career job seekers preparing for tech roles." },
            { q: "Is there a free plan?", a: "Yes — start with our free tier to explore selected lessons and one mock interview per week." },
            { q: "Do I get a certificate?", a: "Yes. Complete a course to earn a verifiable certificate of completion." },
            { q: "What makes the AI Tutor different?", a: "It understands your current lesson context and personalizes explanations, flashcards, and quizzes." },
          ].map((f) => (
            <details key={f.q} className="group rounded-xl bg-card ring-1 ring-white/5 p-6 open:ring-accent/40 transition-all">
              <summary className="cursor-pointer font-bold text-foreground flex justify-between items-center">
                {f.q}
                <span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

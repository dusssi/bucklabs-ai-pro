import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — BUCKLABS" },
      { name: "description", content: "Browse curated courses in Full Stack, AI/ML, Data Science, Cloud, and Security." },
      { property: "og:title", content: "Courses — BUCKLABS" },
      { property: "og:description", content: "Curated learning pathways for technical roles." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <section className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Catalog</span>
        <h1 className="font-display text-6xl md:text-7xl tracking-tight leading-[0.9]">All Courses</h1>
        <p className="mt-6 text-muted-foreground max-w-2xl">
          Hand-picked, project-driven pathways that map directly to current hiring demand.
        </p>
      </section>
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="group relative bg-card rounded-2xl overflow-hidden ring-1 ring-white/5 hover:ring-accent/40 transition-all">
              <div className="w-full aspect-video bg-background relative overflow-hidden grid place-items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                <span className="relative text-[10px] uppercase tracking-widest text-muted-foreground">{c.category}</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[10px] font-mono">{c.level}</span>
                  <span className="text-muted-foreground text-xs">{c.duration}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
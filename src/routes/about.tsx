import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BUCKLABS AI" },
      {
        name: "description",
        content:
          "BUCKLABS AI is an integrated learning, coding-practice, and career-development platform for MCA, BCA, and engineering students.",
      },
      { property: "og:title", content: "About — BUCKLABS AI" },
      {
        property: "og:description",
        content: "Learn with direction. Practice with purpose. Build career-ready skills.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <main className="pt-20 pb-24 max-w-4xl mx-auto px-6 space-y-12">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent mb-3 block">
            Product Mission &amp; Principles
          </span>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.92]">
            Built for learners who want direction, practice, and measurable progress.
          </h1>
        </div>

        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
          <p>
            Students and aspiring software developers often jump between separate websites for video
            courses, coding problem catalogues, notes, and interview preparation—losing track of how
            concepts connect to real engineering skills.
          </p>
          <p>
            <strong className="text-foreground">BUCKLABS AI</strong> bridges that fragmentation
            through one connected workflow:{" "}
            <strong className="text-accent">
              Learn &rarr; Practice &rarr; Build Skills &rarr; Assess Progress &rarr; Prepare for
              Careers
            </strong>
            .
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "1. Functionality Before Decoration",
              body: "Every action on BUCKLABS AI—from enrolling in a course module to bookmarking a problem or analyzing skill gaps—is backed by real validation and persistence.",
            },
            {
              title: "2. Learning Through Practice",
              body: "Conceptual modules connect directly to topic-tagged coding problems so learners apply data structures and system design concepts immediately.",
            },
            {
              title: "3. Trust Through Transparency",
              body: "We clearly attribute canonical external problem hosts (LeetCode, HackerRank, Codeforces), label AI-assisted explanations, and distinguish self-reported progress from external judge submissions.",
            },
            {
              title: "4. Privacy & Security by Design",
              body: "Learner profiles, enrollments, bookmarks, and notes are protected by Row-Level Security so only you can access or modify your records.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-2"
            >
              <h2 className="font-bold text-base text-foreground">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 ring-1 ring-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Ready to begin?</h2>
            <p className="text-sm text-muted-foreground">
              Explore our structured learning paths or jump into the coding practice catalogue.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/learning"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Explore Learning Paths
            </Link>
            <Link
              to="/practice"
              className="px-6 py-3 rounded-xl bg-background ring-1 ring-white/10 text-xs font-semibold"
            >
              Coding Practice
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

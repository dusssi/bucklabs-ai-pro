import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  ExternalLink,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { courses } from "@/data/courses";
import { learningPaths } from "@/data/learning-paths";
import { practiceProblems } from "@/data/practice-problems";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "BUCKLABS AI — Learn with Direction, Practice with Purpose, Build Career-Ready Skills",
      },
      {
        name: "description",
        content:
          "Integrated learning paths, source-linked coding practice, progress tracking, AI-assisted tutoring, and career preparation for MCA, BCA, and engineering students.",
      },
      {
        property: "og:title",
        content: "BUCKLABS AI — Learning, Coding Practice & Career Platform",
      },
      {
        property: "og:description",
        content:
          "Learn with direction. Practice with purpose. Build career-ready software engineering and AI/ML skills.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const featuredCourses = courses.slice(0, 3);
  const featuredProblems = practiceProblems.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-24 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[130px] rounded-full opacity-45 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card ring-1 ring-white/10 text-xs font-mono text-accent mb-6">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Controlled Beta · Connected Learning-to-Career Platform</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.92] mb-6">
            LEARN WITH DIRECTION. <span className="text-accent">PRACTICE WITH PURPOSE.</span> BUILD
            CAREER-READY SKILLS.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            BUCKLABS AI connects structured computer science learning paths, curated coding practice
            linked to canonical problem platforms, persistent progress tracking, AI-guided hints,
            and role-readiness analysis in one unified workspace for MCA, BCA, and engineering
            learners.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/learning"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              <span>Start Learning</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card ring-1 ring-white/15 text-foreground rounded-xl font-bold hover:bg-white/5 transition-colors"
            >
              <Code2 className="size-4 text-accent" />
              <span>Explore Coding Practice</span>
            </Link>
          </div>

          {/* Connected Workflow Pillars */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-3 text-left">
            {[
              {
                step: "01",
                title: "Learn",
                desc: "Structured paths & modular courses",
              },
              {
                step: "02",
                title: "Practice",
                desc: "Topic-tagged DSA & system problems",
              },
              {
                step: "03",
                title: "Get Unstuck",
                desc: "Progressive AI hints & complexity checks",
              },
              {
                step: "04",
                title: "Assess Progress",
                desc: "Persisted topic & path tracking",
              },
              {
                step: "05",
                title: "Career Prep",
                desc: "Role roadmaps & skill-gap analysis",
              },
            ].map((item) => (
              <div key={item.step} className="bg-card/80 rounded-xl p-4 ring-1 ring-white/10">
                <span className="font-mono text-xs text-accent block mb-1">Step {item.step}</span>
                <p className="font-bold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Learning Paths */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
              Guided Roadmaps
            </span>
            <h2 className="font-display text-4xl sm:text-5xl">Structured Learning Paths</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
              Follow a sequenced curriculum that pairs conceptual modules directly with curated
              coding problems.
            </p>
          </div>
          <Link
            to="/learning"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
          >
            <span>View All {learningPaths.length} Learning Paths</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <Link
              key={path.id}
              to="/learning/$pathId"
              params={{ pathId: path.id }}
              className="group bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 hover:ring-accent/40 transition-all flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono">
                    {path.difficulty}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {path.estimatedDuration} · {path.courseIds.length} Courses ·{" "}
                    {path.problemIds.length} Problems
                  </span>
                </div>
                <h3 className="text-2xl font-bold group-hover:text-accent transition-colors">
                  {path.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Target Role: <strong className="text-foreground">{path.targetRole}</strong>
                </span>
                <span className="font-mono text-accent inline-flex items-center gap-1">
                  Explore Path <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Coding Practice Preview */}
      <section className="py-20 bg-card/40 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
                Learn Through Practice
              </span>
              <h2 className="font-display text-4xl sm:text-5xl">
                Curated Coding Practice Catalogue
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                Filter across 16 core DSA topics, study original learning objectives and complexity
                breakdowns, track your revision status, and solve on canonical platforms like
                LeetCode, HackerRank, and Codeforces.
              </p>
            </div>
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
            >
              <span>Browse All {practiceProblems.length} Problems</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-background rounded-2xl p-6 ring-1 ring-white/10 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-accent/15 text-accent">
                      {problem.difficulty}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Source: {problem.source}
                    </span>
                  </div>
                  <Link
                    to="/practice/$problemId"
                    params={{ problemId: problem.id }}
                    className="hover:text-accent transition-colors"
                  >
                    <h3 className="text-lg font-bold">{problem.title}</h3>
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">{problem.learningObjective}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {problem.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-card text-xs font-mono text-muted-foreground ring-1 ring-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link
                    to="/practice/$problemId"
                    params={{ problemId: problem.id }}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View Study Guide &rarr;
                  </Link>
                  <a
                    href={problem.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
                  >
                    <span>{problem.source}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
              Modular Curriculum
            </span>
            <h2 className="font-display text-4xl sm:text-5xl">Featured Courses</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Enroll to track module-by-module completion and jump straight to linked coding
              exercises.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
          >
            <span>Browse All {courses.length} Courses</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <Link
              key={course.id}
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              className="group bg-card rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-2.5 py-1 rounded bg-accent/15 text-accent text-xs font-mono">
                    {course.category}
                  </span>
                  <span className="text-muted-foreground text-xs font-mono">
                    {course.level} · {course.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">{course.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-background/60 text-xs text-muted-foreground ring-1 ring-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 bg-background/40 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {course.curriculum.length} Verified Modules · {course.relatedProblemIds.length}{" "}
                  Linked Problems
                </span>
                <span className="text-accent font-mono">Open &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Transparency: Available Now vs Planned */}
      <section className="py-20 bg-card/40 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
              Trust Through Transparency
            </span>
            <h2 className="font-display text-4xl sm:text-5xl">
              What Works Today vs. What Is Planned Next
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Every capability on BUCKLABS AI is clearly distinguished between operational beta
              features, attributed external problem integrations, and upcoming Phase 2 expansions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-2xl p-6 ring-1 ring-emerald-500/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-mono mb-4">
                <CheckCircle2 className="size-3.5" />
                <span>Operational in Beta</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Core Learning & Practice</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>&bull; Account registration, login, recovery &amp; onboarding</li>
                <li>&bull; 4 structured learning paths &amp; 8 modular courses</li>
                <li>&bull; Module-level enrollment &amp; real progress tracking</li>
                <li>&bull; 20 curated problems across 16 DSA topics</li>
                <li>&bull; Persistent bookmarks, self-reported status &amp; notes</li>
                <li>&bull; AI Practice Tutor (Hints, Concepts, Debugging, Revision)</li>
                <li>&bull; Role Skill-Gap &amp; Resume Keyword Evaluator</li>
              </ul>
            </div>

            <div className="bg-background rounded-2xl p-6 ring-1 ring-sky-500/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 text-xs font-mono mb-4">
                <ExternalLink className="size-3.5" />
                <span>External Integrations</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Attributed Canonical Judges</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>&bull; Direct canonical links to LeetCode, HackerRank &amp; Codeforces</li>
                <li>&bull; Full source attribution on every problem card &amp; view</li>
                <li>&bull; Original BUCKLABS learning objectives, hints &amp; complexity notes</li>
                <li>
                  &bull; Clear separation between user-reported status and external judge
                  verification
                </li>
              </ul>
            </div>

            <div className="bg-background rounded-2xl p-6 ring-1 ring-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-muted-foreground text-xs font-mono mb-4">
                <Layers className="size-3.5" />
                <span>Planned — Phase 2 (P2)</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Future Roadmap</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>&bull; Isolated sandboxed in-browser code execution &amp; test-case judge</li>
                <li>&bull; Automated OAuth submission sync with external coding platforms</li>
                <li>&bull; Real-time voice &amp; video mock interview simulations</li>
                <li>&bull; University cohort management &amp; verified certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="font-display text-4xl sm:text-5xl mb-10 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Who is BUCKLABS AI built for?",
              a: "MCA, BCA, and engineering students as well as early-career developers who want one connected workspace combining structured courses, topic-wise coding practice, and career readiness.",
            },
            {
              q: "Where do I write and submit code for practice problems?",
              a: "During the initial beta, BUCKLABS AI provides curated study guides, learning objectives, progressive hints, complexity analysis, and progress tracking, and links you directly to the canonical problem page on LeetCode, HackerRank, or Codeforces to run and submit your code.",
            },
            {
              q: "How is my progress calculated?",
              a: "Every metric on your dashboard is computed directly from your persisted course module completions, bookmarked problems, and self-reported practice statuses—never from placeholder percentages.",
            },
            {
              q: "How does the AI Practice Tutor help without spoiling solutions?",
              a: "You can choose Progressive Hint Mode, Concept Mode, or Debug Mode before viewing any approach walkthrough, helping you build independent problem-solving intuition.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl bg-card ring-1 ring-white/10 p-6 open:ring-accent/40 transition-all"
            >
              <summary className="cursor-pointer font-bold text-foreground flex justify-between items-center">
                <span>{faq.q}</span>
                <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

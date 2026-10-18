import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Code2, Compass, Target } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { calculateLearningPathProgress, learningPaths } from "@/data/learning-paths";
import { courses } from "@/data/courses";
import {
  getCurrentAuthUser,
  getUserEnrollments,
  getUserPracticeAttempts,
} from "@/services/platform-store";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning Paths — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Structured computer science, full-stack, AI/ML, and cloud security learning paths connected directly to coding practice.",
      },
    ],
  }),
  component: LearningPathsLayoutOrIndex,
});

function LearningPathsLayoutOrIndex() {
  const childMatch = useMatch({
    from: "/learning/$pathId",
    shouldThrow: false,
  });

  if (childMatch) {
    return <Outlet />;
  }

  return <LearningPathsIndexPage />;
}

function LearningPathsIndexPage() {
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await getCurrentAuthUser();
      if (!active || !user) return;
      setSignedIn(true);
      const [enrollments, attempts] = await Promise.all([
        getUserEnrollments(user.id),
        getUserPracticeAttempts(user.id),
      ]);
      if (!active) return;
      setCompletedCourseIds(
        new Set(enrollments.filter((e) => e.status === "completed").map((e) => e.courseId)),
      );
      setSolvedProblemIds(
        new Set(attempts.filter((a) => a.status === "solved").map((a) => a.problemId)),
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-3">
            Guided Curricula
          </span>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
            Structured Learning Paths
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Each learning path sequences verified courses and curated coding practice problems so
            you always know what to study next and how concepts apply to interviews and engineering
            roles.
          </p>
        </div>

        <div className="grid gap-8">
          {learningPaths.map((path) => {
            const stats = calculateLearningPathProgress(path, completedCourseIds, solvedProblemIds);
            const pathCourses = path.courseIds
              .map((cid) => courses.find((c) => c.id === cid))
              .filter(Boolean);

            return (
              <article
                key={path.id}
                className="bg-card rounded-2xl ring-1 ring-white/10 hover:ring-accent/40 transition-all p-6 sm:p-8"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono">
                        {path.difficulty}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {path.estimatedDuration}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        &bull; {path.courseIds.length} Courses &bull; {path.problemIds.length}{" "}
                        Practice Problems
                      </span>
                    </div>

                    <Link
                      to="/learning/$pathId"
                      params={{ pathId: path.id }}
                      className="inline-block hover:text-accent transition-colors"
                    >
                      <h2 className="font-display text-3xl sm:text-4xl">{path.title}</h2>
                    </Link>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {path.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="size-4 text-accent shrink-0" />
                      <span>
                        Target Role: <strong className="text-foreground">{path.targetRole}</strong>
                      </span>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {pathCourses.map(
                        (c) =>
                          c && (
                            <Link
                              key={c.id}
                              to="/courses/$courseId"
                              params={{ courseId: c.id }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/70 ring-1 ring-white/10 text-xs hover:ring-accent/40 transition-all"
                            >
                              <BookOpen className="size-3.5 text-accent" />
                              <span>{c.title}</span>
                            </Link>
                          ),
                      )}
                    </div>
                  </div>

                  <div className="lg:w-72 shrink-0 bg-background/60 rounded-xl p-5 ring-1 ring-white/10 flex flex-col justify-between gap-4">
                    {signedIn ? (
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="text-muted-foreground">Your Path Progress</span>
                          <span className="text-accent font-bold">{stats.overallPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${stats.overallPercent}%` }}
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            Courses:{" "}
                            <strong className="text-foreground">
                              {stats.completedCourses}/{stats.totalCourses}
                            </strong>
                          </div>
                          <div>
                            Problems:{" "}
                            <strong className="text-foreground">
                              {stats.solvedProblems}/{stats.totalProblems}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Sign in to track your course completions and solved practice problems along
                        this path.
                      </p>
                    )}

                    <Link
                      to="/learning/$pathId"
                      params={{ pathId: path.id }}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      <span>Open Learning Path</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

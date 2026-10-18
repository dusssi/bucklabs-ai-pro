import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Code2, ExternalLink, Target } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { calculateLearningPathProgress, getLearningPathById } from "@/data/learning-paths";
import { getCourseById } from "@/data/courses";
import { getProblemById, type PracticeStatus } from "@/data/practice-problems";
import {
  enrollInCourse,
  getCurrentAuthUser,
  getUserEnrollments,
  getUserPracticeAttempts,
  type CourseEnrollmentRecord,
} from "@/services/platform-store";
import { toast } from "sonner";

export const Route = createFileRoute("/learning/$pathId")({
  loader: ({ params }) => {
    const path = getLearningPathById(params.pathId);
    if (!path) throw notFound();
    return { path };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.path.title} — BUCKLABS AI` },
          { name: "description", content: loaderData.path.description },
        ]
      : [{ title: "Learning Path — BUCKLABS AI" }],
  }),
  component: LearningPathDetailPage,
});

function LearningPathDetailPage() {
  const { path } = Route.useLoaderData();
  const [userId, setUserId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollmentRecord>>({});
  const [problemStatuses, setProblemStatuses] = useState<Record<string, PracticeStatus>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await getCurrentAuthUser();
      if (!active || !user) return;
      setUserId(user.id);
      const [enr, att] = await Promise.all([
        getUserEnrollments(user.id),
        getUserPracticeAttempts(user.id),
      ]);
      if (!active) return;
      const enrMap: Record<string, CourseEnrollmentRecord> = {};
      for (const e of enr) enrMap[e.courseId] = e;
      setEnrollments(enrMap);

      const stMap: Record<string, PracticeStatus> = {};
      for (const a of att) stMap[a.problemId] = a.status;
      setProblemStatuses(stMap);
    })();
    return () => {
      active = false;
    };
  }, []);

  const completedCourses = new Set(
    Object.values(enrollments)
      .filter((e) => e.status === "completed")
      .map((e) => e.courseId),
  );
  const solvedProblems = new Set(
    Object.entries(problemStatuses)
      .filter(([, st]) => st === "solved")
      .map(([id]) => id),
  );
  const progress = calculateLearningPathProgress(path, completedCourses, solvedProblems);

  const pathCourses = path.courseIds
    .map((id) => getCourseById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const pathProblems = path.problemIds
    .map((id) => getProblemById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleQuickEnroll = async (courseId: string) => {
    if (!userId) {
      toast.info("Please sign in to enroll and save your course progress.");
      return;
    }
    setEnrollingId(courseId);
    try {
      const rec = await enrollInCourse(userId, courseId);
      setEnrollments((prev) => ({ ...prev, [courseId]: rec }));
      toast.success("Enrolled in course!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed.");
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-6xl mx-auto px-6 py-14 space-y-12">
        <div>
          <Link
            to="/learning"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Learning Paths</span>
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono">
              {path.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card ring-1 ring-white/10 text-xs font-mono text-muted-foreground">
              {path.estimatedDuration}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card ring-1 ring-white/10 text-xs font-mono text-muted-foreground">
              Target: {path.targetRole}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92] mt-4">
            {path.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {path.description}
          </p>
        </div>

        {/* Progress & Outcomes Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
              Verified Learning Outcomes &amp; Prerequisites
            </h2>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              {path.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-white/10 text-xs text-muted-foreground">
              <strong>Prerequisites:</strong> {path.prerequisites.join(" · ")}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 ring-1 ring-white/10 flex flex-col justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent">
                Path Progress
              </span>
              <p className="font-display text-5xl mt-2">{progress.overallPercent}%</p>
              <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progress.overallPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {progress.completedCourses} of {progress.totalCourses} courses completed &bull;{" "}
                {progress.solvedProblems} of {progress.totalProblems} problems solved
              </p>
            </div>
            {!userId && (
              <Link
                to="/login"
                className="text-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
              >
                Sign in to save progress
              </Link>
            )}
          </div>
        </div>

        {/* Step 1: Sequenced Courses */}
        <section className="space-y-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
              Phase 1 · Core Concept Courses
            </span>
            <h2 className="font-display text-3xl sm:text-4xl">Required Courses in This Path</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pathCourses.map((course, idx) => {
              const enr = enrollments[course.id];
              return (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl p-6 ring-1 ring-white/10 flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs text-accent">
                        Course 0{idx + 1} · {course.level}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {course.duration} · {course.curriculum.length} Modules
                      </span>
                    </div>
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: course.id }}
                      className="hover:text-accent transition-colors"
                    >
                      <h3 className="text-xl font-bold">{course.title}</h3>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    {enr ? (
                      <span className="text-xs font-mono text-emerald-300">
                        Enrolled · {enr.progress}% complete
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={enrollingId === course.id}
                        onClick={() => handleQuickEnroll(course.id)}
                        className="px-3.5 py-2 rounded-xl bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-colors"
                      >
                        {enrollingId === course.id ? "Enrolling..." : "Enroll in Course"}
                      </button>
                    )}
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: course.id }}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      {enr ? "Continue Course" : "View Curriculum"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Sequenced Coding Practice */}
        <section className="space-y-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
              Phase 2 · Hands-On Problem Solving
            </span>
            <h2 className="font-display text-3xl sm:text-4xl">
              Curated Practice Sequence ({pathProblems.length} Problems)
            </h2>
          </div>

          <div className="bg-card rounded-2xl ring-1 ring-white/10 divide-y divide-white/10">
            {pathProblems.map((problem, index) => {
              const status = problemStatuses[problem.id] ?? "not_started";
              return (
                <div
                  key={problem.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <Link
                        to="/practice/$problemId"
                        params={{ problemId: problem.id }}
                        className="font-bold text-foreground hover:text-accent transition-colors"
                      >
                        {problem.title}
                      </Link>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-accent/15 text-accent">
                        {problem.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-muted-foreground">
                        {problem.source}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {problem.topics.join(" · ")} — {problem.learningObjective}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono ${
                        status === "solved"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : status === "needs_revision"
                            ? "bg-amber-500/15 text-amber-300"
                            : status === "in_progress"
                              ? "bg-sky-500/15 text-sky-300"
                              : "bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </span>
                    <Link
                      to="/practice/$problemId"
                      params={{ problemId: problem.id }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold"
                    >
                      Study
                    </Link>
                    <a
                      href={problem.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      <span>Solve</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

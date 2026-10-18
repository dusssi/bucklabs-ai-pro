import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  ExternalLink,
  Layers,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCourseById } from "@/data/courses";
import { getLearningPathById } from "@/data/learning-paths";
import { getProblemById } from "@/data/practice-problems";
import {
  enrollInCourse,
  getCurrentAuthUser,
  getUserEnrollments,
  toggleCourseModuleCompletion,
  type AuthUser,
  type CourseEnrollmentRecord,
} from "@/services/platform-store";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = getCourseById(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.course.title} — BUCKLABS AI` },
          { name: "description", content: loaderData.course.description },
          { property: "og:title", content: loaderData.course.title },
          { property: "og:description", content: loaderData.course.description },
        ]
      : [{ title: "Course — BUCKLABS AI" }],
  }),
  component: CourseDetailPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-8">
      <p>Couldn't load this course: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-8 text-center">
      <div>
        <p className="font-display text-4xl mb-4">Course not found</p>
        <Link to="/courses" className="text-accent underline">
          Browse all courses
        </Link>
      </div>
    </div>
  ),
});

function CourseDetailPage() {
  const { course } = Route.useLoaderData();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollmentRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const parentPath = getLearningPathById(course.learningPathId);
  const relatedProblems = course.relatedProblemIds
    .map((pid) => getProblemById(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  useEffect(() => {
    let active = true;
    (async () => {
      const currentUser = await getCurrentAuthUser();
      if (!active) return;
      setUser(currentUser);
      if (currentUser) {
        const list = await getUserEnrollments(currentUser.id);
        if (!active) return;
        const found = list.find((e) => e.courseId === course.id) ?? null;
        setEnrollment(found);
      }
    })();
    return () => {
      active = false;
    };
  }, [course.id]);

  const handleEnroll = async () => {
    if (!user) {
      toast.info("Sign in or create an account to enroll and track your progress.");
      navigate({ to: "/login" });
      return;
    }
    setBusy(true);
    try {
      const rec = await enrollInCourse(user.id, course.id);
      setEnrollment(rec);
      toast.success(`Enrolled in "${course.title}". Select any module below as you complete it.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enroll in course.");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleModule = async (moduleId: string) => {
    if (!user) {
      toast.info("Please sign in to record module completion.");
      navigate({ to: "/login" });
      return;
    }
    setBusy(true);
    try {
      const updated = await toggleCourseModuleCompletion(user.id, course.id, moduleId);
      setEnrollment(updated);
      toast.success(`Course progress updated (${updated.progress}%).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update module.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-5xl mx-auto px-6 py-14 space-y-12">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>All Courses</span>
            </Link>
            {parentPath && (
              <>
                <span className="text-muted-foreground/50">/</span>
                <Link
                  to="/learning/$pathId"
                  params={{ pathId: parentPath.id }}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  Path: {parentPath.title}
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono">
              {course.category}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card ring-1 ring-white/10 text-muted-foreground text-xs font-mono">
              Level: {course.level}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card ring-1 ring-white/10 text-muted-foreground text-xs font-mono">
              Workload: {course.duration}
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.92] mt-4">
            {course.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {course.long}
          </p>
        </div>

        {/* Enrollment & Progress Banner */}
        <section className="bg-card rounded-2xl ring-1 ring-white/10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            {enrollment ? (
              <>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  <span>
                    {enrollment.status === "completed" ? "Course Completed" : "Active Enrollment"}
                  </span>
                </div>
                <p className="text-lg font-bold">
                  {enrollment.completedModules.length} of {course.curriculum.length} curriculum
                  modules completed ({enrollment.progress}%)
                </p>
                <div className="h-2 w-full max-w-md bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                  Start Learning
                </span>
                <p className="text-lg font-bold">
                  Enroll to track module completion and connect with practice problems
                </p>
                <p className="text-xs text-muted-foreground">
                  Instructor: <strong className="text-foreground">{course.instructor}</strong>{" "}
                  &bull; {course.curriculum.length} structured modules
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!enrollment ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleEnroll}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <PlayCircle className="size-4" />
                <span>{busy ? "Enrolling..." : "Enroll in Course"}</span>
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-xs font-semibold"
              >
                View in Dashboard &rarr;
              </Link>
            )}
          </div>
        </section>

        {/* Outcomes & Prerequisites */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
            <h2 className="font-display text-2xl">Verified Learning Outcomes</h2>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
            <h2 className="font-display text-2xl">Prerequisites &amp; Tags</h2>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {course.prerequisites.map((req) => (
                <li key={req}>&bull; {req}</li>
              ))}
            </ul>
            <div className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-background text-xs font-mono text-muted-foreground ring-1 ring-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Curriculum Modules */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                Course Syllabus
              </span>
              <h2 className="font-display text-3xl sm:text-4xl">
                Curriculum Modules ({course.curriculum.length})
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Click any module checkbox to mark it completed in your learning record.
            </p>
          </div>

          <div className="space-y-3">
            {course.curriculum.map((mod, idx) => {
              const isCompleted = enrollment?.completedModules.includes(mod.id) ?? false;
              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl p-5 ring-1 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompleted ? "bg-emerald-500/10 ring-emerald-500/30" : "bg-card ring-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleModule(mod.id)}
                      aria-label={
                        isCompleted
                          ? `Mark ${mod.title} as incomplete`
                          : `Mark ${mod.title} as completed`
                      }
                      className="mt-0.5 text-accent hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-5 text-emerald-400" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-accent">Module 0{idx + 1}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          &bull; {mod.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-0.5">{mod.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mod.topics.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-background/60 text-xs text-muted-foreground ring-1 ring-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 self-start sm:self-center ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-white/5 hover:bg-white/10 text-foreground"
                    }`}
                  >
                    {isCompleted ? "Completed ✓" : "Mark Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Coding Practice Problems */}
        {relatedProblems.length > 0 && (
          <section className="space-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                Apply What You Learn
              </span>
              <h2 className="font-display text-3xl sm:text-4xl">
                Related Coding Practice ({relatedProblems.length})
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {relatedProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="bg-card rounded-2xl p-5 ring-1 ring-white/10 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-accent/15 text-accent">
                        {problem.difficulty}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {problem.source}
                      </span>
                    </div>
                    <Link
                      to="/practice/$problemId"
                      params={{ problemId: problem.id }}
                      className="font-bold hover:text-accent transition-colors"
                    >
                      {problem.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {problem.learningObjective}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <Link
                      to="/practice/$problemId"
                      params={{ problemId: problem.id }}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Open Study Guide &rarr;
                    </Link>
                    <a
                      href={problem.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
                    >
                      <span>Solve on {problem.source}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, Code2, RotateCcw, Settings, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  getCurrentAuthUser,
  getDashboardSnapshot,
  type AuthUser,
  type DashboardSnapshot,
} from "@/services/platform-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Learner Dashboard — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Track your enrolled courses, learning paths, solved coding practice problems, bookmarks, and topic-level progress.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentAuthUser();
      if (!currentUser) {
        navigate({ to: "/login", search: { redirect: "/dashboard" } });
        return;
      }
      setUser(currentUser);
      const data = await getDashboardSnapshot(currentUser.id);
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <SiteNav />
        <main className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <div className="h-10 w-72 rounded-xl bg-card animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-card animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !snapshot || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <SiteNav />
        <main className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
          <h1 className="font-display text-4xl">Unable to Load Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {error ?? "Please sign in again to access your learning workspace."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="px-6 py-3 rounded-xl bg-card ring-1 ring-white/15 text-xs font-bold hover:bg-white/5 transition-colors"
            >
              Retry Loading Dashboard
            </button>
            <Link
              to="/login"
              search={{ redirect: "/dashboard" }}
              className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Go to Sign In
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { profile, metrics, recommendedNextStep } = snapshot;
  const revisionAttempts = snapshot.attempts.filter((a) => a.status === "needs_revision");
  const activeTopics = snapshot.topicProgress.filter(
    (t) => t.solved > 0 || t.inProgress > 0 || t.needsRevision > 0,
  );
  const displayedTopics =
    activeTopics.length > 0 ? activeTopics : snapshot.topicProgress.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome Header & Profile Summary */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent">
                Authenticated Learner Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-card ring-1 ring-white/10 text-xs font-mono text-muted-foreground">
                {profile.learningLevel} &bull; {profile.preferredLanguage}
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-[0.95]">
              Welcome back,{" "}
              <span className="text-accent">{profile.displayName || user.fullName}</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Primary Goal: <strong className="text-foreground">{profile.primaryGoal}</strong>
              {profile.targetRole ? (
                <>
                  {" "}
                  &bull; Target Role:{" "}
                  <strong className="text-foreground">{profile.targetRole}</strong>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card ring-1 ring-white/10 text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              <Settings className="size-3.5 text-accent" />
              <span>Edit Profile &amp; Goals</span>
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              <Code2 className="size-3.5" />
              <span>Practice Catalogue</span>
            </Link>
          </div>
        </section>

        {/* Recommended Next Step Banner */}
        <section className="bg-gradient-to-r from-primary/20 via-card to-card rounded-2xl p-6 sm:p-8 ring-1 ring-accent/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-accent">
              <Sparkles className="size-3.5" />
              Recommended Next Activity
            </span>
            <h2 className="text-2xl font-bold">{recommendedNextStep.title}</h2>
            <p className="text-sm text-muted-foreground">{recommendedNextStep.description}</p>
          </div>
          <Link
            to={recommendedNextStep.href}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
          >
            <span>{recommendedNextStep.ctaLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        </section>

        {/* Persisted Activity Metrics */}
        <section aria-label="Learning and practice metrics">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Verified Activity Summary
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              Practice statuses are learner-reported
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              label="Courses Enrolled"
              value={metrics.enrolledCoursesCount}
              sub={`${metrics.completedCoursesCount} completed`}
            />
            <MetricCard
              label="Modules Completed"
              value={metrics.completedModulesCount}
              sub="Verified syllabus items"
            />
            <MetricCard
              label="Problems Solved"
              value={metrics.solvedProblemsCount}
              sub="User-reported status"
              highlight="emerald"
            />
            <MetricCard
              label="In Progress"
              value={metrics.inProgressProblemsCount}
              sub="Active coding problems"
            />
            <MetricCard
              label="Needs Revision"
              value={metrics.needsRevisionProblemsCount}
              sub="Flagged for review"
              highlight="amber"
            />
            <MetricCard
              label="Bookmarks"
              value={metrics.bookmarkedProblemsCount}
              sub="Saved problems"
            />
          </div>
        </section>

        {/* Continue Learning (Enrolled Courses) + Learning Paths */}
        <div className="grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">Continue Learning</h2>
              <Link to="/courses" className="text-xs font-mono text-accent hover:underline">
                Browse All Courses &rarr;
              </Link>
            </div>

            {snapshot.enrollments.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 ring-1 ring-white/10 text-center space-y-4">
                <BookOpen className="size-8 text-accent mx-auto" />
                <h3 className="text-lg font-bold">You haven&apos;t enrolled in any courses yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start with a foundational course or structured learning path to track your module
                  completions here.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/courses"
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Explore Courses
                  </Link>
                  <Link
                    to="/learning"
                    className="px-5 py-2.5 rounded-xl bg-background ring-1 ring-white/10 text-xs font-semibold"
                  >
                    View Learning Paths
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {snapshot.enrollments.map((enr) => (
                  <Link
                    key={enr.id}
                    to="/courses/$courseId"
                    params={{ courseId: enr.courseId }}
                    className="block bg-card rounded-2xl p-6 ring-1 ring-white/10 hover:ring-accent/40 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded bg-accent/15 text-accent text-xs font-mono">
                        {enr.course.category}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {enr.completedModules.length} of {enr.course.curriculum.length} modules
                        &bull; {enr.progress}%
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{enr.course.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{enr.course.description}</p>
                    <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${enr.progress}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Structured Learning Paths Progress */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">Learning Paths</h2>
              <Link to="/learning" className="text-xs font-mono text-accent hover:underline">
                All Paths &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {snapshot.pathProgress.map((item) => (
                <Link
                  key={item.path.id}
                  to="/learning/$pathId"
                  params={{ pathId: item.path.id }}
                  className="block bg-card rounded-2xl p-5 ring-1 ring-white/10 hover:ring-accent/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm">{item.path.title}</h3>
                    <span className="font-mono text-xs text-accent font-bold">
                      {item.overallPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${item.overallPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>
                      Courses: {item.completedCourses}/{item.totalCourses}
                    </span>
                    <span>
                      Problems: {item.solvedProblems}/{item.totalProblems}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Topic-Level Progress & Bookmarks / Revision */}
        <div className="grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                  DSA Skill Matrix
                </span>
                <h2 className="font-display text-3xl">Topic-Level Progress</h2>
              </div>
              <Link to="/practice" className="text-xs font-mono text-accent hover:underline">
                Practice by Topic &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {displayedTopics.map((stat) => (
                <div
                  key={stat.topic}
                  className="p-3.5 rounded-xl bg-background/60 ring-1 ring-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{stat.topic}</span>
                    <span className="font-mono text-muted-foreground">
                      {stat.solved}/{stat.total} solved
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${stat.percentSolved}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bookmarks & Needs Revision */}
          <section className="lg:col-span-5 bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                  Saved Queue
                </span>
                <h2 className="font-display text-3xl">Bookmarks &amp; Revision</h2>
              </div>
              <Link to="/practice" className="text-xs font-mono text-accent hover:underline">
                Open Catalogue &rarr;
              </Link>
            </div>

            {snapshot.bookmarks.length === 0 && revisionAttempts.length === 0 ? (
              <div className="p-6 rounded-xl bg-background/60 ring-1 ring-white/10 text-center space-y-2">
                <Bookmark className="size-6 text-accent mx-auto" />
                <p className="text-sm font-semibold">No bookmarked or revision problems yet</p>
                <p className="text-xs text-muted-foreground">
                  Bookmark tricky problems or mark them &ldquo;Needs revision&rdquo; so you can
                  review them before interviews.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {revisionAttempts.map((att) => (
                  <Link
                    key={`rev-${att.id}`}
                    to="/practice/$problemId"
                    params={{ problemId: att.problemId }}
                    className="p-3.5 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 flex items-center justify-between gap-3 hover:bg-amber-500/15 transition-colors"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-amber-300 block">
                        Needs Revision &bull; {att.problem.difficulty}
                      </span>
                      <p className="text-sm font-bold">{att.problem.title}</p>
                    </div>
                    <RotateCcw className="size-4 text-amber-300 shrink-0" />
                  </Link>
                ))}
                {snapshot.bookmarks.map((bm) => (
                  <Link
                    key={`bm-${bm.id}`}
                    to="/practice/$problemId"
                    params={{ problemId: bm.problemId }}
                    className="p-3.5 rounded-xl bg-background/60 ring-1 ring-white/10 flex items-center justify-between gap-3 hover:ring-accent/40 transition-all"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-accent block">
                        Bookmarked &bull; {bm.problem.source}
                      </span>
                      <p className="text-sm font-bold">{bm.problem.title}</p>
                    </div>
                    <Bookmark className="size-4 text-accent fill-current shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent Learning Activity Feed */}
        <section className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                Audit Trail
              </span>
              <h2 className="font-display text-3xl">Recent Activity</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {snapshot.activities.length} recorded events
            </span>
          </div>

          {snapshot.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Your recent course enrollments, completed modules, and practice updates will appear
              here as you study.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {snapshot.activities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-accent shrink-0" />
                    <span className="font-medium text-foreground">{act.resourceTitle}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {new Date(act.occurredAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub: string;
  highlight?: "emerald" | "amber";
}) {
  return (
    <div className="bg-card rounded-2xl p-4 ring-1 ring-white/10">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block">
        {label}
      </span>
      <p
        className={`font-display text-4xl mt-1 ${
          highlight === "emerald"
            ? "text-emerald-400"
            : highlight === "amber"
              ? "text-amber-400"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      <span className="text-[11px] text-muted-foreground block mt-1">{sub}</span>
    </div>
  );
}

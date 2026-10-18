import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  Info,
  Lightbulb,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getProblemById, getRelatedProblems, type PracticeStatus } from "@/data/practice-problems";
import { getCourseById } from "@/data/courses";
import {
  getCurrentAuthUser,
  getUserBookmarks,
  getUserPracticeAttempts,
  toggleProblemBookmark,
  upsertPracticeAttempt,
  type AuthUser,
} from "@/services/platform-store";
import { PREFERRED_LANGUAGES } from "@/lib/validation";

export const Route = createFileRoute("/practice/$problemId")({
  loader: ({ params }) => {
    const problem = getProblemById(params.problemId);
    if (!problem) throw notFound();
    return { problem };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.problem.title} — Coding Practice — BUCKLABS AI` },
          { name: "description", content: loaderData.problem.learningObjective },
        ]
      : [{ title: "Practice Problem — BUCKLABS AI" }],
  }),
  component: ProblemDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-8 text-center">
      <div>
        <p className="font-display text-4xl mb-4">Problem not found</p>
        <Link to="/practice" className="text-accent underline">
          Return to Coding Practice Catalogue
        </Link>
      </div>
    </div>
  ),
});

function ProblemDetailPage() {
  const { problem } = Route.useLoaderData();
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [status, setStatus] = useState<PracticeStatus>("not_started");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("Python");
  const [notes, setNotes] = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [revealedHints, setRevealedHints] = useState(1);
  const [showApproach, setShowApproach] = useState(false);

  const relatedCourse = getCourseById(problem.relatedCourseId);
  const relatedProblems = getRelatedProblems(problem, 3);

  useEffect(() => {
    setRevealedHints(1);
    setShowApproach(false);
    let active = true;
    (async () => {
      const currentUser = await getCurrentAuthUser();
      if (!active) return;
      setUser(currentUser);
      if (currentUser) {
        const [bookmarks, attempts] = await Promise.all([
          getUserBookmarks(currentUser.id),
          getUserPracticeAttempts(currentUser.id),
        ]);
        if (!active) return;
        setBookmarked(bookmarks.some((b) => b.problemId === problem.id));
        const att = attempts.find((a) => a.problemId === problem.id);
        if (att) {
          setStatus(att.status);
          setPreferredLanguage(att.preferredLanguage ?? "Python");
          setNotes(att.notes);
          setLastUpdatedAt(att.updatedAt);
        } else {
          setStatus("not_started");
          setNotes("");
          setLastUpdatedAt(null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [problem.id]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.info("Please sign in to bookmark this problem.");
      navigate({ to: "/login" });
      return;
    }
    try {
      const res = await toggleProblemBookmark(user.id, problem.id);
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? "Problem bookmarked." : "Removed from bookmarks.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update bookmark.");
    }
  };

  const handleSaveProgress = async (nextStatus?: PracticeStatus) => {
    if (!user) {
      toast.info("Sign in to save your practice status and personal notes.");
      navigate({ to: "/login" });
      return;
    }
    const targetStatus = nextStatus ?? status;
    setSaving(true);
    try {
      const saved = await upsertPracticeAttempt(user.id, {
        problemId: problem.id,
        status: targetStatus,
        preferredLanguage,
        notes,
      });
      setStatus(saved.status);
      setLastUpdatedAt(saved.updatedAt);
      toast.success(
        `Saved practice record as "${saved.status.replace("_", " ")}" (self-reported).`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save practice status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-5xl mx-auto px-6 py-14 space-y-10">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/practice"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Practice Catalogue</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-pressed={bookmarked}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold ring-1 transition-colors ${
                bookmarked
                  ? "bg-accent/20 text-accent ring-accent/40"
                  : "bg-card text-muted-foreground ring-white/10 hover:text-foreground"
              }`}
            >
              <Bookmark className={`size-3.5 ${bookmarked ? "fill-current" : ""}`} />
              <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            <Link
              to="/ai-tutor"
              search={{ problemId: problem.id }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/15 text-accent ring-1 ring-accent/30 text-xs font-semibold hover:bg-accent/25 transition-colors"
            >
              <Sparkles className="size-3.5" />
              <span>Ask AI Tutor About This Problem</span>
            </Link>
          </div>
        </div>

        {/* Title & Source Attribution Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-mono font-semibold">
              Internal Difficulty: {problem.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card ring-1 ring-white/10 text-xs font-mono text-muted-foreground">
              {problem.source} Designation: {problem.externalDifficulty}
            </span>
            {problem.topics.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-md bg-primary/15 text-accent text-xs font-mono"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl tracking-tight leading-[0.95]">
            {problem.title}
          </h1>

          {/* External Hosting & Provenance Card */}
          <div className="bg-card rounded-2xl p-5 ring-1 ring-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="size-4 text-accent shrink-0" />
                <span>{problem.attribution}</span>
              </p>
              <p>
                Full problem statement, sample test cases, code editor, and automated submission
                judging are hosted on <strong className="text-foreground">{problem.source}</strong>.
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/80">
                Provenance: {problem.metadataProvenance} &bull; Verified: {problem.lastVerifiedAt}
              </p>
            </div>

            <a
              href={problem.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
            >
              <span>Open Problem on {problem.source}</span>
              <ExternalLink className="size-4" />
            </a>
          </div>
        </header>

        {/* Learning Objective & Problem Overview */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                Original Learning Objective
              </span>
              <h2 className="text-lg font-bold text-foreground">{problem.learningObjective}</h2>
            </div>

            <div className="pt-3 border-t border-white/10">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                Problem Summary
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.summary}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Supported Study Tracks:</span>
              {problem.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded bg-background text-foreground font-mono ring-1 ring-white/10"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity Targets & Related Course */}
          <div className="bg-card rounded-2xl p-6 ring-1 ring-white/10 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                Target Complexity
              </span>
              <div className="p-3 rounded-xl bg-background/60 ring-1 ring-white/10">
                <span className="text-[11px] font-mono text-muted-foreground block">
                  Time Complexity
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {problem.complexityTime}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background/60 ring-1 ring-white/10">
                <span className="text-[11px] font-mono text-muted-foreground block">
                  Auxiliary Space
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {problem.complexitySpace}
                </span>
              </div>
            </div>

            {relatedCourse && (
              <div className="pt-3 border-t border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">
                  Paired Concept Course
                </span>
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: relatedCourse.id }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <BookOpen className="size-3.5" />
                  <span>{relatedCourse.title}</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Progressive Hints & Approach Outline */}
        <section className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                Guided Problem Solving
              </span>
              <h2 className="font-display text-3xl">
                Progressive Hints ({revealedHints}/{problem.hints.length})
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {revealedHints < problem.hints.length && (
                <button
                  type="button"
                  onClick={() =>
                    setRevealedHints((prev) => Math.min(prev + 1, problem.hints.length))
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-colors"
                >
                  <Lightbulb className="size-3.5" />
                  <span>Reveal Hint {revealedHints + 1}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowApproach((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold ring-1 ring-white/10 transition-colors"
              >
                <Eye className="size-3.5 text-accent" />
                <span>{showApproach ? "Hide Approach Blueprint" : "Reveal Optimal Approach"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {problem.hints.slice(0, revealedHints).map((hint, idx) => (
              <div
                key={hint}
                className="p-4 rounded-xl bg-background/70 ring-1 ring-white/10 text-sm text-foreground/90 flex items-start gap-3"
              >
                <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-mono text-xs shrink-0">
                  Hint {idx + 1}
                </span>
                <p>{hint}</p>
              </div>
            ))}
          </div>

          {showApproach && (
            <div className="p-5 rounded-xl bg-primary/10 ring-1 ring-accent/30 space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                Algorithmic Approach Outline
              </span>
              <p className="text-sm text-foreground leading-relaxed">{problem.approachOutline}</p>
            </div>
          )}
        </section>

        {/* Practice Status & Personal Revision Notes */}
        <section className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                User-Reported Activity Tracker
              </span>
              <h2 className="font-display text-3xl">Track Your Practice Status &amp; Notes</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Verification: Self-reported by learner
              {lastUpdatedAt
                ? ` · Last saved ${new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </span>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            {(
              [
                ["not_started", "Not Started"],
                ["in_progress", "In Progress"],
                ["solved", "Solved (Self-Reported)"],
                ["needs_revision", "Needs Revision"],
              ] as const
            ).map(([val, label]) => {
              const active = status === val;
              return (
                <button
                  key={val}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setStatus(val);
                    handleSaveProgress(val);
                  }}
                  className={`p-3.5 rounded-xl text-left text-xs font-semibold ring-1 transition-all flex items-center justify-between ${
                    active
                      ? "bg-primary/25 text-foreground ring-accent"
                      : "bg-background/60 text-muted-foreground ring-white/10 hover:text-foreground"
                  }`}
                >
                  <span>{label}</span>
                  {active && <CheckCircle2 className="size-4 text-accent shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="attempt-language"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Practice Language
              </label>
              <select
                id="attempt-language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {PREFERRED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="attempt-notes"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Personal Key Takeaways &amp; Edge-Case Notes
              </label>
              <textarea
                id="attempt-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down the core invariant, time/space complexity, or edge cases you encountered..."
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveProgress()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Save className="size-4" />
              <span>{saving ? "Saving..." : "Save Status & Notes"}</span>
            </button>
          </div>
        </section>

        {/* Related Problems */}
        {relatedProblems.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-3xl">Related Practice Problems</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedProblems.map((rel) => (
                <Link
                  key={rel.id}
                  to="/practice/$problemId"
                  params={{ problemId: rel.id }}
                  className="bg-card rounded-2xl p-5 ring-1 ring-white/10 hover:ring-accent/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-accent">{rel.difficulty}</span>
                      <span className="text-muted-foreground">{rel.source}</span>
                    </div>
                    <h3 className="font-bold text-sm">{rel.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {rel.learningObjective}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-accent">Open Problem &rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

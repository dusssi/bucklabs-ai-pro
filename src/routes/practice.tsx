import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Code2, ExternalLink, Filter, Info, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProblemCard } from "@/components/practice/ProblemCard";
import {
  calculateTopicProgress,
  filterAndSortProblems,
  PRACTICE_DIFFICULTIES,
  PRACTICE_LANGUAGES,
  PRACTICE_SOURCES,
  PRACTICE_TOPICS,
  practiceProblems,
  type PracticeSortOption,
  type PracticeStatus,
} from "@/data/practice-problems";
import {
  getCurrentAuthUser,
  getUserBookmarks,
  getUserPracticeAttempts,
  toggleProblemBookmark,
  type AuthUser,
} from "@/services/platform-store";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Coding Practice Catalogue — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Topic-wise and difficulty-wise coding practice catalogue across 16 DSA topics with canonical links to LeetCode, HackerRank, and Codeforces.",
      },
    ],
  }),
  component: PracticeLayoutOrIndex,
});

function PracticeLayoutOrIndex() {
  const childMatch = useMatch({
    from: "/practice/$problemId",
    shouldThrow: false,
  });

  if (childMatch) {
    return <Outlet />;
  }

  return <PracticeCataloguePage />;
}

function PracticeCataloguePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [source, setSource] = useState<string>("All");
  const [language, setLanguage] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<PracticeSortOption>("curated");

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [statusByProblemId, setStatusByProblemId] = useState<Record<string, PracticeStatus>>({});

  useEffect(() => {
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
        setBookmarkedIds(new Set(bookmarks.map((b) => b.problemId)));
        const stMap: Record<string, PracticeStatus> = {};
        for (const a of attempts) {
          stMap[a.problemId] = a.status;
        }
        setStatusByProblemId(stMap);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleBookmark = async (problemId: string) => {
    if (!user) {
      toast.info("Please sign in to bookmark problems for later revision.");
      navigate({ to: "/login" });
      return;
    }
    try {
      const res = await toggleProblemBookmark(user.id, problemId);
      setBookmarkedIds(new Set(res.bookmarks.map((b) => b.problemId)));
      toast.success(res.bookmarked ? "Added to your bookmarks." : "Removed from bookmarks.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bookmark update failed.");
    }
  };

  const filtered = filterAndSortProblems(practiceProblems, {
    query,
    topic,
    difficulty,
    source,
    language,
    status: statusFilter,
    bookmarkedOnly,
    sortBy,
    statusByProblemId,
    bookmarkedIds,
  });

  const topicStats = calculateTopicProgress(practiceProblems, statusByProblemId);

  const resetFilters = () => {
    setQuery("");
    setTopic("All");
    setDifficulty("All");
    setSource("All");
    setLanguage("All");
    setStatusFilter("All");
    setBookmarkedOnly(false);
    setSortBy("curated");
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    topic !== "All" ||
    difficulty !== "All" ||
    source !== "All" ||
    language !== "All" ||
    statusFilter !== "All" ||
    bookmarkedOnly ||
    sortBy !== "curated";

  const solvedCount = Object.values(statusByProblemId).filter((s) => s === "solved").length;
  const revisionCount = Object.values(statusByProblemId).filter(
    (s) => s === "needs_revision",
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-6 py-14 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent block mb-3">
              Curated Problem Discovery &amp; Progress Tracker
            </span>
            <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
              Coding Practice Platform
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Practice by topic and difficulty across 16 core DSA categories. Study BUCKLABS
              learning objectives, progressive hints, and complexity targets, then solve on the
              canonical judge (LeetCode, HackerRank, or Codeforces).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-card rounded-2xl p-4 ring-1 ring-white/10 shrink-0">
            <div className="px-3 py-1">
              <span className="font-mono text-[11px] text-muted-foreground block">Solved</span>
              <span className="font-display text-3xl text-emerald-400">{solvedCount}</span>
              <span className="text-[11px] text-muted-foreground block">
                /{practiceProblems.length} total
              </span>
            </div>
            <div className="px-3 py-1 border-x border-white/10">
              <span className="font-mono text-[11px] text-muted-foreground block">Revision</span>
              <span className="font-display text-3xl text-amber-400">{revisionCount}</span>
              <span className="text-[11px] text-muted-foreground block">flagged</span>
            </div>
            <div className="px-3 py-1">
              <span className="font-mono text-[11px] text-muted-foreground block">Saved</span>
              <span className="font-display text-3xl text-accent">{bookmarkedIds.size}</span>
              <span className="text-[11px] text-muted-foreground block">bookmarks</span>
            </div>
          </div>
        </div>

        {/* Source & Execution Transparency Banner */}
        <div className="bg-card/60 rounded-2xl p-4 ring-1 ring-white/10 flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="size-4 text-accent shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground">Source &amp; Judge Transparency:</strong> Problems
            in this catalogue link directly to their canonical external host (LeetCode, HackerRank,
            or Codeforces) for code execution and submission. Language filters indicate curated
            study-track support (Python, Java, C++, JavaScript); completion status is stored as{" "}
            <strong className="text-foreground">user-reported progress</strong>.
          </p>
        </div>

        {/* Topic Quick-Filter Strip */}
        <section aria-label="Filter by DSA topic" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              16 Core Practice Topics
            </span>
            {topic !== "All" && (
              <button
                type="button"
                onClick={() => setTopic("All")}
                className="text-xs font-mono text-accent hover:underline"
              >
                Show all topics
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTopic("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono ring-1 transition-all ${
                topic === "All"
                  ? "bg-accent text-accent-foreground ring-accent font-bold"
                  : "bg-card text-muted-foreground ring-white/10 hover:text-foreground"
              }`}
            >
              All Topics ({practiceProblems.length})
            </button>
            {topicStats.map((stat) => {
              const active = topic === stat.topic;
              return (
                <button
                  key={stat.topic}
                  type="button"
                  onClick={() => setTopic(active ? "All" : stat.topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono ring-1 transition-all ${
                    active
                      ? "bg-accent text-accent-foreground ring-accent font-bold"
                      : "bg-card text-muted-foreground ring-white/10 hover:text-foreground"
                  }`}
                >
                  {stat.topic} ({stat.solved}/{stat.total})
                </button>
              );
            })}
          </div>
        </section>

        {/* Search, Filter & Sort Controls */}
        <section
          aria-label="Search and filter practice catalogue"
          className="bg-card rounded-2xl p-5 ring-1 ring-white/10 space-y-4"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="sm:col-span-2 relative">
              <label htmlFor="practice-search" className="sr-only">
                Search problems
              </label>
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="practice-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, topic, or concept..."
                className="w-full bg-background pl-10 pr-4 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="practice-difficulty" className="sr-only">
                Difficulty
              </label>
              <select
                id="practice-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-background px-3 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                <option value="All">Difficulty: All</option>
                {PRACTICE_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="practice-source" className="sr-only">
                Source Platform
              </label>
              <select
                id="practice-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-background px-3 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                <option value="All">Source: All</option>
                {PRACTICE_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="practice-language" className="sr-only">
                Language Track
              </label>
              <select
                id="practice-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-background px-3 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                <option value="All">Language Track: All</option>
                {PRACTICE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="practice-sort" className="sr-only">
                Sort order
              </label>
              <select
                id="practice-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as PracticeSortOption)}
                className="w-full bg-background px-3 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                <option value="curated">Sort: Curated Order</option>
                <option value="difficulty_asc">Sort: Beginner &rarr; Hard</option>
                <option value="difficulty_desc">Sort: Hard &rarr; Beginner</option>
                <option value="title">Sort: Title (A–Z)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["All", "All Statuses"],
                  ["not_started", "Not Started"],
                  ["in_progress", "In Progress"],
                  ["solved", "Solved"],
                  ["needs_revision", "Needs Revision"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition-colors ${
                    statusFilter === val
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-background text-muted-foreground ring-white/10 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setBookmarkedOnly((prev) => !prev)}
                aria-pressed={bookmarkedOnly}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition-colors ${
                  bookmarkedOnly
                    ? "bg-accent text-accent-foreground ring-accent font-semibold"
                    : "bg-background text-muted-foreground ring-white/10 hover:text-foreground"
                }`}
              >
                <Bookmark className="size-3.5" />
                <span>Bookmarked Only</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
                {practiceProblems.length} problems
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-accent hover:underline font-mono"
                >
                  <RotateCcw className="size-3" />
                  Reset all
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Problem Cards or Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 ring-1 ring-white/10 text-center space-y-4">
            <Code2 className="size-8 text-accent mx-auto" />
            <h2 className="text-xl font-bold">No practice problems match your current filters</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try resetting your topic, difficulty, source, or bookmark filters to explore the full
              curated catalogue.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                status={statusByProblemId[problem.id] ?? "not_started"}
                bookmarked={bookmarkedIds.has(problem.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

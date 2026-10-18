import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, Clock, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import type { PracticeDifficulty, PracticeProblem, PracticeStatus } from "@/data/practice-problems";

const DIFFICULTY_STYLES: Record<PracticeDifficulty, string> = {
  Beginner: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  Easy: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const STATUS_META: Record<
  PracticeStatus,
  { label: string; className: string; icon: typeof CheckCircle2 | null }
> = {
  not_started: {
    label: "Not started",
    className: "bg-white/5 text-muted-foreground ring-white/10",
    icon: null,
  },
  in_progress: {
    label: "In progress (User-reported)",
    className: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    icon: Clock,
  },
  solved: {
    label: "Solved (User-reported)",
    className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    icon: CheckCircle2,
  },
  needs_revision: {
    label: "Needs revision",
    className: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    icon: RotateCcw,
  },
};

export interface ProblemCardProps {
  problem: PracticeProblem;
  status?: PracticeStatus;
  bookmarked?: boolean;
  onToggleBookmark?: (problemId: string) => void;
  onQuickStatusChange?: (problemId: string, status: PracticeStatus) => void;
}

export function ProblemCard({
  problem,
  status = "not_started",
  bookmarked = false,
  onToggleBookmark,
}: ProblemCardProps) {
  const statusMeta = STATUS_META[status];
  const StatusIcon = statusMeta.icon;

  return (
    <article className="bg-card rounded-2xl ring-1 ring-white/10 hover:ring-accent/40 transition-all p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ring-1 ${DIFFICULTY_STYLES[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 text-muted-foreground ring-1 ring-white/10">
              Source: {problem.source}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ring-1 ${statusMeta.className}`}
            >
              {StatusIcon && <StatusIcon className="size-3" />}
              {statusMeta.label}
            </span>
          </div>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(problem.id)}
              aria-label={
                bookmarked ? `Remove ${problem.title} from bookmarks` : `Bookmark ${problem.title}`
              }
              aria-pressed={bookmarked}
              className={`p-2 rounded-lg ring-1 transition-colors ${
                bookmarked
                  ? "bg-accent/20 text-accent ring-accent/40"
                  : "bg-background/60 text-muted-foreground ring-white/10 hover:text-foreground"
              }`}
            >
              <Bookmark className={`size-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <Link
          to="/practice/$problemId"
          params={{ problemId: problem.id }}
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
        >
          <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
            {problem.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {problem.learningObjective}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {problem.topics.map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-0.5 rounded-md bg-primary/15 text-accent text-xs font-mono"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground font-mono">
          Target: <span className="text-foreground/90">{problem.complexityTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/practice/$problemId"
            params={{ problemId: problem.id }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-xs font-semibold ring-1 ring-white/10 transition-colors"
          >
            <Sparkles className="size-3.5 text-accent" />
            Study & Track
          </Link>
          <a
            href={problem.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
          >
            Solve on {problem.source}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

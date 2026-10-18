import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PRACTICE_TOPICS, practiceProblems, getProblemById } from "@/data/practice-problems";
import {
  AI_TUTOR_MODES,
  aiTutorRequestSchema,
  PREFERRED_LANGUAGES,
  type AiTutorMode,
} from "@/lib/validation";
import { askAiTutorServerFn, type AiTutorResponse } from "@/lib/api/platform.functions";
import { getCurrentAuthUser, recordLearningActivity } from "@/services/platform-store";

const searchSchema = z.object({
  problemId: z.string().optional(),
});

export const Route = createFileRoute("/ai-tutor")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "AI Practice & Concept Tutor — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Get progressive hints, concept breakdowns, algorithmic complexity analysis, and code debugging guidance without spoiling the full solution.",
      },
    ],
  }),
  component: AiTutorPage,
});

const MODE_DESCRIPTIONS: Record<AiTutorMode, { title: string; subtitle: string }> = {
  hint: {
    title: "Hint Mode",
    subtitle: "Progressive hints without revealing the complete solution",
  },
  concept: {
    title: "Concept Mode",
    subtitle: "Core mental models and invariant explanations",
  },
  debug: {
    title: "Debug Mode",
    subtitle: "Reason about errors and edge cases in your code",
  },
  solution: {
    title: "Approach Walkthrough",
    subtitle: "Explain optimal strategy and complexity after an attempt",
  },
  revision: {
    title: "Revision Mode",
    subtitle: "Active recall prompts for previously studied topics",
  },
};

function AiTutorPage() {
  const search = Route.useSearch();
  const initialProblem = search.problemId ? getProblemById(search.problemId) : undefined;

  const [mode, setMode] = useState<AiTutorMode>("hint");
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialProblem?.id ?? "");
  const [topic, setTopic] = useState<string>(initialProblem?.topics[0] ?? PRACTICE_TOPICS[0]);
  const [language, setLanguage] = useState<(typeof PREFERRED_LANGUAGES)[number]>("Python");
  const [userQuestion, setUserQuestion] = useState<string>(
    initialProblem
      ? `How can I improve my brute-force approach for ${initialProblem.title}?`
      : "How do I decide between a sliding window and a two-pointer approach?",
  );
  const [userCode, setUserCode] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [response, setResponse] = useState<AiTutorResponse | null>(null);

  useEffect(() => {
    if (selectedProblemId) {
      const p = getProblemById(selectedProblemId);
      if (p) {
        setTopic(p.topics[0]);
      }
    }
  }, [selectedProblemId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = aiTutorRequestSchema.safeParse({
      mode,
      problemId: selectedProblemId || undefined,
      topic,
      language,
      userQuestion,
      userCode,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await askAiTutorServerFn({ data: parsed.data });
      setResponse(res);
      const user = await getCurrentAuthUser();
      if (user) {
        await recordLearningActivity(user.id, {
          activityType: "ai_tutor_used",
          resourceType: "ai_tutor",
          resourceId: selectedProblemId || topic,
          resourceTitle: `Used AI Tutor (${res.modeLabel}) on ${selectedProblemId || topic}`,
          metadata: { mode, topic, language, engine: res.generationEngine },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI Tutor service encountered an error.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-6xl mx-auto px-6 py-14 space-y-10">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-mono">
              <Sparkles className="size-3.5" />
              <span>Server-Validated Pedagogical Assistant</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 text-xs font-mono">
              Beta Mode: Deterministic Curriculum Engine
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
            AI Practice &amp; Concept Tutor
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Designed to build genuine problem-solving intuition rather than hand out unread answers.
            Choose one of the five assistance modes below to get progressive hints, concept
            explanations, or complexity diagnostics.
          </p>
        </div>

        {/* 5 Assistance Modes Selector */}
        <section
          aria-label="AI assistance mode"
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          {AI_TUTOR_MODES.map((m) => {
            const active = mode === m;
            const info = MODE_DESCRIPTIONS[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`p-4 rounded-2xl text-left ring-1 transition-all ${
                  active
                    ? "bg-primary/20 ring-accent text-foreground"
                    : "bg-card ring-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent block mb-1">
                  {m}
                </span>
                <p className="font-bold text-sm text-foreground">{info.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{info.subtitle}</p>
              </button>
            );
          })}
        </section>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Request Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-5"
            noValidate
          >
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-destructive/15 ring-1 ring-destructive/40 text-xs text-red-200 flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="tutor-problem"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Curated Problem Context (Optional)
              </label>
              <select
                id="tutor-problem"
                value={selectedProblemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                <option value="">General Concept / Custom Question</option>
                {practiceProblems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.difficulty} · {p.topics[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tutor-topic"
                  className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Topic
                </label>
                <select
                  id="tutor-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
                >
                  {PRACTICE_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tutor-language"
                  className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Language
                </label>
                <select
                  id="tutor-language"
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as (typeof PREFERRED_LANGUAGES)[number])
                  }
                  className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
                >
                  {PREFERRED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="tutor-question"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Your Question or Current Thought Process
              </label>
              <textarea
                id="tutor-question"
                rows={3}
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                required
                placeholder="Describe what you've tried or where you are stuck..."
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="tutor-code"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Your Code Snippet (Optional — useful for Debug Mode)
              </label>
              <textarea
                id="tutor-code"
                rows={4}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Paste your current attempt here for complexity or bug analysis..."
                className="w-full bg-background px-4 py-3 rounded-xl text-xs font-mono ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              <span>
                {loading
                  ? "Generating Guided Response..."
                  : `Get ${MODE_DESCRIPTIONS[mode].title} Guidance`}
              </span>
            </button>
          </form>

          {/* Response Panel */}
          <div className="lg:col-span-6 space-y-5">
            {!response ? (
              <div className="bg-card rounded-2xl p-8 ring-1 ring-white/10 space-y-4">
                <Lightbulb className="size-8 text-accent" />
                <h2 className="text-xl font-bold">Ready to guide your problem solving</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select a problem or topic on the left and submit your question. Responses include
                  step-by-step guidance, time/space complexity targets, and links to relevant
                  BUCKLABS courses and practice problems.
                </p>
                <div className="p-4 rounded-xl bg-background/60 ring-1 ring-white/10 text-xs text-muted-foreground">
                  <strong className="text-foreground">Engine &amp; Transparency Notice:</strong>{" "}
                  Requests run through a per-caller rate-limited server workflow. In the Controlled
                  Beta environment (when no external LLM API key is configured), responses are
                  synthesized deterministically from BUCKLABS&apos;s verified problem curriculum and
                  heuristic code analyzer rather than a live generative LLM.
                </div>
              </div>
            ) : (
              <article className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-accent/40 space-y-6">
                <div className="space-y-2 pb-4 border-b border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-mono font-semibold">
                      {response.modeLabel}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Quota left: {response.remainingQuota}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300">
                    Engine: {response.engineBadge}
                  </div>
                </div>

                <h2 className="text-xl font-bold">{response.headline}</h2>

                <div className="space-y-3">
                  {response.guidanceSteps.map((step) => (
                    <div
                      key={step}
                      className="p-4 rounded-xl bg-background/70 ring-1 ring-white/10 text-sm text-foreground/90 leading-relaxed"
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-primary/10 ring-1 ring-accent/30 space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                    Algorithmic Complexity Analysis
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      Time:{" "}
                      <strong className="text-foreground">
                        {response.complexityAnalysis.time}
                      </strong>
                    </div>
                    <div>
                      Space:{" "}
                      <strong className="text-foreground">
                        {response.complexityAnalysis.space}
                      </strong>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {response.complexityAnalysis.rationale}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                    Verification Checklist
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {response.codeChecklist.map((item) => (
                      <li key={item}>&bull; {item}</li>
                    ))}
                  </ul>
                </div>

                {(response.relatedCourse || response.relatedProblems.length > 0) && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                      Recommended Next Study Resources
                    </span>
                    {response.relatedCourse && (
                      <Link
                        to="/courses/$courseId"
                        params={{ courseId: response.relatedCourse.id }}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-accent"
                      >
                        <BookOpen className="size-3.5 text-accent" />
                        <span>Course: {response.relatedCourse.title}</span>
                      </Link>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {response.relatedProblems.map((rp) => (
                        <Link
                          key={rp.id}
                          to="/practice/$problemId"
                          params={{ problemId: rp.id }}
                          className="px-3 py-1.5 rounded-lg bg-background ring-1 ring-white/10 text-xs hover:ring-accent/40"
                        >
                          {rp.title} ({rp.difficulty})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground/80 pt-3 border-t border-white/10">
                  {response.disclaimer}
                </p>
              </article>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Code2,
  FileText,
  Layers,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  analyzeCareerReadiness,
  careerRoadmaps,
  type SkillGapAnalysisResult,
} from "@/data/career-roadmaps";
import { getCourseById } from "@/data/courses";
import { getProblemById } from "@/data/practice-problems";
import { validateResumeFilePayload } from "@/lib/validation";
import {
  getCurrentAuthUser,
  getUserEnrollments,
  getUserPracticeAttempts,
  recordLearningActivity,
} from "@/services/platform-store";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career Preparation & Skill-Gap Analyzer — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Compare your current skills and resume against target software engineering and AI/ML roles, explore milestone roadmaps, and close skill gaps with linked courses and practice problems.",
      },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(careerRoadmaps[0].id);
  const [resumeText, setResumeText] = useState<string>(
    "Built a full-stack React and TypeScript web application backed by PostgreSQL. Solved 25+ array, hashing, and two-pointer problems in Python and Java.",
  );
  const [jdText, setJdText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await getCurrentAuthUser();
      if (!active || !user) return;
      try {
        const [enrollments, attempts] = await Promise.all([
          getUserEnrollments(user.id),
          getUserPracticeAttempts(user.id),
        ]);
        if (!active) return;
        setCompletedCourseIds(
          enrollments.filter((e) => e.status === "completed").map((e) => e.courseId),
        );
        setSolvedProblemIds(attempts.filter((a) => a.status === "solved").map((a) => a.problemId));
      } catch {
        // Non-blocking on public career page if offline
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const activeRoadmap = careerRoadmaps.find((r) => r.id === selectedRoleId) ?? careerRoadmaps[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rawText = await file.text();
    const validation = validateResumeFilePayload({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      content: rawText,
    });

    if (!validation.valid) {
      toast.error(validation.error ?? "Invalid file upload.");
      e.target.value = "";
      return;
    }

    setResumeText(validation.sanitizedContent);
    setUploadedFileName(file.name);
    toast.success(`Loaded "${file.name}" for skill-gap analysis.`);
  };

  const handleClearResume = () => {
    setResumeText("");
    setJdText("");
    setUploadedFileName(null);
    setAnalysis(null);
    toast.info("Cleared uploaded resume text and analysis results.");
  };

  const handleRunAnalysis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resumeText.trim().length < 15) {
      toast.error(
        "Please enter at least 15 characters of skills, coursework, or resume bullets to analyze.",
      );
      return;
    }

    const result = analyzeCareerReadiness({
      roleId: selectedRoleId,
      resumeOrSkillsText: resumeText,
      jobDescriptionText: jdText,
      completedCourseIds,
      solvedProblemIds,
    });
    setAnalysis(result);

    try {
      const user = await getCurrentAuthUser();
      if (user) {
        await recordLearningActivity(user.id, {
          activityType: "career_assessment_completed",
          resourceType: "career",
          resourceId: selectedRoleId,
          resourceTitle: `Completed skill-gap analysis for ${result.role.roleTitle}`,
          metadata: { readinessScore: result.readinessScore },
        });
      }
    } catch {
      // Non-blocking activity log
    }
    toast.success("Skill-gap and resume alignment report generated.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-6 py-14 space-y-14">
        {/* Header */}
        <section className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent">
              Learning-to-Career Bridge
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 text-xs font-mono">
              Deterministic Rubric Engine (Beta)
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
            Career Preparation &amp; Skill-Gap Lab
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Identify missing competencies for your target engineering role, compare your resume
            bullets against job descriptions using our deterministic competency rubric, and jump
            directly to the BUCKLABS courses and practice problems that close your gaps.
          </p>
        </section>

        {/* Interactive Skill-Gap & Resume Analyzer */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleRunAnalysis}
            className="lg:col-span-6 bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">
                Operational Tool · Resume &amp; Skill-Gap Evaluator
              </span>
              {uploadedFileName && (
                <span className="text-xs font-mono text-emerald-300">File: {uploadedFileName}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="career-role-select"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Target Engineering Role
              </label>
              <select
                id="career-role-select"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {careerRoadmaps.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="career-resume-input"
                  className="block text-xs font-mono uppercase tracking-widest text-muted-foreground"
                >
                  Resume Summary, Skills &amp; Project Bullets
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-mono text-accent cursor-pointer hover:underline">
                  <Upload className="size-3.5" />
                  <span>Upload .txt / .md (&le;100KB)</span>
                  <input
                    type="file"
                    accept=".txt,.md,text/plain,text/markdown"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              <textarea
                id="career-resume-input"
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                maxLength={6000}
                placeholder="Paste your resume summary, technical skills, and project bullet points..."
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="career-jd-input"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Target Job Description (Optional)
              </label>
              <textarea
                id="career-jd-input"
                rows={3}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                maxLength={4000}
                placeholder="Paste requirements from a specific internship or job posting to check keyword alignment..."
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearResume}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-background ring-1 ring-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
                <span>Clear Document Text</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="size-4" />
                <span>Analyze Skill Gaps &amp; Readiness</span>
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/80">
              Transparency &amp; Privacy Note: Analysis runs deterministically against role
              competency rubrics and your completed BUCKLABS coursework (not a black-box LLM).
              Uploaded text can be cleared immediately with &ldquo;Clear Document Text&rdquo;.
            </p>
          </form>

          {/* Analysis Results Panel */}
          <div className="lg:col-span-6 space-y-5">
            {!analysis ? (
              <div className="bg-card rounded-2xl p-8 ring-1 ring-white/10 space-y-4">
                <FileText className="size-8 text-accent" />
                <h2 className="text-xl font-bold">Run a Role &amp; Skill-Gap Assessment</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your assessment combines your pasted resume skills with your completed BUCKLABS
                  courses ({completedCourseIds.length}) and solved practice problems (
                  {solvedProblemIds.length}) to identify what to study next.
                </p>
              </div>
            ) : (
              <article className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-accent/40 space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                      Skill-Gap Report (Deterministic Rubric)
                    </span>
                    <h2 className="text-xl font-bold">{analysis.role.roleTitle}</h2>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-4xl text-accent">
                      {analysis.readinessScore}%
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      Skill Coverage
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 block">
                      Demonstrated Skills ({analysis.matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchedSkills.length === 0 ? (
                        <span className="text-xs text-muted-foreground">None detected yet</span>
                      ) : (
                        analysis.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-xs font-mono"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300 block">
                      Missing Skill Gaps ({analysis.missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills.length === 0 ? (
                        <span className="text-xs text-emerald-300">All core skills covered!</span>
                      ) : (
                        analysis.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-xs font-mono"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
                    Actionable Resume &amp; Portfolio Suggestions
                  </span>
                  <ul className="space-y-2 text-xs text-foreground/90">
                    {analysis.resumeSuggestions.map((sug) => (
                      <li
                        key={sug}
                        className="p-3 rounded-xl bg-background/60 ring-1 ring-white/10"
                      >
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent block">
                    Recommended Courses &amp; Practice to Close Gaps
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendedCourseIds.map((cid) => {
                      const c = getCourseById(cid);
                      return c ? (
                        <Link
                          key={cid}
                          to="/courses/$courseId"
                          params={{ courseId: cid }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-accent text-xs font-semibold ring-1 ring-accent/30"
                        >
                          <BookOpen className="size-3.5" />
                          <span>{c.title}</span>
                        </Link>
                      ) : null;
                    })}
                    {analysis.recommendedProblemIds.map((pid) => {
                      const p = getProblemById(pid);
                      return p ? (
                        <Link
                          key={pid}
                          to="/practice/$problemId"
                          params={{ problemId: pid }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background text-foreground text-xs ring-1 ring-white/10 hover:ring-accent/40"
                        >
                          <Code2 className="size-3.5 text-accent" />
                          <span>{p.title}</span>
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* Interactive Career Roadmaps */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-1">
                Role-Aligned Milestones
              </span>
              <h2 className="font-display text-4xl">
                Interactive Career Roadmap: {activeRoadmap.roleTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {activeRoadmap.summary}
              </p>
            </div>
            <Link
              to="/learning/$pathId"
              params={{ pathId: activeRoadmap.recommendedPathId }}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline"
            >
              <span>Open Full Learning Path</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {activeRoadmap.milestones.map((milestone) => {
              const completedCoursesCount = milestone.linkedCourseIds.filter((id) =>
                completedCourseIds.includes(id),
              ).length;
              const solvedProblemsCount = milestone.linkedProblemIds.filter((id) =>
                solvedProblemIds.includes(id),
              ).length;

              return (
                <div
                  key={milestone.id}
                  className="bg-card rounded-2xl p-6 ring-1 ring-white/10 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">{milestone.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground font-mono">
                      <span>
                        Courses: {completedCoursesCount}/{milestone.linkedCourseIds.length}
                      </span>
                      <span>
                        Problems: {solvedProblemsCount}/{milestone.linkedProblemIds.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {milestone.linkedProblemIds.slice(0, 3).map((pid) => {
                        const p = getProblemById(pid);
                        return p ? (
                          <Link
                            key={pid}
                            to="/practice/$problemId"
                            params={{ problemId: pid }}
                            className="text-[11px] text-accent hover:underline"
                          >
                            &bull; {p.title}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Honest Upcoming Phase 2 Modules */}
        <section className="bg-card/50 rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Layers className="size-4 text-accent" />
            <span>Planned Phase 2 (P2) Career Expansions — Coming Soon</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="p-4 rounded-xl bg-background/60 ring-1 ring-white/10">
              <strong className="text-foreground block mb-1">
                Real-Time AI Mock Interview Simulator (Coming Soon · Planned P2)
              </strong>
              Timed behavioral and technical interview simulations with structured rubric scoring
              will be introduced after controlled beta validation.
            </div>
            <div className="p-4 rounded-xl bg-background/60 ring-1 ring-white/10">
              <strong className="text-foreground block mb-1">
                Automated LinkedIn Profile Review &amp; Sync (Coming Soon · Planned P2)
              </strong>
              Direct profile import and recruiter headline benchmarking are scheduled for a future
              release.
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

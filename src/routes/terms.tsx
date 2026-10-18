import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Terms of service, acceptable use, and third-party attribution policies for BUCKLABS AI.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <article className="pt-20 pb-24 max-w-3xl mx-auto px-6 space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            Platform Governance
          </span>
          <h1 className="font-display text-5xl mb-2">Terms of Service</h1>
          <p className="text-xs font-mono text-muted-foreground">
            Effective Date: October 18, 2026 &bull; Controlled Beta Release
          </p>
        </div>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">
            1. Educational Purpose &amp; Beta Scope
          </h2>
          <p>
            BUCKLABS AI provides structured computer science learning paths, curated coding practice
            study guides, progress tracking, AI-assisted tutoring, and career preparation tools for
            personal educational use. Career readiness scores and AI explanations are provided as
            guidance and do not constitute guaranteed job placement or employment outcomes.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">
            2. Third-Party Problem Sources &amp; Attribution
          </h2>
          <p>
            BUCKLABS AI links learners to canonical external problem pages on platforms such as
            LeetCode, HackerRank, and Codeforces. All external problem statements, test suites, and
            online judges remain the property of their respective platform owners and are subject to
            those platforms&apos; terms of service.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">
            3. Account Security &amp; Acceptable Use
          </h2>
          <p>
            You are responsible for safeguarding your account credentials. Automated scraping, abuse
            of AI Tutor rate limits, unauthorized attempts to access other learners&apos; records,
            or submitting malicious payloads are strictly prohibited.
          </p>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}

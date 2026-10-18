import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BUCKLABS AI" },
      {
        name: "description",
        content:
          "How BUCKLABS AI collects, uses, protects, and deletes your personal and learning data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <article className="pt-20 pb-24 max-w-3xl mx-auto px-6 space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
            Data Protection &amp; Learner Privacy
          </span>
          <h1 className="font-display text-5xl mb-2">Privacy Policy</h1>
          <p className="text-xs font-mono text-muted-foreground">
            Effective Date: October 18, 2026 &bull; Controlled Beta Release
          </p>
        </div>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">1. Information We Collect</h2>
          <p>
            BUCKLABS AI collects only the minimal personal data necessary to provide an
            authenticated learning and coding-practice experience:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Account &amp; Profile Data:</strong> Email
              address, display name, learning level, preferred programming language, and learning
              goals.
            </li>
            <li>
              <strong className="text-foreground">Learning &amp; Practice Activity:</strong> Course
              enrollments, completed modules, problem bookmarks, self-reported problem statuses, and
              personal revision notes.
            </li>
            <li>
              <strong className="text-foreground">Voluntary Submissions:</strong> Questions or code
              snippets submitted to the AI Practice Tutor, resume text evaluated in the Career Lab,
              and contact/newsletter forms.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">2. How We Protect Your Data</h2>
          <p>
            All persistent user records are stored in PostgreSQL with Row-Level Security (RLS)
            policies enforcing that learners can only read, update, or delete their own profile,
            enrollments, bookmarks, and practice attempts. Privileged service-role credentials are
            restricted strictly to server-side environments and are never exposed to client bundles.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">
            3. Resume Text &amp; AI Assistance
          </h2>
          <p>
            Resume text pasted or loaded into the Career Preparation Lab is processed on demand for
            skill-gap analysis and can be cleared immediately using the in-page reset control. AI
            Tutor prompts are processed through rate-limited server workflows. Do not include
            confidential credentials or third-party secrets in code snippets or prompts.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">
            4. Your Rights &amp; Data Deletion
          </h2>
          <p>
            You may update your learner profile or permanently clear all stored enrollments,
            bookmarks, practice attempts, and activity logs at any time from your{" "}
            <Link to="/profile" className="text-accent underline">
              Profile &amp; Privacy Controls
            </Link>{" "}
            page, or by contacting us via the{" "}
            <Link to="/contact" className="text-accent underline">
              Support Form
            </Link>
            .
          </p>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}

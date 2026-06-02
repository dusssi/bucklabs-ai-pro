import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BUCKLABS" },
      { name: "description", content: "How BUCKLABS collects, uses, and protects your data." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <article className="pt-24 pb-24 max-w-3xl mx-auto px-6 prose-invert">
        <h1 className="font-display text-5xl mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground">We collect only the information needed to deliver and improve BUCKLABS. We never sell your data. Account information, learning progress, and AI interactions are stored securely and accessible only to you.</p>
        <h2 className="font-display text-2xl mt-12 mb-4">Data we collect</h2>
        <p className="text-muted-foreground">Account info (name, email), learning progress, and content you submit to AI features. We do not collect payment data directly.</p>
        <h2 className="font-display text-2xl mt-12 mb-4">Your rights</h2>
        <p className="text-muted-foreground">You may request a copy of your data, correction of inaccuracies, or deletion of your account at any time.</p>
      </article>
      <SiteFooter />
    </div>
  ),
});
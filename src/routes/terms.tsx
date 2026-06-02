import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — BUCKLABS" },
      { name: "description", content: "Terms of service for BUCKLABS E-Learning." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <article className="pt-24 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="font-display text-5xl mb-8">Terms & Conditions</h1>
        <p className="text-muted-foreground">By using BUCKLABS you agree to these terms. Course content is provided for your personal educational use. Misuse, scraping, or redistribution is prohibited.</p>
        <h2 className="font-display text-2xl mt-12 mb-4">Account responsibility</h2>
        <p className="text-muted-foreground">You're responsible for activity on your account. Keep your credentials secure and notify us of any unauthorized access.</p>
        <h2 className="font-display text-2xl mt-12 mb-4">Refunds</h2>
        <p className="text-muted-foreground">Refund eligibility is described at checkout for each paid plan.</p>
      </article>
      <SiteFooter />
    </div>
  ),
});
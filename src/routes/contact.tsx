import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BUCKLABS" },
      { name: "description", content: "Talk to the BUCKLABS team about learning, careers, and partnerships." },
      { property: "og:title", content: "Contact — BUCKLABS" },
      { property: "og:description", content: "Get in touch with BUCKLABS." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message required").max(1000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <section className="pt-24 pb-24 max-w-2xl mx-auto px-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Contact</span>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.9]">Get in touch.</h1>
        <form
          className="mt-12 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const parsed = contactSchema.safeParse({
              name: fd.get("name"),
              email: fd.get("email"),
              message: fd.get("message"),
            });
            if (!parsed.success) {
              toast.error(parsed.error.issues[0].message);
              return;
            }
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              toast.success("Thanks — we'll be in touch shortly.");
              (e.target as HTMLFormElement).reset();
            }, 600);
          }}
        >
          <Field label="Name" name="name" />
          <Field label="Email" name="email" type="email" />
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Message</label>
            <textarea
              name="message"
              rows={5}
              maxLength={1000}
              className="w-full bg-card px-4 py-3 rounded-lg text-sm ring-1 ring-white/10 focus:ring-accent outline-none text-foreground"
            />
          </div>
          <button disabled={submitting} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-60">
            {submitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        name={name}
        maxLength={255}
        className="w-full bg-card px-4 py-3 rounded-lg text-sm ring-1 ring-white/10 focus:ring-accent outline-none text-foreground"
      />
    </div>
  );
}
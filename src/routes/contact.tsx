import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { toast } from "sonner";
import { contactSubmissionSchema } from "@/lib/validation";
import { submitContactServerFn } from "@/lib/api/platform.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Beta Feedback — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Contact the BUCKLABS AI team regarding beta onboarding, course feedback, security reports, or university partnerships.",
      },
      { property: "og:title", content: "Contact — BUCKLABS AI" },
      { property: "og:description", content: "Get in touch with BUCKLABS AI." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<
    | "General Inquiry"
    | "Beta Access & Onboarding"
    | "Course & Practice Feedback"
    | "University / Campus Partnership"
    | "Security or Privacy Report"
  >("General Inquiry");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{
    id: string;
    createdAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = contactSubmissionSchema.safeParse({
      name,
      email,
      topic,
      message,
      honeypot,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitContactServerFn({ data: parsed.data });
      setTicket({ id: result.id, createdAt: result.createdAt });
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Your message has been recorded by BUCKLABS support.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Delivery failed. Your message has been preserved so you can retry.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent mb-3 block">
            Support &amp; Beta Feedback
          </span>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
            Get in touch.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Have feedback on a course module, want to suggest a coding problem, or need assistance
            with your account? Submit a support ticket below.
          </p>
        </div>

        {ticket && (
          <div
            role="status"
            className="bg-emerald-500/10 ring-1 ring-emerald-500/30 rounded-2xl p-6 space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="size-4" />
              <span>Submission Confirmed</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reference ID: <code className="text-foreground font-mono">{ticket.id}</code> &bull;
              Recorded at {new Date(ticket.createdAt).toLocaleTimeString()}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 space-y-5"
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

          {/* Anti-spam honeypot field (hidden from human users) */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="contact-website-hp">Leave this field blank</label>
            <input
              id="contact-website-hp"
              name="honeypot"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Priya Nair"
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                placeholder="priya@university.edu"
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-topic"
              className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
            >
              Inquiry Category
            </label>
            <select
              id="contact-topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Beta Access & Onboarding">Beta Access &amp; Onboarding</option>
              <option value="Course & Practice Feedback">Course &amp; Practice Feedback</option>
              <option value="University / Campus Partnership">
                University / Campus Partnership
              </option>
              <option value="Security or Privacy Report">Security or Privacy Report</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
            >
              Message (10–2000 characters)
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
              placeholder="How can we help?"
              className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Personal data is processed solely to respond to your inquiry in accordance with our{" "}
              <Link to="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>
              .
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
            >
              <Send className="size-4" />
              <span>{submitting ? "Submitting..." : "Send Message"}</span>
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { newsletterSchema } from "@/lib/validation";
import { subscribeNewsletterServerFn } from "@/lib/api/platform.functions";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email, honeypot });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await subscribeNewsletterServerFn({
        data: { email: parsed.data.email, honeypot: parsed.data.honeypot },
      });
      setSubscribedEmail(res.email);
      setEmail("");
      if (res.alreadySubscribed) {
        toast.info("This email is already subscribed to BUCKLABS product updates.");
      } else {
        toast.success("Subscribed to BUCKLABS AI beta release notes.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not complete newsletter subscription.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="py-16 border-t border-white/10 bg-background/60">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-primary/20 ring-1 ring-accent/40 grid place-items-center font-mono text-xs font-bold text-accent">
              BL
            </span>
            <span className="font-display text-2xl tracking-wider text-foreground">
              BUCKLABS <span className="text-accent">AI</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Integrated learning paths, curated source-linked coding practice, progress analytics,
            and career preparation for MCA, BCA, and engineering learners.
          </p>
          <p className="text-xs font-mono text-muted-foreground/80">
            Learn &rarr; Practice &rarr; Build Skills &rarr; Prepare for Careers
          </p>
        </div>

        <div className="md:col-span-2">
          <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-4">
            Platform
          </h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/learning" className="hover:text-accent transition-colors">
                Learning Paths
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-accent transition-colors">
                Course Catalogue
              </Link>
            </li>
            <li>
              <Link to="/practice" className="hover:text-accent transition-colors">
                Coding Practice
              </Link>
            </li>
            <li>
              <Link to="/ai-tutor" className="hover:text-accent transition-colors">
                AI Practice Tutor
              </Link>
            </li>
            <li>
              <Link to="/career" className="hover:text-accent transition-colors">
                Career Preparation
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-4">
            Company & Legal
          </h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-accent transition-colors">
                About BUCKLABS
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-accent transition-colors">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-3">
            Beta Release Updates
          </h5>
          <p className="text-xs text-muted-foreground mb-4">
            Get notified when new curated problem tracks and career tools launch.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={handleNewsletterSubmit}
            noValidate
          >
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="footer-newsletter-hp">Leave blank</label>
              <input
                id="footer-newsletter-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              disabled={submitting}
              className="bg-card px-4 py-2.5 rounded-xl text-sm ring-1 ring-white/10 focus:ring-2 focus:ring-accent outline-none w-full text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
            >
              {submitting ? "Saving..." : "Subscribe"}
            </button>
          </form>
          {subscribedEmail && (
            <p className="mt-2 text-xs text-emerald-400">
              Confirmed subscription for {subscribedEmail}.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground/75">
            We only send product updates. View our{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground">
        <span>&copy; 2026 BUCKLABS AI Learning Systems. Controlled Beta Release.</span>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

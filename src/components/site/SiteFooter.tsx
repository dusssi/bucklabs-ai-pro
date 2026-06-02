import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-xs">
          <span className="font-display text-2xl tracking-wider text-accent mb-4 block">BUCKLABS</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The definitive career operating system for the next generation of global technology talent.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
          <div>
            <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-6">Platform</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-accent transition-colors">Curriculum</Link></li>
              <li><Link to="/career" className="hover:text-accent transition-colors">AI Tutor</Link></li>
              <li><Link to="/career" className="hover:text-accent transition-colors">Career Hub</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-6">Company</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h5 className="text-xs font-mono uppercase tracking-widest text-foreground mb-6">Newsletter</h5>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="bg-card px-4 py-2 rounded-lg text-sm ring-1 ring-white/10 focus:ring-accent outline-none w-full text-foreground"
              />
              <button type="submit" className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-bold">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <span>© 2026 BUCKLABS Learning Systems</span>
        <div className="flex gap-8">
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-2xl tracking-wider text-accent">
            BUCKLABS
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/courses" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Courses</Link>
            <Link to="/career" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Career Hub</Link>
            <Link to="/about" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Contact</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:inline">
                Login
              </Link>
              <Link to="/register">
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
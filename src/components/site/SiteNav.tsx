import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Code2,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCurrentAuthUser,
  signOutUser,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/services/platform-store";
import { toast } from "sonner";

const NAV_ITEMS = [
  { to: "/learning", label: "Learning Paths", icon: Compass },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/practice", label: "Coding Practice", icon: Code2 },
  { to: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/career", label: "Career Prep", icon: Briefcase },
] as const;

export function SiteNav() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCurrentAuthUser().then((u) => {
      if (mounted) setUser(u);
    });
    const unsubscribe = subscribeToAuthChanges((u) => {
      if (mounted) setUser(u);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setMobileOpen(false);
    toast.success("Signed out of your session.");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/85 backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <span className="size-8 rounded-lg bg-primary/20 ring-1 ring-accent/40 grid place-items-center font-mono text-xs font-bold text-accent">
              BL
            </span>
            <span className="font-display text-2xl tracking-wider text-foreground">
              BUCKLABS <span className="text-accent">AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 rounded-lg hover:text-foreground hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                activeProps={{
                  className: "text-foreground bg-white/5 ring-1 ring-white/10",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-accent/15 text-accent ring-1 ring-accent/30 hover:bg-accent/25 transition-colors"
                activeProps={{
                  className: "bg-accent text-accent-foreground font-semibold",
                }}
              >
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                activeProps={{
                  className: "text-foreground bg-white/5",
                }}
                title={user.email}
              >
                <User className="size-4 text-accent" />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-4 mr-1.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
              <Link to="/register">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                  Start Learning
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4">
          <div className="grid gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5"
                  activeProps={{
                    className: "text-foreground bg-white/5 ring-1 ring-white/10",
                  }}
                >
                  <Icon className="size-4 text-accent" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <span>About BUCKLABS</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <span>Contact</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-accent/15 text-accent font-semibold text-sm"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-card ring-1 ring-white/10 text-foreground text-sm"
                >
                  <User className="size-4 text-accent" />
                  Profile & Onboarding ({user.fullName})
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-2.5 rounded-xl bg-card ring-1 ring-white/10 text-sm font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Start Learning
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

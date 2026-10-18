import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, Sparkles, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  clearAllUserData,
  getCurrentAuthUser,
  getLearnerProfile,
  signOutUser,
  updateLearnerProfile,
  type AuthUser,
  type LearnerProfile,
} from "@/services/platform-store";
import { LEARNING_GOALS, LEARNING_LEVELS, PREFERRED_LANGUAGES } from "@/lib/validation";
import { careerRoadmaps } from "@/data/career-roadmaps";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Learner Profile & Onboarding — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Manage your learning preferences, preferred programming language, career goals, and account privacy settings.",
      },
    ],
  }),
  component: ProfilePage,
});

const INTEREST_OPTIONS = [
  "Data Structures and Algorithms",
  "Python Development",
  "Full Stack Web",
  "Databases & SQL",
  "AI & Machine Learning",
  "System Design",
  "Cloud & DevSecOps",
  "Technical Interviews",
] as const;

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [learningLevel, setLearningLevel] = useState<(typeof LEARNING_LEVELS)[number]>("Beginner");
  const [primaryGoal, setPrimaryGoal] = useState<string>(LEARNING_GOALS[1]);
  const [preferredLanguage, setPreferredLanguage] =
    useState<(typeof PREFERRED_LANGUAGES)[number]>("Python");
  const [targetRole, setTargetRole] = useState<string>(careerRoadmaps[0].roleTitle);
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const authUser = await getCurrentAuthUser();
      if (!active) return;
      if (!authUser) {
        navigate({ to: "/login" });
        return;
      }
      setUser(authUser);
      const loaded = await getLearnerProfile(authUser.id);
      if (!active) return;
      setProfile(loaded);
      setDisplayName(loaded.displayName || authUser.fullName);
      setLearningLevel(loaded.learningLevel);
      setPrimaryGoal(loaded.primaryGoal || LEARNING_GOALS[1]);
      setPreferredLanguage(loaded.preferredLanguage);
      setTargetRole(loaded.targetRole || careerRoadmaps[0].roleTitle);
      setAreasOfInterest(loaded.areasOfInterest);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const toggleInterest = (interest: string) => {
    setAreasOfInterest((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateLearnerProfile(user.id, {
        displayName,
        learningLevel,
        primaryGoal,
        preferredLanguage,
        areasOfInterest,
        targetRole,
        onboardingCompleted: true,
      });
      setProfile(updated);
      toast.success("Learner preferences saved. Redirecting to your dashboard.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAccountData = async () => {
    if (!user) return;
    await clearAllUserData(user.id);
    await signOutUser();
    toast.success("Your learning activity, bookmarks, and profile data have been cleared.");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <SiteNav />
        <main className="max-w-3xl mx-auto px-6 py-20 space-y-6">
          <div className="h-8 w-48 rounded-lg bg-card animate-pulse" />
          <div className="h-96 rounded-2xl bg-card animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent block mb-2">
              {profile?.onboardingCompleted
                ? "Profile & Learning Preferences"
                : "Step 1 · Learner Onboarding"}
            </span>
            <h1 className="font-display text-5xl tracking-tight leading-none">
              Personalize Your Learning Path
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as <strong className="text-foreground">{user?.email}</strong>. Your
              preferences power dashboard recommendations and AI tutor defaults.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card ring-1 ring-white/10 text-xs font-mono hover:bg-white/5 self-start"
          >
            Skip to Dashboard &rarr;
          </Link>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-card rounded-2xl ring-1 ring-white/10 p-6 sm:p-8 space-y-8"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="profile-display-name"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Display Name
              </label>
              <input
                id="profile-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={80}
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="profile-preferred-language"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Preferred Programming Language
              </label>
              <select
                id="profile-preferred-language"
                value={preferredLanguage}
                onChange={(e) =>
                  setPreferredLanguage(e.target.value as (typeof PREFERRED_LANGUAGES)[number])
                }
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {PREFERRED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Current Learning Level
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              {LEARNING_LEVELS.map((lvl) => {
                const active = learningLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLearningLevel(lvl)}
                    className={`p-4 rounded-xl text-left ring-1 transition-all ${
                      active
                        ? "bg-primary/20 ring-accent text-foreground"
                        : "bg-background/60 ring-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="font-bold text-sm">{lvl}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lvl === "Beginner" && "Building core programming & foundational DSA habits"}
                      {lvl === "Intermediate" &&
                        "Solving medium problems & building full-stack/ML apps"}
                      {lvl === "Advanced" && "Optimizing complex systems, graphs, DP & interviews"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="profile-primary-goal"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Primary Learning Goal
              </label>
              <select
                id="profile-primary-goal"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {LEARNING_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-target-role"
                className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Target Career Role
              </label>
              <select
                id="profile-target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {careerRoadmaps.map((role) => (
                  <option key={role.id} value={role.roleTitle}>
                    {role.roleTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Areas of Interest (Select any)
            </span>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = areasOfInterest.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium ring-1 transition-all ${
                      selected
                        ? "bg-accent text-accent-foreground ring-accent font-semibold"
                        : "bg-background/60 text-muted-foreground ring-white/10 hover:text-foreground"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Saved directly to your isolated learner profile</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <UserCheck className="size-4" />
              <span>{saving ? "Saving preferences..." : "Save & Continue"}</span>
            </button>
          </div>
        </form>

        {/* Data Privacy & Account Management */}
        <section className="bg-card/60 rounded-2xl ring-1 ring-white/10 p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold">Account Data &amp; Privacy Controls</h2>
              <p className="text-sm text-muted-foreground mt-1">
                You own your learning history, course progress, problem bookmarks, and notes. You
                can reset and delete all stored activity data associated with your account at any
                time.
              </p>
            </div>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/15 text-red-300 ring-1 ring-destructive/30 text-xs font-semibold hover:bg-destructive/25 transition-colors"
            >
              <Trash2 className="size-4" />
              <span>Reset &amp; Delete My Learning Data</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-destructive/15 ring-1 ring-destructive/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-red-200">
                Are you sure? This permanently removes your enrollments, bookmarks, practice
                history, and profile preferences and signs you out.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 rounded-lg bg-background text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAccountData}
                  className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

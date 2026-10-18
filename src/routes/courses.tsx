import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, RotateCcw, Search } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { COURSE_CATEGORIES, COURSE_LEVELS, courses, filterCourses } from "@/data/courses";
import {
  getCurrentAuthUser,
  getUserEnrollments,
  type CourseEnrollmentRecord,
} from "@/services/platform-store";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — BUCKLABS AI" },
      {
        name: "description",
        content:
          "Browse verified courses in Programming Fundamentals, Data Structures & Algorithms, Full Stack, AI/ML, Data Science, Cloud, and Security.",
      },
      { property: "og:title", content: "Courses — BUCKLABS AI" },
      {
        property: "og:description",
        content: "Structured, modular engineering courses connected to coding practice.",
      },
    ],
  }),
  component: CoursesLayoutOrIndex,
});

function CoursesLayoutOrIndex() {
  const childMatch = useMatch({
    from: "/courses/$courseId",
    shouldThrow: false,
  });

  if (childMatch) {
    return <Outlet />;
  }

  return <CoursesCataloguePage />;
}

function CoursesCataloguePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [level, setLevel] = useState<string>("All");
  const [enrollmentsByCourse, setEnrollmentsByCourse] = useState<
    Record<string, CourseEnrollmentRecord>
  >({});

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await getCurrentAuthUser();
      if (!active || !user) return;
      const list = await getUserEnrollments(user.id);
      if (!active) return;
      const map: Record<string, CourseEnrollmentRecord> = {};
      for (const item of list) {
        map[item.courseId] = item;
      }
      setEnrollmentsByCourse(map);
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = filterCourses(courses, { query, category, level });

  const handleReset = () => {
    setQuery("");
    setCategory("All");
    setLevel("All");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="max-w-3xl">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent mb-3 block">
            Verified Course Catalogue
          </span>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.92]">
            All Courses
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Modular courses with verified learning outcomes, prerequisites, module checklists, and
            direct links to topic-matched coding problems.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-2xl p-5 ring-1 ring-white/10 space-y-4">
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <label htmlFor="course-search" className="sr-only">
                Search courses
              </label>
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="course-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by course title, topic, tag, or instructor..."
                className="w-full bg-background pl-10 pr-4 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="course-category" className="sr-only">
                Filter by category
              </label>
              <select
                id="course-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="course-level" className="sr-only">
                Filter by level
              </label>
              <select
                id="course-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-background px-3.5 py-2.5 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground"
              >
                {COURSE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level: {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
              {courses.length} published courses
            </span>
            {(query || category !== "All" || level !== "All") && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-accent hover:underline font-mono"
              >
                <RotateCcw className="size-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Course Grid or Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 ring-1 ring-white/10 text-center space-y-4">
            <BookOpen className="size-8 text-accent mx-auto" />
            <h2 className="text-xl font-bold">No courses match your filters</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try clearing your search term or selecting a broader category or difficulty level.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const enrollment = enrollmentsByCourse[course.id];
              return (
                <Link
                  key={course.id}
                  to="/courses/$courseId"
                  params={{ courseId: course.id }}
                  className="group bg-card rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-accent/40 transition-all flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded bg-accent/15 text-accent text-xs font-mono">
                        {course.category}
                      </span>
                      <span className="text-muted-foreground text-xs font-mono">
                        {course.level} · {course.duration}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">{course.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-background/60 text-xs text-muted-foreground ring-1 ring-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-background/50 border-t border-white/10 space-y-2">
                    {enrollment ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                            <CheckCircle2 className="size-3.5" />
                            {enrollment.status === "completed" ? "Completed" : "Enrolled"}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {enrollment.progress}% ({enrollment.completedModules.length}/
                            {course.curriculum.length} modules)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {course.curriculum.length} Modules · {course.relatedProblemIds.length}{" "}
                          Practice Problems
                        </span>
                        <span className="text-accent font-mono">View Course &rarr;</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

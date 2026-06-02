import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = courses.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.course.title} — BUCKLABS` },
          { name: "description", content: loaderData.course.description },
          { property: "og:title", content: loaderData.course.title },
          { property: "og:description", content: loaderData.course.description },
        ]
      : [{ title: "Course — BUCKLABS" }],
  }),
  component: CourseDetail,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-8">
      <p>Couldn't load this course: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-8 text-center">
      <div>
        <p className="font-display text-4xl mb-4">Course not found</p>
        <Link to="/courses" className="text-accent underline">Browse all courses</Link>
      </div>
    </div>
  ),
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <article className="pt-24 pb-24 max-w-5xl mx-auto px-6">
        <Link to="/courses" className="font-mono text-xs text-accent">&larr; Back to courses</Link>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[10px] font-mono">{course.category}</span>
          <span className="px-2 py-1 rounded bg-white/5 text-muted-foreground text-[10px] font-mono">{course.level}</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.9] mt-6">{course.title}</h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{course.long}</p>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Stat label="Duration" value={course.duration} />
          <Stat label="Lessons" value={String(course.lessons)} />
          <Stat label="Instructor" value={course.instructor} />
        </div>

        <div className="mt-12">
          <h2 className="font-display text-3xl mb-6">What you'll cover</h2>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-card ring-1 ring-white/5 text-sm">{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform">
            Enroll now
          </Link>
          <Link to="/courses" className="px-8 py-4 bg-card ring-1 ring-white/10 rounded-xl font-bold hover:bg-white/5 transition-colors">
            Back to catalog
          </Link>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl ring-1 ring-white/5 p-6">
      <p className="font-mono text-[10px] text-accent uppercase tracking-widest">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-primary/20 blur-[120px] rounded-full opacity-35 pointer-events-none" />
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between border-b border-white/5">
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
        >
          <span className="size-7 rounded-lg bg-primary/20 ring-1 ring-accent/40 grid place-items-center font-mono text-xs font-bold text-accent">
            BL
          </span>
          <span className="font-display text-2xl tracking-wider text-foreground">
            BUCKLABS <span className="text-accent">AI</span>
          </span>
        </Link>
        <Link
          to="/courses"
          className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse Catalogue &rarr;
        </Link>
      </header>
      <main className="relative z-10 max-w-md w-full mx-auto px-6 py-12">
        <span className="font-mono text-xs tracking-[0.25em] uppercase text-accent block mb-3">
          {subtitle}
        </span>
        <h1 className="font-display text-5xl tracking-tight leading-[0.95] mb-8">{title}</h1>
        <div className="bg-card ring-1 ring-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {children}
        </div>
        {footer && <p className="mt-6 text-sm text-muted-foreground text-center">{footer}</p>}
      </main>
      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground border-t border-white/5">
        <span>Protected by Supabase Auth &amp; Row-Level Security</span>
      </footer>
    </div>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  const inputId = `auth-field-${name}`;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        maxLength={255}
        className="w-full bg-background px-4 py-3 rounded-xl text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-accent outline-none text-foreground placeholder:text-muted-foreground/60 transition-shadow"
      />
    </div>
  );
}

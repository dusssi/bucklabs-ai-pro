import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-16 flex items-center">
        <Link to="/" className="font-display text-2xl tracking-wider text-accent">BUCKLABS</Link>
      </header>
      <main className="relative z-10 max-w-md mx-auto px-6 pt-12 pb-24">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent block mb-4">{subtitle}</span>
        <h1 className="font-display text-5xl tracking-tight leading-[0.9] mb-10">{title}</h1>
        <div className="bg-card ring-1 ring-white/5 rounded-2xl p-8">{children}</div>
        <p className="mt-6 text-sm text-muted-foreground text-center">{footer}</p>
      </main>
    </div>
  );
}

export function AuthField({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        maxLength={255}
        className="w-full bg-background px-4 py-3 rounded-lg text-sm ring-1 ring-white/10 focus:ring-accent outline-none text-foreground"
      />
    </div>
  );
}
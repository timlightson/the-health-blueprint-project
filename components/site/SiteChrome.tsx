import Link from "next/link";
import { BrandMark } from "@/components/site/BrandMark";
import { TAGLINE, DISCLAIMER, INSTAGRAM_HANDLE, INSTAGRAM_URL, GITHUB_URL } from "@/lib/site";

// ─── Shared platform chrome ───────────────────────────────────────────────────
// One nav + footer for the platform-level pages (home, Learn). The Blueprints
// keep their own in-lab header. Three sections, PhET/Brilliant-style:
// Learn (articles), Explore (the Blueprints), Apply (the future app).

export function SiteNav({ active }: { active?: "explore" | "learn" }) {
  const link = (href: string, label: string, key: "explore" | "learn", extra?: React.ReactNode) => (
    <Link
      href={href}
      className="text-sm font-medium px-3 py-2 rounded-full transition-colors inline-flex items-center gap-1.5"
      style={{ color: active === key ? "var(--ink)" : "var(--ink-soft)" }}
    >
      {label}{extra}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 lg-bar">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="The Health Blueprint home">
          <BrandMark size={30} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
            The Health Blueprint
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {link("/learn", "Learn", "learn")}
          {link("/#blueprints", "Explore", "explore")}
          <span
            className="text-sm font-medium px-3 py-2 rounded-full inline-flex items-center gap-1.5 cursor-default"
            style={{ color: "var(--ink-faint)" }}
            title="The personalized app, coming later"
          >
            Apply
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: "rgba(11,26,43,0.06)", color: "var(--ink-faint)" }}>soon</span>
          </span>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 px-6 sm:px-8 py-10 mt-8">
      <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="flex items-center gap-2.5">
          <BrandMark size={26} />
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            {TAGLINE}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{DISCLAIMER}</span>
          <Link href="/about" className="text-xs font-medium hover:underline" style={{ color: "var(--ink-soft)" }}>
            About
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: "var(--ink-soft)" }}>
            GitHub
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: "var(--ink-soft)" }}>
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </footer>
  );
}

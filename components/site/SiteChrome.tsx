import Link from "next/link";

// ─── Shared platform chrome ───────────────────────────────────────────────────
// One nav + footer for the platform-level pages (home, Learn). The Blueprints
// keep their own in-lab header. Three sections, PhET/Brilliant-style:
// Learn (articles), Explore (the Blueprints), Apply (the future app).

export function BlueprintMark({ size = 30 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl"
      style={{
        width: size, height: size,
        background: "linear-gradient(140deg, #0B1A2B 0%, #16384a 100%)",
        boxShadow: "0 4px 12px -4px rgba(11,26,43,0.4)",
      }}
    >
      <svg width={size * 0.53} height={size * 0.53} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 9 L5 9 L6.5 4 L9.5 12 L11 9 L14 9" stroke="#2DD4BF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

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
          <BlueprintMark />
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
          <BlueprintMark size={26} />
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Health lessons school never taught you.
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>For educational purposes only · not medical advice</span>
          <a href="https://www.instagram.com/thehealthblueprintproject" target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: "var(--ink-soft)" }}>
            @thehealthblueprintproject
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, FlaskConical, Instagram, Moon } from "lucide-react";
import { BrandMark } from "@/components/site/BrandMark";
import { labMeta } from "@/components/labs/labs-meta";

export const metadata: Metadata = {
  title: "Start here · The Health Blueprint",
  description:
    "Health lessons school never taught you. Interactive Blueprints, short cited reads, and one place to start: sleep.",
};

// ─── /start — the link-in-bio and QR landing page ─────────────────────────────
// One mobile-first column of large cards. This is the URL that goes on
// Instagram, QR codes, and anywhere else people arrive from off-site.

const INSTAGRAM_URL = "https://www.instagram.com/thehealthblueprintproject";

interface StartCard {
  href: string;
  external?: boolean;
  title: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone: string;
  featured?: boolean;
}

const CARDS: StartCard[] = [
  {
    href: "/labs/sleep",
    title: "Try the Sleep Blueprint",
    sub: "Build your real week and watch what stacks up by Friday.",
    icon: Moon,
    tone: "#0E8A7D",
    featured: true,
  },
  {
    href: "/#blueprints",
    title: "Explore every Blueprint",
    sub: "Nine interactive labs. Move the controls, watch real data respond.",
    icon: FlaskConical,
    tone: "#2563EB",
  },
  {
    href: "/learn",
    title: "Read the articles",
    sub: "Short, cited answers to the health stuff school skips.",
    icon: BookOpen,
    tone: "#C9760F",
  },
  {
    href: INSTAGRAM_URL,
    external: true,
    title: "Follow on Instagram",
    sub: "@thehealthblueprintproject",
    icon: Instagram,
    tone: "#D8443B",
  },
  {
    href: "/about",
    title: "About the project",
    sub: "Why this exists and the rules every page follows.",
    icon: Compass,
    tone: "#5A6675",
  },
];

export default function StartPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />

      <main className="relative z-10 flex-1 flex flex-col items-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Identity */}
          <BrandMark size={64} />
          <h1
            className="mt-5 font-bold text-center hb-reveal"
            style={{ fontSize: "1.6rem", letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}
          >
            The Health Blueprint
          </h1>
          <p className="mt-2 text-center text-sm hb-reveal" style={{ color: "var(--ink-soft)", animationDelay: "80ms" }}>
            Health lessons school never taught you.
          </p>
          <div className="hb-tick-rule mt-6 w-40" aria-hidden="true" />

          {/* Cards */}
          <div className="mt-8 w-full flex flex-col gap-3">
            {CARDS.map((card, i) => {
              const Icon = card.icon;
              const inner = (
                <div className="flex items-center gap-4 p-4">
                  <span
                    className="inline-flex items-center justify-center rounded-2xl flex-shrink-0"
                    style={{
                      width: 46,
                      height: 46,
                      background: `${card.tone}14`,
                      border: `1px solid ${card.tone}2E`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.tone }} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}>
                      {card.title}
                    </span>
                    <span className="block text-[13px] mt-0.5 leading-snug" style={{ color: "var(--ink-soft)" }}>
                      {card.sub}
                    </span>
                  </span>
                  {card.external ? (
                    <ArrowUpRight className="w-4 h-4 flex-shrink-0" style={{ color: card.tone }} />
                  ) : (
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: card.tone }} />
                  )}
                </div>
              );
              const style: React.CSSProperties = {
                borderRadius: 22,
                animationDelay: `${140 + i * 70}ms`,
                ...(card.featured
                  ? { background: `linear-gradient(150deg, ${card.tone}14, rgba(255,255,255,0.5))` }
                  : {}),
              };
              return card.external ? (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block lg lg-hover hb-reveal"
                  style={style}
                >
                  {inner}
                </a>
              ) : (
                <Link key={card.title} href={card.href} className="block lg lg-hover hb-reveal" style={style}>
                  {inner}
                </Link>
              );
            })}
          </div>

          <p className="mt-8 text-xs text-center" style={{ color: "var(--ink-faint)" }}>
            Free · no sign-up · for educational purposes only, not medical advice
          </p>
        </div>
      </main>
    </div>
  );
}

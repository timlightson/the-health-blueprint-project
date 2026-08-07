import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import { ARTICLES } from "@/lib/articles";
import { labMeta } from "@/components/labs/labs-meta";

export const metadata: Metadata = {
  title: "Learn · The Health Blueprint",
  description: "Short, cited explainers on the health stuff school skips. Every one hands off to an interactive Blueprint.",
};

const KIND_COLOR: Record<string, string> = { Explainer: "#0E8A7D", Myth: "#C9760F", Research: "#2563EB" };

export default function LearnIndex() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav active="learn" />

      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Learn</p>
          <h1 className="mt-3 font-bold" style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", lineHeight: 1.02, letterSpacing: "-0.035em", color: "var(--ink)" }}>
            The stuff school skips.
          </h1>
          <p className="mt-4 text-lg max-w-2xl" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
            Short reads that answer one real question, backed by actual research. Each one ends where the explaining stops being enough: an interactive Blueprint you can play with.
          </p>
          <div className="hb-tick-rule mt-7 max-w-xs" aria-hidden="true" />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {ARTICLES.map((a) => {
              const lab = labMeta(a.lab);
              return (
                <Link key={a.slug} href={`/learn/${a.slug}`} className="group block lg lg-hover" style={{ borderRadius: 22, overflow: "hidden" }}>
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: KIND_COLOR[a.kind], background: `${KIND_COLOR[a.kind]}14`, border: `1px solid ${KIND_COLOR[a.kind]}33` }}>{a.kind}</span>
                      <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{a.minutes} min read</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: lab.accent }}>{a.question}</p>
                    <h2 className="text-xl font-bold mt-1.5" style={{ color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{a.title}</h2>
                    <p className="text-sm mt-2 leading-relaxed flex-1" style={{ color: "var(--ink-soft)" }}>{a.dek}</p>
                    <div className="flex items-center gap-1.5 mt-4 pt-3 text-sm font-semibold" style={{ borderTop: "1px solid var(--hairline)", color: lab.accent }}>
                      Read, then open the {lab.name} Blueprint
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-sm mt-10" style={{ color: "var(--ink-faint)" }}>
            More on the way. Every Instagram post becomes a full article here.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import { ARTICLES, articleBySlug } from "@/lib/articles";
import { labMeta } from "@/components/labs/labs-meta";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return { title: "Article not found" };
  return { title: `${a.title} · The Health Blueprint`, description: a.dek };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();
  const lab = labMeta(a.lab);
  const Icon = lab.icon;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav active="learn" />

      <main className="flex-1 relative z-10">
        <article className="max-w-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium lg-pill rounded-full pl-2.5 pr-4 py-2" style={{ color: "var(--ink-soft)" }}>
            <ArrowLeft className="w-4 h-4" /> All of Learn
          </Link>

          <p className="mt-8 text-sm font-semibold" style={{ color: lab.accent }}>{a.question}</p>
          <h1 className="mt-2 font-bold" style={{ fontSize: "clamp(2rem, 5.5vw, 3rem)", lineHeight: 1.04, letterSpacing: "-0.03em", color: "var(--ink)" }}>
            {a.title}
          </h1>
          <p className="mt-4 text-lg" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>{a.dek}</p>
          <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: "var(--ink-faint)" }}>
            <span>{a.kind}</span><span>·</span><span>{a.minutes} min read</span>
          </div>
          <div className="hb-tick-rule mt-6 max-w-[220px]" aria-hidden="true" />

          <div className="mt-8 space-y-6">
            {a.blocks.map((b, i) => (
              <div key={i}>
                {b.h && <h2 className="text-lg font-bold mb-2" style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}>{b.h}</h2>}
                <p style={{ color: "var(--ink-soft)", lineHeight: 1.7, fontSize: "1.0625rem" }}>{b.p}</p>
              </div>
            ))}
          </div>

          {/* Handoff to the Blueprint */}
          <Link href={`/labs/${a.lab}`} className="group block lg lg-hover mt-10" style={{ borderRadius: 22, overflow: "hidden" }}>
            <div className="p-6 flex items-center justify-between gap-5" style={{ background: `linear-gradient(150deg, ${lab.tint}, transparent 80%)` }}>
              <div>
                <p className="hb-kicker" style={{ color: lab.accent }}>Now try it yourself</p>
                <h3 className="text-xl font-bold mt-1.5" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>Open the {lab.name} Blueprint</h3>
                <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>{lab.description}</p>
              </div>
              <span className="flex items-center justify-center rounded-full flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ width: 46, height: 46, background: lab.iconBg, border: "1px solid rgba(255,255,255,0.65)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${lab.iconShadow}`, color: lab.accent }}>
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>

          {/* Sources */}
          <div className="mt-8 pt-5" style={{ borderTop: "1px solid var(--hairline)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>Sources</p>
            <ul className="space-y-1">
              {a.sources.map((s, i) => (
                <li key={i} className="text-xs" style={{ color: "var(--ink-faint)" }}>{s}</li>
              ))}
            </ul>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LABS, LAB_TAGS, labMeta, type LabMeta } from "@/components/labs/labs-meta";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";
import { BlueprintAtlas, BlueprintVisual } from "@/components/visuals/BlueprintVisual";
import { ARTICLES } from "@/lib/articles";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sleep = labMeta("sleep");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav active="explore" />

      <main className="relative z-10 flex-1 px-6 sm:px-8">
        <div className="w-full max-w-6xl mx-auto py-14 sm:py-20">
          <section className="grid lg:grid-cols-[1.07fr_.93fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="hb-kicker hb-reveal-fade" style={{ color: "var(--teal-deep)", animationDelay: "60ms" }}>
                Cited explainers · interactive models
              </p>
              <h1 className="mt-5 font-bold hb-reveal" style={{ fontSize: "clamp(2.5rem, 6.4vw, 4.8rem)", lineHeight: 0.99, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "120ms" }}>
                Health, explained in
                <br />
                <span className="hb-ink-gradient">working models</span>.
              </h1>
              <p className="mt-7 text-lg sm:text-xl max-w-xl hb-reveal" style={{ color: "var(--ink-soft)", lineHeight: 1.55, animationDelay: "220ms" }}>
                Read a short explanation, then open an interactive Blueprint to compare inputs in a simplified, cited model. Free, no sign-up.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 hb-reveal" style={{ animationDelay: "300ms" }}>
                <Link href="#blueprints" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6" style={{ minHeight: 48, background: "linear-gradient(160deg, #16384a, #0B1A2B)", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px -12px rgba(11,26,43,0.6)" }}>
                  Explore the Blueprints <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/learn" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6 lg-pill" style={{ minHeight: 48, color: "var(--ink-soft)" }}>
                  Start with an article
                </Link>
              </div>
            </div>
            <BlueprintAtlas className="hb-reveal" />
          </section>

          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>How it works</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              One idea, two ways in.
            </h2>
            <p className="mt-3 max-w-2xl" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
              Start with the explanation or test the idea in a simplified model. Both routes show their assumptions and sources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              {[
                { icon: BookOpen, tone: "#0E8A7D", title: "Learn", body: "Short, cited explainers that answer one specific health question.", href: "/learn", cta: "Read the articles" },
                { icon: FlaskConical, tone: "#2563EB", title: "Explore", body: "Interactive Blueprints for changing inputs and examining an educational model.", href: "#blueprints", cta: "Open a Blueprint" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href} className="group block lg lg-hover" style={{ borderRadius: 22 }}>
                    <div className="p-6 h-full flex flex-col">
                      <span className="inline-flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: `${item.tone}14`, border: `1px solid ${item.tone}2E` }}>
                        <Icon className="w-5 h-5" style={{ color: item.tone }} />
                      </span>
                      <h3 className="text-lg font-bold mt-4" style={{ color: "var(--ink)" }}>{item.title}</h3>
                      <p className="text-sm mt-1.5 leading-relaxed flex-1" style={{ color: "var(--ink-soft)" }}>{item.body}</p>
                      <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: item.tone }}>
                        {item.cta}<ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: sleep.accent }}>Featured Blueprint</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>Start with sleep.</h2>
            <Link href="/labs/sleep" className="group block lg lg-hover mt-6" style={{ borderRadius: 26, overflow: "hidden" }}>
              <div className="grid md:grid-cols-[1.08fr_.92fr] items-stretch">
                <div className="relative flex items-center justify-center p-6 sm:p-8" style={{ background: `linear-gradient(165deg, ${sleep.tint}, rgba(255,255,255,0) 80%)`, minHeight: 260 }}>
                  <BlueprintVisual lab="sleep" mode="hero" />
                </div>
                <div className="p-7 sm:p-9 flex flex-col justify-center">
                  <h3 className="font-bold" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>{sleep.headline}</h3>
                  <p className="mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>{sleep.description}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-lg font-bold tabular-nums" style={{ color: sleep.accent }}>{sleep.stat}</span>
                    <span className="text-sm" style={{ color: "var(--ink-faint)" }}>{sleep.statLabel}</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: sleep.accent }}>
                    Open the Sleep Blueprint <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </section>

          <section id="blueprints" className="mt-20 sm:mt-24" style={{ scrollMarginTop: 80 }}>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Explore</p>
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>Every Blueprint</h2>
              </div>
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>{LABS.length} live · more on the way</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {LABS.map((lab, index) => <LabCard key={lab.id} lab={lab} delay={index * 60} mounted={mounted} />)}
            </div>
          </section>

          <section className="mt-20 sm:mt-24">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Learn</p>
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>Read the evidence first.</h2>
              </div>
              <Link href="/learn" className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--teal-deep)" }}>
                See all articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {ARTICLES.slice(0, 3).map((article) => {
                const lab = labMeta(article.lab);
                return (
                  <Link key={article.slug} href={`/learn/${article.slug}`} className="group block lg lg-hover overflow-hidden" style={{ borderRadius: 20 }}>
                    <BlueprintVisual lab={article.lab} mode="mark" className="rounded-none border-x-0 border-t-0" />
                    <div className="p-5 flex flex-col h-full">
                      <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{article.kind} · {article.minutes} min</span>
                      <p className="text-sm font-semibold mt-2" style={{ color: lab.accent }}>{article.question}</p>
                      <h3 className="text-base font-bold mt-1" style={{ color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{article.title}</h3>
                      <span className="mt-3 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: lab.accent }}>
                        Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LabCard({ lab, delay, mounted }: { lab: LabMeta; delay: number; mounted: boolean }) {
  return (
    <Link
      href={`/labs/${lab.id}`}
      className="group relative flex flex-col transition-transform hover:-translate-y-1.5 focus-visible:-translate-y-1.5"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? undefined : "translateY(24px)",
        transition: `opacity 0.7s var(--ease-spring) ${delay}ms, transform 0.45s var(--ease-spring) ${mounted ? 0 : delay}ms`,
      }}
    >
      <LiquidGlass radius={24} bezel={20} scale={44} tint={0.16} className="flex-1 flex flex-col" style={{ overflow: "hidden" }}>
        <div className="relative p-4 pb-2" style={{ background: `linear-gradient(180deg, ${lab.tint} 0%, rgba(255,255,255,0) 90%)` }}>
          <span className="absolute z-10 top-4 left-5 text-xs font-mono font-semibold" style={{ color: lab.accent, opacity: 0.72, letterSpacing: "0.05em" }}>{lab.index}</span>
          <span className="absolute z-10 top-3.5 right-4 text-[10px] font-semibold uppercase" style={{ color: lab.accent, letterSpacing: "0.1em", padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,0.62)", border: `1px solid ${lab.accent}2E`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}>{LAB_TAGS[lab.id]}</span>
          <BlueprintVisual lab={lab.id} mode="card" className="mt-8" />
        </div>
        <div className="flex-1 flex flex-col px-6 pb-6 pt-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>{lab.title}</h2>
            <span className="inline-flex items-center justify-center rounded-full transition-all group-hover:translate-x-0.5 group-hover:text-white" style={{ width: 30, height: 30, backgroundColor: lab.tint, color: lab.accent }}>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{lab.description}</p>
          <div className="mt-5 pt-4 flex items-baseline gap-2" style={{ borderTop: "1px solid rgba(11,26,43,0.08)" }}>
            <span className="text-lg font-bold tabular-nums" style={{ color: lab.accent }}>{lab.stat}</span>
            <span className="text-xs leading-snug" style={{ color: "var(--ink-faint)" }}>{lab.statLabel}</span>
          </div>
        </div>
      </LiquidGlass>
    </Link>
  );
}

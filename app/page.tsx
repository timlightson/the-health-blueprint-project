"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, Smartphone, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import BlueprintArt from "@/components/home/BlueprintArt";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import { LABS, LAB_TAGS, labMeta, type LabMeta } from "@/components/labs/labs-meta";
import { ARTICLES } from "@/lib/articles";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sleep = labMeta("sleep");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav active="explore" />

      <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 px-6 sm:px-8">
        <div className="w-full max-w-6xl mx-auto py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="hb-kicker hb-reveal-fade" style={{ color: "var(--teal-deep)", animationDelay: "60ms" }}>
              Interactive health education
            </p>
            <h1 className="mt-5 font-bold hb-reveal" style={{ fontSize: "clamp(2.5rem, 7vw, 4.8rem)", lineHeight: 0.99, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "120ms" }}>
              See what&apos;s actually
              <br />
              happening{" "}
              <span className="hb-ink-gradient">inside your body</span>.
            </h1>
            <p className="mt-7 text-lg sm:text-xl max-w-xl hb-reveal" style={{ color: "var(--ink-soft)", lineHeight: 1.55, animationDelay: "220ms" }}>
              The Health Blueprint pairs short, cited explainers with interactive models. Adjust familiar habits and see how each model changes. Free, with no account required.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 hb-reveal" style={{ animationDelay: "300ms" }}>
              <Link href="#blueprints" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6"
                style={{ minHeight: 48, background: "linear-gradient(160deg, #16384a, #0B1A2B)", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px -12px rgba(11,26,43,0.6)" }}>
                Explore the Blueprints <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/learn" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6 lg-pill" style={{ minHeight: 48, color: "var(--ink-soft)" }}>
                Start with an article
              </Link>
            </div>
          </div>

          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>How it works</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              One idea, three ways in.
            </h2>
            <p className="mt-3 max-w-2xl" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
              Most health problems are easier to understand before they start. So the goal is not to scare you, it is to show you how your body works while you can still do something about it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              {[
                { icon: BookOpen, tone: "#0E8A7D", title: "Learn", body: "Short explainers that answer a specific health question and name the supporting research.", href: "/learn", cta: "Read the articles", live: true },
                { icon: FlaskConical, tone: "#2563EB", title: "Explore", body: "Interactive Blueprints that show how a simplified model responds when you change its inputs.", href: "#blueprints", cta: "Open a Blueprint", live: true },
                { icon: Smartphone, tone: "#C9760F", title: "Apply", body: "A planned personal app for relating the same concepts to your own habits.", href: undefined, cta: "Coming soon", live: false },
              ].map((p) => {
                const PIcon = p.icon;
                const inner = (
                  <div className="p-6 h-full flex flex-col">
                    <span className="inline-flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: `${p.tone}14`, border: `1px solid ${p.tone}2E` }}>
                      <PIcon className="w-5 h-5" style={{ color: p.tone }} />
                    </span>
                    <h3 className="text-lg font-bold mt-4" style={{ color: "var(--ink)" }}>{p.title}</h3>
                    <p className="text-sm mt-1.5 leading-relaxed flex-1" style={{ color: "var(--ink-soft)" }}>{p.body}</p>
                    <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: p.live ? p.tone : "var(--ink-faint)" }}>
                      {p.cta}{p.live && <ArrowRight className="w-4 h-4" />}
                    </div>
                  </div>
                );
                return p.href ? (
                  <Link key={p.title} href={p.href} className="group block lg lg-hover" style={{ borderRadius: 22 }}>{inner}</Link>
                ) : (
                  <div key={p.title} className="lg" style={{ borderRadius: 22, opacity: 0.82 }}>{inner}</div>
                );
              })}
            </div>
          </section>

          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: sleep.accent }}>Featured Blueprint</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              Start with sleep.
            </h2>
            <Link href="/labs/sleep" className="blueprint-feature group block lg mt-6" style={{ borderRadius: 28, overflow: "hidden" }}>
              <div className="grid md:grid-cols-[1.08fr_.92fr] items-stretch">
                <div className="blueprint-feature-art relative" style={{ minHeight: 280 }}>
                  <BlueprintArt id="sleep" hovered={false} reduced={reduced} featured />
                  <span className="blueprint-live-chip"><i /> Interactive preview</span>
                </div>
                <div className="p-7 sm:p-9 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="blueprint-number" style={{ color: sleep.accent }}>01</span>
                    <span className="blueprint-category" style={{ color: sleep.accent, borderColor: `${sleep.accent}32` }}>Recovery</span>
                  </div>
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
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
                  Every Blueprint
                </h2>
              </div>
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>{LABS.length} live · more on the way</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {LABS.map((lab, i) => (
                <LabCard key={lab.id} lab={lab} delay={i * 60} mounted={mounted} reduced={reduced} />
              ))}
            </div>
          </section>

          <section className="mt-20 sm:mt-24">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Learn</p>
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
                  Clear answers, with sources.
                </h2>
              </div>
              <Link href="/learn" className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--teal-deep)" }}>
                See all of Learn <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {ARTICLES.slice(0, 3).map((a) => {
                const lab = labMeta(a.lab);
                return (
                  <Link key={a.slug} href={`/learn/${a.slug}`} className="group block lg lg-hover" style={{ borderRadius: 20 }}>
                    <div className="p-5 flex flex-col h-full">
                      <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{a.kind} · {a.minutes} min</span>
                      <p className="text-sm font-semibold mt-2" style={{ color: lab.accent }}>{a.question}</p>
                      <h3 className="text-base font-bold mt-1" style={{ color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{a.title}</h3>
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

function LabCard({
  lab,
  delay,
  mounted,
  reduced,
}: {
  lab: LabMeta;
  delay: number;
  mounted: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/labs/${lab.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="blueprint-card group relative flex flex-col"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? (hovered ? "translateY(-7px)" : "translateY(0)") : "translateY(24px)",
        transition: mounted
          ? "transform 0.5s var(--spring), filter 0.45s ease"
          : `opacity 0.7s var(--ease-glass) ${delay}ms, transform 0.7s var(--ease-glass) ${delay}ms`,
      }}
    >
      <LiquidGlass radius={24} bezel={20} scale={44} tint={0.16} className="blueprint-card-shell flex-1 flex flex-col" style={{ overflow: "hidden" }}>
        <div className="blueprint-card-art relative">
          <BlueprintArt id={lab.id} hovered={hovered} reduced={reduced} />
          <span className="blueprint-card-open" aria-hidden="true"><ArrowRight size={15} /></span>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-6 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="blueprint-number" style={{ color: lab.accent }}>{lab.index}</span>
            <span className="blueprint-category" style={{ color: lab.accent, borderColor: `${lab.accent}32` }}>{LAB_TAGS[lab.id]}</span>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>{lab.title}</h2>
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

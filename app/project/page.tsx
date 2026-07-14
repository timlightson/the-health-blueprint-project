import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, Github, Instagram, Smartphone } from "lucide-react";
import { BrandMark } from "@/components/site/BrandMark";
import { LABS } from "@/components/labs/labs-meta";
import { TAGLINE, INSTAGRAM_HANDLE, INSTAGRAM_URL, GITHUB_URL, DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Health Blueprint · An interactive public health platform",
  description:
    "Health lessons school never taught you. Nine interactive Blueprints where teens play with real, cited data and watch their habits change the outcome.",
};

// ─── /project — the QR landing page ───────────────────────────────────────────
// The URL behind QR codes on resumes, college applications, posters, and
// presentations. One self-contained pitch: what this is, why it exists, and one
// primary action. A first-time reader should get it in under 30 seconds.

const PROOF = [
  { value: "9", label: "interactive Blueprints, live now" },
  { value: "100%", label: "of the numbers cited to real research" },
  { value: "$0", label: "free and open, no sign-up" },
];

const LADDER = [
  { icon: Instagram, tone: "#D8443B", step: "Instagram", line: "One question per post. Something you didn't know." },
  { icon: FlaskConical, tone: "#2563EB", step: "Website", line: "The full explanation, as a simulation you can play with." },
  { icon: Smartphone, tone: "#C9760F", step: "App", line: "Your habits, your data, your plan. Coming later." },
];

const FUTURE = ["Nutrition", "Exercise", "Screen Time", "Preventive Medicine"];

export default function ProjectPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />

      {/* Slim standalone header — QR arrivals get a self-contained page */}
      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
            The Health Blueprint
          </span>
        </div>
        <Link href="/" className="text-sm font-medium inline-flex items-center gap-1.5 lg-pill rounded-full px-4 py-2" style={{ color: "var(--ink-soft)" }}>
          Visit the website <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="relative z-10 flex-1">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <section className="pt-20 sm:pt-28 text-center max-w-3xl mx-auto">
            <p className="hb-kicker hb-reveal-fade" style={{ color: "var(--teal-deep)" }}>
              An interactive public health platform
            </p>
            <h1
              className="mt-5 font-bold hb-reveal"
              style={{ fontSize: "clamp(2.4rem, 6.5vw, 4.2rem)", lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "100ms" }}
            >
              Health lessons school
              <br />
              <span className="hb-ink-gradient">never taught you</span>.
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl mx-auto hb-reveal"
              style={{ color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: "36rem", animationDelay: "200ms" }}
            >
              Teens don&apos;t need another lecture about sleep. They need to set their real
              schedule and watch their reaction time slide. The Health Blueprint turns
              preventive health into simulations you can play with.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 hb-reveal" style={{ animationDelay: "300ms" }}>
              <Link
                href="/labs/sleep"
                className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-7"
                style={{
                  minHeight: 50,
                  background: "linear-gradient(160deg, #16384a, #0B1A2B)",
                  color: "#fff",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px -12px rgba(11,26,43,0.6)",
                }}
              >
                Try the Sleep Blueprint <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6 lg-pill" style={{ minHeight: 50, color: "var(--ink-soft)" }}>
                Explore the website
              </Link>
            </div>
          </section>

          {/* ── PROOF STRIP ──────────────────────────────────────────── */}
          <section className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
            {PROOF.map((p) => (
              <div key={p.label}>
                <div className="text-3xl font-bold tabular-nums" style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}>{p.value}</div>
                <div className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>{p.label}</div>
              </div>
            ))}
          </section>
          <div className="hb-tick-rule mt-14 max-w-sm mx-auto" aria-hidden="true" />

          {/* ── MISSION ──────────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-16 max-w-2xl mx-auto text-center">
            <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>The mission</p>
            <h2 className="mt-3 font-bold" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              Most health problems are easier to understand before they start.
            </h2>
            <p className="mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              School covers the food pyramid and moves on. Nobody explains why you can&apos;t
              fall asleep after scrolling, or why everything feels personal on five hours of
              sleep. This project fills that gap with one rule: every number comes from real
              research, and the citation sits right next to the claim.
            </p>
          </section>

          {/* ── THE LADDER ───────────────────────────────────────────── */}
          <section className="mt-16 sm:mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {LADDER.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="lg p-5 text-center" style={{ borderRadius: 20 }}>
                    <span
                      className="inline-flex items-center justify-center rounded-2xl"
                      style={{ width: 42, height: 42, background: `${step.tone}14`, border: `1px solid ${step.tone}2E` }}
                    >
                      <Icon className="w-[18px] h-[18px]" style={{ color: step.tone }} />
                    </span>
                    <h3 className="text-base font-bold mt-3" style={{ color: "var(--ink)" }}>
                      <span className="tabular-nums" style={{ color: "var(--ink-faint)" }}>{i + 1}.</span> {step.step}
                    </h3>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{step.line}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── CURRENT BLUEPRINTS ───────────────────────────────────── */}
          <section className="mt-20 sm:mt-24">
            <div className="text-center max-w-2xl mx-auto">
              <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Live now</p>
              <h2 className="mt-3 font-bold" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
                Nine Blueprints, all playable today.
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {LABS.map((lab) => {
                const Icon = lab.icon;
                return (
                  <Link key={lab.id} href={`/labs/${lab.id}`} className="group lg lg-hover flex items-center gap-3.5 p-4" style={{ borderRadius: 18 }}>
                    <span
                      className="inline-flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ width: 38, height: 38, background: lab.tint, border: `1px solid ${lab.accent}2E` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: lab.accent }} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold" style={{ color: "var(--ink)" }}>{lab.name}</span>
                      <span className="block text-xs mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>{lab.headline}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: lab.accent }} />
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>On the way:</span>
              {FUTURE.map((f) => (
                <span key={f} className="text-xs font-semibold rounded-full px-3 py-1.5 lg-pill" style={{ color: "var(--ink-soft)" }}>
                  {f}
                </span>
              ))}
            </div>
          </section>

          {/* ── ABOUT + LINKS ────────────────────────────────────────── */}
          <section className="mt-20 sm:mt-24 max-w-2xl mx-auto text-center pb-4">
            <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>About the project</p>
            <p className="mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              The Health Blueprint is an independent student project: one person who noticed
              the gap in health education and started building the tools to fill it. The
              whole platform is open source, and every Instagram post grows into a cited
              article and an interactive Blueprint here.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {[
                { href: "/about", label: "Read the full story", external: false },
                { href: INSTAGRAM_URL, label: INSTAGRAM_HANDLE, external: true },
                { href: GITHUB_URL, label: "GitHub", external: true },
              ].map((l) =>
                l.external ? (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold lg-pill rounded-full px-5 py-2.5" style={{ color: "var(--ink-soft)" }}>
                    {l.label === "GitHub" && <Github className="w-4 h-4" />}
                    {l.label === INSTAGRAM_HANDLE && <Instagram className="w-4 h-4" />}
                    {l.label} <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link key={l.label} href={l.href} className="inline-flex items-center gap-1.5 text-sm font-semibold lg-pill rounded-full px-5 py-2.5" style={{ color: "var(--ink-soft)" }}>
                    <BookOpen className="w-4 h-4" /> {l.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ),
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-8">
        <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: "1px solid var(--hairline)" }}>
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{TAGLINE}</span>
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{DISCLAIMER}</span>
        </div>
      </footer>
    </div>
  );
}

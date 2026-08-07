import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, FlaskConical, Smartphone } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";

export const metadata: Metadata = {
  title: "About · The Health Blueprint",
  description:
    "How The Health Blueprint uses cited explainers and interactive models to make preventive health concepts easier to examine.",
};

const LADDER = [
  {
    icon: BookOpen,
    tone: "#0E8A7D",
    title: "Learn",
    body: "Short articles that answer one real question, like why you're always tired. Every claim is cited.",
  },
  {
    icon: FlaskConical,
    tone: "#2563EB",
    title: "Explore",
    body: "Interactive Blueprints that make assumptions visible and show how a simplified model responds.",
  },
  {
    icon: Smartphone,
    tone: "#C9760F",
    title: "Apply",
    body: "A personal app that turns all of this into habits built around you. Coming later.",
  },
];

const RULES = [
  {
    title: "Claims need support",
    body: "Health claims and quantitative estimates should be traceable to a named source. Simplified model outputs are labeled as estimates, not personal predictions.",
  },
  {
    title: "Sources you can check",
    body: "CDC, NIH, and peer-reviewed journals. The papers are named right next to the claims they back.",
  },
  {
    title: "No scare tactics",
    body: "The goal is to show you how your body works while you can still do something about it, not to frighten you into habits.",
  },
  {
    title: "Free, no sign-up",
    body: "Nothing is gated. Open a Blueprint, adjust it, and leave whenever.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav />

      <main id="main-content" tabIndex={-1} className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <p className="hb-kicker hb-reveal" style={{ color: "var(--teal-deep)" }}>About</p>
          <h1
            className="mt-3 font-bold hb-reveal"
            style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", lineHeight: 1.02, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "80ms" }}
          >
            Designed to make health evidence easier to examine.
          </h1>
          <p className="mt-5 text-lg hb-reveal" style={{ color: "var(--ink-soft)", lineHeight: 1.6, animationDelay: "160ms" }}>
            Common advice about sleep, hydration, stress, and attention often arrives without a clear explanation
            of the mechanism or the evidence. This project connects concise reading with models you can inspect.
          </p>
          <div className="hb-tick-rule mt-8 max-w-xs" aria-hidden="true" />

          {/* The idea */}
          <section className="mt-12">
            <h2 className="font-bold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
              The idea
            </h2>
            <p className="mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Preventive health is easier to use when the assumptions are visible. A short article can summarize
              the evidence; an interactive model can show how inputs relate to an estimated outcome. The Health
              Blueprint combines both, while separating educational models from medical advice or personal prediction.
            </p>
          </section>

          {/* The ladder */}
          <section className="mt-12">
            <h2 className="font-bold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
              One idea, three ways in
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {LADDER.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="lg p-5" style={{ borderRadius: 20 }}>
                    <span
                      className="inline-flex items-center justify-center rounded-2xl"
                      style={{ width: 40, height: 40, background: `${step.tone}14`, border: `1px solid ${step.tone}2E` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: step.tone, width: 18, height: 18 }} />
                    </span>
                    <h3 className="text-base font-bold mt-3" style={{ color: "var(--ink)" }}>{step.title}</h3>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{step.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* The rules */}
          <section className="mt-12">
            <h2 className="font-bold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
              The rules every page follows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {RULES.map((rule) => (
                <div key={rule.title} className="lg p-5" style={{ borderRadius: 20 }}>
                  <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>{rule.title}</h3>
                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{rule.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Handoff */}
          <Link href="/labs/sleep" className="group block lg lg-hover mt-12" style={{ borderRadius: 22, overflow: "hidden" }}>
            <div className="p-6 flex items-center justify-between gap-5" style={{ background: "linear-gradient(150deg, rgba(14,138,125,0.10), transparent 80%)" }}>
              <div>
                <p className="hb-kicker" style={{ color: "#0E8A7D" }}>Start here</p>
                <h3 className="text-xl font-bold mt-1.5" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  Open the Sleep Blueprint
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
                  Set your real week and see what your brain is actually working with.
                </p>
              </div>
              <span
                className="flex items-center justify-center rounded-full flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ width: 46, height: 46, background: "rgba(14,138,125,0.12)", border: "1px solid rgba(14,138,125,0.25)", color: "#0E8A7D" }}
              >
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>

          <p className="text-xs mt-10" style={{ color: "var(--ink-faint)" }}>
            The Health Blueprint is for education, not diagnosis or treatment. If something feels wrong with
            your health, talk to a doctor, not a website.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

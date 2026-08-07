import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, FlaskConical, Smartphone } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";

export const metadata: Metadata = {
  title: "About · The Health Blueprint",
  description:
    "Why The Health Blueprint exists: the health lessons school never taught you, built as interactive labs with real research behind every number.",
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
    body: "Interactive Blueprints. You move the controls, the data responds, and the mechanism clicks.",
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
    title: "Every number is real",
    body: "No made-up stats, no rounded-for-drama figures. If a Blueprint says reaction time drops 25%, there's a study behind it, and the citation is on the page.",
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
    body: "Nothing is gated. Open a Blueprint, play with it, leave whenever.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="lab-aurora" aria-hidden="true" />
      <SiteNav />

      <main className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <p className="hb-kicker hb-reveal" style={{ color: "var(--teal-deep)" }}>About</p>
          <h1
            className="mt-3 font-bold hb-reveal"
            style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", lineHeight: 1.02, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "80ms" }}
          >
            Built because health class didn&apos;t cover it.
          </h1>
          <p className="mt-5 text-lg hb-reveal" style={{ color: "var(--ink-soft)", lineHeight: 1.6, animationDelay: "160ms" }}>
            School teaches you the food pyramid and moves on. Nobody explains why you can&apos;t fall asleep
            after scrolling, why your energy crashes at 2 PM, or why everything feels personal when you&apos;re
            running on five hours. That gap is the whole reason this exists.
          </p>
          <div className="hb-tick-rule mt-8 max-w-xs" aria-hidden="true" />

          {/* The idea */}
          <section className="mt-12">
            <h2 className="font-bold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
              The idea
            </h2>
            <p className="mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Most health problems are easier to understand before they start. But the way this stuff usually
              gets taught, as warnings and worksheets, doesn&apos;t stick. What sticks is seeing it happen.
              So instead of another article telling you sleep matters, you get a simulation where you set your
              real schedule and watch your reaction time slide. The Health Blueprint is an independent health
              education project built on one belief: if you can play with a system, you understand it.
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

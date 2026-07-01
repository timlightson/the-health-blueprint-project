"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { LabHeader, HeaderBadge, NextLabCard, LabFooter } from "@/components/labs/LabChrome";
import LiquidGlass from "@/components/labs/LiquidGlass";
import YerkesDodson from "@/components/labs/YerkesDodson";

type StressEvent = {
  id: string;
  type: string;
  label: string;
  severity: number;
};

const stressEventTypes = [
  { type: "exam", label: "Exam", severity: 3, icon: "📝" },
  { type: "argument", label: "Argument", severity: 2, icon: "💬" },
  { type: "practice", label: "Practice", severity: 1, icon: "🏃" },
  { type: "deadline", label: "Deadline", severity: 3, icon: "⏰" },
  { type: "meeting", label: "Meeting", severity: 2, icon: "👥" },
];

const TEAL = "#0E8A7D";
const AMBER = "#C9760F";
const ROSE = "#D8443B";

// ─── Brain visualization ──────────────────────────────────────────────────────

function BrainViz({
  events,
  totalStress,
  color,
}: {
  events: StressEvent[];
  totalStress: number;
  color: string;
}) {
  return (
    <svg width="220" height="200" viewBox="0 0 200 180" style={{ overflow: "visible" }} aria-hidden="true">
      <defs>
        <radialGradient id="brainGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Outer aura — intensifies with stress */}
      <ellipse
        cx="100" cy="90" rx="92" ry="82"
        fill={color}
        opacity={0.04 + (totalStress / 100) * 0.10}
        style={{ transition: "opacity 0.6s ease, fill 0.6s ease" }}
      />

      {/* Brain body */}
      <ellipse
        cx="100" cy="90" rx="80" ry="70"
        fill="url(#brainGlow)"
        stroke={color}
        strokeWidth="2"
        style={{ transition: "stroke 0.6s ease" }}
      />

      {/* Folds */}
      {[
        "M50 70 Q80 60 100 70 Q120 60 150 70",
        "M40 95 Q70 85 100 95 Q130 85 160 95",
        "M50 120 Q80 110 100 120 Q120 110 150 120",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.45"
          style={{ transition: "stroke 0.6s ease" }} />
      ))}

      {/* Stressor nodes */}
      {events.map((event, index) => {
        const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
        const radius = 46;
        const x = 100 + Math.cos(angle) * radius;
        const y = 90 + Math.sin(angle) * radius;
        return (
          <g key={event.id} style={{ animation: "stressNodeIn 0.4s var(--ease-spring) both" }}>
            <circle cx={x} cy={y} r={6 + event.severity * 2.5} fill={color} opacity="0.18"
              className="animate-pulse" style={{ animationDelay: `${index * 120}ms` }} />
            <circle cx={x} cy={y} r={3.5 + event.severity * 1.6} fill={color}
              style={{ transition: "fill 0.6s ease" }} />
          </g>
        );
      })}

      {/* Overload ripple */}
      {totalStress > 50 && (
        <circle cx="100" cy="90" r="22" fill="none" stroke={color} strokeWidth="2" opacity="0.5"
          className="animate-ping" style={{ animationDuration: "2s" }} />
      )}
    </svg>
  );
}

// ─── Stress meter ─────────────────────────────────────────────────────────────

function StressMeter({ totalStress }: { totalStress: number }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="relative overflow-hidden lg-well"
        style={{ height: "14px", borderRadius: "999px" }}
      >
        {/* gradient track revealed by width */}
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${totalStress}%`,
            borderRadius: "999px",
            background: `linear-gradient(90deg, ${TEAL} 0%, ${AMBER} 55%, ${ROSE} 100%)`,
            transition: "width 0.6s var(--ease-spring)",
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--ink-faint)" }}>
        <span>Calm</span>
        <span>Moderate</span>
        <span>Overloaded</span>
      </div>
    </div>
  );
}

// ─── Metric bar ───────────────────────────────────────────────────────────────

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 lg" style={{ borderRadius: "16px" }}>
      <div className="flex justify-between items-baseline mb-2.5">
        <span className="text-sm" style={{ color: "var(--ink-soft)" }}>{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="lg-well" style={{ height: "7px", borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%", width: `${value}%`, backgroundColor: color, borderRadius: "999px",
            transition: "width 0.6s var(--ease-spring), background-color 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Science section ──────────────────────────────────────────────────────────

function ScienceSection() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const TABS = ["Why it happens", "The numbers", "What helps"];

  return (
    <div className="border-t" style={{ borderColor: "var(--hairline)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 py-4 w-full text-left"
        style={{ color: "var(--ink)" }}
      >
        {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm font-semibold uppercase tracking-wider">The Science</span>
      </button>

      <div style={{ maxHeight: open ? "2400px" : "0px", opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.4s ease" }}>
        <div className="flex gap-1 mb-5 p-1 rounded-xl lg-segment">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
              style={{
                backgroundColor: tab === i ? "#fff" : "transparent",
                color: tab === i ? "var(--ink)" : "var(--ink-soft)",
                boxShadow: tab === i ? "0 1px 2px rgba(11,26,43,0.08)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="pb-8 space-y-4 text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.75 }}>
            <p>
              Stress isn&apos;t just a feeling. When pressure stacks up, your body dumps stress
              chemicals, cortisol and noradrenaline, into your brain. A little sharpens you.
              Too much floods the prefrontal cortex, the part right behind your forehead that
              handles focus, planning, and keeping your cool.
            </p>
            <ul className="space-y-3 pl-1">
              {[
                "The prefrontal cortex basically goes offline. That's why, under heavy stress, you blank on a test you studied for, or can't think of the obvious answer.",
                "Control shifts to faster, more reactive parts of the brain. You get more impulsive and more emotional, snapping at people over small stuff.",
                "Stressors stack. Each one alone might be fine, but five at once shares the same limited pool of mental bandwidth. The load is cumulative, not separate.",
                "It clears. Once the pressure eases and the chemicals drop, the prefrontal cortex comes back. This is why a real break actually works. It's not just nice, it's chemistry.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5" style={{ listStyle: "none" }}>
                  <span className="flex-shrink-0 mt-2 rounded-full block" style={{ width: 5, height: 5, backgroundColor: ROSE }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Arnsten, <em>Nature Reviews Neuroscience</em> (2009)
            </p>
          </div>
        )}

        {tab === 1 && (
          <div className="pb-8 space-y-3">
            {[
              { stat: "Inverted-U", detail: "a little stress improves performance; past a tipping point it drops off fast, the classic stress–performance curve", source: "Yerkes & Dodson (1908); Arnsten (2009)" },
              { stat: "Minutes", detail: "how fast acute stress can weaken prefrontal cortex function, and it doesn't take chronic stress to feel it", source: "Arnsten, Nat Rev Neurosci (2009)" },
              { stat: "Cumulative", detail: "multiple stressors draw on the same limited working-memory capacity, so load adds up rather than staying separate", source: "Klingberg, Trends Cogn Sci (2010)" },
              { stat: "Reversible", detail: "prefrontal function recovers once stress chemicals clear, and brief breaks measurably restore focus", source: "Arnsten, Nat Rev Neurosci (2009)" },
              { stat: "~31%", detail: "of teens report feeling overwhelmed by stress on a regular basis", source: "American Psychological Association, Stress in America (2014)" },
            ].map(({ stat, detail, source }, i) => (
              <div key={i} className="flex items-start gap-4 p-4" style={{ background: "var(--glass-sheen), rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.62)", borderRadius: "14px" }}>
                <div className="flex-shrink-0 font-bold text-sm" style={{ color: "var(--ink)", minWidth: "84px" }}>{stat}</div>
                <div>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>{detail}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{source}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div className="pb-8 space-y-3 text-sm">
            {[
              { tip: "Take a real break, even 5 minutes", why: "Step away, walk, look at something far away. As stress chemicals drop, your prefrontal cortex comes back online. This isn't avoiding work; it's how you get your focus back." },
              { tip: "Do one thing at a time", why: "Stressors share the same mental bandwidth. Trying to juggle all of them at once guarantees you do each one worse. Pick one, finish it, move on." },
              { tip: "Slow your breathing down", why: "Long, slow exhales flip on the calming branch of your nervous system and pull cortisol down. A couple of minutes of slow breathing measurably lowers the stress response." },
              { tip: "Move your body", why: "Exercise burns off stress hormones and triggers a calmer baseline afterward. Even a short walk between tasks resets your system more than scrolling does." },
              { tip: "Sleep is the reset button", why: "Most of your emotional recovery happens overnight. Short sleep leaves you starting the day already loaded, so the same pressure hits harder." },
            ].map(({ tip, why }, i) => (
              <div key={i} className="p-4" style={{ background: "var(--glass-sheen), rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.62)", borderRadius: "14px" }}>
                <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>{tip}</p>
                <p className="text-xs" style={{ color: "var(--ink-soft)", lineHeight: 1.65 }}>{why}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StressLab() {
  const [events, setEvents] = useState<StressEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addEvent = (type: string, label: string, severity: number) => {
    if (events.length >= 8) return;
    setEvents((prev) => [...prev, { id: `${type}-${Date.now()}`, type, label, severity }]);
  };

  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));
  const clearAll = () => setEvents([]);

  const totalStress = useMemo(() => {
    const sum = events.reduce((acc, e) => acc + e.severity * 12, 0);
    return Math.min(100, sum);
  }, [events]);

  const metrics = {
    focusLevel: Math.max(10, 100 - totalStress * 0.9),
    mentalLoad: Math.min(100, totalStress * 1.1),
    recoveryAbility: Math.max(10, 100 - totalStress * 0.8),
  };

  const brainState =
    totalStress < 30
      ? { state: "Brain is calm", color: TEAL }
      : totalStress < 60
      ? { state: "Moderate stress", color: AMBER }
      : { state: "Mental overload", color: ROSE };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <style>{`
        @keyframes stressNodeIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        @keyframes stressChipIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <LabHeader lab="stress" badge={<HeaderBadge color={brainState.color}>{totalStress}%</HeaderBadge>} />

      <main className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto hb-reveal mb-12">
            <p className="hb-kicker" style={{ color: ROSE }}>Stress Lab · Simulation 03</p>
            <h1
              className="font-bold mt-4"
              style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.25rem)", color: "var(--ink)", lineHeight: 1.02, letterSpacing: "-0.035em" }}
            >
              The weight of a single day
            </h1>
            <p className="mt-4 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "32rem" }}>
              Stack up a day&apos;s worth of pressure and watch how it quietly takes your focus,
              memory, and patience offline.
            </p>
          </div>

          {/* Main interactive card */}
          <LiquidGlass
            radius={26}
            bezel={26}
            scale={52}
            className="overflow-hidden"
          >
            {/* Visualization zone */}
            <div
              className="flex flex-col items-center px-6 pt-10 pb-8"
              style={{ background: `linear-gradient(180deg, ${brainState.color}0D 0%, rgba(255,255,255,0) 70%)`, transition: "background 0.6s ease" }}
            >
              <div
                className="text-6xl font-bold tabular-nums leading-none"
                style={{ color: brainState.color, letterSpacing: "-0.04em", transition: "color 0.5s ease" }}
              >
                {totalStress}
                <span className="text-2xl font-semibold" style={{ opacity: 0.6 }}>%</span>
              </div>
              <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--ink-soft)" }}>Stress load</p>

              <div className="my-7">
                <BrainViz events={events} totalStress={totalStress} color={brainState.color} />
              </div>

              <p className="text-base font-semibold mb-5" style={{ color: brainState.color, transition: "color 0.5s ease" }}>
                {brainState.state}
              </p>

              <StressMeter totalStress={totalStress} />
            </div>

            {/* Controls zone */}
            <div className="px-6 pb-7 pt-2" style={{ borderTop: "1px solid var(--hairline)" }}>
              <div className="flex items-center justify-between mt-5 mb-3">
                <p className="hb-kicker" style={{ color: "var(--ink-soft)" }}>Add what&apos;s on your plate</p>
                <span className="text-xs tabular-nums" style={{ color: "var(--ink-faint)" }}>{events.length}/8</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {stressEventTypes.map((event) => {
                  const disabled = events.length >= 8;
                  return (
                    <button
                      key={event.type}
                      onClick={() => addEvent(event.type, event.label, event.severity)}
                      disabled={disabled}
                      className="group flex items-center gap-2.5 text-left transition-all lg-pill"
                      style={{
                        padding: "12px 14px",
                        minHeight: "56px",
                        borderRadius: "14px",
                        opacity: disabled ? 0.4 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="text-lg leading-none" style={{ filter: "saturate(0.9)" }}>{event.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{event.label}</span>
                        <span className="flex gap-1 mt-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span
                              key={i}
                              className="rounded-full"
                              style={{ width: 5, height: 5, backgroundColor: i < event.severity ? ROSE : "var(--hairline-strong)" }}
                            />
                          ))}
                        </span>
                      </span>
                      <Plus
                        className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ color: disabled ? "var(--ink-faint)" : brainState.color }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Active events */}
              {events.length > 0 ? (
                <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--hairline)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="hb-kicker" style={{ color: "var(--ink-soft)" }}>On your plate right now</span>
                    <button onClick={clearAll} className="text-xs font-medium transition-colors" style={{ color: "var(--ink-faint)" }}>
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {events.map((event) => (
                      <span
                        key={event.id}
                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5"
                        style={{
                          borderRadius: "999px",
                          background: "var(--glass-sheen), rgba(255,255,255,0.55)",
                          border: "1px solid rgba(255,255,255,0.65)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 3px 8px -4px rgba(20,30,60,0.16)",
                          animation: "stressChipIn 0.3s var(--ease-spring) both",
                        }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{event.label}</span>
                        <button
                          onClick={() => removeEvent(event.id)}
                          aria-label={`Remove ${event.label}`}
                          className="inline-flex items-center justify-center rounded-full transition-colors"
                          style={{ width: 20, height: 20, backgroundColor: "var(--muted)", color: "var(--ink-soft)" }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-center" style={{ color: "var(--ink-faint)" }}>
                  No stressors yet. Add a few and watch the brain respond.
                </p>
              )}
            </div>
          </LiquidGlass>

          {/* Metrics */}
          <p className="hb-kicker mt-12 mb-4" style={{ color: "var(--ink-soft)" }}>Mental performance</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricBar label="Focus level" value={metrics.focusLevel} color={TEAL} />
            <MetricBar label="Mental load" value={metrics.mentalLoad} color={ROSE} />
            <MetricBar label="Recovery ability" value={metrics.recoveryAbility} color="#2563EB" />
          </div>

          {/* High-stress insight */}
          <div
            className="overflow-hidden"
            style={{
              marginTop: totalStress > 60 ? "16px" : "0px",
              maxHeight: totalStress > 60 ? "200px" : "0px",
              opacity: totalStress > 60 ? 1 : 0,
              transition: "max-height 0.5s ease, opacity 0.4s ease, margin-top 0.4s ease",
            }}
          >
            <div className="p-4" style={{ background: "linear-gradient(165deg, #D8443B1A, rgba(255,255,255,0.5))", border: "1px solid #D8443B33", borderRadius: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                At this load your prefrontal cortex is running on fumes. Planning, focus, and
                self-control all get measurably worse. This is the moment you blank on things
                you actually know. The fix isn&apos;t pushing harder. It&apos;s a real break.
              </p>
              <p className="text-xs mt-2 font-medium" style={{ color: ROSE }}>Arnsten, <em>Nature Reviews Neuroscience</em> (2009)</p>
            </div>
          </div>

          {/* The sweet spot — Yerkes-Dodson curve */}
          <p className="hb-kicker mt-12 mb-4" style={{ color: "var(--ink-soft)" }}>The sweet spot</p>
          <YerkesDodson />

          {/* Explanation */}
          <div className="mt-12">
            <ScienceSection />
          </div>
        </div>

        <NextLabCard current="stress" />
        <LabFooter />
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, ChevronDown, ArrowUp } from "lucide-react";
import BuildYourDay, {
  curveFor,
  START_H,
  END_H,
  STEP,
  E_MAX,
  fmtTime,
  useAnimatedCurve,
  INITIAL_PLACED,
  type Placed,
} from "@/components/labs/BuildYourDay";
import LiquidGlass from "@/components/labs/LiquidGlass";
import BodyClock from "@/components/labs/BodyClock";
import SportsGrid from "@/components/labs/SportsGrid";
import EnergyGlowChart from "@/components/labs/EnergyGlowChart";
import { LabHeader, HeaderBadge, LabFooter } from "@/components/labs/LabChrome";

// ─── Hero curve helpers (activity model from Build Your Day) ─────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Energy 0–E_MAX mapped to a friendly 0–100 percentage.
const pct = (e: number) => Math.max(0, Math.min(100, Math.round((e / E_MAX) * 100)));

function curveColor(p: number): string {
  return p >= 62 ? "#0D9488" : p >= 44 ? "#D97706" : "#DC2626";
}

function fmtHourShort(t: number): string {
  const h = Math.round(((t % 24) + 24) % 24);
  if (h === 24 || h === 0) return "12a";
  if (h === 12) return "12p";
  return h > 12 ? `${h - 12}p` : `${h}a`;
}

function splitTime(t: number): { num: string; ap: string } {
  const s = fmtTime(t);
  const i = s.lastIndexOf(" ");
  return { num: s.slice(0, i), ap: s.slice(i + 1) };
}

const CRASH_TH = 0.42;

interface Readouts {
  peakT: number;
  peakLo: number;
  peakHi: number;
  peakVal: number;
  minT: number;
  lowVal: number;
  crashes: number;
  avg: number;
}

function energyReadouts(curve: number[]): Readouts {
  const n = curve.length;
  const tAt = (i: number) => START_H + i * STEP;
  let minI = 0;
  let maxI = 0;
  for (let i = 1; i < n; i++) {
    if (curve[i] < curve[minI]) minI = i;
    if (curve[i] > curve[maxI]) maxI = i;
  }
  // Peak window: contiguous run within 0.05 of the peak.
  const peakVal = curve[maxI];
  const thr = peakVal - 0.05;
  let lo = maxI;
  let hi = maxI;
  while (lo > 0 && curve[lo - 1] >= thr) lo--;
  while (hi < n - 1 && curve[hi + 1] >= thr) hi++;
  if (hi - lo < 2) {
    lo = Math.max(0, maxI - 2);
    hi = Math.min(n - 1, maxI + 2);
  }
  // Crashes: prominent local minima below the "tired" threshold.
  let crashes = 0;
  const W = 4;
  let i = W;
  while (i < n - W) {
    let isMin = true;
    for (let k = 1; k <= W; k++) {
      if (curve[i] > curve[i - k] + 1e-6 || curve[i] > curve[i + k] + 1e-6) {
        isMin = false;
        break;
      }
    }
    if (isMin && curve[i] < CRASH_TH) {
      let priorMax = curve[i];
      for (let k = 1; k <= 12 && i - k >= 0; k++) priorMax = Math.max(priorMax, curve[i - k]);
      if (priorMax - curve[i] >= 0.1) {
        crashes++;
        i += 8;
        continue;
      }
    }
    i++;
  }
  const avg = curve.reduce((a, b) => a + b, 0) / n;
  return { peakT: tAt(maxI), peakLo: tAt(lo), peakHi: tAt(hi), peakVal, minT: tAt(minI), lowVal: curve[minI], crashes, avg };
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const xc = (pts[i - 1].x + pts[i].x) / 2;
    const yc = (pts[i - 1].y + pts[i].y) / 2;
    d += ` Q ${pts[i - 1].x.toFixed(1)},${pts[i - 1].y.toFixed(1)} ${xc.toFixed(1)},${yc.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

// ─── Hero energy chart ───────────────────────────────────────────────────────────

const HW = 720;
const HH = 250;
const HPADL = 40;
const HPADR = 16;
const HPADT = 22;
const HPADB = 40;
const HPLOTW = HW - HPADL - HPADR;
const HPLOTH = HH - HPADT - HPADB;
const hx = (t: number) => HPADL + ((t - START_H) / (END_H - START_H)) * HPLOTW;
const hy = (e: number) => HPADT + (1 - clamp(e, 0, E_MAX) / E_MAX) * HPLOTH;

function HeroEnergyChart({ curve, peakT, minT }: { curve: number[]; peakT: number; minT: number }) {
  return (
    <EnergyGlowChart
      curve={curve}
      peakT={peakT}
      minT={minT}
      startH={START_H}
      endH={END_H}
      step={STEP}
      eMax={E_MAX}
    />
  );
}

// ─── Hero stat chip (Apple-Watch-complication style) ─────────────────────────────

function HeroStat({
  value,
  unit,
  label,
  caption,
  color,
  animKey,
}: {
  value: string;
  unit?: string;
  label: string;
  caption: string;
  color: string;
  animKey: string | number;
}) {
  return (
    <div
      className="text-center lg-hover"
      style={{
        padding: "18px 8px 15px",
        borderRadius: "20px",
        background: `linear-gradient(165deg, ${color}1F, rgba(255,255,255,0.42))`,
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: `1px solid ${color}33`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 26px -14px rgba(20,30,60,0.28)",
      }}
    >
      <div key={animKey} className="flex items-baseline justify-center gap-0.5" style={{ animation: "enFade 0.4s var(--ease-glass)" }}>
        <span className="font-bold leading-none tabular-nums" style={{ fontSize: "32px", color: "var(--ink)", letterSpacing: "-0.03em" }}>
          {value}
        </span>
        {unit && <span className="font-semibold" style={{ fontSize: "14px", color }}>{unit}</span>}
      </div>
      <div className="text-[11px] uppercase tracking-wider mt-2 font-medium" style={{ color: "var(--ink-soft)" }}>{label}</div>
      <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>{caption}</div>
    </div>
  );
}

// ─── Zone 4 · Science ────────────────────────────────────────────────────────────

function ScienceSection() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const TABS = ["Why food matters", "The numbers", "What actually helps"];

  return (
    <div className="border-t" style={{ borderColor: "var(--hairline)" }}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 py-4 w-full text-left" style={{ color: "var(--ink)" }}>
        {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm font-semibold uppercase tracking-wider">The Science</span>
      </button>
      <div style={{ maxHeight: open ? "2600px" : "0px", opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.4s ease" }}>
        <div className="flex gap-1 mb-5 p-1 rounded-full lg-segment">
          {TABS.map((t, i) => (
            <button
              key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2 text-xs font-semibold rounded-full ${tab === i ? "lg-segment-active" : ""}`}
              style={{ color: tab === i ? "var(--ink)" : "var(--ink-soft)", transition: "color 0.3s ease, background 0.4s var(--spring)" }}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 0 && (
          <div className="pb-8 space-y-4 text-sm" style={{ color: "var(--ink-soft)", lineHeight: "1.75" }}>
            <p>Your brain is about 2% of your body weight but uses 20% of your energy. And it runs almost exclusively on glucose, not stored fat, not protein. Glucose. The kind that comes directly from what you ate in the last few hours.</p>
            <p>The catch: your brain can&apos;t store much of it. It needs a steady supply. Which means what you had for breakfast is actively shaping how you think right now.</p>
            <ul className="space-y-3 pl-1">
              {[
                "Nothing → blood glucose running below baseline all morning. Your brain prioritizes basic function over higher-order thinking. Attention goes first.",
                "Sugary cereal → big spike, then crash. That crash lands around 2nd or 3rd period. Tired, irritable, hard to focus. That's the glucose drop, not you being lazy.",
                "Eggs and oats → slow, steady glucose. No spike, no crash. Your brain gets consistent fuel for 3–4 hours. This is the real difference between a good and bad morning.",
                "Just coffee → caffeine masks the hunger signal, but doesn't feed your brain. You feel more alert, but you're running on empty. Cognitive performance drops without you noticing.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2" style={{ listStyle: "none" }}>
                  <span className="flex-shrink-0 mt-2 rounded-full block" style={{ width: "5px", height: "5px", backgroundColor: "#0D9488" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 1 && (
          <div className="pb-8 space-y-3">
            {[
              { stat: "20–40%", detail: "improvement in standardized test scores among students who ate breakfast vs. skipped it", source: "Pollitt & Mathews, Preventive Medicine (1998); Cooper et al., IJBEM (2012)" },
              { stat: "17%", detail: "drop in working memory when blood glucose falls below baseline after a high-GI meal", source: "Ingwersen et al., Appetite (2007)" },
              { stat: "5–6 hrs", detail: "caffeine half-life, so a 3pm energy drink still has 50% of its caffeine at 9pm", source: "Drake et al., J Clin Sleep Med (2013)" },
              { stat: "85%", detail: "of teens regularly skip breakfast or eat high-GI foods, despite the clear hit to their focus", source: "Deshmukh-Taskar et al., JADA (2010)" },
              { stat: "Low vs. high GI", detail: "same calories, different fuel. A low-GI breakfast noticeably improves afternoon attention and concentration", source: "Ingwersen et al., Appetite (2007)" },
              { stat: "13%", detail: "improvement in memory recall in teens who ate a balanced lunch vs. fast food", source: "Liu et al., Nutrients (2012)" },
            ].map(({ stat, detail, source }, i) => (
              <div key={i} className="flex items-start gap-4 p-4" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
                <div className="flex-shrink-0 font-bold text-sm" style={{ color: "var(--ink)", minWidth: "72px" }}>{stat}</div>
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
              { tip: "Actually eat breakfast", why: "The data is the data. Students who eat breakfast consistently outperform those who skip. Not because breakfast is magic, but because your brain can't run on nothing. Something small beats empty." },
              { tip: "Go for protein + complex carbs", why: "Eggs with toast, oatmeal with nuts, Greek yogurt. These digest slowly and give you 3–4 hours of steady glucose. Sugary cereals spike and crash before 2nd period." },
              { tip: "Don't drink energy drinks before a test", why: "Caffeine raises alertness slightly but also raises anxiety and cortisol. The research on caffeine and teen focus is mixed, and the crash timing is terrible for school." },
              { tip: "Eat lunch, even a small one", why: "Your brain's glucose supply runs low by 1pm. Even a 20-minute break with some protein significantly improves afternoon focus vs. skipping entirely." },
              { tip: "If you use caffeine, cap it at noon", why: "Given the 5–6 hour half-life, afternoon caffeine sits in your system past midnight. Your sleep takes the hit, which compounds into tomorrow's performance." },
            ].map(({ tip, why }, i) => (
              <div key={i} className="p-4" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
                <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>{tip}</p>
                <p className="text-xs" style={{ color: "var(--ink-soft)", lineHeight: "1.65" }}>{why}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Zone wrappers (matching Sleep Lab) ──────────────────────────────────────────

function ZoneSection({
  children, alt = false, first = false, last = false, sectionRef, wide = false, padTop, padBottom,
}: {
  children: React.ReactNode;
  alt?: boolean;
  first?: boolean;
  last?: boolean;
  sectionRef?: React.Ref<HTMLElement>;
  wide?: boolean;
  padTop?: number;
  padBottom?: number;
}) {
  const defaultTop = first ? 40 : 88;
  const defaultBottom = last ? 56 : 88;
  return (
    <section
      ref={sectionRef}
      style={{
        background: alt ? "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))" : "transparent",
        paddingTop: `${padTop ?? defaultTop}px`,
        paddingBottom: `${padBottom ?? defaultBottom}px`,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div className={`${wide ? "max-w-5xl" : "max-w-3xl"} mx-auto px-6`} style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

function ZoneHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 text-center max-w-2xl mx-auto">
      <h2 className="font-bold" style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", color: "var(--ink)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
        {title}
      </h2>
      <p className="mt-3 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "34rem" }}>
        {subtitle}
      </p>
    </div>
  );
}

function StickyBar({ visible, avgPct, crashes, onBackToTop }: { visible: boolean; avgPct: number; crashes: number; onBackToTop: () => void }) {
  const col = curveColor(avgPct);
  return (
    <div
      className="lg-bar"
      style={{
        position: "sticky", top: 0, zIndex: 30, height: "46px",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s var(--spring), opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: "var(--ink-soft)" }}>
            Avg energy <strong className="tabular-nums" style={{ color: col }}>{avgPct}%</strong>
          </span>
          <span style={{ color: "rgba(11,26,43,0.2)" }}>·</span>
          <span style={{ color: "var(--ink-soft)" }}>
            <strong className="tabular-nums" style={{ color: crashes > 0 ? "#DC2626" : "#0D9488" }}>{crashes}</strong> {crashes === 1 ? "crash" : "crashes"}
          </span>
        </div>
        <button onClick={onBackToTop} className="flex items-center gap-1 text-xs font-medium lg-pill rounded-full px-3 py-1.5" style={{ color: "var(--ink-soft)" }} aria-label="Back to top">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnergyLab() {
  const [placed, setPlaced] = useState<Placed[]>(INITIAL_PLACED);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const root = mainRef.current;
    const target = heroRef.current;
    if (!root || !target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { root, threshold: 0, rootMargin: "0px 0px -80% 0px" },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [mounted]);

  const SLEEP_H = 8;
  const targetCurve = useMemo(() => curveFor(placed, SLEEP_H), [placed]);
  const animCurve = useAnimatedCurve(targetCurve);
  const readouts = useMemo(() => energyReadouts(targetCurve), [targetCurve]);

  const peakPct = pct(readouts.peakVal);
  const avgPct = pct(readouts.avg);
  const low = splitTime(readouts.minT);
  const peakWindow = `${fmtHourShort(readouts.peakLo)}–${fmtHourShort(readouts.peakHi)}`;
  const avgCol = curveColor(avgPct);

  const diagnostic =
    readouts.crashes === 0
      ? `Steady day, no real energy crashes. You're freshest around ${peakWindow}, then it eases down gently.`
      : readouts.crashes === 1
      ? `One energy crash today. Your lowest point lands around ${fmtTime(readouts.minT)}, so keep the hard stuff away from it.`
      : `${readouts.crashes} energy crashes today. The deepest hits around ${fmtTime(readouts.minT)}. Spacing out the draining blocks would smooth the ride.`;

  const handleBackToTop = () => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <style>{`@keyframes enFade { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <LabHeader lab="energy" badge={<HeaderBadge color={avgCol}>Avg {avgPct}%</HeaderBadge>} />

      <div className="flex flex-1 min-h-0" style={{ position: "relative", zIndex: 10 }}>
        <main ref={mainRef} className="flex-1 overflow-y-auto">

          <StickyBar visible={scrolled} avgPct={avgPct} crashes={readouts.crashes} onBackToTop={handleBackToTop} />

          {/* ZONE 1 — DIAGNOSTIC HERO */}
          <ZoneSection first sectionRef={heroRef} padBottom={56}>
            <div className="mb-10 text-center max-w-2xl mx-auto hb-reveal">
              <p className="hb-kicker" style={{ color: "#C9760F" }}>Energy Blueprint · 02</p>
              <h1 className="font-bold mt-4" style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.25rem)", color: "var(--ink)", lineHeight: 1.02, letterSpacing: "-0.035em" }}>
                Your energy across the day
              </h1>
              <p className="mt-4 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "32rem" }}>
                Build your real day below and watch the curve respond. You will see where you peak, where you crash, and the moment your tank runs lowest.
              </p>
            </div>

            {/* Headline readouts */}
            <div className="grid grid-cols-3 gap-3 mb-7 max-w-xl mx-auto">
              <HeroStat animKey={peakPct} value={`${peakPct}`} unit="%" label="Peak energy" caption={peakWindow} color={curveColor(peakPct)} />
              <HeroStat animKey={readouts.crashes} value={`${readouts.crashes}`} label="Energy crashes" caption="across the day" color={readouts.crashes > 0 ? "#DC2626" : "#0D9488"} />
              <HeroStat animKey={`${readouts.minT}`} value={low.num} unit={low.ap} label="Lowest dip" caption={`${pct(readouts.lowVal)}% in the tank`} color={curveColor(pct(readouts.lowVal))} />
            </div>

            {/* Live curve */}
            <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "20px 18px 14px" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 px-1" style={{ color: "var(--ink-soft)" }}>Energy curve · 6am to midnight</p>
              <HeroEnergyChart curve={animCurve} peakT={readouts.peakT} minT={readouts.minT} />
            </LiquidGlass>

            {/* Diagnostic sentence */}
            <div
              key={diagnostic}
              className="mt-5 mx-auto text-center"
              style={{ maxWidth: "34rem", animation: "enFade 0.45s var(--ease-glass)" }}
            >
              <p className="text-base" style={{ color: "var(--ink)", lineHeight: 1.5 }}>{diagnostic}</p>
            </div>
          </ZoneSection>

          {/* ZONE 2 — BUILD YOUR DAY (alt bg) */}
          <ZoneSection alt wide>
            <ZoneHeader
              title="Build your day"
              subtitle="Drag what you actually do onto the timeline. Every choice reshapes the curve up top."
            />
            <BuildYourDay sleepHours={SLEEP_H} placed={placed} setPlaced={setPlaced} />
          </ZoneSection>

          {/* ZONE 3 — YOUR THREE ENERGY ENGINES, the centerpiece (wide) */}
          <ZoneSection wide>
            <ZoneHeader
              title="Your three energy engines"
              subtitle="Every sport runs on the same three engines, just tuned differently. Pick yours and watch them fire, hand off, and recover in real time."
            />
            <SportsGrid />
          </ZoneSection>

          {/* ZONE 4 — THE BODY CLOCK (alt bg, wide) */}
          <ZoneSection alt wide>
            <ZoneHeader
              title="The body clock"
              subtitle="Your energy isn't random. It rides a 24-hour clock your body sets mostly by light, and that clock decides when you're sharp and when you fade. The afternoon slump is on the schedule."
            />
            <BodyClock />
          </ZoneSection>

          {/* ZONE 5 — SCIENCE */}
          <ZoneSection last>
            <ScienceSection />
          </ZoneSection>

          <LabFooter />
        </main>
      </div>
    </div>
  );
}

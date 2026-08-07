"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, ArrowUp } from "lucide-react";
import GamesSection from "@/components/labs/games/GamesSection";
import PhoneBeforeBed from "@/components/labs/PhoneBeforeBed";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabHeader, HeaderBadge, LabFooter } from "@/components/labs/LabChrome";
import { playSound } from "@/lib/sleep-sound";

// ─── Constants ───────────────────────────────────────────────────────────────

const OPTIMAL = 9;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const RT_TABLE = [
  { h: 4, v: 470 }, { h: 5, v: 410 }, { h: 6, v: 360 },
  { h: 7, v: 310 }, { h: 8, v: 270 }, { h: 9, v: 250 }, { h: 10, v: 250 },
];
const MEM_TABLE = [
  { h: 4, v: 48 }, { h: 5, v: 60 }, { h: 6, v: 72 },
  { h: 7, v: 83 }, { h: 8, v: 92 }, { h: 9, v: 100 }, { h: 10, v: 100 },
];
const FOC_TABLE = [
  { h: 4, v: 8 }, { h: 5, v: 20 }, { h: 6, v: 35 },
  { h: 7, v: 55 }, { h: 8, v: 75 }, { h: 9, v: 90 }, { h: 10, v: 90 },
];
const SCENARIOS = [
  {
    title: "Your friend cancels plans",
    wellRested: "You're a little annoyed but you move on with your day.",
    deprived: "You start wondering if they actually wanted to hang out in the first place.",
  },
  {
    title: "You forgot your homework",
    wellRested: "It's frustrating but you deal with it and move on.",
    deprived: "You feel like giving up on the whole class.",
  },
  {
    title: "Someone gives you feedback",
    wellRested: "You listen, take what makes sense, and keep going.",
    deprived: "It feels like a personal attack even when it's not.",
  },
  {
    title: "Something small goes wrong",
    wellRested: "You're bothered for a second and then it's over.",
    deprived: "It hits way harder than it should. You might snap or get emotional out of nowhere.",
  },
  {
    title: "You get a bad grade on a test",
    wellRested: "You're disappointed but you think about what to change next time.",
    deprived: "You get frustrated and start telling yourself there's no point in trying.",
  },
  {
    title: "Your parents ask you to do something",
    wellRested: "You might not want to but you just do it.",
    deprived: "You blow up over something that wasn't even a big deal.",
  },
  {
    title: "You see friends hanging out without you",
    wellRested: "You figure they just didn't think to text you. Not a big deal.",
    deprived: "You start convincing yourself they don't want you around.",
  },
  {
    title: "Someone bumps into you in the hallway",
    wellRested: "You don't really think about it.",
    deprived: "You get way more irritated than the situation calls for.",
  },
  {
    title: "You have to present in front of class",
    wellRested: "You're a little nervous but you get through it.",
    deprived: "Your thoughts won't come together. You lose your train of thought and freeze up.",
  },
  {
    title: "A teacher calls on you and you don't know the answer",
    wellRested: "It's awkward for a second and then you forget about it.",
    deprived: "You keep thinking about it for the rest of the day.",
  },
];
const CDC_SEGMENTS = [
  { label: "Under 6 hrs", pct: 22, color: "#DC2626" },
  { label: "6–7 hrs",     pct: 50, color: "#D97706" },
  { label: "8–10 hrs",    pct: 23, color: "#0D9488" },
  { label: "10+ hrs",     pct: 5,  color: "#0F766E" },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

function parseTimeH(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function calcHours(bedtime: string, wake: string): number {
  const b = parseTimeH(bedtime);
  const w = parseTimeH(wake);
  let h = w - b;
  if (h <= 0) h += 24;
  return Math.round(h * 2) / 2;
}

function interp(table: { h: number; v: number }[], hours: number) {
  const h = Math.max(4, Math.min(10, hours));
  for (let i = 0; i < table.length - 1; i++) {
    if (h <= table[i + 1].h) {
      const t = (h - table[i].h) / (table[i + 1].h - table[i].h);
      return table[i].v + (table[i + 1].v - table[i].v) * t;
    }
  }
  return table[table.length - 1].v;
}

function moodReactivityPct(hrs: number): number {
  if (hrs >= 9) return 0;
  if (hrs >= 7) return ((9 - hrs) / 2) * 25;
  if (hrs >= 6) return 25 + (7 - hrs) * 35;
  return 60;
}

// ─── CSS Keyframes ────────────────────────────────────────────────────────────

function Keyframes() {
  return (
    <style>{`
      @keyframes sleepLabPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(209,213,219,0.7); }
        50%      { box-shadow: 0 0 0 18px rgba(209,213,219,0); }
      }
      @keyframes sleepLabBarIn {
        from { width: 0; }
        to   { width: var(--bar-w, 100%); }
      }
      @keyframes sleepLabFadeSlide {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slpExpand {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slpShake {
        0%, 100% { transform: translateX(0); }
        25%      { transform: translateX(-5px); }
        75%      { transform: translateX(5px); }
      }
      @keyframes slpSway {
        0%, 100% { transform: rotate(-1.2deg); }
        50%      { transform: rotate(1.2deg); }
      }
      @keyframes slpBreathe {
        0%, 100% { transform: scaleY(1); }
        50%      { transform: scaleY(1.04); }
      }
      @keyframes slpFigSway {
        0%, 100% { transform: rotate(-2.2deg); }
        50%      { transform: rotate(2.2deg); }
      }
      @keyframes slpBlink {
        0%, 90%, 100% { opacity: 0; }
        94%, 98%      { opacity: 1; }
      }
      @keyframes slpCardInRight {
        from { opacity: 0; transform: translateX(28px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes slpCardInLeft {
        from { opacity: 0; transform: translateX(-28px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useCountUp(target: number) {
  const [val, setVal] = useState(target);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    let start: number | null = null;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / 500);
      const ease = 1 - (1 - p) ** 3;
      const v = from + (target - from) * ease;
      fromRef.current = v;
      setVal(v);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return val;
}

// ─── Display primitives ───────────────────────────────────────────────────────

function PersonFigure({ fatigue, index = 0, scale = 1 }: { fatigue: number; index?: number; scale?: number }) {
  const lean = fatigue * 14;
  const droop = fatigue * 22;
  const armDrop = fatigue * 7;
  const col = fatigue > 0.65 ? "#DC2626" : fatigue > 0.35 ? "#F59E0B" : "#001A33";
  const op = Math.max(0.45, 1 - fatigue * 0.4);
  const tr = "all 0.5s ease-in-out";

  // Idle micro-animations — rested figures breathe, tired ones sway and blink.
  const tier = fatigue > 0.65 ? "weary" : fatigue > 0.35 ? "tired" : "rested";
  const delay = `${(index % 5) * 0.45}s`;
  const idleAnim =
    tier === "weary"
      ? `slpFigSway 3.4s ease-in-out ${delay} infinite`
      : tier === "tired"
      ? `slpFigSway 5.4s ease-in-out ${delay} infinite`
      : `slpBreathe 4.2s ease-in-out ${delay} infinite`;
  const blinkDur = tier === "weary" ? "2.8s" : "5.6s";

  return (
    <svg width={56 * scale} height={94 * scale} viewBox="0 0 56 94" style={{ overflow: "visible" }} aria-hidden="true">
      <g style={{ animation: idleAnim, transformOrigin: "28px 90px" }}>
        <g style={{ transform: `rotate(${lean}deg)`, transformOrigin: "28px 90px", transition: "transform 0.5s ease-in-out" }}>
          <g style={{ transform: `rotate(${droop}deg)`, transformOrigin: "28px 24px", transition: "transform 0.5s ease-in-out" }}>
            <circle cx="28" cy="13" r="10" fill={col} opacity={op} style={{ transition: tr }} />
            {tier !== "rested" && (
              <g style={{ animation: `slpBlink ${blinkDur} ease-in-out ${delay} infinite`, transformOrigin: "28px 12px" }}>
                <line x1="23" y1="12" x2="25.5" y2="12" stroke="#fff" strokeWidth="1.5" opacity={0.7} />
                <line x1="30.5" y1="12" x2="33" y2="12" stroke="#fff" strokeWidth="1.5" opacity={0.7} />
              </g>
            )}
          </g>
          <rect x="25" y="23" width="6" height="7" rx="2" fill={col} opacity={op} style={{ transition: tr }} />
          <rect x="15" y="30" width="26" height="28" rx="4" fill={col} opacity={op} style={{ transition: tr }} />
          <rect x="7"  y={32 + armDrop} width="7" height="22" rx="3" fill={col} opacity={op} style={{ transition: tr }} />
          <rect x="42" y={32 + armDrop} width="7" height="22" rx="3" fill={col} opacity={op} style={{ transition: tr }} />
          <rect x="16" y="58" width="10" height="28" rx="4" fill={col} opacity={op} style={{ transition: tr }} />
          <rect x="30" y="58" width="10" height="28" rx="4" fill={col} opacity={op} style={{ transition: tr }} />
        </g>
      </g>
    </svg>
  );
}

// ─── Ambient particle field ───────────────────────────────────────────────────

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#0D9488", "#001A33", "#D97706"];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;
    type Dot = { x: number; y: number; r: number; vx: number; vy: number; a: number; c: string };
    let dots: Dot[] = [];

    const build = () => {
      const count = Math.max(14, Math.min(32, Math.floor(w / 28)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.07,
        vy: -(0.05 + Math.random() * 0.15),
        a: 0.04 + Math.random() * 0.08,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -6) {
          d.y = h + 6;
          d.x = Math.random() * w;
        }
        if (d.x < -6) d.x = w + 6;
        if (d.x > w + 6) d.x = -6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.globalAlpha = d.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

function EnergyBar({ energy }: { energy: number }) {
  const col = energy > 0.6 ? "#0D9488" : energy > 0.3 ? "#D97706" : "#DC2626";
  const fillPct = Math.max(4, energy * 100);
  return (
    <div className="overflow-hidden lg-well" style={{ width: "18px", height: "64px", borderRadius: "9px" }}>
      <div style={{
        width: "100%", height: `${fillPct}%`,
        background: `linear-gradient(180deg, ${col}, ${col}bb)`,
        marginTop: `${100 - fillPct}%`, borderRadius: "9px",
        boxShadow: `0 0 8px ${col}77, inset 0 1px 0 rgba(255,255,255,0.5)`,
        transition: "height 0.6s var(--spring), margin-top 0.6s var(--spring), background 0.5s ease",
      }} />
    </div>
  );
}

// ─── Sleep Score (Zone 1 hero) ────────────────────────────────────────────────

function SleepScore({ score, sleepHours }: { score: number; sleepHours: number }) {
  const col = score >= 80 ? "#0D9488" : score >= 60 ? "#F59E0B" : "#DC2626";
  const R = 58;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - Math.max(0, Math.min(100, score)) / 100);
  // 3-digit scores (100) shrink ~20% so they sit in the ring like 2-digit ones.
  const scoreFontSize = String(score).length >= 3 ? 42 : 52;
  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: 156, height: 156 }}>
        {/* refracting glass pedestal */}
        <LiquidGlass
          className="absolute inset-0"
          radius={78}
          bezel={24}
          scale={40}
          tint={0.22}
          style={{
            position: "absolute",
            borderRadius: "50%",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 40px -16px ${col}55, 0 4px 12px -6px rgba(20,30,60,0.2)`,
          }}
        />
        <svg width="156" height="156" viewBox="0 0 156 156" style={{ position: "relative", transform: "rotate(-90deg)" }}>
          <circle cx="78" cy="78" r={R} fill="none" stroke="rgba(20,30,60,0.10)" strokeWidth="9" />
          <circle
            cx="78" cy="78" r={R} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s var(--ease-glass), stroke 0.5s ease", filter: `drop-shadow(0 2px 6px ${col}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            key={score}
            className="font-bold leading-none tabular-nums"
            style={{ fontSize: `${scoreFontSize}px`, color: "var(--ink)", letterSpacing: "-0.04em", transition: "font-size 0.3s var(--ease-glass)", animation: "sleepLabFadeSlide 0.4s var(--ease-glass)" }}
          >
            {score}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: col, transition: "color 0.5s ease" }}>
            Score
          </span>
        </div>
      </div>
      <p className="text-xs uppercase tracking-widest mt-4 font-semibold" style={{ color: "var(--ink-soft)" }}>
        {Number.isInteger(sleepHours) ? sleepHours : sleepHours.toFixed(1)}h tonight
      </p>
    </div>
  );
}

// ─── Brain Stats Inline (Zone 1) ──────────────────────────────────────────────

function BrainStatsInline({ rt, mem, foc }: { rt: number; mem: number; foc: number }) {
  const rtCol  = rt <= 270 ? "#0D9488" : rt >= 360 ? "#DC2626" : "#F59E0B";
  const memCol = mem >= 90 ? "#0D9488" : mem < 70 ? "#DC2626" : "#F59E0B";
  const focCol = foc >= 75 ? "#0D9488" : foc < 40 ? "#DC2626" : "#F59E0B";
  const cells = [
    { val: `${Math.round(rt)}`,  unit: "ms",  label: "Reaction time", col: rtCol },
    { val: `${Math.round(mem)}`, unit: "%",   label: "Memory recall", col: memCol },
    { val: `${Math.round(foc)}`, unit: "min", label: "Focus span",    col: focCol },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="text-center lg-hover"
          style={{
            padding: "18px 8px 16px",
            borderRadius: "20px",
            background: `linear-gradient(165deg, ${c.col}1F, rgba(255,255,255,0.42))`,
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: `1px solid ${c.col}33`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 26px -14px rgba(20,30,60,0.28)",
          }}
        >
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="font-bold leading-none tabular-nums" style={{ fontSize: "34px", color: "var(--ink)", letterSpacing: "-0.03em", transition: "color 0.4s ease" }}>
              {c.val}
            </span>
            <span className="font-semibold" style={{ fontSize: "14px", color: c.col, transition: "color 0.4s ease" }}>{c.unit}</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider mt-2 font-medium" style={{ color: "var(--ink-soft)" }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Reactivity Strip (Zone 1) ────────────────────────────────────────────────

function ReactivityStrip({ sleepHours }: { sleepHours: number }) {
  const reactivity = moodReactivityPct(sleepHours);
  const col = reactivity <= 5 ? "#0D9488" : reactivity < 40 ? "#F59E0B" : "#DC2626";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
        <span>Emotional reactivity</span>
        <span style={{ color: col, fontWeight: 600, transition: "color 0.4s ease" }}>
          +{Math.round(reactivity)}% reactive
        </span>
      </div>
      <div className="relative h-3.5 rounded-full overflow-hidden lg-well">
        <div style={{
          position: "absolute", inset: "0 auto 0 0",
          width: `${reactivity}%`,
          background: `linear-gradient(90deg, ${col}, ${col}cc)`,
          borderRadius: "9999px",
          boxShadow: `0 0 12px ${col}88, inset 0 1px 0 rgba(255,255,255,0.5)`,
          transition: "width 0.6s var(--spring), background 0.5s ease",
        }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--ink-faint)" }}>
        <span>Baseline (9+ hrs)</span><span>≤6 hrs · 60% more reactive</span>
      </div>
    </div>
  );
}

// ─── Zone wrappers ────────────────────────────────────────────────────────────

function ZoneSection({
  children, alt = false, first = false, last = false, sectionRef, particles = false,
  padTop, padBottom, wide = false,
}: {
  children: React.ReactNode;
  alt?: boolean;
  first?: boolean;
  last?: boolean;
  sectionRef?: React.Ref<HTMLElement>;
  particles?: boolean;
  padTop?: number;
  padBottom?: number;
  wide?: boolean;
}) {
  const defaultTop = first ? 40 : 88;
  const defaultBottom = last ? 40 : 88;
  return (
    <section
      ref={sectionRef}
      style={{
        background: alt
          ? "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))"
          : "transparent",
        paddingTop: `${padTop ?? defaultTop}px`,
        paddingBottom: `${padBottom ?? defaultBottom}px`,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {particles && <ParticleField />}
      <div className={`${wide ? "max-w-5xl" : "max-w-3xl"} mx-auto px-6`} style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

function ZoneHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 text-center max-w-2xl mx-auto">
      <h2
        className="font-bold"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", color: "var(--ink)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      <p className="mt-3 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "34rem" }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Sticky scroll bar ────────────────────────────────────────────────────────

function StickyBar({
  visible, sleepHours, score, onBackToTop,
}: {
  visible: boolean; sleepHours: number; score: number; onBackToTop: () => void;
}) {
  const col = score >= 80 ? "#0D9488" : score >= 60 ? "#F59E0B" : "#DC2626";
  return (
    <div
      className="lg-bar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "46px",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s var(--spring), opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: "var(--ink-soft)" }}>
            <strong className="tabular-nums" style={{ color: "var(--ink)" }}>{Number.isInteger(sleepHours) ? sleepHours : sleepHours.toFixed(1)}h</strong> sleep
          </span>
          <span style={{ color: "rgba(11,26,43,0.2)" }}>·</span>
          <span style={{ color: "var(--ink-soft)" }}>
            Score <strong className="tabular-nums" style={{ color: col, transition: "color 0.4s ease" }}>{score}</strong>
          </span>
        </div>
        <button
          onClick={onBackToTop}
          className="flex items-center gap-1 text-xs font-medium lg-pill rounded-full px-3 py-1.5"
          style={{ color: "var(--ink-soft)" }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
}

// ─── Mood Carousel (Zone 4) ───────────────────────────────────────────────────

function MoodCarousel({ sleepHours }: { sleepHours: number }) {
  const [index, setIndex]         = useState(0);
  const [enterFrom, setEnterFrom] = useState<"right" | "left">("right");
  const touchX = useRef<number | null>(null);

  const tier: "calm" | "mild" | "full" =
    sleepHours >= 8 ? "calm" : sleepHours >= 7 ? "mild" : "full";

  const goTo = (next: number, from: "right" | "left") => {
    setEnterFrom(from);
    setIndex(((next % SCENARIOS.length) + SCENARIOS.length) % SCENARIOS.length);
    playSound("click");
  };
  const step = (dir: 1 | -1) => goTo(index + dir, dir === 1 ? "right" : "left");

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const s = SCENARIOS[index];
  const hrsLabel = Number.isInteger(sleepHours) ? `${sleepHours}` : sleepHours.toFixed(1);
  const veryLow  = sleepHours < 6;

  const tiredCol =
    tier === "full" ? "#DC2626" : tier === "mild" ? "#F59E0B" : "#0D9488";
  const tiredText =
    tier === "full"
      ? s.deprived
      : tier === "mild"
      ? "You're more on edge than usual. You hold it together, but it takes effort."
      : "Honestly, pretty similar. You handle it and move on.";

  return (
    <LiquidGlass radius={24} bezel={22} scale={48}>
      <div style={{ padding: "24px" }}>
        {/* Scenario carousel */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-center mb-3" style={{ color: "var(--ink)" }}>
            {s.title}
          </p>
          <div className="flex items-stretch gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Previous scenario"
              className="flex items-center justify-center rounded flex-shrink-0"
              style={{ width: "44px", height: "172px", alignSelf: "center", background: "rgba(255,255,255,0.5)", color: "var(--ink-soft)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px -6px rgba(20,30,60,0.2)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-hidden" style={{ alignSelf: "stretch" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div
                key={index}
                style={{ animation: `${enterFrom === "right" ? "slpCardInRight" : "slpCardInLeft"} 0.3s ease`, height: "100%" }}
              >
                <div className="grid grid-cols-2 gap-2 h-full" style={{ minHeight: "172px", alignItems: "stretch" }}>
                  {/* Rested */}
                  <div className="rounded p-3" style={{ backgroundColor: "#0D948810", border: "1px solid #0D948830" }}>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "#0D9488" }}>
                      Rested you (8+ hrs)
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--ink)" }}>{s.wellRested}</p>
                  </div>
                  {/* Tired / current */}
                  <div
                    className="rounded p-3"
                    style={{ backgroundColor: `${tiredCol}10`, border: `1px solid ${tiredCol}30` }}
                  >
                    <p className="text-xs font-semibold mb-1.5" style={{ color: tiredCol }}>
                      {tier === "calm" ? `You at ${hrsLabel}h` : `Tired you (${hrsLabel}h)`}
                    </p>
                    <p
                      className="leading-relaxed"
                      style={{
                        color: "var(--ink)",
                        fontSize: veryLow ? "14px" : "12px",
                        fontWeight: veryLow ? 600 : 400,
                      }}
                    >
                      {tiredText}
                    </p>
                    {tier === "calm" && (
                      <p className="text-xs mt-1.5" style={{ color: "#0D9488" }}>
                        Your brain&apos;s handling it fine at this level.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => step(1)}
              aria-label="Next scenario"
              className="flex items-center justify-center rounded flex-shrink-0"
              style={{ width: "44px", height: "172px", alignSelf: "center", background: "rgba(255,255,255,0.5)", color: "var(--ink-soft)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px -6px rgba(20,30,60,0.2)" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {SCENARIOS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i >= index ? "right" : "left")}
                aria-label={`Go to scenario ${i + 1}`}
                className="flex items-center justify-center"
                style={{ height: "16px", padding: "0 2px" }}
              >
                <span style={{
                  display: "block",
                  width: i === index ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "9999px",
                  backgroundColor: i === index ? "#001A33" : "#D1D5DB",
                  transition: "width 0.2s ease, background-color 0.2s ease",
                }} />
              </button>
            ))}
          </div>
          <p className="text-xs text-center mt-1.5" style={{ color: "var(--ink-faint)" }}>
            {index + 1} of {SCENARIOS.length} · swipe or use the arrows
          </p>
        </div>

        {/* Explanation */}
        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--ink-soft)" }}>
          Your amygdala, the part of your brain that handles threats, goes into overdrive when you&apos;re low on sleep.
          Every small thing feels bigger than it is. That&apos;s real biology, not weakness.
        </p>
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Yoo et al., <em>Current Biology</em> (2007)</p>
      </div>
    </LiquidGlass>
  );
}

// ─── Compare Section ──────────────────────────────────────────────────────────

function CompareSection({ sleepHours }: { sleepHours: number }) {
  const markerPct = Math.max(0, Math.min(100, ((sleepHours - 4) / 6) * 100));
  const compareText =
    sleepHours >= 8
      ? "You're in the well-rested group. About 1 in 4 teens. Your brain is actually running the way it should."
      : sleepHours >= 6
      ? "You're in the largest group, the 6–7 hour zone where 1 in 2 teens lives. It feels normal because everyone's doing it. That doesn't make it good for you."
      : "Under 6 hours puts you in the most impaired group. Only 1 in 5 teens is here, and it shows in nearly every measurable outcome.";

  return (
    <LiquidGlass radius={24} bezel={22} scale={48} style={{ padding: "24px" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--ink-soft)" }}>
          How you stack up against other teens
        </p>

        {/* Stacked bar */}
        <div className="relative mb-8" style={{ marginTop: "24px" }}>
          <div className="flex h-8 overflow-hidden rounded-sm">
            {CDC_SEGMENTS.map(seg => (
              <div key={seg.label} style={{ width: `${seg.pct}%`, backgroundColor: seg.color, transition: "width 0.5s ease" }} />
            ))}
          </div>
          {/* "You" marker */}
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${markerPct}%`, transform: "translateX(-50%)", transition: "left 0.5s ease" }}
          >
            <div style={{ width: "2px", height: "100%", backgroundColor: "#001A33", margin: "0 auto" }} />
            <div style={{
              position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontSize: "11px", fontWeight: 700, color: "var(--ink)",
              background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", padding: "3px 8px",
              borderRadius: "3px", border: "1px solid #E5E0D8",
            }}>
              You
            </div>
          </div>
        </div>

        {/* Legend 2×2 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CDC_SEGMENTS.map(seg => (
            <div key={seg.label} className="flex items-center gap-2 text-xs" style={{ color: "var(--ink-soft)" }}>
              <div className="flex-shrink-0 rounded-sm" style={{ width: "12px", height: "12px", backgroundColor: seg.color }} />
              <span>{seg.label} · <strong>{seg.pct}%</strong></span>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--ink)" }}>{compareText}</p>
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Source: CDC YRBS, 2023</p>
    </LiquidGlass>
  );
}

// ─── Weekend Section ──────────────────────────────────────────────────────────

function useEasedArray(target: number[]): number[] {
  const [disp, setDisp] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from.length !== target.length) {
      fromRef.current = target;
      setDisp(target);
      return;
    }
    let startTs: number | null = null;
    const run = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / 400);
      const e = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2;
      const cur = target.map((v, i) => from[i] + (v - from[i]) * e);
      fromRef.current = cur;
      setDisp(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return disp;
}

function fmtHrs(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

function hrAbbr(n: number): string {
  return Math.abs(n - 1) < 0.05 ? "hr" : "hrs";
}

function hrWord(n: number): string {
  return Math.abs(n - 1) < 0.05 ? "hour" : "hours";
}

function WkSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const col = value >= 9 ? "#0D9488" : value >= 7 ? "#D97706" : "#DC2626";
  const pct = ((value - 6) / 8) * 100;
  return (
    <div className="flex-1" style={{ minWidth: "150px" }}>
      <div className="flex items-baseline gap-1.5">
        <span className="font-bold" style={{ fontSize: "28px", lineHeight: 1, color: col, transition: "color 0.3s ease" }}>
          {fmtHrs(value)}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--ink-faint)" }}>{hrAbbr(value)}</span>
      </div>
      <p className="text-xs mt-1 mb-2 font-medium" style={{ color: "var(--ink-soft)" }}>{label}</p>
      <div className="relative flex items-center" style={{ height: "32px" }}>
        <div className="w-full rounded-full relative lg-well" style={{ height: "8px" }}>
          <div className="absolute h-full rounded-full" style={{ left: "37.5%", right: 0, backgroundColor: "rgba(13,148,136,0.18)" }} />
          <div className="absolute h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${col}, ${col}cc)`, boxShadow: `0 0 10px ${col}88, inset 0 1px 0 rgba(255,255,255,0.5)`, transition: "width 0.2s var(--ease-glass), background 0.3s ease" }} />
          <div className="lg-knob absolute" style={{ left: `${pct}%`, top: "50%", width: 20, height: 20, borderRadius: "50%", transform: "translate(-50%, -50%)", transition: "left 0.2s var(--ease-glass)" }} />
        </div>
        <input
          type="range" min={6} max={14} step={0.5} value={value}
          onChange={(e) => { onChange(Number(e.target.value)); playSound("tick"); }}
          aria-label={label}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "32px" }}
        />
      </div>
    </div>
  );
}

function WeekendSection({
  dayDebts, fridayDebt, satH, setSatH, sunH, setSunH,
}: {
  dayDebts: number[];
  fridayDebt: number;
  satH: number;
  setSatH: (v: number) => void;
  sunH: number;
  setSunH: (v: number) => void;
}) {
  const ddKey = dayDebts.join("|");
  const target7 = useMemo(() => {
    const sat = Math.max(0, fridayDebt + 9 - satH);
    const sun = Math.max(0, sat + 9 - sunH);
    return [...dayDebts, sat, sun];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ddKey, fridayDebt, satH, sunH]);

  const eased = useEasedArray(target7);

  const mondayDebt = target7[6];
  const weekendRecovery = Math.max(0, satH - 9) + Math.max(0, sunH - 9);

  // Chart geometry
  const W = 600, H = 220;
  const padL = 64, padR = 18, padT = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - 30;
  const maxAxis = Math.max(20, Math.ceil(Math.max(...target7) / 5) * 5);
  const ticks: number[] = [];
  for (let v = 0; v <= maxAxis; v += 5) ticks.push(v);

  const xFor = (i: number) => padL + (i / 6) * plotW;
  const yFor = (d: number) => padT + plotH * (1 - Math.min(1, Math.max(0, d) / maxAxis));
  const y0 = yFor(0);

  const RED = "#DC2626", TEAL = "#0D9488", GRAY = "#9CA3AF";
  const segColor = (i: number) => {
    if (i <= 3) return RED;
    const a = target7[i], b = target7[i + 1];
    if (b < a - 0.01) return TEAL;
    if (b > a + 0.01) return RED;
    return GRAY;
  };
  const pointColor = (i: number) => (i === 0 ? RED : segColor(i - 1));
  const dayLabels = ["M", "T", "W", "T", "F", "Sa", "Su"];

  let insight: string;
  if (satH < 7 || sunH < 7) {
    insight = `Sleeping ${fmtHrs(satH)}h and ${fmtHrs(sunH)}h on the weekend, you're not recovering, you're adding more debt. Monday's going to feel rough.`;
  } else if (mondayDebt < 0.01 && fridayDebt < 0.01) {
    insight = "You're starting Monday with zero debt. This is what your brain actually wants every week.";
  } else if (mondayDebt < 0.01) {
    insight = "On paper you've recovered the hours. But you can't rebuild the cleanup and memory work that normal sleep does each night. The hours come back. The lost work doesn't.";
  } else {
    insight = `You're still short ${fmtHrs(mondayDebt)} ${hrWord(mondayDebt)} by Monday morning. Sleep helps, but the cleanup, growth hormone, and memory work from the week is already gone.`;
  }

  const mondayCol = mondayDebt < 0.01 ? "#0D9488" : mondayDebt <= 5 ? "#D97706" : "#DC2626";

  const handleReset = () => {
    setSatH(10);
    setSunH(9);
    playSound("click");
  };

  return (
    <LiquidGlass radius={24} bezel={24} scale={50} style={{ padding: "32px", flexGrow: 1, width: "100%", display: "flex", flexDirection: "column" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--ink-soft)" }}>
          The weekend catch-up
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 mb-5">
          <WkSlider label="Saturday sleep" value={satH} onChange={setSatH} />
          <WkSlider label="Sunday sleep" value={sunH} onChange={setSunH} />
          <button
            onClick={handleReset}
            className="text-xs font-semibold rounded"
            style={{ padding: "8px 14px", minHeight: "36px", background: "rgba(255,255,255,0.5)", color: "var(--ink-soft)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
          >
            Reset
          </button>
        </div>

        {/* Chart */}
        <div style={{ overflowX: "auto", minHeight: "220px" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: "460px", minHeight: "200px", display: "block" }}>
            <text x="16" y={padT + plotH / 2} fontSize="10" fill="#4A5568" textAnchor="middle"
              transform={`rotate(-90, 16, ${padT + plotH / 2})`}>
              Sleep Debt (hours)
            </text>

            {ticks.map((tk) => {
              const y = yFor(tk);
              return (
                <g key={tk}>
                  <line x1={padL} y1={y} x2={padL + plotW} y2={y}
                    stroke={tk === 0 ? "#E5E0D8" : "#F0EDE6"} strokeWidth="1" />
                  <text x={padL - 8} y={y + 3} fontSize="9" fill="#9CA3AF" textAnchor="end">{tk}</text>
                </g>
              );
            })}
            <text x={padL + plotW} y={y0 - 5} fontSize="9" fill="#9CA3AF" textAnchor="end">no debt</text>

            <line x1={xFor(4.5)} y1={padT} x2={xFor(4.5)} y2={y0}
              stroke="#E5E0D8" strokeWidth="1" strokeDasharray="3 3" />

            {[0, 1, 2, 3, 4, 5].map((i) => (
              <polygon key={i}
                points={`${xFor(i)},${yFor(eased[i])} ${xFor(i + 1)},${yFor(eased[i + 1])} ${xFor(i + 1)},${y0} ${xFor(i)},${y0}`}
                fill={segColor(i)} fillOpacity="0.12" />
            ))}

            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i}
                x1={xFor(i)} y1={yFor(eased[i])} x2={xFor(i + 1)} y2={yFor(eased[i + 1])}
                stroke={segColor(i)} strokeWidth="2.6" strokeLinecap="round" />
            ))}

            {eased.map((d, i) => {
              const col = pointColor(i);
              return (
                <g key={i}>
                  <circle cx={xFor(i)} cy={yFor(d)} r="5" fill={col} stroke="#fff" strokeWidth="1.5" />
                  <text x={xFor(i)} y={yFor(d) - 11} fontSize="10" fontWeight="600" fill={col} textAnchor="middle">
                    {d < 0.05 ? "0h" : `-${fmtHrs(d)}h`}
                  </text>
                </g>
              );
            })}

            {dayLabels.map((lb, i) => (
              <text key={i} x={xFor(i)} y={padT + plotH + 18} fontSize="10"
                fill={i >= 5 ? "#0D9488" : "#9CA3AF"} textAnchor="middle" fontWeight={i >= 5 ? 600 : 400}>
                {lb}
              </text>
            ))}
          </svg>
        </div>

        {/* Insight */}
        <div className="mt-4 rounded p-3" style={{ backgroundColor: `${mondayCol}10`, border: `1px solid ${mondayCol}30` }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{insight}</p>
        </div>

        {/* Secondary readout */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded p-3" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>Total weekday debt</p>
            <p className="text-lg font-bold" style={{ color: "#DC2626" }}>{fmtHrs(fridayDebt)} {hrAbbr(fridayDebt)}</p>
          </div>
          <div className="rounded p-3" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>Weekend recovery</p>
            <p className="text-lg font-bold" style={{ color: "#0D9488" }}>{fmtHrs(weekendRecovery)} {hrAbbr(weekendRecovery)}</p>
          </div>
        </div>
        <p className="text-sm mt-3" style={{ color: "var(--ink-soft)" }}>
          Monday morning starts with{" "}
          <strong style={{ color: mondayCol }}>{fmtHrs(mondayDebt)} {hrWord(mondayDebt)}</strong> of debt.
        </p>

        <p className="text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
          Sleeping in partially restores function but doesn&apos;t erase cognitive debt. Dinges et al., <em>SLEEP</em> (1997)
        </p>
    </LiquidGlass>
  );
}

// ─── Science Section ──────────────────────────────────────────────────────────

function ScienceSection() {
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState(0);
  const TABS = ["Why it's real", "The numbers", "What helps"];

  return (
    <div className="border-t" style={{ borderColor: "#E5E0D8" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-4 w-full text-left"
        style={{ color: "var(--ink)" }}
      >
        {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm font-semibold uppercase tracking-wider">The Science</span>
      </button>

      <div className="overflow-hidden" style={{ maxHeight: open ? "2400px" : "0px", opacity: open ? 1 : 0, transition: "max-height 0.5s ease, opacity 0.4s ease" }}>
        <div className="flex gap-1 mb-5 p-1 rounded-full lg-segment">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`flex-1 py-2 text-xs font-semibold rounded-full ${tab === i ? "lg-segment-active" : ""}`}
              style={{ color: tab === i ? "var(--ink)" : "var(--ink-soft)", transition: "color 0.3s ease, background 0.4s var(--spring)" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="pb-8 space-y-4 text-sm" style={{ color: "var(--ink-soft)", lineHeight: "1.75" }}>
            <p>Teens need 8–10 hours, and not because someone decided it sounded good. Your brain is still under construction until your mid-20s. Every night of sleep is a maintenance window. Skip it and the maintenance doesn&apos;t get delayed. Some of it just doesn&apos;t happen.</p>
            <ul className="space-y-3 pl-1">
              {[
                "Your brain runs a cleanup cycle that washes out waste products that accumulate while you're awake. Skip it and the waste sits there.",
                "Memories from that day get sorted and filed into long-term storage. Without this step, what you studied barely sticks. The information isn't just hazy, it's gone.",
                "Growth hormone gets released. Teens need more sleep than adults partly because your body is still literally growing.",
                "Your emotional thermostat resets, so small things don't feel catastrophic tomorrow morning.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2" style={{ listStyle: "none" }}>
                  <span className="flex-shrink-0 mt-2 rounded-full block" style={{ width: "5px", height: "5px", backgroundColor: "#0D9488" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>Monday on 6 hours feels survivable. By Friday, you&apos;re running a deficit that&apos;s been compounding for 5 days. And the worst part: you lose the ability to notice. You feel fine. You&apos;re not fine.</p>
          </div>
        )}

        {tab === 1 && (
          <div className="pb-8 space-y-3">
            {[
              { stat: "77%",      detail: "of US high schoolers don't get the recommended 8+ hours",                                               source: "CDC YRBS, 2023" },
              { stat: "60%",      detail: "more reactive, how much the amygdala overreacts after sleep loss",                                     source: "Yoo et al., Current Biology (2007)" },
              { stat: "17–19 hrs",detail: "awake = cognitive impairment equal to 0.05% blood alcohol concentration",                              source: "Dawson & Reid, Nature (1997)" },
              { stat: "35%",      detail: "drop in chemistry test scores among sleep-deprived 11th–12th graders",                                  source: "Auctores Online (2024)" },
              { stat: "20% / 23%",detail: "drop in memory and concentration under sleep restriction",                                              source: "Auctores Online (2024)" },
              { stat: "Similar",  detail: "memory impairment from sleep restriction vs. total sleep deprivation, where partial loss hits almost as hard",source: "Newbury & Bhatt (2024)" },
              { stat: "Higher",   detail: "risk of depression and suicidal ideation in teens with insufficient sleep",                             source: "Fitzgerald et al., J Clin Sleep Med (2011)" },
            ].map(({ stat, detail, source }, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
                <div className="flex-shrink-0 font-bold text-sm" style={{ color: "var(--ink)", minWidth: "64px" }}>{stat}</div>
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
              { tip: "Same bedtime every night, weekends included",   why: "Your brain runs on a clock. Every time you stay up 2 hours later on Saturday, it's like flying to a different time zone. Monday morning feels like jet lag because it is." },
              { tip: "No screens 30 min before bed",                    why: "Blue light delays melatonin release by up to 90 minutes. Your phone is physiologically keeping you awake. It's not about willpower." },
              { tip: "Keep your room cool, around 65°F",               why: "Your core temperature has to drop a little for you to fall asleep. A cool room helps that happen. A hot room makes it physically harder to get into deep sleep." },
              { tip: "No caffeine after 2 pm",                          why: "Caffeine has a 6-hour half-life. That 3 pm energy drink still has half its effect at 9 pm. A 5 pm coffee is basically a bedtime cup." },
              { tip: "Don't try to sleep in to 'make up' for the week",why: "Sleeping until noon Sunday doesn't undo the cognitive debt, and it shifts your clock forward. Monday morning will feel even harder." },
            ].map(({ tip, why }, i) => (
              <div key={i} className="p-4 rounded" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
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

// ─── Schedule Controls ────────────────────────────────────────────────────────

function ScheduleControls({
  bedtime, setBedtime, wake, setWake,
  perDayMode, perDayHours, setPerDayHours, onReset,
}: {
  bedtime: string; setBedtime: (v: string) => void;
  wake: string; setWake: (v: string) => void;
  perDayMode: boolean;
  perDayHours: number[]; setPerDayHours: (v: number[]) => void;
  onReset: () => void;
}) {
  const hrs = calcHours(bedtime, wake);
  const fillCol = hrs >= 8 ? "#0D9488" : hrs >= 6 ? "#D97706" : "#DC2626";
  const bedH = parseTimeH(bedtime);
  const showLateWarning = bedH <= 4 && bedH >= 0 && parseTimeH(wake) <= 7;

  return (
    <div className="space-y-5">
      {!perDayMode ? (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ink-soft)" }}>Your Schedule</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--ink-soft)" }}>Bedtime</label>
                <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium lg-well"
                  style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", color: "var(--ink)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--ink-soft)" }}>Wake up</label>
                <input type="time" value={wake} onChange={e => setWake(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium lg-well"
                  style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", color: "var(--ink)" }} />
              </div>
            </div>
            {showLateWarning && (
              <p className="text-xs mt-2" style={{ color: "#D97706" }}>Your body wants to be asleep through this entire window.</p>
            )}
          </div>
          <div
            className="text-center py-4"
            style={{
              borderRadius: "18px",
              background: `linear-gradient(165deg, ${fillCol}1A, rgba(255,255,255,0.4))`,
              border: `1px solid ${fillCol}30`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              transition: "background 0.4s ease, border-color 0.4s ease",
            }}
          >
            <div key={hrs} className="font-bold tabular-nums" style={{ fontSize: "52px", lineHeight: 1, color: "var(--ink)", letterSpacing: "-0.03em", animation: "sleepLabFadeSlide 0.3s var(--ease-glass)" }}>
              {hrs}
            </div>
            <p className="text-xs mt-1.5 uppercase tracking-wider font-semibold" style={{ color: fillCol, transition: "color 0.4s ease" }}>hours of sleep</p>
          </div>
        </>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ink-soft)" }}>Sleep each night</p>
          <div className="space-y-3">
            {DAYS.map((day, i) => {
              const h = perDayHours[i];
              const col = h >= 8 ? "#0D9488" : h >= 6 ? "#D97706" : "#DC2626";
              const pct = ((h - 4) / 8) * 100;
              return (
                <div key={day}>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--ink-soft)" }}>
                    <span className="font-medium">{day}</span>
                    <span className="font-bold tabular-nums" style={{ color: col }}>{h}h</span>
                  </div>
                  <div className="relative flex items-center" style={{ height: "32px" }}>
                    <div className="w-full rounded-full relative lg-well" style={{ height: "8px" }}>
                      <div className="absolute h-full rounded-full" style={{ left: `${((8 - 4) / 8) * 100}%`, width: `${((10 - 8) / 8) * 100}%`, backgroundColor: "rgba(13,148,136,0.18)" }} />
                      <div className="absolute h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${col}, ${col}cc)`, boxShadow: `0 0 10px ${col}88, inset 0 1px 0 rgba(255,255,255,0.5)`, transition: "width 0.2s var(--ease-glass), background 0.3s ease" }} />
                      <div className="lg-knob absolute" style={{ left: `${pct}%`, top: "50%", width: 20, height: 20, borderRadius: "50%", transform: "translate(-50%, -50%)", transition: "left 0.2s var(--ease-glass)" }} />
                    </div>
                    <input type="range" min={4} max={12} step={0.5} value={h}
                      onChange={e => {
                        const next = [...perDayHours];
                        next[i] = Number(e.target.value);
                        setPerDayHours(next);
                        playSound("tick");
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "32px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={onReset} className="w-full py-3 text-sm font-semibold lg-press"
        style={{ borderRadius: "14px", background: "linear-gradient(165deg, rgba(13,148,136,0.22), rgba(255,255,255,0.4))", color: "#0B6F65", border: "1px solid rgba(13,148,136,0.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 16px -8px rgba(13,148,136,0.4)" }}>
        {perDayMode ? "Reset all to 9 hrs" : "Reset to 10 PM / 7 AM"}
      </button>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>What the colors mean</p>
        {[
          { col: "#0D9488", label: "Full energy" },
          { col: "#D97706", label: "Moderate debt" },
          { col: "#DC2626", label: "High debt, impaired" },
        ].map(({ col, label }) => (
          <div key={col} className="flex items-center gap-2 text-xs" style={{ color: "var(--ink-soft)" }}>
            <div className="rounded-full flex-shrink-0" style={{ width: "12px", height: "12px", background: col, boxShadow: `0 0 6px ${col}88` }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SleepLab() {
  const [bedtime, setBedtime]   = useState("22:00");
  const [wake, setWake]         = useState("07:00");
  const [perDayMode, setPerDayMode] = useState(false);
  const [perDayHours, setPerDayHours] = useState<number[]>([9, 9, 9, 9, 9]);
  const [panelOpen, setPanelOpen]     = useState(true);
  const [mounted, setMounted]         = useState(false);
  const [satH, setSatH]               = useState(10);
  const [sunH, setSunH]               = useState(9);
  const [scrolled, setScrolled]       = useState(false);

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

  const baseSleepH = calcHours(bedtime, wake);

  const dayData = useMemo(() => DAYS.map((day, i) => {
    let cumDebt = 0;
    for (let d = 0; d <= i; d++) {
      cumDebt += Math.max(0, OPTIMAL - (perDayMode ? perDayHours[d] : baseSleepH));
    }
    const thisSleep = perDayMode ? perDayHours[i] : baseSleepH;
    const energy    = Math.max(0.05, 1 - cumDebt / 20);
    const fatigue   = Math.min(1, cumDebt / 18);
    return { day, index: i, debtHours: cumDebt, sleep: thisSleep, energy, fatigue };
  }), [perDayMode, perDayHours, baseSleepH]);

  const worstIdx        = dayData.reduce((mi, d, i, arr) => d.debtHours > arr[mi].debtHours ? i : mi, 0);
  const fridayDebt      = dayData[4].debtHours;
  const dayDebts        = dayData.map(d => d.debtHours);
  const effectiveSleepH = perDayMode ? dayData[worstIdx].sleep : baseSleepH;
  const showCallout     = !perDayMode && baseSleepH <= 6;
  const statsLabel      = perDayMode ? `How your brain's running on ${DAYS[worstIdx]} (your worst day)` : "How your brain's running by Friday";
  // Defined after sleepScore below.

  const sleepScore = useMemo(() => {
    let s = 100;
    const dailyDebts = DAYS.map((_, i) => Math.max(0, OPTIMAL - (perDayMode ? perDayHours[i] : baseSleepH)));
    const avgDebt = dailyDebts.reduce((a, b) => a + b, 0) / DAYS.length;
    s -= avgDebt * 9;
    if (perDayMode) {
      const mean = perDayHours.reduce((a, b) => a + b, 0) / perDayHours.length;
      const variance = perDayHours.reduce((acc, h) => acc + (h - mean) ** 2, 0) / perDayHours.length;
      s -= Math.sqrt(variance) * 5;
    }
    const weekendRecovery = Math.max(0, satH - 9) + Math.max(0, sunH - 9);
    s += Math.min(15, weekendRecovery * 3);
    return Math.max(0, Math.min(100, Math.round(s)));
  }, [perDayMode, perDayHours, baseSleepH, satH, sunH]);

  const badgeColor = sleepScore >= 80 ? "#0D9488" : sleepScore >= 60 ? "#F59E0B" : "#DC2626";
  const avgWeekdayH = perDayMode
    ? Math.round((perDayHours.reduce((a, b) => a + b, 0) / perDayHours.length) * 10) / 10
    : baseSleepH;

  const rt  = useCountUp(interp(RT_TABLE,  effectiveSleepH));
  const mem = useCountUp(interp(MEM_TABLE, effectiveSleepH));
  const foc = useCountUp(interp(FOC_TABLE, effectiveSleepH));

  const handleReset = () => {
    if (perDayMode) setPerDayHours([9, 9, 9, 9, 9]);
    else { setBedtime("22:00"); setWake("07:00"); }
  };

  const handlePerDayToggle = (on: boolean) => {
    if (on) setPerDayHours(DAYS.map(() => baseSleepH));
    setPerDayMode(on);
  };

  const handleBackToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <Keyframes />

      <LabHeader
        lab="sleep"
        badge={
          <HeaderBadge color={badgeColor}>
            Avg {Number.isInteger(avgWeekdayH) ? avgWeekdayH : avgWeekdayH.toFixed(1)}h
          </HeaderBadge>
        }
      />

      <div className="flex flex-1 min-h-0" style={{ position: "relative", zIndex: 10 }}>
        <main ref={mainRef} className="flex-1 overflow-y-auto">

          <StickyBar visible={scrolled} sleepHours={effectiveSleepH} score={sleepScore} onBackToTop={handleBackToTop} />

          {/* ZONE 1 — DIAGNOSTIC HERO */}
          <ZoneSection first sectionRef={heroRef} particles padBottom={48}>

            {/* Page title */}
            <div className="mb-10 text-center max-w-2xl mx-auto hb-reveal">
              <p className="hb-kicker" style={{ color: "#0D9488" }}>Sleep Blueprint · 01</p>
              <h1
                className="font-bold mt-4"
                style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.25rem)", color: "var(--ink)", lineHeight: 1.02, letterSpacing: "-0.035em" }}
              >
                Sleep debt across your week
              </h1>
              <p className="mt-4 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "32rem" }}>
                Put in your real schedule. Watch what builds up by Friday, and what starts to break down.
              </p>
            </div>

            {/* Sleep score */}
            <div className="mb-9">
              <SleepScore score={sleepScore} sleepHours={effectiveSleepH} />
              <p className="text-center text-sm mt-4 mx-auto" style={{ color: "var(--ink-soft)", maxWidth: "22rem" }}>
                Based on your schedule, weekday consistency, and weekend recovery
              </p>
            </div>

            {/* Per-day toggle */}
            <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-full w-fit mx-auto lg-segment">
              {(["Same every night", "Different per day"] as const).map((label, i) => {
                const active = i === 0 ? !perDayMode : perDayMode;
                return (
                  <button key={label} onClick={() => handlePerDayToggle(i === 1)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold ${active ? "lg-segment-active" : ""}`}
                    style={{ color: active ? "var(--ink)" : "var(--ink-soft)", transition: "color 0.3s ease, background 0.4s var(--spring), box-shadow 0.4s ease" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* BAC callout (conditional) */}
            <div className="mb-6 overflow-hidden"
              style={{ borderRadius: "20px", maxHeight: showCallout ? "260px" : "0px", opacity: showCallout ? 1 : 0, transition: "max-height 0.5s var(--ease-glass), opacity 0.4s ease" }}>
              <div className="lg-tint-rose" style={{ padding: "20px 24px", border: "1px solid rgba(244,63,94,0.32)", borderRadius: "20px", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 12px 30px -16px rgba(220,38,38,0.4)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                  By Friday on {baseSleepH} hours a night, you&apos;ve built up{" "}
                  {Number.isInteger(fridayDebt) ? fridayDebt : fridayDebt.toFixed(1)} hours of sleep debt.
                  Your brain is running the way it would after 17+ hours awake. That&apos;s the same
                  level of impairment as a 0.05% blood alcohol level, basically legally drunk. You wouldn&apos;t drive drunk. But you&apos;re going to school like this.
                </p>
                <p className="text-xs mt-2 font-semibold" style={{ color: "#DC2626" }}>Dawson &amp; Reid, <em>Nature</em> (1997)</p>
              </div>
            </div>

            {/* 5-day timeline — figures on a refracting glass deck */}
            <LiquidGlass
              className="mb-9"
              radius={26}
              bezel={26}
              scale={52}
              style={{ padding: "22px 12px 20px" }}
            >
              <div className="flex gap-2 justify-center flex-wrap sm:gap-4">
                {dayData.map(({ day, debtHours, energy, fatigue }, i) => (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-2.5"
                    style={{
                      width: "98px", padding: "12px 4px 10px", borderRadius: "18px",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.12))",
                      border: "1px solid rgba(255,255,255,0.5)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                    }}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>{day}</span>
                    <div className="flex items-end gap-3" style={{ minHeight: "138px" }}>
                      <PersonFigure fatigue={fatigue} index={i} scale={1.45} />
                    </div>
                    <EnergyBar energy={energy} />
                    <div className="text-center" style={{ animation: "sleepLabFadeSlide 0.3s ease-out" }}>
                      <div className="font-bold leading-tight tabular-nums" style={{
                        fontSize: "16px",
                        color: debtHours === 0 ? "#0D9488" : debtHours >= 12 ? "#DC2626" : "#F59E0B",
                        transition: "color 0.5s ease",
                      }}>
                        {debtHours === 0 ? "✓" : `-${Number.isInteger(debtHours) ? debtHours : debtHours.toFixed(1)}h`}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>{debtHours === 0 ? "no debt" : "debt"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlass>

            {/* Inline brain stats */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: "var(--ink-soft)" }}>
                {statsLabel}
              </p>
              <BrainStatsInline rt={rt} mem={mem} foc={foc} />
            </div>

            {/* Emotional reactivity strip */}
            <LiquidGlass className="mb-8 max-w-xl mx-auto" radius={20} bezel={18} scale={42} style={{ padding: "18px 22px" }}>
              <ReactivityStrip sleepHours={effectiveSleepH} />
            </LiquidGlass>

            {/* CDC line */}
            <p className="text-xs text-center mb-6" style={{ color: "var(--ink-faint)" }}>
              77% of US teens don&apos;t get enough sleep. <span style={{ color: "var(--ink-soft)" }}>CDC, 2023</span>
            </p>

            {/* How you compare */}
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <CompareSection sleepHours={effectiveSleepH} />
            </div>
          </ZoneSection>

          {/* Mobile schedule controls — sits between Zone 1 and Zone 2 */}
          <div className="lg:hidden" style={{ backgroundColor: "transparent", paddingBottom: "32px" }}>
            <div className="max-w-3xl mx-auto px-6">
              <LiquidGlass radius={24} bezel={22} scale={48} style={{ padding: "24px" }}>
                <ScheduleControls
                  bedtime={bedtime} setBedtime={setBedtime}
                  wake={wake} setWake={setWake}
                  perDayMode={perDayMode} perDayHours={perDayHours} setPerDayHours={setPerDayHours}
                  onReset={handleReset}
                />
              </LiquidGlass>
            </div>
          </div>

          {/* ZONE 2 — TEST YOURSELF (alt bg) */}
          <ZoneSection alt>
            <ZoneHeader
              title="Test what sleep does to your brain"
              subtitle="Eight games. Play one, then play it on less sleep. The difference is the point."
            />
            <GamesSection />
          </ZoneSection>

          {/* ZONE 3 — BEHAVIOR SIMULATORS (wider) */}
          <ZoneSection wide>
            <ZoneHeader
              title="What changes the math"
              subtitle="Small habits that add up, or quietly undo your week."
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-2 flex" style={{ minWidth: 0 }}>
                <div className="flex w-full" style={{ minWidth: "380px", maxWidth: "100%" }}>
                  <PhoneBeforeBed />
                </div>
              </div>
              <div className="lg:col-span-3 flex" style={{ minWidth: 0 }}>
                <WeekendSection
                  dayDebts={dayDebts} fridayDebt={fridayDebt}
                  satH={satH} setSatH={setSatH} sunH={sunH} setSunH={setSunH}
                />
              </div>
            </div>
          </ZoneSection>

          {/* ZONE 4 — MOOD (alt bg) */}
          <ZoneSection alt padTop={48} padBottom={48}>
            <ZoneHeader
              title="Same situation. Different brain."
              subtitle="How the same moment lands when you're rested versus running on fumes."
            />
            <MoodCarousel sleepHours={effectiveSleepH} />
          </ZoneSection>

          {/* ZONE 5 — SCIENCE */}
          <ZoneSection last>
            <ScienceSection />
          </ZoneSection>

          <LabFooter />
        </main>

        {/* Right panel — desktop · floating refracting glass sheet */}
        <LiquidGlass
          as="aside"
          radius={26}
          bezel={24}
          scale={50}
          className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width: panelOpen ? "300px" : "52px",
            margin: "16px 16px 16px 0",
            maxHeight: "calc(100vh - 94px)",
            position: "sticky",
            top: "16px",
            alignSelf: "flex-start",
            transition: "width 0.5s var(--spring)",
          }}
        >
          <button
            onClick={() => setPanelOpen(v => !v)}
            className="flex items-center justify-center flex-shrink-0"
            style={{ height: "50px", minWidth: "52px", borderBottom: "1px solid rgba(255,255,255,0.4)" }}
            aria-label={panelOpen ? "Collapse controls" : "Expand controls"}
          >
            {panelOpen
              ? <ChevronRight className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
              : <ChevronLeft  className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />}
          </button>
          {panelOpen && (
            <div className="flex-1 overflow-y-auto p-6">
              <ScheduleControls
                bedtime={bedtime} setBedtime={setBedtime}
                wake={wake} setWake={setWake}
                perDayMode={perDayMode} perDayHours={perDayHours} setPerDayHours={setPerDayHours}
                onReset={handleReset}
              />
            </div>
          )}
        </LiquidGlass>
      </div>
    </div>
  );
}

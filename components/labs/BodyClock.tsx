"use client";

import { useState, useRef, useEffect } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";

// ─── The Body Clock: a universal circadian dial. No personal input. ──────────────
//
// A 24-hour radial exhibit. Midnight at top, 6 AM right, noon bottom, 6 PM left.
// The outer ring is alertness (the headline). Three faint inner loops are the
// drivers: core body temperature, melatonin, and cortisol. Drag the hand to read
// any hour. Two light levers bend the whole pattern the way real light does.

const SZ = 440;
const C = 220;
const R_OUT = 196;        // alertness ring outer
const R_IN_RING = 158;    // alertness ring inner
const R_CURVE_MIN = 98;   // driver loop radius at level 0
const R_CURVE_MAX = 150;  // driver loop radius at level 1
const HUB_R = 92;         // center plaque
const HAND_FROM = 98;
const HAND_TO = 192;
const R_LABEL = 210;
const TAU = Math.PI * 2;

const TEMP_COL = "#F2683C";
const MEL_COL = "#8B5CF6";
const CORT_COL = "#0EA5E9";

// ─── Geometry ────────────────────────────────────────────────────────────────────

function wrap24(h: number) {
  return ((h % 24) + 24) % 24;
}
const ang = (h: number) => (h / 24) * TAU; // radians from top, clockwise
function pt(h: number, r: number): [number, number] {
  return [C + r * Math.sin(ang(h)), C - r * Math.cos(ang(h))];
}
function annularSector(h0: number, h1: number, ri: number, ro: number): string {
  const [x0o, y0o] = pt(h0, ro);
  const [x1o, y1o] = pt(h1, ro);
  const [x1i, y1i] = pt(h1, ri);
  const [x0i, y0i] = pt(h0, ri);
  return `M ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${ro} ${ro} 0 0 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} L ${x1i.toFixed(2)} ${y1i.toFixed(2)} A ${ri} ${ri} 0 0 0 ${x0i.toFixed(2)} ${y0i.toFixed(2)} Z`;
}

// ─── Driver model (natural state, clock hour → level 0..1) ───────────────────────

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function gauss(h: number, center: number, width: number) {
  let d = Math.abs(wrap24(h - center));
  if (d > 12) d = 24 - d;
  return Math.exp(-(d * d) / (2 * width * width));
}

// Core temp: nadir ~04:30, peak ~18:30, falls faster than it rises (asymmetric).
function tempLevelNat(h: number) {
  h = wrap24(h);
  if (h >= 4.5 && h <= 18.5) {
    const f = (h - 4.5) / 14;
    return (1 - Math.cos(Math.PI * f)) / 2;
  }
  const hh = h < 4.5 ? h + 24 : h;
  const f = (hh - 18.5) / 10;
  return (1 + Math.cos(Math.PI * f)) / 2;
}
const tempF = (level: number) => 97.5 + 1.5 * level; // ~1.5°F daily swing: nadir 97.5°F, peak 99.0°F

// Melatonin: ~0 through the day, onset ~21:00, peak ~02:30–04:00, cleared ~07:30.
function melLevelNat(h: number) {
  const x = wrap24(h - 21); // hours since onset
  if (x >= 10.5) return 0;
  const rise = smoothstep(0, 5.5, x);
  const fall = 1 - smoothstep(7, 10.5, x);
  return Math.max(0, Math.min(rise, fall));
}

// Cortisol: trough ~02:00, sharp morning rise, peak ~07:45, declines across the day.
function cortLevelNat(h: number) {
  h = wrap24(h);
  if (h >= 2 && h <= 7.75) {
    const f = (h - 2) / 5.75;
    return 0.06 + 0.94 * ((1 - Math.cos(Math.PI * f)) / 2);
  }
  const hh = h < 2 ? h + 24 : h;
  const f = (hh - 7.75) / 18.25;
  return 0.06 + 0.94 * ((1 + Math.cos(Math.PI * f)) / 2);
}

// Alertness (derived): wake inertia, late-morning peak, afternoon dip, evening
// wake-maintenance rise, steep fall after ~21:30, low overnight.
const ALERT_PTS: [number, number][] = [
  [0, 0.18], [2, 0.10], [4.5, 0.06], [6.5, 0.18], [7.5, 0.40], [9, 0.72],
  [10.5, 0.88], [12.5, 0.80], [14.5, 0.58], [15.5, 0.55], [17, 0.70],
  [19, 0.82], [20.5, 0.74], [21.5, 0.55], [22.5, 0.38], [23.5, 0.24],
];
function alertNatRaw(h: number) {
  h = wrap24(h);
  const n = ALERT_PTS.length;
  for (let i = 0; i < n; i++) {
    const h0 = ALERT_PTS[i][0];
    const h1 = i < n - 1 ? ALERT_PTS[i + 1][0] : 24;
    if (h >= h0 && h <= h1) {
      const v0 = ALERT_PTS[i][1];
      const v1 = i < n - 1 ? ALERT_PTS[i + 1][1] : ALERT_PTS[0][1];
      const f = h1 === h0 ? 0 : (h - h0) / (h1 - h0);
      const e = (1 - Math.cos(Math.PI * f)) / 2;
      return v0 + (v1 - v0) * e;
    }
  }
  return ALERT_PTS[0][1];
}

// Alertness → color (teal sharp → amber dipping → deep dark sleepy).
const A_STOPS: [number, [number, number, number]][] = [
  [0.0, [11, 26, 43]],
  [0.2, [44, 42, 92]],
  [0.4, [140, 66, 20]],
  [0.56, [217, 119, 6]],
  [0.74, [13, 148, 136]],
  [1.0, [45, 212, 191]],
];
function alertColor(l: number) {
  l = Math.max(0, Math.min(1, l));
  for (let i = 0; i < A_STOPS.length - 1; i++) {
    const [p0, c0] = A_STOPS[i];
    const [p1, c1] = A_STOPS[i + 1];
    if (l <= p1) {
      const f = (l - p0) / (p1 - p0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return "rgb(45,212,191)";
}

function verdict(l: number): { label: string; col: string } {
  if (l >= 0.78) return { label: "Sharp", col: "#0D9488" };
  if (l >= 0.62) return { label: "Steady", col: "#14B8A6" };
  if (l >= 0.46) return { label: "Dipping", col: "#D97706" };
  if (l >= 0.3) return { label: "Foggy", col: "#C2680C" };
  return { label: "Sleepy", col: "#6366F1" };
}

function whyFor(ih: number) {
  if (ih < 4.5) return "Melatonin's near its peak and your core temp is bottoming out. Your body is built to be dead asleep right now.";
  if (ih < 6.5) return "Core temp is at its lowest and just starting to climb. Cortisol is ramping up to get you ready to wake, but you're not there yet.";
  if (ih < 9) return "Cortisol just spiked to pull you out of sleep, but the grogginess takes an hour or two to burn off. That heavy feeling is sleep inertia, and it's normal.";
  if (ih < 12) return "Cortisol is high, core temp is climbing, and melatonin's been gone for hours. This is about the sharpest your brain gets all day.";
  if (ih < 16) return "Core temp's still high but the morning cortisol push is long gone. This dip is scheduled, not you slacking.";
  if (ih < 20.5) return "Core temp peaks now, which quietly props your alertness back up. This is the wake-maintenance zone, a kind of second wind before night.";
  return "Melatonin is switching on and core temp is starting to drop. Your body is beginning the slow handoff into sleep.";
}

function fmtClock(h: number) {
  h = wrap24(h);
  let hh = Math.floor(h + 1e-6);
  let m = Math.round((h - hh) * 60);
  if (m === 60) { m = 0; hh = wrap24(hh + 1); }
  const ap = hh < 12 ? "AM" : "PM";
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ap}`;
}

// ─── Smoothly tween the lever parameters when a toggle flips ──────────────────────

interface Params { shift: number; melMult: number; mornBoost: number; inertiaDrop: number }

function useTweenParams(target: Params): Params {
  const [val, setVal] = useState<Params>(target);
  const fromRef = useRef<Params>(target);
  const rafRef = useRef<number | null>(null);
  const key = `${target.shift},${target.melMult},${target.mornBoost},${target.inertiaDrop}`;

  useEffect(() => {
    const from = { ...fromRef.current };
    let start: number | null = null;
    const run = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / 600);
      const e = 1 - (1 - p) ** 3;
      const cur: Params = {
        shift: from.shift + (target.shift - from.shift) * e,
        melMult: from.melMult + (target.melMult - from.melMult) * e,
        mornBoost: from.mornBoost + (target.mornBoost - from.mornBoost) * e,
        inertiaDrop: from.inertiaDrop + (target.inertiaDrop - from.inertiaDrop) * e,
      };
      fromRef.current = cur;
      setVal(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return val;
}

// ─── Light lever toggle ──────────────────────────────────────────────────────────

function Lever({
  on, onToggle, icon, label, accent,
}: {
  on: boolean; onToggle: () => void; icon: string; label: string; accent: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex items-center gap-3 text-left w-full lg-press"
      style={{
        minHeight: "52px",
        padding: "10px 14px",
        borderRadius: "16px",
        background: on
          ? `linear-gradient(165deg, ${accent}2E, rgba(255,255,255,0.5))`
          : "rgba(255,255,255,0.5)",
        border: `1px solid ${on ? `${accent}66` : "rgba(255,255,255,0.6)"}`,
        boxShadow: on
          ? `inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 22px -12px ${accent}88`
          : "inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 10px -6px rgba(20,30,60,0.2)",
        transition: "background 0.3s var(--spring), border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <span style={{ fontSize: "20px", lineHeight: 1 }}>{icon}</span>
      <span className="flex-1 text-sm font-semibold" style={{ color: "var(--ink)" }}>{label}</span>
      {/* switch */}
      <span
        aria-hidden="true"
        style={{
          width: 38, height: 22, borderRadius: 999, flexShrink: 0, position: "relative",
          background: on ? accent : "rgba(11,26,43,0.16)",
          boxShadow: "inset 0 1px 2px rgba(20,30,60,0.2)",
          transition: "background 0.3s ease",
        }}
      >
        <span
          style={{
            position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #fff, #eef1f8 75%)",
            boxShadow: "0 1px 3px rgba(20,30,60,0.35)",
            transition: "left 0.3s var(--spring)",
          }}
        />
      </span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────────

export default function BodyClock() {
  const [morning, setMorning] = useState(false);
  const [screens, setScreens] = useState(false);
  const [handH, setHandH] = useState(15); // 3 PM by default, sits in the afternoon dip
  const svgRef = useRef<SVGSVGElement>(null);

  const target: Params = {
    shift: (morning ? -0.83 : 0) + (screens ? 1.5 : 0),
    melMult: screens ? 0.5 : 1,
    mornBoost: morning ? 0.07 : 0,
    inertiaDrop: screens ? 0.07 : 0,
  };
  const p = useTweenParams(target);

  // Effective drivers under the current light conditions.
  const temp = (h: number) => tempLevelNat(h - p.shift);
  const mel = (h: number) => Math.max(0, Math.min(1, melLevelNat(h - p.shift) * p.melMult));
  const cort = (h: number) => cortLevelNat(h - p.shift);
  const alert = (h: number) => {
    let a = alertNatRaw(h - p.shift);
    a += p.mornBoost * gauss(h, 8, 2.2);
    a -= p.inertiaDrop * gauss(h, 7.5, 1.8);
    return Math.max(0, Math.min(1, a));
  };

  // ── Pointer → hour (drag the hand) ──
  const hourFromEvent = (clientX: number, clientY: number): number | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * SZ - C;
    const y = ((clientY - r.top) / r.height) * SZ - C;
    let theta = Math.atan2(x, -y);
    if (theta < 0) theta += TAU;
    const h = (theta / TAU) * 24;
    return wrap24(Math.round(h * 4) / 4); // snap to 15 min
  };
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const apply = (cx: number, cy: number) => {
      const h = hourFromEvent(cx, cy);
      if (h !== null) setHandH(h);
    };
    apply(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // ── Geometry for render ──
  const ringSegs = Array.from({ length: 24 }, (_, h) => {
    const gap = 0.06;
    const mid = h + 0.5;
    return { d: annularSector(h + gap, h + 1 - gap, R_IN_RING, R_OUT), col: alertColor(alert(mid)) };
  });

  const curvePath = (fn: (h: number) => number) => {
    const steps = 96;
    let s = "";
    for (let i = 0; i <= steps; i++) {
      const h = (i / steps) * 24;
      const r = R_CURVE_MIN + fn(h) * (R_CURVE_MAX - R_CURVE_MIN);
      const [x, y] = pt(h, r);
      s += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return s + "Z";
  };

  const [handX, handY] = pt(handH, HAND_TO);
  const [handX0, handY0] = pt(handH, HAND_FROM);

  // ── Hub readout (effective state at the hand) ──
  const internalH = wrap24(handH - p.shift);
  const tL = temp(handH);
  const tRising = temp(handH + 0.25) > tL;
  const mOn = mel(handH) > 0.12;
  const cRising = cort(handH + 0.25) > cort(handH);
  const aL = alert(handH);
  const v = verdict(aL);

  const labels: [number, string][] = [[0, "12a"], [6, "6a"], [12, "12p"], [18, "6p"]];

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
      <p className="hb-kicker" style={{ color: "#C9760F" }}>One clock, everybody</p>
      <p className="text-sm mt-2" style={{ color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "44rem" }}>
        Drag the hand to any hour and read what your body is doing. The bright outer ring is your alertness across the day. The three faint loops inside are the chemistry driving it.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-7 items-start">
        {/* ── The dial ── */}
        <div style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SZ} ${SZ}`}
            width="100%"
            role="img"
            aria-label="24-hour body clock dial. Drag the hand to any hour to read alertness, core temperature, melatonin and cortisol."
            onPointerDown={onPointerDown}
            style={{ display: "block", touchAction: "none", cursor: "grab", userSelect: "none" }}
          >
            <defs>
              <filter id="hubShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#16233f" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* faint dial backdrop */}
            <circle cx={C} cy={C} r={R_IN_RING - 2} fill="rgba(255,255,255,0.16)" />

            {/* alertness ring */}
            {ringSegs.map((s, i) => (
              <path key={i} d={s.d} fill={s.col} style={{ transition: "fill 0.25s ease" }} />
            ))}
            <circle cx={C} cy={C} r={R_OUT} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx={C} cy={C} r={R_IN_RING} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            {/* hour ticks */}
            {Array.from({ length: 24 }, (_, h) => {
              const major = h % 6 === 0;
              const [x0, y0] = pt(h, R_OUT);
              const [x1, y1] = pt(h, R_OUT - (major ? 0 : 5));
              if (major) return null;
              return <line key={h} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />;
            })}

            {/* driver loops (subtle) */}
            <path d={curvePath(temp)} fill="none" stroke={TEMP_COL} strokeWidth="2" strokeOpacity="0.55" style={{ transition: "d 0.2s linear" }} />
            <path d={curvePath(cort)} fill="none" stroke={CORT_COL} strokeWidth="2" strokeOpacity="0.5" />
            <path d={curvePath(mel)} fill="none" stroke={MEL_COL} strokeWidth="2" strokeOpacity="0.6" />

            {/* hour labels */}
            {labels.map(([h, txt]) => {
              const [lx, ly] = pt(h, R_LABEL);
              return (
                <text key={h} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="600" fill="var(--ink-soft)">
                  {txt}
                </text>
              );
            })}

            {/* time hand */}
            <line x1={handX0} y1={handY0} x2={handX} y2={handY} stroke="#0B1A2B" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
            <circle cx={handX} cy={handY} r="9" fill="#fff" stroke="#0B1A2B" strokeWidth="2.5" />

            {/* center hub */}
            <circle cx={C} cy={C} r={HUB_R} fill="rgba(255,255,255,0.62)" filter="url(#hubShadow)" />
            <circle cx={C} cy={C} r={HUB_R} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" />

            <text x={C} y={C - 48} textAnchor="middle" fontSize="14" fill="var(--ink-soft)" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtClock(handH)}</text>
            <text x={C} y={C - 18} textAnchor="middle" fontSize="30" fontWeight="700" fill={v.col}>{v.label}</text>
            <text x={C} y={C + 1} textAnchor="middle" fontSize="9.5" letterSpacing="1.5" fill="var(--ink-faint)">ALERTNESS</text>
            <line x1={C - 54} y1={C + 12} x2={C + 54} y2={C + 12} stroke="rgba(11,26,43,0.12)" strokeWidth="1" />
            <text x={C} y={C + 30} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={TEMP_COL}>
              Temp {tempF(tL).toFixed(1)}°F {tRising ? "↑" : "↓"}
            </text>
            <text x={C} y={C + 47} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={MEL_COL}>
              Melatonin {mOn ? "on" : "off"}
            </text>
            <text x={C} y={C + 64} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={CORT_COL}>
              Cortisol {cRising ? "rising ↑" : "falling ↓"}
            </text>
          </svg>

          {/* legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 text-xs" style={{ color: "var(--ink-soft)" }}>
            <span className="inline-flex items-center gap-1.5"><span className="w-3.5 rounded-full" style={{ height: 3, background: TEMP_COL }} /> Core temp</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3.5 rounded-full" style={{ height: 3, background: MEL_COL }} /> Melatonin</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3.5 rounded-full" style={{ height: 3, background: CORT_COL }} /> Cortisol</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3.5 rounded-full" style={{ height: 6, background: "linear-gradient(90deg,#0B1A2B,#D97706,#2DD4BF)" }} /> Outer ring = alertness</span>
          </div>
        </div>

        {/* ── Why + levers ── */}
        <div className="flex flex-col gap-4">
          {/* why this hour */}
          <div
            key={`${Math.round(internalH)}-${v.label}`}
            style={{
              padding: "16px 18px", borderRadius: "18px",
              background: `linear-gradient(165deg, ${v.col}1A, rgba(255,255,255,0.45))`,
              border: `1px solid ${v.col}33`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
              animation: "bcFade 0.4s var(--ease-glass)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-soft)" }}>
              {fmtClock(handH)} · {v.label.toLowerCase()}
            </p>
            <p className="text-sm" style={{ color: "var(--ink)", lineHeight: 1.55 }}>{whyFor(internalH)}</p>
          </div>

          {/* light levers */}
          <div>
            <p className="hb-kicker mb-2.5" style={{ color: "var(--ink-soft)" }}>Move the clock with light</p>
            <div className="flex flex-col gap-2.5">
              <Lever on={morning} onToggle={() => setMorning((v) => !v)} icon="☀️" label="Morning sunlight" accent="#0D9488" />
              {morning && (
                <p className="text-xs px-1" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  Getting outside in the morning pulls your clock earlier, so melatonin shows up sooner that night and the next morning is easier to start. <span style={{ color: "var(--ink-faint)" }}>Khalsa et al., J Physiol (2003)</span>
                </p>
              )}
              <Lever on={screens} onToggle={() => setScreens((v) => !v)} icon="📱" label="Phone before bed" accent="#6366F1" />
              {screens && (
                <p className="text-xs px-1" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  A bright screen at night holds melatonin back by about 1.5 hours and shoves your whole clock later, so sleep shows up late and the next morning hits harder. <span style={{ color: "var(--ink-faint)" }}>Chang et al., PNAS (2014)</span>
                </p>
              )}
            </div>
            <button
              onClick={() => { setMorning(false); setScreens(false); }}
              className="mt-3 text-xs font-semibold lg-press"
              style={{
                minHeight: "44px", width: "100%", borderRadius: "14px",
                background: "rgba(255,255,255,0.5)", color: "var(--ink-soft)",
                border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                opacity: morning || screens ? 1 : 0.55,
              }}
            >
              Reset to the natural clock
            </button>
          </div>
        </div>
      </div>

      {/* The thesis line + citations */}
      <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--hairline)" }}>
        <p className="text-sm" style={{ color: "var(--ink)", lineHeight: 1.6 }}>
          The big takeaway: the afternoon dip is built into the clock, not caused by lunch, and not a sign you're lazy. Light is the main thing that moves the whole pattern, which is why when you get it matters as much as how much sleep you get.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs" style={{ color: "var(--ink-faint)" }}>
          <p>Afternoon dip is circadian: Monk, <em>Clinics in Sports Medicine</em> (2005)</p>
          <p>Core temp rhythm: Refinetti &amp; Menaker, <em>Physiol Behav</em> (1992); Kräuchi &amp; Wirz-Justice, <em>Am J Physiol</em> (1994)</p>
          <p>Light suppresses melatonin: Lewy et al., <em>Science</em> (1980)</p>
          <p>Cortisol wakes you: Pruessner et al., <em>Life Sciences</em> (1997)</p>
        </div>
      </div>

      <style>{`@keyframes bcFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </LiquidGlass>
  );
}

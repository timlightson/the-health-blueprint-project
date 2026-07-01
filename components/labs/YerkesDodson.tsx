"use client";

import { useMemo, useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";

// ─── The stress sweet spot — an interactive Yerkes-Dodson curve ──────────────
// Mechanism exhibit: drag the pressure level and watch performance climb,
// peak, then collapse once stress chemicals flood the prefrontal cortex.
// The optimum sits lower for hard tasks than easy ones, the original
// Yerkes & Dodson (1908) finding; the mechanism is Arnsten (2009).

const TEAL = "#0E8A7D";
const AMBER = "#C9760F";
const ROSE = "#D8443B";

// SVG layout
const W = 640;
const H = 300;
const PADL = 20;
const PADR = 20;
const PADT = 26;
const PADB = 46;
const PLOTW = W - PADL - PADR;
const PLOTH = H - PADT - PADB;

type Task = "easy" | "hard";

// Curve: gaussian inverted-U. Hard tasks peak earlier and fall off faster.
const CURVE: Record<Task, { peak: number; sigma: number }> = {
  easy: { peak: 62, sigma: 30 },
  hard: { peak: 40, sigma: 22 },
};

function perfAt(x: number, task: Task): number {
  const { peak, sigma } = CURVE[task];
  return 100 * Math.exp(-((x - peak) ** 2) / (2 * sigma * sigma));
}

const px = (x: number) => PADL + (x / 100) * PLOTW;
const py = (p: number) => PADT + (1 - p / 100) * PLOTH;

export default function YerkesDodson() {
  const [pressure, setPressure] = useState(30);
  const [task, setTask] = useState<Task>("easy");

  const perf = perfAt(pressure, task);
  const { peak } = CURVE[task];

  // Sweet spot: the band where you're at 88%+ of possible performance.
  const [bandLo, bandHi] = useMemo(() => {
    let lo = peak;
    let hi = peak;
    while (lo > 0 && perfAt(lo - 1, task) >= 88) lo--;
    while (hi < 100 && perfAt(hi + 1, task) >= 88) hi++;
    return [lo, hi];
  }, [task, peak]);

  const zone =
    perf >= 88
      ? {
          label: "Locked in",
          color: TEAL,
          text: "Right here, stress is working for you. Enough adrenaline to sharpen focus and reaction time, not enough to flood anything.",
        }
      : pressure < peak
      ? {
          label: "Not enough pressure",
          color: AMBER,
          text: "Too little at stake. Your brain isn't recruiting yet, so focus drifts. A deadline or a bit of challenge actually helps from here.",
        }
      : {
          label: "Past the peak",
          color: ROSE,
          text: "Cortisol and noradrenaline are now flooding the prefrontal cortex, the part that plans and focuses. Performance drops fast, and pushing harder pushes it lower.",
        };

  const linePath = useMemo(() => {
    let d = "";
    for (let x = 0; x <= 100; x += 2) {
      const cmd = x === 0 ? "M" : "L";
      d += `${cmd} ${px(x).toFixed(1)} ${py(perfAt(x, task)).toFixed(1)} `;
    }
    return d;
  }, [task]);

  return (
    <LiquidGlass radius={24} bezel={22} scale={48} style={{ padding: "24px" }}>
      {/* Task difficulty toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Slide the pressure. Find the peak.
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            A little stress sharpens you. Past the peak, it takes you offline.
          </p>
        </div>
        <div className="lg-segment flex rounded-full" style={{ padding: "3px", gap: "2px" }} role="group" aria-label="Task difficulty">
          {(["easy", "hard"] as Task[]).map((t) => (
            <button
              key={t}
              onClick={() => setTask(t)}
              aria-pressed={task === t}
              className={`rounded-full text-xs font-semibold px-4 ${task === t ? "lg-segment-active" : ""}`}
              style={{ minHeight: "38px", color: task === t ? "var(--ink)" : "var(--ink-soft)" }}
            >
              {t === "easy" ? "Easy task" : "Hard task"}
            </button>
          ))}
        </div>
      </div>

      {/* Curve */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} aria-hidden="true">
        <defs>
          <linearGradient id="ydCurve" gradientUnits="userSpaceOnUse" x1={PADL} y1="0" x2={PADL + PLOTW} y2="0">
            <stop offset="0" stopColor={AMBER} />
            <stop offset={`${peak / 100}`} stopColor={TEAL} />
            <stop offset="1" stopColor={ROSE} />
          </linearGradient>
        </defs>

        {/* sweet spot band */}
        <rect
          x={px(bandLo)}
          y={PADT}
          width={px(bandHi) - px(bandLo)}
          height={PLOTH}
          fill={`${TEAL}14`}
          style={{ transition: "all 0.45s var(--ease-glass)" }}
        />
        <text x={(px(bandLo) + px(bandHi)) / 2} y={PADT + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill={TEAL}>
          sweet spot
        </text>

        {/* axes */}
        <line x1={PADL} y1={PADT + PLOTH} x2={PADL + PLOTW} y2={PADT + PLOTH} stroke="rgba(11,26,43,0.16)" strokeWidth="1" />
        <text x={PADL} y={H - 14} fontSize="10.5" fill="var(--ink-faint)">No pressure</text>
        <text x={PADL + PLOTW} y={H - 14} fontSize="10.5" fill="var(--ink-faint)" textAnchor="end">Max pressure</text>
        <text x={PADL + 2} y={PADT + 10} fontSize="10.5" fill={TEAL} fontWeight="600">Sharp</text>
        <text x={PADL + 2} y={PADT + PLOTH - 5} fontSize="10.5" fill="var(--ink-faint)">Flat</text>

        {/* the curve */}
        <path d={linePath} fill="none" stroke="url(#ydCurve)" strokeWidth="3.5" strokeLinecap="round" style={{ transition: "d 0.45s var(--ease-glass)" }} />

        {/* your marker */}
        <line
          x1={px(pressure)} y1={py(perf)} x2={px(pressure)} y2={PADT + PLOTH}
          stroke={zone.color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5"
        />
        <circle cx={px(pressure)} cy={py(perf)} r="8" fill="#fff" stroke={zone.color} strokeWidth="3" style={{ transition: "stroke 0.3s ease" }} />
      </svg>

      {/* Pressure slider */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pressure}
        onChange={(e) => setPressure(Number(e.target.value))}
        aria-label="Pressure level"
        aria-valuetext={`Pressure ${pressure} of 100, performance ${Math.round(perf)} percent, ${zone.label}`}
        className="w-full"
        style={{ accentColor: zone.color, height: "28px", cursor: "pointer" }}
      />

      {/* Readout */}
      <div className="flex items-start gap-4 mt-3">
        <div
          className="flex-shrink-0 text-center rounded-2xl px-4 py-3"
          style={{
            background: `linear-gradient(165deg, ${zone.color}1F, rgba(255,255,255,0.45))`,
            border: `1px solid ${zone.color}33`,
            minWidth: "104px",
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: zone.color }}>
            {Math.round(perf)}
            <span className="text-sm font-semibold" style={{ opacity: 0.6 }}>%</span>
          </div>
          <div className="text-[11px] font-medium mt-1" style={{ color: "var(--ink-soft)" }}>performance</div>
        </div>
        <div aria-live="polite">
          <p className="text-sm font-bold" style={{ color: zone.color, transition: "color 0.3s ease" }}>
            {zone.label}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
            {zone.text}
          </p>
          {task === "hard" && (
            <p className="text-xs mt-2" style={{ color: "var(--ink-faint)", lineHeight: 1.5 }}>
              Notice the peak moved left. Harder tasks tip over sooner, which is why a final exam floods you faster than free throws at practice.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs mt-4 pt-3" style={{ color: "var(--ink-faint)", borderTop: "1px solid rgba(255,255,255,0.5)" }}>
        Yerkes &amp; Dodson, <em>J. Comparative Neurology</em> (1908) · Arnsten, <em>Nature Reviews Neuroscience</em> (2009)
      </p>
    </LiquidGlass>
  );
}

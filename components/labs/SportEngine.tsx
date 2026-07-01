"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Play, RotateCcw } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import {
  type Sport,
  type Scenario,
  type LactateLevel,
  RECOVERY_CITATION,
} from "@/lib/sports-energy";

// ─── Shared three-engine exhibit, effort + intermittent ──────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

const LAC_EFFORT: Record<LactateLevel, number> = { low: 0.3, med: 0.58, high: 0.82, extreme: 1.0 };
const LAC_INTER: Record<LactateLevel, number> = { low: 0.22, med: 0.5, high: 0.78, extreme: 1.0 };
const LAC_WORD: Record<LactateLevel, string> = { low: "low", med: "moderate", high: "high", extreme: "extreme" };

const REC = 300; // recovery window, sim seconds

const ENGINES = [
  { key: "phos" as const, name: "Phosphagen", sub: "ATP-PC", col: "#F0531C", state: "reserve" },
  { key: "glyc" as const, name: "Glycolytic", sub: "anaerobic", col: "#D97706", state: "reserve" },
  { key: "aero" as const, name: "Aerobic", sub: "oxidative", col: "#0D9488", state: "online" },
];

interface Sim {
  mode: "effort" | "intermittent";
  dt: number;
  mainLen: number;
  mainWall: number;
  recWall: number;
  series: { phos: number[]; glyc: number[]; aero: number[]; lac: number[]; dom: string[] };
  end: { phos: number; glyc: number; aero: number; lac: number };
  cycle?: number;
  work?: number;
  nCycles?: number;
}

function simulateEffort(sc: Scenario): Sim {
  const D = sc.duration, dt = 0.1, N = Math.round(D / dt);
  const ceil = clamp(0.1 + (sc.split.aero / 100) * 0.9, 0.1, 0.98);
  const lacTarget = LAC_EFFORT[sc.lactate];
  const phos: number[] = [], aero: number[] = [], lac: number[] = [], dom: string[] = [], pg: number[] = [];
  let totalWork = 0;
  for (let i = 0; i <= N; i++) {
    const t = Math.min(i * dt, D);
    const ph = clamp(1 - t / 11, 0, 1);
    const ae = 1 - Math.exp(-t / 35);
    const pP = Math.min(1, ph);
    let rem = 1 - pP;
    const pA = Math.min(rem, ae * ceil);
    rem -= pA;
    const pG = Math.max(0, rem);
    pg.push(pG);
    if (i > 0) totalWork += pG * dt;
    let d = "aero";
    if (pP >= pG && pP >= pA) d = "phos";
    else if (pG >= pA) d = "glyc";
    phos.push(ph); aero.push(ae); dom.push(d);
    lac.push(lacTarget * smoothstep(0, D * 0.9, t));
  }
  const floor = clamp(1 - sc.split.glyc / 55, 0.05, 0.97);
  const cap = totalWork > 0 ? totalWork / (1 - floor) : 1;
  const glyc: number[] = [];
  let cum = 0;
  for (let i = 0; i < pg.length; i++) {
    if (i > 0) cum += pg[i] * dt;
    glyc.push(clamp(1 - cum / cap, 0, 1));
  }
  const runWall = clamp(4 + (10 * (Math.log(D) - Math.log(10))) / (Math.log(1000) - Math.log(10)), 4, 14);
  return {
    mode: "effort", dt, mainLen: D, mainWall: runWall, recWall: 8,
    series: { phos, glyc, aero, lac, dom },
    end: { phos: phos[N], glyc: glyc[N], aero: aero[N], lac: lac[N] },
  };
}

function simulateIntermittent(sc: Scenario): Sim {
  const W = sc.work ?? 5, R = sc.rest ?? 30, cycle = W + R;
  const nCycles = clamp(Math.round(sc.duration / cycle), 6, 14);
  const segLen = nCycles * cycle;
  const dt = 0.2, N = Math.round(segLen / dt);
  const aeroBase = clamp(0.42 + (sc.split.aero / 100) * 0.52, 0.42, 0.95);
  const lacTarget = LAC_INTER[sc.lactate];
  const pRate = 0.3 / W, gRate = 0.32 / W;        // per-second drain during a burst
  const domWork = sc.split.phos >= sc.split.glyc ? "phos" : "glyc";
  const phos: number[] = [], glyc: number[] = [], aero: number[] = [], lac: number[] = [], dom: string[] = [];
  let p = 1, g = 1;
  for (let i = 0; i <= N; i++) {
    const t = i * dt;
    const cp = t % cycle;
    const inWork = cp < W;
    const ae = aeroBase * (1 - Math.exp(-t / 45));
    if (inWork) { p -= pRate * dt; g -= gRate * dt; }
    else { p += ((1 - p) / 40) * dt; g += ((1 - g) / 130) * dt; }
    p = clamp(p, 0, 1); g = clamp(g, 0, 1);
    // Lactate builds toward the cited level across the match, with a burst ripple.
    const env = lacTarget * (1 - Math.exp(-t / (segLen * 0.45)));
    const ripple = inWork ? 0.05 * lacTarget * (cp / W) : 0;
    phos.push(p); glyc.push(g); aero.push(ae);
    lac.push(clamp(env + ripple, 0, 1));
    dom.push(inWork ? domWork : "aero");
  }
  return {
    mode: "intermittent", dt, mainLen: segLen, mainWall: clamp(nCycles * 1.1, 8, 16), recWall: 7,
    series: { phos, glyc, aero, lac, dom },
    end: { phos: p, glyc: g, aero: aeroBase * (1 - Math.exp(-segLen / 45)), lac: lac[N] },
    cycle, work: W, nCycles,
  };
}

interface Frame { phase: "ready" | "main" | "rec"; phos: number; glyc: number; aero: number; lac: number; dom: string; inWork: boolean; burst: number }

function readFrame(sim: Sim, clock: number): Frame {
  if (clock <= sim.mainLen) {
    const idx = clock / sim.dt;
    const i0 = Math.floor(idx);
    const i1 = Math.min(sim.series.phos.length - 1, i0 + 1);
    const f = idx - i0;
    const lp = (a: number[]) => a[i0] + (a[i1] - a[i0]) * f;
    const inWork = sim.cycle ? clock % sim.cycle < (sim.work ?? 0) : false;
    return {
      phase: clock < 0.05 ? "ready" : "main",
      phos: lp(sim.series.phos), glyc: lp(sim.series.glyc), aero: lp(sim.series.aero), lac: lp(sim.series.lac),
      dom: sim.series.dom[Math.min(i0, sim.series.dom.length - 1)],
      inWork, burst: sim.cycle ? Math.floor(clock / sim.cycle) + 1 : 0,
    };
  }
  const td = clock - sim.mainLen;
  const e = sim.end;
  return {
    phase: "rec",
    phos: e.phos + (1 - e.phos) * (1 - Math.exp(-td / 40)),  // ~50% by 30s, ~99% by 3min
    glyc: e.glyc + (1 - e.glyc) * (1 - Math.exp(-td / 180)),
    aero: e.aero * Math.exp(-td / 60),
    lac: e.lac * Math.exp(-td / 240),                        // clears over minutes
    dom: "rec", inWork: false, burst: 0,
  };
}

function fmtMMSS(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function dominantLabel(split: { phos: number; glyc: number; aero: number }) {
  const e: [string, number][] = [["Phosphagen", split.phos], ["Glycolytic", split.glyc], ["Aerobic", split.aero]];
  e.sort((a, b) => b[1] - a[1]);
  return e[0][1] - e[1][1] <= 6 ? `${e[0][0]} and ${e[1][0]}, even` : e[0][0];
}

// ─── Vertical engine gauge ─────────────────────────────────────────────────────

function Gauge({ engine, level, dominant }: {
  engine: typeof ENGINES[number]; level: number; dominant: boolean;
}) {
  const pct = Math.round(clamp(level, 0, 1) * 100);
  return (
    <div className="flex flex-col items-center text-center" style={{ minWidth: 0 }}>
      <div style={{ height: 22 }}>
        <span className="text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
          style={{ color: engine.col, opacity: dominant ? 1 : 0, transition: "opacity 0.2s ease" }}>
          <span className="rounded-full" style={{ width: 6, height: 6, background: engine.col, boxShadow: `0 0 8px ${engine.col}` }} />
          Carrying
        </span>
      </div>
      <div className="lg-well relative w-full overflow-hidden"
        style={{
          height: 156, borderRadius: 14, maxWidth: 78,
          boxShadow: dominant
            ? `inset 0 1px 3px rgba(20,30,60,0.2), 0 0 0 2px ${engine.col}, 0 0 22px -4px ${engine.col}`
            : "inset 0 1px 3px rgba(20,30,60,0.2), inset 0 0 0 1px rgba(255,255,255,0.22)",
          transition: "box-shadow 0.2s ease",
        }}>
        <div className="absolute inset-x-0 bottom-0"
          style={{
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${engine.col}, ${engine.col}bb)`,
            boxShadow: `0 0 14px ${engine.col}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
            borderRadius: "8px 8px 0 0", transition: "height 0.1s linear",
          }} />
        <span className="absolute inset-x-0 top-2 text-center text-sm font-bold tabular-nums" style={{ color: "var(--ink)" }}>{pct}%</span>
      </div>
      <p className="text-sm font-bold mt-2.5" style={{ color: "var(--ink)" }}>{engine.name}</p>
      <p className="text-[11px] -mt-0.5" style={{ color: engine.col }}>{engine.sub}</p>
      <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--ink-faint)" }}>{engine.state}</p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function SportEngine({ sport }: { sport: Sport }) {
  const [scIdx, setScIdx] = useState(0);
  const sc = sport.scenarios[scIdx];
  const sim = useMemo(() => (sport.mode === "intermittent" ? simulateIntermittent(sc) : simulateEffort(sc)), [sc, sport.mode]);

  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const clockRef = useRef(0);
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const total = sim.mainLen + REC;
  const stop = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  useEffect(() => { stop(); setPlaying(false); clockRef.current = 0; setClock(0); }, [scIdx, sport.id]);
  useEffect(() => () => stop(), []);

  const play = () => {
    stop();
    clockRef.current = 0; setClock(0); setPlaying(true); lastRef.current = 0;
    const tick = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min(0.05, (ts - lastRef.current) / 1000);
      lastRef.current = ts;
      let c = clockRef.current;
      c += c < sim.mainLen ? dt * (sim.mainLen / sim.mainWall) : dt * (REC / sim.recWall);
      if (c >= total) { clockRef.current = total; setClock(total); setPlaying(false); rafRef.current = null; return; }
      clockRef.current = c; setClock(c);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  const reset = () => { stop(); setPlaying(false); clockRef.current = 0; setClock(0); };

  const fr = readFrame(sim, clock);
  const levels: Record<string, number> = { phos: fr.phos, glyc: fr.glyc, aero: fr.aero };
  const lacPct = Math.round(clamp(fr.lac, 0, 1) * 100);
  const lacCol = lacPct > 66 ? "#DC2626" : lacPct > 33 ? "#E0892E" : "#D97706";

  let status: string;
  if (fr.phase === "ready") status = playing ? "On your marks" : "Ready";
  else if (fr.phase === "rec") status = `Recovering · ${fmtMMSS(clock - sim.mainLen)}`;
  else if (sim.mode === "intermittent") status = `Burst ${Math.min(fr.burst, sim.nCycles ?? 0)} of ${sim.nCycles}`;
  else status = `Running · ${fmtMMSS(clock)} of ${fmtMMSS(sim.mainLen)}`;

  const domEngine = ENGINES.find((e) => e.key === fr.dom);
  const nowCarrying = fr.phase === "rec" ? "Recovering" : domEngine ? domEngine.name : "Ready";
  const nowCol = fr.phase === "rec" ? "var(--ink-soft)" : domEngine ? domEngine.col : "var(--ink-soft)";

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
      <p className="hb-kicker" style={{ color: sport.theme }}>{sport.name} · {sport.profileLabel.toLowerCase()}</p>
      <p className="text-sm mt-2" style={{ color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "46rem" }}>
        {sport.mode === "intermittent"
          ? "Watch the bursts drain your fast engines while the aerobic base holds steady and quietly refills them between efforts."
          : "Watch one engine hand off to the next as the effort runs, then watch how slowly they come back."}
      </p>

      {/* Scenario selector */}
      {sport.scenarios.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {sport.scenarios.map((s, i) => {
            const active = i === scIdx;
            return (
              <button key={s.label} onClick={() => setScIdx(i)} aria-pressed={active}
                className="text-sm font-semibold lg-press"
                style={{
                  minHeight: "44px", padding: "0 16px", borderRadius: "999px",
                  background: active ? `linear-gradient(165deg, ${sport.theme}33, rgba(255,255,255,0.45))` : "rgba(255,255,255,0.5)",
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                  border: `1px solid ${active ? `${sport.theme}66` : "rgba(255,255,255,0.6)"}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                }}>
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-7 items-start">
        {/* gauges + transport */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={playing ? reset : play} aria-label={playing ? "Reset" : "Play"}
              className="inline-flex items-center justify-center lg-press flex-shrink-0"
              style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(165deg, #16384a, #0B1A2B)", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 22px -10px rgba(11,26,43,0.6)" }}>
              {playing ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" style={{ marginLeft: 2 }} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{status}</p>
                {sim.mode === "intermittent" && fr.phase === "main" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ color: fr.inWork ? "#fff" : "var(--ink-soft)", background: fr.inWork ? sport.theme : "rgba(11,26,43,0.08)", transition: "background 0.15s ease, color 0.15s ease" }}>
                    {fr.inWork ? "Burst" : "Rest"}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Now carrying the load: <span className="font-bold" style={{ color: nowCol }}>{nowCarrying}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {ENGINES.map((engine) => (
              <Gauge key={engine.key} engine={engine} level={levels[engine.key]}
                dominant={fr.phase === "main" && fr.dom === engine.key} />
            ))}
          </div>

          {/* lactate */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>Lactate · the burn</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: lacCol }}>{lacPct}%</span>
            </div>
            <div className="lg-well overflow-hidden" style={{ height: 12, borderRadius: 999 }}>
              <div style={{ height: "100%", width: `${lacPct}%`, background: `linear-gradient(90deg, #D97706, ${lacCol})`, boxShadow: `0 0 12px ${lacCol}88, inset 0 1px 0 rgba(255,255,255,0.4)`, borderRadius: 999, transition: "width 0.1s linear, background 0.3s ease" }} />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "var(--ink-faint)" }}>
              Peak for this effort: <span className="font-semibold" style={{ color: lacCol }}>{LAC_WORD[sc.lactate]}</span>. It clears slowly once you stop, faster with easy movement.
            </p>
          </div>

          {sim.mode === "intermittent" && (
            <div className="mt-5 p-3.5" style={{ borderRadius: "16px", background: `${sport.theme}12`, border: `1px solid ${sport.theme}30` }}>
              <p className="text-sm" style={{ color: "var(--ink)", lineHeight: 1.5 }}>
                The aerobic base is what refills your sprint tanks between bursts. More endurance is what lets you repeat power late in the game. Work to rest here is about <span className="font-bold">{sc.work}s on, {sc.rest}s off</span>.
              </p>
            </div>
          )}
        </div>

        {/* readout */}
        <div className="flex flex-col gap-4">
          <div style={{ padding: "16px 18px", borderRadius: "18px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ink-soft)" }}>
              {sc.blendLabel ?? "Energy split"} · {sc.durationLabel}
            </p>
            <div className="flex overflow-hidden mb-2.5" style={{ height: 14, borderRadius: 999 }}>
              {ENGINES.map((eng) => (
                <div key={eng.key} style={{ width: `${sc.split[eng.key]}%`, background: eng.col, transition: "width 0.4s var(--ease-glass)" }} />
              ))}
            </div>
            <div className="space-y-1">
              {ENGINES.map((eng) => (
                <div key={eng.key} className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
                    <span className="rounded-full" style={{ width: 8, height: 8, background: eng.col }} />{eng.name}
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: eng.col }}>{sc.split[eng.key]}%</span>
                </div>
              ))}
            </div>
            <p className="text-sm mt-3" style={{ color: "var(--ink)" }}>
              Dominant engine: <span className="font-bold">{dominantLabel(sc.split)}</span>
            </p>
          </div>

          <div key={sc.label} style={{ padding: "16px 18px", borderRadius: "18px", background: `linear-gradient(165deg, ${sport.theme}1A, rgba(255,255,255,0.45))`, border: `1px solid ${sport.theme}30`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)", animation: "seFade 0.4s var(--ease-glass)" }}>
            <p className="text-sm" style={{ color: "var(--ink)", lineHeight: 1.55 }}>{sc.why}</p>
          </div>

          <div style={{ padding: "14px 16px", borderRadius: "16px", background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.24)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#0B6F65" }}>Why rest matters</p>
            <p className="text-xs" style={{ color: "var(--ink)", lineHeight: 1.5 }}>
              Hit play and let it run past the finish. Your phosphagen tank comes back about halfway in 30 seconds and most of the way in 3 to 5 minutes, while lactate takes longer. The next hard effort starts from wherever you let it recover.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs" style={{ borderTop: "1px solid var(--hairline)", color: "var(--ink-faint)" }}>
        <p>{sc.citation}</p>
        <p>Recovery rates: {RECOVERY_CITATION}</p>
      </div>

      <style>{`@keyframes seFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </LiquidGlass>
  );
}

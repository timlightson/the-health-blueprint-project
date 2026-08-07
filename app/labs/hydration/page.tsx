"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Apple, BookOpen, Flame, GlassWater, Moon, Pencil, Play, RotateCcw, Sun, Sunrise, type LucideIcon } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import WaterTank from "@/components/labs/WaterTank";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";

const ACCENT = "#2563EB";

// ─── Shared hydration model ──────────────────────────────────────────────────
// These zones and drain rates are teaching assumptions, not validated personal
// thresholds. Real fluid balance and symptoms vary substantially.
const zoneFor = (d: number) =>
  d < 1 ? { id: "good" as const, label: "Near the model start", color: "#0E8A7D" }
  : d < 2 ? { id: "warn" as const, label: "Below the model line", color: "#C9760F" }
  : { id: "bad" as const, label: "Far below the model line", color: "#D8443B" };

// ─── The Water Line — a day on your water, compressed to 75 seconds ─────────
// The compressed day uses illustrative drain rates to make activity differences
// visible. It is not a fluid prescription or a measurement of body-water loss.
const DAY_START = 7;
const DAY_END = 22;
const SEC_PER_HOUR = 5;
const TICK_MS = 100;
const DRINK_RELIEF = 0.42; // one honest bottle-swig session
const DRINK_COOLDOWN = 2000;
const THIRST_AT = 1.5;

interface DayEvent { from: number; to: number; drain: number; label: string; icon: LucideIcon }
const EVENTS: DayEvent[] = [
  { from: 7, to: 8, drain: 0.12, label: "Morning routine.", icon: Sunrise },
  { from: 8, to: 11, drain: 0.09, label: "Classes.", icon: BookOpen },
  { from: 11, to: 12, drain: 1.15, label: "PE. The model assigns a higher loss rate.", icon: Activity },
  { from: 12, to: 12.75, drain: 0.1, label: "Lunch.", icon: Apple },
  { from: 12.75, to: 14.5, drain: 0.09, label: "Afternoon classes.", icon: Pencil },
  { from: 14.5, to: 15.5, drain: 0.5, label: "Hot walk home.", icon: Sun },
  { from: 15.5, to: 17, drain: 0.1, label: "Homework.", icon: BookOpen },
  { from: 17, to: 18.5, drain: 1.4, label: "Practice. The model assigns its highest loss rate.", icon: Flame },
  { from: 18.5, to: 22, drain: 0.08, label: "Dinner and evening.", icon: Moon },
];
const eventAt = (h: number) => EVENTS.find((e) => h >= e.from && h < e.to) ?? EVENTS[EVENTS.length - 1];

const fmtClock = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ap = hh >= 12 ? "PM" : "AM";
  let d = hh % 12; if (d === 0) d = 12;
  return `${d}:${mm.toString().padStart(2, "0")} ${ap}`;
};

function gameGrade(pctGreen: number): { title: string; note: string } {
  if (pctGreen >= 0.85) return { title: "Above the model line", note: "Your choices kept this illustrative tank near its starting level." };
  if (pctGreen >= 0.6) return { title: "Mostly above the line", note: "The model assigned its largest losses to the active periods." };
  if (pctGreen >= 0.35) return { title: "Below the line for part of the day", note: "Try changing drink timing and compare the model output." };
  return { title: "Below the model line", note: "This is a game result, not an estimate of your hydration or cognitive performance." };
}

type GamePhase = "intro" | "running" | "done";

function WaterLineGame() {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [simH, setSimH] = useState(DAY_START);
  const [deficit, setDeficit] = useState(0.4);
  const [coolUntil, setCoolUntil] = useState(0);
  const [drinks, setDrinks] = useState(0);
  const [thirstShown, setThirstShown] = useState(false);
  const [thirstAtClock, setThirstAtClock] = useState<string | null>(null);
  const stats = useRef({ green: 0, total: 0, worst: 0.4, hours: DAY_START, lastT: 0 });
  const timer = useRef<number | null>(null);

  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  useEffect(() => stop, []);

  const start = () => {
    stats.current = { green: 0, total: 0, worst: 0.4, hours: DAY_START, lastT: performance.now() };
    setSimH(DAY_START); setDeficit(0.4); setDrinks(0); setThirstShown(false); setThirstAtClock(null);
    setPhase("running");
    stop();
    // Wall-clock integration: browsers throttle intervals in hidden tabs, so
    // each tick advances by real elapsed time instead of a fixed step.
    timer.current = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(1.5, (now - stats.current.lastT) / 1000); // seconds
      stats.current.lastT = now;
      const dSimH = dt / SEC_PER_HOUR;
      stats.current.hours = Math.min(DAY_END, stats.current.hours + dSimH);
      const ev = eventAt(stats.current.hours);
      setSimH(stats.current.hours);
      setDeficit((d) => {
        const nd = Math.min(5, d + ev.drain * dSimH);
        stats.current.total += dt;
        if (nd < 1) stats.current.green += dt;
        if (nd > stats.current.worst) stats.current.worst = nd;
        return nd;
      });
      if (stats.current.hours >= DAY_END) { stop(); setPhase("done"); }
    }, TICK_MS);
  };

  // An illustrative alert used by the game; not a physiological prediction.
  useEffect(() => {
    if (phase === "running" && !thirstShown && deficit >= THIRST_AT) {
      setThirstShown(true);
      setThirstAtClock((c) => c ?? fmtClock(simH)); // keep the FIRST time thirst hit
    }
  }, [deficit, phase, thirstShown, simH]);

  const drink = () => {
    if (phase !== "running" || Date.now() < coolUntil) return;
    setDeficit((d) => Math.max(0, d - DRINK_RELIEF));
    setDrinks((n) => n + 1);
    setCoolUntil(Date.now() + DRINK_COOLDOWN);
    if (deficit - DRINK_RELIEF < THIRST_AT) setThirstShown(false);
  };

  const zone = zoneFor(deficit);
  const ev = eventAt(simH);
  const EventIcon = ev.icon;
  const pctDay = (simH - DAY_START) / (DAY_END - DAY_START);
  const pctGreen = stats.current.total ? stats.current.green / stats.current.total : 0;
  const grade = gameGrade(pctGreen);
  const cooling = Date.now() < coolUntil;

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px" }}>
      <div className="relative overflow-hidden" style={{ borderRadius: 18, background: "radial-gradient(130% 100% at 50% 0%, #0C1B33 0%, #050B18 72%)", minHeight: 430 }}>
        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#60A5FA" }}>The Water Line · one school day</p>
            <h3 className="text-3xl font-bold mt-2 text-white" style={{ letterSpacing: "-0.02em" }}>Keep the tank above the line</h3>
            <p className="text-sm mt-3 mb-6" style={{ color: "#94A3B8", maxWidth: 360, lineHeight: 1.55 }}>
              A school day compressed to 75 seconds. The game assigns larger losses to PE, heat, and practice. Its tank is illustrative, not a measurement of your body.
            </p>
            <button onClick={start} className="rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 50, background: "linear-gradient(160deg, #60A5FA, #2563EB)", color: "#fff", boxShadow: "0 10px 30px -8px rgba(37,99,235,0.7)" }}>
              <Play className="w-4 h-4" /> Start the day
            </button>
          </div>
        )}

        {phase === "running" && (
          <div className="absolute inset-0 flex flex-col p-4">
            {/* HUD */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold tabular-nums text-white">{fmtClock(simH)}</div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: zone.color, background: `${zone.color}1F`, border: `1px solid ${zone.color}55` }}>
                −{deficit.toFixed(1)}% · {zone.label}
              </div>
            </div>
            {/* day progress */}
            <div className="mt-2 rounded-full" style={{ height: 5, background: "#12203A" }}>
              <div className="rounded-full" style={{ height: 5, width: `${pctDay * 100}%`, background: "linear-gradient(90deg, #60A5FA, #2563EB)", transition: "width 0.15s linear" }} />
            </div>

            <div className="flex-1 flex items-center justify-center gap-6 mt-2">
              <WaterTank level={1 - deficit / 4.2} zone={zone.id} width={124} height={196} />
              <div style={{ maxWidth: 210 }}>
                <EventIcon className="w-6 h-6" aria-hidden="true" style={{ color: "#60A5FA" }} />
                <p className="text-sm mt-1 font-medium text-white" style={{ lineHeight: 1.45 }}>{ev.label}</p>
                {thirstShown && (
                  <p className="text-xs mt-3 font-bold rounded-xl px-3 py-2 animate-pulse-slow" style={{ color: "#FCA5A5", background: "rgba(216,68,59,0.16)", border: "1px solid rgba(216,68,59,0.4)" }}>
                    Thirst alert at the game&apos;s {THIRST_AT}% setting. This is not a personal prediction.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={drink}
              disabled={cooling}
              className="w-full rounded-full font-bold flex items-center justify-center gap-2"
              style={{
                minHeight: 54,
                background: cooling ? "#12203A" : "linear-gradient(160deg, #67E8F9, #2563EB)",
                color: cooling ? "#3E5375" : "#fff",
                boxShadow: cooling ? "none" : "0 12px 30px -8px rgba(37,99,235,0.65)",
                transition: "all 0.25s ease",
              }}
            >
              <GlassWater className="w-5 h-5" /> {cooling ? "swallowing…" : "Drink"}
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#60A5FA" }}>Day over</p>
            <div className="text-6xl font-bold tabular-nums mt-1 text-white" style={{ letterSpacing: "-0.03em" }}>{Math.round(pctGreen * 100)}%</div>
            <p className="text-xs" style={{ color: "#64748B" }}>of the day in the green</p>
            <p className="text-lg font-bold mt-2" style={{ color: "#67E8F9" }}>{grade.title}</p>
            <p className="text-sm mt-2" style={{ color: "#94A3B8", maxWidth: 360, lineHeight: 1.55 }}>{grade.note}</p>
            <div className="flex gap-6 mt-4 text-sm tabular-nums">
              <div><span className="font-bold text-white">−{stats.current.worst.toFixed(1)}%</span><span style={{ color: "#64748B" }}> worst dip</span></div>
              <div><span className="font-bold text-white">{drinks}</span><span style={{ color: "#64748B" }}> drinks</span></div>
              {thirstAtClock && <div><span className="font-bold text-white">{thirstAtClock}</span><span style={{ color: "#64748B" }}> first thirst</span></div>}
            </div>
            <button onClick={start} className="mt-5 rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 46, background: "linear-gradient(160deg, #60A5FA, #2563EB)", color: "#fff" }}>
              <RotateCcw className="w-4 h-4" /> Run the day again
            </button>
          </div>
        )}
      </div>
      <p className="text-xs mt-3 px-2" style={{ color: "var(--ink-faint)" }}>
        Drain rates are illustrative assumptions. Real sweat and fluid losses vary with body size, activity, clothing, heat, acclimatization, food, and individual physiology.
      </p>
    </LiquidGlass>
  );
}

// ─── Sandbox — grab the water yourself ───────────────────────────────────────
function Sandbox() {
  const [deficit, setDeficit] = useState(0.5);
  const zone = zoneFor(deficit);
  const note =
    deficit < 1 ? "The tank is close to its starting level."
    : deficit < 2 ? "The tank has crossed the model's first illustrative line."
    : "The tank is well below its starting level. The model does not predict symptoms or performance.";

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} className="mt-4" style={{ padding: "24px" }}>
      <div className="grid sm:grid-cols-[170px_1fr] gap-6 items-center">
        <div className="flex justify-center">
          <WaterTank
            level={1 - deficit / 5}
            zone={zone.id}
            interactive
            onLevel={(v) => setDeficit(+(5 * (1 - v)).toFixed(1))}
            ariaLabel="Water level. Drag or use arrow keys."
          />
        </div>
        <div>
          <div className="text-3xl font-bold" style={{ color: zone.color }}>{zone.label}</div>
          <p className="text-sm mt-2" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{note}</p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>−{deficit.toFixed(1)}%</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>illustrative deficit</div>
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: ACCENT }}>Not measured</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>hydration status</div>
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: ACCENT }}>Not predicted</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>symptoms or performance</div>
            </div>
          </div>
          <p className="text-xs mt-5" style={{ color: "var(--ink-faint)", lineHeight: 1.55 }}>
            This control changes a teaching model only. Real fluid balance depends on intake, sweat, food, heat, acclimatization, body size, and health conditions.
          </p>
        </div>
      </div>
    </LiquidGlass>
  );
}

export default function HydrationLab() {
  return (
    <LabShell lab="hydration">
      <LabHero
        lab="hydration"
        kicker="Hydration Blueprint · 04"
        title="Model fluid loss across a day"
        subtitle="Run a compressed school day with illustrative fluid-loss assumptions. The model does not measure hydration or prescribe intake."
        accent={ACCENT}
      />

      <WaterLineGame />
      <Sandbox />

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~60%" label="of your body is water" accent={ACCENT} />
        <StatTile value="Variable" label="mood and performance findings differ across studies" accent={ACCENT} />
        <StatTile value="Useful" label="thirst usually helps regulate ordinary daily intake" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Thirst is part of normal fluid regulation and is generally useful when water is available. Heat, prolonged activity, illness, and restricted access can make planning more important."
        points={[
          { text: "Controlled mild-dehydration studies report some mood and performance changes, but reviews find inconsistent cognitive results", cite: "Masento et al., Br J Nutr 2014" },
          { text: "Exercise-related fluid planning should account for individual sweat rate, environment, duration, and the risk of both underdrinking and overdrinking", cite: "McDermott et al., J Athl Train 2017" },
          { text: "There is no single water intake that is appropriate for every healthy person in every environment", cite: "National Academies DRI for Water 2005" },
        ]}
        sources="Educational only. Urine color is a rough cue, not a diagnosis."
      />
    </LabShell>
  );
}

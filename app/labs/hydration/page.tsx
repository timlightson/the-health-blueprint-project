"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, GlassWater } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import WaterTank from "@/components/labs/WaterTank";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#2563EB";

// ─── Shared hydration model (evidence thresholds) ────────────────────────────
// Focus and mood measurably dip at 1–2% body-water loss; endurance falls off
// past ~2% (Ganio 2011; Armstrong 2012; Sawka ACSM 2007).
const zoneFor = (d: number) =>
  d < 1 ? { id: "good" as const, label: "Topped up", color: "#0E8A7D" }
  : d < 2 ? { id: "warn" as const, label: "Slipping", color: "#C9760F" }
  : { id: "bad" as const, label: "Running dry", color: "#D8443B" };

const focusDrop = (d: number) => Math.round(clamp((d - 1) * 15, 0, 55));
const enduranceDrop = (d: number) => Math.round(clamp((d - 0.5) * 11, 0, 55));
const URINE = ["#F7F1C4", "#F3E896", "#EEDD68", "#E7CB42", "#DDB236", "#CC942C", "#B67723", "#9C5A1C"];

// ─── The Water Line — a day on your water, compressed to 75 seconds ─────────
// Drain rates are plausible per-hour sweat/urine losses for a ~150 lb teen:
// sitting in class is slow, PE and practice run ~1–2 L/hr of sweat
// (Sawka et al., ACSM 2007), which is roughly 1–1.5% of body mass per hour.
const DAY_START = 7;
const DAY_END = 22;
const SEC_PER_HOUR = 5;
const TICK_MS = 100;
const DRINK_RELIEF = 0.42; // one honest bottle-swig session
const DRINK_COOLDOWN = 2000;
const THIRST_AT = 1.5;

interface DayEvent { from: number; to: number; drain: number; label: string; emoji: string }
const EVENTS: DayEvent[] = [
  { from: 7, to: 8, drain: 0.12, label: "Morning rush. You woke up already a little low.", emoji: "🌅" },
  { from: 8, to: 11, drain: 0.09, label: "Classes. Slow, quiet drain.", emoji: "📚" },
  { from: 11, to: 12, drain: 1.15, label: "PE. You're sweating hard.", emoji: "🏃" },
  { from: 12, to: 12.75, drain: 0.1, label: "Lunch. Easy chance to catch up.", emoji: "🍎" },
  { from: 12.75, to: 14.5, drain: 0.09, label: "Afternoon classes.", emoji: "✏️" },
  { from: 14.5, to: 15.5, drain: 0.5, label: "Hot walk home.", emoji: "☀️" },
  { from: 15.5, to: 17, drain: 0.1, label: "Homework at your desk.", emoji: "📖" },
  { from: 17, to: 18.5, drain: 1.4, label: "Evening practice. Heavy sweat.", emoji: "🔥" },
  { from: 18.5, to: 22, drain: 0.08, label: "Dinner and winding down.", emoji: "🌙" },
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
  if (pctGreen >= 0.85) return { title: "Never ran dry", note: "You drank before it mattered, which is the whole trick. Thirst never got ahead of you." };
  if (pctGreen >= 0.6) return { title: "Mostly topped up", note: "Solid. The sweaty stretches caught you, though. Drink before PE and practice, not after." };
  if (pctGreen >= 0.35) return { title: "The afternoon got you", note: "Classic pattern. You held on until the heat and practice stacked up, then spent hours in the dip." };
  return { title: "Bone dry", note: "You spent most of the day below the line, which is exactly where focus and mood quietly fall apart." };
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

  // thirst alarm — deliberately late, like the real thing
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
              A full day, 75 seconds. Class is a slow drip, PE and practice drain you fast. Drink at the right moments. One catch: thirst shows up late, same as real life.
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
                <div className="text-2xl" aria-hidden>{ev.emoji}</div>
                <p className="text-sm mt-1 font-medium text-white" style={{ lineHeight: 1.45 }}>{ev.label}</p>
                {thirstShown && (
                  <p className="text-xs mt-3 font-bold rounded-xl px-3 py-2 animate-pulse-slow" style={{ color: "#FCA5A5", background: "rgba(216,68,59,0.16)", border: "1px solid rgba(216,68,59,0.4)" }}>
                    🥵 NOW you feel thirsty. You've been down {THIRST_AT}% for a bit already.
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
            {stats.current.worst >= 2 && (
              <p className="text-xs mt-3" style={{ color: "#FCA5A5" }}>
                At your worst dip, focus was running about {focusDrop(stats.current.worst)}% down.
              </p>
            )}
            <button onClick={start} className="mt-5 rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 46, background: "linear-gradient(160deg, #60A5FA, #2563EB)", color: "#fff" }}>
              <RotateCcw className="w-4 h-4" /> Run the day again
            </button>
          </div>
        )}
      </div>
      <p className="text-xs mt-3 px-2" style={{ color: "var(--ink-faint)" }}>
        Drain rates follow real sweat losses: sitting is a slow drip, hard practice runs 1 to 2 liters an hour (Sawka et al., ACSM 2007). Thirst genuinely lags the loss (Popkin 2010).
      </p>
    </LiquidGlass>
  );
}

// ─── Sandbox — grab the water yourself ───────────────────────────────────────
function Sandbox() {
  const [deficit, setDeficit] = useState(0.5);
  const zone = zoneFor(deficit);
  const urineIdx = clamp(Math.round(deficit * 1.7), 0, 7);
  const note =
    deficit < 1 ? "You're fine here. Thirst hasn't even kicked in, and your brain and body run clean."
    : deficit < 2 ? "The sneaky zone. Not really thirsty yet, but attention and mood are already slipping."
    : deficit < 4 ? "Now it shows. Focus fades, effort feels heavier, headaches creep in."
    : "Real trouble. Heart rate climbs, thinking fogs, workouts fall apart.";

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
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>body water</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{focusDrop(deficit) > 0 ? `−${focusDrop(deficit)}%` : "0%"}</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>focus &amp; attention</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{enduranceDrop(deficit) > 0 ? `−${enduranceDrop(deficit)}%` : "0%"}</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>endurance</div>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>The bathroom check</p>
            <div className="flex gap-1.5">
              {URINE.map((c, i) => (
                <div key={i} className="flex-1 rounded-lg" style={{
                  height: 26,
                  background: `linear-gradient(180deg, ${c}, ${c}CC)`,
                  boxShadow: i === urineIdx ? "inset 0 1px 2px rgba(255,255,255,0.6), 0 0 0 2.5px var(--ink)" : "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.12)",
                  transition: "box-shadow 0.25s ease",
                }} />
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--ink-faint)" }}>Pale straw on the left is the goal. Dark amber means you're behind.</p>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}

export default function HydrationLab() {
  return (
    <LabShell lab="hydration">
      <LabHero
        kicker="Hydration Lab · Simulation 04"
        title="A little dry, a lot slower"
        subtitle="Play a full school day on your water and try to stay ahead of thirst. Then grab the tank yourself and see what each percent costs."
        accent={ACCENT}
      />

      <WaterLineGame />
      <Sandbox />

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~60%" label="of your body is water" accent={ACCENT} />
        <StatTile value="1–2%" label="loss is enough to dent mood and focus" accent={ACCENT} />
        <StatTile value="Late" label="thirst arrives after you're already down" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your brain is about three-quarters water. Run low and blood volume drops, so everything from attention to temperature control works harder. The catch: the thirst alarm is lazy. It fires well after the dip begins."
        points={[
          { text: "Losing just 1 to 2% of body water measurably worsens mood, attention, and short-term memory in healthy young people", cite: "Ganio et al., Br J Nutr 2011; Armstrong et al., J Nutr 2012" },
          { text: "About 2% dehydration is where endurance performance clearly starts to fall off", cite: "Sawka et al., ACSM Position Stand 2007" },
          { text: "Hard exercise can sweat out 1 to 2 liters an hour, which is why practice days drain so much faster than class days", cite: "Sawka et al., ACSM 2007" },
          { text: "Thirst lags behind actual need, so you're usually a step behind by the time you notice", cite: "Popkin et al., Nutr Rev 2010" },
        ]}
        sources="Educational only. Urine color is a rough cue, not a diagnosis."
      />
    </LabShell>
  );
}

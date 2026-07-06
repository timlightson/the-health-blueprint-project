"use client";

import { useState, useRef } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#2563EB";
const URINE = ["#F7F1C4", "#F3E896", "#EEDD68", "#E7CB42", "#DDB236", "#CC942C", "#B67723", "#9C5A1C"];
const MAX_DEF = 5;

const SCENARIOS = [
  { label: "Just woke up", def: 1.2 },
  { label: "School day, no water", def: 2.3 },
  { label: "Practice in the heat", def: 3.6 },
  { label: "Home sick", def: 2.8 },
];

function zoneFor(d: number) {
  if (d < 1) return { label: "Topped up", color: "#0E8A7D" };
  if (d < 2) return { label: "Slipping", color: "#C9760F" };
  if (d < 4) return { label: "Impaired", color: "#EA580C" };
  return { label: "Running dry", color: "#D8443B" };
}

export default function HydrationLab() {
  const [deficit, setDeficit] = useState(0.5);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const zone = zoneFor(deficit);
  const fillFrac = 1 - deficit / MAX_DEF;
  const focusDrop = Math.round(clamp((deficit - 1) * 15, 0, 55));
  const enduranceDrop = Math.round(clamp((deficit - 0.5) * 11, 0, 55));
  const urineIdx = clamp(Math.round(deficit * 1.7), 0, 7);

  const setFromClient = (clientY: number) => {
    const el = wrapRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = clamp((clientY - r.top) / r.height, 0, 1); // top = full, bottom = empty
    setDeficit(Math.round(frac * MAX_DEF * 10) / 10);
  };
  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    setFromClient(e.clientY);
    const move = (ev: PointerEvent) => { if (dragging.current) setFromClient(ev.clientY); };
    const up = () => { dragging.current = false; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const note =
    deficit < 1 ? "You're fine here. Thirst hasn't even kicked in, and your brain and body run clean."
    : deficit < 2 ? "The sneaky zone. Not bent over with thirst, but attention and mood are already slipping."
    : deficit < 4 ? "Now it shows. Focus fades, effort feels harder, headaches creep in. A normal afternoon for a lot of people who just forget to drink."
    : "Real trouble. Heart rate climbs, thinking gets foggy, workouts fall apart. Your body is rationing water.";

  return (
    <LabShell lab="hydration" badge={{ color: zone.color, text: `${deficit.toFixed(1)}% down` }}>
      <LabHero
        kicker="Hydration Lab · Simulation 04"
        title="A little dry, a lot slower"
        subtitle="Grab the water and drag it down. Watch focus, mood, and effort slide as you drain. Small losses hit harder than you'd think."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="grid sm:grid-cols-[168px_1fr] gap-6 items-center">
          {/* Draggable bottle */}
          <div className="flex justify-center">
            <div ref={wrapRef} onPointerDown={startDrag} style={{ touchAction: "none", cursor: "ns-resize", width: 132, height: 190, position: "relative" }} aria-label="Drag to set how much water you've lost">
              <svg width="132" height="190" viewBox="0 0 132 190" style={{ display: "block" }}>
                <defs>
                  <clipPath id="hyd-b"><rect x="28" y="16" width="76" height="166" rx="30" /></clipPath>
                  <linearGradient id="hyd-w" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={zone.color} stopOpacity="0.55" />
                    <stop offset="1" stopColor={zone.color} stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <g clipPath="url(#hyd-b)">
                  <rect x="28" y="16" width="76" height="166" fill="rgba(120,130,170,0.12)" />
                  <rect x="28" y={16 + 166 * (1 - fillFrac)} width="76" height={166 * fillFrac} fill="url(#hyd-w)" style={{ transition: dragging.current ? "none" : "y 0.3s ease, height 0.3s ease, fill 0.3s ease" }} />
                  {/* grab handle at the surface */}
                  <g style={{ transition: dragging.current ? "none" : "transform 0.3s ease" }} transform={`translate(0, ${16 + 166 * (1 - fillFrac)})`}>
                    <rect x="28" y="-2" width="76" height="4" fill="#fff" opacity="0.85" />
                    <circle cx="66" cy="0" r="7" fill="#fff" stroke={zone.color} strokeWidth="2.5" />
                    <path d="M62 -2 l4 -4 l4 4 M62 2 l4 4 l4 -4" stroke={zone.color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </g>
                </g>
                <rect x="28" y="16" width="76" height="166" rx="30" fill="none" stroke="rgba(11,26,43,0.18)" strokeWidth="2" />
                <rect x="52" y="5" width="28" height="14" rx="4" fill="rgba(11,26,43,0.18)" />
              </svg>
            </div>
          </div>

          {/* Readouts */}
          <div>
            <span className="text-3xl font-bold" style={{ color: zone.color }}>{zone.label}</span>
            <p className="text-sm mt-2" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{note}</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div>
                <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{focusDrop > 0 ? `−${focusDrop}` : "0"}%</div>
                <div className="text-xs" style={{ color: "var(--ink-faint)" }}>focus &amp; attention</div>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{enduranceDrop > 0 ? `−${enduranceDrop}` : "0"}%</div>
                <div className="text-xs" style={{ color: "var(--ink-faint)" }}>endurance</div>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>The bathroom check</p>
              <div className="flex gap-1">
                {URINE.map((c, i) => (
                  <div key={i} className="flex-1 rounded" style={{ height: 22, background: c, outline: i === urineIdx ? "2px solid var(--ink)" : "none", outlineOffset: 1, transition: "outline 0.3s ease" }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario chips */}
        <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>Or jump to a real moment</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button key={s.label} onClick={() => setDeficit(s.def)} className="text-xs font-semibold rounded-full lg-pill" style={{ minHeight: 38, padding: "0 14px", color: "var(--ink-soft)" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~60%" label="of your body is water" accent={ACCENT} />
        <StatTile value="1–2%" label="loss is enough to dent mood and focus" accent={ACCENT} />
        <StatTile value="8 cups" label="a rough daily floor, more when it's hot" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your brain is about three-quarters water. When you run low, blood volume drops and everything from attention to temperature control works harder. You feel it before you're even that thirsty."
        points={[
          { text: "Losing just 1 to 2% of body water measurably worsens mood, attention, and short-term memory", cite: "Ganio et al., Br J Nutr 2011; Armstrong et al., J Nutr 2012" },
          { text: "About 2% dehydration is where endurance performance clearly starts to fall off", cite: "Sawka et al., ACSM Position Stand 2007" },
          { text: "Thirst lags behind actual need, so you're usually a step behind by the time you notice", cite: "Popkin et al., Nutr Rev 2010" },
        ]}
        sources="Educational only. Urine color is a rough cue, not a diagnosis."
      />
    </LabShell>
  );
}

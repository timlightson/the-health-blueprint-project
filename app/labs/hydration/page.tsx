"use client";

import { useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#2563EB";

// Urine color self-check scale, pale → dark (a real hydration cue).
const URINE = ["#F7F1C4", "#F3E896", "#EEDD68", "#E7CB42", "#DDB236", "#CC942C", "#B67723", "#9C5A1C"];

function zoneFor(deficit: number) {
  if (deficit < 1) return { label: "Topped up", color: "#0E8A7D" };
  if (deficit < 2) return { label: "Slipping", color: "#C9760F" };
  if (deficit < 4) return { label: "Impaired", color: "#EA580C" };
  return { label: "Running dry", color: "#D8443B" };
}

export default function HydrationLab() {
  const [deficit, setDeficit] = useState(0.5); // % body mass lost as water

  const zone = zoneFor(deficit);
  const tank = clamp(100 - deficit * 16, 4, 100);
  const focusDrop = Math.round(clamp((deficit - 1) * 15, 0, 55));
  const enduranceDrop = Math.round(clamp((deficit - 0.5) * 11, 0, 55));
  const urineIdx = clamp(Math.round(deficit * 1.7), 0, 7);

  const note =
    deficit < 1
      ? "You're fine here. Thirst hasn't even really kicked in yet, and your brain and body are running clean."
      : deficit < 2
      ? "This is the sneaky zone. You're not bent over with thirst, but attention and mood are already starting to slip."
      : deficit < 4
      ? "Now it shows up. Focus fades, effort feels harder, and headaches creep in. This is a normal afternoon for a lot of people who just forget to drink."
      : "Real trouble. Heart rate climbs, thinking gets foggy, and workouts fall apart. Your body is rationing water.";

  return (
    <LabShell lab="hydration" badge={{ color: zone.color, text: `${deficit.toFixed(1)}% down` }}>
      <LabHero
        kicker="Hydration Lab · Simulation 04"
        title="A little dry, a lot slower"
        subtitle="Water isn't just for workouts. Lose a small slice of it and your focus, mood, and effort all take the hit. Slide the fluid loss and watch."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="grid sm:grid-cols-[150px_1fr] gap-6 items-center">
          {/* Water tank */}
          <div className="flex justify-center">
            <svg width="118" height="188" viewBox="0 0 118 188" aria-hidden="true">
              <defs>
                <clipPath id="hyd-bottle">
                  <rect x="24" y="20" width="70" height="158" rx="26" />
                </clipPath>
                <linearGradient id="hyd-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={zone.color} stopOpacity="0.55" />
                  <stop offset="1" stopColor={zone.color} stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <g clipPath="url(#hyd-bottle)">
                <rect x="24" y="20" width="70" height="158" fill="rgba(120,130,170,0.12)" />
                <rect
                  x="24"
                  y={20 + (158 * (100 - tank)) / 100}
                  width="70"
                  height={(158 * tank) / 100}
                  fill="url(#hyd-water)"
                  style={{ transition: "y 0.5s var(--ease-glass), height 0.5s var(--ease-glass), fill 0.4s ease" }}
                />
              </g>
              <rect x="24" y="20" width="70" height="158" rx="26" fill="none" stroke="rgba(11,26,43,0.18)" strokeWidth="2" />
              <rect x="46" y="9" width="26" height="14" rx="4" fill="rgba(11,26,43,0.18)" />
            </svg>
          </div>

          {/* Readouts */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: zone.color }}>{zone.label}</span>
            </div>
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

            {/* Urine color cue */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>
                The bathroom check
              </p>
              <div className="flex gap-1">
                {URINE.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded"
                    style={{
                      height: 22,
                      background: c,
                      outline: i === urineIdx ? "2px solid var(--ink)" : "none",
                      outlineOffset: 1,
                      transition: "outline 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--ink-faint)" }}>
                Pale straw on the left is the goal. Dark amber means you're behind.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider
            label="Fluid lost (share of body weight)"
            value={deficit}
            min={0}
            max={5}
            step={0.1}
            accent={ACCENT}
            display={`${deficit.toFixed(1)}%`}
            valueText={`${deficit.toFixed(1)} percent of body weight lost as water, ${zone.label}`}
            onChange={setDeficit}
          />
          <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
            For a 150 lb person, 2% is about 1.4 liters, roughly a normal school day without drinking.
          </p>
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~60%" label="of your body is water" accent={ACCENT} />
        <StatTile value="1–2%" label="loss is enough to dent mood and focus" accent={ACCENT} />
        <StatTile value="8 cups" label="a rough daily floor, more when it's hot" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your brain is about three-quarters water. When you run low, blood volume drops and everything from attention to temperature control has to work harder. You feel it before you're even that thirsty."
        points={[
          { text: "Losing just 1 to 2% of body water measurably worsens mood, attention, and short-term memory in healthy young people", cite: "Ganio et al., Br J Nutr 2011; Armstrong et al., J Nutr 2012" },
          { text: "About 2% dehydration is where endurance performance clearly starts to fall off", cite: "Sawka et al., ACSM Position Stand 2007" },
          { text: "Thirst lags behind actual need, so you're usually a step behind by the time you notice", cite: "Popkin et al., Nutr Rev 2010" },
        ]}
        sources="Educational only. Urine color is a rough cue, not a diagnosis."
      />
    </LabShell>
  );
}

"use client";

import { useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, Segmented, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#DB2777";

function zoneFor(focusMin: number) {
  if (focusMin >= 45) return { label: "In flow", color: "#0E8A7D" };
  if (focusMin >= 25) return { label: "Choppy", color: "#C9760F" };
  return { label: "Shredded", color: "#D8443B" };
}

export default function FocusLab() {
  const [pings, setPings] = useState(4); // interruptions per hour
  const [mode, setMode] = useState<"single" | "multi">("single");

  // Each interruption leaves "attention residue" — a stretch where your head is
  // still on the last thing. Trying to multitask makes each switch cost more.
  const cost = mode === "multi" ? 3.6 : 2.2; // minutes of refocus per ping
  const lost = Math.round(clamp(pings * cost, 0, 58));
  const focusMin = 60 - lost;
  const longest = Math.round(60 / (pings + 1));
  const zone = zoneFor(focusMin);
  const focusW = (focusMin / 60) * 100;

  const note =
    pings === 0
      ? "One clean hour. This is where real thinking, the kind that sticks, actually happens."
      : focusMin >= 45
      ? "Still mostly whole. A couple of breaks won't wreck an hour, especially if you finish a thought before you switch."
      : focusMin >= 25
      ? "The hour is fracturing. You're spending real time just climbing back into what you were doing, over and over."
      : "Barely an hour at all. Between the pings and the climb back, there's almost no unbroken stretch left to think in.";

  return (
    <LabShell lab="focus" badge={{ color: zone.color, text: `${focusMin} min` }}>
      <LabHero
        kicker="Focus Lab · Simulation 06"
        title="The tax on every switch"
        subtitle="Every time your attention jumps, part of your head stays behind on the last thing. Add up an hour of pings and see what's actually left."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            Real focus left in the hour
          </p>
          <div className="text-5xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em", transition: "color 0.4s ease" }}>
            {focusMin} min
          </div>
          <p className="text-sm font-semibold mt-1" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* Hour bar: focus vs refocus */}
        <div className="lg-well rounded-full overflow-hidden flex" style={{ height: 18 }} aria-hidden="true">
          <div style={{ width: `${focusW}%`, background: "linear-gradient(90deg, #10B981, #0E8A7D)", transition: "width 0.4s var(--ease-glass)" }} />
          <div style={{ width: `${100 - focusW}%`, background: "repeating-linear-gradient(45deg, rgba(216,68,59,0.5) 0 6px, rgba(216,68,59,0.28) 6px 12px)", transition: "width 0.4s var(--ease-glass)" }} />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--ink-faint)" }}>
          <span style={{ color: "#0E8A7D", fontWeight: 600 }}>{focusMin} min focused</span>
          <span style={{ color: "#D8443B", fontWeight: 600 }}>{lost} min refocusing</span>
        </div>

        <p className="text-sm mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{note}</p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{longest} min</div>
            <div className="text-xs" style={{ color: "var(--ink-faint)" }}>longest unbroken stretch</div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums" style={{ color: ACCENT }}>{pings}×</div>
            <div className="text-xs" style={{ color: "var(--ink-faint)" }}>pulled away this hour</div>
          </div>
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider
            label="Interruptions per hour"
            value={pings}
            min={0}
            max={12}
            step={1}
            accent={ACCENT}
            display={`${pings}`}
            valueText={`${pings} interruptions per hour, ${focusMin} minutes of real focus left`}
            onChange={setPings}
          />
          <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>How you handle a ping</span>
            <Segmented
              options={[
                { value: "single", label: "Finish first" },
                { value: "multi", label: "Multitask" },
              ]}
              value={mode}
              onChange={setMode}
              ariaLabel="Task handling mode"
            />
          </div>
          {mode === "multi" && (
            <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
              Juggling both costs more per switch, and your error rate climbs too. There's no free lane.
            </p>
          )}
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="23 min" label="to fully return to a task after a real interruption" accent={ACCENT} />
        <StatTile value="40%" label="more time to finish when you switch between tasks" accent={ACCENT} />
        <StatTile value="0" label="people who truly multitask, your brain switches" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your brain doesn't run two thinking tasks at once. It switches, fast, and each switch leaves 'attention residue': part of your focus stuck on the thing you just left. The switching is invisible, but the cost isn't."
        points={[
          { text: "After an interruption, people take an average of about 23 minutes to fully return to the original task", cite: "Mark et al., CHI 2008" },
          { text: "Switching between tasks can add up to ~40% more time to get them done, versus one at a time", cite: "Rubinstein, Meyer & Evans, J Exp Psychol 2001" },
          { text: "Leftover 'attention residue' from the last task measurably lowers performance on the next one", cite: "Leroy, Org Behav Hum Decis Process 2009" },
        ]}
        sources="Model uses a conservative per-interruption refocus cost to keep an hour readable."
      />
    </LabShell>
  );
}

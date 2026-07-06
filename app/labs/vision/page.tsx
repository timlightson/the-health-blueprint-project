"use client";

import { useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#059669";

function zoneFor(risk: number) {
  if (risk < 30) return { label: "Low risk", color: "#0E8A7D" };
  if (risk < 60) return { label: "Worth watching", color: "#C9760F" };
  return { label: "High risk", color: "#D8443B" };
}

export default function VisionLab() {
  const [near, setNear] = useState(6); // hours of close-up screen/reading
  const [outdoor, setOutdoor] = useState(1); // hours outside in daylight

  // Nearsightedness risk climbs with close-up work and falls sharply with
  // daylight time outdoors — outdoor time is the strongest known protector.
  const risk = Math.round(clamp(25 + near * 5 - outdoor * 18, 0, 100));
  const zone = zoneFor(risk);
  const blurPx = (risk / 100) * 3.4;

  const note =
    outdoor >= 2
      ? "That daylight is doing real work. Time outside is the single biggest thing that protects growing eyes, and you're getting enough of it."
      : risk < 30
      ? "Comfortable balance. Your eyes get breaks from close-up focus and enough daylight to stay on track."
      : risk < 60
      ? "A lot of close focus and not much daylight. This is the pattern that slowly stretches the eye and pushes it toward nearsighted."
      : "Heavy close-up load, almost no daylight. This is the combination most linked to eyes growing too long and distance going blurry.";

  return (
    <LabShell lab="vision" badge={{ color: zone.color, text: `${risk}% risk` }}>
      <LabHero
        kicker="Vision Lab · Simulation 09"
        title="Your eyes grow into your day"
        subtitle="Nearsightedness isn't just genetic. Hours of close focus with little daylight slowly stretch the eyeball. Trade screen time for sunlight and watch the risk move."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            Nearsightedness risk
          </p>
          <div className="text-5xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em", transition: "color 0.4s ease" }}>
            {risk}%
          </div>
          <p className="text-sm font-semibold mt-1" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* Distance clarity demo */}
        <div className="lg-well rounded-2xl py-5 px-4 text-center" aria-hidden="true">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-faint)" }}>
            The board from the back row
          </p>
          <div
            className="font-bold tabular-nums select-none"
            style={{
              fontSize: "34px",
              letterSpacing: "0.22em",
              color: "var(--ink)",
              filter: `blur(${blurPx.toFixed(2)}px)`,
              transition: "filter 0.4s ease",
            }}
          >
            E F P T O Z
          </div>
        </div>
        <p className="text-sm mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{note}</p>

        <div className="mt-5 pt-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider label="Close-up hours a day (screens, reading)" value={near} min={0} max={12} step={1} accent={ACCENT} display={`${near} hr`} onChange={setNear} />
          <GlassSlider label="Daylight time outdoors" value={outdoor} min={0} max={4} step={0.5} accent={ACCENT} display={`${outdoor} hr`} valueText={`${outdoor} hours outdoors`} onChange={setOutdoor} />
        </div>

        {/* 20-20-20 */}
        <div className="mt-5 p-4 rounded-2xl" style={{ background: `linear-gradient(165deg, ${ACCENT}1A, rgba(255,255,255,0.5))`, border: `1px solid ${ACCENT}33`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>The 20-20-20 break</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
            Every 20 minutes of close work, look at something about 20 feet away for 20 seconds. It relaxes the focusing muscle before it locks up.
          </p>
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="2 hr" label="daylight a day meaningfully lowers the risk" accent={ACCENT} />
        <StatTile value="~50%" label="of the world is projected to be nearsighted by 2050" accent={ACCENT} />
        <StatTile value="Distance" label="not brightness, is what daylight gives your eyes" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="A nearsighted eye is usually one that grew too long from front to back, so distant light focuses just short of the retina and far things blur. Lots of close focus nudges that growth; bright daylight, which cues the retina to release dopamine, appears to put the brakes on it. This is why kids who spend more time outside are less likely to become nearsighted."
        points={[
          { text: "More time outdoors is linked to lower rates of nearsightedness in children and teens", cite: "Rose et al., Ophthalmology 2008" },
          { text: "Adding 40 minutes of outdoor time at school cut the rate of new nearsightedness over 3 years", cite: "He et al., JAMA 2015" },
          { text: "Nearsightedness is rising worldwide, with about half the global population projected to be myopic by 2050", cite: "Holden et al., Ophthalmology 2016" },
        ]}
        sources="Risk here is an illustration of the trend, not a personal prediction."
      />
    </LabShell>
  );
}

"use client";

import { useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, StatTile, SciencePanel } from "@/components/labs/kit";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ACCENT = "#0891B2";

function zoneFor(coh: number) {
  if (coh >= 75) return { label: "Resonance zone", color: "#0E8A7D" };
  if (coh >= 35) return { label: "Everyday pace", color: "#0891B2" };
  return { label: "Revved up", color: "#D8443B" };
}

export default function BreathLab() {
  const [bpm, setBpm] = useState(12); // breaths per minute
  const reduced = useReducedMotion();

  const period = 60 / bpm; // seconds per breath
  const inhaleT = (period * 0.4).toFixed(1);
  const exhaleT = (period * 0.6).toFixed(1);
  // Heart-rate variability peaks near 6 breaths/min (~0.1 Hz resonance).
  const coherence = Math.round(Math.exp(-((bpm - 6) ** 2) / (2 * 4.2 * 4.2)) * 100);
  const zone = zoneFor(coherence);

  return (
    <LabShell lab="breath" badge={{ color: zone.color, text: `${bpm}/min` }}>
      <style>{`
        @keyframes breatheCycle {
          0%   { transform: scale(0.55); }
          40%  { transform: scale(1); }
          100% { transform: scale(0.55); }
        }
      `}</style>

      <LabHero
        kicker="Breath Lab · Simulation 07"
        title="The one system you can steer"
        subtitle="Your heartbeat, your nerves, your stress response, mostly automatic. Breathing is the one dial you can grab directly. Slow it down and the rest follows."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        {/* Breathing pacer */}
        <div className="flex flex-col items-center py-3">
          <div style={{ width: 180, height: 180, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 40%, ${ACCENT}44, ${ACCENT}14 70%)`,
                border: `2px solid ${ACCENT}66`,
                animation: reduced ? "none" : `breatheCycle ${period}s ease-in-out infinite`,
                transform: reduced ? "scale(0.82)" : undefined,
              }}
            />
            <div className="text-center" style={{ position: "relative", zIndex: 1 }}>
              <div className="text-3xl font-bold tabular-nums" style={{ color: zone.color }}>{coherence}%</div>
              <div className="text-xs font-medium" style={{ color: "var(--ink-soft)" }}>coherence</div>
            </div>
          </div>
          <p className="text-sm font-semibold mt-2" style={{ color: zone.color }}>{zone.label}</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            In for {inhaleT}s · out for {exhaleT}s
          </p>
          {reduced && (
            <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              Follow the timing above: a slow inhale, a longer exhale.
            </p>
          )}
        </div>

        <div className="mt-4 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider
            label="Breathing pace"
            value={bpm}
            min={4}
            max={18}
            step={1}
            accent={ACCENT}
            display={`${bpm} / min`}
            valueText={`${bpm} breaths per minute, coherence ${coherence} percent, ${zone.label}`}
            onChange={setBpm}
          />
          <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
            Most people rest around 12 to 16 a minute. Slide down toward 6 and watch coherence climb.
          </p>
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="6/min" label="the pace where heart-rate variability peaks" accent={ACCENT} />
        <StatTile value="Exhale" label="the calming half: long out-breaths slow the heart" accent={ACCENT} />
        <StatTile value="~2 min" label="of slow breathing measurably lowers stress signals" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your heart speeds up a little when you breathe in and slows when you breathe out. Stretch the out-breath and you lean on the vagus nerve, the brake on your nervous system. Around six breaths a minute, the rhythm lines up and heart-rate variability, a marker of a calm, flexible system, hits its peak."
        points={[
          { text: "Slow breathing near 6 breaths per minute maximizes heart-rate variability and vagal tone", cite: "Lehrer & Gevirtz, Front Psychol 2014" },
          { text: "Longer exhales activate the parasympathetic 'rest and digest' branch and lower arousal", cite: "Zaccaro et al., Front Hum Neurosci 2018" },
          { text: "Even a couple minutes of paced slow breathing shifts stress and mood markers", cite: "Russo et al., Breathe 2017" },
        ]}
        sources="A pacing tool, not therapy. If breathing exercises make you dizzy, stop and breathe normally."
      />
    </LabShell>
  );
}

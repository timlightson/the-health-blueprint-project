"use client";

import { useState } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, Chips, StatTile, SciencePanel } from "@/components/labs/kit";

const ACCENT = "#7C3AED";

// NIOSH: 85 dBA is safe for 8 hours, with a 3-dB exchange rate — every extra
// 3 dB halves the time your ears can take before damage risk climbs.
function safeSeconds(db: number): number {
  return 8 * 3600 * Math.pow(2, (85 - db) / 3);
}

function fmtTime(sec: number): string {
  if (sec >= 24 * 3600) return "all day";
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec - h * 3600) / 60);
    return h >= 6 ? `${h} hr` : m ? `${h} hr ${m} min` : `${h} hr`;
  }
  if (sec >= 60) return `${Math.round(sec / 60)} min`;
  return `${Math.max(1, Math.round(sec))} sec`;
}

const PRESETS: { value: string; label: string; db: number }[] = [
  { value: "convo", label: "Conversation", db: 60 },
  { value: "traffic", label: "City traffic", db: 85 },
  { value: "earbuds", label: "Loud earbuds", db: 100 },
  { value: "concert", label: "Concert", db: 110 },
];

function zoneFor(db: number) {
  if (db < 80) return { label: "Easy on your ears", color: "#0E8A7D" };
  if (db < 92) return { label: "Turn it down soon", color: "#C9760F" };
  return { label: "Damage zone", color: "#D8443B" };
}

const DB_MIN = 60;
const DB_MAX = 115;

export default function SoundLab() {
  const [db, setDb] = useState(85);
  const zone = zoneFor(db);
  const safe = safeSeconds(db);
  const preset = PRESETS.find((p) => p.db === db)?.value ?? null;
  const pct = ((db - DB_MIN) / (DB_MAX - DB_MIN)) * 100;

  return (
    <LabShell lab="sound" badge={{ color: zone.color, text: `${db} dB` }}>
      <LabHero
        kicker="Sound Lab · Simulation 05"
        title="How loud is too loud"
        subtitle="Hearing damage isn't just about volume, it's volume times time. Set the level and watch how fast your ears cross the line."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        {/* Safe listening time */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            Safe at this level for about
          </p>
          <div className="text-5xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em", transition: "color 0.4s ease" }}>
            {fmtTime(safe)}
          </div>
          <p className="text-sm font-semibold mt-1" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* dB meter */}
        <svg viewBox="0 0 320 44" width="100%" aria-hidden="true" style={{ display: "block" }}>
          <defs>
            <linearGradient id="snd-meter" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0E8A7D" />
              <stop offset="0.42" stopColor="#C9760F" />
              <stop offset="0.62" stopColor="#EA580C" />
              <stop offset="1" stopColor="#D8443B" />
            </linearGradient>
          </defs>
          <rect x="8" y="16" width="304" height="12" rx="6" fill="url(#snd-meter)" opacity="0.85" />
          <g style={{ transition: "transform 0.35s var(--ease-glass)" }} transform={`translate(${8 + (pct / 100) * 304}, 0)`}>
            <line x1="0" y1="8" x2="0" y2="36" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="22" r="7" fill="#fff" stroke="var(--ink)" strokeWidth="2.5" />
          </g>
        </svg>
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
          <span>quiet room</span>
          <span>jackhammer</span>
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider
            label="Volume"
            value={db}
            min={DB_MIN}
            max={DB_MAX}
            step={1}
            accent={ACCENT}
            display={`${db} dB`}
            valueText={`${db} decibels, ${zone.label}, safe for about ${fmtTime(safe)}`}
            onChange={setDb}
          />
          <div className="mt-3">
            <Chips
              options={PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              value={preset}
              onChange={(v) => setDb(PRESETS.find((p) => p.value === v)!.db)}
              accent={ACCENT}
              ariaLabel="Sound presets"
            />
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
            Most earbuds top out near 100 to 105 dB. At full volume, that's minutes, not hours.
          </p>
        </div>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="+3 dB" label="doubles the loudness hitting your ears" accent={ACCENT} />
        <StatTile value="60/60" label="60% volume, 60 minutes, then a break" accent={ACCENT} />
        <StatTile value="1 in 6" label="US teens already show some hearing loss" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Loud sound bends the tiny hair cells deep in your ear. Bend them too hard or too long and they don't spring back. They don't grow back either, which is why noise damage is permanent and why time matters as much as volume."
        points={[
          { text: "85 dBA is the line: safe for about 8 hours, and every extra 3 dB cuts the safe time in half", cite: "NIOSH Occupational Noise REL, 1998" },
          { text: "The WHO's safe-listening guidance is roughly 80 dB for 40 hours a week before risk climbs", cite: "WHO, Make Listening Safe, 2015" },
          { text: "About 1 in 6 US teens shows signs of noise-related hearing loss, and personal audio is a big driver", cite: "Shargorodsky et al., JAMA 2010" },
        ]}
        sources="Decibel values here are typical examples, not a calibrated meter."
      />
    </LabShell>
  );
}

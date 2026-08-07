"use client";

import { useState, useRef, useEffect } from "react";
import { Car, Headphones, MessageCircle, Music, Play, Siren, Volume2, VolumeX, type LucideIcon } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";
import { playTone, beep, fmtHz, type Tone } from "@/components/labs/audio";
import PitchMatch from "@/components/labs/PitchMatch";

const ACCENT = "#7C3AED";

// ─── High-frequency hearing test ────────────────────────────────────────────
// The "mosquito tone" age check: hearing fades from the top down with age, so
// the highest tone you can still hear is a rough proxy for ear age.
const FREQS = [8000, 10000, 12000, 14000, 15000, 16000, 17000, 18000, 19000, 20000];

// ─── Safe-listening (NIOSH) ─────────────────────────────────────────────────
const LEVELS = [
  { label: "Normal talk", db: 60, icon: MessageCircle },
  { label: "City traffic", db: 85, icon: Car },
  { label: "Loud earbuds", db: 100, icon: Headphones },
  { label: "Rock concert", db: 110, icon: Music },
  { label: "Siren up close", db: 120, icon: Siren },
] satisfies { label: string; db: number; icon: LucideIcon }[];
const safeSeconds = (db: number) => 8 * 3600 * Math.pow(2, (85 - db) / 3);
function fmtTime(s: number) {
  if (s >= 24 * 3600) return "all day";
  if (s >= 3600) { const h = Math.floor(s / 3600), m = Math.round((s - h * 3600) / 60); return h >= 6 ? `${h} hr` : m ? `${h} hr ${m} min` : `${h} hr`; }
  if (s >= 60) return `${Math.round(s / 60)} min`;
  return `${Math.max(1, Math.round(s))} sec`;
}

export default function SoundLab() {
  const [phase, setPhase] = useState<"intro" | "testing" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const toneRef = useRef<Tone | null>(null);

  const stopTone = () => { toneRef.current?.stop(); toneRef.current = null; };
  useEffect(() => () => stopTone(), []);

  const playAt = (i: number) => {
    stopTone();
    toneRef.current = playTone(FREQS[i], 0.1);
  };
  const startTest = () => { setPhase("testing"); setIdx(0); setLimit(null); playAt(0); };
  const hearIt = () => {
    const heard = FREQS[idx];
    setLimit(heard);
    if (idx >= FREQS.length - 1) { stopTone(); setPhase("done"); }
    else { const n = idx + 1; setIdx(n); playAt(n); }
  };
  const silence = () => { stopTone(); setPhase("done"); };
  const reset = () => { stopTone(); setPhase("intro"); setLimit(null); setIdx(0); };

  const [selDb, setSelDb] = useState(100);
  const safe = safeSeconds(selDb);
  const zone = selDb < 85 ? { label: "Below the NIOSH reference level", color: "#0E8A7D" } : selDb < 100 ? { label: "NIOSH time limit applies", color: "#C9760F" } : { label: "Short NIOSH time limit", color: "#D8443B" };

  return (
    <LabShell lab="sound" badge={limit ? { color: ACCENT, text: `${fmtHz(limit)} ceiling` } : undefined}>
      <LabHero
        lab="sound"
        kicker="Sound Blueprint · 05"
        title="Test pitch and listening limits"
        subtitle="Match a tone by ear, check each audio channel, and compare exposure times with the NIOSH occupational model."
        accent={ACCENT}
      />

      {/* Pitch Match — the centerpiece game */}
      <PitchMatch />

      {/* Hearing ceiling — bonus challenge */}
      <LiquidGlass radius={26} bezel={26} scale={52} className="mt-4" style={{ padding: "24px" }}>
        <div className="flex items-center gap-2 mb-1">
          <Headphones className="w-4 h-4" style={{ color: ACCENT }} />
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>How high can you hear?</p>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--ink-faint)" }}>
          Headphones help. Start at a low volume, these climb into a high, thin whine.
        </p>

        {phase === "intro" && (
          <button onClick={startTest} className="w-full lg-pill rounded-2xl flex items-center justify-center gap-2 font-semibold" style={{ minHeight: 88, color: ACCENT }}>
            <Play className="w-5 h-5" /> Start the test
          </button>
        )}

        {phase === "testing" && (
          <div>
            {/* Playing indicator */}
            <div className="flex flex-col items-center py-3">
              <div style={{ position: "relative", width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[0, 1, 2].map((r) => (
                  <span key={r} style={{ position: "absolute", width: 60 + r * 26, height: 60 + r * 26, borderRadius: "50%", border: `2px solid ${ACCENT}`, opacity: 0.5 - r * 0.14, animation: `sndPing 1.6s ${r * 0.3}s ease-out infinite` }} />
                ))}
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: `${ACCENT}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Volume2 className="w-6 h-6" style={{ color: ACCENT }} />
                </div>
              </div>
              <div className="text-2xl font-bold tabular-nums mt-2" style={{ color: ACCENT }}>{fmtHz(FREQS[idx])}</div>
              <div className="text-xs" style={{ color: "var(--ink-faint)" }}>tone {idx + 1} of {FREQS.length}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={hearIt} className="lg-pill rounded-2xl font-semibold flex items-center justify-center gap-2" style={{ minHeight: 52, color: "#0E8A7D" }}>
                <Volume2 className="w-4 h-4" /> I hear it
              </button>
              <button onClick={silence} className="lg-pill rounded-2xl font-semibold flex items-center justify-center gap-2" style={{ minHeight: 52, color: "var(--ink-soft)" }}>
                <VolumeX className="w-4 h-4" /> Nothing
              </button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-2">
            {limit ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>Your ceiling</p>
                <div className="text-5xl font-bold tabular-nums mt-1" style={{ color: ACCENT, letterSpacing: "-0.03em" }}>{fmtHz(limit)}</div>
                <p className="text-sm font-semibold mt-1" style={{ color: "var(--ink)" }}>Highest tone reported in this device test</p>
                <p className="text-xs mt-2 mx-auto" style={{ color: "var(--ink-faint)", maxWidth: 320 }}>
                  This is the top of your range, not a diagnosis. Speakers and volume matter, so treat it as a fun estimate.
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No tone registered. Bump the volume a little and try again.</p>
            )}
            <button onClick={reset} className="mt-4 lg-pill rounded-full font-semibold px-5" style={{ minHeight: 44, color: ACCENT }}>Run it again</button>
          </div>
        )}
      </LiquidGlass>

      {/* Channel check */}
      <LiquidGlass radius={22} bezel={20} scale={44} className="mt-4" style={{ padding: "20px" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>Check both channels</p>
        <p className="text-xs mb-4" style={{ color: "var(--ink-faint)" }}>A quick beep in each ear. Both should sound equal.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Left", pan: -1 },
            { label: "Both", pan: 0 },
            { label: "Right", pan: 1 },
          ].map((c) => (
            <button key={c.label} onClick={() => beep(660, 700, 0.14, c.pan)} className="lg-pill rounded-xl font-semibold" style={{ minHeight: 48, color: ACCENT }}>
              {c.label}
            </button>
          ))}
        </div>
      </LiquidGlass>

      {/* Safe-listening ladder */}
      <LiquidGlass radius={22} bezel={20} scale={44} className="mt-4" style={{ padding: "20px" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>Compare NIOSH exposure times</p>
        <p className="text-xs mb-4" style={{ color: "var(--ink-faint)" }}>Tap a sound to apply the NIOSH occupational model. This is not an individual safety guarantee.</p>
        <div className="space-y-2">
          {LEVELS.map((l) => {
            const active = l.db === selDb;
            const LevelIcon = l.icon;
            return (
              <button
                key={l.db}
                onClick={() => setSelDb(l.db)}
                aria-pressed={active}
                className="w-full flex items-center gap-3 rounded-xl text-left lg-pill"
                style={{ minHeight: 52, padding: "0 14px", background: active ? `${ACCENT}14` : undefined, borderColor: active ? `${ACCENT}55` : undefined }}
              >
                <LevelIcon className="w-5 h-5" aria-hidden="true" style={{ color: ACCENT }} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>{l.label}</span>
                  <span className="block text-xs" style={{ color: "var(--ink-faint)" }}>{l.db} dB</span>
                </span>
                {active && <span className="text-sm font-bold tabular-nums" style={{ color: zone.color }}>{fmtTime(safe)}</span>}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-semibold mt-3 text-center" style={{ color: zone.color }}>
          {LEVELS.find((l) => l.db === selDb)?.label}: {fmtTime(safe)} in the NIOSH model · {zone.label}
        </p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="20 kHz" label="upper tone used in this device test" accent={ACCENT} />
        <StatTile value="+3 dB" label="doubles sound energy in the NIOSH model" accent={ACCENT} />
        <StatTile value="Screening" label="a hearing test needs calibrated equipment" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Sound is caught by thousands of tiny hair cells in your inner ear, tuned from low pitches to high. The high-pitch cells sit first in line and wear out first, from age and from loud sound, which is why the top of your range drops over life and why the test above is a rough age check."
        points={[
          { text: "High-frequency hearing declines steadily with age, the basis of the 'mosquito tone' effect", cite: "ISO 7029; Rodriguez Valiente et al., Int J Audiol 2014" },
          { text: "NIOSH recommends an occupational limit of 85 dBA averaged over 8 hours and halves allowable time for each 3 dBA increase", cite: "NIOSH Occupational Noise REL, 1998" },
          { text: "An occupational exposure limit is not a precise boundary between safe and damaged hearing for an individual listener", cite: "NIOSH, 1998" },
        ]}
        sources="Tones depend entirely on your device and volume, so this is for curiosity, not clinical use."
      />
    </LabShell>
  );
}

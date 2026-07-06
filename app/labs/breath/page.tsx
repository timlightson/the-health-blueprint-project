"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ACCENT = "#0891B2";

type Ph = { l: string; s: number; scale: number };
const PATTERNS: { id: string; name: string; note: string; bpm: string; phases: Ph[] }[] = [
  { id: "coherence", name: "Coherence", bpm: "6 / min", note: "Even in, even out. Lands right on the resonance peak where heart-rate variability maxes out.", phases: [{ l: "Breathe in", s: 5, scale: 1 }, { l: "Breathe out", s: 5, scale: 0.5 }] },
  { id: "box", name: "Box · 4·4·4·4", bpm: "3.75 / min", note: "In, hold, out, hold. Steady and grounding. Used by athletes and first responders to stay calm under fire.", phases: [{ l: "Breathe in", s: 4, scale: 1 }, { l: "Hold", s: 4, scale: 1 }, { l: "Breathe out", s: 4, scale: 0.5 }, { l: "Hold", s: 4, scale: 0.5 }] },
  { id: "478", name: "Relax · 4·7·8", bpm: "3.2 / min", note: "Short in, long hold, slow out. The extended exhale leans hard on the vagus nerve. Good before sleep.", phases: [{ l: "Breathe in", s: 4, scale: 1 }, { l: "Hold", s: 7, scale: 1 }, { l: "Breathe out", s: 8, scale: 0.5 }] },
];

export default function BreathLab() {
  const reduced = useReducedMotion();
  const [patternId, setPatternId] = useState("coherence");
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(0);
  const [scale, setScale] = useState(0.72);
  const [cycles, setCycles] = useState(0);

  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const timer = useRef<number | null>(null);
  const tick = useRef<number | null>(null);
  const deadline = useRef(0);

  const stopAll = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (tick.current) clearInterval(tick.current);
    timer.current = null; tick.current = null;
  }, []);
  useEffect(() => () => stopAll(), [stopAll]);

  const runPhase = useCallback((pat: typeof pattern, pi: number, cyc: number) => {
    const ph = pat.phases[pi];
    setPhaseIdx(pi);
    setScale(ph.scale);
    deadline.current = performance.now() + ph.s * 1000;
    setSecLeft(ph.s);
    timer.current = window.setTimeout(() => {
      const nextPi = (pi + 1) % pat.phases.length;
      const nextCyc = nextPi === 0 ? cyc + 1 : cyc;
      if (nextPi === 0) setCycles(nextCyc);
      runPhase(pat, nextPi, nextCyc);
    }, ph.s * 1000);
  }, []);

  const start = () => {
    stopAll();
    setCycles(0);
    setRunning(true);
    runPhase(pattern, 0, 0);
    tick.current = window.setInterval(() => setSecLeft(Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000))), 200);
  };
  const stop = () => { stopAll(); setRunning(false); setScale(0.72); };
  const choose = (id: string) => { if (running) stop(); setPatternId(id); };

  const phaseLabel = running ? pattern.phases[phaseIdx].l : "Ready";

  return (
    <LabShell lab="breath" badge={running ? { color: ACCENT, text: `${cycles} cycles` } : undefined}>
      <LabHero
        kicker="Breath Lab · Simulation 07"
        title="The one system you can steer"
        subtitle="Your heart, your nerves, your stress response, mostly on autopilot. Breathing is the one dial you can grab by hand. Pick a pattern and follow the orb."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        {/* Pattern picker */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {PATTERNS.map((p) => {
            const active = p.id === patternId;
            return (
              <button key={p.id} onClick={() => choose(p.id)} aria-pressed={active}
                className="rounded-2xl px-2 py-3 lg-pill text-center"
                style={{ background: active ? `${ACCENT}16` : undefined, borderColor: active ? `${ACCENT}55` : undefined }}>
                <div className="text-sm font-bold" style={{ color: active ? ACCENT : "var(--ink)" }}>{p.name.split(" · ")[0]}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>{p.bpm}</div>
              </button>
            );
          })}
        </div>

        {/* Guided orb */}
        <div className="flex flex-col items-center py-4">
          <div style={{ width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 210, height: 210, borderRadius: "50%",
                background: `radial-gradient(circle at 50% 38%, ${ACCENT}3a, ${ACCENT}12 70%)`,
                border: `2px solid ${ACCENT}66`,
                transform: `scale(${reduced ? 0.82 : scale})`,
                transition: reduced ? "none" : `transform ${running ? pattern.phases[phaseIdx].s : 0.6}s cubic-bezier(0.45,0,0.25,1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: ACCENT }}>{phaseLabel}</div>
                {running && <div className="text-3xl font-bold tabular-nums" style={{ color: "var(--ink)" }}>{secLeft}</div>}
              </div>
            </div>
          </div>

          {!running ? (
            <button onClick={start} className="mt-3 lg-pill rounded-full font-semibold px-8" style={{ minHeight: 50, color: ACCENT }}>
              Begin
            </button>
          ) : (
            <button onClick={stop} className="mt-3 lg-pill rounded-full font-semibold px-8" style={{ minHeight: 50, color: "var(--ink-soft)" }}>
              Stop
            </button>
          )}
        </div>

        <p className="text-sm text-center mt-2 mx-auto" style={{ color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 400 }}>
          {pattern.note}
        </p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="6/min" label="the pace where heart-rate variability peaks" accent={ACCENT} />
        <StatTile value="Exhale" label="the calming half: long out-breaths slow the heart" accent={ACCENT} />
        <StatTile value="~2 min" label="of slow breathing measurably lowers stress signals" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your heart speeds up a little when you breathe in and slows when you breathe out. Stretch the out-breath and you lean on the vagus nerve, the brake on your nervous system. Around six breaths a minute the rhythm lines up and heart-rate variability, a sign of a calm, flexible system, hits its peak."
        points={[
          { text: "Slow breathing near 6 breaths per minute maximizes heart-rate variability and vagal tone", cite: "Lehrer & Gevirtz, Front Psychol 2014" },
          { text: "Longer exhales activate the parasympathetic 'rest and digest' branch and lower arousal", cite: "Zaccaro et al., Front Hum Neurosci 2018" },
          { text: "Even a couple minutes of paced slow breathing shifts stress and mood markers", cite: "Russo et al., Breathe 2017" },
        ]}
        sources="A pacing tool, not therapy. If it makes you lightheaded, stop and breathe normally."
      />
    </LabShell>
  );
}

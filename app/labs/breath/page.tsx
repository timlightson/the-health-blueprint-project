"use client";

import { useState, useRef, useCallback, useEffect, type CSSProperties } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ACCENT = "#0891B2";

type Ph = { l: string; s: number; scale: number };
const PATTERNS: { id: string; name: string; note: string; bpm: string; phases: Ph[] }[] = [
  { id: "coherence", name: "Coherence", bpm: "6 / min", note: "Equal five-second inhales and exhales. Breathing near this pace is commonly used in studies of heart-rate variability.", phases: [{ l: "Breathe in", s: 5, scale: 1 }, { l: "Breathe out", s: 5, scale: 0.5 }] },
  { id: "box", name: "Box · 4·4·4·4", bpm: "3.75 / min", note: "Four equal phases: inhale, hold, exhale, hold. The complete cycle lasts 16 seconds.", phases: [{ l: "Breathe in", s: 4, scale: 1 }, { l: "Hold", s: 4, scale: 1 }, { l: "Breathe out", s: 4, scale: 0.5 }, { l: "Hold", s: 4, scale: 0.5 }] },
  { id: "478", name: "Relax · 4·7·8", bpm: "3.2 / min", note: "A four-second inhale, seven-second hold, and eight-second exhale. Return to normal breathing if the hold feels uncomfortable.", phases: [{ l: "Breathe in", s: 4, scale: 1 }, { l: "Hold", s: 7, scale: 1 }, { l: "Breathe out", s: 8, scale: 0.5 }] },
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
        lab="breath"
        kicker="Breath Blueprint · 07"
        title="The one system you can steer"
        subtitle="Breathing is automatic, but it can also be controlled voluntarily. Choose a paced pattern and follow the timing guide."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px", overflow: "hidden" }}>
        {/* Pattern picker */}
        <div className="grid grid-cols-3 gap-2 mb-4 px-2 pt-2">
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

        {/* Guided breath chamber */}
        <div className="breath-stage flex flex-col items-center justify-center">
          <div className="breath-stage-label"><i />{running ? pattern.name.toUpperCase() : "READY TO BREATHE"}</div>
          <svg className="breath-lungs" viewBox="0 0 300 230" aria-hidden="true">
            <path d="M146 54v76c-12 36-41 58-75 58-31 0-51-21-46-51 8-48 48-80 93-80h13" fill="rgba(6,182,212,.13)" stroke="rgba(165,243,252,.38)" strokeWidth="2" />
            <path d="M154 54v76c12 36 41 58 75 58 31 0 51-21 46-51-8-48-48-80-93-80h-13" fill="rgba(6,182,212,.13)" stroke="rgba(165,243,252,.38)" strokeWidth="2" />
            <path d="M150 20v111M150 91l-34 36M150 91l34 36" fill="none" stroke="rgba(224,251,255,.54)" strokeWidth="7" strokeLinecap="round" />
            {[0,1,2].map((i)=><circle key={i} className="breath-stage-ring" cx="150" cy="122" r={46+i*26} fill="none" stroke="rgba(103,232,249,.16)" strokeWidth="2" style={{animationDelay:`${i*.4}s`}} />)}
          </svg>
          <div className="breath-orb-wrap">
            <div
              className="breath-orb"
              style={{
                transform: `scale(${reduced ? 0.82 : scale})`,
                transition: reduced ? "none" : `transform ${running ? pattern.phases[phaseIdx].s : 0.6}s cubic-bezier(0.45,0,0.25,1)`,
              }}
            >
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "#CFFAFE" }}>{phaseLabel}</div>
                {running && <div className="text-3xl font-bold tabular-nums" style={{ color: "#fff" }}>{secLeft}</div>}
              </div>
            </div>
          </div>

          <div className="breath-phase-track" aria-label={`${phaseLabel}, ${secLeft} seconds remaining`}>
            {pattern.phases.map((ph, i) => <i key={`${ph.l}-${i}`} className={running && i === phaseIdx ? "active" : ""} style={{ "--phase-duration": `${ph.s}s` } as CSSProperties} />)}
          </div>

          {!running ? (
            <button onClick={start} className="breath-stage-button mt-4 rounded-full font-semibold px-8" style={{ minHeight: 50 }}>
              Begin
            </button>
          ) : (
            <button onClick={stop} className="breath-stage-button mt-4 rounded-full font-semibold px-8" style={{ minHeight: 50 }}>
              Stop
            </button>
          )}
        </div>

        <p className="text-sm text-center my-4 mx-auto px-4" style={{ color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 440 }}>
          {pattern.note}
        </p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~6/min" label="a pace commonly studied for heart-rate variability" accent={ACCENT} />
        <StatTile value="HRV" label="often rises during slow, paced breathing" accent={ACCENT} />
        <StatTile value="Stop" label="if you feel dizzy, strained, or short of breath" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Heart rate typically rises during inhalation and falls during exhalation, a pattern called respiratory sinus arrhythmia. Slow, paced breathing can increase heart-rate variability in many people, although the response and most comfortable pace differ between individuals."
        points={[
          { text: "Breathing near 6 breaths per minute is widely studied in heart-rate-variability biofeedback", cite: "Lehrer & Gevirtz, Front Psychol 2014" },
          { text: "Reviews associate slow breathing practices with changes in autonomic and psychological measures", cite: "Zaccaro et al., Front Hum Neurosci 2018" },
          { text: "The physiological response depends on breathing rate, depth, and the individual", cite: "Russo et al., Breathe 2017" },
        ]}
        sources="A pacing tool, not therapy. If it makes you lightheaded, stop and breathe normally."
      />
    </LabShell>
  );
}

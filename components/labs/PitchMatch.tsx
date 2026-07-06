"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2 } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { playTone, beep, type Tone } from "@/components/labs/audio";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ─── Pitch Match — hear a tone, rebuild it from memory ───────────────────────
// The dialed.gg mechanic: perceive, recreate, get scored. Humans don't carry
// absolute pitch (roughly 1 in 10,000 does), so every round is a fight between
// your ear and your memory. The surface IS the instrument: touch it and it
// sings at wherever your finger is.

const ACCENT = "#7C3AED";
const TEAL = "#0E8A7D";
const ROUNDS = 5;
const F_MIN = 110; // A2
const OCTAVES = 3; // up to A5 (880 Hz)

const fracToFreq = (frac: number) => F_MIN * Math.pow(2, frac * OCTAVES);
const freqToFrac = (hz: number) => Math.log2(hz / F_MIN) / OCTAVES;
const cents = (guess: number, target: number) => Math.round(1200 * Math.log2(guess / target));
const roundScore = (c: number) => Math.max(0, Math.round(100 - Math.abs(c) / 6));

function grade(avg: number): string {
  if (avg >= 85) return "Scary good ear";
  if (avg >= 65) return "Solid ear";
  if (avg >= 40) return "In the neighborhood";
  return "Vibes only";
}

type Phase = "intro" | "listen" | "guess" | "reveal" | "results";

interface RoundResult {
  target: number;
  guess: number;
  off: number; // signed cents
  score: number;
}

export default function PitchMatch() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(220);
  const [frac, setFrac] = useState(0.5);
  const [touched, setTouched] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [replaysLeft, setReplaysLeft] = useState(1);
  const [results, setResults] = useState<RoundResult[]>([]);

  const toneRef = useRef<Tone | null>(null);
  const surfRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const reduced = useReducedMotion();

  const stopTone = () => {
    toneRef.current?.stop();
    toneRef.current = null;
    setPlaying(false);
  };
  useEffect(() => () => { toneRef.current?.stop(); timers.current.forEach(clearTimeout); }, []);

  const newTarget = () => F_MIN * Math.pow(2, Math.random() * OCTAVES);

  const playTarget = (hz: number, ms = 1600) => {
    stopTone();
    setPlaying(true);
    toneRef.current = playTone(hz, 0.11);
    timers.current.push(window.setTimeout(() => stopTone(), ms));
  };

  const startRound = (n: number) => {
    const t = newTarget();
    setTarget(t);
    setRound(n);
    setFrac(0.5);
    setTouched(false);
    setReplaysLeft(1);
    setPhase("listen");
    playTarget(t);
    timers.current.push(window.setTimeout(() => setPhase("guess"), 1800));
  };

  const replay = () => {
    if (replaysLeft <= 0) return;
    setReplaysLeft((r) => r - 1);
    playTarget(target, 1100);
  };

  const guessHz = fracToFreq(frac);

  const setFromClientY = (clientY: number) => {
    const el = surfRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height));
    setFrac(f);
    setTouched(true);
    toneRef.current?.setFreq(fracToFreq(f));
  };

  const onSurfaceDown = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* synthetic or stale pointer */ }
    stopTone();
    setFromClientY(e.clientY);
    // compute the fraction directly — state `frac` is still the old value here
    const el = surfRef.current;
    const rect = el?.getBoundingClientRect();
    const f = rect ? Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height)) : frac;
    toneRef.current = playTone(fracToFreq(f), 0.1);
    setPlaying(true);
    const move = (ev: PointerEvent) => setFromClientY(ev.clientY);
    const up = () => {
      stopTone();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onSurfaceKey = (e: React.KeyboardEvent) => {
    const fine = 20 / (1200 * OCTAVES); // 20 cents as a fraction
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const d = (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? fine * 5 : fine);
      const f = Math.min(1, Math.max(0, frac + d));
      setFrac(f);
      setTouched(true);
      if (toneRef.current) toneRef.current.setFreq(fracToFreq(f));
      else beep(fracToFreq(f), 260, 0.1);
    } else if (e.key === " ") {
      e.preventDefault();
      if (playing) stopTone();
      else { toneRef.current = playTone(guessHz, 0.1); setPlaying(true); }
    } else if (e.key === "Enter" && touched) {
      e.preventDefault();
      lockIn();
    }
  };

  const lockIn = () => {
    stopTone();
    const off = cents(guessHz, target);
    setResults((r) => [...r, { target, guess: guessHz, off, score: roundScore(off) }]);
    setPhase("reveal");
  };

  const nextOrFinish = () => {
    stopTone();
    if (round + 1 >= ROUNDS) setPhase("results");
    else startRound(round + 1);
  };

  const restart = () => {
    stopTone();
    setResults([]);
    startRound(0);
  };

  const last = results[results.length - 1];
  const avg = results.length ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0;

  // Live waveform: spatial frequency follows the guess, glow follows play state.
  const cycles = 2.5 + frac * 13;
  const wavePath = (() => {
    // toFixed keeps SSR and client HTML byte-identical — Math.sin can differ
    // in the last float digit between Node and the browser.
    let d = "M 0 60 ";
    for (let x = 0; x <= 600; x += 6) {
      d += `L ${x} ${(60 - Math.sin((x / 600) * Math.PI * 2 * cycles) * 34).toFixed(2)} `;
    }
    return d;
  })();

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px" }}>
      {/* Deep instrument panel — the dialed look */}
      <div
        className="relative overflow-hidden select-none"
        style={{ borderRadius: 18, background: "radial-gradient(120% 90% at 50% 0%, #101426 0%, #05070F 70%)", minHeight: 380 }}
      >
        {/* Live waveform */}
        <svg viewBox="0 0 600 120" width="100%" aria-hidden="true"
          style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", opacity: phase === "results" ? 0.25 : 0.9, transition: "opacity 0.4s ease" }}>
          <defs>
            <linearGradient id="pm-wave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2DD4BF" />
              <stop offset="0.5" stopColor="#818CF8" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
            <filter id="pm-glow" x="-20%" y="-120%" width="140%" height="340%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <path d={wavePath} fill="none" stroke="url(#pm-wave)" strokeWidth="5" filter="url(#pm-glow)" opacity={playing ? 0.9 : 0.35} style={{ transition: "opacity 0.3s ease" }} />
          <path d={wavePath} fill="none" stroke="url(#pm-wave)" strokeWidth="1.8" strokeLinecap="round">
            {!reduced && playing && (
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-46 0" dur="0.9s" repeatCount="indefinite" />
            )}
          </path>
        </svg>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#818CF8" }}>Pitch Match · 5 rounds</p>
            <h3 className="text-3xl font-bold mt-2 text-white" style={{ letterSpacing: "-0.02em" }}>Rebuild the pitch</h3>
            <p className="text-sm mt-3 mb-6" style={{ color: "#94A3B8", maxWidth: 340, lineHeight: 1.55 }}>
              You'll hear one tone. Hold it in your head, then touch the surface and slide until it sounds right. Almost nobody has absolute pitch. Let's see what your ear can do.
            </p>
            <button onClick={() => { setResults([]); startRound(0); }}
              className="rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 50, background: "linear-gradient(160deg, #A78BFA, #7C3AED)", color: "#fff", boxShadow: "0 10px 30px -8px rgba(124,58,237,0.7)" }}>
              <Play className="w-4 h-4" /> Start
            </button>
            <p className="text-[11px] mt-4" style={{ color: "#475569" }}>Sound on. Headphones make it fairer.</p>
          </div>
        )}

        {/* LISTEN */}
        {phase === "listen" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold tabular-nums" style={{ color: "#64748B" }}>{round + 1} / {ROUNDS}</p>
            <div className="text-5xl font-bold text-white mt-2" style={{ letterSpacing: "-0.03em" }}>Listen…</div>
            <p className="text-sm mt-2" style={{ color: "#94A3B8" }}>Lock this tone into your memory.</p>
          </div>
        )}

        {/* GUESS — the instrument surface */}
        {phase === "guess" && (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="text-xs font-semibold tabular-nums" style={{ color: "#64748B" }}>{round + 1} / {ROUNDS}</span>
              <button onClick={replay} disabled={replaysLeft <= 0}
                className="text-xs font-semibold rounded-full px-3 py-2 flex items-center gap-1.5"
                style={{ color: replaysLeft > 0 ? "#A78BFA" : "#3F4A63", border: `1px solid ${replaysLeft > 0 ? "#A78BFA55" : "#1E2842"}`, minHeight: 36 }}>
                <Volume2 className="w-3.5 h-3.5" /> hear it again ({replaysLeft})
              </button>
            </div>
            <div
              ref={surfRef}
              onPointerDown={onSurfaceDown}
              onKeyDown={onSurfaceKey}
              tabIndex={0}
              role="slider"
              aria-label="Pitch surface. Drag up for higher, down for lower. Space plays your guess, Enter locks it in."
              aria-valuemin={F_MIN}
              aria-valuemax={880}
              aria-valuenow={Math.round(guessHz)}
              aria-valuetext={`${guessHz.toFixed(1)} hertz`}
              className="flex-1 relative"
              style={{ touchAction: "none", cursor: "ns-resize", outlineOffset: -4 }}
            >
              {/* guide line at finger height */}
              <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - frac) * 100}%`, height: 2, background: "linear-gradient(90deg, transparent, #A78BFA88 20%, #A78BFA88 80%, transparent)", pointerEvents: "none" }} />
              <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none">
                <div className="text-6xl font-bold text-white tabular-nums" style={{ letterSpacing: "-0.03em", opacity: touched ? 1 : 0.35 }}>
                  {guessHz.toFixed(2).replace(/\.00$/, "")}<span className="text-2xl font-semibold" style={{ color: "#818CF8" }}> Hz</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                  {touched ? "release, then lock it in" : "touch and slide to find the tone"}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button onClick={lockIn} disabled={!touched}
                className="w-full rounded-full font-semibold"
                style={{ minHeight: 48, background: touched ? "linear-gradient(160deg, #A78BFA, #7C3AED)" : "#161D33", color: touched ? "#fff" : "#3F4A63", boxShadow: touched ? "0 10px 26px -8px rgba(124,58,237,0.7)" : "none", transition: "all 0.3s ease" }}>
                Lock it in
              </button>
            </div>
          </div>
        )}

        {/* REVEAL */}
        {phase === "reveal" && last && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-xs font-semibold tabular-nums" style={{ color: "#64748B" }}>{round + 1} / {ROUNDS}</p>
            <div className="text-6xl font-bold tabular-nums mt-1" style={{ color: last.score >= 65 ? "#2DD4BF" : last.score >= 30 ? "#FBBF24" : "#F87171", letterSpacing: "-0.03em" }}>
              {last.score}
            </div>
            <p className="text-sm font-semibold mt-0.5 text-white">
              {Math.abs(last.off) < 10 ? "dead on" : `${Math.abs(last.off)} cents ${last.off > 0 ? "sharp" : "flat"}`}
            </p>
            {/* target vs guess strip */}
            <div className="relative mt-5 rounded-full" style={{ width: 250, height: 10, background: "#161D33" }} aria-hidden="true">
              <span style={{ position: "absolute", top: -3, bottom: -3, width: 3, borderRadius: 2, left: `${freqToFrac(last.target) * 100}%`, background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
              <span style={{ position: "absolute", top: -3, bottom: -3, width: 3, borderRadius: 2, left: `${freqToFrac(last.guess) * 100}%`, background: "#A78BFA", boxShadow: "0 0 8px #A78BFA" }} />
            </div>
            <div className="flex gap-5 mt-2 text-xs tabular-nums">
              <button onClick={() => beep(last.target, 700, 0.11)} className="font-semibold" style={{ color: TEAL, minHeight: 44 }}>
                ▶ target {Math.round(last.target)} Hz
              </button>
              <button onClick={() => beep(last.guess, 700, 0.11)} className="font-semibold" style={{ color: "#A78BFA", minHeight: 44 }}>
                ▶ you {Math.round(last.guess)} Hz
              </button>
            </div>
            <button onClick={nextOrFinish} className="mt-5 rounded-full font-semibold px-7"
              style={{ minHeight: 46, background: "linear-gradient(160deg, #A78BFA, #7C3AED)", color: "#fff" }}>
              {round + 1 >= ROUNDS ? "See your score" : "Next round"}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#818CF8" }}>Final score</p>
            <div className="text-7xl font-bold tabular-nums mt-1 text-white" style={{ letterSpacing: "-0.04em" }}>{avg}</div>
            <p className="text-base font-semibold mt-1" style={{ color: "#2DD4BF" }}>{grade(avg)}</p>
            <div className="flex gap-1.5 mt-4" aria-hidden="true">
              {results.map((r, i) => (
                <span key={i} className="rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center"
                  style={{ width: 34, height: 34, background: "#161D33", color: r.score >= 65 ? "#2DD4BF" : r.score >= 30 ? "#FBBF24" : "#F87171" }}>
                  {r.score}
                </span>
              ))}
            </div>
            <p className="text-xs mt-4" style={{ color: "#64748B", maxWidth: 320, lineHeight: 1.5 }}>
              Pitch memory fades in seconds unless you rehearse it. That's normal. True absolute pitch is roughly 1 in 10,000 people.
            </p>
            <button onClick={restart} className="mt-5 rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 46, background: "linear-gradient(160deg, #A78BFA, #7C3AED)", color: "#fff" }}>
              <RotateCcw className="w-4 h-4" /> Run it back
            </button>
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

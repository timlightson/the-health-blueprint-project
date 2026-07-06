"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play } from "lucide-react";
import { LabHeader, HeaderBadge, LabFooter } from "@/components/labs/LabChrome";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabHero, SciencePanel, StatTile } from "@/components/labs/kit";

const ACCENT = "#D8443B";
const ROSE = "#D8443B";
const PER_ROUND = 6;
// Each round shrinks the time per question — pressure climbs from calm to frantic.
const ROUNDS = [
  { pace: 4200, label: "No pressure" },
  { pace: 3000, label: "A little on the line" },
  { pace: 2100, label: "Locked in" },
  { pace: 1350, label: "Racing" },
  { pace: 850, label: "Panic" },
];

const rand = (n: number) => Math.floor(Math.random() * n);

function makeProblem() {
  const mul = Math.random() < 0.5;
  let a: number, b: number, ans: number, text: string;
  if (mul) { a = 3 + rand(9); b = 3 + rand(9); ans = a * b; text = `${a} × ${b}`; }
  else { a = 14 + rand(60); b = 8 + rand(40); ans = a + b; text = `${a} + ${b}`; }
  const opts = new Set<number>([ans]);
  while (opts.size < 4) {
    const d = ans + (rand(13) - 6) + (Math.random() < 0.35 ? (rand(3) + 1) * (mul ? a : 5) : 0);
    if (d > 0 && d !== ans) opts.add(d);
  }
  return { text, ans, options: [...opts].sort(() => Math.random() - 0.5) };
}

// ─── Live brain visual — tightens and reddens as pressure climbs ─────────────
function BrainViz({ load }: { load: number }) {
  const color = load < 0.34 ? "#0E8A7D" : load < 0.67 ? "#C9760F" : ROSE;
  return (
    <svg width="100%" height="120" viewBox="0 0 200 120" aria-hidden="true">
      <defs>
        <radialGradient id="brz" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity={0.14 + load * 0.3} />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="60" rx={66 - load * 8} ry={52 - load * 6} fill="url(#brz)" stroke={color} strokeWidth={1.5 + load * 1.5} style={{ transition: "all 0.4s ease" }} />
      {[42, 60, 78].map((y, i) => (
        <path key={i} d={`M56 ${y} Q80 ${y - 8 + load * 4} 100 ${y} Q120 ${y + 8 - load * 4} 144 ${y}`} fill="none" stroke={color} strokeWidth="1.4" opacity="0.5" style={{ transition: "all 0.4s ease" }} />
      ))}
    </svg>
  );
}

export default function StressLab() {
  const [phase, setPhase] = useState<"intro" | "playing" | "between" | "done">("intro");
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(makeProblem());
  const [scores, setScores] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ i: number; ok: boolean } | null>(null);
  const [barKey, setBarKey] = useState(0);

  const problemNo = useRef(0);
  const roundScore = useRef(0);
  const timer = useRef<number | null>(null);
  const clearT = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => () => clearT(), []);

  const load = phase === "playing" ? round / (ROUNDS.length - 1) : phase === "done" ? 0.5 : 0;

  const nextProblem = useCallback((r: number) => {
    if (problemNo.current >= PER_ROUND) {
      setScores((s) => { const n = [...s]; n[r] = roundScore.current; return n; });
      if (r >= ROUNDS.length - 1) setPhase("done");
      else { setPhase("between"); timer.current = window.setTimeout(() => beginRound(r + 1), 1400); }
      return;
    }
    setProblem(makeProblem());
    setFlash(null);
    setBarKey((k) => k + 1);
    timer.current = window.setTimeout(() => answer(r, -1), ROUNDS[r].pace);
  }, []);

  const beginRound = useCallback((r: number) => {
    clearT();
    problemNo.current = 0;
    roundScore.current = 0;
    setRound(r);
    setPhase("playing");
    nextProblem(r);
  }, [nextProblem]);

  const answer = useCallback((r: number, picked: number) => {
    clearT();
    const correct = picked === problem.ans;
    if (picked >= 0) setFlash({ i: picked, ok: correct });
    if (correct) roundScore.current += 1;
    problemNo.current += 1;
    timer.current = window.setTimeout(() => nextProblem(r), picked >= 0 ? 260 : 120);
  }, [problem, nextProblem]);

  const start = () => { setScores([]); beginRound(0); };
  const reset = () => { clearT(); setPhase("intro"); setScores([]); setRound(0); };

  const peakRound = scores.length ? scores.indexOf(Math.max(...scores)) : -1;
  const badge = phase === "playing" ? { color: load < 0.34 ? "#0E8A7D" : load < 0.67 ? "#C9760F" : ROSE, text: ROUNDS[round].label } : undefined;

  // Result curve geometry
  const CW = 320, CH = 150, cpl = 30, cpr = 12, cpt = 14, cpb = 30;
  const cx = (i: number) => cpl + (i / (ROUNDS.length - 1)) * (CW - cpl - cpr);
  const maxS = Math.max(1, ...scores);
  const cy = (s: number) => cpt + (1 - s / maxS) * (CH - cpt - cpb);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <LabHeader lab="stress" badge={badge ? <HeaderBadge color={badge.color}>{badge.text}</HeaderBadge> : undefined} />
      <main className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
          <LabHero
            kicker="Stress Lab · Simulation 03"
            title="Find your breaking point"
            subtitle="A little pressure sharpens you. Too much takes your brain offline. Play five rounds of quick math as the clock speeds up, and watch your own performance curve rise then fall apart."
            accent={ACCENT}
          />

          <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
            <BrainViz load={load} />

            {phase === "intro" && (
              <div className="text-center pt-2">
                <p className="text-sm mb-4 mx-auto" style={{ color: "var(--ink-soft)", maxWidth: 380 }}>
                  Tap the right answer before the bar runs out. Each round gives you less time than the last. Five rounds, then you'll see where your brain peaked.
                </p>
                <button onClick={start} className="lg-pill rounded-full font-semibold px-6 inline-flex items-center gap-2" style={{ minHeight: 50, color: ACCENT }}>
                  <Play className="w-4 h-4" /> Enter the pressure chamber
                </button>
              </div>
            )}

            {phase === "between" && (
              <div className="text-center py-6">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>Round {round + 1} done</p>
                <div className="text-3xl font-bold tabular-nums mt-1" style={{ color: ACCENT }}>{roundScore.current}/{PER_ROUND}</div>
                <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Speeding up…</p>
              </div>
            )}

            {phase === "playing" && (
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold" style={{ color: badge!.color }}>{ROUNDS[round].label}</span>
                  <span style={{ color: "var(--ink-faint)" }}>Round {round + 1}/5 · {problemNo.current}/{PER_ROUND}</span>
                </div>
                {/* time bar */}
                <div className="lg-well rounded-full overflow-hidden mb-5" style={{ height: 8 }}>
                  <div key={barKey} style={{ height: "100%", background: badge!.color, width: "100%", animation: `strTime ${ROUNDS[round].pace}ms linear forwards` }} />
                </div>
                <div className="text-center text-4xl font-bold tabular-nums mb-5" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {problem.text}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {problem.options.map((o, i) => {
                    const isFlash = flash && flash.i === i;
                    return (
                      <button
                        key={i}
                        onClick={() => !flash && answer(round, o)}
                        className="rounded-2xl text-xl font-bold tabular-nums lg-pill"
                        style={{
                          minHeight: 60,
                          color: isFlash ? "#fff" : "var(--ink)",
                          background: isFlash ? (flash!.ok ? "#0E8A7D" : ROSE) : undefined,
                          borderColor: isFlash ? (flash!.ok ? "#0E8A7D" : ROSE) : undefined,
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {phase === "done" && (
              <div>
                <div className="text-center mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>Your stress–performance curve</p>
                  <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
                    You peaked at <b style={{ color: ACCENT }}>{ROUNDS[peakRound]?.label.toLowerCase()}</b>, then the clock beat your brain.
                  </p>
                </div>
                <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" aria-hidden="true">
                  <line x1={cpl} y1={CH - cpb} x2={CW - cpr} y2={CH - cpb} stroke="rgba(11,26,43,0.16)" strokeWidth="1" />
                  <text x={cpl} y={CH - 8} fontSize="8.5" fill="var(--ink-faint)">calm</text>
                  <text x={CW - cpr} y={CH - 8} fontSize="8.5" fill="var(--ink-faint)" textAnchor="end">panic</text>
                  <path d={scores.map((s, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${cy(s).toFixed(1)}`).join(" ")} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {scores.map((s, i) => (
                    <g key={i}>
                      <circle cx={cx(i)} cy={cy(s)} r={i === peakRound ? 7 : 4.5} fill={i === peakRound ? ACCENT : "#fff"} stroke={ACCENT} strokeWidth="2.5" />
                      <text x={cx(i)} y={cy(s) - 12} fontSize="9" fill="var(--ink-soft)" textAnchor="middle" fontWeight="700">{s}</text>
                    </g>
                  ))}
                </svg>
                <button onClick={reset} className="mt-4 w-full lg-pill rounded-full font-semibold" style={{ minHeight: 48, color: ACCENT }}>
                  Run it again
                </button>
              </div>
            )}
          </LiquidGlass>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <StatTile value="Inverted-U" label="a little stress helps, too much hurts" accent={ACCENT} />
            <StatTile value="Minutes" label="is all it takes for stress to weaken focus" accent={ACCENT} />
            <StatTile value="Reversible" label="focus returns once the pressure clears" accent={ACCENT} />
          </div>

          <SciencePanel
            accent={ACCENT}
            intro="This is the Yerkes-Dodson law, from 1908, and you just lived it. A bit of pressure releases chemicals that sharpen focus and speed. Past a tipping point, those same chemicals flood the prefrontal cortex, the part that handles working memory and calm, and performance falls off a cliff. Harder tasks tip over sooner."
            points={[
              { text: "Performance follows an inverted-U with arousal: it rises to a peak, then drops", cite: "Yerkes & Dodson, J Comparative Neurology 1908" },
              { text: "Acute stress can weaken prefrontal cortex function within minutes", cite: "Arnsten, Nat Rev Neurosci 2009" },
              { text: "Multiple stressors draw on the same limited working memory, so load piles up", cite: "Klingberg, Trends Cogn Sci 2010" },
            ]}
            sources="A quick game, not a cognitive test. Your curve will wobble run to run — that's normal."
          />
        </div>
      </main>
      <LabFooter />
    </div>
  );
}

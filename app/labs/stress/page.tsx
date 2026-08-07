"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Wind } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const ACCENT = "#D8443B";
const TEAL = "#0E8A7D";

// ─── Rounds: pressure climbs, then a breather, then one more at Focus speed ──
// The recovery round is the point: prefrontal function comes back fast once
// stress chemicals clear (Arnsten 2009), and you get to feel that happen.
const ROUNDS = [
  { label: "Warm-up", ms: 5500, pressure: 0.15 },
  { label: "Focus", ms: 3200, pressure: 0.4 },
  { label: "Crunch", ms: 2000, pressure: 0.68 },
  { label: "Overload", ms: 1200, pressure: 1 },
  { label: "Recovery", ms: 3200, pressure: 0.4 },
] as const;
const PER_ROUND = 6;
const BREATHE_SEC = 15;

function makeProblem() {
  const kind = Math.random();
  let a: number, b: number, ans: number, text: string;
  if (kind < 0.4) { a = 6 + Math.floor(Math.random() * 18); b = 7 + Math.floor(Math.random() * 18); ans = a + b; text = `${a} + ${b}`; }
  else if (kind < 0.7) { a = 12 + Math.floor(Math.random() * 18); b = 3 + Math.floor(Math.random() * 11); ans = a - b; text = `${a} − ${b}`; }
  else { a = 3 + Math.floor(Math.random() * 9); b = 3 + Math.floor(Math.random() * 9); ans = a * b; text = `${a} × ${b}`; }
  const opts = new Set<number>([ans]);
  while (opts.size < 3) opts.add(ans + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 6)));
  return { text, ans, opts: [...opts].sort(() => Math.random() - 0.5) };
}

// ─── Particle storm — canvas, intensity follows the pressure ────────────────
function ParticleField({ intensity }: { intensity: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number }[]>([]);
  const level = useRef(intensity);
  const reduced = useReducedMotion();
  level.current = intensity;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.offsetWidth, H = cv.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!parts.current.length) {
      parts.current = Array.from({ length: 46 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
        r: 0.8 + Math.random() * 2.2,
      }));
    }
    const draw = () => {
      const k = level.current;
      ctx.clearRect(0, 0, W, H);
      const speed = 0.25 + k * 2.4;
      // color drifts from calm slate to hot red with pressure
      const cr = Math.round(120 + k * 120), cg = Math.round(140 - k * 80), cb = Math.round(200 - k * 130);
      for (const p of parts.current) {
        p.x += p.vx * speed; p.y += p.vy * speed;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + k * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.25 + k * 0.4})`;
        ctx.fill();
      }
      if (!reduced) raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ─── The Pressure Chamber ─────────────────────────────────────────────────────
type Phase = "intro" | "playing" | "between" | "breathe" | "done";

function PressureChamber() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(makeProblem());
  const [scores, setScores] = useState<number[]>([]);
  const [breatheLeft, setBreatheLeft] = useState(BREATHE_SEC);
  const [shake, setShake] = useState(0);
  const [barKey, setBarKey] = useState(0);

  const qNo = useRef(0);
  const pts = useRef<number[]>([]);
  const qStart = useRef(0);
  const timer = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const clearT = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => clearT, []);

  const finishRound = useCallback((r: number) => {
    clearT();
    const score = Math.round(pts.current.reduce((a, b) => a + b, 0) / PER_ROUND);
    setScores((s) => [...s, score]);
    if (r === ROUNDS.length - 1) { setPhase("done"); return; }
    if (r === 3) {
      // overload done → guided breather, then the recovery round
      setPhase("breathe");
      setBreatheLeft(BREATHE_SEC);
      return;
    }
    setPhase("between");
    timer.current = window.setTimeout(() => beginRound(r + 1), 1300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextProblem = useCallback((r: number) => {
    if (qNo.current >= PER_ROUND) { finishRound(r); return; }
    qNo.current += 1;
    setProblem(makeProblem());
    setBarKey((k) => k + 1);
    qStart.current = performance.now();
    clearT();
    timer.current = window.setTimeout(() => { pts.current.push(0); setShake((s) => s + 1); nextProblem(r); }, ROUNDS[r].ms);
  }, [finishRound]);

  const beginRound = useCallback((r: number) => {
    qNo.current = 0;
    pts.current = [];
    setRound(r);
    setPhase("playing");
    nextProblem(r);
  }, [nextProblem]);

  // breathe countdown
  useEffect(() => {
    if (phase !== "breathe") return;
    if (breatheLeft <= 0) { beginRound(4); return; }
    const t = window.setTimeout(() => setBreatheLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, breatheLeft, beginRound]);

  const answer = (v: number) => {
    if (phase !== "playing") return;
    clearT();
    const limit = ROUNDS[round].ms;
    const left = Math.max(0, 1 - (performance.now() - qStart.current) / limit);
    if (v === problem.ans) pts.current.push(Math.round(55 + 45 * left));
    else { pts.current.push(0); setShake((s) => s + 1); }
    nextProblem(round);
  };

  const start = () => { setScores([]); beginRound(0); };
  const reset = () => { clearT(); setPhase("intro"); setScores([]); setRound(0); };

  const pressure = phase === "playing" ? ROUNDS[round].pressure : phase === "breathe" ? 0.12 : phase === "done" ? 0.2 : 0.15;
  const peak = scores.length ? scores.indexOf(Math.max(...scores.slice(0, 4))) : -1;
  const recovered = scores.length === 5 ? scores[4] - scores[3] : 0;

  // results curve geometry
  const cx = (i: number) => 40 + i * 90;
  const cy = (s: number) => 150 - (s / 100) * 110;
  const curvePath = scores.length === 5 ? scores.map((s, i) => `${i === 0 ? "M" : "L"} ${cx(i)} ${cy(s)}`).join(" ") : "";

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px" }}>
      <style>{`
        @keyframes chamberShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-7px)} 75%{transform:translateX(7px)} }
        @keyframes chamberPulse { 0%,100%{opacity:0.12} 50%{opacity:0.34} }
        @keyframes breatheOrb { 0%{transform:scale(0.6)} 40%{transform:scale(1)} 100%{transform:scale(0.6)} }
      `}</style>
      <div
        key={shake}
        className="relative overflow-hidden"
        style={{
          borderRadius: 18,
          background: "radial-gradient(130% 100% at 50% 0%, #1A0F14 0%, #07050A 70%)",
          minHeight: 440,
          animation: shake && !reduced ? "chamberShake 0.22s ease" : undefined,
        }}
      >
        <ParticleField intensity={pressure} />
        {/* red vignette under max pressure */}
        {phase === "playing" && round === 3 && !reduced && (
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 90% at 50% 50%, transparent 55%, rgba(216,68,59,0.55))", animation: "chamberPulse 0.9s ease-in-out infinite" }} />
        )}

        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#F87171" }}>The Pressure Chamber · 5 rounds</p>
            <h3 className="text-3xl font-bold mt-2 text-white" style={{ letterSpacing: "-0.02em" }}>Find your breaking point</h3>
            <p className="text-sm mt-3 mb-6" style={{ color: "#94A3B8", maxWidth: 370, lineHeight: 1.55 }}>
              Quick math, and the clock keeps shrinking. A little pressure will sharpen you. Then it won't. After the worst round you get 15 seconds to breathe, and you'll see what that buys back.
            </p>
            <button onClick={start} className="rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 50, background: "linear-gradient(160deg, #F87171, #D8443B)", color: "#fff", boxShadow: "0 10px 30px -8px rgba(216,68,59,0.7)" }}>
              <Play className="w-4 h-4" /> Enter the chamber
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="absolute inset-0 flex flex-col p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: "#64748B" }}>Round {round + 1}/5 · {ROUNDS[round].label} · {qNo.current}/{PER_ROUND}</span>
              {/* stress chemicals meter */}
              <span className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                chemicals
                <span className="inline-block rounded-full overflow-hidden" style={{ width: 90, height: 7, background: "#1C1420" }}>
                  <span className="block h-full rounded-full" style={{ width: `${pressure * 100}%`, background: "linear-gradient(90deg, #0E8A7D, #C9760F, #D8443B)", transition: "width 0.6s ease" }} />
                </span>
              </span>
            </div>

            {/* countdown bar */}
            <div className="mt-3 rounded-full overflow-hidden" style={{ height: 7, background: "#1C1420" }}>
              <div key={barKey} className="h-full rounded-full"
                style={{
                  background: round >= 3 ? "linear-gradient(90deg, #F87171, #D8443B)" : "linear-gradient(90deg, #67E8F9, #818CF8)",
                  animation: `chamberBar ${ROUNDS[round].ms}ms linear forwards`,
                }} />
              <style>{`@keyframes chamberBar { from { width: 100% } to { width: 0% } }`}</style>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-6xl font-bold tabular-nums text-white" style={{ letterSpacing: "-0.02em" }}>{problem.text}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {problem.opts.map((o) => (
                <button key={o} onClick={() => answer(o)}
                  className="rounded-2xl font-bold text-xl tabular-nums"
                  style={{ minHeight: 62, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "between" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>Round {round + 1} done</p>
            <div className="text-5xl font-bold tabular-nums mt-1 text-white">{scores[scores.length - 1]}</div>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>faster clock coming…</p>
          </div>
        )}

        {phase === "breathe" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#5EEAD4" }}>Recovery break</p>
            <div className="relative flex items-center justify-center my-5" style={{ width: 150, height: 150 }}>
              <div aria-hidden style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, rgba(94,234,212,0.35), rgba(94,234,212,0.06) 70%)", border: "2px solid rgba(94,234,212,0.5)", animation: reduced ? undefined : "breatheOrb 10s ease-in-out infinite" }} />
              <div className="text-4xl font-bold tabular-nums text-white">{breatheLeft}</div>
            </div>
            <p className="text-sm flex items-center gap-2" style={{ color: "#94A3B8" }}>
              <Wind className="w-4 h-4" style={{ color: "#5EEAD4" }} /> Slow breath in… long breath out. Let the chemicals drain.
            </p>
          </div>
        )}

        {phase === "done" && scores.length === 5 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#F87171" }}>Your pressure curve</p>
            <svg viewBox="0 0 440 175" width="100%" style={{ maxWidth: 440 }} aria-hidden="true">
              <defs>
                <linearGradient id="pcLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#0E8A7D" /><stop offset="0.5" stopColor="#C9760F" /><stop offset="0.72" stopColor="#D8443B" /><stop offset="1" stopColor="#5EEAD4" />
                </linearGradient>
                <filter id="pcGlow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="5" /></filter>
              </defs>
              <path d={curvePath} fill="none" stroke="url(#pcLine)" strokeWidth="6" filter="url(#pcGlow)" opacity="0.7" />
              <path d={curvePath} fill="none" stroke="url(#pcLine)" strokeWidth="2.5" strokeLinecap="round" />
              {scores.map((s, i) => (
                <g key={i}>
                  <circle cx={cx(i)} cy={cy(s)} r={i === peak ? 8 : 5} fill={i === 4 ? "#5EEAD4" : i === peak ? "#FBBF24" : "#fff"} stroke="#0B0710" strokeWidth="2" />
                  <text x={cx(i)} y={cy(s) - 13} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{s}</text>
                  <text x={cx(i)} y={168} textAnchor="middle" fontSize="9.5" fill="#64748B">{ROUNDS[i].label}</text>
                </g>
              ))}
            </svg>
            <p className="text-sm mt-1" style={{ color: "#94A3B8", maxWidth: 380, lineHeight: 1.55 }}>
              You peaked at <b style={{ color: "#FBBF24" }}>{ROUNDS[peak]?.label.toLowerCase()}</b>, then the clock beat your brain.
              {recovered > 0
                ? <> Then 15 seconds of breathing bought back <b style={{ color: "#5EEAD4" }}>+{recovered} points</b>. Stress is reversible, and you just proved it.</>
                : <> The breather didn't land this time. Run it again and really slow the exhale.</>}
            </p>
            <button onClick={reset} className="mt-4 rounded-full font-semibold px-7 flex items-center gap-2"
              style={{ minHeight: 46, background: "linear-gradient(160deg, #F87171, #D8443B)", color: "#fff" }}>
              <RotateCcw className="w-4 h-4" /> Run it back
            </button>
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

// ─── The Load Test — digit span while the world pokes you ────────────────────
const DIGITS = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

function LoadTest() {
  const [stage, setStage] = useState<0 | 1>(0); // 0: 5 digits, 1: 7 digits
  const [phase, setPhase] = useState<"idle" | "show" | "distract" | "recall" | "result">("idle");
  const [digits, setDigits] = useState("");
  const [entry, setEntry] = useState("");
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const [taps, setTaps] = useState(0);
  const [results, setResults] = useState<{ ok: boolean; digits: string; entry: string }[]>([]);
  const timer = useRef<number | null>(null);
  const clearT = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => clearT, []);

  const len = stage === 0 ? 5 : 7;

  const begin = (s: 0 | 1) => {
    clearT();
    setStage(s);
    const d = DIGITS(s === 0 ? 5 : 7);
    setDigits(d); setEntry(""); setTaps(0);
    setPhase("show");
    timer.current = window.setTimeout(() => { setPhase("distract"); spawnDot(s, 0); }, 2600);
  };

  const spawnDot = (s: 0 | 1, n: number) => {
    if (n >= 4) { setDot(null); setPhase("recall"); return; }
    setDot({ x: 12 + Math.random() * 76, y: 15 + Math.random() * 60 });
    timer.current = window.setTimeout(() => spawnDot(s, n + 1), s === 0 ? 1100 : 700);
  };

  const hitDot = () => { setTaps((t) => t + 1); setDot(null); };

  const submit = () => {
    const ok = entry === digits;
    setResults((r) => [...r, { ok, digits, entry }]);
    setPhase("result");
  };

  return (
    <LiquidGlass radius={26} bezel={26} scale={52} className="mt-4" style={{ padding: "20px" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>The Load Test</p>
      <p className="text-xs mt-0.5 mb-4" style={{ color: "var(--ink-faint)" }}>
        Hold numbers in your head while the world pokes you. Stressors share one pool of working memory, so watch what happens when the load goes up.
      </p>

      <div className="lg-well relative overflow-hidden rounded-2xl" style={{ height: 240 }}>
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-sm mb-4" style={{ color: "var(--ink-soft)", maxWidth: 340 }}>
              Memorize the digits, tap the dots that pop up, then type the digits back. Two levels.
            </p>
            <button onClick={() => begin(0)} className="lg-pill rounded-full font-semibold px-6 flex items-center gap-2" style={{ minHeight: 46, color: ACCENT }}>
              <Play className="w-4 h-4" /> Level 1 · five digits
            </button>
          </div>
        )}

        {phase === "show" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>memorize</p>
            <div className="text-5xl font-bold tabular-nums mt-2" style={{ color: "var(--ink)", letterSpacing: "0.14em" }}>{digits}</div>
          </div>
        )}

        {phase === "distract" && (
          <div className="absolute inset-0">
            <p className="absolute top-2 left-3 text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>hold the digits… tap the dots ({taps}/4)</p>
            {dot && (
              <button onClick={hitDot} aria-label="tap the dot"
                className="absolute rounded-full"
                style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: 50, height: 50, background: "radial-gradient(circle at 35% 30%, #FCA5A1, #D8443B)", boxShadow: "0 6px 18px -4px rgba(216,68,59,0.7)" }} />
            )}
          </div>
        )}

        {phase === "recall" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5">
            <div className="text-2xl font-bold tabular-nums mb-3" style={{ color: "var(--ink)", letterSpacing: "0.2em", minHeight: 32 }}>
              {entry || <span style={{ color: "var(--ink-faint)" }}>type them back</span>}
            </div>
            <div className="grid grid-cols-5 gap-1.5" style={{ maxWidth: 300 }}>
              {[1,2,3,4,5,6,7,8,9,0].map((n) => (
                <button key={n} onClick={() => entry.length < len && setEntry(entry + n)}
                  className="lg-pill rounded-xl font-bold tabular-nums" style={{ minHeight: 44, color: "var(--ink)" }}>{n}</button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEntry(entry.slice(0, -1))} className="lg-pill rounded-full px-4 text-sm font-semibold" style={{ minHeight: 40, color: "var(--ink-soft)" }}>⌫</button>
              <button onClick={submit} disabled={entry.length !== len}
                className="rounded-full px-5 text-sm font-bold"
                style={{ minHeight: 40, background: entry.length === len ? ACCENT : "rgba(120,130,170,0.2)", color: entry.length === len ? "#fff" : "var(--ink-faint)" }}>
                Check
              </button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-3xl font-bold" style={{ color: results[results.length - 1]?.ok ? TEAL : ACCENT }}>
              {results[results.length - 1]?.ok ? "Held it" : "It slipped"}
            </div>
            <p className="text-sm mt-1 tabular-nums" style={{ color: "var(--ink-soft)" }}>
              was <b>{results[results.length - 1]?.digits}</b> · you said <b>{results[results.length - 1]?.entry}</b>
            </p>
            {stage === 0 ? (
              <button onClick={() => begin(1)} className="mt-4 lg-pill rounded-full font-semibold px-6" style={{ minHeight: 44, color: ACCENT }}>
                Level 2 · seven digits, faster noise
              </button>
            ) : (
              <>
                <p className="text-xs mt-3" style={{ color: "var(--ink-faint)", maxWidth: 330, lineHeight: 1.5 }}>
                  Same brain, heavier load. Every stressor you carry rents space from this exact system (Klingberg 2010).
                </p>
                <button onClick={() => { setResults([]); begin(0); }} className="mt-3 lg-pill rounded-full font-semibold px-5 text-sm" style={{ minHeight: 42, color: ACCENT }}>
                  Start over
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

export default function StressLab() {
  return (
    <LabShell lab="stress">
      <LabHero
        kicker="Stress Blueprint · 03"
        title="Find your breaking point"
        subtitle="A little pressure sharpens you. Too much takes your brain offline, and a real break brings it back. Feel the whole curve happen to you in five rounds."
        accent={ACCENT}
      />

      <PressureChamber />
      <LoadTest />

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="Inverted-U" label="a little stress helps, too much hurts" accent={ACCENT} />
        <StatTile value="Minutes" label="is all it takes for stress to weaken focus" accent={ACCENT} />
        <StatTile value="Reversible" label="focus returns once the pressure clears" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Under pressure your body floods the prefrontal cortex, the planning-and-focus part right behind your forehead, with cortisol and noradrenaline. A little sharpens you. Too much and control shifts to faster, more reactive circuits: you rush, blank, and misread easy questions. Clear the chemicals and the prefrontal cortex comes back online."
        points={[
          { text: "Stress and performance follow an inverted-U: rising pressure helps until it tips, then performance drops fast", cite: "Yerkes & Dodson 1908; Arnsten, Nat Rev Neurosci 2009" },
          { text: "Acute stress can weaken prefrontal cortex function within minutes", cite: "Arnsten, Nat Rev Neurosci 2009" },
          { text: "Stressors stack because they share the same limited working-memory capacity", cite: "Klingberg, Trends Cogn Sci 2010" },
          { text: "About 31% of teens report feeling overwhelmed by stress regularly", cite: "APA, Stress in America 2014" },
        ]}
        sources="A game, not a diagnosis. If pressure feels unmanageable for real, talk to someone you trust."
      />
    </LabShell>
  );
}

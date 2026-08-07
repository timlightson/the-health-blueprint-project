"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta, shuffle } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("pattern");
const ROUNDS = 3;
const VB = 280;
const DOTS = Array.from({ length: 9 }, (_, i) => ({
  i,
  x: 46 + (i % 3) * 94,
  y: 46 + Math.floor(i / 3) * 94,
}));

const CFG: Record<Difficulty, { len: number; speed: number }> = {
  "9hr": { len: 4, speed: 640 },
  "6hr": { len: 6, speed: 470 },
  "4hr": { len: 8, speed: 300 },
};

function eq(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function PatternGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [phase, setPhase] = useState<"idle" | "demo" | "input" | "feedback">("idle");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [demoStep, setDemoStep] = useState(0);
  const [path, setPath] = useState<number[]>([]);
  const [ok, setOk] = useState(false);
  const dragging = useRef(false);
  const pathRef = useRef<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const runDemo = useCallback(
    (pat: number[]) => {
      clearTimers();
      setPhase("demo");
      setDemoStep(0);
      pathRef.current = [];
      setPath([]);
      pat.forEach((_, k) => {
        timers.current.push(
          setTimeout(() => {
            setDemoStep(k + 1);
            playSound("tick");
          }, k * cfg.speed + 400),
        );
      });
      timers.current.push(setTimeout(() => setPhase("input"), pat.length * cfg.speed + 700));
    },
    [cfg.speed],
  );

  const startRound = useCallback(() => {
    const pat = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, cfg.len);
    setPattern(pat);
    runDemo(pat);
  }, [cfg.len, runDemo]);

  const dotAt = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return -1;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VB;
    const y = ((e.clientY - r.top) / r.height) * VB;
    for (const d of DOTS) {
      if ((d.x - x) ** 2 + (d.y - y) ** 2 < 30 * 30) return d.i;
    }
    return -1;
  };

  const addDot = (i: number) => {
    if (i < 0 || pathRef.current.includes(i)) return;
    pathRef.current = [...pathRef.current, i];
    setPath(pathRef.current);
    playSound("tick");
  };

  const onDown = (e: React.PointerEvent) => {
    if (phase !== "input") return;
    dragging.current = true;
    pathRef.current = [];
    setPath([]);
    addDot(dotAt(e));
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || phase !== "input") return;
    addDot(dotAt(e));
  };
  const onUp = () => {
    if (!dragging.current || phase !== "input") return;
    dragging.current = false;
    const correct = eq(pathRef.current, pattern);
    setOk(correct);
    setPhase("feedback");
    playSound(correct ? "ding" : "fail");
    const nextScore = score + (correct ? 1 : 0);
    const nextRound = round + 1;
    timers.current.push(
      setTimeout(() => {
        if (nextRound >= ROUNDS) {
          finish({
            headline: `${nextScore}/${ROUNDS} patterns`,
            sub: `${cfg.len}-dot patterns.`,
            tone: nextScore === ROUNDS ? "good" : nextScore >= 2 ? "mid" : "bad",
          });
        } else {
          setScore(nextScore);
          setRound(nextRound);
          startRound();
        }
      }, 1100),
    );
  };

  const shown =
    phase === "demo" ? pattern.slice(0, demoStep) : phase === "input" || phase === "feedback" ? path : [];
  const lineCol = phase === "feedback" ? (ok ? "#0D9488" : "#DC2626") : phase === "demo" ? "#D97706" : "#0D9488";
  const linePts = shown.map((i) => `${DOTS[i].x},${DOTS[i].y}`).join(" ");

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
        {phase === "idle" && `Watch the ${cfg.len}-dot pattern, then drag through the same dots. Three rounds.`}
        {phase === "demo" && `Round ${round + 1} of ${ROUNDS}. Watch the pattern.`}
        {phase === "input" && `Round ${round + 1} of ${ROUNDS}. Drag through it.`}
        {phase === "feedback" && (ok ? "Got it." : "Not quite.")}
      </p>

      <div className="mx-auto mb-4" style={{ maxWidth: "280px" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB} ${VB}`}
          width="100%"
          style={{ display: "block", touchAction: "none" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {shown.length > 1 && (
            <polyline
              points={linePts}
              fill="none"
              stroke={lineCol}
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}
          {DOTS.map((d) => {
            const on = shown.includes(d.i);
            return (
              <g key={d.i}>
                <circle cx={d.x} cy={d.y} r="26" fill="transparent" />
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={on ? 16 : 11}
                  fill={on ? lineCol : "#E5E0D8"}
                  style={{ transition: "r 0.12s ease, fill 0.12s ease" }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {phase === "idle" && (
        <button
          onClick={startRound}
          className="w-full rounded text-sm font-semibold"
          style={{ backgroundColor: "#001A33", color: "#fff", padding: "13px", minHeight: "44px" }}
        >
          Start
        </button>
      )}
      {phase === "input" && (
        <button
          onClick={() => runDemo(pattern)}
          className="w-full rounded text-sm font-semibold"
          style={{ backgroundColor: "#F0EDE6", color: "#4A5568", padding: "11px", minHeight: "44px" }}
        >
          Watch again
        </button>
      )}
    </div>
  );
}

export default function PatternPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <PatternGame {...api} />}
    </GameShell>
  );
}

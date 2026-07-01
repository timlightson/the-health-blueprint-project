"use client";

import { useState, useRef, useEffect } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta, pick } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("stroop");
const TRIALS = 15;

interface Col {
  name: string;
  hex: string;
}
const ALL: Col[] = [
  { name: "RED", hex: "#DC2626" },
  { name: "BLUE", hex: "#2563EB" },
  { name: "GREEN", hex: "#0D9488" },
  { name: "YELLOW", hex: "#CA8A04" },
  { name: "ORANGE", hex: "#EA7317" },
  { name: "PURPLE", hex: "#7C3AED" },
];

const CFG: Record<Difficulty, { window: number; colors: number }> = {
  "9hr": { window: 4000, colors: 4 },
  "6hr": { window: 2500, colors: 4 },
  "4hr": { window: 1500, colors: 6 },
};

function StroopGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const palette = ALL.slice(0, cfg.colors);

  const [phase, setPhase] = useState<"idle" | "play">("idle");
  const [trial, setTrial] = useState(0);
  const [word, setWord] = useState<Col>(palette[0]);
  const [ink, setInk] = useState<Col>(palette[1]);
  const [timeLeft, setTimeLeft] = useState(cfg.window);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const trialRef = useRef(0);
  const correctRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const startRef = useRef(0);
  const endAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);
  const inkRef = useRef<Col>(palette[1]);

  const stopTick = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };
  useEffect(() => () => stopTick(), []);

  function startTrial() {
    lockRef.current = false;
    const w = pick(palette);
    const others = palette.filter((c) => c.name !== w.name);
    const i = pick(others);
    inkRef.current = i;
    setWord(w);
    setInk(i);
    setPicked(null);
    setRevealed(false);
    setTrial(trialRef.current);
    setTimeLeft(cfg.window);
    startRef.current = performance.now();
    endAtRef.current = startRef.current + cfg.window;
    stopTick();
    tickRef.current = setInterval(() => {
      const left = endAtRef.current - performance.now();
      if (left <= 0) {
        setTimeLeft(0);
        answer(null);
      } else {
        setTimeLeft(left);
      }
    }, 80);
  }

  function answer(name: string | null) {
    if (lockRef.current) return;
    lockRef.current = true;
    stopTick();
    const correct = name === inkRef.current.name;
    if (name !== null) timesRef.current.push(performance.now() - startRef.current);
    if (correct) {
      correctRef.current += 1;
      playSound("tick");
    } else {
      playSound("fail");
    }
    setPicked(name);
    setRevealed(true);
    setTimeout(() => {
      trialRef.current += 1;
      if (trialRef.current >= TRIALS) {
        const times = timesRef.current;
        const avg = times.length
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0;
        finish({
          headline: `${correctRef.current}/${TRIALS} right`,
          sub: avg ? `About ${avg}ms per answer.` : "Too slow to register a time.",
          tone: correctRef.current >= 13 ? "good" : correctRef.current >= 9 ? "mid" : "bad",
        });
      } else {
        startTrial();
      }
    }, 320);
  }

  function begin() {
    trialRef.current = 0;
    correctRef.current = 0;
    timesRef.current = [];
    setPhase("play");
    startTrial();
  }

  const pct = Math.max(0, (timeLeft / cfg.window) * 100);

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      {phase === "idle" ? (
        <>
          <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
            A color word shows up in a different color of text. Tap the color of the text, not the word it
            spells. Fifteen trials.
          </p>
          <button
            onClick={begin}
            className="w-full rounded text-sm font-semibold"
            style={{ backgroundColor: "#001A33", color: "#fff", padding: "13px", minHeight: "44px" }}
          >
            Start
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-between text-xs mb-2" style={{ color: "#9CA3AF" }}>
            <span>
              Trial {trial + 1} of {TRIALS}
            </span>
            <span>Tap the text color</span>
          </div>
          <div className="rounded-full overflow-hidden mb-6" style={{ height: "6px", backgroundColor: "#E5E0D8" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: pct > 40 ? "#0D9488" : "#DC2626",
                transition: "width 0.08s linear",
              }}
            />
          </div>

          <p
            className="text-center font-extrabold mb-6"
            style={{ fontSize: "56px", color: ink.hex, letterSpacing: "1px" }}
          >
            {word.name}
          </p>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${palette.length > 4 ? 3 : 2}, 1fr)` }}
          >
            {palette.map((c) => {
              const dim = revealed && c.name !== inkRef.current.name && c.name !== picked;
              const wrongPick = revealed && c.name === picked && picked !== inkRef.current.name;
              return (
                <button
                  key={c.name}
                  onClick={() => answer(c.name)}
                  disabled={revealed}
                  style={{
                    padding: "16px",
                    minHeight: "48px",
                    borderRadius: "6px",
                    border: revealed && c.name === inkRef.current.name ? "3px solid #001A33" : "3px solid transparent",
                    backgroundColor: c.hex,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 800,
                    opacity: dim ? 0.4 : 1,
                    cursor: revealed ? "default" : "pointer",
                    transition: "opacity 0.15s ease, border-color 0.15s ease",
                    outline: wrongPick ? "2px solid #001A33" : "none",
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function StroopPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <StroopGame {...api} />}
    </GameShell>
  );
}

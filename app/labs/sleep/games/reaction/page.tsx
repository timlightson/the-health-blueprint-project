"use client";

import { useState, useRef, useEffect } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("reaction");

const CFG: Record<Difficulty, { rounds: number; min: number; max: number; fake: boolean }> = {
  "9hr": { rounds: 3, min: 1500, max: 3400, fake: false },
  "6hr": { rounds: 5, min: 900, max: 2500, fake: false },
  "4hr": { rounds: 7, min: 600, max: 1700, fake: true },
};

function ReactionGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [phase, setPhase] = useState<"idle" | "waiting" | "ready">("idle");
  const [red, setRed] = useState(false);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const startRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const arm = () => {
    clearTimers();
    setRed(false);
    setMsg("");
    setPhase("waiting");
    const wait = cfg.min + Math.random() * (cfg.max - cfg.min);
    if (cfg.fake && Math.random() < 0.55) {
      const flashAt = wait * (0.3 + Math.random() * 0.4);
      timers.current.push(
        setTimeout(() => {
          setRed(true);
          timers.current.push(setTimeout(() => setRed(false), 240));
        }, flashAt),
      );
    }
    timers.current.push(
      setTimeout(() => {
        startRef.current = performance.now();
        setPhase("ready");
      }, wait),
    );
  };

  const tap = () => {
    if (phase === "idle") {
      arm();
      return;
    }
    if (phase === "waiting") {
      clearTimers();
      setRed(false);
      setMsg("Too early. Wait for green.");
      playSound("fail");
      timers.current.push(setTimeout(arm, 850));
      return;
    }
    // ready
    const ms = Math.round(performance.now() - startRef.current);
    playSound("tick");
    const next = [...attempts, ms];
    setAttempts(next);
    if (next.length >= cfg.rounds) {
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      finish({
        headline: `${avg}ms average`,
        sub: `${cfg.rounds} rounds at ${difficulty.replace("hr", "")} hours of sleep.`,
        tone: avg < 300 ? "good" : avg < 380 ? "mid" : "bad",
      });
    } else {
      setPhase("waiting");
      setMsg("");
      timers.current.push(setTimeout(arm, 650));
    }
  };

  const circleColor =
    phase === "ready" ? "#0D9488" : red ? "#DC2626" : phase === "waiting" ? "#D1D5DB" : "#F0EDE6";
  const circleText =
    phase === "idle" ? "Start" : phase === "ready" ? "TAP" : red ? "not yet" : "wait…";

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      <div className="flex justify-between text-xs mb-4" style={{ color: "#9CA3AF" }}>
        <span>
          Round {Math.min(attempts.length + 1, cfg.rounds)} of {cfg.rounds}
        </span>
        <span>{msg}</span>
      </div>

      <div className="flex flex-col items-center gap-5">
        <button
          onClick={tap}
          aria-label="Reaction target"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: circleColor,
            color: phase === "idle" ? "#4A5568" : "#fff",
            fontSize: "18px",
            fontWeight: 800,
            cursor: "pointer",
            transform: phase === "ready" ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.1s ease, background-color 0.12s ease",
          }}
        >
          {circleText}
        </button>

        {attempts.length > 0 && (
          <div className="flex gap-3 flex-wrap justify-center">
            {attempts.map((a, i) => (
              <div key={i} className="text-center">
                <div className="text-sm font-bold" style={{ color: "#001A33" }}>
                  {a}ms
                </div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>
                  #{i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReactionPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <ReactionGame {...api} />}
    </GameShell>
  );
}

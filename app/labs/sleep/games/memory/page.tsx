"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("memory");

const PADS = ["#0D9488", "#D97706", "#C2410C", "#0F766E", "#92400E", "#001A33"];

const CFG: Record<Difficulty, { len: number; on: number; gap: number }> = {
  "9hr": { len: 4, on: 480, gap: 300 },
  "6hr": { len: 6, on: 360, gap: 200 },
  "4hr": { len: 8, on: 190, gap: 110 },
};

function MemoryGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [phase, setPhase] = useState<"idle" | "showing" | "input">("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [at, setAt] = useState(0);
  const [bad, setBad] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const start = () => {
    clearTimers();
    const s = Array.from({ length: cfg.len }, () => Math.floor(Math.random() * PADS.length));
    setSeq(s);
    setAt(0);
    setBad(false);
    setPhase("showing");
    const step = cfg.on + cfg.gap;
    s.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => {
          setLit(pad);
          playSound("tick");
        }, i * step + 300),
      );
      timers.current.push(setTimeout(() => setLit(null), i * step + 300 + cfg.on));
    });
    timers.current.push(setTimeout(() => setPhase("input"), s.length * step + 400));
  };

  const tap = (pad: number) => {
    if (phase !== "input") return;
    if (pad === seq[at]) {
      playSound("tick");
      setLit(pad);
      setTimeout(() => setLit(null), 160);
      const next = at + 1;
      setAt(next);
      if (next >= seq.length) {
        playSound("ding");
        finish({ headline: `${seq.length}/${seq.length} remembered`, sub: "Perfect recall.", tone: "good" });
      }
    } else {
      setBad(true);
      playSound("fail");
      finish({
        headline: `${at}/${seq.length} remembered`,
        sub: at >= seq.length - 1 ? "So close." : "The sequence slipped.",
        tone: at >= seq.length * 0.7 ? "mid" : "bad",
      });
    }
  };

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
        {phase === "idle" && `Watch the ${cfg.len}-square sequence, then tap it back in order.`}
        {phase === "showing" && "Watch closely…"}
        {phase === "input" && `Your turn. Tap them in order (${at}/${seq.length}).`}
      </p>

      <div
        className="grid grid-cols-3 gap-3 mx-auto mb-5"
        style={{ maxWidth: "320px", animation: bad ? "memShake 0.4s ease" : "none" }}
      >
        <style>{`@keyframes memShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
        {PADS.map((col, i) => {
          const active = lit === i;
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={phase !== "input"}
              aria-label={`Pad ${i + 1}`}
              style={{
                height: "78px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: col,
                opacity: active ? 1 : 0.32,
                transform: active ? "scale(1.05)" : "scale(1)",
                boxShadow: active ? `0 0 0 5px ${col}33` : "none",
                cursor: phase === "input" ? "pointer" : "default",
                transition: "opacity 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease",
              }}
            />
          );
        })}
      </div>

      {phase === "idle" && (
        <button
          onClick={start}
          className="w-full rounded text-sm font-semibold"
          style={{ backgroundColor: "#001A33", color: "#fff", padding: "13px", minHeight: "44px" }}
        >
          Start
        </button>
      )}
    </div>
  );
}

export default function MemoryPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <MemoryGame {...api} />}
    </GameShell>
  );
}

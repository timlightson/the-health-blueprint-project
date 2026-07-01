"use client";

import { useState, useRef, useMemo } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta, randInt } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("focus");
const ROUNDS = 5;

const PAIRS: [string, string][] = [
  ["O", "Q"], ["C", "G"], ["E", "F"], ["P", "R"],
  ["M", "N"], ["V", "Y"], ["I", "T"], ["U", "V"],
];

const CFG: Record<Difficulty, { n: number; blur: number; sway: boolean }> = {
  "9hr": { n: 4, blur: 0, sway: false },
  "6hr": { n: 6, blur: 0, sway: false },
  "4hr": { n: 8, blur: 2, sway: true },
};

function FocusGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const startRef = useRef(0);

  const newBoard = () => {
    const pair = PAIRS[randInt(0, PAIRS.length - 1)];
    return { common: pair[0], odd: pair[1], oddIndex: randInt(0, cfg.n * cfg.n - 1) };
  };
  const [board, setBoard] = useState(newBoard);

  const begin = () => {
    setStarted(true);
    setBoard(newBoard());
    startRef.current = performance.now();
  };

  const tap = (i: number) => {
    if (!started) return;
    if (i !== board.oddIndex) {
      setWrong(true);
      playSound("fail");
      setTimeout(() => setWrong(false), 320);
      return;
    }
    const elapsed = performance.now() - startRef.current;
    const next = [...times, elapsed];
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) {
      playSound("ding");
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      finish({
        headline: `${avg}ms average`,
        sub: `${ROUNDS} rounds on a ${cfg.n}×${cfg.n} grid.`,
        tone: avg < 1500 ? "good" : avg < 2800 ? "mid" : "bad",
      });
    } else {
      playSound("tick");
      setTimes(next);
      setRound(nextRound);
      setBoard(newBoard());
      startRef.current = performance.now();
    }
  };

  const cells = useMemo(
    () => Array.from({ length: cfg.n * cfg.n }, (_, i) => i),
    [cfg.n],
  );

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      <style>{`@keyframes focSway { 0%,100%{transform:rotate(-1.4deg)} 50%{transform:rotate(1.4deg)} }`}</style>
      <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
        {started ? `Round ${round + 1} of ${ROUNDS}. Find the odd letter.` : "One letter is different. Tap it fast. Five rounds."}
      </p>

      {started && (
        <div
          className="mx-auto mb-2 select-none"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cfg.n}, 1fr)`,
            gap: cfg.n > 6 ? "5px" : "8px",
            maxWidth: "320px",
            filter: cfg.blur ? `blur(${cfg.blur}px)` : "none",
            animation: wrong ? "memShake 0.32s ease" : cfg.sway ? "focSway 4.2s ease-in-out infinite" : "none",
            transformOrigin: "center",
          }}
        >
          <style>{`@keyframes memShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }`}</style>
          {cells.map((i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={i === board.oddIndex ? "odd letter" : "letter"}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: "5px",
                border: "1px solid #E5E0D8",
                backgroundColor: "#F9F7F2",
                color: "#001A33",
                fontSize: cfg.n > 6 ? "15px" : "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {i === board.oddIndex ? board.odd : board.common}
            </button>
          ))}
        </div>
      )}

      {!started && (
        <button
          onClick={begin}
          className="w-full rounded text-sm font-semibold"
          style={{ backgroundColor: "#001A33", color: "#fff", padding: "13px", minHeight: "44px" }}
        >
          Start
        </button>
      )}
    </div>
  );
}

export default function FocusPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <FocusGame {...api} />}
    </GameShell>
  );
}

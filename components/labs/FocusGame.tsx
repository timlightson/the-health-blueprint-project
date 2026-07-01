"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { playSound } from "@/lib/sleep-sound";

// Find the odd letter out, 5 rounds. On low sleep the grid blurs and
// sways — what scattered attention actually feels like.

const ROUNDS = 5;
const GRID = 25; // 5x5

// Visually-confusable letter pairs: [common, odd-one-out]
const PAIRS: [string, string][] = [
  ["O", "Q"],
  ["C", "G"],
  ["E", "F"],
  ["P", "R"],
  ["M", "N"],
  ["V", "Y"],
  ["I", "T"],
  ["U", "V"],
];

function interferenceFor(hours: number): { blur: number; sway: string; opacity: number } {
  if (hours >= 9) return { blur: 0, sway: "none", opacity: 1 };
  if (hours >= 7) return { blur: 0.4, sway: "none", opacity: 1 };
  if (hours >= 5) return { blur: 1.3, sway: "slpSway 3.2s ease-in-out infinite", opacity: 0.92 };
  return { blur: 2.6, sway: "slpSway 4.6s ease-in-out infinite", opacity: 0.78 };
}

type Phase = "idle" | "playing" | "done";

export default function FocusGame({
  sleepHours,
  onClose,
}: {
  sleepHours: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const startRef = useRef(0);

  const interference = useMemo(() => interferenceFor(sleepHours), [sleepHours]);

  const newBoard = useCallback(() => {
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const oddIndex = Math.floor(Math.random() * GRID);
    return { common: pair[0], odd: pair[1], oddIndex };
  }, []);

  const [board, setBoard] = useState(newBoard);

  const begin = useCallback(() => {
    setRound(0);
    setTimes([]);
    setWrong(false);
    setBoard(newBoard());
    setPhase("playing");
    startRef.current = performance.now();
  }, [newBoard]);

  const tapCell = (index: number) => {
    if (phase !== "playing") return;
    if (index !== board.oddIndex) {
      setWrong(true);
      playSound("fail");
      setTimeout(() => setWrong(false), 350);
      return;
    }
    const elapsed = performance.now() - startRef.current;
    const nextTimes = [...times, elapsed];
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) {
      setTimes(nextTimes);
      setPhase("done");
      playSound("ding");
    } else {
      playSound("tick");
      setTimes(nextTimes);
      setRound(nextRound);
      setBoard(newBoard());
      startRef.current = performance.now();
    }
  };

  useEffect(() => {
    // re-anchor timer when a fresh board mounts mid-game
    if (phase === "playing") startRef.current = performance.now();
  }, [phase]);

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div
      className="rounded p-5"
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E5E0D8",
        animation: "slpExpand 0.3s ease-out",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4A5568" }}>
          Focus · find the odd one
        </p>
        <button onClick={onClose} className="text-sm px-2" style={{ color: "#9CA3AF" }} aria-label="Close game">
          ✕
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: "#4A5568" }}>
        {phase === "idle" && "One letter in the grid is different. Tap it as fast as you can. Five rounds."}
        {phase === "playing" && `Round ${round + 1} of ${ROUNDS}. Spot the odd letter.`}
        {phase === "done" && "Done. Here's your attention speed."}
      </p>

      {phase === "playing" && (
        <div
          className="grid grid-cols-5 gap-1.5 mx-auto mb-4 select-none"
          style={{
            maxWidth: "300px",
            filter: `blur(${interference.blur}px)`,
            opacity: interference.opacity,
            animation: wrong ? "slpShake 0.35s ease" : interference.sway,
            transformOrigin: "center",
          }}
        >
          {Array.from({ length: GRID }, (_, i) => (
            <button
              key={i}
              onClick={() => tapCell(i)}
              aria-label={i === board.oddIndex ? "odd letter" : "letter"}
              style={{
                height: "46px",
                borderRadius: "4px",
                border: "1px solid #E5E0D8",
                backgroundColor: "#F9F7F2",
                color: "#001A33",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {i === board.oddIndex ? board.odd : board.common}
            </button>
          ))}
        </div>
      )}

      {phase === "idle" && (
        <button
          onClick={begin}
          className="w-full py-2.5 rounded text-sm font-semibold"
          style={{ backgroundColor: "#001A33", color: "#fff" }}
        >
          Start
        </button>
      )}

      {phase === "done" && (
        <div>
          <div
            className="rounded p-3 mb-3 text-center"
            style={{
              backgroundColor: avg <= 1400 ? "#0D948810" : avg >= 2600 ? "#DC262610" : "#D9770610",
              border: `1px solid ${avg <= 1400 ? "#0D948830" : avg >= 2600 ? "#DC262630" : "#D9770630"}`,
            }}
          >
            <p
              className="text-lg font-bold"
              style={{ color: avg <= 1400 ? "#0D9488" : avg >= 2600 ? "#DC2626" : "#D97706" }}
            >
              Your average: {avg}ms
            </p>
            <p className="text-xs mt-1" style={{ color: "#4A5568" }}>
              {sleepHours >= 8
                ? "Sharp and clean. That's a rested brain locking on fast."
                : "The blur and sway you just played through? That's roughly what poor focus does to the task. Sleep-deprived students take 23% longer on attention tests."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={begin}
              className="flex-1 py-2.5 rounded text-sm font-semibold"
              style={{ backgroundColor: "#001A33", color: "#fff" }}
            >
              Play again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded text-sm font-semibold"
              style={{ backgroundColor: "#F0EDE6", color: "#4A5568" }}
            >
              Close
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: "#9CA3AF" }}>
            Auctores Online (2024)
          </p>
        </div>
      )}
    </div>
  );
}

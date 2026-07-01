"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { playSound } from "@/lib/sleep-sound";

// Simon-style recall. Sequence length scales with how rested you are —
// a rested brain holds more in working memory.

const PADS = [
  { id: 0, color: "#0D9488" },
  { id: 1, color: "#D97706" },
  { id: 2, color: "#C2410C" },
  { id: 3, color: "#0F766E" },
  { id: 4, color: "#92400E" },
  { id: 5, color: "#001A33" },
];

function seqLenFor(hours: number): number {
  if (hours >= 9) return 7;
  if (hours >= 7) return 6;
  if (hours >= 5) return 5;
  return 4;
}

type Phase = "idle" | "showing" | "input" | "done";

export default function MemoryGame({
  sleepHours,
  onClose,
}: {
  sleepHours: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<"none" | "good" | "bad">("none");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    const len = seqLenFor(sleepHours);
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * PADS.length));
    setSequence(seq);
    setInputIndex(0);
    setScore(0);
    setFlash("none");
    setPhase("showing");

    const step = 560;
    seq.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => {
          setLit(pad);
          playSound("tick");
        }, i * step + 250),
      );
      timers.current.push(
        setTimeout(() => setLit(null), i * step + 250 + step * 0.6),
      );
    });
    timers.current.push(
      setTimeout(() => setPhase("input"), seq.length * step + 350),
    );
  }, [sleepHours, clearTimers]);

  const finish = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      setPhase("done");
      playSound(finalScore === sequence.length ? "ding" : "fail");
    },
    [sequence.length],
  );

  const tapPad = (pad: number) => {
    if (phase !== "input") return;
    if (pad === sequence[inputIndex]) {
      playSound("tick");
      setLit(pad);
      setTimeout(() => setLit(null), 180);
      const next = inputIndex + 1;
      setInputIndex(next);
      if (next >= sequence.length) {
        setFlash("good");
        finish(next);
      }
    } else {
      setFlash("bad");
      finish(inputIndex);
    }
  };

  const len = sequence.length || seqLenFor(sleepHours);

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
          Memory · working recall
        </p>
        <button onClick={onClose} className="text-sm px-2" style={{ color: "#9CA3AF" }} aria-label="Close game">
          ✕
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: "#4A5568" }}>
        {phase === "idle" && `Watch the ${seqLenFor(sleepHours)}-square sequence, then tap it back in order.`}
        {phase === "showing" && "Watch closely…"}
        {phase === "input" && `Your turn. Tap them in order (${inputIndex}/${len}).`}
        {phase === "done" &&
          (score === len ? "Perfect recall. Every square, right order." : "The sequence slipped.")}
      </p>

      <div
        className="grid grid-cols-3 gap-2 mx-auto mb-4"
        style={{
          maxWidth: "300px",
          animation: flash === "bad" ? "slpShake 0.4s ease" : "none",
        }}
      >
        {PADS.map((pad) => {
          const active = lit === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => tapPad(pad.id)}
              disabled={phase !== "input"}
              aria-label={`Pad ${pad.id + 1}`}
              style={{
                height: "62px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: pad.color,
                opacity: active ? 1 : 0.32,
                transform: active ? "scale(1.06)" : "scale(1)",
                boxShadow: active ? `0 0 0 4px ${pad.color}33` : "none",
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
              backgroundColor: score === len ? "#0D948810" : "#D9770610",
              border: `1px solid ${score === len ? "#0D948830" : "#D9770630"}`,
            }}
          >
            <p className="text-lg font-bold" style={{ color: score === len ? "#0D9488" : "#D97706" }}>
              You remembered {score}/{len}
            </p>
            <p className="text-xs mt-1" style={{ color: "#4A5568" }}>
              At {sleepHours}h, your brain handed you a {len}-square sequence. Sleep-deprived teens lose
              roughly 20% of memory encoding capacity, so fewer squares to even attempt.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
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
            Newbury &amp; Bhatt (2024)
          </p>
        </div>
      )}
    </div>
  );
}

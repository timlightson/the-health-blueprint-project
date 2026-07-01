"use client";

import { useState, useRef, useEffect } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta, randInt, shuffle } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("math");
const COUNT = 10;

const CFG: Record<Difficulty, { time: number }> = {
  "9hr": { time: 8 },
  "6hr": { time: 5 },
  "4hr": { time: 3 },
};

interface Problem {
  text: string;
  answer: number;
  options: number[];
}

function genProblem(d: Difficulty): Problem {
  let a: number, b: number, answer: number, text: string;
  const op = randInt(0, 2);
  if (d === "9hr") {
    if (op === 0) {
      a = randInt(2, 9); b = randInt(2, 9); answer = a + b; text = `${a} + ${b}`;
    } else if (op === 1) {
      a = randInt(6, 15); b = randInt(1, a); answer = a - b; text = `${a} − ${b}`;
    } else {
      a = randInt(2, 9); b = randInt(2, 9); answer = a * b; text = `${a} × ${b}`;
    }
  } else if (d === "6hr") {
    if (op === 0) {
      a = randInt(13, 49); b = randInt(12, 49); answer = a + b; text = `${a} + ${b}`;
    } else if (op === 1) {
      a = randInt(25, 89); b = randInt(8, a - 1); answer = a - b; text = `${a} − ${b}`;
    } else {
      a = randInt(3, 9); b = randInt(4, 9); answer = a * b; text = `${a} × ${b}`;
    }
  } else {
    a = randInt(12, 29); b = randInt(4, 12); answer = a * b; text = `${a} × ${b}`;
  }
  const opts = new Set<number>([answer]);
  const spread = Math.max(2, Math.round(answer * 0.12));
  while (opts.size < 4) {
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    if (answer + delta > 0) opts.add(answer + delta);
  }
  return { text, answer, options: shuffle([...opts]) };
}

function MathGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [phase, setPhase] = useState<"idle" | "play">("idle");
  const [idx, setIdx] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState(cfg.time);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const problemsRef = useRef<Problem[]>([]);
  const idxRef = useRef(0);
  const correctRef = useRef(0);
  const endAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  const stopTick = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };
  useEffect(() => () => stopTick(), []);

  function startProblem() {
    lockRef.current = false;
    setProblem(problemsRef.current[idxRef.current]);
    setIdx(idxRef.current);
    setPicked(null);
    setRevealed(false);
    setTimeLeft(cfg.time);
    endAtRef.current = performance.now() + cfg.time * 1000;
    stopTick();
    tickRef.current = setInterval(() => {
      const left = (endAtRef.current - performance.now()) / 1000;
      if (left <= 0) {
        setTimeLeft(0);
        answer(null);
      } else {
        setTimeLeft(left);
      }
    }, 100);
  }

  function answer(choice: number | null) {
    if (lockRef.current) return;
    lockRef.current = true;
    stopTick();
    const p = problemsRef.current[idxRef.current];
    const correct = choice === p.answer;
    if (correct) {
      correctRef.current += 1;
      playSound("tick");
    } else {
      playSound("fail");
    }
    setPicked(choice);
    setRevealed(true);
    setTimeout(() => {
      idxRef.current += 1;
      if (idxRef.current >= COUNT) {
        finish({
          headline: `${correctRef.current}/${COUNT} correct`,
          sub: `${cfg.time}s per problem.`,
          tone: correctRef.current >= 8 ? "good" : correctRef.current >= 5 ? "mid" : "bad",
        });
      } else {
        startProblem();
      }
    }, 430);
  }

  function begin() {
    problemsRef.current = Array.from({ length: COUNT }, () => genProblem(difficulty));
    idxRef.current = 0;
    correctRef.current = 0;
    setPhase("play");
    startProblem();
  }

  const pct = Math.max(0, (timeLeft / cfg.time) * 100);
  const barCol = pct > 50 ? "#0D9488" : pct > 25 ? "#D97706" : "#DC2626";

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      {phase === "idle" ? (
        <>
          <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
            Ten problems. Pick the right answer before the timer runs out.
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
              Problem {idx + 1} of {COUNT}
            </span>
          </div>
          <div className="rounded-full overflow-hidden mb-6" style={{ height: "6px", backgroundColor: "#E5E0D8" }}>
            <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barCol, transition: "width 0.1s linear" }} />
          </div>

          <p className="text-center font-bold mb-6" style={{ fontSize: "44px", color: "#001A33" }}>
            {problem?.text} <span style={{ color: "#9CA3AF" }}>= ?</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            {problem?.options.map((opt) => {
              const isAnswer = opt === problem.answer;
              const bg = revealed
                ? isAnswer
                  ? "#0D9488"
                  : opt === picked
                  ? "#DC2626"
                  : "#F9F7F2"
                : "#F9F7F2";
              const fg = revealed && (isAnswer || opt === picked) ? "#fff" : "#001A33";
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={revealed}
                  style={{
                    padding: "16px",
                    minHeight: "44px",
                    borderRadius: "6px",
                    border: "1px solid #E5E0D8",
                    backgroundColor: bg,
                    color: fg,
                    fontSize: "22px",
                    fontWeight: 800,
                    cursor: revealed ? "default" : "pointer",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function MathPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <MathGame {...api} />}
    </GameShell>
  );
}

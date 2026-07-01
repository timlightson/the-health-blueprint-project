"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type Difficulty, DIFFICULTIES, diffMeta } from "./core";

export interface GameResult {
  headline: string;
  sub?: string;
  tone?: "good" | "mid" | "bad";
}

export interface GameApi {
  difficulty: Difficulty;
  hours: number;
  finish: (r: GameResult) => void;
}

function ResultsCard({
  result,
  researchNote,
  onPlayAgain,
  onSwitch,
}: {
  result: GameResult;
  researchNote: string;
  onPlayAgain: () => void;
  onSwitch: () => void;
}) {
  const toneCol =
    result.tone === "good" ? "#0D9488" : result.tone === "bad" ? "#DC2626" : "#D97706";
  return (
    <div
      className="lg p-7 text-center lg-rise"
      style={{ borderRadius: "26px" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ink-faint)" }}>
        Round done
      </p>
      <p className="text-4xl font-bold mb-1.5" style={{ color: toneCol, letterSpacing: "-0.02em" }}>
        {result.headline}
      </p>
      {result.sub && (
        <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
          {result.sub}
        </p>
      )}
      <div
        className="p-4 mb-6 text-left"
        style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--ink)" }}>
          What the research says
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {researchNote}
        </p>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={onPlayAgain}
          className="flex-1 text-sm font-semibold lg-press"
          style={{ background: "linear-gradient(165deg, #16384a, #0B1A2B)", color: "#fff", padding: "14px", minHeight: "48px", borderRadius: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 24px -12px rgba(11,26,43,0.6)" }}
        >
          Play again
        </button>
        <button
          onClick={onSwitch}
          className="flex-1 text-sm font-semibold lg-press"
          style={{ background: "rgba(255,255,255,0.5)", color: "var(--ink-soft)", padding: "14px", minHeight: "48px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
        >
          Switch difficulty
        </button>
      </div>
    </div>
  );
}

export default function GameShell({
  title,
  description,
  researchNote,
  children,
}: {
  title: string;
  description: string;
  researchNote: string;
  children: (api: GameApi) => React.ReactNode;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("6hr");
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const choose = (d: Difficulty) => {
    setDifficulty(d);
    setResult(null);
    setRunId((n) => n + 1);
  };
  const playAgain = () => {
    setResult(null);
    setRunId((n) => n + 1);
  };
  const switchDifficulty = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dm = diffMeta(difficulty);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <style>{`
        @keyframes slpExpand { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <header
        className="flex items-center px-4 sm:px-6 flex-shrink-0 lg-bar sticky top-0"
        style={{ height: "62px", zIndex: 40, position: "sticky" }}
      >
        <Link
          href="/labs/sleep#games"
          className="group flex items-center gap-1.5 text-sm font-medium lg-pill rounded-full pl-2.5 pr-4 py-2"
          style={{ color: "var(--ink-soft)" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Sleep Lab
        </Link>
      </header>

      <main className="flex-1" style={{ position: "relative", zIndex: 10 }}>
        <div ref={topRef} className="max-w-2xl mx-auto px-6 py-10 sm:py-12">
          <p className="hb-kicker mb-3" style={{ color: "#0B6F65" }}>Sleep Lab · Game</p>
          <h1 className="font-bold mb-2.5" style={{ fontSize: "clamp(1.9rem, 5vw, 2.6rem)", color: "var(--ink)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            {title}
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
            {description}
          </p>

          {/* Difficulty selector */}
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ink-soft)" }}>
            Pick your sleep level
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {DIFFICULTIES.map((d) => {
              const active = d.id === difficulty;
              return (
                <button
                  key={d.id}
                  onClick={() => choose(d.id)}
                  className="text-left p-4 lg-press"
                  style={{
                    borderRadius: "20px",
                    background: active
                      ? `linear-gradient(165deg, ${d.color}2E, rgba(255,255,255,0.5))`
                      : "var(--glass-bg)",
                    backdropFilter: "var(--glass-blur)",
                    WebkitBackdropFilter: "var(--glass-blur)",
                    border: `1px solid ${active ? `${d.color}66` : "var(--glass-border)"}`,
                    boxShadow: active
                      ? `inset 0 1px 0 rgba(255,255,255,0.85), 0 14px 32px -14px ${d.color}88`
                      : "var(--glass-shadow)",
                    transition: "background 0.35s var(--ease-glass), border-color 0.3s ease, box-shadow 0.35s var(--ease-glass), transform 0.4s var(--spring)",
                    transform: active ? "translateY(-3px)" : "translateY(0)",
                  }}
                >
                  <span className="block text-sm font-bold" style={{ color: d.color }}>
                    {d.label}
                  </span>
                  <span className="block text-xs mt-1 leading-snug" style={{ color: "var(--ink-soft)" }}>
                    {d.explainer}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Game area */}
          {result ? (
            <ResultsCard
              result={result}
              researchNote={researchNote}
              onPlayAgain={playAgain}
              onSwitch={switchDifficulty}
            />
          ) : (
            <div key={`${difficulty}-${runId}`}>
              {children({ difficulty, hours: dm.hours, finish: (r) => setResult(r) })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

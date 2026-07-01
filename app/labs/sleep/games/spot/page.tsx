"use client";

import { useState, useRef, useEffect } from "react";
import GameShell, { type GameApi } from "@/components/labs/games/GameShell";
import { type Difficulty, gameMeta, randInt, shuffle, pick } from "@/components/labs/games/core";
import { playSound } from "@/lib/sleep-sound";

const META = gameMeta("spot");
const TARGET = 5;
const PALETTE = ["#DC2626", "#0D9488", "#D97706", "#2563EB", "#7C3AED", "#CA8A04", "#EA7317"];
type ShapeType = "circle" | "square" | "triangle" | "diamond";

interface Shape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  color: string;
}
interface Diff {
  id: number;
  kind: "hide" | "color" | "size" | "move";
  bcolor?: string;
  bsize?: number;
  bx?: number;
  by?: number;
}

const CFG: Record<Difficulty, { count: number; time: number; level: 0 | 1 | 2 }> = {
  "9hr": { count: 8, time: 90, level: 0 },
  "6hr": { count: 12, time: 60, level: 1 },
  "4hr": { count: 18, time: 45, level: 2 },
};

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = Math.round(c + (amt > 0 ? 255 - c : c) * amt);
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  });
  return `#${ch.join("")}`;
}

function buildScene(cfg: { count: number; level: 0 | 1 | 2 }): { shapes: Shape[]; diffs: Diff[] } {
  const rows = Math.ceil(cfg.count / 3);
  const cellH = 256 / rows;
  const cells = shuffle(Array.from({ length: rows * 3 }, (_, i) => i)).slice(0, cfg.count);
  const types: ShapeType[] = ["circle", "square", "triangle", "diamond"];
  const shapes: Shape[] = cells.map((cell, id) => {
    const col = cell % 3;
    const row = Math.floor(cell / 3);
    return {
      id,
      type: pick(types),
      x: 50 + col * 60 + randInt(-9, 9),
      y: 46 + row * cellH + cellH / 2 + randInt(-8, 8),
      size: randInt(14, 21),
      color: pick(PALETTE),
    };
  });

  const chosen = shuffle(shapes.map((s) => s.id)).slice(0, TARGET);
  const diffs: Diff[] = chosen.map((id) => {
    const s = shapes[id];
    const kinds =
      cfg.level === 0
        ? (["hide", "color", "size"] as const)
        : cfg.level === 1
        ? (["hide", "color", "size", "move"] as const)
        : (["move", "size", "color"] as const);
    const kind = pick([...kinds]);
    if (kind === "hide") return { id, kind };
    if (kind === "color") {
      if (cfg.level === 2) {
        return { id, kind, bcolor: shade(s.color, Math.random() < 0.5 ? 0.26 : -0.26) };
      }
      return { id, kind, bcolor: pick(PALETTE.filter((c) => c !== s.color)) };
    }
    if (kind === "size") {
      const delta = (cfg.level === 2 ? 4 : 9) * (Math.random() < 0.5 ? 1 : -1);
      return { id, kind, bsize: Math.max(9, s.size + delta) };
    }
    const d = cfg.level === 2 ? 10 : 22;
    return {
      id,
      kind,
      bx: s.x + (Math.random() < 0.5 ? -d : d),
      by: s.y + (Math.random() < 0.5 ? -d : d),
    };
  });
  return { shapes, diffs };
}

function ShapeNode({ s, onClick }: { s: { type: ShapeType; x: number; y: number; size: number; color: string }; onClick?: () => void }) {
  const { type, x, y, size, color } = s;
  let node: React.ReactNode;
  if (type === "circle") node = <circle cx={x} cy={y} r={size} fill={color} />;
  else if (type === "square")
    node = <rect x={x - size} y={y - size} width={size * 2} height={size * 2} rx={3} fill={color} />;
  else if (type === "triangle")
    node = <polygon points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`} fill={color} />;
  else node = <polygon points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`} fill={color} />;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <circle cx={x} cy={y} r={size + 9} fill="transparent" />
      {node}
    </g>
  );
}

function SpotGame({ difficulty, finish }: GameApi) {
  const cfg = CFG[difficulty];
  const [phase, setPhase] = useState<"idle" | "play">("idle");
  const [scene, setScene] = useState<{ shapes: Shape[]; diffs: Diff[] }>({ shapes: [], diffs: [] });
  const [found, setFound] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(cfg.time);

  const foundRef = useRef<number[]>([]);
  const endAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false);

  const stopTick = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };
  useEffect(() => () => stopTick(), []);

  function resolve() {
    if (endedRef.current) return;
    endedRef.current = true;
    stopTick();
    const f = foundRef.current.length;
    playSound(f === TARGET ? "ding" : "fail");
    finish({
      headline: `${f}/${TARGET} differences`,
      sub: f === TARGET ? "Found every one." : "Time ran out.",
      tone: f === TARGET ? "good" : f >= 3 ? "mid" : "bad",
    });
  }

  function begin() {
    endedRef.current = false;
    foundRef.current = [];
    setFound([]);
    setScene(buildScene(cfg));
    setPhase("play");
    setTimeLeft(cfg.time);
    endAtRef.current = performance.now() + cfg.time * 1000;
    stopTick();
    tickRef.current = setInterval(() => {
      const left = (endAtRef.current - performance.now()) / 1000;
      if (left <= 0) {
        setTimeLeft(0);
        resolve();
      } else {
        setTimeLeft(left);
      }
    }, 150);
  }

  const diffIds = scene.diffs.map((d) => d.id);
  const diffOf = (id: number) => scene.diffs.find((d) => d.id === id);

  const hit = (id: number) => {
    if (endedRef.current || !diffIds.includes(id) || foundRef.current.includes(id)) return;
    const nx = [...foundRef.current, id];
    foundRef.current = nx;
    setFound(nx);
    playSound("ding");
    if (nx.length >= TARGET) resolve();
  };

  // B-scene render props for a shape (apply its difference, if any)
  const variantB = (s: Shape) => {
    const d = diffOf(s.id);
    if (!d) return { hidden: false, x: s.x, y: s.y, size: s.size, color: s.color };
    if (d.kind === "hide") return { hidden: true, x: s.x, y: s.y, size: s.size, color: s.color };
    return {
      hidden: false,
      x: d.bx ?? s.x,
      y: d.by ?? s.y,
      size: d.bsize ?? s.size,
      color: d.bcolor ?? s.color,
    };
  };

  const renderPanel = (side: "A" | "B") => (
    <svg viewBox="0 0 220 320" width="100%" style={{ display: "block", touchAction: "manipulation" }}>
      <rect x="3" y="3" width="214" height="314" rx="12" fill="#2C4A6E" />
      {scene.shapes.map((s) => {
        const b = side === "B" ? variantB(s) : null;
        if (b?.hidden) {
          // invisible tap target where the shape used to be
          return (
            <circle
              key={s.id}
              cx={s.x}
              cy={s.y}
              r={s.size + 9}
              fill="transparent"
              onClick={() => hit(s.id)}
              style={{ cursor: "pointer" }}
            />
          );
        }
        const r = b ?? { x: s.x, y: s.y, size: s.size, color: s.color };
        const isFound = found.includes(s.id);
        return (
          <g key={s.id}>
            <ShapeNode s={{ type: s.type, x: r.x, y: r.y, size: r.size, color: r.color }} onClick={() => hit(s.id)} />
            {isFound && (
              <circle cx={r.x} cy={r.y} r={r.size + 7} fill="none" stroke="#34D399" strokeWidth="3.5" />
            )}
          </g>
        );
      })}
    </svg>
  );

  const pct = Math.max(0, (timeLeft / cfg.time) * 100);

  return (
    <div className="rounded p-6" style={{ backgroundColor: "#fff", border: "1px solid #E5E0D8" }}>
      {phase === "idle" ? (
        <>
          <p className="text-sm text-center mb-4" style={{ color: "#4A5568" }}>
            Two pictures, five differences. Tap each difference on either picture before the timer runs out.
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
              {found.length}/{TARGET} found
            </span>
            <span>{Math.ceil(timeLeft)}s left</span>
          </div>
          <div className="rounded-full overflow-hidden mb-4" style={{ height: "6px", backgroundColor: "#E5E0D8" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: pct > 40 ? "#0D9488" : pct > 20 ? "#D97706" : "#DC2626",
                transition: "width 0.15s linear",
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">{renderPanel("A")}</div>
            <div className="flex-1">{renderPanel("B")}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SpotPage() {
  return (
    <GameShell title={META.title} description={META.description} researchNote={META.researchNote}>
      {(api) => <SpotGame {...api} />}
    </GameShell>
  );
}

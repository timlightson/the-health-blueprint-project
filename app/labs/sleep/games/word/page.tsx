"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, RotateCcw } from "lucide-react";
import { WORD_STRANDS_PUZZLES } from "@/lib/word-strands-puzzles";
import { ENGLISH_WORDS } from "@/lib/word-strands-dict";
import { playSound } from "@/lib/sleep-sound";

// ─── Colors ───────────────────────────────────────────────────────────────────

const C_THEME = "#3B82F6"; // found theme word — blue
const C_SPAN = "#EAB308"; // found spangram — gold
const C_SELECT = "#E8E4DC"; // currently selecting — light gray
const C_AMBER = "#D97706"; // non-theme flash
const C_HINT = "#CFFAF4"; // hint reveal — light cyan

// ─── Daily puzzle (midnight, America/New_York) ────────────────────────────────

function nyDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}
function dayNumberFromKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}
function dateLabelFromKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Progress (localStorage) ──────────────────────────────────────────────────

interface Progress {
  found: string[];
  nonThemeWords: string[];
  hintsUsed: number;
  hintedWords: string[];
}
const EMPTY: Progress = { found: [], nonThemeWords: [], hintsUsed: 0, hintedWords: [] };

function loadProgress(key: string): Progress {
  try {
    const raw = localStorage.getItem(`wordstrands:${key}`);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    return {
      found: p.found ?? [],
      nonThemeWords: p.nonThemeWords ?? [],
      hintsUsed: p.hintsUsed ?? 0,
      hintedWords: p.hintedWords ?? [],
    };
  } catch {
    return EMPTY;
  }
}

// ─── Game ─────────────────────────────────────────────────────────────────────

function StrandsGame({ dateKey }: { dateKey: string }) {
  const dayNum = dayNumberFromKey(dateKey);
  const puzzle =
    WORD_STRANDS_PUZZLES[((dayNum % WORD_STRANDS_PUZZLES.length) + WORD_STRANDS_PUZZLES.length) % WORD_STRANDS_PUZZLES.length];

  const ROWS = puzzle.grid.length;
  const COLS = puzzle.grid[0].length;
  const toFind = [puzzle.spangram, ...puzzle.words];

  const [progress, setProgress] = useState<Progress>(() => loadProgress(dateKey));
  const [selection, setSelection] = useState<number[]>([]);
  const [flash, setFlash] = useState<number[] | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<number[]>([]);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSeq = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(`wordstrands:${dateKey}`, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress, dateKey]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const letterAt = (i: number) => puzzle.grid[Math.floor(i / COLS)][i % COLS];
  const adjacent = (a: number, b: number) => {
    if (a === b) return false;
    return Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS)) <= 1 && Math.abs((a % COLS) - (b % COLS)) <= 1;
  };

  const won = toFind.every((w) => progress.found.includes(w));
  const hintsAvailable = Math.max(0, Math.floor(progress.nonThemeWords.length / 3) - progress.hintsUsed);

  // cell → color
  const foundColor = new Map<number, string>();
  for (const w of progress.found) {
    const path = puzzle.solutions[w];
    if (!path) continue;
    const col = w === puzzle.spangram ? C_SPAN : C_THEME;
    for (const [r, c] of path) foundColor.set(r * COLS + c, col);
  }
  const hintCells = new Set<number>();
  for (const w of progress.hintedWords) {
    if (progress.found.includes(w)) continue;
    const path = puzzle.solutions[w];
    if (!path) continue;
    for (const [r, c] of path) hintCells.add(r * COLS + c);
  }
  const selSet = new Set(selection);
  const flashSet = new Set(flash ?? []);

  const applySel = (next: number[]) => {
    selRef.current = next;
    setSelection(next);
  };
  const showToast = (msg: string) => {
    toastSeq.current += 1;
    setToast({ msg, key: toastSeq.current });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  };
  const flashCells = (cells: number[]) => {
    setFlash(cells);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 600);
  };

  const isValidNonThemeWord = (w: string) => {
    if (ENGLISH_WORDS.has(w)) return true;
    if (w.endsWith("ES") && w.length > 2 && ENGLISH_WORDS.has(w.slice(0, -2))) return true;
    if (w.endsWith("S") && w.length > 1 && ENGLISH_WORDS.has(w.slice(0, -1))) return true;
    return false;
  };

  const doSubmit = () => {
    const sel = selRef.current;
    const word = sel.map(letterAt).join("");
    if (sel.length >= 3 && toFind.includes(word) && !progress.found.includes(word)) {
      const isSpan = word === puzzle.spangram;
      setProgress((p) => ({ ...p, found: [...p.found, word] }));
      showToast(isSpan ? "Spangram!" : "+1 word");
      playSound("ding");
    } else if (sel.length >= 4 && !toFind.includes(word) && isValidNonThemeWord(word)) {
      flashCells(sel);
      playSound("tick");
      setProgress((p) =>
        p.nonThemeWords.includes(word) ? p : { ...p, nonThemeWords: [...p.nonThemeWords, word] },
      );
    }
    applySel([]);
  };

  const cellFromPoint = (x: number, y: number): number => {
    const el = gridRef.current;
    if (!el) return -1;
    const r = el.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
    const col = Math.floor(((x - r.left) / r.width) * COLS);
    const row = Math.floor(((y - r.top) / r.height) * ROWS);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return -1;
    return row * COLS + col;
  };

  // Move-phase hit detection: tight hitbox for straight neighbors, generous for diagonals.
  const cellFromMove = (x: number, y: number, lastCell: number): number => {
    const el = gridRef.current;
    if (!el) return -1;
    const r = el.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
    const cellW = r.width / COLS;
    const cellH = r.height / ROWS;
    const col = Math.floor((x - r.left) / cellW);
    const row = Math.floor((y - r.top) / cellH);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return -1;
    const candidate = row * COLS + col;
    if (candidate === lastCell) return candidate;
    const cx = r.left + (col + 0.5) * cellW;
    const cy = r.top + (row + 0.5) * cellH;
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    const lastRow = Math.floor(lastCell / COLS);
    const lastCol = lastCell % COLS;
    const isDiagonal = lastRow !== row && lastCol !== col;
    const xThresh = (isDiagonal ? 0.55 : 0.30) * cellW;
    const yThresh = (isDiagonal ? 0.55 : 0.30) * cellH;
    if (dx < xThresh && dy < yThresh) return candidate;
    return -1;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (won) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (cell < 0) return;
    e.preventDefault();

    const sel = selRef.current;
    if (sel.length >= 2 && cell === sel[sel.length - 1]) {
      doSubmit();
      return;
    }
    if (sel.length >= 1 && cell === sel[0]) {
      applySel([]);
      return;
    }
    const at = sel.indexOf(cell);
    if (at >= 0) applySel(sel.slice(0, at + 1));
    else if (sel.length === 0) applySel([cell]);
    else if (adjacent(cell, sel[sel.length - 1])) applySel([...sel, cell]);
    else applySel([cell]);

    const g = { dragged: false };
    const move = (ev: PointerEvent) => {
      const s = selRef.current;
      if (s.length === 0) return;
      const c = cellFromMove(ev.clientX, ev.clientY, s[s.length - 1]);
      if (c < 0) return;
      if (s.length >= 2 && c === s[s.length - 2]) {
        applySel(s.slice(0, -1));
        g.dragged = true;
        return;
      }
      if (s.indexOf(c) >= 0) return;
      if (adjacent(c, s[s.length - 1])) {
        applySel([...s, c]);
        g.dragged = true;
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (g.dragged && selRef.current.length >= 2) doSubmit();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const useHint = () => {
    if (hintsAvailable <= 0 || won) return;
    const unfound = toFind.filter((w) => !progress.found.includes(w));
    if (unfound.length === 0) return;
    const fresh = unfound.filter((w) => !progress.hintedWords.includes(w));
    const pick = fresh[0] ?? unfound[0];
    playSound("click");
    setProgress((p) => ({
      ...p,
      hintsUsed: p.hintsUsed + 1,
      hintedWords: p.hintedWords.includes(pick) ? p.hintedWords : [...p.hintedWords, pick],
    }));
  };

  const reset = () => {
    playSound("click");
    setProgress(EMPTY);
    applySel([]);
    setFlash(null);
    try {
      localStorage.removeItem(`wordstrands:${dateKey}`);
    } catch {
      /* ignore */
    }
  };

  const center = (i: number): [number, number] => [(i % COLS + 0.5) * 100, (Math.floor(i / COLS) + 0.5) * 100];
  const lineCells = flash ?? selection;
  const lineColor = flash ? C_AMBER : "#9CA3AF";
  const selectionWord = selection.map(letterAt).join("");

  const tileStyle = (i: number): { bg: string; fg: string; border: string } => {
    if (flashSet.has(i)) return { bg: C_AMBER, fg: "#fff", border: C_AMBER };
    const fc = foundColor.get(i);
    if (fc) return { bg: fc, fg: "#fff", border: fc };
    if (selSet.has(i)) return { bg: C_SELECT, fg: "#001A33", border: "#001A33" };
    if (hintCells.has(i)) return { bg: C_HINT, fg: "#001A33", border: "#5EEAD4" };
    return { bg: "#fff", fg: "#001A33", border: "#E5E0D8" };
  };

  return (
    <div>
      <style>{`
        @keyframes wsToast {
          0% { opacity: 0; transform: translate(-50%, 8px); }
          18% { opacity: 1; transform: translate(-50%, 0); }
          80% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -12px); }
        }
        @keyframes wsFall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(460px) rotate(540deg); opacity: 0; }
        }
        @keyframes wsPulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Date */}
      <p className="text-xs text-center mb-3" style={{ color: "#9CA3AF" }}>
        Today&apos;s puzzle · {dateLabelFromKey(dateKey)}
      </p>

      {/* Theme clue banner */}
      <div
        className="rounded text-center mb-5"
        style={{ backgroundColor: "#DBEAFE", border: "1px solid #BFDBFE", padding: "10px 14px" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#3B82F6" }}>
          Today&apos;s theme
        </p>
        <p className="text-base font-bold" style={{ color: "#001A33" }}>{puzzle.themeClue}</p>
      </div>

      {/* Grid */}
      <div
        style={{ position: "relative", maxWidth: `${COLS * 55}px`, margin: "0 auto" }}
      >
        <div
          ref={gridRef}
          onPointerDown={handlePointerDown}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            aspectRatio: `${COLS} / ${ROWS}`,
            touchAction: "none",
            userSelect: "none",
            animation: won ? "wsPulse 0.6s ease" : "none",
          }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const { bg, fg, border } = tileStyle(i);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16%" }}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    backgroundColor: bg,
                    border: `1.5px solid ${border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "min(4.6vw, 20px)",
                      fontWeight: 700,
                      color: fg,
                      transition: "color 0.15s ease",
                    }}
                  >
                    {letterAt(i)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting line */}
        {lineCells.length >= 2 && (
          <svg
            viewBox={`0 0 ${COLS * 100} ${ROWS * 100}`}
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <polyline
              points={lineCells.map((i) => center(i).join(",")).join(" ")}
              fill="none"
              stroke={lineColor}
              strokeWidth="22"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.55"
            />
            {lineCells.map((i) => {
              const [x, y] = center(i);
              return <circle key={i} cx={x} cy={y} r="11" fill={lineColor} opacity="0.6" />;
            })}
          </svg>
        )}

        {/* Toast */}
        {toast && (
          <div
            key={toast.key}
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              padding: "5px 13px",
              borderRadius: "9999px",
              backgroundColor: toast.msg === "Spangram!" ? C_SPAN : C_THEME,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              pointerEvents: "none",
              animation: "wsToast 1.4s ease forwards",
            }}
          >
            {toast.msg}
          </div>
        )}

        {/* Confetti on win */}
        {won && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: 18 }, (_, i) => {
              const colors = [C_THEME, C_SPAN, "#0D9488", "#001A33"];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${(i * 5.5 + 4) % 100}%`,
                    width: 8,
                    height: 8,
                    borderRadius: i % 2 ? "50%" : "1px",
                    backgroundColor: colors[i % colors.length],
                    animation: `wsFall ${1.6 + (i % 5) * 0.22}s ease-in ${(i % 6) * 0.13}s forwards`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Selection readout */}
      {selection.length > 0 && !won && (
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="text-sm font-bold tracking-wider" style={{ color: "#001A33" }}>
            {selectionWord || "·"}
          </span>
          <button
            onClick={doSubmit}
            className="text-xs font-semibold rounded"
            style={{ backgroundColor: "#001A33", color: "#fff", padding: "6px 12px" }}
          >
            Submit
          </button>
          <button
            onClick={() => applySel([])}
            className="text-xs font-semibold rounded"
            style={{ backgroundColor: "#F0EDE6", color: "#4A5568", padding: "6px 12px" }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Progress */}
      <p className="text-sm text-center mt-4 mb-2" style={{ color: "#4A5568" }}>
        <strong style={{ color: "#001A33" }}>{progress.found.length}</strong> of{" "}
        <strong style={{ color: "#001A33" }}>{toFind.length}</strong> theme words found
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {toFind.map((w) => {
          const got = progress.found.includes(w);
          const isSpan = w === puzzle.spangram;
          const accent = isSpan ? C_SPAN : C_THEME;
          return (
            <span
              key={w}
              className="text-xs font-semibold rounded"
              style={{
                padding: "4px 8px",
                backgroundColor: got ? `${accent}1A` : "#F0EDE6",
                color: got ? accent : "#9CA3AF",
                border: `1px solid ${got ? `${accent}55` : "#E5E0D8"}`,
                letterSpacing: got ? "0" : "2px",
              }}
            >
              {got ? w : "·".repeat(w.length)}
              {isSpan && <span style={{ marginLeft: 4, fontSize: 9 }}>★</span>}
            </span>
          );
        })}
      </div>

      {/* Hints + reset */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-sm font-medium" style={{ color: "#4A5568" }}>
          Hints: <strong style={{ color: "#001A33" }}>{hintsAvailable}</strong>
        </span>
        <button
          onClick={useHint}
          disabled={hintsAvailable <= 0 || won}
          className="flex items-center gap-1.5 text-xs font-semibold rounded"
          style={{
            padding: "8px 12px",
            minHeight: "36px",
            backgroundColor: hintsAvailable > 0 && !won ? "#0D948814" : "#F0EDE6",
            color: hintsAvailable > 0 && !won ? "#0D9488" : "#9CA3AF",
            border: `1px solid ${hintsAvailable > 0 && !won ? "#0D948840" : "#E5E0D8"}`,
            cursor: hintsAvailable > 0 && !won ? "pointer" : "default",
          }}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Use hint
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs font-semibold rounded"
          style={{
            padding: "8px 12px",
            minHeight: "36px",
            backgroundColor: "#F0EDE6",
            color: "#4A5568",
            border: "1px solid #E5E0D8",
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset puzzle
        </button>
      </div>
      <p className="text-xs text-center mt-2" style={{ color: "#9CA3AF" }}>
        Find a real word (4+ letters) that isn&apos;t in the theme. 3 of them earns you a hint.
      </p>

      {/* Win */}
      {won && (
        <div
          className="rounded p-4 mt-4 text-center"
          style={{ backgroundColor: `${C_THEME}10`, border: `1px solid ${C_THEME}30` }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: C_THEME }}>
            Nice. You found all {toFind.length}, spangram included.
          </p>
          <p className="text-xs" style={{ color: "#4A5568" }}>
            Come back tomorrow for a new puzzle.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WordStrandsPage() {
  const [mounted, setMounted] = useState(false);
  const [dateKey, setDateKey] = useState("");

  useEffect(() => {
    setMounted(true);
    setDateKey(nyDateKey());
    const id = setInterval(() => {
      const k = nyDateKey();
      setDateKey((prev) => (prev !== k ? k : prev));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F7F2" }}>
      <header
        className="flex items-center px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#E5E0D8", backgroundColor: "#F9F7F2" }}
      >
        <Link
          href="/labs/sleep#games"
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: "#4A5568" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1 text-center">
          <span className="font-bold" style={{ color: "#001A33" }}>Word Strands</span>
        </div>
        <span style={{ width: 52 }} />
      </header>

      <main className="flex-1">
        <div className="max-w-md mx-auto px-6 py-8">
          <p className="text-sm text-center mb-6" style={{ color: "#4A5568" }}>
            Find the theme words. Use every letter. One puzzle a day.
          </p>
          {mounted && dateKey && <StrandsGame key={dateKey} dateKey={dateKey} />}
        </div>
      </main>
    </div>
  );
}

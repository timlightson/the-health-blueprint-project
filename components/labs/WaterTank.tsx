"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ─── WaterTank — canvas-rendered liquid ──────────────────────────────────────
// Real animated water: two overlapping surface waves, depth gradient, rising
// bubbles, a glass highlight. The surface sloshes harder when the level moves
// fast (or when you grab it). No SVG anywhere; it's all painted per frame.

interface Bubble { x: number; y: number; r: number; v: number; wob: number }

const ZONES: Record<string, [string, string]> = {
  good: ["#67E8F9", "#0E7490"],
  warn: ["#FDE68A", "#B45309"],
  bad: ["#FCA5A5", "#B91C1C"],
};

export default function WaterTank({
  level, // 0..1 how full
  zone = "good",
  interactive = false,
  onLevel,
  width = 150,
  height = 230,
  ariaLabel,
}: {
  level: number;
  zone?: "good" | "warn" | "bad";
  interactive?: boolean;
  onLevel?: (v: number) => void;
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const state = useRef({ level, shown: level, amp: 0, t: 0, zone, bubbles: [] as Bubble[] });
  const reduced = useReducedMotion();

  state.current.level = level;
  state.current.zone = zone;

  const paint = useCallback((once = false) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== width * dpr) { cv.width = width * dpr; cv.height = height * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = state.current;

    // smooth level + slosh energy
    const diff = s.level - s.shown;
    s.shown += diff * 0.08;
    s.amp = Math.min(9, s.amp * 0.96 + Math.abs(diff) * 26);
    s.t += 0.035;

    const [cTop, cBot] = ZONES[s.zone] ?? ZONES.good;
    const surface = height * (1 - (0.06 + s.shown * 0.88));
    const baseAmp = reduced ? 0 : 1.6 + s.amp;

    ctx.clearRect(0, 0, width, height);

    // water body
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, surface);
    for (let x = 0; x <= width; x += 3) {
      const y =
        surface +
        Math.sin(x * 0.055 + s.t * 2.1) * baseAmp +
        Math.sin(x * 0.021 - s.t * 1.4) * baseAmp * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, surface, 0, height);
    grad.addColorStop(0, cTop + "E6");
    grad.addColorStop(1, cBot);
    ctx.fillStyle = grad;
    ctx.fill();

    // surface glint
    ctx.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y =
        surface +
        Math.sin(x * 0.055 + s.t * 2.1) * baseAmp +
        Math.sin(x * 0.021 - s.t * 1.4) * baseAmp * 0.6;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    if (!reduced) {
      // bubbles
      if (Math.random() < 0.14 && s.shown > 0.08) {
        s.bubbles.push({ x: 12 + Math.random() * (width - 24), y: height - 6, r: 1 + Math.random() * 2.6, v: 0.35 + Math.random() * 0.7, wob: Math.random() * 6 });
      }
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      s.bubbles = s.bubbles.filter((b) => {
        b.y -= b.v;
        b.x += Math.sin(s.t * 3 + b.wob) * 0.25;
        if (b.y < surface + 4) return false;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
    }

    // glass side highlight
    const hl = ctx.createLinearGradient(0, 0, width * 0.35, 0);
    hl.addColorStop(0, "rgba(255,255,255,0.34)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(4, 8, width * 0.3, height - 16);

    if (!once) raf.current = requestAnimationFrame(() => paint());
  }, [width, height, reduced]);

  useEffect(() => {
    if (reduced) { paint(true); return; }
    raf.current = requestAnimationFrame(() => paint());
    return () => cancelAnimationFrame(raf.current);
  }, [paint, reduced]);

  // redraw once on level change when reduced motion is on
  useEffect(() => { if (reduced) { state.current.shown = level; paint(true); } }, [level, reduced, paint]);

  const setFromY = (clientY: number) => {
    const cv = canvasRef.current;
    if (!cv || !onLevel) return;
    const r = cv.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, 1 - (clientY - r.top - 12) / (r.height - 24)));
    onLevel(v);
  };

  const down = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* synthetic */ }
    setFromY(e.clientY);
    const move = (ev: PointerEvent) => setFromY(ev.clientY);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const key = (e: React.KeyboardEvent) => {
    if (!interactive || !onLevel) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      onLevel(Math.min(1, Math.max(0, level + (e.key === "ArrowUp" ? 0.04 : -0.04))));
    }
  };

  return (
    <div
      onPointerDown={down}
      onKeyDown={key}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? "slider" : undefined}
      aria-label={ariaLabel}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? Math.round(level * 100) : undefined}
      style={{
        width, height,
        borderRadius: 34,
        overflow: "hidden",
        position: "relative",
        cursor: interactive ? "ns-resize" : "default",
        touchAction: "none",
        background: "linear-gradient(160deg, rgba(255,255,255,0.55), rgba(226,232,244,0.35))",
        border: "2px solid rgba(255,255,255,0.85)",
        boxShadow: "inset 0 2px 6px rgba(20,30,60,0.18), inset 0 -8px 18px -8px rgba(20,30,60,0.2), 0 16px 34px -14px rgba(20,30,60,0.35)",
      }}
    >
      <canvas ref={canvasRef} style={{ width, height, display: "block" }} aria-hidden="true" />
      {/* cap */}
      <div aria-hidden style={{ position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", width: 46, height: 12, borderRadius: "0 0 10px 10px", background: "linear-gradient(180deg, rgba(148,163,184,0.65), rgba(203,213,225,0.4))" }} />
    </div>
  );
}

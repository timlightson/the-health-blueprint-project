"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ─── EnergyGlowChart — canvas "monitor" rendering of the day's energy curve ──
// Dark panel, glowing gradient trace, a pulse that rides the curve like a
// heartbeat monitor. Replaces the flat SVG hero chart.

const W = 720, H = 250, PADL = 40, PADR = 16, PADT = 22, PADB = 40;
const PLOTW = W - PADL - PADR, PLOTH = H - PADT - PADB;

export default function EnergyGlowChart({
  curve, peakT, minT, startH, endH, step, eMax,
}: {
  curve: number[]; peakT: number; minT: number;
  startH: number; endH: number; step: number; eMax: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const phase = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hx = (t: number) => PADL + ((t - startH) / (endH - startH)) * PLOTW;
    const hy = (e: number) => PADT + (1 - Math.max(0, Math.min(eMax, e)) / eMax) * PLOTH;
    const pts = curve.map((e, i) => ({ x: hx(startH + i * step), y: hy(e) }));
    const idxFor = (t: number) => Math.max(0, Math.min(curve.length - 1, Math.round((t - startH) / step)));
    const HOURS = [6, 9, 12, 15, 18, 21, 24];

    const grad = ctx.createLinearGradient(0, PADT, 0, PADT + PLOTH);
    grad.addColorStop(0, "#2DD4BF");
    grad.addColorStop(0.55, "#FBBF24");
    grad.addColorStop(0.85, "#F87171");
    grad.addColorStop(1, "#F87171");

    const trace = () => {
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // circadian dip band
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      ctx.fillRect(hx(13.5), PADT, hx(15.5) - hx(13.5), PLOTH);

      // grid
      ctx.strokeStyle = "rgba(148,163,184,0.14)";
      ctx.lineWidth = 1;
      for (const h of HOURS) {
        ctx.beginPath(); ctx.moveTo(hx(h), PADT); ctx.lineTo(hx(h), PADT + PLOTH); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(148,163,184,0.3)";
      ctx.beginPath(); ctx.moveTo(PADL, PADT + PLOTH); ctx.lineTo(PADL + PLOTW, PADT + PLOTH); ctx.stroke();

      // area fill
      trace();
      ctx.lineTo(hx(endH), PADT + PLOTH); ctx.lineTo(hx(startH), PADT + PLOTH); ctx.closePath();
      ctx.globalAlpha = 0.16; ctx.fillStyle = grad; ctx.fill(); ctx.globalAlpha = 1;

      // glow pass + crisp pass
      trace();
      ctx.strokeStyle = grad; ctx.lineWidth = 7; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.shadowColor = "rgba(45,212,191,0.55)"; ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
      trace();
      ctx.lineWidth = 2.6; ctx.stroke();

      // labels
      ctx.font = "600 11px Inter, sans-serif";
      ctx.fillStyle = "#2DD4BF"; ctx.fillText("Fresh", 6, PADT + 10);
      ctx.fillStyle = "#F87171"; ctx.fillText("Tired", 6, PADT + PLOTH - 3);
      ctx.fillStyle = "rgba(148,163,184,0.75)";
      ctx.textAlign = "center";
      for (const h of HOURS) {
        ctx.fillText(h === 24 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`, hx(h), H - 12);
      }

      // peak + low markers
      const mark = (t: number, color: string, label: string, above: boolean) => {
        const p = pts[idxFor(t)];
        ctx.shadowColor = color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2.5; ctx.strokeStyle = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = color; ctx.font = "700 11px Inter, sans-serif";
        ctx.fillText(label, p.x, above ? p.y - 12 : p.y + 22);
      };
      mark(peakT, "#2DD4BF", "peak", true);
      mark(minT, "#F87171", "low", false);

      // riding pulse
      if (!reduced) {
        phase.current = (phase.current + 0.0022) % 1;
        const p = pts[Math.floor(phase.current * (pts.length - 1))];
        ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.textAlign = "left";

      if (!reduced) raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [curve, peakT, minT, startH, endH, step, eMax, reduced]);

  return (
    <div style={{ borderRadius: 18, padding: "10px 6px 2px", background: "radial-gradient(130% 110% at 50% 0%, #0F1B2E 0%, #060B16 75%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <canvas ref={ref} style={{ width: "100%", display: "block" }} aria-label="Your energy curve across the day" role="img" />
    </div>
  );
}

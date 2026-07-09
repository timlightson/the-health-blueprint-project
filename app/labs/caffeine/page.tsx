"use client";

import { useState, useRef, useMemo } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#B45309";
const HALF_LIFE = 5;
const THRESH = 50;

const DRINKS = [
  { id: "coffee", label: "Coffee", mg: 95, emoji: "☕" },
  { id: "energy", label: "Energy drink", mg: 160, emoji: "⚡" },
  { id: "tea", label: "Tea", mg: 47, emoji: "🍵" },
  { id: "soda", label: "Soda", mg: 40, emoji: "🥤" },
];

function fmtHour(h: number) {
  const hh = Math.floor(h), m = Math.round((h - hh) * 60);
  const ap = hh >= 12 && hh < 24 ? "PM" : "AM";
  let d = hh % 12; if (d === 0) d = 12;
  return m ? `${d}:${m.toString().padStart(2, "0")} ${ap}` : `${d} ${ap}`;
}

const VW = 320, VH = 158, PADL = 30, PADR = 12, PADT = 12, PADB = 30;
const H0 = 6, H1 = 24;

interface Placed { id: number; mg: number; hour: number; emoji: string }
let seq = 0;

export default function CaffeineLab() {
  const [placed, setPlaced] = useState<Placed[]>([{ id: ++seq, mg: 95, hour: 15, emoji: "☕" }]);
  const [armed, setArmed] = useState<string | null>(null);
  const [bedH, setBedH] = useState(22.5);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const level = (h: number) => placed.reduce((s, d) => s + (h >= d.hour ? d.mg * Math.pow(0.5, (h - d.hour) / HALF_LIFE) : 0), 0);
  const atBed = Math.round(level(bedH));
  const totalMg = placed.reduce((s, d) => s + d.mg, 0);
  const yMax = Math.max(160, ...placed.map((d) => d.mg), totalMg * 0.5);

  const xFor = (h: number) => PADL + ((h - H0) / (H1 - H0)) * (VW - PADL - PADR);
  const yFor = (mg: number) => PADT + (1 - mg / yMax) * (VH - PADT - PADB);

  const path = useMemo(() => {
    let d = "";
    for (let h = H0; h <= H1; h += 0.5) d += `${h === H0 ? "M" : "L"} ${xFor(h).toFixed(1)} ${yFor(level(h)).toFixed(1)} `;
    return d;
  }, [placed, yMax]);
  const area = `${path} L ${xFor(H1).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(H0).toFixed(1)} ${yFor(0).toFixed(1)} Z`;

  const hourFromClient = (clientX: number): number => {
    const el = wrapRef.current; if (!el) return H0;
    const r = el.getBoundingClientRect();
    const frac = clamp((clientX - r.left) / r.width, 0, 1);
    const vx = frac * VW;
    return clamp(Math.round((H0 + ((vx - PADL) / (VW - PADL - PADR)) * (H1 - H0)) * 2) / 2, H0, H1);
  };

  const onPlot = (e: React.PointerEvent) => {
    if (!armed) return;
    const drink = DRINKS.find((d) => d.id === armed)!;
    setPlaced((p) => [...p, { id: ++seq, mg: drink.mg, hour: hourFromClient(e.clientX), emoji: drink.emoji }]);
    setArmed(null);
  };
  const removeDrink = (id: number) => setPlaced((p) => p.filter((d) => d.id !== id));

  const startBedDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragging.current = true;
    const move = (ev: PointerEvent) => { if (dragging.current) setBedH(clamp(hourFromClient(ev.clientX), 19, 24)); };
    const up = () => { dragging.current = false; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const zone = atBed < 25 ? { label: "Clear enough to sleep", color: "#0E8A7D" } : atBed < 75 ? { label: "Still buzzing at bedtime", color: "#C9760F" } : { label: "Wired at bedtime", color: "#D8443B" };

  return (
    <LabShell lab="caffeine" badge={{ color: zone.color, text: `${atBed} mg @ bed` }}>
      <LabHero
        kicker="Caffeine Blueprint · 08"
        title="It stays longer than the buzz"
        subtitle="Caffeine fades in slow steps, not all at once. Tap a drink, drop it on your day, then drag your bedtime and see how much is still working while you sleep."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="text-center mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>Still in you at {fmtHour(bedH)}</p>
          <div className="text-4xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em" }}>{atBed} mg</div>
          <p className="text-sm font-semibold mt-0.5" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* Interactive timeline */}
        <div ref={wrapRef} onPointerDown={onPlot} style={{ position: "relative", cursor: armed ? "copy" : "default", touchAction: "none" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: "block" }}>
            <defs>
              <linearGradient id="caf-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={ACCENT} stopOpacity="0.28" />
                <stop offset="1" stopColor={ACCENT} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1={PADL} y1={yFor(THRESH)} x2={VW - PADR} y2={yFor(THRESH)} stroke="#D8443B" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <text x={VW - PADR} y={yFor(THRESH) - 3} textAnchor="end" fontSize="7.5" fill="#D8443B" opacity="0.8">sleep starts to suffer</text>
            <line x1={PADL} y1={yFor(0)} x2={VW - PADR} y2={yFor(0)} stroke="rgba(11,26,43,0.18)" strokeWidth="1" />
            <path d={area} fill="url(#caf-fill)" />
            <path d={path} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
            {/* placed drink markers */}
            {placed.map((d) => (
              <g key={d.id} style={{ cursor: "pointer" }} onPointerDown={(e) => { e.stopPropagation(); removeDrink(d.id); }}>
                <line x1={xFor(d.hour)} y1={yFor(0)} x2={xFor(d.hour)} y2={yFor(d.mg)} stroke={ACCENT} strokeWidth="1" opacity="0.4" />
                <circle cx={xFor(d.hour)} cy={yFor(d.mg)} r="9" fill="#fff" stroke={ACCENT} strokeWidth="1.5" />
                <text x={xFor(d.hour)} y={yFor(d.mg) + 3.5} textAnchor="middle" fontSize="10">{d.emoji}</text>
              </g>
            ))}
            {/* bedtime flag (draggable) */}
            <g onPointerDown={startBedDrag} style={{ cursor: "grab" }}>
              <line x1={xFor(bedH)} y1={PADT} x2={xFor(bedH)} y2={yFor(0)} stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.55" />
              <rect x={xFor(bedH) - 12} y={PADT - 2} width="24" height="15" rx="4" fill="var(--ink)" />
              <text x={xFor(bedH)} y={PADT + 8.5} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">bed</text>
              <circle cx={xFor(bedH)} cy={yFor(atBed)} r="5" fill="#fff" stroke={zone.color} strokeWidth="2.5" />
            </g>
            {[6, 12, 18, 24].map((h) => (
              <text key={h} x={xFor(h)} y={VH - 8} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">
                {h === 24 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
              </text>
            ))}
          </svg>
        </div>

        {/* Drink palette */}
        <p className="text-xs font-semibold uppercase tracking-wider mt-4 mb-2" style={{ color: "var(--ink-soft)" }}>
          {armed ? "Now tap your day to drop it" : "Tap a drink, then tap your day"}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DRINKS.map((d) => {
            const on = armed === d.id;
            return (
              <button key={d.id} onClick={() => setArmed(on ? null : d.id)} aria-pressed={on}
                className="rounded-2xl py-3 lg-pill flex flex-col items-center gap-1"
                style={{ background: on ? `${ACCENT}18` : undefined, borderColor: on ? `${ACCENT}66` : undefined }}>
                <span className="text-xl">{d.emoji}</span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--ink)" }}>{d.label}</span>
                <span className="text-[10px]" style={{ color: "var(--ink-faint)" }}>{d.mg}mg</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>Tap a cup on the graph to remove it. Drag the bed flag to change bedtime.</p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~5 hr" label="to clear half of what you drank" accent={ACCENT} />
        <StatTile value="~10 hr" label="until it's down to a quarter" accent={ACCENT} />
        <StatTile value="6 hr" label="before bed is still enough to cost you sleep" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Caffeine works by blocking adenosine, the molecule that builds up all day and makes you sleepy. It leaves in halves: about half gone every five hours, then half of that, so an afternoon cup can still be blocking sleep signals near midnight."
        points={[
          { text: "Caffeine's half-life averages about 5 hours in healthy adults and varies with genetics", cite: "Institute of Medicine, 2001; Nehlig, Pharmacol Rev 2018" },
          { text: "A 400 mg dose even 6 hours before bed measurably cut total sleep time", cite: "Drake et al., J Clin Sleep Med 2013" },
          { text: "Pediatric guidance is that adolescents limit or avoid caffeine, partly for sleep", cite: "American Academy of Pediatrics, 2011" },
        ]}
        sources="A simplified decay model. Real clearance depends on your body and what else you've had."
      />
    </LabShell>
  );
}

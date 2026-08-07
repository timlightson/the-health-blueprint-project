"use client";

import { useState, useRef } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#B45309";
const HALF_LIFE = 5;

const DRINKS = [
  { id: "coffee", label: "Coffee", mg: 95 },
  { id: "energy", label: "Energy drink", mg: 160 },
  { id: "tea", label: "Tea", mg: 47 },
  { id: "soda", label: "Soda", mg: 40 },
] as const;
type DrinkKind = (typeof DRINKS)[number]["id"];

function DrinkIcon({ kind, size = 25 }: { kind: DrinkKind; size?: number }) {
  if (kind === "energy") return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true"><rect x="7" y="3" width="14" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="m16 7-5 8h4l-2 7 6-9h-4z" fill="currentColor"/></svg>
  );
  if (kind === "tea") return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true"><path d="M5 9h15v7a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7zM20 11h2a3 3 0 0 1 0 6h-2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 9c0-3 2-5 5-5-1 3-2 5-5 5Z" fill="currentColor"/></svg>
  );
  if (kind === "soda") return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true"><path d="m8 8 2 17h9l2-17zM7 8h15M16 8l2-5h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M10 13h9" stroke="currentColor" strokeWidth="1.7"/></svg>
  );
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true"><path d="M5 8h15v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7zM20 11h2.5a3 3 0 0 1 0 6H20M9 4c0 2 2 2 2 4M15 4c0 2 2 2 2 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  );
}

function DrinkMarker({ kind, x, y }: { kind: DrinkKind; x: number; y: number }) {
  return <g transform={`translate(${x - 7} ${y - 7}) scale(.5)`} style={{ color: "#FDE68A" }}><foreignObject width="28" height="28"><DrinkIcon kind={kind} size={28} /></foreignObject></g>;
}

function fmtHour(h: number) {
  const hh = Math.floor(h), m = Math.round((h - hh) * 60);
  const ap = hh >= 12 && hh < 24 ? "PM" : "AM";
  let d = hh % 12; if (d === 0) d = 12;
  return m ? `${d}:${m.toString().padStart(2, "0")} ${ap}` : `${d} ${ap}`;
}

const VW = 320, VH = 158, PADL = 30, PADR = 12, PADT = 12, PADB = 30;
const H0 = 6, H1 = 24;

interface Placed { id: number; mg: number; hour: number; kind: DrinkKind }
let seq = 0;

export default function CaffeineLab() {
  const [placed, setPlaced] = useState<Placed[]>([{ id: ++seq, mg: 95, hour: 15, kind: "coffee" }]);
  const [armed, setArmed] = useState<DrinkKind | null>(null);
  const [placementH, setPlacementH] = useState(15);
  const [bedH, setBedH] = useState(22.5);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const level = (h: number) => placed.reduce((s, d) => s + (h >= d.hour ? d.mg * Math.pow(0.5, (h - d.hour) / HALF_LIFE) : 0), 0);
  const atBed = Math.round(level(bedH));
  const totalMg = placed.reduce((s, d) => s + d.mg, 0);
  const yMax = Math.max(160, ...placed.map((d) => d.mg), totalMg * 0.5);

  const xFor = (h: number) => PADL + ((h - H0) / (H1 - H0)) * (VW - PADL - PADR);
  const yFor = (mg: number) => PADT + (1 - mg / yMax) * (VH - PADT - PADB);

  const path = (() => {
    let d = "";
    for (let h = H0; h <= H1; h += 0.5) d += `${h === H0 ? "M" : "L"} ${xFor(h).toFixed(1)} ${yFor(level(h)).toFixed(1)} `;
    return d;
  })();
  const area = `${path} L ${xFor(H1).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(H0).toFixed(1)} ${yFor(0).toFixed(1)} Z`;

  const hourFromClient = (clientX: number): number => {
    const el = wrapRef.current; if (!el) return H0;
    const r = el.getBoundingClientRect();
    const frac = clamp((clientX - r.left) / r.width, 0, 1);
    const vx = frac * VW;
    return clamp(Math.round((H0 + ((vx - PADL) / (VW - PADL - PADR)) * (H1 - H0)) * 2) / 2, H0, H1);
  };

  const addDrinkAt = (kind: DrinkKind, hour: number) => {
    const drink = DRINKS.find((d) => d.id === kind)!;
    setPlaced((p) => [...p, { id: ++seq, mg: drink.mg, hour, kind: drink.id }]);
    setArmed(null);
  };
  const onPlot = (e: React.PointerEvent) => {
    if (!armed) return;
    addDrinkAt(armed, hourFromClient(e.clientX));
  };
  const removeDrink = (id: number) => setPlaced((p) => p.filter((d) => d.id !== id));

  const startBedDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragging.current = true;
    const move = (ev: PointerEvent) => { if (dragging.current) setBedH(clamp(hourFromClient(ev.clientX), 19, 24)); };
    const up = () => { dragging.current = false; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const zone = atBed < 25 ? { label: "Low modeled remainder", color: "#0E8A7D" } : atBed < 75 ? { label: "Moderate modeled remainder", color: "#C9760F" } : { label: "High modeled remainder", color: "#D8443B" };

  return (
    <LabShell lab="caffeine" badge={{ color: zone.color, text: `${atBed} mg @ bed` }}>
      <LabHero
        lab="caffeine"
        kicker="Caffeine Blueprint · 08"
        title="It stays longer than the buzz"
        subtitle="Caffeine fades in slow steps, not all at once. Tap a drink, drop it on your day, then drag your bedtime and see how much is still working while you sleep."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px", overflow: "hidden" }}>
        <div className="caffeine-stage">
          <div className="caffeine-stage-head">
            <div><span>ACTIVE AT {fmtHour(bedH)}</span><strong style={{ color: zone.color }}>{zone.label}</strong></div>
            <div><strong style={{ color: zone.color }}>{atBed}</strong><span>MG</span></div>
          </div>

          {/* Interactive timeline */}
          <div ref={wrapRef} onPointerDown={onPlot} className="caffeine-chart" style={{ cursor: armed ? "copy" : "default", touchAction: "none" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: "block" }} role="img" aria-label={`Caffeine clearance curve from 6 AM to midnight. ${atBed} milligrams estimated at ${fmtHour(bedH)}.`}>
            <defs>
              <linearGradient id="caf-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F59E0B" stopOpacity="0.42" />
                <stop offset="1" stopColor="#F59E0B" stopOpacity="0.025" />
              </linearGradient>
              <filter id="caf-glow"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {[.25,.5,.75].map((n)=><line key={n} x1={PADL} y1={PADT+(VH-PADT-PADB)*n} x2={VW-PADR} y2={PADT+(VH-PADT-PADB)*n} stroke="rgba(255,255,255,.07)" />)}
            <line x1={PADL} y1={yFor(0)} x2={VW - PADR} y2={yFor(0)} stroke="rgba(255,255,255,.2)" strokeWidth="1" />
            <path d={area} fill="url(#caf-fill)" />
            <path d={path} fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" filter="url(#caf-glow)" />
            {/* placed drink markers */}
            {placed.map((d) => (
              <g key={d.id} style={{ cursor: "pointer" }} onPointerDown={(e) => { e.stopPropagation(); removeDrink(d.id); }}>
                <line x1={xFor(d.hour)} y1={yFor(0)} x2={xFor(d.hour)} y2={yFor(d.mg)} stroke="#FBBF24" strokeWidth="1" opacity="0.38" />
                <circle cx={xFor(d.hour)} cy={yFor(d.mg)} r="9" fill="#1D2532" stroke="#FBBF24" strokeWidth="1.5" />
                <DrinkMarker kind={d.kind} x={xFor(d.hour)} y={yFor(d.mg)} />
              </g>
            ))}
            {/* bedtime flag (draggable) */}
            <g onPointerDown={startBedDrag} style={{ cursor: "grab" }}>
              <line x1={xFor(bedH)} y1={PADT} x2={xFor(bedH)} y2={yFor(0)} stroke="#E2E8F0" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.6" />
              <rect x={xFor(bedH) - 12} y={PADT - 2} width="24" height="15" rx="4" fill="#E2E8F0" />
              <text x={xFor(bedH)} y={PADT + 8.5} textAnchor="middle" fontSize="8" fill="#111827" fontWeight="700">bed</text>
              <circle cx={xFor(bedH)} cy={yFor(atBed)} r="5" fill="#111827" stroke={zone.color} strokeWidth="2.5" />
            </g>
            {[6, 12, 18, 24].map((h) => (
              <text key={h} x={xFor(h)} y={VH - 8} textAnchor="middle" fontSize="8" fill="#94A3B8">
                {h === 24 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
              </text>
            ))}
          </svg>
          </div>
          <p className="caffeine-stage-hint" aria-live="polite">{armed ? "PLACE THE DRINK ON THE TIMELINE" : "DRAG BEDTIME · TAP A MARKER TO REMOVE"}</p>
          <div className="caffeine-bedtime-control">
            <label htmlFor="caffeine-bedtime"><span>Bedtime</span><strong>{fmtHour(bedH)}</strong></label>
            <input id="caffeine-bedtime" type="range" min={19} max={24} step={0.5} value={bedH} onChange={(e) => setBedH(Number(e.target.value))} />
          </div>
        </div>

        {/* Drink palette */}
        <p className="text-xs font-semibold uppercase tracking-wider mt-4 mb-2 px-2" style={{ color: "var(--ink-soft)" }}>
          {armed ? "Now tap your day to drop it" : "Tap a drink, then tap your day"}
        </p>
        <div className="caffeine-palette grid grid-cols-4 gap-2 px-2">
          {DRINKS.map((d) => {
            const on = armed === d.id;
            return (
              <button key={d.id} onClick={() => setArmed(on ? null : d.id)} aria-pressed={on}
                className="caffeine-drink rounded-2xl py-3 lg-pill flex flex-col items-center gap-1"
                style={{ background: on ? `${ACCENT}18` : undefined, borderColor: on ? `${ACCENT}66` : undefined }}>
                <span className="caffeine-drink-icon"><DrinkIcon kind={d.id} /></span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--ink)" }}>{d.label}</span>
                <span className="text-[10px]" style={{ color: "var(--ink-faint)" }}>{d.mg}mg</span>
              </button>
            );
          })}
        </div>
        {placed.length > 0 && (
          <div className="caffeine-placed mx-2 mt-3" aria-label="Placed drinks">
            <span>Placed</span>
            <div>
              {placed.map((d) => {
                const drink = DRINKS.find((item) => item.id === d.kind)!;
                return <button key={d.id} onClick={() => removeDrink(d.id)} aria-label={`Remove ${drink.label} at ${fmtHour(d.hour)}`}>{drink.label} · {fmtHour(d.hour)} <b aria-hidden="true">×</b></button>;
              })}
            </div>
          </div>
        )}
        {armed && (
          <div className="caffeine-keyboard-place mx-2 mt-3">
            <label htmlFor="caffeine-placement-time">
              <span>Placement time</span>
              <strong>{fmtHour(placementH)}</strong>
            </label>
            <input
              id="caffeine-placement-time"
              type="range"
              min={H0}
              max={H1}
              step={0.5}
              value={placementH}
              onChange={(e) => setPlacementH(Number(e.target.value))}
            />
            <button onClick={() => addDrinkAt(armed, placementH)} className="lg-pill rounded-full font-semibold px-4">
              Add at {fmtHour(placementH)}
            </button>
          </div>
        )}
        <p className="text-xs mt-2 px-2" style={{ color: "var(--ink-faint)" }}>Tap a marker or use the placed-drink list to remove it. Drag the bed flag or use the bedtime slider.</p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~5 hr" label="to clear half of what you drank" accent={ACCENT} />
        <StatTile value="~10 hr" label="until it's down to a quarter" accent={ACCENT} />
        <StatTile value="6 hr" label="the timing tested in a 400 mg sleep study" accent={ACCENT} />
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

"use client";

import { useState, useMemo } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, GlassSlider, Chips, StatTile, SciencePanel } from "@/components/labs/kit";

const ACCENT = "#B45309";
const HALF_LIFE = 5; // hours — caffeine's typical half-life
const SLEEP_THRESHOLD = 50; // mg roughly enough to nudge sleep, individual varies

const DRINKS: { value: string; label: string; mg: number }[] = [
  { value: "soda", label: "Soda", mg: 40 },
  { value: "tea", label: "Tea", mg: 47 },
  { value: "coffee", label: "Coffee", mg: 95 },
  { value: "energy", label: "Energy drink", mg: 160 },
];

function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const m = Math.round((h - hh) * 60);
  const ap = hh >= 12 && hh < 24 ? "PM" : "AM";
  let d = hh % 12;
  if (d === 0) d = 12;
  return m ? `${d}:${m.toString().padStart(2, "0")} ${ap}` : `${d} ${ap}`;
}

// Chart geometry
const VW = 320, VH = 156, PADL = 30, PADR = 12, PADT = 12, PADB = 26;
const H0 = 6, H1 = 24;

export default function CaffeineLab() {
  const [dose, setDose] = useState(95);
  const [drinkH, setDrinkH] = useState(15); // 3 PM
  const [bedH, setBedH] = useState(22.5); // 10:30 PM

  const level = (h: number) => (h >= drinkH ? dose * Math.pow(0.5, (h - drinkH) / HALF_LIFE) : 0);
  const atBed = Math.round(level(bedH));
  const yMax = Math.max(140, dose * 1.05);
  const preset = DRINKS.find((d) => d.mg === dose)?.value ?? null;

  const xFor = (h: number) => PADL + ((h - H0) / (H1 - H0)) * (VW - PADL - PADR);
  const yFor = (mg: number) => PADT + (1 - mg / yMax) * (VH - PADT - PADB);

  const path = useMemo(() => {
    let d = "";
    for (let h = H0; h <= H1; h += 0.5) {
      d += `${h === H0 ? "M" : "L"} ${xFor(h).toFixed(1)} ${yFor(level(h)).toFixed(1)} `;
    }
    return d;
  }, [dose, drinkH]);
  const area = `${path} L ${xFor(H1).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(H0).toFixed(1)} ${yFor(0).toFixed(1)} Z`;

  const zone =
    atBed < 25 ? { label: "Clear enough to sleep", color: "#0E8A7D" }
    : atBed < 75 ? { label: "Still buzzing at bedtime", color: "#C9760F" }
    : { label: "Wired at bedtime", color: "#D8443B" };

  const note =
    atBed < 25
      ? "By the time you're in bed, it's mostly gone. Your brain can read the sleep signals without caffeine shouting over them."
      : atBed < 75
      ? "There's still a real dose in your system at lights-out. You might fall asleep, but lighter, with less deep sleep."
      : "That's a full serving still active while you're trying to sleep. Falling asleep gets harder and the sleep you get is thinner.";

  return (
    <LabShell lab="caffeine" badge={{ color: zone.color, text: `${atBed} mg @ bed` }}>
      <LabHero
        kicker="Caffeine Lab · Simulation 08"
        title="It stays longer than the buzz"
        subtitle="Caffeine doesn't just wear off. It has a half-life, so it fades in slow steps. Set your drink and your bedtime, and see how much is still working while you sleep."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="text-center mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            Still in you at {fmtHour(bedH)}
          </p>
          <div className="text-4xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em" }}>
            {atBed} mg
          </div>
          <p className="text-sm font-semibold mt-0.5" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* Decay curve */}
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true" style={{ display: "block" }}>
          <defs>
            <linearGradient id="caf-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ACCENT} stopOpacity="0.28" />
              <stop offset="1" stopColor={ACCENT} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* threshold */}
          <line x1={PADL} y1={yFor(SLEEP_THRESHOLD)} x2={VW - PADR} y2={yFor(SLEEP_THRESHOLD)} stroke="#D8443B" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <text x={VW - PADR} y={yFor(SLEEP_THRESHOLD) - 3} textAnchor="end" fontSize="7.5" fill="#D8443B" opacity="0.8">sleep starts to suffer</text>
          {/* axis */}
          <line x1={PADL} y1={yFor(0)} x2={VW - PADR} y2={yFor(0)} stroke="rgba(11,26,43,0.18)" strokeWidth="1" />
          {/* area + curve */}
          <path d={area} fill="url(#caf-fill)" />
          <path d={path} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "d 0.3s ease" }} />
          {/* bedtime marker */}
          <line x1={xFor(bedH)} y1={PADT} x2={xFor(bedH)} y2={yFor(0)} stroke="var(--ink)" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
          <circle cx={xFor(bedH)} cy={yFor(atBed)} r="5" fill="#fff" stroke={zone.color} strokeWidth="2.5" />
          <text x={xFor(bedH)} y={PADT + 6} textAnchor="middle" fontSize="7.5" fill="var(--ink-soft)">bed</text>
          {/* hour ticks */}
          {[6, 12, 18, 24].map((h) => (
            <text key={h} x={xFor(h)} y={VH - 8} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">
              {h === 24 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
            </text>
          ))}
        </svg>

        <div className="mt-5 pt-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <GlassSlider label="How much caffeine" value={dose} min={0} max={300} step={5} accent={ACCENT} display={`${dose} mg`} onChange={setDose} />
          <Chips options={DRINKS.map((d) => ({ value: d.value, label: `${d.label} · ${d.mg}mg` }))} value={preset} onChange={(v) => setDose(DRINKS.find((d) => d.value === v)!.mg)} accent={ACCENT} ariaLabel="Drink presets" />
          <GlassSlider label="When you drink it" value={drinkH} min={6} max={22} step={0.5} accent={ACCENT} display={fmtHour(drinkH)} onChange={setDrinkH} />
          <GlassSlider label="Bedtime" value={bedH} min={20} max={24} step={0.25} accent={ACCENT} display={fmtHour(bedH)} onChange={setBedH} />
        </div>
        <p className="text-sm mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{note}</p>
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="~5 hr" label="to clear half of what you drank" accent={ACCENT} />
        <StatTile value="~10 hr" label="until it's down to a quarter" accent={ACCENT} />
        <StatTile value="6 hr" label="before bed is still enough to cost you sleep" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Caffeine works by blocking adenosine, the molecule that builds up all day and makes you sleepy. It doesn't leave all at once. Every five hours or so, about half of it is gone, then half of that, and so on, so an afternoon cup can still be blocking sleep signals at midnight."
        points={[
          { text: "Caffeine's half-life averages about 5 hours in healthy adults, and varies with genetics and other factors", cite: "Institute of Medicine, 2001; Nehlig, Pharmacol Rev 2018" },
          { text: "A 400 mg dose even 6 hours before bed measurably cut total sleep time", cite: "Drake et al., J Clin Sleep Med 2013" },
          { text: "Pediatric guidance is that adolescents limit or avoid caffeine, partly for sleep", cite: "American Academy of Pediatrics, 2011" },
        ]}
        sources="A simplified single-dose model. Real clearance depends on your body and what else you've had."
      />
    </LabShell>
  );
}

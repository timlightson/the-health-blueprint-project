"use client";

import { useState, useMemo, useEffect, useRef, type CSSProperties } from "react";
import { Sun } from "lucide-react";
import { playSound } from "@/lib/sleep-sound";
import LiquidGlass from "@/components/labs/LiquidGlass";

// ─── Phone Before Bed — illustrated night scene + overlapping signals ────────

const T_START = 20; // 8 PM
const T_END = 26;   // 2 AM (continuation)
const SPAN = T_END - T_START;
const N = 60;

const XS: number[] = [];
for (let i = 0; i < N; i++) XS.push(T_START + (i / (N - 1)) * SPAN);

function normalLevel(t: number): number {
  return 0.04 + 0.94 / (1 + Math.exp(-(t - 22) * 1.5));
}
function userLevel(t: number, delayH: number, suppression: number): number {
  const base = 0.04 + 0.94 / (1 + Math.exp(-(t - 22 - delayH) * 1.5));
  return base * (1 - suppression);
}
const NORMAL_VALS: number[] = XS.map(normalLevel);

type Brightness = "low" | "medium" | "high";

const MED_REF: [number, number][] = [
  [10, 6], [15, 10], [20, 13], [30, 20], [45, 35],
  [60, 45], [75, 53], [90, 60], [105, 68], [120, 75],
];
function lerpTable(table: [number, number][], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    if (x <= table[i + 1][0]) {
      const f = (x - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + (table[i + 1][1] - table[i][1]) * f;
    }
  }
  return table[table.length - 1][1];
}
function computeDelay(phoneMin: number, brightness: Brightness): number {
  if (phoneMin < 10) return 0;
  const med = lerpTable(MED_REF, phoneMin);
  const factor = brightness === "low" ? 0.6 : brightness === "high" ? 1.3 : 1.0;
  return Math.min(100, Math.round((med * factor) / 5) * 5);
}

function parseTargetTime(t: string): number {
  const [hStr, mStr] = t.split(":");
  let v = Number(hStr) + Number(mStr) / 60;
  if (v < 12) v += 24;
  return v;
}
function fmtTime12(h24: number): string {
  const norm = ((h24 % 24) + 24) % 24;
  const h = Math.floor(norm + 1e-6);
  const m = Math.round((norm - h) * 60);
  const ap = h < 12 || h === 24 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ap}`;
}
function fmtDelayOrLost(delayMin: number): string {
  if (delayMin < 5) return "~0 min";
  if (delayMin < 60) return `${delayMin} min`;
  return `${(delayMin / 60).toFixed(1)} hrs`;
}

function useEasedArray(target: number[], ms = 400): number[] {
  const [disp, setDisp] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const from = fromRef.current;
    if (from.length !== target.length) {
      fromRef.current = target;
      setDisp(target);
      return;
    }
    let s: number | null = null;
    const run = (ts: number) => {
      if (s === null) s = ts;
      const p = Math.min(1, (ts - s) / ms);
      const e = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2;
      const cur = target.map((v, i) => from[i] + (v - from[i]) * e);
      fromRef.current = cur;
      setDisp(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, ms]);
  return disp;
}

// Per-brightness tokens. Screen colors stay vivid against the navy phone body.
const BR: Record<Brightness, { screen: string; glow: string; accent: string }> = {
  low:    { screen: "rgba(254,215,145,0.95)", glow: "rgba(217,119,6,0.28)",  accent: "#D97706" },
  medium: { screen: "rgba(165,200,255,0.95)", glow: "rgba(37,99,235,0.30)",  accent: "#2563EB" },
  high:   { screen: "rgba(220,240,255,1.0)",  glow: "rgba(96,165,250,0.50)", accent: "#1D4ED8" },
};

export default function PhoneBeforeBed() {
  const [phoneMin, setPhoneMin] = useState(45);
  const [brightness, setBrightness] = useState<Brightness>("medium");
  const [targetTime, setTargetTime] = useState("23:00"); // 11:00 PM

  const delayMin = computeDelay(phoneMin, brightness);
  const suppression = Math.min(0.5, delayMin / 200);
  const delayH = delayMin / 60;
  const targetH = parseTargetTime(targetTime);
  const actualH = targetH + delayH;

  const userTarget = useMemo(
    () => XS.map((t) => userLevel(t, delayH, suppression)),
    [delayH, suppression],
  );
  const userEased = useEasedArray(userTarget, 400);

  // Chart geometry — rivers now overlap at a single center line.
  const VW = 600;
  const VH = 180;
  const padL = 18;
  const padR = 18;
  const plotW = VW - padL - padR;
  const xFor = (t: number) => padL + ((t - T_START) / SPAN) * plotW;
  const riverCY = 88;
  const maxBand = 58;

  // Severity colors — lab tokens
  const sevCol = delayMin < 20 ? "#0D9488" : delayMin <= 60 ? "#D97706" : "#DC2626";
  const statCol = delayMin < 5 ? "#0D9488" : sevCol;

  const riverPoints = (vals: number[]) => {
    const tops = vals.map((v, i) => `${xFor(XS[i]).toFixed(1)},${(riverCY - v * maxBand).toFixed(1)}`);
    const bots = vals
      .map((v, i) => `${xFor(XS[i]).toFixed(1)},${(riverCY + v * maxBand).toFixed(1)}`)
      .reverse();
    return [...tops, ...bots].join(" ");
  };
  const normalRiver = riverPoints(NORMAL_VALS);
  const userRiver = riverPoints(userEased);

  // Insight (unchanged)
  let insight: string;
  if (phoneMin < 10) {
    insight = "Your melatonin's on track. This is the version of you that falls asleep fast.";
  } else if (phoneMin < 30) {
    insight = "Slight nudge but nothing your brain can't handle.";
  } else if (phoneMin < 45) {
    insight = "Your melatonin's getting pushed back. You'll notice it takes longer to fall asleep.";
  } else if (phoneMin < 75) {
    insight = "Almost an hour of screen time is pushing your sleep signal back by close to an hour. You'll lie there wondering why you can't sleep.";
  } else if (phoneMin < 100) {
    insight = "Your brain thinks it's still afternoon. Even after you put the phone down, the signal takes a while to catch up.";
  } else {
    insight = "Two hours of scrolling and your brain basically skipped its sleep signal. You'll fall asleep from exhaustion, not melatonin.";
  }

  const br = BR[brightness];
  const phonePct = phoneMin / 120;
  const glowBoost = brightness === "low" ? 0 : brightness === "medium" ? 20 : 40;
  const glowSize = 90 + phonePct * 230 + glowBoost;

  const HOURS = [20, 21, 22, 23, 24, 25, 26];

  const tx = xFor(Math.min(T_END, Math.max(T_START, targetH)));
  const ax = xFor(Math.min(T_END, actualH));
  const labelsClose = Math.abs(ax - tx) < 30;

  const delayText = fmtDelayOrLost(delayMin);
  const sleepLostText = fmtDelayOrLost(delayMin);

  return (
    <div className="phb-wrap flex flex-col w-full h-full">
      <LiquidGlass
        radius={24}
        bezel={24}
        scale={50}
        style={{ padding: "24px", overflow: "hidden", flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <div className="phb-heading">
          <div>
            <p className="phb-kicker">Late-night light</p>
            <h2>Phone Before Bed</h2>
            <p>See how screen timing shifts your estimated sleep signal.</p>
          </div>
          <label className="phb-time">
            <span>Target sleep</span>
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              aria-label="Target sleep time"
            />
          </label>
        </div>

        <div className="phb-scene">
          <div className="phb-stage" style={{ "--phone-glow": br.glow } as CSSProperties}>
            <div
              className="phb-aura"
              style={{ width: glowSize, height: glowSize, background: `radial-gradient(circle, ${br.glow}, transparent 66%)` }}
            />
            <svg viewBox="0 0 260 238" role="img" aria-label={`${phoneMin} minutes of phone use at ${brightness} brightness`}>
              <defs>
                <linearGradient id="phb-room" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#07172C" />
                  <stop offset="1" stopColor="#173452" />
                </linearGradient>
                <linearGradient id="phb-screen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={br.screen} />
                  <stop offset="1" stopColor={brightness === "low" ? "#F4A261" : "#8FC5FF"} />
                </linearGradient>
                <filter id="phb-soft-glow"><feGaussianBlur stdDeviation="5" /></filter>
              </defs>
              <rect width="260" height="238" rx="22" fill="url(#phb-room)" />
              <circle cx="42" cy="42" r="18" fill="#FFF2C2" />
              <circle cx="51" cy="35" r="18" fill="#07172C" />
              {[ [76,28], [210,31], [232,61], [25,83], [61,107] ].map(([x,y], i) => (
                <circle key={i} className="phb-star" cx={x} cy={y} r={i % 2 ? 1.5 : 2} fill="#D8EDFF" style={{ animationDelay: `${i * .34}s` }} />
              ))}
              <path d="M0 188 Q70 172 130 190 T260 181 V238 H0Z" fill="#0B2138" />
              <path d="M24 200 H236" stroke="#61809C" strokeOpacity=".35" />
              <g opacity={Math.min(.95, .35 + phonePct * .6)} filter="url(#phb-soft-glow)">
                <path d="M126 55 L62 30" stroke={br.accent} strokeWidth="8" strokeLinecap="round" />
                <path d="M126 70 L210 36" stroke={br.accent} strokeWidth="10" strokeLinecap="round" />
                <path d="M126 98 L238 101" stroke={br.accent} strokeWidth="7" strokeLinecap="round" />
              </g>
              <g className="phb-phone">
                <rect x="76" y="15" width="108" height="207" rx="23" fill="#020813" stroke="#29445F" strokeWidth="2" />
                <rect x="84" y="29" width="92" height="176" rx="14" fill="url(#phb-screen)" />
                <rect x="112" y="20" width="36" height="7" rx="4" fill="#020813" />
                <text x="130" y="55" fill="#07172C" fontSize="11" fontWeight="700" textAnchor="middle">{phoneMin} MIN</text>
                <text x="130" y="69" fill="#07172C" fillOpacity=".58" fontSize="7" fontWeight="700" letterSpacing="1.2" textAnchor="middle">SCREEN TIME</text>
                {[0, 1, 2].map((i) => (
                  <g key={i} className="phb-notification" style={{ animationDelay: `${i * .42}s`, opacity: Math.min(1, .28 + phonePct + i * .08) }}>
                    <rect x="94" y={84 + i * 31} width="72" height="23" rx="7" fill="rgba(255,255,255,.55)" />
                    <circle cx="104" cy={95 + i * 31} r="4" fill={i === 1 ? "#F97370" : "#2563EB"} />
                    <rect x="112" y={91 + i * 31} width={38 - i * 4} height="3" rx="2" fill="#0B1A2B" fillOpacity=".55" />
                    <rect x="112" y={97 + i * 31} width={25 + i * 4} height="2" rx="1" fill="#0B1A2B" fillOpacity=".3" />
                  </g>
                ))}
                <path d="M112 192 H148" stroke="rgba(7,23,44,.55)" strokeWidth="3" strokeLinecap="round" />
              </g>
              <rect x="202" y="181" width="27" height="19" rx="4" fill="#E7F2FA" />
              <path d="M205 181 V174 H226 V181" fill="none" stroke="#E7F2FA" strokeWidth="3" />
              <path d="M208 189 H223" stroke="#A1B7C9" strokeWidth="2" />
            </svg>
          </div>

          <div className="phb-brightness" role="group" aria-label="Screen brightness">
            <span>Brightness</span>
            {(["low", "medium", "high"] as const).map((b) => {
              const active = brightness === b;
              const size = b === "low" ? 14 : b === "medium" ? 18 : 22;
              return (
                <button
                  key={b}
                  onClick={() => { setBrightness(b); playSound("click"); }}
                  aria-label={`${b} brightness`}
                  aria-pressed={active}
                  style={{ color: active ? BR[b].accent : "var(--ink-faint)", borderColor: active ? BR[b].accent : undefined, boxShadow: active ? `0 0 18px ${BR[b].glow}, inset 0 1px rgba(255,255,255,.9)` : undefined }}
                >
                  <Sun size={size} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="phb-scrubber">
          <div className="phb-scrubber-readout"><strong>{phoneMin}</strong><span>minutes on phone</span></div>
          <div className="phb-track">
            <div className="lg-well" />
            <i style={{ width: `${phonePct * 100}%`, background: `linear-gradient(90deg, #0D9488, ${br.accent})`, boxShadow: `0 0 ${8 + phonePct * 15}px ${br.accent}77` }} />
            <b className="lg-knob" style={{ left: `calc(${phonePct * 100}% - 10px)`, boxShadow: `0 0 0 2px ${br.accent}66, 0 3px 8px rgba(20,30,60,.35)` }} />
            <input
              type="range" min={0} max={120} step={5} value={phoneMin}
              onChange={(e) => { setPhoneMin(Number(e.target.value)); playSound("tick"); }}
              aria-label="Phone time before bed"
            />
          </div>
          <div className="phb-track-labels"><span>phone down</span><span>2 hours</span></div>
        </div>

        <div className="phb-tide">
          <div className="phb-tide-head">
            <div><span>Melatonin signal</span><strong>Target vs estimated</strong></div>
            <div className="phb-legend"><span className="normal">Normal</span><span className="estimate" style={{ "--legend-color": sevCol } as CSSProperties}>Estimated</span></div>
          </div>
          <div className="phb-tide-scroll">
            <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ minWidth: 380, display: "block" }}>
              <defs>
                <linearGradient id="phb-normal-river" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#8AA9C4" stopOpacity=".08" /><stop offset="1" stopColor="#BFD7E9" stopOpacity=".32" /></linearGradient>
                <linearGradient id="phb-user-river" x1="0" y1="0" x2="1" y2="0"><stop stopColor={sevCol} stopOpacity=".18" /><stop offset="1" stopColor={sevCol} stopOpacity=".82" /></linearGradient>
                <filter id="phb-river-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {HOURS.map((h) => <line key={h} x1={xFor(h)} y1={12} x2={xFor(h)} y2={VH - 25} stroke="#BFD7E9" strokeOpacity=".11" />)}
              <line x1={padL} y1={riverCY} x2={VW - padR} y2={riverCY} stroke="#BFD7E9" strokeOpacity=".13" />
              <polygon points={normalRiver} fill="url(#phb-normal-river)" stroke="#A9C4D8" strokeOpacity=".65" strokeWidth="1.2" strokeDasharray="5 5" />
              <polygon points={userRiver} fill="url(#phb-user-river)" stroke={sevCol} strokeWidth="1.8" filter="url(#phb-river-glow)" className="phb-river" />
              {targetH >= T_START && targetH <= T_END && <g><line x1={tx} y1={12} x2={tx} y2={VH - 25} stroke="#E9F4FC" strokeOpacity=".55" strokeDasharray="3 4" /><text x={tx} y="14" fontSize="9" fill="#E9F4FC" textAnchor="middle" fontWeight="700">TARGET</text></g>}
              {delayMin >= 5 && actualH <= T_END && <g><line x1={ax} y1={12} x2={ax} y2={VH - 25} stroke={sevCol} strokeDasharray="3 4" /><text x={ax} y={labelsClose ? 25 : 14} fontSize="9" fill={sevCol} textAnchor="middle" fontWeight="700">EST.</text></g>}
              {HOURS.map((h) => <text key={h} x={xFor(h)} y={VH - 7} fontSize="10" fill="#91ABC1" textAnchor="middle">{h === 24 ? "12 AM" : h === 25 ? "1 AM" : h === 26 ? "2 AM" : `${h - 12} PM`}</text>)}
            </svg>
          </div>
        </div>

        <div className="phb-stats">
          <div><span>Signal delay</span><strong style={{ color: statCol }}>{delayText}</strong></div>
          <div><span>Estimated sleep</span><strong style={{ color: statCol }}>{fmtTime12(actualH)}</strong></div>
          <div><span>Time lost</span><strong style={{ color: statCol }}>{sleepLostText}</strong></div>
        </div>

        <div className="phb-insight" style={{ backgroundColor: `${sevCol}10`, borderColor: `${sevCol}30` }}>
          <span style={{ background: sevCol }} />
          <p>{insight}</p>
        </div>
        <div className="phb-help">
          <strong>What helps</strong>
          <p>Phone down 1 hour before bed gets your melatonin back on track. Night mode helps too. Warm light suppresses much less than blue.</p>
        </div>
        <p className="phb-source">Chang et al., <em>PNAS</em> (2014). Phone use delayed melatonin onset by ~1.5 hours and reduced morning alertness.</p>
      </LiquidGlass>
    </div>
  );
}

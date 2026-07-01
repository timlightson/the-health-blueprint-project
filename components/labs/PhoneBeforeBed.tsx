"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Sun } from "lucide-react";
import { playSound } from "@/lib/sleep-sound";
import LiquidGlass from "@/components/labs/LiquidGlass";

// ─── Phone Before Bed — light theme, overlapping rivers ──────────────────────

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
    <div className="flex flex-col w-full h-full">
      <h2 className="text-lg font-bold mb-1" style={{ color: "var(--ink)" }}>Phone Before Bed</h2>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        Your screen is telling your brain it's daytime. Here's what that does.
      </p>

      <LiquidGlass
        radius={24}
        bezel={24}
        scale={50}
        style={{ padding: "22px 24px 20px", overflow: "hidden", flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <style>{`
          @keyframes phbPulse { 0%,100%{opacity:0.85;transform:translate(-50%,-50%) scale(0.97)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)} }
          @keyframes phbBreathe { 0%,100%{opacity:0.92} 50%{opacity:1} }
        `}</style>

        {/* Target time top-right */}
        <div style={{ position: "absolute", top: 14, right: 16, zIndex: 4 }}>
          <label
            style={{
              display: "block", fontSize: 9, color: "var(--ink-faint)", marginBottom: 3,
              textAlign: "right", textTransform: "uppercase", letterSpacing: "0.5px",
            }}
          >
            Target sleep
          </label>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            aria-label="Target sleep time"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "inset 0 1px 2px rgba(20,30,60,0.12)",
              color: "var(--ink)", borderRadius: 10, padding: "5px 9px", fontSize: 12,
            }}
          />
        </div>

        {/* Phone + brightness toggle */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "26px", margin: "32px 0 14px",
          }}
        >
          {/* Phone with glow */}
          <div style={{ position: "relative", width: 120, height: 210, flexShrink: 0 }}>
            <div
              style={{
                position: "absolute", top: "50%", left: "50%",
                width: glowSize, height: glowSize, borderRadius: "50%",
                background: `radial-gradient(circle, ${br.glow}, transparent 65%)`,
                animation: "phbPulse 3.4s ease-in-out infinite",
                pointerEvents: "none",
                transition: "width 0.25s ease, height 0.25s ease",
                filter: "blur(4px)",
                transform: "translate(-50%, -50%)",
              }}
            />
            <svg
              width="120" height="200" viewBox="0 0 120 200"
              style={{ position: "relative", zIndex: 2, display: "block", margin: "0 auto" }}
            >
              <rect x="3" y="3" width="114" height="194" rx="20" fill="#001A33" stroke="#001A33" strokeWidth="1.5" />
              <rect
                x="9" y="14" width="102" height="172" rx="9"
                fill={br.screen}
                style={{ transition: "fill 0.3s ease" }}
              />
              <rect x="46" y="9" width="28" height="6" rx="3" fill="#000" />
              <rect x="40" y="190" width="40" height="3" rx="1.5" fill="#3a4760" />
              <rect
                x="11" y="16" width="98" height="168" rx="7" fill="none"
                stroke="rgba(255,255,255,0.10)" strokeWidth="1"
              />
            </svg>
          </div>

          {/* Brightness column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <p
              style={{
                fontSize: 9, color: "var(--ink-faint)", textTransform: "uppercase",
                letterSpacing: "0.5px", margin: 0,
              }}
            >
              brightness
            </p>
            {(["low", "medium", "high"] as const).map((b) => {
              const active = brightness === b;
              const size = b === "low" ? 14 : b === "medium" ? 18 : 22;
              return (
                <button
                  key={b}
                  onClick={() => { setBrightness(b); playSound("click"); }}
                  aria-label={`${b} brightness`}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: active
                      ? `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.85), ${BR[b].accent}33)`
                      : "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    border: `1px solid ${active ? BR[b].accent : "rgba(255,255,255,0.6)"}`,
                    boxShadow: active
                      ? `0 0 16px ${BR[b].glow}, inset 0 1px 0 rgba(255,255,255,0.9)`
                      : "inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 8px -4px rgba(20,30,60,0.2)",
                    color: active ? BR[b].accent : "var(--ink-faint)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0,
                    transition: "all 0.3s var(--spring)",
                  }}
                >
                  <Sun size={size} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Slider scrubber */}
        <div style={{ maxWidth: 480, margin: "0 auto 24px" }}>
          <p
            style={{
              textAlign: "center", fontSize: 26, fontWeight: 700, color: "var(--ink)",
              marginBottom: 10, lineHeight: 1,
            }}
          >
            {phoneMin}{" "}
            <span style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 500 }}>min on phone</span>
          </p>
          <div style={{ position: "relative", height: 32 }}>
            <div
              className="lg-well"
              style={{
                position: "absolute", left: 0, right: 0, top: 12,
                height: 8, borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute", left: 0, top: 12,
                width: `${phonePct * 100}%`,
                height: 8, borderRadius: 999,
                background: `linear-gradient(90deg, ${br.accent}, ${br.accent}cc)`,
                boxShadow: `0 0 ${8 + phonePct * 16}px ${br.accent}77, inset 0 1px 0 rgba(255,255,255,0.5)`,
                opacity: 0.98, pointerEvents: "none",
                transition: "width 0.2s var(--ease-glass), background 0.25s ease, box-shadow 0.25s ease",
              }}
            />
            <div
              className="lg-knob"
              style={{
                position: "absolute", left: `calc(${phonePct * 100}% - 10px)`, top: 6,
                width: 20, height: 20, borderRadius: "50%",
                boxShadow: `0 0 0 2px ${br.accent}66, 0 3px 8px rgba(20,30,60,0.35), inset 0 1px 0 rgba(255,255,255,0.95)`,
                pointerEvents: "none",
                transition: "left 0.2s var(--ease-glass), box-shadow 0.25s ease",
              }}
            />
            <input
              type="range" min={0} max={120} step={5} value={phoneMin}
              onChange={(e) => { setPhoneMin(Number(e.target.value)); playSound("tick"); }}
              aria-label="Phone time before bed"
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                opacity: 0, cursor: "pointer", margin: 0,
              }}
            />
          </div>
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 10, color: "var(--ink-faint)", marginTop: 8, letterSpacing: "0.5px",
            }}
          >
            <span>0 min</span>
            <span>2 hrs</span>
          </div>
        </div>

        {/* River chart — overlapping rivers */}
        <div style={{ overflowX: "auto", marginBottom: 6 }}>
          <svg
            viewBox={`0 0 ${VW} ${VH}`} width="100%"
            style={{ minWidth: 380, display: "block" }}
          >
            {/* hour gridlines */}
            {HOURS.map((h) => (
              <line
                key={h}
                x1={xFor(h)} y1={4} x2={xFor(h)} y2={VH - 22}
                stroke="#F0EDE6" strokeWidth="1"
              />
            ))}

            {/* normal river — behind, dashed outline + faint fill */}
            <polygon
              points={normalRiver}
              fill="#9CA3AF"
              fillOpacity="0.12"
              stroke="#9CA3AF"
              strokeWidth="1.2"
              strokeDasharray="5 4"
            />

            {/* user river — on top, solid colored */}
            <polygon
              points={userRiver}
              fill={sevCol}
              fillOpacity="0.55"
              stroke={sevCol}
              strokeWidth="1.6"
              style={{
                animation: "phbBreathe 5.5s ease-in-out infinite",
                transition: "fill 0.3s ease, stroke 0.3s ease",
              }}
            />

            {/* target marker */}
            {targetH >= T_START && targetH <= T_END && (
              <g>
                <line
                  x1={xFor(targetH)} y1={4} x2={xFor(targetH)} y2={VH - 22}
                  stroke="#001A33" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 3"
                />
                <text
                  x={xFor(targetH)} y={12}
                  fontSize="9" fill="#001A33" textAnchor="middle" fontWeight="600"
                >
                  target
                </text>
              </g>
            )}

            {/* actual marker — only if delay >= 5 min */}
            {delayMin >= 5 && actualH > targetH && actualH <= T_END && (
              <g>
                <line
                  x1={xFor(actualH)} y1={4} x2={xFor(actualH)} y2={VH - 22}
                  stroke={sevCol} strokeWidth="1" strokeDasharray="3 3"
                />
                <text
                  x={xFor(actualH)} y={labelsClose ? 22 : 12}
                  fontSize="9" fill={sevCol} textAnchor="middle" fontWeight="600"
                >
                  actual
                </text>
              </g>
            )}

            {/* hour x-labels */}
            {HOURS.map((h) => (
              <text
                key={h} x={xFor(h)} y={VH - 6}
                fontSize="10" fill="#9CA3AF" textAnchor="middle"
              >
                {h === 24 ? "12 AM" : h === 25 ? "1 AM" : h === 26 ? "2 AM" : `${h - 12} PM`}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-1 mb-4 text-xs flex-wrap" style={{ color: "var(--ink-soft)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-6" style={{
              height: "2px",
              backgroundImage: "linear-gradient(to right, #9CA3AF 50%, transparent 0%)",
              backgroundSize: "7px 2px",
              backgroundRepeat: "repeat-x",
            }} />
            <span>Normal melatonin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-6"
              style={{
                height: "3px",
                backgroundColor: sevCol,
                borderRadius: "2px",
                transition: "background-color 0.3s ease",
              }}
            />
            <span>Your melatonin</span>
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
            gap: 14, fontSize: 14, color: "var(--ink-soft)",
            marginBottom: 12, lineHeight: 1.4, textAlign: "center",
          }}
        >
          <div>
            Melatonin delayed{" "}
            <strong style={{ color: statCol, transition: "color 0.3s ease" }}>{delayText}</strong>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(11,26,43,0.12)" }} />
          <div>
            Fall asleep at{" "}
            <strong style={{ color: statCol, transition: "color 0.3s ease" }}>{fmtTime12(actualH)}</strong>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(11,26,43,0.12)" }} />
          <div>
            Lose{" "}
            <strong style={{ color: statCol, transition: "color 0.3s ease" }}>{sleepLostText}</strong>{" "}
            of sleep
          </div>
        </div>

        {/* Insight */}
        <div
          className="mt-4 rounded p-3"
          style={{ backgroundColor: `${sevCol}10`, border: `1px solid ${sevCol}30` }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{insight}</p>
        </div>

        {/* What helps */}
        <div className="mt-3 rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--ink)" }}>What helps</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Phone down 1 hour before bed gets your melatonin back on track. Night mode helps too. Warm light suppresses much less than blue.
          </p>
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
          Chang et al., <em>PNAS</em> (2014). Phone use delayed melatonin onset by ~1.5 hours and reduced morning alertness.
        </p>
      </LiquidGlass>
    </div>
  );
}

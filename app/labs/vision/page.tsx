"use client";

import { useState, useRef } from "react";
import { Sun, Monitor } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#059669";

function zoneFor(risk: number) {
  if (risk < 30) return { label: "Low risk", color: "#0E8A7D" };
  if (risk < 60) return { label: "Worth watching", color: "#C9760F" };
  return { label: "High risk", color: "#D8443B" };
}

export default function VisionLab() {
  // balance: 0 = all screens, 1 = all sunlight
  const [balance, setBalance] = useState(0.28);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const outdoor = +(balance * 4).toFixed(1);
  const near = +(12 - balance * 8).toFixed(1);
  const risk = Math.round(clamp(25 + near * 5 - outdoor * 18, 0, 100));
  const zone = zoneFor(risk);
  const blurPx = (risk / 100) * 3.4;

  const setFromClient = (clientX: number) => {
    const el = barRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setBalance(clamp((clientX - r.left) / r.width, 0, 1));
  };
  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true; setFromClient(e.clientX);
    const move = (ev: PointerEvent) => { if (dragging.current) setFromClient(ev.clientX); };
    const up = () => { dragging.current = false; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  // Blind-spot finder
  const [dotX, setDotX] = useState(62); // % across the box
  const [found, setFound] = useState(false);
  const spotRef = useRef<HTMLDivElement>(null);
  const dragDot = (e: React.PointerEvent) => {
    const el = spotRef.current; if (!el) return;
    const move = (ev: PointerEvent) => { const r = el.getBoundingClientRect(); setDotX(clamp(((ev.clientX - r.left) / r.width) * 100, 26, 94)); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    e.preventDefault();
  };

  return (
    <LabShell lab="vision" badge={{ color: zone.color, text: `${risk}% risk` }}>
      <LabHero
        kicker="Vision Blueprint · 09"
        title="Your eyes grow into your day"
        subtitle="Nearsightedness isn't just genetic. Close focus with little daylight slowly stretches the eyeball. Slide your day between screens and sunlight and watch the board go blurry."
        accent={ACCENT}
      />

      {/* Balance bar */}
      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "24px" }}>
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>Nearsightedness risk</p>
          <div className="text-5xl font-bold tabular-nums mt-1" style={{ color: zone.color, letterSpacing: "-0.03em", transition: "color 0.4s ease" }}>{risk}%</div>
          <p className="text-sm font-semibold mt-1" style={{ color: zone.color }}>{zone.label}</p>
        </div>

        {/* Distance clarity demo */}
        <div className="lg-well rounded-2xl py-5 px-4 text-center mb-6" aria-hidden="true">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-faint)" }}>The board from the back row</p>
          <div className="font-bold tabular-nums select-none" style={{ fontSize: 34, letterSpacing: "0.22em", color: "var(--ink)", filter: `blur(${blurPx.toFixed(2)}px)`, transition: "filter 0.3s ease" }}>
            E F P T O Z
          </div>
        </div>

        {/* Draggable day balance */}
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5" style={{ color: "#64748B" }}><Monitor className="w-4 h-4" /> {near} hr close-up</span>
          <span className="flex items-center gap-1.5" style={{ color: ACCENT }}>{outdoor} hr daylight <Sun className="w-4 h-4" /></span>
        </div>
        <div ref={barRef} onPointerDown={startDrag} className="relative rounded-full" style={{ height: 40, touchAction: "none", cursor: "ew-resize", background: `linear-gradient(90deg, #64748B33, ${ACCENT}44)` }}>
          <div className="absolute top-0 bottom-0 rounded-full" style={{ left: 0, width: `${balance * 100}%`, background: `linear-gradient(90deg, transparent, ${ACCENT}33)` }} />
          <div className="absolute top-1/2 rounded-full shadow-md flex items-center justify-center" style={{ left: `calc(${balance * 100}% - 18px)`, width: 36, height: 36, transform: "translateY(-50%)", background: "#fff", border: `2px solid ${ACCENT}` }}>
            <Sun className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--ink-faint)" }}>Drag toward the sun. Daylight is the strongest thing that protects growing eyes.</p>

        {/* 20-20-20 */}
        <div className="mt-5 p-4 rounded-2xl" style={{ background: `linear-gradient(165deg, ${ACCENT}1A, rgba(255,255,255,0.5))`, border: `1px solid ${ACCENT}33`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>The 20-20-20 break</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
            Every 20 minutes of close work, look at something about 20 feet away for 20 seconds. It relaxes the focusing muscle before it locks up.
          </p>
        </div>
      </LiquidGlass>

      {/* Blind-spot finder */}
      <LiquidGlass radius={22} bezel={20} scale={44} className="mt-4" style={{ padding: "20px" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>Find your blind spot</p>
        <p className="text-xs mb-4" style={{ color: "var(--ink-faint)" }}>
          Cover your <b>right</b> eye. Stare hard at the +. Drag the dot slowly leftward until it vanishes, then tap the button. Everyone has this hole where the optic nerve leaves the eye.
        </p>
        <div ref={spotRef} className="lg-well relative rounded-2xl" style={{ height: 120, overflow: "hidden" }}>
          <span className="absolute top-1/2 text-2xl font-bold select-none" style={{ left: "12%", transform: "translateY(-50%)", color: "var(--ink)" }}>+</span>
          <div onPointerDown={dragDot} className="absolute top-1/2 rounded-full" style={{ left: `${dotX}%`, transform: "translate(-50%,-50%)", width: 26, height: 26, background: "#D8443B", cursor: "ew-resize", touchAction: "none", boxShadow: "0 4px 12px -2px rgba(216,68,59,0.6)" }} />
        </div>
        <button onClick={() => setFound(true)} className="mt-3 w-full lg-pill rounded-full font-semibold" style={{ minHeight: 44, color: ACCENT }}>
          It disappeared
        </button>
        {found && (
          <p className="text-sm mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
            That's your blind spot, about 15° to the side, where the optic nerve punches through the retina and leaves no light-sensing cells. Your brain quietly fills the gap so you never notice it in daily life.
          </p>
        )}
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="2 hr" label="daylight a day meaningfully lowers the risk" accent={ACCENT} />
        <StatTile value="~50%" label="of the world projected to be nearsighted by 2050" accent={ACCENT} />
        <StatTile value="Distance" label="not brightness, is what daylight gives your eyes" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="A nearsighted eye usually grew too long from front to back, so distant light focuses just short of the retina and far things blur. Close focus nudges that growth; bright daylight, which cues the retina to release dopamine, appears to put the brakes on it."
        points={[
          { text: "More time outdoors is linked to lower rates of nearsightedness in children and teens", cite: "Rose et al., Ophthalmology 2008" },
          { text: "Adding 40 minutes of outdoor time at school cut the rate of new nearsightedness over 3 years", cite: "He et al., JAMA 2015" },
          { text: "Nearsightedness is rising worldwide, about half the global population projected to be myopic by 2050", cite: "Holden et al., Ophthalmology 2016" },
        ]}
        sources="Risk here illustrates the trend, not a personal prediction."
      />
    </LabShell>
  );
}

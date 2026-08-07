"use client";

import { useState, useRef } from "react";
import { Sun, Monitor } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel, clamp } from "@/components/labs/kit";

const ACCENT = "#059669";

function zoneFor(risk: number) {
  if (risk < 30) return { label: "Lower modeled score", color: "#0E8A7D" };
  if (risk < 60) return { label: "Middle modeled score", color: "#C9760F" };
  return { label: "Higher modeled score", color: "#D8443B" };
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
  const moveBalanceByKey = (e: React.KeyboardEvent) => {
    const delta = e.shiftKey ? 0.1 : 0.025;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setBalance((v) => clamp(v - delta, 0, 1)); }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setBalance((v) => clamp(v + delta, 0, 1)); }
    if (e.key === "Home") { e.preventDefault(); setBalance(0); }
    if (e.key === "End") { e.preventDefault(); setBalance(1); }
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
  const moveDotByKey = (e: React.KeyboardEvent) => {
    const delta = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setDotX((v) => clamp(v - delta, 26, 94)); }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setDotX((v) => clamp(v + delta, 26, 94)); }
    if (e.key === "Home") { e.preventDefault(); setDotX(26); }
    if (e.key === "End") { e.preventDefault(); setDotX(94); }
  };

  return (
    <LabShell lab="vision" badge={{ color: zone.color, text: `${risk} model` }}>
      <LabHero
        lab="vision"
        kicker="Vision Blueprint · 09"
        title="How environment relates to myopia"
        subtitle="Nearsightedness is influenced by genetics and environment. This model illustrates associations involving near work and time outdoors; it does not estimate personal risk."
        accent={ACCENT}
      />

      {/* Balance bar */}
      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "14px", overflow: "hidden" }}>
        <div className="vision-stage">
          <svg className="vision-eye-diagram" viewBox="0 0 420 220" aria-hidden="true">
            <path d="M28 111c48-72 109-92 171-92 86 0 150 51 193 92-43 41-107 92-193 92-62 0-123-20-171-92Z" fill="none" stroke="rgba(110,231,183,.17)" strokeWidth="2" />
            <circle cx="202" cy="111" r="70" fill="rgba(5,150,105,.09)" stroke="rgba(110,231,183,.22)" strokeWidth="2" />
            <circle cx="202" cy="111" r="34" fill="rgba(6,78,59,.42)" stroke="rgba(167,243,208,.35)" strokeWidth="3" />
            <circle cx="202" cy="111" r="11" fill="#6EE7B7" />
            <path d="M0 111h420M202 0v220" stroke="rgba(255,255,255,.055)" strokeDasharray="4 7" />
            <path d="M223 102c49-20 92-20 158 8M223 120c49 20 92 20 158-8" fill="none" stroke="rgba(110,231,183,.18)" />
          </svg>
          <div className="vision-stage-readout">
            <span>ILLUSTRATIVE RISK INDEX</span>
            <strong style={{ color: zone.color }}>{risk}</strong>
            <em style={{ color: zone.color }}>{zone.label}</em>
          </div>
          <div className="vision-board" aria-hidden="true">
            <span>BACK-ROW CLARITY</span>
            <strong style={{ filter: `blur(${blurPx.toFixed(2)}px)` }}>E F P T O Z</strong>
          </div>
        </div>

        {/* Draggable day balance */}
        <div className="vision-balance">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5" style={{ color: "#64748B" }}><Monitor className="w-4 h-4" /> {near} hr close-up</span>
          <span className="flex items-center gap-1.5" style={{ color: ACCENT }}>{outdoor} hr daylight <Sun className="w-4 h-4" /></span>
        </div>
        <div
          ref={barRef}
          onPointerDown={startDrag}
          onKeyDown={moveBalanceByKey}
          role="slider"
          tabIndex={0}
          aria-label="Daily balance between close-up work and daylight"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(balance * 100)}
          aria-valuetext={`${near} hours close-up, ${outdoor} hours daylight`}
          className="relative rounded-full"
          style={{ height: 40, touchAction: "none", cursor: "ew-resize", background: `linear-gradient(90deg, #64748B33, ${ACCENT}44)` }}
        >
          <div className="absolute top-0 bottom-0 rounded-full" style={{ left: 0, width: `${balance * 100}%`, background: `linear-gradient(90deg, transparent, ${ACCENT}33)` }} />
          <div className="absolute top-1/2 rounded-full shadow-md flex items-center justify-center" style={{ left: `calc(${balance * 100}% - 18px)`, width: 36, height: 36, transform: "translateY(-50%)", background: "#fff", border: `2px solid ${ACCENT}` }}>
            <Sun className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--ink-faint)" }}>Drag toward the sun, or use the arrow keys. More time outdoors is consistently associated with lower myopia incidence in children.</p>
        </div>

        {/* 20-20-20 */}
        <div className="mx-2 mb-2 p-4 rounded-2xl" style={{ background: `linear-gradient(165deg, ${ACCENT}1A, rgba(255,255,255,0.5))`, border: `1px solid ${ACCENT}33`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>The 20-20-20 break</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
            Every 20 minutes of close work, look at something about 20 feet away for 20 seconds. This may reduce digital eye strain, but it has not been shown to prevent nearsightedness.
          </p>
        </div>
      </LiquidGlass>

      {/* Blind-spot finder */}
      <LiquidGlass radius={22} bezel={20} scale={44} className="mt-4" style={{ padding: "20px" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>Find your blind spot</p>
        <p className="text-xs mb-4" style={{ color: "var(--ink-faint)" }}>
          Cover your <b>right</b> eye. Keep looking at the +. Move the dot slowly leftward, or use the arrow keys, until it vanishes. The blind spot is where the optic nerve exits the retina and there are no photoreceptors.
        </p>
        <div ref={spotRef} className="vision-blind-field relative rounded-2xl" style={{ height: 130, overflow: "hidden" }}>
          <i className="vision-blind-line" />
          <span className="absolute top-1/2 text-2xl font-bold select-none" style={{ left: "12%", transform: "translateY(-50%)", color: "#D1FAE5" }}>+</span>
          <div
            onPointerDown={dragDot}
            onKeyDown={moveDotByKey}
            role="slider"
            tabIndex={0}
            aria-label="Blind-spot test dot position"
            aria-valuemin={26}
            aria-valuemax={94}
            aria-valuenow={Math.round(dotX)}
            aria-valuetext={`${Math.round(dotX)} percent across the test field`}
            className="vision-blind-dot absolute top-1/2 rounded-full"
            style={{ left: `${dotX}%`, transform: "translate(-50%,-50%)", width: 26, height: 26, background: "#FB7185", cursor: "ew-resize", touchAction: "none", boxShadow: "0 0 22px rgba(251,113,133,.65)" }}
          />
        </div>
        <button onClick={() => setFound(true)} aria-controls="blind-spot-result" aria-expanded={found} className="mt-3 w-full lg-pill rounded-full font-semibold" style={{ minHeight: 44, color: ACCENT }}>
          It disappeared
        </button>
        {found && (
          <p id="blind-spot-result" role="status" className="text-sm mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
            That is your blind spot, typically about 15° from the center of vision. The visual system fills in the missing area using surrounding information, so the gap is usually not noticeable.
          </p>
        )}
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="Outdoors" label="more time outside is associated with lower incidence in children" accent={ACCENT} />
        <StatTile value="~50%" label="of the world projected to be nearsighted by 2050" accent={ACCENT} />
        <StatTile value="Model" label="the index above is educational, not a personal prediction" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="In myopia, the eye is usually too long relative to its focusing power, so distant images focus in front of the retina. Genetics matters. Studies also associate more time outdoors with a lower incidence of myopia in children, while the mechanisms and contribution of near work remain active research questions."
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

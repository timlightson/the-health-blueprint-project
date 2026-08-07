import type { LabId } from "@/components/labs/labs-meta";
import type { CSSProperties } from "react";

function Signal({ lab, accent }: { lab: LabId; accent: string }) {
  switch (lab) {
    case "energy":
      return <><path className="lab-hero-draw" d="M14 31h34c8 0 9-19 19-19s11 28 22 28 13-13 26-13h91" /><circle className="lab-hero-node" cx="68" cy="12" r="4" fill={accent} /><circle cx="89" cy="40" r="3" fill="#D8443B" /></>;
    case "stress":
      return <><path d="M110 7v34M110 15 62 27M110 15l48 12M110 29 44 39M110 29l66 10" /><g className="lab-hero-nodes">{[[110,7],[62,27],[158,27],[44,39],[176,39]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i?3:5} fill={accent} style={{animationDelay:`${i*.18}s`}} />)}</g></>;
    case "hydration":
      return <><path className="lab-hero-flow" d="M5 29q18-10 36 0t36 0 36 0 36 0 36 0 36 0" /><path d="M35 13c-7 9-8 12-8 16a8 8 0 0 0 16 0c0-4-1-7-8-16ZM184 8c-8 11-10 15-10 20a10 10 0 0 0 20 0c0-5-2-9-10-20Z" fill={accent} fillOpacity=".25" /></>;
    case "sound":
      return <><path className="lab-hero-flow" d="M5 24c12 0 12-17 24-17s12 34 24 34 12-34 24-34 12 34 24 34 12-34 24-34 12 34 24 34 12-34 24-34 12 17 24 17" /><circle className="lab-hero-node" cx="101" cy="24" r="4" fill={accent} /></>;
    case "focus":
      return <><circle cx="110" cy="24" r="19" /><circle cx="110" cy="24" r="10" /><circle className="lab-hero-node" cx="110" cy="24" r="4" fill={accent} /><path d="M76 24H39M144 24h37M110 3v7M110 38v7" /></>;
    case "breath":
      return <><path className="lab-hero-breathe" d="M13 27c22 0 25-16 43-16s20 26 38 26 22-26 41-26 22 16 42 16h30" /><path d="M110 8v32M110 20 96 31M110 20l14 11" /></>;
    case "caffeine":
      return <><path className="lab-hero-draw" d="M8 11h35c18 0 26 27 52 27s30-15 52-15h58" /><path d="M28 8h18v12c0 8-5 14-9 14s-9-6-9-14Z" fill={accent} fillOpacity=".18" /><circle className="lab-hero-node" cx="94" cy="38" r="4" fill={accent} /></>;
    case "vision":
      return <><path d="M24 24q86-38 172 0-86 38-172 0Z" /><circle cx="110" cy="24" r="15" /><circle className="lab-hero-node" cx="110" cy="24" r="6" fill={accent} /><path className="lab-hero-flow" d="m5 8 75 12M5 40l75-12M215 8l-75 12M215 40l-75-12" /></>;
    default:
      return <path className="lab-hero-flow" d="M5 24h210" />;
  }
}

export default function LabHeroSignal({ lab, accent }: { lab: LabId; accent: string }) {
  return (
    <div className="lab-hero-signal" style={{ "--lab-signal": accent } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 220 48" fill="none">
        <g stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".62">
          <Signal lab={lab} accent={accent} />
        </g>
      </svg>
    </div>
  );
}

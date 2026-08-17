"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LabId } from "@/components/labs/labs-meta";
import { useMotionPresence } from "@/hooks/use-motion-presence";

export type LayeredBlueprintId = "sleep" | "energy" | "stress" | "hydration" | "sound" | "focus";

type Props = {
  id: LayeredBlueprintId;
  hovered?: boolean;
  reduced?: boolean;
  featured?: boolean;
};

const THEMES: Record<LayeredBlueprintId, { accent: string; glow: string; from: string; mid: string; to: string; label: string }> = {
  sleep: { accent: "#66F1DE", glow: "#18BFB1", from: "#123D56", mid: "#0A273C", to: "#050E1B", label: "NIGHT SIGNAL" },
  energy: { accent: "#FFD76A", glow: "#F39B21", from: "#66421D", mid: "#352316", to: "#11131B", label: "FUEL CELL" },
  stress: { accent: "#FFACA8", glow: "#FF6868", from: "#592C3A", mid: "#351E2C", to: "#12131F", label: "PRESSURE LOAD" },
  hydration: { accent: "#9DD1FF", glow: "#3B8CFF", from: "#174B78", mid: "#12345A", to: "#071525", label: "FLUID BALANCE" },
  sound: { accent: "#CFC0FF", glow: "#8955FF", from: "#413074", mid: "#271D52", to: "#0D1026", label: "SOUND FIELD" },
  focus: { accent: "#FFB3D8", glow: "#F0449A", from: "#55234F", mid: "#351B3D", to: "#111323", label: "ATTENTION FIELD" },
};

export function isLayeredBlueprint(id: LabId): id is LayeredBlueprintId {
  return id === "sleep" || id === "energy" || id === "stress" || id === "hydration" || id === "sound" || id === "focus";
}

function SleepScene() {
  return (
    <div className="hbp-stage hbp-sleep">
      <div className="hbp-sleep-window"><i /><b /><span /><span /><span /></div>
      <div className="hbp-sleep-curtain curtain-left" /><div className="hbp-sleep-curtain curtain-right" />
      <div className="hbp-sleep-shelf"><i /><i /><i /></div>
      <div className="hbp-sleep-cycle"><i /><div><strong>90</strong><span>MIN</span></div></div>
      <div className="hbp-sleep-bed"><i className="hbp-sleep-pillow" /><b className="hbp-sleep-blanket" /><span className="hbp-sleep-frame" /></div>
      <div className="hbp-sleeper"><span className="hbp-sleeper-head"><i /><b /></span><span className="hbp-sleeper-body" /></div>
      <div className="hbp-sleep-waves"><i /><i /><i /></div>
      <div className="hbp-sleep-z"><i>z</i><i>z</i><i>z</i></div>
      <div className="hbp-sleep-floor" />
    </div>
  );
}

function EnergyScene() {
  const particles = Array.from({ length: 9 }, (_, i) => ({
    x: 8 + ((i * 29) % 84),
    y: 12 + ((i * 37) % 70),
    delay: i * -.29,
  }));
  return (
    <div className="hbp-stage hbp-energy">
      <div className="hbp-energy-rail rail-a" /><div className="hbp-energy-rail rail-b" />
      <div className="hbp-energy-particles">{particles.map((p, i) => <i key={i} style={{ "--particle-x": `${p.x}%`, "--particle-y": `${p.y}%`, "--particle-delay": `${p.delay}s` } as CSSProperties} />)}</div>
      <div className="hbp-energy-chamber">
        <span className="hbp-energy-terminal terminal-left" /><span className="hbp-energy-terminal terminal-right" />
        <div className="hbp-energy-glass"><i /><b /><span className="hbp-energy-bolt" /></div>
      </div>
      <div className="hbp-energy-meter"><span>INPUT</span>{[0,1,2,3,4].map(i => <i key={i} />)}</div>
      <div className="hbp-energy-status"><i /><span>CORE STABLE</span></div>
      <div className="hbp-energy-floor" />
    </div>
  );
}

function StressScene() {
  return (
    <div className="hbp-stage hbp-stress">
      <div className="hbp-stress-wall wall-left"><i /><i /><i /></div>
      <div className="hbp-stress-wall wall-right"><i /><i /><i /></div>
      <div className="hbp-stress-lines">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>
      <div className="hbp-stress-core">
        <i className="hbp-stress-ring ring-1" /><i className="hbp-stress-ring ring-2" /><i className="hbp-stress-ring ring-3" />
        <span className="hbp-stress-head"><i /><b /><em /></span>
      </div>
      <div className="hbp-stress-meter"><div><i /></div><span>LOAD BUILDING</span></div>
      <div className="hbp-stress-flash" />
    </div>
  );
}

function HydrationScene() {
  return (
    <div className="hbp-stage hbp-hydration">
      <div className="hbp-water-caustics"><i /><i /><i /></div>
      <div className="hbp-water-scale">{[0,1,2,3].map(i => <i key={i}><b /></i>)}</div>
      <div className="hbp-water-vessel">
        <div className="hbp-water-liquid"><i /><b />{[0,1,2,3,4,5].map(i => <span key={i} className={`bubble-${i + 1}`} />)}</div>
        <div className="hbp-water-shine" />
      </div>
      <div className="hbp-water-cap" />
      <div className="hbp-water-drop"><i /><strong>2%</strong></div>
      <div className="hbp-water-ripple"><i /><i /></div>
    </div>
  );
}

function SoundScene() {
  const bars = [32,48,69,92,73,105,82,60,39];
  return (
    <div className="hbp-stage hbp-sound">
      <div className="hbp-sound-atmosphere"><i /><i /><i /></div>
      <div className="hbp-headphones"><i className="hbp-headphone-band" /><span className="hbp-headphone-cup cup-left" /><span className="hbp-headphone-cup cup-right" /></div>
      <div className="hbp-sound-bars">{bars.map((height, i) => <i key={i} style={{ "--bar-height": `${height}%`, "--bar-delay": `${i * -.08}s` } as CSSProperties} />)}</div>
      <div className="hbp-sound-orb"><i /><b /></div>
      <div className="hbp-sound-limit"><i /><span>85 DB LIMIT</span></div>
    </div>
  );
}

function FocusScene() {
  const distractions = [["CHAT","chip-a"],["VIDEO","chip-b"],["PING","chip-c"],["TAB","chip-d"]];
  return (
    <div className="hbp-stage hbp-focus">
      <div className="hbp-focus-beam" />
      <div className="hbp-focus-radar"><i /><i /><i /><b /><span /></div>
      <div className="hbp-focus-scan" />
      <div className="hbp-focus-chips">{distractions.map(([label, cls]) => <span key={label} className={cls}><i />{label}</span>)}</div>
      <div className="hbp-focus-lock"><i /><span>LOCKED</span></div>
      <div className="hbp-focus-caption">ONE THING AT A TIME</div>
    </div>
  );
}

const SCENES: Record<LayeredBlueprintId, () => ReactNode> = {
  sleep: SleepScene,
  energy: EnergyScene,
  stress: StressScene,
  hydration: HydrationScene,
  sound: SoundScene,
  focus: FocusScene,
};

export default function LayeredBlueprintScene({ id, hovered = false, reduced = false, featured = false }: Props) {
  const theme = THEMES[id];
  const Scene = SCENES[id];
  const { ref, motionActive } = useMotionPresence<HTMLDivElement>("240px");
  const style = {
    "--hbp-accent": theme.accent,
    "--hbp-glow": theme.glow,
    "--hbp-from": theme.from,
    "--hbp-mid": theme.mid,
    "--hbp-to": theme.to,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`hbp-cover hbp-cover-${id} ${hovered ? "is-hovered" : ""} ${featured ? "is-featured" : ""} ${motionActive && !reduced ? "is-motion-active" : ""} ${reduced ? "is-reduced" : ""}`}
      style={style}
      aria-hidden="true"
    >
      <div className="hbp-cover-bg" />
      <div className="hbp-cover-grid" />
      <div className="hbp-cover-halo" />
      <div className="hbp-cover-label"><i />{theme.label}</div>
      <div className="hbp-cover-live">LIVE SCENE <i /></div>
      <div className="hbp-corner corner-tl" /><div className="hbp-corner corner-tr" /><div className="hbp-corner corner-bl" /><div className="hbp-corner corner-br" />
      <Scene />
      <div className="hbp-cover-sheen" />
      <div className="hbp-cover-depth" />
    </div>
  );
}

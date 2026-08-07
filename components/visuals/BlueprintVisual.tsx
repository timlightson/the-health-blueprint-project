import { LABS, labMeta, type LabId } from "@/components/labs/labs-meta";

type VisualMode = "card" | "hero" | "mark";

const LABELS: Record<LabId, [string, string]> = {
  sleep: ["sleep pressure", "circadian signal"],
  energy: ["input", "available energy"],
  stress: ["load", "recovery capacity"],
  hydration: ["intake", "estimated loss"],
  sound: ["amplitude", "frequency"],
  focus: ["primary task", "switch residue"],
  breath: ["inhale", "exhale"],
  caffeine: ["dose", "remaining"],
  vision: ["near focus", "outdoor light"],
};

function SleepSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M40 61H320M40 104H320M40 147H320" />
      <path className="bpv-trace" style={{ color: accent }} d="M40 108C68 76 94 78 121 108S175 140 202 108s54-32 81 0 28 0 37-10" />
      <path className="bpv-trace bpv-trace-late" d="M40 68C85 68 93 82 110 93s34 18 48 18 27-8 42-21 30-22 52-22h68" />
      {[56, 91, 126, 161, 196].map((x, i) => (
        <rect key={x} x={x} y={162 - i * 6} width="18" height={i * 6 + 8} rx="2" fill={accent} opacity={0.12 + i * 0.055} />
      ))}
      <circle className="bpv-pulse" cx="202" cy="108" r="4.5" fill={accent} />
      <text className="bpv-axis" x="40" y="184">MON</text><text className="bpv-axis" x="287" y="184">FRI</text>
    </>
  );
}

function EnergySignal({ accent }: { accent: string }) {
  const bands = [
    "M41 141C75 139 86 83 119 84s44 43 75 39 43-37 71-31 35 33 55 24",
    "M41 151C77 150 93 111 121 111s42 29 72 28 46-24 73-17 33 23 54 16",
    "M41 162C81 161 96 139 124 138s44 17 70 16 49-13 74-8 31 14 52 11",
  ];
  return (
    <>
      <path className="bpv-ghost" d="M40 52V172H320M40 82H320M40 112H320M40 142H320" />
      {bands.map((d, i) => <path key={d} className={`bpv-trace bpv-trace-${i + 1}`} style={{ color: accent, opacity: 0.88 - i * 0.2 }} d={d} />)}
      <path d="M42 73h68" className="bpv-callout" style={{ color: accent }} />
      <text className="bpv-note" x="42" y="66" fill={accent}>PEAK WINDOW</text>
      <circle className="bpv-pulse" cx="119" cy="84" r="4.5" fill={accent} />
      <text className="bpv-axis" x="40" y="187">06:00</text><text className="bpv-axis" x="283" y="187">24:00</text>
    </>
  );
}

function StressSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M43 171V49M43 171H320" />
      <path className="bpv-threshold" d="M43 88H320" />
      <text className="bpv-note" x="244" y="80" fill={accent}>CAPACITY</text>
      <path className="bpv-trace" style={{ color: accent }} d="M43 157C87 151 109 134 132 105s44-68 75-56 32 55 48 76 36 29 65 24" />
      <path className="bpv-trace bpv-trace-late" d="M43 151C91 147 116 132 141 118s54-23 82-12 43 40 97 44" />
      {[84, 132, 207, 274].map((x, i) => <circle key={x} cx={x} cy={[146, 105, 49, 143][i]} r="5" fill="#F7F5EF" stroke={accent} strokeWidth="1.5" />)}
      <text className="bpv-axis" x="43" y="186">LOAD</text><text className="bpv-axis" x="278" y="186">RECOVERY</text>
    </>
  );
}

function HydrationSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M64 48V171H296V48M64 78H296M64 109H296M64 140H296" />
      <path d="M65 118C93 106 112 129 140 118s47-12 73 0 51-12 82 0v52H65Z" fill={accent} opacity="0.12" />
      <path className="bpv-trace" style={{ color: accent }} d="M65 118C93 106 112 129 140 118s47-12 73 0 51-12 82 0" />
      {[103, 180, 257].map((x, i) => <path key={x} className={`bpv-drop bpv-drop-${i + 1}`} style={{ color: accent }} d={`M${x} 62c-9 12-10 18-10 23a10 10 0 0 0 20 0c0-5-1-11-10-23Z`} />)}
      <path className="bpv-callout" style={{ color: accent }} d="M76 153H284" />
      <text className="bpv-note" x="76" y="163" fill={accent}>BALANCE BAND</text>
    </>
  );
}

function SoundSignal({ accent }: { accent: string }) {
  const spectrum = [9, 17, 29, 46, 68, 51, 35, 25, 18, 11, 7];
  return (
    <>
      <path className="bpv-ghost" d="M39 111H320M39 66H320M39 156H320" />
      <path className="bpv-trace" style={{ color: accent }} d="M39 111c12 0 12-26 24-26s12 52 24 52 12-72 24-72 12 92 24 92 12-63 24-63 12 34 24 34 12-17 24-17h113" />
      {spectrum.map((h, i) => <rect className="bpv-spectrum" key={i} x={194 + i * 10} y={111 - h / 2} width="5" height={h} rx="2.5" fill={accent} style={{ animationDelay: `${i * 70}ms` }} />)}
      <text className="bpv-axis" x="39" y="184">TIME</text><text className="bpv-axis" x="268" y="184">FREQUENCY</text>
    </>
  );
}

function FocusSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M40 75H320M40 145H320" />
      <text className="bpv-axis" x="40" y="65">TASK A</text><text className="bpv-axis" x="40" y="135">TASK B</text>
      <path className="bpv-trace" style={{ color: accent }} d="M70 75h53c18 0 20 70 40 70h45c20 0 20-70 40-70h72" />
      <path className="bpv-trace bpv-trace-late" d="M70 145h35c18 0 20-70 40-70h43c19 0 20 70 40 70h72" />
      <path className="bpv-residue" style={{ color: accent }} d="M123 75c18 0 20 70 40 70M208 145c20 0 20-70 40-70" />
      {[123, 163, 208, 248].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 145 : 75} r="4.5" fill={i < 2 ? accent : "#F7F5EF"} stroke={accent} strokeWidth="1.5" />)}
      <text className="bpv-note" x="132" y="107" fill={accent}>SWITCH</text>
    </>
  );
}

function BreathSignal({ accent }: { accent: string }) {
  return (
    <>
      {[58, 42, 26].map((r, i) => <circle key={r} className={`bpv-breath bpv-breath-${i + 1}`} cx="180" cy="107" r={r} fill="none" stroke={accent} strokeWidth={i === 0 ? 1.5 : 1} opacity={0.28 + i * 0.15} />)}
      <path className="bpv-ghost" d="M40 177H320" />
      <path className="bpv-trace" style={{ color: accent }} d="M44 177C72 177 76 154 96 154s23 23 45 23h19c22 0 25-41 50-41s28 41 52 41h54" />
      <path className="bpv-callout" style={{ color: accent }} d="M126 58h108" />
      <text className="bpv-note" x="126" y="51" fill={accent}>4 IN / 6 OUT</text>
      <circle className="bpv-pulse" cx="180" cy="107" r="6" fill={accent} />
    </>
  );
}

function CaffeineSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M42 49V170H320M42 89H320M42 129H320" />
      <path d="M43 64C93 66 104 93 136 111s76 32 184 41v18H43Z" fill={accent} opacity="0.1" />
      <path className="bpv-trace" style={{ color: accent }} d="M43 64C93 66 104 93 136 111s76 32 184 41" />
      <path className="bpv-threshold" d="M43 129H320" />
      {[43, 136, 228, 320].map((x, i) => <circle key={x} cx={x} cy={[64, 111, 139, 152][i]} r="4.5" fill="#F7F5EF" stroke={accent} strokeWidth="1.5" />)}
      <text className="bpv-note" x="47" y="55" fill={accent}>DOSE</text><text className="bpv-note" x="239" y="123" fill={accent}>BEDTIME</text>
      <text className="bpv-axis" x="43" y="187">0 H</text><text className="bpv-axis" x="293" y="187">12 H</text>
    </>
  );
}

function VisionSignal({ accent }: { accent: string }) {
  return (
    <>
      <path className="bpv-ghost" d="M42 58H318M42 106H318M42 154H318" />
      <path className="bpv-trace" style={{ color: accent }} d="M43 63L177 106 43 149M317 63L183 106l134 43" />
      <path className="bpv-trace bpv-trace-late" d="M43 86l137 20L43 126M317 86l-137 20 137 20" />
      <path d="M180 51c23 15 35 33 35 55s-12 40-35 55c-23-15-35-33-35-55s12-40 35-55Z" fill={accent} opacity="0.08" stroke={accent} strokeWidth="1.5" />
      <line x1="180" y1="51" x2="180" y2="161" stroke={accent} strokeWidth="2" opacity="0.7" />
      <circle className="bpv-pulse" cx="180" cy="106" r="5" fill={accent} />
      <text className="bpv-axis" x="42" y="181">NEAR</text><text className="bpv-axis" x="282" y="181">FAR</text>
    </>
  );
}

function Signal({ lab, accent }: { lab: LabId; accent: string }) {
  switch (lab) {
    case "sleep": return <SleepSignal accent={accent} />;
    case "energy": return <EnergySignal accent={accent} />;
    case "stress": return <StressSignal accent={accent} />;
    case "hydration": return <HydrationSignal accent={accent} />;
    case "sound": return <SoundSignal accent={accent} />;
    case "focus": return <FocusSignal accent={accent} />;
    case "breath": return <BreathSignal accent={accent} />;
    case "caffeine": return <CaffeineSignal accent={accent} />;
    case "vision": return <VisionSignal accent={accent} />;
  }
}

export function BlueprintVisual({ lab, mode = "card", className = "" }: { lab: LabId; mode?: VisualMode; className?: string }) {
  const meta = labMeta(lab);
  const [left, right] = LABELS[lab];
  return (
    <div className={`bpv bpv-${mode} ${className}`} style={{ "--bpv-accent": meta.accent, "--bpv-tint": meta.tint } as React.CSSProperties} aria-hidden="true">
      <div className="bpv-meta">
        <span>BP / {meta.index}</span>
        <span>{left} ↔ {right}</span>
      </div>
      <svg viewBox="0 0 360 220" fill="none" role="presentation">
        <path className="bpv-corner" d="M26 41V27h14M320 27h14v14M26 179v14h14M320 193h14v-14" />
        <Signal lab={lab} accent={meta.accent} />
        <path className="bpv-scan" d="M31 42H329" />
      </svg>
      <div className="bpv-footer"><span>{meta.name.toUpperCase()} SIGNAL</span><span>THBP / MODEL</span></div>
    </div>
  );
}

const ATLAS_PATHS: Record<LabId, string> = {
  sleep: "M4 18c12-20 23 20 35 0s23 20 35 0",
  energy: "M4 24c14 0 14-18 25-18s12 28 23 28 10-14 22-14",
  stress: "M4 30c20 0 20-22 36-22s15 28 34 28",
  hydration: "M4 22c12-9 21 9 33 0s22 9 37 0",
  sound: "M4 22l7-13 7 26 7-22 7 17 7-11 7 7h28",
  focus: "M4 12h25l14 20h31",
  breath: "M4 25c10 0 10-18 22-18s13 28 27 28 10-10 21-10",
  caffeine: "M4 7c18 1 24 15 35 22s22 8 35 9",
  vision: "M4 9l35 13L4 35M74 9 39 22l35 13",
};

export function BlueprintAtlas({ className = "" }: { className?: string }) {
  return (
    <div className={`bp-atlas ${className}`} aria-hidden="true">
      <div className="bp-atlas-head"><span>SYSTEM ATLAS</span><span>09 LIVE MODELS</span></div>
      <div className="bp-atlas-grid">
        {LABS.map((lab) => (
          <div className="bp-atlas-cell" key={lab.id} style={{ "--bpv-accent": lab.accent } as React.CSSProperties}>
            <div className="flex items-center justify-between"><span>{lab.index}</span><span>{lab.name}</span></div>
            <svg viewBox="0 0 78 44" fill="none"><path className="bp-atlas-path" d={ATLAS_PATHS[lab.id]} /></svg>
          </div>
        ))}
      </div>
      <div className="bp-atlas-foot"><span>INPUT</span><span>OBSERVE · COMPARE · REPEAT</span><span>SIGNAL</span></div>
      <div className="bp-atlas-sweep" />
    </div>
  );
}

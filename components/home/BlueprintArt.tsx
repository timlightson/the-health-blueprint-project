"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import type { LabId } from "@/components/labs/labs-meta";

type Props = {
  id: LabId;
  hovered?: boolean;
  reduced?: boolean;
  featured?: boolean;
};

type SceneProps = { uid: string };

const THEMES: Record<LabId, { accent: string; glow: string; from: string; mid: string; to: string; label: string }> = {
  sleep: { accent: "#66F1DE", glow: "#18BFB1", from: "#123D56", mid: "#0A273C", to: "#050E1B", label: "NIGHT SIGNAL" },
  energy: { accent: "#FFD76A", glow: "#F39B21", from: "#66421D", mid: "#352316", to: "#11131B", label: "FUEL CELL" },
  stress: { accent: "#FFACA8", glow: "#FF6868", from: "#592C3A", mid: "#351E2C", to: "#12131F", label: "PRESSURE LOAD" },
  hydration: { accent: "#9DD1FF", glow: "#3B8CFF", from: "#174B78", mid: "#12345A", to: "#071525", label: "FLUID BALANCE" },
  sound: { accent: "#CFC0FF", glow: "#8955FF", from: "#413074", mid: "#271D52", to: "#0D1026", label: "SOUND FIELD" },
  focus: { accent: "#FFB3D8", glow: "#F0449A", from: "#55234F", mid: "#351B3D", to: "#111323", label: "ATTENTION FIELD" },
  breath: { accent: "#AAF5FF", glow: "#16BFE2", from: "#17566A", mid: "#103B50", to: "#061624", label: "BREATH RHYTHM" },
  caffeine: { accent: "#FFC381", glow: "#E67F1B", from: "#5A321D", mid: "#392116", to: "#131218", label: "HALF-LIFE" },
  vision: { accent: "#AEF6D3", glow: "#24C98A", from: "#195441", mid: "#10392F", to: "#061920", label: "FOCUS SYSTEM" },
};

function SleepScene({ uid }: SceneProps) {
  const stars = [[35,51,1.6],[57,84,1],[92,33,1.1],[128,59,1.5],[307,43,1.2],[327,80,1.7],[284,26,1]];
  return (
    <>
      <g className="bp-art-stars">
        {stars.map(([x,y,r],i) => <circle key={i} cx={x} cy={y} r={r} fill="#E9FDFF" style={{ animationDelay: `${i * .37}s` }} />)}
      </g>
      <g className="bp-sleep-moon" filter={`url(#${uid}-glow)`}>
        <circle cx="78" cy="63" r="31" fill="#FFEBAA" />
        <circle cx="91" cy="49" r="30" fill="#123A50" />
      </g>
      <g className="bp-sleep-orbit" transform="translate(281 69)">
        <circle r="43" fill="#24D6C3" fillOpacity=".045" stroke="#61ECDD" strokeOpacity=".22" />
        <circle r="31" fill="none" stroke="#68F5E2" strokeOpacity=".18" strokeWidth="8" />
        <circle className="bp-art-cycle-ring" r="31" fill="none" stroke="#68F5E2" strokeWidth="6" strokeLinecap="round" strokeDasharray="132 63" />
        <circle cx="-27" cy="-15" r="3.5" fill="#D8FFFA" />
        <text y="4" textAnchor="middle" fill="#E2FFFB" fontSize="10" fontWeight="850">90 MIN</text>
        <text y="17" textAnchor="middle" fill="#A8C7C8" fontSize="5.5" fontWeight="700" letterSpacing=".9">CYCLE</text>
      </g>
      <g className="bp-sleep-bed" filter={`url(#${uid}-shadow)`}>
        <ellipse cx="183" cy="190" rx="138" ry="11" fill="#020711" fillOpacity=".42" />
        <rect x="40" y="158" width="280" height="32" rx="15" fill="#07121E" stroke="#83A5B8" strokeOpacity=".35" strokeWidth="1.5" />
        <rect x="54" y="145" width="85" height="32" rx="14" fill="#EEF7F6" />
        <path d="M54 158c19-9 49-10 77 1" fill="none" stroke="#C7E1E2" strokeWidth="2" />
        <circle cx="133" cy="149" r="18" fill="#E3A17E" />
        <path d="M116 148c3-18 31-18 35 1-11-7-24-7-35-1Z" fill="#142033" />
        <path d="M151 160c48-27 116-22 159 5l5 23H145Z" fill={`url(#${uid}-accent)`} />
        <path d="M153 163c45-17 103-14 151 7" fill="none" stroke="#E2FFFB" strokeOpacity=".25" strokeWidth="2" />
      </g>
      <g className="bp-sleep-waves">
        {[0,1,2].map((i) => <path key={i} d={`M151 ${119 + i * 16}c19-${9-i*2} 37-${9-i*2} 56 0s37 ${9-i*2} 56 0 37-${9-i*2} 56 0`} fill="none" stroke={["#62EDDC","#8AC6FF","#FFD56A"][i]} strokeWidth={3-i*.45} strokeLinecap="round" opacity={.82-i*.14} style={{ animationDelay: `${i * .18}s` }} />)}
      </g>
    </>
  );
}

function EnergyScene({ uid }: SceneProps) {
  return (
    <>
      <g className="bp-energy-arc">
        <path d="M42 171C68 55 166 20 310 43" fill="none" stroke="#FFD76A" strokeOpacity=".13" strokeWidth="16" />
        <path d="M42 171C68 55 166 20 310 43" fill="none" stroke="#FFD76A" strokeOpacity=".48" strokeWidth="2" strokeDasharray="3 8" />
        <circle className="bp-energy-orb" cx="55" cy="136" r="8" fill="#F3921D" filter={`url(#${uid}-glow)`} />
      </g>
      <g className="bp-energy-cell" filter={`url(#${uid}-shadow)`}>
        <rect x="104" y="53" width="163" height="112" rx="31" fill="#101724" stroke="#FFD76A" strokeOpacity=".38" strokeWidth="2" />
        <rect x="119" y="68" width="133" height="82" rx="21" fill={`url(#${uid}-glass)`} stroke="#FFF4C1" strokeOpacity=".08" />
        <rect x="267" y="86" width="17" height="46" rx="8" fill="#FFD76A" fillOpacity=".75" />
        <path className="bp-energy-bolt" d="m193 68-44 58h34l-9 41 49-67h-35Z" fill="#FFD34E" stroke="#FFF7D0" strokeWidth="2" />
        <path d="M128 78h38" stroke="#fff" strokeOpacity=".14" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="bp-energy-meter">
        <text x="34" y="67" fill="#FFECC0" fontSize="7" fontWeight="800" letterSpacing="1.1">INPUT</text>
        {[0,1,2,3,4].map(i => <rect key={i} x="35" y={78+i*19} width={31+i*5} height="10" rx="5" fill={i<3?"#F39B21":"#43D29D"} opacity={.42+i*.12} style={{ animationDelay: `${i*.1}s` }} />)}
      </g>
      <g className="bp-energy-readout">
        <circle cx="306" cy="175" r="4" fill="#50E3A4" filter={`url(#${uid}-glow)`} />
        <text x="296" y="178" textAnchor="end" fill="#7CF4BB" fontSize="8" fontWeight="850" letterSpacing="1.2">STEADY</text>
      </g>
    </>
  );
}

function StressScene({ uid }: SceneProps) {
  const nodes = [[46,58],[34,111],[59,166],[314,54],[328,108],[305,165]] as const;
  return (
    <>
      <g className="bp-stress-network">
        {nodes.map(([x,y],i) => <g key={i}>
          <path d={`M${x} ${y}C${i<3?91:269} ${y},${i<3?117:243} ${105+(i%3-1)*13},180 109`} fill="none" stroke={i%2?"#FF9C9A":"#F3AD2B"} strokeOpacity=".4" strokeWidth="1.5" />
          <circle className="bp-stress-node" cx={x} cy={y} r={i%2?8:6} fill={i%2?"#F36C70":"#D98A18"} style={{ animationDelay: `${i*.2}s` }} />
          <circle cx={x-2} cy={y-2} r="2" fill="#fff" fillOpacity=".24" />
        </g>)}
      </g>
      <g className="bp-stress-core" filter={`url(#${uid}-shadow)`}>
        <circle cx="180" cy="109" r="64" fill="#130E1B" stroke="#FFB0AB" strokeOpacity=".18" />
        <circle cx="180" cy="109" r="53" fill={`url(#${uid}-glass)`} />
        {[46,34,23].map((r,i) => <circle key={r} className="bp-stress-ring" cx="180" cy="109" r={r} fill="none" stroke={i===2?"#FF7777":"#E75A74"} strokeWidth={i===2?3:1.7} strokeOpacity={.3+i*.15} style={{ animationDelay: `${i*.32}s` }} />)}
        <path d="M163 128c-10-7-14-19-10-30 3-13 14-21 27-21 16 0 29 12 29 28 0 9-4 17-11 22v14h-31v-10Z" fill={`url(#${uid}-accent)`} />
        <path d="M170 101c7-8 19-8 26 0M171 111h22" fill="none" stroke="#401B28" strokeWidth="3" strokeLinecap="round" />
        <path d="M173 132h20" stroke="#FFD1CD" strokeOpacity=".4" strokeWidth="2" />
      </g>
      <g className="bp-stress-load">
        <rect x="119" y="188" width="122" height="7" rx="4" fill="#fff" fillOpacity=".09" />
        <rect x="119" y="188" width="91" height="7" rx="4" fill="#FF7777" filter={`url(#${uid}-glow)`} />
        <text x="180" y="210" textAnchor="middle" fill="#FFD3D0" fontSize="7" fontWeight="850" letterSpacing="1.2">LOAD BUILDING</text>
      </g>
    </>
  );
}

function HydrationScene({ uid }: SceneProps) {
  return (
    <>
      <g className="bp-water-scale">
        {[0,1,2,3].map(i => <g key={i}><line x1="39" y1={63+i*36} x2="113" y2={63+i*36} stroke="#A8D7FF" strokeOpacity=".2" strokeDasharray="3 6" /><circle cx="39" cy={63+i*36} r="10" fill="#3D8BEE" fillOpacity={.1+i*.06} stroke="#9FD0FF" strokeOpacity=".44" /><circle cx="39" cy={63+i*36} r="3.5" fill="#A6D6FF" /></g>)}
      </g>
      <g className="bp-water-vessel" filter={`url(#${uid}-shadow)`}>
        <path d="M129 42h101l15 146c1 13-8 22-21 22h-89c-13 0-22-9-20-22Z" fill={`url(#${uid}-glass)`} stroke="#C6E5FF" strokeOpacity=".55" strokeWidth="2" />
        <clipPath id={`${uid}-tank`}><path d="M129 42h101l15 146c1 13-8 22-21 22h-89c-13 0-22-9-20-22Z" /></clipPath>
        <g clipPath={`url(#${uid}-tank)`}>
          <rect x="107" y="102" width="151" height="114" fill="#3689EE" fillOpacity=".7" />
          <path className="bp-water-wave bp-water-wave-back" d="M101 105q25-15 50 0t50 0 50 0 50 0v112H101Z" fill="#8CC8FF" fillOpacity=".32" />
          <path className="bp-water-wave" d="M98 111q24-12 48 0t48 0 48 0 48 0v106H98Z" fill="#4A98F2" fillOpacity=".72" />
          {[0,1,2,3,4,5].map(i => <circle key={i} className="bp-water-bubble" cx={137+(i%3)*36} cy={190-(i%2)*24} r={2.5+i%2*1.5} fill="#D9F0FF" opacity=".75" style={{ animationDelay: `${i*.34}s` }} />)}
          <path d="M136 54h20l-17 141" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="8" strokeLinecap="round" />
        </g>
        <rect x="146" y="27" width="67" height="20" rx="8" fill="#C8E4F8" fillOpacity=".45" stroke="#E9F7FF" strokeOpacity=".2" />
      </g>
      <g className="bp-water-drop" filter={`url(#${uid}-glow)`}>
        <path d="M294 52c-19 27-23 36-23 48a23 23 0 0 0 46 0c0-12-4-21-23-48Z" fill={`url(#${uid}-accent)`} stroke="#DDF2FF" strokeOpacity=".7" />
        <path d="M282 102c2 9 12 13 20 8" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
        <text x="294" y="104" textAnchor="middle" fill="#F1F9FF" fontSize="10" fontWeight="850">2%</text>
      </g>
    </>
  );
}

function SoundScene({ uid }: SceneProps) {
  const bars = [20,34,51,70,86,61,92,69,48,31,19];
  return (
    <>
      <g className="bp-sound-field">
        {[0,1,2,3].map(i => <ellipse key={i} cx="180" cy="111" rx={54+i*29} ry={29+i*15} fill="none" stroke={i%2?"#9C78FF":"#D2C5FF"} strokeOpacity={.3-i*.045} strokeWidth="1.5" style={{ animationDelay: `${i*.28}s` }} />)}
      </g>
      <g className="bp-sound-headphones" filter={`url(#${uid}-shadow)`}>
        <path d="M107 119V91c0-44 31-72 73-72s73 28 73 72v28" fill="none" stroke="#D8CFFF" strokeWidth="14" strokeLinecap="round" opacity=".76" />
        <path d="M114 87c2-34 28-55 66-55s64 21 66 55" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3" />
        <rect x="89" y="99" width="39" height="76" rx="18" fill={`url(#${uid}-accent)`} stroke="#E9E2FF" strokeOpacity=".68" />
        <rect x="232" y="99" width="39" height="76" rx="18" fill={`url(#${uid}-accent)`} stroke="#E9E2FF" strokeOpacity=".68" />
        <path d="M100 112v46M260 112v46" stroke="#fff" strokeOpacity=".2" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="bp-sound-eq">
        {bars.map((h,i) => <rect key={i} x={125+i*10} y={111-h/2} width="6" height={h} rx="3" fill={i>3&&i<8?"#F36CA9":"#C8B8FF"} opacity=".88" style={{ animationDelay: `${i*.075}s` }} />)}
      </g>
      <g className="bp-sound-limit">
        <rect x="136" y="190" width="88" height="18" rx="9" fill="#fff" fillOpacity=".09" stroke="#fff" strokeOpacity=".06" />
        <text x="180" y="202.5" textAnchor="middle" fill="#ECE7FF" fontSize="8" fontWeight="850" letterSpacing="1">85 DB LIMIT</text>
      </g>
    </>
  );
}

function FocusScene({ uid }: SceneProps) {
  const chips = [[48,55,"CHAT"],[310,50,"VIDEO"],[43,169,"PING"],[310,169,"TAB"]] as const;
  return (
    <>
      <path className="bp-focus-cone" d="M180 7 111 215h138Z" fill={`url(#${uid}-focus-beam)`} />
      <g className="bp-focus-orbits">
        <ellipse cx="180" cy="112" rx="103" ry="56" fill="none" stroke="#F6A8D1" strokeOpacity=".16" />
        <ellipse cx="180" cy="112" rx="77" ry="84" fill="none" stroke="#F6A8D1" strokeOpacity=".11" />
      </g>
      {chips.map(([x,y,t],i) => <g key={t} className="bp-focus-chip" style={{ animationDelay: `${i*.35}s` }}>
        <rect x={x-27} y={y-13} width="54" height="26" rx="9" fill="#fff" fillOpacity=".08" stroke="#FFB2D8" strokeOpacity=".28" />
        <circle cx={x-17} cy={y} r="2.5" fill="#FF78B7" />
        <text x={x+5} y={y+3} textAnchor="middle" fill="#FFD8EB" fontSize="7" fontWeight="850">{t}</text>
      </g>)}
      <g className="bp-focus-target" filter={`url(#${uid}-shadow)`}>
        <circle cx="180" cy="112" r="61" fill="#ED4897" fillOpacity=".07" stroke="#FFB3D8" strokeOpacity=".2" />
        {[45,31,17].map((r,i) => <circle key={r} cx="180" cy="112" r={r} fill={i===2?`url(#${uid}-accent)`:"none"} stroke="#FFB3D8" strokeWidth={i===2?2.5:1.7} strokeOpacity={.32+i*.16} />)}
        <circle cx="180" cy="112" r="6" fill="#FFF" filter={`url(#${uid}-glow)`} />
      </g>
      <path className="bp-focus-scan" d="M119 112h122" stroke="#FFE9F4" strokeWidth="1.5" strokeLinecap="round" opacity=".48" />
      <text x="180" y="204" textAnchor="middle" fill="#FFD3E8" fontSize="7" fontWeight="850" letterSpacing="1.25">ONE THING AT A TIME</text>
    </>
  );
}

function BreathScene({ uid }: SceneProps) {
  return (
    <>
      <g className="bp-breath-rings">
        {[0,1,2].map(i => <circle key={i} cx="180" cy="111" r={43+i*24} fill="none" stroke="#AEF6FF" strokeWidth="1.6" strokeOpacity={.29-i*.055} style={{ animationDelay: `${i*.45}s` }} />)}
      </g>
      <g className="bp-breath-lungs" filter={`url(#${uid}-shadow)`}>
        <path d="M176 68v51c-8 30-28 47-54 47-25 0-42-16-37-42 6-34 34-59 70-59h10" fill={`url(#${uid}-accent)`} fillOpacity=".27" stroke="#B4F6FF" strokeOpacity=".72" strokeWidth="2" />
        <path d="M184 68v51c8 30 28 47 54 47 25 0 42-16 37-42-6-34-34-59-70-59h-10" fill={`url(#${uid}-accent)`} fillOpacity=".27" stroke="#B4F6FF" strokeOpacity=".72" strokeWidth="2" />
        <path d="M180 29v92M180 87l-23 25M180 87l23 25" fill="none" stroke="#E8FCFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M111 118c13-22 29-34 49-39M249 118c-13-22-29-34-49-39" fill="none" stroke="#E8FCFF" strokeOpacity=".16" strokeWidth="1.5" />
      </g>
      <g className="bp-breath-airflow">
        <path d="M38 83h75" stroke="#77EAFA" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
        <path d="M247 143h75" stroke="#77EAFA" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
      </g>
      <g className="bp-breath-labels">
        <text x="39" y="68" fill="#D6FAFF" fontSize="7" fontWeight="850">INHALE</text>
        <text x="281" y="129" textAnchor="middle" fill="#D6FAFF" fontSize="7" fontWeight="850">EXHALE</text>
      </g>
      <circle className="bp-breath-dot" cx="104" cy="83" r="4" fill="#E8FCFF" filter={`url(#${uid}-glow)`} />
    </>
  );
}

function CaffeineScene({ uid }: SceneProps) {
  return (
    <>
      <g className="bp-coffee-clock" transform="translate(286 64)">
        <circle r="45" fill="#D87818" fillOpacity=".09" stroke="#FFC581" strokeOpacity=".32" />
        <circle r="33" fill="none" stroke="#F39823" strokeWidth="5" strokeDasharray="118 90" strokeLinecap="round" />
        <path d="M0 0V-18M0 0l15 8" stroke="#FFF3E4" strokeWidth="3" strokeLinecap="round" />
        <circle r="3" fill="#FFF3E4" />
      </g>
      <text x="286" y="120" textAnchor="middle" fill="#FFD5A4" fontSize="7" fontWeight="850" letterSpacing=".75">5 HR HALF-LIFE</text>
      <g className="bp-coffee-cup" filter={`url(#${uid}-shadow)`}>
        <ellipse cx="148" cy="183" rx="69" ry="8" fill="#05070C" fillOpacity=".38" />
        <path d="M79 94h139v55c0 28-22 49-50 49h-39c-28 0-50-21-50-49Z" fill="#F5F0E8" />
        <path d="M218 109h22c22 0 23 39 1 45h-23" fill="none" stroke="#FFB762" strokeWidth="11" />
        <ellipse cx="148.5" cy="94" rx="69.5" ry="17" fill="#8C4924" stroke="#FFD1A2" strokeOpacity=".56" />
        <ellipse cx="149" cy="91" rx="54" ry="10" fill="#4D2618" opacity=".6" />
        <path d="M91 112v36c0 20 14 35 34 39" fill="none" stroke="#fff" strokeOpacity=".36" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="bp-coffee-steam">
        <path d="M116 78c-12-16 13-23 1-42M148 77c-12-18 13-25 1-46M180 79c-12-15 13-22 2-37" fill="none" stroke="#FFE0BF" strokeWidth="3" strokeLinecap="round" />
      </g>
      {[[42,57],[54,184],[318,173]].map(([x,y],i) => <g key={i} className="bp-coffee-receptor" style={{ animationDelay: `${i*.45}s` }}>
        <path d={`M${x-9} ${y-10}h18v12l-9 8-9-8Z`} fill="#E6841D" fillOpacity=".3" stroke="#FFC078" strokeOpacity=".8" />
        <circle cx={x} cy={y-2} r="3" fill="#FFF0DE" />
      </g>)}
    </>
  );
}

function VisionScene({ uid }: SceneProps) {
  return (
    <>
      <g className="bp-vision-rays">
        <path d="M27 54 144 98M27 169l117-45M333 54 216 98M333 169l-117-45" fill="none" stroke="#65E5AD" strokeWidth="2" strokeDasharray="7 8" opacity=".42" />
      </g>
      <path className="bp-vision-eye" d="M30 111Q180 10 330 111Q180 212 30 111Z" fill="#20CA89" fillOpacity=".075" stroke="#B1F7D6" strokeOpacity=".58" strokeWidth="2.5" />
      <g className="bp-vision-iris" filter={`url(#${uid}-shadow)`}>
        <circle cx="180" cy="111" r="59" fill="#D1FAE5" fillOpacity=".15" stroke="#77E6B2" strokeOpacity=".46" />
        <circle cx="180" cy="111" r="39" fill={`url(#${uid}-accent)`} fillOpacity=".78" stroke="#B3F7D7" strokeWidth="3" />
        {[0,30,60,90,120,150].map(a => <line key={a} x1="180" y1="77" x2="180" y2="88" stroke="#D8FFEB" strokeOpacity=".32" transform={`rotate(${a} 180 111)`} />)}
        <circle className="bp-vision-pupil" cx="180" cy="111" r="16" fill="#05151A" />
        <circle cx="167" cy="97" r="7" fill="#fff" fillOpacity=".82" />
        <circle cx="191" cy="124" r="3" fill="#fff" fillOpacity=".18" />
      </g>
      <g className="bp-vision-screen">
        <rect x="28" y="24" width="53" height="30" rx="8" fill="#5A9BCE" fillOpacity=".3" stroke="#A6D7FF" strokeOpacity=".54" />
        <path d="M37 44h35M41 33h27" stroke="#E5F5FF" strokeOpacity=".7" strokeWidth="2" />
      </g>
      <g className="bp-vision-sun" filter={`url(#${uid}-glow)`}>
        <circle cx="319" cy="39" r="14" fill="#FFD24F" />
        {[0,45,90,135].map(a => <line key={a} x1="319" y1="17" x2="319" y2="9" stroke="#FFD24F" strokeWidth="2" transform={`rotate(${a} 319 39)`} />)}
      </g>
      <text x="29" y="201" fill="#BBDFFF" fontSize="7" fontWeight="850">NEAR</text>
      <text x="304" y="201" fill="#AEF6D3" fontSize="7" fontWeight="850">FAR</text>
    </>
  );
}

const SCENES: Record<LabId, (props: SceneProps) => ReactNode> = {
  sleep: SleepScene,
  energy: EnergyScene,
  stress: StressScene,
  hydration: HydrationScene,
  sound: SoundScene,
  focus: FocusScene,
  breath: BreathScene,
  caffeine: CaffeineScene,
  vision: VisionScene,
};

export default function BlueprintArt({ id, hovered = false, reduced = false, featured = false }: Props) {
  const rawId = useId();
  const uid = `bp-${id}-${rawId.replace(/:/g, "")}`;
  const theme = THEMES[id];
  const Scene = SCENES[id];
  const rootStyle = { "--bp-accent": theme.accent, "--bp-glow": theme.glow } as CSSProperties;
  const framePath = featured
    ? "M-32 32V16h16M392 16h16v16M-32 188v16h16M392 204h16v-16"
    : "M16 32V16h16M328 16h16v16M16 188v16h16M328 204h16v-16";
  const titleX = featured ? -21 : 29;
  const titleDotX = featured ? -29 : 21;
  const liveX = featured ? 399 : 337;
  const liveDotX = featured ? 405 : 343;

  return (
    <svg
      viewBox={featured ? "-48 0 456 220" : "0 0 360 220"}
      className={`bp-art-root bp-art-${id} ${hovered ? "is-hovered" : ""} ${reduced ? "is-reduced" : ""} ${featured ? "is-featured" : ""}`}
      style={rootStyle}
      aria-hidden="true"
      preserveAspectRatio={featured ? "xMidYMid meet" : "xMidYMid slice"}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.from} /><stop offset=".5" stopColor={theme.mid} /><stop offset="1" stopColor={theme.to} /></linearGradient>
        <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.accent} /><stop offset="1" stopColor={theme.glow} /></linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".17" /><stop offset=".42" stopColor="#fff" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".12" /></linearGradient>
        <radialGradient id={`${uid}-halo`} cx="76%" cy="10%" r="82%"><stop stopColor={theme.glow} stopOpacity=".25" /><stop offset=".55" stopColor={theme.glow} stopOpacity=".05" /><stop offset="1" stopColor={theme.glow} stopOpacity="0" /></radialGradient>
        <radialGradient id={`${uid}-vignette`} cx="50%" cy="43%" r="74%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".32" /></radialGradient>
        <linearGradient id={`${uid}-focus-beam`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FFDDF0" stopOpacity=".12" /><stop offset="1" stopColor="#FFDDF0" stopOpacity="0" /></linearGradient>
        <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" strokeOpacity=".044" /><circle cx="1" cy="1" r=".8" fill="#fff" fillOpacity=".1" /></pattern>
        <pattern id={`${uid}-scan`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5h360" stroke="#fff" strokeOpacity=".022" /></pattern>
        <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="230%"><feDropShadow dx="0" dy="11" stdDeviation="9" floodColor="#00040B" floodOpacity=".48" /></filter>
        <filter id={`${uid}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect x="-50" width="460" height="220" fill={`url(#${uid}-bg)`} />
      <rect x="-50" width="460" height="220" fill={`url(#${uid}-grid)`} />
      <rect x="-50" width="460" height="220" fill={`url(#${uid}-halo)`} />
      <g className="bp-art-contours" fill="none" stroke={theme.accent} strokeOpacity=".075">
        <path d="M-34 203C70 128 167 226 394 80" />
        <path d="M-25 221C78 147 178 242 403 98" />
        <path d="M-18 238C91 170 193 255 411 119" />
      </g>
      <g className="bp-art-scene"><Scene uid={uid} /></g>
      <rect x="-50" width="460" height="220" fill={`url(#${uid}-scan)`} pointerEvents="none" />
      <rect x="-50" width="460" height="220" fill={`url(#${uid}-vignette)`} pointerEvents="none" />
      <path className="bp-art-sheen" d="M-80 224 121-18h82L0 224Z" fill="#fff" fillOpacity=".035" />
      <g className="bp-art-frame" fill="none" stroke="#fff" strokeOpacity=".25">
        <path d={framePath} />
      </g>
      <g className="bp-art-title">
        <circle cx={titleDotX} cy="26" r="2.4" fill={theme.accent} filter={`url(#${uid}-glow)`} />
        <text x={titleX} y="29" fill={theme.accent} fontSize="8" fontWeight="850" letterSpacing="1.6">{theme.label}</text>
      </g>
      <g className="bp-art-live">
        <text x={liveX} y="29" textAnchor="end" fill="#fff" fillOpacity=".46" fontSize="6.5" fontWeight="750" letterSpacing="1">LIVE MODEL</text>
        <circle cx={liveDotX} cy="26" r="2" fill={theme.accent} fillOpacity=".72" />
      </g>
    </svg>
  );
}

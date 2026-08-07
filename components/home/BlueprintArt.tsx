"use client";

import { useId, type ReactNode } from "react";
import type { LabId } from "@/components/labs/labs-meta";

type Props = {
  id: LabId;
  hovered?: boolean;
  reduced?: boolean;
  featured?: boolean;
};

const THEMES: Record<LabId, { accent: string; glow: string; from: string; to: string; label: string }> = {
  sleep: { accent: "#5EEAD4", glow: "#2DD4BF", from: "#102F46", to: "#071421", label: "NIGHT SIGNAL" },
  energy: { accent: "#FCD34D", glow: "#F59E0B", from: "#543719", to: "#171A22", label: "FUEL CELL" },
  stress: { accent: "#FCA5A1", glow: "#F87171", from: "#4B2632", to: "#171525", label: "PRESSURE LOAD" },
  hydration: { accent: "#93C5FD", glow: "#3B82F6", from: "#153D64", to: "#09192D", label: "FLUID BALANCE" },
  sound: { accent: "#C4B5FD", glow: "#8B5CF6", from: "#35275F", to: "#11142B", label: "SOUND FIELD" },
  focus: { accent: "#F9A8D4", glow: "#EC4899", from: "#4A2148", to: "#15152A", label: "ATTENTION FIELD" },
  breath: { accent: "#A5F3FC", glow: "#06B6D4", from: "#16465B", to: "#081C2C", label: "BREATH RHYTHM" },
  caffeine: { accent: "#FDBA74", glow: "#D97706", from: "#4A2C1C", to: "#17151B", label: "HALF-LIFE" },
  vision: { accent: "#A7F3D0", glow: "#10B981", from: "#17483D", to: "#091E25", label: "FOCUS SYSTEM" },
};

function SleepScene({ uid }: { uid: string }) {
  const waves = [
    [104, 8, "#5EEAD4"], [121, 6, "#93C5FD"], [137, 4, "#FCD34D"], [151, 3, "#C4B5FD"],
  ] as const;
  return (
    <>
      <circle cx="86" cy="73" r="35" fill="#FFF0B7" filter={`url(#${uid}-soft)`} opacity=".18" />
      <path d="M91 43a26 26 0 1 1-22-31 21 21 0 0 0 22 31Z" fill="#FFF0B7" />
      <g className="bp-art-stars">
        {[[34,44],[52,88],[123,31],[155,56],[329,42],[305,75]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?1.4:2} fill="#E8F7FF" style={{animationDelay:`${i*.3}s`}} />)}
      </g>
      <rect x="42" y="169" width="276" height="18" rx="9" fill="#07111E" stroke="#6F8EA5" strokeOpacity=".35" />
      <rect x="52" y="150" width="73" height="23" rx="11" fill="#EEF6F7" />
      <circle cx="113" cy="148" r="16" fill="#D99A78" />
      <path d="M97 148c3-17 29-17 32 0-10-6-22-7-32 0Z" fill="#101A2D" />
      <path d="M126 157c51-20 126-6 181 17v13H124Z" fill={`url(#${uid}-accent)`} opacity=".86" />
      <g className="bp-art-wave-stack">
        {waves.map(([y,a,c],i)=><path key={i} d={`M144 ${y}c18-${a} 34-${a} 52 0s34 ${a} 52 0 34-${a} 52 0`} fill="none" stroke={c} strokeWidth={i===0?3:2} strokeLinecap="round" opacity={.85-i*.12} style={{animationDelay:`${i*.18}s`}} />)}
      </g>
      <g className="bp-art-cycle" transform="translate(268 67)">
        <circle r="35" fill="#2DD4BF" fillOpacity=".08" stroke="#5EEAD4" strokeOpacity=".28" />
        <circle r="25" fill="none" stroke="#5EEAD4" strokeWidth="4" strokeDasharray="98 60" strokeLinecap="round" />
        <text y="4" textAnchor="middle" fill="#D9FFFA" fontSize="10" fontWeight="800">90 MIN</text>
      </g>
    </>
  );
}

function EnergyScene({ uid }: { uid: string }) {
  return (
    <>
      <g className="bp-art-orbit" transform="translate(181 106)">
        <ellipse rx="126" ry="67" fill="none" stroke="#FCD34D" strokeOpacity=".2" strokeDasharray="5 8" />
        <circle cx="-123" cy="0" r="7" fill="#FB923C" />
        <circle cx="118" cy="-14" r="7" fill="#34D399" />
      </g>
      <g filter={`url(#${uid}-shadow)`}>
        <rect x="107" y="49" width="150" height="112" rx="30" fill="#121826" stroke="#FCD34D" strokeOpacity=".36" strokeWidth="2" />
        <rect x="257" y="82" width="14" height="46" rx="7" fill="#FCD34D" fillOpacity=".65" />
        <rect x="121" y="63" width="121" height="84" rx="20" fill="#F59E0B" fillOpacity=".12" />
        <path className="bp-art-bolt" d="m187 65-39 54h31l-8 38 43-60h-31Z" fill="#FCD34D" stroke="#FFF7CF" strokeWidth="2" />
      </g>
      <g className="bp-art-meter">
        {[0,1,2,3,4].map(i=><rect key={i} x={44} y={145-i*22} width={35+i*3} height="13" rx="6" fill={i<4?"#F59E0B":"#34D399"} opacity={.28+i*.14} />)}
      </g>
      <path d="M43 173C86 166 88 116 117 108" fill="none" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 6" opacity=".55" />
      <text x="42" y="54" fill="#FFEAB1" fontSize="9" fontWeight="800" letterSpacing="1.4">INPUT</text>
      <text x="283" y="177" fill="#6EE7B7" fontSize="9" fontWeight="800" letterSpacing="1.4">STEADY</text>
    </>
  );
}

function StressScene({ uid }: { uid: string }) {
  const nodes = [[63,55],[43,105],[72,159],[296,55],[318,106],[290,161]];
  return (
    <>
      {nodes.map(([x,y],i)=><g key={i}><path d={`M${x} ${y}Q${i<3?115:245} ${105+(i%3-1)*18} 180 108`} fill="none" stroke={i%2?"#FCA5A1":"#FBBF24"} strokeOpacity=".42" strokeWidth="2" /><circle className="bp-art-node" cx={x} cy={y} r={7+i%2*2} fill={i%2?"#F87171":"#F59E0B"} style={{animationDelay:`${i*.18}s`}} /></g>)}
      <g filter={`url(#${uid}-shadow)`}>
        <circle cx="180" cy="108" r="61" fill="#190F1D" stroke="#FCA5A1" strokeOpacity=".24" />
        {[49,38,27].map((r,i)=><circle key={r} className="bp-art-pressure" cx="180" cy="108" r={r} fill="none" stroke={i===2?"#F87171":"#FB7185"} strokeWidth={i===2?4:2} strokeOpacity={.26+i*.18} style={{animationDelay:`${i*.28}s`}} />)}
        <path d="M164 126c-11-7-14-20-9-31 4-10 13-17 25-17 15 0 27 12 27 27 0 8-4 16-10 21v15h-29v-11Z" fill="#FCA5A1" fillOpacity=".82" />
        <path d="M172 100c6-8 18-8 24 0M170 110h22" fill="none" stroke="#3B1724" strokeWidth="3" strokeLinecap="round" />
      </g>
      <rect x="128" y="185" width="104" height="8" rx="4" fill="#fff" fillOpacity=".09" />
      <rect className="bp-art-load" x="128" y="185" width="79" height="8" rx="4" fill="#F87171" />
      <text x="180" y="207" textAnchor="middle" fill="#FFD6D2" fontSize="8" fontWeight="800" letterSpacing="1.2">LOAD BUILDING</text>
    </>
  );
}

function HydrationScene({ uid }: { uid: string }) {
  return (
    <>
      <g filter={`url(#${uid}-shadow)`}>
        <path d="M132 38h96l14 152c1 10-7 18-17 18h-90c-10 0-18-8-17-18Z" fill="#DDEEFF" fillOpacity=".1" stroke="#BFDBFE" strokeOpacity=".55" strokeWidth="2" />
        <clipPath id={`${uid}-tank`}><path d="M132 38h96l14 152c1 10-7 18-17 18h-90c-10 0-18-8-17-18Z" /></clipPath>
        <g clipPath={`url(#${uid}-tank)`}>
          <rect x="110" y="92" width="145" height="120" fill={`url(#${uid}-accent)`} opacity=".62" />
          <path className="bp-art-water" d="M109 97q22-12 44 0t44 0 44 0 44 0v116H109Z" fill="#60A5FA" fillOpacity=".55" />
          {[0,1,2,3,4].map(i=><circle key={i} className="bp-art-bubble" cx={145+i*20} cy={184-i*16} r={3+i%2*2} fill="#E0F2FE" opacity=".65" style={{animationDelay:`${i*.3}s`}} />)}
        </g>
        <rect x="148" y="23" width="64" height="20" rx="8" fill="#B9D8F0" fillOpacity=".5" />
      </g>
      {[62,106,154].map((y,i)=><g key={y}><line x1="55" y1={y} x2="108" y2={y} stroke="#93C5FD" strokeOpacity=".36" strokeDasharray="3 5" /><circle cx="48" cy={y} r={11} fill="#3B82F6" fillOpacity={.15+i*.1} stroke="#93C5FD" strokeOpacity=".5" /><circle cx="48" cy={y} r="4" fill="#93C5FD" /></g>)}
      <path d="M278 54c-18 25-21 33-21 43a21 21 0 0 0 42 0c0-10-4-18-21-43Z" fill="#60A5FA" fillOpacity=".72" stroke="#BFDBFE" />
      <text x="278" y="102" textAnchor="middle" fill="#E0F2FE" fontSize="10" fontWeight="800">2%</text>
    </>
  );
}

function SoundScene() {
  const bars = [19,35,53,73,91,70,49,82,61,39,20];
  return (
    <>
      {[0,1,2].map(i=><ellipse key={i} className="bp-art-sound-ring" cx="180" cy="113" rx={62+i*35} ry={36+i*17} fill="none" stroke="#C4B5FD" strokeOpacity={.32-i*.07} strokeWidth="2" style={{animationDelay:`${i*.25}s`}} />)}
      <path d="M106 121V89c0-42 33-68 74-68s74 26 74 68v32" fill="none" stroke="#DDD6FE" strokeWidth="13" strokeLinecap="round" opacity=".72" />
      <rect x="90" y="101" width="36" height="70" rx="17" fill="#8B5CF6" stroke="#E9D5FF" strokeOpacity=".7" />
      <rect x="234" y="101" width="36" height="70" rx="17" fill="#8B5CF6" stroke="#E9D5FF" strokeOpacity=".7" />
      <g className="bp-art-eq">
        {bars.map((h,i)=><rect key={i} x={125+i*10} y={113-h/2} width="6" height={h} rx="3" fill={i>3&&i<8?"#F472B6":"#C4B5FD"} opacity=".8" style={{animationDelay:`${i*.08}s`}} />)}
      </g>
      <rect x="136" y="189" width="88" height="19" rx="9" fill="#fff" fillOpacity=".08" />
      <text x="180" y="202" textAnchor="middle" fill="#E9D5FF" fontSize="9" fontWeight="800" letterSpacing="1">85 DB LIMIT</text>
    </>
  );
}

function FocusScene({ uid }: { uid: string }) {
  const chips = [[49,55,"CHAT"],[287,48,"VIDEO"],[42,165,"PING"],[294,168,"TAB"]] as const;
  return (
    <>
      <path d="M181 11 112 211h138Z" fill="#FDF2F8" fillOpacity=".07" />
      {chips.map(([x,y,t],i)=><g key={t} className="bp-art-distraction" style={{animationDelay:`${i*.3}s`}}><rect x={x-28} y={y-13} width="56" height="26" rx="9" fill="#fff" fillOpacity=".08" stroke="#F9A8D4" strokeOpacity=".28" /><text x={x} y={y+3} textAnchor="middle" fill="#FBCFE8" fontSize="8" fontWeight="800">{t}</text></g>)}
      <g filter={`url(#${uid}-shadow)`}>
        <circle cx="181" cy="113" r="66" fill="#EC4899" fillOpacity=".08" stroke="#F9A8D4" strokeOpacity=".22" />
        {[48,32,17].map((r,i)=><circle key={r} className="bp-art-target" cx="181" cy="113" r={r} fill={i===2?"#EC4899":"none"} fillOpacity=".82" stroke="#F9A8D4" strokeWidth="2" strokeOpacity={.42+i*.16} />)}
        <circle cx="181" cy="113" r="6" fill="#FFF" />
      </g>
      <path className="bp-art-scan" d="M121 113h120" stroke="#FDF2F8" strokeWidth="2" strokeLinecap="round" opacity=".5" />
      <text x="181" y="201" textAnchor="middle" fill="#FBCFE8" fontSize="9" fontWeight="800" letterSpacing="1.4">ONE THING AT A TIME</text>
    </>
  );
}

function BreathScene() {
  return (
    <>
      {[0,1,2].map(i=><circle key={i} className="bp-art-breath-ring" cx="180" cy="112" r={46+i*24} fill="none" stroke="#A5F3FC" strokeWidth="2" strokeOpacity={.3-i*.06} style={{animationDelay:`${i*.45}s`}} />)}
      <path d="M177 64v59c-8 26-29 43-55 43-24 0-39-16-35-39 6-35 35-58 69-58h9" fill="#06B6D4" fillOpacity=".28" stroke="#A5F3FC" strokeOpacity=".68" strokeWidth="2" />
      <path d="M183 64v59c8 26 29 43 55 43 24 0 39-16 35-39-6-35-35-58-69-58h-9" fill="#06B6D4" fillOpacity=".28" stroke="#A5F3FC" strokeOpacity=".68" strokeWidth="2" />
      <path d="M180 28v91M180 88l-22 23M180 88l22 23" fill="none" stroke="#E0FBFF" strokeWidth="6" strokeLinecap="round" />
      <g className="bp-art-airflow">
        <path d="M47 82h61" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 7" />
        <path d="M252 142h61" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 7" />
      </g>
      <text x="48" y="67" fill="#CFFAFE" fontSize="8" fontWeight="800">INHALE</text>
      <text x="270" y="128" fill="#CFFAFE" fontSize="8" fontWeight="800">EXHALE</text>
    </>
  );
}

function CaffeineScene({ uid }: { uid: string }) {
  return (
    <>
      <g filter={`url(#${uid}-shadow)`}>
        <path d="M80 94h125v58c0 25-20 45-45 45h-35c-25 0-45-20-45-45Z" fill="#FFF7ED" fillOpacity=".9" />
        <path d="M205 108h20c20 0 20 35 1 40h-21" fill="none" stroke="#FDBA74" strokeWidth="10" />
        <ellipse cx="142" cy="95" rx="62" ry="15" fill="#7C3F1D" stroke="#FED7AA" strokeOpacity=".55" />
        <path className="bp-art-steam" d="M115 77c-13-16 14-23 1-39M145 76c-13-18 14-25 1-44M174 78c-12-15 13-21 2-35" fill="none" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="bp-art-clock" transform="translate(267 91)">
        <circle r="48" fill="#D97706" fillOpacity=".12" stroke="#FDBA74" strokeOpacity=".4" />
        <circle r="34" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="118 96" strokeLinecap="round" />
        <path d="M0 0V-18M0 0l15 8" stroke="#FFF7ED" strokeWidth="3" strokeLinecap="round" />
        <text y="66" textAnchor="middle" fill="#FED7AA" fontSize="8" fontWeight="800">5 HR HALF-LIFE</text>
      </g>
      {[ [43,52],[53,183],[317,165] ].map(([x,y],i)=><g key={i} className="bp-art-receptor"><path d={`M${x-9} ${y-10}h18v12l-9 8-9-8Z`} fill="#F59E0B" fillOpacity=".34" stroke="#FDBA74" /><circle cx={x} cy={y-2} r="3" fill="#FFF7ED" /></g>)}
    </>
  );
}

function VisionScene({ uid }: { uid: string }) {
  return (
    <>
      <path d="M35 111Q180 13 325 111Q180 209 35 111Z" fill="#10B981" fillOpacity=".1" stroke="#A7F3D0" strokeOpacity=".58" strokeWidth="2.5" />
      <g filter={`url(#${uid}-shadow)`}>
        <circle cx="180" cy="111" r="58" fill="#D1FAE5" fillOpacity=".2" stroke="#6EE7B7" strokeOpacity=".55" />
        <circle className="bp-art-iris" cx="180" cy="111" r="36" fill="#10B981" fillOpacity=".75" stroke="#A7F3D0" strokeWidth="3" />
        <circle cx="180" cy="111" r="15" fill="#06161D" />
        <circle cx="168" cy="98" r="7" fill="#fff" fillOpacity=".78" />
      </g>
      <path className="bp-art-focus-ray" d="M34 60 145 99M34 162l111-39M326 60 215 99M326 162l-111-39" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="6 7" opacity=".48" />
      <rect x="32" y="28" width="51" height="28" rx="7" fill="#60A5FA" fillOpacity=".32" stroke="#93C5FD" strokeOpacity=".55" />
      <path d="M40 48h35M44 36h27" stroke="#DBEAFE" strokeOpacity=".7" strokeWidth="2" />
      <circle cx="317" cy="40" r="14" fill="#FCD34D" />
      {[0,45,90,135].map(a=><line key={a} x1="317" y1="17" x2="317" y2="10" stroke="#FCD34D" strokeWidth="2" transform={`rotate(${a} 317 40)`} />)}
      <text x="31" y="198" fill="#BFDBFE" fontSize="8" fontWeight="800">NEAR</text>
      <text x="295" y="198" fill="#A7F3D0" fontSize="8" fontWeight="800">FAR</text>
    </>
  );
}

const SCENES: Record<LabId, (p: { uid: string }) => ReactNode> = {
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

  return (
    <svg
      viewBox="0 0 360 220"
      className={`bp-art-root ${hovered ? "is-hovered" : ""} ${reduced ? "is-reduced" : ""} ${featured ? "is-featured" : ""}`}
      aria-hidden="true"
      preserveAspectRatio={featured ? "xMidYMid meet" : "xMidYMid slice"}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.from} /><stop offset="1" stopColor={theme.to} /></linearGradient>
        <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.accent} /><stop offset="1" stopColor={theme.glow} /></linearGradient>
        <radialGradient id={`${uid}-halo`} cx="78%" cy="12%" r="78%"><stop stopColor={theme.glow} stopOpacity=".28" /><stop offset="1" stopColor={theme.glow} stopOpacity="0" /></radialGradient>
        <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" strokeOpacity=".045" /><circle cx="1" cy="1" r=".8" fill="#fff" fillOpacity=".1" /></pattern>
        <filter id={`${uid}-shadow`} x="-40%" y="-40%" width="180%" height="210%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000714" floodOpacity=".42" /></filter>
        <filter id={`${uid}-soft`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <rect width="360" height="220" fill={`url(#${uid}-bg)`} />
      <rect width="360" height="220" fill={`url(#${uid}-grid)`} />
      <rect width="360" height="220" fill={`url(#${uid}-halo)`} />
      <path d="M-18 211C82 152 198 210 382 92" fill="none" stroke="#fff" strokeOpacity=".045" strokeWidth="32" />
      <g className="bp-art-scene"><Scene uid={uid} /></g>
      <g className="bp-art-frame" fill="none" stroke="#fff" strokeOpacity=".23">
        <path d="M16 32V16h16M328 16h16v16M16 188v16h16M328 204h16v-16" />
      </g>
      <text x="22" y="28" fill={theme.accent} fontSize="8" fontWeight="800" letterSpacing="1.6">{theme.label}</text>
      <text x="338" y="28" textAnchor="end" fill="#fff" fillOpacity=".42" fontSize="7" fontWeight="700" letterSpacing="1">LIVE MODEL</text>
    </svg>
  );
}

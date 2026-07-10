"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, Smartphone, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { SiteNav, SiteFooter } from "@/components/site/SiteChrome";
import { LABS, LAB_TAGS, labMeta, type LabId, type LabMeta } from "@/components/labs/labs-meta";
import { ARTICLES } from "@/lib/articles";

// Lab identity (names, hooks, stats, accents) lives in labs-meta so the
// homepage, lab headers, and next-lab cards never drift apart. Only the
// illustrations are homepage-specific.
const LAB_SVGS: Record<LabId, (p: { hovered: boolean; reduced: boolean }) => React.ReactNode> = {
  sleep: SleepSVG,
  energy: EnergySVG,
  stress: StressSVG,
  hydration: HydrationSVG,
  sound: SoundSVG,
  focus: FocusSVG,
  breath: BreathSVG,
  caffeine: CaffeineSVG,
  vision: VisionSVG,
};

function makeSineWavePath(y: number, amp: number, period: number): string {
  const k = 4 / 3;
  const cp = period / 4;
  let d = `M ${-period} ${y}`;
  for (let x = -period; x < 360; x += period) {
    d += ` C ${x + cp} ${y - amp * k} ${x + cp} ${y - amp * k} ${x + period / 2} ${y}`;
    d += ` C ${x + period / 2 + cp} ${y + amp * k} ${x + period / 2 + cp} ${y + amp * k} ${x + period} ${y}`;
  }
  return d;
}

const SLEEP_WAVES = [
  { y: 70,  amp: 9, period: 80, color: "#2DD4BF", dur: "5s",   sw: 1.8 },
  { y: 84,  amp: 7, period: 58, color: "#60A5FA", dur: "3.5s", sw: 1.6 },
  { y: 97,  amp: 5, period: 43, color: "#F59E0B", dur: "2.6s", sw: 1.5 },
  { y: 109, amp: 4, period: 31, color: "#F87171", dur: "1.8s", sw: 1.4 },
  { y: 120, amp: 3, period: 22, color: "#A78BFA", dur: "1.2s", sw: 1.3 },
].map((w) => ({ ...w, path: makeSineWavePath(w.y, w.amp, w.period) }));

function SleepSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id="slp-wc">
          <rect x="8" y="58" width="224" height="82" />
        </clipPath>
      </defs>

      {/* Head silhouette */}
      <circle cx="120" cy="28" r="20" fill="#001A33" fillOpacity="0.82" />

      {/* EEG brainwave lines */}
      <g clipPath="url(#slp-wc)">
        {SLEEP_WAVES.map((wave, i) => (
          <g key={i}>
            {!reduced && (
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to={`${-wave.period} 0`}
                dur={wave.dur}
                repeatCount="indefinite"
              />
            )}
            <path
              d={wave.path}
              stroke={wave.color}
              strokeWidth={wave.sw}
              strokeOpacity={hovered ? 0.95 : 0.72}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 0.4s ease" }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

function EnergySVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  // Curve: baseline y=93. Spike peak ~y=26 at x≈78. Crash dips to ~y=120 at x≈126. Recovery by x≈175.
  const curvePath = "M 26 93 L 50 93 C 58 93 63 30 78 24 C 93 18 100 68 106 83 C 112 98 118 120 126 124 C 134 128 140 112 152 100 C 158 94 165 90 178 91 L 214 93";

  return (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Curve gradient: green→amber→red→coral→amber→teal */}
        <linearGradient id="eng-curve" x1="26" y1="0" x2="214" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#10B981" stopOpacity="0.7" />
          <stop offset="22%"  stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="30%"  stopColor="#EF4444" stopOpacity="1"   />
          <stop offset="44%"  stopColor="#F87171" stopOpacity="0.95"/>
          <stop offset="58%"  stopColor="#FB923C" stopOpacity="0.85"/>
          <stop offset="75%"  stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.65"/>
        </linearGradient>
        {/* Spike area fill — red glow above baseline */}
        <linearGradient id="eng-spike-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.03" />
        </linearGradient>
        {/* Crash area fill — red-orange below baseline */}
        <linearGradient id="eng-crash-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.18" />
        </linearGradient>
        {/* Stable area fill — soft green */}
        <linearGradient id="eng-stable-fill" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Axes */}
      <line x1="26" y1="93" x2="218" y2="93" stroke="#94A3B8" strokeWidth="0.9" strokeOpacity="0.45" />
      <line x1="26" y1="22" x2="26" y2="135" stroke="#94A3B8" strokeWidth="0.9" strokeOpacity="0.35" />
      <text x="220" y="96" fontSize="6.5" fill="#94A3B8" fillOpacity="0.55" fontFamily="Inter,sans-serif">base</text>

      {/* Spike area — red fill between curve and baseline (rise/peak portion) */}
      <path
        d="M 50 93 C 58 93 63 30 78 24 C 93 18 100 68 106 83 C 109 90 110 93 110 93 Z"
        fill="url(#eng-spike-fill)"
      />

      {/* Crash area — orange-red fill below baseline */}
      <path
        d="M 110 93 C 114 102 118 120 126 124 C 134 128 140 112 152 100 C 156 96 160 93 164 93 Z"
        fill="url(#eng-crash-fill)"
      />

      {/* Stable recovery area — green fill */}
      <path
        d="M 164 93 C 168 91 172 89 178 91 L 214 93 Z"
        fill="url(#eng-stable-fill)"
      />

      {/* Glucose curve with color gradient */}
      <path
        d={curvePath}
        stroke="url(#eng-curve)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeOpacity={hovered ? 1 : 0.82}
        style={{ transition: "stroke-opacity 0.4s ease" }}
      />

      {/* Peak drop line */}
      <line x1="78" y1="24" x2="78" y2="93" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity={hovered ? 0.45 : 0.2} style={{ transition: "stroke-opacity 0.4s ease" }} />

      {/* Traveling dot — parks at the peak when motion is reduced */}
      <circle r="4.5" fill="white" stroke="#EF4444" strokeWidth="1.5" {...(reduced ? { cx: 78, cy: 24 } : {})}>
        {!reduced && <animateMotion dur={hovered ? "2.4s" : "4s"} repeatCount="indefinite" path={curvePath} />}
      </circle>

      {/* Food emoji markers */}
      <text x="70" y="20" fontSize="13" fontFamily="serif" style={{ userSelect: "none" }}>🍩</text>
      <text x="173" y="85" fontSize="11" fontFamily="serif" style={{ userSelect: "none" }}>🥑</text>

      {/* Zone labels */}
      <text x="116" y="112" fontSize="6.5" fill="#EF4444" fillOpacity={hovered ? 0.8 : 0.5} fontFamily="Inter,sans-serif" style={{ transition: "fill-opacity 0.35s ease" }}>crash</text>
      <text x="173" y="104" fontSize="6.5" fill="#10B981" fillOpacity={hovered ? 0.8 : 0.5} fontFamily="Inter,sans-serif" style={{ transition: "fill-opacity 0.35s ease" }}>stable</text>

      {/* Time axis */}
      {[50, 96, 142, 188].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="93" x2={x} y2="97" stroke="#94A3B8" strokeWidth="0.8" strokeOpacity="0.35" />
          <text x={x - 7} y="106" fontSize="6.5" fill="#94A3B8" fillOpacity="0.45" fontFamily="Inter,sans-serif">{`${i * 30}m`}</text>
        </g>
      ))}
    </svg>
  );
}

const STRESS_LEVELS = [
  { y: 50,  color: "#2DD4BF", dotColor: "#5EEAD4" },
  { y: 66,  color: "#60A5FA", dotColor: "#93C5FD" },
  { y: 82,  color: "#F59E0B", dotColor: "#FCD34D" },
  { y: 98,  color: "#F97316", dotColor: "#FDBA74" },
  { y: 114, color: "#F87171", dotColor: "#FCA5A1" },
];

const STR_SPINE_TOP = 30;
const STR_SPINE_BTM = 130;
const STR_SPINE_DUR = 2.4;
const STR_BRANCH_DUR = 1.0;

function StressSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  const spinePath = `M 120 ${STR_SPINE_TOP} L 120 ${STR_SPINE_BTM}`;
  const secondDotBegin = `-${(STR_SPINE_DUR * 0.42).toFixed(2)}s`;

  return (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="str-spine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#2DD4BF" />
          <stop offset="45%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F87171" />
        </linearGradient>
      </defs>

      {/* Central spine */}
      <line
        x1="120" y1={STR_SPINE_TOP} x2="120" y2={STR_SPINE_BTM}
        stroke="url(#str-spine)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity={hovered ? 0.88 : 0.62}
        style={{ transition: "stroke-opacity 0.4s ease" }}
      />

      {/* Branch lines */}
      {STRESS_LEVELS.map((lv, i) => (
        <g key={i}>
          <path
            d={`M 120 ${lv.y} Q 90 ${lv.y - 3} 58 ${lv.y + 9}`}
            stroke={lv.color} strokeWidth="1.5" strokeLinecap="round"
            strokeOpacity={hovered ? 0.85 : 0.52}
            style={{ transition: "stroke-opacity 0.4s ease" }}
          />
          <path
            d={`M 120 ${lv.y} Q 150 ${lv.y - 3} 182 ${lv.y + 9}`}
            stroke={lv.color} strokeWidth="1.5" strokeLinecap="round"
            strokeOpacity={hovered ? 0.85 : 0.52}
            style={{ transition: "stroke-opacity 0.4s ease" }}
          />
        </g>
      ))}

      {/* Spine + branch pulse dots are pure motion — hidden when motion is reduced */}
      {!reduced && (
      <>
      {/* Spine pulse dots */}
      <circle r="3.5" fill="white">
        <animateMotion dur={`${STR_SPINE_DUR}s`} repeatCount="indefinite" path={spinePath} />
        <animate attributeName="fill-opacity"
          values="0.9;0.9;0.4;0.9" keyTimes="0;0.72;0.92;1"
          dur={`${STR_SPINE_DUR}s`} repeatCount="indefinite" />
      </circle>
      <circle r="2" fill="#5EEAD4">
        <animateMotion dur={`${STR_SPINE_DUR}s`} begin={secondDotBegin} repeatCount="indefinite" path={spinePath} />
        <animate attributeName="fill-opacity"
          values="0.8;0.8;0.3;0.8" keyTimes="0;0.72;0.92;1"
          dur={`${STR_SPINE_DUR}s`} begin={secondDotBegin} repeatCount="indefinite" />
      </circle>

      {/* Branch pulse dots */}
      {STRESS_LEVELS.map((lv, i) => {
        const dur = `${(STR_BRANCH_DUR + i * 0.08).toFixed(2)}s`;
        const beginL = `-${(i * 0.32).toFixed(2)}s`;
        const beginR = `-${(i * 0.32 + 0.44).toFixed(2)}s`;
        const leftPath  = `M 120 ${lv.y} Q 90 ${lv.y - 3} 58 ${lv.y + 9}`;
        const rightPath = `M 120 ${lv.y} Q 150 ${lv.y - 3} 182 ${lv.y + 9}`;
        const fadeVals = "0;0.9;0.82;0";
        const fadeKeys = "0;0.12;0.72;1";
        return (
          <g key={i}>
            <circle r="2.5" fill={lv.dotColor}>
              <animateMotion dur={dur} begin={beginL} repeatCount="indefinite" path={leftPath} />
              <animate attributeName="fill-opacity" values={fadeVals} keyTimes={fadeKeys}
                dur={dur} begin={beginL} repeatCount="indefinite" />
            </circle>
            <circle r="2.5" fill={lv.dotColor}>
              <animateMotion dur={dur} begin={beginR} repeatCount="indefinite" path={rightPath} />
              <animate attributeName="fill-opacity" values={fadeVals} keyTimes={fadeKeys}
                dur={dur} begin={beginR} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      </>
      )}
    </svg>
  );
}

function HydrationSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  // Two surface waves at a 60px period so the -60 translate loops seamlessly.
  const wave = (y: number) =>
    `M60 ${y} q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V152 H60 Z`;
  const drops = [
    { x: 105, dur: "2.6s", begin: "0s" },
    { x: 120, dur: "2.2s", begin: "-1.1s" },
    { x: 135, dur: "2.9s", begin: "-1.8s" },
  ];
  const bubbles = [
    { x: 108, r: 2.2, dur: "3.1s", begin: "0s" },
    { x: 122, r: 1.5, dur: "2.5s", begin: "-1.2s" },
    { x: 133, r: 2.6, dur: "3.6s", begin: "-2.1s" },
  ];

  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      <defs>
        <clipPath id="hyd-bottle">
          <rect x="94" y="34" width="52" height="114" rx="22" />
        </clipPath>
        <linearGradient id="hyd-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* falling droplets */}
      {drops.map((d, i) => (
        <path key={i} d={`M${d.x} 6 q -4.5 8 0 12 q 4.5 -4 0 -12`} fill="#2563EB" fillOpacity={hovered ? 0.95 : 0.75}>
          {!reduced && <animateTransform attributeName="transform" type="translate" from="0 0" to="0 24" dur={d.dur} begin={d.begin} repeatCount="indefinite" />}
          {!reduced && <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.75;1" dur={d.dur} begin={d.begin} repeatCount="indefinite" />}
        </path>
      ))}

      {/* cap + neck */}
      <rect x="110" y="22" width="20" height="11" rx="3" fill="#94A3B8" fillOpacity="0.55" />

      {/* bottle interior */}
      <g clipPath="url(#hyd-bottle)">
        <rect x="94" y="34" width="52" height="114" fill="rgba(37,99,235,0.07)" />

        {/* water body with a rolling surface */}
        <g>
          {!reduced && <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="5s" repeatCount="indefinite" />}
          <path d={wave(84)} fill="url(#hyd-water)" />
        </g>

        {/* rising bubbles */}
        {!reduced && bubbles.map((b, i) => (
          <circle key={i} cx={b.x} cy="146" r={b.r} fill="#fff" fillOpacity="0.5">
            <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -56" dur={b.dur} begin={b.begin} repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0;0.55;0" dur={b.dur} begin={b.begin} repeatCount="indefinite" />
          </circle>
        ))}

        {/* glass highlight */}
        <rect x="100" y="42" width="9" height="96" rx="4.5" fill="#fff" fillOpacity="0.28" />
      </g>

      {/* bottle outline */}
      <rect
        x="94" y="34" width="52" height="114" rx="22"
        fill="none" stroke="#2563EB"
        strokeOpacity={hovered ? 0.45 : 0.28}
        strokeWidth="2"
        style={{ transition: "stroke-opacity 0.4s ease" }}
      />
    </svg>
  );
}

function SoundSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  const bars = [40, 62, 30, 78, 50, 88, 44, 66, 34, 72, 48];
  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      {bars.map((h, i) => {
        const x = 26 + i * 18;
        return (
          <rect key={i} x={x} y={90 - h / 2} width="9" height={h} rx="4.5" fill="#7C3AED" fillOpacity={hovered ? 0.85 : 0.62}>
            {!reduced && <animate attributeName="height" values={`${h};${Math.max(14, h * 0.45)};${h}`} dur={`${1 + (i % 4) * 0.28}s`} repeatCount="indefinite" />}
            {!reduced && <animate attributeName="y" values={`${90 - h / 2};${90 - Math.max(14, h * 0.45) / 2};${90 - h / 2}`} dur={`${1 + (i % 4) * 0.28}s`} repeatCount="indefinite" />}
          </rect>
        );
      })}
    </svg>
  );
}

function FocusSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      {[52, 38, 24].map((r, i) => (
        <circle key={i} cx="120" cy="80" r={r} fill="none" stroke="#DB2777" strokeWidth="2" strokeOpacity={hovered ? 0.7 - i * 0.12 : 0.5 - i * 0.12} />
      ))}
      <circle cx="120" cy="80" r="7" fill="#DB2777">
        {!reduced && <animate attributeName="r" values="7;9;7" dur="1.6s" repeatCount="indefinite" />}
      </circle>
      {[0, 90, 180, 270].map((a) => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={120 + Math.cos(rad) * 58} y1={80 + Math.sin(rad) * 58} x2={120 + Math.cos(rad) * 46} y2={80 + Math.sin(rad) * 46} stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />;
      })}
    </svg>
  );
}

function BreathSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      <circle cx="120" cy="80" r="46" fill="rgba(8,145,178,0.14)" stroke="#0891B2" strokeWidth="2" strokeOpacity={hovered ? 0.85 : 0.6}>
        {!reduced && <animate attributeName="r" values="30;50;30" dur="6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.4;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />}
        {!reduced && <animate attributeName="fill-opacity" values="0.28;0.1;0.28" dur="6s" repeatCount="indefinite" />}
      </circle>
      <circle cx="120" cy="80" r="6" fill="#0891B2" />
    </svg>
  );
}

function CaffeineSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  const path = "M 20 60 C 60 60 70 132 120 132 C 170 132 180 96 220 96";
  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      <line x1="20" y1="132" x2="220" y2="132" stroke="#94A3B8" strokeWidth="1" strokeOpacity="0.4" />
      <path d={`${path} L 220 132 L 20 132 Z`} fill="#B45309" fillOpacity="0.10" />
      <path d={path} stroke="#B45309" strokeWidth="2.6" strokeLinecap="round" strokeOpacity={hovered ? 0.95 : 0.75} />
      <circle r="5" fill="#fff" stroke="#B45309" strokeWidth="2">
        {!reduced && <animateMotion dur={hovered ? "3s" : "5s"} repeatCount="indefinite" path={path} />}
      </circle>
      <text x="26" y="52" fontSize="15" style={{ userSelect: "none" }}>☕</text>
    </svg>
  );
}

function VisionSVG({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className="w-full h-full">
      <path d="M40 80 Q120 26 200 80 Q120 134 40 80 Z" fill="rgba(5,150,105,0.10)" stroke="#059669" strokeWidth="2" strokeOpacity={hovered ? 0.8 : 0.6} />
      <circle cx="120" cy="80" r="22" fill="none" stroke="#059669" strokeWidth="2" strokeOpacity="0.6" />
      <circle cx="120" cy="80" r="10" fill="#059669" fillOpacity="0.85">
        {!reduced && <animate attributeName="r" values="10;11.5;10" dur="3s" repeatCount="indefinite" />}
      </circle>
      {!reduced && (
        <path d="M40 80 Q120 26 200 80 Q120 134 40 80 Z" fill="#F7F9FC">
          <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.92;0.96;0.99;1" dur="5s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sleep = labMeta("sleep");
  const SleepArt = LAB_SVGS.sleep;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Ambient aurora field — same system the labs refract through */}
      <div className="lab-aurora" aria-hidden="true" />

      <SiteNav active="explore" />

      <main className="relative z-10 flex-1 px-6 sm:px-8">
        <div className="w-full max-w-6xl mx-auto py-14 sm:py-20">

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <div className="max-w-3xl">
            <p className="hb-kicker hb-reveal-fade" style={{ color: "var(--teal-deep)", animationDelay: "60ms" }}>
              Health lessons school never taught you
            </p>
            <h1 className="mt-5 font-bold hb-reveal" style={{ fontSize: "clamp(2.5rem, 7vw, 4.8rem)", lineHeight: 0.99, letterSpacing: "-0.035em", color: "var(--ink)", animationDelay: "120ms" }}>
              See what&apos;s actually
              <br />
              happening{" "}
              <span className="hb-ink-gradient">inside your body</span>.
            </h1>
            <p className="mt-7 text-lg sm:text-xl max-w-xl hb-reveal" style={{ color: "var(--ink-soft)", lineHeight: 1.55, animationDelay: "220ms" }}>
              The Health Blueprint turns preventive health into something you can play with. Read a short explainer, then open an interactive Blueprint and watch real data respond to your own habits. Free, no sign-up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 hb-reveal" style={{ animationDelay: "300ms" }}>
              <Link href="#blueprints" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6"
                style={{ minHeight: 48, background: "linear-gradient(160deg, #16384a, #0B1A2B)", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px -12px rgba(11,26,43,0.6)" }}>
                Explore the Blueprints <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/learn" className="inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6 lg-pill" style={{ minHeight: 48, color: "var(--ink-soft)" }}>
                Start with an article
              </Link>
            </div>
          </div>

          {/* ── MISSION — one idea, three ways in ─────────────────────── */}
          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>How it works</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              One idea, three ways in.
            </h2>
            <p className="mt-3 max-w-2xl" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
              Most health problems are easier to understand before they start. So the goal is not to scare you, it is to show you how your body works while you can still do something about it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              {[
                { icon: BookOpen, tone: "#0E8A7D", title: "Learn", body: "Short, cited explainers that answer one real question, the stuff a health class skips.", href: "/learn", cta: "Read the articles", live: true },
                { icon: FlaskConical, tone: "#2563EB", title: "Explore", body: "Interactive Blueprints where you move the controls and watch your body respond in real time.", href: "#blueprints", cta: "Open a Blueprint", live: true },
                { icon: Smartphone, tone: "#C9760F", title: "Apply", body: "A personal app that tracks your habits and turns all of this into recommendations built for you.", href: undefined, cta: "Coming soon", live: false },
              ].map((p) => {
                const PIcon = p.icon;
                const inner = (
                  <div className="p-6 h-full flex flex-col">
                    <span className="inline-flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: `${p.tone}14`, border: `1px solid ${p.tone}2E` }}>
                      <PIcon className="w-5 h-5" style={{ color: p.tone }} />
                    </span>
                    <h3 className="text-lg font-bold mt-4" style={{ color: "var(--ink)" }}>{p.title}</h3>
                    <p className="text-sm mt-1.5 leading-relaxed flex-1" style={{ color: "var(--ink-soft)" }}>{p.body}</p>
                    <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: p.live ? p.tone : "var(--ink-faint)" }}>
                      {p.cta}{p.live && <ArrowRight className="w-4 h-4" />}
                    </div>
                  </div>
                );
                return p.href ? (
                  <Link key={p.title} href={p.href} className="group block lg lg-hover" style={{ borderRadius: 22 }}>{inner}</Link>
                ) : (
                  <div key={p.title} className="lg" style={{ borderRadius: 22, opacity: 0.82 }}>{inner}</div>
                );
              })}
            </div>
          </section>

          {/* ── FEATURED BLUEPRINT — Sleep ────────────────────────────── */}
          <section className="mt-20 sm:mt-24">
            <p className="hb-kicker" style={{ color: sleep.accent }}>Featured Blueprint</p>
            <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
              Start with sleep.
            </h2>
            <Link href="/labs/sleep" className="group block lg lg-hover mt-6" style={{ borderRadius: 26, overflow: "hidden" }}>
              <div className="grid md:grid-cols-2 items-stretch">
                <div className="relative flex items-center justify-center p-8" style={{ background: `linear-gradient(165deg, ${sleep.tint}, rgba(255,255,255,0) 80%)`, minHeight: 240 }}>
                  <div style={{ width: "82%", maxWidth: 320 }}>
                    <SleepArt hovered={false} reduced={reduced} />
                  </div>
                </div>
                <div className="p-7 sm:p-9 flex flex-col justify-center">
                  <h3 className="font-bold" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>{sleep.headline}</h3>
                  <p className="mt-3" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>{sleep.description}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-lg font-bold tabular-nums" style={{ color: sleep.accent }}>{sleep.stat}</span>
                    <span className="text-sm" style={{ color: "var(--ink-faint)" }}>{sleep.statLabel}</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: sleep.accent }}>
                    Open the Sleep Blueprint <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </section>

          {/* ── EXPLORE ALL BLUEPRINTS ────────────────────────────────── */}
          <section id="blueprints" className="mt-20 sm:mt-24" style={{ scrollMarginTop: 80 }}>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Explore</p>
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
                  Every Blueprint
                </h2>
              </div>
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>{LABS.length} live · more on the way</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {LABS.map((lab, i) => (
                <LabCard key={lab.id} lab={lab} delay={i * 60} mounted={mounted} reduced={reduced} />
              ))}
            </div>
          </section>

          {/* ── LEARN PREVIEW ─────────────────────────────────────────── */}
          <section className="mt-20 sm:mt-24">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="hb-kicker" style={{ color: "var(--teal-deep)" }}>Learn</p>
                <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--ink)" }}>
                  The stuff school skips.
                </h2>
              </div>
              <Link href="/learn" className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--teal-deep)" }}>
                See all of Learn <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {ARTICLES.slice(0, 3).map((a) => {
                const lab = labMeta(a.lab);
                return (
                  <Link key={a.slug} href={`/learn/${a.slug}`} className="group block lg lg-hover" style={{ borderRadius: 20 }}>
                    <div className="p-5 flex flex-col h-full">
                      <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{a.kind} · {a.minutes} min</span>
                      <p className="text-sm font-semibold mt-2" style={{ color: lab.accent }}>{a.question}</p>
                      <h3 className="text-base font-bold mt-1" style={{ color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{a.title}</h3>
                      <span className="mt-3 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: lab.accent }}>
                        Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function LabCard({
  lab,
  delay,
  mounted,
  reduced,
}: {
  lab: LabMeta;
  delay: number;
  mounted: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const SVGComponent = LAB_SVGS[lab.id];

  return (
    <Link
      href={`/labs/${lab.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? hovered
            ? "translateY(-6px)"
            : "translateY(0)"
          : "translateY(24px)",
        transition: mounted
          ? "transform 0.45s var(--ease-spring)"
          : `opacity 0.7s var(--ease-spring) ${delay}ms, transform 0.7s var(--ease-spring) ${delay}ms`,
      }}
    >
    <LiquidGlass
      radius={24}
      bezel={20}
      scale={44}
      tint={0.16}
      className="flex-1 flex flex-col"
      style={{ overflow: "hidden" }}
    >
      {/* Illustration viewport */}
      <div
        className="relative"
        style={{
          height: "188px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "26px 26px 18px",
          background: `linear-gradient(180deg, ${lab.tint} 0%, rgba(255,255,255,0) 78%)`,
          transition: "background 0.4s ease",
        }}
      >
        {/* index chip */}
        <span
          className="absolute top-4 left-5 text-xs font-mono font-semibold"
          style={{ color: lab.accent, opacity: 0.7, letterSpacing: "0.05em" }}
        >
          {lab.index}
        </span>
        {/* category tag */}
        <span
          className="absolute top-3.5 right-4 text-[10px] font-semibold uppercase"
          style={{
            color: lab.accent,
            letterSpacing: "0.1em",
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.55)",
            border: `1px solid ${lab.accent}2E`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {LAB_TAGS[lab.id]}
        </span>
        <div
          className="w-full h-full"
          style={{
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.5s var(--ease-spring)",
          }}
        >
          <SVGComponent hovered={hovered} reduced={reduced} />
        </div>
      </div>

      {/* Text area */}
      <div className="flex-1 flex flex-col px-6 pb-6 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
            {lab.title}
          </h2>
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              backgroundColor: hovered ? lab.accent : lab.tint,
              color: hovered ? "#fff" : lab.accent,
              transform: hovered ? "translateX(2px)" : "translateX(0)",
              transition: "all 0.3s var(--ease-spring)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {lab.description}
        </p>

        {/* Stat footer */}
        <div className="mt-5 pt-4 flex items-baseline gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.55)" }}>
          <span className="text-lg font-bold tabular-nums" style={{ color: lab.accent }}>
            {lab.stat}
          </span>
          <span className="text-xs leading-snug" style={{ color: "var(--ink-faint)" }}>
            {lab.statLabel}
          </span>
        </div>
      </div>
    </LiquidGlass>
    </Link>
  );
}

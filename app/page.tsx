"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LABS, type LabId, type LabMeta } from "@/components/labs/labs-meta";

// Lab identity (names, hooks, stats, accents) lives in labs-meta so the
// homepage, lab headers, and next-lab cards never drift apart. Only the
// illustrations are homepage-specific.
const LAB_SVGS: Record<LabId, (p: { hovered: boolean; reduced: boolean }) => React.ReactNode> = {
  sleep: SleepSVG,
  energy: EnergySVG,
  stress: StressSVG,
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

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Ambient aurora field — same system the labs refract through */}
      <div className="lab-aurora" aria-hidden="true" />

      {/* Top nav */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BlueprintMark />
            <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
              The Health Blueprint
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full hb-glass"
            style={{ color: "var(--ink-soft)", border: "1px solid var(--hairline)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--teal)" }} />
            Evidence-based · built for teens
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-8 py-12 sm:py-16">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero */}
          <div className="max-w-3xl">
            <p
              className="hb-kicker hb-reveal-fade"
              style={{ color: "var(--teal-deep)", animationDelay: "60ms" }}
            >
              Interactive science labs
            </p>
            <h1
              className="mt-5 font-bold hb-reveal"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                color: "var(--ink)",
                animationDelay: "120ms",
              }}
            >
              See what&apos;s actually
              <br />
              happening{" "}
              <span className="hb-ink-gradient">inside your body</span>.
            </h1>
            <p
              className="mt-7 text-lg sm:text-xl max-w-xl hb-reveal"
              style={{ color: "var(--ink-soft)", lineHeight: 1.55, animationDelay: "220ms" }}
            >
              Pick a topic. Move the controls. Watch real data react in real
              time. The science behind how you feel, made something you can see.
            </p>
          </div>

          {/* Lab Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {LABS.map((lab, i) => (
              <LabCard key={lab.id} lab={lab} delay={i * 110} mounted={mounted} reduced={reduced} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            For educational purposes only · not medical advice
          </p>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Sources: CDC · NIH · peer-reviewed research
          </p>
          <a
            href="https://www.instagram.com/thehealthblueprintproject"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium hover:underline"
            style={{ color: "var(--ink-soft)" }}
          >
            @thehealthblueprintproject
          </a>
        </div>
      </footer>
    </div>
  );
}

function BlueprintMark() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl"
      style={{
        width: 30,
        height: 30,
        background: "linear-gradient(140deg, #0B1A2B 0%, #16384a 100%)",
        boxShadow: "0 4px 12px -4px rgba(11,26,43,0.4)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 9 L5 9 L6.5 4 L9.5 12 L11 9 L14 9" stroke="#2DD4BF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SPORTS, PROFILE_COLOR, type Profile } from "@/lib/sports-energy";

const PROFILE_SIGNAL: Record<Profile, [number, number, number]> = {
  explosive: [0.95, 0.48, 0.18],
  burn: [0.52, 0.95, 0.34],
  aerobic: [0.18, 0.38, 0.95],
  mixed: [0.72, 0.72, 0.72],
};

function SportArt({ name, profile, theme }: { name: string; profile: Profile; theme: string }) {
  const values = PROFILE_SIGNAL[profile];
  const initials = name.split(/\s|&/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-full h-full relative overflow-hidden" aria-hidden="true" style={{ background: `radial-gradient(100% 90% at 8% 0%, ${theme}E6, ${theme}A8 46%, #0B1A2B 150%)` }}>
      <svg viewBox="0 0 240 180" className="absolute inset-0 w-full h-full" fill="none">
        <path d="M0 36H240M0 72H240M0 108H240M0 144H240M48 0V180M96 0V180M144 0V180M192 0V180" stroke="rgba(255,255,255,.07)" />
        <path d="M18 126C52 112 71 47 110 51s40 67 73 49 29-43 57-44" className="sport-signal-trace" stroke="rgba(255,255,255,.72)" strokeWidth="2" strokeLinecap="round" />
        {values.map((value, index) => {
          const y = 31 + index * 29;
          const colors = ["#FB923C", "#FBBF24", "#5EEAD4"];
          return (
            <g key={y}>
              <text x="18" y={y + 3} fill="rgba(255,255,255,.6)" fontSize="7" fontFamily="ui-monospace,monospace">{["P", "G", "A"][index]}</text>
              <rect x="31" y={y - 4} width="78" height="7" rx="3.5" fill="rgba(255,255,255,.12)" />
              <rect x="31" y={y - 4} width={78 * value} height="7" rx="3.5" fill={colors[index]} opacity=".9" />
            </g>
          );
        })}
        <circle cx="184" cy="69" r="31" stroke="rgba(255,255,255,.22)" />
        <circle cx="184" cy="69" r="22" stroke="rgba(255,255,255,.13)" />
        <text x="184" y="77" textAnchor="middle" fill="white" fontSize="23" fontWeight="700" fontFamily="Inter,sans-serif">{initials}</text>
        <path d="M164 20h40M184 0v40" stroke="rgba(255,255,255,.18)" strokeDasharray="2 4" />
      </svg>
      <div className="absolute inset-x-0 bottom-0" style={{ height: "54%", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.46))" }} />
    </div>
  );
}

// The grid reads as a map of the energy spectrum: each tile's tag is colored by
// its dominant system. Mixed sports get a gradient tag.
const TAG_GRADIENT = "linear-gradient(90deg, #0D9488, #D97706, #EA580C)";

function tagDot(profile: Profile) {
  if (profile === "mixed") return { background: TAG_GRADIENT };
  return { background: PROFILE_COLOR[profile] };
}

export default function SportsGrid() {
  // Scroll back here when arriving from a sport page (/labs/energy#sports).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#sports") {
      const t = setTimeout(() => {
        document.getElementById("sports")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div id="sports" style={{ scrollMarginTop: "12px" }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {SPORTS.map((sport) => {
          return (
            <Link
              key={sport.id}
              href={`/labs/energy/sports/${sport.id}`}
              className="group relative block overflow-hidden lg-hover"
              style={{ aspectRatio: "4 / 3", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "var(--glass-shadow)" }}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]">
                <SportArt name={sport.name} profile={sport.profile} theme={sport.theme} />
              </div>

              {/* luminous inner ring */}
              <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: "20px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.12)" }} />

              {/* hover open indicator */}
              <div className="absolute top-3 right-3 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)", borderRadius: "9999px", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.35)" }}>
                  Open
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {/* bottom-left glass corner pill */}
              <div className="absolute"
                style={{ left: "10px", bottom: "10px", right: "10px", padding: "8px 10px", borderRadius: "12px", background: "rgba(0,0,0,0.38)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 14px -4px rgba(0,0,0,0.4)" }}>
                <p className="text-white font-bold text-sm leading-tight tracking-tight truncate">{sport.name}</p>
                <span className="inline-flex items-center gap-1.5 mt-1">
                  <span className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, ...tagDot(sport.profile) }} />
                  <span className="text-[11px] leading-tight truncate" style={{ color: "rgba(255,255,255,0.78)" }}>{sport.profileLabel}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

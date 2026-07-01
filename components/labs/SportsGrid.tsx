"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SPORTS, PROFILE_COLOR, type Profile } from "@/lib/sports-energy";
import { SPORT_ART } from "@/components/labs/sports-illustrations";

/**
 * Tile background: a real action photo from /public/sports/{id}.jpg when one
 * exists, duotoned into the sport's theme color so all 16 tiles stay cohesive.
 * Until a photo lands (or if it 404s), the SVG illustration underneath shows —
 * the photo simply layers over it once it loads, so nothing ever flashes.
 */
function SportPhoto({ id, theme }: { id: string; theme: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) return null;
  return (
    <div className="absolute inset-0" style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}>
      <Image
        src={`/sports/${id}.jpg`}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        style={{ objectFit: "cover", filter: "grayscale(1) contrast(1.08)" }}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
      {/* duotone: theme color multiplied over the grayscale shot, stronger at the bottom */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${theme}8C 0%, ${theme}B8 100%)`, mixBlendMode: "multiply" }}
      />
      {/* soft lift so highlights keep the theme hue */}
      <div className="absolute inset-0" style={{ background: `${theme}33` }} />
      {/* bottom scrim so the glass pill stays legible over any photo */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: "55%", background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 100%)" }}
      />
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
          const Art = SPORT_ART[sport.illustration];
          return (
            <Link
              key={sport.id}
              href={`/labs/energy/sports/${sport.id}`}
              className="group relative block overflow-hidden lg-hover"
              style={{ aspectRatio: "4 / 3", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "var(--glass-shadow)" }}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]">
                {Art ? <Art theme={sport.theme} /> : <div style={{ width: "100%", height: "100%", background: sport.theme }} />}
                <SportPhoto id={sport.id} theme={sport.theme} />
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

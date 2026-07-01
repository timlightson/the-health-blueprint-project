"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GAMES } from "./core";
import { COVERS } from "./covers";

export default function GamesSection() {
  // Scroll here when arriving back from a game page (/labs/sleep#games).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#games") {
      const t = setTimeout(() => {
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div id="games" style={{ scrollMarginTop: "12px" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {GAMES.map((g) => {
          const Cover = COVERS[g.id];
          return (
            <Link
              key={g.id}
              href={g.route}
              className="group relative block overflow-hidden lg-hover"
              style={{
                aspectRatio: "4 / 3",
                borderRadius: "22px",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "var(--glass-shadow)",
              }}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]">
                <Cover />
              </div>

              {/* luminous inner ring */}
              <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: "22px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.12)" }} />

              {/* Hover Play indicator */}
              <div className="absolute top-3.5 right-3.5 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)", borderRadius: "9999px", padding: "5px 11px", border: "1px solid rgba(255,255,255,0.35)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
                >
                  Play
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {/* Floating liquid-glass label — bottom-left corner only */}
              <div
                className="absolute"
                style={{
                  left: "12px",
                  bottom: "12px",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 14px -4px rgba(0,0,0,0.4)",
                }}
              >
                <p className="text-white font-bold text-sm leading-tight tracking-tight">{g.title}</p>
                <p className="text-xs leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {g.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

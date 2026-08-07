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
        {GAMES.map((g, index) => {
          const Cover = COVERS[g.id];
          return (
            <Link
              key={g.id}
              href={g.route}
              className="game-card group relative block overflow-hidden"
              aria-label={`Open ${g.title}: ${g.tagline}`}
              style={{
                aspectRatio: "1.32 / 1",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "var(--glass-shadow)",
              }}
            >
              <div className="game-card-art absolute inset-0">
                <Cover />
              </div>

              <div className="game-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="game-card-shine" aria-hidden="true" />
              <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: "24px", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.48), inset 0 0 0 1px rgba(255,255,255,0.11)" }} />

              <div className="game-card-play" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                  <path d="m7 5 6 4-6 4V5Z" fill="currentColor" />
                </svg>
              </div>

              <div className="game-card-label">
                <div>
                  <p className="text-white font-bold text-base leading-tight tracking-tight">{g.title}</p>
                  <p className="text-xs leading-tight mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {g.tagline}
                  </p>
                </div>
                <span>OPEN ↗</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { getSport } from "@/lib/sports-energy";
import SportEngine from "@/components/labs/SportEngine";

export default function SportPage() {
  const params = useParams();
  const raw = params?.sport;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const sport = id ? getSport(id) : undefined;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />

      <header className="flex items-center px-4 sm:px-6 flex-shrink-0 lg-bar sticky top-0" style={{ height: "62px", zIndex: 40 }}>
        <Link href="/labs/energy#sports" className="group flex items-center gap-1.5 text-sm font-medium lg-pill rounded-full pl-2.5 pr-4 py-2" style={{ color: "var(--ink-soft)" }}>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Energy Lab
        </Link>
        <div className="flex items-center gap-2.5 ml-auto">
          <span className="inline-flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 12, background: "linear-gradient(160deg, rgba(245,158,11,0.34), rgba(255,255,255,0.5))", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 10px -4px rgba(201,118,15,0.5)" }}>
            <Zap className="w-[17px] h-[17px]" style={{ color: "#C9760F" }} />
          </span>
          <span className="font-semibold tracking-tight" style={{ color: "var(--ink)", fontSize: "15px" }}>Energy engines</span>
        </div>
      </header>

      <main className="flex-1" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-14">
          {sport ? (
            <>
              <div className="text-center max-w-2xl mx-auto mb-10 hb-reveal">
                <p className="hb-kicker" style={{ color: sport.theme }}>{sport.profileLabel}</p>
                <h1 className="font-bold mt-4" style={{ fontSize: "clamp(2rem, 5.5vw, 3rem)", color: "var(--ink)", lineHeight: 1.02, letterSpacing: "-0.035em" }}>
                  {sport.name}
                </h1>
                <p className="mt-4 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "32rem" }}>
                  The same three engines as every sport, tuned to how {sport.name} actually plays out. Hit play and watch them carry the load, then recover.
                </p>
              </div>

              <SportEngine sport={sport} />

              <div className="text-center mt-8">
                <Link href="/labs/energy#sports" className="text-sm font-semibold lg-pill rounded-full inline-flex items-center gap-1.5 px-4 py-2.5" style={{ color: "var(--ink-soft)" }}>
                  <ArrowLeft className="w-4 h-4" />
                  All sports
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)" }}>That sport is not here yet</h1>
              <p className="mt-3" style={{ color: "var(--ink-soft)" }}>Pick one from the grid back in the Energy Lab.</p>
              <Link href="/labs/energy#sports" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold lg-pill rounded-full px-4 py-2.5" style={{ color: "var(--ink-soft)" }}>
                <ArrowLeft className="w-4 h-4" />
                Back to the sports
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

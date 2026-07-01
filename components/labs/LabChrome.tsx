"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LABS, labMeta, nextLab, type LabId } from "@/components/labs/labs-meta";

// ─── Shared lab chrome ────────────────────────────────────────────────────────
// One sticky glass header, one next-lab card, one footer. Every lab uses these
// so moving between labs feels like one product, not three sites.

export function LabHeader({ lab, badge }: { lab: LabId; badge?: ReactNode }) {
  const meta = labMeta(lab);
  const Icon = meta.icon;

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 flex-shrink-0 lg-bar sticky top-0"
      style={{ height: "62px", zIndex: 40, position: "sticky" }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="group flex items-center gap-1.5 lg-pill rounded-full px-2.5 sm:pl-2.5 sm:pr-4 py-2"
        style={{ color: "var(--ink-soft)", minHeight: "44px" }}
        aria-label="Back to all labs"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium hidden sm:inline">Labs</span>
      </Link>

      {/* Lab switcher — current lab shows its icon, others are one tap away */}
      <nav
        aria-label="Switch lab"
        className="lg-segment flex items-center rounded-full"
        style={{ padding: "3px", gap: "2px" }}
      >
        {LABS.map((l) => {
          const active = l.id === lab;
          const LIcon = l.icon;
          return (
            <Link
              key={l.id}
              href={`/labs/${l.id}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-full font-semibold ${active ? "lg-segment-active" : ""}`}
              style={{
                padding: "0 12px",
                minHeight: "40px",
                fontSize: "13px",
                color: active ? l.accent : "var(--ink-soft)",
                transition: "color 0.3s ease",
              }}
            >
              {active && <LIcon className="w-[15px] h-[15px]" />}
              <span className={active ? "" : "hidden min-[430px]:inline"}>{l.name}</span>
              {!active && <LIcon className="w-[15px] h-[15px] min-[430px]:hidden" />}
            </Link>
          );
        })}
      </nav>

      {/* Live stat badge (lab-specific, passed in) */}
      <div className="flex items-center justify-end" style={{ minWidth: "64px" }}>
        {badge}
      </div>
    </header>
  );
}

/** Color-graded pill used for the live stat in the header. */
export function HeaderBadge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="rounded-full text-xs font-semibold whitespace-nowrap tabular-nums"
      style={{
        padding: "6px 12px",
        background: `linear-gradient(165deg, ${color}26, rgba(255,255,255,0.4))`,
        color,
        border: `1px solid ${color}40`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "color 0.5s ease, background 0.5s ease, border-color 0.5s ease",
      }}
    >
      {children}
    </div>
  );
}

/** Bottom-of-lab card that keeps the loop going: Sleep → Energy → Stress → Sleep. */
export function NextLabCard({ current }: { current: LabId }) {
  const next = nextLab(current);
  const Icon = next.icon;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-14">
      <Link href={`/labs/${next.id}`} className="group block" aria-label={`Open the ${next.title}`}>
        <LiquidGlass
          radius={24}
          bezel={20}
          scale={44}
          className="lg-hover"
          style={{ padding: "26px 28px" }}
        >
          <div className="flex items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="hb-kicker" style={{ color: next.accent }}>
                Next lab
              </p>
              <h3
                className="font-bold mt-2"
                style={{ color: "var(--ink)", fontSize: "clamp(1.15rem, 4vw, 1.35rem)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                {next.headline}
              </h3>
              <p className="text-sm mt-1.5" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
                {next.description}
              </p>
            </div>
            <span
              className="flex items-center justify-center rounded-full flex-shrink-0 transition-transform group-hover:translate-x-1"
              style={{
                width: 46,
                height: 46,
                background: next.iconBg,
                border: "1px solid rgba(255,255,255,0.65)",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${next.iconShadow}`,
                color: next.accent,
                transition: "transform 0.4s var(--spring)",
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
            <Icon className="w-4 h-4" style={{ color: next.accent }} />
            <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
              {next.title}
            </span>
          </div>
        </LiquidGlass>
      </Link>
    </div>
  );
}

export function LabFooter() {
  return (
    <footer className="pb-10 px-6">
      <div
        className="max-w-3xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid rgba(11,26,43,0.10)" }}
      >
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
  );
}

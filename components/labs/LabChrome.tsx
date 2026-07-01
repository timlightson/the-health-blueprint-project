"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { labMeta, type LabId } from "@/components/labs/labs-meta";

// ─── Shared lab chrome ────────────────────────────────────────────────────────
// One sticky glass header and one footer, used by every lab. Labs stand alone,
// PhET-style: the homepage is the catalog, and each lab links back to it.

export function LabHeader({ lab, badge }: { lab: LabId; badge?: ReactNode }) {
  const meta = labMeta(lab);
  const Icon = meta.icon;

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 flex-shrink-0 lg-bar sticky top-0"
      style={{ height: "62px", zIndex: 40, position: "sticky" }}
    >
      {/* Back to the lab catalog */}
      <Link
        href="/"
        className="group flex items-center gap-1.5 lg-pill rounded-full px-2.5 sm:pl-2.5 sm:pr-4 py-2"
        style={{ color: "var(--ink-soft)", minHeight: "44px" }}
        aria-label="Back to all labs"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium hidden sm:inline">Labs</span>
      </Link>

      {/* Lab identity */}
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            background: meta.iconBg,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${meta.iconShadow}`,
          }}
        >
          <Icon className="w-[17px] h-[17px]" style={{ color: meta.accent }} />
        </span>
        <span className="font-semibold tracking-tight" style={{ color: "var(--ink)", fontSize: "15px" }}>
          {meta.title}
        </span>
      </div>

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

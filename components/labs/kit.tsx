"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LabHeader, HeaderBadge, LabFooter } from "@/components/labs/LabChrome";
import { labMeta, type LabId } from "@/components/labs/labs-meta";

// ─── Shared lab kit ───────────────────────────────────────────────────────────
// Primitives every lab is built from, so a new lab is a short, consistent file.
// Native controls throughout, so keyboard and screen readers work for free.

/** Full-page shell: aurora backdrop, sticky glass header, main column, footer. */
export function LabShell({
  lab,
  badge,
  children,
}: {
  lab: LabId;
  badge?: { color: string; text: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative" }}>
      <div className="lab-aurora" aria-hidden="true" />
      <LabHeader lab={lab} badge={badge ? <HeaderBadge color={badge.color}>{badge.text}</HeaderBadge> : undefined} />
      <main className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">{children}</div>
      </main>
      <LabFooter />
    </div>
  );
}

/** Centered kicker / title / subtitle block used at the top of every lab. */
export function LabHero({ kicker, title, subtitle, accent }: { kicker: string; title: string; subtitle: string; accent: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto hb-reveal mb-11">
      <p className="hb-kicker" style={{ color: accent }}>{kicker}</p>
      <h1 className="font-bold mt-4" style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.25rem)", color: "var(--ink)", lineHeight: 1.02, letterSpacing: "-0.035em" }}>
        {title}
      </h1>
      <p className="mt-4 mx-auto" style={{ fontSize: "1.0625rem", color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: "34rem" }}>
        {subtitle}
      </p>
      <div className="hb-tick-rule mt-7 mx-auto" style={{ maxWidth: "220px" }} aria-hidden="true" />
    </div>
  );
}

/** Labeled native range slider with a live value readout. Keyboard-ready. */
export function GlassSlider({
  label,
  value,
  min,
  max,
  step = 1,
  accent,
  display,
  valueText,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  accent: string;
  display: string;
  valueText?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>{label}</label>
        <span className="text-sm font-bold tabular-nums" style={{ color: accent }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={valueText ?? display}
        className="w-full"
        style={{ accentColor: accent, height: "30px", cursor: "pointer" }}
      />
    </div>
  );
}

/** Glass segmented control for small option sets. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="lg-segment inline-flex rounded-full" style={{ padding: "3px", gap: "2px" }} role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-full text-xs font-semibold px-4 ${active ? "lg-segment-active" : ""}`}
            style={{ minHeight: "38px", color: active ? "var(--ink)" : "var(--ink-soft)" }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Selectable glass chips (e.g. presets). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  accent,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  accent: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className="text-xs font-semibold rounded-full lg-pill"
            style={{
              minHeight: "36px",
              padding: "0 14px",
              color: active ? "#fff" : "var(--ink-soft)",
              background: active ? accent : undefined,
              borderColor: active ? accent : undefined,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small glass stat tile. */
export function StatTile({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="lg p-4 text-center" style={{ borderRadius: "16px" }}>
      <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: accent, letterSpacing: "-0.02em" }}>{value}</div>
      <div className="text-xs mt-1.5" style={{ color: "var(--ink-soft)", lineHeight: 1.35 }}>{label}</div>
    </div>
  );
}

/** Collapsible science section with cited points. */
export function SciencePanel({
  accent,
  intro,
  points,
  sources,
}: {
  accent: string;
  intro?: string;
  points: { text: string; cite: string }[];
  sources?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-12 border-t" style={{ borderColor: "rgba(11,26,43,0.10)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 py-4 w-full text-left"
        style={{ color: "var(--ink)" }}
      >
        {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm font-semibold uppercase tracking-wider">The Science</span>
      </button>
      <div style={{ maxHeight: open ? "1600px" : "0px", opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.4s ease" }}>
        <div className="pb-8">
          {intro && (
            <p className="text-sm mb-4" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>{intro}</p>
          )}
          <ul className="space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5" style={{ listStyle: "none" }}>
                <span className="flex-shrink-0 mt-2 rounded-full block" style={{ width: 5, height: 5, backgroundColor: accent }} />
                <span className="text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {p.text} <span className="text-xs" style={{ color: "var(--ink-faint)" }}>({p.cite})</span>
                </span>
              </li>
            ))}
          </ul>
          {sources && (
            <p className="text-xs mt-5" style={{ color: "var(--ink-faint)" }}>{sources}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Helper: clamp. */
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

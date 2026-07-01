"use client";

import { useState, useRef, useMemo, useEffect, type Dispatch, type SetStateAction } from "react";
import { playSound } from "@/lib/sleep-sound";
import LiquidGlass from "@/components/labs/LiquidGlass";

// ─── Build Your Day — drag activities onto a timeline, watch your energy curve ──

export const START_H = 6; // 6 AM
export const END_H = 24; // midnight
const SPAN = END_H - START_H; // 18 hours
export const STEP = 0.25;
export const SAMPLES = Math.round(SPAN / STEP) + 1;

// SVG layout (viewBox units)
const VW = 720;
const PADL = 38;
const PADR = 14;
const PLOTW = VW - PADL - PADR;
const PLOT_TOP = 16;
const PLOT_H = 138;
const PLOT_BOT = PLOT_TOP + PLOT_H;
const AXIS_Y = PLOT_BOT + 16;
const BAND_Y0 = PLOT_BOT + 26;
const VH = 232;
export const E_MAX = 1.15;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function fmtTime(t: number): string {
  const norm = ((t % 24) + 24) % 24;
  const h = Math.floor(norm + 1e-6);
  const m = Math.round((norm - h) * 60);
  const ap = h < 12 || h === 24 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return m ? `${hh}:${m.toString().padStart(2, "0")} ${ap}` : `${hh} ${ap}`;
}

// ─── Activity effect helpers ──────────────────────────────────────────────────

const win = (s: number, t: number, dur: number, v: number) => (t >= s && t < s + dur ? v : 0);
const fade = (s: number, t: number, dur: number, v: number) =>
  t >= s && t < s + dur ? v * (1 - (t - s) / dur) : 0;

interface Activity {
  key: string;
  emoji: string;
  label: string;
  dur: number;
  tip: string;
  fx: (start: number, t: number) => number;
}

const ACTIVITIES: Activity[] = [
  {
    key: "sleep",
    emoji: "😴",
    label: "Night sleep",
    dur: 8,
    tip: "Sets your baseline energy for the whole day. Change the hours with the sleep slider.",
    fx: () => 0,
  },
  {
    key: "breakfast",
    emoji: "🍳",
    label: "Breakfast",
    dur: 0.33,
    tip: "Steadies your morning and softens the early dip.",
    fx: (s, t) => win(s, t, 0.33, 0.03) + fade(s + 0.33, t, 2, 0.07),
  },
  {
    key: "homework",
    emoji: "📖",
    label: "Homework",
    dur: 1,
    tip: "A steady drain. It hits harder when it's late at night.",
    fx: (s, t) => win(s, t, 1, s >= 20 ? -0.14 : -0.1),
  },
  {
    key: "test",
    emoji: "📝",
    label: "Test or quiz",
    dur: 1,
    tip: "Burns through focus fast, and leaves you flat for a bit after.",
    fx: (s, t) => win(s, t, 1, -0.15) + fade(s + 1, t, 0.5, -0.06),
  },
  {
    key: "class",
    emoji: "🏫",
    label: "Class",
    dur: 1,
    tip: "A slow, low-level drain on your focus.",
    fx: (s, t) => win(s, t, 1, -0.05),
  },
  {
    key: "sports",
    emoji: "🏃",
    label: "Sports practice",
    dur: 1.5,
    tip: "Tiring while you do it, then a short lift right after.",
    fx: (s, t) => win(s, t, 1.5, -0.24) + fade(s + 1.5, t, 0.6, 0.12),
  },
  {
    key: "gym",
    emoji: "💪",
    label: "Gym workout",
    dur: 1,
    tip: "Drains you in the moment, with a small bump afterward.",
    fx: (s, t) => win(s, t, 1, -0.18) + fade(s + 1, t, 0.6, 0.07),
  },
  {
    key: "walk",
    emoji: "🚶",
    label: "Walk / move",
    dur: 0.5,
    tip: "A light reset that clears mental fatigue and smooths dips.",
    fx: (s, t) => win(s, t, 0.5, 0.05) + fade(s + 0.5, t, 0.6, 0.05),
  },
  {
    key: "lunch",
    emoji: "🍎",
    label: "Lunch",
    dur: 0.5,
    tip: "A small lift, then sometimes a slight dip right after.",
    fx: (s, t) => win(s, t, 0.5, 0.05) + fade(s + 0.5, t, 1, -0.05),
  },
  {
    key: "dinner",
    emoji: "🍽️",
    label: "Dinner",
    dur: 0.75,
    tip: "Helps your energy settle into the evening.",
    fx: (s, t) => win(s, t, 0.75, 0.05) + fade(s + 0.75, t, 1, 0.04),
  },
  {
    key: "coffee",
    emoji: "☕",
    label: "Coffee",
    dur: 0.25,
    tip: "Quick lift, fades over about 4 hours, then a small dip below normal.",
    fx: (s, t) =>
      t < s
        ? 0
        : t < s + 4
        ? 0.2 * Math.exp(-(t - s) / 1.9)
        : t < s + 5.5
        ? -0.1 * Math.sin(((t - s - 4) / 1.5) * Math.PI)
        : 0,
  },
  {
    key: "energy",
    emoji: "🥤",
    label: "Energy drink",
    dur: 0.25,
    tip: "A bigger spike that holds longer, then a sharper crash.",
    fx: (s, t) =>
      t < s
        ? 0
        : t < s + 5
        ? 0.3 * (1 - ((t - s) / 5) * 0.45)
        : t < s + 7
        ? -0.15 * Math.sin(((t - s - 5) / 2) * Math.PI)
        : 0,
  },
  {
    key: "study",
    emoji: "📚",
    label: "Studying",
    dur: 1,
    tip: "A steady focus drain with no built-in recovery.",
    fx: (s, t) => win(s, t, 1, -0.1),
  },
  {
    key: "phone",
    emoji: "📱",
    label: "Phone scroll",
    dur: 0.5,
    tip: "Looks like rest, but keeps your brain on. Late at night it pushes sleep later.",
    fx: (s, t) => {
      let d = win(s, t, 0.5, -0.05);
      if (s >= 19.5 && t >= s + 0.5) d += Math.max(-0.13, -0.022 * (t - s - 0.5));
      return d;
    },
  },
  {
    key: "gaming",
    emoji: "🎮",
    label: "Gaming",
    dur: 1,
    tip: "Engaging but tiring, with a slow cooldown afterward.",
    fx: (s, t) => win(s, t, 1, -0.1),
  },
  {
    key: "friends",
    emoji: "💬",
    label: "Friends",
    dur: 1,
    tip: "An emotional lift with very little energy cost.",
    fx: (s, t) => win(s, t, 1, 0.1) + fade(s + 1, t, 0.6, 0.05),
  },
  {
    key: "work",
    emoji: "💼",
    label: "Work shift",
    dur: 3,
    tip: "A long, steady drain that builds over the shift.",
    fx: (s, t) => win(s, t, 3, -0.15),
  },
  {
    key: "music",
    emoji: "🎵",
    label: "Music / chill",
    dur: 0.5,
    tip: "Low-key recovery time for your nervous system.",
    fx: (s, t) => win(s, t, 0.5, 0.06),
  },
  {
    key: "nap",
    emoji: "😴",
    label: "Short nap",
    dur: 0.33,
    tip: "A quick recharge that lifts your alertness for a couple hours.",
    fx: (s, t) => {
      const e = s + 0.33;
      return t >= e && t < e + 2 ? 0.2 * (1 - (t - e) / 2) : 0;
    },
  },
  {
    key: "longnap",
    emoji: "💤",
    label: "Long nap",
    dur: 0.75,
    tip: "Strong recovery, but you wake up groggy and it can dent tonight's sleep.",
    fx: (s, t) => {
      const e = s + 0.75;
      return t >= e && t < e + 0.4 ? -0.1 * (1 - (t - e) / 0.4) : 0;
    },
  },
  {
    key: "winddown",
    emoji: "🌙",
    label: "Wind-down",
    dur: 0.75,
    tip: "No screens, less stimulation. Helps you fall asleep faster.",
    fx: (s, t) => win(s, t, 0.75, 0.05),
  },
];

const ACT: Record<string, Activity> = Object.fromEntries(ACTIVITIES.map((a) => [a.key, a]));

// ─── Curve math ───────────────────────────────────────────────────────────────

function baselineAt(t: number, sleepH: number): number {
  const base = 0.36 + ((clamp(sleepH, 4, 10) - 4) / 6) * 0.5;
  const decline = ((t - START_H) / SPAN) * 0.1;
  const dip = 0.16 * Math.exp(-((t - 14.5) ** 2) / 3.0);
  const morning = 0.06 * Math.exp(-((t - 6.4) ** 2) / 0.7);
  return base - decline - dip - morning;
}

export interface Placed {
  id: string;
  type: string;
  start: number;
}

export function curveFor(placed: Placed[], sleepH: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = START_H + i * STEP;
    let e = baselineAt(t, sleepH);
    for (const p of placed) e += ACT[p.type].fx(p.start, t);
    out.push(clamp(e, 0.05, E_MAX));
  }
  return out;
}

// Smoothly tween between curves so each drop animates (~300ms).
export function useAnimatedCurve(target: number[]): number[] {
  const [disp, setDisp] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from.length !== target.length) {
      fromRef.current = target;
      setDisp(target);
      return;
    }
    let startTs: number | null = null;
    const run = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / 300);
      const e = 1 - (1 - p) ** 3;
      const cur = target.map((v, i) => from[i] + (v - from[i]) * e);
      fromRef.current = cur;
      setDisp(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return disp;
}

// ─── Insights ─────────────────────────────────────────────────────────────────

const DRAIN = new Set(["homework", "test", "class", "study", "work", "gaming"]);
const RECOVER = new Set(["walk", "music", "friends", "winddown", "nap", "lunch", "dinner", "breakfast"]);

function getInsights(placed: Placed[]): string[] {
  const real = placed.filter((p) => p.type !== "sleep");
  if (real.length === 0) {
    return ["Drag activities onto the timeline. The energy curve updates as you build your day."];
  }
  const out: string[] = [];
  const sorted = [...real].sort((a, b) => a.start - b.start);

  const lateCaf = sorted.find((p) => (p.type === "coffee" || p.type === "energy") && p.start >= 14);
  if (lateCaf) {
    out.push(
      `That ${lateCaf.type === "coffee" ? "coffee" : "energy drink"} at ${fmtTime(
        lateCaf.start,
      )} is still working hours later. Caffeine sticks around, and it's a big reason sleep won't come easy tonight.`,
    );
  }
  const phoneLate = sorted.find((p) => p.type === "phone" && p.start >= 21);
  if (phoneLate) {
    out.push(
      `Scrolling at ${fmtTime(
        phoneLate.start,
      )} holds your melatonin back. Your brain doesn't get the wind-down signal on time.`,
    );
  }
  const napLate = sorted.find((p) => p.type === "longnap" && p.start >= 16);
  if (napLate) {
    out.push(
      `A long nap at ${fmtTime(
        napLate.start,
      )} eats into tonight's sleep pressure. You'll probably lie awake longer.`,
    );
  }
  const testDip = sorted.find((p) => p.type === "test" && p.start >= 13.5 && p.start <= 15.5);
  if (testDip) {
    out.push(
      "You put a test right around the 2 to 3 PM low point. That's the natural energy dip. Rough window for anything high-stakes.",
    );
  }
  // back-to-back drains
  let run = 0;
  let maxRun = 0;
  for (const a of sorted) {
    if (DRAIN.has(a.type)) {
      run += 1;
      maxRun = Math.max(maxRun, run);
    } else if (RECOVER.has(a.type)) {
      run = 0;
    }
  }
  if (maxRun >= 3) {
    out.push(
      "You've got three draining things back to back. Without a break between them, your energy just keeps sliding.",
    );
  }

  if (out.length < 3) {
    const recoverCount = sorted.filter((p) => RECOVER.has(p.type)).length;
    if (recoverCount >= 2 && maxRun < 3 && real.length >= 4) {
      out.push("This day's actually well spaced. There's room between the hard parts for your brain to recover.");
    }
  }
  if (out.length < 3) {
    const morningCoffee = sorted.find((p) => p.type === "coffee" && p.start >= 6 && p.start < 11);
    if (morningCoffee) {
      out.push("Your morning coffee is doing its job, pulling you up through a slow start.");
    }
  }
  if (out.length === 0) {
    out.push("Keep adding what you actually do. The curve shows where your energy holds and where it drops.");
  }
  return out.slice(0, 3);
}

// ─── Presets ──────────────────────────────────────────────────────────────────

type PresetItem = [string, number];
const PRESETS: Record<string, PresetItem[]> = {
  "Typical school day": [
    ["breakfast", 7],
    ["class", 8],
    ["class", 9],
    ["class", 10],
    ["lunch", 12],
    ["class", 13],
    ["homework", 16],
    ["walk", 17],
    ["dinner", 18],
    ["phone", 20],
    ["winddown", 22],
  ],
  "Practice day": [
    ["breakfast", 7],
    ["class", 8],
    ["class", 9],
    ["class", 10],
    ["lunch", 12],
    ["class", 13],
    ["sports", 16],
    ["dinner", 18],
    ["homework", 19.5],
    ["winddown", 22],
  ],
  "Balanced recovery day": [
    ["breakfast", 8],
    ["walk", 10],
    ["study", 11],
    ["lunch", 12],
    ["music", 14],
    ["work", 16],
    ["dinner", 18],
    ["winddown", 21],
  ],
};

// A sensible filled day so the diagnostic hero has live data on first load.
// "Practice day" tells the clearest story: a deep mid-afternoon dip during
// practice, a recovery bump, then an evening homework drain.
export const INITIAL_PLACED: Placed[] = [
  { id: "sleep-init", type: "sleep", start: 24 },
  ...PRESETS["Practice day"].map(([type, start], i) => ({
    id: `init-${i}`,
    type,
    start,
  })),
];

// ─── Geometry ─────────────────────────────────────────────────────────────────

const xFor = (t: number) => PADL + ((t - START_H) / SPAN) * PLOTW;
const yFor = (e: number) => PLOT_TOP + (1 - clamp(e, 0, E_MAX) / E_MAX) * PLOT_H;

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const xc = (pts[i - 1].x + pts[i].x) / 2;
    const yc = (pts[i - 1].y + pts[i].y) / 2;
    d += ` Q ${pts[i - 1].x.toFixed(1)},${pts[i - 1].y.toFixed(1)} ${xc.toFixed(1)},${yc.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

// ─── Component ────────────────────────────────────────────────────────────────

let idSeq = 0;

interface DragState {
  kind: "new" | "move";
  type: string;
  placedId?: string;
}

export default function BuildYourDay({
  sleepHours,
  placed,
  setPlaced,
}: {
  sleepHours: number;
  placed: Placed[];
  setPlaced: Dispatch<SetStateAction<Placed[]>>;
}) {
  const [armed, setArmed] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ type: string; x: number; y: number } | null>(null);
  const [dropSlot, setDropSlot] = useState<number | null>(null);
  const [liveMsg, setLiveMsg] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const announce = (m: string) => setLiveMsg(m);

  const targetCurve = useMemo(() => curveFor(placed, sleepHours), [placed, sleepHours]);
  const curve = useAnimatedCurve(targetCurve);
  const insights = useMemo(() => getInsights(placed), [placed]);

  const timeAtClient = (clientX: number, clientY: number): number | null => {
    const el = wrapRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (clientX < r.left - 12 || clientX > r.right + 12) return null;
    if (clientY < r.top - 40 || clientY > r.bottom + 40) return null;
    const vx = ((clientX - r.left) / r.width) * VW;
    let t = START_H + ((vx - PADL) / PLOTW) * SPAN;
    t = Math.round(t * 2) / 2;
    return clamp(t, START_H, END_H);
  };

  const addActivity = (type: string, start: number) => {
    idSeq += 1;
    setPlaced((p) => [...p, { id: `a${idSeq}`, type, start }]);
    playSound("tick");
  };
  const moveActivity = (id: string, start: number) => {
    setPlaced((p) => p.map((a) => (a.id === id ? { ...a, start } : a)));
    playSound("tick");
  };
  const removeActivity = (id: string) => {
    setPlaced((p) => p.filter((a) => a.id !== id));
    setSelectedId(null);
    playSound("click");
  };

  // ─── Keyboard support ──────────────────────────────────────────────────────
  // Drag-and-drop is pointer-only, so keyboard users get a parallel path:
  // activating a tile drops it on the timeline and selects it, then the arrow
  // keys move it. Times sit on the same 30-min grid the drag drop snaps to.
  const KBD_DEFAULT_START = 15; // 3 PM — centered and visible on the timeline

  const addViaKeyboard = (type: string) => {
    idSeq += 1;
    const id = `a${idSeq}`;
    setPlaced((p) => [...p, { id, type, start: KBD_DEFAULT_START }]);
    setSelectedId(id);
    setArmed(null);
    playSound("tick");
    announce(`Added ${ACT[type].label} at ${fmtTime(KBD_DEFAULT_START)}. Use the arrow keys to move it, Delete to remove it.`);
    requestAnimationFrame(() => wrapRef.current?.focus());
  };

  const onTimelineKeyDown = (e: React.KeyboardEvent) => {
    const real = [...placed].filter((p) => p.type !== "sleep").sort((a, b) => a.start - b.start);
    if (real.length === 0) return;
    const idx = real.findIndex((p) => p.id === selectedId);

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const ni = idx === -1 ? 0 : e.key === "ArrowDown" ? Math.min(real.length - 1, idx + 1) : Math.max(0, idx - 1);
      setSelectedId(real[ni].id);
      announce(`${ACT[real[ni].type].label} at ${fmtTime(real[ni].start)}, ${ni + 1} of ${real.length}.`);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      if (idx === -1) {
        setSelectedId(real[0].id);
        announce(`${ACT[real[0].type].label} at ${fmtTime(real[0].start)}, 1 of ${real.length}.`);
        return;
      }
      const sel = real[idx];
      const delta = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 1 : 0.5);
      const nt = clamp(Math.round((sel.start + delta) * 2) / 2, START_H, END_H);
      if (nt !== sel.start) {
        moveActivity(sel.id, nt);
        announce(`${ACT[sel.type].label} moved to ${fmtTime(nt)}.`);
      }
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (idx === -1) return;
      e.preventDefault();
      const sel = real[idx];
      removeActivity(sel.id);
      announce(`Removed ${ACT[sel.type].label}.`);
    } else if (e.key === "Escape") {
      if (selectedId) {
        e.preventDefault();
        setSelectedId(null);
        announce("Selection cleared.");
      }
    }
  };

  const startDrag = (e: React.PointerEvent, drag: DragState) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;

    const onMove = (ev: PointerEvent) => {
      if (!moved) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        moved = true;
      }
      setGhost({ type: drag.type, x: ev.clientX, y: ev.clientY });
      setDropSlot(timeAtClient(ev.clientX, ev.clientY));
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setGhost(null);
      setDropSlot(null);
      if (!moved) {
        if (drag.kind === "new") setArmed((a) => (a === drag.type ? null : drag.type));
        else setSelectedId((s) => (s === drag.placedId ? null : (drag.placedId ?? null)));
        return;
      }
      const t = timeAtClient(ev.clientX, ev.clientY);
      if (t === null) return;
      if (drag.kind === "new") addActivity(drag.type, t);
      else if (drag.placedId) moveActivity(drag.placedId, t);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onTimelineClick = (e: React.MouseEvent) => {
    if (armed) {
      const t = timeAtClient(e.clientX, e.clientY);
      if (t !== null) {
        addActivity(armed, t);
        setArmed(null);
      }
    } else {
      setSelectedId(null);
    }
  };

  const applyPreset = (name: string) => {
    playSound("whoosh");
    setArmed(null);
    setSelectedId(null);
    if (name === "Clear all") {
      setPlaced([{ id: "sleep-init", type: "sleep", start: 24 }]);
      return;
    }
    const items = PRESETS[name] ?? [];
    const next: Placed[] = [{ id: "sleep-init", type: "sleep", start: 24 }];
    for (const [type, start] of items) {
      idSeq += 1;
      next.push({ id: `a${idSeq}`, type, start });
    }
    setPlaced(next);
  };

  // Curve geometry
  const pts = curve.map((e, i) => ({ x: xFor(START_H + i * STEP), y: yFor(e) }));
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${xFor(END_H).toFixed(1)},${PLOT_BOT} L ${xFor(START_H).toFixed(
    1,
  )},${PLOT_BOT} Z`;

  // Placed badge layout (zig-zag rows when crowded)
  const sortedPlaced = [...placed].sort((a, b) => a.start - b.start);
  const badges: { p: Placed; cx: number; row: number }[] = [];
  {
    let lastX = -999;
    let lastRow = 1;
    for (const p of sortedPlaced) {
      const cx = clamp(xFor(p.start), PADL + 13, PADL + PLOTW - 13);
      const row = cx - lastX < 30 ? (lastRow === 0 ? 1 : 0) : 0;
      badges.push({ p, cx, row });
      lastRow = row;
      lastX = cx;
    }
  }
  const rowY = (row: number) => BAND_Y0 + 13 + row * 26;

  const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div className="w-full">
      <LiquidGlass radius={24} bezel={24} scale={50} style={{ padding: "20px" }}>
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Object.keys(PRESETS), "Clear all"].map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="text-xs font-semibold rounded-full lg-press"
              style={{
                padding: "7px 13px",
                minHeight: "34px",
                background: name === "Clear all"
                  ? "rgba(255,255,255,0.5)"
                  : "linear-gradient(165deg, rgba(13,148,136,0.20), rgba(255,255,255,0.4))",
                color: name === "Clear all" ? "var(--ink-soft)" : "#0B6F65",
                border: `1px solid ${name === "Clear all" ? "rgba(255,255,255,0.6)" : "rgba(13,148,136,0.32)"}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div
          ref={wrapRef}
          tabIndex={0}
          role="application"
          aria-label="Day timeline. Press Up or Down to pick a placed activity, Left or Right to move it earlier or later, hold Shift for one-hour jumps, and Delete to remove it."
          onKeyDown={onTimelineKeyDown}
          style={{ position: "relative", borderRadius: 8 }}
        >
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            width="100%"
            onClick={onTimelineClick}
            style={{ display: "block", cursor: armed ? "copy" : "default" }}
          >
            <defs>
              <linearGradient
                id="bydCurve"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={PLOT_TOP}
                x2="0"
                y2={PLOT_BOT}
              >
                <stop offset="0" stopColor="#0D9488" />
                <stop offset="0.4" stopColor="#0D9488" />
                <stop offset="0.56" stopColor="#D97706" />
                <stop offset="0.74" stopColor="#DC2626" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>

            {/* y guide labels */}
            <text x="6" y={PLOT_TOP + 10} fontSize="9" fill="#0D9488" fontWeight="600">
              Fresh
            </text>
            <text x="6" y={PLOT_BOT - 2} fontSize="9" fill="#DC2626" fontWeight="600">
              Tired
            </text>

            {/* hour gridlines + circadian-dip shading */}
            <rect
              x={xFor(13.5)}
              y={PLOT_TOP}
              width={xFor(15.5) - xFor(13.5)}
              height={PLOT_H}
              fill="#00000008"
            />
            {HOURS.map((h) => (
              <line
                key={h}
                x1={xFor(h)}
                y1={PLOT_TOP}
                x2={xFor(h)}
                y2={PLOT_BOT}
                stroke="#F0EDE6"
                strokeWidth="1"
              />
            ))}
            <line x1={PADL} y1={PLOT_BOT} x2={PADL + PLOTW} y2={PLOT_BOT} stroke="#E5E0D8" strokeWidth="1" />

            {/* drop slot highlight */}
            {dropSlot !== null && (
              <rect
                x={xFor(dropSlot) - 9}
                y={PLOT_TOP}
                width="18"
                height={BAND_Y0 + 52 - PLOT_TOP}
                fill="#0D948822"
                rx="3"
              />
            )}

            {/* energy curve */}
            <path d={areaPath} fill="url(#bydCurve)" fillOpacity="0.14" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="url(#bydCurve)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* hour labels */}
            {HOURS.map((h) => (
              <text
                key={h}
                x={xFor(h)}
                y={AXIS_Y}
                textAnchor="middle"
                fontSize="9"
                fill="#9CA3AF"
              >
                {h === 24 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
              </text>
            ))}

            {/* placed activity badges */}
            {badges.map(({ p, cx, row }) => {
              const cy = rowY(row);
              const act = ACT[p.type];
              const sel = selectedId === p.id;
              return (
                <g
                  key={p.id}
                  onClick={(e) => e.stopPropagation()}
                  onPointerEnter={() => setHoveredId(p.id)}
                  onPointerLeave={() => setHoveredId((h) => (h === p.id ? null : h))}
                  style={{ cursor: "grab" }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="20"
                    fill="transparent"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      startDrag(e, { kind: "move", type: p.type, placedId: p.id });
                    }}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="13"
                    fill="#fff"
                    stroke={sel ? "#001A33" : "#E5E0D8"}
                    strokeWidth={sel ? "2" : "1"}
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fontSize="14"
                    style={{ pointerEvents: "none" }}
                  >
                    {act.emoji}
                  </text>
                  {sel && (
                    <g
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        removeActivity(p.id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <circle cx={cx + 12} cy={cy - 12} r="8" fill="#DC2626" />
                      <text
                        x={cx + 12}
                        y={cy - 8.5}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#fff"
                        fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        ×
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* hover tooltip */}
          {(() => {
            if (!hoveredId) return null;
            const b = badges.find((x) => x.p.id === hoveredId);
            if (!b) return null;
            const act = ACT[b.p.type];
            return (
              <div
                style={{
                  position: "absolute",
                  left: `${(b.cx / VW) * 100}%`,
                  top: `${(rowY(b.row) / VH) * 100}%`,
                  transform: "translate(-50%, calc(-100% - 20px))",
                  pointerEvents: "none",
                  backgroundColor: "#001A33",
                  color: "#fff",
                  borderRadius: "5px",
                  padding: "6px 9px",
                  width: "186px",
                  zIndex: 5,
                }}
              >
                <p className="text-xs font-bold mb-0.5">{act.label}</p>
                <p className="text-xs" style={{ color: "#CBD5E1", lineHeight: 1.4 }}>
                  {act.tip}
                </p>
              </div>
            );
          })()}
        </div>

        {/* armed hint */}
        {armed && (
          <p className="text-xs mt-2 font-medium" style={{ color: "#0D9488" }}>
            Tap the timeline to drop {ACT[armed].label}. Tap the tile again to cancel.
          </p>
        )}

        {/* Activity library */}
        <p className="text-xs font-semibold uppercase tracking-wider mt-5 mb-2" style={{ color: "var(--ink-soft)" }}>
          Activities
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => {
            const isArmed = armed === a.key;
            return (
              <div
                key={a.key}
                role="button"
                tabIndex={0}
                aria-label={`Add ${a.label} to your day. ${a.tip}`}
                aria-pressed={isArmed}
                onPointerDown={(e) => startDrag(e, { kind: "new", type: a.key })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addViaKeyboard(a.key);
                  }
                }}
                title={a.tip}
                style={{
                  width: "70px",
                  height: "90px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  borderRadius: "14px",
                  background: isArmed
                    ? "linear-gradient(165deg, rgba(13,148,136,0.22), rgba(255,255,255,0.5))"
                    : "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: `1px solid ${isArmed ? "rgba(13,148,136,0.55)" : "rgba(255,255,255,0.6)"}`,
                  boxShadow: isArmed
                    ? "0 0 0 3px rgba(13,148,136,0.18), inset 0 1px 0 rgba(255,255,255,0.85)"
                    : "inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 8px -4px rgba(20,30,60,0.18)",
                  cursor: "grab",
                  touchAction: "none",
                  userSelect: "none",
                  transform: isArmed ? "translateY(-2px)" : "none",
                  transition: "transform 0.2s var(--spring), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                }}
              >
                <span style={{ fontSize: "26px", lineHeight: 1 }}>{a.emoji}</span>
                <span
                  className="text-center"
                  style={{ fontSize: "10px", color: "var(--ink-soft)", lineHeight: 1.15, padding: "0 2px" }}
                >
                  {a.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
          Drag a tile onto the timeline, or tap it then tap a time. Tap a placed activity to move or remove it.
          On a keyboard, focus a tile and press Enter to drop it, then use the arrow keys on the timeline to move it.
        </p>

        {/* Screen-reader announcements for keyboard actions */}
        <div aria-live="polite" className="sr-only">
          {liveMsg}
        </div>

        {/* Live insights */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(11,26,43,0.10)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>
            Reading your day
          </p>
          <div className="space-y-2">
            {insights.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                <span
                  className="flex-shrink-0 rounded-full block"
                  style={{ width: "5px", height: "5px", marginTop: "7px", backgroundColor: "#0D9488" }}
                />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </LiquidGlass>

      {/* drag ghost */}
      {ghost && (
        <div
          style={{
            position: "fixed",
            left: ghost.x,
            top: ghost.y,
            transform: "translate(-50%, -50%) rotate(-4deg)",
            pointerEvents: "none",
            zIndex: 60,
            width: "58px",
            height: "58px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            border: "2px solid #0D9488",
            boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.92,
            fontSize: "26px",
          }}
        >
          {ACT[ghost.type].emoji}
        </div>
      )}
    </div>
  );
}

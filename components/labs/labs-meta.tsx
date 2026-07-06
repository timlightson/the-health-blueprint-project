import { Moon, Zap, Brain, Droplet, Ear, Target, Wind, Coffee, Eye, type LucideIcon } from "lucide-react";

// ─── Single source of truth for lab identity ─────────────────────────────────
// Homepage cards and lab headers all read from here. Add a lab once, it shows
// up everywhere. Labs stand alone, PhET-style; the homepage is the catalog.

export type LabId =
  | "sleep"
  | "energy"
  | "stress"
  | "hydration"
  | "sound"
  | "focus"
  | "breath"
  | "caffeine"
  | "vision";

export interface LabMeta {
  id: LabId;
  index: string;
  name: string;
  title: string;
  headline: string;
  description: string;
  stat: string;
  statLabel: string;
  accent: string;
  tint: string;
  glow: string;
  icon: LucideIcon;
  /** header icon chip gradient + glow */
  iconBg: string;
  iconShadow: string;
}

export const LABS: LabMeta[] = [
  {
    id: "sleep",
    index: "01",
    name: "Sleep",
    title: "Sleep Lab",
    headline: "How sleep debt rewires your brain",
    description:
      "Build your real week and watch what stacks up by Friday. Reaction time, memory, mood, all of it.",
    stat: "77%",
    statLabel: "of US teens don't get enough sleep",
    accent: "#0E8A7D",
    tint: "rgba(14,138,125,0.10)",
    glow: "rgba(14,138,125,0.30)",
    icon: Moon,
    iconBg: "linear-gradient(160deg, rgba(45,212,191,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(13,148,136,0.5)",
  },
  {
    id: "energy",
    index: "02",
    name: "Energy",
    title: "Energy Lab",
    headline: "Why your energy spikes, crashes, and slumps",
    description:
      "Build your real day and watch the curve respond. Meet the 24-hour clock behind your afternoon slump, and the engines that fire when you sprint.",
    stat: "20%",
    statLabel: "of your energy is burned by your brain",
    accent: "#C9760F",
    tint: "rgba(201,118,15,0.10)",
    glow: "rgba(201,118,15,0.28)",
    icon: Zap,
    iconBg: "linear-gradient(160deg, rgba(245,158,11,0.34), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(201,118,15,0.5)",
  },
  {
    id: "stress",
    index: "03",
    name: "Stress",
    title: "Stress Lab",
    headline: "What being overwhelmed does to your brain",
    description:
      "Stack up a day's worth of pressure and watch it quietly take your focus, memory, and patience offline.",
    stat: "−40%",
    statLabel: "decision quality under heavy stress load",
    accent: "#D8443B",
    tint: "rgba(216,68,59,0.10)",
    glow: "rgba(216,68,59,0.26)",
    icon: Brain,
    iconBg: "linear-gradient(160deg, rgba(248,113,113,0.30), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(216,68,59,0.45)",
  },
  {
    id: "hydration",
    index: "04",
    name: "Hydration",
    title: "Hydration Lab",
    headline: "What a little dehydration does to your brain",
    description:
      "Drop your fluid level and watch focus, mood, and effort slide. Small losses hit harder than you'd think.",
    stat: "2%",
    statLabel: "body water lost before focus and mood dip",
    accent: "#2563EB",
    tint: "rgba(37,99,235,0.10)",
    glow: "rgba(37,99,235,0.28)",
    icon: Droplet,
    iconBg: "linear-gradient(160deg, rgba(59,130,246,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(37,99,235,0.5)",
  },
  {
    id: "sound",
    index: "05",
    name: "Sound",
    title: "Sound Lab",
    headline: "How loud is too loud, and for how long",
    description:
      "Set the volume and the hours, and see how fast your ears cross the line. Earbuds get there quicker than concerts.",
    stat: "85 dB",
    statLabel: "the level where hearing damage starts",
    accent: "#7C3AED",
    tint: "rgba(124,58,237,0.10)",
    glow: "rgba(124,58,237,0.28)",
    icon: Ear,
    iconBg: "linear-gradient(160deg, rgba(139,92,246,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(124,58,237,0.5)",
  },
  {
    id: "focus",
    index: "06",
    name: "Focus",
    title: "Focus Lab",
    headline: "The real cost of switching tasks",
    description:
      "Stack up interruptions and watch the minutes leak out. Multitasking is a story your brain tells you.",
    stat: "23 min",
    statLabel: "to fully refocus after a single interruption",
    accent: "#DB2777",
    tint: "rgba(219,39,119,0.10)",
    glow: "rgba(219,39,119,0.28)",
    icon: Target,
    iconBg: "linear-gradient(160deg, rgba(236,72,153,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(219,39,119,0.5)",
  },
  {
    id: "breath",
    index: "07",
    name: "Breath",
    title: "Breath Lab",
    headline: "How your breath dials your nervous system",
    description:
      "Slow your breathing down and watch your nervous system follow. The exhale is the lever.",
    stat: "6/min",
    statLabel: "breaths a minute for peak heart-rate variability",
    accent: "#0891B2",
    tint: "rgba(8,145,178,0.10)",
    glow: "rgba(8,145,178,0.28)",
    icon: Wind,
    iconBg: "linear-gradient(160deg, rgba(6,182,212,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(8,145,178,0.5)",
  },
  {
    id: "caffeine",
    index: "08",
    name: "Caffeine",
    title: "Caffeine Lab",
    headline: "Where your caffeine actually goes",
    description:
      "Set when and how much, then watch how much is still in you at bedtime. Caffeine lingers way past the buzz.",
    stat: "~5 hr",
    statLabel: "caffeine half-life, so half is still in you",
    accent: "#B45309",
    tint: "rgba(180,83,9,0.10)",
    glow: "rgba(180,83,9,0.26)",
    icon: Coffee,
    iconBg: "linear-gradient(160deg, rgba(217,119,6,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(180,83,9,0.5)",
  },
  {
    id: "vision",
    index: "09",
    name: "Vision",
    title: "Vision Lab",
    headline: "Why screens and sunlight shape your eyes",
    description:
      "Trade screen time for sunlight and watch your eyes' risk shift. Where you look all day shapes how they grow.",
    stat: "2 hr",
    statLabel: "outdoor time a day that protects your eyes",
    accent: "#059669",
    tint: "rgba(5,150,105,0.10)",
    glow: "rgba(5,150,105,0.26)",
    icon: Eye,
    iconBg: "linear-gradient(160deg, rgba(16,185,129,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(5,150,105,0.5)",
  },
];

export const labMeta = (id: LabId): LabMeta => LABS.find((l) => l.id === id)!;

/** Catalog category per lab — shown as a small tag on homepage cards. */
export const LAB_TAGS: Record<LabId, string> = {
  sleep: "Recovery",
  energy: "Fuel",
  stress: "Mind",
  hydration: "Fuel",
  sound: "Senses",
  focus: "Mind",
  breath: "Reset",
  caffeine: "Fuel",
  vision: "Senses",
};

/** The three deep, multi-exhibit labs shown large on the homepage. */
export const FLAGSHIP_IDS: LabId[] = ["sleep", "energy", "stress"];

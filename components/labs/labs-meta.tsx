import { Moon, Zap, Brain, type LucideIcon } from "lucide-react";

// ─── Single source of truth for lab identity ─────────────────────────────────
// Homepage cards, lab headers, switcher pills, and next-lab cards all read
// from here. Add a lab once, it shows up everywhere.

export type LabId = "sleep" | "energy" | "stress";

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
];

export const labMeta = (id: LabId): LabMeta => LABS.find((l) => l.id === id)!;

export const nextLab = (id: LabId): LabMeta => {
  const i = LABS.findIndex((l) => l.id === id);
  return LABS[(i + 1) % LABS.length];
};

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
    title: "Sleep Blueprint",
    headline: "How short sleep can affect the next day",
    description:
      "Build a week of sleep schedules and explore a simplified estimate of accumulated sleep loss.",
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
    title: "Energy Blueprint",
    headline: "Why alertness changes across the day",
    description:
      "Build a day and explore how sleep, timing, activity, and meals can influence an educational alertness model.",
    stat: "20%",
    statLabel: "of resting energy use is attributed to the brain",
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
    title: "Stress Blueprint",
    headline: "How stress load and recovery interact",
    description:
      "Adjust an illustrative load model and compare how breaks change its output.",
    stat: "Model",
    statLabel: "not a diagnosis or personal stress score",
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
    title: "Hydration Blueprint",
    headline: "How heat and activity change fluid loss",
    description:
      "Run a school-day fluid model and see how activity and heat change estimated losses.",
    stat: "Varies",
    statLabel: "fluid needs depend on activity, heat, and the person",
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
    title: "Sound Blueprint",
    headline: "How loud is too loud, and for how long",
    description:
      "Compare sound levels with the NIOSH occupational exposure model and test pitch matching by ear.",
    stat: "85 dB",
    statLabel: "NIOSH 8-hour occupational exposure limit",
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
    title: "Focus Blueprint",
    headline: "What task switching can cost",
    description:
      "Run two reaction-time rounds with and without interruptions, then compare your results.",
    stat: "Varies",
    statLabel: "interruption costs depend on the task and context",
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
    title: "Breath Blueprint",
    headline: "A timer for paced breathing",
    description:
      "Use a paced-breathing timer and observe the rhythm without treating it as a stress measurement.",
    stat: "Slow",
    statLabel: "paced breathing affects people differently",
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
    title: "Caffeine Blueprint",
    headline: "How caffeine declines over time",
    description:
      "Set a dose, time, and bedtime, then inspect an estimate based on a five-hour half-life.",
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
    title: "Vision Blueprint",
    headline: "Outdoor time, near work, and myopia",
    description:
      "Explore research associations among outdoor time, near work, and myopia without calculating personal risk.",
    stat: "Linked",
    statLabel: "outdoor time is associated with lower myopia incidence",
    accent: "#059669",
    tint: "rgba(5,150,105,0.10)",
    glow: "rgba(5,150,105,0.26)",
    icon: Eye,
    iconBg: "linear-gradient(160deg, rgba(16,185,129,0.32), rgba(255,255,255,0.5))",
    iconShadow: "0 4px 10px -4px rgba(5,150,105,0.5)",
  },
];

export const labMeta = (id: LabId): LabMeta => LABS.find((l) => l.id === id)!;

/** Page metadata for a lab route. Each lab's layout.tsx exports this so the
 *  client page still gets a real title/description for search and sharing. */
export const labPageMetadata = (id: LabId) => {
  const m = labMeta(id);
  return {
    title: `${m.title} · The Health Blueprint`,
    description: `${m.headline}. ${m.description}`,
  };
};

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

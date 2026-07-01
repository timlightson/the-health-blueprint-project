// ─── Sports energy data ──────────────────────────────────────────────────────
//
// Sixteen sports, each with one or more scenarios. Every engine split (phosphagen
// / glycolytic / aerobic) sums to 100 and traces to a cited source. Where a value
// was not measured directly, it falls back to the Gastin (2001) duration model or
// the Spencer (2005) repeated-sprint archetype, noted in the citation.

export type EngineSplit = { phos: number; glyc: number; aero: number };
export type LactateLevel = "low" | "med" | "high" | "extreme";
export type SportMode = "effort" | "intermittent";

// Dominant-profile tag drives the grid color, so the tiles read as a spectrum.
export type Profile = "explosive" | "burn" | "aerobic" | "mixed";

export interface Scenario {
  label: string;          // chip label, e.g. "400 m"
  durationLabel: string;  // shown in the readout, e.g. "about 48s"
  duration: number;       // seconds (effort length, or shown match length)
  split: EngineSplit;     // sums to 100
  lactate: LactateLevel;
  why: string;
  citation: string;
  blendLabel?: string;    // readout label for the split
  work?: number;          // intermittent: burst length, seconds
  rest?: number;          // intermittent: rest length, seconds
}

export interface Sport {
  id: string;
  name: string;
  theme: string;          // illustration / accent color
  profile: Profile;
  profileLabel: string;   // words on the grid pill
  illustration: string;   // key into the SVG illustration map
  mode: SportMode;
  scenarios: Scenario[];
}

const GASTIN = "Gastin, Sports Medicine (2001)";
const SPENCER_GASTIN = "Spencer & Gastin, Med Sci Sports Exerc (2001)";
const SPENCER_RS = "Spencer et al., Sports Medicine (2005)";

export const SPORTS: Sport[] = [
  // ── EFFORT MODE ──────────────────────────────────────────────────────────────
  {
    id: "track",
    name: "Track & Field",
    theme: "#5B6CF0",
    profile: "mixed",
    profileLabel: "Every engine",
    illustration: "track",
    mode: "effort",
    scenarios: [
      { label: "100 m", durationLabel: "about 10s", duration: 10, split: { phos: 50, glyc: 40, aero: 10 }, lactate: "low",
        why: "Pure phosphagen. You spend stored ATP as fast as your muscles can pull it, and it is gone in about ten seconds. No time to even feel the burn.",
        citation: `${GASTIN}; ${SPENCER_GASTIN}` },
      { label: "200 m", durationLabel: "about 20s", duration: 20, split: { phos: 25, glyc: 57, aero: 18 }, lactate: "med",
        why: "Phosphagen gets you out of the blocks, then glycolysis takes the wheel. The burn shows up in the home straight.",
        citation: SPENCER_GASTIN },
      { label: "400 m", durationLabel: "about 48s", duration: 48, split: { phos: 12, glyc: 50, aero: 38 }, lactate: "extreme",
        why: "The lactate peak of the whole sport. Almost pure glycolysis with no aerobic bailout yet, which is why the last 100 feels like running through wet cement.",
        citation: SPENCER_GASTIN },
      { label: "800 m", durationLabel: "about 1:50", duration: 110, split: { phos: 8, glyc: 37, aero: 55 }, lactate: "high",
        why: "The nasty one. You start out anaerobic and your aerobic engine is still spinning up right as the lactate piles on.",
        citation: SPENCER_GASTIN },
      { label: "Mile", durationLabel: "about 4:30", duration: 270, split: { phos: 5, glyc: 15, aero: 80 }, lactate: "med",
        why: "Mostly aerobic now, but you still need a real anaerobic kick to close.",
        citation: SPENCER_GASTIN },
      { label: "5K", durationLabel: "about 16 min", duration: 960, split: { phos: 2, glyc: 6, aero: 92 }, lactate: "low",
        why: "Almost all aerobic. Pace it right and oxygen covers nearly the whole way, with one gear left for the finish.",
        citation: GASTIN },
    ],
  },
  {
    id: "swimming",
    name: "Swimming",
    theme: "#0EA5E9",
    profile: "mixed",
    profileLabel: "Burn to endurance",
    illustration: "swimming",
    mode: "effort",
    scenarios: [
      { label: "50 free", durationLabel: "about 22s", duration: 22, split: { phos: 25, glyc: 57, aero: 18 }, lactate: "med",
        why: "One length, all out. Phosphagen and glycolysis split the work and you are done before oxygen can really help.",
        citation: GASTIN },
      { label: "100 free", durationLabel: "about 50s", duration: 50, split: { phos: 12, glyc: 48, aero: 40 }, lactate: "high",
        why: "Two lengths and the lactate is real. Glycolysis is carrying you while your aerobic engine is still catching up.",
        citation: GASTIN },
      { label: "200 free", durationLabel: "about 2 min", duration: 120, split: { phos: 8, glyc: 35, aero: 57 }, lactate: "high",
        why: "Now your aerobic engine is online and doing most of the work, but the back half still burns.",
        citation: GASTIN },
      { label: "1650 free", durationLabel: "about 15 min", duration: 900, split: { phos: 3, glyc: 10, aero: 87 }, lactate: "low",
        why: "The mile in the pool. Almost all aerobic, paced from the first length so oxygen can cover it.",
        citation: GASTIN },
    ],
  },
  {
    id: "rowing",
    name: "Rowing",
    theme: "#0F766E",
    profile: "aerobic",
    profileLabel: "Feels anaerobic, runs aerobic",
    illustration: "rowing",
    mode: "effort",
    scenarios: [
      { label: "2000 m", durationLabel: "about 6:30", duration: 390, split: { phos: 5, glyc: 18, aero: 77 }, lactate: "high",
        why: "It feels like a pure sprint the whole way, but about three quarters of a 2K is aerobic. The start and the finish are where glycolysis spikes.",
        citation: "Secher, Sports Medicine (1993); de Campos Mello et al., Eur J Appl Physiol (2009)" },
    ],
  },
  {
    id: "cross-country",
    name: "Cross Country",
    theme: "#15803D",
    profile: "aerobic",
    profileLabel: "Pure endurance",
    illustration: "crosscountry",
    mode: "effort",
    scenarios: [
      { label: "5K", durationLabel: "about 17 min", duration: 1020, split: { phos: 2, glyc: 6, aero: 92 }, lactate: "low",
        why: "Pure endurance. Settle into a pace your aerobic engine can hold and let oxygen do almost everything.",
        citation: GASTIN },
      { label: "10K", durationLabel: "about 35 min", duration: 2100, split: { phos: 1, glyc: 4, aero: 95 }, lactate: "low",
        why: "Even more aerobic than the 5K. The whole race is paced so you never tip into the burn until the finish.",
        citation: GASTIN },
    ],
  },
  {
    id: "cycling",
    name: "Cycling",
    theme: "#0891B2",
    profile: "aerobic",
    profileLabel: "Endurance and surges",
    illustration: "cycling",
    mode: "effort",
    scenarios: [
      { label: "Time trial", durationLabel: "20+ min", duration: 1500, split: { phos: 3, glyc: 12, aero: 85 }, lactate: "low",
        why: "A long, steady aerobic effort against the clock. You hold just under the line where lactate would start to climb.",
        citation: GASTIN },
      { label: "Breakaway", durationLabel: "about 15s", duration: 15, split: { phos: 45, glyc: 42, aero: 13 }, lactate: "high",
        why: "A 15 second attack off the front. Phosphagen and glycolysis fire together to open a gap before anyone reacts.",
        citation: GASTIN },
    ],
  },
  {
    id: "weightlifting",
    name: "Weightlifting",
    theme: "#EA580C",
    profile: "explosive",
    profileLabel: "Pure power",
    illustration: "weightlifting",
    mode: "effort",
    scenarios: [
      { label: "Max lift", durationLabel: "about 3s", duration: 3, split: { phos: 90, glyc: 8, aero: 2 }, lactate: "low",
        why: "Three seconds of pure power. It is almost all phosphagen, and then you rest for minutes before doing it again.",
        citation: `${GASTIN}, alactic dominance under 10 seconds` },
    ],
  },
  {
    id: "gymnastics",
    name: "Gymnastics",
    theme: "#DB2777",
    profile: "burn",
    profileLabel: "The burn",
    illustration: "gymnastics",
    mode: "effort",
    scenarios: [
      { label: "Floor routine", durationLabel: "about 70s", duration: 70, split: { phos: 15, glyc: 50, aero: 35 }, lactate: "high",
        why: "About 70 seconds of tumbling and holding. Glycolysis dominates and the burn in your arms and legs is real by the final pass.",
        citation: GASTIN },
    ],
  },

  // ── INTERMITTENT MODE ────────────────────────────────────────────────────────
  {
    id: "soccer",
    name: "Soccer",
    theme: "#16A34A",
    profile: "mixed",
    profileLabel: "Mixed engines",
    illustration: "soccer",
    mode: "intermittent",
    scenarios: [
      { label: "90-min match", durationLabel: "90 min match", duration: 5400, work: 3, rest: 35, blendLabel: "Match blend",
        split: { phos: 10, glyc: 20, aero: 70 }, lactate: "med",
        why: "Most of the 90 minutes is aerobic running, but the game is decided in 2 to 4 second sprints. Your aerobic base is what refills the sprint tank between them.",
        citation: "Stølen et al., Sports Medicine (2005); Krustrup et al., Med Sci Sports Exerc (2006)" },
    ],
  },
  {
    id: "basketball",
    name: "Basketball",
    theme: "#EA7317",
    profile: "mixed",
    profileLabel: "Mixed engines",
    illustration: "basketball",
    mode: "intermittent",
    scenarios: [
      { label: "Full game", durationLabel: "about 40 min", duration: 2400, work: 4, rest: 12, blendLabel: "Game blend",
        split: { phos: 13, glyc: 22, aero: 65 }, lactate: "med",
        why: "You are above 85 percent of your max heart rate most of the game, with constant short bursts. The aerobic base keeps you recharging between them.",
        citation: "Ben Abdelkrim et al., Br J Sports Med (2007)" },
    ],
  },
  {
    id: "football",
    name: "American Football",
    theme: "#B45309",
    profile: "explosive",
    profileLabel: "Explosive bursts",
    illustration: "football",
    mode: "intermittent",
    scenarios: [
      { label: "By the play", durationLabel: "5s plays, long rest", duration: 600, work: 5, rest: 35, blendLabel: "Per play",
        split: { phos: 88, glyc: 10, aero: 2 }, lactate: "low",
        why: "A play lasts about five seconds and is almost pure phosphagen, then you get 20 to 40 seconds to refill before the next snap. Big power, long rest, low lactate.",
        citation: "Hoffman, Int J Sports Physiol Perform (2008)" },
    ],
  },
  {
    id: "hockey",
    name: "Ice Hockey",
    theme: "#0284C7",
    profile: "burn",
    profileLabel: "The burn",
    illustration: "hockey",
    mode: "intermittent",
    scenarios: [
      { label: "By the shift", durationLabel: "45s shifts", duration: 2700, work: 45, rest: 110, blendLabel: "Shift blend",
        split: { phos: 20, glyc: 45, aero: 35 }, lactate: "high",
        why: "A 45 second shift with only a short rest before the next one. Glycolysis carries the shift and the lactate climbs fast, which is why shifts are kept short.",
        citation: "Montgomery, Sports Medicine (1988)" },
    ],
  },
  {
    id: "lacrosse",
    name: "Lacrosse",
    theme: "#7C3AED",
    profile: "mixed",
    profileLabel: "Mixed engines",
    illustration: "lacrosse",
    mode: "intermittent",
    scenarios: [
      { label: "Full match", durationLabel: "60 min match", duration: 3600, work: 6, rest: 24, blendLabel: "Match blend",
        split: { phos: 15, glyc: 25, aero: 60 }, lactate: "med",
        why: "An aerobic base with repeated sprints over the field. Enough rest to keep lactate moderate, enough work to keep your engines busy.",
        citation: SPENCER_RS },
    ],
  },
  {
    id: "tennis",
    name: "Tennis",
    theme: "#84CC16",
    profile: "mixed",
    profileLabel: "Mixed engines",
    illustration: "tennis",
    mode: "intermittent",
    scenarios: [
      { label: "By the point", durationLabel: "1 to 3 hr match", duration: 6000, work: 6, rest: 20, blendLabel: "Per point",
        split: { phos: 70, glyc: 20, aero: 10 }, lactate: "low",
        why: "Each point is a 6 second burst of almost pure power, but you get 20 seconds between points. Hundreds of points, and the long rest keeps lactate low all match.",
        citation: "Fernandez-Fernandez et al., Br J Sports Med (2006)" },
    ],
  },
  {
    id: "volleyball",
    name: "Volleyball",
    theme: "#F59E0B",
    profile: "explosive",
    profileLabel: "Explosive, all rest",
    illustration: "volleyball",
    mode: "intermittent",
    scenarios: [
      { label: "By the rally", durationLabel: "8s rallies, long rest", duration: 2400, work: 8, rest: 20, blendLabel: "Per rally",
        split: { phos: 60, glyc: 25, aero: 15 }, lactate: "low",
        why: "A rally is about 8 seconds of jumps and dives, then a real rest before the next serve. Explosive bursts with full recovery, so the lactate never builds.",
        citation: SPENCER_RS },
    ],
  },
  {
    id: "baseball",
    name: "Baseball / Softball",
    theme: "#DC2626",
    profile: "explosive",
    profileLabel: "Explosive, all rest",
    illustration: "baseball",
    mode: "intermittent",
    scenarios: [
      { label: "By the play", durationLabel: "9 innings", duration: 3000, work: 4, rest: 60, blendLabel: "Per burst",
        split: { phos: 80, glyc: 12, aero: 8 }, lactate: "low",
        why: "A swing, a throw, a sprint to first, then you stand around. The bursts are explosive but the rest is huge, so this is the lowest continuous demand on the grid.",
        citation: SPENCER_RS },
    ],
  },
  {
    id: "wrestling",
    name: "Wrestling",
    theme: "#B91C1C",
    profile: "burn",
    profileLabel: "The burn",
    illustration: "wrestling",
    mode: "intermittent",
    scenarios: [
      { label: "A match", durationLabel: "about 6 min", duration: 390, work: 35, rest: 14, blendLabel: "Match blend",
        split: { phos: 10, glyc: 45, aero: 45 }, lactate: "extreme",
        why: "Six minutes of near constant grappling. Lactate climbs to about 15 mmol per liter, the highest on this grid, even though half your energy is already aerobic by the one minute mark.",
        citation: "Nilsson et al., J Sports Sci (2002); Karnincic et al. (2009)" },
    ],
  },
];

export const RECOVERY_CITATION = "Harris et al., Pflügers Archiv (1976)";

// Color for the dominant-profile tag (drives the grid spectrum read).
export const PROFILE_COLOR: Record<Profile, string> = {
  explosive: "#EA580C",
  burn: "#D97706",
  aerobic: "#0D9488",
  mixed: "#6366F1",
};

export function getSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

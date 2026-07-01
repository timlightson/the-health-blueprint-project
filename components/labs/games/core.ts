// Shared types, metadata and helpers for the Sleep Lab game library.

export type Difficulty = "9hr" | "6hr" | "4hr";

export interface DifficultyMeta {
  id: Difficulty;
  label: string;
  hours: number;
  color: string;
  tint: string;
  border: string;
  explainer: string;
}

export const DIFFICULTIES: DifficultyMeta[] = [
  {
    id: "9hr",
    label: "9 hours of sleep",
    hours: 9,
    color: "#0D9488",
    tint: "#0D948814",
    border: "#0D948855",
    explainer: "Relaxed mode. More time, simpler patterns. Your brain running the way it should.",
  },
  {
    id: "6hr",
    label: "6 hours of sleep",
    hours: 6,
    color: "#D97706",
    tint: "#D9770614",
    border: "#D9770655",
    explainer: "The realistic teen baseline. Moderate speed, moderate difficulty.",
  },
  {
    id: "4hr",
    label: "4 hours of sleep",
    hours: 4,
    color: "#DC2626",
    tint: "#DC262614",
    border: "#DC262655",
    explainer: "Wrecked mode. Faster, harder, barely any time. What a tired brain is up against.",
  },
];

export function diffMeta(d: Difficulty): DifficultyMeta {
  return DIFFICULTIES.find((x) => x.id === d) ?? DIFFICULTIES[1];
}

export function diffLabel(d: Difficulty): string {
  return `${diffMeta(d).hours} hours of sleep`;
}

export interface GameMeta {
  id: string;
  route: string;
  title: string;
  tagline: string;
  description: string;
  researchNote: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "reaction",
    route: "/labs/sleep/games/reaction",
    title: "Reaction Time",
    tagline: "How fast you react",
    description: "Tap the circle the moment it turns green.",
    researchNote:
      "Sleep-deprived people react slower across the board, and the slow lapses get longer. This is the same test sleep scientists use, the Psychomotor Vigilance Task (Basner & Dinges, 2011).",
  },
  {
    id: "memory",
    route: "/labs/sleep/games/memory",
    title: "Memory Sequence",
    tagline: "Short-term memory",
    description: "Watch the colored squares light up. Tap them back in order.",
    researchNote:
      "Sleep-deprived teens lose around 20% of their memory encoding ability. Tired sequences feel impossible because, for a tired brain, they nearly are (Newbury & Bhatt, 2024).",
  },
  {
    id: "focus",
    route: "/labs/sleep/games/focus",
    title: "Focus Grid",
    tagline: "Visual attention",
    description: "Find the letter that's different. As fast as you can.",
    researchNote:
      "Sleep-deprived students take about 23% longer on attention tasks. The fog is real, and it slows down everything you look at (Auctores Online, 2024).",
  },
  {
    id: "pattern",
    route: "/labs/sleep/games/pattern",
    title: "Pattern Lock",
    tagline: "Motor sequence memory",
    description: "Watch the pattern. Drag through the same dots in order.",
    researchNote:
      "Motor sequence learning drops a lot when you lose sleep. It's why athletes who skip sleep play worse. Their bodies can't lock in the patterns.",
  },
  {
    id: "word",
    route: "/labs/sleep/games/word",
    title: "Word Strands",
    tagline: "Daily theme puzzle",
    description: "Find the theme words. Use every letter. One puzzle a day.",
    researchNote:
      "Word puzzles lean on pattern recognition and working memory, both of which slow down when you're short on sleep.",
  },
  {
    id: "math",
    route: "/labs/sleep/games/math",
    title: "Quick Math",
    tagline: "Processing speed",
    description: "Simple math, fast answers. Beat the timer.",
    researchNote:
      "Processing speed slows by about 40% with serious sleep loss. Same math, your brain just takes longer to get there.",
  },
  {
    id: "stroop",
    route: "/labs/sleep/games/stroop",
    title: "Color Match",
    tagline: "Mental flexibility",
    description: "The word says one color. The text is another. Tap the color of the text, not the word.",
    researchNote:
      "This test measures your prefrontal cortex, the brain region sleep deprivation hits hardest. Stroop interference goes way up in tired brains.",
  },
  {
    id: "spot",
    route: "/labs/sleep/games/spot",
    title: "Spot the Difference",
    tagline: "Visual detail scanning",
    description: "Two pictures look almost the same. Find the 5 differences before time runs out.",
    researchNote:
      "Sleep loss makes you miss roughly 30% more visual details. Your brain stops scanning carefully and just skims.",
  },
];

export function gameMeta(id: string): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

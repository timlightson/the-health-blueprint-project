import type { LabId } from "@/components/labs/labs-meta";

// ─── Learn — short cited articles that hand off to a Blueprint ───────────────
// These are the "full explanation" layer: an Instagram hook becomes a readable
// article, and the article ends by sending you into the interactive Blueprint.
// Everything here stays evidence-based with real citations.

export type ArticleKind = "Explainer" | "Myth" | "Research";

export interface ArticleBlock {
  h?: string; // optional subheading
  p: string;
}

export interface Article {
  slug: string;
  kind: ArticleKind;
  question: string; // the IG-style hook, e.g. "Why am I always tired?"
  title: string;
  dek: string; // one-line summary
  minutes: number;
  lab: LabId; // which Blueprint this hands off to
  blocks: ArticleBlock[];
  sources: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: "why-am-i-always-tired",
    kind: "Explainer",
    question: "Why am I always tired?",
    title: "You're not lazy. You're running on sleep debt.",
    dek: "How a few short nights quietly tax your focus, memory, and mood, and how fast it comes back.",
    minutes: 4,
    lab: "sleep",
    blocks: [
      { p: "If you feel wiped no matter how long you sleep on weekends, the problem usually is not one bad night. It is the running total. Teens need 8 to 10 hours, and most get far less. That gap is called sleep debt, and your brain settles the bill the next day." },
      { h: "What short sleep actually takes", p: "On under six hours of sleep, reaction time drops around 25% and short-term memory takes a similar hit. Your amygdala, the part that handles emotion, gets roughly 60% more reactive, which is why small annoyances feel huge when you are tired." },
      { h: "The one that surprises people", p: "Staying awake 17 hours slows your reactions about as much as a 0.05% blood alcohol level. You do not feel impaired, which is exactly what makes it risky during a test, a drive, or a game." },
      { h: "The good news", p: "This reverses fast. A consistent bedtime, even on weekends, morning sunlight to anchor your clock, and putting your phone out of reach an hour before bed do most of the work. Bright screens at night can hold melatonin back about 90 minutes, so the phone is usually the biggest lever." },
    ],
    sources: [
      "CDC Youth Risk Behavior Survey, 2023",
      "Yoo et al., Current Biology 2007",
      "Dawson & Reid, Nature 1997",
      "Chang et al., PNAS 2014",
    ],
  },
  {
    slug: "why-caffeine-keeps-you-up",
    kind: "Explainer",
    question: "Why is my afternoon coffee keeping me up?",
    title: "Caffeine stays longer than the buzz.",
    dek: "It does not just wear off. It fades in slow steps, which is why a 3 PM drink can still be working at midnight.",
    minutes: 3,
    lab: "caffeine",
    blocks: [
      { p: "Caffeine works by blocking adenosine, the molecule that builds up all day and makes you sleepy. The catch is how slowly it leaves. Caffeine has a half-life of about five hours, so five hours after your drink, half of it is still in you. Five hours after that, a quarter is." },
      { h: "Do the math on a real day", p: "A 160 mg energy drink at 3 PM leaves roughly 80 mg in your system at 8 PM and around 40 mg at 1 AM. That is enough to make falling asleep harder and to thin out the deep sleep you do get." },
      { h: "What the research shows", p: "In one study, a 400 mg dose taken even six hours before bed measurably cut total sleep time. The people did not always feel wired. The sleep loss showed up anyway." },
    ],
    sources: [
      "Institute of Medicine, 2001; Nehlig, Pharmacol Rev 2018",
      "Drake et al., J Clin Sleep Med 2013",
      "American Academy of Pediatrics, 2011",
    ],
  },
  {
    slug: "does-thirst-come-too-late",
    kind: "Myth",
    question: "Can I just drink when I feel thirsty?",
    title: "Thirst shows up late, on purpose.",
    dek: "Waiting for thirst means you are already behind. Small fluid losses dent focus and mood before the alarm ever rings.",
    minutes: 3,
    lab: "hydration",
    blocks: [
      { p: "The common belief is that thirst is a reliable gas gauge: feel it, drink, done. It is not. Thirst is a late warning. By the time it kicks in hard, you are usually already down a percent or two of body water, and that is enough to matter." },
      { h: "Why a small loss counts", p: "Losing just 1 to 2% of your body water measurably worsens mood, attention, and short-term memory in healthy young people. For a 150 lb person, 2% is a bit over a liter, which is an ordinary school day without drinking much." },
      { h: "When it drains fastest", p: "Sitting in class is a slow drip. Hard practice can sweat out 1 to 2 liters an hour, so the smart move is to drink before and during the sweaty parts of your day, not after you finally feel parched." },
    ],
    sources: [
      "Ganio et al., Br J Nutr 2011; Armstrong et al., J Nutr 2012",
      "Sawka et al., ACSM Position Stand 2007",
      "Popkin et al., Nutr Rev 2010",
    ],
  },
];

export const articleBySlug = (slug: string): Article | undefined => ARTICLES.find((a) => a.slug === slug);
export const articlesForLab = (lab: LabId): Article[] => ARTICLES.filter((a) => a.lab === lab);

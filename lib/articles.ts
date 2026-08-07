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
    title: "What sleep debt changes the next day.",
    dek: "Short sleep can impair attention, memory formation, and emotional regulation, including when the deficit accumulates across several nights.",
    minutes: 4,
    lab: "sleep",
    blocks: [
      { p: "Sleep debt is the gap between the sleep you need and the sleep you get over time. Teenagers are generally advised to sleep 8 to 10 hours a night, but one long weekend sleep does not necessarily erase the effects of a repeatedly short week." },
      { h: "Learning and emotional response", p: "Controlled sleep-deprivation studies have found weaker next-day memory formation and stronger amygdala responses to negative images. Those findings do not translate into one universal percentage for every short night, but they do show that insufficient sleep can affect more than alertness." },
      { h: "A useful performance comparison", p: "In one controlled study, cognitive performance after 17 hours awake was comparable to performance at a blood alcohol concentration of 0.05%. That is a comparison of measured impairment, not a claim that fatigue and alcohol affect the brain in identical ways." },
      { h: "What can help", p: "A regular schedule and enough time in bed are the starting points. Controlled studies also show that evening use of light-emitting devices can suppress melatonin, delay circadian timing, and make sleep onset later. The effect varies with brightness, duration, timing, and the person using the device." },
    ],
    sources: [
      "Paruthi et al., J Clin Sleep Med 2016",
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
    title: "Why caffeine can still matter hours later.",
    dek: "Caffeine is cleared gradually, so part of an afternoon dose can remain in the body near bedtime.",
    minutes: 3,
    lab: "caffeine",
    blocks: [
      { p: "Caffeine blocks adenosine receptors, reducing one of the signals involved in sleep pressure. Its average half-life in healthy adults is about five hours, although clearance varies substantially between people and can be affected by medication, pregnancy, smoking, and other factors." },
      { h: "A simplified example", p: "With a five-hour half-life, a 160 mg drink at 3 PM would leave about 80 mg at 8 PM and 40 mg at 1 AM. That is a decay estimate, not a personal prediction; the amount remaining and its effect on sleep vary." },
      { h: "What the research shows", p: "In one study, a 400 mg dose taken six hours before bed reduced total sleep time. The dose was larger than a typical coffee, so the finding demonstrates that late caffeine can affect sleep rather than defining a universal cutoff." },
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
    title: "Thirst is useful, but context matters.",
    dek: "During exercise or a busy day, thirst alone may not keep pace with fluid loss. Mild dehydration has affected mood and some cognitive measures in controlled studies.",
    minutes: 3,
    lab: "hydration",
    blocks: [
      { p: "Thirst is part of the body's fluid-regulation system, but it is not a precise measurement of hydration. During exercise, heat exposure, illness, or a day with few chances to drink, fluid loss can accumulate before thirst prompts enough replacement." },
      { h: "What mild dehydration studies found", p: "In controlled studies of healthy young adults, roughly 1.4 to 1.6% body-mass loss was associated with changes in mood, fatigue, vigilance, or working memory. The results differed by task and study group, so they should not be read as one fixed performance penalty." },
      { h: "When losses rise", p: "Sweat losses can increase quickly during sustained exercise, especially in heat. A practical approach is to begin activity normally hydrated, drink at reasonable opportunities, and adjust for duration, conditions, and individual sweat rate rather than relying on one target for everyone." },
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

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

export interface ArticleSource {
  label: string;
  href: string;
  note: string;
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
  reviewed: string;
  sources: ArticleSource[];
}

export const ARTICLES: Article[] = [
  {
    slug: "why-am-i-always-tired",
    kind: "Explainer",
    question: "Why am I always tired?",
    title: "Why short sleep catches up with you.",
    dek: "Sleep need, sleep loss, and what the research can and cannot tell you about the next day.",
    minutes: 4,
    lab: "sleep",
    blocks: [
      { p: "Teenagers are generally advised to sleep 8 to 10 hours a night. In the 2023 national Youth Risk Behavior Survey, about one in four US high school students reported getting at least eight hours on an average school night." },
      { h: "Short sleep does not produce one fixed penalty", p: "Attention, reaction time, learning, and mood can all be affected by insufficient sleep, but there is no defensible rule that six hours costs every person a particular percentage. Effects vary with the task, the person, and whether a study tests one sleepless night or repeated short nights." },
      { h: "Laboratory comparisons need context", p: "A 1997 experiment found that performance on selected tracking tasks after prolonged wakefulness resembled performance after alcohol. It did not show that a weekly sleep-debt total can be converted into a blood alcohol level, and it should not be used as a personal impairment score." },
      { h: "Light is one part of the timing system", p: "Evening light can delay the biological signals that prepare the body for sleep. A controlled study of adults using light-emitting e-readers for four hours before bed found later melatonin timing and lower next-morning alertness. A quick look at a phone is not the same exposure, so the result is better read as evidence about sustained evening light than as a universal 90-minute rule." },
      { h: "What is reasonable to try", p: "A regular sleep window and less bright light late in the evening are low-risk starting points. Persistent exhaustion can also have medical, mental-health, medication, or schedule-related causes. Sleeping longer on weekends is not proof that sleep is the only issue." },
    ],
    reviewed: "Reviewed July 2026",
    sources: [
      { label: "CDC, Youth Risk Behavior Survey: sleep behaviors, 2023", href: "https://www.cdc.gov/yrbs/dstr/dietary-physical-sleep-behaviors.html", note: "National survey; self-reported school-night sleep." },
      { label: "Paruthi et al., Journal of Clinical Sleep Medicine, 2016", href: "https://pubmed.ncbi.nlm.nih.gov/27707447/", note: "American Academy of Sleep Medicine consensus recommendations." },
      { label: "Dawson and Reid, Nature, 1997", href: "https://doi.org/10.1038/40775", note: "Small adult laboratory study of sustained wakefulness and alcohol; not a sleep-debt calculator." },
      { label: "Chang et al., PNAS, 2015", href: "https://doi.org/10.1073/pnas.1418490112", note: "Controlled adult study of four hours of evening e-reader use." },
    ],
  },
  {
    slug: "why-caffeine-keeps-you-up",
    kind: "Explainer",
    question: "Why is my afternoon coffee keeping me up?",
    title: "Why afternoon caffeine can reach bedtime.",
    dek: "Caffeine leaves the body gradually, but dose, timing, medication, and individual metabolism all matter.",
    minutes: 3,
    lab: "caffeine",
    blocks: [
      { p: "Caffeine blocks adenosine receptors, reducing one of the signals involved in sleep pressure. Its average half-life in healthy adults is often described as roughly five hours, but the range between people is wide." },
      { h: "The graph is an estimate", p: "With a five-hour half-life, a 160 mg drink at 3 PM would leave an estimated 80 mg at 8 PM and 40 mg at 1 AM. That arithmetic describes a simplified model, not a measurement of what remains in one person's bloodstream." },
      { h: "Dose changes the meaning of timing", p: "In a small adult study, 400 mg of caffeine taken six hours before bed reduced sleep time compared with placebo. Four hundred milligrams is much more than many coffees and is not a routine dose for a teenager, so the result does not establish a universal afternoon cutoff." },
      { h: "For teenagers, the advice is cautious", p: "The American Academy of Pediatrics discourages energy drinks for children and adolescents. Product labels can also understate the practical dose when a container holds more than one serving." },
    ],
    reviewed: "Reviewed July 2026",
    sources: [
      { label: "Nehlig, Pharmacological Reviews, 2018", href: "https://doi.org/10.1124/pr.117.014407", note: "Review of caffeine mechanisms and effects." },
      { label: "Drake et al., Journal of Clinical Sleep Medicine, 2013", href: "https://pubmed.ncbi.nlm.nih.gov/24235903/", note: "Small adult study using a fixed 400 mg dose." },
      { label: "American Academy of Pediatrics, Pediatrics, 2011", href: "https://doi.org/10.1542/peds.2011-0965", note: "Clinical report on sports and energy drinks in young people." },
    ],
  },
  {
    slug: "when-is-thirst-enough",
    kind: "Explainer",
    question: "Can I just drink when I feel thirsty?",
    title: "When is thirst enough?",
    dek: "For most ordinary days, thirst is useful. Heat, long practices, illness, and limited access to water change the calculation.",
    minutes: 3,
    lab: "hydration",
    blocks: [
      { p: "Thirst is part of the body's normal fluid-regulation system. For healthy people doing ordinary activities with water available, it usually helps keep hydration within a narrow range. There is no single daily water target that fits everyone." },
      { h: "Exercise and heat are different", p: "Sweat losses can become substantial during long or intense activity, especially in heat. Individual sweat rates vary widely, so a fixed liters-per-hour target is not appropriate for everyone." },
      { h: "The cognitive evidence is mixed", p: "Some controlled studies of mild dehydration found changes in mood or task performance. Reviews also find inconsistent results across cognitive tests. It is more accurate to say mild dehydration may affect mood or performance than to promise a specific drop in focus or memory." },
      { h: "Do not force water past comfort", p: "Drinking far more than sweat and urine losses can be dangerous. During long practices, athletes need access to fluids and a plan that considers weather, duration, individual sweat loss, and coaching or medical guidance." },
    ],
    reviewed: "Reviewed July 2026",
    sources: [
      { label: "National Academies, Dietary Reference Intakes for Water, 2005", href: "https://doi.org/10.17226/10925", note: "Reference guidance on water balance, thirst, and variable needs." },
      { label: "McDermott et al., Journal of Athletic Training, 2017", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5634236/", note: "Position statement for physically active people." },
      { label: "Masento et al., British Journal of Nutrition, 2014", href: "https://doi.org/10.1017/S0007114513004455", note: "Review describing inconsistent cognitive findings." },
      { label: "Ganio et al., British Journal of Nutrition, 2011", href: "https://pubmed.ncbi.nlm.nih.gov/21736786/", note: "Controlled study in young adult men; not a teenage school-day study." },
    ],
  },
];

export const articleBySlug = (slug: string): Article | undefined => ARTICLES.find((a) => a.slug === slug);
export const articlesForLab = (lab: LabId): Article[] => ARTICLES.filter((a) => a.lab === lab);

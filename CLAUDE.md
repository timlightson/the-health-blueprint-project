# The Health Blueprint

## What This Is
An interactive public health education platform for teens. Each Blueprint topic has its own simulation lab with real data, interactive tools, and games. Built with Next.js, Tailwind CSS, Recharts, and Radix UI.

## Design Direction
The goal is a modern, clean, Apple-style aesthetic. Think apple.com — premium, minimal, confident, a lot of whitespace, smooth animations, everything feeling intentional. Not clinical, not childish, not generic. The kind of site where the design itself communicates that the content is credible.

Claude Code has complete creative freedom over colors, typography, spacing, card styles, animations, layout details, and visual design decisions. If something looks better a different way, do it that way.

## Lab Layout
Labs should feel like interactive experiences, not dashboards. The simulations are the main event. Controls should be intuitive and tactile. Data should respond instantly to input. Each lab should be organized into clear visual zones that give the page rhythm and hierarchy. Mobile should feel just as good as desktop.

## Writing Philosophy
This is the highest priority. Do not write like an AI assistant, a marketing agency, a health blog, or a textbook. Write like an exceptional science communicator. Every sentence should feel like it was written by someone who deeply understands the topic and knows how to explain it simply. The tone to aim for: The New York Times science desk, Quanta Magazine, Works in Progress, Vox and Kurzgesagt explainers, kept concise enough for a modern digital product. Above all, the writing should sound unmistakably human.

- Assume the reader is intelligent but unfamiliar with the science.
- Prefer clarity over cleverness. Prefer precision over enthusiasm. Never exaggerate. Never use motivational, corporate, or filler language. No cliches.
- Explain, don't teach. Open with the question the reader already has ("Why do you remember some moments forever, but forget yesterday's homework?"), then give the mechanism. Teaching starts with "The hippocampus consolidates episodic memory." Explaining earns the right to mention the hippocampus.
- Every paragraph answers ONE question. Every sentence moves the explanation forward.
- Never more than three sentences before giving the reader visual breathing room, especially on phones.
- Articles are explainers, not blogs. Structure them like Vox or NYT Graphics: each section is one question, headed by a short declarative sentence ("Your brain isn't shutting down."), not a topic label ("Why Sleep Matters") followed by four paragraphs.
- The reader should finish each section thinking "I finally understand why that happens," not "I learned another health tip."
- Banned phrases: "unlock your potential," "optimize your health," "evidence-based strategies," "empower," "journey," "life-changing," "game-changing," "transform your life," "superpower."

Calibration examples:
- "Sleep is the foundation of optimal cognitive performance and emotional well-being" becomes "Sleep changes how your brain learns, reacts, and remembers."
- "Hydration is critical for maximizing physical and mental performance" becomes "Even mild dehydration changes the way your brain works."
- "Stress affects nearly every aspect of human physiology" becomes "Stress changes more than your mood. It changes the way your brain makes decisions."

## Writing Voice
Our readers are American teenagers, and they're smart. Write like a sharp older friend explaining something they actually find interesting, not a lab manual and not a corporate wellness app. Warm, direct, and a little bit cool. Premium and clean like the design, just human. This is the standing rule for all copy, not a one-time pass.

- Talk to the reader like a person. Use "you" and "your," never "the user" or "individuals."
- Keep every real science term (phosphagen, glycolytic, melatonin, cortisol, adenosine, amygdala, and so on) and keep every citation exact. Only the wrapper copy around the science gets the friendly treatment, never the facts, numbers, or sources.
- No clinical or textbook phrasing. If a sentence sounds like a study abstract, rewrite it.
- Do not reach for teen slang or try-hard internet phrasing. Respect the reader. Natural beats "relatable."
- Plain verbs: "start," "set," "use." Never "initiate," "configure," "utilize," or "parameters."
- Short sentences. Make the point, then move on. Read it out loud; if it sounds weird, rewrite it.
- Banned words: "crucial," "vital," "essential," "comprehensive," "it's important to note," "plays a critical role."
- No em dashes anywhere. Use a comma, a period, or rewrite the sentence.

Before and after:
- "Evening screens" becomes "Phone before bed" or "Late-night scrolling."
- "Bright morning light" becomes "Morning sunlight" or "Getting outside in the morning."
- "Configure your sleep parameters" becomes "Set your bedtime and wake-up."
- "This dip is a normal physiological occurrence" becomes "This dip is scheduled, not you slacking."

## Project Structure
- Homepage: app/page.tsx
- Sleep Lab: app/labs/sleep/page.tsx
- Energy Lab: app/labs/energy/page.tsx
- Stress Lab: app/labs/stress/page.tsx
- Games: app/labs/sleep/games/[game]/page.tsx
- Shared components: components/labs/

## Commands
- pnpm dev — start dev server
- pnpm build — production build

## Rules
- All health data must be evidence-based and accurate for teenagers
- Every simulation needs real citations (PubMed, NIH, CDC, peer-reviewed journals)
- Never use placeholder data — use real researched numbers
- No overlapping UI elements
- All SVG visualizations must scale properly on mobile
- Minimum 44px tap targets on mobile